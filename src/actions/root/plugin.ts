import {plainToClass} from "class-transformer";
import {validate} from "class-validator";
import * as fs from "fs";
import {access, unlink, link, readdir, readFile} from "fs/promises";
import {join, parse, basename} from "path";
import {Root} from ".";
import {Config} from "./config";
import {ConfigParams} from "./config-params";
import {PackageParams} from "./package-params";
import {PluginParams} from "./plugin-params";

export class Plugin {
    public static async create(root: Root, pluginsPath: string, params: PluginParams): Promise<Plugin> {
        const plugin = new Plugin(root, pluginsPath, params);
        await plugin.create();
        return plugin;
    }

    constructor(public readonly root: Root, public readonly pluginsPath: string, public readonly params: PluginParams) {}

    public name?: string;
    public path?: string;
    public serverPath?: string;

    public isSupported(): boolean {
        return this.params.platform === process.platform && this.getName() !== "nodesamp";
    }

    public async create(): Promise<void> {
        if(!this.isSupported())
            return;
        this.path = join(this.pluginsPath, this.params.path);
        this.name = parse(this.getPath()).name;
        try {
            await access(this.getPath(), fs.constants.F_OK);
        } catch(error) {
            throw new Error(`Plugin ${JSON.stringify(this.getName())} not found.`);
        }
        this.serverPath = join(this.root.getServerPath(), "./plugins", basename(this.path));
        await link(this.getPath(), this.getServerPath());
    }

    public getName(): string {
        return this.name ?? "";
    }

    public getPath(): string {
        return this.path ?? "";
    }

    public getServerPath(): string {
        return this.serverPath ?? "";
    }
}

export async function removePlugins(root: Root): Promise<void> {
    const pluginsPath: string = join(root.getServerPath(), "./plugins");
    for(const path of await readdir(pluginsPath)) {
        const {name, ext} = parse(path);
        if(name === "nodesamp" || ext === "")
            continue;
        await unlink(join(pluginsPath, path));
    }
}

export async function createPlugins(root: Root, plugins: (string | PluginParams)[]): Promise<Plugin[]> {
    const result: Plugin[] = [];
    for(const params of plugins) {
        if(typeof params === "string")
            result.push(...await createPackagePlugins(root, params));
        else {
            const config: Config | null = root.getConfig();
            if(config === null)
                break;
            const configParams: ConfigParams = config.getParams();
            const pluginsPath: string = join(root.getPackageFullPath(), configParams.pluginsPath);
            result.push(await Plugin.create(root, pluginsPath, params));
        }
    }
    return result;
}

export async function createPackagePlugins(root: Root, packageName: string): Promise<Plugin[]> {
    const packagePath: string = join(root.getPackageFullPath(), "./node_modules", packageName);
    let packageContent: unknown;
    try {
        packageContent = JSON.parse(String(await readFile(join(packagePath, "./package.json"))));
    } catch(error) {
        throw new Error(`Package ${JSON.stringify(packageName)} not found.`);
    }
    const packageParams: PackageParams = plainToClass(PackageParams, packageContent);
    Config.throwValidationErrors(await validate(packageParams));
    const plugins: (string | PluginParams)[] = packageParams.config.samp.plugins;
    const result: Plugin[] = [];
    for(const params of plugins) {
        if(typeof params === "string")
            result.push(...await createPackagePlugins(root, params));
        else {
            const pluginsPath: string = join(packagePath, packageParams.config.samp.pluginsPath);
            result.push(await Plugin.create(root, pluginsPath, params));
        }
    }
    return result;
}