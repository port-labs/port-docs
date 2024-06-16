---
sidebar_position: 12
tags:
  - Automations
  - Pagerduty
  - Slack
  - Incident
  - Github
---

import PortTooltip from "/src/components/tooltip/tooltip.jsx"

# Automating incident managment

## Overview

Solving incidents efficiently is a crucial part of any production-ready environment. When managing an incident, there are a base concepts which are important to keep:
- **Real time notifications** - When an incident has been created, either by an alert or manually, it is important that a push notification will be sent the the relvant authoritizes as soon as possible. This can be in the form of a Slack message, email or any other form of communication.
- **Documentation** - When there is an ongoing incident, it is important that different personas across the organization will be aware of it. Hence, it is important to document the incident in relevant places, for example as a Port entity, a Github issue or a Jira issue.
- **Visibility** - While troubleshooting, it is important to provide information both to all relevant personas in the organization. An ideal place to manage an incident would be a group chat with the relevant people.

In this guide, we will be using Port's [Automations](../actions-and-automations/define-automations/define-automations.md) capabilities to automate incident management. 

## Prerequisites
- Install Port's [Github app](https://github.com/apps/getport-io) in your Github organization.
- Install Port's [Pagerduty integration](../build-your-software-catalog/sync-data-to-catalog/incident-management/pagerduty.md) for real-tiome incident ingestion to Port. This integration will in turn trigger our automation when a new incident is created in Pagerduty.
- [Ingest Github issues](../build-your-software-catalog/sync-data-to-catalog/git/github/examples/resource-mapping-examples.md#mapping-repositories-and-issues) using Port's Github app.
- Prepare your Port organization's `Client ID` and `Client Secret`. To find you Port credentials, click [here](https://docs.getport.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials).
- Prepare a Github repository for maintaining your GitHub workflows, and other dependency files. In this guide we will be using `port-actions` as the repository name. 
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
    <summary>`Pagerduty Incidents` blueprint</summary>

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
        "title": "Github Issue",
        "many": false,
        "required": false,
        "description": "The issue created for documenting this incident"
    }
    ```
</details>

:::note
For simplicity, in this guide we will assume that the Github `Service` entity identifier is the `PagerDuty Service` identifier, lowercased and split by `-`.

For example, a Pagerduty incident which is part of the `My Service` Pagerduty service will be related to the `my-service`  Github service.
:::
 
## Automation setup
After we set up our data model, let's set up the Port automation. The automation will:
- Create a Slack channel for managing the incident and providing a place to troubleshoot.
- Send a breif message regarding the incident in the Slack channel for visibility.
- Create a Github issue for documenting the incident.

### Automation backend
As a backend for this automation, we will create a Github Workflow in our repository.

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

# These permissions are required for the Github issue creation
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

      - name: Log Github Issue Creation
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ fromJson(github.event.inputs.port_payload).run.id }}
          logMessage: "Creating a new Github issue for Pagerduty incident '${{ env.PD_INCIDENT_ID }}'..."

      - name: Get incident's related service
        id: get-incidient-service
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: GET
          blueprint: pagerdutyService
          identifier: ${{ fromJson(inputs.port_payload).event.diff.after.relations.pagerdutyService }}
      
      # The Github Service entity identifier is defined as Pagerduty title lowercased and split by '-'
      - name: Extract realted service
        id: get-service-info
        run: |
          service_title=$(echo '${{ steps.get-incidient-service.outputs.entity }}' | jq -r '.title')
          echo "SERVICE_TITLE=$service_title" >> $GITHUB_OUTPUT
          echo "SERVICE_IDENTIFIER=$(echo $service_title | tr '[:upper:] ' '[:lower:]-')" >> $GITHUB_OUTPUT

      - name: Create Github issue
        uses: dacbd/create-issue-action@main
        id: create-github-issue
        with:
          token: ${{ secrets.ISSUES_TOKEN }}
          repo: ${{ steps.get-service.info.outputs.SERVICE_IDENTIFIER }}
          title: PagerDuty incident - ID {{ env.PD_INCIDENT_ID }}
          labels: bug, incident, pagerduty
          body: |
            Pagerduty incidient issue reported.
            Port Incident Entity URL: {{ env.PORT_INCIDENT_URL }}.
            Pagerduty incident URL: {{ env.PD_INCIDENT_URL }}.

      - name: Report Github issue to Port
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
            Github issue created successfully - ${{ steps.create-github-issue.outputs.html_url }}
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
</details>

We also need to create the following secrets in our Github repository:
- `PORT_CLIENT_ID` - Your Port client ID.
- `PORT_CLIENT_SECRET` - Your Port client secret.
- `BOT_USER_OAUTH_TOKEN` - The Slack app bot token.

### Automation trigger
After setting up the automation backend, we will create the Port automation which will trigger the backend.
Navigate to your [Automations](https://app.getport.io/settings/automations) page.

Click on the `+ New automation` button.

Create the following automation:

<details>
  <summary>`Incident management` automation JSON</summary>

  This automation will be triggered when a new `pagerdutyIncident` entity will be created.
  
  **Replace the `org` value with your Github organization name, and the `repo` value with your Github repository.**

```json showLineNumbers
{
  "identifier": "handle_new_incident",
  "title": "Handle new Pagerduty incident",
  "icon": "Pagerduty",
  "description": "Create Slack channel for incident troubleshooting, and Github issue for documentation",
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
1. Head over to your Pagerduty account.
2. Create a new Pagerduty incident.
3. Navigate to your [Pagerduty Incidents](https://app.getport.io/pagerdutyIncidents) entities page. Make sure your new incident was ingested in to Port.

<!-- Incident entities page - show new incident entity -->
<p align="center">
<img src='/img/guides/slackIncidentGuide/newIncidentEntity.png' width='75%' border='1px' />
</p>

4. Navigate to your [runs audit page](https://app.getport.io/settings/AuditLog?activeTab=5). You should see a new `Automation` run was triggered.

<!-- Runs page - showing the new automation run -->
<p align="center">
<img src='/img/guides/slackIncidentGuide/newAutomationRun.png' width='50%' border='1px' />
</p>

5. Click on the run and view the logs. Wait for the run to be in `Success` state.

<!-- Run page - successful run -->
<p align="center">
<img src='/img/guides/slackIncidentGuide/successfulAutomationRun.png' width='75%' border='1px' />
</p>

6. Navigate back to your [Pagerduty Incidents](https://app.getport.io/pagerdutyIncidents) page. Click on the incident entity you ingested.
7. You should notice that the `Slack Channel URL` property, and the `Github Issue` relation are populated.

<!-- Incident entity page - Updated properties -->
<p align="center">
<img src='/img/guides/slackIncidentGuide/updatedIncidentEntity.png' width='75%' border='1px' />
</p>

8. Click the `Slack Channel URL`. This will allow you to join the dedicated Slack channel created for this incident.
9. Navigate to the `Github Issue` through the relation. Then navigate to the `Link` to view the Github issue created as part of the automation.

## Summary 
Using Port as the automation orchestrator, we created an incident management flow which helps us keep a high standard when facing new incidents.
This automation will allow a faster notification time regarding new incidents, and a dedicated place to keep track of the troubleshooting process and any interesting updates.

## Next Steps
This guide can be enhanced to further meet your organization's needs. Here are some nice ideas you can implement:
- Add a mirror property in the `Pagerduty incident` blueprint, to show the Github issue `Link` in the Pagerduty entity page.
- Add a DAY-2 `Resolve incident` Port action to the `Pagerduty incident` which resolves the Github issue and sends an update in the Slack channel.
- Filter the automation tirgger to only run for `High` urgency incidents.
- Add the Port service owner to the Slack channel as part of the automation.

