---
sidebar_position: 1
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import HelmParameters from "../../templates/\_ocean-advanced-parameters-helm.mdx"
import DockerParameters from "./\_gitlab_one_time_docker_parameters.mdx"

# Installation

This page will help you install Port's GitLab integration (powered by the Ocean framework).

This page outlines the following steps:

- How to [create](#creating-a-gitlab-group-access-token) a GitLab group access token to give the integration permissions to query your GitLab account.
- How to [configure](#configuring-the-gitlab-integration) and customize the integration before deploying it.
- How to [deploy](#deploying-the-gitlab-integration) the integration in the configuration that fits your use case.

:::note Prerequisites

- A gitlab account with admin privileges.
- A gitlab group account with the `api` scope.
- If you choose the real time & always on installation method - a kubernetes cluster to install the integration on.
- Your Port user role is set to `Admin`.

:::

## Creating a GitLab group access token

A group access token can be used for the group it was generated at, as well as for all sub-groups underneath it.

The GitLab integration is able to query multiple GitLab root groups. To do so, it will require multiple group access tokens, each at the correct root group.

<details>
<summary>GitLab group access tokens example</summary>

For example, let's assume the following GitLab account structure:

```
GitLab account
.
├── microservices-group
│   ├──microservice1-group
│   └──microservice2-group
├── apis-group
│   ├── rest-api-group
│   └── graphql-api-group
```

In this example:

- To map **only** the `microservices-group`, we require one group access token - one for the `microservices-group`.
- To map the `microservices-group` **and** all of its subgroups, we require only one group access token - one for the `microservices-group`.
- To map the `microservices-group`, **the** `apis-group` **and** all of their subgroups, we require only two group access tokens - one for the `microservices-group` and one for the `apis-group`.
- To map the `microservice1-group`, we have 2 options:
  - Create a group access token for the `microservices-group` and use the [token mapping](#tokenmapping) to select just the `microservice1-group`.
  - Create a group access token for the `microservice1-group` directly.

</details>

See the [token mapping](#tokenmapping) section for more information.

The following steps will guide you how to create a GitLab group access token.

1. Sign in to GitLab and go to your desired group's settings page:

   ![GitLab group settings](/img/integrations/gitlab/GitLabGroupSettings.png)

2. In the "Access Tokens" section, you need to provide the token details, including the name and an optional expiration date. Additionally, select the api scope, and then proceed to click on the "Create access token" button.

   ![GitLab group access tokens](/img/integrations/gitlab/GitLabGroupAccessTokens.png)

3. Click "Create group access token".
4. Copy the generated token and use it when deploying the integration in the following steps.

## Configuring the GitLab integration

### tokenMapping

The GitLab integration support fetching data related to specific paths in your GitLab groups. The integration is also able to fetch data from different GitLab parent groups by providing additional group tokens. In order to do so, you need to map the desired paths to the relevant access tokens.
The `tokenMapping` parameter supports specifying the paths that the integration will search for files and information in, using [globPatterns](https://www.malikbrowne.com/blog/a-beginners-guide-glob-patterns).

Mapping format:

```text showLineNumbers
{"MY_FIRST_GITLAB_PROJECT_GROUP_TOKEN": ["*/MyFirstGitLabProject/**","*/MySecondGitLabProject/*"]}
```

Example:

```text showLineNumbers
{"glpat-QXbeg-Ev9xtu5_5FsaAQ": ["*/DevopsTeam/*Service", "*/RnDTeam/*Service"]}
```

Multiple GitLab group access tokens example:

```text showLineNumbers
{"glpat-QXbeg-Ev9xtu5_5FsaAQ": ["*/DevopsTeam/*Service", "*/RnDTeam/*Service"],"glpat-xF7Ae-vXu5ts5_QbEgAQ9": ["*/MarketingTeam/*Service"]}
```

### `appHost` & listening to hooks

:::tip
The `appHost` parameter is used specifically to enable the real-time functionality of the integration.

If it is not provided, the integration will continue to function correctly, but in order to retrieve the latest information from the target system, it will require either an [event listener](https://ocean.getport.io/framework/features/event-listener) of type `SCHEDULE` or a manual resync periodically through Port's UI.
:::

In order for the GitLab integration to update the data in Port on every change in the GitLab repository, you need to specify the `appHost` parameter.
The `appHost` parameter should be set to the `url` of your GitLab integration instance. In addition, your GitLab instance (whether it is GitLab SaaS or a self-hosted version of GitLab) needs to have the option to send webhook requests to the GitLab integration instance, so please configure your network accordingly.

#### Hooks

The GitLab integration supports listening to GitLab webhooks and updating the relevant entities in Port accordingly.

Supported webhooks are [Group webhooks](https://docs.gitlab.com/ee/user/project/integrations/webhooks.html#group-webhooks) and [System hooks](https://docs.gitlab.com/ee/system_hooks/system_hooks.html).

As part of the installation process, the integration will create a webhook in your GitLab instance, and will use it to listen to the relevant events.

**_There are a few points to consider before deciding on which webhook to choose_**:

- If you choose group webhooks, the integration will create a webhook for each group in your GitLab instance. If you choose system hooks, the integration will create a single webhook for the entire GitLab instance.
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

- Creating a system hook requires admin privileges in GitLab. Due to this, the integration supports that the system hook will be created manually, and the integration will use it to listen to the relevant events.

##### Configuring the integration to use hooks

By default, if `appHost` is provided, the integration will create group webhooks for each group in your GitLab instance.

To create a system hook there are two options:

:::note
In both options you'll need to provide the `useSystemHook` parameter with the value `true`.
:::

1. Provide a token with admin privileges in GitLab using the `tokenMapping` parameter.
   - When choosing this option, the integration will create the system hook in your GitLab account automatically.
2. Create the system hook manually
   - Follow the instructions for creating a system hook in GitLab [here](https://docs.gitlab.com/ee/administration/system_hooks.html#create-a-system-hook).
   - In the `URL` field, provide the `appHost` parameter value with the path `/integration/system/hook`. e.g. `https://my-gitlab-integration.com/integration/system/hook`.
   - From the `Triggers` section, the GitLab integration currently supports the following events:
      - `push`
      - `merge_request`

![GitLab System Hook](/img/integrations/gitlab/GitLabSystemHook.png)

## Deploying the GitLab integration

Choose one of the following installation methods:

<Tabs groupId="installation-methods" queryString="installation-methods">

<TabItem value="real-time-always-on" label="Real Time & Always On" default>

Using this installation option means that the integration will be able to update Port in real time using webhooks.

This table summarizes the available parameters for the installation.
Set them as you wish in the script below, then copy it and run it in your terminal:

| Parameter                          | Description                                                                                                                         | Example                          | Required |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | -------- |
| `port.clientId`                    | Your port [client id](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/api/#find-your-port-credentials)     |                                  | ✅       |
| `port.clientSecret`                | Your port [client secret](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/api/#find-your-port-credentials) |                                  | ✅       |
| `integration.secrets.tokenMapping` | The [token mapping](#tokenmapping) configuration used to query GitLab                                                               |                                  | ✅       |
| `integration.config.appHost`       | The host of the Port Ocean app. Used to set up the integration endpoint as the target for webhooks created in GitLab                | https://my-ocean-integration.com | ❌       |
| `integration.config.gitlabHost`    | (for self-hosted GitLab) the URL of your GitLab instance                                                                            | https://my-gitlab.com            | ❌       |

<HelmParameters/>

<br/>

```bash showLineNumbers
helm repo add --force-update port-labs https://port-labs.github.io/helm-charts
helm upgrade --install my-gitlab-integration port-labs/port-ocean \
	--set port.clientId="PORT_CLIENT_ID"  \
	--set port.clientSecret="PORT_CLIENT_SECRET"  \
	--set port.baseUrl="https://api.getport.io"  \
	--set initializePortResources=true  \
	--set scheduledResyncInterval=120 \
	--set integration.identifier="my-gitlab-integration"  \
	--set integration.type="gitlab"  \
	--set integration.eventListener.type="POLLING"  \
	--set integration.secrets.tokenMapping="\{\"TOKEN\": [\"GROUP_NAME/**\"]\}"
```

It is also possible to get Port's UI to generate your installation command for you, Port will inject values such as your Port client ID and client secret directly into the command, making it easier to get started.

Follow these steps to setup the integration through Port's UI:

1. Click the ingest button in Port Builder Page for the blueprint you want to ingest using GitLab:

   ![DevPortal Builder ingest button](/img/integrations/gitlab/DevPortalBuilderIngestButton.png)

2. Select GitLab under the Git providers category:

   ![DevPortal Builder GitLab option](/img/integrations/gitlab/DevPortalBuilderGitLabOption.png)

3. Copy the helm installation command and set the [required configuration](#configuring-the-gitlab-integration);

4. Run the helm command with the updated parameters to install the integration in your Kubernetes cluster.

</TabItem>

<TabItem value="one-time" label="Scheduled">

<Tabs groupId="cicd-method" queryString="cicd-method">
<TabItem value="gitlab" label="GitLab">

This workflow will run the GitLab integration once and then exit, this is useful for **scheduled** ingestion of data.

:::warning
If you want the integration to update Port in real time using webhooks you should use the [Real Time & Always On](?installation-methods=real-time-always-on#installation) installation option.
:::

Make sure to configure the following [GitLab Variables](https://docs.gitlab.com/ee/ci/variables/):

<DockerParameters/>

<br/>

Here is an example for `.gitlab-ci.yml` workflow file:

```yaml showLineNumbers
stages:
  - deploy_gitlab

variables:
  # Define your secret variables in GitLab project settings
  OCEAN__PORT__CLIENT_ID: $OCEAN__PORT__CLIENT_ID
  OCEAN__PORT__CLIENT_SECRET: $OCEAN__PORT__CLIENT_SECRET
  OCEAN__INTEGRATION__CONFIG__TOKEN_MAPPING: $OCEAN__INTEGRATION__CONFIG__TOKEN_MAPPING
  INTEGRATION_TYPE: "gitlab"
  VERSION: "latest"

deploy_gitlab:
  image: docker:24.0.7
  stage: deploy_gitlab
  services:
    - docker:24.0.7-dind
  script:
    - image_name="ghcr.io/port-labs/port-ocean-$INTEGRATION_TYPE:$VERSION"
    - |
      docker run -i --rm --platform=linux/amd64 \
      -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
      -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
      # highlight-next-line
      -e OCEAN__INTEGRATION__CONFIG__TOKEN_MAPPING="$OCEAN__INTEGRATION__CONFIG__TOKEN_MAPPING" \
      -e OCEAN__PORT__CLIENT_ID=$OCEAN__PORT__CLIENT_ID \
      -e OCEAN__PORT__CLIENT_SECRET=$OCEAN__PORT__CLIENT_SECRET \
      $image_name
  only:
    - main
```

:::note
When saving the `OCEAN__INTEGRATION__CONFIG__TOKEN_MAPPING` variable, be sure to save it **as-is**, for example given the following token mapping:

```text showLineNumbers
{"glpat-QXbeg-Ev9xtu5_5FsaAQ": ["*/DevopsTeam/*Service", "*/RnDTeam/*Service"]}
```

(Note that this is a one-liner)

Save it as a GitLab variable without any changes (there is no need to wrap it in single-quotes (`'`) or double-quotes (`"`).

Also make sure to keep the double-quotes (`"`) when passing the `OCEAN__INTEGRATION__CONFIG__TOKEN_MAPPING` parameter to the Docker CLI (see the pipeline example above).
:::

  </TabItem>
  <TabItem value="jenkins" label="Jenkins">
This pipeline will run the GitLab integration once and then exit, this is useful for **scheduled** ingestion of data.

:::tip
Your Jenkins agent should be able to run docker commands.
:::
:::warning
If you want the integration to update Port in real time using webhooks you should use the [Real Time & Always On](?installation-methods=real-time-always-on#installation) installation option.
:::

Make sure to configure the following [Jenkins Credentials](https://www.jenkins.io/doc/book/using/using-credentials/) of `Secret Text` type:

<DockerParameters/>

<br/>

Here is an example for `Jenkinsfile` groovy pipeline file:

```yml showLineNumbers
pipeline {
    agent any

    stages {
        stage('Run GitLab Integration') {
            steps {
                script {
                    withCredentials([
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__TOKEN_MAPPING', variable: 'OCEAN__INTEGRATION__CONFIG__TOKEN_MAPPING'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_ID', variable: 'OCEAN__PORT__CLIENT_ID'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_SECRET', variable: 'OCEAN__PORT__CLIENT_SECRET'),
                    ]) {
                        sh('''
                            #Set Docker image and run the container
                            integration_type="gitlab"
                            version="latest"
                            image_name="ghcr.io/port-labs/port-ocean-${integration_type}:${version}"
                            docker run -i --rm --platform=linux/amd64 \
                                -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
                                -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
                                -e OCEAN__INTEGRATION__CONFIG__TOKEN_MAPPING="$OCEAN__INTEGRATION__CONFIG__TOKEN_MAPPING" \
                                -e OCEAN__PORT__CLIENT_ID=$OCEAN__PORT__CLIENT_ID \
                                -e OCEAN__PORT__CLIENT_SECRET=$OCEAN__PORT__CLIENT_SECRET \
                                $image_name

                            exit $?
                        ''')
                    }
                }
            }
        }
    }
}
```

  </TabItem>
  </Tabs>

</TabItem>

</Tabs>
