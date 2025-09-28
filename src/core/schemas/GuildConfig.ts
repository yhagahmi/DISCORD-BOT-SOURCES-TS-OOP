import { model, Schema } from "mongoose";

interface iGuildConfig {
    guildId: string;
    lang: 'ru' | 'en';
}

export default model<iGuildConfig>("GuildConfig", new Schema<iGuildConfig>({
    guildId: String,
    lang: { type: String, default: "en", enum: ["ru", "en"] }
}, {
    timestamps: true,
}))