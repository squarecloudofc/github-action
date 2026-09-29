<div align="center">
  <img alt="Square Cloud Banner" src="https://cdn.squarecloud.app/png/github-readme.png">
</div>

<h1 align="center">Square Cloud Action</h1>

<p align="center">Deploy to Square Cloud from GitHub Actions. The action installs the <a href="https://github.com/squarecloudofc/cli">Square Cloud CLI</a> on the runner and runs any of its commands.</p>

## Quick start

1. Create an API key at [squarecloud.app/account/security](https://squarecloud.app/account/security) and save it as a repository secret named `SQUARECLOUD_API_KEY` (Settings > Secrets and variables > Actions > Secrets).
2. Copy your application ID from its dashboard page, or from `squarecloud app list`, and save it as a repository variable named `SQUARECLOUD_APP_ID` (same page, Variables tab).
3. Add this workflow as `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7

      - uses: squarecloudofc/github-action@v2
        with:
          token: ${{ secrets.SQUARECLOUD_API_KEY }}
          command: commit ${{ vars.SQUARECLOUD_APP_ID }} --restart
```

Every push to `main` now sends the repository to your application and restarts it. Keep the `actions/checkout` step: without it, the runner has no files to send.

## Inputs

| Input | Required | Default | Description |
| ----- | -------- | ------- | ----------- |
| `token` | yes | | Square Cloud API key. Keep it in a secret. |
| `command` | no | | CLI command to run, without the `squarecloud` prefix, for example `commit <app id> --restart`. |
| `version` | no | `latest` | CLI version to install: `latest`, or a version from 3.1.0 on, such as `3.1.0`. |
| `workdir` | no | `.` | Folder the command runs in, relative to the repository root. |
| `install-only` | no | `false` | Only install the CLI, to run it in later steps. |

## What the action does

1. Downloads the CLI build for the runner's system from the [CLI releases](https://github.com/squarecloudofc/cli/releases), checks it against the release's `checksums.txt` and adds it to the `PATH`. Self-hosted runners keep it in their tool cache.
2. Masks the key in the logs and sets `SQUARECLOUD_API_KEY` for the rest of the job. The CLI reads the key from this variable, so nothing is written to the runner's disk.
3. Runs `squarecloud <command>` in `workdir`. If the command fails, the step fails.

## Examples

Snippets that are not a full workflow show only the steps; keep `actions/checkout` before them.

### Staging and production

Pushes to `main` go to production and pushes to `develop` to staging. The run button in the Actions tab deploys the chosen branch by hand, and `concurrency` makes deploys of the same branch wait for each other instead of overlapping.

```yaml
name: Deploy

on:
  push:
    branches: [main, develop]
  workflow_dispatch:

concurrency:
  group: deploy-${{ github.ref_name }}

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7

      - uses: squarecloudofc/github-action@v2
        with:
          token: ${{ secrets.SQUARECLOUD_API_KEY }}
          command: commit ${{ github.ref_name == 'main' && vars.PRODUCTION_APP_ID || vars.STAGING_APP_ID }} --restart
```

### Several applications in one repository

Each folder is its own application, with its own `squarecloud.app` and `squarecloud.ignore`. `fail-fast: false` keeps one failed deploy from cancelling the others.

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        include:
          - folder: bot
            app: ${{ vars.BOT_APP_ID }}
          - folder: website
            app: ${{ vars.WEBSITE_APP_ID }}
    steps:
      - uses: actions/checkout@v7

      - uses: squarecloudofc/github-action@v2
        with:
          token: ${{ secrets.SQUARECLOUD_API_KEY }}
          workdir: ${{ matrix.folder }}
          command: commit ${{ matrix.app }} --restart
```

### Deploy when a release is published

Only the code of a published release reaches the application; pushes and drafts do not.

```yaml
name: Deploy

on:
  release:
    types: [published]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7

      - uses: squarecloudofc/github-action@v2
        with:
          token: ${{ secrets.SQUARECLOUD_API_KEY }}
          command: commit ${{ vars.SQUARECLOUD_APP_ID }} --restart
```

### Deploy a subfolder with a pinned CLI version

```yaml
- uses: squarecloudofc/github-action@v2
  with:
    token: ${{ secrets.SQUARECLOUD_API_KEY }}
    version: 3.1.0
    workdir: bot
    command: commit ${{ vars.SQUARECLOUD_APP_ID }} --restart
```

### Run several commands

With `install-only`, the CLI and its key stay available to the next steps of the job:

```yaml
- uses: squarecloudofc/github-action@v2
  with:
    token: ${{ secrets.SQUARECLOUD_API_KEY }}
    install-only: true

- run: npm ci && npm run build

- run: squarecloud commit ${{ vars.SQUARECLOUD_APP_ID }} --restart

- run: squarecloud app status ${{ vars.SQUARECLOUD_APP_ID }} --json
```

## Choosing what gets uploaded

`commit`, `upload` and `zip` send the folder without what `squarecloud.ignore`, in the folder's root, lists. It uses gitignore syntax, and `.gitignore` itself is not read.

The CLI always leaves out `node_modules`, `.git`, `.github`, `.vscode`, `package-lock.json`, `pnpm-lock.yaml` and `yarn.lock`. To send one of them, re-include it with `!`:

```gitignore
.env
*.log
!package-lock.json
```

The [CLI documentation](https://github.com/squarecloudofc/cli#ignoring-files) has the full rules.

## Running the CLI in a workflow

- `commit --restart` restarts the application after the upload, and starts it if it was stopped. Without `--restart`, the new files only run after the next restart.
- `commit` without an application ID uses the `ID=` line of the `squarecloud.app` in `workdir`, so `command: commit --restart` is enough once that line is there.
- Commands that change or delete data (`app delete`, `env replace`, `snapshot restore`, ...) ask for confirmation. A workflow has no terminal to answer, so add `-y`; without it, the command exits with code 1 and changes nothing.
- Commands that print data accept `--json` for machine-readable output.
- To trace each API request, set `SQUARECLOUD_DEBUG: 1` in the step's `env`. The trace shows method, path, status and duration, never headers or bodies.

## Supported runners

GitHub-hosted Linux, Windows and macOS runners, on x64 and arm64. Self-hosted runners also work on Linux (x64, arm64, x86, ARMv7), Windows (x64, arm64, x86) and macOS (Intel and Apple silicon), with a runner version that supports `node24` actions.

## Security

- Keep the key in a secret, never in the workflow file. The action masks it in the logs.
- Give each repository its own key, so you can revoke one without touching the others.
- Later steps of the same job can read `SQUARECLOUD_API_KEY`; other jobs cannot. Run actions you do not trust in a separate job.
- A CLI download that does not match the release checksums is never run.

## Upgrading from 2.1

`@v2` now points to this version, so your workflow keeps working unchanged. What changed:

- `workdir` is applied. Up to 2.1.2 it was ignored and commands ran in the repository root.
- The key is no longer passed on the command line or saved on the runner. The CLI reads it from `SQUARECLOUD_API_KEY`.
- Windows, macOS and arm64 runners are supported.
- The CLI download is checked against its checksums, and the new `version` input pins it.
- Finding the latest CLI no longer calls the GitHub API, so it is not affected by the API rate limit.
- The action runs on Node 24.

CLI 3.1 also leaves lockfiles out of uploads; add `!package-lock.json` (or your lockfile) to `squarecloud.ignore` to keep sending it.

## Contributing

Issues and pull requests are welcome. After changing `src/`, run:

```bash
npm ci
npm test
npm run build
```

Commit the rebuilt `dist/` with your change; the Check dist workflow fails when it is out of date.
