import {IsString} from "class-validator";

export class PluginParams {
    @IsString()
    public platform: string;

    @IsString()
    public path: string;
}