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

# Opsgenie

Our Opsgenie integration allows you to import `alert`, `service` and `incident` from your Opsgenie account into Port, according to your mapping and definitions.

## Common use cases

- Map `alert`, `service` and `incident` in your Opsgenie account.
- Watch for object changes (create/update/delete) in real-time, and automatically apply the changes to your entities in Port.

## Prerequisites

<Prerequisites />

## Installation

Choose one of the following installation methods:

<Tabs groupId="installation-methods" queryString="installation-methods">

<TabItem value="real-time-always-on" label="Real Time & Always On" default>

Using this installation option means that the integration will be able to update Port in real time using webhooks.

This table summarizes the available parameters for the installation.
Set them as you wish in the script below, then copy it and run it in your terminal:

| Parameter                        | Description                                                                                                   | Required |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------- | -------- |
| `port.clientId`                  | Your port client id                                                                                           | ✅       |
| `port.clientSecret`              | Your port client secret                                                                                       | ✅       |
| `port.baseUrl`                   | Your port base url, relevant only if not using the default port app                                           | ❌       |
| `integration.identifier`         | Change the identifier to describe your integration                                                            | ✅       |
| `integration.type`               | The integration type                                                                                          | ✅       |
| `integration.eventListener.type` | The event listener type                                                                                       | ✅       |
| `integration.secrets.apiToken`   | The Opsgenie API token                                                                                        | ✅       |
| `integration.config.apiUrl`      | The Opsgenie API URL. If not specified, the default will be https://api.opsgenie.com                          | ✅       |
| `scheduledResyncInterval`        | The number of minutes between each resync                                                                     | ❌       |
| `initializePortResources`        | Default true, When set to true the integration will create default blueprints and the port App config Mapping | ❌       |

<br/>
<Tabs groupId="deploy" queryString="deploy">

<TabItem value="helm" label="Helm" default>
To install the integration using Helm, run the following command:

```bash showLineNumbers
helm repo add --force-update port-labs https://port-labs.github.io/helm-charts
helm upgrade --install my-opsgenie-integration port-labs/port-ocean \
  --set port.clientId="CLIENT_ID"  \
  --set port.clientSecret="CLIENT_SECRET"  \
  --set initializePortResources=true  \
  --set integration.identifier="my-opsgenie-integration"  \
  --set integration.type="opsgenie"  \
  --set integration.eventListener.type="POLLING"  \
  --set integration.secrets.apiToken="API_TOKEN"  \
  --set integration.config.apiUrl="https://api.opsgenie.com"
```
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

</details>
<br/>

3. Apply your application manifest with `kubectl`:
```bash
kubectl apply -f my-ocean-opsgenie-integration.yaml
```
</TabItem>
</Tabs>

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
                                -e OCEAN__INTEGRATION__CONFIG__API_TOKEN=$OCEAN__INTEGRATION__CONFIG__API_TOKEN \
                                -e OCEAN__INTEGRATION__CONFIG__API_URL=$OCEAN__INTEGRATION__CONFIG__API_URL \
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
      -e OCEAN__INTEGRATION__CONFIG__API_TOKEN=${OCEAN__INTEGRATION__CONFIG__API_TOKEN} \
      -e OCEAN__INTEGRATION__CONFIG__API_URL=${OCEAN__INTEGRATION__CONFIG__API_URL} \
      -e OCEAN__PORT__CLIENT_ID=${OCEAN__PORT__CLIENT_ID} \
      -e OCEAN__PORT__CLIENT_SECRET=${OCEAN__PORT__CLIENT_SECRET} \
      $image_name

    exit $?
  displayName: 'Ingest Data into Port'

