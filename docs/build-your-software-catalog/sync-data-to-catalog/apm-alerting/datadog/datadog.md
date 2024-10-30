import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortTooltip from "/src/components/tooltip/tooltip.jsx"
import Prerequisites from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/\_ocean_helm_prerequisites_block.mdx"
import AzurePremise from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/\_ocean_azure_premise.mdx"
import HelmParameters from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/\_ocean-advanced-parameters-helm.mdx"
import DockerParameters from "./\_datadog_one_time_docker_parameters.mdx"
import AdvancedConfig from '/docs/generalTemplates/\_ocean_advanced_configuration_note.md'
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"
import OceanSaasInstallation from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_saas_installation.mdx"
import DatadogBlueprint from "../resources/datadog/\_example_datadog_alert_blueprint.mdx";
import DatadogConfiguration from "../resources/datadog/\_example_datadog_webhook_configuration.mdx"
import DatadogMicroserviceBlueprint from "../resources/datadog/\_example_datadog_microservice.mdx"

# Datadog

Port's Datadog integration allows you to model Datadog resources in Port and ingest data into them.

## Overview

This integration allows you to:

- Map and organize your desired Datadog resources and their metadata in Port (see supported resources below).
- Watch for Datadog object changes (create/update/delete) in real-time, and automatically apply the changes to your software catalog.

### Supported Resources

