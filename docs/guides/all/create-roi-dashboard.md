---
displayed_sidebar: null
description: Create a dashboard that highlights the ROI of automations in Port
---

# Create an ROI dashboard

## Overview

In this guide, you will learn how to showcase the true business impact of automation in Port by building an ROI dashboard.  
We will set up the necessary data model (using three new [blueprints](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/), defining a [Self-service](https://app.getport.io/self-serve) action, and designing a dashboard that visualizes the time savings and benefits delivered by your automations.

After executing this guide, you will have a dashboard in Port that demonstrates the value of your automations, and also provide insights into how Port drives efficiency and ROI across your organization.

<img src="/img/guides/ROIdashboard.png" border="1px" width="100%" />

We will be using the following terms in this guide:

### Lead time saving

**Lead time saving** measures the amount of time saved by automating and streamlining **Self-service** actions through Port, compared to traditional manual request processes.  
This metric captures the reduction in total time from when a user initiates a request to when it is fulfilled, including delays from approvals, queueing, handoffs, and clarifications.  
Lead time saving is calculated across all **Self-service** actions, from access provisioning to infrastructure changes—by benchmarking against manual equivalents to quantify the time saved.

**Why it matters:**

- Highlights the ROI of automations.
- Demonstrates reduced friction in fulfillment workflows.
- Supports operational efficiency tracking.
- Informs prioritization of future Self-service expansions.

**Lead time before**- This value represents how long requests typically took from submission to completion before using actions.

### Cycle Time Saving

**Cycle Time Saving** measures the reduction in time it takes to implement or fulfill a request after it has been approved or initiated. This includes technical execution steps such as provisioning, deployment, configuration, or setup.

Unlike Lead Time—which captures the total end-to-end process—Cycle Time focuses specifically on the execution phase. For example, creating a new sandbox environment or opening firewall access, which previously required manual scripts, coordination, or ticket handling.

This metric is calculated across all automated self-service actions in Port, highlighting how much faster delivery happens once requests are ready to be acted on

**Cycle time before**- This value represents how long the actual execution typically took before using actions.

## Prerequisites

- Port account
    - A Port account with appropriate permissions to create blueprints, actions, and automations.
    - Access to the [Builder](https://app.getport.io/settings/data-model) page to create blueprints.
    - Access to the [Self-service](https://app.getport.io/self-serve) page to create actions.
- GitHub account
    - GitHub account and repository with the following secrets configured: ([find them here](/build-your-software-catalog/custom-integration/api/#find-your-port-credentials))
        - `PORT_CLIENT_ID`: Your Port client ID.
        - `PORT_CLIENT_SECRET`: Your Port client secret.

## Set up data model

The following blueprints represent a Self-service action (Action), its category (Action categories) as well as an action's run (Action runs).

### Create the Action categories blueprint

1. Go to your [Builder](https://app.getport.io/settings/data-model) page.
2. Click on `+ Blueprint`.
3. Click on the `{...} Edit JSON` button in the top right corner.
4. Copy and paste the following JSON configuration into the editor.
5. Click `Create`

    <details>
    <summary><b>Action categories blueprint (click to expand)</b></summary>

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

### Create the Action Runs blueprint

1. Go to your [Builder](https://app.getport.io/settings/data-model) page.
2. Click on `+ Blueprint`.
3. Click on the `{...} Edit JSON` button in the top right corner.
4. Copy and paste the following JSON configuration into the editor.
5. Click `Create`.

    <details>
    <summary><b>Action Runs blueprint (click to expand)</b></summary>

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

### Create the Action blueprint

1. Go to your [Builder](https://app.getport.io/settings/data-model) page.
2. Click on `+ Blueprint`.
3. Click on the `{...} Edit JSON` button in the top right corner.
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

### Finish setting up Action Runs blueprint

After setting up both `Action Runs` and `Action` blueprint, add the following relation and mirror properties to the `Action blueprint`.

<details>
<summary><b>Action runs blueprint (click to expand)</b></summary>

    ``` json showLineNumbers
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
            "action": {
            "title": "Action",
            "path": "parent_action.$title"
            }
        },
        "relations": {
            "parent_action": {
            "title": "Parent action",
            "target": "action",
            "required": false,
            "many": false
            }
        }
    ```

 </details>

## Create the Self-service action

This Self-service action creates on execution:
-  A Self-service action with the inputs the user provides.
-  An automation that gets triggered when an action run is changed.  
   On trigger, if the run is sucessfull, the automation updates the following `Action run` properties:
    - **Duration**: How long did the action run take.
    - **Waiting for approval duration**: How long did the request take to get approved.
    - **Cycle time**: How long the did execution take.  

    All of which are used as aggregation properties in the `Action` blueprint.

### Set up the action's frontend

1. Head to the [Self-service](https://app.getport.io/self-serve) page.
2. Click on the `+ Action` button.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration into the editor.
5. Click `Save`.

    <details>
    <summary><b>Action blueprint(click to expand)</b></summary>

        **Remember to change the `<YOUR-ORG-NAME>` and `<YOUR-REPO-NAME>` to your GitHub organization and repository names.**

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
                "description": "Leave blank if no data or n/a"
                }
            }
            },
            "actionCardButtonText": "Create",
            "executeActionButtonText": "Create",
            "blueprintIdentifier": "action"
        },
        "invocationMethod": {
            "type": "GITHUB",
            //highlight-start
            "org": "<YOUR-ORG-NAME>",
            "repo": "<YOUR-REPO-NAME>",
            //highlight-end
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
In your GitHub repository, add the following files or use your own API.
Add the workflow to the `.git/workflows/` folder, and the other scripts to a `./scripts` folder.
You can also use this [repository](https://github.com/port-experimental/actions-experience) if you wish.

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

<details>
<summary><b>Create action entity (click to expand)</b></summary>

    ```sh showLineNumbers title:"create_action_entity.sh"

    #!/bin/bash
    set -euo pipefail

    # ===[ Configuration ]===
    # Uncomment the correct region:
    # PORT_API_BASE_URL="https://api.us.port.io"
    PORT_API_BASE_URL="https://api.getport.io"

    CACHE_FILE=".cache/port_token"
    CACHE_TTL_SECONDS=3300

    # ===[ Accept Parameters ]===
    ACTION_IDENTIFIER="$1"
    CATEGORY_IDENTIFIER="$2"
    LEAD_TIME_BEFORE="${3:-}"
    CYCLE_TIME="${4:-}"
    PORT_RUN_ID="$5"
    ACTION_TITLE="$6"

    if [[ -z "$ACTION_IDENTIFIER" || -z "$CATEGORY_IDENTIFIER" || -z "$PORT_RUN_ID" || -z "$ACTION_TITLE" ]]; then
    echo "❌ Usage: $0 <actionIdentifier> <categoryIdentifier> [leadTimeBefore] [cycleTime] <runId> <actionTitle>"
    exit 1
    fi

    # ===[ Logging Function ]===
    post_log() {
    local MSG="$1"
    echo "$MSG"
    if [[ -n "${TOKEN:-}" && -n "$PORT_RUN_ID" ]]; then
        RESPONSE=$(curl -s -w "%{http_code}" -o .port_log_response \
        -X POST "$PORT_API_BASE_URL/v1/actions/runs/$PORT_RUN_ID/logs" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"message\": \"$MSG\"}")
        STATUS="$RESPONSE"
        if [[ "$STATUS" != "201" ]]; then
        echo "⚠️ Failed to post log to Port (HTTP $STATUS)"
        echo "::group::Log API Response"
        cat .port_log_response
        echo "::endgroup::"
        fi
        rm -f .port_log_response
    fi
    }

    # ===[ Error Trap ]===
    handle_error() {
    local EXIT_CODE=$?
    local LINE=$1
    local MESSAGE="❌ Script failed at line $LINE with exit code $EXIT_CODE"
    echo "$MESSAGE"
    post_log "$MESSAGE"
    exit $EXIT_CODE
    }

    trap 'handle_error $LINENO' ERR

    # ===[ Token Handling ]===
    refresh_token() {
    echo "🔐 Requesting new token..."
    AUTH_RESPONSE=$(curl -s -X POST "$PORT_API_BASE_URL/v1/auth/access_token" \
        -H "Content-Type: application/json" \
        -d "{\"clientId\": \"$PORT_CLIENT_ID\", \"clientSecret\": \"$PORT_CLIENT_SECRET\"}")
    TOKEN=$(echo "$AUTH_RESPONSE" | jq -r '.accessToken')
    if [[ -z "$TOKEN" || "$TOKEN" == "null" ]]; then
        echo "❌ Failed to retrieve token"
        post_log "❌ Failed to retrieve token"
        exit 1
    fi
    mkdir -p .cache
    echo "{\"token\":\"$TOKEN\", \"timestamp\":$(date +%s)}" > "$CACHE_FILE"
    }

    get_cached_token() {
    if [[ ! -f "$CACHE_FILE" ]]; then
        refresh_token
    else
        TIMESTAMP=$(jq -r '.timestamp' "$CACHE_FILE")
        TOKEN=$(jq -r '.token' "$CACHE_FILE")
        NOW=$(date +%s)
        AGE=$((NOW - TIMESTAMP))
        if [[ $AGE -ge $CACHE_TTL_SECONDS ]]; then
        refresh_token
        fi
    fi
    }

    get_cached_token

    # ===[ Build properties dynamically ]===
    PROPERTIES="{}"
    if [[ -n "$LEAD_TIME_BEFORE" || -n "$CYCLE_TIME" ]]; then
    PROPERTIES="{"
    [[ -n "$LEAD_TIME_BEFORE" ]] && PROPERTIES+="\"lead_time_before\": $LEAD_TIME_BEFORE"
    [[ -n "$LEAD_TIME_BEFORE" && -n "$CYCLE_TIME" ]] && PROPERTIES+=", "
    [[ -n "$CYCLE_TIME" ]] && PROPERTIES+="\"cycle_time\": $CYCLE_TIME"
    PROPERTIES+="}"
    fi

    ENTITY_PAYLOAD=$(cat <<EOF
    {
    "identifier": "$ACTION_IDENTIFIER",
    "title": "$ACTION_TITLE",
    "properties": $PROPERTIES,
    "relations": {
        "category": "$CATEGORY_IDENTIFIER"
    }
    }
    EOF
    )

    post_log "📦 Creating or updating entity in blueprint 'action'..."

    HTTP_STATUS=$(curl -s -w "%{http_code}" -o .entity_response.json \
    -X POST "$PORT_API_BASE_URL/v1/blueprints/action/entities?upsert=true&run_id=$PORT_RUN_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$ENTITY_PAYLOAD")

    if [[ "$HTTP_STATUS" == "200" || "$HTTP_STATUS" == "201" ]]; then
    post_log "✅ Entity '$ACTION_IDENTIFIER' successfully created/updated"
    else
    post_log "❌ Failed to create/update entity. HTTP $HTTP_STATUS"
    {
        echo "❌ Failed to create/update entity. HTTP $HTTP_STATUS"
        if [[ -s .entity_response.json ]]; then
        echo "::group::API Error Response"
        cat .entity_response.json
        echo "::endgroup::"
        jq -r '.message // .error // empty' .entity_response.json || true
        else
        echo "⚠️ No response body received or file is empty."
        fi
    } || true
    rm -f .entity_response.json
    exit 1
    fi

    rm -f .entity_response.json
    ```
</details>

<details>
<summary><b>Create Port action if missing (click to expand)</b></summary>

    ```sh showLineNumbers title:"create_port_action_if_missing.sh"

    #!/bin/bash
    set -e

    # ===[ Configuration ]===
    PORT_API_BASE_URL="https://api.getport.io"
    CACHE_FILE=".cache/port_token"
    CACHE_TTL_SECONDS=3300

    # ===[ Accept Parameters ]===
    ACTION_IDENTIFIER="$1"
    ACTION_TITLE="$2"
    PORT_RUN_ID="$3"

    if [[ -z "$ACTION_IDENTIFIER" || -z "$ACTION_TITLE" || -z "$PORT_RUN_ID" ]]; then
    echo "❌ Usage: $0 <actionIdentifier> <actionTitle> <runId>"
    exit 1
    fi

    # ===[ Logging Function ]===
    post_log() {
    local MSG="$1"
    echo "$MSG"
    if [[ -n "$TOKEN" && -n "$PORT_RUN_ID" ]]; then
        curl -s -X POST "$PORT_API_BASE_URL/v1/actions/runs/$PORT_RUN_ID/logs" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"message\": \"$MSG\"}" > /dev/null
    fi
    }

    # ===[ Error Trap ]===
    handle_error() {
    local EXIT_CODE=$?
    local LINE=$1
    local MESSAGE="❌ Script failed at line $LINE with exit code $EXIT_CODE"
    echo "$MESSAGE"
    post_log "$MESSAGE"
    exit $EXIT_CODE
    }

    trap 'handle_error $LINENO' ERR

    # ===[ Token Management ]===
    refresh_token() {
    AUTH_RESPONSE=$(curl -s -X POST "$PORT_API_BASE_URL/v1/auth/access_token" \
        -H "Content-Type: application/json" \
        -d "{\"clientId\": \"$PORT_CLIENT_ID\", \"clientSecret\": \"$PORT_CLIENT_SECRET\"}")

    TOKEN=$(echo "$AUTH_RESPONSE" | jq -r '.accessToken')

    if [[ -z "$TOKEN" || "$TOKEN" == "null" ]]; then
        post_log "❌ Failed to retrieve token from Port"
        exit 1
    fi

    mkdir -p .cache
    echo "{\"token\":\"$TOKEN\", \"timestamp\":$(date +%s)}" > "$CACHE_FILE"
    }

    get_cached_token() {
    if [[ ! -f "$CACHE_FILE" ]]; then
        refresh_token
    else
        TIMESTAMP=$(jq -r '.timestamp' "$CACHE_FILE")
        TOKEN=$(jq -r '.token' "$CACHE_FILE")
        NOW=$(date +%s)
        AGE=$((NOW - TIMESTAMP))
        if [[ $AGE -ge $CACHE_TTL_SECONDS ]]; then
        refresh_token
        fi
    fi
    }

    get_cached_token

    # ===[ Check for Existing Action ]===
    post_log "🔍 Checking if action '$ACTION_IDENTIFIER' exists..."
    STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "Authorization: Bearer $TOKEN" \
    "$PORT_API_BASE_URL/v1/actions/$ACTION_IDENTIFIER")

    if [[ "$STATUS_CODE" == "200" ]]; then
    post_log "✅ Action '$ACTION_IDENTIFIER' already exists. Skipping creation."
    elif [[ "$STATUS_CODE" == "404" ]]; then
    post_log "➕ Action not found. Creating '$ACTION_IDENTIFIER'..."

    HTTP_STATUS=$(curl -s -w "%{http_code}" -o .port_action_response.json -X POST "$PORT_API_BASE_URL/v1/actions" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d @- <<EOF
    {
    "identifier": "$ACTION_IDENTIFIER",
    "title": "$ACTION_TITLE",
    "description": "Auto-created placeholder action",
    "trigger": {
        "type": "self-service",
        "operation": "CREATE",
        "userInputs": {
        "properties": {
            "user": {
            "type": "string",
            "format": "user",
            "title": "User",
            "default": {
                "jqQuery": ".user.email"
            },
            "visible": false
            }
        },
        "required": [],
        "order": []
        }
    },
    "invocationMethod": {
        "type": "WEBHOOK",
        "url": "https://example.com",
        "method": "POST",
        "headers": {
        "RUN_ID": "{{ .run.id }}",
        "Content-Type": "application/json"
        },
        "body": {
        "{{ spreadValue() }}": "{{ .inputs }}",
        "port_context": {
            "runId": "{{ .run.id }}"
        }
        },
        "agent": false,
        "synchronized": true
    }
    }
    EOF
    )

    if [[ "$HTTP_STATUS" == "200" || "$HTTP_STATUS" == "201" ]]; then
        ID=$(jq -r '.action.identifier' .port_action_response.json)
        post_log "📦 Successfully created action: $ID"
    else
        post_log "❌ Failed to create action. HTTP status: $HTTP_STATUS"
        cat .port_action_response.json
        exit 1
    fi

    rm .port_action_response.json
    else
    post_log "❌ Unexpected error while checking for action '$ACTION_IDENTIFIER'. HTTP status: $STATUS_CODE"
    exit 1
    fi 
    ```
</details>

<details>
<summary><b>Create Port automation (click to expand)</b></summary>

    ```sh showLineNumbers title:"create_port_automation.sh"

    #!/bin/bash
    set -euo pipefail

    # ===[ Configuration ]===
    # Uncomment the correct region:
    # PORT_API_BASE_URL="https://api.us.port.io"
    PORT_API_BASE_URL="https://api.getport.io"
    CACHE_FILE=".cache/port_token"
    CACHE_TTL_SECONDS=3300

    # ===[ Accept Parameters ]===
    ACTION_IDENTIFIER="$1"
    PORT_RUN_ID="$2"

    if [[ -z "$ACTION_IDENTIFIER" || -z "$PORT_RUN_ID" ]]; then
    echo "❌ Usage: $0 <actionIdentifier> <runId>"
    exit 1
    fi

    TITLE="Automation for runs of $ACTION_IDENTIFIER"
    AUTOMATION_IDENTIFIER=$(echo "$TITLE" | tr '[:upper:]' '[:lower:]' | tr ' ' '_')

    # ===[ Logging Function ]===
    post_log() {
    local MSG="$1"
    echo "$MSG"
    if [[ -n "${TOKEN:-}" && -n "$PORT_RUN_ID" ]]; then
        curl -s -X POST "$PORT_API_BASE_URL/v1/actions/runs/$PORT_RUN_ID/logs" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"message\": \"$MSG\"}" > /dev/null
    fi
    }

    # ===[ Error Trap ]===
    handle_error() {
    local EXIT_CODE=$?
    local LINE=$1
    local MESSAGE="❌ Script failed at line $LINE with exit code $EXIT_CODE"
    echo "$MESSAGE"
    post_log "$MESSAGE"
    exit $EXIT_CODE
    }

    trap 'handle_error $LINENO' ERR

    # ===[ Token Management ]===
    refresh_token() {
    AUTH_RESPONSE=$(curl -s -X POST "$PORT_API_BASE_URL/v1/auth/access_token" \
        -H "Content-Type: application/json" \
        -d "{\"clientId\": \"$PORT_CLIENT_ID\", \"clientSecret\": \"$PORT_CLIENT_SECRET\"}")
    TOKEN=$(echo "$AUTH_RESPONSE" | jq -r '.accessToken')
    if [[ -z "$TOKEN" || "$TOKEN" == "null" ]]; then
        post_log "❌ Failed to retrieve token"
        exit 1
    fi
    mkdir -p .cache
    echo "{\"token\":\"$TOKEN\", \"timestamp\":$(date +%s)}" > "$CACHE_FILE"
    }

    get_cached_token() {
    if [[ ! -f "$CACHE_FILE" ]]; then
        refresh_token
    else
        TIMESTAMP=$(jq -r '.timestamp' "$CACHE_FILE")
        TOKEN=$(jq -r '.token' "$CACHE_FILE")
        NOW=$(date +%s)
        AGE=$((NOW - TIMESTAMP))
        if [[ $AGE -ge $CACHE_TTL_SECONDS ]]; then
        refresh_token
        fi
    fi
    }

    get_cached_token

    # ===[ Check if automation already exists ]===
    post_log "🔍 Checking if automation '$AUTOMATION_IDENTIFIER' exists..."
    STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "Authorization: Bearer $TOKEN" \
    "$PORT_API_BASE_URL/v1/actions/$AUTOMATION_IDENTIFIER")

    if [[ "$STATUS_CODE" == "200" ]]; then
    post_log "✅ Automation '$AUTOMATION_IDENTIFIER' already exists. Skipping creation."
    exit 0
    elif [[ "$STATUS_CODE" != "404" ]]; then
    post_log "❌ Unexpected HTTP status $STATUS_CODE while checking automation."
    exit 1
    fi

    # ===[ Define properties block with double-escaping for jq expressions ]===
    PROPERTIES_JSON=$(cat <<'EOF'
    {
    "run_id": "{{.event.diff.after.id}}",
    "run_url": "https://app.port.io/organization/run?runId={{.event.diff.after.id}}",
    "status": "{{.event.diff.after.status}}",
    "created_at": "{{.event.diff.after.createdAt}}",
    "updated_at": "{{.event.diff.after.updatedAt}}",
    "{{if (.event.diff.after.status == \"SUCCESS\") then \"duration\" else null end}}": "{{ (.event.diff.after.createdAt | gsub(\"\\\\.[0-9]+Z$\"; \"Z\") | fromdateiso8601) as $created | (.event.diff.after.updatedAt | gsub(\"\\\\.[0-9]+Z$\"; \"Z\") | fromdateiso8601) as $updated | $updated - $created }}",
    "{{if (.event.diff.after.status == \"SUCCESS\" and .event.diff.before.requiredApproval == true) then \"waiting_for_approval_duration\" else null end}}": "{{ (.event.diff.before.createdAt | gsub(\"\\\\.[0-9]+Z$\"; \"Z\") | fromdateiso8601) as $created | (.event.diff.before.updatedAt | gsub(\"\\\\.[0-9]+Z$\"; \"Z\") | fromdateiso8601) as $updated | $updated - $created }}",
    "{{if (.event.diff.after.status == \"SUCCESS\") then \"cycle_time\" else null end}}": "{{ (.event.diff.before.updatedAt | gsub(\"\\\\.[0-9]+Z$\"; \"Z\") | fromdateiso8601) as $created | (.event.diff.after.updatedAt | gsub(\"\\\\.[0-9]+Z$\"; \"Z\") | fromdateiso8601) as $updated | $updated - $created }}"
    }
    EOF
    )

    # ===[ Create Automation ]===
    post_log "🚀 Creating automation '$AUTOMATION_IDENTIFIER'..."

    curl -s -X POST "$PORT_API_BASE_URL/v1/actions" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d @- <<EOF
    {
    "identifier": "$AUTOMATION_IDENTIFIER",
    "title": "$TITLE",
    "description": "Update action run data in Port after creation",
    "trigger": {
        "type": "automation",
        "event": {
        "type": "ANY_RUN_CHANGE",
        "actionIdentifier": "$ACTION_IDENTIFIER"
        }
    },
    "invocationMethod": {
        "type": "UPSERT_ENTITY",
        "blueprintIdentifier": "action_run",
        "mapping": {
        "identifier": "{{.event.diff.after.id}}",
        "title": "{{.event.diff.after.id}}",
        "properties": $PROPERTIES_JSON,
        "relations": {
            "parent_action": "{{.event.diff.after.action.identifier}}",
            "ran_by_actual_user": "{{.event.diff.after.properties.user}}"
        }
        }
    },
    "publish": true
    }
    EOF

    post_log "✅ Automation '$AUTOMATION_IDENTIFIER' successfully created."
    ```
</details>

#### Set up the newly created action's backend

When you execute the "Setup new action experience" Self-service action, it automatically creates:
- A new Self-service action with a placeholder backend.
- An automation that tracks ROI metrics for action runs.

:::info Next step required
The created Self-service action uses a default webhook backend (`https://example.com`) as a placeholder. You should replace this with your actual backend implementation to make the action functional. For detailed backend setup instructions, refer to our [backend configuration documentation](/actions-and-automations/create-self-service-experiences/setup-the-backend/). 
:::

## Visualize Action Entities with dashboards

Dashboards let you observe, track, and communicate insights from your action setup.  
You can create dashboards that pull data from the action, action category, and action run entities.

### Create an ROI dashboard

1. Navigate to the [Catalog](https://app.getport.io/organization/catalog) page of your portal.
2. Click on the **`+ New`** button in the left sidebar.
3. Select **New dashboard** and name it **ROI**.
4. Click `Create`.

We now have a blank dashboard where we can start adding widgets to visualize insights from our ROI components.

### Add widgets

In the new dashboard, create the following widgets:

<details>
<summary><b>AI Agent (click to expand)</b></summary>

To learn about AI Agents, refer to the [documentation](https://docs.port.io/ai-agents/build-an-ai-agent).

1. Click `+ Widget` and select **AI Agent**.
2. Title: `Actions AI assistant`.
3. Select your `Agent`.
4. Click `Save`.

</details>

<details>
<summary><b>Total hours saved (click to expand)</b></summary>

1. Click `+ Widget` and select **Number chart**.
2. Title: `Total hours saved`.
3. Description: `Lead time`.
4. Select `Aggregated by property` **Chart type** and choose **Action** as the **Blueprint**.
5. Select the `Total lead time saving (h)` **Property** and choose `sum` for the **Function**.
6. Select `custom` as the **Unit** and input `hours` as the **Custom unit**
7. Click `Save`.

</details>

<details>
<summary><b>Total processing time saved (click to expand)</b></summary>

1. Click `+ Widget` and select **Number chart**.
2. Title: `Total processing time saved`.
3. Description: `Cycle time`.
4. Select `Aggregated by property` **Chart type** and choose **Action** as the **Blueprint**.
5. Select the `Total cycle time savings (h)` **Property** and choose `sum` for the **Function**.
6. Select `custom` as the **Unit** and input `hours` as the **Custom unit**
7. Click `Save`.

</details>

<details>
<summary><b>Total time waiting for approval (click to expand)</b></summary>

1. Click `+ Widget` and select **Number chart**.
2. Title: `Total time waiting for approval`.
3. Select `Aggregated by property` **Chart type** and choose **Action** as the **Blueprint**.
4. Select the `Total waiting time (h)` **Property** and choose `sum` for the **Function**.
5. Select `custom` as the **Unit** and input `hours` as the **Custom unit**
6. Click `Save`.

</details>

Congratulations! You have successfully created an ROI dashboard that demonstrates the business value of your automations in Port.


