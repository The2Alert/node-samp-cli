import {OptionValues, program} from "commander";
import {join} from "path";
import {Package, PackageException, PackageConfigException} from "../../package";
import {Logger} from "../../logger";

export class StartAction {
    public static action(path: string, options: OptionValues): Promise<void> {
        const action = new StartAction(path, options);
        return action.action();
    }

    private constructor(private readonly path: string, public readonly options: OptionValues) {}

    public async action(): Promise<void> {
        const packagePath: string = join(process.cwd(), this.path);
        const serverPath: string = join(__dirname, "../../../server");
        let configPath: string | undefined;
        if("config" in this.options)
            configPath = join(packagePath, this.options["config"]);
        try {
            await Package.start({
                path: packagePath,
                serverPath,
                configPath
            });
        } catch(error) {
            if(error instanceof PackageException)
                Logger.error(error);
            else if(error instanceof PackageConfigException)
                Logger.Config.error(error);
            else console.error(error);
        }
    }
}