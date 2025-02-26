---
displayed_sidebar: null
description: Learn how to manage StatusPage incidents in Port, ensuring clear communication and effective incident resolution.
---

import GithubActionModificationHint from '/docs/guides/templates/github/_github_action_modification_required_hint.mdx'
import GithubDedicatedRepoHint from '/docs/guides/templates/github/_github_dedicated_workflows_repository_hint.mdx'
import StatuspageBlueprint from '/docs/guides/templates/statuspage/_statuspage_blueprint.mdx'
import StatuspageIncidentBlueprint from '/docs/guides/templates/statuspage/_statuspage_incident_blueprint.mdx'
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"

# Create and Manage Statuspage Incidents

## Overview
This self-service guide will show you how to seamlessly create and update incidents on your [Atlassian Statuspage](https://www.atlassian.com/software/statuspage) directly through Port. You'll also learn how to automatically notify your team about incident changes using Port's notification system.

## Prerequisites
1. Get your [Status page API Key](https://support.atlassian.com/statuspage/docs/create-and-manage-api-keys/) and Page ID:

<img src='/img/self-service-actions/setup-backend/github-workflow/examples/statuspageKeys.png' width='80%' border='1px' />

<br />

2. In your GitHub repository, [go to **Settings > Secrets**](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository) and add the following secrets:
   - `STATUSPAGE_PAGE_ID` - Your Statuspage Id
   - `STATUSPAGE_API_KEY` - Statuspage API key. [Create the API Key](https://support.atlassian.com/statuspage/docs/create-and-manage-api-keys/)
   - `PORT_CLIENT_ID` - Your port `client id` [How to get the credentials](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#find-your-port-credentials).
   - `PORT_CLIENT_SECRET` - Your port `client secret` [How to get the credentials](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#find-your-port-credentials).

3. [Create the blueprints](https://app.getport.io/settings/data-model) in Port.

<StatuspageBlueprint />
<StatuspageIncidentBlueprint />



## GitHub Workflow

<GithubDedicatedRepoHint/>

1. Create the file `create-statuspage-incident.yml` in the `.github/workflows` folder of your repository.

<details>
<summary>`create-statuspage-incident` GitHub Workflow</summary>

```yaml showLineNumbers title="create-statuspage-incident.yml"
name: Create Statuspage Incident and Notify Port

on:
  workflow_dispatch:
    inputs:
      incident_title:
        description: "Title of the incident"
        required: true
      incident_message:
        description: "Description of the incident"
        required: true
      incident_severity:
        description: "Severity: none, minor, major, critical"
        required: true
        type: choice
        options:
          - none
          - minor
          - major
          - critical
      incident_status:
        description: "Status: investigating, identified, monitoring, resolved"
        required: true
        type: choice
        options:
          - investigating
          - identified
          - monitoring
          - resolved
      status_page:
        description: "Statuspage page ID"
        required: false
      port_context:
        description: "Port context"
        required: true


env:
  STATUSPAGE_PAGE_ID: ${{ inputs.status_page || secrets.STATUSPAGE_PAGE_ID }}

jobs:
  create_statuspage_incident:
    runs-on: ubuntu-latest
    steps:
      - name: Notify Port (Initial)
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).runId }}
          logMessage: |
            Creating Statuspage incident: ${{ inputs.incident_title }}

      - name: Create Statuspage Incident
        id: create_incident
        run: |
          echo "Creating Statuspage incident: ${{ inputs.incident_title }} in status page: ${{ env.STATUSPAGE_PAGE_ID }}"
          
          payload='{
              "incident": {
                "name": "${{ inputs.incident_title }}",
                "body": "${{ inputs.incident_message }}",
                "status": "${{ inputs.incident_status }}",
                "impact_override": "${{ inputs.incident_severity }}",
                "deliver_notifications": true,
                "metadata": {
                  "port": {
                    "runId": "${{ fromJson(inputs.port_context).runId }}",
                    "triggeredBy": "${{ fromJson(inputs.port_context).trigger.by.user.email }}"
                  }
                }
              }
            }'
          
          # Add scheduled fields only if the incident is scheduled
          if [[ "${{ inputs.incident_status }}" =~ ^(scheduled|in_progress|verifying|completed)$ ]]; then
            # Calculate default start and end times for scheduled maintenance (next hour, 3 hours duration)
            start_time=$(date -u -d "+1 hour" +%Y-%m-%dT%H:%M:%S.000Z)
            end_time=$(date -u -d "+4 hours" +%Y-%m-%dT%H:%M:%S.000Z)

            payload=$(echo "$payload" | jq --arg start_time "$start_time" --arg end_time "$end_time" '.incident += {"scheduled_for": $start_time, "scheduled_until": $end_time, "scheduled_remind_prior": true, "scheduled_auto_in_progress": true, "scheduled_auto_completed": true}')
          fi
          
          echo "$payload"

          response=$(curl -s -X POST "https://api.statuspage.io/v1/pages/${{ env.STATUSPAGE_PAGE_ID }}/incidents" \
            -H "Authorization: OAuth ${{ secrets.STATUSPAGE_API_KEY }}" \
            -H "Content-Type: application/json" \
            -d "$payload")

          echo "$response"
          echo "INCIDENT=$response" >> $GITHUB_ENV
          echo "$response" > response.json

          echo "incident_id=$(jq -r '.id' response.json)" >> $GITHUB_OUTPUT
          echo "name=$(jq -r '.name' response.json)" >> $GITHUB_OUTPUT
          echo "status=$(jq -r '.status' response.json)" >> $GITHUB_OUTPUT
          echo "impact=$(jq -r '.impact' response.json)" >> $GITHUB_OUTPUT
          echo "created_at=$(jq -r '.created_at' response.json)" >> $GITHUB_OUTPUT
          echo "updated_at=$(jq -r '.updated_at' response.json)" >> $GITHUB_OUTPUT


      - name: Upsert Entity in Port
        uses: port-labs/port-github-action@v1
        env:
          INCIDENT_ID: ${{ steps.create_incident.outputs.incident_id }}
          STATUS: ${{ steps.create_incident.outputs.status }}
          IMPACT: ${{ steps.create_incident.outputs.impact }}
          CREATED_AT: ${{ steps.create_incident.outputs.created_at }}
          UPDATED_AT: ${{ steps.create_incident.outputs.updated_at }}
        with:
          identifier: ${{ env.INCIDENT_ID }}
          title: ${{ inputs.incident_title }}
          team: "[]"
          icon: DefaultBlueprint
          blueprint: ${{ fromJson(inputs.port_context).blueprint }}
          properties: |-
            {
              "impact": "${{ env.IMPACT }}",
              "status": "${{ env.STATUS }}",
              "createdAt": "${{ env.CREATED_AT }}",
              "updatedAt": "${{ env.UPDATED_AT }}",
              "pageId": "${{ env.STATUSPAGE_PAGE_ID }}"
            }
          relations: |-
            {
              "statuspage": "${{ env.STATUSPAGE_PAGE_ID }}"
            }
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: UPSERT
          runId: ${{ fromJson(inputs.port_context).runId }}
      

      - name: Notify Port (Initial)
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).runId }}
          status: "SUCCESS"
          logMessage: |
            Finished creating Statuspage incident: ${{ inputs.incident_title }}
```
</details>

2. Create the file `update-statuspage-incident.yml` in the `.github/workflows` folder of your repository.

<details>
<summary>`update-statuspage-incident` GitHub Workflow</summary>

```yaml showLineNumbers title="update-statuspage-incident.yml"
name: Update Statuspage Incident

on:
  workflow_dispatch:
    inputs:
      incident_id:
        description: 'ID of the Statuspage incident to update'
        required: true
      new_incident_status:
        description: 'New status of the incident'
        required: true
      update_message:
        description: 'message to include in the update'
        required: false
      port_context:
        description: "Port context"
        required: true


env:
  STATUSPAGE_PAGE_ID: ${{ fromJson(inputs.port_context).entity.relations.statuspage || secrets.STATUSPAGE_PAGE_ID }}
  INCIDENT_ID: ${{ fromJson(inputs.port_context).entity.identifier }}

jobs:
  update_incident:
    runs-on: ubuntu-latest
    steps:
      - name: Notify Port (Initial)
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).runId }}
          logMessage: |
            Creating Statuspage incident: ${{ inputs.incident_id }} in status page: ${{ fromJson(inputs.port_context).entity.title }}

      - name: Update Statuspage Incident
        run: |
          curl -X PUT https://api.statuspage.io/v1/pages/${{ env.STATUSPAGE_PAGE_ID }}/incidents/${{ env.INCIDENT_ID }} \
            -H 'Authorization: OAuth ${{ secrets.STATUSPAGE_API_KEY }}' \
            -H 'Content-Type: application/json' \
            -d '{
              "incident": {
                "body": "${{ inputs.update_message }}",
                "status": "${{ inputs.new_incident_status }}",
                "metadata": {
                  "port": {
                    "runId": "${{ fromJson(inputs.port_context).runId }}",
                    "trigger": "${{ fromJson(inputs.port_context).trigger }}"
                  }
                }
              }
            }'

      - name: Upsert Entity in Port
        uses: port-labs/port-github-action@v1
        with:
          identifier: ${{ fromJson(inputs.port_context).entity.identifier }}
          title: ${{ fromJson(inputs.port_context).entity.title }}
          team: "[]"
          icon: DefaultBlueprint
          blueprint: ${{ fromJson(inputs.port_context).blueprint }}
          properties: |-
            {
              "status": "${{ inputs.new_incident_status }}"
            }
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          operation: UPSERT
          runId: ${{ fromJson(inputs.port_context).runId }}
      
      - name: Notify Port about Update
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          status: "SUCCESS"
          runId: ${{ fromJson(inputs.port_context).runId }}
          logMessage: |
            Updated Statuspage incident (${{ inputs.incident_id }}) to status: ${{ inputs.new_incident_status }}
```
</details>

3. Customize Your Workflow. Refer to the [Statuspage API docs](https://developer.statuspage.io/#operation/postPagesPageIdIncidents) to tailor the data fields sent within your workflow to align perfectly with your needs.

<PortApiRegionTip/>

## Port Configuration

Create two self service actions using the following JSON configuration.

<details>
<summary><b> Create Statuspage Incident (click to expand) </b></summary>

<GithubActionModificationHint/>

```json showLineNumbers
{
  "identifier": "create_statuspage_incident",
  "title": "Create Statuspage Incident",
  "icon": "Alert",
  "description": "Create a Statuspage incident",
  "trigger": {
    "type": "self-service",
    "operation": "CREATE",
    "userInputs": {
      "properties": {
        "incident_title": {
          "type": "string",
          "title": "Incident Title",
          "description": "Concise title for the incident"
        },
        "incident_message": {
          "type": "string",
          "title": "Incident Description",
          "description": "Detailed description of the incident"
        },
        "incident_severity": {
          "type": "string",
          "title": "Incident Severity",
          "enum": [
            "none",
            "minor",
            "major",
            "critical"
          ]
        },
        "incident_status": {
          "type": "string",
          "title": "Incident Status",
          "enum": [
            "investigating",
            "identified",
            "monitoring",
            "resolved"
          ]
        },
        "status_page": {
          "type": "string",
          "title": "Status Page",
          "blueprint": "statuspage",
          "description": "The status page",
          "format": "entity"
        }
      },
      "required": [
        "incident_title",
        "incident_message",
        "incident_severity",
        "incident_status"
      ],
      "order": [
        "incident_title",
        "incident_message",
        "incident_severity",
        "incident_status",
        "status_page"
      ]
    },
    "blueprintIdentifier": "statuspageIncident"
  },
  "invocationMethod": {
    "type": "GITHUB",
    "org": "<GITHUB_ORG>",
    "repo": "<GITHUB_REPO>",
    "workflow": "create-statuspage-incident.yml",
    "workflowInputs": {
      "incident_title": "{{ .inputs.\"incident_title\" }}",
      "incident_message": "{{ .inputs.\"incident_message\" }}",
      "incident_severity": "{{ .inputs.\"incident_severity\" }}",
      "incident_status": "{{ .inputs.\"incident_status\" }}",
      "port_context": {
        "entity": "{{.entity}}",
        "blueprint": "{{.action.blueprint}}",
        "runId": "{{.run.id}}",
        "trigger": "{{ .trigger }}"
      }
    },
    "reportWorkflowStatus": true
  },
  "requiredApproval": false
}
```

</details>

<details>
<summary><b> Update Statuspage Incident (click to expand) </b></summary>

<GithubActionModificationHint/>

```json showLineNumbers
{
  "identifier": "update_statuspage_incident",
  "title": "Update Statuspage Incident",
  "icon": "Alert",
  "description": "Update the status of an existing Statuspage incident",
  "trigger": {
    "type": "self-service",
    "operation": "DAY-2",
    "userInputs": {
      "properties": {
        "new_incident_status": {
          "type": "string",
          "title": "New Incident Status",
          "enum": [
            "investigating",
            "identified",
            "monitoring",
            "resolved"
          ]
        },
        "update_message": {
          "type": "string",
          "title": "Update Message (Optional)",
          "description": "Additional information about the status update"
        }
      },
      "required": [
        "new_incident_status"
      ],
      "order": [
        "new_incident_status",
        "update_message"
      ]
    },
    "blueprintIdentifier": "statuspageIncident"
  },
  "invocationMethod": {
    "type": "GITHUB",
    "org": "<GITHUB_ORG>",
    "repo": "<GITHUB_REPO>",
    "workflow": "update-statuspage-incident.yml",
    "workflowInputs": {
      "incident_id": "{{ .entity.identifier }}",
      "new_incident_status": "{{ .inputs.\"new_incident_status\" }}",
      "update_message": "{{ .inputs.\"update_message\" }}",
      "port_context": {
        "entity": "{{.entity}}",
        "blueprint": "{{.action.blueprint}}",
        "runId": "{{.run.id}}",
        "trigger": "{{ .trigger }}"
      }
    },
    "reportWorkflowStatus": true
  },
  "requiredApproval": false
}
```
</details>

Now you should see the `Create Statuspage Incident` and `Update Statuspage Incident` actions in the self-service page.

## Let's test it!

### Prerequisites
To test the new actions, you need to make sure that your Port catalog contains your Statuspage entities, or that you added your Statuspage ID as a secret to your GitHub repository (under the `STATUSPAGE_PAGE_ID` secret in GitHub)

To find your Statuspage ID:

1. Browse to [Statuspage](https://manage.statuspage.io/)
2. Select the page you want to create an incident for from the sidebar on the left side
3. The Statuspage ID will appear in the URL. for example, given the URL: `https://manage.statuspage.io/pages/aaaaaaaaaaaa/incidents`, the Statuspage ID is `aaaaaaaaaaaa`


### Creating an Incident

1. Go to the [self-service hub](https://app.getport.io/self-serve) in Port.
2. Click the **Create Statuspage Incident** action.
3. Fill in the title, description, severity, and status.
4. Click Execute.

### Updating an Incident

1. Go to the [self-service hub](https://app.getport.io/self-serve) in Port.
2. Click the **Update Statuspage Incident** action.
3. Select the incident you want to update.
4. Choose the new status and add an optional update message.
5. Click Execute.

Congrats 🎉 You can now create and update a Statuspage incident in Port 🔥

