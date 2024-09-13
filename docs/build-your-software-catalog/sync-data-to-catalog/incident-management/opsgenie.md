---
sidebar_position: 2
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import Prerequisites from "../templates/\_ocean_helm_prerequisites_block.mdx"
import AzurePremise from "../templates/\_ocean_azure_premise.mdx"
import DockerParameters from "./\_opsgenie_docker_params.mdx"
import AdvancedConfig from '../../../generalTemplates/_ocean_advanced_configuration_note.md'
import OpsGenieAlertBlueprint from "/docs/build-your-software-catalog/custom-integration/webhook/examples/resources/opsgenie/\_example_opsgenie_alert_blueprint.mdx";
import OpsGenieAlertConfiguration from "/docs/build-your-software-catalog/custom-integration/webhook/examples/resources/opsgenie/\_example_opsgenie_alert_configuration.mdx";
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"
import OceanSaasInstallation from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_saas_installation.mdx"

# Opsgenie

Our Opsgenie integration allows you to import `alert`, `incident`, `service`, `team`, `schedule` and `schedule-oncall` from your Opsgenie account into Port, according to your mapping and definitions.

## Common use cases

- Map `alert`, `incident`, `service`, `team`, `schedule`, and `schedule-oncall` in your Opsgenie account.
- Watch for object changes (create/update/delete) in real-time, and automatically apply the changes to your entities in Port.

