---
sidebar_position: 1
description: Keep pull requests up to date using webhooks
---

import PullRequestBlueprint from '../resources/github/\_example_github_pr_blueprint.mdx'
import PullRequestWebhookConfig from '../resources/github/\_example_github_pr_configuration.mdx'

# GitHub

In this example you are going to create a webhook integration between [GitHub](https://github.com) and Port, which will ingest pull request entities.

## Prerequisites

Create the following blueprint definition:

<details>
<summary>Pull request blueprint</summary>

<PullRequestBlueprint/>

</details>

Create the following webhook configuration [using port ui](../../?operation=ui#configuring-webhook-endpoints):

<details>
<summary>Pull request webhook configuration</summary>

<PullRequestWebhookConfig/>

### Add webhook security using Port UI

Scroll down to **Advanced settings** and input the following details:

1.  secret: `WEBHOOK_SECRET`;
2.  Signature Header Name : `X-Hub-Signature-256`;
3.  Signature Algorithm : Select `sha256` from dropdown option;
4.  Signature Prefix : `sha256=`;
5.  Request Identifier Path : `.headers.\"X-GitHub-Delivery\"`;
6.  Click **Save** at the bottom of the page.

</details>

## Create the GitHub webhook

1. Go to your desired organization/repository in GitHub;
2. Select **Settings**;
3. Select **Webhooks**;
4. Click on **Add webhook**;
5. Input the following details:
   1. `Payload URL` - enter the value of the `url` key you received after creating the webhook configuration;
   2. `Content type` - `application/json`;
   3. `Secret` - enter the secret value you specified when creating the webhook;
   4. Under "Which events would you like to trigger this webhook?" - select "Let me select individual events" and select **Pull requests**;
   5. Be sure to keep the "Active" checkbox checked.
6. Click on **Add webhook**

:::tip
In order to view the different payloads and events available in GitHub webhooks, [look here](https://docs.github.com/en/webhooks-and-events/webhooks/webhook-events-and-payloads)
:::

Done! any change you make to a pull request (open, close, edit, etc.) will trigger a webhook event that GitHub will send to the webhook URL provided by Port. Port will parse the events according to the mapping and update the catalog entities accordingly.
