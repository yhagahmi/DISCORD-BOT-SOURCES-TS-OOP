import { ChatInputCommandInteraction, AutocompleteInteraction, CacheType } from "discord.js";
import Category from "../enums/Category";
import IInteraction from "../interfaces/IInteraction";
import bot from "./Bot";
import IInteractionOptions from "../interfaces/IIInteractionOptions";
import { I18n } from "../util/i18n";
import { createReactiveContext } from "../util/context";
import translations from "../../translations";

export const context = createReactiveContext<I18n<typeof translations>>()

export default class Interaction implements IInteraction {
    bot: bot;
    name: string;
    description: string;
    category: Category;
    options: object;
    default_member_permissions: bigint;
    dm_permission: boolean;
    cooldown: number;
    dev: boolean;

    constructor(bot: bot, options: IInteractionOptions) {
        this.bot = bot;
        this.name = options.name;
        this.description = options.description;
        this.category = options.category;
        this.options = options.options;
        this.default_member_permissions = options.default_member_permissions;
        this.dm_permission = options.dm_permission;
        this.cooldown = options.cooldown;
        this.dev = options.dev;
    }

    run(interaction: ChatInputCommandInteraction<CacheType>) {
        const i18n = new I18n({
            data: translations,
            registerLangs: ["ru", "en"],
            baseLang: "en",
            filters: {
                "upper": (value) => {
                    return value.toUpperCase()
                }
            }
        })

        const execute = context.provider(() => {
            this.exec(interaction)
        }, i18n)

        execute()
    }

    exec(interaction: ChatInputCommandInteraction<CacheType>): void {
    }
    autocomplete(interaction: AutocompleteInteraction<CacheType>): void {
    }
    
}