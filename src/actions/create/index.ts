import {OptionValues, program} from "commander";
import * as prompts from "prompts";
import {PromptObject} from "prompts";
import * as chalk from "chalk";
import {PackageLanguage, PackageUsage} from "../../package/creator";

export interface PromptsAnswers {
    name?: string;
    language?: PackageLanguage;
    usage?: PackageUsage[];
}

export class CreateAction {
    public static action(options: OptionValues): Promise<void> {
        const action = new CreateAction(options);
        return action.action();
    }

    private constructor(public readonly options: OptionValues) {}

    public async action(): Promise<void> {
        // const name: string = this.options.name;
        // let language: PackageLanguage | undefined;
        // if(this.options.ts)
        //     language = PackageLanguage.TYPESCRIPT;
        // else if(this.options.js)
        //     language = PackageLanguage.JAVASCRIPT;
        // let usage: PackageUsage[] = [];
        // if(this.options.docker)
        //     usage.push(PackageUsage.DOCKER);
        // if(this.options.jest)
        //     usage.push(PackageUsage.JEST);
        // if(this.options.eslint)
        //     usage.push(PackageUsage.ESLINT);
        // if(this.options.prettier)
        //     usage.push(PackageUsage.PRETTIER);
        const questions: PromptObject[] = [];
        questions.push({
            type: "text",
            name: "name",
            message: "Package name",
            initial: "my-server"
        });
        questions.push({
            type: "select",
            name: "language",
            message: "Programming language",
            choices: [
                {title: chalk.blue.bold("TypeScript"), value: PackageLanguage.TYPESCRIPT},
                {title: chalk.yellow.bold("JavaScript"), value: PackageLanguage.JAVASCRIPT}
            ]
        });
        questions.push({
            type: "multiselect",
            name: "usage",
            message: "Usage",
            choices: [
                {title: chalk.cyan.bold("Docker"), value: PackageUsage.DOCKER},
                {title: chalk.green.bold("Jest"), value: PackageUsage.JEST},
                {title: chalk.blue.bold("ESLint"), value: PackageUsage.ESLINT, selected: true},
                {title: chalk.red.bold("Prettier"), value: PackageUsage.PRETTIER, selected: true}
            ]
        });
        const answers = await prompts(questions) as PromptsAnswers;
        console.log(answers);
    }
}