import * as fs from "fs";
import {access, readFile} from "fs/promises";
import {join} from "path";
import {getType} from "mime";
import * as JSON5 from "json5";
import * as YAML from "yaml";
import {validate, ValidationError} from "class-validator";
import {plainToClass} from "class-transformer";
import {Package} from ".";
import {PackageConfigParams} from "./config-params";
import {PackageConfigException, PackageException} from "./exceptions";

export interface PackageConfigInfo {
    path: string;
    mimeType: string;
}

export type PackageConfigParser = typeof JSON.parse;

export class PackageConfig {
    private static readonly parsers: Record<string, PackageConfigParser> = {
        "application/json": JSON.parse,
        "application/json5": JSON5.parse,
        "text/yaml": (text) => YAML.parse(text)
    };

    public static getParser(info: PackageConfigInfo): PackageConfigParser | null {
        return PackageConfig.parsers[info.mimeType] ?? null;
    }

    public static throwValidationErrors(errors: ValidationError[]): void {
        for(const error of errors) {
            if(error.constraints) {
                for(const message of Object.values(error.constraints))
                    throw new PackageConfigException(message);
            }
            if(error.children)
                PackageConfig.throwValidationErrors(error.children);
        }
    }

    constructor(public readonly pkg: Package, public readonly path: string | null) {}

    public async getInfo(): Promise<PackageConfigInfo | null> {
        if(this.path === null) {
            const pkgPath: string = this.pkg.path;
            try {
                const configPath: string = join(pkgPath, "./samp-conf.json");
                await access(configPath, fs.constants.F_OK);
                return {path: configPath, mimeType: "application/json"};
            } catch(error) {}
            try {
                const configPath: string = join(pkgPath, "./samp-conf.json5");
                await access(configPath, fs.constants.F_OK);
                return {path: configPath, mimeType: "application/json5"};
            } catch(error) {}
            try {
                const configPath: string = join(pkgPath, "./samp-conf.yaml");
                await access(configPath, fs.constants.F_OK);
                return {path: configPath, mimeType: "text/yaml"};
            } catch(error) {}
            try {
                const configPath: string = join(pkgPath, "./samp-conf.yml");
                await access(configPath, fs.constants.F_OK);
                return {path: configPath, mimeType: "text/yaml"};
            } catch(error) {}
        } else {
            try {
                await access(this.path, fs.constants.F_OK);
                const mimeType: string | null = getType(this.path);
                if(!mimeType)
                    return null;
                return {path: this.path, mimeType};
            } catch(error) {}
        }
        return null;
    }

    public async getParams(): Promise<PackageConfigParams> {
        const info: PackageConfigInfo | null = await this.getInfo();
        if(info === null) {
            if(this.path !== null)
                throw new PackageException("Configuration file not found.");
            else return PackageConfigParams.getDefault();
        }
        const parser: PackageConfigParser | null = PackageConfig.getParser(info);
        if(parser === null)
            throw new PackageException("Configuration format not supported.");
        let params: PackageConfigParams;
        try {
            params = plainToClass(PackageConfigParams, parser(String(await readFile(info.path))));
        } catch(error) {
            throw new PackageConfigException((error as Error).message);
        }
        PackageConfig.throwValidationErrors(await validate(params));
        return params;
    }
}

export * from "./config-params";