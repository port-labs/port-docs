---
sidebar_position: 3
title: Examples
---
import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortTooltip from "/src/components/tooltip/tooltip.jsx"
import SlackTeamsMessagingWebhook from "/docs/actions-and-automations/define-automations/templates/_slack_teams_webhook_setup_instructions.mdx"
import PortApiRegion from "/docs/generalTemplates/_port_api_available_regions.md"

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
    }
  },
  "publish": true
}
```

### Backend - Webhook

Since the webhook implementation is entirely up to you, it can be used to terminate the environment, clean up resources, send a notification to the relevant team, and anything else that you want to happen as part of the termination process.  
The run id can be used to [interact with the execution in Port](/actions-and-automations/reflect-action-progress/) - send log messages and/or update the execution's status.

---

## Automatically trigger a self-service action

Say you have a self-service action that sends a Slack notification, with the identifier `slack_notify`.  
The following example shows an automation definition that triggers this self-service action, when a service's `passed` property changes from `Passed` to `Not passed`:

### Automation definition
<PortApiRegion />
```json showLineNumbers
{
  "identifier": "slack_notify_on_service_failure",
  "title": "Notify via Slack on service failure",
  "trigger": {
    "type": "automation",
    "event": {
      "type": "ENTITY_UPDATED",
      "blueprintIdentifier": "service"
    },
    "condition": {
      "type": "JQ",
      "expressions": [
        ".diff.before.properties.passed == \"Passed\"",
        ".diff.after.properties.passed == \"Not passed\""
      ],
      "combinator": "and"
    }
  },
  "invocationMethod": {
    "type": "WEBHOOK",
    "url": "https://api.getport.io/v1/actions/slack_notify/runs?run_as=user-email@gmail.com",
    "synchronized": true,
    "method": "POST",
    "body": {
      "properties": {
        "message": "Service {{ .event.diff.before.title }} has degraded from `Passed` to `Not passed`."
      }
    }
  },
  "publish": true
}
```

### Backend - direct API call (webhook)

In this example, the automation directly triggers an existing self-service action by making a request to [Port's API](/api-reference/execute-a-self-service-action).

The webhook will trigger the `slack_notify` action with the specified message whenever a service's `passed` property changes from `Passed` to `Not passed`.

Note the following:

- `synchronized` must be set to `true`, so that the automation's status will be updated when the action is triggered.

- In the `url` field, you can add `run_as` to the url to specify the user that will execute the action (replace `user-email@gmail.com` with the desired user's email).  
  If you don't specify a user, the action will be executed using the organization's default credentials.

- The `body.properties` object contains the action's user inputs. If the action does not require any inputs, pass an empty object:
   ```json
   "body": {
      "properties": {}
   }
   ```

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

## Send a Slack message when a deployment fails

By using the `RUN_UPDATED` trigger type, we can run custom logic whenever a change occurs in an [action run](/actions-and-automations/reflect-action-progress/).  

The following example uses a [`Send Slack message`](/actions-and-automations/setup-backend/send-slack-message/) backend to notify a dedicated Slack channel when a deployment fails:

```json showLineNumbers
{
  "identifier": "notifyFailedDeployment",
  "title": "Notify via Slack about failed deployments",
  "trigger": {
    "type": "automation",
    "event": {
      "type": "RUN_UPDATED",
      "actionIdentifier": "deploy_an_image"
    },
    "condition": {
      "type": "JQ",
      "expressions": [
        ".diff.before.status == \"IN_PROGRESS\"",
        ".diff.after.status == \"FAILURE\""
      ],
      "combinator": "and"
    }
  },
  "invocationMethod": {
    "type": "WEBHOOK",
    "url": "<SLACK_WEBHOOK_URL>",
    "body": {
      "text": "Deployment of service \"{{ .event.diff.after.entity.identifier }}\" (image: {{ .event.diff.after.properties.image }}) to environment \"{{ .event.diff.after.properties.environment }}\" has failed.\nAction run details: https://app.getport.io/organization/run?runId={{ .event.diff.after.id }}"
    }
  },
  "publish": true
}
```

### Explanation

- This example assumes you have a `deploy_an_image` action that deploys an image to an environment.
- The automation is triggered whenever a change occurs in an action run of the `deploy_an_image` action.
  - Note the `condition` block that checks if the status of the action run has changed from `IN_PROGRESS` to `FAILURE`. Only this specific change will trigger the automation.
- The `invocationMethod` specifies a webhook that sends a message to a Slack channel.
  - The message includes details about the failed deployment, such as the service name, image, and environment.
  - The message also includes a link to the action run page in Port.

---

## Approve a self-service action based on an input value

When configuring [manual approval](/actions-and-automations/create-self-service-experiences/set-self-service-actions-rbac/#configure-manual-approval-for-actions) for a self-service action, in some cases you may want to automatically approve/decline the action if a certain input value is provided.

For example, the following automation will automatically approve a deployment if the `type` input is set to `Testing`:

```json showLineNumbers
{
  "identifier": "approve_deployment_based_on_input",
  "title": "Automatically approve testing deployments",
  "description": "Automatically approve testing deployments",
  "trigger": {
    "type": "automation",
    "event": {
      "type": "RUN_CREATED",
      "actionIdentifier": "deploy_service"
    },
    "condition": {
      "type": "JQ",
      "expressions": [
        ".diff.after.properties.type == \"Testing\""
      ],
      "combinator": "and"
    }
  },
  "invocationMethod": {
    "type": "WEBHOOK",
    "url": "https://api.getport.io/v1/actions/runs/{{.event.diff.after.id}}/approval",
    "agent": false,
    "synchronized": true,
    "method": "PATCH",
    "headers": {},
    "body": {
      "status": "APPROVE",
      "description": "Approved"
    }
  },
  "publish": true
}
```

### Explanation

- This automation is triggered whenever a new run is created for the `deploy_service` action.
- The `condition` block checks if the `type` input is set to `Testing`, and will only trigger the automation if this is the case.
- The backend of the automation directly makes an API call to approve the relevant run.
- Note that if the `condition` is not met, the automation will not be triggered.
