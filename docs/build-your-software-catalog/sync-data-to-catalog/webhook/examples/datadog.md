---
sidebar_position: 10
description: Ingest Datadog alerts/monitors into your catalog
---

import DatadogBlueprint from "./resources/datadog/\_example_datadog_alert_blueprint.mdx";
import DatadogConfiguration from "./resources/datadog/\_example_datadog_webhook_configuration.mdx"
import DatadogMicroserviceBlueprint from "./resources/datadog/\_example_datadog_microservice.mdx"

# Datadog

In this example you are going to create a webhook integration between [Datadog](https://www.datadoghq.com/) and Port, which will ingest alerts and monitors entities to Port and map them to your microservice entities.

## Prerequisites

Create the following blueprint definitions and webhook configuration:

<details>
<summary>Datadog microservice blueprint</summary>
<DatadogMicroserviceBlueprint/>
</details>

<details>
<summary>Datadog alert/monitor blueprint</summary>
<DatadogBlueprint/>
</details>

<details>
<summary>Datadog webhook configuration</summary>
<DatadogConfiguration/>
</details>

:::note
The webhook configuration's relation mapping will function properly only when the identifiers of the Port microservice entities match the names of the services or hosts in your Datadog.
:::

## Create the Datadog webhook

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

In this section, we'll explore the webhook event data that is received from Datadog whenever an alert is triggered. We'll also delve into how the entity is finally created in Port by using the webhook configuration.

### Payload

Below is an example of the payload structure sent to the webhook URL after a monitor or alert is created:

<details>
<summary> Webhook event payload</summary>

```json showLineNumbers
{
  "id": "7050278235293370890",
  "message": "Webhook message text",
  "priority": "normal",
  "last_updated": "1684492195000",
  "event_type": "query_alert_monitor",
  "event_url": "https://us5.datadoghq.com/event/event?id=7050278235293370890",
  "service": "api-service",
  "creator": "user@domain.com",
  "title": "[Triggered] [TEST] Service with IP 172.19.128.1 have exceeded memory limit",
  "date": "1684492195000",
  "org_id": "1300048894",
  "org_name": "Port",
  "alert_id": "147793",
  "alert_metric": "system.mem.used",
  "alert_status": "system.mem.used over host:api-service was > 7516192768.0 on average during the last 5m.",
  "alert_title": "[TEST] api-service with IP 172.19.128.1 have exceeded memory limit",
  "alert_type": "error",
  "tags": "host:api-service,monitor"
}
```

</details>

### Mapping Result

Using the mappings defined in the webhook configuration, Port will extract the necessary properties from the Datadog webhook payload and use the resulting data to create the alert entities. Below is the result of the mapping:

```json showLineNumbers
{
  "identifier": "147793",
  "title": "[Triggered] [TEST] api-service with IP 172.19.128.1 have exceeded memory limit",
  "blueprint": "datadogAlert",
  "team": [],
  "properties": {
    "url": "https://us5.datadoghq.com/event/event?id=7050278235293370890",
    "message": "Webhook message text",
    "eventType": "query_alert_monitor",
    "priority": "normal",
    "creator": "user@domain.com",
    "alertMetric": "system.mem.used",
    "alertType": "error",
    "tags": ["host:api-service,monitor"]
  },
  "relations": {
    "microservice": "api-service"
  }
}
```

## Ingest service level objectives (SLOs)

This guide will walk you through the steps to ingest Datadog SLOs into Port. By following these steps, you will be able to create a blueprint for a `microservice` entity in Port, representing a service in your Datadog account. Furthermore, you will establish a relation between this service and the `datadogSLO` blueprint, allowing the ingestion of all defined SLOs from your Datadog account.

The provided example demonstrates how to pull data from Datadog's REST API at scheduled intervals using GitLab Pipelines and report the data to Port.

- [GitLab CI Pipeline Example](https://github.com/port-labs/datadog-slo-example)

## Ingest service dependency from your APM

In this example, you will create a `service` blueprint that ingests all services and their related dependencies in your Datadog APM using REST API. You will then add some shell script to create new entities in Port every time GitLab CI is triggered by a schedule.

- [GitLab CI Pipeline Example](https://github.com/port-labs/datadog-service-dependency-example)
