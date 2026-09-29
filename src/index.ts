import * as core from "@actions/core";
import * as exec from "@actions/exec";
import { dirname } from "node:path";

import { install, resolveVersion } from "./cli.js";
import { getInputs } from "./context.js";

async function run(): Promise<void> {
  const { token, command, version, workdir, installOnly } = getInputs();
  core.setSecret(token);

  const resolved = await resolveVersion(version);
  const binary = await install(resolved);
  core.addPath(dirname(binary));
  core.info(`Square Cloud CLI ${resolved} is on the PATH`);

  // The CLI reads its key from this variable: nothing is written to the
  // runner's disk, and later steps of this job can run `squarecloud` too.
  core.exportVariable("SQUARECLOUD_API_KEY", token);

  if (installOnly) return;
  if (!command) {
    core.warning("No `command` given: the CLI is installed, nothing was run.");
    return;
  }

  await exec.exec(`"${binary}" ${command}`, [], { cwd: workdir });
}

run().catch((error: unknown) => {
  core.setFailed(error instanceof Error ? error.message : String(error));
});
