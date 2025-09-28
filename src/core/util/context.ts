import { AsyncLocalStorage } from "async_hooks";

export type ReactiveParam<T> = { __reactive: true; value: T };
export type MaybeReactive<T> = T | ReactiveParam<T>;
type ProviderInitial<T> = { [K in keyof T]?: any };

interface Watcher<T> {
  callback: (newValue: T, oldValue: T) => void;
  once: boolean;
}

export interface Context<T extends Record<string, any>> {
  provider: <P extends ProviderInitial<T>, A extends any[], R = any>(
    fn: (...args: A) => R | Promise<R>,
    initialValue: P
  ) => ((...args: A) => R | Promise<R>) & {
    pick: <K extends keyof T>(key: K) => [T[K], (v: T[K]) => void];
    watch: <K extends keyof T>(key: K, cb: (n: T[K], o: T[K]) => void) => void;
    once: <K extends keyof T>(key: K, cb: (n: T[K], o: T[K]) => void) => void;
    toJSON: () => Record<string, any>;
    history: Map<keyof T, { oldValue: any; newValue: any; at: number }[]>;
  };

  reactive: <V>(value: V) => ReactiveParam<V>;
  useContext: () => Readonly<T>;
}

export function createReactiveContext<T extends Record<string, any>>(
  defaultValue?: T,
  options?: { displayName?: string }
): Context<T> {
  const als = new AsyncLocalStorage<{
    state: Readonly<T>;
    setters: Map<keyof T, (v: any) => void>;
  }>();

  const isReactive = <V>(param: any): param is ReactiveParam<V> =>
    param && typeof param === "object" && param.__reactive === true;

  const reactive = <V>(value: V): ReactiveParam<V> => ({ __reactive: true, value });

  const provider = <P extends ProviderInitial<T>, A extends any[], R>(
    fn: (...args: A) => R | Promise<R>,
    initialValue: P
  ) => {
    const rawState = Object.create(
      initialValue ? Object.getPrototypeOf(initialValue) : Object.prototype
    ) as Partial<T>;
    const setters = new Map<keyof T, (v: any) => void>();
    const watchers = new Map<keyof T, Watcher<any>[]>();
    const history = new Map<keyof T, { oldValue: any; newValue: any; at: number }[]>();

    // Инициализация состояния
    if (initialValue && typeof initialValue === 'object') {
      const ownKeys = Object.getOwnPropertyNames(initialValue);
      for (const key of ownKeys) {
        const param = (initialValue as any)[key];
        if (isReactive(param)) {
          rawState[key as keyof T] = param.value as T[typeof key];
          setters.set(key as keyof T, (newVal: any) => {
            const oldVal = rawState[key as keyof T];
            if (oldVal === newVal) return;
            rawState[key as keyof T] = newVal;

            // Логируем историю
            const entry = { oldValue: oldVal, newValue: newVal, at: Date.now() };
            if (!history.has(key as keyof T)) history.set(key as keyof T, []);
            history.get(key as keyof T)!.push(entry);
            if (history.get(key as keyof T)!.length > 50) history.get(key as keyof T)!.shift(); // max 50 изменений

            // Уведомляем наблюдателей
            const list = watchers.get(key as keyof T) || [];
            for (let i = list.length - 1; i >= 0; i--) {
              list[i]?.callback(newVal, oldVal);
              if (list[i]?.once) list.splice(i, 1);
            }
          });
        } else {
          const desc = Object.getOwnPropertyDescriptor(initialValue, key);
          if (desc) {
            Object.defineProperty(rawState, key, desc);
          }
        }
      }

      // Копируем символы (не делаем их reactive)
      const symbols = Object.getOwnPropertySymbols(initialValue);
      for (const sym of symbols) {
        const desc = Object.getOwnPropertyDescriptor(initialValue, sym);
        if (desc) {
          Object.defineProperty(rawState, sym, desc);
        }
      }
    }

    // Proxy — запрет на прямое присвоение
    const protectedState = new Proxy(rawState as T, {
      set() {
        throw new Error(
          `Direct assignment to context properties is forbidden. Use run.pick(key)[1](value) instead.`
        );
      },
      get(target, prop, receiver) {
        return Reflect.get(target, prop, receiver);
      },  
    });

    const run = ((...args: A) => {
      return als.run({ state: protectedState as Readonly<T>, setters }, () => fn(...args));
    }) as ((...args: A) => R | Promise<R>) & {
      pick: <K extends keyof T>(key: K) => [T[K], (v: T[K]) => void];
      watch: <K extends keyof T>(key: K, cb: (n: T[K], o: T[K]) => void) => void;
      once: <K extends keyof T>(key: K, cb: (n: T[K], o: T[K]) => void) => void;
      toJSON: () => Record<string, any>;
      history: typeof history;
    };

    run.pick = <K extends keyof T>(key: K) => {
      const store = als.getStore();
      if (!store) throw new Error("pick must be called inside an active provider run");
      const value = store.state[key];
      const setter = store.setters.get(key);
      if (!setter) throw new Error(`Property "${String(key)}" is not reactive`);
      return [value, setter as (v: T[K]) => void];
    };

    run.watch = <K extends keyof T>(key: K, cb: (n: T[K], o: T[K]) => void) => {
      if (!watchers.has(key)) watchers.set(key, []);
      watchers.get(key)!.push({ callback: cb, once: false });
    };

    run.once = <K extends keyof T>(key: K, cb: (n: T[K], o: T[K]) => void) => {
      if (!watchers.has(key)) watchers.set(key, []);
      watchers.get(key)!.push({ callback: cb, once: true });
    };

    run.toJSON = () => {
      const plain: Record<string, any> = {};
      for (const k in rawState) plain[k] = rawState[k];
      return plain;
    };

    run.history = history;

    return run;
  };

  const useContext = (): Readonly<T> => {
    const store = als.getStore();
    if (store) return store.state;
    if (defaultValue) return defaultValue;
    throw new Error(
      `Context${options?.displayName ? ` "${options.displayName}"` : ""} not active`
    );
  };

  return { provider, reactive, useContext };
}