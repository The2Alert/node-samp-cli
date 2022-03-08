import "reflect-metadata";
import {join} from "path";
import {PackageConfig} from "./config";
import {PackageConfigParams} from "./config-params";
import {PackagePlugin} from "./plugin";
import {PackageServer} from "./server";

export interface PackageOptions {
    path: string;
    serverPath: string;
    configPath?: string;
    nodeOptions?: string;
    platform?: NodeJS.Platform;
}

export class Package {
    public static async start(options: PackageOptions): Promise<Package> {
        const pkg = new Package(options);
        return await pkg.start();
    }

    protected constructor(public readonly options: PackageOptions) {}

    public readonly path: string = this.options.path;
    public readonly serverPath: string = this.options.serverPath;
    public readonly server = new PackageServer(this, this.serverPath);
    public readonly configPath: string | null = this.options.configPath ?? null;
    public readonly config = new PackageConfig(this, this.configPath);
    public configParams: PackageConfigParams;
    public plugins: Record<string, PackagePlugin>;
    public pluginsPath: string;
    public readonly platform: NodeJS.Platform = this.options.platform ?? process.platform;
    public nodeOptions: string;

    public async start(): Promise<this> {
        this.configParams = await this.config.getParams();
        await this.server.removeLog();
        await this.server.removePlugins();
        this.pluginsPath = join(this.path, this.configParams.pluginsPath ?? "./plugins");
        this.plugins = {};
        await this.server.createPlugins();
        await this.server.createConfig();
        this.nodeOptions = this.options.nodeOptions ?? this.configParams.nodeOptions ?? "";
        await this.server.createPluginConfig();
        await this.server.start();
        return this;
    }
}

export * from "./errors";
export * from "./server";
export * from "./config";
export * from "./plugin";
export * from "./creator";