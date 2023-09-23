import * as core from "@actions/core";
import FormData from "form-data";
import { SquareCloudAPI } from "@squarecloud/api";
import { zipProject } from "./zip";

async function run(): Promise<void> {
  try {
    const token: string = core.getInput("token", { required: true });
    const id: string = core.getInput("application_id", { required: true });
    const restart: boolean = core.getBooleanInput("restart");
    const exclusionsString: string = core.getInput("exclusions");
    const exclusions = exclusionsString.trim() == "" ? [] : exclusionsString.trim().split(" ");

    const buffer = zipProject(exclusions);

    const formadata = new FormData();
    formadata.append("file", buffer, { filename: "application.zip" });

    const api = new SquareCloudAPI(token);
    const application = await api.applications.get(id);

    core.debug(`Application: ${JSON.stringify(application)}`);
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

run();;
