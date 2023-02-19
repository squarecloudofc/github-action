import type { RequestInit } from "node-fetch";
import fetch from "node-fetch";

const API_VERSION = "v1";
const BASE_URL = `https://api.squarecloud.app/${API_VERSION}/public`;

export interface ApiResponse {
  status: string;
  code: string;
  message: string;
}

export function request(method: string, path: string, options: RequestInit): Promise<ApiResponse> {
  return fetch(BASE_URL + path, {
    method,
    redirect: "follow",
    ...options,
  }).then(async (response) => {
    const contentType = response.headers.get("Content-Type");
    if (!contentType || !contentType.includes("application/json")) {
      console.log(response)
      throw new Error(`Returned code ${response.status}, but response is not a json`);
    }

    return response.json() as Promise<ApiResponse>;
  });
}
