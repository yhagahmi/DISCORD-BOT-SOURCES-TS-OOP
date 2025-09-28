import { ApplicationCommandOptionType, ChatInputCommandInteraction, MessageFlags, PermissionsBitField } from "discord.js"
import Interaction, { context } from "../../core/classes/Interaction"
import bot from "../../core/classes/Bot"
import Category from "../../core/enums/Category"
import Embed from "../../core/classes/Embed";
import GuildConfig from "../../core/schemas/GuildConfig";
import { text } from "stream/consumers";

export default class TestCmd extends Interaction {
    constructor(bot: bot) {
        super(bot, {
            name: 'language',
            description: 'Change a bot language on server',
            category: Category.admin,
            default_member_permissions: PermissionsBitField.Flags.Administrator,
            dm_permission: true,
            cooldown: 3,
            options: [
                {
                    name: 'languages',
                    description: 'Choose language',
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    choices: [
                        { name: 'Русский', value: "ru" },
                        { name: 'English', value: "en" }
                    ]
                }
            ],
            dev: false
        });
    }

    async exec(interaction: ChatInputCommandInteraction) {
        const getlang = interaction.options.getString('languages') as 'ru' | 'en';
        const i18n = context.useContext();

        let nowLang = await GuildConfig.findOne({ guildId: interaction.guildId });
        if (!nowLang) {
            nowLang = await GuildConfig.create({ guildId: interaction.guildId, lang: getlang })
        } else if (nowLang.lang == getlang) {
            const result2 = i18n.twl(nowLang?.lang ?? "en", "setlang.alr")

            await interaction.reply({
                embeds: [
                    new Embed(this.bot)
                        .setDescription(result2)
                        .setAuthor(interaction.user)
                        .build()
                ],
                flags: MessageFlags.Ephemeral
            })
        } else {
            nowLang.lang = getlang;
            nowLang.save();

            const result = i18n.twl(nowLang?.lang ?? "en", "setlang")

            await interaction.reply({
                embeds: [
                    new Embed(this.bot)
                        .setDescription(result)
                        .setAuthor(interaction.user)
                        .build()
                ],
                flags: MessageFlags.Ephemeral
            })
        }
    }
}