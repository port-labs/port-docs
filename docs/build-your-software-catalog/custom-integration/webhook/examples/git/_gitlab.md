---
sidebar_position: 2
description: Keep merge requests up to date using webhooks
---

import MergeRequestBlueprint from '../resources/gitlab/\_example_gitlab_mr_blueprint.mdx'
import MergeRequestWebhookConfig from '../resources/gitlab/\_example_gitlab_mr_configuration.mdx'

# GitLab

In this example you are going to create a webhook integration between [GitLab](https://about.gitlab.com/) and Port, which will ingest merge request entities.

## Port configuration

Create the following blueprint definition:

<details>
<summary>Merge request blueprint</summary>

<MergeRequestBlueprint/>

</details>

Create the following webhook configuration [using Port's UI](/build-your-software-catalog/custom-integration/webhook/?operation=ui#configuring-webhook-endpoints):

<details>
<summary>Pull request webhook configuration</summary>

1. **Basic details** tab - fill the following details:

   1. Title : `Gitlab mapper`;
   2. Identifier : `gitlab_mapper`;
   3. Description : `A webhook configuration to map Gitlab merge requests to Port`;
   4. Icon : `Gitlab`;

2. **Integration configuration** tab - fill the following JQ mapping:
   <MergeRequestWebhookConfig/>

3. Scroll down to **Advanced settings** and input the following details:
   1. Request Identifier Path : `.headers.x-gitlab-event-uuid`;
   2. Click **Save** at the bottom of the page.

</details>

## Create a webhook in GitLab

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

## Let's Test It

This section includes a sample webhook event sent from GitLab when a merge request is created. In addition, it includes the entity created from the event based on the webhook configuration provided in the previous section.

### Payload

Here is an example of the payload structure sent to the webhook URL when a GitLab merge request is created:

<details>
<summary> Webhook event payload</summary>

```json showLineNumbers
{
  "object_kind": "merge_request",
  "event_type": "merge_request",
  "user": {
    "id": 6152768,
    "name": "Your Name",
    "username": "username",
    "avatar_url": "https://secure.gravatar.com/avatar/9df2ac1caa70b0a67ff0561f7d0363e5?s=80&d=identicon",
    "email": "[REDACTED]"
  },
  "project": {
    "id": 46155864,
    "name": "Datadog Service Dependency Example",
    "web_url": "https://gitlab.com/getport-labs/datadog-service-dependency-example",
    "namespace": "port-labs",
    "default_branch": "main",
    "homepage": "https://gitlab.com/getport-labs/datadog-service-dependency-example",
    "url": "git@gitlab.com:getport-labs/datadog-service-dependency-example.git"
  },
  "object_attributes": {
    "assignee_id": 6152768,
    "author_id": 6152768,
    "created_at": "2023-06-16 14:56:31 UTC",
    "description": "Testing webhook event data",
    "id": 231009949,
    "iid": 1,
    "merge_status": "preparing",
    "merge_when_pipeline_succeeds": false,
    "milestone_id": "None",
    "source_branch": "webhook",
    "source_project_id": 46155864,
    "state_id": 1,
    "target_branch": "main",
    "target_project_id": 46155864,
    "title": "Test Webhook",
    "updated_at": "2023-06-16 14:56:31 UTC",
    "url": "https://gitlab.com/getport-labs/datadog-service-dependency-example/-/merge_requests/1",
    "source": {
      "id": 46155864,
      "name": "Datadog Service Dependency Example",
      "default_branch": "main",
      "homepage": "https://gitlab.com/getport-labs/datadog-service-dependency-example",
      "url": "git@gitlab.com:getport-labs/datadog-service-dependency-example.git"
    },
    "target": {
      "id": 46155864,
      "name": "Datadog Service Dependency Example"
    },
    "last_commit": {
      "id": "8bca1b72fc7d18d77d3e48f8d3b332165ff94898",
      "message": "finalize docs\n",
      "title": "finalize docs",
      "timestamp": "2023-05-22T17:27:13+00:00",
      "url": "https://gitlab.com/getport-labs/datadog-service-dependency-example/-/commit/8bca1b72fc7d18d77d3e48f8d3b332165ff94898",
      "author": {
        "name": "username",
        "email": "user@domain.com"
      }
    },
    "assignee_ids": [6152768],
    "reviewer_ids": [],
    "labels": [
      {
        "id": 30672355,
        "title": "Infra",
        "color": "#dc143c",
        "project_id": 46155864,
        "created_at": "2023-06-16 14:56:03 UTC",
        "type": "ProjectLabel"
      }
    ],
    "state": "opened",
    "first_contribution": true,
    "action": "open"
  },
  "labels": [
    {
      "id": 30672355,
      "title": "Infra",
      "color": "#dc143c",
      "project_id": 46155864,
      "created_at": "2023-06-16 14:56:03 UTC",
      "type": "ProjectLabel"
    }
  ],
  "changes": {},
  "repository": {
    "name": "Datadog Service Dependency Example",
    "url": "git@gitlab.com:getport-labs/datadog-service-dependency-example.git",
    "homepage": "https://gitlab.com/getport-labs/datadog-service-dependency-example"
  },
  "assignees": [
    {
      "id": 6152768,
      "name": "Your Name",
      "username": "username",
      "avatar_url": "https://secure.gravatar.com/avatar/9df2ac1caa70b0a67ff0561f7d0363e5?s=80&d=identicon",
      "email": "[REDACTED]"
    }
  ]
}
```

</details>

### Mapping Result

The combination of the sample payload and the webhook configuration generates the following Port entity:

```json showLineNumbers
{
  "identifier": "231009949",
  "title": "231009949 - Test Webhook",
  "blueprint": "gitlabMergeRequest",
  "team": [],
  "properties": {
    "state": "opened",
    "description": "Testing webhook event data",
    "mergeStatus": "preparing",
    "lastChangeType": "open",
    "repositoryUrl": "https://gitlab.com/getport-labs/datadog-service-dependency-example",
    "sourceBranch": "webhook",
    "targetBranch": "main",
    "mergeRequestUrl": "https://gitlab.com/getport-labs/datadog-service-dependency-example/-/merge_requests/1",
    "lastCommitUrl": "https://gitlab.com/getport-labs/datadog-service-dependency-example/-/commit/8bca1b72fc7d18d77d3e48f8d3b332165ff94898",
    "projectName": "Datadog Service Dependency Example",
    "projectUrl": "https://gitlab.com/getport-labs/datadog-service-dependency-example",
    "labels": [
      {
        "id": 30672355,
        "title": "Infra",
        "color": "#dc143c",
        "project_id": 46155864,
        "created_at": "2023-06-16 14:56:03 UTC",
        "type": "ProjectLabel"
      }
    ]
  },
  "relations": {}
}
```
