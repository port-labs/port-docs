---
sidebar_position: 3
title: Examples
---

import SlackTeamsMessagingWebhook from "/docs/actions-and-automations/define-automations/templates/_slack_teams_webhook_setup_instructions.mdx"

# Examples

This section provides examples of automation definitions in Port.

## Send a Slack/Teams message when a service becomes unhealthy

### Automation definition

By using the `ENTITY_UPDATED` trigger type, we can run custom logic whenever an entity of a specific type is updated.  

For example, the following definition will cause a message to be sent whenever a `service` entity's `status` property becomes `Unhealthy`:

```json showLineNumbers
{
  "identifier": "serviceUnHealthy",
  "title": "Service Health Changed",
  "trigger": {
    "type": "automation",
    "event": {
      "type": "ENTITY_UPDATED",
      "blueprintIdentifier": "service"
    },
    // The condition below checks the service's status property after the update
    // The automation will only run for services whose status becomes "Unhealthy"
    "condition": {
      "type": "JQ",
      "expressions": [
        ".diff.before.properties.status == \"Healthy\"",
        ".diff.after.properties.status == \"Unhealthy\""
      ],
      "combinator": "and"
    }
  },
  "invocationMethod": {
    "type": "GITHUB",
    "org": "github-org-name",
    "repo": "github-repo-name",
    "workflow": "slack-teams-notify-unhealthy-service.yaml",
    // workflowInputs is the payload to be passed to the GitHub workflow upon every execution
    // In this example, we pass the updated service's identifier
    "workflowInputs": {
      "service_name": "{{ .event.context.entityIdentifier }}"
    },
    "reportWorkflowStatus": true
  },
  "publish": true
}
```

### Backend - GitHub workflow

The `slack-teams-notify-unhealthy-service.yaml` workflow will contain the logic to send a Slack/Teams message.

<SlackTeamsMessagingWebhook/>

```yaml showLineNumbers title="slack-teams-notify-unhealthy-service.yaml"
name: Notify when service becomes unhealthy

on:
  workflow_dispatch:
    inputs:
      # Note that the input is the same as the payload (workflowInputs) defined in the automation
      service_name:
        description: "The unhealthy service's name"
        required: true
        type: string

jobs:
  send_message:
    runs-on: ubuntu-latest
    steps:
      - name: Send message to Slack
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
        run: |
          curl -X POST -H 'Content-type: application/json' --data '{"text":"The service ${{ inputs.service_name }} has become unhealthy."}' $SLACK_WEBHOOK_URL
      
      - name: Send message to Microsoft Teams
        env:
          TEAMS_WEBHOOK_URL: ${{ secrets.TEAMS_WEBHOOK_URL }}
        run: |
          curl -H 'Content-Type: application/json' -d '{"text": "The service ${{ inputs.service_name }} has become unhealthy."}' $TEAMS_WEBHOOK_URL
```

---

## Terminate an ephemeral environment when its TTL is expired

### Automation definition

By using the `TIMER_PROPERTY_EXPIRED` trigger type, we can run custom logic whenever a [timer property](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/timer) expires.
 
The following definition will cause a webhook to be triggered whenever the `ttl` property expires on an `environment` entity:

```json showLineNumbers
{
  "identifier": "ttlEphemeralEnvironment",
  "title": "Terminate ephemeral environment",
  "trigger": {
    "type": "automation",
    "event": {
      "type": "TIMER_PROPERTY_EXPIRED",
      "blueprintIdentifier": "environment",
      "propertyIdentifier": "ttl"
    }
  },
  "invocationMethod": {
    "type": "WEBHOOK",
    "url": "https://myWebhookUrl.com",
    // Under "body" we specify the payload to be passed to the webhook upon every execution
    // In this example, we pass the id of the entity whose TTL has expired and the run id
    "body": {
      "entityId": "{{ .event.context.entityIdentifier }}",
      "runId": "{{ .run.id }}"
    },
  },
  "publish": true
}
```

### Backend - Webhook

Since the webhook implementation is entirely up to you, it can be used to terminate the environment, clean up resources, send a notification to the relevant team, and anything else that you want to happen as part of the termination process.  
The run id can be used to [interact with the execution in Port](/actions-and-automations/reflect-action-progress/) - send log messages and/or update the execution's status.

---

## Send a Slack/Teams message when a TTL expires

### Automation definition

By using the `TIMER_PROPERTY_EXPIRED` trigger type, we can run custom logic whenever a [timer property](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/timer) expires.
 
The following definition will cause a GitHub workflow to be triggered whenever the `ttl` property expires on a `service` entity:

```json showLineNumbers
{
  "identifier": "ttlExpiresSendMessage",
  "title": "Send a message when TTL expires",
  "trigger": {
    "type": "automation",
    "event": {
      "type": "TIMER_PROPERTY_EXPIRED",
      "blueprintIdentifier": "Service",
      "propertyIdentifier": "ttl"
    }
  },
  "invocationMethod": {
    "type": "GITHUB",
    "org": "github-org-name",
    "repo": "github-repo-name",
    "workflow": "slack-teams-notify-ttl-expired.yaml",
    // workflowInputs is the payload to be passed to the GitHub workflow upon every execution
    // In this example, we pass the identifier of the service whose ttl expired
    "workflowInputs": {
      "service_name": "{{ .event.context.entityIdentifier }}"
    },
    "reportWorkflowStatus": true
  },
  "publish": true
}
```

### Backend - GitHub workflow

The `slack-teams-notify-ttl-expired.yaml` workflow will contain the logic to send a Slack/Teams message.

<SlackTeamsMessagingWebhook/>

```yaml showLineNumbers title="slack-teams-notify-ttl-expired.yaml"
name: Notify when a service's TTL expires

on:
  workflow_dispatch:
    inputs:
      # Note that the input is the same as the payload (workflowInputs) defined in the automation
      service_name:
        description: "The service's name"
        required: true
        type: string

jobs:
  send_message:
    runs-on: ubuntu-latest
    steps:
      - name: Send message to Slack
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
        run: |
          curl -X POST -H 'Content-type: application/json' --data '{"text":"The TTL property of service ${{ inputs.service_name }} has expired."}' $SLACK_WEBHOOK_URL
      
      - name: Send message to Microsoft Teams
        env:
          TEAMS_WEBHOOK_URL: ${{ secrets.TEAMS_WEBHOOK_URL }}
        run: |
          curl -H 'Content-Type: application/json' -d '{"text": "The TTL property of service ${{ inputs.service_name }} has expired."}' $TEAMS_WEBHOOK_URL
```

---