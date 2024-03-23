import { downloadTool, extractTar, cacheDir } from "@actions/tool-cache";
import { info } from "@actions/core";
import { Octokit } from "@octokit/rest";

import { join } from "node:path/posix";

import { getArch, getPlatform } from "./context";


export async function install(): Promise<string> {
  const currentArch = getArch()
  const currentPlatform = getPlatform()

  const releaseFileExt = currentArch === "win32" ? "zip" : "tar.gz"
  const binFileExt = currentArch === "win32" ? ".exe" : ""

  const octo = new Octokit()
  const latestRelease = await octo.repos.getLatestRelease({
    owner: "squarecloudofc",
    repo: "cli",
  })

  const releaseTag = latestRelease.data.tag_name
  const downloadUrl = `https://github.com/squarecloudofc/cli/releases/download/${releaseTag}/squarecloud_${currentPlatform}_${currentArch}.${releaseFileExt}`

  info(`Downloading ${downloadUrl}`)
  const downloadedPath = await downloadTool(downloadUrl)
  info(`Downloaded successfully to ${downloadedPath}`)

  const path = await extractTar(downloadedPath)
  info(`Successfully extracted ${path}`)

  const cachePath = await cacheDir(path, 'squarecloud-action', releaseTag.replace(/^v/, ''));
  info(`Cached ${cachePath}`)

  const binFile = join(cachePath, `squarecloud${binFileExt}`)
  return binFile
}


