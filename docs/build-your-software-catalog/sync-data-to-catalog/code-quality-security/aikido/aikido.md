import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import Prerequisites from "../../templates/\_ocean_helm_prerequisites_block.mdx"
import AdvancedConfig from '../../../../generalTemplates/\_ocean_advanced_configuration_note.md'
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"
import OceanSaasInstallation from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_saas_installation.mdx"
import OceanRealtimeInstallation from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_realtime_installation.mdx"
import MetricsAndSyncStatus from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_metrics_and_sync_status.mdx"

# Aikido

Port's Aikido integration allows you to model Aikido resources in your software catalog and ingest data into them.

## Overview

This integration allows you to:

- Track security vulnerabilities from Aikido in Port
- Map repositories and their security findings
- Maintain real-time synchronization between Aikido and Port

### Supported Resources

The resources that can be ingested from Aikido into Port are listed below. It is possible to reference any field that appears in the API responses linked below in the mapping configuration.

- [`Repositories`](https://apidocs.aikido.dev/reference/listcoderepos)
- [`Issues`](https://apidocs.aikido.dev/reference/exportissues)

## Setup

Choose one of the following installation methods:  
Not sure which method is right for your use case? See the [installation methods](/build-your-software-catalog/sync-data-to-catalog/#installation-methods) documentation for guidance.

<Tabs groupId="installation-methods" queryString="installation-methods">

<TabItem value="hosted-by-port" label="Hosted by Port" default>

<OceanSaasInstallation integration="Aikido" />

</TabItem>

<TabItem value="real-time-self-hosted" label="Real-time (self-hosted)">

Using this installation option means that the integration will be able to update Port in real time using webhooks.

<h2>Prerequisites</h2>

<Prerequisites />

For details about the available parameters for the installation, see the table below.

<Tabs groupId="deploy" queryString="deploy">

<TabItem value="helm" label="Helm">

<OceanRealtimeInstallation integration="Aikido" />


<PortApiRegionTip/>

</TabItem>
<TabItem value="argocd" label="ArgoCD" default>
To install the integration using ArgoCD:

1. Create a `values.yaml` file in `argocd/my-ocean-aikido-integration` in your git repository with the content:

:::note Default behaviour
Remember to replace the placeholder for `AIKIDO_CLIENT_ID`,`AIKIDO_CLIENT_SECRET`, `AIKIDO_API_URL`, `WEBHOOK_SECRET`.
:::

```yaml showLineNumbers
initializePortResources: true
scheduledResyncInterval: 120
integration:
  identifier: my-ocean-aikido-integration
  type: aikido
  eventListener:
    type: POLLING
  config:
  // highlight-start
    aikidoApiUrl: AIKIDO_API_URL
  // highlight-end
  secrets:
  // highlight-start
    aikidoClientId: AIKIDO_CLIENT_ID
    aikidoClientSecret: AIKIDO_CLIENT_SECRET
    webhookSecret: WEBHOOK_SECRET
  // highlight-end
```
<br/>

2. Install the `my-ocean-aikido-integration` ArgoCD Application by creating the following `my-ocean-aikido-integration.yaml` manifest:
:::note Configuration variable replacement
Remember to replace the placeholders for `YOUR_PORT_CLIENT_ID` `YOUR_PORT_CLIENT_SECRET` and `YOUR_GIT_REPO_URL`.

Multiple sources ArgoCD documentation can be found [here](https://argo-cd.readthedocs.io/en/stable/user-guide/multiple_sources/#helm-value-files-from-external-git-repository).
:::

<details>
  <summary>ArgoCD Application</summary>

```yaml showLineNumbers
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: my-ocean-aikido-integration
  namespace: argocd
spec:
  destination:
    namespace: my-ocean-aikido-integration
    server: https://kubernetes.default.svc
  project: default
  sources:
  - repoURL: 'https://port-labs.github.io/helm-charts/'
    chart: port-ocean
    targetRevision: 0.8.5
    helm:
      valueFiles:
      - $values/argocd/my-ocean-aikido-integration/values.yaml
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
kubectl apply -f my-ocean-aikido-integration.yaml
```
</TabItem>
</Tabs>

This table summarizes the available parameters for the installation.


| Parameter                           | Description                                                                                                                         | Required |
|-------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------|----------|
| `port.clientId`                     | Your Port client id                                                                                                                 | ✅        |
| `port.clientSecret`                 | Your Port client secret                                                                                                             | ✅        |
| `port.baseUrl`                      | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US                                             | ✅        |
| `integration.identifier`            | Change the identifier to describe your integration                                                                                  | ✅        |
| `integration.type`                  | The integration type                                                                                                                | ✅        |
| `integration.eventListener.type`    | The event listener type                                                                                                             | ✅        |
| `integration.secrets.aikidoClientId`         | The Aikido Client ID                                                                                                                  | ✅        |
| `integration.secrets.aikidoClientSecret` | The Aikido Client Secret                                                           | ❌        |
| `integration.config.apiUrl`         | The Aikido API URL. If not specified, the default will be https://app.aikido.dev                                                        | ❌        |
| `baseUrl`        | The host of the Port Ocean app. Used to set up the integration endpoint as the target for Webhooks created in Aikido                  | ✅        |
| `integration.secret.webhookSecret`  | This is a password you create, that Aikido uses to sign webhook events to Port                                                        | ❌        |
| `scheduledResyncInterval`           | The number of minutes between each resync                                                                                           | ❌        |
| `initializePortResources`           | Default true, When set to true the integration will create default blueprints and the port App config Mapping                       | ❌        |


<br/>

<AdvancedConfig/>

</TabItem>

<TabItem value="one-time-ci" label="Scheduled (CI)">

This workflow/pipeline will run the Aikido integration once and then exit, this is useful for **scheduled** ingestion of data.

:::warning Real-time updates
If you want the integration to update Port in real time using webhooks you should use the [Real-time (self-hosted)](?installation-methods=real-time-self-hosted#setup) installation option
:::

  <Tabs groupId="cicd-method" queryString="cicd-method">
   <TabItem value="github" label="GitHub">

Make sure to configure the following [Github Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions):

| Parameter                                     | Description                                                                                                                                                      | Required |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `OCEAN__INTEGRATION__CONFIG__AIKIDO_CLIENT_ID`           | The Aikido Client ID                                                                                                                                               | ✅       |
| `OCEAN__INTEGRATION__CONFIG__AIKIDO_CLIENT_SECRET` | The Aikido API Client Secret | ✅  |
| `OCEAN__INTEGRATION__CONFIG__WEBHOOK_SECRET` | Aikido webhook secret used to verify the webhook request                                       | ❌      |
| `OCEAN__INTEGRATION__CONFIG__AIKIDO_API_URL`         | The Aikido API URL. If not specified, the default will be https://app.aikido.dev                                                                                      | ❌       |
| `OCEAN__INITIALIZE_PORT_RESOURCES`            | Default true, When set to false the integration will not create default blueprints and the port App config Mapping                                               | ❌       |
| `OCEAN__SEND_RAW_DATA_EXAMPLES`                     | Enable sending raw data examples from the third party API to port for testing and managing the integration mapping. Default is true                       | ❌       |
| `OCEAN__INTEGRATION__IDENTIFIER`              | Change the identifier to describe your integration, if not set will use the default one                                                                          | ❌       |
| `OCEAN__PORT__CLIENT_ID`                      | Your port client id ([How to get the credentials](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials))     | ✅       |
| `OCEAN__PORT__CLIENT_SECRET`                  | Your port client ([How to get the credentials](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)) secret | ✅       |
| `OCEAN__PORT__BASE_URL`                     | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US                                                                          | ✅       |
| `OCEAN__BASE_URL`                     | The host of the Port Ocean app. Used to set up the integration endpoint as the target for webhooks created in Aikido                                                                          | ❌       |

<br/>

Here is an example for `aikido-integration.yml` workflow file:

```yaml showLineNumbers
name: Aikido Exporter Workflow

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
          type: 'aikido'
          port_client_id: ${{ secrets.OCEAN__PORT__CLIENT_ID }}
          port_client_secret: ${{ secrets.OCEAN__PORT__CLIENT_SECRET }}
          port_base_url: https://api.getport.io
          config: |
            aikido_client_id: ${{ secrets.OCEAN__INTEGRATION__CONFIG__AIKIDO_CLIENT_ID }}
            aikido_client_secret: ${{ secrets.OCEAN__INTEGRATION__CONFIG__AIKIDO_CLIENT_SECRET }}
            aikido_api_url: ${{ secrets.OCEAN__INTEGRATION__CONFIG__AIKIDO_API_URL }}
            webhook_secret: ${{ secrets.OCEAN__INTEGRATION__CONFIG__WEBHOOK_SECRET }}
```

</TabItem>
   <TabItem value="jenkins" label="Jenkins">

:::tip
Your Jenkins agent should be able to run docker commands.
:::


Make sure to configure the following [Jenkins Credentials](https://www.jenkins.io/doc/book/using/using-credentials/)
of `Secret Text` type:

| Parameter                                     | Description                                                                                                                                                      | Required |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `OCEAN__INTEGRATION__CONFIG__AIKIDO_CLIENT_ID`           | The Aikido Client ID                                                                                                                                               | ✅       |
| `OCEAN__INTEGRATION__CONFIG__AIKIDO_CLIENT_SECRET` | The Aikido API Client Secret | ✅  |
| `OCEAN__INTEGRATION__CONFIG__WEBHOOK_SECRET` | Aikido webhook secret used to verify the webhook request                                       | ❌      |
| `OCEAN__INTEGRATION__CONFIG__AIKIDO_API_URL`         | The Aikido API URL. If not specified, the default will be https://app.aikido.dev                                                                                      | ❌       |
| `OCEAN__INITIALIZE_PORT_RESOURCES`            | Default true, When set to false the integration will not create default blueprints and the port App config Mapping                                               | ❌       |
| `OCEAN__SEND_RAW_DATA_EXAMPLES`                     | Enable sending raw data examples from the third party API to port for testing and managing the integration mapping. Default is true                       | ❌       |
| `OCEAN__INTEGRATION__IDENTIFIER`              | Change the identifier to describe your integration, if not set will use the default one                                                                          | ❌       |
| `OCEAN__PORT__CLIENT_ID`                      | Your port client id ([How to get the credentials](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials))     | ✅       |
| `OCEAN__PORT__CLIENT_SECRET`                  | Your port client ([How to get the credentials](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)) secret | ✅       |
| `OCEAN__PORT__BASE_URL`                     | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US                                                                          | ✅       |
| `OCEAN__BASE_URL`                     | The host of the Port Ocean app. Used to set up the integration endpoint as the target for webhooks created in Aikido                                                                          | ❌       |

<br/>

Here is an example for `Jenkinsfile` groovy pipeline file:

```yml showLineNumbers
pipeline {
    agent any

    stages {
        stage('Run Aikido Integration') {
            steps {
                script {
                    withCredentials([
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__AIKIDO_CLIENT_ID', variable: 'OCEAN__INTEGRATION__CONFIG__AIKIDO_CLIENT_ID'),
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__AIKIDO_CLIENT_SECRET', variable: 'OCEAN__INTEGRATION__CONFIG__AIKIDO_CLIENT_SECRET'),
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__AIKIDO_API_URL', variable: 'OCEAN__INTEGRATION__CONFIG__AIKIDO_API_URL'),
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__WEBHOOK_SECRET', variable: 'OCEAN__INTEGRATION__CONFIG__WEBHOOK_SECRET'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_ID', variable: 'OCEAN__PORT__CLIENT_ID'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_SECRET', variable: 'OCEAN__PORT__CLIENT_SECRET'),
                    ]) {
                        sh('''
                            #Set Docker image and run the container
                            integration_type="aikido"
                            version="latest"
                            image_name="ghcr.io/port-labs/port-ocean-${integration_type}:${version}"
                            docker run -i --rm --platform=linux/amd64 \
                                -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
                                -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
                                -e OCEAN__SEND_RAW_DATA_EXAMPLES=true \
                                -e OCEAN__INTEGRATION__CONFIG__AIKIDO_CLIENT_ID=$OCEAN__INTEGRATION__CONFIG__AIKIDO_CLIENT_ID \
                                -e OCEAN__INTEGRATION__CONFIG__AIKIDO_CLIENT_SECRET=$OCEAN__INTEGRATION__CONFIG__AIKIDO_CLIENT_SECRET \
                                -e OCEAN__INTEGRATION__CONFIG__AIKIDO_API_URL=$OCEAN__INTEGRATION__CONFIG__AIKIDO_API_URL \
                                -e OCEAN__INTEGRATION__CONFIG__WEBHOOK_SECRET=$OCEAN__INTEGRATION__CONFIG__WEBHOOK_SECRET \
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

:::tip
Your Azure Devops agent should be able to run docker commands.
:::


Make sure to configure the following variables using [Azure Devops variable groups](https://learn.microsoft.com/en-us/azure/devops/pipelines/library/variable-groups?view=azure-devops&tabs=yaml). Add them into in a variable group named `port-ocean-credentials`:

| Parameter                                     | Description                                                                                                                                                      | Required |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `OCEAN__INTEGRATION__CONFIG__AIKIDO_CLIENT_ID`           | The Aikido Client ID                                                                                                                                               | ✅       |
| `OCEAN__INTEGRATION__CONFIG__AIKIDO_CLIENT_SECRET` | The Aikido API Client Secret | ✅  |
| `OCEAN__INTEGRATION__CONFIG__WEBHOOK_SECRET` | Aikido webhook secret used to verify the webhook request                                       | ❌      |
| `OCEAN__INTEGRATION__CONFIG__AIKIDO_API_URL`         | The Aikido API URL. If not specified, the default will be https://app.aikido.dev                                                                                      | ❌       |
| `OCEAN__INITIALIZE_PORT_RESOURCES`            | Default true, When set to false the integration will not create default blueprints and the port App config Mapping                                               | ❌       |
| `OCEAN__SEND_RAW_DATA_EXAMPLES`                     | Enable sending raw data examples from the third party API to port for testing and managing the integration mapping. Default is true                       | ❌       |
| `OCEAN__INTEGRATION__IDENTIFIER`              | Change the identifier to describe your integration, if not set will use the default one                                                                          | ❌       |
| `OCEAN__PORT__CLIENT_ID`                      | Your port client id ([How to get the credentials](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials))     | ✅       |
| `OCEAN__PORT__CLIENT_SECRET`                  | Your port client ([How to get the credentials](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)) secret | ✅       |
| `OCEAN__PORT__BASE_URL`                     | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US                                                                          | ✅       |
| `OCEAN__BASE_URL`                     | The host of the Port Ocean app. Used to set up the integration endpoint as the target for webhooks created in Aikido                                                                          | ❌       |
<br/>

Here is an example for `aikido-integration.yml` pipeline file:

```yaml showLineNumbers
trigger:
- main

pool:
  vmImage: "ubuntu-latest"

variables:
  - group: port-ocean-credentials # OCEAN__PORT__CLIENT_ID, OCEAN__PORT__CLIENT_SECRET, OCEAN__INTEGRATION__CONFIG__TOKEN


steps:
- script: |
    echo Add other tasks to build, test, and deploy your project.
    # Set Docker image and run the container
    integration_type="aikido"
    version="latest"

    image_name="ghcr.io/port-labs/port-ocean-$integration_type:$version"

    docker run -i --rm \
    -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
    -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
    -e OCEAN__SEND_RAW_DATA_EXAMPLES=true \
    -e OCEAN__INTEGRATION__CONFIG__AIKIDO_CLIENT_ID=$OCEAN__INTEGRATION__CONFIG__AIKIDO_CLIENT_ID \
    -e OCEAN__INTEGRATION__CONFIG__AIKIDO_CLIENT_SECRET=$OCEAN__INTEGRATION__CONFIG__AIKIDO_CLIENT_SECRET \
    -e OCEAN__INTEGRATION__CONFIG__AIKIDO_API_URL=$OCEAN__INTEGRATION__CONFIG__AIKIDO_API_URL \
    -e OCEAN__INTEGRATION__CONFIG__WEBHOOK_SECRET=$OCEAN__INTEGRATION__CONFIG__WEBHOOK_SECRET \
    -e OCEAN__PORT__CLIENT_ID=$(OCEAN__PORT__CLIENT_ID) \
    -e OCEAN__PORT__CLIENT_SECRET=$(OCEAN__PORT__CLIENT_SECRET) \
    -e OCEAN__PORT__BASE_URL='https://api.getport.io' \
    $image_name

    exit $?
  displayName: 'Ingest Aikido Data into Port'

```

  </TabItem>
  <TabItem value="gitlab" label="GitLab">

Make sure to [configure the following GitLab variables](https://docs.gitlab.com/ee/ci/variables/#for-a-project):

| Parameter                                     | Description                                                                                                                                                      | Required |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `OCEAN__INTEGRATION__CONFIG__AIKIDO_CLIENT_ID`           | The Aikido Client ID                                                                                                                                               | ✅       |
| `OCEAN__INTEGRATION__CONFIG__AIKIDO_CLIENT_SECRET` | The Aikido API Client Secret | ✅  |
| `OCEAN__INTEGRATION__CONFIG__WEBHOOK_SECRET` | Aikido webhook secret used to verify the webhook request                                       | ❌      |
| `OCEAN__INTEGRATION__CONFIG__AIKIDO_API_URL`         | The Aikido API URL. If not specified, the default will be https://app.aikido.dev                                                                                      | ❌       |
| `OCEAN__INITIALIZE_PORT_RESOURCES`            | Default true, When set to false the integration will not create default blueprints and the port App config Mapping                                               | ❌       |
| `OCEAN__SEND_RAW_DATA_EXAMPLES`                     | Enable sending raw data examples from the third party API to port for testing and managing the integration mapping. Default is true                       | ❌       |
| `OCEAN__INTEGRATION__IDENTIFIER`              | Change the identifier to describe your integration, if not set will use the default one                                                                          | ❌       |
| `OCEAN__PORT__CLIENT_ID`                      | Your port client id ([How to get the credentials](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials))     | ✅       |
| `OCEAN__PORT__CLIENT_SECRET`                  | Your port client ([How to get the credentials](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)) secret | ✅       |
| `OCEAN__PORT__BASE_URL`                     | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US                                                                          | ✅       |
| `OCEAN__BASE_URL`                     | The host of the Port Ocean app. Used to set up the integration endpoint as the target for webhooks created in Aikido                                                                          | ❌       |


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
  INTEGRATION_TYPE: aikido
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
        -e OCEAN__INTEGRATION__CONFIG__AIKIDO_CLIENT_ID=$OCEAN__INTEGRATION__CONFIG__AIKIDO_CLIENT_ID \
        -e OCEAN__INTEGRATION__CONFIG__AIKIDO_CLIENT_SECRET=$OCEAN__INTEGRATION__CONFIG__AIKIDO_CLIENT_SECRET \
        -e OCEAN__INTEGRATION__CONFIG__AIKIDO_API_URL=$OCEAN__INTEGRATION__CONFIG__AIKIDO_API_URL \
        -e OCEAN__INTEGRATION__CONFIG__WEBHOOK_SECRET=$OCEAN__INTEGRATION__CONFIG__WEBHOOK_SECRET \
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

## Configuration

Port integrations use a [YAML mapping block](/build-your-software-catalog/customize-integrations/configure-mapping#configuration-structure) to ingest data from the third-party api into Port.

The mapping makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from the integration API.


### Webhook Configuration

To enable real-time data synchronization from Aikido to Port, you must configure webhooks in Aikido following [this guide](https://apidocs.aikido.dev/reference/webhooks). This setup allows Port to receive immediate notifications whenever relevant changes occur in Aikido.
When setting up the webhook, the URL should follow the format:

`<base_url>/integration/webhook`

:::important IMPORTANT
For security and event authenticity, we strongly recommend setting an HMAC secret in the Aikido dashboard. Once configured, make sure to set the corresponding value in your Port environment using the variable `OCEAN__INTEGRATION__CONFIG__WEBHOOK_SECRET` . This ensures Port can securely verify incoming webhook events from Aikido.
:::


### Default mapping configuration

This is the default mapping configuration for this integration:

<details>
<summary><b>Default mapping configuration (Click to expand)</b></summary>

```yaml showLineNumbers
deleteDependentEntities: true
createMissingRelatedEntities: true
enableMergeEntity: true
resources:
  - kind: repositories
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          blueprint: '"aikidoRepository"'
          identifier: .id | tostring
          title: .name
          properties:
            name: .name
            provider: .provider
            externalRepoId: .external_repo_id
            active: .active
            url: .url
            branch: .branch
            lastScannedAt: .last_scanned_at
  - kind: issues
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          blueprint: '"aikidoIssue"'
          identifier: .id | tostring
          title: .rule | tostring
          properties:
            status: .status
            severity: .severity
            severityScore: .severity_score
            affectedFile: .affected_file
            attackSurface: .attack_surface
            type: .type
            rule: .rule
            codeRepoId: .code_repo_id
            codeRepoName: .code_repo_name
          relations:
            aikidoRepository: .code_repo_id
```

</details>

<MetricsAndSyncStatus/>


## Examples

Examples of blueprints and the relevant integration configurations:

### Repository

<details>
<summary>Repository blueprint</summary>

```json showLineNumbers
{
    "identifier": "aikidoRepository",
    "title": "Aikido Repository",
    "icon": "Aikido",
    "schema": {
        "properties": {
            "name": {
                "type": "string",
                "title": "Repository Name"
            },
            "provider": {
                "type": "string",
                "title": "Provider",
                "enum": ["github", "gitlab", "gitlab-server", "bitbucket", "azure_devops", "selfscan"]
            },
            "externalRepoId": {
                "type": "string",
                "title": "External Repository ID"
            },
            "active": {
                "type": "boolean",
                "title": "Active"
            },
            "url": {
                "type": "string",
                "title": "Repository URL"
            },
            "branch": {
                "type": "string",
                "title": "Default Branch"
            },
            "lastScannedAt": {
                "type": "number",
                "title": "Last Scanned At"
            }
        },
        "required": ["name", "provider", "externalRepoId"]
    },
    "relations": {
        "aikidoIssue": {
            "title": "Issues",
            "target": "aikidoIssue",
            "required": false,
            "many": true
        }
    }
}
```

</details>

<details>
<summary>Integration configuration</summary>

```yaml showLineNumbers
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: repositories
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          blueprint: '"aikidoRepository"'
          identifier: .id | tostring
          title: .name
          properties:
            name: .name
            provider: .provider
            externalRepoId: .external_repo_id
            active: .active
            url: .url
            branch: .branch
            lastScannedAt: .last_scanned_at
```
</details>

### Issue

<details>
<summary>Issue blueprint</summary>

```json showLineNumbers
{
  "identifier": "aikidoIssue",
  "title": "Aikido Issue",
  "icon": "Aikido",
  "schema": {
      "properties": {
          "groupId": {
              "type": "number",
              "title": "Group ID"
          },
          "attackSurface": {
              "type": "string",
              "title": "Attack Surface",
              "enum": ["backend", "frontend", "infrastructure", "container"]
          },
          "status": {
              "type": "string",
              "title": "Status",
              "enum": ["open", "closed", "ignored", "snoozed"],
              "enumColors": {
                  "open": "red",
                  "closed": "green",
                  "ignored": "yellow",
                  "snoozed": "blue"
              }
          },
          "severity": {
              "type": "string",
              "title": "Severity",
              "enum": ["critical", "high", "medium", "low"]
          },
          "severityScore": {
              "type": "number",
              "title": "Severity Score"
          },
          "type": {
              "type": "string",
              "title": "Issue Type",
              "enum": ["open_source", "leaked_secret", "cloud", "iac", "sast", "mobile", "surface_monitoring", "malware", "eol", "scm_security", "license"]
          },
          "rule": {
              "type": "string",
              "title": "Rule Name"
          },
          "affectedFile": {
              "type": "string",
              "title": "Affected File"
          },
          "codeRepoName": {
              "type": "string",
              "title": "Code Repository Name"
          },
          "codeRepoId": {
              "type": "number",
              "title": "Code Repository ID"
          },
          "closedAt": {
              "type": "number",
              "title": "Closed At"
          }
      },
      "required": ["status", "severity", "type", "rule"]
  },
  "relations": {
      "aikidoRepository": {
          "title": "Repository",
          "target": "aikidoRepository",
          "required": false,
          "many": false
      }
  }
}
```

</details>

<details>
<summary>Integration configuration</summary>

```yaml showLineNumbers
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: issues
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          blueprint: '"aikidoIssue"'
          identifier: .id | tostring
          title: .rule | tostring
          properties:
            status: .status
            severity: .severity
            severityScore: .severity_score
            affectedFile: .affected_file
            attackSurface: .attack_surface
            type: .type
            rule: .rule
            codeRepoId: .code_repo_id
            codeRepoName: .code_repo_name
          relations:
            aikidoRepository: .code_repo_id
```

</details>

## Let's Test It

This section includes a sample response data from Aikido. In addition, it includes the entity created from the resync event based on the Ocean configuration provided in the previous section.

### Payload

Here is an example of the payload structure from Aikido:

<details>
<summary>Repository response data</summary>

```json showLineNumbers
{
  "id": 1,
  "name": "Compression service",
  "provider": "github",
  "external_repo_id": "R_kgDOI5RlKA",
  "active": true,
  "url": "https://api.github.com/repos/aikidemo/compression-service",
  "branch": "main",
  "last_scanned_at": 1720083163
}
```

</details>

<details>
<summary>Issue response data</summary>

```json showLineNumbers
{
    "id": 1,
    "group_id": 1,
    "attack_surface": "backend",
    "status": "open",
    "severity": 90,
    "severity_score": "critical",
    "type": "open_source",
    "rule": "SQL injection",
    "rule_id": "aik_cloud_aws_001",
    "affected_package": "minimist",
    "affected_file": "index.php",
    "first_detected_at": 1700489005,
    "code_repo_name": "test-service",
    "code_repo_id": 1,
    "container_repo_id": 1,
    "container_repo_name": "aikido/test-service",
    "sla_days": 5,
    "sla_remediate_by": 1700924603,
    "ignored_at": null,
    "ignored_by": "user",
    "closed_at": null,
    "start_line": 68,
    "end_line": 70,
    "snooze_until": null,
    "cwe_classes": [
      "CWE-89"
    ],
    "installed_version": "4.2.0",
    "patched_versions": [
      "4.2.1",
      "5.0.0"
    ],
    "license": null,
    "programming_language": "PHP"
}
```

</details>

