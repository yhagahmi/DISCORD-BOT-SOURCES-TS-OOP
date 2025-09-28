import { EmbedBuilder, User, Client, ColorResolvable } from 'discord.js';
import bot from './Bot';

class Embed {
    private embed: EmbedBuilder;

    constructor(bot?: bot) {
        this.embed = new EmbedBuilder()
            .setColor('Orange') // Предустановленный цвет
            .setTimestamp() // Добавляет временную метку
            .setFooter({
                text: `${bot?.user?.username}`,
                iconURL: `${bot?.user?.displayAvatarURL({ size: 32 })}` // Аватар бота, если client передан
            });
    }

    // Установка заголовка
    setTitle(title: string): this {
        this.embed.setTitle(title);
        return this;
    }

    // Установка описания
    setDescription(description: string): this {
        this.embed.setDescription(description);
        return this;
    }

    // Добавление поля
    addField(name: string, value: string, inline: boolean = false): this {
        this.embed.addFields({ name, value, inline });
        return this;
    }

    // Установка цвета
    setCustomColor(color: ColorResolvable): this {
        this.embed.setColor(color);
        return this;
    }

    // Установка автора на основе объекта User
    setAuthor(user: User): this {
        this.embed.setAuthor({
            name: user.username,
            iconURL: user.displayAvatarURL({ size: 32 }),
        });
        return this;
    }

    // Установка кастомного футера
    setFooter(text: string, iconURL?: string): this {
        this.embed.setFooter({ text: `${text}`, iconURL: `${iconURL}` });
        return this;
    }

    // Получение финального Embed с проверкой
    build(): EmbedBuilder {
        // Проверяем, есть ли title, description или fields
        const hasTitle = !!this.embed.data.title;
        const hasDescription = !!this.embed.data.description;
        const hasFields = this.embed.data.fields && this.embed.data.fields.length > 0;

        if (!hasTitle && !hasDescription && !hasFields) {
            // Если ничего не задано, устанавливаем заглушку для description
            this.embed.setDescription('No content provided');
        }

        return this.embed;
    }
}

export default Embed;