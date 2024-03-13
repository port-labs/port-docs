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


Create the following webhook configuration [using Port's UI](/build-your-software-catalog/custom-integration/webhook/?operation=ui#configuring-webhook-endpoints)

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
