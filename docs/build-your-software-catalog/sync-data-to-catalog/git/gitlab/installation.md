---
sidebar_position: 1
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import HelmParameters from "../../templates/\_ocean-advanced-parameters-helm.mdx"
import Prerequisites from "../../templates/\_ocean_helm_prerequisites_block.mdx"
import DockerParameters from "./\_gitlab_one_time_docker_parameters.mdx"
import AdvancedConfig from '/docs/generalTemplates/_ocean_advanced_configuration_note.md'
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"
import OceanSaasInstallation from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_saas_installation_oauth.mdx"
import OceanRealtimeInstallation from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_realtime_installation.mdx"


# Installation

This page will help you install Port's GitLab integration (powered by the Ocean framework).

This page outlines the following steps:

- How to [create](#create-a-gitlab-group-access-token) a GitLab group access token to give the integration permissions to query your GitLab account.
- How to [configure](#configure-the-gitlab-integration) and customize the integration before deploying it.
- How to [deploy](#deploy-the-gitlab-integration) the integration in the configuration that fits your use case.

:::tip OAuth2 Installation
Port's GitLab integration supports OAuth2 for quick installation, see [OAuth2 installation](/build-your-software-catalog/sync-data-to-catalog/git/gitlab/installation?deploy=hosted-by-port&installation-methods=hosted-by-port&oauth=oauth#deploy-the-gitlab-integration) for more information.
:::

## Prerequisites

- A GitLab account with admin privileges.
- A GitLab group account with the `api` scope.
- Your Port user role is set to `Admin`.

## Setup

### Create a GitLab group access token

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

See the [Token Mapping](#token-mapping) section for more information.

The following steps will guide you how to create a GitLab group access token.

1. Sign in to GitLab and go to your desired group's settings page:

    <img src='/img/integrations/gitlab/GitLabGroupSettings.png' width='40%' border='1px' />

2. In the "Access Tokens" section, you need to provide the token details, including the name and an optional expiration date. Additionally, select the api scope, and then proceed to click on the "Create access token" button.

   <img src='/img/integrations/gitlab/GitLabGroupAccessTokens.png' width='85%' border='1px' />

    :::tip
    While `Owner` permissions are recommended, you can use the `filterOwnedProjects: false` flag in the mapping to set lower permission levels (for more information, [refer to the Advanced configurations tab](/build-your-software-catalog/sync-data-to-catalog/git/gitlab/advanced/?parameter=filterOwnedProjects#using-advanced-configurations)).  
    *Please note that using lower permissions may lead to unexpected behavior.*
    :::

3. Click "Create group access token".
4. Copy the generated token and use it when deploying the integration in the following steps.

### Token Mapping

The GitLab integration supports fetching data related to specific paths in your GitLab groups. The integration is also able to fetch data from different GitLab parent groups by providing additional group tokens. In order to do so, you need to map the desired paths to the relevant access tokens.
The `tokenMapping` parameter supports specifying the paths that the integration will search for files and information in, using [globPatterns](https://www.malikbrowne.com/blog/a-beginners-guide-glob-patterns).

Mapping format:

```text showLineNumbers
{"MY_FIRST_GITLAB_PROJECT_GROUP_TOKEN": ["**/MyFirstGitLabProject/**","**/MySecondGitLabProject/*"]}
```

Example:

```text showLineNumbers
{"glpat-QXbeg-Ev9xtu5_5FsaAQ": ["**/DevopsTeam/*Service", "**/RnDTeam/*Service"]}
```

:::info Helm installation parameter
When using the `tokenMapping` parameter in the integration's [Helm installation](/build-your-software-catalog/sync-data-to-catalog/git/gitlab/installation?deploy=helm&installation-methods=real-time-always-on#deploying-the-gitlab-integration), make sure to escape the necessary characters, for example:
```text
--set integration.secrets.tokenMapping="\{\"glpat-oh1YXc54pR4eofx6hYy5\": [\"**\"]\}"
```
:::

Multiple GitLab group access tokens example:

```text showLineNumbers
{"glpat-QXbeg-Ev9xtu5_5FsaAQ": ["**/DevopsTeam/*Service", "**/RnDTeam/*Service"],"glpat-xF7Ae-vXu5ts5_QbEgAQ9": ["**/MarketingTeam/*Service"]}
```

### Configure Realtime webhook events

:::tip
The `appHost` parameter is used specifically to enable the real-time functionality of the integration.

If it is not provided, the integration will continue to function correctly. In such a configuration, to retrieve the latest information from the target system, the [`scheduledResyncInterval`](https://ocean.getport.io/develop-an-integration/integration-configuration/#scheduledresyncinterval---run-scheduled-resync) parameter has to be set, or a manual resync will need to be triggered through Port's UI.
:::

In order for the GitLab integration to update the data in Port on every change in the GitLab repository, you need to specify the `appHost` parameter.
The `appHost` parameter should be set to the `url` of your GitLab integration instance. In addition, your GitLab instance (whether it is GitLab SaaS or a self-hosted version of GitLab) needs to have the option to send webhook requests to the GitLab integration instance, so please configure your network accordingly.

##### The default webhook events behavior

The GitLab integration supports listening to GitLab webhooks and updating the relevant entities in Port accordingly.

Supported webhooks are [Group webhooks](https://docs.gitlab.com/ee/user/project/integrations/webhooks.html#group-webhooks) and [System hooks](https://docs.gitlab.com/ee/administration/system_hooks.html).

As part of the installation process, the integration will create a webhook in your GitLab instance, and will use it to listen to the relevant events.

**_There are a few points to consider before deciding on which webhook to choose_** :

- If you choose system hooks, the integration will create a single webhook for the entire GitLab instance. If you choose group webhooks, the integration will create a webhook for each root group in your GitLab instance, unless you provide the `tokenGroupHooksOverrideMapping` parameter- and then it will create a webhook for each specified group in this parameter.
- The system hooks has much less event types than the group webhooks.

  - Group Webhooks supported event types:

    - `push_events`
    - `issues_events`
    - `jobs_events`
    - `merge_requests_events`
    - `pipeline_events`
    - `releases_events`
    - `tag_push_events`
    - `subgroup_events`
    - `confidential_issues_events`
    - `user_remove_from_group`
    - `user_update_for_group`
    - `user_add_to_group`

  - System Hooks supported event types:

    - `push_events`
    - `merge_requests_events`
    - `repository_update_events`

    This means that if you choose system hooks, the integration will not be able to update the relevant entities in Port on events such as `issues_events`, `pipeline_events` and etc.

- Creating a system hook requires admin privileges in GitLab. Due to this, the integration supports that the system hook will be created manually, and the integration will use it to listen to the relevant events.

#### Specific Group Webhooks

By default, if `appHost` is provided, the integration will create group webhooks for each root group in your GitLab instance. If you need to create webhooks only for specific groups, you should configure the [`tokenGroupHooksOverrideMapping`](#tokengrouphooksoverridemapping) parameter. 

#### System Webhooks

To create a system hook in GitLab, you must set `useSystemHook: true` and choose one of the following setup methods:

1. **Automatic Setup** - Provide a token with admin privileges using the `tokenMapping` parameter.
2. **Manual Setup** - Create the system hook yourself in GitLab:
   - Follow GitLab's [system hook setup guide](https://docs.gitlab.com/ee/administration/system_hooks.html#create-a-system-hook).
   - Set the URL to `{appHost}/integration/system/hook` (e.g., `https://my-gitlab-integration.com/integration/system/hook`).
   - Enable the supported triggers: `push` and `merge_request`.

:::info Repository Setup and Initial Commit
Due to GitLab webhook limitations, new repositories require special handling:

- A repository will only appear in Port after its first commit (GitLab webhooks don't support `project_create` events).
- Empty repositories (no commits) will only appear after the next scheduled resync.

For more details, see GitLab's [webhook events documentation](https://docs.gitlab.com/ee/user/project/integrations/webhook_events.html).
:::

![GitLab System Hook](/img/integrations/gitlab/GitLabSystemHook.png)

### Listen to specified groups

the integration can support listening to webhooks on specified groups, by configuring the `tokenGroupHooksOverrideMapping` parameter. this parameter is not required, and when you don't use it, the integration will listen to all of the root groups (if not using `useSystemHooks=true`)

Mapping format:

```text showLineNumbers
{"MY_FIRST_GROUPS_TOKEN": {"groups:"{"MY_FIRST_GROUP_FULL_PATH": {"events": [CHOSEN_EVENT_TYPES]}, "MY_OTHER_GROUP_FULL_PATH": {"events": [CHOSEN_EVENT_TYPES]}}}}
```

Example:
```text showLineNumbers
{"glpat-QXbeg-Ev9xtu5_5FsaAQ": {"groups": {"path/to/my-first-group": {"events": ["push_events", "merge_requests_events]}, "path/to/my-other-group": {"events": ["pipelines_events"]}}}}
```

You can configure multiple tokens, and multiple groups per token (the token should have admin access to those groups), but there are some rules:
- All of the tokens mentioned here must be contained in `tokenMapping`.
- A "groups" key is required for each token.
- All of the groups in all of the tokens must be non-hierarchical to each other, and not identical (duplicated).
- The group path is the full path in gitlab. If a group path is incorrect, the webhook will not be created.
- The events for each group must match the supported event types mentioned below. if you would like to have all the events provided in the webhook, you can use: `{"events" = []}`, but not eliminate this key completely, because it is required.

## Deploy the GitLab integration

Choose one of the following installation methods:

<Tabs groupId="installation-methods" queryString="installation-methods">

<TabItem value="hosted-by-port" label="Hosted by Port" default>

<OceanSaasInstallation integration="GitLab" />

</TabItem>

<TabItem value="real-time-self-hosted" label="Real-time (self-hosted)">

Using this installation option means that the integration will be able to update Port in real time using webhooks.

<h2> Prerequisites </h2>

<Prerequisites />

For details about the available parameters for the installation, see the table below.

<Tabs groupId="deploy" queryString="deploy">

<TabItem value="helm" label="Helm" default>

<OceanRealtimeInstallation integration="Gitlab" />

<PortApiRegionTip/>

</TabItem>
<TabItem value="argocd" label="ArgoCD" default>
To install the integration using ArgoCD:

1. Create a `values.yaml` file in `argocd/my-ocean-gitlab-integration` in your git repository with the content:

:::note
Remember to replace the placeholders for `GITLAB_TOKEN_MAPPING`.
:::
```yaml showLineNumbers
initializePortResources: true
scheduledResyncInterval: 120
integration:
  identifier: my-ocean-gitlab-integration
  type: gitlab
  eventListener:
    type: POLLING
  secrets:
  // highlight-next-line
    tokenMapping: GITLAB_TOKEN_MAPPING
```
<br/>

2. Install the `my-ocean-gitlab-integration` ArgoCD Application by creating the following `my-ocean-gitlab-integration.yaml` manifest:
:::note
Remember to replace the placeholders for `YOUR_PORT_CLIENT_ID` `YOUR_PORT_CLIENT_SECRET` and `YOUR_GIT_REPO_URL`.

Multiple sources ArgoCD documentation can be found [here](https://argo-cd.readthedocs.io/en/stable/user-guide/multiple_sources/#helm-value-files-from-external-git-repository).
:::

<details>
  <summary>ArgoCD Application</summary>

```yaml showLineNumbers
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: my-ocean-gitlab-integration
  namespace: argocd
spec:
  destination:
    namespace: my-ocean-gitlab-integration
    server: https://kubernetes.default.svc
  project: default
  sources:
  - repoURL: 'https://port-labs.github.io/helm-charts/'
    chart: port-ocean
    targetRevision: 0.1.14
    helm:
      valueFiles:
      - $values/argocd/my-ocean-gitlab-integration/values.yaml
      // highlight-start
      parameters:
        - name: port.clientId
          value: YOUR_PORT_CLIENT_ID
        - name: port.clientSecret
          value: YOUR_PORT_CLIENT_SECRET
        - name: port.baseUrl
          value: https://api.getport.io
  - repoURL: YOUR_GIT_REPO_URL
  // highlight-end
    targetRevision: main
    ref: values
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
    - CreateNamespace=true
```

<PortApiRegionTip/>

</details>
<br/>

1. Apply your application manifest with `kubectl`:
```bash
kubectl apply -f my-ocean-gitlab-integration.yaml
```
</TabItem>
</Tabs>

This table summarizes the available parameters for the installation.  
Note the parameters specific to this integration, they are last in the table.

| Parameter                                            | Description                                                                                                                                                                                                                                                                                    | Example                          | Required |
|------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------|----------|
| `port.clientId`                                      | Your Port [client id](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)                                                                                                                                                                  |                                  | ✅        |
| `port.clientSecret`                                  | Your Port [client secret](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)                                                                                                                                                              |                                  | ✅        |
| `port.baseUrl`                                       | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US                                                                                                                                                                                                        |                                  | ✅        |
| `integration.secrets.tokenMapping`                   | The [token mapping](#tokenmapping) configuration used to query GitLab                                                                                                                                                                                                                          |                                  | ✅        |
| `integration.config.appHost`                         | The host of the Port Ocean app. Used to set up the integration endpoint as the target for webhooks created in GitLab                                                                                                                                                                           | https://my-ocean-integration.com | ✅        |
| `integration.config.gitlabHost`                      | (for self-hosted GitLab) the URL of your GitLab instance                                                                                                                                                                                                                                       | https://my-gitlab.com            | ❌        |
| `integration.secrets.tokenGroupHooksOverrideMapping` | The [token group hooks override mapping](#tokengrouphooksoverridemapping) configuration used to create custom webhooks on groups                                                                                                                                                               |                                  | ❌        |
| `integration.eventListener.type`                     | The event listener type. Read more about [event listeners](https://ocean.getport.io/framework/features/event-listener)                                                                                                                                                                         |                                  | ✅        |
| `integration.type`                                   | The integration to be installed                                                                                                                                                                                                                                                                |                                  | ✅        |
| `scheduledResyncInterval`                            | The number of minutes between each resync. When not set the integration will resync for each event listener resync event. Read more about [scheduledResyncInterval](https://ocean.getport.io/develop-an-integration/integration-configuration/#scheduledresyncinterval---run-scheduled-resync) |                                  | ❌        |
| `initializePortResources`                            | Default true, When set to true the integration will create default blueprints and the port App config Mapping. Read more about [initializePortResources](https://ocean.getport.io/develop-an-integration/integration-configuration/#initializeportresources---initialize-port-resources)       |                                  | ❌        |
| `sendRawDataExamples`                                | Enable sending raw data examples from the third party API to port for testing and managing the integration mapping. Default is true                                                                                                                                                            |                                  | ❌        |



<br/>

<AdvancedConfig/>

</TabItem>

<TabItem value="one-time-ci" label="Scheduled (CI)">

This pipeline will run the GitLab integration once and then exit, this is useful for **scheduled** ingestion of data.

:::warning Real-time updates
If you want the integration to update Port in real time using webhooks you should use the [Real-time (self-hosted)](?installation-methods=real-time-self-hosted#setup) installation option.
:::

  <Tabs groupId="cicd-method" queryString="cicd-method">
  <TabItem value="gitlab" label="GitLab">

Make sure to configure the following [GitLab Variables](https://docs.gitlab.com/ee/ci/variables/):

<DockerParameters/>

<br/>

Here is an example for `.gitlab-ci.yml` workflow file:

```yaml showLineNumbers
stages:
  - deploy_gitlab

variables:
  # Define non-secret variables
  INTEGRATION_TYPE: "gitlab"
  VERSION: "latest"
  # These variables should be set in GitLab's CI/CD variables for security
  # OCEAN__PORT__CLIENT_ID: $OCEAN__PORT__CLIENT_ID
  # OCEAN__PORT__CLIENT_SECRET: $OCEAN__PORT__CLIENT_SECRET
  # OCEAN__INTEGRATION__CONFIG__TOKEN_MAPPING: $OCEAN__INTEGRATION__CONFIG__TOKEN_MAPPING

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
      -e OCEAN__SEND_RAW_DATA_EXAMPLES=true \
      # highlight-next-line
      -e OCEAN__INTEGRATION__CONFIG__TOKEN_MAPPING="$OCEAN__INTEGRATION__CONFIG__TOKEN_MAPPING" \
      -e OCEAN__PORT__CLIENT_ID=$OCEAN__PORT__CLIENT_ID \
      -e OCEAN__PORT__CLIENT_SECRET=$OCEAN__PORT__CLIENT_SECRET \
      -e OCEAN__PORT__BASE_URL='https://api.getport.io' \
      $image_name
  only:
    - main
```

<PortApiRegionTip/>

:::note
When saving the `OCEAN__INTEGRATION__CONFIG__TOKEN_MAPPING` variable, be sure to save it **as-is**, for example given the following token mapping:

```text
{"glpat-QXbeg-Ev9xtu5_5FsaAQ": ["**/DevopsTeam/*Service", "**/RnDTeam/*Service"]}
```

(Note that this is a one-liner)

Save it as a GitLab variable without any changes (there is no need to wrap it in single-quotes (`'`) or double-quotes (`"`).

Also make sure to keep the double-quotes (`"`) when passing the `OCEAN__INTEGRATION__CONFIG__TOKEN_MAPPING` parameter to the Docker CLI (see the pipeline example above).
:::

</TabItem>
<TabItem value="jenkins" label="Jenkins">

:::tip
Your Jenkins agent should be able to run docker commands.
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
                                -e OCEAN__SEND_RAW_DATA_EXAMPLES=true \
                                -e OCEAN__INTEGRATION__CONFIG__TOKEN_MAPPING="$OCEAN__INTEGRATION__CONFIG__TOKEN_MAPPING" \
                                -e OCEAN__PORT__CLIENT_ID=$OCEAN__PORT__CLIENT_ID \
                                -e OCEAN__PORT__CLIENT_SECRET=$OCEAN__PORT__CLIENT_SECRET \
                                -e OCEAN__PORT__BASE_URL='https://api.getport.io' \
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

<PortApiRegionTip/>

  </TabItem>
  </Tabs>
<AdvancedConfig/>

</TabItem>

</Tabs>



