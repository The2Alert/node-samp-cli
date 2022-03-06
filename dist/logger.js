"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const chalk = require("chalk");
var Logger;
(function (Logger) {
    function log(content) {
        console.log(chalk.yellow.bold("[NodeSamp]"), content);
    }
    Logger.log = log;
    function error(error) {
        console.log(chalk.yellow.bold("[NodeSamp]") + chalk.red.bold("[Error]"), error.message);
    }
    Logger.error = error;
    let Config;
    (function (Config) {
        function error(error) {
            console.log(chalk.yellow.bold("[Config]") + chalk.red.bold("[Error]"), error.message);
        }
        Config.error = error;
    })(Config = Logger.Config || (Logger.Config = {}));
})(Logger = exports.Logger || (exports.Logger = {}));
