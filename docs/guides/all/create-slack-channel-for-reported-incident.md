---
sidebar_position: 12
tags:
  - Automations
  - PagerDuty
  - Slack
  - Incident
  - GitHub
displayed_sidebar: null
description: Learn how to create a Slack channel for reported incidents in Port, enhancing team communication and incident response.
---

import PortTooltip from "/src/components/tooltip/tooltip.jsx"
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"

# Automating incident management

## Overview

Solving incidents efficiently is a crucial part of any production-ready environment. When managing an incident, there are a few base concepts which are important to keep:
- **Real time notifications** - When an incident has been created, either by an alert or manually, it is important that a push notification will be sent to the relevant owners and stakeholders as soon as possible. This can be in the form of a Slack message, email or any other form of communication.
- **Documentation** - When there is an ongoing incident, it is important that different personas across the organization will be aware of it. Hence, it is important to document the incident in relevant places, for example as a Port entity, a GitHub issue or a Jira issue.
- **Visibility** - While troubleshooting, it is important to provide information to all relevant personas and stakeholders in the organization. An ideal place to manage an incident would be a group chat with the relevant people.

In this guide, we will be using Port's [Automations](/actions-and-automations/define-automations/define-automations.md) capabilities to automate incident management. 

## Prerequisites

- Install Port's [GitHub app](https://github.com/apps/getport-io) in your GitHub organization.
- Install Port's [PagerDuty integration](/build-your-software-catalog/sync-data-to-catalog/incident-management/pagerduty/pagerduty.md) for real-time incident ingestion to Port. This integration will in turn trigger our automation when a new incident is created in PagerDuty.
- [Ingest GitHub issues](/build-your-software-catalog/sync-data-to-catalog/git/github/examples/#mapping-repositories-and-issues) using Port's GitHub app.
- Prepare your Port organization's `Client ID` and `Client Secret`. To find you Port credentials, click [here](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials).
- Prepare a GitHub repository for maintaining your GitHub workflows, and other dependency files. In this guide we will be using `port-actions` as the repository name. 
- Configure a Slack app:
    1. [Create a slack app](https://api.slack.com/start/quickstart#creating) and install it in a workspace. Save the `Bot User OAuth Token` for later use.
    2. [Add the following permissions](https://api.slack.com/quickstart#scopes) to the Slack app in **OAuth & Permissions**. Create the permissions under the `Bot Token Scopes`:
        * [Create channel](https://api.slack.com/methods/conversations.create):
          `channels:manage`
          `groups:write`
          `im:write`
          `mpim:write`
        * [Send a message to a channel](https://api.slack.com/methods/chat.postMessage):
          `chat:write`
  

## Data model setup
For this guide, we will be making a few modifications to our pre-existing blueprints in order to support our use-case:

<details>
    <summary>`PagerDuty Incidents` blueprint</summary>

    Add the following property:

    ```json showLineNumbers
    "slack_channel": {
        "type": "string",
        "description": "The Slack Channel opened for troubleshooting this incident",
        "title": "Slack Channel URL",
        "icon": "Slack",
        "format": "url"
    }
    ```

    Add the following relations:

    ```json showLineNumbers
    "service": {
        "title": "Service",
        "description": "The service this incident is related to",
        "target": "service",
        "required": false,
        "many": false
    },
    "issue": {
        "target": "githubIssue",
        "title": "GitHub Issue",
        "many": false,
        "required": false,
        "description": "The issue created for documenting this incident"
    }
    ```
</details>

:::note
For simplicity, in this guide we will assume that the GitHub `Service` entity identifier is the `PagerDuty Service` identifier, lowercased and split by `-`.

For example, a PagerDuty incident which is part of the `My Service` PagerDuty service will be related to the `my-service`  GitHub service.
:::
 
## Automation setup
After we set up our data model, let's set up the Port automation. The automation will:
- Create a Slack channel for managing the incident and providing a place to troubleshoot.
- Send a brief message regarding the incident in the Slack channel for visibility.
- Create a GitHub issue to document the incident.

### Automation backend
As a backend for this automation, we will create a GitHub Workflow in our repository.

<details>
    <summary>`Handle incident` GitHub workflow YAML</summary>

This workflow is responsible for managing a new incident. It will be triggered via Port automation.

```yaml showLineNumbers title=".github/workflows/handle-incident.yaml"
name: Handle Incident

on:
  workflow_dispatch:
    inputs:
      port_payload:
        description: "Port's payload, including details for who triggered the action and general context (blueprint, run ID, etc...)."
        required: true

# These permissions are required for the GitHub issue creation
permissions:
  contents: read
  issues: write 

jobs:
  handle-new-incident:
    runs-on: ubuntu-latest
    env:
      PD_INCIDENT_ID: ${{ fromJson(inputs.port_payload).event.diff.after.identifier }}
      PD_INCIDENT_URL: ${{ fromJson(inputs.port_payload).event.diff.after.properties.url }}
      PD_INCIDENT_TITLE: ${{ fromJson(inputs.port_payload).event.diff.after.title }}
      PORT_INCIDENT_URL: https://app.getport.io/pagerdutyIncidentEntity?identifier=${{ fromJson(inputs.port_payload).event.diff.after.identifier }}

    steps:
      - uses: actions/checkout@v4

      - name: Log GitHub Issue Creation
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ fromJson(github.event.inputs.port_payload).run.id }}
          logMessage: "Creating a new GitHub issue for PagerDuty incident '${{ env.PD_INCIDENT_ID }}'..."

      - name: Get incident's related service
        id: get-incident-service
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: GET
          blueprint: pagerdutyService
          identifier: ${{ fromJson(inputs.port_payload).event.diff.after.relations.pagerdutyService }}
      
      # The GitHub Service entity identifier is defined as PagerDuty title lowercased and split by '-'
      - name: Extract related service
        id: get-service-info
        run: |
          service_title=$(echo '${{ steps.get-incident-service.outputs.entity }}' | jq -r '.title')
          echo "SERVICE_TITLE=$service_title" >> $GITHUB_OUTPUT
          echo "SERVICE_IDENTIFIER=$(echo $service_title | tr '[:upper:] ' '[:lower:]-')" >> $GITHUB_OUTPUT

      - name: Create GitHub issue
        uses: dacbd/create-issue-action@main
        id: create-github-issue
        with:
          token: ${{ secrets.ORG_ADMIN_TOKEN }}
          repo: ${{ steps.get-service-info.outputs.SERVICE_IDENTIFIER }}
          title: PagerDuty incident - ID ${{ env.PD_INCIDENT_ID }}
          labels: bug, incident, pagerduty
          body: |
            PagerDuty incident issue reported.
            Port Incident Entity URL: ${{ env.PORT_INCIDENT_URL }}.
            PagerDuty incident URL: ${{ env.PD_INCIDENT_URL }}.

      - name: Report GitHub issue to Port
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          identifier: ${{ steps.get-service-info.outputs.SERVICE_IDENTIFIER }}-${{ steps.create-github-issue.outputs.number }}
          blueprint: githubIssue
          relations: |
            {
              "service": "${{ steps.get-service-info.outputs.SERVICE_IDENTIFIER }}"
            }

      - name: Log Executing Request to Open Channel
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ fromJson(github.event.inputs.port_payload).run.id }}
          logMessage: | 
            GitHub issue created successfully - ${{ steps.create-github-issue.outputs.html_url }}
            Creating a new Slack channel for this incident...

      - name: Create Slack Channel
        id: create-slack-channel
        env:
          CHANNEL_NAME: incident-${{ env.PD_INCIDENT_ID }}
          SLACK_TOKEN: ${{ secrets.BOT_USER_OAUTH_TOKEN }}
        run: |
          channel_name=$(echo "${{ env.CHANNEL_NAME }}" | tr '[:upper:]' '[:lower:]')
          response=$(curl -s -X POST "https://slack.com/api/conversations.create" \
            -H "Authorization: Bearer ${{ env.SLACK_TOKEN }}" \
            -H "Content-Type: application/json" \
            -d "{\"name\":\"$channel_name\"}")
        
          # Check if the channel was created successfully
          ok=$(echo $response | jq -r '.ok')
          
          if [ "$ok" == "true" ]; then
            echo "Channel '$channel_name' created successfully."
            channel_id=$(echo $response | jq -r '.channel.id')
            echo "SLACK_CHANNEL_ID=$channel_id" >> $GITHUB_OUTPUT
          else
            error=$(echo $response | jq -r '.error')
            echo "Error creating channel: $error"
            echo "SLACK_ERROR=$error" >> $GITHUB_OUTPUT
            exit 1
          fi
          
      - name: Log failed Slack channel creation
        if: failure()
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ fromJson(github.event.inputs.port_payload).run.id }}
          logMessage: "Failed to create slack channel: ${{ steps.create-slack-channel.outputs.SLACK_ERROR }} ❌"

      - name: Log successful Slack channel creation
        if: success()
        uses: port-labs/port-github-action@v1
        env:
          SLACK_CHANNEL_URL: https://slack.com/app_redirect?channel=${{ steps.create-slack-channel.outputs.SLACK_CHANNEL_ID }}
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ fromJson(github.event.inputs.port_payload).run.id }}
          logMessage: |
            Channel created successfully - ${{ env.SLACK_CHANNEL_URL }} ✅

      - name: Send Slack Message
        uses: archive/github-actions-slack@v2.9.0
        env:
          SVC_ENTITY_URL: https://app.getport.io/serviceEntity?identifier=${{ steps.get-service-info.outputs.SERVICE_IDENTIFIER }}
          SVC_ENTITY_TITLE: ${{ steps.get-service-info.outputs.SERVICE_TITLE }}
        id: send-message
        with:
          slack-function: send-message
          slack-bot-user-oauth-access-token: ${{ secrets.BOT_USER_OAUTH_TOKEN }}
          slack-channel: ${{ steps.create-slack-channel.outputs.SLACK_CHANNEL_ID }}
          slack-text: | 
            :rotating_light: New Incident reported - ${{ env.PD_INCIDENT_TITLE }} :rotating_light:
              Urgency: `${{ fromJson(inputs.port_payload).event.diff.after.properties.urgency }}`
              Service: <${{ env.SVC_ENTITY_URL }}|${{ env.SVC_ENTITY_TITLE }}>
              Manage incident :point_right::skin-tone-4: <${{ env.PORT_INCIDENT_URL }}|here>!

              Please use this Slack channel to report any updates, ideas, or root-cause ideas related to this incident :thread:

      - name: Update incident entity with new information
        uses: port-labs/port-github-action@v1
        env:
          SLACK_CHANNEL_URL: https://slack.com/app_redirect?channel=${{ steps.create-slack-channel.outputs.SLACK_CHANNEL_ID }}
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          identifier: ${{ env.PD_INCIDENT_ID }}
          baseUrl: https://api.getport.io
          blueprint: pagerdutyIncident
          properties: |
            {
              "slack_channel": "${{ env.SLACK_CHANNEL_URL }}"
            }
          relations: | 
            {
              "githubIssue": "${{ steps.get-service-info.outputs.SERVICE_IDENTIFIER }}-${{ steps.create-github-issue.outputs.number }}",
              "service": "${{ steps.get-service-info.outputs.SERVICE_IDENTIFIER }}"
            }

      - name: Log Successful Action
        if: success()
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ fromJson(github.event.inputs.port_payload).run.id }}
          logMessage: |
            Done handling the new incident 💪🏻
```

<PortApiRegionTip/>

</details>

We also need to create the following secrets in our GitHub repository:
- `PORT_CLIENT_ID` - Your Port client ID.
- `PORT_CLIENT_SECRET` - Your Port client secret.
- `ORG_ADMIN_TOKEN` - Your GitHub personal access token.
- `BOT_USER_OAUTH_TOKEN` - The Slack app bot token.

If you've already completed the [scaffold a new service guide](/guides/all/scaffold-a-new-service), you should already have the first three configured.

### Automation trigger
After setting up the automation backend, we will create the Port automation which will trigger the backend.
Navigate to your [Automations](https://app.getport.io/settings/automations) page.

Click on the `+ New automation` button.

Create the following automation:

<details>
  <summary>`Incident management` automation JSON</summary>

  This automation will be triggered when a new `pagerdutyIncident` entity will be created.
  
  **Replace the `org` value with your GitHub organization name, and the `repo` value with your GitHub repository.**

```json showLineNumbers
{
  "identifier": "handle_new_incident",
  "title": "Handle new PagerDuty incident",
  "icon": "pagerduty",
  "description": "Create Slack channel for incident troubleshooting, and GitHub issue for documentation",
  "trigger": {
    "type": "automation",
    "event": {
      "type": "ENTITY_CREATED",
      "blueprintIdentifier": "pagerdutyIncident"
    }
  },
  "invocationMethod": {
    "type": "GITHUB",
    "org": "<GITHUB ORG>",
    "repo": "<GITHUB REPOSITORY>",
    "workflow": "handle-incident.yaml",
    "workflowInputs": {
      "port_payload": "{{ . }}"
    },
    "reportWorkflowStatus": true
  },
  "requiredApproval": false,
  "publish": true
}
```

</details>

Press `Save`.

### Testing the automation flow
Now that we have both the automation backend, and the Port automation set up, let's test our automation flow:
1. Head over to your PagerDuty account.
2. Create a new PagerDuty incident.
3. Navigate to your [PagerDuty Incidents](https://app.getport.io/pagerdutyIncidents) entities page. Make sure your new incident was ingested in to Port.

<!-- Incident entities page - show new incident entity -->
<p align="center">
<img src='/img/guides/slackIncidentGuide/newIncidentEntity.png' width='75%' border='1px' />
</p>

4. Navigate to your [runs audit page](https://app.getport.io/settings/AuditLog?activeTab=4). You should see a new `Automation` run was triggered.

<!-- Runs page - showing the new automation run -->
<p align="center">
<img src='/img/guides/slackIncidentGuide/newAutomationRun.png' width='50%' border='1px' />
</p>

5. Click on the run and view the logs. Wait for the run to be in `Success` state.

<!-- Run page - successful run -->
<p align="center">
<img src='/img/guides/slackIncidentGuide/successfulAutomationRun.png' width='75%' border='1px' />
</p>

6. Navigate back to your [PagerDuty Incidents](https://app.getport.io/pagerdutyIncidents) page. Click on the incident entity you ingested.
7. You should notice that the `Slack Channel URL` property, and the `GitHub Issue` relation are populated.

<!-- Incident entity page - Updated properties -->
<p align="center">
<img src='/img/guides/slackIncidentGuide/updatedIncidentEntity.png' width='75%' border='1px' />
</p>

8. Click the `Slack Channel URL`. This will allow you to join the dedicated Slack channel created for this incident.
9. Navigate to the `GitHub Issue` through the relation. Then navigate to the `Link` to view the GitHub issue created as part of the automation.

## Summary 
Using Port as the automation orchestrator, we created an incident management flow which helps us keep a high standard when facing new incidents.
This automation will enable faster notification and response time when handling new incidents, and create a dedicated place to keep track of the troubleshooting process and any relevant updates.

## Next Steps
This guide can be enhanced to further meet your organization's needs. Here are some ideas you can implement:
- Add a DAY-2 `Resolve incident` Port action to the `PagerDuty incident` which resolves the GitHub issue and sends an update in the Slack channel. You can use the following [guide](https://docs.port.io/guides/all/resolve-pagerduty-incident).
- Add a mirror property in the `PagerDuty incident` blueprint, to show the GitHub issue `Link` in the PagerDuty entity page.
- Filter the automation tirgger to only run for `High` urgency incidents.
- Add the Port service owner to the Slack channel as part of the automation.

