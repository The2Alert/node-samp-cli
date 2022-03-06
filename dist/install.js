"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.install = exports.downloadArchive = void 0;
const promises_1 = require("fs/promises");
const download = require("download");
const extract = require("extract-zip");
const path_1 = require("path");
const logger_1 = require("./logger");
function downloadArchive() {
    if (process.platform === "win32")
        return download("https://github.com/dev2alert/node-samp/releases/download/1.0.0/server-win32.zip");
    else
        return download("https://github.com/dev2alert/node-samp/releases/download/1.0.0/server-linux.zip");
}
exports.downloadArchive = downloadArchive;
async function install() {
    logger_1.Logger.log("Downloading...");
    const tmpPath = (0, path_1.join)(__dirname, "../tmp");
    const archivePath = (0, path_1.join)(tmpPath, "./server.zip");
    const serverPath = (0, path_1.join)(__dirname, "../server");
    await (0, promises_1.mkdir)(tmpPath);
    const archive = await downloadArchive();
    await (0, promises_1.writeFile)(archivePath, archive);
    logger_1.Logger.log("Extracting...");
    await extract(archivePath, { dir: serverPath });
    await (0, promises_1.unlink)(archivePath);
    await (0, promises_1.rmdir)(tmpPath);
    if (process.platform !== "win32") {
        await (0, promises_1.chmod)((0, path_1.join)(serverPath, "./samp03svr"), 0o777);
        await (0, promises_1.chmod)((0, path_1.join)(serverPath, "./announce"), 0o777);
    }
    logger_1.Logger.log("Installed.");
}
exports.install = install;
install();
