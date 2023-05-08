---
sidebar_position: 10
description: Keep track of latest commits in your catalog
---

import CommitBlueprint from './resources/bitbucket/\_example_bitbucket_push_blueprint.mdx'
import CommitWebhookConfig from './resources/bitbucket/\_example_bitbucket_push_webhook_configuration.mdx'

# BitBucket

In this example you are going to create a webhook integration between [BitBucket](https://bitbucket.org) and Port, which will ingest commit entities.

## Prerequisites

Create the following blueprint definition and webhook configuration:

<details>
<summary>Commit blueprint</summary>

<CommitBlueprint/>

</details>

<details>
<summary>Commit webhook configuration</summary>

<CommitWebhookConfig/>

</details>

## Create the BitBucket webhook

1. Go to your desired repository in BitBucket;
2. Select **Repository Settings**;
3. Select **Webhooks**;
4. Click on **Add webhook**;
5. Input the following details:
   1. `Title` - enter a descriptive title for this webhook;
   2. `URL` - enter the value of the `url` key you received after creating the webhook configuration;
   3. Be sure to keep the "Active" checkbox checked under **Status**;
   4. Under **Triggers**, select "Push";
6. Click on **Save** at the bottom of the page.

:::tip
In order to view the different payloads and events available in BitBucket webhooks, [look here](https://support.atlassian.com/bitbucket-cloud/docs/event-payloads/#Push)
:::

Done! any change you make to the repository will trigger a webhook event that BitBucket will send to the webhook URL provided by Port. Port will parse the events according to the mapping and update the catalog entities accordingly.
