import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";
import { createHash, randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { assetName, checkVersion, checksumOf } from "./context.js";

const RELEASES = "https://github.com/squarecloudofc/cli/releases";

/**
 * `latest` becomes the newest release's version. The releases page redirects
 * to it, so no GitHub API call (and no API rate limit) is involved.
 */
export async function resolveVersion(version: string): Promise<string> {
  if (version !== "latest") return checkVersion(version.replace(/^v/, ""));

  const response = await fetch(`${RELEASES}/latest`, { redirect: "manual" });
  const tag = response.headers.get("location")?.split("/tag/")[1];
  if (!tag) throw new Error("Could not find the latest Square Cloud CLI release.");
  return tag.replace(/^v/, "");
}

/**
 * Installs the CLI for this runner, checked against the release checksums,
 * and returns the path of the binary.
 */
export async function install(version: string): Promise<string> {
  const asset = assetName();
  const binary = process.platform === "win32" ? "squarecloud.exe" : "squarecloud";

  // Self-hosted runners keep their tool cache between jobs.
  const cached = tc.find("squarecloud", version);
  if (cached) return join(cached, binary);

  const base = `${RELEASES}/download/v${version}`;
  core.info(`Downloading ${base}/${asset}`);
  // Keep the archive's own name: Windows PowerShell only expands a `.zip`.
  const temp = join(process.env.RUNNER_TEMP ?? tmpdir(), randomUUID());
  const archive = await tc.downloadTool(`${base}/${asset}`, join(temp, asset));
  const checksums = await readFile(await tc.downloadTool(`${base}/checksums.txt`), "utf8");

  const expected = checksumOf(checksums, asset);
  const actual = createHash("sha256").update(await readFile(archive)).digest("hex");
  if (expected !== actual) {
    throw new Error(`${asset} does not match the release checksums; it was not installed.`);
  }

  const folder = asset.endsWith(".zip") ? await tc.extractZip(archive) : await tc.extractTar(archive);
  return join(await tc.cacheDir(folder, "squarecloud", version), binary);
}
