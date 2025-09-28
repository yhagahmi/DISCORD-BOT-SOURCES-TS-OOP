/* eslint-disable @typescript-eslint/no-explicit-any */
import * as fs from "fs";
import * as path from "path";

/** Ошибка i18n c кодом и безопасным сообщением */
export class I18nError extends Error {
  constructor(
    /** Машиночитаемый код ошибки */
    public code:
      | "CONFIG_ERROR"
      | "LOAD_ERROR"
      | "SCHEMA_ERROR"
      | "LANG_NOT_REGISTERED"
      | "KEY_NOT_FOUND"
      | "LANG_VARIANT_NOT_FOUND"
      | "TEMPLATE_REQUIRED_KEY_MISSING"
      | "TEMPLATE_TYPE_INVALID"
      | "FILTER_NOT_FOUND",
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "I18nError";
  }
}

type LangCode = string;

/** Структура файла перевода или данных из БД */
export type Translations = Record<string, Record<LangCode, string>>;

/** Вытаскивает плейсхолдеры вида {name}, {person.name} из строки, игнорируя :filter если присутствует, и пропуская/условные для {@ref} */
type StripFilter<P extends string> = P extends `${infer N}:${string}` ? N : P;

type ExtractNonAtPlaceholders<S extends string> =
  S extends `${string}{${infer P}}${infer Rest}`
    ? P extends `@${string}`
      ? ExtractNonAtPlaceholders<Rest>
      : StripFilter<P> | ExtractNonAtPlaceholders<Rest>
    : never;

type ExtractAtFallbackPlaceholders<S extends string, Keys extends string> =
  S extends `${string}{@${infer P}}${infer Rest}`
    ? (StripFilter<P> extends Keys ? ExtractAtFallbackPlaceholders<Rest, Keys> : StripFilter<P> | ExtractAtFallbackPlaceholders<Rest, Keys>)
    : never;

type ExtractPlaceholders<S extends string, Keys extends string = string> =
  | ExtractNonAtPlaceholders<S>
  | ExtractAtFallbackPlaceholders<S, Keys>;

type ExtractOptionalPlaceholders<S extends string, Keys extends string> =
  S extends `${string}{@${infer P}}${infer Rest}`
    ? (StripFilter<P> extends Keys ? StripFilter<P> | ExtractOptionalPlaceholders<Rest, Keys> : ExtractOptionalPlaceholders<Rest, Keys>)
    : never;

export interface I18nOptions<T extends Translations | undefined = undefined> {
  /** Путь к JSON с переводами (например, "langs.json"). Можно не указывать, если передан data. */
  file?: string;
  /** Прямо передать словарь переводов без файла. Это может быть JSON, полученный из базы данных или другого источника. */
  data?: T;
  /** Список допустимых языков. Всё лишнее будет проигнорировано (или ошибка в strict-режиме). */
  registerLangs: LangCode[];
  /** Базовый язык по умолчанию для t(). */
  baseLang: LangCode;
  /** Строгий режим */
  strict?: boolean;
  /** Хук для логирования/метрик ошибок */
  onError?: (err: I18nError) => void;
  /** Кастомный маркер для фоллбеков */
  fallbackFormat?: (info: { key: string; lang?: LangCode; reason: string }) => string;
  /** Фильтры для применения к значениям плейсхолдеров */
  filters?: Record<string, (value: string) => string>;
}

/**
 * i18n класс
 * Если используется data (типизированный объект), то методы t/twl будут проверять плейсхолдеры на уровне типов.
 * Если используется file, то проверки типов плейсхолдеров не будет.
 */
export class I18n<T extends Translations | undefined = undefined> {
  private translations: Translations = {};
  private readonly registered = new Set<LangCode>();
  private base: LangCode;
  private strict: boolean;
  private onError?: (err: I18nError) => void;
  private fallbackFormat: Required<I18nOptions>["fallbackFormat"];
  private filters: Record<string, (value: string) => string>;

  /** Шаблон для поиска плейсхолдеров вида {name} или {name:filter}, с опциональным @ для ссылок {@name} или {@name:filter} */
  private static readonly PLACEHOLDER_RE = /\{(@?)([a-zA-Z0-9_.]+)(?::([a-zA-Z0-9_]+))?\}/g;

