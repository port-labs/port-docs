---
sidebar_position: 10
description: Keep track of latest commits in your catalog
---

import MicroserviceBlueprint from './resources/bitbucket/\_example_bitbucket_push_blueprint.mdx'
import PushWebhookConfig from './resources/bitbucket/\_example_bitbucket_push_webhook_configuration.mdx'

# BitBucket

In this example, we will be integrating [BitBucket](https://bitbucket.org) and Port to enhance an existing microservice in Port with data regarding the latest commit pushes to the default branch. This integration will involve setting up a webhook to receive notifications from BitBucket whenever a new commit is made to the default branch, allowing Port to ingest and process the commit entities accordingly.

## Prerequisites

Create the following blueprint definition and webhook configuration in Port:

<details>
<summary>Microservice blueprint</summary>

<MicroserviceBlueprint/>

</details>

<details>
<summary>Push webhook configuration</summary>

<PushWebhookConfig/>

</details>

## Create the BitBucket webhook

1. Go to your desired repository in BitBucket;
2. Select **Repository Settings**;
3. Select **Webhooks**;
4. Click on **Add webhook**;
5. Input the following details:
   1. `Title` - enter a descriptive title for this webhook;
   2. `URL` - enter the value of the `url` key you received after [creating the webhook configuration](../webhook.md#configuring-webhook-endpoints) in Port;
   3. Be sure to keep the "Active" checkbox checked under **Status**;
   4. Under **Triggers**, select "Push";
6. Click on **Save** at the bottom of the page.

:::tip
In order to view the structure of the payload and other events available in BitBucket webhooks, [look here](https://support.atlassian.com/bitbucket-cloud/docs/event-payloads/#Push). Note that this structure is used in the webhook configuration.
:::

Done! any push to the repository's main branch will trigger a webhook event that will be sent to the webhook URL provided by Port. Port will parse the events according to the mapping and update the catalog entities accordingly.
