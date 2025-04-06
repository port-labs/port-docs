---
displayed_sidebar: null
description: Learn how to create a Linear issue in Port, streamlining issue categorization and tracking.
---

import ExistingSecretsCallout from '/docs/guides/templates/secrets/_existing_secrets_callout.mdx'
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Create a Linear issue

## Overview
This guide will help you implement a self-service action in Port that allows you to create linear issues directly from Port using **synced webhooks**.
This functionality streamlines project management by enabling users to create issues without leaving Port.


## Prerequisites

- Complete the [onboarding process](/getting-started/overview).
- Access to your Linear organization with permissions to manage issues.
- Optional - Install Port's [Linear integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/project-management/linear/).

## Set up data model

If you haven't installed the Linear integration, you will need to manually create blueprints for Linear issues, labels and teams.  
We highly recommend that you install the Linear integration to have such resources automatically set up for you. 

### Create a Linear issue blueprint

1. Go to your [Builder](https://app.getport.io/settings/data-model) page.
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.
4. Add the following JSON schemas separately into the editor while clicking `Save` to create the blueprint one after the other:

    <details>
    <summary><b>Linear Team Blueprint (Click to expand)</b></summary>

    ```json showLineNumbers
    {
    "identifier": "linearTeam",
    "description": "A Linear team",
    "title": "Linear Team",
    "icon": "Linear",
    "schema": {
        "properties": {
        "description": {
            "type": "string",
            "title": "Description",
            "description": "Team description"
        },
        "workspaceName": {
            "type": "string",
            "title": "Workspace Name",
            "description": "The name of the workspace this team belongs to"
        },
        "url": {
            "title": "Team URL",
            "type": "string",
            "format": "url",
            "description": "URL to the team in Linear"
        }
        },
        "required": []
    },
    "mirrorProperties": {},
    "calculationProperties": {},
    "aggregationProperties": {},
    "relations": {}
    }
    ```
    </details>


    <details>
    <summary><b>Linear Label Blueprint (Click to expand)</b></summary>

    ```json showLineNumbers
    {
    "identifier": "linearLabel",
    "description": "A Linear label",
    "title": "Linear Label",
    "icon": "Linear",
    "schema": {
        "properties": {
        "isGroup": {
            "type": "boolean",
            "title": "Is group",
            "description": "Whether this label is considered to be a group"
        }
        },
        "required": []
    },
    "mirrorProperties": {},
    "calculationProperties": {},
    "aggregationProperties": {},
    "relations": {
        "parentLabel": {
        "title": "Parent Label",
        "target": "linearLabel",
        "required": false,
        "many": false
        },
        "childLabels": {
        "title": "Child Labels",
        "target": "linearLabel",
        "required": false,
        "many": true
        }
    }
    }
    ```
    </details>


    <details>
    <summary><b>Linear Issue Blueprint (Click to expand)</b></summary>

    ```json showLineNumbers
    {
    "identifier": "linearIssue",
    "title": "Linear Issue",
    "icon": "Linear",
    "schema": {
        "properties": {
        "url": {
            "title": "Issue URL",
            "type": "string",
            "format": "url",
            "description": "URL to the issue in Linear"
        },
        "status": {
            "title": "Status",
            "type": "string",
            "description": "The status of the issue"
        },
        "assignee": {
            "title": "Assignee",
            "type": "string",
            "format": "user",
            "description": "The user assigned to the issue"
        },
        "creator": {
            "title": "Creator",
            "type": "string",
            "description": "The user that created to the issue",
            "format": "user"
        },
        "priority": {
            "title": "Priority",
            "type": "string",
            "description": "The priority of the issue"
        },
        "created": {
            "title": "Created At",
            "type": "string",
            "description": "The created datetime of the issue",
            "format": "date-time"
        },
        "updated": {
            "title": "Updated At",
            "type": "string",
            "description": "The updated datetime of the issue",
            "format": "date-time"
        }
        },
        "required": []
    },
    "mirrorProperties": {},
    "calculationProperties": {},
    "aggregationProperties": {},
    "relations": {
        "labels": {
        "title": "Labels",
        "target": "linearLabel",
        "required": false,
        "many": true
        },
        "parentIssue": {
        "title": "Parent Issue",
        "target": "linearIssue",
        "required": false,
        "many": false
        },
        "team": {
        "title": "Team",
        "description": "The Linear team that contains this issue",
        "target": "linearTeam",
        "required": false,
        "many": false
        }
    }
    }
    ```
    </details>


## Implementation

You can create Linear issue by leveraging Port's **synced webhooks** and **secrets** to directly interact with Linear's GraphQL API.

### Add Port secrets

<ExistingSecretsCallout integration="Linear" />

To add these secrets to your portal:

1. Click on the `...` button in the top right corner of your Port application.

2. Click on **Credentials**.

3. Click on the `Secrets` tab.

4. Click on `+ Secret` and add the following secrets:
    - `LINEAR_API_KEY`: Your [Linear API key](https://developers.linear.app/docs/graphql/working-with-the-graphql-api#personal-api-keys).


### Set up self-service action

Let's define a self-service action that is used to create a Linear issue:

1. Head to the [self-service](https://app.getport.io/self-serve) page.
2. Click on the `+ New Action` button.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration into the editor.

    <details>
    <summary><b>Create Linear Issue (Webhook) (Click to expand)</b></summary>

    ```json showLineNumbers
    {
    "identifier": "create_linear_issue_webhook",
    "title": "Create Linear Issue (Webhook)",
    "icon": "Linear",
    "description": "Create a new Linear Issue",
    "trigger": {
        "type": "self-service",
        "operation": "CREATE",
        "userInputs": {
        "properties": {
            "name": {
            "icon": "DefaultProperty",
            "type": "string",
            "title": "Name",
            "description": "The name or title of the issue"
            },
            "priority": {
            "icon": "DefaultProperty",
            "title": "Priority",
            "type": "string",
            "enum": [
                "Urgent",
                "High",
                "Medium",
                "Low"
            ],
            "enumColors": {
                "Urgent": "red",
                "High": "orange",
                "Medium": "blue",
                "Low": "darkGray"
            }
            },
            "description": {
            "type": "string",
            "title": "Description",
            "description": "Detailed description about the issue"
            },
            "team": {
            "title": "Team",
            "type": "string",
            "blueprint": "linearTeam",
            "sort": {
                "property": "$title",
                "order": "ASC"
            },
            "format": "entity"
            },
            "labels": {
            "title": "Labels",
            "icon": "DefaultProperty",
            "type": "array",
            "items": {
                "type": "string",
                "format": "entity",
                "blueprint": "linearLabel"
            }
            }
        },
        "required": [
            "team",
            "name",
            "labels"
        ],
        "order": [
            "name",
            "description",
            "priority",
            "team",
            "labels"
        ]
        }
    },
    "invocationMethod": {
        "type": "WEBHOOK",
        "url": "https://api.linear.app/graphql",
        "agent": false,
        "synchronized": true,
        "method": "POST",
        "headers": {
        "Authorization": "{{.secrets.LINEAR_API_KEY}}",
        "Content-Type": "application/json"
        },
        "body": {
        "query": "mutation IssueCreate($title: String!, $description: String, $teamId: String!, $priority: Int, $labelIds: [String!]) { issueCreate(input: { title: $title, description: $description, teamId: $teamId, priority: $priority, labelIds: $labelIds }) { success issue { id title priority createdAt updatedAt number labelIds priorityLabel url description team { id name } creator { name email } state { name } } } }",
        "variables": {
            "title": "{{.inputs.name}}",
            "description": "{{.inputs.description}}",
            "teamId": "{{.inputs.team.identifier}}",
            "priority": "{{ if .inputs.priority == \"Urgent\" then 1 elif .inputs.priority == \"High\" then 2 elif .inputs.priority == \"Medium\" then 3 elif .inputs.priority == \"Low\" then 4 else 0 end }}",
            "labelIds": "{{.inputs.labels | map (.identifier)}}"
        }
        }
    },
    "requiredApproval": false
    }
    ```
    :::tip Mapping Linear Team
    If you've installed Port's Linear integration, the `identifier` of the `team` kind is mapped to `.key` by default. However, creating issues in Linear requires the team's UUID (`.id`).

    To fix this, go to your Data Sources page and update the mapping by setting `identifier: .id` instead of `.key`, as shown below:

    ```yaml showLineNumbers
    - kind: team
      selector:
        query: 'true'
      port:
        entity:
          mappings:
            identifier: .id
            title: .name
            blueprint: '"linearTeam"'
            properties:
              description: .description
              workspaceName: .organization.name
              url: '"https://linear.app/" + .organization.urlKey + "/team/" + .key'
    ```
    :::
    </details>

5. Click `Save`.

Now you should see the `Create Linear Issue (Webhook)` action in the self-service page. 🎉

### Create an automation to update your catalog

After each execution of the action, we would like to update the relevant entity in Port with the latest status.  

To achieve this, we can create an automation that will be triggered when the action completes successfully.

To create the automation:

1. Head to the [automation](https://app.getport.io/settings/automations) page.

2. Click on the `+ Automation` button.

3. Copy and paste the following JSON configuration into the editor.

    <details>
    <summary><b>Update Linear issue in Port automation (Click to expand)</b></summary>

    ```json showLineNumbers
    {
    "identifier": "linear_issue_sync_status",
    "title": "Sync Linear Issue Status",
    "description": "Update Linear issue data in Port after creation",
    "trigger": {
        "type": "automation",
        "event": {
        "type": "RUN_UPDATED",
        "actionIdentifier": "create_linear_issue_webhook"
        },
        "condition": {
        "type": "JQ",
        "expressions": [
            ".diff.after.status == \"SUCCESS\""
        ],
        "combinator": "and"
        }
    },
    "invocationMethod": {
        "type": "UPSERT_ENTITY",
        "blueprintIdentifier": "linearIssue",
        "mapping": {
        "identifier": "{{.event.diff.after.response.data.issueCreate.issue.id}}",
        "title": "{{.event.diff.after.response.data.issueCreate.issue.title}}",
        "properties": {
            "url": "{{.event.diff.after.response.data.issueCreate.issue.url}}",
            "priority": "{{.event.diff.after.response.data.issueCreate.issue.priorityLabel}}",
            "status": "{{.event.diff.after.response.data.issueCreate.issue.state.name}}",
            "description": "{{.event.diff.after.response.data.issueCreate.issue.description}}",
            "creator": "{{.event.diff.after.response.data.issueCreate.issue.creator.email}}",
            "created": "{{.event.diff.after.response.data.issueCreate.issue.createdAt}}",
            "updated": "{{.event.diff.after.response.data.issueCreate.issue.updatedAt}}"
        },
        "relations": {
            "team": "{{.event.diff.after.response.data.issueCreate.issue.team.id}}",
            "labels": "{{.event.diff.after.response.data.issueCreate.issue.labelIds}}"
        }
        }
    },
    "publish": true
    }
    ```
    </details>

4. Click `Save`.

Now when you execute the webhook action, the issue data in Port will be automatically updated with the latest information from Linear.


## Let's test it!

1. Head to the [self-service page](https://app.getport.io/self-serve) of your portal.

2. Choose the `Create Linear Issue (Webhook)` action:

3. Enter the required information:
   - Issue name.
   - Description of the issue.
   - priority level.
   - Team.
   - Label.

4. Click on `Execute`.

5. Done! Wait for the issue to be created in Linear.
