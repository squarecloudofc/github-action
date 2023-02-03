import type { RequestInit } from "node-fetch";
import fetch from "node-fetch";

const API_VERSION = "v1";
const BASE_URL = `https://api.squarecloud.app/${API_VERSION}/public/`;

interface ApiResponse {
  status: string;
  code: string;
  message: string;
}

export function request<T extends ApiResponse>(
  method: string,
  path: string,
  options: RequestInit,
): Promise<T> {
  return fetch(BASE_URL + path, {
    method,
    ...options,
  }).then(async (response) => {
    return (await response.json()) as T;
  });
}
