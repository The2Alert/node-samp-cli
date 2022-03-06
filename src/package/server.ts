import {join, parse} from "path";
import {readdir, readFile, unlink, writeFile} from "fs/promises";
import {encode} from "iconv-lite";
import {spawn} from "cross-spawn";
import {plainToClass} from "class-transformer";
import {Package, PackagePlugin, PackageConfigParams, PackagePluginParams, PackageException, PackageConfig, PackagePluginPackageParams} from ".";
import { validate } from "class-validator";

export class PackageServer {
    constructor(public readonly pkg: Package, public readonly path: string) {}

    public readonly pluginsPath: string = join(this.path, "./plugins");

    public async removeLog(): Promise<void> {
        const path: string = join(this.path, "./server_log.txt");
        try {
            await unlink(path);
        } catch(error) {}
    }

    public async createPlugins(): Promise<void> {
        const plugins: Record<string, PackagePlugin> = this.pkg.plugins;
        const pluginsPath: string = this.pkg.pluginsPath;
        const paramsList: (string | PackagePluginParams)[] = this.pkg.configParams.plugins ?? [];
        for(const params of paramsList) {
            if(typeof params === "object") {
                const plugin = new PackagePlugin(this.pkg, pluginsPath, params);
                if(plugin.isSupported() && !(plugin.name in plugins))
                    plugins[plugin.name] = await plugin.create();
            } else await this.createPackagePlugins(params);
        }
    }

    public async createPackagePlugins(name: string): Promise<void> {
        const path: string = join(this.pkg.path, "./node_modules", name);
        let content: unknown;
        try {
            content = JSON.parse(String(await readFile(join(path, "./package.json"))));
        } catch(error) {
            throw new PackageException(`Package ${JSON.stringify(name)} not found.`);
        }
        const packageParams: PackagePluginPackageParams = plainToClass(PackagePluginPackageParams, content);
        PackageConfig.throwValidationErrors(await validate(packageParams));
        const plugins: Record<string, PackagePlugin> = this.pkg.plugins;
        const pluginsPath: string = join(path, packageParams.config?.samp?.pluginsPath ?? "./plugins");
        const paramsList: (string | PackagePluginParams)[] = packageParams.config?.samp?.plugins ?? [];
        for(const params of paramsList) {
            if(typeof params === "object") {
                const plugin = new PackagePlugin(this.pkg, pluginsPath, params);
                if(plugin.isSupported() && !(plugin.name in plugins))
                    plugins[plugin.name] = await plugin.create();
            } else await this.createPackagePlugins(params);
        }
    }

    public async removePlugins(): Promise<void> {
        const pluginsPath: string = this.pluginsPath;
        for(const path of await readdir(pluginsPath)) {
            const {name, ext} = parse(path);
            if(PackagePlugin.reservedNames.some((reservedName) => reservedName === name) || ext === "")
                continue;
            await unlink(join(pluginsPath, path));
        }
    }

    public async createConfig(): Promise<void> {
        const params: PackageConfigParams = this.pkg.configParams;
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
        const plugins: Record<string, PackagePlugin> = this.pkg.plugins;
        let pluginNames: string[] = Object.values(plugins).map(({name}) => name);
        pluginNames.push("nodesamp");
        if(this.pkg.platform !== "win32")
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
        const path: string = join(this.pkg.serverPath, "./server.cfg");    
        await writeFile(path, encode(text, "cp1251"));
    }

    public async createPluginConfig(): Promise<void> {
        const packagePath: string = this.pkg.path;
        const nodeOptions: string = this.pkg.nodeOptions;
        const path: string = join(this.pkg.serverPath, "./nodesamp-conf.json");
        await writeFile(path, JSON.stringify({packagePath, nodeOptions}));
    }

    public async start(): Promise<void> {
        const {platform, serverPath} = this.pkg;
        const path: string = platform === "win32" ? join(serverPath, "./samp-server.exe") : join(serverPath, "./samp03svr");
        spawn(path, {cwd: serverPath, stdio: "inherit"});
    }
}