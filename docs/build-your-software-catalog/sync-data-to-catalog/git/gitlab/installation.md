---
sidebar_position: 1
---

# Installation

:::note Prerequisites

- A gitlab account with admin privileges;
- A gitlab group account with `api` privileges (Refer to the [permissions](./gitlab.md#permissions) section for more information);
- A kubernetes cluster to install the integration on;
- Your Port user role is set to `Admin`.

:::

1. Sign in to GitLab and go to your desired group's settings:

   ![GitLab group settings](../../../../../static/img/integrations/gitlab/GitLabGroupSettings.png)

2. In the "Access Tokens" section, you need to provide the token details, including the name and an optional expiration date. Additionally, select the api scope, and then proceed to click on the "Create access token" button.

   ![GitLab group access tokens](../../../../../static/img/integrations/gitlab/GitLabGroupAccessTokens.png)

3. Click "Create group access token";
4. Copy the generated token and use it when deploying the integration in the following steps;
5. Click the ingest button in Port Builder Page for the blueprint you want to ingest using GitLab:

   ![DevPortal Builder ingest button](../../../../../static/img/integrations/gitlab/DevPortalBuilderIngestButton.png)

6. Select GitLab under the Git providers category:

   ![DevPortal Builder GitLab option](../../../../../static/img/integrations/gitlab/DevPortalBuilderGitLabOption.png)

7. Copy the helm installation command and set the [required configuration](#configuring-the-gitlab-integration);

8. Run the helm command with the updated parameters to install the integration in your Kubernetes cluster.

## Self-hosted GitLab

In case you are using a self-hosted GitLab instance, you need to add the following line to your helm installation command:

```bash showLineNumbers
	--set integration.config.gitlabHost="https://you-gitlab-url"
```

## Configuring the GitLab integration

### tokenMapping

The GitLab integration support fetching data related to specific paths in your GitLab groups. The integration is also able to fetch data from different GitLab parent groups by providing additional group tokens. In order to do so, you need to map the desired paths to the relevant access tokens.
The `tokenMapping` parameter supports specifying the paths that the integration will search for files and information in, using [globPatterns](https://www.malikbrowne.com/blog/a-beginners-guide-glob-patterns).

Mapping format:

```showLineNumbers
{"MY_FIRST_GITLAB_PROJECT_GROUP_TOKEN": ["*/MyFirstGitLabProject/**", "*/MySecondGitLabProject/*"]}
```

Example:

```showLineNumbers
{"glpat-QXbeg-Ev9xtu5_5FsaAQ": ["*/DevopsTeam/*Service", "*/RnDTeam/*Service"]}
```

### appHost

In order for the GitLab integration to update the data in Port on every change in the GitLab repository, you need to specify the `appHost` parameter.
The `appHost` parameter should be set to the `url` of your GitLab integration instance. In addition, your GitLab instance (whether it is GItLab SaaS or a self-hosted version of GitLab) needs to have the option to send webhook requests to the Gitlab integration instance, so please configure your network accordingly.

### Hooks

The Gitlab integration supports listening to Gitlab webhooks and updating the relevant entities in Port accordingly.

Supported webhooks are [Group webhooks](https://docs.gitlab.com/ee/user/project/integrations/webhooks.html#group-webhooks) and [System hooks](https://docs.gitlab.com/ee/system_hooks/system_hooks.html).

As part of the installation process, the integration will create a webhook in your Gitlab instance, and will use it to listen to the relevant events.

**_There are a few points to consider before deciding on which webhook to choose_**:

- If you choose group webhooks, the integration will create a webhook for each group in your Gitlab instance. If you choose system hooks, the integration will create a single webhook for the entire Gitlab instance.
- The system hooks has much less event types than the group webhooks.

  - Group Webhooks supported event types:

    - `push`
    - `issues`
    - `jobs`
    - `merge_requests`
    - `pipeline`

  - System Hooks supported event types:

    - `push`
    - `merge_request`

    This means that if you choose system hooks, the integration will not be able to update the relevant entities in Port on events such as `issues` or `pipeline`.

- Creating a system hook requires admin privileges in Gitlab. Due to this, the integration supports that the system hook will be created manually, and the integration will use it to listen to the relevant events.

#### Configuring integration to use hooks

By default, if `appHost` is provided, the integration will create group webhooks for each group in your Gitlab instance.

To create the system hook there are two options:

In both options you'll need to provide the `useSystemHook` parameter with the value `true`.

- Provide a token with admin privileges in Gitlab using the `tokenMapping` parameter.
- Create the system hook manually

  - Follow the instructions for creating a system hook in Gitlab [here](https://docs.gitlab.com/ee/administration/system_hooks.html#create-a-system-hook).
  - In the `URL` field, provide the `appHost` parameter value with the path `/integration/system/hook`. e.g. `https://my-gitlab-integration.com/integration/system/hook`.
  - From the `Triggers` section, the Gitlab integration currently supports the following events:

    - `push`
    - `merge_request`

  ![GitLab System Hook](../../../../../static/img/integrations/gitlab/GitLabSystemHook.png)
