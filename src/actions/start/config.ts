import {getType} from "mime";
import * as fs from "fs";
import {access, readFile, writeFile} from "fs/promises";
import {join} from "path";
import * as JSON5 from "json5";
import * as YAML from "yaml";
import {plainToClass} from "class-transformer";
import {ValidationError, validate} from "class-validator";
import {encode} from "iconv-lite";
import {ConfigParams} from "./config-params";
import {Start} from ".";
import {Plugin} from "./plugin";

export enum ConfigPathTypes {
    CONFIG,
    PACKAGE
}

export interface ConfigInfo {
    path: string;
    mimeType: string;
}

export type ConfigParser = typeof JSON.parse;

export class Config {
    private static readonly parsers: Record<string, ConfigParser> = {
        "application/json": JSON.parse,
        "application/json5": JSON5.parse,
        "text/yaml": (text) => YAML.parse(text)
    };

    public static getParser(info: ConfigInfo): ConfigParser | null {
        return Config.parsers[info.mimeType] ?? null;
    }

    public static throwValidationErrors(errors: ValidationError[]): void {
        for(const error of errors) {
            if(error.constraints) {
                for(const message of Object.values(error.constraints))
                    throw new Error(message);
            }
            if(error.children)
                Config.throwValidationErrors(error.children);
        }
    }

    public static async get(start: Start, type: ConfigPathTypes, path: string): Promise<Config> {
        const config = new Config(start, type, path);
        await config.get();
        return config;
    }

    constructor(
        public readonly start: Start,
        public readonly type: ConfigPathTypes, 
        public readonly path: string
    ) {}

    public params?: ConfigParams;

    public async getInfo(path: string): Promise<ConfigInfo | null> {
        try {
            const configPath: string = join(path, "./samp-conf.json");
            await access(configPath, fs.constants.F_OK);
            return {path: configPath, mimeType: "application/json"};
        } catch(error) {}
        try {
            const configPath: string = join(path, "./samp-conf.json5");
            await access(configPath, fs.constants.F_OK);
            return {path: configPath, mimeType: "application/json5"};
        } catch(error) {}
        try {
            const configPath: string = join(path, "./samp-conf.yaml");
            await access(configPath, fs.constants.F_OK);
            return {path: configPath, mimeType: "text/yaml"};
        } catch(error) {}
        try {
            const configPath: string = join(path, "./samp-conf.yml");
            await access(configPath, fs.constants.F_OK);
            return {path: configPath, mimeType: "text/yaml"};
        } catch(error) {}
        return null;
    }

    public async getInfoByPath(path: string): Promise<ConfigInfo | null> {
        try {
            await access(path, fs.constants.F_OK);
            const mimeType: string | null = getType(path);
            if(!mimeType)
                return null;
            return {path, mimeType};
        } catch(error) {}
        return null;
    }

    public getParams(): ConfigParams {
        return this.params ?? new ConfigParams;
    }

    public async get(): Promise<ConfigParams | null> {
        let info: ConfigInfo | null = null;
        switch(this.type) {
            case ConfigPathTypes.PACKAGE:
                info = await this.getInfo(this.path);
            break;
            case ConfigPathTypes.CONFIG:
                info = await this.getInfoByPath(this.path);
            break;
        }
        if(info === null)
            throw new Error("Configuration file not found.");
        const parser: ConfigParser | null = Config.getParser(info);
        if(parser === null)
            throw new Error("Configuration format not supported.");
        try {
            this.params = plainToClass(ConfigParams, parser(String(await readFile(info.path))));
            Config.throwValidationErrors(await validate(this.params));
        } catch(error) {
            if(error instanceof Error)
                throw new ConfigException(error.message);
        }
        return this.getParams();
    }

