---
sidebar_position: 3
description: Get OpsGenie alerts directly into Port
---

import OpsGenieAlertBlueprint from "./resources/opsgenie/\_example_opsgenie_alert_blueprint.mdx";
import OpsGenieAlertConfiguration from "./resources/opsgenie/\_example_opsgenie_alert_configuration.mdx";

# OpsGenie

In this example you are going to create a webhook integration between [GitHub](https://github.com) and Port, which will ingest pull request entities.

## Prerequisites

Create the following blueprint definition and webhook configuration:

<details>
<summary>Pull request blueprint</summary>

<OpsGenieAlertBlueprint/>

</details>

<details>
<summary>Pull request webhook configuration</summary>

Remember to replace the `WEBHOOK_SECRET` with the real secret you specify when creating the webhook in GitHub.

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
