---
sidebar_position: 11
description: Ingest PagerDuty incidents and services into Port
---

import PagerDutyServiceBlueprint from "./resources/pagerduty/\_example_pagerduty_service.mdx";
import PagerDutyIncidentBlueprint from "./resources/pagerduty/\_example_pagerduty_incident.mdx";
import PagerDutyWebhookConfig from "./resources/pagerduty/\_example_pagerduty_webhook_config.mdx";

# PagerDuty

In this example you are going to create a webhook integration between [PagerDuty](https://www.pagerduty.com/) and Port, which will ingest PagerDuty services and its related incidents into Port. This integration will involve setting up a webhook to receive notifications from PagerDuty whenever an incident is created or updated, allowing Port to ingest and process the incident entities accordingly.

## Prerequisites

Create the following blueprint definitions and webhook configuration:

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

Remember to update the `WEBHOOK_SECRET` with the real secret you receive after subscribing to the webhook in PagerDuty.

<PagerDutyWebhookConfig/>

</details>

## Create the PagerDuty webhook

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
  "type": "webhook_subscription"
  }
  }'
```

:::tip
In order to view the different events available in PagerDuty webhooks, [look here](https://developer.pagerduty.com/docs/db0fa8c8984fc-overview#event-types)
:::

Done! any change that happens to your services or incidents in PagerDuty will trigger a webhook event to the webhook URL provided by Port. Port will parse the events according to the mapping and update the catalog entities accordingly.


## Ingesting PagerDuty incidents to Port Webhook

This documentation guides you through the process of creating blueprints for PagerDuty incidents and its related services. This will involve creating a webhook to receive requests that contain necessary data to be ingested from PagerDuty.

## Deriving incidents from PagerDuty with an API Key

Using Postman or cURL, you can derive incidents from PagerDuty by making a GET request with your API key.

## Blueprint for PagerDuty incidents

```json showLineNumber
{
  "identifier": "pagerdutyIncident",
  "description": "This blueprint represents a PagerDuty incident in our software catalog",
  "title": "PagerDuty Incident",
  "icon": "pagerduty",
  "schema": {
    "properties": {
      "status": {
        "type": "string",
        "title": "Incident Status"
      },
      "details": {
        "type": "string",
        "title": "Details"
      },
      "responder": {
        "type": "string",
        "title": "Assignee"
      },
      "escalation_policy": {
        "type": "string",
        "title": "Escalation Policy"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "relations": {
    "microservice": {
      "title": "Belongs To",
      "target": "microservice",
      "required": false,
      "many": true
    }
  }
}
```


## Blueprint for services

```json showLineNumber
{
  "identifier": "microservice",
  "title": "Microservice",
  "icon": "Service",
  "schema": {
    "properties": {
      "incidents": {
        "type": "string",
        "title": "Incident Status"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {
    "serviceURL": {
      "title": "Service URL",
      "calculation": "'https://api.pagerduty.com/services/' + {{identifier}}",
      "type": "string",
      "format": "url"
    }
  },
  "relations": {}
}
```

After creating the blueprints, create a custom webhook either using the Port UI or a tool like Postman.

## Webhook Configuration for PagerDuty Mapping

```json showLineNumber
{
  "identifier": "pagerdutyMapper",
  "title": "PagerDuty Mapper",
  "description": "A webhook configuration to map PagerDuty services and its related incidents to Port",
  "icon": "pagerduty",
  "mappings": [
    {
      "blueprint": "pagerdutyIncident",
      "itemsToParse": ".body.incidents",
      "entity": {
        "identifier": ".item.id",
        "title": ".item.title",
        "properties": {
          "status": ".item.status",
          "details": ".item.description",
          "responder": ".item.escalation_policy.summary"
        },
        "relations": {
          "microservice": ".item.service.id"
        }
      }
    }
  ],
  "enabled": true,
  "security": {
    "signatureHeaderName": "X-Pagerduty-Signature",
    "signatureAlgorithm": "sha256",
    "signaturePrefix": "v1=",
    "secret": "pagerduty"
  }
}
```


Copy the webhook URL generated in the GET request made using the PagerDuty API key and make a POST request with the sample incident response provided. This will trigger the webhook and ingest the PagerDuty incidents into Port. Sample response below ;

Copy the webhook URL generated in the GET request you made using the pagerduty API key and make a POST request with that response.

Ensure that you have the necessary permissions and access to configure webhooks and blueprints in Port and retrieve incidents from PagerDuty using the API key.
