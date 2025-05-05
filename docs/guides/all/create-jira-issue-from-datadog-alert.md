---
displayed_sidebar: null
description: Learn how to automatically create Jira issues from Datadog alert in Port, ensuring prompt issue resolution and improving overall platform reliability.
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Automatically create Jira Issue from Datadog alert

This guide demonstrates how to implement an automated process in Port that creates a Jira issue from a Datadog alert.  
This automation streamlines prompt incident resolution and improves overall platform reliability.

## Use cases
- Automatically create Jira issues from Datadog alerts.
- Track and follow up on incidents from monitoring systems.

## Prerequisites

- Complete the [onboarding process](/getting-started/overview).
- Access to your Jira organization with permissions to create issues.
- [Port's Datadog integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/apm-alerting/datadog/) needs to be installed.
- [Jira API token](https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/) with permissions to create new issues.

## Set up data model

For this guide, we will use the data model provided by the [Port Datadog integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/apm-alerting/datadog/).

If you haven’t installed the Datadog integration yet, head over to the [integration installation page](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/apm-alerting/datadog/) to install it. This will automatically set up the relevant blueprints for you.


## Set up automation

With the integration installed and Datadog alerts ingested into Port, we’ll now set up an automation that is triggered when a `Datadog Alert` priority changes to high or critical. Alert priorities in Datadog are indicated by integer values from 1 (critical) to 5 (low). This automation will create a Jira issue using the details of the alert.

Follow the steps below to configure the automation:

<h3>Add Port secrets</h3>

To add these secrets to your portal:

1. Click on the `...` button in the top right corner of your Port application.

2. Click on **Credentials**.

3. Click on the `Secrets` tab.

4. Click on `+ Secret` and add the following secret:
    - `JIRA_AUTH` - Base64 encoded string of your Jira credentials. Generate this by running:
        ```bash
        echo -n "your-email@domain.com:your-api-token" | base64
        ```
        Replace `your-email@domain.com` with your Jira email and `your-api-token` with your Jira API token.

        :::info One time generation
        The base64 encoded string only needs to be generated once and will work for all webhook calls until you change your API token.
        :::

<h3>Automation backend</h3>

1. Head to the [automation](https://app.getport.io/settings/automations) page.
2. Click on the `+ Automation` button.
3. Copy and paste the following JSON configuration into the editor:

    <details>
    <summary><b>Create Jira issue from Datadog alert automation (Click to expand)</b></summary>

    :::tip Placeholde replacement
    Replace `<JIRA_ORGANIZATION_URL>` in the webhook URL with your Jira organization URL (e.g., `example.atlassian.net`).
    
    Replace `<JIRA_PROJECT_NAME>` in the webhook body with your Jira project name.

    :::

    ```json showLineNumbers
    {
        "identifier": "createJiraIssueFromDatadogAlert",
        "title": "Create Jira Issue from Datadog Alert",
        "description": "Automation to open a Jira issue when a Datadog alert changes from medium to higher priority",
        "trigger": {
            "type": "automation",
            "event": {
            "type": "ENTITY_UPDATED",
            "blueprintIdentifier": "datadogMonitor"
            },
            "condition": {
            "type": "JQ",
            "expressions": [
                ".diff.before.properties.priority | tonumber >= 3",
                ".diff.after.properties.priority | tonumber < 3"
            ],
            "combinator": "and"
            }
        },
        "invocationMethod": {
            "type": "WEBHOOK",
            "url": "https://<JIRA_ORGANIZATION_URL>/rest/api/3/issue",
            "agent": false,
            "synchronized": true,
            "method": "POST",
            "headers": {
            "Authorization": "Basic {{.secrets.JIRA_AUTH}}",
            "Content-Type": "application/json"
            },
            "body": {
            "fields": {
                "project": {
                "key": "<JIRA_PROJECT_NAME>"
                },
                "summary": "Datadog Alert: {{.event.diff.after.title}}",
                "description": {
                "version": 1,
                "type": "doc",
                "content": [
                    {
                    "type": "paragraph",
                    "content": [
                        {
                        "type": "text",
                        "text": "Priority",
                        "marks": [
                            {
                            "type": "strong"
                            }
                        ]
                        },
                        {
                        "type": "text",
                        "text": ": {{.event.diff.after.properties.priority}}"
                        }
                    ]
                    },
                    {
                    "type": "paragraph",
                    "content": [
                        {
                        "type": "text",
                        "text": "Monitory Type",
                        "marks": [
                            {
                            "type": "strong"
                            }
                        ]
                        },
                        {
                        "type": "text",
                        "text": ": {{.event.diff.after.properties.monitorType}}"
                        }
                    ]
                    },
                    {
                    "type": "paragraph",
                    "content": [
                        {
                        "type": "text",
                        "text": "Overall State",
                        "marks": [
                            {
                            "type": "strong"
                            }
                        ]
                        },
                        {
                        "type": "text",
                        "text": ": {{.event.diff.after.properties.overallState}}"
                        }
                    ]
                    },
                    {
                    "type": "paragraph",
                    "content": [
                        {
                        "type": "text",
                        "text": "Thresholds",
                        "marks": [
                            {
                            "type": "strong"
                            }
                        ]
                        },
                        {
                        "type": "text",
                        "text": ": {{.event.diff.after.properties.thresholds}}"
                        }
                    ]
                    },
                    {
                    "type": "paragraph",
                    "content": [
                        {
                        "type": "text",
                        "text": "Tags",
                        "marks": [
                            {
                            "type": "strong"
                            }
                        ]
                        },
                        {
                        "type": "text",
                        "text": ": {{.event.diff.after.properties.tags}}"
                        }
                    ]
                    },
                    {
                    "type": "paragraph",
                    "content": [
                        {
                        "type": "text",
                        "text": "Created By",
                        "marks": [
                            {
                            "type": "strong"
                            }
                        ]
                        },
                        {
                        "type": "text",
                        "text": ": {{.event.diff.after.properties.createdBy}}"
                        }
                    ]
                    },
                    {
                    "type": "paragraph",
                    "content": [
                        {
                        "type": "text",
                        "text": "Created At",
                        "marks": [
                            {
                            "type": "strong"
                            }
                        ]
                        },
                        {
                        "type": "text",
                        "text": ": {{.event.diff.after.properties.createdAt}}"
                        }
                    ]
                    },
                    {
                    "type": "paragraph",
                    "content": [
                        {
                        "type": "text",
                        "text": "Updated At",
                        "marks": [
                            {
                            "type": "strong"
                            }
                        ]
                        },
                        {
                        "type": "text",
                        "text": ": {{.event.diff.after.properties.updatedAt}}"
                        }
                    ]
                    }
                ]
                },
                "issuetype": {
                "name": "Bug"
                },
                "labels": [
                "datadog"
                ]
            }
            }
        },
        "publish": true
    }
    ```
    </details>

4. Click `Save`.

Now, every time a `Datadog Alert` priority is raised to high or critical (i.e., moves from 3, 4, or 5 to 1 or 2), a Jira issue like the one below will be created:

<img src="/img/guides/datadogAlertJiraIssue.png" width="600px" border="1px" />
