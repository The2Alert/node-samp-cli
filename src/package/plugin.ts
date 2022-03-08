import * as fs from "fs";
import {access, link} from "fs/promises";
import {basename, join, parse} from "path";
import {Package, PackagePluginParams, PackageError} from ".";

export class PackagePlugin {
    public static readonly reservedNames: string[] = ["nodesamp"];

    constructor(public readonly pkg: Package, public readonly pluginsPath: string, public readonly params: PackagePluginParams) {}

    public readonly path: string = join(this.pluginsPath, this.params.path);
    public readonly platform: string = this.params.platform;
    public readonly name: string = parse(this.path).name;
    public readonly serverPath: string = join(this.pkg.server.pluginsPath, basename(this.path));

    public isSupported(): boolean {
        return this.platform === this.pkg.platform && PackagePlugin.reservedNames.every((name) => name !== this.name);
    }

    public async create(): Promise<this> {
        try {
            await access(this.path, fs.constants.F_OK);
        } catch(error) {
            throw new PackageError(`Plugin ${JSON.stringify(this.name)} not found.`);
        }
        await link(this.path, this.serverPath);
        return this;
    }
}

export * from "./plugin-params";
export * from "./plugin-package-params";