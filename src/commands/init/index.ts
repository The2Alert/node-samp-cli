import * as prompts from "prompts";
import * as chalk from "chalk";
import {PackageConfigFormat, PackageCreator, PackageCreateConfigOptions, PackageError} from "../../package";
import {Logger} from "../../logger";

export class InitCommand {
    public static action(): Promise<void> {
        const command = new InitCommand;
        return command.action();
    }

    private constructor() {}

    public async action(): Promise<void> {
        const options = await prompts([
            {
                type: "text",
                name: "hostName",
                message: "Host name",
                initial: "Node.js Server"
            },
            {
                type: "number",
                name: "maxPlayers",
                message: "Max players",
                initial: 1000
            },
            {
                type: "text",
                name: "maxNpc",
                message: "Max npc",
                initial: 1
            },
            {
                type: "number",
                name: "port",
                message: "Port",
                initial: 7777
            },
            {
                type: "text",
                name: "webUrl",
                message: "Web url"
            },
            {
                type: "password",
                name: "password",
                message: "Password"
            },
            {
                type: "password",
                name: "rconPassword",
                message: "Rcon password"
            },
            {
                type: "text",
                name: "mapName",
                message: "Map name"
            },
            {
                type: "text",
                name: "language",
                message: "Language"
            },
            {
                type: "select",
                name: "format",
                message: "Format",
                initial: PackageConfigFormat.YAML,
                choices: [
                    {title: chalk.yellow("JSON"), value: PackageConfigFormat.JSON},
                    {title: chalk.yellow("JSON5"), value: PackageConfigFormat.JSON5},
                    {title: chalk.red("YAML"), value: PackageConfigFormat.YAML}
                ]
            },
            {
                type: "text",
                name: "path",
                message: "Path",
                initial: process.cwd()   
            }
        ], {onCancel: () => process.exit()}) as PackageCreateConfigOptions;
        try {
            await PackageCreator.createConfig(options);
            Logger.log("Configuration file created.");
        } catch(error) {
            if(error instanceof PackageError)
                Logger.error(error);
            else console.error(error);
        }
    }
}