import * as core from "@actions/core";
import FormData from "form-data";
import { request } from "./request";
import { zipProject } from "./zip";

async function run(): Promise<void> {
  try {
    const token: string = core.getInput("token");
    const id: string = core.getInput("application_id");
    const restart: string = core.getInput("restart");

    const buffer = zipProject();

    const formadata = new FormData();
    formadata.append("file", buffer, { filename: "application.zip" });
    formadata.append("restart", restart);
    
    request("POST", "/commit/" + id, {
      headers: {
        Authorization: token,
        ...formadata.getHeaders()
      },
      body: formadata
    }).then((res) => {
      if (res.code != "SUCCESS") {
        core.setFailed(JSON.stringify(res))
      }
      
      console.log(res.message)
    });
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}

run();
