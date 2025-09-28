import { CacheType, ChatInputCommandInteraction } from "discord.js";
import ISubCommand from "../interfaces/ISubCommand";
import bot from "./Bot";
import ISubCommandOption from "../interfaces/ISubCommandOptions";

export default class SubCommand implements ISubCommand {
    bot: bot;
    name: string;

    constructor(bot: bot, options: ISubCommandOption) {
        this.bot = bot;
        this.name = options.name;
    }

    exec(interaction: ChatInputCommandInteraction<CacheType>): void {
    }
    
}