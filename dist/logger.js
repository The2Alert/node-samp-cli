"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.error = exports.log = void 0;
const chalk = require("chalk");
function log(content) {
    return console.log(chalk.yellow.bold("[NodeSamp]"), content);
}
exports.log = log;
function error(error) {
    return console.log(chalk.yellow.bold("[NodeSamp]") + chalk.red.bold("[Error]"), error.message);
}
exports.error = error;
var config;
(function (config) {
    function error(error) {
        return console.log(chalk.yellow.bold("[Config]") + chalk.red.bold("[Error]"), error.message);
    }
    config.error = error;
})(config = exports.config || (exports.config = {}));
