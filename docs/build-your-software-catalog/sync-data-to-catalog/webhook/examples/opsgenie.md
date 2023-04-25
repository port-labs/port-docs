---
sidebar_position: 3
description: Ingest OpsGenie alerts into Port
---

import OpsGenieAlertBlueprint from "./resources/opsgenie/\_example_opsgenie_alert_blueprint.mdx";
import OpsGenieAlertConfiguration from "./resources/opsgenie/\_example_opsgenie_alert_configuration.mdx";

# OpsGenie

In this example you are going to create a webhook integration between [OpsGenie](https://www.atlassian.com/software/opsgenie) and Port, which will ingest alert entities.

## Prerequisites

Create the following blueprint definition and webhook configuration:

<details>
<summary>OpsGenie alert blueprint</summary>

<OpsGenieAlertBlueprint/>

</details>

<details>
<summary>OpsGenie alert webhook configuration</summary>

<OpsGenieAlertConfiguration/>

</details>

## Create the OpsGenie webhook

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

Done! any change that happens to an OpsGenie alert (created, acknowledged, etc.) will trigger a webhook event that OpsGenie will send to the webhook URL provided by Port. Port will parse the events according to the mapping and update the catalog entities accordingly.

## Ingest who is on-call
In this example you will create a blueprint for `service` entity that ingests who is on call data from OpsGenie using REST API. Then you will add some Python code to create new entities in Port every time a Github Workflow or GitLab Pipeline is triggered by a schedule. The links below guide you on how to accomplish this task on your preferred environment.
[Github Workflow](https://github.com/port-labs/opsgenie-oncall-example)
[GitLab CI Pipeline](https://gitlab.com/getport-labs/opsgenie-oncall-example)