- [`Monitor`](https://docs.datadoghq.com/api/latest/monitors/#get-all-monitor-details)
- [`Service`](https://docs.datadoghq.com/api/latest/service-definition/#get-all-service-definitions)
- [`SLO`](https://docs.datadoghq.com/api/latest/service-level-objectives/#get-all-slos)
- [`SLO History`](https://docs.datadoghq.com/api/latest/service-level-objectives/#get-an-slos-history)
- [`Service Metric`](https://docs.datadoghq.com/api/latest/metrics/#query-timeseries-points)



## Setup

Choose one of the following installation methods:

<Tabs groupId="installation-methods" queryString="installation-methods">

<TabItem value="hosted-by-port" label="Hosted by Port" default>

<OceanSaasInstallation/>

</TabItem>

<TabItem value="real-time-self-hosted" label="Real-time (Self-hosted)">

Using this installation option means that the integration will be able to update Port in real time using webhooks.

<h2> Prerequisites </h2>

<Prerequisites />

This table summarizes the available parameters for the installation.
Set them as you wish in the script below, then copy it and run it in your terminal:

| Parameter                                | Description                                                                                                                                | Example                          | Required |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------- | ------- |
| `port.clientId`                          | Your port [client id](https://docs.getport.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)            |                                  | ✅      |
| `port.clientSecret`                      | Your port [client secret](https://docs.getport.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)        |                                  | ✅      |
| `port.baseUrl`                | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US |                                  | ✅      |
| `integration.secrets.datadogApiKey`       | Datadog API key, docs can be found [here](https://docs.datadoghq.com/account_management/api-app-keys/#add-an-api-key-or-client-token)     |         | ✅      |
| `integration.secrets.datadogApplicationKey`         | Datadog application key, docs can be found [here](https://docs.datadoghq.com/account_management/api-app-keys/#add-application-keys)     |                  | ✅      |
| `integration.config.datadogBaseUrl` | The base Datadog host. Defaults to https://api.datadoghq.com. If in EU, use https://api.datadoghq.eu |    | ✅      |
| `integration.secrets.datadogWebhookToken`  | Datadog webhook token. Learn [more](https://docs.datadoghq.com/integrations/webhooks/#setup)    |      | ❌      |
| `integration.config.appHost`             | The host of the Port Ocean app. Used to set up the integration endpoint as the target for webhooks created in Datadog                         | https://my-ocean-integration.com | ✅       |

<HelmParameters/>

<br/>
<Tabs groupId="deploy" queryString="deploy">

<TabItem value="helm" label="Helm" default>
To install the integration using Helm, run the following command:

```bash showLineNumbers
helm repo add --force-update port-labs https://port-labs.github.io/helm-charts
helm upgrade --install my-datadog-integration port-labs/port-ocean \
  --set port.clientId="PORT_CLIENT_ID"  \
  --set port.clientSecret="PORT_CLIENT_SECRET"  \
  --set port.baseUrl="https://api.getport.io"  \
  --set initializePortResources=true  \
  --set scheduledResyncInterval=60 \
  --set integration.identifier="my-datadog-integration"  \
  --set integration.type="datadog"  \
  --set integration.eventListener.type="POLLING"  \
  --set integration.config.datadogBaseUrl="https://api.datadoghq.com"  \
  --set integration.secrets.datadogApiKey="<your-datadog-api-key>"  \
  --set integration.secrets.datadogApplicationKey="<your-datadog-application-key>" 
```

<PortApiRegionTip/>

</TabItem>
<TabItem value="argocd" label="ArgoCD" default>
To install the integration using ArgoCD, follow these steps:

1. Create a `values.yaml` file in `argocd/my-ocean-datadog-integration` in your git repository with the content:

:::info Note
Remember to replace the placeholder for `DATADOG_BASE_URL`, `DATADOG_API_KEY` and `DATADOG_APPLICATION_KEY`.
:::

```yaml showLineNumbers
initializePortResources: true
scheduledResyncInterval: 60
integration:
  identifier: my-ocean-datadog-integration
  type: datadog
  eventListener:
    type: POLLING
  config:
    datadogBaseUrl: DATADOG_BASE_URL
  secrets:
    datadogApiKey: DATADOG_API_KEY
    datadogApplicationKey: DATADOG_APPLICATION_KEY
```

<br/>

1. Install the `my-ocean-datadog-integration` ArgoCD Application by creating the following `my-ocean-datadog-integration.yaml` manifest:

:::note Replace placeholders

Remember to replace the placeholders for `YOUR_PORT_CLIENT_ID` `YOUR_PORT_CLIENT_SECRET` and `YOUR_GIT_REPO_URL`.  
Multiple sources ArgoCD documentation can be found [here](https://argo-cd.readthedocs.io/en/stable/user-guide/multiple_sources/#helm-value-files-from-external-git-repository).

:::

<details>
  <summary>ArgoCD Application</summary>

```yaml showLineNumbers
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: my-ocean-datadog-integration
  namespace: argocd
spec:
  destination:
    namespace: mmy-ocean-datadog-integration
    server: https://kubernetes.default.svc
  project: default
  sources:
  - repoURL: 'https://port-labs.github.io/helm-charts/'
    chart: port-ocean
    targetRevision: 0.1.14
    helm:
      valueFiles:
      - $values/argocd/my-ocean-datadog-integration/values.yaml
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
kubectl apply -f my-ocean-datadog-integration.yaml
```

</TabItem>
</Tabs>

<AdvancedConfig/>

</TabItem>

<TabItem value="one-time-ci" label="Scheduled (CI)">

  <Tabs groupId="cicd-method" queryString="cicd-method">
  <TabItem value="github" label="GitHub">
This workflow will run the Datadog integration once and then exit, this is useful for **scheduled** ingestion of data.

:::warning Realtime updates in Port
If you want the integration to update Port in real time using webhooks you should use the [Real Time & Always On](?installation-methods=real-time-always-on#installation) installation option.
:::

Make sure to configure the following [Github Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions):

| Parameter                        | Description                                                                                                                                                                                                                                                                              | Example                       | Required |
|----------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------|----------|
| `port_client_id`                 | Your Port client ([How to get the credentials](https://docs.getport.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)) id                                                                                                                               |                               | ✅        |
| `port_client_secret`             | Your Port client ([How to get the credentials](https://docs.getport.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)) secret                                                                                                                           |                               | ✅        |
| `port_base_url`             | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US |                               | ✅        |
| `config -> datadog_base_url` | US: https://api.datadoghq.com EU: https://api.datadoghq.eu   |               | ✅        |
| `config -> datadog_api_key` | Datadog API key, docs can be found [here](https://docs.datadoghq.com/account_management/api-app-keys/#add-an-api-key-or-client-token)  |               | ✅        |
| `config -> datadog_application_key` | Datadog application key, docs can be found [here](https://docs.datadoghq.com/account_management/api-app-keys/#add-application-keys)    |               | ✅        |
| `config -> datadog_webhook_token` | Datadog webhook token. Learn [more](https://docs.datadoghq.com/integrations/webhooks/#setup)    |      | ❌       |
| `initialize_port_resources`      | Default true, When set to true the integration will create default blueprints and the port App config Mapping. Read more about [initializePortResources](https://ocean.getport.io/develop-an-integration/integration-configuration/#initializeportresources---initialize-port-resources) |                               | ❌        |
| `identifier`                     | The identifier of the integration that will be installed                                                                                                                                                                                                                                 |                               | ❌        |
| `version`                        | The version of the integration that will be installed                                                                                                                                                                                                                                    | latest                        | ❌        |`

<br/>

:::tip Ocean Sail Github Action
The following example uses the **Ocean Sail** Github Action to run the Datadog integration.
For further information about the action, please visit the [Ocean Sail Github Action](https://github.com/marketplace/actions/ocean-sail)
:::

<br/>

Here is an example for `datadog-integration.yml` workflow file:

```yaml showLineNumbers
name: Datadog Exporter Workflow

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
          type: 'datadog'
          port_client_id: ${{ secrets.OCEAN__PORT__CLIENT_ID }}
          port_client_secret: ${{ secrets.OCEAN__PORT__CLIENT_SECRET }}
          port_base_url: https://api.getport.io
          config: |
            datadog_base_url: https://api.datadoghq.com     
            datadog_api_key: ${{ secrets.DATADOG_API_KEY }}
            datadog_application_key:  ${{ secrets.DATADOG_APP_KEY }}
```

  </TabItem>
  <TabItem value="jenkins" label="Jenkins">
This pipeline will run the Datadog integration once and then exit, this is useful for **scheduled** ingestion of data.

:::tip Tip for Jenkins agent
Your Jenkins agent should be able to run docker commands.
:::

:::warning Realtime updates in Port
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
        stage('Run Datadog Integration') {
            steps {
                script {
                    withCredentials([
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__DATADOG_API_KEY', variable: 'OCEAN__INTEGRATION__CONFIG__DATADOG_API_KEY'),
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__DATADOG_APPLICATION_KEY', variable: 'OCEAN__INTEGRATION__CONFIG__DATADOG_APPLICATION_KEY'),
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__DATADOG_BASE_URL', variable: 'OCEAN__INTEGRATION__CONFIG__DATADOG_BASE_URL'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_ID', variable: 'OCEAN__PORT__CLIENT_ID'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_SECRET', variable: 'OCEAN__PORT__CLIENT_SECRET'),
                    ]) {
                        sh('''
                            #Set Docker image and run the container
                            integration_type="datadog"
                            version="latest"
                            image_name="ghcr.io/port-labs/port-ocean-${integration_type}:${version}"
                            docker run -i --rm --platform=linux/amd64 \
                                -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
                                -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
                                -e OCEAN__INTEGRATION__CONFIG__DATADOG_API_KEY=$OCEAN__INTEGRATION__CONFIG__DATADOG_API_KEY \
                                -e OCEAN__INTEGRATION__CONFIG__DATADOG_APPLICATION_KEY=$OCEAN__INTEGRATION__CONFIG__DATADOG_APPLICATION_KEY \
                                -e OCEAN__INTEGRATION__CONFIG__DATADOG_BASE_URL=$OCEAN__INTEGRATION__CONFIG__DATADOG_BASE_URL \
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

<AzurePremise name="Datadog" />

<DockerParameters />

<br/>

Here is an example for `datadog-integration.yml` pipeline file:

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
      integration_type="datadog"
      version="latest"

      image_name="ghcr.io/port-labs/port-ocean-$integration_type:$version"

      docker run -i --rm \
        -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
        -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
        -e OCEAN__INTEGRATION__CONFIG__DATADOG_API_KEY=$(OCEAN__INTEGRATION__CONFIG__DATADOG_API_KEY) \
        -e OCEAN__INTEGRATION__CONFIG__DATADOG_APPLICATION_KEY=$(OCEAN__INTEGRATION__CONFIG__DATADOG_APPLICATION_KEY) \
        -e OCEAN__INTEGRATION__CONFIG__DATADOG_BASE_URL=$(OCEAN__INTEGRATION__CONFIG__DATADOG_BASE_URL) \
        -e OCEAN__PORT__CLIENT_ID=$(OCEAN__PORT__CLIENT_ID) \
        -e OCEAN__PORT__CLIENT_SECRET=$(OCEAN__PORT__CLIENT_SECRET) \
        -e OCEAN__PORT__BASE_URL='https://api.getport.io' \
        $image_name

      exit $?
    displayName: "Ingest Data into Port"
```

  </TabItem>

  <TabItem value="gitlab" label="GitLab">
This workflow will run the Datadog integration once and then exit, this is useful for **scheduled** ingestion of data.

:::warning Realtime updates in Port
If you want the integration to update Port in real time using webhooks you should use the [Real Time & Always On](?installation-methods=real-time-always-on#installation) installation option.
:::

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
  INTEGRATION_TYPE: datadog
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
        -e OCEAN__INTEGRATION__CONFIG__DATADOG_API_KEY=$OCEAN__INTEGRATION__CONFIG__DATADOG_API_KEY \
        -e OCEAN__INTEGRATION__CONFIG__DATADOG_APPLICATION_KEY=$OCEAN__INTEGRATION__CONFIG__DATADOG_APPLICATION_KEY \
        -e OCEAN__INTEGRATION__CONFIG__DATADOG_BASE_URL=$OCEAN__INTEGRATION__CONFIG__DATADOG_BASE_URL \
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

## Examples

To view and test the integration's mapping against examples of the third-party API responses, use the jq playground in your [data sources page](https://app.getport.io/settings/data-sources). Find the integration in the list of data sources and click on it to open the playground.

Additional examples of blueprints and the relevant integration configurations can be found on the datadog [examples page](example.md)


## Relevant Guides

For relevant guides and examples, see the [guides section](https://docs.getport.io/guides?tags=Datadog).


## Alternative installation via webhook

While the Ocean integration described above is the recommended installation method, you may prefer to use a webhook to ingest alerts and monitor data from Datadog. If so, use the following instructions:

**Note** that when using this method, data will be ingested into Port only when the webhook is triggered.

<details>
<summary><b>Webhook installation (click to expand)</b></summary>

<h2>Port configuration</h2>

Create the following blueprint definitions:

<details>
<summary>Datadog microservice blueprint</summary>
<DatadogMicroserviceBlueprint/>
</details>

<details>
<summary>Datadog alert/monitor blueprint</summary>
<DatadogBlueprint/>
</details>

Create the following webhook configuration [using Port UI](/build-your-software-catalog/custom-integration/webhook/?operation=ui#configuring-webhook-endpoints):

<details>
<summary>Datadog webhook configuration</summary>

1. **Basic details** tab - fill the following details:
   1. Title : `Datadog Alert Mapper`;
   2. Identifier : `datadog_alert_mapper`;
   3. Description : `A webhook configuration for alerts/monitors events from Datadog`;
   4. Icon : `Datadog`;
2. **Integration configuration** tab - fill the following JQ mapping:

   <DatadogConfiguration/>

3. Click **Save** at the bottom of the page.

</details>

:::note
The webhook configuration's relation mapping will function properly only when the identifiers of the Port microservice entities match the names of the services or hosts in your Datadog.
:::

<h2>Create a webhook in Datadog</h2>

1. Log in to Datadog with your credentials.
2. Click on **Integrations** at the left sidebar of the page.
3. Search for **Webhooks** in the search box and select it.
4. Go to the **Configuration** tab and follow the installation instructions.
5. Click on **New**.
6. Input the following details:
   1. `Name` - use a meaningful name such as Port_Webhook.
   2. `URL` - enter the value of the `url` key you received after [creating the webhook configuration](/build-your-software-catalog/custom-integration/webhook#configuring-webhook-endpoints).
   3. `Payload` - When an alert is triggered on your monitors, this payload will be sent to the webhook URL. You can enter this JSON placeholder in the textbox:

      ```json showLineNumbers
      {
        "id": "$ID",
        "message": "$TEXT_ONLY_MSG",
        "priority": "$PRIORITY",
        "last_updated": "$LAST_UPDATED",
        "event_type": "$EVENT_TYPE",
        "event_url": "$LINK",
        "service": "$HOSTNAME",
        "creator": "$USER",
        "title": "$EVENT_TITLE",
        "date": "$DATE",
        "org_id": "$ORG_ID",
        "org_name": "$ORG_NAME",
        "alert_id": "$ALERT_ID",
        "alert_metric": "$ALERT_METRIC",
        "alert_status": "$ALERT_STATUS",
        "alert_title": "$ALERT_TITLE",
        "alert_type": "$ALERT_TYPE",
        "tags": "$TAGS"
      }
      ```

   4. `Custom Headers` - configure any custom HTTP header to be added to the webhook event. The format for the header should be in JSON.
7. Click **Save** at the bottom of the page.

:::tip
 To view the different payloads and structure of the events in Datadog webhooks,
[look here](https://docs.datadoghq.com/integrations/webhooks/#variables).
:::

Done! Any problem detected on your Datadog instance will trigger a webhook event. Port will parse the events according to the mapping and update the catalog entities accordingly.

<h2>Let's Test It</h2>

This section includes a sample response data from Datadog. In addition, it includes the entity created from the resync event based on the Ocean configuration provided in the previous section.

<h3>Payload</h3>

Here is an example of the payload structure from Datadog:

<details>
<summary><b>Webhook response data (Click to expand)</b></summary>

```json showLineNumbers
{
  "id": "1234567890",
  "message": "This is a test message",
  "priority": "normal",
  "last_updated": "2022-01-01T00:00:00+00:00",
  "event_type": "triggered",
  "event_url": "https://app.datadoghq.com/event/jump_to?event_id=1234567890",
  "service": "my-service",
  "creator": "rudy",
  "title": "[Triggered] [Memory Alert]",
  "date": "1406662672000",
  "org_id": "123456",
  "org_name": "my-org",
  "alert_id": "1234567890",
  "alert_metric": "system.load.1",
  "alert_status": "system.load.1 over host:my-host was > 0 at least once during the last 1m",
  "alert_title": "[Triggered on {host:ip-012345}] Host is Down",
  "alert_type": "error",
  "tags": "monitor, name:myService, role:computing-node"
}
```

</details>

<h3>Mapping Result</h3>

The combination of the sample payload and the Ocean configuration generates the following Port entity:

<details>
<summary><b>Alert entity in Port (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "1234567890",
  "title": "[Triggered] [Memory Alert]",
  "blueprint": "datadogAlert",
  "team": [],
  "icon": "Datadog",
  "properties": {
    "url": "https://app.datadoghq.com/event/jump_to?event_id=1234567890",
    "message": "This is a test message",
    "eventType": "triggered",
    "priority": "normal",
    "creator": "rudy",
    "alertMetric": "system.load.1",
    "alertType": "error",
    "tags": "monitor, name:myService, role:computing-node"
  },
  "relations": {
    "microservice": "my-service"
  },
  "createdAt": "2024-2-6T09:30:57.924Z",
  "createdBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW",
  "updatedAt": "2024-2-6T11:49:20.881Z",
  "updatedBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW"
}
```

</details>

<h2>Ingest service level objectives (SLOs)</h2>

This guide will walk you through the steps to ingest Datadog SLOs into Port. By following these steps, you will be able to create a blueprint for a `microservice` entity in Port, representing a service in your Datadog account. Furthermore, you will establish a relation between this service and the `datadogSLO` blueprint, allowing the ingestion of all defined SLOs from your Datadog account.

The provided example demonstrates how to pull data from Datadog's REST API at scheduled intervals using GitLab Pipelines and report the data to Port.

- [GitLab CI Pipeline Example](https://github.com/port-labs/datadog-slo-example)

<h2>Ingest service dependency from your APM</h2>

In this example, you will create a `service` blueprint that ingests all services and their related dependencies in your Datadog APM using REST API. You will then add some shell script to create new entities in Port every time GitLab CI is triggered by a schedule.

- [GitLab CI Pipeline Example](https://github.com/port-labs/datadog-service-dependency-example)

<h2>Ingest service catalog</h2>

In this example, you will create a `datadogServiceCatalog` blueprint that ingests all service catalogs from your Datadog account. You will then add some python script to make API calls to Datadog REST API and fetch data for your account.

- [Code Repository Example](https://github.com/port-labs/datadog-service-catalog)

</details>


