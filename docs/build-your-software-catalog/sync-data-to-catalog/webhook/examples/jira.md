---
sidebar_position: 3
description: Ingest Jira issue into your catalog
---

import JiraIssueBlueprint from "./resources/jira/\_example_jira_issue_blueprint.mdx";
import JiraIssueConfiguration from "./resources/jira/\_example_jira_issue_configuration.mdx";

# Jira

In this example you are going to create a webhook integration between [Jira](https://www.atlassian.com/software/jira) and Port, which will ingest Jira issue entities.

## Prerequisites

Create the following blueprint definition and webhook configuration:

<details>
<summary>Jira issue blueprint</summary>

<JiraIssueBlueprint/>

</details>

<details>
<summary>Jira issue webhook configuration</summary>

<JiraIssueConfiguration/>

</details>

## Create the Jira webhook

1. Log in to Jira as a user with the Administer Jira global permission;
2. Click the gear icon at the top right corner;
3. Choose **System**;
4. At the bottom of the sidebar on the left, under **Avanced**, choose **WebHooks**;
5. Click on **Create a WebHook**
6. Input the following details:
   1. `Name` - use a meaningful name such as Port Webhook;
   2. `Status` - be sure to keep the webhook **Enabled**;
   3. `Webhook URL` - enter the value of the `url` key you received after creating the webhook configuration;
   4. `Description` - enter a description for the webhook;
   5. `Issue related events` - enter a JQL query in this section to filter the issues that get sent to the webhook (if you leave this field empty, all issues will trigger a webhook event);
   6. Under `Issue` - mark created, updated and delete;
7. Click **Create** at the bottom of the page.

Done! any change you make to an issue (open, close, edit, etc.) will trigger a webhook event that Jira will send to the webhook URL provided by Port. Port will parse the events according to the mapping and update the catalog entities accordingly.
