---
sidebar_position: 1
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import Prerequisites from "../templates/\_ocean_helm_prerequisites_block.mdx"

# PagerDuty

Our PagerDuty integration allows you to import `services` and `incidents` from your PagerDuty account into Port, according to your mapping and definitions.

## Common use cases

- Map `services` and `incidents` in your PagerDuty organization environment.
- Watch for object changes (create/update/delete) in real-time, and automatically apply the changes to your entities in Port.

## Prerequisites

<Prerequisites />

## installation

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
| `integration.secrets.token`      | PagerDuty API token token                                                                                               | ✅       |
| `integration.config.apiUrl`      | Pagerduty api url. If not specified, the default will be https://api.pagerduty.com                                      | ✅       |
| `integration.config.appHost`     | The host of the Port Ocean app. Used to set up the integration endpoint as the target for Webhooks created in PagerDuty | ❌       |
| `scheduledResyncInterval`        | The number of minutes between each resync                                                                               | ❌       |
| `initializePortResources`        | Default true, When set to true the integration will create default blueprints and the port App config Mapping           | ❌       |

<br/>

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

<TabItem value="one-time" label="One Time">

This workflow will run the PagerDuty integration once and then exit, this is useful for **one time** ingestion of data.

:::warning
If you want the integration to update Port in real time using webhooks you should use the [Real Time & Always On](?installation-methods=real-time-always-on#installation) installation option
:::

Make sure to configure the following [Github Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions):

| Parameter                             | Description                                                                             | Required |
| ------------------------------------- | --------------------------------------------------------------------------------------- | -------- |
| `OCEAN__INTEGRATION__CONFIG__TOKEN`   | The PagerDuty token                                                                     | ✅       |
| `OCEAN__INTEGRATION__CONFIG__API_URL` | The PagerDuty API URL                                                                   | ✅       |
| `OCEAN__INTEGRATION__IDENTIFIER`      | Change the identifier to describe your integration, if not set will use the default one | ❌       |
| `OCEAN__PORT__CLIENT_ID`              | Your port client id                                                                     | ✅       |
| `OCEAN__PORT__CLIENT_SECRET`          | Your port client secret                                                                 | ✅       |
| `OCEAN__PORT__BASE_URL`               | Your port base url, relevant only if not using the default port app                     | ❌       |

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
          -e OCEAN__INTEGRATION__CONFIG__TOKEN=${{ secrets.OCEAN__INTEGRATION__CONFIG__TOKEN }} \
          -e OCEAN__INTEGRATION__CONFIG__API_URL=${{ secrets.OCEAN__INTEGRATION__CONFIG__API_URL }} \
          -e OCEAN__PORT__CLIENT_ID=${{ secrets.OCEAN__PORT__CLIENT_ID }} \
          -e OCEAN__PORT__CLIENT_SECRET=${{ secrets.OCEAN__PORT__CLIENT_SECRET }} \
          $image_name
```

</TabItem>

</Tabs>

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

Examples of blueprints and the relevant integration configurations:

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
        "type": "string",
        "format": "user"
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
            oncall: .__oncall_user[0].user.email
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
