---
sidebar_position: 1
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import Prerequisites from "../../../templates/\_ocean_helm_prerequisites_block.mdx"
import HelmParameters from "../../../templates/\_ocean-advanced-parameters-helm.mdx"
import DockerParameters from "../\_github_docker_parameters.mdx"
import AdvancedConfig from '../../../../../generalTemplates/\_ocean_advanced_configuration_note.md'
import PortApiRegionTip from "/docs/generalTemplates/\_port_region_parameter_explanation_template.md"
import OceanSaasInstallation from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/\_ocean_saas_installation.mdx"
import OceanRealtimeInstallation from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/\_ocean_realtime_installation.mdx"
import { OceanSaasLiveEventsDescription, OceanSaasLiveEventsTriggersManual, liveEvents } from "/src/components/ocean-saas-specifics/live-events.jsx";

# Installation

This page details how to install Port's GitHub integration (powered by the Ocean framework).

This page outlines the following steps:

- How to [create](#create-an-access-token) an access token to give the integration permissions to query your Github organization.
- How to [configure](#configure-the-integration) and customize the integration before deploying it.
- How to [deploy](#deploy-the-integration) the integration in the configuration that fits your use case.

## Prerequisites

- A GitHub account with permissions to create access tokens.
- Your Port user role is set to `Admin`.

## Setup

### Configure access token

To allow Port to fetch data from your GitHub Organization, you need to create an access token. Port supports two types of tokens for authentication: personal access tokens and GitHub app installation tokens.

#### Personal access token (PAT)

A Personal Access Token (PAT) is suitable if you're the only one managing the integration and don't need frequent credential rotation.  
To create a personal access token see Github's [managing your personal access tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens).

- The token must belong to a user with access to the relevant Github resources (e.g., repositories, teams).

#### Github app installation

Refer to our [Github app installation guide](./github-app.md)

### Configure Realtime webhook events

:::tip
The `baseUrl` parameter is used specifically to enable the real-time functionality of the integration.

If it is not provided, the integration will continue to function correctly. In such a configuration, to retrieve the latest information from the target system, the [`scheduledResyncInterval`](https://ocean.getport.io/develop-an-integration/integration-configuration/#scheduledresyncinterval---run-scheduled-resync) parameter has to be set, or a manual resync will need to be triggered through Port's UI.
:::

## Deploy the integration

Choose the installation method that best suits your needs:

<Tabs groupId="installation-methods" queryString="installation-methods">

<TabItem value="real-time-self-hosted" label="Real-time (self-hosted)">

Using this installation option means that the integration will be able to update Port in real time using webhooks.

<h2>Prerequisites</h2>

<Prerequisites />

For details about the available parameters for the installation, see the table below.

<Tabs groupId="deploy" queryString="deploy">
<TabItem value="helm" label="Helm" default>
To install the integration using Helm:

1. Add Port's Helm chart repository:
```showLineNumbers
helm repo add --force-update port-labs https://port-labs.github.io/helm-charts
```
2. Install the Helm chart:
```showLineNumbers
helm upgrade --install github-ocean port-labs/port-ocean \
	--set port.clientId="<PORT_CLIENT_ID>"  \
	--set port.clientSecret="<PORT_CLIENT_SECRET>"  \
	--set port.baseUrl="https://api.port.io"  \
	--set integration.identifier="github-ocean"  \
	--set integration.type="github-ocean"  \
	--set integration.eventListener.type="POLLING"  \
	--set integration.config.githubOrganization=<GITHUB_ORGANIZATION>  \
	--set integration.config.githubHost=<GITHUB_HOST>  \
	--set integration.secrets.githubToken="<GITHUB_PAT>"  \
	--set initializePortResources=true  \
	--set sendRawDataExamples=true  \
	--set scheduledResyncInterval=360  \
```

<PortApiRegionTip/>

</TabItem>

<TabItem value="argocd" label="ArgoCD" default>
To install the integration using ArgoCD:

1. Create a `values.yaml` file in `argocd/my-ocean-github-integration` in your git repository with the content:

:::note
Be sure to replace the `<GITHUB_TOKEN>` and `<GITHUB_ORGANIZATION>` placeholders with your actual values. If you are using a self-hosted GitHub instance, update the `githubHost` value to point to your instance.
:::

```yaml showLineNumbers
initializePortResources: true
scheduledResyncInterval: 120
integration:
  identifier: my-ocean-github-integration
  type: github-ocean
  eventListener:
    type: POLLING
  config:
    githubHost: https://api.github.com # Or your self-hosted GitHub URL
    githubOrganization: <GITHUB_ORGANIZATION> # your github organization, e.g port-labs
  secrets:
    githubToken: <GITHUB_TOKEN>
```

<br/>
2. Install the `my-ocean-github-integration` ArgoCD Application by creating the following `my-ocean-github-integration.yaml` manifest:
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
  name: my-ocean-github-integration
  namespace: argocd
spec:
  destination:
    namespace: my-ocean-github-integration
    server: https://kubernetes.default.svc
  project: default
  sources:
  - repoURL: 'https://port-labs.github.io/helm-charts/'
    chart: port-ocean
    targetRevision: 0.8.5
    helm:
      valueFiles:
      - $values/argocd/my-ocean-github-integration/values.yaml
      // highlight-start
      parameters:
        - name: port.clientId
          value: <YOUR_PORT_CLIENT_ID>
        - name: port.clientSecret
          value: <YOUR_PORT_CLIENT_SECRET>
        - name: port.baseUrl
          value: https://api.getport.io
  - repoURL: <YOUR_GIT_REPO_URL>
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
kubectl apply -f my-ocean-github-integration.yaml
```

</TabItem>

</Tabs>

This table summarizes the available parameters for the installation.

| Parameter                               | Description                                                                                                             | Required |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | -------- |
| `port.clientId`                         | Your Port client ID.                                                                                                    | ✅       |
| `port.clientSecret`                     | Your Port client secret.                                                                                                | ✅       |
| `port.baseUrl`                          | Your Port API URL (`https://api.getport.io` for EU, `https://api.us.getport.io` for US).                                | ✅       |
| `integration.identifier`                | A unique identifier for your integration.                                                                               | ✅       |
| `integration.type`                      | The integration type.                                                                                                   | ✅       |
| `integration.eventListener.type`        | The event listener type.                                                                                                | ✅       |
| `integration.config.githubOrganization` | The GitHub organization to sync data from.                                                                              | ✅       |
| `integration.config.githubHost`         | The GitHub instance URL.                                                                                                | ✅       |
| `integration.secrets.githubToken`       | The GitHub access token.                                                                                                | ✅       |
| `scheduledResyncInterval`               | The number of minutes between each resync.                                                                              | ❌       |
| `initializePortResources`               | When `true`, the integration will create default blueprints and port-app-config.yml mapping.                            | ❌       |
| `sendRawDataExamples`                   | When `true`, sends raw data examples from the third-party API to Port for testing and managing the integration mapping. | ❌       |
| `baseUrl`                               | The base URL of the GitHub integration instance, used for real-time updates.                                            | ❌       |

<br/>

<AdvancedConfig/>

</TabItem>

<TabItem value="one-time-ci" label="Scheduled (CI)">

This workflow/pipeline will run the GitHub integration once and then exit. This is useful for **scheduled** ingestion of data.

:::warning Real-time updates
If you want the integration to update Port in real time using webhooks you should use the [Real-time (self-hosted)](?installation-methods=real-time-self-hosted#setup) installation option.
:::
<Tabs groupId="cicd-method" queryString="cicd-method">
<TabItem value="github" label="GitHub">

Make sure to configure the following [Github Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions):

<DockerParameters />

<br/>

Here is an example for a `github-integration.yml` workflow file:

```yaml showLineNumbers
name: Github Exporter Workflow
on:
  workflow_dispatch:
  schedule:
    - cron: "0 */1 * * *" # Determines the scheduled interval for this workflow. This example runs every hour.
jobs:
  run-integration:
    runs-on: ubuntu-latest
    timeout-minutes: 30 # Set a time limit for the job
    steps:
      - uses: port-labs/ocean-sail@v1
        with:
          type: "github-ocean"
          port_client_id: ${{ secrets.OCEAN__PORT__CLIENT_ID }}
          port_client_secret: ${{ secrets.OCEAN__PORT__CLIENT_SECRET }}
          port_base_url: https://api.getport.io
          config: |
            githubHost: ${{ secrets.OCEAN__INTEGRATION__CONFIG__GITHUB_HOST }}
            githubToken: ${{ secrets.OCEAN__INTEGRATION__CONFIG__GITHUB_TOKEN }}
            githubOrganization: ${{ secrets.OCEAN__INTEGRATION__CONFIG__GITHUB_ORGANIZATION }}
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

Here is an example for a `Jenkinsfile` groovy pipeline file:

```text showLineNumbers
pipeline {
    agent any
    stages {
        stage('Run Github Integration') {
            steps {
                script {
                    withCredentials([
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__GITHUB_URL', variable: 'OCEAN__INTEGRATION__CONFIG__GITHUB_URL'),
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__GITHUB_ORGANIZATION', variable: 'OCEAN__INTEGRATION__CONFIG__GITHUB_ORGANIZATION'),
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__GITHUB_TOKEN', variable: 'OCEAN__INTEGRATION__CONFIG__GITHUB_TOKEN'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_ID', variable: 'OCEAN__PORT__CLIENT_ID'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_SECRET', variable: 'OCEAN__PORT__CLIENT_SECRET'),
                    ]) {
                        sh('''
                            #Set Docker image and run the container
                            integration_type="github-ocean"
                            version="1.0.4-beta"
                            image_name="ghcr.io/port-labs/port-ocean-${integration_type}:${version}"
                            docker run -i --rm --platform=linux/amd64 \
                                -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
                                -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
                                -e OCEAN__SEND_RAW_DATA_EXAMPLES=true \
                                -e OCEAN__INTEGRATION__CONFIG__GITHUB_URL=$OCEAN__INTEGRATION__CONFIG__GITHUB_URL \
                                -e OCEAN__INTEGRATION__CONFIG__GITHUB_TOKEN=$OCEAN__INTEGRATION__CONFIG__GITHUB_TOKEN \
                                -e OCEAN__INTEGRATION__CONFIG__GITHUB_ORGANIZATION=$OCEAN__INTEGRATION__CONFIG__GITHUB_ORGANIZATION \
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

Here is an example for a `github-integration.yml` pipeline file:

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
      integration_type="github-ocean"
      version="1.0.4-beta"
      image_name="ghcr.io/port-labs/port-ocean-$integration_type:$version"

      docker run -i --rm --platform=linux/amd64 \
          -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
          -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
          -e OCEAN__SEND_RAW_DATA_EXAMPLES=true \
          -e OCEAN__INTEGRATION__CONFIG__GITHUB_HOST=$(OCEAN__INTEGRATION__CONFIG__GITHUB_HOST) \
          -e OCEAN__INTEGRATION__CONFIG__GITHUB_TOKEN=$(OCEAN__INTEGRATION__CONFIG__GITHUB_TOKEN) \
          -e OCEAN__INTEGRATION__CONFIG__GITHUB_ORGANIZATION=$(OCEAN__INTEGRATION__CONFIG__GITHUB_ORGANIZATION) \
          -e OCEAN__PORT__CLIENT_ID=$(OCEAN__PORT__CLIENT_ID) \
          -e OCEAN__PORT__CLIENT_SECRET=$(OCEAN__PORT__CLIENT_SECRET) \
          -e OCEAN__PORT__BASE_URL='https://api.getport.io' \
          $image_name
      exit $?
    displayName: "Ingest Data into Port"
```

  </TabItem>
<TabItem value="GitLab" label="GitLab">

Make sure to [configure the following GitLab variables](https://docs.gitlab.com/ee/ci/variables/#for-a-project):

<DockerParameters/>

<br/>

Here is an example for a `.gitlab-ci.yml` pipeline file:

```yaml showLineNumbers
default:
  image: docker:24.0.5
  services:
    - docker:24.0.5-dind
  before_script:
    - docker info

variables:
  INTEGRATION_TYPE: github-ocean
  VERSION: 1.0.4-beta
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
        -e OCEAN__INTEGRATION__CONFIG__GITHUB_URL=$OCEAN__INTEGRATION__CONFIG__GITHUB_URL \
        -e OCEAN__INTEGRATION__CONFIG__GITHUB_TOKEN=$OCEAN__INTEGRATION__CONFIG__GITHUB_TOKEN \
        -e OCEAN__INTEGRATION__CONFIG__GITHUB_ORGANIZATION=$OCEAN__INTEGRATION__CONFIG__GITHUB_ORGANIZATION \
        -e OCEAN__PORT__CLIENT_ID=$OCEAN__PORT__CLIENT_ID \
        -e OCEAN__PORT__CLIENT_SECRET=$OCEAN__PORT__CLIENT_SECRET \
        -e OCEAN__PORT__BASE_URL='https://api.getport.io' \
        $IMAGE_NAME
  rules: # Run only when changes are made to the main branch
    - if: '$CI_COMMIT_BRANCH == "main"'
  schedule: # Run according to a schedule
    - cron: "0 */3 * * *" # Run every 3 hours
```

</TabItem>
  </Tabs>

<PortApiRegionTip/>

<AdvancedConfig/>

</TabItem>

</Tabs>
