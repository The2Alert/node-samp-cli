import * as chalk from "chalk";

export function error(error: Error): void {
    return console.log(chalk.red.bold("[Error]"), error.message);
}

export namespace config {
    export function error(error: Error): void {
        return console.log(chalk.yellow.bold("[Config]") + chalk.red.bold("[Error]"), error.message);
    }
}