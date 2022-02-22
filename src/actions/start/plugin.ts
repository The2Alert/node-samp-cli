import {plainToClass} from "class-transformer";
import {validate} from "class-validator";
import * as fs from "fs";
import {access, link, readdir, readFile, unlink} from "fs/promises";
import {basename, join, parse} from "path";
import {Start} from ".";
import {Config} from "./config";
import {PackageParams} from "./package-params";
import {PluginParams} from "./plugin-params";

export class Plugin {
    public static readonly reservedNames: string[] = ["nodesamp"];

    public readonly name: string;
    public readonly platform: string;
    public readonly path: string;
    public readonly serverPath: string;

    constructor(public readonly start: Start, public readonly pluginsPath: string, params: PluginParams) {
        this.path = join(pluginsPath, params.path);
        this.platform = params.platform;
        this.name = parse(this.path).name;
        this.serverPath = join(start.getServerPath(), "./plugins", basename(this.path));
    }

    public isSupported(): boolean {
        return this.platform === process.platform && Plugin.reservedNames.every((name) => name !== this.name);
    }

    public async create(): Promise<Plugin> {
        try {
            await access(this.path, fs.constants.F_OK);
        } catch(error) {
            throw new Error(`Plugin ${JSON.stringify(this.name)} not found.`);
        }
        await link(this.path, this.serverPath);
        return this;
    }
}

export async function removePlugins(start: Start): Promise<void> {
    const pluginsPath: string = join(start.getServerPath(), "./plugins");
    for(const path of await readdir(pluginsPath)) {
        const {name, ext} = parse(path);
        if(Plugin.reservedNames.some((reservedName) => reservedName === name) || ext === "")
            continue;
        await unlink(join(pluginsPath, path));
    }
}

export async function createPlugins(start: Start, plugins: Record<string, Plugin>, paramsList: (string | PluginParams)[]): Promise<void> {
    const pluginsPath: string = start.getPluginsPath();
    for(const params of paramsList) {
        if(typeof params === "object") {
            const plugin = new Plugin(start, pluginsPath, params);
            if(plugin.isSupported() && !(plugin.name in plugins))
                plugins[plugin.name] = await plugin.create();
        } else await createPackagePlugins(start, plugins, params);
    }
}

export async function createPackagePlugins(start: Start, plugins: Record<string, Plugin>, packageName: string): Promise<void> {
    const packagePath: string = join(start.getPackageFullPath(), "./node_modules", packageName);
    let packageContent: unknown;
    try {
        packageContent = JSON.parse(String(await readFile(join(packagePath, "./package.json"))));
    } catch(error) {
        throw new Error(`Package ${JSON.stringify(packageName)} not found.`);
    }
    const packageParams: PackageParams = plainToClass(PackageParams, packageContent);
    Config.throwValidationErrors(await validate(packageParams));
    const paramsList: (string | PluginParams)[] = packageParams.config.samp.plugins;
    const pluginsPath: string = join(packagePath, packageParams.config.samp.pluginsPath);
    for(const params of paramsList) {
        if(typeof params === "object") {
            const plugin = new Plugin(start, pluginsPath, params);
            if(plugin.isSupported() && !(plugin.name in plugins))
                plugins[plugin.name] = await plugin.create();
        } else await createPackagePlugins(start, plugins, params);
    }
}