```

  </TabItem>

  </Tabs>
</TabItem>

</Tabs>

<AdvancedConfig/>

## Ingesting Opsgenie objects

The Opsgenie integration uses a YAML configuration to describe the process of loading data into the developer portal. See [examples](#examples) below.

The integration makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from Opsgenie's API events.

### Configuration structure

The integration configuration determines which resources will be queried from Opsgenie, and which entities and properties will be created in Port.

:::tip Supported resources
The following resources can be used to map data from Opsgenie, it is possible to reference any field that appears in the API responses linked below for the mapping configuration.

- [`Alert`](https://docs.opsgenie.com/docs/alert-api#list-alerts)
- [`Service`](https://docs.opsgenie.com/docs/service-api#list-services)
- [`Incident`](https://docs.opsgenie.com/docs/incident-api#list-incidents)

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
      },
      "oncallTeam": {
        "type": "string",
        "title": "OnCall Team",
        "description": "Name of the team responsible for this service",
        "icon": "DefaultProperty"
      },
      "teamMembers": {
        "icon": "TwoUsers",
        "type": "array",
        "items": {
          "type": "string",
          "format": "user"
        },
        "title": "Team Members",
        "description": "Members of team responsible for this service"
      },
      "oncallUsers": {
        "icon": "TwoUsers",
        "type": "array",
        "items": {
          "type": "string",
          "format": "user"
        },
        "title": "Oncall Users",
        "description": "Who is on call for this service"
      },
      "numOpenIncidents": {
        "title": "Number of Open Incidents",
        "type": "number"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {
    "teamSize": {
      "title": "Team Size",
      "icon": "DefaultProperty",
      "description": "Size of the team",
      "calculation": ".properties.teamMembers | length",
      "type": "number"
    }
  },
  "relations": {}
}
```

</details>

<details>
<summary>Integration configuration</summary>

```yaml showLineNumbers
resources:
  - kind: service
    selector:
      query: "true"
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
            teamMembers: "[.__team.members[].user.username]"
            oncallUsers: .__oncalls.onCallRecipients
            numOpenIncidents: '[ .__incidents[] | select(.status == "open")] | length'
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
        "enum": ["closed", "open", "resolved"],
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
resources:
  - kind: incident
    selector:
      query: "true"
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
        "enum": ["closed", "open"],
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
resources:
  - kind: alert
    selector:
      query: "true"
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
```

</details>

## Let's Test It

This section includes a sample response data from Opsgenie. In addition, it includes the entity created from the resync event based on the Ocean configuration provided in the previous section.

### Payload

Here is an example of the payload structure from Opsgenie:

<details>
<summary> Service response data</summary>

```json showLineNumbers
{
  "id": "daa0d66f-ad35-4396-b30d-70f0314c697a",
  "name": "Port Outbound Service",
  "description": "For outbound communications and integrations",
  "teamId": "63374eee-0b03-42d4-bb8c-50d1fa64827c",
  "tags": ["communication", "channel"],
  "links": {
    "web": "https://mytestaccount.app.opsgenie.com/service/daa0d66f-ad35-4396-b30d-70f0314c697a/status",
    "api": "https://api.opsgenie.com/v1/services/daa0d66f-ad35-4396-b30d-70f0314c697a"
  },
  "isExternal": false,
  "__team": {
    "id": "63374eee-0b03-42d4-bb8c-50d1fa64827c",
    "name": "Data Science Team",
    "description": "",
    "members": [
      {
        "user": {
          "id": "ce544b61-7b35-43ea-89ee-a8750638d3a4",
          "username": "testuser@gmail.com"
        },
        "role": "admin"
      },
      {
        "user": {
          "id": "9ea8f86a-6648-46d6-a2fc-1a6eb5f739c8",
          "username": "devtester@gmail.com"
        },
        "role": "user"
      }
    ],
    "links": {
      "web": "https://app.opsgenie.com/teams/dashboard/63374eee-0b03-42d4-bb8c-50d1fa64827c/main",
      "api": "https://api.opsgenie.com/v2/teams/63374eee-0b03-42d4-bb8c-50d1fa64827c"
    }
  },
  "__incidents": [
    {
      "id": "652f14b3-019a-4d4c-8b83-e4da527a416c",
      "description": "summary",
      "impactedServices": ["daa0d66f-ad35-4396-b30d-70f0314c697a"],
      "tinyId": "3",
      "message": "OpenAI Incident",
      "status": "open",
      "tags": ["tags"],
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
        "web": "https://mytestaccount.app.opsgenie.com/incident/detail/652f14b3-019a-4d4c-8b83-e4da527a416c",
        "api": "https://api.opsgenie.com/v1/incidents/652f14b3-019a-4d4c-8b83-e4da527a416c"
      },
      "impactStartDate": "2023-09-26T17:06:16.824Z",
      "impactEndDate": "2023-09-26T17:45:25.719Z",
      "actions": []
    },
    {
      "id": "4a0c5e6d-b239-4cd9-a7e8-a5f880e99473",
      "description": "descirption",
      "impactedServices": [
        "59591948-d418-4bb9-af16-170d6b232b7d",
        "daa0d66f-ad35-4396-b30d-70f0314c697a"
      ],
      "tinyId": "2",
      "message": "My Incident",
      "status": "open",
      "tags": ["hello"],
      "createdAt": "2023-09-20T13:33:00.941Z",
      "updatedAt": "2023-09-26T17:48:54.48Z",
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
        },
        {
          "type": "user",
          "id": "9ea8f86a-6648-46d6-a2fc-1a6eb5f739c8"
        }
      ],
      "extraProperties": {},
      "links": {
        "web": "https://mytestaccount.app.opsgenie.com/incident/detail/4a0c5e6d-b239-4cd9-a7e8-a5f880e99473",
        "api": "https://api.opsgenie.com/v1/incidents/4a0c5e6d-b239-4cd9-a7e8-a5f880e99473"
      },
      "impactStartDate": "2023-09-20T13:33:00.941Z",
      "actions": []
    }
  ],
  "__oncalls": {
    "_parent": {
      "id": "d55e148e-d320-4766-9dcf-4fc2ce9daef1",
      "name": "Data Science Team_schedule",
      "enabled": true
    },
    "onCallRecipients": ["testuser@gmail.com"]
  }
}
```

