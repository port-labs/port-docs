---
sidebar_position: 3
description: Ingest OpsGenie alerts into Port
---

import OpsGenieAlertBlueprint from "./resources/opsgenie/\_example_opsgenie_alert_blueprint.mdx";
import OpsGenieAlertConfiguration from "./resources/opsgenie/\_example_opsgenie_alert_configuration.mdx";

# OpsGenie

In this example you are going to create a webhook integration between [OpsGenie](https://www.atlassian.com/software/opsgenie) and Port, which will ingest alert entities.

## Port configuration

Create the following blueprint definition:

<details>
<summary>OpsGenie alert blueprint</summary>

<OpsGenieAlertBlueprint/>

</details>

Create the following webhook configuration [using Port UI](../../?operation=ui#configuring-webhook-endpoints):

<details>
<summary>OpsGenie alert webhook configuration</summary>

1. **Basic details** tab - fill the following details:
   1. Title : `OpsGenie mapper`;
   2. Identifier : `opsgenie_mapper`;
   3. Description : `A webhook configuration to map OpsGenie alerts to Port`;
   4. Icon : `OpsGenie`;
2. **Integration configuration** tab - fill the following JQ mapping:
   <OpsGenieAlertConfiguration/>

3. Click **Save** at the bottom of the page.

</details>

## Create a webhook in OpsGenie

1. Go to OpsGenie;
2. Select **Settings**;
3. Click on **Integrations** under the **Integrations** section of the sidebar;
4. Click on **Add integration**;
5. In the search box, type _Webhook_ and select the webhook option;
6. Input the following details:
   1. `Name` - use a meaningful name such as Port Webhook;
   2. Be sure to keep the "Enabled" checkbox checked;
   3. Check the "Add Alert Description to Payload" checkbox;
   4. Check the "Add Alert Details to Payload" checkbox;
   5. Add the following action triggers to the webhook by clicking on **Add new action**:
      1. If _alert is snoozed_ in Opsgenie, _post to url_ in Webhook;
      2. If _alert's description is updated_ in Opsgenie, _post to url_ in Webhook;
      3. If _alert's message is updated_ in Opsgenie, _post to url_ in Webhook;
      4. If _alert's priority is updated_ in Opsgenie, _post to url_ in Webhook;
      5. If _a responder is added to the alert_ in Opsgenie, _post to url_ in Webhook;
      6. if _a user executes "Assign Ownership_ in Opsgenie, _post to url_ in Webhook;
      7. if _a tag is added to the alert_ in Opsgenie, _post to url_ in Webhook;
      8. .if _a tag is removed from the alert_ in Opsgenie, _post to url_ in Webhook;
   6. `Webhook URL` - enter the value of the `url` key you received after creating the webhook configuration;
7. Click **Save integration**

:::tip
In order to view the different payloads and events available in Opsgenie webhooks, [look here](https://support.atlassian.com/opsgenie/docs/opsgenie-edge-connector-alert-action-data/)
:::

Done! any change that happens to an OpsGenie alert (created, acknowledged, etc.) will trigger a webhook event that OpsGenie will send to the webhook URL provided by Port. Port will parse the events according to the mapping and update the catalog entities accordingly.

## Let's Test It

This section includes a sample webhook event sent from OpsGenie when an alert is created. In addition, it includes the entity created from the event based on the webhook configuration provided in the previous section.

### Payload

Here is an example of the payload structure sent to the webhook URL when an OpsGenie alert is created:

<details>
<summary> Webhook event payload</summary>

```json showLineNumbers
{
  "source": {
    "name": "web",
    "type": "API"
  },
  "alert": {
    "tags": ["tag1", "tag2"],
    "teams": ["team1", "team2"],
    "responders": ["recipient1", "recipient2"],
    "message": "test alert",
    "username": "username",
    "alertId": "052652ac-5d1c-464a-812a-7dd18bbfba8c",
    "source": "user@domain.com",
    "alias": "aliastest",
    "tinyId": "10",
    "entity": "An example entity",
    "createdAt": 1686916265415,
    "updatedAt": 1686916266116,
    "userId": "daed1180-0ce8-438b-8f8e-57e1a5920a2d",
    "description": "Testing opsgenie alerts",
    "priority": "P1"
  },
  "action": "Create",
  "integrationId": "37c8f316-17c6-49d7-899b-9c7e540c048d",
  "integrationName": "Port-Integration"
}
```

</details>

### Mapping Result

The combination of the sample payload and the webhook configuration generates the following Port entity:

```json showLineNumbers
{
  "identifier": "052652ac-5d1c-464a-812a-7dd18bbfba8c",
  "title": "10 - test alert",
  "blueprint": "opsGenieAlert",
  "properties": {
    "description": "Testing opsgenie alerts",
    "lastChangeType": "Create",
    "priority": "P1",
    "sourceName": "web",
    "sourceType": "API",
    "tags": ["tag1", "tag2"],
    "responders": ["recipient1", "recipient2"],
    "teams": ["team1", "team2"]
  },
  "relations": {}
}
```

## Ingest who is on-call

In this example we will create a blueprint for `service` entities with an `on-call` property that will be ingested directly from OpsGenie.
The examples below pull data from the OpsGenie REST Api, in a defined scheduled period using GitLab Pipelines or GitHub Workflows, and report the data to Port as a property to the `service` blueprint.

- [Github Workflow](https://github.com/port-labs/opsgenie-oncall-example)
- [GitLab CI Pipeline](https://gitlab.com/getport-labs/opsgenie-oncall-example)
