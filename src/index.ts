#!/usr/bin/env node
import {program} from "commander";
import {Root} from "./actions/root";

program
.name("nodesamp")
.usage("<path> [options]")
.description("Run the package in the SA-MP environment.")
.argument("<path>", "Package path.")
.option("-c, --config <path>", "Configuration path.")
.option("-o, --options <list>", "Node.js options.")
.version(
    require("../package.json").version,
    "-v, --version", 
    "Print the current version."   
)
.helpOption("-h, --help", "Print usage information.")
.action((packagePath) => Root.create(packagePath).action());

program.parse(process.argv);