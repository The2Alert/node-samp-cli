#!/usr/bin/env node
import {program} from "commander";
import {StartCommand} from "./commands/start";
import {InitCommand} from "./commands/init";
import {CreateCommand} from "./commands/create";

program
.name("nodesamp")
.usage("<path> [options]")
.description("Run package in SA-MP environment.")
.argument("<path>", "Package path.")
.option("-c, --config <path>", "Configuration path.")
.option("-o, --options <options>", "Node.js options.")
.version(require("../package.json").version, "-v, --version", "Display current version.")
.helpOption("-h, --help", "Display usage information.")
.action((path, options) => StartCommand.action(path, options));

program
.command("init")
.description("Create configuration file.")
.action(() => InitCommand.action());

program
.command("create")
.description("Create package.")
.action(() => CreateCommand.action());

program.parse(process.argv);