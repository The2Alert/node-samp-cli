import {isAbsolute, join} from "path";
import * as JSON5 from "json5";
import * as YAML from "yaml";
import {mkdir, writeFile} from "fs/promises";
import {PackageConfigFormat, PackageConfigParams, PackageError} from ".";

export interface PackageCreateConfigOptions {
    hostName: string;
    maxPlayers: number;
    maxNpc: number;
    port: number;
    webUrl: string;
    password: string;
    rconPassword: string;
    mapName: string;
    language: string;
    format: PackageConfigFormat;
    path: string;
}

export enum PackageLanguage {
    TYPESCRIPT,
    JAVASCRIPT
}

export enum PackageSoftware {
    GIT,
    PRETTIER,
    DOCKER,
    JEST
}

export interface PackageUsage {
    git: boolean;
    prettier: boolean;
    docker: boolean;
    jest: boolean;
}

export interface PackageCreateOptions {
    name: string;
    language: PackageLanguage;
    usage: PackageUsage;
    config: Omit<PackageCreateConfigOptions, "path">;
    path: string;
}

export class PackageCreator {
    public static async createConfig({path, format, hostName, maxPlayers, maxNpc, port, webUrl, password, rconPassword, mapName, language}: PackageCreateConfigOptions): Promise<void> {
        if(!isAbsolute(path))
            path = join(process.cwd(), path);
        const params: PackageConfigParams = {hostName, maxPlayers, maxNpc, port};
        if(webUrl !== "")
            params.webUrl = webUrl;
        if(password !== "")
            params.password = password;
        if(rconPassword !== "")
            params.rconPassword = rconPassword;
        else params.rcon = false;
        if(mapName !== "")
            params.mapName = mapName;
        if(language !== "")
            params.language = language;
        let configPath: string;
        let content: string;
        switch(format) {
            case PackageConfigFormat.JSON: 
                configPath = join(path, "./samp-conf.json");
                content = JSON.stringify(params, null, 4);
            break;
            case PackageConfigFormat.JSON5:
                configPath = join(path, "./samp-conf.json5");
                content = JSON5.stringify(params, null, 4);
            break;
            default:
                configPath = join(path, "./samp-conf.yml");
                content = YAML.stringify(params, {indent: 4});
            break;
        }
        try {
            await writeFile(configPath, content);
        } catch(error) {
            throw new PackageError("Configuration file not created.");
        }
    }

    public static create(options: PackageCreateOptions): Promise<PackageCreator> {
        const creator = new PackageCreator(options);
        return creator.create();
    }

    private constructor(public readonly options: PackageCreateOptions) {}

    public readonly name: string = this.options.name;
    public readonly language: PackageLanguage = this.options.language;
    public readonly usage: PackageUsage = this.options.usage;
    public readonly config: Omit<PackageCreateConfigOptions, "path"> = this.options.config;
    public readonly path: string = isAbsolute(this.options.path) ? this.options.path : join(process.cwd(), this.options.path);

    private async create(): Promise<this> {
        await mkdir(this.path).catch(() => undefined);    
        return this;
    }
}