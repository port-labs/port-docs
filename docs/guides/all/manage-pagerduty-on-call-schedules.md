---
displayed_sidebar: null
description: Learn how to manage and track PagerDuty on-call schedules across teams and services with dashboards and self-service actions.
---

import ExistingSecretsCallout from '/docs/guides/templates/secrets/_existing_secrets_callout.mdx'

# Manage PagerDuty on-call schedules

This guide demonstrates how to bring your on-call management experience into Port using PagerDuty.   
You will learn how to:

- Set up **self-service actions** to manage on-call schedules (view schedules, change on-call users, create overrides).
- Build **dashboards** in Port to visualize on-call coverage, rotation schedules, and team assignments.
- Track on-call engineers across different teams and services.

<img src="/img/guides/pagerDutyOnCallDashboard1.png" border="1px" width="100%" />

<img src="/img/guides/pagerDutyOnCallDashboard2.png" border="1px" width="100%" />



## Common use cases

- **On-call visibility**: Get a centralized view of who's on-call across all teams and services.
- **Schedule management**: Easily change on-call assignments and create temporary overrides.
- **Team coordination**: Track on-call rotations and ensure proper coverage across services.
- **Escalation planning**: Visualize escalation policies and on-call hierarchies.
- **Burnout prevention**: Monitor on-call frequency and distribute responsibilities fairly.

## Prerequisites

