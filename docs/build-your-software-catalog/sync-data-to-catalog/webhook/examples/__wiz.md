---
sidebar_position: 8
description: Ingest Wiz issues into your catalog
---

import WizBlueprint from "./resources/wiz/\_example_wiz_issue_blueprint.mdx";
import WizConfiguration from "./resources/wiz/\_example_wiz_issue_webhook_configuration.mdx";

# Wiz

:::warning Ocean integration available
Ocean's [Wiz integration](../../code-quality-security/wiz.md) is simpler to use and provides more capabilities than the webhook, we recommend using it instead.  
Read more about Ocean [here](https://ocean.getport.io/).

If you'd still prefer to use the webhook, proceed with the instructions on this page.
:::

In this example you are going to create a webhook integration between [Wiz](https://wiz.io/) and Port, which will ingest Wiz issue entities into Port.

## Port configuration

Create the following blueprint definition:

<details>
<summary>Wiz issue blueprint</summary>

<WizBlueprint/>

</details>

Create the following webhook configuration [using Port UI](/build-your-software-catalog/sync-data-to-catalog/webhook/?operation=ui#configuring-webhook-endpoints)

<details>
<summary>Wiz issue webhook configuration</summary>

1. **Basic details** tab - fill the following details:
   1. Title : `Wiz Mapper`;
   2. Identifier : `wiz_mapper`;
   3. Description : `A webhook configuration to map Wiz issues to Port`;
   4. Icon : `Box`;
2. **Integration configuration** tab - fill the following JQ mapping:

   <WizConfiguration/>

</details>

## Create a webhook in Wiz

1. Send an email to win@wiz.io requesting for access to the developer documentation or reach out to your Wiz account manager.
2. Follow this [guide](https://integrate.wiz.io/reference/webhook-tutorial#create-a-custom-webhook) in the documentation to create a webhook.

Done! Any issue created in Wiz will trigger a webhook event to the webhook URL provided by Port. Port will parse the events according to the mapping and update the catalog entities accordingly.
