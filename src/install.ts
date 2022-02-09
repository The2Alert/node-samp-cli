import {mkdir, writeFile, unlink, rmdir, chmod} from "fs/promises";
import * as download from "download";
import * as extract from "extract-zip";
import {join} from "path";
import {log} from "./logger";

export function downloadArchive(): Promise<Buffer> {
    if(process.platform === "win32")
        return download("https://github.com/dev2alert/node-samp/releases/download/1.0.0/server-win32.zip");
    else return download("https://github.com/dev2alert/node-samp/releases/download/1.0.0/server-linux.zip");
}

export async function install(): Promise<void> {
    log("Downloading...");
    const tmpPath: string = join(__dirname, "../tmp");
    const archivePath: string = join(tmpPath, "./server.zip");
    const serverPath: string = join(__dirname, "../server");
    await mkdir(tmpPath);
    const archive: Buffer = await downloadArchive();
    await writeFile(archivePath, archive);
    log("Extracting...");
    await extract(archivePath, {dir: serverPath});
    await unlink(archivePath);
    await rmdir(tmpPath);
    if(process.platform !== "win32") {
        await chmod(join(serverPath, "./samp03svr"), 0o777);
        await chmod(join(serverPath, "./announce"), 0o777);
    }
    log("Installed.");
}

install();