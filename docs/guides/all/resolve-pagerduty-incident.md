---
sidebar_position: 13
tags:
  - Automations
  - PagerDuty
  - Slack
  - Incident
  - GitHub
displayed_sidebar: null
description: Learn how to resolve PagerDuty incidents in Port, ensuring efficient incident management and quick resolution.
---

import PortTooltip from "/src/components/tooltip/tooltip.jsx"
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"

# Resolve PagerDuty incidents

## Overview

Solving incidents efficiently is a crucial part of any production-ready environment. When managing an incident, there are a few base concepts which are important to keep:
- **Real time notifications** - When an incident has been created, either by an alert or manually, it is important that a push notification will be sent to the relevant owners and stakeholders as soon as possible. This can be in the form of a Slack message, email or any other form of communication.
- **Documentation** - When there is an ongoing incident, it is important that different personas across the organization will be aware of it. Hence, it is important to document the incident in relevant places, for example as a Port entity, a GitHub issue or a Jira issue.
- **Visibility** - While troubleshooting, it is important to provide information to all relevant personas and stakeholders in the organization. An ideal place to manage an incident would be a group chat with the relevant people.

While it is important to efficiently manage an incident as it is being addressed, it is also just as important to efficiently summarize the incident and perform cleanup. In this guide, we will be using Port's [Self-Service Actions](https://docs.port.io/actions-and-automations/create-self-service-experiences/) capabilities to efficiently resolve and cleanup the resources related to the PagerDuty incident.

