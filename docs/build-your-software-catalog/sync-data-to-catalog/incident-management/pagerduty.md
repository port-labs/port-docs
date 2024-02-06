---
sidebar_position: 1
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import Prerequisites from "../templates/\_ocean_helm_prerequisites_block.mdx"
import AzurePremise from "../templates/\_ocean_azure_premise.mdx"
import DockerParameters from "./\_pagerduty_docker_params.mdx"
import AdvancedConfig from '../../../generalTemplates/\_ocean_advanced_configuration_note.md'
import PagerDutyServiceBlueprint from "../webhook/examples/resources/pagerduty/\_example_pagerduty_service.mdx"
import PagerDutyIncidentBlueprint from "../webhook/examples/resources/pagerduty/\_example_pagerduty_incident.mdx"
import PagerDutyWebhookConfig from "../webhook/examples/resources/pagerduty/\_example_pagerduty_webhook_config.mdx"
import PagerDutyWebhookHistory from "../webhook/examples/resources/pagerduty/\_example_pagerduty_webhook_history_config.mdx"
import PagerDutyScript from "../webhook/examples/resources/pagerduty/\_example_pagerduty_shell_history_config.mdx"

# PagerDuty

Our PagerDuty integration allows you to import `schedules`, `services` and `incidents` from your PagerDuty account into Port, according to your mapping and definitions.

## Common use cases

- Map `schedules`, `services` and `incidents` in your PagerDuty organization environment.
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

| Parameter                        | Description                                                                                                             | Required |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | -------- |
| `port.clientId`                  | Your port client id                                                                                                     | ✅       |
| `port.clientSecret`              | Your port client secret                                                                                                 | ✅       |
| `port.baseUrl`                   | Your port base url, relevant only if not using the default port app                                                     | ❌       |
| `integration.identifier`         | Change the identifier to describe your integration                                                                      | ✅       |
| `integration.type`               | The integration type                                                                                                    | ✅       |
| `integration.eventListener.type` | The event listener type                                                                                                 | ✅       |
| `integration.secrets.token`      | PagerDuty API token                                                                                                | ✅       |
| `integration.config.apiUrl`      | Pagerduty api url. If not specified, the default will be https://api.pagerduty.com                                      | ✅       |
| `integration.config.appHost`     | The host of the Port Ocean app. Used to set up the integration endpoint as the target for Webhooks created in PagerDuty | ❌       |
| `scheduledResyncInterval`        | The number of minutes between each resync                                                                               | ❌       |
| `initializePortResources`        | Default true, When set to true the integration will create default blueprints and the port App config Mapping           | ❌       |

<br/>

<Tabs groupId="deploy" queryString="deploy">

<TabItem value="helm" label="Helm" default>
To install the integration using Helm, run the following command:

```bash showLineNumbers
helm repo add --force-update port-labs https://port-labs.github.io/helm-charts
helm upgrade --install my-pagerduty-integration port-labs/port-ocean \
  --set port.clientId="PORT_CLIENT_ID"  \
  --set port.clientSecret="PORT_CLIENT_SECRET"  \
  --set port.baseUrl="https://api.getport.io"  \
  --set initializePortResources=true  \
  --set scheduledResyncInterval=120  \
  --set integration.identifier="my-pagerduty-integration"  \
  --set integration.type="pagerduty"  \
  --set integration.eventListener.type="POLLING"  \
  --set integration.secrets.token="string"  \
  --set integration.config.apiUrl="string"
```
</TabItem>

<TabItem value="argocd" label="ArgoCD" default>
To install the integration using ArgoCD, follow these steps:

1. Create a `values.yaml` file in `argocd/my-ocean-pagerduty-integration` in your git repository with the content:

:::note
Remember to replace the placeholders for `PAGERDUTY_API_URL` and `PAGERDUTY_API_TOKEN`.
:::
```yaml showLineNumbers
initializePortResources: true
scheduledResyncInterval: 120
integration:
  identifier: my-ocean-pagerduty-integration
  type: pagerduty
  eventListener:
    type: POLLING
  config:
  // highlight-next-line
    apiUrl: PAGERDUTY_API_URL
  secrets:
  // highlight-next-line
    token: PAGERDUTY_API_TOKEN
```
<br/>

2. Install the `my-ocean-pagerduty-integration` ArgoCD Application by creating the following `my-ocean-pagerduty-integration.yaml` manifest:
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
  name: my-ocean-pagerduty-integration
  namespace: argocd
