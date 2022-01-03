import {Type} from "class-transformer";
import {IsArray, IsBoolean, IsInt, IsOptional, IsString, IsUrl, ValidateNested} from "class-validator";
import {PluginParams} from "./plugin-params";

export class ConfigParams {
    @IsOptional()
    @IsBoolean()
    public lanMode?: boolean;

    @IsOptional()
    @IsInt()
    public maxPlayers?: number;
    
    @IsOptional()
    @IsBoolean()
    public announce?: boolean;

    @IsOptional()
    @IsBoolean()
    public query?: boolean;

    @IsOptional()
    @IsInt()
    public port?: number;

    @IsOptional()
    @IsString()
    public hostName?: string;

    @IsOptional()
    @IsUrl()
    public webUrl?: string;

    @IsOptional()
    @IsString()
    public rconPassword?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({each: true})
    @Type(() => PluginParams)
    public plugins?: PluginParams[];

    @IsOptional()
    @IsString()
    public pluginsPath: string = ".";

    @IsOptional()
    @IsString()
    public password?: string;

    @IsOptional()
    @IsString()
    public mapName?: string;

    @IsOptional()
    @IsString()
    public language?: string;

    @IsOptional()
    @IsString()
    public bind?: string;

    @IsOptional()
    @IsBoolean()
    public rcon?: boolean;

    @IsOptional()
    @IsInt()
    public maxNpc?: number;

    @IsOptional()
    @IsInt()
    public onfootRate?: number;

    @IsOptional()
    @IsInt()
    public incarRate?: number;

    @IsOptional()
    @IsInt()
    public weaponRate?: number; 

    @IsOptional()
    @IsInt()
    public streamDistance?: number;
    
    @IsOptional()
    @IsInt()
    public streamRate?: number;

    @IsOptional()
    @IsBoolean()
    public timeStamp?: boolean;

    @IsOptional()
    @IsBoolean()
    public logQueries?: boolean;

    @IsOptional()
    @IsString()
    public logTimeFormat?: string;

    @IsOptional()
    @IsBoolean()
    public output?: boolean;

    @IsOptional()
    @IsString()
    public gameModeText?: string;

    @IsOptional()
    @IsBoolean()
    public chatLogging?: boolean;

    @IsOptional()
    @IsInt()
    public messageHoleLimit?: number;

    @IsOptional()
    @IsInt()
    public messagesLimit?: number;

    @IsOptional()
    @IsInt()
    public lagcompMode?: number;

    @IsOptional()
    @IsInt()
    public acksLimit?: number;

    @IsOptional()
    @IsInt()
    public playerTimeout?: number;

    @IsOptional()
    @IsInt()
    public minConnectionTime?: number;

    @IsOptional()
    @IsInt()
    public connseedTime?: number;

    @IsOptional()
    @IsInt()
    public sleep?: number;

    @IsOptional()
    @IsBoolean()
    public connCookies?: boolean;

    @IsOptional()
    @IsBoolean()
    public cookieLogging?: boolean;

    @IsOptional()
    @IsString()
    public nodeOptions?: string;
}