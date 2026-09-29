import * as core from "@actions/core";
import os from "node:os";

export interface ActionInputs {
  token: string;
  command: string;
  version: string;
  workdir: string;
  installOnly: boolean;
}

export function getInputs(): ActionInputs {
  return {
    token: core.getInput("token", { required: true }),
    command: core.getInput("command"),
    version: core.getInput("version") || "latest",
    // Up to 2.1.2 the code read `cwd` instead of the documented `workdir`.
    workdir: core.getInput("workdir") || core.getInput("cwd") || ".",
    installOnly: core.getBooleanInput("install-only"),
  };
}

// Node's names for the runner, as the CLI release archives spell them.
const PLATFORMS: Record<string, string> = {
  linux: "linux",
  darwin: "darwin",
  win32: "windows",
};
const ARCHS: Record<string, string> = {
  x64: "amd64",
  arm64: "arm64",
  ia32: "386",
  arm: "armv7",
};

/** The CLI release archive for a runner, e.g. `squarecloud_linux_amd64.tar.gz`. */
export function assetName(platform: string = os.platform(), arch: string = os.arch()): string {
  const system = PLATFORMS[platform];
  const cpu = ARCHS[arch];
  if (!system || !cpu) {
    throw new Error(`The Square Cloud CLI has no build for ${platform} on ${arch}.`);
  }
  return `squarecloud_${system}_${cpu}.${system === "windows" ? "zip" : "tar.gz"}`;
}

/** Returns `version` if the CLI reads its key from SQUARECLOUD_API_KEY, added in 3.1.0. */
export function checkVersion(version: string): string {
  const [major, minor] = version.split(".").map(Number);
  if (major < 3 || (major === 3 && minor < 1)) {
    throw new Error(`This action needs Square Cloud CLI 3.1.0 or later; ${version} does not read SQUARECLOUD_API_KEY.`);
  }
  return version;
}

/** The expected SHA-256 of `asset` in a goreleaser `checksums.txt`. */
export function checksumOf(checksums: string, asset: string): string | undefined {
  for (const line of checksums.split("\n")) {
    const [hash, name] = line.trim().split(/\s+/);
    if (name === asset) return hash;
  }
  return undefined;
}
