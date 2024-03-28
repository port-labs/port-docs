---
sidebar_position: 3
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import Prerequisites from "../templates/\_ocean_helm_prerequisites_block.mdx"
import AzurePremise from "../templates/\_ocean_azure_premise.mdx"
import DockerParameters from "./\_firehydrant_docker_params.mdx"
import AdvancedConfig from '../../../generalTemplates/_ocean_advanced_configuration_note.md'

# FireHydrant

Our FireHydrant integration allows you to import `environment`, `service`, `incident` and `retrospective` from your FireHydrant account into Port, according to your mapping and definitions.

## Common use cases

- Map `environment`, `service`, `incident` and `retrospective` in your FireHydrant account.
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

| Parameter                        | Description                                                                                                               | Required |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | -------- |
| `port.clientId`                  | Your port client id                                                                                                       | ✅       |
| `port.clientSecret`              | Your port client secret                                                                                                   | ✅       |
| `port.baseUrl`                   | Your port base url, relevant only if not using the default port app                                                       | ❌       |
| `integration.identifier`         | Change the identifier to describe your integration                                                                        | ✅       |
| `integration.type`               | The integration type                                                                                                      | ✅       |
| `integration.eventListener.type` | The event listener type                                                                                                   | ✅       |
| `integration.secrets.token`      | The FireHydrant API token                                                                                                 | ✅       |
| `integration.config.apiUrl`      | The FireHydrant API URL. If not specified, the default will be https://api.firehydrant.io                                 | ❌       |
| `integration.config.appHost`     | The host of the Port Ocean app. Used to set up the integration endpoint as the target for Webhooks created in FireHydrant | ❌       |
| `scheduledResyncInterval`        | The number of minutes between each resync                                                                                 | ❌       |
| `initializePortResources`        | Default true, When set to true the integration will create default blueprints and the port App config Mapping             | ❌       |

<br/>

<Tabs groupId="deploy" queryString="deploy">

<TabItem value="helm" label="Helm" default>
To install the integration using Helm, run the following command:

```bash showLineNumbers
helm repo add --force-update port-labs https://port-labs.github.io/helm-charts
helm upgrade --install my-firehydrant-integration port-labs/port-ocean \
	--set port.clientId="CLIENT_ID"  \
	--set port.clientSecret="CLIENT_SECRET"  \
	--set initializePortResources=true  \
	--set integration.identifier="my-firehydrant-integration"  \
	--set integration.type="firehydrant"  \
	--set integration.eventListener.type="POLLING"  \
	--set integration.config.apiUrl="https://api.firehydrant.io"  \
	--set integration.secrets.token="<FIREHYDRANT_API_TOKEN>"
```
</TabItem>

<TabItem value="argocd" label="ArgoCD" default>
To install the integration using ArgoCD, follow these steps:

1. Create a `values.yaml` file in `argocd/my-ocean-firehydrant-integration` in your git repository with the content:

:::note
Remember to replace the placeholders for `FIREHYDRANT_API_URL` and `FIREHYDRANT_API_TOKEN`.
:::
```yaml showLineNumbers
initializePortResources: true
scheduledResyncInterval: 120
integration:
  identifier: my-ocean-firehydrant-integration
  type: firehydrant
  eventListener:
    type: POLLING
  config:
  // highlight-next-line
    apiUrl: FIREHYDRANT_API_URL
  secrets:
  // highlight-next-line
    token: FIREHYDRANT_API_TOKEN
```
<br/>

2. Install the `my-ocean-firehydrant-integration` ArgoCD Application by creating the following `my-ocean-firehydrant-integration.yaml` manifest:
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
  name: my-ocean-firehydrant-integration
  namespace: argocd
spec:
  destination:
    namespace: my-ocean-firehydrant-integration
    server: https://kubernetes.default.svc
  project: default
  sources:
  - repoURL: 'https://port-labs.github.io/helm-charts/'
    chart: port-ocean
    targetRevision: 0.1.14
    helm:
      valueFiles:
      - $values/argocd/my-ocean-firehydrant-integration/values.yaml
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
kubectl apply -f my-ocean-firehydrant-integration.yaml
```
</TabItem>
</Tabs>

</TabItem>

<TabItem value="one-time" label="Scheduled">
  <Tabs groupId="cicd-method" queryString="cicd-method">
  <TabItem value="github" label="GitHub">

This workflow will run the FireHydrant integration once and then exit, this is useful for **scheduled** ingestion of data.

:::warning
If you want the integration to update Port in real time using webhooks you should use the [Real Time & Always On](?installation-methods=real-time-always-on#installation) installation option
:::

Make sure to configure the following [Github Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions):

<DockerParameters/>

<br/>

Here is an example for `firehydrant-integration.yml` workflow file:

```yaml showLineNumbers
name: FireHydrant Exporter Workflow

# This workflow responsible for running FireHydrant exporter.

on:
  workflow_dispatch:

jobs:
  run-integration:
    runs-on: ubuntu-latest

    steps:
      - uses: port-labs/ocean-sail@v1
        with:
          type: 'firehydrant'
          port_client_id: ${{ secrets.OCEAN__PORT__CLIENT_ID }}
          port_client_secret: ${{ secrets.OCEAN__PORT__CLIENT_SECRET }} 
          config: |
            config_token: ${{ secrets.OCEAN__INTEGRATION__CONFIG__TOKEN }} 