</details>

<details>
<summary> Incident response data</summary>

```json showLineNumbers
{
  "id": "4a0c5e6d-b239-4cd9-a7e8-a5f880e99473",
  "description": "descirption",
  "impactedServices": [
    "59591948-d418-4bb9-af16-170d6b232b7d",
    "daa0d66f-ad35-4396-b30d-70f0314c697a"
  ],
  "tinyId": "2",
  "message": "My Incident",
  "status": "open",
  "tags": ["hello"],
  "createdAt": "2023-09-20T13:33:00.941Z",
  "updatedAt": "2023-09-26T17:48:54.48Z",
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
    },
    {
      "type": "user",
      "id": "9ea8f86a-6648-46d6-a2fc-1a6eb5f739c8"
    }
  ],
  "extraProperties": {},
  "links": {
    "web": "https://mytestaccount.app.opsgenie.com/incident/detail/4a0c5e6d-b239-4cd9-a7e8-a5f880e99473",
    "api": "https://api.opsgenie.com/v1/incidents/4a0c5e6d-b239-4cd9-a7e8-a5f880e99473"
  },
  "impactStartDate": "2023-09-20T13:33:00.941Z",
  "actions": [],
  "__impactedServices": [
    {
      "id": "59591948-d418-4bb9-af16-170d6b232b7d",
      "name": "My Test Service",
      "description": "This is for Opsgenie testing",
      "teamId": "63374eee-0b03-42d4-bb8c-50d1fa64827c",
      "tags": ["port", "devops", "ai"],
      "links": {
        "web": "https://mytestaccount.app.opsgenie.com/service/59591948-d418-4bb9-af16-170d6b232b7d/status",
        "api": "https://api.opsgenie.com/v1/services/59591948-d418-4bb9-af16-170d6b232b7d"
      },
      "isExternal": false
    },
    {
      "id": "daa0d66f-ad35-4396-b30d-70f0314c697a",
      "name": "Port Outbound Service",
      "description": "For outbound communications and integrations",
      "teamId": "63374eee-0b03-42d4-bb8c-50d1fa64827c",
      "tags": ["ui", "comment"],
      "links": {
        "web": "https://mytestaccount.app.opsgenie.com/service/daa0d66f-ad35-4396-b30d-70f0314c697a/status",
        "api": "https://api.opsgenie.com/v1/services/daa0d66f-ad35-4396-b30d-70f0314c697a"
      },
      "isExternal": false
    }
  ]
}
```

</details>

<details>
<summary> Alert response data</summary>

