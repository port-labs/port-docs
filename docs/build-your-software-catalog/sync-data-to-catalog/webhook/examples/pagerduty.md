---
sidebar_position: 11
description: Ingest PagerDuty incidents and services into Port
---

import PagerDutyServiceBlueprint from "./resources/pagerduty/\_example_pagerduty_service.mdx";
import PagerDutyIncidentBlueprint from "./resources/pagerduty/\_example_pagerduty_incident.mdx";
import PagerDutyWebhookConfig from "./resources/pagerduty/\_example_pagerduty_webhook_config.mdx";
import PagerDutyWebhookHistory from "./resources/pagerduty/\_example_pagerduty_webhook_history_config.mdx";
import PagerDutyScript from "./resources/pagerduty/\_example_pagerduty_shell_history_config.mdx";

# PagerDuty

In this example you are going to create a webhook integration between [PagerDuty](https://www.pagerduty.com/) and Port, which will ingest PagerDuty services and its related incidents into Port. This integration will involve setting up a webhook to receive notifications from PagerDuty whenever an incident is created or updated, allowing Port to ingest and process the incident entities accordingly.

## Import PagerDuty services and incidents

### Port configuration

Create the following blueprint definitions:

<details>
<summary>PagerDuty service blueprint</summary>

<PagerDutyServiceBlueprint/>

</details>

<details>
<summary>PagerDuty incident blueprint</summary>

<PagerDutyIncidentBlueprint/>

</details>

Create the following webhook configuration [using Port UI](../../?operation=ui#configuring-webhook-endpoints)

<details>
<summary>PagerDuty webhook configuration</summary>

1. **Basic details** tab - fill the following details:
   1. Title : `PagerDuty Mapper`;
   2. Identifier : `pagerduty_mapper`;
   3. Description : `A webhook configuration to map PagerDuty services and it's related incidents to Port`;
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

### Create a webhook in PagerDuty

1. Go to [PagerDuty](https://www.pagerduty.com/) and select the account you want to configure the webhook for.
2. Navigate to **Integrations** in the navigation bar and click on **Generic Webhooks (v3)**.
3. Click **New Webhook** and provide the following information:
   1. `Webhook URL` - enter the value of the `url` key you received after [creating the webhook configuration](../webhook.md#configuring-webhook-endpoints).
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

## Let's Test It

This section includes a sample webhook event sent from PagerDuty when an incident is created or updated. In addition, it includes the entity created from the event based on the webhook configuration provided in the previous section.

### Payload

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

### Mapping Result

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

## Import PagerDuty historical data

In this example you are going to use the provided Bash script to fetch data from the PagerDuty API and ingest it to Port.

The script extracts services and incidents from PagerDuty, and sends them to Port as microservice and incident entities respectively.

### Port configuration

This example utilizes the same [blueprint](#prerequisites) definition from the previous section, along with a new webhook configuration:

Create the following webhook configuration [using Port UI](../../?operation=ui#configuring-webhook-endpoints)

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

### How to Run the script

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