```

  </TabItem>
  <TabItem value="jenkins" label="Jenkins">
This pipeline will run the FireHydrant integration once and then exit, this is useful for **scheduled** ingestion of data.

:::tip
Your Jenkins agent should be able to run docker commands.
:::
:::warning
If you want the integration to update Port in real time using webhooks you should use
the [Real Time & Always On](?installation-methods=real-time-always-on#installation) installation option.
:::

Make sure to configure the following [Jenkins Credentials](https://www.jenkins.io/doc/book/using/using-credentials/)
of `Secret Text` type:

<DockerParameters/>

<br/>

Here is an example for `Jenkinsfile` groovy pipeline file:

```text showLineNumbers
pipeline {
    agent any

    stages {
        stage('Run FireHydrant Integration') {
            steps {
                script {
                    withCredentials([
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__TOKEN', variable: 'OCEAN__INTEGRATION__CONFIG__TOKEN'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_ID', variable: 'OCEAN__PORT__CLIENT_ID'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_SECRET', variable: 'OCEAN__PORT__CLIENT_SECRET'),
                    ]) {
                        sh('''
                            #Set Docker image and run the container
                            integration_type="firehydrant"
                            version="latest"
                            image_name="ghcr.io/port-labs/port-ocean-${integration_type}:${version}"
                            docker run -i --rm --platform=linux/amd64 \
                                -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
                                -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
                                -e OCEAN__INTEGRATION__CONFIG__TOKEN=$OCEAN__INTEGRATION__CONFIG__TOKEN \
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
<AzurePremise name="FireHydrant" />

<DockerParameters />

<br/>

Here is an example for `firehydrant-integration.yml` pipeline file:

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
    integration_type="firehydrant"
    version="latest"

    image_name="ghcr.io/port-labs/port-ocean-$integration_type:$version"

    docker run -i --rm --platform=linux/amd64 \
      -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
      -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
      -e OCEAN__INTEGRATION__CONFIG__TOKEN=${OCEAN__INTEGRATION__CONFIG__TOKEN} \
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

## Ingesting FireHydrant objects

The FireHydrant integration uses a YAML configuration to describe the process of loading data into the developer portal. See [examples](#examples) below.

The integration makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from FireHydrant's API events.

### Configuration structure

The integration configuration determines which resources will be queried from FireHydrant, and which entities and properties will be created in Port.

:::tip Supported resources
The following resources can be used to map data from FireHydrant, it is possible to reference any field that appears in the API responses linked below for the mapping configuration.

- [`Environment`](https://developers.firehydrant.com/#/operations/getV1Environments)
- [`Service`](https://developers.firehydrant.com/#/operations/getV1Services)
- [`Incident`](https://developers.firehydrant.com/#/operations/getV1Incidents)
- [`Retrospective`](https://developers.firehydrant.com/#/operations/getV1PostMortemsReports)

:::

- The root key of the integration configuration is the `resources` key:

  ```yaml showLineNumbers
  # highlight-next-line
  resources:
    - kind: service
      selector:
      ...
  ```

- The `kind` key is a specifier for a FireHydrant object:

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

- The `port`, `entity` and the `mappings` keys are used to map the FireHydrant object fields to Port entities. To create multiple mappings of the same kind, you can add another item in the `resources` array;

  ```yaml showLineNumbers
  resources:
    - kind: service
      selector:
        query: "true"
      port:
        # highlight-start
        entity:
          mappings: # Mappings between one FireHydrant object to a Port entity. Each value is a JQ query.
            identifier: .id
            title: .name
            blueprint: '"firehydrantService"'
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

### Ingest data into Port

To ingest FireHydrant objects using the [integration configuration](#configuration-structure), you can follow the steps below:

1. Go to the DevPortal Builder page.
2. Select a blueprint you want to ingest using FireHydrant.
3. Choose the **Ingest Data** option from the menu.
4. Select FireHydrant under the Incident management category.
5. Modify the [configuration](#configuration-structure) according to your needs.
6. Click `Resync`.

## Examples

Examples of blueprints and the relevant integration configurations:

### Environment

<details>
<summary>Environment blueprint</summary>

```json showLineNumbers
{
  "identifier": "firehydrantEnvironment",
  "description": "This blueprint represents a firehydrant environment",
  "title": "FireHydrant Environment",
  "icon": "FireHydrant",
  "schema": {
    "properties": {
      "description": {
        "title": "Description",
        "type": "string"
      },
      "activeIncidents": {
        "title": "Active Incidents",
        "type": "number",
        "description": "Number of active incidents attached to this environment"
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
resources:
  - kind: environment
    selector:
      query: "true"
    port:
      entity:
        mappings:
          blueprint: '"firehydrantEnvironment"'
          identifier: .id
          title: .name
          properties:
            description: .description
            activeIncidents: .active_incidents | length
            createdAt: .created_at
            updatedAt: .updated_at
```

</details>

### Service

<details>
<summary>Service blueprint</summary>

```json showLineNumbers
{
  "identifier": "firehydrantService",
  "description": "This blueprint represents a firehydrant service",
  "title": "FireHydrant Service",
  "icon": "FireHydrant",
  "schema": {
    "properties": {
      "description": {
        "title": "Description",
        "type": "string",
        "icon": "DefaultProperty"
      },
      "slug": {
        "title": "Slug",
        "type": "string",
        "icon": "DefaultProperty"
      },
      "links": {
        "title": "Links",
        "type": "array",
        "icon": "DefaultProperty"
      },
      "labels": {
        "icon": "DefaultProperty",
        "title": "Labels",
        "type": "object"
      },
      "owner": {
        "title": "Team",
        "type": "string",
        "icon": "DefaultProperty"
      },
      "createdAt": {
        "title": "Created At",
        "type": "string",
        "format": "date-time",
        "icon": "DefaultProperty"
      },
      "updatedAt": {
        "title": "Updated At",
        "type": "string",
        "format": "date-time",
        "icon": "DefaultProperty"
      },
      "activeIncidents": {
        "title": "Active Incidents",
        "type": "number",
        "description": "Number of active incidents attached to this service"
      },
      "meanTimeToAcknowledge": {
        "title": "Mean Time to Acknowledge",
        "type": "number",
        "description": "Mean time (in hours) to acknowledge incidents attached to this service"
      },
      "meanTimeToDetect": {
        "title": "Mean Time to Detection",
        "type": "number",
        "description": "Mean time (in hours) to detect incidents attached to this service"
      },
      "meanTimeToMitigate": {
        "title": "Mean Time to Mitigation",
        "type": "number",
        "description": "Mean time (in hours) to mitigate incidents attached to this service"
      },
      "meanTimeToResolve": {
        "title": "Mean Time to Resolution",
        "type": "number",
        "description": "Mean time (in hours) to resolve incidents attached to this service"
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
resources:
  - kind: service
    selector:
      query: "true"
    port:
      entity:
        mappings:
          blueprint: '"firehydrantService"'
          identifier: .id
          title: .name
          properties:
            description: .description
            slug: .slug
            links: .links[].href_url
            labels: .labels
            owner: .owner.name
            activeIncidents: .active_incidents | length
            meanTimeToAcknowledge: '[(.__incidents.milestones[] | map(select(.type == "started" or .type == "acknowledged")) | sort_by(.occurred_at) | group_by(.type) | map(.[0].occurred_at) | select(length == 2) | ([.[1], .[0]] | map(sub("\\.\\d+Z$"; "Z") | fromdate)) | .[1] - .[0] // null)] | add / length / 3600 | floor'
            meanTimeToDetect: '[(.__incidents.milestones[] | map(select(.type == "started" or .type == "detected")) | sort_by(.occurred_at) | group_by(.type) | map(.[0].occurred_at) | select(length == 2) | ([.[1], .[0]] | map(sub("\\.\\d+Z$"; "Z") | fromdate)) | .[1] - .[0] // null)] | add / length / 3600 | floor'
            meanTimeToMitigate: '[(.__incidents.milestones[] | map(select(.type == "started" or .type == "mitigated")) | sort_by(.occurred_at) | group_by(.type) | map(.[0].occurred_at) | select(length == 2) | ([.[1], .[0]] | map(sub("\\.\\d+Z$"; "Z") | fromdate)) | .[1] - .[0] // null)] | add / length / 3600 | floor'
            meanTimeToResolve: '[(.__incidents.milestones[] | map(select(.type == "started" or .type == "resolved")) | sort_by(.occurred_at) | group_by(.type) | map(.[0].occurred_at) | select(length == 2) | ([.[1], .[0]] | map(sub("\\.\\d+Z$"; "Z") | fromdate)) | .[1] - .[0] // null)] | add / length / 3600 | floor'
            createdAt: .created_at
            updatedAt: .updated_at
```

</details>

### Incident

<details>
<summary>Incident blueprint</summary>

```json showLineNumbers
{
  "identifier": "firehydrantIncident",
  "description": "This blueprint represents a firehydrant incident",
  "title": "FireHydrant Incident",
  "icon": "FireHydrant",
  "schema": {
    "properties": {
      "url": {
        "type": "string",
        "title": "Incident URL",
        "format": "url",
        "description": "the link to the incident"
      },
      "priority": {
        "title": "Priority",
        "type": "string",
        "enum": ["P1", "P2", "P3", "P4"],
        "enumColors": {
          "P1": "red",
          "P2": "red",
          "P3": "orange",
          "P4": "orange"
        }
      },
      "severity": {
        "title": "Severity",
        "type": "string"
      },
      "tags": {
        "title": "Tags",
        "type": "array"
      },
      "currentMilestone": {
        "type": "string",
        "title": "Current Milestone",
        "default": "started",
        "enum": [
          "started",
          "detected",
          "acknowledged",
          "investigating",
          "identified",
          "mitigated",
          "resolved",
          "postmortem_started",
          "postmortem_completed",
          "closed"
        ],
        "enumColors": {
          "started": "red",
          "detected": "red",
          "acknowledged": "orange",
          "investigating": "yellow",
          "identified": "yellow",
          "mitigated": "green",
          "resolved": "green",
          "postmortem_started": "purple",
          "postmortem_completed": "blue",
          "closed": "green"
        }
      },
      "functionalities": {
        "title": "Functionalities Impacted",
        "type": "array"
      },
      "customerImpact": {
        "title": "Customers Impacted",
        "type": "string"
      },
      "createdBy": {
        "title": "Created By",
        "type": "string",
        "format": "user",
        "icon": "TwoUsers"
      },
      "createdAt": {
        "title": "Created At",
        "type": "string",
        "format": "date-time"
      },
      "description": {
        "title": "Description",
        "type": "string"
      },
      "commander": {
        "title": "Commander",
        "type": "string",
        "format": "user",
        "icon": "TwoUsers"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "relations": {
    "environment": {
      "title": "Impacted Environments",
      "target": "firehydrantEnvironment",
      "required": false,
      "many": true
    },
    "service": {
      "title": "Impacted Services",
      "target": "firehydrantService",
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
resources:
  - kind: incident
    selector:
      query: "true"
    port:
      entity:
        mappings:
          blueprint: '"firehydrantIncident"'
          identifier: .id
          title: .name
          properties:
            url: .incident_url
            priority: .priority
            severity: .severity
            tags: .tag_list
            currentMilestone: .current_milestone
            functionalities: .functionalities[].name
            description: .description
            customerImpact: .customers_impacted
            commander: .role_assignments[] | select(.incident_role.name == "Commander") | .user.email
            createdBy: .created_by.email
            createdAt: .created_at
          relations:
            environment: .environments | map(.id)
            service: .services | map(.id)
```

</details>

### Retrospective

<details>
<summary>Retrospective blueprint</summary>

```json showLineNumbers
{
  "identifier": "firehydrantRetrospective",
  "description": "This blueprint represents a service in our software catalog",
  "title": "FireHydrant Retrospective",
  "icon": "FireHydrant",
  "schema": {
    "properties": {
      "url": {
        "type": "string",
        "title": "Incident URL",
        "format": "url",
        "description": "the link to the incident",
        "icon": "DefaultProperty"
      },
      "tags": {
        "title": "Tags",
        "type": "array",
        "icon": "DefaultProperty"
      },
      "services": {
        "title": "Services Impacted",
        "type": "array",
        "icon": "DefaultProperty"
      },
      "environments": {
        "title": "Environments Impacted",
        "type": "array",
        "icon": "DefaultProperty"
      },
      "functionalities": {
        "title": "Functionalities Impacted",
        "type": "array",
        "icon": "DefaultProperty"
      },
      "createdBy": {
        "title": "Created By",
        "type": "string",
        "format": "user",
        "icon": "TwoUsers"
      },
      "createdAt": {
        "title": "Created At",
        "type": "string",
        "format": "date-time",
        "icon": "DefaultProperty"
      },
      "customerImpact": {
        "title": "Customer Impact",
        "type": "string",
        "icon": "DefaultProperty"
      },
      "commander": {
        "title": "Commander",
        "type": "string",
        "format": "user",
        "icon": "TwoUsers"
      },
      "resolvedAt": {
        "title": "Resolved At",
        "type": "string",
        "format": "date-time",
        "icon": "DefaultProperty"
      },
      "publishedAt": {
        "title": "Published At",
        "type": "string",
        "format": "date-time",
        "icon": "DefaultProperty"
      },
      "duration": {
        "icon": "DefaultProperty",
        "title": "Incident Duration (Hours)",
        "type": "number"
      },
      "completedTasks": {
        "icon": "DefaultProperty",
        "title": "Tasks Completed",
        "type": "number"
      },
      "incompletedTasks": {
        "icon": "DefaultProperty",
        "title": "Tasks Not Completed",
        "type": "number"
      },
      "questions": {
        "title": "Retro Questions and Answers",
        "type": "array",
        "icon": "DefaultProperty"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "relations": {
    "incident": {
      "title": "Incident",
      "target": "firehydrantIncident",
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
  - kind: retrospective
    selector:
      query: '.incident.current_milestone == "postmortem_completed"'
    port:
      entity:
        mappings:
          blueprint: '"firehydrantRetrospective"'
          identifier: .id
          title: .name
          properties:
            url: .incident.incident_url
            tags: .tag_list
            services: .incident.services[].name
            environments: .incident.environments[].name
            functionalities: .incident.functionalities[].name
            description: .incident.description
            customerImpact: .incident.customers_impacted
            commander: .incident.role_assignments[] | select(.incident_role.name == "Commander") | .user.email
            createdBy: .incident.created_by.email
            resolvedAt: .incident.milestones[] | select(.type == "resolved") | .created_at
            createdAt: .incident.created_at
            publishedAt: .incident.milestones[] | select(.type == "postmortem_completed") | .created_at
            duration: (.incident.milestones | map(select(.type == "started" or .type == "resolved")) | sort_by(.occurred_at) | group_by(.type) | map(.[0].occurred_at) | select(length == 2) | ([.[1], .[0]] | map(sub("\\.\\d+Z$"; "Z") | fromdate)) | .[1] - .[0] // null) | ./3600 | floor
            completedTasks: .__incident.tasks | map(select(.state == "done")) | length
            incompletedTasks: .__incident.tasks | map(select(.state != "done")) | length
            questions: ".questions | map({question: .title, answer: .body})"
          relations:
            incident: .incident.id
```

</details>

## Let's Test It

This section includes a sample response data from FireHydrant. In addition, it includes the entity created from the resync event based on the Ocean configuration provided in the previous section.

### Payload

Here is an example of the payload structure from FireHydrant:

<details>
<summary> Environment response data</summary>

```json showLineNumbers
{
  "id": "21011924-215e-4aa4-abbf-6155ecf237ae",
  "name": "Production",
  "slug": "production",
  "description": "",
  "updated_at": "2023-09-05T17:01:48.348Z",
  "created_at": "2023-09-05T17:01:48.348Z",
  "active_incidents": [
    "71bdfd6f-4ee7-4222-a9a3-832637174ae7",
    "fcd05e8b-e66b-46b7-9210-d6607fdc8894"
  ],
  "external_resources": []
}
```

</details>

<details>
<summary> Service response data</summary>

```json showLineNumbers
{
  "id": "87aeea3d-4dcd-4c1e-bf8c-e68e73892e44",
  "name": "My Test Service",
  "description": "For testing this service",
  "slug": "my-test-service",
  "service_tier": 3,
  "created_at": "2023-09-06T12:37:37.378Z",
  "updated_at": "2023-09-20T10:25:32.730Z",
  "labels": {
    "myket": "service",
    "keyval": "app"
  },
  "active_incidents": [
    "71bdfd6f-4ee7-4222-a9a3-832637174ae7",
    "fcd05e8b-e66b-46b7-9210-d6607fdc8894"
  ],
  "alert_on_add": true,
  "auto_add_responding_team": false,
  "checklists": [],
  "completed_checks": 0,
  "external_resources": [],
  "functionalities": [
    {
      "id": "8861c55d-042d-43f1-9aab-c44c056dcbff",
      "name": "Platform - Deployments",
      "slug": "platform-deployments",
      "description": "",
      "created_at": "2023-09-05T17:01:48.484Z",
      "updated_at": "2023-09-05T17:01:48.484Z",
      "labels": {},
      "active_incidents": ["71bdfd6f-4ee7-4222-a9a3-832637174ae7"],
      "links": [],
      "owner": "None",
      "alert_on_add": false,
      "auto_add_responding_team": "None",
      "updated_by": {
        "id": "5ffe7fce-539f-40e7-a6fe-762897190694",
        "name": "FireHydrant",
        "source": "patchy",
        "email": ""
      },
      "services": [
        {
          "id": "87aeea3d-4dcd-4c1e-bf8c-e68e73892e44",
          "name": "My Test Service",
          "description": "For testing this service",
          "slug": "my-test-service",
          "service_tier": 3,
          "created_at": "2023-09-06T12:37:37.378Z",
          "updated_at": "2023-09-20T10:25:32.730Z",
          "labels": {
            "myket": "service",
            "keyval": "app"
          },
          "alert_on_add": true,
          "auto_add_responding_team": false
        }
      ],
      "external_resources": [],
      "teams": []
    }
  ],
  "last_import": "None",
  "links": [
    {
      "id": "109feace-3aab-415f-9b67-c52418992570",
      "href_url": "https://example.com",
      "icon_url": "None",
      "name": "link text"
    }
  ],
  "managed_by": "None",
  "managed_by_settings": "None",
  "owner": {
    "id": "653c66f8-c14e-4f74-bf9d-9970382f6638",
    "name": "Test Escalation Team",
    "description": "This team is for us",
    "slug": "test-escalation-team",
    "created_at": "2023-09-06T12:44:16.021Z",
    "updated_at": "2023-09-06T12:44:16.021Z"
  },
  "service_checklist_updated_at": "None",
  "teams": [
    {
      "id": "653c66f8-c14e-4f74-bf9d-9970382f6638",
      "name": "Test Escalation Team",
      "description": "This team is for us",
      "slug": "test-escalation-team",
      "created_at": "2023-09-06T12:44:16.021Z",
      "updated_at": "2023-09-06T12:44:16.021Z"
    }
  ],
  "updated_by": {
    "id": "184eb568-c1a9-4f99-9d52-8f7dd6672158",
    "name": "My Username",
    "source": "firehydrant_user",
    "email": "testuser@gmail.com"
  },
  "__incidents": {
    "milestones": [
      [
        {
          "id": "e1c487c2-5479-47e7-96d8-d9a65f3a5288",
          "created_at": "2023-09-07T21:25:15.876Z",
          "updated_at": "2023-09-07T21:25:15.876Z",
          "type": "started",
          "occurred_at": "2023-09-07T21:25:15.865Z",
          "duration": "None"
        },
        {
          "id": "a4b3fab9-3992-49bd-ae01-d277c99e2b97",
          "created_at": "2023-09-07T21:25:46.535Z",
          "updated_at": "2023-09-07T21:25:46.543Z",
          "type": "detected",
          "occurred_at": "2023-09-07T21:25:46.530Z",
          "duration": "PT30S"
        },
        {
          "id": "47920f14-a0c7-4003-a773-dd07eb33d8e5",
          "created_at": "2023-09-07T21:28:30.792Z",
          "updated_at": "2023-09-07T21:28:30.805Z",
          "type": "mitigated",
          "occurred_at": "2023-09-07T21:28:30.787Z",
          "duration": "PT2M44S"
        }
      ],
      [
        {
          "id": "293808a2-d214-4f6e-9b46-d055aa5f2540",
          "created_at": "2023-09-07T21:12:45.129Z",
          "updated_at": "2023-09-07T21:12:45.129Z",
          "type": "started",
          "occurred_at": "2023-09-07T21:12:45.121Z",
          "duration": "None"
        },
        {
          "id": "bd073d71-391b-46fd-98b3-62518a9fed8a",
          "created_at": "2023-09-07T21:12:45.177Z",
          "updated_at": "2023-09-07T21:12:45.185Z",
          "type": "acknowledged",
          "occurred_at": "2023-09-07T21:12:45.121Z",
          "duration": "PT0S"
        },
        {
          "id": "4e4db026-710f-4492-913f-9add2ee1b9cb",
          "created_at": "2023-09-07T21:15:05.564Z",
          "updated_at": "2023-09-07T21:15:05.576Z",
          "type": "identified",
          "occurred_at": "2023-09-07T21:15:05.559Z",
          "duration": "PT2M20S"
        },
        {
          "id": "e02eeb8c-2f5c-4f77-a8c0-bda3485e644c",
          "created_at": "2023-09-07T21:22:39.862Z",
          "updated_at": "2023-09-07T21:22:39.862Z",
          "type": "mitigated",
          "occurred_at": "2023-09-07T21:22:39.817Z",
          "duration": "PT7M34S"
        },
        {
          "id": "ee672221-8917-4628-ae8a-ef06e34d02cf",
          "created_at": "2023-09-07T21:22:39.822Z",
          "updated_at": "2023-09-07T21:22:39.869Z",
          "type": "resolved",
          "occurred_at": "2023-09-07T21:22:39.817Z",
          "duration": "PT0S"
        }
      ],
      [
        {
          "id": "785599df-be6a-4c13-80ea-11b15eeffa2e",
          "created_at": "2023-09-05T17:05:25.681Z",
          "updated_at": "2023-09-05T17:05:25.681Z",
          "type": "started",
          "occurred_at": "2023-09-05T17:05:25.671Z",
          "duration": "None"
        },
        {
          "id": "a4ee606e-221a-44e2-9c6d-6f83795d0b16",
          "created_at": "2023-09-07T20:37:07.289Z",
          "updated_at": "2023-09-07T20:37:07.303Z",
          "type": "detected",
          "occurred_at": "2023-09-07T20:37:07.285Z",
          "duration": "P2DT3H31M41S"
        },
        {
          "id": "7077e41c-ba30-48c6-9cf1-548c9a692275",
          "created_at": "2023-09-07T21:13:25.337Z",
          "updated_at": "2023-09-07T21:13:25.351Z",
          "type": "identified",
          "occurred_at": "2023-09-07T21:13:25.333Z",
          "duration": "PT36M18S"
        }
      ]
    ]
  }
}
```

</details>

<details>
<summary> Incident response data</summary>

```json showLineNumbers
{
  "id": "eb03f3f2-1a58-4d19-9f85-b3e46dbf5c2e",
  "name": "System outage",
  "created_at": "2023-09-08T10:58:06.791Z",
  "started_at": "2023-09-08T10:58:07.013Z",
  "discarded_at": "None",
  "summary": "",
  "customer_impact_summary": "",
  "description": "A system that isn't customer-facing or doesn't impact customer data processing is unavailable",
  "current_milestone": "acknowledged",
  "number": 6,
  "priority": "P2",
  "severity": "SEV2",
  "severity_color": "orange",
  "severity_impact": "None",
  "severity_condition": "None",
  "tag_list": ["internal"],
  "private_id": "4303c837eeb640b39cab772c2f03668e65168041f504eb645027ff362cbac64ad1908268fa802d80205f21e7438516270f607b0f3406564f6d4056985efffdb6e8d2843bb3314426b404a20150cab0a8e9ddcb6114d9cd0140ad9148fb7f7993f827b5e0",
  "organization_id": "0445b04e-5ed5-4fdc-aef7-5d68046ed78e",
  "milestones": [
    {
      "id": "64aca0c7-4c92-42f1-9482-7910e46d88bf",
      "created_at": "2023-09-08T10:58:07.026Z",
      "updated_at": "2023-09-08T10:58:07.026Z",
      "type": "started",
      "occurred_at": "2023-09-08T10:58:07.013Z",
      "duration": "None"
    },
    {
      "id": "0778f6c0-999e-47a9-9d53-6cb9df872356",
      "created_at": "2023-09-08T10:58:07.076Z",
      "updated_at": "2023-09-08T10:58:07.085Z",
      "type": "acknowledged",
      "occurred_at": "2023-09-08T10:58:07.013Z",
      "duration": "PT0S"
    }
  ],
  "active": true,
  "labels": {},
  "role_assignments": [
    {
      "id": "d8724146-9dcd-4be1-8673-71d48e6192e8",
      "status": "active",
      "created_at": "2023-09-08T10:58:08.031Z",
      "updated_at": "2023-09-08T10:58:08.031Z",
      "incident_role": {
        "id": "dace9563-adf1-47a4-889d-a4048b2c07bf",
        "name": "Commander",
        "summary": "The incident commander holds the high-level state about the incident",
        "description": "",
        "created_at": "2023-09-05T17:01:47.908Z",
        "updated_at": "2023-09-05T17:01:47.908Z",
        "discarded_at": "None"
      },
      "user": {
        "id": "184eb568-c1a9-4f99-9d52-8f7dd6672158",
        "name": "My Username",
        "email": "testuser@gmail.com",
        "slack_user_id": "None",
        "slack_linked?": false,
        "created_at": "2023-09-05T17:01:49.368Z",
        "updated_at": "2023-09-05T17:01:49.368Z"
      }
    }
  ],
  "status_pages": [],
  "incident_url": "https://app.firehydrant.io/org/port-5478/incidents/eb03f3f2-1a58-4d19-9f85-b3e46dbf5c2e/incident/overview",
  "private_status_page_url": "",
  "organization": {
    "name": "Port",
    "id": "0445b04e-5ed5-4fdc-aef7-5d68046ed78e"
  },
  "customers_impacted": 0,
  "monetary_impact": "None",
  "monetary_impact_cents": "None",
  "last_update": "None",
  "last_note": "None",
  "report_id": "1d9f12b8-b8ee-458d-a720-7f2429303213",
  "services": [
    {
      "id": "4e5bb8f3-4eab-4a13-b354-de7fc47f3554",
      "name": "Port Internal Service Tested"
    }
  ],
  "environments": [],
  "functionalities": [],
  "channel_name": "None",
  "channel_reference": "None",
  "channel_id": "None",
  "channel_status": "None",
  "incident_tickets": [],
  "ticket": "None",
  "impacts": [
    {
      "id": "8bbadcd0-9be7-4137-b5f2-9e6df6c26faa",
      "type": "service",
      "impact": {
        "id": "4e5bb8f3-4eab-4a13-b354-de7fc47f3554",
        "name": "Port Internal Service Tested"
      },
      "condition": {
        "id": "b1fc9184-b3f3-4af1-a111-68abcad9bf34",
        "name": "Unavailable",
        "position": 0
      },
      "conversations": [
        {
          "id": "Z2lkOi8vbGFkZGVydHJ1Y2svSW5jaWRlbnRzOjpJbXBhY3QvOGJiYWRjZDAtOWJlNy00MTM3LWI1ZjItOWU2ZGY2YzI2ZmFh",
          "resource_class": "Incidents::Impact",
          "resource_id": "8bbadcd0-9be7-4137-b5f2-9e6df6c26faa",
          "field": "None",
          "comments_url": "/v1/conversations/Z2lkOi8vbGFkZGVydHJ1Y2svSW5jaWRlbnRzOjpJbXBhY3QvOGJiYWRjZDAtOWJlNy00MTM3LWI1ZjItOWU2ZGY2YzI2ZmFh/comments",
          "channel": {
            "name": "private-conversations-Z2lkOi8vbGFkZGVydHJ1Y2svSW5jaWRlbnRzOjpJbXBhY3QvOGJiYWRjZDAtOWJlNy00MTM3LWI1ZjItOWU2ZGY2YzI2ZmFh"
          }
        }
      ]
    }
  ],
  "conference_bridges": [],
  "incident_channels": [],
  "retro_exports": [],
  "created_by": {
    "id": "184eb568-c1a9-4f99-9d52-8f7dd6672158",
    "name": "My Username",
    "source": "firehydrant_user",
    "email": "testuser@gmail.com"
  },
  "context_object": "None",
  "restricted": false,
  "team_assignments": [],
  "conversations": [
    {
      "id": "Z2lkOi8vbGFkZGVydHJ1Y2svSW5jaWRlbnQvZWIwM2YzZjItMWE1OC00ZDE5LTlmODUtYjNlNDZkYmY1YzJl",
      "resource_class": "Incident",
      "resource_id": "eb03f3f2-1a58-4d19-9f85-b3e46dbf5c2e",
      "field": "None",
      "comments_url": "/v1/conversations/Z2lkOi8vbGFkZGVydHJ1Y2svSW5jaWRlbnQvZWIwM2YzZjItMWE1OC00ZDE5LTlmODUtYjNlNDZkYmY1YzJl/comments",
      "channel": {
        "name": "private-conversations-Z2lkOi8vbGFkZGVydHJ1Y2svSW5jaWRlbnQvZWIwM2YzZjItMWE1OC00ZDE5LTlmODUtYjNlNDZkYmY1YzJl"
      }
    },
    {
      "id": "Z2lkOi8vbGFkZGVydHJ1Y2svSW5jaWRlbnQvZWIwM2YzZjItMWE1OC00ZDE5LTlmODUtYjNlNDZkYmY1YzJlP2ZpZWxkPWRlc2NyaXB0aW9u",
      "resource_class": "Incident",
      "resource_id": "eb03f3f2-1a58-4d19-9f85-b3e46dbf5c2e",
      "field": "description",
      "comments_url": "/v1/conversations/Z2lkOi8vbGFkZGVydHJ1Y2svSW5jaWRlbnQvZWIwM2YzZjItMWE1OC00ZDE5LTlmODUtYjNlNDZkYmY1YzJlP2ZpZWxkPWRlc2NyaXB0aW9u/comments",
      "channel": {
        "name": "private-conversations-Z2lkOi8vbGFkZGVydHJ1Y2svSW5jaWRlbnQvZWIwM2YzZjItMWE1OC00ZDE5LTlmODUtYjNlNDZkYmY1YzJlP2ZpZWxkPWRlc2NyaXB0aW9u"
      }
    },
    {
      "id": "Z2lkOi8vbGFkZGVydHJ1Y2svSW5jaWRlbnQvZWIwM2YzZjItMWE1OC00ZDE5LTlmODUtYjNlNDZkYmY1YzJlP2ZpZWxkPWN1c3RvbWVyX2ltcGFjdF9zdW1tYXJ5",
      "resource_class": "Incident",
      "resource_id": "eb03f3f2-1a58-4d19-9f85-b3e46dbf5c2e",
      "field": "customer_impact_summary",
      "comments_url": "/v1/conversations/Z2lkOi8vbGFkZGVydHJ1Y2svSW5jaWRlbnQvZWIwM2YzZjItMWE1OC00ZDE5LTlmODUtYjNlNDZkYmY1YzJlP2ZpZWxkPWN1c3RvbWVyX2ltcGFjdF9zdW1tYXJ5/comments",
      "channel": {
        "name": "private-conversations-Z2lkOi8vbGFkZGVydHJ1Y2svSW5jaWRlbnQvZWIwM2YzZjItMWE1OC00ZDE5LTlmODUtYjNlNDZkYmY1YzJlP2ZpZWxkPWN1c3RvbWVyX2ltcGFjdF9zdW1tYXJ5"
      }
    },
    {
      "id": "Z2lkOi8vbGFkZGVydHJ1Y2svSW5jaWRlbnQvZWIwM2YzZjItMWE1OC00ZDE5LTlmODUtYjNlNDZkYmY1YzJlP2ZpZWxkPWltcGFjdA==",
      "resource_class": "Incident",
      "resource_id": "eb03f3f2-1a58-4d19-9f85-b3e46dbf5c2e",
      "field": "impact",
      "comments_url": "/v1/conversations/Z2lkOi8vbGFkZGVydHJ1Y2svSW5jaWRlbnQvZWIwM2YzZjItMWE1OC00ZDE5LTlmODUtYjNlNDZkYmY1YzJlP2ZpZWxkPWltcGFjdA==/comments",
      "channel": {
        "name": "private-conversations-Z2lkOi8vbGFkZGVydHJ1Y2svSW5jaWRlbnQvZWIwM2YzZjItMWE1OC00ZDE5LTlmODUtYjNlNDZkYmY1YzJlP2ZpZWxkPWltcGFjdA=="
      }
    }
  ]
}
```

</details>

<details>
<summary> Retrospective response data</summary>

```json showLineNumbers
{
  "id": "da2ff7ef-6faf-4e4e-9577-985ffa739c9f",
  "name": "Bump request library",
  "summary": "",
  "incident_id": "81b628c8-8612-4877-803d-22a1dc187ba5",
  "created_at": "2023-09-05T17:32:52.095Z",
  "updated_at": "2023-09-05T17:35:20.413Z",
  "tag_list": [],
  "additional_details": "None",
  "incident": {
    "id": "81b628c8-8612-4877-803d-22a1dc187ba5",
    "name": "Bump request library",
    "created_at": "2023-09-05T17:32:51.926Z",
    "started_at": "2023-09-05T17:32:52.144Z",
    "discarded_at": "None",
    "summary": "",
    "customer_impact_summary": "",
    "description": "add request library",
    "current_milestone": "postmortem_completed",
    "number": 2,
    "priority": "P1",
    "severity": "SEV1",
    "severity_color": "red",
    "severity_impact": "None",
    "severity_condition": "None",
    "tag_list": ["security"],
    "private_id": "1838d08fe38a7bc92188bc6338918085e521f6cad829101c95f2ba0381da9e26aa7f1bc4247be660735097019bb237351bf451a06d8683310774ca5817661be2b73ad5bf5923d76b79a658667008fc8a8977e9823f2750efebdbbf2fd275f4406e6c870d",
    "organization_id": "0445b04e-5ed5-4fdc-aef7-5d68046ed78e",
    "milestones": [
      {
        "id": "9f2e3e86-c306-4b84-a3bb-7b74d6af9747",
        "created_at": "2023-09-05T17:32:52.161Z",
        "updated_at": "2023-09-05T17:32:52.161Z",
        "type": "started",
        "occurred_at": "2023-09-05T17:32:52.144Z",
        "duration": "None"
      },
      {
        "id": "dc8fc26e-3ce4-4a8c-863c-7853367ad81a",
        "created_at": "2023-09-05T17:32:52.207Z",
        "updated_at": "2023-09-05T17:32:52.222Z",
        "type": "acknowledged",
        "occurred_at": "2023-09-05T17:32:52.144Z",
        "duration": "PT0S"
      },
      {
        "id": "d3746e2f-fc65-4a4a-b0db-b784056d7e05",
        "created_at": "2023-09-05T17:33:28.298Z",
        "updated_at": "2023-09-05T17:33:28.317Z",
        "type": "identified",
        "occurred_at": "2023-09-05T17:33:28.292Z",
        "duration": "PT36S"
      },
      {
        "id": "6fd7261d-dceb-40ac-8a3c-7d7fbef4fefe",
        "created_at": "2023-09-05T17:33:37.592Z",
        "updated_at": "2023-09-05T17:33:37.592Z",
        "type": "mitigated",
        "occurred_at": "2023-09-05T17:33:37.520Z",
        "duration": "PT9S"
      },
      {
        "id": "50618295-c422-408d-9880-a077a3c3faa9",
        "created_at": "2023-09-05T17:33:37.525Z",
        "updated_at": "2023-09-05T17:33:37.603Z",
        "type": "resolved",
        "occurred_at": "2023-09-05T17:33:37.520Z",
        "duration": "PT0S"
      },
      {
        "id": "6f95ec3a-165d-4e5e-b3c4-768b28c3d1ee",
        "created_at": "2023-09-05T17:33:42.693Z",
        "updated_at": "2023-09-05T17:33:42.717Z",
        "type": "postmortem_started",
        "occurred_at": "2023-09-05T17:33:42.689Z",
        "duration": "PT5S"
      },
      {
        "id": "3adaac3f-5dd0-4378-b8cd-d33cf9855ae6",
        "created_at": "2023-09-05T17:36:57.496Z",
        "updated_at": "2023-09-05T17:36:57.518Z",
        "type": "postmortem_completed",
        "occurred_at": "2023-09-05T17:36:57.491Z",
        "duration": "PT3M14S"
      }
    ],
    "active": false,
    "labels": {},
    "role_assignments": [
      {
        "id": "ea0ff4d9-5efe-4fec-b27f-8eaa82eeb81d",
        "status": "active",
        "created_at": "2023-09-05T17:32:52.951Z",
        "updated_at": "2023-09-05T17:32:52.951Z",
        "incident_role": {
          "id": "dace9563-adf1-47a4-889d-a4048b2c07bf",
          "name": "Commander",
          "summary": "The incident commander holds the high-level state about the incident",
          "description": "",
          "created_at": "2023-09-05T17:01:47.908Z",
          "updated_at": "2023-09-05T17:01:47.908Z",
          "discarded_at": "None"
        },
        "user": {
          "id": "184eb568-c1a9-4f99-9d52-8f7dd6672158",
          "name": "My Username",
          "email": "testuser@gmail.com",
          "slack_user_id": "None",
          "slack_linked?": false,
          "created_at": "2023-09-05T17:01:49.368Z",
          "updated_at": "2023-09-05T17:01:49.368Z"
        }
      }
    ],
    "status_pages": [],
    "incident_url": "https://app.firehydrant.io/org/port-5478/incidents/81b628c8-8612-4877-803d-22a1dc187ba5/incident/overview",
    "private_status_page_url": "",
    "organization": {
      "name": "Port",
      "id": "0445b04e-5ed5-4fdc-aef7-5d68046ed78e"
    },
    "customers_impacted": 0,
    "monetary_impact": "None",
    "monetary_impact_cents": "None",
    "last_update": "None",
    "last_note": "None",
    "report_id": "da2ff7ef-6faf-4e4e-9577-985ffa739c9f",
    "services": [],
    "environments": [
      {
        "id": "21011924-215e-4aa4-abbf-6155ecf237ae",
        "name": "Production"
      }
    ],
    "functionalities": [
      {
        "id": "8861c55d-042d-43f1-9aab-c44c056dcbff",
        "name": "Platform - Deployments"
      }
    ],
    "channel_name": "None",
    "channel_reference": "None",
    "channel_id": "None",
    "channel_status": "None",
    "incident_tickets": [],
    "ticket": "None",
    "impacts": [
      {
        "id": "749de40b-9368-4145-aa75-2d7177d60828",
        "type": "environment",
        "impact": {
          "id": "21011924-215e-4aa4-abbf-6155ecf237ae",
          "name": "Production"
        },
        "condition": {
          "id": "b1fc9184-b3f3-4af1-a111-68abcad9bf34",
          "name": "Unavailable",
          "position": 0
        },
        "conversations": [
          {
            "id": "Z2lkOi8vbGFkZGVydHJ1Y2svSW5jaWRlbnRzOjpJbXBhY3QvNzQ5ZGU0MGItOTM2OC00MTQ1LWFhNzUtMmQ3MTc3ZDYwODI4",
            "resource_class": "Incidents::Impact",
            "resource_id": "749de40b-9368-4145-aa75-2d7177d60828",
            "field": "None",
            "comments_url": "/v1/conversations/Z2lkOi8vbGFkZGVydHJ1Y2svSW5jaWRlbnRzOjpJbXBhY3QvNzQ5ZGU0MGItOTM2OC00MTQ1LWFhNzUtMmQ3MTc3ZDYwODI4/comments",
            "channel": {
              "name": "private-conversations-Z2lkOi8vbGFkZGVydHJ1Y2svSW5jaWRlbnRzOjpJbXBhY3QvNzQ5ZGU0MGItOTM2OC00MTQ1LWFhNzUtMmQ3MTc3ZDYwODI4"
            }
          }
        ]
      },
      {
        "id": "b6833302-01f8-4705-b863-178e35cd7b23",
        "type": "functionality",
        "impact": {
          "id": "8861c55d-042d-43f1-9aab-c44c056dcbff",
          "name": "Platform - Deployments"
        },
        "condition": {
          "id": "c2bc11e8-7fcc-428d-9007-26f00700834a",
          "name": "Bug",
          "position": 2
        },
        "conversations": [
          {
            "id": "Z2lkOi8vbGFkZGVydHJ1Y2svSW5jaWRlbnRzOjpJbXBhY3QvYjY4MzMzMDItMDFmOC00NzA1LWI4NjMtMTc4ZTM1Y2Q3YjIz",
            "resource_class": "Incidents::Impact",
            "resource_id": "b6833302-01f8-4705-b863-178e35cd7b23",
            "field": "None",
            "comments_url": "/v1/conversations/Z2lkOi8vbGFkZGVydHJ1Y2svSW5jaWRlbnRzOjpJbXBhY3QvYjY4MzMzMDItMDFmOC00NzA1LWI4NjMtMTc4ZTM1Y2Q3YjIz/comments",
            "channel": {
              "name": "private-conversations-Z2lkOi8vbGFkZGVydHJ1Y2svSW5jaWRlbnRzOjpJbXBhY3QvYjY4MzMzMDItMDFmOC00NzA1LWI4NjMtMTc4ZTM1Y2Q3YjIz"
            }
          }
        ]
      }
    ],
    "conference_bridges": [],
    "incident_channels": [],
    "retro_exports": [],
    "created_by": {
      "id": "184eb568-c1a9-4f99-9d52-8f7dd6672158",
      "name": "My Username",
      "source": "firehydrant_user",
      "email": "testuser@gmail.com"
    },
    "context_object": "None",
    "restricted": false,
    "team_assignments": [],
    "conversations": [
      {
        "id": "Z2lkOi8vbGFkZGVydHJ1Y2svSW5jaWRlbnQvODFiNjI4YzgtODYxMi00ODc3LTgwM2QtMjJhMWRjMTg3YmE1",
        "resource_class": "Incident",
        "resource_id": "81b628c8-8612-4877-803d-22a1dc187ba5",
        "field": "None",
        "comments_url": "/v1/conversations/Z2lkOi8vbGFkZGVydHJ1Y2svSW5jaWRlbnQvODFiNjI4YzgtODYxMi00ODc3LTgwM2QtMjJhMWRjMTg3YmE1/comments",
        "channel": {
          "name": "private-conversations-Z2lkOi8vbGFkZGVydHJ1Y2svSW5jaWRlbnQvODFiNjI4YzgtODYxMi00ODc3LTgwM2QtMjJhMWRjMTg3YmE1"
        }
      },
      {
        "id": "Z2lkOi8vbGFkZGVydHJ1Y2svSW5jaWRlbnQvODFiNjI4YzgtODYxMi00ODc3LTgwM2QtMjJhMWRjMTg3YmE1P2ZpZWxkPWRlc2NyaXB0aW9u",
        "resource_class": "Incident",
        "resource_id": "81b628c8-8612-4877-803d-22a1dc187ba5",
        "field": "description",
        "comments_url": "/v1/conversations/Z2lkOi8vbGFkZGVydHJ1Y2svSW5jaWRlbnQvODFiNjI4YzgtODYxMi00ODc3LTgwM2QtMjJhMWRjMTg3YmE1P2ZpZWxkPWRlc2NyaXB0aW9u/comments",
        "channel": {
          "name": "private-conversations-Z2lkOi8vbGFkZGVydHJ1Y2svSW5jaWRlbnQvODFiNjI4YzgtODYxMi00ODc3LTgwM2QtMjJhMWRjMTg3YmE1P2ZpZWxkPWRlc2NyaXB0aW9u"
        }
      },
      {
        "id": "Z2lkOi8vbGFkZGVydHJ1Y2svSW5jaWRlbnQvODFiNjI4YzgtODYxMi00ODc3LTgwM2QtMjJhMWRjMTg3YmE1P2ZpZWxkPWN1c3RvbWVyX2ltcGFjdF9zdW1tYXJ5",
        "resource_class": "Incident",
        "resource_id": "81b628c8-8612-4877-803d-22a1dc187ba5",
        "field": "customer_impact_summary",
        "comments_url": "/v1/conversations/Z2lkOi8vbGFkZGVydHJ1Y2svSW5jaWRlbnQvODFiNjI4YzgtODYxMi00ODc3LTgwM2QtMjJhMWRjMTg3YmE1P2ZpZWxkPWN1c3RvbWVyX2ltcGFjdF9zdW1tYXJ5/comments",
        "channel": {
          "name": "private-conversations-Z2lkOi8vbGFkZGVydHJ1Y2svSW5jaWRlbnQvODFiNjI4YzgtODYxMi00ODc3LTgwM2QtMjJhMWRjMTg3YmE1P2ZpZWxkPWN1c3RvbWVyX2ltcGFjdF9zdW1tYXJ5"
        }
      },
      {
        "id": "Z2lkOi8vbGFkZGVydHJ1Y2svSW5jaWRlbnQvODFiNjI4YzgtODYxMi00ODc3LTgwM2QtMjJhMWRjMTg3YmE1P2ZpZWxkPWltcGFjdA==",
        "resource_class": "Incident",
        "resource_id": "81b628c8-8612-4877-803d-22a1dc187ba5",
        "field": "impact",
        "comments_url": "/v1/conversations/Z2lkOi8vbGFkZGVydHJ1Y2svSW5jaWRlbnQvODFiNjI4YzgtODYxMi00ODc3LTgwM2QtMjJhMWRjMTg3YmE1P2ZpZWxkPWltcGFjdA==/comments",
        "channel": {
          "name": "private-conversations-Z2lkOi8vbGFkZGVydHJ1Y2svSW5jaWRlbnQvODFiNjI4YzgtODYxMi00ODc3LTgwM2QtMjJhMWRjMTg3YmE1P2ZpZWxkPWltcGFjdA=="
        }
      }
    ]
  },
  "questions": [
    {
      "id": "0ee80dda-a6b0-418d-aca2-8d12cfe58523",
      "title": "What went well?",
      "body": "able to resolve it fast",
      "tooltip": "What process went well during your incident? What mitigation steps went well?",
      "kind": "freeform",
      "is_required": true,
      "conversations": [
        {
          "id": "Z2lkOi8vbGFkZGVydHJ1Y2svUG9zdE1vcnRlbXM6OlF1ZXN0aW9uLzBlZTgwZGRhLWE2YjAtNDE4ZC1hY2EyLThkMTJjZmU1ODUyMw==",
          "resource_class": "PostMortems::Question",
          "resource_id": "0ee80dda-a6b0-418d-aca2-8d12cfe58523",
          "field": "None",
          "comments_url": "/v1/conversations/Z2lkOi8vbGFkZGVydHJ1Y2svUG9zdE1vcnRlbXM6OlF1ZXN0aW9uLzBlZTgwZGRhLWE2YjAtNDE4ZC1hY2EyLThkMTJjZmU1ODUyMw==/comments",
          "channel": {
            "name": "private-conversations-Z2lkOi8vbGFkZGVydHJ1Y2svUG9zdE1vcnRlbXM6OlF1ZXN0aW9uLzBlZTgwZGRhLWE2YjAtNDE4ZC1hY2EyLThkMTJjZmU1ODUyMw=="
          }
        }
      ]
    },
    {
      "id": "7fbe151b-6040-49ab-9c5b-348866cabad6",
      "title": "What could be improved?",
      "body": "nothing",
      "tooltip": "What parts of your incident response process can you improve? What additional things could you put in place to ensure that an issue like this can be mitigated in the future?",
      "kind": "freeform",
      "is_required": true,
      "conversations": [
        {
          "id": "Z2lkOi8vbGFkZGVydHJ1Y2svUG9zdE1vcnRlbXM6OlF1ZXN0aW9uLzdmYmUxNTFiLTYwNDAtNDlhYi05YzViLTM0ODg2NmNhYmFkNg==",
          "resource_class": "PostMortems::Question",
          "resource_id": "7fbe151b-6040-49ab-9c5b-348866cabad6",
          "field": "None",
          "comments_url": "/v1/conversations/Z2lkOi8vbGFkZGVydHJ1Y2svUG9zdE1vcnRlbXM6OlF1ZXN0aW9uLzdmYmUxNTFiLTYwNDAtNDlhYi05YzViLTM0ODg2NmNhYmFkNg==/comments",
          "channel": {
            "name": "private-conversations-Z2lkOi8vbGFkZGVydHJ1Y2svUG9zdE1vcnRlbXM6OlF1ZXN0aW9uLzdmYmUxNTFiLTYwNDAtNDlhYi05YzViLTM0ODg2NmNhYmFkNg=="
          }
        }
      ]
    },
    {
      "id": "d77a6858-6763-4e84-8aec-b37f924c2428",
      "title": "Where did we get lucky?",
      "body": "everything",
      "tooltip": "What near misses did you have during your incident?",
      "kind": "freeform",
      "is_required": true,
      "conversations": [
        {
          "id": "Z2lkOi8vbGFkZGVydHJ1Y2svUG9zdE1vcnRlbXM6OlF1ZXN0aW9uL2Q3N2E2ODU4LTY3NjMtNGU4NC04YWVjLWIzN2Y5MjRjMjQyOA==",
          "resource_class": "PostMortems::Question",
          "resource_id": "d77a6858-6763-4e84-8aec-b37f924c2428",
          "field": "None",
          "comments_url": "/v1/conversations/Z2lkOi8vbGFkZGVydHJ1Y2svUG9zdE1vcnRlbXM6OlF1ZXN0aW9uL2Q3N2E2ODU4LTY3NjMtNGU4NC04YWVjLWIzN2Y5MjRjMjQyOA==/comments",
          "channel": {
            "name": "private-conversations-Z2lkOi8vbGFkZGVydHJ1Y2svUG9zdE1vcnRlbXM6OlF1ZXN0aW9uL2Q3N2E2ODU4LTY3NjMtNGU4NC04YWVjLWIzN2Y5MjRjMjQyOA=="
          }
        }
      ]
    },
    {
      "id": "4558de04-11f2-4a06-9253-4970d25610b0",
      "title": "What were we wrong about?",
      "body": "none",
      "tooltip": "What ideas did you have during your mitigation that were incorrect?",
      "kind": "freeform",
      "is_required": false,
      "conversations": [
        {
          "id": "Z2lkOi8vbGFkZGVydHJ1Y2svUG9zdE1vcnRlbXM6OlF1ZXN0aW9uLzQ1NThkZTA0LTExZjItNGEwNi05MjUzLTQ5NzBkMjU2MTBiMA==",
          "resource_class": "PostMortems::Question",
          "resource_id": "4558de04-11f2-4a06-9253-4970d25610b0",
          "field": "None",
          "comments_url": "/v1/conversations/Z2lkOi8vbGFkZGVydHJ1Y2svUG9zdE1vcnRlbXM6OlF1ZXN0aW9uLzQ1NThkZTA0LTExZjItNGEwNi05MjUzLTQ5NzBkMjU2MTBiMA==/comments",
          "channel": {
            "name": "private-conversations-Z2lkOi8vbGFkZGVydHJ1Y2svUG9zdE1vcnRlbXM6OlF1ZXN0aW9uLzQ1NThkZTA0LTExZjItNGEwNi05MjUzLTQ5NzBkMjU2MTBiMA=="
          }
        }
      ]
    },
    {
      "id": "4dc6dc62-b366-4028-84c7-367dc09c2496",
      "title": "Additional Details",
      "body": "None",
      "tooltip": "",
      "kind": "freeform",
      "is_required": false,
      "conversations": [
        {
          "id": "Z2lkOi8vbGFkZGVydHJ1Y2svUG9zdE1vcnRlbXM6OlF1ZXN0aW9uLzRkYzZkYzYyLWIzNjYtNDAyOC04NGM3LTM2N2RjMDljMjQ5Ng==",
          "resource_class": "PostMortems::Question",
          "resource_id": "4dc6dc62-b366-4028-84c7-367dc09c2496",
          "field": "None",
          "comments_url": "/v1/conversations/Z2lkOi8vbGFkZGVydHJ1Y2svUG9zdE1vcnRlbXM6OlF1ZXN0aW9uLzRkYzZkYzYyLWIzNjYtNDAyOC04NGM3LTM2N2RjMDljMjQ5Ng==/comments",
          "channel": {
            "name": "private-conversations-Z2lkOi8vbGFkZGVydHJ1Y2svUG9zdE1vcnRlbXM6OlF1ZXN0aW9uLzRkYzZkYzYyLWIzNjYtNDAyOC04NGM3LTM2N2RjMDljMjQ5Ng=="
          }
        }
      ]
    }
  ],
  "__incident": {
    "tasks": [
      {
        "id": "e56c4194-0070-4d8d-bc75-9df60f699c90",
        "title": "Update Incident Details",
        "description": "Determine the severity and impact of the incident and update the details",
        "state": "open",
        "assignee": {
          "id": "184eb568-c1a9-4f99-9d52-8f7dd6672158",
          "name": "My Username",
          "source": "firehydrant_user",
          "email": "testuser@gmail.com"
        },
        "created_by": {
          "id": "5ffe7fce-539f-40e7-a6fe-762897190694",
          "name": "FireHydrant",
          "source": "patchy",
          "email": ""
        },
        "created_at": "2023-09-05T17:32:53.269Z",
        "updated_at": "2023-09-05T17:32:53.300Z"
      },
      {
        "id": "ee23f50b-a30a-4005-b2cd-74a711cf8c88",
        "title": "Assign Teams and/or Roles",
        "description": "Assign any teams or specific roles for the incident",
        "state": "done",
        "assignee": {
          "id": "184eb568-c1a9-4f99-9d52-8f7dd6672158",
          "name": "My Username",
          "source": "firehydrant_user",
          "email": "testuser@gmail.com"
        },
        "created_by": {
          "id": "5ffe7fce-539f-40e7-a6fe-762897190694",
          "name": "FireHydrant",
          "source": "patchy",
          "email": ""
        },
        "created_at": "2023-09-05T17:32:53.320Z",
        "updated_at": "2023-09-05T18:11:16.371Z"
      },
      {
        "id": "5ed1c84f-187a-4899-84a9-361d7a32f62a",
        "title": "Status Update",
        "description": "Add an update to your status page",
        "state": "done",
        "assignee": {
          "id": "184eb568-c1a9-4f99-9d52-8f7dd6672158",
          "name": "My Username",
          "source": "firehydrant_user",
          "email": "testuser@gmail.com"
        },
        "created_by": {
          "id": "5ffe7fce-539f-40e7-a6fe-762897190694",
          "name": "FireHydrant",
          "source": "patchy",
          "email": ""
        },
        "created_at": "2023-09-05T17:32:53.366Z",
        "updated_at": "2023-09-05T17:34:30.190Z"
      },
      {
        "id": "09520e6b-d6d4-42a0-aaa0-0596b0d8a424",
        "title": "Resolve Incident",
        "description": "Star important timeline items and resolve incident",
        "state": "open",
        "assignee": {
          "id": "184eb568-c1a9-4f99-9d52-8f7dd6672158",
          "name": "My Username",
          "source": "firehydrant_user",
          "email": "testuser@gmail.com"
        },
        "created_by": {
          "id": "5ffe7fce-539f-40e7-a6fe-762897190694",
          "name": "FireHydrant",
          "source": "patchy",
          "email": ""
        },
        "created_at": "2023-09-05T17:32:53.410Z",
        "updated_at": "2023-09-05T17:32:53.439Z"
      },
      {
        "id": "73a6a22e-5464-423a-99f1-e497a81a630a",
        "title": "Schedule Retro",
        "description": "Schedule a retrospective with the responding team",
        "state": "open",
        "assignee": {
          "id": "184eb568-c1a9-4f99-9d52-8f7dd6672158",
          "name": "My Username",
          "source": "firehydrant_user",
          "email": "testuser@gmail.com"
        },
        "created_by": {
          "id": "5ffe7fce-539f-40e7-a6fe-762897190694",
          "name": "FireHydrant",
          "source": "patchy",
          "email": ""
        },
        "created_at": "2023-09-05T17:32:53.454Z",
        "updated_at": "2023-09-05T17:32:53.482Z"
      }
    ]
  }
}
```

</details>

### Mapping Result

The combination of the sample payload and the Ocean configuration generates the following Port entity:

<details>
<summary> Environment entity in Port</summary>

```json showLineNumbers
{
  "identifier": "21011924-215e-4aa4-abbf-6155ecf237ae",
  "title": "Production",
  "icon": null,
  "blueprint": "firehydrantEnvironment",
  "team": [],
  "properties": {
    "description": "",
    "activeIncidents": 2,
    "createdAt": "2023-09-05T17:01:48.348Z",
    "updatedAt": "2023-09-05T17:01:48.348Z"
  },
  "relations": {},
  "createdAt": "2023-11-01T11:42:52.458Z",
  "createdBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW",
  "updatedAt": "2023-11-01T11:42:52.458Z",
  "updatedBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW"
}
```

</details>

<details>
<summary> Service entity in Port</summary>

```json showLineNumbers
{
  "identifier": "87aeea3d-4dcd-4c1e-bf8c-e68e73892e44",
  "title": "My Test Service",
  "icon": null,
  "blueprint": "firehydrantService",
  "team": [],
  "properties": {
    "description": "For testing this service",
    "slug": "my-test-service",
    "links": ["https://example.com"],
    "labels": {
      "myket": "service",
      "keyval": "app"
    },
    "owner": "Test Escalation Team",
    "createdAt": "2023-09-06T12:37:37.378Z",
    "updatedAt": "2023-09-20T10:25:32.730Z",
    "activeIncidents": 2,
    "meanTimeToAcknowledge": null,
    "meanTimeToDetect": 25,
    "meanTimeToMitigate": null,
    "meanTimeToResolve": null
  },
  "relations": {},
  "createdAt": "2023-09-20T10:19:34.745Z",
  "createdBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW",
  "updatedAt": "2023-09-20T14:48:30.523Z",
  "updatedBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW"
}
```

</details>

<details>
<summary> Incident entity in Port</summary>

```json showLineNumbers
{
  "identifier": "eb03f3f2-1a58-4d19-9f85-b3e46dbf5c2e",
  "title": "System outage",
  "icon": null,
  "blueprint": "firehydrantIncident",
  "team": [],
  "properties": {
    "url": "https://app.firehydrant.io/org/port-5478/incidents/eb03f3f2-1a58-4d19-9f85-b3e46dbf5c2e/incident/overview",
    "priority": "P2",
    "severity": "SEV2",
    "tags": ["internal"],
    "currentMilestone": "acknowledged",
    "functionalities": null,
    "customerImpact": "0",
    "createdBy": "testuser@gmail.com",
    "createdAt": "2023-09-08T10:58:06.791Z",
    "description": "A system that isn't customer-facing or doesn't impact customer data processing is unavailable",
    "commander": "testuser@gmail.com"
  },
  "relations": {
    "service": ["4e5bb8f3-4eab-4a13-b354-de7fc47f3554"],
    "environment": []
  },
  "createdAt": "2023-11-01T11:43:00.904Z",
  "createdBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW",
  "updatedAt": "2023-11-01T11:43:00.904Z",
  "updatedBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW"
}
```

</details>

<details>
<summary> Retrospective entity in Port</summary>

```json showLineNumbers
{
  "identifier": "da2ff7ef-6faf-4e4e-9577-985ffa739c9f",
  "title": "Bump request library",
  "icon": null,
  "blueprint": "firehydrantRetrospective",
  "team": [],
  "properties": {
    "url": "https://app.firehydrant.io/org/port-5478/incidents/81b628c8-8612-4877-803d-22a1dc187ba5/incident/overview",
    "tags": [],
    "services": null,
    "environments": ["Production"],
    "functionalities": ["Platform - Deployments"],
    "createdBy": "testuser@gmail.com",
    "createdAt": "2023-09-05T17:32:51.926Z",
    "customerImpact": "0",
    "commander": "testuser@gmail.com",
    "resolvedAt": "2023-09-05T17:33:37.525Z",
    "publishedAt": "2023-09-05T17:36:57.496Z",
    "duration": null,
    "completedTasks": null,
    "incompletedTasks": null,
    "questions": [
      {
        "question": "What went well?",
        "answer": "able to resolve it fast"
      },
      {
        "question": "What could be improved?",
        "answer": "nothing"
      },
      {
        "question": "Where did we get lucky?",
        "answer": "everything"
      },
      {
        "question": "What were we wrong about?",
        "answer": "none"
      },
      {
        "question": "Additional Details"
      }
    ]
  },
  "relations": {
    "incident": "81b628c8-8612-4877-803d-22a1dc187ba5"
  },
  "createdAt": "2023-11-01T11:43:05.551Z",
  "createdBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW",
  "updatedAt": "2023-11-01T11:43:05.551Z",
  "updatedBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW"
}
```

</details>