This guide assumes the following:
- You have a Port account and have completed the [onboarding process](https://docs.port.io/getting-started/overview).
- Port's [PagerDuty integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/incident-management/pagerduty) is installed in your account.
- Access to your PagerDuty organization with permissions to manage schedules and on-call assignments.
- [Port's GitHub app](https://github.com/apps/getport-io) needs to be installed.


## Set up data model

If you haven't installed the [PagerDuty integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/incident-management/pagerduty), you'll need to create blueprints for PagerDuty schedules and users.  
However, we highly recommend you install the [PagerDuty integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/incident-management/pagerduty) to have these automatically set up for you.

<h3> Create the PagerDuty Schedule blueprint</h3>

1. Go to the [Builder](https://app.getport.io/settings/data-model) page of your portal.

2. Click on `+ Blueprint`.

3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.

4. Add this JSON schema:

    <details>
    <summary>PagerDuty Schedule Blueprint</summary>

    ```json showLineNumbers
    {
      "identifier": "pagerdutySchedule",
      "description": "This blueprint represents a PagerDuty schedule in our software catalog",
      "title": "PagerDuty Schedule",
      "icon": "pagerduty",
      "schema": {
        "properties": {
          "url": {
            "type": "string",
            "format": "url",
            "title": "Schedule URL"
          },
          "timezone": {
            "type": "string",
            "title": "Timezone"
          },
          "description": {
            "type": "string",
            "title": "Description"
          },
          "final_schedule": {
            "type": "object",
            "title": "Final Schedule"
          },
          "overrides_subschedule": {
            "type": "object",
            "title": "Overrides"
          },
          "created_at": {
            "title": "Created At",
            "type": "string",
            "format": "date-time"
          },
          "updated_at": {
            "title": "Updated At",
            "type": "string",
            "format": "date-time"
          }
        },
        "required": []
      },
      "mirrorProperties": {},
      "calculationProperties": {},
      "relations": {
        "pagerdutyService": {
          "title": "PagerDuty Service",
          "target": "pagerdutyService",
          "required": false,
          "many": true
        }
      }
    }
    ```
    </details>

5. Click `Save`.

<h3> Create the PagerDuty User blueprint</h3>

1. Go to the [Builder](https://app.getport.io/settings/data-model) page of your portal.

2. Click on `+ Blueprint`.

3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.

4. Add this JSON schema:

    <details>
    <summary>PagerDuty User Blueprint</summary>

    ```json showLineNumbers
    {
      "identifier": "pagerdutyUser",
      "description": "This blueprint represents a PagerDuty user in our software catalog",
      "title": "PagerDuty User",
      "icon": "pagerduty",
      "schema": {
        "properties": {
          "email": {
            "type": "string",
            "format": "email",
            "title": "Email"
          },
          "time_zone": {
            "type": "string",
            "title": "Time Zone"
          },
          "color": {
            "type": "string",
            "title": "Color"
          },
          "role": {
            "type": "string",
            "title": "Role"
          },
          "avatar_url": {
            "type": "string",
            "format": "url",
            "title": "Avatar URL"
          },
          "description": {
            "type": "string",
            "title": "Description"
          },
          "created_at": {
            "title": "Created At",
            "type": "string",
            "format": "date-time"
          }
        },
        "required": []
      },
      "mirrorProperties": {},
      "calculationProperties": {},
      "relations": {
        "pagerdutyTeam": {
          "title": "PagerDuty Team",
          "target": "pagerdutyTeam",
          "required": false,
          "many": true
        }
      }
    }
    ```
    </details>

5. Click `Save`.


## Set up self-service actions

Now let's set up self-service actions to manage your PagerDuty on-call schedules directly from Port. We'll implement key on-call management workflows using webhook-based actions.

### Add Github secrets

In your GitHub repository, [go to **Settings > Secrets**](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository) and add the following secrets:
   - `PAGERDUTY_API_KEY` - [PagerDuty API token](https://support.pagerduty.com/docs/api-access-keys) generated by the user.
   - `PORT_CLIENT_ID` - Your port `client id` [How to get the credentials](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#find-your-port-credentials).
   - `PORT_CLIENT_SECRET` - Your port `client secret` [How to get the credentials](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#find-your-port-credentials).

### View current on-call user

Get information about who is currently on-call for a specific schedule using a GitHub workflow.

<h4> GitHub workflow</h4>

Create the file `.github/workflows/view-current-oncall.yaml` in the `.github/workflows` folder of your repository.

<details>
<summary><b>GitHub workflow script (click to expand)</b></summary>

```yaml showLineNumbers title="view-current-oncall.yaml"
name: View Current On-Call User
on:
  workflow_dispatch:
    inputs:
      port_context:
        required: true
        description: includes blueprint, run ID, and entity identifier from Port.

jobs:
  view-current-oncall:
    runs-on: ubuntu-latest
    steps:
      - name: Inform start of oncall lookup
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_context).run_id}}
          logMessage: "Looking up current on-call user for schedule... ⛴️"

      - name: Get current on-call information
        id: get_oncall
        uses: fjogeleit/http-request-action@v1
        with:
          url: "https://api.pagerduty.com/oncalls?schedule_ids[]=${{fromJson(inputs.port_context).entity}}"
          method: "GET"
          customHeaders: '{"Content-Type": "application/json", "Accept": "application/vnd.pagerduty+json;version=2", "Authorization": "Token token=${{ secrets.PAGERDUTY_API_KEY }}"}'

      - name: Extract on-call user information
        id: extract_oncall_info
        run: |
          ONCALL_DATA='${{ steps.get_oncall.outputs.response }}'
          
          # Check if there are any oncalls
          ONCALL_COUNT=$(echo "$ONCALL_DATA" | jq '.oncalls | length')
          
          if [ "$ONCALL_COUNT" -eq 0 ]; then
            echo "No one is currently on-call for this schedule"
            echo "oncall_user=No one currently on-call" >> $GITHUB_OUTPUT
            echo "oncall_start=N/A" >> $GITHUB_OUTPUT
            echo "oncall_end=N/A" >> $GITHUB_OUTPUT
            echo "escalation_level=N/A" >> $GITHUB_OUTPUT
          else
            # Get the first (primary) on-call entry
            ONCALL_USER=$(echo "$ONCALL_DATA" | jq -r '.oncalls[0].user.summary // "Unknown"')
            ONCALL_START=$(echo "$ONCALL_DATA" | jq -r '.oncalls[0].start // "Unknown"')
            ONCALL_END=$(echo "$ONCALL_DATA" | jq -r '.oncalls[0].end // "Unknown"')
            ESCALATION_LEVEL=$(echo "$ONCALL_DATA" | jq -r '.oncalls[0].escalation_level // "Unknown"')
            
            echo "oncall_user=$ONCALL_USER" >> $GITHUB_OUTPUT
            echo "oncall_start=$ONCALL_START" >> $GITHUB_OUTPUT
            echo "oncall_end=$ONCALL_END" >> $GITHUB_OUTPUT
            echo "escalation_level=$ESCALATION_LEVEL" >> $GITHUB_OUTPUT
          fi

      - name: Display on-call information
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_context).run_id}}
          logMessage: |
            📋 **Current On-Call Information:**
            
            👤 **User:** ${{ steps.extract_oncall_info.outputs.oncall_user }}
            🕐 **Start:** ${{ steps.extract_oncall_info.outputs.oncall_start }}
            🕕 **End:** ${{ steps.extract_oncall_info.outputs.oncall_end }}
            📶 **Escalation Level:** ${{ steps.extract_oncall_info.outputs.escalation_level }}

      - name: Log completion
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_context).run_id}}
          logMessage: "On-call lookup completed successfully ✅"
```
</details>

<h4>Add the self-service action</h4>

1. Head to the [self-service](https://app.getport.io/self-serve) page.

2. Click on the `+ New Action` button.

3. Click on the `{...} Edit JSON` button.

4. Copy and paste the following JSON configuration into the editor:

    <details>
    <summary><b>View current on-call user (click to expand)</b></summary>

    ```json showLineNumbers
    {
        "identifier": "view_current_oncall",
        "title": "View current on-call user",
        "icon": "pagerduty",
        "description": "Get information about who is currently on-call for this schedule",
        "trigger": {
            "type": "self-service",
            "operation": "DAY-2",
            "userInputs": {
                "properties": {},
                "required": [],
                "order": []
            },
            "blueprintIdentifier": "pagerdutySchedule"
        },
        "invocationMethod": {
            "type": "GITHUB",
            "org": "<GITHUB_ORG>",
            "repo": "<GITHUB_REPO>",
            "workflow": "view-current-oncall.yaml",
            "workflowInputs": {
                "port_context": {
                    "blueprint": "{{.action.blueprint}}",
                    "entity": "{{.entity.identifier}}",
                    "run_id": "{{.run.id}}"
                }
            },
            "reportWorkflowStatus": true
        },
        "requiredApproval": false
    }
    ```
    </details>

5. Click `Save`.

### Change on-call user

Change the current on-call assignment for a schedule by creating an override using a GitHub workflow.

<h4>GitHub workflow</h4>

Create the file `.github/workflows/change-oncall-user.yaml` in the `.github/workflows` folder of your repository.

<details>
<summary><b>GitHub workflow script (click to expand)</b></summary>

```yaml showLineNumbers title="change-oncall-user.yaml"
name: Change On-Call User
on:
  workflow_dispatch:
    inputs:
      start_time:
        description: The start time for the override, in ISO 8601 format (e.g., 2023-01-01T01:00:00Z)
        required: true
        type: string
      end_time:
        description: The end time for the override, in ISO 8601 format (e.g., 2023-01-01T01:00:00Z).
        required: true
        type: string
      new_on_call_user:
        description: The email of the user who will be taking over the on-call duty
        required: true
        type: string
      port_context:
        required: true
        description: includes blueprint, run ID, and entity identifier from Port.

jobs:
  change-on-call-user:
    runs-on: ubuntu-latest
    steps:
      - name: Inform searching of user in user list
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_context).run_id}}
          logMessage: "Searching for user in organization user list... ⛴️"

      - name: Search for user id among user list
        id: search_for_user_id
        uses: fjogeleit/http-request-action@v1
        with:
          url: "https://api.pagerduty.com/users?query=${{ github.event.inputs.new_on_call_user }}"
          method: "GET"
          customHeaders: '{"Content-Type": "application/json", "Authorization": "Token token=${{ secrets.PAGERDUTY_API_KEY }}"}'

      - name: Retrieve user list from search
        id: user_id_from_search
        if: steps.search_for_user_id.outcome == 'success'
        run: |
          user_id=$(echo '${{ steps.search_for_user_id.outputs.response }}' | jq -r '.users | if length > 0 then .[0].id else "empty" end')
          echo "user_id=${user_id}" >> $GITHUB_OUTPUT

      - name: Inform user existence
        if: steps.user_id_from_search.outputs.user_id != 'empty'
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_context).run_id}}
          logMessage: |
            User found 🥹, Creating override for ${{ inputs.new_on_call_user }}... ⛴️
      
      - name: Inform user inexistence
        if: steps.user_id_from_search.outputs.user_id == 'empty'
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_context).run_id}}
          logMessage: |
            User not found 😭 Skipping assignment... ⛴️
  
      - name: Create Override in PagerDuty
        if: steps.user_id_from_search.outputs.user_id != 'empty'
        id: create_override
        uses: fjogeleit/http-request-action@v1
        with:
          url: "https://api.pagerduty.com/schedules/${{fromJson(inputs.port_context).entity}}/overrides"
          method: 'POST'
          customHeaders: '{"Content-Type": "application/json", "Accept": "application/vnd.pagerduty+json;version=2", "Authorization": "Token token=${{ secrets.PAGERDUTY_API_KEY }}"}'
          data: >-
            {
              "override": {
                "start": "${{ github.event.inputs.start_time }}",
                "end": "${{ github.event.inputs.end_time }}",
                "user": {
                  "id": "${{ steps.user_id_from_search.outputs.user_id }}",
                  "type": "user_reference" 
                }
              }
            }

      - name: Log Before Requesting for Updated Schedule
        if: steps.user_id_from_search.outputs.user_id != 'empty'
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_context).run_id}}
          logMessage: "Getting updated schedule from PagerDuty..."

      - name: Request For Updated Schedule
        if: steps.user_id_from_search.outputs.user_id != 'empty'
        id: new_schedule
        uses: fjogeleit/http-request-action@v1
        with:
          url: 'https://api.pagerduty.com/schedules/${{fromJson(inputs.port_context).entity}}'
          method: 'GET'
          customHeaders: '{"Content-Type": "application/json", "Accept": "application/vnd.pagerduty+json;version=2", "Authorization": "Token token=${{ secrets.PAGERDUTY_API_KEY }}"}'

      - name: Extract Users From New Schedule
        if: steps.user_id_from_search.outputs.user_id != 'empty'
        id: extract_users
        run: |
          USERS_JSON=$(echo '${{ steps.new_schedule.outputs.response }}' | jq -c '[.schedule.users[].summary]')
          echo "user_summaries=$USERS_JSON" >> $GITHUB_ENV
        shell: bash
  
      - name: Log Before Upserting Schedule to Port
        if: steps.user_id_from_search.outputs.user_id != 'empty'
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_context).run_id}}
          logMessage: "Ingesting updated schedule to Port..."
          
      - name: UPSERT Entity
        if: steps.user_id_from_search.outputs.user_id != 'empty'
        uses: port-labs/port-github-action@v1
        with:
          identifier: "${{ fromJson(steps.new_schedule.outputs.response).schedule.id }}"
          title: "${{ fromJson(steps.new_schedule.outputs.response).schedule.name }}"
          blueprint: ${{fromJson(inputs.port_context).blueprint}}
          properties: |-
            {
              "url": "${{ fromJson(steps.new_schedule.outputs.response).schedule.html_url }}",
              "timezone": "${{ fromJson(steps.new_schedule.outputs.response).schedule.time_zone }}",
              "description": "${{ fromJson(steps.new_schedule.outputs.response).schedule.description}}",
              "users": ${{ env.user_summaries }}
            }
          relations: "{}"
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: UPSERT
          runId: ${{fromJson(inputs.port_context).run_id}}

      - name: Log After Upserting Entity
        if: steps.user_id_from_search.outputs.user_id != 'empty'
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_context).run_id}}
          logMessage: "Override created successfully ✅"

      - name: Log completion for user not found
        if: steps.user_id_from_search.outputs.user_id == 'empty'
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_context).run_id}}
          logMessage: "Action completed - user not found ❌"
```
</details>

<h4>Add the self-service action</h4>

1. Head to the [self-service](https://app.getport.io/self-serve) page.

2. Click on the `+ New Action` button.

3. Click on the `{...} Edit JSON` button.

4. Copy and paste the following JSON configuration:

    <details>
    <summary><b>Change on-call user (click to expand)</b></summary>

    ```json showLineNumbers
    {
        "identifier": "change_oncall_user",
        "title": "Change on-call user",
        "icon": "pagerduty",
        "description": "Create an override to change the current on-call user",
        "trigger": {
            "type": "self-service",
            "operation": "DAY-2",
            "userInputs": {
                "properties": {
                    "new_on_call_user": {
                        "icon": "User",
                        "title": "New On-call User Email",
                        "description": "Email address of the user who will be taking over the on-call duty",
                        "type": "string",
                        "format": "user"
                    },
                    "start_time": {
                        "icon": "DefaultProperty",
                        "title": "Start Time",
                        "description": "Override start time (ISO 8601 format)",
                        "type": "string",
                        "format": "date-time"
                    },
                    "end_time": {
                        "icon": "DefaultProperty", 
                        "title": "End Time",
                        "description": "Override end time (ISO 8601 format)",
                        "type": "string",
                        "format": "date-time"
                    }
                },
                "required": [
                    "new_on_call_user",
                    "start_time", 
                    "end_time"
                ],
                "order": [
                    "new_on_call_user",
                    "start_time",
                    "end_time"
                ]
            },
            "blueprintIdentifier": "pagerdutySchedule"
        },
        "invocationMethod": {
            "type": "GITHUB",
            "org": "<GITHUB_ORG>",
            "repo": "<GITHUB_REPO>",
            "workflow": "change-oncall-user.yaml",
            "workflowInputs": {
                "start_time": "{{.inputs.\"start_time\"}}",
                "end_time": "{{.inputs.\"end_time\"}}",
                "new_on_call_user": "{{.inputs.\"new_on_call_user\"}}",
                "port_context": {
                    "blueprint": "{{.action.blueprint}}",
                    "entity": "{{.entity.identifier}}",
                    "run_id": "{{.run.id}}"
                }
            },
            "reportWorkflowStatus": true
        },
        "requiredApproval": false
    }
    ```
    </details>

5. Click `Save`.

### Delete schedule override

Remove an existing schedule override using a GitHub workflow.

<h4>GitHub workflow</h4>

Create the file `.github/workflows/delete-schedule-override.yaml` in the `.github/workflows` folder of your repository.

<details>
<summary><b>GitHub workflow script (click to expand)</b></summary>

```yaml showLineNumbers title="delete-schedule-override.yaml"
name: Delete Schedule Override
on:
  workflow_dispatch:
    inputs:
      override_id:
        description: The ID of the override to delete
        required: true
        type: string
      port_context:
        required: true
        description: includes blueprint, run ID, and entity identifier from Port.

jobs:
  delete-schedule-override:
    runs-on: ubuntu-latest
    steps:
      - name: Inform start of override deletion
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_context).run_id}}
          logMessage: "Deleting schedule override... ⛴️"

      - name: Delete override from PagerDuty
        id: delete_override
        uses: fjogeleit/http-request-action@v1
        with:
          url: "https://api.pagerduty.com/schedules/${{fromJson(inputs.port_context).entity}}/overrides/${{ github.event.inputs.override_id }}"
          method: "DELETE"
          customHeaders: '{"Content-Type": "application/json", "Accept": "application/vnd.pagerduty+json;version=2", "Authorization": "Token token=${{ secrets.PAGERDUTY_API_KEY }}"}'

      - name: Log Before Requesting for Updated Schedule
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_context).run_id}}
          logMessage: "Getting updated schedule from PagerDuty..."

      - name: Request For Updated Schedule
        id: new_schedule
        uses: fjogeleit/http-request-action@v1
        with:
          url: 'https://api.pagerduty.com/schedules/${{fromJson(inputs.port_context).entity}}'
          method: 'GET'
          customHeaders: '{"Content-Type": "application/json", "Accept": "application/vnd.pagerduty+json;version=2", "Authorization": "Token token=${{ secrets.PAGERDUTY_API_KEY }}"}'

      - name: Extract Users From New Schedule
        id: extract_users
        run: |
          USERS_JSON=$(echo '${{ steps.new_schedule.outputs.response }}' | jq -c '[.schedule.users[].summary]')
          echo "user_summaries=$USERS_JSON" >> $GITHUB_ENV
        shell: bash

      - name: Log Before Upserting Schedule to Port
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_context).run_id}}
          logMessage: "Ingesting updated schedule to Port..."

      - name: UPSERT Entity
        uses: port-labs/port-github-action@v1
        with:
          identifier: "${{ fromJson(steps.new_schedule.outputs.response).schedule.id }}"
          title: "${{ fromJson(steps.new_schedule.outputs.response).schedule.name }}"
          blueprint: ${{fromJson(inputs.port_context).blueprint}}
          properties: |-
            {
              "url": "${{ fromJson(steps.new_schedule.outputs.response).schedule.html_url }}",
              "timezone": "${{ fromJson(steps.new_schedule.outputs.response).schedule.time_zone }}",
              "description": "${{ fromJson(steps.new_schedule.outputs.response).schedule.description}}",
              "users": ${{ env.user_summaries }}
            }
          relations: "{}"
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: UPSERT
          runId: ${{fromJson(inputs.port_context).run_id}}

      - name: Log completion
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_context).run_id}}
          logMessage: "Schedule override deleted successfully ✅"
```
</details>

<h4>Add the self-service action</h4>

1. Head to the [self-service](https://app.getport.io/self-serve) page.

2. Click on the `+ New Action` button.

3. Click on the `{...} Edit JSON` button.

4. Copy and paste the following JSON configuration:

    <details>
    <summary><b>Delete schedule override (click to expand)</b></summary>

    ```json showLineNumbers
    {
        "identifier": "delete_schedule_override",
        "title": "Delete schedule override",
        "icon": "pagerduty",
        "description": "Remove an existing schedule override",
        "trigger": {
            "type": "self-service",
            "operation": "DAY-2",
            "userInputs": {
                "properties": {
                    "override_id": {
                        "icon": "DefaultProperty",
                        "title": "Override ID",
                        "description": "The ID of the override to delete",
                        "type": "string"
                    }
                },
                "required": [
                    "override_id"
                ],
                "order": [
                    "override_id"
                ]
            },
            "blueprintIdentifier": "pagerdutySchedule"
        },
        "invocationMethod": {
            "type": "GITHUB",
            "org": "<GITHUB_ORG>",
            "repo": "<GITHUB_REPO>",
            "workflow": "delete-schedule-override.yaml",
            "workflowInputs": {
                "override_id": "{{.inputs.\"override_id\"}}",
                "port_context": {
                    "blueprint": "{{.action.blueprint}}",
                    "entity": "{{.entity.identifier}}",
                    "run_id": "{{.run.id}}"
                }
            },
            "reportWorkflowStatus": true
        },
        "requiredApproval": false
    }
    ```
    </details>

5. Click `Save`.



## Let's test it!

1. Head to the [self-service page](https://app.getport.io/self-serve) of your portal

2. **Test viewing current on-call user:**
   - Navigate to a PagerDuty Schedule in your catalog.
   - Click on `View current on-call user`.
   - Click `Execute`.
   - Review the response to see who is currently on-call.

3. **Test changing on-call user:**
   - Navigate to a PagerDuty Schedule in your catalog.
   - Click on `Change on-call user`.
   - Fill in the required information:
     - New On-call User Email: PagerDuty user email to assign.
     - Start Time: When the override should begin.
     - End Time: When the override should end.
   - Click `Execute`.

4. **Test deleting schedule override:**
   - Navigate to a PagerDuty Schedule in your catalog.
   - Click on `Delete schedule override`.
   - Fill in the Override ID of the override you want to remove.
   - Click `Execute`.

## Visualize metrics

With your on-call management actions in place and data flowing, we can create a dedicated dashboard in Port to visualize on-call coverage, schedules, and team assignments.



### Create a dashboard

1. Navigate to the [Catalog](https://app.getport.io/organization/catalog) page of your portal.

2. Click on the **`+ New`** button in the left sidebar.

3. Select **New dashboard**.

4. Name the dashboard **PagerDuty On-call Management**.

5. Input `Monitor and manage your PagerDuty on-call schedules and assignments` under **Description**.

6. Select the `PagerDuty` icon.

7. Click `Create`.

We now have a blank dashboard where we can start adding widgets to visualize insights from our PagerDuty on-call data.

### Add widgets

In the new dashboard, create the following widgets:

<details>
<summary><b>Total schedules count (click to expand)</b></summary>

1. Click `+ Widget` and select **Number Chart**.

2. Title: `Total schedules`

3. Select `Count entities` **Chart type** and choose **PagerDuty Schedule** as the **Blueprint**.

4. Select `count` for the **Function**.

5. Select `custom` as the **Unit** and input `schedules` as the **Custom unit**.

6. Click `Save`.

</details>

<details>
<summary><b>Schedules created today (click to expand)</b></summary>

1. Click `+ Widget` and select **Number Chart**.

2. Title: `Schedules created today`.

3. Select `Count entities` **Chart type** and choose **PagerDuty Schedule** as the **Blueprint**.

4. Select `count` for the **Function**.

5. Add this JSON to the **Additional filters** editor to filter schedules created today:
    ```json showLineNumbers
    [
        {
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
        }
    ]
    ```

6. Select `custom` as the **Unit** and input `schedules` as the **Custom unit**.

7. Click `Save`.

</details>

<details>
<summary><b>Users by role (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Pie chart**.

2. Title: `Users by role`.

3. Choose the **PagerDuty User** blueprint.

4. Under `Breakdown by property`, select the **Role** property.

5. Click `Save`.

</details>

<details>
<summary><b>Total users count (click to expand)</b></summary>

1. Click `+ Widget` and select **Number Chart**.

2. Title: `Total users` (add the `User` icon).

3. Select `Count entities` **Chart type** and choose **PagerDuty User** as the **Blueprint**.

4. Select `count` for the **Function**.

5. Select `custom` as the **Unit** and input `users` as the **Custom unit**.

6. Click `Save`.

</details>

<details>
<summary><b>All schedules table (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Table**.

2. Title the widget **All Schedules**.

3. Choose the **PagerDuty Schedule** blueprint.

4. Click `Save` to add the widget to the dashboard.

</details>

<details>
<summary><b>All users table (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Table**.

2. Title the widget **All Users**.

3. Choose the **PagerDuty User** blueprint.

4. Click `Save` to add the widget to the dashboard.

5. Click on the **`...`** button in the top right corner of the table and select **Customize table**.

6. In the top right corner of the table, click on `Manage Properties` and add the following properties:
    - **Email**: User's email address.
    - **Role**: User's role in PagerDuty.
    - **Time Zone**: User's timezone.
    - **Created At**: When the user account was created.

7. Click on the **save icon** in the top right corner of the widget to save the customized table.

</details>

<details>
<summary><b>On-call actions (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Action card**.

2. Select **View current on-call user**, **Change on-call user** and **Delete schedule override** as the **Actions**.

3. Click `Save`.

</details>

## Related guides

- **[Change On-Call User](https://docs.port.io/actions-and-automations/setup-backend/github-workflow/examples/PagerDuty/change-on-call-user)**: GitHub workflow for changing on-call assignments
- **[Create PagerDuty service](https://docs.port.io/actions-and-automations/setup-backend/github-workflow/examples/PagerDuty/create-pagerduty-service)**: Create new PagerDuty services
- **[PagerDuty Integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/incident-management/pagerduty)**: Complete setup guide for PagerDuty integration 