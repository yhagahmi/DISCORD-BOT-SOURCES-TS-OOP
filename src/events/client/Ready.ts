import { ActivityType, Collection, Events, REST, Routes } from "discord.js";
import bot from "../../core/classes/Bot";
import Event from "../../core/classes/Event";
import Interaction from "../../core/classes/Interaction";

export default class Ready extends Event {
    constructor(bot: bot) {
        super(bot, {
            name: Events.ClientReady,
            description: 'Ready event',
            once: true
        })
    }

    async exec() {
        console.log(`${this.bot.user?.tag} is ready!`);

        this.bot.user?.setPresence({
            status: 'idle',
            activities: [
                {
                    name: `watchout!`,
                    type: ActivityType.Competing
                }
            ]
        });

        const clientId = this.bot.config.discordClientId;

        const commands: object[] = this.GetJson(this.bot.commands);

        const rest = new REST().setToken(this.bot.config.token);

        const globalCommands: any = await rest.put(Routes.applicationCommands(clientId), {
            body: this.GetJson(this.bot.commands.filter(command => !command.dev))
        });
        console.log(`Successfully loaded ${globalCommands.length} global application (/) commands.`)

    }

    private GetJson(commands: Collection<string, Interaction>): object[] {
        const data: object[] = [];

        commands.forEach(command => {
            data.push({
                name: command.name,
                description: command.description,
                options: command.options,
                default_member_permissions: command.default_member_permissions.toString(),
                dm_permission: command.dm_permission
            })
        });

        return data;
    }
}