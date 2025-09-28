import { CacheType, ChatInputCommandInteraction, EmbedBuilder, PermissionsBitField } from "discord.js";
import Interaction, { context } from "../../core/classes/Interaction";
import bot from "../../core/classes/Bot";
import Category from "../../core/enums/Category";
import Embed from "../../core/classes/Embed";
import GuildConfig from "../../core/schemas/GuildConfig";

export default class PingCommand extends Interaction {
    constructor(bot: bot) {
        super(bot, {
            name: 'ping',
            description: 'Replies with ping-pong',
            category: Category.info,
            default_member_permissions: PermissionsBitField.Flags.UseApplicationCommands,
            dm_permission: true,
            cooldown: 3,
            options: [],
            dev: false
        });
    };
    async exec(interaction: ChatInputCommandInteraction) {
        const sent = await interaction.deferReply()
        const i18n = context.useContext();
        const nowLang = await GuildConfig.findOne({ guildId: interaction.guildId });
        const result = i18n.twl(nowLang?.lang ?? "en", "ping")
        const result2 = i18n.twl(nowLang?.lang ?? "en", "ping.title")

        await new Promise(resolve => setTimeout(resolve, 1000));


        function getWebSocketStatus(status: any) {
            const statuses: any = {
                0: i18n.twl(nowLang?.lang ?? "en", "ping.gotov"),
                1: i18n.twl(nowLang?.lang ?? "en", "ping.podkl"),
                2: i18n.twl(nowLang?.lang ?? "en", "ping.vozob"),
                3: i18n.twl(nowLang?.lang ?? "en", "ping.indent"),
                4: i18n.twl(nowLang?.lang ?? "en", "ping.ozhidguild"),
                5: i18n.twl(nowLang?.lang ?? "en", "ping.ozhidotv"),
                6: i18n.twl(nowLang?.lang ?? "en", "ping.ozhidvos"),
                7: i18n.twl(nowLang?.lang ?? "en", "ping.otkl"),
                8: i18n.twl(nowLang?.lang ?? "en", "ping.ozh"),
                9: i18n.twl(nowLang?.lang ?? "en", "ping.podklala"),
                10: i18n.twl(nowLang?.lang ?? "en", "ping.otkllla")
            };
            return statuses[status] || i18n.twl(nowLang?.lang ?? "en", "ping.none");
        }
        // Время отправки начального сообщения
       // const sent = await interaction.reply({ content: i18n.twl(nowLang?.lang ?? "en", "ping.pingign") });

        // Создаем Embed для красивого вывода
        const embedd = new EmbedBuilder()
            .setColor('Orange') // Предустановленный цвет
            .setTimestamp() // Добавляет временную метку
            .setFooter({
                text: `${this.bot?.user?.username}`,
                iconURL: `${this.bot?.user?.displayAvatarURL({ size: 32 })}` // Аватар бота, если client передан
            })
            .setTitle(result2)
            .addFields(
                {
                    name: i18n.twl(nowLang?.lang ?? "en", "ping.api"),
                    value: `${sent.createdTimestamp - interaction.createdTimestamp}ms`,
                    inline: true
                },
                {
                    name: i18n.twl(nowLang?.lang ?? "en", "ping.wsping"),
                    value: `${Math.round(interaction.client.ws.ping)}ms`,
                    inline: true
                },
                {
                    name: i18n.twl(nowLang?.lang ?? "en", "ping.wsstatus"),
                    value: getWebSocketStatus(interaction.client.ws.status),
                    inline: true
                },
                {
                    name: i18n.twl(nowLang?.lang ?? "en", "ping.uptime"),
                    value: formatUptime(process.uptime()),
                    inline: true
                },
                {
                    name: i18n.twl(nowLang?.lang ?? "en", "ping.memory"),
                    value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
                    inline: true
                }
            )

        // Обновляем сообщение с Embed
        await interaction.editReply({ content: null, embeds: [embedd] });
    }
};

// Функция для форматирования времени работы
function formatUptime(uptime: any) {
    const totalSeconds = Math.floor(uptime);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${days}д ${hours}ч ${minutes}м ${seconds}с`;
};