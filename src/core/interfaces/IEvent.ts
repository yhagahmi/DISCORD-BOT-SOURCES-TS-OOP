import { Events } from "discord.js";
import bot from "../classes/Bot";

export default interface Event {
    bot: bot;
    name: Events;
    description: string;
    once: boolean;
}