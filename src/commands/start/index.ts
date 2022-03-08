import {OptionValues} from "commander";
import {join} from "path";
import {Package, PackageError, PackageConfigError} from "../../package";
import {Logger} from "../../logger";

export interface StartCommandOptions {
    config: string | null;
    options: string | null;
}

export class StartCommand {
    public static action(path: string, options: OptionValues): Promise<void> {
        const command = new StartCommand(path, options);
        return command.action();
    }

    private constructor(public readonly path: string, private readonly options: OptionValues) {}

    public getOptions(): StartCommandOptions {
        const config: string | null = this.options.config ?? null;
        const options: string | null = this.options.options ?? null;
        return {config, options};
    }

    public async action(): Promise<void> {
        const options: StartCommandOptions = this.getOptions();
        const packagePath: string = join(process.cwd(), this.path);
        const serverPath: string = join(__dirname, "../../../server");
        let configPath: string | undefined;
        if(options.config !== null)
            configPath = join(packagePath, options.config);
        let nodeOptions: string | undefined;
        if(options.options !== null)
            nodeOptions = options.options;
        try {
            await Package.start({
                path: packagePath,
                serverPath,
                configPath,
                nodeOptions
            });
        } catch(error) {
            if(error instanceof PackageError)
                Logger.error(error);
            else if(error instanceof PackageConfigError)
                Logger.Config.error(error);
            else console.error(error);
        }
    }
}