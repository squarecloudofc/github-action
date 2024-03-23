import * as core from "@actions/core";
import * as exec from "@actions/exec";

import { getInputs } from "./context";
import { install } from "./cli";

async function run(): Promise<void> {
  try {
    const { cwd, command, token } = getInputs()

    const cliBinary = await install()
    core.info(`CLI Installed successfully`)

    if (cwd && cwd != ".") {
      core.info(`Using ${cwd} as Current Working Directory`)
      process.chdir(cwd)
    }

    await exec.exec(`${cliBinary} --token=${token} ${command}`)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
    else core.setFailed("Unknown error");
  }
}

run();