  constructor(opts: I18nOptions<T>) {
    if (!opts || !Array.isArray(opts.registerLangs) || !opts.registerLangs.length) {
      throw new I18nError(
        "CONFIG_ERROR",
        "registerLangs обязателен и должен содержать хотя бы один язык."
      );
    }
    if (!opts.baseLang) {
      throw new I18nError("CONFIG_ERROR", "baseLang обязателен.");
    }

    this.registered = new Set(opts.registerLangs);
    this.base = opts.baseLang;
    this.strict = opts.strict ?? true;
    this.onError = opts.onError!;
    this.fallbackFormat =
      opts.fallbackFormat ??
      ((info) => (info.lang ? `⟪${info.key}:${info.lang}⟫` : `⟪${info.key}⟫`));
    this.filters = opts.filters ?? {};

    if (!this.registered.has(this.base)) {
      this.raise(
        new I18nError(
          "LANG_NOT_REGISTERED",
          `baseLang "${this.base}" не входит в registerLangs.`,
          { baseLang: this.base }
        )
      );
    }

    // Загрузка переводов
    if (opts.data) {
      this.translations = this.validateAndNormalize(opts.data);
    } else if (opts.file) {
      const filePath = path.resolve(process.cwd(), opts.file);
      let raw: string;
      try {
        raw = fs.readFileSync(filePath, "utf8");
      } catch (e) {
        this.raise(new I18nError("LOAD_ERROR", `Не удалось прочитать файл: ${filePath}`, e));
        raw = "{}";
      }
      try {
        const parsed = JSON.parse(raw) as unknown;
        this.translations = this.validateAndNormalize(parsed);
      } catch (e) {
        this.raise(new I18nError("SCHEMA_ERROR", "Некорректный JSON переводов.", e));
        this.translations = {};
      }
    } else {
      this.raise(
        new I18nError(
          "CONFIG_ERROR",
          'Укажите либо "file", либо "data" в опциях I18n для загрузки переводов.'
        )
      );
    }
  }

  /** Текущий базовый язык */
  get baseLang(): LangCode {
    return this.base;
  }

  setBaseLang(lang: LangCode): void {
    if (!this.registered.has(lang)) {
      this.raise(
        new I18nError("LANG_NOT_REGISTERED", `Язык "${lang}" не зарегистрирован.`, { lang })
      );
      return;
    }
    this.base = lang;
  }

  addTranslations(block: Translations): void {
    const normalized = this.validateAndNormalize(block, /*partial*/ true);
    for (const k of Object.keys(normalized)) {
      this.translations[k] = { ...(this.translations[k] ?? {}), ...normalized[k] };
    }
  }

  hasKey(key: string): boolean {
    return key in this.translations;
  }

  getLangsForKey(key: string): LangCode[] {
    const entry = this.translations[key];
    return entry ? Object.keys(entry) : [];
  }

  /**
   * Перевод с учетом baseLang
   */
  public t<
    K extends T extends Translations ? keyof T & string : string,
    L extends T extends Translations ? keyof T[K] & string : string,
    ReqPH extends T extends Translations ? ExtractPlaceholders<T[K][L], keyof T & string> : string,
    OptPH extends T extends Translations ? ExtractOptionalPlaceholders<T[K][L], keyof T & string> : string
  >(
    key: K,
    template?: [ReqPH] extends [never] ? ([OptPH] extends [never] ? void : Partial<Record<OptPH, string | number>>) : Record<ReqPH, string | number> & Partial<Record<OptPH, string | number>>
  ): string {
    return this.translateInternal(this.base, key as string, template as any, false);
  }

  /**
   * Перевод на явно указанный язык
   */
  public twl<
    K extends T extends Translations ? keyof T & string : string,
    L extends T extends Translations ? keyof T[K] & string : string,
    ReqPH extends T extends Translations ? ExtractPlaceholders<T[K][L], keyof T & string> : string,
    OptPH extends T extends Translations ? ExtractOptionalPlaceholders<T[K][L], keyof T & string> : string
  >(
    langKey: L,
    key: K,
    template?: [ReqPH] extends [never] ? ([OptPH] extends [never] ? void : Partial<Record<OptPH, string | number>>) : Record<ReqPH, string | number> & Partial<Record<OptPH, string | number>>
  ): string {
    return this.translateInternal(langKey as string, key as string, template as any, true);
  }

  // ===== Внутренние методы =====

  private translateInternal(
    lang: LangCode,
    key: string,
    template: Record<string, unknown> | undefined,
    ignoreBase: boolean
  ): string {
    const entry = this.translations[key];
    if (!entry) {
      const err = new I18nError("KEY_NOT_FOUND", `Ключ "${key}" не найден.`, { key });
      this.raise(err);
      if (!this.strict) return this.fallbackFormat({ key, lang, reason: "key_missing" });
      throw err;
    }

    let raw = entry[lang];
    if (raw == null && !ignoreBase) {
      raw = entry[this.base];
    }

    if (raw == null) {
      const err = new I18nError(
        "LANG_VARIANT_NOT_FOUND",
        `Для ключа "${key}" отсутствует вариант на языке "${lang}".`,
        { key, lang }
      );
      this.raise(err);
      if (!this.strict) return this.fallbackFormat({ key, lang, reason: "lang_variant_missing" });
      throw err;
    }

    try {
      return this.applyTemplate(raw, template, key, lang, ignoreBase);
    } catch (e) {
      if (e instanceof I18nError) {
        this.raise(e);
        if (!this.strict) return this.fallbackFormat({ key, lang, reason: e.code });
      } else {
        const err = new I18nError("TEMPLATE_TYPE_INVALID", "Неизвестная ошибка шаблона.", e);
        this.raise(err);
        if (!this.strict) return this.fallbackFormat({ key, lang, reason: "template_error" });
      }
      throw e;
    }
  }

