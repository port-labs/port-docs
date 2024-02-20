---
sidebar_position: 13
description: Ingest Split IO Impressions into your catalog
---

import SplitioBlueprint from './resources/splitio/\_example_splitio_impression_blueprint.mdx'
import SplitioWebhookConfig from './resources/splitio/\_example_splitio_webhook_configuration.mdx'

# Split

In this example you are going to create a webhook integration between [Split](https://www.split.io/) and Port, which will ingest impressions.

## Port configuration

Create the following blueprint definition:

<details>
<summary>Split impression blueprint</summary>

<SplitioBlueprint/>

</details>

Create the following webhook configuration [using Port's UI](/build-your-software-catalog/sync-data-to-catalog/webhook/?operation=ui#configuring-webhook-endpoints)

<details>

<summary>Split webhook configuration</summary>

1. **Basic details** tab - fill the following details:
   1. Title : `Split Mapper`;
   2. Identifier : `split_mapper`;
   3. Description : `A webhook configuration to map Splitio impressions to Port`;
   4. Icon : `Jenkins`;
2. **Integration configuration** tab - fill the following JQ mapping:

   <SplitioWebhookConfig/>

3. Click **Save** at the bottom of the page.

</details>

## Create a webhook in Split

1. Go to Admin Settings.
2. Click Integrations.
3. Select your workspace.
4. Click Add next to Outgoing Webhook (Impressions).
5. Check the environments where you would like data sent from.
6. Enter the value of the `url` key you received after creating the webhook configuration.
7. Click Save.

Done! any time an impression is triggered, the webhook will send the data to Port and create a new `split impression` entity

:::info
To see all available data for an impression, visit [Split's documentation](https://help.split.io/hc/en-us/articles/360020700232-Webhook-impressions)
:::

## Let's Test It

This section includes a sample response data from Split. In addition, it includes the entity created from the resync event based on the Ocean configuration provided in the previous section.

### Payload

Here is an example of the payload structure from Split:

<details>
<summary><b>Webhook response data (Click to expand)</b></summary>

```json showLineNumbers
{
  "key": "user123",
  "split": "enable_new_feature",
  "environmentId": "env123",
  "environmentName": "production",
  "treatment": "enabled",
  "time": 1644672000000,
  "bucketingKey": "user123",
  "label": "default_rule",
  "machineName": "webserver-01",
  "machineIp": "192.168.1.100",
  "splitVersionNumber": 123456789,
  "sdk": "JavaScript",
  "sdkVersion": "1.2.3",
  "properties": "{}"
}
```

</details>

### Mapping Result

The combination of the sample payload and the Ocean configuration generates the following Port entity:

<details>
<summary><b>Impression entity in Port (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "user123-2022-02-13T00:00:00+00:00",
  "title": "enable_new_feature",
  "blueprint": "splitImpression",
  "team": [],
  "icon": "",
  "properties": {
    "environment_id": "env123",
    "environment_name": "production",
    "label": "default_rule",
    "sdk": "JavaScript",
    "sdk_version": "1.2.3"
  },
  "relations": {
    "microservice": "my-service"
  },
  "createdAt": "2024-2-6T09:30:57.924Z",
  "createdBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW",
  "updatedAt": "2024-2-6T11:49:20.881Z",
  "updatedBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW"
}
```

</details>
