import {Type} from "class-transformer";
import {IsOptional, IsString, ValidateNested} from "class-validator";
import {IsPluginParams, PluginParams} from "./plugin-params";

export class PackageConfigSampParams {
    @IsOptional()
    @IsPluginParams()
    public plugins: (string | PluginParams)[] = [];

    @IsOptional()
    @IsString()
    public pluginsPath: string = "./plugins";
}

export class PackageConfigParams {
    @IsOptional()
    @ValidateNested()
    @Type(() => PackageConfigSampParams)
    public samp: PackageConfigSampParams = new PackageConfigSampParams;
}

export class PackageParams {
    @IsOptional()
    @ValidateNested()
    @Type(() => PackageConfigParams)
    public config: PackageConfigParams = new PackageConfigParams;
}