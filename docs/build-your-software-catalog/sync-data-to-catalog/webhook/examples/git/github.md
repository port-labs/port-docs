---
sidebar_position: 1
description: Keep pull requests up to date using webhooks
---

import PullRequestBlueprint from '../resources/github/\_example_github_pr_blueprint.mdx'
import PullRequestWebhookConfig from '../resources/github/\_example_github_pr_configuration.mdx'

# GitHub

In this example you are going to create a webhook integration between [GitHub](https://github.com) and Port, which will ingest pull request entities.

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

In this section, we'll explore the webhook event data that is received from GitHub whenever a pull request is created. We'll also delve into how the entity is finally created in Port by using the webhook configuration.

### Payload

Below is an example of the payload structure sent to the webhook URL after a pull request is opened:

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

Using the mappings defined in the webhook configuration, Port will extract the necessary properties from the GitHub webhook payload and use the output data to create the pull request entities. Below is the result of the mapping:

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
