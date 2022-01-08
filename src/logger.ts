import * as chalk from "chalk";

export function log(content: string): void {
    return console.log(chalk.yellow.bold("[NodeSamp]"), content);
}

export function error(error: Error): void {
    return console.log(chalk.yellow.bold("[NodeSamp]") + chalk.red.bold("[Error]"), error.message);
}

export namespace config {
    export function error(error: Error): void {
        return console.log(chalk.yellow.bold("[Config]") + chalk.red.bold("[Error]"), error.message);
    }
}