    public async createServerConfig(): Promise<void> {
        const params: ConfigParams = this.getParams();
        let text: string = "gamemode0 main\n";
        if(params.lanMode !== undefined)
            text += "lanmode " + Number(params.lanMode) + "\n";
        if(params.maxPlayers !== undefined)
            text += "maxplayers " + params.maxPlayers + "\n";
        if(params.announce !== undefined)
            text += "announce " + Number(params.announce) + "\n";
        if(params.query != undefined)
            text += "query " + Number(params.query) + "\n";
        if(params.port !== undefined)
            text += "port " + params.port + "\n";
        if(params.hostName !== undefined)
            text += "hostname " + params.hostName + "\n";
        if(params.webUrl !== undefined)
            text += "weburl " + params.webUrl + "\n";
        if(params.rconPassword !== undefined)
            text += "rcon_password " + params.rconPassword + "\n";
        const plugins: Record<string, Plugin> = this.start.getPlugins();
        let pluginNames: string[] = Object.values(plugins).map((plugin) => plugin.name);
        pluginNames.push("nodesamp");
        if(process.platform !== "win32")
            pluginNames = pluginNames.map((name) => name + ".so");
        text += "plugins " + pluginNames.join(" ") + "\n";
        if(params.password !== undefined)
            text += "password " + params.password + "\n";
        if(params.mapName !== undefined)
            text += "mapname " + params.mapName + "\n";
        if(params.language !== undefined)
            text += "language " + params.language + "\n";
        if(params.bind !== undefined)
            text += "bind " + params.bind + "\n";
        if(params.rcon !== undefined)
            text += "rcon " + Number(params.rcon) + "\n";
        if(params.maxNpc !== undefined)
            text += "maxnpc " + params.maxNpc + "\n";
        if(params.onfootRate !== undefined)
            text += "onfoot_rate " + params.onfootRate + "\n";
        if(params.incarRate !== undefined)
            text += "incar_rate " + params.incarRate + "\n";
        if(params.weaponRate !== undefined)
            text += "weapon_rate " + params.weaponRate + "\n";
        if(params.streamDistance !== undefined)
            text += "stream_distance " + params.streamDistance + "\n";
        if(params.streamRate !== undefined)
            text += "stream_rate " + params.streamRate + "\n";
        if(params.timeStamp !== undefined)
            text += "timestamp " + Number(params.timeStamp) + "\n";
        if(params.logQueries !== undefined)
            text += "logqueries " + Number(params.logQueries) + "\n";
        if(params.logTimeFormat !== undefined)
            text += "logtimeformat " + params.logTimeFormat + "\n";
        if(params.output !== undefined)
            text += "output " + Number(params.output) + "\n";
        if(params.gameModeText !== undefined)
            text += "gamemodetext " + params.gameModeText + "\n";
        if(params.chatLogging !== undefined)
            text += "chatlogging " + Number(params.chatLogging) + "\n";
        if(params.messageHoleLimit !== undefined)
            text += "messageholelimit " + params.messageHoleLimit + "\n";
        if(params.messagesLimit !== undefined)
            text += "messageslimit " + params.messagesLimit + "\n";
        if(params.lagcompMode !== undefined)
            text += "lagcompmode " + params.lagcompMode + "\n";
        if(params.acksLimit !== undefined)
            text += "ackslimit " + params.acksLimit + "\n";
        if(params.playerTimeout !== undefined)
            text += "playertimeout " + params.playerTimeout + "\n";
        if(params.minConnectionTime !== undefined)
            text += "minconnectiontime " + params.minConnectionTime + "\n";
        if(params.connseedTime !== undefined)
            text += "connseedtime " + params.connseedTime + "\n";
        if(params.sleep !== undefined)
            text += "sleep " + params.sleep + "\n";
        if(params.connCookies !== undefined)
            text += "conncookies " + Number(params.connCookies) + "\n";
        if(params.cookieLogging !== undefined)
            text += "cookielogging " + Number(params.cookieLogging) + "\n";
        await writeFile(join(this.start.getServerPath(), "./server.cfg"), encode(text, "cp1251"));
    }
}

export class ConfigException extends Error {}