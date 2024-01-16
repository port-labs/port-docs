---
sidebar_position: 2
description: Ingest Jira issue into your catalog
---

import JiraIssueBlueprint from "./resources/jira/\_example_jira_issue_blueprint.mdx";
import JiraIssueConfiguration from "./resources/jira/\_example_jira_issue_configuration.mdx";
import JiraIssueConfigurationPython from "./resources/jira/\_example_jira_issue_configuration_python.mdx";

# Jira

:::warning Ocean integration available
Ocean's [Jira integration](/build-your-software-catalog/sync-data-to-catalog/jira/jira.md) is simpler to use and provides more capabilities than the webhook, we recommend using it instead.  
Read more about Ocean [here](https://ocean.getport.io/).

If you'd still prefer to use the webhook, proceed with the instructions on this page.
:::

In this example you are going to create a webhook integration between [Jira](https://www.atlassian.com/software/jira) and Port, which will ingest Jira issue entities.

## Port configuration

Create the following blueprint definition:

<details>
<summary>Jira issue blueprint</summary>

<JiraIssueBlueprint/>

</details>

Create the following webhook configuration [using Port's UI](/build-your-software-catalog/sync-data-to-catalog/webhook/?operation=ui#configuring-webhook-endpoints)

<details>
<summary>Jira issue webhook configuration</summary>

1. **Basic details** tab - fill the following details:
   1. Title : `Jira mapper`;
   2. Identifier : `jira_mapper`;
   3. Description : `A webhook configuration to map Jira issues to Port`;
   4. Icon : `Jira`;
2. **Integration configuration** tab - fill the following JQ mapping:

   <JiraIssueConfiguration/>

3. Click **Save** at the bottom of the page.

</details>

## Create a webhook in Jira

1. Log in to Jira as a user with the Administer Jira global permission;
2. Click the gear icon at the top right corner;
3. Choose **System**;
4. At the bottom of the sidebar on the left, under **Advanced**, choose **WebHooks**;
5. Click on **Create a WebHook**
6. Input the following details:
   1. `Name` - use a meaningful name such as Port Webhook;
   2. `Status` - be sure to keep the webhook **Enabled**;
   3. `Webhook URL` - enter the value of the `url` key you received after creating the webhook configuration;
   4. `Description` - enter a description for the webhook;
   5. `Issue related events` - enter a JQL query in this section to filter the issues that get sent to the webhook (if you leave this field empty, all issues will trigger a webhook event);
   6. Under `Issue` - mark created, updated and delete;
7. Click **Create** at the bottom of the page.

:::tip
In order to view the different payloads and events available in Jira webhooks, [look here](https://developer.atlassian.com/server/jira/platform/webhooks/)
:::

Done! any change you make to an issue (open, close, edit, etc.) will trigger a webhook event that Jira will send to the webhook URL provided by Port. Port will parse the events according to the mapping and update the catalog entities accordingly.

## Let's Test It

This section includes a sample webhook event sent from Jira when an issue is created or updated. In addition, it includes the entity created from the event based on the webhook configuration provided in the previous section.

### Payload

Here is an example of the payload structure sent to the webhook URL when a Jira issue is created:

<details>
<summary> Webhook event payload</summary>

```json showLineNumbers
{
  "timestamp": 1686916266116,
  "webhookEvent": "jira:issue_created",
  "issue_event_type_name": "issue_created",
  "user": {
    "self": "https://account.atlassian.net/rest/api/2/user?accountId=557058%3A69f39959-769f-4dac-8a7a-46eb55b03723",
    "accountId": "557058%3A69f39959-769f-4dac-8a7a-46eb55b03723",
    "avatarUrls": {
      "48x48": "https://secure.gravatar.com/avatar/9df2ac1caa70b0a67ff0561f7d0363e5?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FIC-1.png"
    },
    "displayName": "Your Name",
    "active": true,
    "timeZone": "Europe/London",
    "accountType": "atlassian"
  },
  "issue": {
    "id": "10000",
    "self": "https://account.atlassian.net/rest/api/2/10000",
    "key": "PI-1",
    "fields": {
      "statuscategorychangedate": "2023-06-16T11:51:06.277+0000",
      "issuetype": {
        "self": "https://account.atlassian.net/rest/api/2/issuetype/10002",
        "id": "10002",
        "description": "Epics track collections of related bugs, stories, and tasks.",
        "iconUrl": "https://account.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10307?size=medium",
        "name": "Epic",
        "subtask": false,
        "avatarId": 10307,
        "entityId": "66c6d416-6eb4-4b38-92fa-9a7d68c64165",
        "hierarchyLevel": 1
      },
      "timespent": "None",
      "project": {
        "self": "https://account.atlassian.net/rest/api/2/project/10000",
        "id": "10000",
        "key": "PI",
        "name": "Port Integration",
        "projectTypeKey": "software",
        "simplified": true,
        "avatarUrls": {
          "48x48": "https://account.atlassian.net/rest/api/2/universal_avatar/view/type/project/avatar/10413"
        }
      },
      "fixVersions": [],
      "aggregatetimespent": "None",
      "resolution": "None",
      "resolutiondate": "None",
      "workratio": -1,
      "watches": {
        "self": "https://account.atlassian.net/rest/api/2/issue/PI-1/watchers",
        "watchCount": 0,
        "isWatching": false
      },
      "issuerestriction": {
        "issuerestrictions": {},
        "shouldDisplay": true
      },
      "lastViewed": "None",
      "created": "2023-06-16T11:51:05.291+0000",
      "priority": {
        "self": "https://account.atlassian.net/rest/api/2/priority/3",
        "iconUrl": "https://account.atlassian.net/images/icons/priorities/medium.svg",
        "name": "Medium",
        "id": "3"
      },
      "labels": ["cloud", "infra"],
      "issuelinks": [],
      "assignee": {
        "self": "https://account.atlassian.net/rest/api/2/user?accountId=557058%3A69f39947-769f-4dac-8a7a-46eb55b03705",
        "accountId": "557058:69f39947-769f-4dac-8a7a-46eb55b03705",
        "avatarUrls": {
          "48x48": "https://secure.gravatar.com/avatar/9df2ac1caa70b0a67ff0561f7d0363e5?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FIC-1.png"
        },
        "displayName": "Your Name",
        "active": true,
        "timeZone": "Europe/London",
        "accountType": "atlassian"
      },
      "updated": "2023-06-16T11:51:05.291+0000",
      "status": {
        "self": "https://account.atlassian.net/rest/api/2/status/10000",
        "description": "",
        "iconUrl": "https://account.atlassian.net/",
        "name": "To Do",
        "id": "10000",
        "statusCategory": {
          "self": "https://account.atlassian.net/rest/api/2/statuscategory/2",
          "id": 2,
          "key": "new",
          "colorName": "blue-gray",
          "name": "New"
        }
      },
      "components": [],
      "timeoriginalestimate": "None",
      "description": "We need to migrate our current infrastructure from in-house to the cloud",
      "attachment": [],
      "summary": "Migrate Infra to Cloud",
      "creator": {
        "self": "https://account.atlassian.net/rest/api/2/user?accountId=557058%3A69f39947-769f-4dac-8a7a-46eb55b03705",
        "accountId": "557058:69f39947-769f-4dac-8a7a-46eb55b03705",
        "avatarUrls": {
          "48x48": "https://secure.gravatar.com/avatar/9df2ac1caa70b0a67ff0561f7d0363e5?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FIC-1.png"
        },
        "displayName": "Your Name",
        "active": true,
        "timeZone": "Europe/London",
        "accountType": "atlassian"
      },
      "subtasks": [],
      "reporter": {
        "self": "https://account.atlassian.net/rest/api/2/user?accountId=557058%3A69f39947-769f-4dac-8a7a-46eb55b03705",
        "accountId": "557058:69f39947-769f-4dac-8a7a-46eb55b03705",
        "avatarUrls": {
          "48x48": "https://secure.gravatar.com/avatar/9df2ac1caa70b0a67ff0561f7d0363e5?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FIC-1.png"
        },
        "displayName": "Your Name",
        "active": true,
        "timeZone": "Europe/London",
        "accountType": "atlassian"
      },
      "aggregateprogress": {
        "progress": 0,
        "total": 0
      },
      "environment": "None",
      "duedate": "2023-06-19",
      "progress": {
        "progress": 0,
        "total": 0
      },
      "votes": {
        "self": "https://account.atlassian.net/rest/api/2/issue/PI-1/votes",
        "votes": 0,
        "hasVoted": false
      }
    }
  },
  "changelog": {
    "id": "10001",
    "items": [
      {
        "field": "status",
        "fieldtype": "jira",
        "fieldId": "status",
        "from": "10000",
        "fromString": "To Do",
        "to": "10001",
        "toString": "In Progress"
      }
    ]
  }
}
```

</details>

### Mapping Result

The combination of the sample payload and the webhook configuration generates the following Port entity:

```json showLineNumbers
{
  "identifier": "PI-1",
  "title": "PI-1 - Migrate Infra to Cloud",
  "blueprint": "jiraIssue",
  "properties": {
    "summary": "Migrate Infra to Cloud",
    "description": "We need to migrate our current infrastructure from in-house to the cloud",
    "status": "To Do",
    "lastChangeType": "issue_created",
    "changingUser": "Your Name",
    "issueUrl": "https://account.atlassian.net/browse/PI-1",
    "issueType": "Epic"
  },
  "relations": {}
}
```

## Import Jira Historical Issues

In this example you are going to use the provided Python script to fetch data from the Jira API and ingest it to Port.

### Prerequisites

This example utilizes the same [blueprint and webhook](#prerequisites) definition from the previous section.

In addition, it requires a Jira API token that is provided as a parameter to the Python script

#### Create the Jira API token

1. Log in to your [Jira account](https://id.atlassian.com/manage-profile/security/api-tokens);
2. Click Create API token;
3. From the dialog that appears, enter a memorable and concise Label for your token and click **Create**;
4. Click **Copy** to copy the token to your clipboard, you will not have another opportunity to view the token value after you leave this page;

Use the following Python script to ingest historical Jira issues into port:

<details>
<summary>Jira Python script for historical issues</summary>

<JiraIssueConfigurationPython/>

:::note

The script requires the following environment variables:

- `PORT_URL` - the webhook URL generated by Port after creating the webhook configuration;
- `JIRA_SERVER` - your Jira domain, for example `https://{YOUR_DOMAIN}.atlassian.net`;
- `USERNAMES` - your Jira username;
- `API_TOKEN` - your Jira [API token](../examples/jira#create-the-jira-api-token).

:::

</details>

Done! you can now import historical issues from Jira into Port. Port will parse the issues according to the mapping and update the catalog entities accordingly.
