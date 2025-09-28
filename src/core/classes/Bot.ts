import { Client, Collection, GatewayIntentBits } from "discord.js";
import IBot from "../interfaces/IBot";
import IConfig from "../interfaces/IConfig";
import Handler from "./Handler";
import Interaction from "./Interaction";
import SubCommand from "./SubCommand";
import { connect } from "mongoose";

export default class Bot extends Client implements IBot {
    handler: Handler
    config: IConfig;
    commands: Collection<string, Interaction>;
    subCommands: Collection<string, SubCommand>;
    cooldowns: Collection<string, Collection<string, number>>;
    develmode: boolean;

    constructor() {
        super({ intents: [GatewayIntentBits.Guilds] })

        this.config = require(`${process.cwd()}/data/config.json`);
        this.handler = new Handler(this);
        this.commands = new Collection();
        this.subCommands = new Collection();
        this.cooldowns = new Collection();
        this.develmode = (process.argv.slice(2).includes("--development"));
    }
    Init(): void {
        console.log(`Starting the bot in ${this.develmode ? "development" : "production"} mode.`);
        this.LoadHandlers();

        this.login(this.config.token)
            .catch((err) => console.error(err));

        connect(this.config.mongoUrl)
            .then(() => console.log(`Connected to MongoDB`))
            .catch((err) => console.log(err));
    }

    LoadHandlers(): void {
        this.handler.LoadEvents();
        this.handler.LoadCommands();
    }

}