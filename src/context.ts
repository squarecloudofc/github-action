import * as core from "@actions/core";
import os from "node:os";

export interface ActionInputs {
  token: string;
  command: string;
  workdir: string;
}

export function getInputs(): ActionInputs {
  return {
    token: core.getInput("token", { required: true }),
    command: core.getInput("command", { required: true }),
    workdir: core.getInput("cwd") || ".",
  }
}

const supportedPlatforms = ["linux", "darwin", "win32"]
const supportedArchs = ["amd64", "arm"]

export function getPlatform(): string {
  const platform = os.platform()
  if (!supportedPlatforms.includes(platform)) {
    throw new Error(`Unsupported platform: ${platform}`)
  }

  return platform
}

export function getArch(): string {
  const arch = os.arch()
  if (!supportedArchs.includes(arch)) {
    throw new Error(`Unsupported architecture: ${arch}`)
  }

  if (arch === "x64") {
    return "amd64"
  }

  return arch
}
