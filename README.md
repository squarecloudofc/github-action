# Square Cloud Action
The easiest way to integrate your Square Cloud app with GIT, commit your app from github workflows.

# Usage

### Pre-requisites
Create a `.yml` workflow file in the `.github/workflows` directory. Here is an [example workflow](#example-workflow). If you want to know more about workflows, see the official GitHub Help Documentation on how to [create a workflow file](https://docs.github.com/en/actions/using-workflows#creating-a-workflow-file)

You also need to configure your GitHub secrets, of course, to not let your Token API be exposed. See how to [configure your GitHub secrets](#configuring-secrets).

### Inputs
- `token` - Your Square Cloud api token. Get your token from the [Square Cloud dashboard](https://squarecloud.app/dashboard/me) `Required`
- `application_id` - Your Square Cloud application ID. `Required`
- `restart` - After commit, does the application need to be restarted? `Optional`, `Default: False`
- `exclusions` - Files that shouldn't be uploaded to Square Cloud. (by default, includes `.git`) `Optional`

### Example Workflow
#### Uploading your application and restarting it
```yml
name: "Commit project to Square Cloud"
on: push

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: '0'
          
      - name: Commit to Square Cloud
        uses: squarecloudofc/github-action@v1.2.0
        with:
          restart: true
          token: '${{ secrets.SQUARE_TOKEN }}'
          application_id: '${{ secrets.SQUARE_APPLICATIONID }}'
```

#### Uploading your application with file exclusions
```yml
name: "Commit project to Square Cloud"
on: push

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: '0'
          
      - name: Commit to Square Cloud
        uses: squarecloudofc/github-action@v1.2.0
        with:
          token: '${{ secrets.SQUARE_TOKEN }}'
          application_id: '${{ secrets.SQUARE_APPLICATIONID }}'
          exclusions: '.vscode docs'
```

### Configuring Secrets
#### 1. Go to your repository where you want to configure the workflow
#### 2. Under your repository name, click **Settings**

![Settings tab](https://cdn.discordapp.com/attachments/646857534963056661/1071150086379274240/image.png)

#### 3. In the "Security" section of the sidebar, select **Secrets and varibles**, then click **Actions**

![Secrets and variables](https://cdn.discordapp.com/attachments/646857534963056661/1071150900455931925/image.png)

#### 4. In the **Secrets** tab, click **New repository secret**

<img src="https://media.discordapp.net/attachments/646857534963056661/1071152354491121754/image.png" height="180"></img>

#### 5. Type a name for your secret in the **Name** input box.
#### 6. Enter the value for your secret
#### 7. Click **Add secret.**
#### 8. And you're done, your Secrets are configured and you're ready to use the workflow

<img src="https://cdn.discordapp.com/attachments/646857534963056661/1071153498282004490/image.png" height="480"></img>

# Contributors
We are currently accepting all kinds of suggestions and contributions. All you have to do is open an Issue or a Pull Request!

Created with ❤ by [richaardev](https://github.com/richaardev)
