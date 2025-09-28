import { ApplicationCommandOptionType, ChatInputCommandInteraction, PermissionsBitField } from "discord.js";
import bot from "../../core/classes/Bot";
import Interaction, { context } from "../../core/classes/Interaction";
import Category from "../../core/enums/Category";
import GuildConfig from "../../core/schemas/GuildConfig";
import Embed from "../../core/classes/Embed";

export default class Config extends Interaction {
    constructor(bot: bot) {
        super(bot, {
            name: 'config',
            description: 'View the current bot settings on server.',
            category: Category.admin,
            default_member_permissions: PermissionsBitField.Flags.Administrator,
            dm_permission: true,
            cooldown: 3,
            options: [],
            dev: false
        })
    }
    async exec(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();
        const i18n = context.useContext();
        let nowLang = await GuildConfig.findOne({ guildId: interaction.guildId });

        await new Promise(resolve => setTimeout(resolve, 1000));

        await interaction.editReply({
            embeds: [
                new Embed(this.bot)
                .setAuthor(interaction.user)
                .setTitle(i18n.twl(nowLang?.lang ?? "en", `config.title`))
                .setDescription(`${i18n.twl(nowLang?.lang ?? "en", 'config.langa', {LAN: `${i18n.twl(nowLang?.lang ?? "en", `config.lang`)}`})}`)
                .build()
            ]
        })
    }
}
