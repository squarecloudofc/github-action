import * as core from "@actions/core";
import FormData from "form-data";
import { ApiResponse, request } from "./request";
import { zipProject } from "./zip";

async function run(): Promise<void> {
  try {
    const token: string = core.getInput("token", { required: true });
    const id: string = core.getInput("application_id", { required: true });
    const restart: boolean = core.getBooleanInput("restart");
    const exclusionsString: string = core.getInput("exclusions");
    const exclusions = exclusionsString.trim() == "" ? [] : exclusionsString.trim().split(" ")

    const buffer = zipProject(exclusions);

    const formadata = new FormData();
    formadata.append("file", buffer, { filename: "application.zip" });

    request("POST", `/commit/${id}?restart=${restart}`, {
      headers: {
        Authorization: token,
        ...formadata.getHeaders(),
      },
      body: formadata,
    }).then((res) => {
      core.debug(JSON.stringify(res));
      if (res.code != "SUCCESS") {
        console.log(JSON.stringify(res))
        core.setFailed(`Square Cloud returned code: ${res.code}`);
      }

      console.log(res.message);
    }).catch((err) => core.setFailed(err));
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}

run();
