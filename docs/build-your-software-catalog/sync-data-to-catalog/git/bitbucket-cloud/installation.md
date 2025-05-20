---
sidebar_position: 1
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import AzurePremise from "../../templates/\_ocean_azure_premise.mdx"
import Prerequisites from "../../templates/\_ocean_helm_prerequisites_block.mdx"
import HelmParameters from "../../templates/\_ocean-advanced-parameters-helm.mdx"
import DockerParameters from "./\_bitbucket_cloud_one_time_docker_parameters.mdx"
import AdvancedConfig from '../../../../generalTemplates/_ocean_advanced_configuration_note.md'
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"
import OceanSaasInstallation from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_saas_installation.mdx"
import OceanRealtimeInstallation from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_realtime_installation.mdx"


# Installation

This page details how to install Port's Bitbucket Cloud integration (powered by the Ocean framework). It outlines the following steps:

- How to [create](#create-a-workspace-token-or-app-password) a workspace token/app password to give the integration permissions to query your Bitbucket Cloud account.
- How to [configure](#configure-the-integration) and customize the integration before deploying it.
- How to [deploy](#deploy-the-integration) the integration in the configuration that fits your use case.

## Prerequisites

- A Bitbucket Cloud account with admin privileges to the workspace you want to ingest data from.
- If you choose the real time & always on installation method, you will need a kubernetes cluster on which to install the integration.
- Your Port user role is set to `Admin`.


## Setup

### Create a workspace token or app password

:::tip Use of dedicated accounts and tokens

We recommend using workspace tokens from accounts dedicated to the integration, as this will provide a more secure and scalable solution.

Different credentials from the same Bitbucket account share the same rate limits, which can cause issues when using the integration in a large organization. Using dedicated workspace tokens helps manage rate limits more effectively.
:::

The integration requires either a workspace token or an app password with username to authenticate with your Bitbucket Cloud account.  You can create a workspace token by following the steps [here](https://support.atlassian.com/bitbucket-cloud/docs/workspace-access-tokens/) or an app password by following [these steps](https://support.atlassian.com/bitbucket-cloud/docs/app-passwords/).  

The token or app password should have `read` permission scope for each of the supported resources you want to ingest into Port and a `read` and `write` permission scope for the webhooks.

We recommend using workspace tokens when possible, as they provide better security and are easier to manage than app passwords.

### BaseUrl & listening to hooks

:::tip
The `baseUrl` parameter is used specifically to enable the real-time functionality of the integration.

If it is not provided, the integration will continue to function correctly. In such a configuration, to retrieve the latest information from the target system, the [`scheduledResyncInterval`](https://ocean.getport.io/develop-an-integration/integration-configuration/#scheduledresyncinterval---run-scheduled-resync) parameter has to be set, or a manual resync will need to be triggered through Port's UI.
:::

In order for the Bitbucket Cloud integration to update the data in Port on every change in the Bitbucket Cloud workspace, you need to specify the `baseUrl` parameter.
The `baseUrl` parameter should be set to the `url` of your Bitbucket Cloud integration instance. The `webhookSecret` parameter should also be set to a string of your choice so that the integration can verify the webhook requests.

## Deploy the integration

Choose one of the following installation methods:

<Tabs groupId="installation-methods" queryString="installation-methods">

<TabItem value="hosted-by-port" label="Hosted by Port" default>

<OceanSaasInstallation integration="BitbucketCloud" />

</TabItem>

<TabItem value="real-time-self-hosted" label="Real-time (self-hosted)">

Using this installation option means that the integration will be able to update Port in real time using webhooks.


<h2> Prerequisites </h2>

<Prerequisites />


For details about the available parameters for the installation, see the table below.

<Tabs groupId="deploy" queryString="deploy">

<TabItem value="helm" label="Helm" default>

<OceanRealtimeInstallation integration="Bitbucket Cloud" />

<PortApiRegionTip/>

</TabItem>

<TabItem value="argocd" label="ArgoCD" default>
To install the integration using ArgoCD:

1. Create a `values.yaml` file in `argocd/my-ocean-bitbucket-cloud-integration` in your git repository with the content:

:::note
Remember to replace the placeholders for `BITBUCKET_USERNAME`, `BITBUCKET_APP_PASSWORD`, `BITBUCKET_WORKSPACE` and `BITBUCKET_WORKSPACE_TOKEN`.
:::
```yaml showLineNumbers
initializePortResources: true
scheduledResyncInterval: 120
integration:
  identifier: my-ocean-bitbucket-cloud-integration
  type: bitbucket-cloud
  eventListener:
    type: POLLING
  config:
  // highlight-next-line
    bitbucketUsername: BITBUCKET_USERNAME
    bitbucketWorkspace: BITBUCKET_WORKSPACE
  secrets:
  // highlight-next-line
    bitbucketAppPassword: BITBUCKET_APP_PASSWORD
    bitbucketWorkspaceToken: BITBUCKET_WORKSPACE_TOKEN
```
<br/>

2. Install the `my-ocean-bitbucket-cloud-integration` ArgoCD Application by creating the following `my-ocean-bitbucket-cloud-integration.yaml` manifest:
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
  name: my-ocean-bitbucket-cloud-integration
  namespace: argocd
spec:
  destination:
    namespace: my-ocean-bitbucket-cloud-integration
    server: https://kubernetes.default.svc
  project: default
  sources:
  - repoURL: 'https://port-labs.github.io/helm-charts/'
    chart: port-ocean
    targetRevision: 0.1.14
    helm:
      valueFiles:
      - $values/argocd/my-ocean-bitbucket-cloud-integration/values.yaml
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
kubectl apply -f my-ocean-bitbucket-cloud-integration.yaml
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
| `integration.config.bitbucketUsername`      | The username of the Bitbucket Cloud account                                                  | ✅        |
| `integration.config.bitbucketWorkspace`     | The workspace of the Bitbucket Cloud account             | ✅        |
| `integration.config.bitbucketAppPassword`   | The app password of the Bitbucket Cloud account             | ✅        |
| `integration.config.bitbucketWorkspaceToken`| The workspace token of the Bitbucket Cloud account             | ✅        |
| `integration.config.webhookSecret`          | The secret used to verify the webhook requests             | ❌        |
| `scheduledResyncInterval`        | The number of minutes between each resync                                                                                           | ❌        |
| `initializePortResources`        | Default true, When set to true the integration will create default blueprints and the port App config Mapping                       | ❌        |
| `sendRawDataExamples`            | Enable sending raw data examples from the third party API to port for testing and managing the integration mapping. Default is true | ❌        |
| `baseUrl`                        | The base url of the instance where the Bitbucket Cloud integration is hosted, used for real-time updates. (e.g.`https://mybitbucketcloudoceanintegration.com`)              | ❌        |

<br/>

<AdvancedConfig/>

</TabItem>

<TabItem value="one-time-ci" label="Scheduled (CI)">

This workflow/pipeline will run the Bitbucket Cloud integration once and then exit, this is useful for **scheduled** ingestion of data.

:::warning Real-time updates
If you want the integration to update Port in real time using webhooks you should use the [Real-time (self-hosted)](?installation-methods=real-time-self-hosted#setup) installation option.
:::
  <Tabs groupId="cicd-method" queryString="cicd-method">
  <TabItem value="github" label="GitHub">

Make sure to configure the following [Github Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions):

<DockerParameters />

<br/>

Here is an example for `bitbucket-cloud-integration.yml` workflow file:

```yaml showLineNumbers
name: Bitbucket Cloud Exporter Workflow

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
          type: 'bitbucket-cloud'
          port_client_id: ${{ secrets.OCEAN__PORT__CLIENT_ID }}
          port_client_secret: ${{ secrets.OCEAN__PORT__CLIENT_SECRET }}
          port_base_url: https://api.getport.io
          config: |
            bitbucketUsername: ${{ secrets.OCEAN__INTEGRATION__CONFIG__BITBUCKET_USERNAME }}
            bitbucketWorkspace: ${{ secrets.OCEAN__INTEGRATION__CONFIG__BITBUCKET_WORKSPACE }}
            bitbucketAppPassword: ${{ secrets.OCEAN__INTEGRATION__CONFIG__BITBUCKET_APP_PASSWORD }}
            bitbucketWorkspaceToken: ${{ secrets.OCEAN__INTEGRATION__CONFIG__BITBUCKET_WORKSPACE_TOKEN }}
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
        stage('Run PagerDuty Integration') {
            steps {
                script {
                    withCredentials([
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__BITBUCKET_USERNAME', variable: 'OCEAN__INTEGRATION__CONFIG__BITBUCKET_USERNAME'),
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__BITBUCKET_WORKSPACE', variable: 'OCEAN__INTEGRATION__CONFIG__BITBUCKET_WORKSPACE'),
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__BITBUCKET_APP_PASSWORD', variable: 'OCEAN__INTEGRATION__CONFIG__BITBUCKET_APP_PASSWORD'),
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__BITBUCKET_WORKSPACE_TOKEN', variable: 'OCEAN__INTEGRATION__CONFIG__BITBUCKET_WORKSPACE_TOKEN'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_ID', variable: 'OCEAN__PORT__CLIENT_ID'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_SECRET', variable: 'OCEAN__PORT__CLIENT_SECRET'),
                    ]) {
                        sh('''
                            #Set Docker image and run the container
                            integration_type="bitbucket-cloud"
                            version="latest"
                            image_name="ghcr.io/port-labs/port-ocean-${integration_type}:${version}"
                            docker run -i --rm --platform=linux/amd64 \
                                -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
                                -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
                                -e OCEAN__SEND_RAW_DATA_EXAMPLES=true \
                                -e OCEAN__INTEGRATION__CONFIG__BITBUCKET_USERNAME=$OCEAN__INTEGRATION__CONFIG__BITBUCKET_USERNAME \
                                -e OCEAN__INTEGRATION__CONFIG__BITBUCKET_WORKSPACE=$OCEAN__INTEGRATION__CONFIG__BITBUCKET_WORKSPACE \
                                -e OCEAN__INTEGRATION__CONFIG__BITBUCKET_APP_PASSWORD=$OCEAN__INTEGRATION__CONFIG__BITBUCKET_APP_PASSWORD \
                                -e OCEAN__INTEGRATION__CONFIG__BITBUCKET_WORKSPACE_TOKEN=$OCEAN__INTEGRATION__CONFIG__BITBUCKET_WORKSPACE_TOKEN \
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
<AzurePremise />

<DockerParameters />

<br/>

Here is an example for `bitbucket-cloud-integration.yml` pipeline file:

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
    integration_type="bitbucket-cloud"
    version="latest"

    image_name="ghcr.io/port-labs/port-ocean-$integration_type:$version"
    
    docker run -i --rm --platform=linux/amd64 \
        -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
        -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
        -e OCEAN__SEND_RAW_DATA_EXAMPLES=true \
        -e OCEAN__INTEGRATION__CONFIG__BITBUCKET_USERNAME=$(OCEAN__INTEGRATION__CONFIG__BITBUCKET_USERNAME) \
        -e OCEAN__INTEGRATION__CONFIG__BITBUCKET_WORKSPACE=$(OCEAN__INTEGRATION__CONFIG__BITBUCKET_WORKSPACE) \
        -e OCEAN__INTEGRATION__CONFIG__BITBUCKET_APP_PASSWORD=$(OCEAN__INTEGRATION__CONFIG__BITBUCKET_APP_PASSWORD) \
        -e OCEAN__INTEGRATION__CONFIG__BITBUCKET_WORKSPACE_TOKEN=$(OCEAN__INTEGRATION__CONFIG__BITBUCKET_WORKSPACE_TOKEN) \
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
  INTEGRATION_TYPE: bitbucket-cloud
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
        -e OCEAN__INTEGRATION__CONFIG__BITBUCKET_USERNAME=$OCEAN__INTEGRATION__CONFIG__BITBUCKET_USERNAME \
        -e OCEAN__INTEGRATION__CONFIG__BITBUCKET_WORKSPACE=$OCEAN__INTEGRATION__CONFIG__BITBUCKET_WORKSPACE \
        -e OCEAN__INTEGRATION__CONFIG__BITBUCKET_APP_PASSWORD=$OCEAN__INTEGRATION__CONFIG__BITBUCKET_APP_PASSWORD \
        -e OCEAN__INTEGRATION__CONFIG__BITBUCKET_WORKSPACE_TOKEN=$OCEAN__INTEGRATION__CONFIG__BITBUCKET_WORKSPACE_TOKEN \
        -e OCEAN__PORT__CLIENT_ID=$OCEAN__PORT__CLIENT_ID \
        -e OCEAN__PORT__CLIENT_SECRET=$OCEAN__PORT__CLIENT_SECRET \
        -e OCEAN__PORT__BASE_URL='https://api.getport.io' \
        $IMAGE_NAME

  rules: # Run only when changes are made to the main branch
    - if: '$CI_COMMIT_BRANCH == "main"'
```

</TabItem>
  </Tabs>

<PortApiRegionTip/>

<AdvancedConfig/>

</TabItem>

</Tabs>