spec:
  destination:
    namespace: my-ocean-pagerduty-integration
    server: https://kubernetes.default.svc
  project: default
  sources:
  - repoURL: 'https://port-labs.github.io/helm-charts/'
    chart: port-ocean
    targetRevision: 0.1.14
    helm:
      valueFiles:
      - $values/argocd/my-ocean-pagerduty-integration/values.yaml
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
kubectl apply -f my-ocean-pagerduty-integration.yaml
```
</TabItem>
</Tabs>

</TabItem>

<TabItem value="one-time" label="Scheduled">
  <Tabs groupId="cicd-method" queryString="cicd-method">
  <TabItem value="github" label="GitHub">
This workflow will run the PagerDuty integration once and then exit, this is useful for **scheduled** ingestion of data.

:::warning
If you want the integration to update Port in real time using webhooks you should use the [Real Time & Always On](?installation-methods=real-time-always-on#installation) installation option
:::

Make sure to configure the following [Github Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions):

<DockerParameters />

<br/>

Here is an example for `pagerduty-integration.yml` workflow file:

```yaml showLineNumbers
name: PagerDuty Exporter Workflow

# This workflow responsible for running PagerDuty exporter.

on:
  workflow_dispatch:

jobs:
  run-integration:
    runs-on: ubuntu-latest

    steps:
      - name: Run PagerDuty Integration
        run: |
          # Set Docker image and run the container
          integration_type="pagerduty"
          version="latest"

          image_name="ghcr.io/port-labs/port-ocean-$integration_type:$version"

          docker run -i --rm --platform=linux/amd64 \
          -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
          -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
          -e OCEAN__INTEGRATION__CONFIG__TOKEN=${{ secrets.OCEAN__INTEGRATION__CONFIG__TOKEN }} \
          -e OCEAN__INTEGRATION__CONFIG__API_URL=${{ secrets.OCEAN__INTEGRATION__CONFIG__API_URL }} \
          -e OCEAN__PORT__CLIENT_ID=${{ secrets.OCEAN__PORT__CLIENT_ID }} \
          -e OCEAN__PORT__CLIENT_SECRET=${{ secrets.OCEAN__PORT__CLIENT_SECRET }} \
          $image_name

          exit $?
```

  </TabItem>
  <TabItem value="jenkins" label="Jenkins">
This pipeline will run the PagerDuty integration once and then exit, this is useful for **scheduled** ingestion of data.

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
        stage('Run PagerDuty Integration') {
            steps {
                script {
                    withCredentials([
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__TOKEN', variable: 'OCEAN__INTEGRATION__CONFIG__TOKEN'),
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__API_URL', variable: 'OCEAN__INTEGRATION__CONFIG__API_URL'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_ID', variable: 'OCEAN__PORT__CLIENT_ID'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_SECRET', variable: 'OCEAN__PORT__CLIENT_SECRET'),
                    ]) {
                        sh('''
                            #Set Docker image and run the container
                            integration_type="pagerduty"
                            version="latest"
                            image_name="ghcr.io/port-labs/port-ocean-${integration_type}:${version}"
                            docker run -i --rm --platform=linux/amd64 \
                                -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
                                -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
                                -e OCEAN__INTEGRATION__CONFIG__TOKEN=$OCEAN__INTEGRATION__CONFIG__TOKEN \
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
<AzurePremise name="PagerDuty" />

<DockerParameters />

<br/>

Here is an example for `pagerduty-integration.yml` pipeline file:

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
    integration_type="pagerduty"
    version="latest"

    image_name="ghcr.io/port-labs/port-ocean-$integration_type:$version"
    
    docker run -i --rm --platform=linux/amd64 \
        -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
        -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
        -e OCEAN__INTEGRATION__CONFIG__TOKEN=${OCEAN__INTEGRATION__CONFIG__TOKEN} \
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

## Ingesting PagerDuty objects

The PagerDuty integration uses a YAML configuration to describe the process of loading data into the developer portal. See [examples](#examples) below.

The integration makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from PagerDuty's API events.

### Configuration structure

The integration configuration determines which resources will be queried from PagerDuty, and which entities and properties will be created in Port.

:::tip Supported resources
The following resources can be used to map data from PagerDuty, it is possible to reference any field that appears in the API responses linked below for the mapping configuration.

- [`Service`](https://developer.pagerduty.com/api-reference/e960cca205c0f-list-services)
- [`Incident`](https://developer.pagerduty.com/api-reference/9d0b4b12e36f9-list-incidents)

:::

- The root key of the integration configuration is the `resources` key:

  ```yaml showLineNumbers
  # highlight-next-line
  resources:
    - kind: services
      selector:
      ...
  ```

- The `kind` key is a specifier for a PagerDuty object:

  ```yaml showLineNumbers
    resources:
      # highlight-next-line
      - kind: services
        selector:
        ...
  ```

- The `selector` and the `query` keys allow you to filter which objects of the specified `kind` will be ingested into your software catalog:

  ```yaml showLineNumbers
  resources:
    - kind: services
      # highlight-start
      selector:
        query: "true" # JQ boolean expression. If evaluated to false - this object will be skipped.
      # highlight-end
      port:
  ```

- The `port`, `entity` and the `mappings` keys are used to map the PagerDuty object fields to Port entities. To create multiple mappings of the same kind, you can add another item in the `resources` array;

  ```yaml showLineNumbers
  resources:
    - kind: services
      selector:
        query: "true"
      port:
        # highlight-start
        entity:
          mappings: # Mappings between one PagerDuty object to a Port entity. Each value is a JQ query.
            identifier: .id
            title: .name
            blueprint: '"pagerdutyService"'
            properties:
              status: .status
        # highlight-end
    - kind: service # In this instance service is mapped again with a different filter
      selector:
        query: '.name == "MyProjectName"'
      port:
        entity:
          mappings: ...
  ```

  :::tip Blueprint key
  Note the value of the `blueprint` key - if you want to use a hardcoded string, you need to encapsulate it in 2 sets of quotes, for example use a pair of single-quotes (`'`) and then another pair of double-quotes (`"`)
  :::

