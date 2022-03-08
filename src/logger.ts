import * as chalk from "chalk";

export namespace Logger {
    export interface StepOptions {
        current: number;
        max: number;
    }

    export function log(content: string): void {
        console.log(chalk.yellow.bold("[NodeSamp]"), content);
    }

    export function error(error: Error): void {
        console.log(chalk.yellow.bold("[NodeSamp]") + chalk.red.bold("[Error]"), error.message);
    }

    export function step({current, max}: StepOptions, content: string): void {
        console.log(chalk.yellow.bold("[NodeSamp]") + chalk.white.bold(`[${current}/${max}]`), content);
    }

    export namespace Config {
        export function error(error: Error): void {
            console.log(chalk.yellow.bold("[Config]") + chalk.red.bold("[Error]"), error.message);
        }
    }
}