  private applyTemplate(
    value: string,
    template: Record<string, unknown> | undefined,
    key: string,
    lang: LangCode,
    ignoreBase: boolean
  ): string {
    if (!I18n.PLACEHOLDER_RE.test(value)) {
      I18n.PLACEHOLDER_RE.lastIndex = 0;
      return value;
    }
    I18n.PLACEHOLDER_RE.lastIndex = 0;

    if (template != null && (typeof template !== "object" || Array.isArray(template))) {
      throw new I18nError(
        "TEMPLATE_TYPE_INVALID",
        `template должен быть объектом, получено: ${typeof template}`,
        { key, lang, template }
      );
    }

    const required = new Set<string>();
    value.replace(I18n.PLACEHOLDER_RE, (_, atSign: string, name: string) => {
      if (!atSign) {
        required.add(name);
      }
      return _;
    });

    if (this.strict && required.size > 0) {
      for (const ph of required) {
        if (!template || !(ph in template)) {
          throw new I18nError(
            "TEMPLATE_REQUIRED_KEY_MISSING",
            `Для ключа "${key}" (${lang}) отсутствует значение шаблона "{${ph}}".`,
            { key, lang, placeholder: ph }
          );
        }
      }
    }

    return value.replace(
      I18n.PLACEHOLDER_RE,
      (_match, atSign: string, name: string, filter?: string) => {
        let result: string;

        if (atSign) {
          // Это ссылка на другой перевод или template с приоритетом template > translations
          if (template && name in template) {
            const v = template[name];
            result = v == null ? "" : String(v);
          } else {
            const refEntry = this.translations[name];
            if (!refEntry) {
              const err = new I18nError(
                "KEY_NOT_FOUND",
                `Ссылка "${name}" не найдена в переводах.`,
                { key, lang, ref: name }
              );
              this.raise(err);
              if (this.strict) {
                throw err;
              }
              return `{@${name}${filter ? ":" + filter : ""}}`;
            }

            let rawRef = refEntry[lang];
            if (rawRef == null && !ignoreBase) {
              rawRef = refEntry[this.base];
            }

            if (rawRef == null) {
              const err = new I18nError(
                "LANG_VARIANT_NOT_FOUND",
                `Для ссылки "${name}" отсутствует вариант на языке "${lang}".`,
                { key, lang, ref: name }
              );
              this.raise(err);
              if (this.strict) {
                throw err;
              }
              return `{@${name}${filter ? ":" + filter : ""}}`;
            }

            result = this.applyTemplate(rawRef, template, name, lang, ignoreBase);
          }
        } else {
          // Обычный плейсхолдер
          if (!template || !(name in template)) {
            return this.strict ? "" : `{${name}${filter ? ":" + filter : ""}}`;
          }
          const v = template[name];
          result = v == null ? "" : String(v);
        }

        if (filter) {
          if (!(filter in this.filters)) {
            throw new I18nError(
              "FILTER_NOT_FOUND",
              `Фильтр "${filter}" не найден для плейсхолдера "{${atSign}${name}:${filter}}".`,
              { key, lang, filter }
            );
          }
          result = this.filters[filter]!(result)
        }
        return result;
      }
    );
  }

  private validateAndNormalize(input: unknown, partial = false): Translations {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
      const err = new I18nError(
        "SCHEMA_ERROR",
        "Ожидался объект с ключами переводов (Record<string, Record<string,string>>).",
        { input }
      );
      this.raise(err);
      if (!this.strict) return {};
      throw err;
    }
    const out: Translations = {};
    for (const [key, langs] of Object.entries(input as Record<string, unknown>)) {
      if (!langs || typeof langs !== "object" || Array.isArray(langs)) {
        const err = new I18nError(
          "SCHEMA_ERROR",
          `Значение ключа "${key}" должно быть объектом { lang: value }.`,
          { key, langs }
        );
        this.raise(err);
        if (this.strict) throw err;
        continue;
      }
      const normalizedLangs: Record<string, string> = {};
      for (const [lang, value] of Object.entries(langs as Record<string, unknown>)) {
        if (!this.registered.has(lang)) {
          const err = new I18nError(
            "LANG_NOT_REGISTERED",
            `В переводах ключ "${key}" содержит незарегистрированный язык "${lang}".`,
            { key, lang }
          );
          this.raise(err);
          if (this.strict) continue;
        }
        if (typeof value !== "string") {
          const err = new I18nError(
            "SCHEMA_ERROR",
            `Значение перевода "${key}" для языка "${lang}" должно быть строкой.`,
            { key, lang, value }
          );
          this.raise(err);
          if (this.strict) continue;
        } else {
          normalizedLangs[lang] = value;
        }
      }
      if (!partial && Object.keys(normalizedLangs).length === 0) {
        const err = new I18nError(
          "SCHEMA_ERROR",
          `Ключ "${key}" не содержит корректных вариантов переводов.`,
          { key }
        );
        this.raise(err);
        if (this.strict) continue;
      }
      if (Object.keys(normalizedLangs).length > 0) out[key] = normalizedLangs;
    }
    return out;
  }

  private raise(err: I18nError): void {
    if (this.onError) {
      try {
        this.onError(err);
      } catch {
        /* проглатываем ошибки обработчика */
      }
    }
  }
}