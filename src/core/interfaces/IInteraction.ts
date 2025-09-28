import { AutocompleteInteraction, ChatInputCommandInteraction } from "discord.js";
import bot from "../classes/Bot";
import Category from "../enums/Category";

export default interface IInteraction {
    bot: bot;
    name: string;
    description: string;
    category: Category;
    options: object;
    default_member_permissions: bigint;
    dm_permission: boolean;
    cooldown: number;
    dev: boolean;
    
    exec(interaction: ChatInputCommandInteraction): void;
    autocomplete(interaction: AutocompleteInteraction): void;
}