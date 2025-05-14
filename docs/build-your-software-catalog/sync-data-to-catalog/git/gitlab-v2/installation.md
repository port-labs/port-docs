---
sidebar_position: 1
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import Prerequisites from "../../templates/_ocean_helm_prerequisites_block.mdx"
import HelmParameters from "../../templates/_ocean-advanced-parameters-helm.mdx"
import DockerParameters from "./_gitlab_docker_parameters.mdx"
import AdvancedConfig from '../../../../generalTemplates/_ocean_advanced_configuration_note.md'
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"
import OceanSaasInstallation from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_saas_installation.mdx"
import OceanRealtimeInstallation from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_realtime_installation.mdx"
import { OceanSaasLiveEventsDescription, OceanSaasLiveEventsTriggersManual, liveEvents } from "/src/components/ocean-saas-specifics/live-events.jsx";

# Installation

This page details how to install Port's GitLab integration (powered by the Ocean framework).
   
This page outlines the following steps:

- How to [create](#create-an-access-token) an access token to give the integration permissions to query your GitLab instance.
- How to [configure](#configure-the-integration) and customize the integration before deploying it.
- How to [deploy](#deploy-the-integration) the integration in the configuration that fits your use case.

## Prerequisites

- A GitLab account with permissions to create access tokens.
- If you choose the real time & always on installation method, you will need a kubernetes cluster on which to install the integration.
- Your Port user role is set to `Admin`.

## Setup

### Configure access token

To allow Port to fetch data from your GitLab instance, you need to create an access token. Port supports two types of tokens for authentication: personal access tokens and group access tokens.

#### Personal access token (PAT)

A Personal Access Token (PAT) is suitable if you're the only one managing the integration and don't need frequent credential rotation.  
To create a personal access token see the GitLab [personal access token guide](https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html).

- The token must belong to a user with access to the relevant GitLab resources (e.g., projects, groups).

#### Group access token

A Group Access Token is recommended when multiple team members manage the integration or when it's set up at the group level.   
To create a group access token, see the GitLab [group access token guide](https://docs.gitlab.com/ee/user/group/access_tokens.html).

- Create the token in a group that has access to the relevant projects.
- Set an appropriate expiration date and store it securely.

#### Service account token

A service account token is recommended where credentials must remain stable and unaffected by changes in human user membership.

To set up the account and generate a personal access token, see the GitLab [service account guide](https://docs.gitlab.com/ee/user/profile/service_accounts/).

- Add the service account to the relevant projects or groups with sufficient permissions (e.g., Developer or Maintainer).


:::info Required scopes
The following scopes are required based on your usage.
- To enable **real-time updates using webhooks**, the token must include the `api` scope (required for managing webhooks).
- If you're **not using realtime updates**, the token needs `read_api` and `read_repository` scopes.
:::

### Configure Realtime webhook events

:::tip
The `baseUrl` parameter is used specifically to enable the real-time functionality of the integration.

If it is not provided, the integration will continue to function correctly. In such a configuration, to retrieve the latest information from the target system, the [`scheduledResyncInterval`](https://ocean.getport.io/develop-an-integration/integration-configuration/#scheduledresyncinterval---run-scheduled-resync) parameter has to be set, or a manual resync will need to be triggered through Port's UI.
:::

 
## Deploy the integration

Choose one of the following installation methods:

<Tabs groupId="installation-methods" queryString="installation-methods">

<TabItem value="hosted-by-port" label="Hosted by Port" default>

<OceanSaasInstallation integration="GitLab_v2" />

</TabItem>

<TabItem value="real-time-self-hosted" label="Real-time (self-hosted)">

Using this installation option means that the integration will be able to update Port in real time using webhooks.

<h2>Prerequisites</h2>

<Prerequisites />

For details about the available parameters for the installation, see the table below.

<Tabs groupId="deploy" queryString="deploy">
<TabItem value="helm" label="Helm" default>

<OceanRealtimeInstallation integration="GitLab_v2" />

<PortApiRegionTip/>

</TabItem>

<TabItem value="argocd" label="ArgoCD" default>
To install the integration using ArgoCD:

1. Create a `values.yaml` file in `argocd/my-ocean-gitlab-integration` in your git repository with the content:

:::note
Remember to replace the placeholders for `GITLAB_TOKEN` and your GitLab URL.
:::
```yaml showLineNumbers
initializePortResources: true
scheduledResyncInterval: 120
integration:
  identifier: my-ocean-gitlab-integration
  type: gitlab-v2
  eventListener:
    type: POLLING
  config:
  // highlight-next-line
    gitlabUrl: https://gitlab.com # Or your self-hosted GitLab URL
  secrets:
  // highlight-next-line
    gitlabToken: GITLAB_TOKEN
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

| Parameter                        | Description                                                                                                                         | Required |
|----------------------------------|-------------------------------------------------------------------------------------------------------------------------------------|----------|
| `port.clientId`                  | Your port client id                                                                                                                 | ✅        |
| `port.clientSecret`              | Your port client secret                                                                                                             | ✅        |
| `port.baseUrl`                   | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US                                             | ✅        |
| `integration.identifier`         | Change the identifier to describe your integration                                                                                  | ✅        |
| `integration.type`               | The integration type                                                                                                                | ✅        |
| `integration.eventListener.type` | The event listener type                                                                                                             | ✅        |
| `integration.config.gitlabUrl`   | The GitLab instance URL                                                                                                     | ✅        |
| `integration.secrets.gitlabToken`| The GitLab access token                                                                                                     | ✅        |
| `scheduledResyncInterval`        | The number of minutes between each resync                                                                                           | ❌        |
| `initializePortResources`        | Default true, When set to true the integration will create default blueprints and the port App config Mapping                       | ❌        |
| `sendRawDataExamples`            | Enable sending raw data examples from the third party API to port for testing and managing the integration mapping. Default is true | ❌        |
| `baseUrl`                        | The base url of the instance where the GitLab integration is hosted, used for real-time updates. (e.g.`https://mygitlaboceanintegration.com`)                 | ❌        |

<br/>

<AdvancedConfig/>

</TabItem>

<TabItem value="one-time-ci" label="Scheduled (CI)">

This workflow/pipeline will run the GitLab integration once and then exit, this is useful for **scheduled** ingestion of data.

:::warning Real-time updates
If you want the integration to update Port in real time using webhooks you should use the [Real-time (self-hosted)](?installation-methods=real-time-self-hosted#setup) installation option.
:::
  <Tabs groupId="cicd-method" queryString="cicd-method">
  <TabItem value="github" label="GitHub">

Make sure to configure the following [Github Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions):

<DockerParameters />

<br/>

Here is an example for `gitlab-integration.yml` workflow file:

```yaml showLineNumbers
name: GitLab Exporter Workflow
on:
  workflow_dispatch:
  schedule:
    - cron: '0 */1 * * *' # Determines the scheduled interval for this workflow. This example runs every hour.
jobs:
  run-integration:
    runs-on: ubuntu-latest
    timeout-minutes: 30 # Set a time limit for the job
    steps:
      - uses: port-labs/ocean-sail@v1
        with:
          type: 'gitlab-v2'
          port_client_id: ${{ secrets.OCEAN__PORT__CLIENT_ID }}
          port_client_secret: ${{ secrets.OCEAN__PORT__CLIENT_SECRET }}
          port_base_url: https://api.getport.io
          config: |
            gitlabUrl: ${{ secrets.OCEAN__INTEGRATION__CONFIG__GITLAB_URL }}
            gitlabToken: ${{ secrets.OCEAN__INTEGRATION__CONFIG__GITLAB_TOKEN }}
```

  </TabItem>
  <TabItem value="jenkins" label="Jenkins">


:::tip
Your Jenkins agent should be able to run docker commands.
:::


Make sure to configure the following [Jenkins Credentials](https://www.jenkins.io/doc/book/using/using-credentials/)
of `Secret Text` type:

<DockerParameters />

<br/>

Here is an example for `Jenkinsfile` groovy pipeline file:

```text showLineNumbers
pipeline {
    agent any
    stages {
        stage('Run GitLab Integration') {
            steps {
                script {
                    withCredentials([
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__GITLAB_URL', variable: 'OCEAN__INTEGRATION__CONFIG__GITLAB_URL'),
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__GITLAB_TOKEN', variable: 'OCEAN__INTEGRATION__CONFIG__GITLAB_TOKEN'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_ID', variable: 'OCEAN__PORT__CLIENT_ID'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_SECRET', variable: 'OCEAN__PORT__CLIENT_SECRET'),
                    ]) {
                        sh('''
                            #Set Docker image and run the container
                            integration_type="gitlab-v2"
                            version="latest"
                            image_name="ghcr.io/port-labs/port-ocean-${integration_type}:${version}"
                            docker run -i --rm --platform=linux/amd64 \
                                -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
                                -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
                                -e OCEAN__SEND_RAW_DATA_EXAMPLES=true \
                                -e OCEAN__INTEGRATION__CONFIG__GITLAB_URL=$OCEAN__INTEGRATION__CONFIG__GITLAB_URL \
                                -e OCEAN__INTEGRATION__CONFIG__GITLAB_TOKEN=$OCEAN__INTEGRATION__CONFIG__GITLAB_TOKEN \
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

  </TabItem>

  <TabItem value="azure" label="Azure Devops">

Make sure to configure the following [Azure DevOps pipeline variables](https://learn.microsoft.com/en-us/azure/devops/pipelines/process/variables):

<DockerParameters />

<br/>

Here is an example for `gitlab-integration.yml` pipeline file:

```yaml showLineNumbers
trigger:
- main
pool:
  vmImage: "ubuntu-latest"
variables:
  - group: port-ocean-credentials
steps:
- script: |
    # Set Docker image and run the container
    integration_type="gitlab-v2"
    version="latest"
    image_name="ghcr.io/port-labs/port-ocean-$integration_type:$version"
    
    docker run -i --rm --platform=linux/amd64 \
        -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
        -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
        -e OCEAN__SEND_RAW_DATA_EXAMPLES=true \
        -e OCEAN__INTEGRATION__CONFIG__GITLAB_URL=$(OCEAN__INTEGRATION__CONFIG__GITLAB_URL) \
        -e OCEAN__INTEGRATION__CONFIG__GITLAB_TOKEN=$(OCEAN__INTEGRATION__CONFIG__GITLAB_TOKEN) \
        -e OCEAN__PORT__CLIENT_ID=$(OCEAN__PORT__CLIENT_ID) \
        -e OCEAN__PORT__CLIENT_SECRET=$(OCEAN__PORT__CLIENT_SECRET) \
        -e OCEAN__PORT__BASE_URL='https://api.getport.io' \
        $image_name
    exit $?
  displayName: 'Ingest Data into Port'
```

  </TabItem>
<TabItem value="gitlab" label="GitLab">

Make sure to [configure the following GitLab variables](https://docs.gitlab.com/ee/ci/variables/#for-a-project):

<DockerParameters/>

<br/>

Here is an example for `.gitlab-ci.yml` pipeline file:

```yaml showLineNumbers
default:
  image: docker:24.0.5
  services:
    - docker:24.0.5-dind
  before_script:
    - docker info
    
variables:
  INTEGRATION_TYPE: gitlab-v2
  VERSION: latest
stages:
  - ingest
ingest_data:
  stage: ingest
  variables:
    IMAGE_NAME: ghcr.io/port-labs/port-ocean-$INTEGRATION_TYPE:$VERSION
  script:
    - |
      docker run -i --rm --platform=linux/amd64 \
        -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
        -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
        -e OCEAN__SEND_RAW_DATA_EXAMPLES=true  \
        -e OCEAN__INTEGRATION__CONFIG__GITLAB_URL=$OCEAN__INTEGRATION__CONFIG__GITLAB_URL \
        -e OCEAN__INTEGRATION__CONFIG__GITLAB_TOKEN=$OCEAN__INTEGRATION__CONFIG__GITLAB_TOKEN \
        -e OCEAN__PORT__CLIENT_ID=$OCEAN__PORT__CLIENT_ID \
        -e OCEAN__PORT__CLIENT_SECRET=$OCEAN__PORT__CLIENT_SECRET \
        -e OCEAN__PORT__BASE_URL='https://api.getport.io' \
        $IMAGE_NAME
  rules: # Run only when changes are made to the main branch
    - if: '$CI_COMMIT_BRANCH == "main"'
  schedule: # Run according to a schedule
    - cron: '0 */3 * * *' # Run every 3 hours
```

</TabItem>
  </Tabs>

<PortApiRegionTip/>

<AdvancedConfig/>

</TabItem>

</Tabs>