---
sidebar_position: 1
description: Keep pull requests up to date using webhooks
---

import PullRequestBlueprint from './resources/\_example_github_pr_blueprint.mdx'
import PullRequestWebhookConfig from './resources/\_example_github_pr_configuration.mdx'

# GitHub

In this example you are going to create a webhook integration between GitHub and Port, which will ingest pull request entities.

## Prerequisites

Create the following blueprint definition and webhook configuration:

<details>
<summary>Pull request blueprint</summary>

<PullRequestBlueprint/>

</details>

<details>
<summary>Pull request webhook configuration</summary>

Remember to replace the `WEBHOOK_SECRET` with the real secret you specify when creating the webhook in GitHub.

<PullRequestWebhookConfig/>

</details>

## Create the GitHub webhook

1. Go to your desired organization/repository in GitHub;
2. Select **Settings**;
3. Select **Webhooks**;
4. Click **Add webhook**;
5. Input the following details:
   1. `Payload URL` - enter the value of the `url` key from the webhook configuration create response;
   2. `Content type` - `application/json`;
   3. Secret - enter the secret value you specified when creating the webhook;
   4. Under "Which events would you like to trigger this webhook?" - select "Let me select individual events" and select **Pull requests**;
   5. Be sure to keep the "Active" checkbox checked.
6. Click **Add webhook**

Done! if you the exporter will begin creating and updating objects from your Kubernetes cluster as Port entities shortly.
