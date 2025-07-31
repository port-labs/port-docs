---
sidebar_position: 
displayed_sidebar: null
description: Create a dashboard that highlights the ROI of automations in Port
---

# Create an ROI dashboard

## Overview

In the following guide, you are going to create a dashboard that highlights the ROI (Return On Invesment) of automations in Port.
To achieve that we will create three new [blueprints](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/setup-blueprint), a [Self-service](https://app.getport.io/self-serve) action and a [dashboard](/customize-pages-dashboards-and-plugins/dashboards) that will reflect the advantages of using actions in Port.

## Prerequisites
Before you begin, you will need:

1. A Port account (if you don't have one already):
   - Visit [Port.io](https://app.port.io/).
   - Sign up for an account.

2. A [GitHub](https://github.com/) account.

## Set up data model

### Create the Action blueprint

1. Go to your [Builder](https://app.getport.io/settings/data-model) page.
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose "Edit JSON".
4. Copy and paste the following JSON configuration into the editor.
5. Click `Create`

    <details>
    <summary><b>Action blueprint (click to expand)</b></summary>

    ```json showLineNumbers
    {
    "identifier": "action",
    "description": "Action as a blueprint",
    "title": "Action",
    "icon": "Microservice",
    "ownership": {
        "type": "Direct",
        "title": "Owning Teams"
    },
    "schema": {
        "properties": {
        "lead_time_before": {
            "icon": "DefaultProperty",
            "type": "number",
            "title": "Lead time before(h)"
        },
        "cycle_time": {
            "icon": "DefaultProperty",
            "type": "number",
            "title": "Cycle time before(h)"
        },
        "description": {
            "type": "string",
            "title": "Description "
        },
        "criticality": {
            "icon": "DefaultProperty",
            "title": "Criticality",
            "type": "string",
            "default": "Tier 3",
            "enum": [
            "Tier 1",
            "Tier 2",
            "Tier 3"
            ],
            "enumColors": {
            "Tier 1": "red",
            "Tier 2": "orange",
            "Tier 3": "lightGray"
            }
        }
        },
        "required": [
        "criticality"
        ]
    },
    "mirrorProperties": {},
    "calculationProperties": {
        "overall_failure_rate": {
        "title": "Overall Failure Rate (%)",
        "icon": "DefaultProperty",
        "description": "Percentage of failed runs out of total runs",
        "calculation": "if .properties.total_runs > 0 then (.properties.failed_runs / .properties.total_runs * 100) else 0 end",
        "type": "number"
        },
        "success_rate": {
        "title": "Success Rate (%)",
        "description": "Percentage of successful runs out of total runs",
        "calculation": "if .properties.total_runs > 0 then (.properties.successful_runs / .properties.total_runs * 100) else 0 end",
        "type": "number"
        },
        "daily_failure_rate": {
        "title": "Daily Failure Rate (%)",
        "description": "Percentage of failed runs in the last day",
        "calculation": "if .properties.daily_total_runs > 0 then (.properties.daily_failed_runs / .properties.daily_total_runs * 100) else 0 end",
        "type": "number"
        },
        "weekly_failure_rate": {
        "title": "Weekly Failure Rate (%)",
        "description": "Percentage of failed runs in the last week",
        "calculation": "if .properties.weekly_total_runs > 0 then (.properties.weekly_failed_runs / .properties.weekly_total_runs * 100) else 0 end",
        "type": "number"
        },
        "monthly_failure_rate": {
        "title": "Monthly Failure Rate (%)",
        "description": "Percentage of failed runs in the last month",
        "calculation": "if .properties.monthly_total_runs > 0 then (.properties.monthly_failed_runs / .properties.monthly_total_runs * 100) else 0 end",
        "type": "number"
        },
        "total_runs_with_status": {
        "title": "Total Runs (with status)",
        "description": "Sum of successful and failed runs",
        "calculation": "(.properties.successful_runs // 0) + (.properties.failed_runs // 0)",
        "type": "number"
        },
        "total_waiting_time_h": {
        "title": "Total Waiting Time (h)",
        "icon": "HourGlass",
        "description": "Total waiting for approval time across all runs in hours",
        "calculation": "if .properties.total_waiting_time_seconds > 0 then .properties.total_waiting_time_seconds / 3600 else 0 end",
        "type": "number"
        },
        "average_waiting_time_h": {
        "title": "Average Waiting Time (h)",
        "icon": "HourGlass",
        "description": "Average waiting for approval duration per run in hours",
        "calculation": "if .properties.runs_with_waiting_time > 0 then (.properties.total_waiting_time_seconds / .properties.runs_with_waiting_time) / 3600 else 0 end",
        "type": "number"
        },
        "max_waiting_time_h": {
        "title": "Max Waiting Time (h)",
        "icon": "HourGlassExpired",
        "description": "Maximum waiting time for any single run in hours",
        "calculation": "if .properties.max_waiting_time_seconds > 0 then .properties.max_waiting_time_seconds / 3600 else 0 end",
        "type": "number"
        }
    },
    "aggregationProperties": {
        "total_lead_time_savings_h": {
        "title": "Total lead time savings (h)",
        "type": "number",
        "description": "In hours",
        "target": "action_run",
        "calculationSpec": {
            "func": "sum",
            "property": "savings_lead_time_h",
            "calculationBy": "property"
        }
        },
        "total_runs": {
        "title": "Total Runs",
        "type": "number",
        "description": "Total number of action runs",
        "target": "action_run",
        "calculationSpec": {
            "func": "count",
            "calculationBy": "entities"
        }
        },
        "failed_runs": {
        "title": "Failed Runs",
        "icon": "DefaultProperty",
        "type": "number",
        "description": "Number of failed action runs",
        "target": "action_run",
        "query": {
            "combinator": "and",
            "rules": [
            {
                "property": "status",
                "operator": "=",
                "value": "FAILURE"
            }
            ]
        },
        "calculationSpec": {
            "func": "count",
            "calculationBy": "entities"
        }
        },
        "successful_runs": {
        "title": "Successful Runs",
        "type": "number",
        "description": "Number of successful action runs",
        "target": "action_run",
        "query": {
            "combinator": "and",
            "rules": [
            {
                "property": "status",
                "operator": "=",
                "value": "SUCCESS"
            }
            ]
        },
        "calculationSpec": {
            "func": "count",
            "calculationBy": "entities"
        }
        },
        "in_progress_runs": {
        "title": "In Progress Runs",
        "type": "number",
        "description": "Number of currently running actions",
        "target": "action_run",
        "query": {
            "combinator": "and",
            "rules": [
            {
                "property": "status",
                "operator": "=",
                "value": "IN_PROGRESS"
            }
            ]
        },
        "calculationSpec": {
            "func": "count",
            "calculationBy": "entities"
        }
        },
        "daily_total_runs": {
        "title": "Daily Total Runs",
        "icon": "DefaultProperty",
        "type": "number",
        "description": "Total runs in the last 24 hours",
        "target": "action_run",
        "query": {
            "combinator": "and",
            "rules": [
            {
                "property": "$createdAt",
                "operator": "between",
                "value": {
                "preset": "today"
                }
            }
            ]
        },
        "calculationSpec": {
            "func": "count",
            "calculationBy": "entities"
        }
        },
        "daily_failed_runs": {
        "title": "Daily Failed Runs",
        "icon": "DefaultProperty",
        "type": "number",
        "description": "Failed runs in the last 24 hours",
        "target": "action_run",
        "query": {
            "combinator": "and",
            "rules": [
            {
                "property": "status",
                "operator": "=",
                "value": "FAILURE"
            },
            {
                "property": "$createdAt",
                "operator": "between",
                "value": {
                "preset": "today"
                }
            }
            ]
        },
        "calculationSpec": {
            "func": "count",
            "calculationBy": "entities"
        }
        },
        "weekly_total_runs": {
        "title": "Weekly Total Runs",
        "icon": "DefaultProperty",
        "type": "number",
        "description": "Total runs in the last 7 days",
        "target": "action_run",
        "query": {
            "combinator": "and",
            "rules": [
            {
                "property": "$createdAt",
                "operator": "between",
                "value": {
                "preset": "lastWeek"
                }
            }
            ]
        },
        "calculationSpec": {
            "func": "count",
            "calculationBy": "entities"
        }
        },
        "weekly_failed_runs": {
        "title": "Weekly Failed Runs",
        "icon": "DefaultProperty",
        "type": "number",
        "description": "Failed runs in the last week",
        "target": "action_run",
        "query": {
            "combinator": "and",
            "rules": [
            {
                "property": "status",
                "operator": "=",
                "value": "FAILURE"
            },
            {
                "property": "$createdAt",
                "operator": "between",
                "value": {
                "preset": "lastWeek"
                }
            }
            ]
        },
        "calculationSpec": {
            "func": "count",
            "calculationBy": "entities"
        }
        },
        "monthly_total_runs": {
        "title": "Monthly Total Runs",
        "icon": "DefaultProperty",
        "type": "number",
        "description": "Total runs in the last 30 days",
        "target": "action_run",
        "query": {
            "combinator": "and",
            "rules": [
            {
                "property": "$createdAt",
                "operator": "between",
                "value": {
                "preset": "lastMonth"
                }
            }
            ]
        },
        "calculationSpec": {
            "func": "count",
            "calculationBy": "entities"
        }
        },
        "monthly_failed_runs": {
        "title": "Monthly Failed Runs",
        "icon": "DefaultProperty",
        "type": "number",
        "description": "Failed runs in the last month",
        "target": "action_run",
        "query": {
            "combinator": "and",
            "rules": [
            {
                "property": "status",
                "operator": "=",
                "value": "FAILURE"
            },
            {
                "property": "$createdAt",
                "operator": "between",
                "value": {
                "preset": "lastMonth"
                }
            }
            ]
        },
        "calculationSpec": {
            "func": "count",
            "calculationBy": "entities"
        }
        },
        "total_cycle_time_savings_h": {
        "title": "Total cycle time savings (h)",
        "icon": "DefaultProperty",
        "type": "number",
        "description": "In hours",
        "target": "action_run",
        "calculationSpec": {
            "func": "sum",
            "property": "savings_cycle_time_h",
            "calculationBy": "property"
        }
        },
        "total_waiting_time_seconds": {
        "title": "Total Waiting Time (seconds)",
        "icon": "HourGlass",
        "type": "number",
        "description": "Total waiting for approval time across all runs in seconds",
        "target": "action_run",
        "calculationSpec": {
            "func": "sum",
            "property": "waiting_for_approval_duration",
            "calculationBy": "property"
        }
        },
        "max_waiting_time_seconds": {
        "title": "Max approving time Time (s)",
        "icon": "HourGlassExpired",
        "type": "number",
        "description": "Maximum waiting for approval in seconds",
        "target": "action_run",
        "calculationSpec": {
            "func": "max",
            "property": "waiting_for_approval_duration",
            "calculationBy": "property"
        }
        },
        "runs_with_waiting_time": {
        "title": "Runs with Waiting Time",
        "icon": "HourGlass",
        "type": "number",
        "description": "Number of runs that had waiting time",
        "target": "action_run",
        "query": {
            "combinator": "and",
            "rules": [
            {
                "property": "waiting_for_approval_duration",
                "operator": ">",
                "value": 0
            }
            ]
        },
        "calculationSpec": {
            "func": "count",
            "calculationBy": "entities"
        }
        }
    },
    "relations": {
        "category": {
        "title": "Category",
        "target": "actions_categories",
        "required": true,
        "many": false
        }
    }
    }
    ```

    </details>

### Create the Action Runs blueprint

1. Go to your [Builder](https://app.getport.io/settings/data-model) page.
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose "Edit JSON".
4. Copy and paste the following JSON configuration into the editor.
5. Click `Create`.

    <details>
    <summary><b>Action blueprint(click to expand)</b></summary>

    ```json showLineNumbers
    {
    "identifier": "action_run",
    "title": "Action run",
    "icon": "Microservice",
    "schema": {
        "properties": {
        "status": {
            "icon": "DefaultProperty",
            "title": "Status",
            "type": "string",
            "enum": [
            "SUCCESS",
            "FAILURE",
            "IN_PROGRESS",
            "WAITING_FOR_APPROVAL",
            "DECLINED"
            ],
            "enumColors": {
            "SUCCESS": "green",
            "FAILURE": "red",
            "IN_PROGRESS": "lightGray",
            "WAITING_FOR_APPROVAL": "yellow",
            "DECLINED": "red"
            }
        },
        "created_at": {
            "type": "string",
            "title": "Created At",
            "format": "date-time"
        },
        "run_id": {
            "type": "string",
            "title": "Run ID"
        },
        "run_url": {
            "type": "string",
            "title": "Run URL",
            "format": "url"
        },
        "updated_at": {
            "type": "string",
            "title": "Updated At",
            "format": "date-time"
        },
        "duration": {
            "type": "number",
            "title": "Duration",
            "description": "In seconds"
        },
        "waiting_for_approval_duration": {
            "type": "number",
            "title": "Waiting for approval duration",
            "description": "In seconds"
        },
        "cycle_time": {
            "icon": "DefaultProperty",
            "title": "Cycle Time",
            "description": "Total time from in progress to completion in seconds",
            "type": "number"
        }
        },
        "required": []
    },
    "mirrorProperties": {
        "category": {
        "title": "Category",
        "path": "parent_action.category.$title"
        },
        "lead_time_before": {
        "title": "Lead time before",
        "path": "parent_action.lead_time_before"
        },
        "cycle_time_before": {
        "title": "Cycle time before",
        "path": "parent_action.cycle_time"
        },
        "ran_by": {
        "title": "Ran by",
        "path": "ran_by_actual_user.$identifier"
        },
        "team_2": {
        "title": "User teams",
        "path": "ran_by_actual_user.teams.$identifier"
        },
        "user_group": {
        "title": "User group",
        "path": "ran_by_actual_user.teams.group.$title"
        },
        "action": {
        "title": "Action",
        "path": "parent_action.$title"
        }
    },
    "calculationProperties": {
        "savings_lead_time_h": {
        "title": "Savings lead time (h)",
        "icon": "DefaultProperty",
        "description": "Time saved on waiting time In hours",
        "calculation": "if .properties.status == \"SUCCESS\" then (.properties.lead_time_before * 3600 - .properties.duration) / 3600 else null end",
        "type": "number"
        },
        "savings_cycle_time_h": {
        "title": "Savings cycle time (h)",
        "icon": "DefaultProperty",
        "description": "Time saved on cycle time In hours",
        "calculation": "if .properties.status == \"SUCCESS\" then (.properties.cycle_time_before*3600 - .properties.cycle_time) / 3600 else null end",
        "type": "number"
        },
        "primary_user_group": {
        "title": "Primary User Group",
        "icon": "GroupBy",
        "description": "First user group from the user_group array",
        "calculation": "if (.properties.user_group | type) == \"array\" and (.properties.user_group | length > 0) then .properties.user_group[0] else (.properties.user_group // \"No Group\") end",
        "type": "string"
        },
        "primary_team": {
        "title": "Primary Team",
        "icon": "Team",
        "description": "First team from the team_2 array",
        "calculation": "if (.properties.team_2 | type) == \"array\" and (.properties.team_2 | length > 0) then .properties.team_2[0] else (.properties.team_2 // \"No Team\") end",
        "type": "string"
        }
    },
    "aggregationProperties": {},
    "relations": {
        "parent_action": {
        "title": "Parent action",
        "target": "action",
        "required": false,
        "many": false
        },
        "ran_by_actual_user": {
        "title": "Ran by actual user",
        "target": "_user",
        "required": false,
        "many": false
        }
    }
    }
    ```

    </details>

### Create the Action Categories blueprint

1. Go to your [Builder](https://app.getport.io/settings/data-model) page.
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose "Edit JSON".
4. Copy and paste the following JSON configuration into the editor.
5. Click `Create`

    <details>
    <summary><b>Action blueprint(click to expand)</b></summary>

    ```json showLineNumbers
    {
    "identifier": "actions_categories",
    "description": "Categories for actions",
    "title": "Actions categories",
    "icon": "Microservice",
    "schema": {
        "properties": {},
        "required": []
    },
    "mirrorProperties": {},
    "calculationProperties": {},
    "aggregationProperties": {},
    "relations": {}
    }
    ```

    </details>

## Create the "Setup new action experience" Self-service action

### Set up the action's frontend

1. Head to the [Self-service](https://app.getport.io/self-serve) page.
2. Click on the `+ Action` button.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration into the editor.
5. Click `Save`.

    <details>
    <summary><b>Action blueprint(click to expand)</b></summary>

        ```json showLineNumbers
        {
        "identifier": "setup_new_action",
        "title": "Setup new action experience",
        "description": "Setup a backend that will create scaffolding of action, automation and action kpis",
        "trigger": {
            "type": "self-service",
            "operation": "CREATE",
            "userInputs": {
            "properties": {
                "category": {
                "type": "string",
                "title": "Category",
                "blueprint": "actions_categories",
                "format": "entity"
                },
                "lead_time_before": {
                "type": "number",
                "description": "Number of hours spent waiting from ticket creation",
                "title": "Lead time before"
                },
                "cycle_time": {
                "icon": "DefaultProperty",
                "type": "number",
                "title": "Cycle time before",
                "description": "Time spent in hour executing the request"
                },
                "actionTitle": {
                "icon": "DefaultProperty",
                "type": "string",
                "title": "Action title"
                }
            },
            "required": [
                "category",
                "actionTitle"
            ],
            "order": [
                "4af618d8-6b42-45c1-81f8-34ead11eb3f5",
                "actionTitle",
                "category",
                "41281872-3eaa-4e6e-b66e-1f3e9bc7d99b",
                "lead_time_before",
                "cycle_time"
            ],
            "titles": {
                "4af618d8-6b42-45c1-81f8-34ead11eb3f5": {
                "title": "Set up a new action",
                "description": "This will create a new action and the associated action runs as blueprints"
                },
                "41281872-3eaa-4e6e-b66e-1f3e9bc7d99b": {
                "title": "ROI",
                "description": "Leave blank is no data or n/a"
                }
            }
            },
            "actionCardButtonText": "Create",
            "executeActionButtonText": "Create",
            "blueprintIdentifier": "action"
        },
        "invocationMethod": {
            "type": "GITHUB",
            "org": "PortActionsRepo",
            "repo": "configuration-scripts",
            "workflow": "create-port-automation.yml",
            "workflowInputs": {
            "{{ spreadValue() }}": "{{ .inputs }}",
            "port_context": {
                "runId": "{{ .run.id }}",
                "blueprint": "{{ .action.blueprint }}"
            }
            },
            "reportWorkflowStatus": true
        },
        "requiredApproval": false
        }
        ```
    </details>

### Set up the action's backend

Define the logic that our action will trigger.
In your GitHub repository, add the following file or use your own API.

<details>
<summary><b>Create port automation workflow (click to expand)</b></summary>

    To the .github/workflows directory, add the following file:

    ```yaml showLineNumbers title="create-port-automation.yml"

    name: Create Port Automation

    on:
    workflow_dispatch:
        inputs:
        actionTitle:
            description: "Action Title (e.g. Create S3 Bucket)"
            required: true

        category:
            description: "Category object (passed as raw JSON string)"
            required: true

        lead_time_before:
            description: "Optional: lead time before (number)"
            required: false

        cycle_time:
            description: "Optional: cycle time (number)"
            required: false

        port_context:
            description: "Includes blueprint, run ID, and entity identifier from Port"
            required: true

    jobs:
    create-automation:
        runs-on: ubuntu-latest

        outputs:
        action_identifier: ${{ steps.generate.outputs.action_identifier }}

        steps:
        - name: Checkout code
            uses: actions/checkout@v3

        - name: Install jq
            run: sudo apt-get install -y jq

        - name: Derive actionIdentifier from actionTitle
            id: generate
            run: |
            RAW_TITLE="${{ github.event.inputs.actionTitle }}"
            ACTION_IDENTIFIER=$(echo "$RAW_TITLE" | tr '[:upper:]' '[:lower:]' | sed 's/ /_/g')
            echo "🔤 Derived identifier: $ACTION_IDENTIFIER"
            echo "action_identifier=$ACTION_IDENTIFIER" >> "$GITHUB_OUTPUT"

        - name: Extract Port run ID
            id: context
            run: |
            echo "run_id=${{ fromJson(github.event.inputs.port_context).runId }}" >> "$GITHUB_OUTPUT"

        - name: Create Port action if it doesn't exist
            env:
            PORT_CLIENT_ID: ${{ secrets.PORT_CLIENT_ID }}
            PORT_CLIENT_SECRET: ${{ secrets.PORT_CLIENT_SECRET }}
            run: |
            bash ./scripts/create_port_action_if_missing.sh \
                "${{ steps.generate.outputs.action_identifier }}" \
                "${{ github.event.inputs.actionTitle }}" \
                "${{ steps.context.outputs.run_id }}"

        - name: Create automation in Port
            env:
            PORT_CLIENT_ID: ${{ secrets.PORT_CLIENT_ID }}
            PORT_CLIENT_SECRET: ${{ secrets.PORT_CLIENT_SECRET }}
            run: |
            bash ./scripts/create_port_automation.sh \
                "${{ steps.generate.outputs.action_identifier }}" \
                "${{ steps.context.outputs.run_id }}"

        - name: Create entity in blueprint 'action'
            env:
            PORT_CLIENT_ID: ${{ secrets.PORT_CLIENT_ID }}
            PORT_CLIENT_SECRET: ${{ secrets.PORT_CLIENT_SECRET }}
            run: |
            bash ./scripts/create_action_entity.sh \
                "${{ steps.generate.outputs.action_identifier }}" \
                "${{ fromJson(github.event.inputs.category).identifier }}" \
                "${{ github.event.inputs.lead_time_before || '0' }}" \
                "${{ github.event.inputs.cycle_time || '0'  }}" \
                "${{ steps.context.outputs.run_id }}" \
                "${{ github.event.inputs.actionTitle }}"

    ```
</details>


## Visualize action entities with dashboards

Dashboards let you observe, track, and communicate insights from your action setup. You can create dashboards that pull data from the action, action category, and action run entities.

### Create an ROI dashboard

1. Navigate to the [Catalog](https://app.getport.io/organization/catalog) page of your portal.
2. Click on the **`+ New`** button in the left sidebar.
3. Select **New dashboard**.
4. 


