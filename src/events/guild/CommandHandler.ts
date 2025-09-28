import { ChatInputCommandInteraction, Collection, EmbedBuilder, Events, time } from "discord.js";
import bot from "../../base/classes/Bot";
import Event from "../../base/classes/Event";
import Interaction from "../../base/classes/Interaction";
import { I18n } from "../../base/util/i18n";
import { createReactiveContext } from "../../base/util/context";

export default class CommandHandler extends Event {
    constructor(bot: bot) {
        super(bot, {
            name: Events.InteractionCreate,
            description: "Command handler event",
            once: false
        })
    }

    exec(interaction: ChatInputCommandInteraction) {
        if (!interaction.isChatInputCommand()) return;

        const command: Interaction = this.bot.commands.get(interaction.commandName)!;

        //@ts-ignore
        if (!command) return interaction.reply({ content: `This command does not exist!`, ephemeral: true }) && this.client.commands.delete(interaction.commandName);

        const { cooldowns } = this.bot;
        if(!cooldowns.has(command.name)) cooldowns.set(command.name, new Collection());
        
        const now = Date.now();
        const timestamps = cooldowns.get(command.name)!;
        const cooldownAmount = (command.cooldown || 3) * 1000;

        if (timestamps.has(interaction.user.id) && (now < (timestamps.get(interaction.user.id) || 0) + cooldownAmount))
            return interaction.reply({ embeds: [new EmbedBuilder()
            .setColor("Red")
            .setDescription(`❌ Please wait another \`${(((timestamps.get(interaction.user.id) || 0) + cooldownAmount) - now / 1000).toFixed(1)}\` seconds to use this command!`)
        ], ephemeral: true });

        timestamps.set(interaction.user.id, now);
        setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

        try {
            const subCommandGroup = interaction.options.getSubcommandGroup(false);
            const subCommand = `${interaction.commandName}${subCommandGroup ? `.${subCommandGroup}` : ""}.${interaction.options.getSubcommand(false) || ""}`

            this.bot.subCommands.get(subCommand)?.exec(interaction) || command.run(interaction)
        } catch (ex) {
            console.log(ex);
        }
    }

}