import { Events } from "discord.js";
import IEvent from "../interfaces/IEvent";
import Bot from "./Bot";
import IEventOptions from "../interfaces/IEventOptions";

export default class Event implements IEvent {
    bot: Bot;
    name: Events;
    description: string;
    once: boolean;

    constructor(bot: Bot, options: IEventOptions) {
        this.bot = bot;
        this.name = options.name;
        this.description = options.description;
        this.once = options.once;
    }

    exec(...args: any): void {};
}