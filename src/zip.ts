import AdmZip from "adm-zip";
import fg from "fast-glob";
import { readFileSync } from "fs";
import { resolve } from "path";

const defaultExcludes = [".git"];

export function zipProject(excludes: string[] = []): Buffer {
  let files = fg.sync("**", { ignore: [...defaultExcludes, ...excludes] });
  let zip = new AdmZip();
  files.forEach((file) => zip.addFile(file, readFileSync(resolve(file))));

  return zip.toBuffer();
}
