import { Events, Guild } from "discord.js";
import bot from "../../base/classes/Bot";
import Event from "../../base/classes/Event";
import GuildConfig from "../../base/schemas/GuildConfig";
import Embed from "../../base/classes/Embed";

export default class GuildCreate extends Event {
    constructor(bot: bot) {
        super(bot, {
            name: Events.GuildCreate,
            description: 'GuildCreate event',
            once: false
        })
    }
    async exec(guild: Guild) {
        try {
            if (!await GuildConfig.exists({ guildId: guild.id }))
                await GuildConfig.create({ guildId: guild.id, lang: 'en' })
        } catch (err) {
            console.error(err)
        }

        const owner = await guild.fetchOwner();
        owner?.send({ embeds: [
            new Embed(this.bot)
            .setAuthor(owner.user)
            .setDescription(`Thank you for inviting me on your server!`)
            .build()
        ] })
        .catch();
    }
}