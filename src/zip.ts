import AdmZip from "adm-zip";
import fg from "fast-glob";
import { readdirSync, readFileSync } from "fs";
import { resolve } from "path";

const defaultExclusions = [".git"];

export function zipProject(excludes: string[] = []): Buffer {
  let files = fg.sync("**", { ignore: [...defaultExclusions, ...excludes] });
  let zip = new AdmZip();
  files.forEach((file) => zip.addFile(file, readFileSync(resolve(file))));

  return zip.toBuffer();
}
