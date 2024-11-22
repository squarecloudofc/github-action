![Square Cloud](https://cdn.discordapp.com/attachments/994857159575740486/1309613607109263390/image.png?ex=67423837&is=6740e6b7&hm=9e79d237f95c317a0dfe1a4e2b559d4325db62f590afed0e7eab9a195488b694&)

# Square Cloud Action

The easiest way to integrate your Square Cloud app with GIT, commit your app from github workflows.

## Usage

### Pre-requisites

Create a `.yml` workflow file in the `.github/workflows` directory.
Here is an [example workflow](#example-workflow).
If you want to know more about workflows, see the official GitHub Help Documentation on how to [create a workflow file](https://docs.github.com/en/actions/using-workflows#creating-a-workflow-file)

You also need to configure your GitHub secrets, of course, to not let your Token API be exposed.

### Inputs

- `token` - Your Square Cloud api token. Get your token from the [Square Cloud dashboard](https://squarecloud.app/dashboard) `Required`
- `command` - The command you want to execute `Optional`
- `install-only` - In case you just want to install the CLI in your workflow `Optional`
- `workdir` - The directory you want to work with the Action `Optional`

### Example Workflow

##### Commiting your project to Square Cloud

Useful if you just want update the source code of your application

```yml
name: Publish
on:
  push:
    branches:
      - master
jobs:
  publish-production:
    name: Publish
    runs-on: ubuntu-latest
    steps:
      - name: Setup Square Cloud
        uses: squarecloudofc/github-action@v2
        # in the run command you can add the --restart flag to restart your application after the commit 
        with:
          run: commit ${{ secrets.SQUARE_APPLICATION_ID }}
          token: '${{ secrets.SQUARE_TOKEN }}'

```

# Contributors

We are currently accepting all kinds of suggestions and contributions. All you have to do is open an Issue or a Pull Request!
