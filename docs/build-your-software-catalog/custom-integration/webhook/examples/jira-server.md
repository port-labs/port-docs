---
sidebar_position: 3
description: Ingest Jira Server projects and issues into your catalog
---

import JiraProjectBlueprint from "./resources/jira-server/\_example_jira_project_blueprint.mdx";
import JiraIssueBlueprint from "./resources/jira-server/\_example_jira_issue_blueprint.mdx";
import JiraWebhookConfiguration from "./resources/jira-server/\_example_jira_webhook_configuration.mdx";
import JiraServerConfigurationPython from "./resources/jira-server/\_example_jira_server_configuration_python.mdx";

# Jira (Self-Hosted)

In this example you are going to create a webhook integration between your Jira Server and Port. The integration will facilitate the ingestion of Jira project and issue entities into Port.

## Port configuration

Create the following blueprint definitions:

<details>
<summary>Jira project blueprint</summary>

<JiraProjectBlueprint/>

</details>

<details>
<summary>Jira issue blueprint</summary>

<JiraIssueBlueprint/>

</details>

:::tip Blueprint Properties
You may modify the properties in your blueprints depending on what you want to track in your Jira projects and issues.
:::

Create the following webhook configuration [using Port's UI](/build-your-software-catalog/custom-integration/webhook/?operation=ui#configuring-webhook-endpoints)

<details>
<summary>Jira webhook configuration</summary>

1. **Basic details** tab - fill the following details:
   1. Title : `Jira mapper`;
   2. Identifier : `jira_mapper`;
   3. Description : `A webhook configuration to map Jira projects and issues to Port`;
   4. Icon : `Jira`;
2. **Integration configuration** tab - fill the following JQ mapping:

   <JiraWebhookConfiguration/>
    :::note
    Take note of, and copy the Webhook URL that is provided in this tab
    :::

3. Click **Save** at the bottom of the page.

</details>

## Create a webhook in Jira

1. Log in to Jira as a user with the Administer global permission;
2. Click the gear icon at the top right corner;
3. Choose **System**;
4. At the bottom of the sidebar on the left, under **Advanced**, choose **WebHooks**;
5. Click on **Create a WebHook**
6. Input the following details:
   1. `Name` - use a meaningful name such as Port Webhook;
   2. `Status` - be sure to keep the webhook **Enabled**;
   3. `Webhook URL` - enter the value of the `url` key you received after creating the webhook configuration in Port;
   4. `Description` - enter a description for the webhook;
   5. `Issue related events` - enter a JQL query in this section to filter the issues that get sent to the webhook (if you leave this field empty, all issues will trigger a webhook event);
   6. Under `Issue` - mark created, updated and delete;
   7. Under the `Project related events` section, go to `Projects` and mark created, updated and deleted;
7. Click **Create** at the bottom of the page.

:::tip
In order to view the different payloads and events available in Jira webhooks, [look here](https://developer.atlassian.com/server/jira/platform/webhooks/)
:::

Done! any change you make to a project or an issue (open, close, edit, etc.) will trigger a webhook event that Jira will send to the webhook URL provided by Port. Port will parse the events according to the mapping and update the catalog entities accordingly.

## Let's Test It

This section includes a sample webhook event sent from Jira when an issue is created or updated. In addition, it includes the entity created from the event based on the webhook configuration provided in the previous section.

### Payload

Here is an example of the payload structure sent to the webhook URL when a Jira issue is created:

<details>
<summary> Webhook event payload</summary>

```json showLineNumbers
{
  "timestamp": 1702992455854,
  "webhookEvent": "jira:issue_updated",
  "issue_event_type_name": "issue_updated",
  "user": {
    "self": "https://jira.yourdomain.com/rest/api/2/user?username=youruser",
    "name": "youruser",
    "key": "JIRAUSER10000",
    "emailAddress": "youruser@email.com",
    "avatarUrls": {
      "48x48": "https://www.gravatar.com/avatar/73b83eb1f16580bfe2bfccf81fcb1870?d=mm&s=48",
      "24x24": "https://www.gravatar.com/avatar/73b83eb1f16580bfe2bfccf81fcb1870?d=mm&s=24",
      "16x16": "https://www.gravatar.com/avatar/73b83eb1f16580bfe2bfccf81fcb1870?d=mm&s=16",
      "32x32": "https://www.gravatar.com/avatar/73b83eb1f16580bfe2bfccf81fcb1870?d=mm&s=32"
    },
    "displayName": "My User",
    "active": true,
    "timeZone": "Etc/UTC"
  },
  "issue": {
    "id": "10303",
    "self": "https://jira.yourdomain.com/rest/api/2/issue/10303",
    "key": "BSD-6",
    "fields": {
      "issuetype": {
        "self": "https://jira.yourdomain.com/rest/api/2/issuetype/10002",
        "id": "10002",
        "description": "Created by Jira Software - do not edit or delete. Issue type for a user story.",
        "iconUrl": "https://jira.yourdomain.com/images/icons/issuetypes/story.svg",
        "name": "Story",
        "subtask": false
      },
      "timespent": null,
      "project": {
        "self": "https://jira.yourdomain.com/rest/api/2/project/10001",
        "id": "10001",
        "key": "BSD",
        "name": "Basic Soft Dev",
        "projectTypeKey": "software",
        "avatarUrls": {
          "48x48": "https://jira.yourdomain.com/secure/projectavatar?avatarId=10324",
          "24x24": "https://jira.yourdomain.com/secure/projectavatar?size=small&avatarId=10324",
          "16x16": "https://jira.yourdomain.com/secure/projectavatar?size=xsmall&avatarId=10324",
          "32x32": "https://jira.yourdomain.com/secure/projectavatar?size=medium&avatarId=10324"
        }
      },
      "fixVersions": [],
      "customfield_10110": null,
      "customfield_10111": null,
      "aggregatetimespent": null,
      "resolution": null,
      "customfield_10106": null,
      "customfield_10107": null,
      "customfield_10108": null,
      "customfield_10109": null,
      "resolutiondate": null,
      "workratio": -1,
      "lastViewed": "2023-12-19T13:27:14.538+0000",
      "watches": {
        "self": "https://jira.yourdomain.com/rest/api/2/issue/BSD-6/watchers",
        "watchCount": 1,
        "isWatching": true
      },
      "created": "2023-12-19T12:14:34.524+0000",
      "priority": {
        "self": "https://jira.yourdomain.com/rest/api/2/priority/3",
        "iconUrl": "https://jira.yourdomain.com/images/icons/priorities/medium.svg",
        "name": "Medium",
        "id": "3"
      },
      "customfield_10100": "0|i001av:",
      "customfield_10101": null,
      "customfield_10102": null,
      "labels": [],
      "timeestimate": null,
      "aggregatetimeoriginalestimate": null,
      "versions": [],
      "issuelinks": [],
      "assignee": {
        "self": "https://jira.yourdomain.com/rest/api/2/user?username=janedoe",
        "name": "janedoe",
        "key": "JIRAUSER10001",
        "emailAddress": "noreplay@example.com",
        "avatarUrls": {
          "48x48": "https://www.gravatar.com/avatar/c567e3a76e53c7bd7d2dda08af2122e3?d=mm&s=48",
          "24x24": "https://www.gravatar.com/avatar/c567e3a76e53c7bd7d2dda08af2122e3?d=mm&s=24",
          "16x16": "https://www.gravatar.com/avatar/c567e3a76e53c7bd7d2dda08af2122e3?d=mm&s=16",
          "32x32": "https://www.gravatar.com/avatar/c567e3a76e53c7bd7d2dda08af2122e3?d=mm&s=32"
        },
        "displayName": "Jane Doe",
        "active": true,
        "timeZone": "Etc/UTC"
      },
      "updated": "2023-12-19T13:27:35.853+0000",
      "status": {
        "self": "https://jira.yourdomain.com/rest/api/2/status/10003",
        "description": "",
        "iconUrl": "https://jira.yourdomain.com/",
        "name": "To Do",
        "id": "10003",
        "statusCategory": {
          "self": "https://jira.yourdomain.com/rest/api/2/statuscategory/2",
          "id": 2,
          "key": "new",
          "colorName": "default",
          "name": "To Do"
        }
      },
      "components": [],
      "timeoriginalestimate": null,
      "description": "Be able to login on the app",
      "timetracking": {},
      "archiveddate": null,
      "attachment": [],
      "aggregatetimeestimate": null,
      "summary": "As a user, I want to login",
      "creator": {
        "self": "https://jira.yourdomain.com/rest/api/2/user?username=youruser",
        "name": "youruser",
        "key": "JIRAUSER10000",
        "emailAddress": "youruser@email.com",
        "avatarUrls": {
          "48x48": "https://www.gravatar.com/avatar/73b83eb1f16580bfe2bfccf81fcb1870?d=mm&s=48",
          "24x24": "https://www.gravatar.com/avatar/73b83eb1f16580bfe2bfccf81fcb1870?d=mm&s=24",
          "16x16": "https://www.gravatar.com/avatar/73b83eb1f16580bfe2bfccf81fcb1870?d=mm&s=16",
          "32x32": "https://www.gravatar.com/avatar/73b83eb1f16580bfe2bfccf81fcb1870?d=mm&s=32"
        },
        "displayName": "My User",
        "active": true,
        "timeZone": "Etc/UTC"
      },
      "subtasks": [],
      "reporter": {
        "self": "https://jira.yourdomain.com/rest/api/2/user?username=johndoe",
        "name": "johndoe",
        "key": "JIRAUSER10002",
        "emailAddress": "noreplay@example.com",
        "avatarUrls": {
          "48x48": "https://www.gravatar.com/avatar/c567e3a76e53c7bd7d2dda08af2122e3?d=mm&s=48",
          "24x24": "https://www.gravatar.com/avatar/c567e3a76e53c7bd7d2dda08af2122e3?d=mm&s=24",
          "16x16": "https://www.gravatar.com/avatar/c567e3a76e53c7bd7d2dda08af2122e3?d=mm&s=16",
          "32x32": "https://www.gravatar.com/avatar/c567e3a76e53c7bd7d2dda08af2122e3?d=mm&s=32"
        },
        "displayName": "John Doe",
        "active": true,
        "timeZone": "Etc/UTC"
      },
      "customfield_10000": "{summaryBean=com.atlassian.jira.plugin.devstatus.rest.SummaryBean@5bedd466[summary={pullrequest=com.atlassian.jira.plugin.devstatus.rest.SummaryItemBean@49d7365c[overall=PullRequestOverallBean{stateCount=0, state='OPEN', details=PullRequestOverallDetails{openCount=0, mergedCount=0, declinedCount=0}},byInstanceType={}], build=com.atlassian.jira.plugin.devstatus.rest.SummaryItemBean@fb742a[overall=com.atlassian.jira.plugin.devstatus.summary.beans.BuildOverallBean@706ec7bf[failedBuildCount=0,successfulBuildCount=0,unknownBuildCount=0,count=0,lastUpdated=<null>,lastUpdatedTimestamp=<null>],byInstanceType={}], review=com.atlassian.jira.plugin.devstatus.rest.SummaryItemBean@1bf5dc7[overall=com.atlassian.jira.plugin.devstatus.summary.beans.ReviewsOverallBean@324c9570[stateCount=0,state=<null>,dueDate=<null>,overDue=false,count=0,lastUpdated=<null>,lastUpdatedTimestamp=<null>],byInstanceType={}], deployment-environment=com.atlassian.jira.plugin.devstatus.rest.SummaryItemBean@69cdfd37[overall=com.atlassian.jira.plugin.devstatus.summary.beans.DeploymentOverallBean@6f189c8e[topEnvironments=[],showProjects=false,successfulCount=0,count=0,lastUpdated=<null>,lastUpdatedTimestamp=<null>],byInstanceType={}], repository=com.atlassian.jira.plugin.devstatus.rest.SummaryItemBean@14b2b5cf[overall=com.atlassian.jira.plugin.devstatus.summary.beans.CommitOverallBean@4283453c[count=0,lastUpdated=<null>,lastUpdatedTimestamp=<null>],byInstanceType={}], branch=com.atlassian.jira.plugin.devstatus.rest.SummaryItemBean@44a13c1e[overall=com.atlassian.jira.plugin.devstatus.summary.beans.BranchOverallBean@6f7634e8[count=0,lastUpdated=<null>,lastUpdatedTimestamp=<null>],byInstanceType={}]},errors=[],configErrors=[]], devSummaryJson={\"cachedValue\":{\"errors\":[],\"configErrors\":[],\"summary\":{\"pullrequest\":{\"overall\":{\"count\":0,\"lastUpdated\":null,\"stateCount\":0,\"state\":\"OPEN\",\"details\":{\"openCount\":0,\"mergedCount\":0,\"declinedCount\":0,\"total\":0},\"open\":true},\"byInstanceType\":{}},\"build\":{\"overall\":{\"count\":0,\"lastUpdated\":null,\"failedBuildCount\":0,\"successfulBuildCount\":0,\"unknownBuildCount\":0},\"byInstanceType\":{}},\"review\":{\"overall\":{\"count\":0,\"lastUpdated\":null,\"stateCount\":0,\"state\":null,\"dueDate\":null,\"overDue\":false,\"completed\":false},\"byInstanceType\":{}},\"deployment-environment\":{\"overall\":{\"count\":0,\"lastUpdated\":null,\"topEnvironments\":[],\"showProjects\":false,\"successfulCount\":0},\"byInstanceType\":{}},\"repository\":{\"overall\":{\"count\":0,\"lastUpdated\":null},\"byInstanceType\":{}},\"branch\":{\"overall\":{\"count\":0,\"lastUpdated\":null},\"byInstanceType\":{}}}},\"isStale\":false}}",
      "aggregateprogress": {
        "progress": 0,
        "total": 0
      },
      "environment": null,
      "duedate": null,
      "progress": {
        "progress": 0,
        "total": 0
      },
      "comment": {
        "comments": [],
        "maxResults": 0,
        "total": 0,
        "startAt": 0
      },
      "votes": {
        "self": "https://jira.yourdomain.com/rest/api/2/issue/BSD-6/votes",
        "votes": 0,
        "hasVoted": false
      },
      "worklog": {
        "startAt": 0,
        "maxResults": 20,
        "total": 0,
        "worklogs": []
      },
      "archivedby": null
    }
  },
  "changelog": {
    "id": "10407",
    "items": [
      {
        "field": "description",
        "fieldtype": "jira",
        "from": null,
        "fromString": null,
        "to": null,
        "toString": "Be able to login on the app"
      }
    ]
  }
}
```

</details>

### Mapping Result

```json showLineNumbers
{
  "identifier": "BSD-6",
  "title": "As a user, I want to login",
  "blueprint": "jiraIssue",
  "properties": {
    "url": "https://jira.yourdomain.com/rest/api/2/issue/10303",
    "status": "To Do",
    "assignee": "janedoe",
    "issueType": "Story",
    "reporter": "johndoe",
    "priority": "Medium",
    "creator": "youruser"
  },
  "relations": {
    "project": "BSD",
    "parentIssue": null,
    "subtasks": []
  },
  "filter": true
}
```

## Import Jira Historical Issues

In this example you are going to use the provided Python script to fetch data from the Jira Server API and ingest it to Port.

### Prerequisites

This example utilizes the same [blueprint and webhook](#port-configuration) definition from the previous section.

In addition, you require the following environment variables:

- `PORT_CLIENT_ID` - Your Port client id
- `PORT_CLIENT_SECRET` - Your Port client secret
- `JIRA_API_URL` - Your Jira server host such as `https://jira.yourdomain.com`
- `JIRA_USERNAME` - Your Jira username to use when accessing the Jira Software (Server) resources
- `JIRA_PASSWORD` - Your Jira account password or token to use when accessing the Jira resources

:::info
Find your Port credentials using this [guide](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)
:::

Use the following Python script to ingest historical Jira issues into port:

<details>
<summary>Jira Python script for historical issues</summary>

<JiraServerConfigurationPython/>

</details>

Done! you can now import historical issues from Jira into Port. Port will parse the issues according to the mapping and update the catalog entities accordingly.
