import { Collection } from "discord.js";
import IConfig from "./IConfig";
import Interaction from "../classes/Interaction";
import SubCommand from "../classes/SubCommand";

export default interface IBot {
    config: IConfig;
    commands: Collection<string, Interaction>;
    subCommands: Collection<string, SubCommand>;
    cooldowns: Collection<string, Collection<string, number>>;
    develmode: boolean;

    Init(): void;
    LoadHandlers(): void;
}