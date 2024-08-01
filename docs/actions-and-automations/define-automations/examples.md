---
sidebar_position: 3
title: Examples
---
import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortTooltip from "/src/components/tooltip/tooltip.jsx"
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



## Send a Slack message when a PR is open for more than 3 days

### Prerequisites

To use this automation, ensure you have:
- Port installed on GitHub.

### Integrate GitHub resources with Port

The goal of this section is to fill the software catalog with data directly from your GitHub organization. Port's GitHub app allows you to import `repositories`, `pull requests`, `workflows`, `teams` and other GitHub objects. For the purpose of this guide, we shall focus on pull requests (PR) object only. Follow the steps below to ingest your PR data to Port.

:::info Note
For the GitHub app installation, you will need to have a registered organization in Port and your Port user role must be set to `Admin`.
:::

1. **Install Port's GitHub app:**
   Follow the [installation guide](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/git/github/installation).

2. **Check if `Pull Request` <PortTooltip id="blueprint">blueprint</PortTooltip> exists:**
    - Go to your [Builder](https://app.getport.io/settings/data-model)
    - If the `Pull Request` <PortTooltip id="blueprint">blueprint</PortTooltip> exists, proceed to step 3 to add the `openDuration` property.
    - If the `Pull Request` <PortTooltip id="blueprint">blueprint</PortTooltip> does not exist, create it with the schema provided below.

    <details>
    <summary>GitHub pull request blueprint (click to expand)</summary>
    ```json showLineNumbers
    {
        "identifier": "githubPullRequest",
        "title": "Pull Request",
        "icon": "Github",
        "schema": {
            "properties": {
            "creator": {
                "title": "Creator",
                "type": "string"
            },
            "assignees": {
                "title": "Assignees",
                "type": "array"
            },
            "reviewers": {
                "title": "Reviewers",
                "type": "array"
            },
            "status": {
                "title": "Status",
                "type": "string",
                "enum": [
                "merged",
                "open",
                "closed"
                ],
                "enumColors": {
                "merged": "purple",
                "open": "green",
                "closed": "red"
                }
            },
            "closedAt": {
                "title": "Closed At",
                "type": "string",
                "format": "date-time"
            },
            "updatedAt": {
                "title": "Updated At",
                "type": "string",
                "format": "date-time"
            },
            "mergedAt": {
                "title": "Merged At",
                "type": "string",
                "format": "date-time"
            },
            "link": {
                "type": "string",
                "format": "url"
            },
            "openDuration": {
                "title": "Open Duration",
                "type": "string",
                "format": "timer",
                "default": "2024-08-01T12:25:23.000Z"
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

3. **Add `openDuration` **property** to `Pull Request` <PortTooltip id="blueprint">blueprint</PortTooltip> (if it already exists):**
    - Navigate to the `Pull Request` <PortTooltip id="blueprint">blueprint</PortTooltip> in your Port Builder.
    - Hover over it, click on the `...` button on the right, and select `Edit blueprint`.
   
      <br></br>

     <img src='/img/guides/githubPullRequestBlueprintUpdate.png' border='1px' />

     <br></br>

    - Click on `Edit JSON`
    - Add the following property:

    ```json showLineNumbers
    "openDuration": {
        "title": "Open Duration",
        "type": "string",
        "format": "timer",
        "default": "2024-08-01T12:25:23.000Z"
    }
    ```

4. **Ingest GitHub PR Data:**
    - Go to your [data sources page](https://app.getport.io/settings/data-sources), and click on your GitHub integration:

    <img src='/img/guides/githubAppIntegration.png' border='1px' />

    - Under the `resources` key, add the following YAML block to map the pull request entities and click `Save & Resync`:

    <details>
    <summary>Relation mapping (click to expand)</summary>

    ```yaml showLineNumbers
    resources:
      - kind: pull-request
        selector:
            query: "true"
        port:
            entity:
            mappings:
                identifier: ".head.repo.name + '-' + (.number|tostring)" # The Entity identifier will be the repository name + the pull request number
                title: ".title"
                blueprint: '"githubPullRequest"'
                properties:
                    creator: ".user.login"
                    assignees: "[.assignees[].login]"
                    reviewers: "[.requested_reviewers[].login]"
                    status: ".state"
                    closedAt: ".closed_at"
                    updatedAt: ".updated_at"
                    mergedAt: ".merged_at"
                    prNumber: ".id"
                    link: ".html_url"
                    openDuration: "((now | tonumber) + (3 * 24 * 60 * 60) | todateiso8601)" # For 1-minute timer, use ((now | tonumber) + 60 | todateiso8601)
    ```

    </details>

   You should now be able to see your GitHub pull requests ingested successfully in the software catalog.

### Create a Slack Webhook

To send messages to Slack, you need to create a Slack webhook. Follow the instructions below to create one:

1. **Create a Slack App:**
    - Go to [Slack API: Applications](https://api.slack.com/apps).
    - Click "Create New App"
    - Select "From scratch" and provide an app name and the workspace where the app will be installed.

2. **Add Incoming Webhooks:**
    - In your app settings, go to "Incoming Webhooks"
    - Click "Activate Incoming Webhooks"

3. **Create a Webhook URL:**
    - Click "Add New Webhook to Workspace"
    - Select a channel where the messages will be posted and click "Allow"
    - Copy the generated webhook URL.

For more details, refer to the [Slack Incoming Webhooks Guide](https://api.slack.com/messaging/webhooks).

:::tip Note
Replace `<Your Generated Slack Webhook>` in the automation definition with your actual Slack webhook URL.
:::

### Automation Definition

By using the `TIMER_PROPERTY_EXPIRED` trigger type,
we can run custom logic whenever the `openDuration` timer property expires on a `githubPullRequest` entity:

```json showLineNumbers
{
  "identifier": "prOpenForMoreThan3Days",
  "title": "Notify Slack on PR Open for More Than 3 Days",
  "icon": "Slack",
  "description": "Sends a Slack message when a PR has been open for more than 3 Days.",
  "trigger": {
    "type": "automation",
    "event": {
      "type": "TIMER_PROPERTY_EXPIRED",
      "blueprintIdentifier": "githubPullRequest",
      "propertyIdentifier": "openDuration"
    },
    "condition": {
      "type": "JQ",
      "expressions": [
        ".diff.after.properties.status == \"open\""
      ],
      "combinator": "and"
    }
  },
  "invocationMethod": {
    "type": "WEBHOOK",
    "url": "<Your Generated Slack Webhook>",
    "agent": false,
    "synchronized": true,
    "body": {
      "text": ":warning: *PR Overdue Notification*\n\n:page_facing_up: *Title:* {{ .event.diff.after.title }}\n\n:link: *Link:* <{{ .event.diff.after.properties.link }}|View PR>\n\n:bust_in_silhouette: *Creator:* {{ .event.diff.after.properties.creator }}\n\n:busts_in_silhouette: *Assignees:* {{ .event.diff.after.properties.assignees }}\n\n:eyes: *Reviewers:* {{ .event.diff.after.properties.reviewers }}"
    }
  },
  "publish": true
}
```

## Run History

- To check your run history click on this icon on the top right conner beneath the `Builder` icon

<br></br>
<img src='/img/automations/automationRunHistoryPointer.png' width='60%' />
<br></br>

- Click on it to view your run history
<br></br>
<img src='/img/automations/automationRunHistory.png' width='60%' />
<br></br>

---