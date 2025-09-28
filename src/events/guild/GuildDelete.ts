import { Events, Guild } from "discord.js";
import bot from "../../base/classes/Bot";
import Event from "../../base/classes/Event";
import GuildConfig from "../../base/schemas/GuildConfig";

export default class GuildDelete extends Event {
    constructor(bot: bot) {
        super(bot, {
            name: Events.GuildDelete,
            description: 'GuildDelete event',
            once: false
        })
    }
    async exec(guild: Guild) {
        try {
            await GuildConfig.deleteOne({ guildId: guild.id });
        } catch (err) {
            console.error(err)
        }
    }
}