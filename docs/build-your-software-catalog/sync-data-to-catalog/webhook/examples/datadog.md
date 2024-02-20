---
sidebar_position: 9
description: Ingest Datadog alerts/monitors into your catalog
---

import DatadogBlueprint from "./resources/datadog/\_example_datadog_alert_blueprint.mdx";
import DatadogConfiguration from "./resources/datadog/\_example_datadog_webhook_configuration.mdx"
import DatadogMicroserviceBlueprint from "./resources/datadog/\_example_datadog_microservice.mdx"

# Datadog

In this example you are going to create a webhook integration between [Datadog](https://www.datadoghq.com/) and Port, which will ingest alerts and monitors entities to Port and map them to your microservice entities.

## Port configuration

Create the following blueprint definitions:

<details>
<summary>Datadog microservice blueprint</summary>
<DatadogMicroserviceBlueprint/>
</details>

<details>
<summary>Datadog alert/monitor blueprint</summary>
<DatadogBlueprint/>
</details>

Create the following webhook configuration [using Port UI](/build-your-software-catalog/sync-data-to-catalog/webhook/?operation=ui#configuring-webhook-endpoints)

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

## Create a webhook in Datadog

1. Log in to Datadog with your credentials;
2. Click on **Integrations** at the left sidebar of the page;
3. Search for **Webhooks** in the search box and select it;
4. Go to the **Configuration** tab and follow the installation instructions;
5. Click on **New**;
6. Input the following details:
   1. `Name` - use a meaningful name such as Port_Webhook;
   2. `URL` - enter the value of the `url` key you received after [creating the webhook configuration](../webhook.md#configuring-webhook-endpoints);
   3. `Payload` - When an alert is triggered on your monitors, this payload will be sent to the webhook URL. You can enter this JSON placeholder in the textbox;
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
   4. `Custom Headers` - configure any custom HTTP header to be added to the webhook event. The format for the header should be in JSON;
7. Click **Save** at the bottom of the page;

:::tip
In order to view the different payloads and structure of the events in Datadog webhooks, [look here](https://docs.datadoghq.com/integrations/webhooks/#variables)
:::

Done! any problem detected on your Datadog instance will trigger a webhook event. Port will parse the events according to the mapping and update the catalog entities accordingly.

## Let's Test It

This section includes a sample response data from Datadog. In addition, it includes the entity created from the resync event based on the Ocean configuration provided in the previous section.

### Payload

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

### Mapping Result

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

## Ingest service level objectives (SLOs)

This guide will walk you through the steps to ingest Datadog SLOs into Port. By following these steps, you will be able to create a blueprint for a `microservice` entity in Port, representing a service in your Datadog account. Furthermore, you will establish a relation between this service and the `datadogSLO` blueprint, allowing the ingestion of all defined SLOs from your Datadog account.

The provided example demonstrates how to pull data from Datadog's REST API at scheduled intervals using GitLab Pipelines and report the data to Port.

- [GitLab CI Pipeline Example](https://github.com/port-labs/datadog-slo-example)

## Ingest service dependency from your APM

In this example, you will create a `service` blueprint that ingests all services and their related dependencies in your Datadog APM using REST API. You will then add some shell script to create new entities in Port every time GitLab CI is triggered by a schedule.

- [GitLab CI Pipeline Example](https://github.com/port-labs/datadog-service-dependency-example)

## Ingest service catalog

In this example, you will create a `datadogServiceCatalog` blueprint that ingests all service catalogs from your Datadog account. You will then add some python script to make API calls to Datadog REST API and fetch data for your account.

- [Code Repository Example](https://github.com/port-labs/datadog-service-catalog)
