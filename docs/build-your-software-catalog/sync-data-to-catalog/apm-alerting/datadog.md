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

# Datadog

Our Datadog integration allows you to import `monitors` (also known as alerts), `services`,  `slos`, and `sloHistory` from your Datadog account into Port, according to your mapping and definition.

## Common use cases

- Map monitors, services, slos and slo history in your Datadog workspace environment.
- Watch for object changes (create/update/delete) in real-time, and automatically apply the changes to your entities in Port.
- Create/delete Datadog objects using self-service actions.

## Prerequisites

<Prerequisites />

## Installation

Choose one of the following installation methods:

<Tabs groupId="installation-methods" queryString="installation-methods">

<TabItem value="hosted-by-port" label="Hosted by Port" default>

<OceanSaasInstallation/>

</TabItem>

<TabItem value="real-time-always-on" label="Real Time & Always On">

Using this installation option means that the integration will be able to update Port in real time using webhooks.

This table summarizes the available parameters for the installation.
Set them as you wish in the script below, then copy it and run it in your terminal:

| Parameter                                | Description                                                                                                                                | Example                          | Required |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------- | -------- |
| `port.clientId`                          | Your port [client id](https://docs.getport.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)            |                                  | ✅       |
| `port.clientSecret`                      | Your port [client secret](https://docs.getport.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)        |                                  | ✅       |
| `port.baseUrl`                | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US |                                  | ✅       |
| `integration.secrets.datadogApiKey`       | Datadog API key, docs can be found [here](https://docs.datadoghq.com/account_management/api-app-keys/#add-an-api-key-or-client-token)     |         | ✅       |
| `integration.secrets.datadogApplicationKey`         | Datadog application key, docs can be found [here](https://docs.datadoghq.com/account_management/api-app-keys/#add-application-keys)     |                  | ✅       |
| `integration.config.datadogBaseUrl` | The base Datadog host. Defaults to https://api.datadoghq.com. If in EU, use https://api.datadoghq.eu |    | ✅       |
| `integration.secrets.datadogWebhookToken`  | Datadog webhook token. Learn [more](https://docs.datadoghq.com/integrations/webhooks/#setup)    |      | ❌       |
| `integration.config.appHost`             | The host of the Port Ocean app. Used to set up the integration endpoint as the target for webhooks created in Datadog                         | https://my-ocean-integration.com | ❌       |

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

<TabItem value="one-time" label="Scheduled">

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

# This workflow is responsible for running Datadog exporter.

on:
  workflow_dispatch:

jobs:
  run-integration:
    runs-on: ubuntu-latest

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

## Ingesting Datadog objects

The Datadog integration uses a YAML configuration to describe the process of loading data into the developer portal.

Here is an example snippet from the config which demonstrates the process for getting `service` data from Datadog:

```yaml showLineNumbers
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: service
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          blueprint: '"datadogService"'
          identifier: .attributes.schema."dd-service"
          title: .attributes.schema."dd-service"
          properties:
            application: .attributes.schema.application
            languages: .attributes.schema.languages
            description: .attributes.schema.description
            tags: .attributes.schema.tags
            type: .attributes.schema.type
            links: .attributes.schema.links | map(.url)
            owners: '[.attributes.schema.contacts[] | select(.type == "email") | .contact]'
```

The integration makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from Datadog's API events.

:::info Additional parameters
In the example above, two additional parameters are used:  
`createMissingRelatedEntities` - used to enable the creation of missing related entities in Port. This is useful when you want to create an entity and its related entities in one call, or if you want to create an entity whose related entity does not exist yet.

`deleteDependentEntities` - used to enable deletion of dependent Port entities. This is useful when you have two blueprints with a required relation, and the target entity in the relation should be deleted. In this scenario, the delete operation will fail if this parameter is set to `false`. If set to `true`, the source entity will be deleted as well.
:::

### Configuration structure

The integration configuration determines which resources will be queried from Datadog, and which entities and properties will be created in Port.

:::tip Supported resources (`Kind`)
The following resources can be used to map data from Datadog, it is possible to reference any field that appears in the API responses linked below for the mapping configuration.

- [`Monitor`](https://docs.datadoghq.com/api/latest/monitors/#get-all-monitor-details)
- [`Service`](https://docs.datadoghq.com/api/latest/service-definition/#get-all-service-definitions)
- [`SLO`](https://docs.datadoghq.com/api/latest/service-level-objectives/#get-all-slos)
- [`SLO History`](https://docs.datadoghq.com/api/latest/service-level-objectives/#get-an-slos-history)
  :::

- The root key of the integration configuration is the `resources` key:

  ```yaml showLineNumbers
  # highlight-next-line
  resources:
    - kind: service
      selector:
      ...
  ```

- The `kind` key is a specifier for a Datadog object:

  ```yaml showLineNumbers
    resources:
      # highlight-next-line
      - kind: service
        selector:
        ...
  ```

- The `selector` and the `query` keys allow you to filter which objects of the specified `kind` will be ingested into your software catalog:

  ```yaml showLineNumbers
  resources:
    - kind: service
      # highlight-start
      selector:
        query: "true" # JQ boolean expression. If evaluated to false - this object will be skipped.
      # highlight-end
      port:
  ```

- The `port`, `entity` and the `mappings` keys are used to map the Datadog object fields to Port entities. To create multiple mappings of the same kind, you can add another item in the `resources` array;

  ```yaml showLineNumbers
  resources:
    - kind: service
      selector:
        query: "true"
      port:
        # highlight-start
        entity:
        mappings: # Mappings between one Datadog object to a Port entity. Each value is a JQ query.
          blueprint: '"datadogService"'
          identifier: .attributes.schema."dd-service"
          title: .attributes.schema."dd-service"
          properties:
            application: .attributes.schema.application
            languages: .attributes.schema.languages
            description: .attributes.schema.description
            tags: .attributes.schema.tags
            type: .attributes.schema.type
            links: .attributes.schema.links | map(.url)
            owners: '[.attributes.schema.contacts[] | select(.type == "email") | .contact]'
        # highlight-end
    - kind: service # In this instance project is mapped again with a different filter
      selector:
        query: '.name == "MyServiceName"'
      port:
        entity:
          mappings: ...
  ```

:::tip Blueprint key
Note the value of the `blueprint` key - if you want to use a hardcoded string, you need to encapsulate it in 2 sets of quotes, for example use a pair of single-quotes (`'`) and then another pair of double-quotes (`"`)
:::

### Ingest data into Port

To ingest Datadog objects using the [integration configuration](#configuration-structure), you can follow the steps below:

1. Go to the DevPortal Builder page.
2. Select a blueprint you want to ingest using Datadog.
3. Choose the **Ingest Data** option from the menu.
4. Click on `+ Data source` at the top right corner
5. Select Datadog under the APM & Alerting providers category.
6. Modify the [configuration](#configuration-structure) according to your needs.
7. Click `Resync`.

## Examples

Examples of blueprints and the relevant integration configurations:

### Monitor

<details>
<summary>Monitor blueprint</summary>

```json showLineNumbers
{
  "identifier": "datadogMonitor",
  "description": "This blueprint represents a datadog monitor",
  "title": "Datadog Monitor",
  "icon": "Datadog",
  "schema": {
    "properties": {
      "monitorType": {
        "type": "string",
        "title": "Monitor Type"
      },
      "tags": {
        "type": "array",
        "title": "Tags"
      },
      "overallState": {
        "type": "string",
        "title": "Overall state",
        "enum": ["Alert", "Ignored", "No Data", "OK", "Skipped", "Unknown", "Warn"],
        "enumColors": {
          "Alert": "red",
          "Ignored": "darkGray",
          "No Data": "lightGray",
          "OK": "green",
          "Skipped": "yellow",
          "Unknown": "purple",
          "Warn": "orange"
        }
      },
      "priority": {
        "type": "string",
        "title": "Priority"
      },
      "thresholds": {
        "type": "object",
        "title": "Thresholds"
      },
      "createdBy": {
        "type": "string",
        "title": "Creator"
      },
      "createdAt": {
        "title": "Created At",
        "type": "string",
        "format": "date-time"
      },
      "updatedAt": {
        "title": "Updated At",
        "type": "string",
        "format": "date-time"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "relations": {}
}
```

</details>

<details>
<summary>Integration configuration</summary>

```yaml showLineNumbers
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: monitor
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          blueprint: '"datadogMonitor"'
          identifier: .id | tostring
          title: .name
          properties:
            tags: .tags
            monitorType: .type
            overallState: .overall_state
            thresholds: .thresholds
            priority: .priority
            createdBy: .creator.email
            createdAt: .created
            updatedAt: .modified
```

</details>

### Service

<details>
<summary>Service blueprint</summary>

```json showLineNumbers
{
  "identifier": "datadogService",
  "description": "This blueprint represents a Datadog service",
  "title": "Datadog Service",
  "icon": "Datadog",
  "schema": {
    "properties": {
      "application": {
        "title": "Application",
        "type": "string"
      },
      "description": {
        "title": "Description",
        "type": "string"
      },
      "tags": {
        "type": "array",
        "items": {
          "type": "string"
        },
        "title": "Tags"
      },
      "languages": {
        "items": {
          "type": "string"
        },
        "title": "Languages",
        "type": "array"
      },
      "type": {
        "title": "Type",
        "type": "string",
        "enum": [
          "web",
          "db",
          "custom",
          "cache",
          "function",
          "browser",
          "mobile"
        ],
        "enumColors": {
          "web": "lightGray",
          "db": "lightGray",
          "custom": "lightGray",
          "cache": "lightGray",
          "function": "lightGray",
          "browser": "lightGray",
          "mobile": "lightGray"
        }
      },
      "owners": {
        "type": "array",
        "title": "Service Owners",
        "items": {
          "type": "string"
        }
      },
      "links": {
        "title": "Service Links",
        "type": "array",
        "description": "Links to external resources and repositories",
        "items": {
          "type": "string",
          "format": "url"
        }
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {}
}
```

</details>

<details>
<summary>Integration configuration</summary>

```yaml showLineNumbers
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: service
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          blueprint: '"datadogService"'
          identifier: .attributes.schema."dd-service"
          title: .attributes.schema."dd-service"
          properties:
            application: .attributes.schema.application
            languages: .attributes.schema.languages
            description: .attributes.schema.description
            tags: .attributes.schema.tags
            type: .attributes.schema.type
            links: .attributes.schema.links | map(.url)
            owners: '[.attributes.schema.contacts[] | select(.type == "email") | .contact]'
```

</details>

### SLO

<details>
<summary>SLO blueprint</summary>

```json showLineNumbers
{
  "identifier": "datadogSlo",
  "description": "This blueprint represents a datadog SLO",
  "title": "Datadog SLO",
  "icon": "Datadog",
  "schema": {
    "properties": {
      "tags": {
        "type": "array",
        "title": "Tags"
      },
      "sloType": {
        "title": "Type",
        "type": "string"
      },
      "description": {
        "title": "Description",
        "type": "string"
      },
      "warningThreshold": {
        "icon": "DefaultProperty",
        "title": "Warning Threshold",
        "type": "number"
      },
      "targetThreshold": {
        "icon": "DefaultProperty",
        "title": "Target Threshold",
        "type": "number"
      },
      "createdAt": {
        "title": "Created At",
        "type": "string",
        "format": "date-time"
      },
      "updatedAt": {
        "title": "Updated At",
        "type": "string",
        "format": "date-time"
      },
      "createdBy": {
        "title": "Creator",
        "type": "string"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {
    "sli_average": {
      "title": "SLI Average",
      "type": "number",
      "target": "datadogSloHistory",
      "calculationSpec": {
        "func": "average",
        "averageOf": "total",
        "property": "sliValue",
        "measureTimeBy": "$createdAt",
        "calculationBy": "property"
      }
    }
  },
  "relations": {
    "monitors": {
      "title": "SLO Monitors",
      "description": "The monitors tracking this SLO",
      "target": "datadogMonitor",
      "required": false,
      "many": true
    },
    "services": {
      "title": "Services",
      "description": "The services tracked by this SLO",
      "target": "datadogService",
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
  - kind: slo
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: .id | tostring
          title: .name
          blueprint: '"datadogSlo"'
          properties:
            tags: .tags
            sloType: .type
            description: .description
            warningThreshold: .warning_threshold
            targetThreshold: .target_threshold
            createdBy: .creator.email
            createdAt: .created_at | todate
            updatedAt: .modified_at | todate
          relations:
            monitors: .monitor_ids | map(tostring)
            services: >-
              .monitor_tags + .tags | map(select(startswith("service:"))) |
              unique | map(split(":")[1])
```
:::tip Service Relation
Based on the [best practices for tagging infrastructure](https://www.datadoghq.com/blog/tagging-best-practices/), the default mapping connects SLOs to services using tags that starts with the `service` keyword.
:::
</details>

### SLO history

<details>
<summary>SLO history blueprint</summary>

```json showLineNumbers
{
  "identifier": "datadogSloHistory",
  "description": "This blueprint represents a datadog SLO history",
  "title": "Datadog SLO History",
  "icon": "Datadog",
  "schema": {
    "properties": {
      "monitor_type": {
        "icon": "DefaultProperty",
        "title": "Type",
        "type": "string"
      },
      "sliValue": {
        "icon": "DefaultProperty",
        "title": "SLI Value",
        "type": "number"
      },
      "sampling_start_date": {
        "icon": "DefaultProperty",
        "type": "string",
        "title": "Sampling Start Date",
        "format": "date-time"
      },
      "sampling_end_date": {
        "icon": "DefaultProperty",
        "type": "string",
        "title": "Sampling End Date",
        "format": "date-time"
      }
    },
    "required": []
  },
  "mirrorProperties": {
    "slo_target": {
      "title": "SLO Target",
      "path": "slo.targetThreshold"
    },
    "slo_warning_threshold": {
      "title": "SLO Warning Threshold",
      "path": "slo.warningThreshold"
    }
  },
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {
    "slo": {
      "title": "SLO",
      "description": "The SLO to which this history belongs to",
      "target": "datadogSlo",
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
  - kind: sloHistory
    selector:
      query: 'true'
      sampleIntervalPeriodInDays: 7
    port:
      entity:
        mappings:
          identifier: .slo.id | tostring
          title: .slo.name
          blueprint: '"datadogSloHistory"'
          properties:
            monitory_type: .type
            sampling_start_date: .from_ts | todate
            sampling_end_date: .to_ts | todate
            sliValue: .overall.sli_value
          relations:
            slo: .slo.id
```
:::tip Service Relation
Based on the [best practices for tagging infrastructure](https://www.datadoghq.com/blog/tagging-best-practices/), the default JQ maps SLOs to services using tags that starts with the `service` keyword
:::
</details>


## Let's Test It

This section includes a sample response data from Datadog. In addition, it includes the entity created from the resync event based on the Ocean configuration provided in the previous section.

### Payload

Here is an example of the payload structure from Datadog:

<details>
<summary> Monitor response data</summary>

```json showLineNumbers
{
  "id":15173866,
  "org_id":1000147697,
  "type":"query alert",
  "name":"A change @webhook-PORT",
  "message":"A change has happened",
  "tags":[
    "app:webserver"
  ],
  "query":"change(avg(last_5m),last_1h):avg:datadog.agent.running{local} by {version,host} > 40",
  "options":{
    "thresholds":{
        "critical":40.0,
        "warning":30.0
    },
    "notify_audit":false,
    "include_tags":true,
    "new_group_delay":60,
    "notify_no_data":false,
    "timeout_h":0,
    "silenced":{
        
    }
  },
  "multi":true,
  "created_at":1706707941000,
  "created":"2024-01-31T13:32:21.270116+00:00",
  "modified":"2024-02-02T16:31:40.516062+00:00",
  "deleted":"None"[
    "REDACTED"
  ],
  "restricted_roles":"None"[
    "REDACTED"
  ],
  "priority":5,
  "overall_state_modified":"2024-03-08T20:52:46+00:00",
  "overall_state":"No Data",
  "creator":{
    "name":"John Doe",
    "email":"john.doe@gmail.com",
    "handle":"john.doe@gmail.com",
    "id":1001199545
  },
  "matching_downtimes":[
    
  ]
}
```

</details>

<details>
<summary>Service response data</summary>

```json showLineNumbers
{
   "type":"service-definition",
   "id":"04fbab48-a233-4592-8c53-d1bfe282e6c3",
   "attributes":{
      "meta":{
         "last-modified-time":"2024-05-29T10:31:06.833444245Z",
         "github-html-url":"",
         "ingestion-source":"api",
         "origin":"unknown",
         "origin-detail":"",
         "warnings":[
            {
               "keyword-location":"/properties/integrations/properties/opsgenie/properties/service-url/pattern",
               "instance-location":"/integrations/opsgenie/service-url",
               "message":"does not match pattern '^(https?://)?[a-zA-Z\\\\d_\\\\-.]+\\\\.opsgenie\\\\.com/service/([a-zA-Z\\\\d_\\\\-]+)/?$'"
            },
            {
               "keyword-location":"/properties/integrations/properties/pagerduty/properties/service-url/pattern",
               "instance-location":"/integrations/pagerduty/service-url",
               "message":"does not match pattern '^(https?://)?[a-zA-Z\\\\d_\\\\-.]+\\\\.pagerduty\\\\.com/service-directory/(P[a-zA-Z\\\\d_\\\\-]+)/?$'"
            }
         ],
         "ingested-schema-version":"v2.1"
      },
      "schema":{
         "schema-version":"v2.2",
         "dd-service":"inventory-management",
         "team":"Inventory Management Team",
         "application":"Inventory System",
         "tier":"Tier 1",
         "description":"Service for managing product inventory and stock levels.",
         "lifecycle":"production",
         "contacts":[
            {
               "name":"Inventory Team",
               "type":"email",
               "contact":"inventory-team@example.com"
            },
            {
               "name":"Warehouse Support",
               "type":"email",
               "contact":"warehouse-support@example.com"
            }
         ],
         "links":[
            {
               "name":"Repository",
               "type":"repo",
               "provider":"GitHub",
               "url":"https://github.com/example/inventory-service"
            },
            {
               "name":"Runbook",
               "type":"runbook",
               "provider":"Confluence",
               "url":"https://wiki.example.com/runbooks/inventory-service"
            }
         ],
         "tags":[
            "inventory",
            "stock"
         ],
         "integrations":{
            "pagerduty":{
               "service-url":"https://pagerduty.com/services/inventory"
            },
            "opsgenie":{
               "service-url":"https://opsgenie.com/services/inventory",
               "region":"US"
            }
         },
         "extensions":{
            "qui_6":{
               
            }
         }
      }
   }
}
```

</details>


<details>
<summary> SLO response data</summary>

```json showLineNumbers
{
   "id":"b6869ae6189d59baa421feb8b437fe9e",
   "name":"Availability SLO for shopping-cart service",
   "tags":[
      "service:shopping-cart",
      "env:none"
   ],
   "monitor_tags":[
      
   ],
   "thresholds":[
      {
         "timeframe":"7d",
         "target":99.9,
         "target_display":"99.9"
      }
   ],
   "type":"monitor",
   "type_id":0,
   "description":"This SLO tracks the availability of the shopping-cart service. Availability is measured as the number of successful requests divided by the number of total requests for the service",
   "timeframe":"7d",
   "target_threshold":99.9,
   "monitor_ids":[
      15173866,
      15216083,
      15254771
   ],
   "creator":{
      "name":"John Doe",
      "handle":"john.doe@gmail.com",
      "email":"john.doe@gmail.com"
   },
   "created_at":1707215619,
   "modified_at":1707215619
}           
```

</details>

<details>
<summary> SLO history response data</summary>

```json showLineNumbers
{
  "thresholds": {
    "7d": {
      "timeframe": "7d",
      "target": 99,
      "target_display": "99."
    }
  },
  "from_ts": 1719254776,
  "to_ts": 1719859576,
  "type": "monitor",
  "type_id": 0,
  "slo": {
    "id": "5ec82408e83c54b4b5b2574ee428a26c",
    "name": "Host {{host.name}} with IP {{host.ip}} is not having enough memory",
    "tags": [
      "p69hx03",
      "pages-laptop"
    ],
    "monitor_tags": [],
    "thresholds": [
      {
        "timeframe": "7d",
        "target": 99,
        "target_display": "99."
      }
    ],
    "type": "monitor",
    "type_id": 0,
    "description": "Testing SLOs from DataDog",
    "timeframe": "7d",
    "target_threshold": 99,
    "monitor_ids": [
      147793
    ],
    "creator": {
      "name": "John Doe",
      "handle": "janesmith@gmail.com",
      "email": "janesmith@gmail.com"
    },
    "created_at": 1683878238,
    "modified_at": 1684773765
  },
  "overall": {
    "name": "Host {{host.name}} with IP {{host.ip}} is not having enough memory",
    "preview": false,
    "monitor_type": "query alert",
    "monitor_modified": 1683815332,
    "errors": null,
    "span_precision": 2,
    "history": [
      [
        1714596313,
        1
      ]
    ],
    "uptime": 3,
    "sli_value": 10,
    "precision": {
      "custom": 2,
      "7d": 2
    },
    "corrections": [],
    "state": "breached"
  }
}           
```

</details>

### Mapping Result

The combination of the sample payload and the Ocean configuration generates the following Port entity:

<details>
<summary> Monitor entity in Port</summary>

```json showLineNumbers
{
  "identifier": "15173866",
  "title": "A change @webhook-PORT",
  "icon": "Datadog",
  "blueprint": "datadogMonitor",
  "team": [],
  "properties": {
    "tags": [
      "app:webserver"
    ],
    "overallState": "No Data",
    "priority": "5",
    "createdAt": "2024-01-31T13:32:21.270116+00:00",
    "updatedAt": "2024-02-02T16:31:40.516062+00:00",
    "createdBy": "john.doe@gmail.com",
    "monitorType": "query alert"
  },
  "relations": {},
  "createdAt": "2024-05-29T09:43:34.750Z",
  "createdBy": "<port-client-id>",
  "updatedAt": "2024-05-29T09:43:34.750Z",
  "updatedBy": "<port-client-id>"
}
```

</details>

<details>
<summary>Service entity in Port</summary>

```json showLineNumbers
{
  "identifier": "inventory-management",
  "title": "inventory-management",
  "icon": "Datadog",
  "blueprint": "datadogService",
  "team": [],
  "properties": {
    "owners": [
      "inventory-team@example.com",
      "warehouse-support@example.com"
    ],
    "links": [
      "https://github.com/example/inventory-service",
      "https://wiki.example.com/runbooks/inventory-service"
    ],
    "description": "Service for managing product inventory and stock levels.",
    "tags": [
      "inventory",
      "stock"
    ],
    "application": "Inventory System"
  },
  "relations": {},
  "createdAt": "2024-05-29T10:31:44.283Z",
  "createdBy": "<port-client-id>",
  "updatedAt": "2024-05-29T10:31:44.283Z",
  "updatedBy": "<port-client-id>"
}
```

</details>

<details>
<summary>SLO entity in Port</summary>

```json showLineNumbers
{
  "identifier": "b6869ae6189d59baa421feb8b437fe9e",
  "title": "Availability SLO for shopping-cart service",
  "icon": "Datadog",
  "blueprint": "datadogSlo",
  "team": [],
  "properties": {
    "description": "This SLO tracks the availability of the shopping-cart service. Availability is measured as the number of successful requests divided by the number of total requests for the service",
    "updatedAt": "2024-02-06T10:33:39Z",
    "createdBy": "ahosea15@gmail.com",
    "sloType": "monitor",
    "targetThreshold": "99.9",
    "tags": [
      "service:shopping-cart",
      "env:none"
    ],
    "createdAt": "2024-02-06T10:33:39Z"
  },
  "relations": {
    "monitors": [
      "15173866",
      "15216083",
      "15254771"
    ],
    "services": [
      "shopping-cart"
    ]
  },
  "createdAt": "2024-05-29T09:43:51.946Z",
  "createdBy": "<port-client-id>",
  "updatedAt": "2024-05-29T12:02:01.559Z",
  "updatedBy": "<port-client-id>"
}
```

</details>

<details>
<summary>SLO history entity in Port</summary>

```json showLineNumbers
{
  "identifier": "5ec82408e83c54b4b5b2574ee428a26c",
  "title": "Host {{host.name}} with IP {{host.ip}} is not having enough memory",
  "icon": "Datadog",
  "blueprint": "datadogSloHistory",
  "team": [],
  "properties": {
    "sampling_end_date": "2024-07-01T18:46:16Z",
    "sliValue": 10,
    "sampling_start_date": "2024-06-24T18:46:16Z"
  },
  "relations": {
    "slo": "5ec82408e83c54b4b5b2574ee428a26c"
  },
  "createdAt": "2024-07-01T09:43:51.946Z",
  "createdBy": "<port-client-id>",
  "updatedAt": "2024-07-01T12:02:01.559Z",
  "updatedBy": "<port-client-id>"
}
```
</details>

## Alternative installation via webhook

While the Ocean integration described above is the recommended installation method, you may prefer to use a webhook to ingest data from Datadog. If so, follow this [guide](/build-your-software-catalog/custom-integration/webhook/examples/datadog).
