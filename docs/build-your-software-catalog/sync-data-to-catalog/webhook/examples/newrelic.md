---
sidebar_position: 13
description: Ingest New Relic alerts into your catalog
---

import NewRelicAlertBlueprint from "./resources/newrelic/\_example_alert_blueprint.mdx";
import NewRelicWebhookConfiguration from "./resources/newrelic/\_example_alert_webhook_config.mdx"
import MicroserviceBlueprint from "./resources/newrelic/\_example_microservice_blueprint.mdx"

# New Relic

In this example you are going to create a webhook integration between [New Relic](https://newrelic.com/) and Port, which will ingest alerts entities to Port and map them to your microservice entities.

## Prerequisites

Create the following blueprint definitions and webhook configuration:

<details>
<summary>Microservice blueprint</summary>
<MicroserviceBlueprint/>
</details>

<details>
<summary>New Relic alert blueprint</summary>
<NewRelicAlertBlueprint/>
</details>

<details>
<summary>New Relic webhook configuration</summary>
<NewRelicWebhookConfiguration/>
</details>

:::note
The webhook configuration's relation mapping will function properly only when the identifiers of the Port microservice entities match the names of the services or hosts in your New Relic.
:::

## Create the New Relic webhook

Creating alert notifications in New Relic can be achieved in 2 stages: setting up the webhook destination and configuring workflows.

### Set up webhook destination

1. Log in to New Relic with your credentials;
2. Click on **Alerts and AI** at the left sidebar of the page;
3. Go to **Destinations**;
4. Under **Add a destination** page, click on **Webhook** and follow the setup instructions;
5. Input the following details:
   1. `Webhook name` - use a meaningful name such as Port_Webhook;
   2. `Endpoint URL` - enter the value of the `url` key you received after [creating the webhook configuration](../webhook.md#configuring-webhook-endpoints);
6. Click **Save** at the bottom of the page to save your webhook destination.

### Configure your workflow

1. Log in to New Relic with your credentials;
2. Click on **Alerts and AI** at the left sidebar of the page;
3. Go to **Workflows** and click on **Add a workflow**;
4. Input the following details:
   1. `Workflow name` - Enter a descriptive name for your workflow;
   2. `Filter data` - Select the kind of issues you want to send or leave it empty to send all issues to your webhook destination;
5. Under the **Notify** section, click on **Webhook** to open the notification message window;
6. Input the following details:
   1. `Destination` - Select the [webhook destination](#set-up-webhook-destination) you created above from the dropdown list;
   2. `Payload` - When an alert is triggered on your workflow, this payload will be sent to the webhook URL. Enter this JSON placeholder in the textbox;
      ```json showLineNumbers
      {
        "id": {{ json issueId }},
        "issueUrl": {{ json issuePageUrl }},
        "title": {{ json annotations.title.[0] }},
        "priority": {{ json priority }},
        "impactedEntities": {{json entitiesData.names}},
        "state": {{ json state }},
        "trigger": {{ json triggerEvent }},
        "createdAt": {{ createdAt }},
        "updatedAt": {{ updatedAt }},
        "sources": {{ json accumulations.source }},
        "alertPolicyNames": {{ json accumulations.policyName }},
        "alertConditionNames": {{ json accumulations.conditionName }},
        "workflowName": {{ json workflowName }},
         "tags": {{ json accumulations.tag.affectedService }}
      }
      ```
   3. `Custom headers` - configure any custom HTTP header to be added to the webhook event;
7. Click **Save message** at the bottom of the page to save your notification workflow.
   :::tip
   In order to view the different payloads and structure of the events in New Relic webhooks, [look here](https://docs.newrelic.com/docs/alerts-applied-intelligence/applied-intelligence/incident-workflows/migration-to-workflows/)
   :::

Done! any problem detected on your New Relic account will trigger a webhook event. Port will parse the events according to the mapping and update the catalog entities accordingly.

## Test the webhook

This section includes a sample webhook event sent from New Relic when an alert is triggered. In addition, it also includes the entity created from the event based on the webhook configuration provided in the previous section.

### Payload

Here is an example of the payload structure sent to the webhook URL when an alert is created:

<details>
<summary> Webhook event payload</summary>

```json showLineNumbers
{
  "id": "d1b1f3fd-995a-4066-88ab-8ce4f6960623",
  "issueUrl": "https://radar-api.service.newrelic.com/accounts/1/issues/0ea2df1c-adab-45d2-aae0-042b609d2322?notifier=SLACK",
  "title": "Memory Used % > 90 for at least 2 minutes on 'Some-Entity'",
  "priority": "CRITICAL",
  "impactedEntities": ["logs-itg-cloud", "MonitorTTFB-query"],
  "state": "ACTIVATED",
  "trigger": "INCIDENT_ADDED",
  "createdAt": 1617881246260,
  "updatedAt": 1617881246260,
  "sources": ["newrelic"],
  "alertPolicyNames": ["Policy1", "Policy2"],
  "alertConditionNames": ["condition1", "condition2"],
  "workflowName": "DBA Team workflow",
  "tags": ["service-1", "service-2"]
}
```

</details>

### Mapping Result

The combination of the sample payload and the webhook configuration generate the following Port entity:

```json showLineNumbers
{
  "identifier": "d1b1f3fd-995a-4066-88ab-8ce4f6960623",
  "title": "Memory Used % > 90 for at least 2 minutes on 'Some-Entity'",
  "blueprint": "newRelicAlert",
  "properties": {
    "priority": "CRITICAL",
    "issueURL": "https://radar-api.service.newrelic.com/accounts/1/issues/0ea2df1c-adab-45d2-aae0-042b609d2322?notifier=SLACK",
    "state": "ACTIVATED",
    "trigger": "INCIDENT_ADDED",
    "sources": ["newrelic"],
    "workflowName": "DBA Team workflow",
    "alertConditionNames": ["condition1", "condition2"],
    "alertPolicyNames": ["Policy1", "Policy2"]
  },
  "relations": {
    "microservice": ["service-1", "service-2"]
  }
}
```