## Prerequisites
- Complete the [Automating incident management](https://docs.port.io/guides/all/create-slack-channel-for-reported-incident) guide.
- User email of a member in your PagerDuty account.


## Data model setup
For this guide, we will be using the same data model as in the [Automating incident management](https://docs.port.io/guides/all/create-slack-channel-for-reported-incident) guide.


### Action backend
As a backend for the Port Action, create a GitHub Workflow in your repository.

Create a workflow file with the following content:

<details>
    <summary>`Resolve incident` GitHub workflow YAML</summary>

This workflow is responsible for resolving an incident, notifying the Slack channel and closing the GitHub issue.
:::tip Update placeholders
   Replace the `<PAEGRDUTY_USER_EMAIL>` placeholder with the user email from the [prerequisites](#prerequisites) section. 
:::

```yaml showLineNumbers title=".github/workflows/resolve-incident.yaml"
name: Resolve Incident In PagerDuty
on:
  workflow_dispatch:
    inputs:
      port_payload:
        required: true
        description: includes blueprint, run ID, and entity identifier from Port.

permissions:
  contents: read
  issues: write 

jobs:
  resolve_incident:
    runs-on: ubuntu-latest
    env:
      PD_INCIDENT_ID: ${{ fromJson(inputs.port_payload).entity.identifier }}
      PD_INCIDENT_URL: ${{ fromJson(inputs.port_payload).entity.properties.url }}
      PD_INCIDENT_TITLE: ${{ fromJson(inputs.port_payload).entity.title }}
      PORT_INCIDENT_URL: https://app.getport.io/pagerdutyIncidentEntity?identifier=${{ fromJson(inputs.port_payload).entity.identifier }}
      PORT_RUN_ID: ${{fromJson(inputs.port_payload).run_id}}
    steps:
      - name: Log Executing Request to Resolve Incident
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ env.PORT_RUN_ID }}
          logMessage: "Resolving PagerDuty incident '${{ env.PD_INCIDENT_ID }}'..."

      - name: Request to Resolve Incident
        id: resolve_incident
        uses: fjogeleit/http-request-action@v1
        with:
          url: 'https://api.pagerduty.com/incidents'
          method: 'PUT'
          // highlight-next-line
          customHeaders: '{"Content-Type": "application/json", "Accept": "application/vnd.pagerduty+json;version=2", "Authorization": "Token token=${{ secrets.PAGERDUTY_API_KEY }}", "From": "<PAEGRDUTY_USER_EMAIL>"}'
          data: >-
              {
                "incidents": [
                  {
                    "id": "${{ env.PD_INCIDENT_ID}}",
                    "type": "incident_reference",
                    "status": "resolved"
                  }
                ]
              }
      - run: |
          echo '${{ steps.resolve_incident.outputs.response }}'

      - name: Log Before Processing Incident Response
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ env.PORT_RUN_ID }}
          logMessage: "Getting incident object from response received..."

      - name: Log Before Upserting Entity
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ env.PORT_RUN_ID }}
          logMessage: "Reporting the updated incident back to Port...🚀"

      - name: UPSERT Entity
        uses: port-labs/port-github-action@v1
        with:
          identifier: "${{ fromJson(steps.resolve_incident.outputs.response).incidents[0].id }}"
          title: "${{ fromJson(steps.resolve_incident.outputs.response).incidents[0].title }}"
          blueprint: ${{fromJson(inputs.port_payload).blueprint}}
          properties: |-
            {
              "status": "${{ fromJson(steps.resolve_incident.outputs.response).incidents[0].status }}",
              "url": "${{ fromJson(steps.resolve_incident.outputs.response).incidents[0].self }}",
              "urgency": "${{ fromJson(steps.resolve_incident.outputs.response).incidents[0].urgency }}",
              "responder": "${{ fromJson(steps.resolve_incident.outputs.response).incidents[0].assignments[0].assignee.summary}}",
              "escalation_policy": "${{ fromJson(steps.resolve_incident.outputs.response).incidents[0].escalation_policy.summary }}",
              "created_at": "${{ fromJson(steps.resolve_incident.outputs.response).incidents[0].created_at }}",
              "updated_at": "${{ fromJson(steps.resolve_incident.outputs.response).incidents[0].updated_at }}"
            }
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: UPSERT
          runId: ${{ env.PORT_RUN_ID }}

      - name: Log After Upserting Entity
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ env.PORT_RUN_ID }}
          logMessage: |
            Entity was updated successfully ✅

            Closing the Github issue...

      - name: Close Issue
        uses: peter-evans/close-issue@v3
        with:
          close-reason: Resolved
          token: ${{ secrets.GITHUB_TOKEN }}
          issue-number: ${{fromJson(inputs.port_payload).gh_issue_id}}
          comment: Issue was resolved. Closing ✅

      - name: Log before slack message
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ env.PORT_RUN_ID }}
          logMessage: |
            Github issue closed successfully ✅

            Updating the Slack channel that the incident was resolved...

      - name: Send Slack Message
        uses: archive/github-actions-slack@v2.9.0
        id: send-message
        with:
          slack-function: send-message
          slack-bot-user-oauth-access-token: ${{ secrets.BOT_USER_OAUTH_TOKEN }}
          slack-channel: ${{fromJson(inputs.port_payload).slack_channel_id}}
          slack-text: | 
            🚀 Incident was resolved 🚀
            View incident :point_right::skin-tone-4: <${{ env.PORT_INCIDENT_URL }}|here>!
            Good job everyone, thank you for your help 💪🏻

      - name: Finished handling resolution log
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ env.PORT_RUN_ID }}
          logMessage: |
            Incident '${{ env.PD_INCIDENT_ID }}' resolved successfully 💪🏻
```

<PortApiRegionTip/>

</details>


Make sure you created the following secrets in your GitHub repository (If you followed the [incident automation guide](https://docs.port.io/guides/all/create-slack-channel-for-reported-incident) then they should all already be in place):
- `PORT_CLIENT_ID` - Your Port client ID.
- `PORT_CLIENT_SECRET` - Your Port client secret.
- `BOT_USER_OAUTH_TOKEN` - The Slack app bot token.

## Port Action Configuration
Let's create the Port Self-service action:
1. Navigate to the `Self-service` tab in your Port organization.
2. Press `New action`.
3. Choose the `Edit JSON` option.
4. Create the action with the following JSON definition:
<details>

  <summary><b>Port Action: Resolve Incident (click to expand)</b></summary>
   :::tip action placeholders
   Replace the following placeholders to match your environment: 
- `<GITHUB-ORG>` - your GitHub organization or user name.
- `<GITHUB-REPO-NAME>` - your GitHub repository name.
:::


```json showLineNumbers
{
  "identifier": "pagerduty_resolve_incident",
  "title": "Resolve Incident",
  "icon": "pagerduty",
  "description": "Resolve incident in pagerduty",
  "trigger": {
    "type": "self-service",
    "operation": "DAY-2",
    "userInputs": {
      "properties": {},
      "required": [],
      "order": []
    },
    "blueprintIdentifier": "pagerdutyIncident"
  },
  "invocationMethod": {
    "type": "GITHUB",
    // highlight-start
    "org": "<GITHUB-ORG>",
    "repo": "<GITHUB-REPO-NAME>",
    // highlight-end
    "workflow": "resolve-incident.yaml",
    "workflowInputs": {
      "{{if (.inputs | has(\"ref\")) then \"ref\" else null end}}": "{{.inputs.\"ref\"}}",
      "{{if (.inputs | has(\"from\")) then \"from\" else null end}}": "{{.inputs.\"from\"}}",
      "port_payload": {
        "blueprint": "{{.action.blueprint}}",
        "slack_channel_id": "{{.entity.properties.slack_channel | split(\"=\") | .[-1]}}",
        "gh_issue_id": "{{.entity.relations.githubIssue | split(\"-\") | .[-1]}}",
        "entity": "{{.entity}}",
        "run_id": "{{.run.id}}"
      }
    },
    "reportWorkflowStatus": true
  },
  "requiredApproval": false
}
```

</details>

### Testing the Action
Let's test our action flow:
1. Head over to your Port organization.
2. Navigate to the `Self-service` tab.
3. Find the new `Resolve Incident` action and press `Execute`.
4. Fill the PagerDuty Incident you would like to resolve and press `Execute`.
5. Go to your Slack workspace and make sure the incident channel received a new message with the resolution details.
6. Head over to your Github repository and make sure the issue was closed.
7. Navigate to your [PagerDuty Incidents](https://app.getport.io/pagerdutyIncidents) entities page. Make sure the incident's status changed to `resolved`.

## Summary 
While in the previous guide we used Port as the automation orchestrator to manage the incident flow, this action will make it easier to resolve PagerDuty incidents including cleaning up all the additional resources we created for the incident in the automated process.

## Next Steps
- Add an Automation that will enhance the action in this guide, and will automatically trigger the incident resolution workflow, to perform automatic cleanup of incidents.
