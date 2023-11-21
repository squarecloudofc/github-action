import * as core from "@actions/core";
import { SquareCloudAPI } from "@squarecloud/api";
import { zipProject } from "./zip";

async function run(): Promise<void> {
  try {
    const token: string = core.getInput("token", { required: true });
    const id: string = core.getInput("application_id", { required: true });
    const restart: boolean = core.getBooleanInput("restart");
    const excludesString: string = core.getInput("excludes");
    const excludes = excludesString.trim() == "" ? [] : excludesString.trim().split(" ");

    const buffer = zipProject(excludes);

    const api = new SquareCloudAPI(token);
    const application = await api.applications.get(id);

    core.debug(`Application: ${JSON.stringify({ ...application, client: undefined, backup: undefined, deploys: undefined, files: undefined })}`);
    
    if (application == undefined) {
      core.setFailed("Square Cloud returned undefined");
      return;
    }

    await application.commit(buffer, "application.zip", restart);
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
    else core.setFailed("Unknown error");
  }
}

run();
