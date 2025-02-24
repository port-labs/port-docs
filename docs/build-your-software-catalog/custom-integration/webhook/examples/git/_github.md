---
sidebar_position: 1
description: Keep pull requests up to date using webhooks
---

import PullRequestBlueprint from '../resources/github/\_example_github_pr_blueprint.mdx'
import PullRequestWebhookConfig from '../resources/github/\_example_github_pr_configuration.mdx'

# GitHub

In this example you are going to create a webhook integration between [GitHub](https://github.com) and Port, which will ingest pull request entities.

## Port configuration

Create the following blueprint definition:

<details>
<summary>Pull request blueprint</summary>

<PullRequestBlueprint/>

</details>

Create the following webhook configuration [using Port's UI](/build-your-software-catalog/custom-integration/webhook/?operation=ui#configuring-webhook-endpoints):

<details>
<summary>Pull request webhook configuration</summary>

1. **Basic details** tab - fill the following details:
   1. Title : `Pull Request Mapper`;
   2. Identifier : `pull_request_mapper`;
   3. Description : `A webhook configuration for pull-request events from GitHub`;
   4. Icon : `Github`;
2. **Integration configuration** tab - fill the following JQ mapping:
   <PullRequestWebhookConfig/>

3. Scroll down to **Advanced settings** and input the following details:

   1. Secret: `WEBHOOK_SECRET`;
   2. Signature Header Name : `x-hub-signature-256`;
   3. Signature Algorithm : Select `sha256` from dropdown option;
   4. Signature Prefix : `sha256=`;
   5. Request Identifier Path : `.headers.\"x-github-delivery\"`;
   6. Click **Save** at the bottom of the page.

</details>

## Create a webhook in GitHub

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

## Let's Test It

This section includes a sample webhook event sent from GitHub when a pull request is created. In addition, it includes the entity created from the event based on the webhook configuration provided in the previous section.

### Payload

Here is an example of the payload structure sent to the webhook URL when a GitHub pull request is opened:

<details>
<summary> Webhook event payload</summary>

```json showLineNumbers
{
  "action": "opened",
  "number": 15,
  "pull_request": {
    "url": "https://api.github.com/repos/username/My_Awesome_Python_App/pulls/15",
    "id": 1395792349,
    "node_id": "PR_kwDOEFWVvs5TMhnd",
    "html_url": "https://github.com/username/My_Awesome_Python_App/pull/15",
    "issue_url": "https://api.github.com/repos/username/My_Awesome_Python_App/issues/15",
    "number": 15,
    "state": "open",
    "locked": false,
    "title": "Update regex",
    "user": {
      "login": "username",
      "id": 15999660,
      "node_id": "MDQ6VXNlcjE1OTk5NjYw",
      "url": "https://api.github.com/users/username"
    },
    "body": "Modifying event header",
    "created_at": "2023-06-16T14:08:27Z",
    "updated_at": "2023-06-16T14:08:27Z",
    "closed_at": "None",
    "merged_at": "None",
    "assignees": [],
    "requested_reviewers": [],
    "requested_teams": [],
    "labels": [],
    "commits_url": "https://api.github.com/repos/username/My_Awesome_Python_App/pulls/15/commits",
    "head": {
      "label": "username:port",
      "ref": "port",
      "sha": "9bd151d8a6d6c3759e7fbdb5ba5ed82668021e77",
      "user": {
        "login": "username",
        "id": 15999660,
        "node_id": "MDQ6VXNlcjE1OTk5NjYw",
        "avatar_url": "https://avatars.githubusercontent.com/u/15999660?v=4",
        "html_url": "https://github.com/username",
        "type": "User"
      },
      "repo": {
        "id": 274044350,
        "node_id": "MDEwOlJlcG9zaXRvcnkyNzQwNDQzNTA=",
        "name": "My_Awesome_Python_App",
        "full_name": "username/My_Awesome_Python_App",
        "private": false,
        "owner": {
          "login": "username",
          "id": 15999660,
          "node_id": "MDQ6VXNlcjE1OTk5NjYw",
          "url": "https://api.github.com/users/username"
        },
        "html_url": "https://github.com/username/My_Awesome_Python_App",
        "description": "Repo description",
        "fork": false,
        "visibility": "public",
        "forks": 0,
        "open_issues": 11,
        "watchers": 1,
        "default_branch": "master"
      }
    }
  }
}
```

</details>

### Mapping Result

The combination of the sample payload and the webhook configuration generates the following Port entity:

```json showLineNumbers
{
  "identifier": "1395792349",
  "title": "Update regex",
  "blueprint": "pullRequest",
  "properties": {
    "author": "username",
    "url": "https://github.com/username/My_Awesome_Python_App/pull/15"
  },
  "relations": {}
}
```
