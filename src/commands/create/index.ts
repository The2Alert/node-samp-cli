import * as prompts from "prompts";
import * as chalk from "chalk";
import {join} from "path";
import {Logger} from "../../logger";
import {PackageConfigFormat, PackageCreateConfigOptions, PackageCreator, PackageLanguage, PackageSoftware} from "../../package";

export interface CreatePackagePromptsAnswers {
    name: string;
    language: PackageLanguage;
    usage: PackageSoftware[];
}

export interface CreatePackagePathPromptsAnswers {
    path: string;
}

export type CreateConfigPromptsAnswers = Omit<PackageCreateConfigOptions, "path">;

export class CreateCommand {
    public static action(): Promise<void> {
        const command = new CreateCommand;
        return command.action();
    }

    private constructor() {}

    public async action(): Promise<void> {
        const stepMax: number = 4;
        Logger.step({current: 1, max: stepMax}, "Creating package:");
        const packageAnswers = await prompts([
            {
                type: "text",
                name: "name",
                message: "Package name",
                initial: "my-server"
            },
            {
                type: "select",
                name: "language",
                message: "Programming language",
                choices: [
                    {title: chalk.blue("TypeScript"), value: PackageLanguage.TYPESCRIPT},
                    {title: chalk.yellow("JavaScript"), value: PackageLanguage.JAVASCRIPT}
                ]
            },
            {
                type: "multiselect",
                name: "usage",
                message: "Usage",
                choices: [
                    {title: chalk.red("Git"), value: PackageSoftware.GIT, selected: true},
                    {title: chalk.yellow("Prettier"), value: PackageSoftware.PRETTIER, selected: true},
                    {title: chalk.cyan("Docker"), value: PackageSoftware.DOCKER},
                    {title: chalk.green("Jest"), value: PackageSoftware.JEST}
                ]
            }
        ], {onCancel: () => process.exit()}) as CreatePackagePromptsAnswers;
        const packagePathAnswers = await prompts({
            type: "text",
            name: "path",
            message: "Path",
            initial: join(process.cwd(), packageAnswers.name)
        }) as CreatePackagePathPromptsAnswers;
        Logger.step({current: 2, max: stepMax}, "Creating configuration:");
        const configAnswers = await prompts([
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
            }
        ], {onCancel: () => process.exit()}) as CreateConfigPromptsAnswers;
        Logger.step({current: 3, max: stepMax}, "Creating files...");
        await PackageCreator.create({
            name: packageAnswers.name,
            language: packageAnswers.language,
            usage: {
                git: packageAnswers.usage.some((software) => software === PackageSoftware.GIT),
                prettier: packageAnswers.usage.some((software) => software === PackageSoftware.PRETTIER),
                docker: packageAnswers.usage.some((software) => software === PackageSoftware.DOCKER),
                jest: packageAnswers.usage.some((software) => software === PackageSoftware.JEST)
            },
            config: configAnswers,
            path: packagePathAnswers.path
        });
    }
}