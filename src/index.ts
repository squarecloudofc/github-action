import * as core from "@actions/core";
import * as exec from "@actions/exec";

import { getInputs } from "./context";
import { install } from "./cli";
import { dirname } from "path";

async function run(): Promise<void> {
  try {
    const { workdir: cwd, command, token, installOnly } = getInputs()

    const cliBinary = await install()
    core.info(`CLI Installed successfully`)

    if (cwd && cwd != ".") {
      core.info(`Using ${cwd} as Current Working Directory`)
      process.chdir(cwd)
    }

    await exec.exec(`${cliBinary} auth login --token=${token}`)
    core.debug(`Successfully logged to Square Cloud`)

    core.addPath(dirname(cliBinary))
    core.debug(`Added ${cliBinary} to path`)

    if (installOnly) return

    await exec.exec(`${cliBinary} ${command}`)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
    else core.setFailed("Unknown error");
  }
}

run();