```json showLineNumbers
{
  "seen": true,
  "id": "580e9625-ecc7-42b0-8836-3d3637438bc4-169486700232",
  "tinyId": "2",
  "alias": "355f1681-f6e3-4355-a927-897cd8edaf8f_4d37bc8a-030b-4e8f-a230-aa429947253c",
  "message": "Login Auth not working",
  "status": "open",
  "integration": "Default API",
  "acknowledged": false,
  "isSeen": true,
  "tags": ["auth", "login"],
  "snoozed": false,
  "count": 1,
  "lastOccurredAt": "2023-04-21T08:36:18.46Z",
  "createdAt": "2023-04-21T08:36:18.46Z",
  "updatedAt": "2023-08-11T10:41:16.533Z",
  "source": "testuser@gmail.com",
  "owner": "testuser@gmail.com",
  "priority": "P3",
  "teams": [],
  "responders": [
    {
      "type": "user",
      "id": "ce544b61-7b35-43ea-89ee-a8750638d3a4"
    }
  ],
  "report": {
    "ackTime": 4852912663
  },
  "ownerTeamId": "",
  "__relatedIncident": {
    "id": "4a0c5e6d-b239-4cd9-a7e8-a5f880e99473",
    "description": "descirption",
    "impactedServices": [
      "59591948-d418-4bb9-af16-170d6b232b7d",
      "daa0d66f-ad35-4396-b30d-70f0314c697a"
    ],
    "tinyId": "2",
    "message": "My Incident",
    "status": "open",
    "tags": ["hello"],
    "createdAt": "2023-09-20T13:33:00.941Z",
    "updatedAt": "2023-09-26T17:48:54.48Z",
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
      },
      {
        "type": "user",
        "id": "9ea8f86a-6648-46d6-a2fc-1a6eb5f739c8"
      }
    ],
    "extraProperties": {},
    "links": {
      "web": "https://mytestaccount.app.opsgenie.com/incident/detail/4a0c5e6d-b239-4cd9-a7e8-a5f880e99473",
      "api": "https://api.opsgenie.com/v1/incidents/4a0c5e6d-b239-4cd9-a7e8-a5f880e99473"
    }
  }
}
```

</details>

### Mapping Result

The combination of the sample payload and the Ocean configuration generates the following Port entity:

<details>
<summary> Service entity in Port</summary>

```json showLineNumbers
{
  "identifier": "Port-Outbound-Service",
  "title": "Port Outbound Service",
  "team": [],
  "properties": {
    "description": "For outbound communications and integrations",
    "url": "https://mytestaccount.app.opsgenie.com/service/daa0d66f-ad35-4396-b30d-70f0314c697a/status",
    "tags": ["communication", "channel"],
    "oncallTeam": "Data Science Team",
    "teamMembers": ["testuser@gmail.com", "devtester@gmail.com"],
    "oncallUsers": ["testuser@gmail.com"],
    "numOpenIncidents": 2
  },
  "relations": {},
  "icon": "OpsGenie"
}
```

</details>

<details>
<summary> Incident entity in Port</summary>

```json showLineNumbers
{
  "identifier": "4a0c5e6d-b239-4cd9-a7e8-a5f880e99473",
  "blueprint": "opsGenieIncident",
  "title": "My Incident",
  "properties": {
    "status": "open",
    "responders": [
      {
        "type": "team",
        "id": "63374eee-0b03-42d4-bb8c-50d1fa64827c"
      },
      {
        "type": "user",
        "id": "ce544b61-7b35-43ea-89ee-a8750638d3a4"
      },
      {
        "type": "user",
        "id": "9ea8f86a-6648-46d6-a2fc-1a6eb5f739c8"
      }
    ],
    "priority": "P3",
    "tags": ["hello"],
    "url": "https://mytestaccount.app.opsgenie.com/incident/detail/4a0c5e6d-b239-4cd9-a7e8-a5f880e99473",
    "createdAt": "2023-09-20T13:33:00.941Z",
    "updatedAt": "2023-09-26T17:48:54.48Z",
    "description": "descirption"
  },
  "relations": {
    "services": ["Port-Outbound-Service", "My-Test-Service"]
  },
  "icon": "OpsGenie"
}
```

</details>

<details>
<summary> Alert entity in Port</summary>

```json showLineNumbers
{
  "identifier": "580e9625-ecc7-42b0-8836-3d3637438bc4-1694867002321",
  "title": "Login Auth not working",
  "team": [],
  "properties": {
    "status": "open",
    "acknowledged": true,
    "tags": ["auth", "login"],
    "responders": [
      {
        "type": "user",
        "id": "ce544b61-7b35-43ea-89ee-a8750638d3a4"
      }
    ],
    "integration": "Default API",
    "priority": "P3",
    "sourceName": "testuser@gmail.com",
    "createdBy": "testuser@gmail.com",
    "createdAt": "2023-09-16T12:23:22.321Z",
    "updatedAt": "2023-09-26T17:51:00.346Z",
    "count": 1
  },
  "relations": {
    "relatedIncident": "4a0c5e6d-b239-4cd9-a7e8-a5f880e99473"
  },
  "icon": "OpsGenie"
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
