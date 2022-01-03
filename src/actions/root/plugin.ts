import * as fs from "fs";
import {access, unlink, link, readdir} from "fs/promises";
import {join, parse, basename} from "path";
import {Root} from ".";
import {Config} from "./config";
import {ConfigParams} from "./config-params";
import {PluginParams} from "./plugin-params";

export class Plugin {
    public static async create(root: Root, params: PluginParams): Promise<Plugin> {
        const plugin = new Plugin(root, params);
        await plugin.create();
        return plugin;
    }

    constructor(public readonly root: Root, public readonly params: PluginParams) {}

    public name?: string;
    public path?: string;
    public serverPath?: string;

    public isSupported(): boolean {
        return this.params.platform === process.platform && this.getName() !== "nodesamp";
    }

    public async create(): Promise<void> {
        if(!this.isSupported())
            return;
        const config: Config | null = this.root.getConfig();
        if(config === null)
            return;
        const configParams: ConfigParams = config.getParams();
        this.path = join(this.root.getPackageFullPath(), configParams.pluginsPath, this.params.path);
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

export async function createPlugins(root: Root, paramsList: PluginParams[]): Promise<Plugin[]> {
    const result: Plugin[] = [];
    for(const params of paramsList)
        result.push(await Plugin.create(root, params));
    return result;
}