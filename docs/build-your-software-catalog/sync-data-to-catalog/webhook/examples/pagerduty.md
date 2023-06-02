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

`{
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
}`


## Blueprint for services

`{
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
}`

After creating the blueprints, create a custom webhook either using the Port UI or a tool like Postman.

## Webhook Configuration for PagerDuty Mapping

`{
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
}`


Copy the webhook URL generated in the GET request made using the PagerDuty API key and make a POST request with the sample incident response provided. This will trigger the webhook and ingest the PagerDuty incidents into Port. Sample response below ;

Copy the webhook URL generated in the GET request you made using the pagerduty API key and make a POST request with that response. A sample incident response is below ;

`{
    "incidents": [
        {
            "incident_number": 1,
            "title": "Authentication Issues",
            "description": "Authentication Issues",
            "created_at": "2023-05-15T13:57:24Z",
            "updated_at": "2023-05-15T18:42:07Z",
            "status": "resolved",
            "incident_key": "a4b73cf5d5dd4e9f96a7f0b5a2fc7773",
            "service": {
                "id": "PWJAGSD",
                "type": "service_reference",
                "summary": "Port Internal Service",
                "self": "https://api.pagerduty.com/services/PWJAGSD",
                "html_url": "https://getport-io.pagerduty.com/service-directory/PWJAGSD"
            },
            "assignments": [],
            "assigned_via": "escalation_policy",
            "last_status_change_at": "2023-05-15T18:42:07Z",
            "resolved_at": "2023-05-15T18:42:07Z",
            "first_trigger_log_entry": {
                "id": "RN4G2AM91ZSWM3SKRK359S3PZ6",
                "type": "trigger_log_entry_reference",
                "summary": "Triggered through the website.",
                "self": "https://api.pagerduty.com/log_entries/RN4G2AM91ZSWM3SKRK359S3PZ6",
                "html_url": "https://getport-io.pagerduty.com/incidents/Q3UJ5N4G3RSZLS/log_entries/RN4G2AM91ZSWM3SKRK359S3PZ6"
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
                "id": "PJCRRLH",
                "type": "user_reference",
                "summary": "isaac",
                "self": "https://api.pagerduty.com/users/PJCRRLH",
                "html_url": "https://getport-io.pagerduty.com/users/PJCRRLH"
            },
            "resolve_reason": null,
            "urgency": "high",
            "id": "Q3UJ5N4G3RSZLS",
            "type": "incident",
            "summary": "[#1] Authentication Issues",
            "self": "https://api.pagerduty.com/incidents/Q3UJ5N4G3RSZLS",
            "html_url": "https://getport-io.pagerduty.com/incidents/Q3UJ5N4G3RSZLS"
        },
        {
            "incident_number": 2,
            "title": "Example Incident",
            "description": "Example Incident",
            "created_at": "2023-05-15T13:59:45Z",
            "updated_at": "2023-05-15T18:53:52Z",
            "status": "acknowledged",
            "incident_key": "89809d37f4344d36a90c0a192c20c617",
            "service": {
                "id": "PWJAGSD",
                "type": "service_reference",
                "summary": "Port Internal Service",
                "self": "https://api.pagerduty.com/services/PWJAGSD",
                "html_url": "https://getport-io.pagerduty.com/service-directory/PWJAGSD"
            },
            "assignments": [
                {
                    "at": "2023-05-15T13:59:45Z",
                    "assignee": {
                        "id": "PJCRRLH",
                        "type": "user_reference",
                        "summary": "isaac",
                        "self": "https://api.pagerduty.com/users/PJCRRLH",
                        "html_url": "https://getport-io.pagerduty.com/users/PJCRRLH"
                    }
                }
            ],
            "assigned_via": "escalation_policy",
            "last_status_change_at": "2023-05-15T18:53:51Z",
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
            "acknowledgements": [
                {
                    "at": "2023-05-15T18:53:51Z",
                    "acknowledger": {
                        "id": "PJCRRLH",
                        "type": "user_reference",
                        "summary": "isaac",
                        "self": "https://api.pagerduty.com/users/PJCRRLH",
                        "html_url": "https://getport-io.pagerduty.com/users/PJCRRLH"
                    }
                }
            ],
            "basic_alert_grouping": null,
            "alert_grouping": null,
            "last_status_change_by": {
                "id": "PJCRRLH",
                "type": "user_reference",
                "summary": "isaac",
                "self": "https://api.pagerduty.com/users/PJCRRLH",
                "html_url": "https://getport-io.pagerduty.com/users/PJCRRLH"
            },
            "urgency": "high",
            "id": "Q1P3AHC3KLGVAS",
            "type": "incident",
            "summary": "[#2] Example Incident",
            "self": "https://api.pagerduty.com/incidents/Q1P3AHC3KLGVAS",
            "html_url": "https://getport-io.pagerduty.com/incidents/Q1P3AHC3KLGVAS"
        },
        {
            "incident_number": 3,
            "title": "Example Incident",
            "description": "Example Incident",
            "created_at": "2023-05-15T14:00:16Z",
            "updated_at": "2023-05-15T18:39:27Z",
            "status": "resolved",
            "incident_key": "03fb01a1ca41464c8272f1ab77110c8b",
            "service": {
                "id": "PWJAGSD",
                "type": "service_reference",
                "summary": "Port Internal Service",
                "self": "https://api.pagerduty.com/services/PWJAGSD",
                "html_url": "https://getport-io.pagerduty.com/service-directory/PWJAGSD"
            },
            "assignments": [],
            "assigned_via": "escalation_policy",
            "last_status_change_at": "2023-05-15T18:39:27Z",
            "resolved_at": "2023-05-15T18:39:27Z",
            "first_trigger_log_entry": {
                "id": "R7ZP06Z3UVDXS7ZVRFXLAWZFNH",
                "type": "trigger_log_entry_reference",
                "summary": "Triggered through the website.",
                "self": "https://api.pagerduty.com/log_entries/R7ZP06Z3UVDXS7ZVRFXLAWZFNH",
                "html_url": "https://getport-io.pagerduty.com/incidents/Q3TA05AGBML86K/log_entries/R7ZP06Z3UVDXS7ZVRFXLAWZFNH"
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
                "id": "PJCRRLH",
                "type": "user_reference",
                "summary": "isaac",
                "self": "https://api.pagerduty.com/users/PJCRRLH",
                "html_url": "https://getport-io.pagerduty.com/users/PJCRRLH"
            },
            "resolve_reason": null,
            "urgency": "high",
            "id": "Q3TA05AGBML86K",
            "type": "incident",
            "summary": "[#3] Example Incident",
            "self": "https://api.pagerduty.com/incidents/Q3TA05AGBML86K",
            "html_url": "https://getport-io.pagerduty.com/incidents/Q3TA05AGBML86K"
        },
        {
            "incident_number": 4,
            "title": "Incident Title",
            "description": "Incident Title",
            "created_at": "2023-05-15T17:29:21Z",
            "updated_at": "2023-05-15T17:37:34Z",
            "status": "resolved",
            "incident_key": "8d809f8abc9b42199b11e8f1d4e874b3",
            "service": {
                "id": "PWJAGSD",
                "type": "service_reference",
                "summary": "Port Internal Service",
                "self": "https://api.pagerduty.com/services/PWJAGSD",
                "html_url": "https://getport-io.pagerduty.com/service-directory/PWJAGSD"
            },
            "assignments": [],
            "assigned_via": "escalation_policy",
            "last_status_change_at": "2023-05-15T17:37:34Z",
            "resolved_at": "2023-05-15T17:37:34Z",
            "first_trigger_log_entry": {
                "id": "R6LZSPDL1UUB868PJPO0JI60AG",
                "type": "trigger_log_entry_reference",
                "summary": "Triggered through the website.",
                "self": "https://api.pagerduty.com/log_entries/R6LZSPDL1UUB868PJPO0JI60AG",
                "html_url": "https://getport-io.pagerduty.com/incidents/Q1MV3588AZ7E0M/log_entries/R6LZSPDL1UUB868PJPO0JI60AG"
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
                "id": "PJCRRLH",
                "type": "user_reference",
                "summary": "isaac",
                "self": "https://api.pagerduty.com/users/PJCRRLH",
                "html_url": "https://getport-io.pagerduty.com/users/PJCRRLH"
            },
            "resolve_reason": null,
            "urgency": "high",
            "id": "Q1MV3588AZ7E0M",
            "type": "incident",
            "summary": "[#4] Incident Title",
            "self": "https://api.pagerduty.com/incidents/Q1MV3588AZ7E0M",
            "html_url": "https://getport-io.pagerduty.com/incidents/Q1MV3588AZ7E0M"
        },
        {
            "incident_number": 5,
            "title": "Incident Title",
            "description": "Incident Title",
            "created_at": "2023-05-15T17:57:11Z",
            "updated_at": "2023-05-15T18:43:19Z",
            "status": "acknowledged",
            "incident_key": "0f923f4aa8874c8c9f1a8dd4b76d2f40",
            "service": {
                "id": "PWJAGSD",
                "type": "service_reference",
                "summary": "Port Internal Service",
                "self": "https://api.pagerduty.com/services/PWJAGSD",
                "html_url": "https://getport-io.pagerduty.com/service-directory/PWJAGSD"
            },
            "assignments": [
                {
                    "at": "2023-05-15T17:57:11Z",
                    "assignee": {
                        "id": "PJCRRLH",
                        "type": "user_reference",
                        "summary": "isaac",
                        "self": "https://api.pagerduty.com/users/PJCRRLH",
                        "html_url": "https://getport-io.pagerduty.com/users/PJCRRLH"
                    }
                }
            ],
            "assigned_via": "escalation_policy",
            "last_status_change_at": "2023-05-15T18:43:18Z",
            "resolved_at": null,
            "first_trigger_log_entry": {
                "id": "R8BLBZ3GB73ULL6ALWQFVDM8QJ",
                "type": "trigger_log_entry_reference",
                "summary": "Triggered through the website.",
                "self": "https://api.pagerduty.com/log_entries/R8BLBZ3GB73ULL6ALWQFVDM8QJ",
                "html_url": "https://getport-io.pagerduty.com/incidents/Q2GAZP6TM13WHL/log_entries/R8BLBZ3GB73ULL6ALWQFVDM8QJ"
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
            "acknowledgements": [
                {
                    "at": "2023-05-15T18:43:18Z",
                    "acknowledger": {
                        "id": "PJCRRLH",
                        "type": "user_reference",
                        "summary": "isaac",
                        "self": "https://api.pagerduty.com/users/PJCRRLH",
                        "html_url": "https://getport-io.pagerduty.com/users/PJCRRLH"
                    }
                }
            ],
            "basic_alert_grouping": null,
            "alert_grouping": null,
            "last_status_change_by": {
                "id": "PJCRRLH",
                "type": "user_reference",
                "summary": "isaac",
                "self": "https://api.pagerduty.com/users/PJCRRLH",
                "html_url": "https://getport-io.pagerduty.com/users/PJCRRLH"
            },
            "urgency": "high",
            "id": "Q2GAZP6TM13WHL",
            "type": "incident",
            "summary": "[#5] Incident Title",
            "self": "https://api.pagerduty.com/incidents/Q2GAZP6TM13WHL",
            "html_url": "https://getport-io.pagerduty.com/incidents/Q2GAZP6TM13WHL"
        },
        {
            "incident_number": 6,
            "title": "Test Incident",
            "description": "Test Incident",
            "created_at": "2023-05-15T18:36:51Z",
            "updated_at": "2023-05-15T18:37:36Z",
            "status": "acknowledged",
            "incident_key": "6046c528a019406488c9e150988acc63",
            "service": {
                "id": "P69HX03",
                "type": "service_reference",
                "summary": "Port Outbound Service",
                "self": "https://api.pagerduty.com/services/P69HX03",
                "html_url": "https://getport-io.pagerduty.com/service-directory/P69HX03"
            },
            "assignments": [
                {
                    "at": "2023-05-15T18:36:51Z",
                    "assignee": {
                        "id": "PJCRRLH",
                        "type": "user_reference",
                        "summary": "isaac",
                        "self": "https://api.pagerduty.com/users/PJCRRLH",
                        "html_url": "https://getport-io.pagerduty.com/users/PJCRRLH"
                    }
                }
            ],
            "assigned_via": "escalation_policy",
            "last_status_change_at": "2023-05-15T18:37:36Z",
            "resolved_at": null,
            "first_trigger_log_entry": {
                "id": "R26HR1O9AKY3MSMAORU45EH9TL",
                "type": "trigger_log_entry_reference",
                "summary": "Triggered through the website.",
                "self": "https://api.pagerduty.com/log_entries/R26HR1O9AKY3MSMAORU45EH9TL",
                "html_url": "https://getport-io.pagerduty.com/incidents/Q3QHALOD7AZO3N/log_entries/R26HR1O9AKY3MSMAORU45EH9TL"
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
            "acknowledgements": [
                {
                    "at": "2023-05-15T18:37:36Z",
                    "acknowledger": {
                        "id": "PJCRRLH",
                        "type": "user_reference",
                        "summary": "isaac",
                        "self": "https://api.pagerduty.com/users/PJCRRLH",
                        "html_url": "https://getport-io.pagerduty.com/users/PJCRRLH"
                    }
                }
            ],
            "basic_alert_grouping": null,
            "alert_grouping": null,
            "last_status_change_by": {
                "id": "PJCRRLH",
                "type": "user_reference",
                "summary": "isaac",
                "self": "https://api.pagerduty.com/users/PJCRRLH",
                "html_url": "https://getport-io.pagerduty.com/users/PJCRRLH"
            },
            "urgency": "high",
            "id": "Q3QHALOD7AZO3N",
            "type": "incident",
            "summary": "[#6] Test Incident",
            "self": "https://api.pagerduty.com/incidents/Q3QHALOD7AZO3N",
            "html_url": "https://getport-io.pagerduty.com/incidents/Q3QHALOD7AZO3N"
        }
    ],
    "limit": 25,
    "offset": 0,
    "total": null,
    "more": false
}`

Ensure that you have the necessary permissions and access to configure webhooks and blueprints in Port and retrieve incidents from PagerDuty using the API key.
