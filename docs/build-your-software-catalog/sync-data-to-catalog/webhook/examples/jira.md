---
sidebar_position: 2
description: Ingest Jira issue into your catalog
---

import JiraIssueBlueprint from "./resources/jira/\_example_jira_issue_blueprint.mdx";
import JiraIssueConfiguration from "./resources/jira/\_example_jira_issue_configuration.mdx";
import JiraIssueConfigurationPython from "./resources/jira/\_example_jira_issue_configuration_python.mdx";

# Jira

In this example you are going to create a webhook integration between [Jira](https://www.atlassian.com/software/jira) and Port, which will ingest Jira issue entities.

## Import Jira Issues

### Prerequisites

Create the following blueprint definition and webhook configuration:

<details>
<summary>Jira issue blueprint</summary>

<JiraIssueBlueprint/>

</details>

<details>
<summary>Jira issue webhook configuration</summary>

<JiraIssueConfiguration/>

</details>

### Create the Jira webhook

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

:::tip
In order to view the different payloads and events available in Jira webhooks, [look here](https://developer.atlassian.com/server/jira/platform/webhooks/)
:::

Done! any change you make to an issue (open, close, edit, etc.) will trigger a webhook event that Jira will send to the webhook URL provided by Port. Port will parse the events according to the mapping and update the catalog entities accordingly.

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
5. Encode the token along with your Jira username using Base64:
   1. Linux/Unix/MacOS
      ```shell showLineNumbers
      echo -n user@example.com:api_token_string | base64
      ```
   2. Windows 7 and later, using Microsoft Powershell:
      ```powershell showLineNumbers
      $Text = ‘user@example.com:api_token_string’
      $Bytes = [System.Text.Encoding]::UTF8.GetBytes($Text)
      $EncodedText = [Convert]::ToBase64String($Bytes)
      $EncodedText
      ```
6. Update `auth_string` variable in the Python script with the generated Base64 key

Use the following Python script to ingest historical Jira issues into port:

<details>
<summary>Jira Python script for historical issues</summary>

Remember to update the `WEBHOOK_URL` with the value of the `url` key you received after creating the webhook configuration.

<JiraIssueConfigurationPython/>

</details>

:::tip
The script writes the JSON payload for issues to a file named `output.json`. This can be useful for debugging if you encounter any issues.
:::

Done! you can now import historical issues from Jira into Port. Port will parse the issues according to the mapping and update the catalog entities accordingly.
