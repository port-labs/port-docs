---
sidebar_position: 10
description: Ingest PagerDuty incidents and services into Port
---

import PagerDutyServiceBlueprint from "./resources/pagerduty/\_example_pagerduty_service.mdx";
import PagerDutyIncidentBlueprint from "./resources/pagerduty/\_example_pagerduty_incident.mdx";
import PagerDutyOncallBlueprint from "./resources/pagerduty/\_example_pagerduty_oncall.mdx";
import PagerDutyWebhookConfig from "./resources/pagerduty/\_example_pagerduty_webhook_config.mdx";

# PagerDuty

In this example you are going to create a webhook integration between [PagerDuty](https://www.pagerduty.com/) and Port, which will ingest PagerDuty services and incidents into Port.

## Prerequisites

Create the following blueprint definition and webhook configuration:

<details>
<summary>PagerDuty service blueprint</summary>

<PagerDutyServiceBlueprint/>

</details>

<details>
<summary>PagerDuty incident blueprint</summary>

<PagerDutyIncidentBlueprint/>

</details>

<details>
<summary>PagerDuty webhook configuration</summary>

Remember to replace the `WEBHOOK_SECRET` with the real secret you specify when creating the webhook in PagerDuty.

<PagerDutyWebhookConfig/>

</details>

## Create the PagerDuty webhook

1. Follow the instructions here to [create the Port webhook URL](../webhook.md#configuring-webhook-endpoints) which will receive events from PagerDuty;
2. Go to [PagerDuty](https://www.pagerduty.com/) and select an account you want to configure the webhook for;
3. Click on **Settings** at the left of the page and copy your organization ID under the **Organization ID** section;
4. Navigate to your [PagerDuty accounts page](https://snyk.io/account/) and copy your API token. You will use this value to authorize the REST API;
5. Open any REST API client such as POSTMAN and make the following API call to create your webhook:

   1. `API URL` - use https://api.pagerduty.com/webhook_subscriptions;
   2. `Method` - select POST
   3. `Authorization` - The API token should be supplied in an Authorization header as `Authorization: Token token=<YOUR_API_KEY>`;
   4. `Request Body` - The body of your request should be in a JSON format. Past the following information in the body text

   ```json
   {
     "webhook_subscription": {
       "delivery_method": {
         "type": "http_delivery_method",
         "url": "https://ingest.getport.io/<YOUR_PORT_WEBHOOK_KEY>",
         "custom_headers": [
           {
             "name": "your-secret-header-name",
             "value": "WEBHOOK_SECRET"
           }
         ]
       },
       "description": "Sends PagerDuty v3 webhook events Port.",
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
       "type": "webhook_subscription"
     }
   }
   ```

   5. You can also use the `curl` method to create the webhook. Copy the below code and run it on your terminal;

   ```curl
   curl --request POST \
   --url https://api.pagerduty.com/webhook_subscriptions \
   --header 'Accept: application/vnd.pagerduty+json;version=2' \
   --header 'Authorization: Token token=<YOUR_PAGERDUTY_API_TOKEN>' \
   --header 'Content-Type: application/json' \
   --data '{
   "webhook_subscription": {
    "delivery_method": {
      "type": "http_delivery_method",
      "url": "https://ingest.getport.io/<YOUR_PORT_WEBHOOK_KEY>",
      "custom_headers": [
        {
          "name": "your-header-name",
          "value": "WEBHOOK_SECRET"
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
    "type": "webhook_subscription"
   }
   }'
   ```

6. Click **Send** to create your PagerDuty webhook;

:::tip
In order to view the different events available in PagerDuty webhooks, [look here](https://developer.pagerduty.com/docs/db0fa8c8984fc-overview#event-types)
:::

Done! any change that happens to your services or incidents in PagerDuty will trigger a webhook event to the webhook URL provided by Port. Port will parse the events according to the mapping and update the catalog entities accordingly.

## Ingest who is on-call

In this example we will create a blueprint for `service` entities with an `on-call` property that will be ingested directly from OpsGenie.
The examples below pull data from the OpsGenie REST Api, in a defined scheduled period using GitLab Pipelines or GitHub Workflows, and report the data to Port as a property to the `service` blueprint.

- [Github Workflow](https://github.com/port-labs/opsgenie-oncall-example)
- [GitLab CI Pipeline](https://gitlab.com/getport-labs/opsgenie-oncall-example)