## Prerequisites
:::info API Token
An OpsGenie API token with the `read` and `configuration access` scopes is required. Port requires the `read` permission to allow the integration to access incidents and alerts. Port also needs the `configuraton access` permission to allow the integration to access service, teams, and schedules. See [here](https://support.atlassian.com/opsgenie/docs/api-key-management/) for more information on OpsGenie API key management.
:::

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

| Parameter                        | Description                                                                                                   | Required |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------- | -------- |
| `port.clientId`                  | Your port client id                                                                                           | ✅       |
| `port.clientSecret`              | Your port client secret                                                                                       | ✅       |
| `port.baseUrl`                   | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US                       | ✅       |
| `integration.identifier`         | Change the identifier to describe your integration                                                            | ✅       |
| `integration.type`               | The integration type                                                                                          | ✅       |
| `integration.eventListener.type` | The event listener type                                                                                       | ✅       |
| `integration.secrets.apiToken`   | The Opsgenie API token                                                                                        | ✅       |
| `integration.config.apiUrl`      | The Opsgenie API URL. If not specified, the default will be https://api.opsgenie.com                          | ✅       |
| `scheduledResyncInterval`        | The number of minutes between each resync                                                                     | ❌       |
| `initializePortResources`        | Default true, When set to true the integration will create default blueprints and the port App config Mapping | ❌       |
| `sendRawDataExamples`       | Enable sending raw data examples from the third party API to port for testing and managing the integration mapping. Default is true  | ❌       |

<br/>
<Tabs groupId="deploy" queryString="deploy">

<TabItem value="helm" label="Helm" default>
To install the integration using Helm, run the following command:

```bash showLineNumbers
helm repo add --force-update port-labs https://port-labs.github.io/helm-charts
helm upgrade --install my-opsgenie-integration port-labs/port-ocean \
  --set port.clientId="CLIENT_ID"  \
  --set port.clientSecret="CLIENT_SECRET"  \
  --set port.baseUrl="https://api.getport.io"  \
  --set initializePortResources=true  \
  --set sendRawDataExamples=true  \
  --set integration.identifier="my-opsgenie-integration"  \
  --set integration.type="opsgenie"  \
  --set integration.eventListener.type="POLLING"  \
  --set integration.secrets.apiToken="API_TOKEN"  \
  --set integration.config.apiUrl="https://api.opsgenie.com"
```

<PortApiRegionTip/>
</TabItem>

<TabItem value="argocd" label="ArgoCD" default>
To install the integration using ArgoCD, follow these steps:

1. Create a `values.yaml` file in `argocd/my-ocean-opsgenie-integration` in your git repository with the content:

:::note
Remember to replace the placeholders for `OPSGENIE_API_URL` and `OPSGENIE_API_TOKEN`.
:::
```yaml showLineNumbers
initializePortResources: true
scheduledResyncInterval: 120
integration:
  identifier: my-ocean-opsgenie-integration
  type: opsgenie
  eventListener:
    type: POLLING
  config:
  // highlight-next-line
    apiUrl: OPSGENIE_API_URL
  secrets:
  // highlight-next-line
    apiToken: OPSGENIE_API_TOKEN
```
<br/>

2. Install the `my-ocean-opsgenie-integration` ArgoCD Application by creating the following `my-ocean-opsgenie-integration.yaml` manifest:
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
  name: my-ocean-opsgenie-integration
  namespace: argocd
spec:
  destination:
    namespace: my-ocean-opsgenie-integration
    server: https://kubernetes.default.svc
  project: default
  sources:
  - repoURL: 'https://port-labs.github.io/helm-charts/'
    chart: port-ocean
    targetRevision: 0.1.14
    helm:
      valueFiles:
      - $values/argocd/my-ocean-opsgenie-integration/values.yaml
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
kubectl apply -f my-ocean-opsgenie-integration.yaml
```
</TabItem>
</Tabs>

<AdvancedConfig/>

</TabItem>

<TabItem value="one-time" label="Scheduled">
  <Tabs groupId="cicd-method" queryString="cicd-method">
  <TabItem value="github" label="GitHub">
This workflow will run the Opsgenie integration once and then exit, this is useful for **scheduled** ingestion of data.

:::warning
If you want the integration to update Port in real time using webhooks you should use the [Real Time & Always On](?installation-methods=real-time-always-on#installation) installation option
:::

Make sure to configure the following [Github Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions):

<DockerParameters />

<br/>

Here is an example for `opsgenie-integration.yml` workflow file:

```yaml showLineNumbers
name: Opsgenie Exporter Workflow

# This workflow responsible for running Opsgenie exporter.

on:
  workflow_dispatch:

jobs:
  run-integration:
    runs-on: ubuntu-latest

    steps:
      - uses: port-labs/ocean-sail@v1
        with: 
          type: 'opsgenie'
          port_client_id: ${{ secrets.OCEAN__PORT__CLIENT_ID }}
          port_client_secret: ${{ secrets.OCEAN__PORT__CLIENT_SECRET }}
          port_base_url: https://api.getport.io
          config: |
            api_token: ${{ secrets.OCEAN__INTEGRATION__CONFIG__API_TOKEN }} 
            api_url: ${{ secrets.OCEAN__INTEGRATION__CONFIG__API_URL }} 
```

  </TabItem>
  <TabItem value="jenkins" label="Jenkins">
This pipeline will run the Opsgenie integration once and then exit, this is useful for **scheduled** ingestion of data.

:::tip
Your Jenkins agent should be able to run docker commands.
:::
:::warning
If you want the integration to update Port in real time using webhooks you should use
the [Real Time & Always On](?installation-methods=real-time-always-on#installation) installation option.
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
        stage('Run Opsgenie Integration') {
            steps {
                script {
                    withCredentials([
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__API_TOKEN', variable: 'OCEAN__INTEGRATION__CONFIG__API_TOKEN'),
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__API_URL', variable: 'OCEAN__INTEGRATION__CONFIG__API_URL'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_ID', variable: 'OCEAN__PORT__CLIENT_ID'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_SECRET', variable: 'OCEAN__PORT__CLIENT_SECRET'),
                    ]) {
                        sh('''
                            #Set Docker image and run the container
                            integration_type="opsgenie"
                            version="latest"
                            image_name="ghcr.io/port-labs/port-ocean-${integration_type}:${version}"
                            docker run -i --rm --platform=linux/amd64 \
                                -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
                                -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
                                -e OCEAN__SEND_RAW_DATA_EXAMPLES=true \
                                -e OCEAN__INTEGRATION__CONFIG__API_TOKEN=$OCEAN__INTEGRATION__CONFIG__API_TOKEN \
                                -e OCEAN__INTEGRATION__CONFIG__API_URL=$OCEAN__INTEGRATION__CONFIG__API_URL \
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
<AzurePremise name="Opsgenie" />

<DockerParameters />

<br/>

Here is an example for `opsgenie-integration.yml` pipeline file:

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
    integration_type="opsgenie"
    version="latest"

    image_name="ghcr.io/port-labs/port-ocean-$integration_type:$version"

    docker run -i --rm --platform=linux/amd64 \
      -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
      -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
      -e OCEAN__SEND_RAW_DATA_EXAMPLES=true \
      -e OCEAN__INTEGRATION__CONFIG__API_TOKEN=$(OCEAN__INTEGRATION__CONFIG__API_TOKEN) \
      -e OCEAN__INTEGRATION__CONFIG__API_URL=$(OCEAN__INTEGRATION__CONFIG__API_URL) \
      -e OCEAN__PORT__CLIENT_ID=$(OCEAN__PORT__CLIENT_ID) \
      -e OCEAN__PORT__CLIENT_SECRET=$(OCEAN__PORT__CLIENT_SECRET) \
      -e OCEAN__PORT__BASE_URL='https://api.getport.io' \
      $image_name

    exit $?
  displayName: 'Ingest Data into Port'

```

  </TabItem>
<TabItem value="gitlab" label="GitLab">
This workflow will run the Opsgenie integration once and then exit, this is useful for **scheduled** ingestion of data.

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
  INTEGRATION_TYPE: opsgenie
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
        -e OCEAN__INTEGRATION__CONFIG__API_TOKEN=$OCEAN__INTEGRATION__CONFIG__API_TOKEN \
        -e OCEAN__INTEGRATION__CONFIG__API_URL=$OCEAN__INTEGRATION__CONFIG__API_URL \
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

## Ingesting Opsgenie objects

The Opsgenie integration uses a YAML configuration to describe the process of loading data into the developer portal. See [examples](#examples) below.

The integration makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from Opsgenie's API events.

### Configuration structure

The integration configuration determines which resources will be queried from Opsgenie, and which entities and properties will be created in Port.

:::tip Supported resources
The following resources can be used to map data from Opsgenie, it is possible to reference any field that appears in the API responses linked below for the mapping configuration.

- [`Alert`](https://docs.opsgenie.com/docs/alert-api#list-alerts)
- [`Incident`](https://docs.opsgenie.com/docs/incident-api#list-incidents)
- [`Service`](https://docs.opsgenie.com/docs/service-api#list-services)
- [`Team`](https://docs.opsgenie.com/docs/team-api#list-teams)
- [`Service`](https://docs.opsgenie.com/docs/service-api#list-services)
- [`Schedule`](https://docs.opsgenie.com/docs/schedule-api#list-schedules)
- [`Schedule-Oncall`](https://docs.opsgenie.com/docs/who-is-on-call-api#get-on-calls)

:::

- The root key of the integration configuration is the `resources` key:

  ```yaml showLineNumbers
  # highlight-next-line
  resources:
    - kind: service
      selector:
      ...
  ```

- The `kind` key is a specifier for a Opsgenie object:

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

- The `port`, `entity` and the `mappings` keys are used to map the Opsgenie object fields to Port entities. To create multiple mappings of the same kind, you can add another item in the `resources` array;

  ```yaml showLineNumbers
  resources:
    - kind: service
      selector:
        query: "true"
      port:
        # highlight-start
        entity:
          mappings: # Mappings between one Opsgenie object to a Port entity. Each value is a JQ query.
            identifier: .id
            title: .name
            blueprint: '"opsGenieService"'
            properties:
              description: .description
        # highlight-end
    - kind: service # In this instance service is mapped again with a different filter
      selector:
        query: '.name == "MyServiceName"'
      port:
        entity:
          mappings: ...
  ```

  :::tip Blueprint key
  Note the value of the `blueprint` key - if you want to use a hardcoded string, you need to encapsulate it in 2 sets of quotes, for example use a pair of single-quotes (`'`) and then another pair of double-quotes (`"`)
  :::

## Configuring real-time updates

Currently, the OpsGenie API lacks support for programmatic webhook creation. To set up a webhook configuration in OpsGenie for sending alert notifications to the Ocean integration, follow these steps:

### Prerequisite

Prepare a webhook `URL` using this format: `{app_host}/integration/webhook`. The `app_host` parameter should match the ingress or external load balancer where the integration will be deployed. For example, if your ingress or load balancer exposes the OpsGenie Ocean integration at `https://myservice.domain.com`, your webhook `URL` should be `https://myservice.domain.com/integration/webhook`.

### Create a webhook in OpsGenie

1. Go to OpsGenie;
2. Select **Settings**;
3. Click on **Integrations** under the **Integrations** section of the sidebar;
4. Click on **Add integration**;
5. In the search box, type _Webhook_ and select the webhook option;
6. Input the following details:
   1. `Name` - use a meaningful name such as Port Ocean Webhook;
   2. Be sure to keep the "Enabled" checkbox checked;
   3. Check the "Add Alert Description to Payload" checkbox;
   4. Check the "Add Alert Details to Payload" checkbox;
   5. Add the following action triggers to the webhook by clicking on **Add new action**:
      1. If _alert is snoozed_ in Opsgenie, _post to url_ in Webhook;
      2. If _alert's description is updated_ in Opsgenie, _post to url_ in Webhook;
      3. If _alert's message is updated_ in Opsgenie, _post to url_ in Webhook;
      4. If _alert's priority is updated_ in Opsgenie, _post to url_ in Webhook;
      5. If _a responder is added to the alert_ in Opsgenie, _post to url_ in Webhook;
      6. if _a user executes "Assign Ownership_ in Opsgenie, _post to url_ in Webhook;
      7. if _a tag is added to the alert_ in Opsgenie, _post to url_ in Webhook;
      8. .if _a tag is removed from the alert_ in Opsgenie, _post to url_ in Webhook;
   6. `Webhook URL` - enter the value of the `URL` you created above.
7. Click **Save integration**

### Ingest data into Port

To ingest Opsgenie objects using the [integration configuration](#configuration-structure), you can follow the steps below:

1. Go to the DevPortal Builder page.
2. Select a blueprint you want to ingest using Opsgenie.
3. Choose the **Ingest Data** option from the menu.
4. Select Opsgenie under the Incident management category.
5. Modify the [configuration](#configuration-structure) according to your needs.
6. Click `Resync`.

## Examples

Examples of blueprints and the relevant integration configurations:

### Team

<details>
<summary>Team blueprint</summary>

```json showLineNumbers
{
  "identifier": "opsGenieTeam",
  "description": "This blueprint represents an OpsGenie team in our software catalog",
  "title": "OpsGenie Team",
  "icon": "OpsGenie",
  "schema": {
    "properties": {
      "description": {
        "type": "string",
        "title": "Description",
        "icon": "DefaultProperty"
      },
      "url": {
        "title": "URL",
        "type": "string",
        "description": "URL to the service",
        "format": "url",
        "icon": "DefaultProperty"
      },
      "oncallUsers": {
        "type": "array",
        "title": "Current Oncalls",
        "items": {
          "type": "string",
          "format": "user"
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
  - kind: team
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: .id
          title: .name
          blueprint: '"opsGenieTeam"'
          properties:
            description: .description
            url: .links.web
```

</details>


### Schedule

<details>
<summary>Schedule blueprint</summary>

```json showLineNumbers
{
  "identifier": "opsGenieSchedule",
  "description": "This blueprint represents a OpsGenie schedule in our software catalog",
  "title": "OpsGenie Schedule",
  "icon": "OpsGenie",
  "schema": {
    "properties": {
      "timezone": {
        "title": "Timezone",
        "type": "string"
      },
      "description": {
        "title": "Description",
        "type": "string"
      },
      "users": {
        "title": "Users",
        "type": "array",
        "items": {
          "type": "string",
          "format": "user"
        }
      },
      "startDate": {
        "title": "Start Date",
        "type": "string",
        "format": "date-time"
      },
      "endDate": {
        "title": "End Date",
        "type": "string",
        "format": "date-time"
      },
      "rotationType": {
        "type": "string",
        "title": "Rotation Type"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {
    "ownerTeam": {
      "title": "Owner Team",
      "target": "opsGenieTeam",
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
  - kind: schedule
    selector:
      query: 'true'
      apiQueryParams:
        expand: rotation
    port:
      itemsToParse: .rotations
      entity:
        mappings:
          identifier: .id + "_" + .item.id
          title: .name + "_" + .item.name
          blueprint: '"opsGenieSchedule"'
          properties:
            timezone: .timezone
            description: .description
            startDate: .item.startDate
            endDate: .item.endDate
            rotationType: .item.type
            users: '[.item.participants[] | select(has("username")) | .username]'
          relations:
            ownerTeam: .ownerTeam.id
```

</details>


### Service

<details>
<summary>Service blueprint</summary>

```json showLineNumbers
{
  "identifier": "opsGenieService",
  "description": "This blueprint represents an OpsGenie service in our software catalog",
  "title": "OpsGenie Service",
  "icon": "OpsGenie",
  "schema": {
    "properties": {
      "description": {
        "type": "string",
        "title": "Description",
        "icon": "DefaultProperty"
      },
      "url": {
        "title": "URL",
        "type": "string",
        "description": "URL to the service",
        "format": "url",
        "icon": "DefaultProperty"
      },
      "tags": {
        "type": "array",
        "items": {
          "type": "string"
        },
        "title": "Tags",
        "icon": "DefaultProperty"
      }
    },
    "required": []
  },
  "mirrorProperties": {
    "oncallUsers": {
      "title": "Current Oncalls",
      "path": "ownerTeam.oncallUsers"
    }
  },
  "calculationProperties": {
  },
  "aggregationProperties": {
    "numberOfOpenIncidents": {
      "title": "Number of open incidents",
      "type": "number",
      "target": "opsGenieIncident",
      "query": {
        "combinator": "and",
        "rules": [
          {
            "property": "status",
            "operator": "=",
            "value": "open"
          }
        ]
      },
      "calculationSpec": {
        "calculationBy": "entities",
        "func": "count"
      }
    }
  },
  "relations": {
    "ownerTeam": {
      "title": "Owner Team",
      "target": "opsGenieTeam",
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
  - kind: service
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: .id
          title: .name
          blueprint: '"opsGenieService"'
          properties:
            description: .description
            url: .links.web
            tags: .tags
          relations:
            ownerTeam: .teamId
```

</details>

### Incident

<details>
<summary>Incident blueprint</summary>

```json showLineNumbers
{
  "identifier": "opsGenieIncident",
  "description": "This blueprint represents an OpsGenie incident in our software catalog",
  "title": "OpsGenie Incident",
  "icon": "OpsGenie",
  "schema": {
    "properties": {
      "description": {
        "title": "Description",
        "type": "string"
      },
      "status": {
        "type": "string",
        "title": "Status",
        "enum": [
          "closed",
          "open",
          "resolved"
        ],
        "enumColors": {
          "closed": "blue",
          "open": "red",
          "resolved": "green"
        },
        "description": "The status of the incident"
      },
      "url": {
        "type": "string",
        "format": "url",
        "title": "URL"
      },
      "tags": {
        "type": "array",
        "items": {
          "type": "string"
        },
        "title": "Tags"
      },
      "responders": {
        "type": "array",
        "title": "Responders",
        "description": "Responders to the alert"
      },
      "priority": {
        "type": "string",
        "title": "Priority"
      },
      "createdAt": {
        "title": "Create At",
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
  "relations": {
    "services": {
      "title": "Impacted Services",
      "target": "opsGenieService",
      "many": true,
      "required": false
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
  - kind: incident
    selector:
      query: 'true'
      apiQueryParams:
        status: open
    port:
      entity:
        mappings:
          identifier: .id
          title: .message
          blueprint: '"opsGenieIncident"'
          properties:
            status: .status
            responders: .responders
            priority: .priority
            tags: .tags
            url: .links.web
            createdAt: .createdAt
            updatedAt: .updatedAt
            description: .description
          relations:
            services: .impactedServices
```

</details>

### Alert

<details>
<summary>Alert blueprint</summary>

```json showLineNumbers
{
  "identifier": "opsGenieAlert",
  "description": "This blueprint represents an OpsGenie alert in our software catalog",
  "title": "OpsGenie Alert",
  "icon": "OpsGenie",
  "schema": {
    "properties": {
      "description": {
        "title": "Description",
        "type": "string"
      },
      "status": {
        "type": "string",
        "title": "Status",
        "enum": [
          "closed",
          "open"
        ],
        "enumColors": {
          "closed": "green",
          "open": "red"
        },
        "description": "The status of the alert"
      },
      "acknowledged": {
        "type": "boolean",
        "title": "Acknowledged"
      },
      "tags": {
        "type": "array",
        "items": {
          "type": "string"
        },
        "title": "Tags"
      },
      "responders": {
        "type": "array",
        "title": "Responders",
        "description": "Responders to the alert"
      },
      "integration": {
        "type": "string",
        "title": "Integration",
        "description": "The name of the Integration"
      },
      "priority": {
        "type": "string",
        "title": "Priority"
      },
      "sourceName": {
        "type": "string",
        "title": "Source Name",
        "description": "Alert source name"
      },
      "createdBy": {
        "title": "Created By",
        "type": "string",
        "format": "user"
      },
      "createdAt": {
        "title": "Create At",
        "type": "string",
        "format": "date-time"
      },
      "updatedAt": {
        "title": "Updated At",
        "type": "string",
        "format": "date-time"
      },
      "count": {
        "title": "Count",
        "type": "number"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "relations": {
    "relatedIncident": {
      "title": "Related Incident",
      "target": "opsGenieIncident",
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
  - kind: alert
    selector:
      query: 'true'
      apiQueryParams:
        status: open
    port:
      entity:
        mappings:
          identifier: .id
          title: .message
          blueprint: '"opsGenieAlert"'
          properties:
            status: .status
            acknowledged: .acknowledged
            responders: .responders
            priority: .priority
            sourceName: .source
            tags: .tags
            count: .count
            createdBy: .owner
            createdAt: .createdAt
            updatedAt: .updatedAt
            description: .description
            integration: .integration.name
          relations:
            relatedIncident: 'if (.alias | contains("_")) then (.alias | split("_")[0]) else null end'
```

</details>

:::tip filter alerts and incidents
The integration provides an option to filter the data that is retrieved from the OpsGenie API using the following attributes:

1. `createdAt`: The date and time the alert or incident was created
2. `lastOccurredAt`: The date and time the alert or incident was last occurred
3. `snoozedUntil`: The date and time the alert or incident was snoozed until
4. `priority`: The priority of the alert or incident. Accepts values such as `P1`, `P2`, `P3`, `P4` and `P5`
5. `status`: The status of the alert or incident. Accepts values such as `open`, `closed` and `resolved`
6. `isSeen`: Whether the alert or incident has been seen. Accepts a boolean `true` or `false`
7. `acknowledged`: Whether the alert or incident has been acknowledged. Accepts a boolean `true` or `false`
8. `snoozed`: Whether the alert or incident has been snoozed. Accepts a boolean `true` or `false`
9. `owner`: The owner of the alert or incident. Accepts an OpsGenie username
10. `teams`: The teams associated with the alert or incident
11. `acknowledgedBy`: The user who acknowledged the alert or incident
12. `closedBy`: The user who closed the alert or incident
13. `message`: The message of the alert or incident

These attributes can be enabled using the path: `selector.apiQueryParams`. By default, the integration fetches `open` alerts and incidents.
:::

### Current On-call
To bring the current on-call users, update your configuration mapping to populate the `OpsGenieTeam` blueprint with team and on-call data. This will enable you to view on-call information at the service level:

<details>
<summary>Integration configuration</summary>

```yaml showLineNumbers
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: schedule-oncall
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: .ownerTeam.id
          title: .ownerTeam.name
          blueprint: '"opsGenieTeam"'
          properties:
            oncallUsers: .__currentOncalls.onCallRecipients
```

</details>


## Let's Test It

This section includes a sample response data from Opsgenie. In addition, it includes the entity created from the resync event based on the Ocean configuration provided in the previous section.

### Payload

Here is an example of the payload structure from Opsgenie:

<details>
<summary> Team response data</summary>

```json showLineNumbers
{
  "id": "63374eee-0b03-42d4-bb8c-50d1fa64827c",
  "name": "Data Science Team",
  "description": "",
  "links": {
    "web": "https://app.opsgenie.com/teams/dashboard/63374eee-0b03-42d4-bb8c-50d1fa64827c/main",
    "api": "https://api.opsgenie.com/v2/teams/63374eee-0b03-42d4-bb8c-50d1fa64827c"
  }
}
```

</details>

<details>
<summary> Schedule response data</summary>

```json showLineNumbers
{
  "item": {
    "id": "c4fa16f1-8675-4a26-9c2a-7b7a0c98a9cb",
    "name": "Rota2",
    "startDate": "2024-09-02T08:00:00Z",
    "endDate": "2024-09-14T09:00:00Z",
    "type": "weekly",
    "length": 3,
    "participants": [
      {
        "type": "user",
        "id": "ce544b61-7b35-43ea-89ee-a8750638d3a4",
        "username": "dev@domain.com"
      }
    ],
    "timeRestriction": null
  },
  "id": "977805c9-ede6-4cc1-a535-93e93767a436",
  "name": "Devops Team_schedule",
  "description": "",
  "timezone": "Africa/Monrovia",
  "enabled": true,
  "ownerTeam": {
    "id": "bae765bb-a288-4731-b826-b2c65ff16f24",
    "name": "Devops Team"
  },
  "rotations": [
    {
      "id": "c4fa16f1-8675-4a26-9c2a-7b7a0c98a9cb",
      "name": "Rota2",
      "startDate": "2024-09-02T08:00:00Z",
      "endDate": "2024-09-14T09:00:00Z",
      "type": "weekly",
      "length": 3,
      "participants": [
        {
          "type": "user",
          "id": "ce544b61-7b35-43ea-89ee-a8750638d3a4",
          "username": "dev@domain.com"
        }
      ],
      "timeRestriction": null
    },
    {
      "id": "1fbeb5b1-4e00-483e-ab01-323881535159",
      "name": "Rota1",
      "startDate": "2024-09-02T08:00:00Z",
      "endDate": "2024-09-10T09:00:00Z",
      "type": "weekly",
      "length": 1,
      "participants": [
        {
          "type": "user",
          "id": "ce544b61-7b35-43ea-89ee-a8750638d3a4",
          "username": "dev@domain.com"
        }
      ],
      "timeRestriction": null
    }
  ]
}
```

</details>

<details>
<summary> Service response data</summary>

```json showLineNumbers
{
  "id": "96856ebc-1db0-497b-b90a-5172e6ca0cb3",
  "name": "Pricing Service",
  "description": "Product pricing algorithm service",
  "teamId": "63374eee-0b03-42d4-bb8c-50d1fa64827c",
  "tags": [
    "frontend"
  ],
  "links": {
    "web": "https://mydomain.app.opsgenie.com/service/96856ebc-1db0-497b-b90a-5172e6ca0cb3/status",
    "api": "https://api.opsgenie.com/v1/services/96856ebc-1db0-497b-b90a-5172e6ca0cb3"
  },
  "isExternal": false
}
```

</details>

<details>
<summary> Incident response data</summary>

```json showLineNumbers
{
  "id": "652f14b3-019a-4d4c-8b83-e4da527a416c",
  "description": "summary",
  "impactedServices": [
    "daa0d66f-ad35-4396-b30d-70f0314c697a"
  ],
  "tinyId": "3",
  "message": "OpenAI Token Incident",
  "status": "open",
  "tags": [
    "incident"
  ],
  "createdAt": "2023-09-26T17:06:16.824Z",
  "updatedAt": "2023-09-26T17:49:10.17Z",
  "priority": "P3",
  "ownerTeam": "",
  "responders": [
    {
      "type": "team",
      "id": "63374eee-0b03-42d4-bb8c-50d1fa64827c"
    },
    {
      "type": "user",
      "id": "ce544b61-7b35-43ea-89ee-a8750638d3a4"
    }
  ],
  "extraProperties": {},
  "links": {
    "web": "https://mydomain.app.opsgenie.com/incident/detail/652f14b3-019a-4d4c-8b83-e4da527a416c",
    "api": "https://api.opsgenie.com/v1/incidents/652f14b3-019a-4d4c-8b83-e4da527a416c"
  },
  "impactStartDate": "2023-09-26T17:06:16.824Z",
  "impactEndDate": "2023-09-26T17:45:25.719Z",
  "actions": []
}
```

</details>

<details>
<summary> Alert response data</summary>

```json showLineNumbers
{
  "seen": true,
  "id": "886b285b-b35e-487b-afe6-3d5001370363-1724857097467",
  "tinyId": "13",
  "alias": "355f1681-f6e3-4355-a927-897cd8edaf8f_886b285b-b35e-487b-afe6-3d5001370363-1724857097467",
  "message": "Test scaling alerts",
  "status": "open",
  "acknowledged": false,
  "isSeen": true,
  "tags": [],
  "snoozed": false,
  "count": 1,
  "lastOccurredAt": "2024-08-28T14:58:17.467Z",
  "createdAt": "2024-08-28T14:58:17.467Z",
  "updatedAt": "2024-08-28T14:58:59.285Z",
  "source": "dev@domain.com",
  "owner": "",
  "priority": "P3",
  "teams": [],
  "responders": [
    {
      "type": "user",
      "id": "ce544b61-7b35-43ea-89ee-a8750638d3a4"
    }
  ],
  "integration": {
    "id": "00c228b7-80a4-48ae-be9c-3a1471bad69d",
    "name": "Default API",
    "type": "API"
  },
  "ownerTeamId": ""
}
```

</details>

<details>
<summary> Oncall response data</summary>

```json showLineNumbers
{
  "id": "977805c9-ede6-4cc1-a535-93e93767a436",
  "name": "Devops Team_schedule",
  "description": "",
  "timezone": "Africa/Monrovia",
  "enabled": true,
  "ownerTeam": {
    "id": "bae765bb-a288-4731-b826-b2c65ff16f24",
    "name": "Devops Team"
  },
  "rotations": [],
  "__currentOncalls": {
    "_parent": {
      "id": "977805c9-ede6-4cc1-a535-93e93767a436",
      "name": "Devops Team_schedule",
      "enabled": true
    },
    "onCallRecipients": [
      "dev@domain.com"
    ]
  }
}
```

</details>

### Mapping Result

The combination of the sample payload and the Ocean configuration generates the following Port entity:

<details>
<summary> Team entity in Port</summary>

```json showLineNumbers
{
  "identifier": "63374eee-0b03-42d4-bb8c-50d1fa64827c",
  "title": "Data Science Team",
  "icon": "OpsGenie",
  "blueprint": "opsGenieTeam",
  "team": [],
  "properties": {
    "description": "",
    "url": "https://app.opsgenie.com/teams/dashboard/63374eee-0b03-42d4-bb8c-50d1fa64827c/main"
  },
  "relations": {},
  "createdAt": "2024-09-02T21:01:40.937Z",
  "createdBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW",
  "updatedAt": "2024-09-02T21:01:40.937Z",
  "updatedBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW"
}
```

</details>

<details>
<summary> Schedule entity in Port</summary>

```json showLineNumbers
{
  "identifier": "d55e148e-d320-4766-9dcf-4fc2ce9daef1_fefc6b88-e44d-4acc-93a2-daf3ba803690",
  "title": "Data Science Team_schedule_Rota3",
  "icon": "OpsGenie",
  "blueprint": "opsGenieSchedule",
  "team": [],
  "properties": {
    "timezone": "Africa/Monrovia",
    "description": "",
    "users": [],
    "startDate": "2024-09-02T08:00:00Z",
    "endDate": "2024-10-02T08:00:00Z",
    "rotationType": "daily"
  },
  "relations": {
    "ownerTeam": "63374eee-0b03-42d4-bb8c-50d1fa64827c"
  },
  "createdAt": "2024-09-10T12:24:02.999Z",
  "createdBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW",
  "updatedAt": "2024-09-10T12:24:02.999Z",
  "updatedBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW"
}
```

</details>

<details>
<summary> Service entity in Port</summary>

```json showLineNumbers
{
  "identifier": "96856ebc-1db0-497b-b90a-5172e6ca0cb3",
  "title": "Pricing Service",
  "icon": "OpsGenie",
  "blueprint": "opsGenieService",
  "team": [],
  "properties": {
    "description": "Product pricing algorithm service",
    "url": "https://mydomain.app.opsgenie.com/service/96856ebc-1db0-497b-b90a-5172e6ca0cb3/status",
    "tags": [
      "frontend"
    ],
    "oncallUsers": [
      "dev@domain.com"
    ],
    "numberOfOpenIncidents": null
  },
  "relations": {
    "ownerTeam": null
  },
  "createdAt": "2024-09-02T21:02:01.207Z",
  "createdBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW",
  "updatedAt": "2024-09-02T21:02:01.207Z",
  "updatedBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW"
}
```

</details>

<details>
<summary> Incident entity in Port</summary>

```json showLineNumbers
{
  "identifier": "652f14b3-019a-4d4c-8b83-e4da527a416c",
  "title": "OpenAI Token Incident",
  "icon": "OpsGenie",
  "blueprint": "opsGenieIncident",
  "team": [],
  "properties": {
    "description": "summary",
    "status": "open",
    "url": "https://mydomain.app.opsgenie.com/incident/detail/652f14b3-019a-4d4c-8b83-e4da527a416c",
    "tags": [
      "tags"
    ],
    "responders": [
      {
        "id": "63374eee-0b03-42d4-bb8c-50d1fa64827c",
        "type": "team"
      },
      {
        "id": "ce544b61-7b35-43ea-89ee-a8750638d3a4",
        "type": "user"
      }
    ],
    "priority": "P3",
    "createdAt": "2023-09-26T17:06:16.824Z",
    "updatedAt": "2023-09-26T17:49:10.17Z"
  },
  "relations": {
    "services": [
      "daa0d66f-ad35-4396-b30d-70f0314c697a"
    ]
  },
  "createdAt": "2024-08-28T16:58:15.414Z",
  "createdBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW",
  "updatedAt": "2024-08-28T16:58:15.414Z",
  "updatedBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW"
}
```

</details>

<details>
<summary> Alert entity in Port</summary>

```json showLineNumbers
{
  "identifier": "886b285b-b35e-487b-afe6-3d5001370363-1724857097467",
  "title": "Test scaling alerts",
  "icon": "OpsGenie",
  "blueprint": "opsGenieAlert",
  "team": [],
  "properties": {
    "description": null,
    "status": "open",
    "acknowledged": false,
    "tags": [],
    "responders": [
      {
        "id": "ce544b61-7b35-43ea-89ee-a8750638d3a4",
        "type": "user"
      }
    ],
    "integration": "Default API",
    "priority": "P3",
    "sourceName": "dev@domain.com",
    "createdBy": "",
    "createdAt": "2024-08-28T14:58:17.467Z",
    "updatedAt": "2024-08-28T14:58:59.285Z",
    "count": 1
  },
  "relations": {
    "relatedIncident": "355f1681-f6e3-4355-a927-897cd8edaf8f"
  },
  "createdAt": "2024-08-29T10:31:34.381Z",
  "createdBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW",
  "updatedAt": "2024-08-29T10:31:34.381Z",
  "updatedBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW"
}
```

</details>

<details>
<summary> Oncall entity in Port</summary>

```json showLineNumbers
{
  "identifier": "63374eee-0b03-42d4-bb8c-50d1fa64827c",
  "title": "Data Science Team",
  "icon":"OpsGenie",
  "blueprint": "opsGenieTeam",
  "team": [],
  "properties": {
    "description": "",
    "url": "https://app.opsgenie.com/teams/dashboard/63374eee-0b03-42d4-bb8c-50d1fa64827c/main",
    "oncallUsers": [
      "janedoe@devportal.io",
      "johnsmith@gmail.com",
      "dev@domain.com"
    ]
  },
  "relations": {},
  "createdAt": "2024-09-02T21:01:40.937Z",
  "createdBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW",
  "updatedAt": "2024-09-10T11:41:09.535Z",
  "updatedBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW"
}
```

</details>

## Alternative installation via webhook
While the Ocean integration described above is the recommended installation method, you may prefer to use a webhook to ingest data from Opsgenie. If so, use the following instructions:

<details>

<summary><b>Webhook installation (click to expand)</b></summary>

In this example you are going to create a webhook integration between [OpsGenie](https://www.atlassian.com/software/opsgenie) and Port, which will ingest alert entities.

### Port configuration

Create the following blueprint definition:

<details>
<summary>OpsGenie alert blueprint</summary>

<OpsGenieAlertBlueprint/>

</details>

Create the following webhook configuration [using Port UI](../../?operation=ui#configuring-webhook-endpoints):

<details>
<summary>OpsGenie alert webhook configuration</summary>

1. **Basic details** tab - fill the following details:
   1. Title : `OpsGenie mapper`;
   2. Identifier : `opsgenie_mapper`;
   3. Description : `A webhook configuration to map OpsGenie alerts to Port`;
   4. Icon : `OpsGenie`;
2. **Integration configuration** tab - fill the following JQ mapping:
   <OpsGenieAlertConfiguration/>

3. Click **Save** at the bottom of the page.

</details>

<h2>Create a webhook in OpsGenie</h2>

1. Go to OpsGenie;
2. Select **Settings**;
3. Click on **Integrations** under the **Integrations** section of the sidebar;
4. Click on **Add integration**;
5. In the search box, type _Webhook_ and select the webhook option;
6. Input the following details:
   1. `Name` - use a meaningful name such as Port Webhook;
   2. Be sure to keep the "Enabled" checkbox checked;
   3. Check the "Add Alert Description to Payload" checkbox;
   4. Check the "Add Alert Details to Payload" checkbox;
   5. Add the following action triggers to the webhook by clicking on **Add new action**:
      1. If _alert is snoozed_ in Opsgenie, _post to url_ in Webhook;
      2. If _alert's description is updated_ in Opsgenie, _post to url_ in Webhook;
      3. If _alert's message is updated_ in Opsgenie, _post to url_ in Webhook;
      4. If _alert's priority is updated_ in Opsgenie, _post to url_ in Webhook;
      5. If _a responder is added to the alert_ in Opsgenie, _post to url_ in Webhook;
      6. if _a user executes "Assign Ownership_ in Opsgenie, _post to url_ in Webhook;
      7. if _a tag is added to the alert_ in Opsgenie, _post to url_ in Webhook;
      8. .if _a tag is removed from the alert_ in Opsgenie, _post to url_ in Webhook;
   6. `Webhook URL` - enter the value of the `url` key you received after creating the webhook configuration;
7. Click **Save integration**

:::tip
In order to view the different payloads and events available in Opsgenie webhooks, [look here](https://support.atlassian.com/opsgenie/docs/opsgenie-edge-connector-alert-action-data/)
:::

Done! any change that happens to an OpsGenie alert (created, acknowledged, etc.) will trigger a webhook event that OpsGenie will send to the webhook URL provided by Port. Port will parse the events according to the mapping and update the catalog entities accordingly.

<h2>Let's Test It</h2>

This section includes a sample webhook event sent from OpsGenie when an alert is created. In addition, it includes the entity created from the event based on the webhook configuration provided in the previous section.

<h3>Payload</h3>

Here is an example of the payload structure sent to the webhook URL when an OpsGenie alert is created:

<details>
<summary> Webhook event payload</summary>

```json showLineNumbers
{
  "source": {
    "name": "web",
    "type": "API"
  },
  "alert": {
    "tags": ["tag1", "tag2"],
    "teams": ["team1", "team2"],
    "responders": ["recipient1", "recipient2"],
    "message": "test alert",
    "username": "username",
    "alertId": "052652ac-5d1c-464a-812a-7dd18bbfba8c",
    "source": "user@domain.com",
    "alias": "aliastest",
    "tinyId": "10",
    "entity": "An example entity",
    "createdAt": 1686916265415,
    "updatedAt": 1686916266116,
    "userId": "daed1180-0ce8-438b-8f8e-57e1a5920a2d",
    "description": "Testing opsgenie alerts",
    "priority": "P1"
  },
  "action": "Create",
  "integrationId": "37c8f316-17c6-49d7-899b-9c7e540c048d",
  "integrationName": "Port-Integration"
}
```

</details>

<h3>Mapping Result</h3>

The combination of the sample payload and the webhook configuration generates the following Port entity:

```json showLineNumbers
{
  "identifier": "052652ac-5d1c-464a-812a-7dd18bbfba8c",
  "title": "10 - test alert",
  "blueprint": "opsGenieAlert",
  "properties": {
    "description": "Testing opsgenie alerts",
    "lastChangeType": "Create",
    "priority": "P1",
    "sourceName": "web",
    "sourceType": "API",
    "tags": ["tag1", "tag2"],
    "responders": ["recipient1", "recipient2"],
    "teams": ["team1", "team2"]
  },
  "relations": {}
}
```

<h2>Ingest who is on-call</h2>

In this example we will create a blueprint for `service` entities with an `on-call` property that will be ingested directly from OpsGenie.
The examples below pull data from the OpsGenie REST Api, in a defined scheduled period using GitLab Pipelines or GitHub Workflows, and report the data to Port as a property to the `service` blueprint.

- [Github Workflow](https://github.com/port-labs/opsgenie-oncall-example)
- [GitLab CI Pipeline](https://gitlab.com/getport-labs/opsgenie-oncall-example)
</details>

## Migration Guide to Version 0.2.0
This guide outlines how to update your existing OpsGenie integration configuration to take advantage of the performance improvements and breaking changes introduced in version 0.2.0.

Below is an overview of changes in version 0.2.0

### Key Improvements

- **New Blueprints and Kinds**: Added new kinds for team, schedule, and schedule-oncall.
- **Data Filtering**: Introduced support for filtering data from the OpsGenie API to fetch only the necessary information.
- **Enhanced Logging**: Added logs for easier debugging and better insight into integration issues.

### Breaking Changes

- **Optimized API Calls**: Removed redundant API calls for fetching impacted services and alert-incident relationships, improving performance by leveraging existing relations and JQ
- **Blueprint Changes**: The `OpsGenieService` blueprint no longer contains team properties like `oncallTeam`, `teamMembers`, and `oncallUsers`. These have been moved to a new `OpsGenieTeam` blueprint, reflecting a new relation between services and teams.


### Migration Steps

#### Step 1: Understand Existing Configuration
In versions prior to 0.2.0, your Port app's configuration may have used a mapping like the one below:

<details>
<summary>Existing configuration (click to expand)</summary>

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
          identifier: .name | gsub("[^a-zA-Z0-9@_.:/=-]"; "-") | tostring
          title: .name
          blueprint: '"opsGenieService"'
          properties:
            description: .description
            url: .links.web
            tags: .tags
            oncallTeam: .__team.name
            teamMembers: '[.__team.members[].user.username]'
            oncallUsers: .__oncalls.onCallRecipients
  - kind: alert
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: .id
          title: .message
          blueprint: '"opsGenieAlert"'
          properties:
            status: .status
            acknowledged: .acknowledged
            responders: .responders
            priority: .priority
            sourceName: .source
            tags: .tags
            count: .count
            createdBy: .owner
            createdAt: .createdAt
            updatedAt: .updatedAt
            description: .description
            integration: .integration.name
          relations:
            relatedIncident: .__relatedIncident.id
  - kind: incident
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: .id
          title: .message
          blueprint: '"opsGenieIncident"'
          properties:
            status: .status
            responders: .responders
            priority: .priority
            tags: .tags
            url: .links.web
            createdAt: .createdAt
            updatedAt: .updatedAt
            description: .description
          relations:
            services: '[.__impactedServices[] | .name | gsub("[^a-zA-Z0-9@_.:/=-]"; "-") | tostring]'
```
</details>

#### Step 2: Update to New Configuration
To adapt to version 0.2.0, you will need to update your configuration as follows:

<details>
<summary>New configuration (click to expand)</summary>

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
          // highlight-next-line
          identifier: .id  # The identifier of the service now uses the unique ID from OpsGenie instead of the name
          title: .name
          blueprint: '"opsGenieService"'
          properties:
            description: .description
            url: .links.web
            tags: .tags
  - kind: alert
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: .id
          title: .message
          blueprint: '"opsGenieAlert"'
          properties:
            status: .status
            acknowledged: .acknowledged
            responders: .responders
            priority: .priority
            sourceName: .source
            tags: .tags
            count: .count
            createdBy: .owner
            createdAt: .createdAt
            updatedAt: .updatedAt
            description: .description
            integration: .integration.name
          relations:
            // highlight-next-line
            relatedIncident: 'if (.alias | contains("_")) then (.alias | split("_")[0]) else null end'  # We now use JQ logic to map alerts to incidents to avoid making extra API call
  - kind: incident
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: .id
          title: .message
          blueprint: '"opsGenieIncident"'
          properties:
            status: .status
            responders: .responders
            priority: .priority
            tags: .tags
            url: .links.web
            createdAt: .createdAt
            updatedAt: .updatedAt
            description: .description
          relations:
            // highlight-next-line
            services: .impactedServices  # We can now directly map incidents to impacted services using the data that is coming from the API
```
</details>

In the updated configuration, the `opsGenieService` blueprint no longer includes properties like `oncallTeam`, `teamMembers`, and `oncallUsers`. These properties are now part of the new `OpsGenieTeam` blueprint. If you need to track on-call teams and users for each service, follow the steps below.

#### Step 3: Create the OpsGenieTeam Blueprint

To manage team-related data, create a new `OpsGenieTeam` blueprint in Port using the following schema: 

<details>
<summary> OpsGenie team blueprint (click to expand)</summary>

```json showLineNumbers
{
  "identifier": "opsGenieTeam",
  "description": "This blueprint represents an OpsGenie team in our software catalog",
  "title": "OpsGenie Team",
  "icon": "OpsGenie",
  "schema": {
    "properties": {
      "description": {
        "type": "string",
        "title": "Description",
        "icon": "DefaultProperty"
      },
      "url": {
        "title": "URL",
        "type": "string",
        "description": "URL to the service",
        "format": "url",
        "icon": "DefaultProperty"
      },
      "oncallUsers": {
        "type": "array",
        "title": "Current Oncalls",
        "items": {
          "type": "string",
          "format": "user"
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

#### Step 4: Update the OpsGenieService Blueprint

Next, update the `opsGenieService` blueprint to reference the `OpsGenieTeam` blueprint by establishing a relation and mirroring relevant properties:

<details>
<summary> Updated OpsGenie service blueprint (click to expand)</summary>

```json showLineNumbers
{
  "identifier": "opsGenieService",
  "description": "This blueprint represents an OpsGenie service in our software catalog",
  "title": "OpsGenie Service",
  "icon": "OpsGenie",
  "schema": {
    "properties": {
      "description": {
        "type": "string",
        "title": "Description",
        "icon": "DefaultProperty"
      },
      "url": {
        "title": "URL",
        "type": "string",
        "description": "URL to the service",
        "format": "url",
        "icon": "DefaultProperty"
      },
      "tags": {
        "type": "array",
        "items": {
          "type": "string"
        },
        "title": "Tags",
        "icon": "DefaultProperty"
      }
    },
    "required": []
  },
  "mirrorProperties": {
    "oncallUsers": {
      "title": "Current Oncalls",
      "path": "ownerTeam.oncallUsers"
    }
  },
  "calculationProperties": {
  },
  "aggregationProperties": {
    "numberOfOpenIncidents": {
      "title": "Number of open incidents",
      "type": "number",
      "target": "opsGenieIncident",
      "query": {
        "combinator": "and",
        "rules": [
          {
            "property": "status",
            "operator": "=",
            "value": "open"
          }
        ]
      },
      "calculationSpec": {
        "calculationBy": "entities",
        "func": "count"
      }
    }
  },
  "relations": {
    "ownerTeam": {
      "title": "Owner Team",
      "target": "opsGenieTeam",
      "required": false,
      "many": false
    }
  }
}
```
</details>

#### Step 5: Update the Mapping Configuration

Update your configuration mapping to correctly populate the `OpsGenieTeam` blueprint with team and on-call data. This will enable you to view on-call team information at the service level:

<details>
<summary>Updated configuration to add teams and oncalls (click to expand)</summary>

```yaml showLineNumbers
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: team
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: .id
          title: .name
          blueprint: '"opsGenieTeam"'
          properties:
            description: .description
            url: .links.web
  - kind: service
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: .id
          title: .name
          blueprint: '"opsGenieService"'
          properties:
            description: .description
            url: .links.web
            tags: .tags
          relations:
            ownerTeam: .teamId
  - kind: schedule-oncall
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: .ownerTeam.id
          title: .ownerTeam.name
          blueprint: '"opsGenieTeam"'
          properties:
            oncallUsers: .__currentOncalls.onCallRecipients
```
</details>

#### Final Step: Full Configuration Example

After completing these changes, your configuration should look like this, incorporating blueprints for `team`, `service`, `alert` and `incident`:
<details>
<summary>Full configuration (click to expand)</summary>

```yaml showLineNumbers
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: team
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: .id
          title: .name
          blueprint: '"opsGenieTeam"'
          properties:
            description: .description
            url: .links.web
  - kind: service
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: .id
          title: .name
          blueprint: '"opsGenieService"'
          properties:
            description: .description
            url: .links.web
            tags: .tags
          relations:
            ownerTeam: .teamId
  - kind: alert
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: .id
          title: .message
          blueprint: '"opsGenieAlert"'
          properties:
            status: .status
            acknowledged: .acknowledged
            responders: .responders
            priority: .priority
            sourceName: .source
            tags: .tags
            count: .count
            createdBy: .owner
            createdAt: .createdAt
            updatedAt: .updatedAt
            description: .description
            integration: .integration.name
          relations:
            relatedIncident: 'if (.alias | contains("_")) then (.alias | split("_")[0]) else null end'
  - kind: incident
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: .id
          title: .message
          blueprint: '"opsGenieIncident"'
          properties:
            status: .status
            responders: .responders
            priority: .priority
            tags: .tags
            url: .links.web
            createdAt: .createdAt
            updatedAt: .updatedAt
            description: .description
          relations:
            services: .impactedServices
  - kind: schedule-oncall
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: .ownerTeam.id
          title: .ownerTeam.name
          blueprint: '"opsGenieTeam"'
          properties:
            oncallUsers: .__currentOncalls.onCallRecipients
```
</details>

Following this guide will ensure your integration is up-to-date and optimized for performance with version 0.2.0. For any issues during the migration, refer to the newly introduced debug logs to identify and contact your support personnel to resolve problems efficiently.

## More relevant guides and examples

- [Self-service action to trigger an OpsGenie incident](https://docs.getport.io/guides/all/create-an-opsgenie-incident)
