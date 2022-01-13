import "reflect-metadata";
import {program} from "commander";
import {unlink, writeFile} from "fs/promises";
import {join} from "path";
import {spawn} from "cross-spawn";
import {Config, ConfigPathTypes, ConfigException} from "./config";
import * as logger from "../../logger";
import {ConfigParams} from "./config-params";
import {createPlugins, Plugin, removePlugins} from "./plugin";

export class Root {
    public static create(packagePath: string): Root {
        return new Root(packagePath);
    }

    constructor(private readonly packagePath: string) {}

    private packageFullPath?: string;
    private serverPath?: string;
    private config?: Config | null;
    private plugins?: Plugin[];

    public async action(): Promise<void> {
        this.packageFullPath = join(process.cwd(), this.packagePath);
        this.serverPath = join(__dirname, "../../../server");
        try {
            await this.removeServerLog();
            if("config" in program.opts()) {
                const configFullPath: string = join(this.getPackageFullPath(), program.opts()["config"]);
                this.config = await Config.get(this, ConfigPathTypes.CONFIG, configFullPath);
            } else this.config = await Config.get(this, ConfigPathTypes.PACKAGE, this.getPackageFullPath());
            const params: ConfigParams = this.config.getParams();
            await removePlugins(this);
            if(params.plugins)
                this.plugins = await createPlugins(this, params.plugins);
            else this.plugins = [];
            await this.config.createServerConfig();
            await this.createPluginConfig();
            const serverPath: string = this.getServerPath();
            spawn(process.platform === "win32" ? join(serverPath, "./samp-server.exe") : join(serverPath, "./samp03svr"), {cwd: serverPath, stdio: "inherit"});
        } catch(error) {
            if(error instanceof ConfigException)
                logger.config.error(error);
            else if(error instanceof Error)
                logger.error(error);
        }
    }

    public getPackageFullPath(): string {
        return this.packageFullPath ?? "";
    }

    public getServerPath(): string {
        return this.serverPath ?? "";
    }

    public async removeServerLog(): Promise<void> {
        const path: string = join(this.getServerPath(), "./server_log.txt");
        try {
            await unlink(path);
        } catch(error) {}
    }

    public getConfig(): Config | null {
        return this.config ?? null;
    }

    public async createPluginConfig(): Promise<void> {
        const config: Config | null = this.getConfig();
        if(config === null)
            return;
        const {nodeOptions = ""}: ConfigParams = config.getParams();
        const path: string = join(this.getServerPath(), "./nodesamp-conf.json");
        await writeFile(path, JSON.stringify({
            packagePath: this.getPackageFullPath(),
            nodeOptions
        }));
    }

    public getPlugins(): Plugin[] {
        return this.plugins ?? [];
    }
}