### Ingest data into Port

To ingest PagerDuty objects using the [integration configuration](#configuration-structure), you can follow the steps below:

1. Go to the DevPortal Builder page.
2. Select a blueprint you want to ingest using PagerDuty.
3. Choose the **Ingest Data** option from the menu.
4. Select PagerDuty under the Incident management category.
5. Modify the [configuration](#configuration-structure) according to your needs.
6. Click `Resync`.

## Examples

### Connect your services to their corresponding Pagerduty services

The following steps demonstrate how to relate each service in your catalog to its relevant PagerDuty service, using your desired convention.

First, we will need to create a [relation](/build-your-software-catalog/define-your-data-model/relate-blueprints/#what-is-a-relation) between our services and the corresponding Pagerduty services:

1. Go to your [Builder](https://app.getport.io/dev-portal/data-model) page, choose the `Service` blueprint, and click on `New relation`:

<img src='/img/guides/serviceCreateRelation.png' width='40%' />

<br/><br/>

2. Fill out the form like this, then click `Create`:

<img src='/img/guides/prodReadinessRelationCreation.png' width='50%' />

<br/><br/>

Now we need to assign the relevant Pagerduty service to each of our services. This can be done by adding some mapping logic. Go to your [data sources page](https://app.getport.io/dev-portal/data-sources), and click on your Pagerduty integration:

<img src='/img/guides/pdDataSources.png' width='60%' />

<br/><br/>

Add the following YAML block to the mapping under the `resources` key, then click `save & resync`:

<details>
<summary>Relation mapping (click to expand)</summary>

```yaml showLineNumbers
- kind: services
  selector:
    query: "true"
  port:
    entity:
      mappings:
        identifier: .name | gsub("[^a-zA-Z0-9@_.:/=-]"; "-") | tostring
        title: .name
        blueprint: '"service"'
        properties: {}
        relations:
          pagerduty_service: .id
```

</details>

What we just did was map the `Pagerduty service` to the relation between it and our `services`.  
The convention we used is:  
"Pagerduty service name" = "Service identifier".  

Now, if our `service` identifier is equal to the `Pagerduty service's` name, the Pagerduty service will automatically be assigned to that service.

This is just one example of a convention, you can choose other criteria by which to relate your services to their Pagerduty services.

### Schedule

<details>
<summary>Schedule blueprint</summary>

```json showLineNumbers
{
  "identifier": "pagerdutySchedule",
  "description": "This blueprint represents a PagerDuty schedule in our software catalog",
  "title": "PagerDuty Schedule",
  "icon": "pagerduty",
  "schema": {
    "properties": {
      "url": {
        "title": "Schedule URL",
        "type": "string",
        "format": "url"
      },
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
        "type": "array"
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
  - kind: schedules
    selector:
      query: "true"
    port:
      entity:
        mappings:
          identifier: .id
          title: .name
          blueprint: '"pagerdutySchedule"'
          properties:
            url: .html_url
            timezone: .time_zone
            description: .description
            users: "[.users[].summary]"
```

</details>

### Service

<details>
<summary>Service blueprint</summary>

```json showLineNumbers
{
  "identifier": "pagerdutyService",
  "description": "This blueprint represents a PagerDuty service in our software catalog",
  "title": "PagerDuty Service",
  "icon": "pagerduty",
  "schema": {
    "properties": {
      "status": {
        "title": "Status",
        "type": "string"
      },
      "url": {
        "title": "URL",
        "type": "string",
        "format": "url"
      },
      "oncall": {
        "title": "On Call",
        "type": "array",
        "items": {
          "type": "string",
          "format": "email"
        }
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
  - kind: services
    selector:
      query: "true"
    port:
      entity:
        mappings:
          identifier: .id
          title: .name
          blueprint: '"pagerdutyService"'
          properties:
            status: .status
            url: .html_url
            oncall: "[.__oncall_user[].user.email]"
```

</details>

### Incident

<details>
<summary>Incident blueprint</summary>

```json showLineNumbers
{
  "identifier": "pagerdutyIncident",
  "description": "This blueprint represents a PagerDuty incident in our software catalog",
  "title": "PagerDuty Incident",
  "icon": "pagerduty",
  "schema": {
    "properties": {
      "status": {
        "type": "string",
        "title": "Incident Status",
        "enum": [
          "triggered",
          "annotated",
          "acknowledged",
          "reassigned",
          "escalated",
          "reopened",
          "resolved"
        ]
      },
      "url": {
        "type": "string",
        "format": "url",
        "title": "Incident URL"
      },
      "urgency": {
        "type": "string",
        "title": "Incident Urgency",
        "enum": ["high", "low"]
      },
      "responder": {
        "type": "string",
        "title": "Assignee"
      },
      "escalation_policy": {
        "type": "string",
        "title": "Escalation Policy"
      },
      "created_at": {
        "title": "Create At",
        "type": "string",
        "format": "date-time"
      },
      "updated_at": {
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
    "pagerdutyService": {
      "title": "PagerDuty Service",
      "target": "pagerdutyService",
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
  - kind: incidents
    selector:
      query: "true"
    port:
      entity:
        mappings:
          identifier: .id | tostring
          title: .title
          blueprint: '"pagerdutyIncident"'
          properties:
            status: .status
            url: .self
            urgency: .urgency
            responder: .assignments[0].assignee.summary
            escalation_policy: .escalation_policy.summary
            created_at: .created_at
            updated_at: .updated_at
          relations:
            pagerdutyService: .service.id
```

</details>

## Let's Test It

This section includes a sample response data from Pagerduty. In addition, it includes the entity created from the resync event based on the Ocean configuration provided in the previous section.

### Payload

Here is an example of the payload structure from Pagerduty:

<details>
<summary> Schedule response data</summary>

```json showLineNumbers
{
  "id": "PWAXLIH",
  "type": "schedule",
  "summary": "Port Test Service - Weekly Rotation",
  "self": "https://api.pagerduty.com/schedules/PWAXLIH",
  "html_url": "https://getport-io.pagerduty.com/schedules/PWAXLIH",
  "name": "Port Test Service - Weekly Rotation",
  "time_zone": "Asia/Jerusalem",
  "description": "This is the weekly on call schedule for Port Test Service associated with your first escalation policy.",
  "users": [
    {
      "id": "PJCRRLH",
      "type": "user_reference",
      "summary": "Adam",
      "self": "https://api.pagerduty.com/users/PJCRRLH",
      "html_url": "https://getport-io.pagerduty.com/users/PJCRRLH"
    },
    {
      "id": "P4K4DLP",
      "type": "user_reference",
      "summary": "Alice",
      "self": "https://api.pagerduty.com/users/P4K4DLP",
      "html_url": "https://getport-io.pagerduty.com/users/P4K4DLP"
    },
    {
      "id": "PFZ63E2",
      "type": "user_reference",
      "summary": "Doe",
      "self": "https://api.pagerduty.com/users/PFZ63E2",
      "html_url": "https://getport-io.pagerduty.com/users/PFZ63E2"
    },
    {
      "id": "PRGAUI4",
      "type": "user_reference",
      "summary": "Pages",
      "self": null,
      "html_url": "https://getport-io.pagerduty.com/users/PRGAUI4",
      "deleted_at": "2023-10-17T18:58:07+03:00"
    },
    {
      "id": "PYIEKLY",
      "type": "user_reference",
      "summary": "Demo",
      "self": "https://api.pagerduty.com/users/PYIEKLY",
      "html_url": "https://getport-io.pagerduty.com/users/PYIEKLY"
    }
  ],
  "escalation_policies": [
    {
      "id": "P7LVMYP",
      "type": "escalation_policy_reference",
      "summary": "Test Escalation Policy",
      "self": "https://api.pagerduty.com/escalation_policies/P7LVMYP",
      "html_url": "https://getport-io.pagerduty.com/escalation_policies/P7LVMYP"
    }
  ],
  "teams": []
}
```

</details>

<details>
<summary> Service response data</summary>

```json showLineNumbers
{
  "id": "PGAAJBE",
  "name": "My Test Service",
  "description": "For testing",
  "created_at": "2023-08-03T16:53:48+03:00",
  "updated_at": "2023-08-03T16:53:48+03:00",
  "status": "active",
  "teams": [],
  "alert_creation": "create_alerts_and_incidents",
  "addons": [],
  "scheduled_actions": [],
  "support_hours": "None",
  "last_incident_timestamp": "None",
  "escalation_policy": {
    "id": "P7LVMYP",
    "type": "escalation_policy_reference",
    "summary": "Test Escalation Policy",
    "self": "https://api.pagerduty.com/escalation_policies/P7LVMYP",
    "html_url": "https://getport-io.pagerduty.com/escalation_policies/P7LVMYP"
  },
  "incident_urgency_rule": {
    "type": "constant",
    "urgency": "high"
  },
  "acknowledgement_timeout": "None",
  "auto_resolve_timeout": "None",
  "integrations": [],
  "type": "service",
  "summary": "My Test Service",
  "self": "https://api.pagerduty.com/services/PGAAJBE",
  "html_url": "https://getport-io.pagerduty.com/service-directory/PGAAJBE",
  "__oncall_user": [
    {
      "escalation_policy": {
        "id": "P7LVMYP",
        "type": "escalation_policy_reference",
        "summary": "Test Escalation Policy",
        "self": "https://api.pagerduty.com/escalation_policies/P7LVMYP",
        "html_url": "https://getport-io.pagerduty.com/escalation_policies/P7LVMYP"
      },
      "escalation_level": 1,
      "schedule": {
        "id": "PWAXLIH",
        "type": "schedule_reference",
        "summary": "Port Test Service - Weekly Rotation",
        "self": "https://api.pagerduty.com/schedules/PWAXLIH",
        "html_url": "https://getport-io.pagerduty.com/schedules/PWAXLIH"
      },
      "user": {
        "name": "demo",
        "email": "devops-port@pager-demo.com",
        "time_zone": "Asia/Jerusalem",
        "color": "teal",
        "avatar_url": "https://secure.gravatar.com/avatar/5cc831a4e778f54460efc4cd20d13acd.png?d=mm&r=PG",
        "billed": true,
        "role": "admin",
        "description": "None",
        "invitation_sent": true,
        "job_title": "None",
        "teams": [],
        "contact_methods": [
          {
            "id": "POKPUFD",
            "type": "email_contact_method_reference",
            "summary": "Default",
            "self": "https://api.pagerduty.com/users/PYIEKLY/contact_methods/POKPUFD",
            "html_url": "None"
          }
        ],
        "notification_rules": [
          {
            "id": "P9NWEKF",
            "type": "assignment_notification_rule_reference",
            "summary": "0 minutes: channel POKPUFD",
            "self": "https://api.pagerduty.com/users/PYIEKLY/notification_rules/P9NWEKF",
            "html_url": "None"
          },
          {
            "id": "PPJHFA5",
            "type": "assignment_notification_rule_reference",
            "summary": "0 minutes: channel POKPUFD",
            "self": "https://api.pagerduty.com/users/PYIEKLY/notification_rules/PPJHFA5",
            "html_url": "None"
          }
        ],
        "id": "PYIEKLY",
        "type": "user",
        "summary": "demo",
        "self": "https://api.pagerduty.com/users/PYIEKLY",
        "html_url": "https://getport-io.pagerduty.com/users/PYIEKLY"
      },
      "start": "2023-10-17T15:57:50Z",
      "end": "2024-02-13T22:16:48Z"
    }
  ]
}
```

</details>

<details>
<summary> Incident response data</summary>

```json showLineNumbers
{
  "incident_number": 2,
  "title": "Example Incident",
  "description": "Example Incident",
  "created_at": "2023-05-15T13:59:45Z",
  "updated_at": "2023-05-15T13:59:45Z",
  "status": "triggered",
  "incident_key": "89809d37f4344d36a90c0a192c20c617",
  "service": {
    "id": "PWJAGSD",
    "type": "service_reference",
    "summary": "Port Test Service",
    "self": "https://api.pagerduty.com/services/PWJAGSD",
    "html_url": "https://getport-io.pagerduty.com/service-directory/PWJAGSD"
  },
  "assignments": [
    {
      "at": "2023-05-15T13:59:45Z",
      "assignee": {
        "id": "PJCRRLH",
        "type": "user_reference",
        "summary": "Username",
        "self": "https://api.pagerduty.com/users/PJCRRLH",
        "html_url": "https://getport-io.pagerduty.com/users/PJCRRLH"
      }
    }
  ],
  "assigned_via": "escalation_policy",
  "last_status_change_at": "2023-05-15T13:59:45Z",
  "resolved_at": null,
  "first_trigger_log_entry": {
    "id": "R5S5T07QR1SZRQFYB7SXEO2EKZ",
    "type": "trigger_log_entry_reference",
    "summary": "Triggered through the website.",
    "self": "https://api.pagerduty.com/log_entries/R5S5T07QR1SZRQFYB7SXEO2EKZ",
    "html_url": "https://getport-io.pagerduty.com/incidents/Q1P3AHC3KLGVAS/log_entries/R5S5T07QR1SZRQFYB7SXEO2EKZ"
  },
  "alert_counts": {
    "all": 0,
    "triggered": 0,
    "resolved": 0
  },
  "is_mergeable": true,
  "escalation_policy": {
    "id": "P7LVMYP",
    "type": "escalation_policy_reference",
    "summary": "Test Escalation Policy",
    "self": "https://api.pagerduty.com/escalation_policies/P7LVMYP",
    "html_url": "https://getport-io.pagerduty.com/escalation_policies/P7LVMYP"
  },
  "teams": [],
  "pending_actions": [],
  "acknowledgements": [],
  "basic_alert_grouping": null,
  "alert_grouping": null,
  "last_status_change_by": {
    "id": "PWJAGSD",
    "type": "service_reference",
    "summary": "Port Test Service",
    "self": "https://api.pagerduty.com/services/PWJAGSD",
    "html_url": "https://getport-io.pagerduty.com/service-directory/PWJAGSD"
  },
  "urgency": "high",
  "id": "Q1P3AHC3KLGVAS",
  "type": "incident",
  "summary": "[#2] Example Incident",
  "self": "https://api.pagerduty.com/incidents/Q1P3AHC3KLGVAS",
  "html_url": "https://getport-io.pagerduty.com/incidents/Q1P3AHC3KLGVAS"
}
```

</details>

### Mapping Result

The combination of the sample payload and the Ocean configuration generates the following Port entity:

<details>
<summary> Schedule entity in Port</summary>

```json showLineNumbers
{
  "identifier": "PWAXLIH",
  "title": "Port Test Service - Weekly Rotation",
  "icon": null,
  "blueprint": "pagerdutySchedule",
  "team": [],
  "properties": {
    "url": "https://getport-io.pagerduty.com/schedules/PWAXLIH",
    "timezone": "Asia/Jerusalem",
    "description": "Asia/Jerusalem",
    "users": ["Adam", "Alice", "Doe", "Demo", "Pages"]
  },
  "relations": {},
  "createdAt": "2023-12-01T13:18:02.215Z",
  "createdBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW",
  "updatedAt": "2023-12-01T13:18:02.215Z",
  "updatedBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW"
}
```

</details>

<details>
<summary> Service entity in Port</summary>

```json showLineNumbers
{
  "identifier": "PGAAJBE",
  "title": "My Test Service",
  "icon": null,
  "blueprint": "pagerdutyService",
  "team": [],
  "properties": {
    "status": "active",
    "url": "https://getport-io.pagerduty.com/service-directory/PGAAJBE",
    "oncall": "devops-port@pager-demo.com"
  },
  "relations": {},
  "createdAt": "2023-11-01T13:18:02.215Z",
  "createdBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW",
  "updatedAt": "2023-11-01T13:18:02.215Z",
  "updatedBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW"
}
```

</details>

<details>
<summary> Incident entity in Port</summary>

```json showLineNumbers
{
  "identifier": "Q1P3AHC3KLGVAS",
  "title": "Example Incident",
  "icon": null,
  "blueprint": "pagerdutyIncident",
  "team": [],
  "properties": {
    "status": "triggered",
    "url": "https://api.pagerduty.com/incidents/Q1P3AHC3KLGVAS",
    "urgency": "high",
    "responder": "Username",
    "escalation_policy": "Test Escalation Policy",
    "created_at": "2023-07-30T11:29:21.000Z",
    "updated_at": "2023-07-30T11:29:21.000Z"
  },
  "relations": {
    "pagerdutyService": "PWJAGSD"
  },
  "createdAt": "2023-08-07T07:56:04.384Z",
  "createdBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW",
  "updatedAt": "2023-08-07T07:56:04.384Z",
  "updatedBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW"
}
```

</details>

## Alternative installation via webhook
While the Ocean integration described above is the recommended installation method, you may prefer to use a webhook to ingest data from PagerDuty. If so, use the following instructions:

<details>

<summary><b>Webhook installation (click to expand)</b></summary>

In this example you are going to create a webhook integration between [PagerDuty](https://www.pagerduty.com/) and Port, which will ingest PagerDuty services and its related incidents into Port. This integration will involve setting up a webhook to receive notifications from PagerDuty whenever an incident is created or updated, allowing Port to ingest and process the incident entities accordingly.

<h2>Import PagerDuty services and incidents</h2>

<h3>Port configuration</h3>

Create the following blueprint definitions:

<details>
<summary>PagerDuty service blueprint</summary>

<PagerDutyServiceBlueprint/>

</details>

<details>
<summary>PagerDuty incident blueprint</summary>

<PagerDutyIncidentBlueprint/>

</details>

Create the following webhook configuration [using Port UI](/build-your-software-catalog/sync-data-to-catalog/webhook/?operation=ui#configuring-webhook-endpoints)

<details>
<summary>PagerDuty webhook configuration</summary>

1. **Basic details** tab - fill the following details:
   1. Title : `PagerDuty Mapper`;
   2. Identifier : `pagerduty_mapper`;
   3. Description : `A webhook configuration to map PagerDuty services and its related incidents to Port`;
   4. Icon : `Pagerduty`;
2. **Integration configuration** tab - fill the following JQ mapping:

   <PagerDutyWebhookConfig/>

3. Scroll down to **Advanced settings** and input the following details:

   1. secret: `WEBHOOK_SECRET`;
   2. Signature Header Name : `X-Pagerduty-Signature`;
   3. Signature Algorithm : Select `sha256` from dropdown option;
   4. Signature Prefix : `v1=`
   5. Click **Save** at the bottom of the page.

   Remember to update the `WEBHOOK_SECRET` with the real secret you receive after subscribing to the webhook in PagerDuty.

</details>

<h3>Create a webhook in PagerDuty</h3>

1. Go to [PagerDuty](https://www.pagerduty.com/) and select the account you want to configure the webhook for.
2. Navigate to **Integrations** in the navigation bar and click on **Generic Webhooks (v3)**.
3. Click **New Webhook** and provide the following information:
   1. `Webhook URL` - enter the value of the `url` key you received after [creating the webhook configuration](/build-your-software-catalog/sync-data-to-catalog/webhook/?operation=ui#configuring-webhook-endpoints).
   2. `Scope Type` - select whether you want to receive webhook events for a specific service (select `Service` if applicable) or for all services in your account (select `Account` if applicable).
   3. `Description` - provide an optional description for your webhook.
   4. `Event Subscription` - choose the event types you would like to subscribe to.
   5. `Custom Header` - enter any optional HTTP header to be added to your webhook payload.
4. Click **Add webhook** to create your webhook.
5. Alternatively, you can use the `curl` method to create the webhook. Copy the code below and run it in your terminal:

```curl showLineNumbers
  curl --request POST \
  --url \
 https://api.pagerduty.com/webhook_subscriptions
  --header 'Accept: application/vnd.pagerduty+json;version=2' \
  --header 'Authorization: Token token=<YOUR_PAGERDUTY_API_TOKEN>' \
  --header 'Content-Type: application/json' \
  --data \
 '{
  "webhook_subscription": {
  "delivery_method": {
    "type": "http_delivery_method",
    "url": "https://ingest.getport.io/<YOUR_PORT_WEBHOOK_KEY>",
    "custom_headers": [
      {
        "name": "your-header-name",
        "value": "your-header-value"
      }
    ]
  },
  "description": "Sends PagerDuty v3 webhook events to Port.",
  "events": [
      "service.created",
      "service.updated",
      "incident.triggered",
      "incident.responder.added",
      "incident.acknowledged",
      "incident.annotated",
      "incident.delegated",
      "incident.escalated",
      "incident.priority_updated",
      "incident.reassigned",
      "incident.reopened",
      "incident.resolved",
      "incident.responder.replied",
      "incident.status_update_published",
      "incident.unacknowledged"
  ],
  "filter": {
    "type": "account_reference"
  },
  "type": "webhook_subscription"
  }
  }'
```

:::tip
In order to view the different events available in PagerDuty webhooks, [look here](https://developer.pagerduty.com/docs/db0fa8c8984fc-overview#event-types)
:::

Done! any change that happens to your services or incidents in PagerDuty will trigger a webhook event to the webhook URL provided by Port. Port will parse the events according to the mapping and update the catalog entities accordingly.

<h2>Let's Test It</h2>

This section includes a sample webhook event sent from PagerDuty when an incident is created or updated. In addition, it includes the entity created from the event based on the webhook configuration provided in the previous section.

<h3>Payload</h3>

Here is an example of the payload structure sent to the webhook URL when a PagerDuty incident is created:

<details>
<summary>Webhook event payload</summary>

```json showLineNumbers
{
  "event": {
    "id": "01DVUHO6P4XQDFJ9AHOADT3UQ4",
    "event_type": "incident.triggered",
    "resource_type": "incident",
    "occurred_at": "2023-06-12T11:56:08.355Z",
    "agent": {
      "html_url": "https://your_account.pagerduty.com/users/PJCRRLH",
      "id": "PJCRRLH",
      "self": "https://api.pagerduty.com/users/PJCRRLH",
      "summary": "username",
      "type": "user_reference"
    },
    "client": "None",
    "data": {
      "id": "Q01J2OS7YBWLNY",
      "type": "incident",
      "self": "https://api.pagerduty.com/incidents/Q01J2OS7YBWLNY",
      "html_url": "https://your_account.pagerduty.com/incidents/Q01J2OS7YBWLNY",
      "number": 7,
      "status": "triggered",
      "incident_key": "acda20953f7446248f90260db65144f8",
      "created_at": "2023-06-12T11:56:08Z",
      "title": "Test PagerDuty Incident",
      "service": {
        "html_url": "https://your_account.pagerduty.com/services/PWJAGSD",
        "id": "PWJAGSD",
        "self": "https://api.pagerduty.com/services/PWJAGSD",
        "summary": "Port Internal Service",
        "type": "service_reference"
      },
      "assignees": [
        {
          "html_url": "https://your_account.pagerduty.com/users/PRGAUI4",
          "id": "PRGAUI4",
          "self": "https://api.pagerduty.com/users/PRGAUI4",
          "summary": "username",
          "type": "user_reference"
        }
      ],
      "escalation_policy": {
        "html_url": "https://your_account.pagerduty.com/escalation_policies/P7LVMYP",
        "id": "P7LVMYP",
        "self": "https://api.pagerduty.com/escalation_policies/P7LVMYP",
        "summary": "Test Escalation Policy",
        "type": "escalation_policy_reference"
      },
      "teams": [],
      "priority": "None",
      "urgency": "high",
      "conference_bridge": "None",
      "resolve_reason": "None"
    }
  }
}
```

</details>

<h3>Mapping Result</h3>

The combination of the sample payload and the webhook configuration generates the following Port entity:

```json showLineNumbers
{
  "identifier": "Q01J2OS7YBWLNY",
  "title": "Test PagerDuty Incident",
  "blueprint": "pagerdutyIncident",
  "team": [],
  "properties": {
    "status": "triggered",
    "url": "https://your_account.pagerduty.com/incidents/Q01J2OS7YBWLNY",
    "details": "Test PagerDuty Incident",
    "urgency": "high",
    "responder": "Username",
    "escalation_policy": "Test Escalation Policy"
  },
  "relations": {
    "microservice": "PWJAGSD"
  }
}
```

<h2>Import PagerDuty historical data</h2>

In this example you are going to use the provided Bash script to fetch data from the PagerDuty API and ingest it to Port.

The script extracts services and incidents from PagerDuty, and sends them to Port as microservice and incident entities respectively.

<h3>Port configuration</h3>

This example utilizes the same [blueprint](#prerequisites) definition from the previous section, along with a new webhook configuration:

Create the following webhook configuration [using Port UI](/build-your-software-catalog/sync-data-to-catalog/webhook/?operation=ui#configuring-webhook-endpoints)

<details>
<summary>PagerDuty webhook configuration for historical data</summary>

1. **Basic details** tab - fill the following details:
   1. Title : `PagerDuty History Mapper`;
   2. Identifier : `pagerduty_history_mapper`;
   3. Description : `A webhook configuration to map PagerDuty Historical services and its related incidents to Port`;
   4. Icon : `Pagerduty`;
2. **Integration configuration** tab - fill the following JQ mapping:
   <PagerDutyWebhookHistory/>

3. Scroll down to **Advanced settings** and input the following details:
   1. secret: `WEBHOOK_SECRET`;
   2. Signature Header Name : `X-Pagerduty-Signature`;
   3. Signature Algorithm : Select `sha256` from dropdown option;
   4. Signature Prefix : `v1=`
   5. Click **Save** at the bottom of the page.

Remember to update the `WEBHOOK_SECRET` with the real secret you receive after subscribing to the webhook in PagerDuty.

</details>

<details>
<summary> PagerDuty Bash script for historical data </summary>

<PagerDutyScript/>

</details>

<h3>How to Run the script</h3>

This script requires two configuration values:

1. `PD_TOKEN`: your PagerDuty API token;
2. `PORT_URL`: your Port webhook URL.

Then trigger the script by running:

```bash showLineNumbers
bash pagerduty_to_port.sh
```

This script fetches services and incidents from PagerDuty and sends them to Port.

:::tip
The script writes the JSON payload for each service and incident to a file named `output.json`. This can be useful for debugging if you encounter any issues.
:::

Done! you can now import historical data from PagerDuty into Port. Port will parse the events according to the mapping and update the catalog entities accordingly.
</details>