import IHandler from "../interfaces/IHandler";
import path from "path";
import { glob } from "glob";
import bot from "./Bot";
import Event from "./Event";
import Interaction from "./Interaction";
import SubCommand from "./SubCommand";
import { ClientEvents } from "discord.js";

export default class Handler implements IHandler {
    bot: bot;
    constructor(bot: bot) {
        this.bot = bot;
    }
    async LoadEvents() {
        const files = (await glob(`src/events/**/*.ts`)).map(filePath => path.resolve(filePath));

        files.map(async (file: string) => {
            const event: Event = new (await import(file)).default(this.bot);

            if (!event.name)
                return delete require.cache[require.resolve(file)] && console.log(`${file.split("/").pop()} does not have name.`);

            const execute = (...args: any) => event.exec(...args);

            if (event.once) this.bot.once(event.name as keyof ClientEvents, execute);
            else this.bot.on(event.name as keyof ClientEvents, execute);

            return delete require.cache[require.resolve(file)]
        });
    }

    async LoadCommands() {
        const files = (await glob(`src/interactions/**/*.ts`)).map(filePath => path.resolve(filePath));

        files.map(async (file: string) => {
            const command: Interaction | SubCommand = new (await import(file)).default(this.bot);

            if (!command.name)
                return delete require.cache[require.resolve(file)] && console.log(`${file.split("/").pop()} does not have name.`);

            if (file.split("/").pop()?.split(".")[2])
                return this.bot.subCommands.set(command.name, command);

            this.bot.commands.set(command.name, command as Interaction);

            return delete require.cache[require.resolve(file)]
        });
    }

}