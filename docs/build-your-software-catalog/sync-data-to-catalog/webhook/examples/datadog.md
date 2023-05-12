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
   4. `Custom Headers` - configure any custom HTTP header to be added to the webhook event;
7. Click **Save** at the bottom of the page;

:::tip
In order to view the different payloads and variables available in Datadog webhooks, [look here](https://docs.datadoghq.com/integrations/webhooks/#variables)
:::

Done! any problem detected on your Datadog instance will trigger a webhook event. Port will parse the events according to the mapping and update the catalog entities accordingly.
