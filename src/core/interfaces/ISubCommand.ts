import { ChatInputCommandInteraction } from "discord.js";
import bot from "../classes/Bot";

export default interface ISubCommand {
    bot: bot;
    name: string;

    exec(interaction: ChatInputCommandInteraction): void;
}