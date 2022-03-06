import {Type} from "class-transformer";
import {IsOptional, IsString, ValidateNested} from "class-validator";
import {IsPluginParams, PackagePluginParams} from "./plugin-params";

export class PackagePluginPackageConfigSampParams {
    @IsOptional()
    @IsPluginParams()
    public plugins?: (string | PackagePluginParams)[];

    @IsOptional()
    @IsString()
    public pluginsPath?: string;
}

export class PackagePluginPackageConfigParams {
    @IsOptional()
    @ValidateNested()
    @Type(() => PackagePluginPackageConfigSampParams)
    public samp?: PackagePluginPackageConfigSampParams;
}

export class PackagePluginPackageParams {
    @IsOptional()
    @ValidateNested()
    @Type(() => PackagePluginPackageConfigParams)
    public config?: PackagePluginPackageConfigParams;
}