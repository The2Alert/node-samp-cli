#!/usr/bin/env node
import {program} from "commander";
import {CreateAction} from "./actions/create";
import {StartAction} from "./actions/start";

program
.name("nodesamp")
.usage("<path> [options]")
.description("Run package in SA-MP environment.")
.argument("<path>", "Package path.")
.option("-c, --config <path>", "Configuration path.")
.option("-o, --options <list>", "Node.js options.")
.version(require("../package.json").version, "-v, --version", "Display current version.")
.helpOption("-h, --help", "Display usage information.")
.action((path, options) => StartAction.action(path, options));

program
.command("create")
.description("Create package.")
.option("-n, --name <name>", "Package name.")
.option("-t, --ts", "Usage TypeScript.")
.option("-j, --js", "Usage JavaScript.")
.option("--docker", "Usage Docker.")
.option("--jest", "Usage Jest.")
.option("--eslint", "Usage ESLint.")
.option("--prettier", "Usage Prettier.")
.action((options) => CreateAction.action(options));

program
.parse(process.argv);