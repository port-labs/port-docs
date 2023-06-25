---
sidebar_position: 2
description: Keep merge requests up to date using webhooks
---

import MergeRequestBlueprint from '../resources/gitlab/\_example_gitlab_mr_blueprint.mdx'
import MergeRequestWebhookConfig from '../resources/gitlab/\_example_gitlab_mr_configuration.mdx'

# GitLab

In this example you are going to create a webhook integration between [GitLab](https://about.gitlab.com/) and Port, which will ingest merge request entities.

## Prerequisites

Create the following blueprint definition and webhook configuration:

<details>
<summary>Merge request blueprint</summary>

<MergeRequestBlueprint/>

</details>

<details>
<summary>Pull request webhook configuration</summary>

<MergeRequestWebhookConfig/>

</details>

## Create the GitLab webhook

:::tip
Webhooks can be created at the group level and at the project level, this example focuses on project-level webhooks
:::

1. Go to your desired project in GitLab;
2. At the sidebar on the left side of the page select **Settings** and click on **Webhooks**;
3. Input the following details:
   1. `URL` - enter the value of the `url` key you received after creating the webhook configuration;
   2. `Trigger` - choose **Merge request events**;
   3. Be sure to keep the "Enable SSL verification" checkbox checked.
4. Click on **Add webhook**

:::tip
In order to view the different payloads and events available in GitLab webhooks, [look here](https://docs.gitlab.com/ee/user/project/integrations/webhook_events.html)
:::

Done! any change you make to a merge request (open, close, edit, etc.) will trigger a webhook event that GitLab will send to the webhook URL provided by Port. Port will parse the events according to the mapping and update the catalog entities accordingly.
