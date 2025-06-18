---
displayed_sidebar: null
description: Learn how to monitor and manage your Jira issues using dashboards and self-service actions in Port.
---

# Manage and visualize your Jira issues

This guide demonstrates how to bring your Jira issue management experience into Port. You will learn how to:

- Ingest Jira project and issue data into Port's software catalog using **Port's Jira** integration.
- Set up **self-service actions** to manage issues (create, change status, and add comments).
- Build **dashboards** in Port to monitor and act on issues.

<img src="/img/guides/jiraDashboard1.png" border="1px" width="100%" />
<img src="/img/guides/jiraDashboard2.png" border="1px" width="100%" />

## Common use cases

- Monitor the status and health of all Jira issues from a centralized dashboard.
- Empower teams to manage tickets and perform day-2 operations via self-service actions.
- Track high-priority bugs and their resolution progress.

## Prerequisites

This guide assumes the following:
- You have a Port account and have completed the [onboarding process](https://docs.port.io/getting-started/overview).
- Port's [Jira integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/project-management/jira/) is installed in your account.

## Set up self-service actions

We will create self-service actions in Port to directly interact with the Jira REST API. These actions let users:

1. Create a new issue.

2. Change an issue's status.

3. Add comments to an issue.

Each action will be configured via JSON and triggered using **synced webhooks** secured with secrets. To implement these use-cases, follow the steps below:

### Add Port secrets

To add a secret to your portal:

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

### Create a new issue

1. Go to the [Self-service](https://app.getport.io/self-serve) page of your portal.
2. Click on the `+ New Action` button.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration into the editor.

    <details>
    <summary><b>Create Jira issue action (Click to expand)</b></summary>

    :::tip Configure your Jira environment
    Replace `<JIRA_ORGANIZATION_URL>` in the webhook URL with your Jira organization URL (e.g., `example.atlassian.net`).
    :::

    ```json showLineNumbers
    {
      "identifier": "create_jira_issue",
      "title": "Create Jira Issue",
      "icon": "Jira",
      "description": "Create a new Jira issue in the specified project",
      "trigger": {
        "type": "self-service",
        "operation": "CREATE",
        "userInputs": {
          "properties": {
            "title": {
              "type": "string",
              "title": "Title"
            },
            "description": {
              "type": "string",
              "title": "Description"
            },
            "project": {
              "type": "string",
              "title": "Project",
              "blueprint": "jiraProject",
              "format": "entity"
            },
            "issue_type": {
              "type": "string",
              "title": "Issue Type",
              "default": "Task",
              "enum": [
                "Task",
                "Story",
                "Bug",
                "Epic"
              ],
              "enumColors": {
                "Task": "blue",
                "Story": "green",
                "Bug": "red",
                "Epic": "purple"
              }
            }
          },
          "required": [
            "title",
            "description",
            "project",
            "issue_type"
          ],
          "order": [
            "title",
            "description",
            "project",
            "issue_type"
          ]
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
              "key": "{{.inputs.project.identifier}}"
            },
            "summary": "{{.inputs.title}}",
            "description": {
              "version": 1,
              "type": "doc",
              "content": [
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "{{.inputs.description}}"
                    }
                  ]
                },
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Reported by: {{.trigger.by.user.email}}"
                    }
                  ]
                }
              ]
            },
            "issuetype": {
              "name": "{{.inputs.issue_type}}"
            },
            "labels": [
              "port-ssa"
            ]
          }
        }
      },
      "requiredApproval": false
    }
    ```
    </details>

5. Click `Save`.

Now you should see the `Create Jira Issue` action in the self-service page. 🎉


### Change issue status

1. Go to the [Self-service](https://app.getport.io/self-serve) page of your portal.
2. Click on the `+ New Action` button.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration into the editor.

    <details>
    <summary><b>Change Jira issue status action (Click to expand)</b></summary>

    :::tip Configure your Jira environment
    Replace `<JIRA_ORGANIZATION_URL>` in the webhook URL with your Jira organization URL (e.g., `example.atlassian.net`).
    :::

    ```json showLineNumbers
    {
      "identifier": "change_jira_issue_status",
      "title": "Change Issue Status",
      "icon": "Jira",
      "description": "Update a Jira ticket's status using a synced webhook",
      "trigger": {
        "type": "self-service",
        "operation": "DAY-2",
        "userInputs": {
          "properties": {
            "status": {
              "icon": "DefaultProperty",
              "title": "Status",
              "type": "string",
              "description": "Select the status to transition the issue to",
              "enum": [
                "To Do",
                "In Progress",
                "Done",
                "Code Review",
                "Product Review",
                "Waiting For Prod"
              ],
              "enumColors": {
                "To Do": "lightGray",
                "In Progress": "bronze",
                "Done": "green",
                "Code Review": "darkGray",
                "Product Review": "purple",
                "Waiting For Prod": "orange"
              }
            }
          },
          "required": [
            "status"
          ],
          "order": [
            "status"
          ]
        },
        "blueprintIdentifier": "jiraIssue"
      },
      "invocationMethod": {
        "type": "WEBHOOK",
        "url": "https://<JIRA_ORGANIZATION_URL>/rest/api/3/issue/{{.entity.identifier}}/transitions",
        "agent": false,
        "synchronized": true,
        "method": "POST",
        "headers": {
          "Authorization": "Basic {{.secrets.JIRA_AUTH}}",
          "Content-Type": "application/json"
        },
        "body": {
          "transition": {
            "{{ if .inputs.status == 'To Do' then 'id' else 'none' end }}": 11,
            "{{ if .inputs.status == 'In Progress' then 'id' else 'none' end }}": 21,
            "{{ if .inputs.status == 'Done' then 'id' else 'none' end }}": 31,
            "{{ if .inputs.status == 'Code Review' then 'id' else 'none' end }}": 41,
            "{{ if .inputs.status == 'Product Review' then 'id' else 'none' end }}": 51,
            "{{ if .inputs.status == 'Waiting For Prod' then 'id' else 'none' end }}": 61
          }
        }
      },
      "requiredApproval": false
    }
    ```
    </details>

5. Click `Save`.

Now you should see the `Change Issue Status` action in the self-service page. 🎉


### Add comment to issue

1. Go to the [Self-service](https://app.getport.io/self-serve) page of your portal.
2. Click on the `+ New Action` button.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration into the editor.

    <details>
    <summary><b>Add Jira issue comment action (Click to expand)</b></summary>

    :::tip Configure your Jira environment
    Replace `<JIRA_ORGANIZATION_URL>` in the webhook URL with your Jira organization URL (e.g., `example.atlassian.net`).
    :::

    ```json showLineNumbers
    {
      "identifier": "addCommentOnJiraIssue",
      "title": "Add Comment to Issue",
      "icon": "Jira",
      "description": "Add a comment to a Jira issue using a synced webhook",
      "trigger": {
        "type": "self-service",
        "operation": "DAY-2",
        "userInputs": {
          "properties": {
            "comment": {
              "icon": "DefaultProperty",
              "title": "Comment",
              "type": "string",
              "description": "Enter the comment to add to the Jira issue"
            }
          },
          "required": [
            "comment"
          ],
          "order": [
            "comment"
          ]
        },
        "blueprintIdentifier": "jiraIssue"
      },
      "invocationMethod": {
        "type": "WEBHOOK",
        "url": "https://<JIRA_ORGANIZATION_URL>/rest/api/3/issue/{{.entity.identifier}}/comment",
        "agent": false,
        "synchronized": true,
        "method": "POST",
        "headers": {
          "Authorization": "Basic {{.secrets.JIRA_AUTH}}",
          "Content-Type": "application/json"
        },
        "body": {
          "body": {
            "type": "doc",
            "version": 1,
            "content": [
              {
                "type": "paragraph",
                "content": [
                  {
                    "type": "text",
                    "text": "{{.inputs.comment}}"
                  }
                ]
              }
            ]
          }
        }
      },
      "requiredApproval": false
    }
    ```
    </details>

5. Click `Save`.

Now you should see the `Add Comment to Issue` action in the self-service page. 🎉


## Visualize metrics

With issues ingested and actions configured, the next step is building a dashboard to monitor Jira data directly in Port. We can visualize tickets by status, track them over time, and monitor high-priority bugs using customizable widgets.


### Create a dashboard

1. Navigate to the [Catalog](https://app.getport.io/organization/catalog) page of your portal.
2. Click on the **`+ New`** button in the left sidebar.
3. Select **New dashboard**.
4. Name the dashboard **Jira Issue Management**.
5. Input `Create, view and manage your Jira issues` under **Description**.
6. Select the `Jira` icon.
7. Click `Create`.

We now have a blank dashboard where we can start adding widgets to visualize insights from our Jira issues.


### Add widgets

In the new dashboard, create the following widgets:

<details>
<summary><b>Issues over time (click to expand)</b></summary>

1. Click `+ Widget` and select **Line Chart**.
2. Title: `Issues over time`, (add the `LineChart` icon).
3. Select `Count Entities (All Entities)` **Chart type** and choose **Jira Issue** as the **Blueprint**.
4. Input `Number of issues` as the **Y axis Title**.
5. Set `count` as the **Function**.
6. Input `Date` as the **X axis** **Title** and choose `created` as the **Measure time by**.
7. Set **Time Interval** to `Week` and **Time Range** to `In the past 90 days`.
8. Click `Save`.

</details>

<details>
<summary><b>Issues by status (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Pie chart**.
2. Title: `Issues by status` (add the `Jira` icon).
3. Choose the **Jira Issue** blueprint.
4. Under `Breakdown by property`, select the **Status** property.
5. Click **Save**.

</details>

<details>
<summary><b>High priority bugs (click to expand)</b></summary>

1. Click `+ Widget` and select **Number Chart**.
2. Title: `High priority bugs` (add the `Jira` icon).
3. Select `Count entities` **Chart type** and choose **Jira Issue** as the **Blueprint**.
4. Select `count` for the **Function**.
5. Add this JSON to the **Additional filters** editor to filter high priority bugs:
    ```json showLineNumbers
    [
        {
            "combinator":"and",
            "rules":[
                {
                    "property":"issueType",
                    "operator":"=",
                    "value": "Bug"
                },
                {
                    "property":"priority",
                    "operator":"=",
                    "value": "High"
                },
                {
                    "property":"status",
                    "operator":"!=",
                    "value": "Done"
                }
            ]
        }
    ]
    ```
6. Select `custom` as the **Unit** and input `bugs` as the **Custom unit**.
7. Click `Save`.

</details>

<details>
<summary><b>Create issue action (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Action card**.
2. Choose the **Create Jira Issue** action we created in this guide.
3. Click **Save**.

</details>

<details>
<summary><b>All ongoing issues (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Table**.
2. Title the widget **All Ongoing Issues**.
3. Choose the **Jira Issue** blueprint.
4. Add this JSON to the **Additional filters** editor to show only ongoing issues:
    ```json showLineNumbers
    [
        {
            "combinator":"and",
            "rules":[
                {
                    "property":"status",
                    "operator":"!=",
                    "value": "Done"
                }
            ]
        }
    ]
    ```
5. Click **Save** to add the widget to the dashboard.
6. Click on the **`...`** button in the top right corner of the table and select **Customize table**.
7. In the top right corner of the table, click on `Manage Properties` and add the following properties:
    - **Status**: The current status of the issue.
    - **Assignee**: The assignee of the issue.
    - **Priority**: The issue priority.
    - **Issue Type**: The type of issue (Bug, Task, Story, etc.).
    - **Created**: The date the issue was created.
    - **Project**: The related Jira project.
8. Click on the **save icon** in the top right corner of the widget to save the customized table.

</details>
