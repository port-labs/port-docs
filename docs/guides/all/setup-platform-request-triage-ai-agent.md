---
displayed_sidebar: null
description: Set up a Platform Request Triage AI agent to help developers submit and track requests to the platform team.
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Set up the Platform Request Triage AI agent

## Overview

This guide will walk you through setting up a "Platform Request Triage" AI agent in Port. This agent helps developers submit requests to the platform team, tracks them, and notifies them upon completion. By the end of this guide, your developers will be able to create and monitor platform requests using natural language via Port's AI chat.

<img src="/img/ai-agents/aiAgentPlatformRequestExample.png" width="100%" border="1px" />

## Common use cases

- Submit requests for new infrastructure.
- Ask for support with CI/CD pipelines.
- Request resource scaling for services.
- Track the status of ongoing platform requests.

## Prerequisites

This guide assumes you have:
- A Port account with the [AI agents feature enabled](/ai-interfaces/ai-agents/overview#access-to-the-feature).
- The [Port Slack App](/ai-interfaces/slack-app) installed and configured.

## Setup

To create the Platform Request Triage AI agent, we will create a blueprint, a self-service action, two automations, and the AI agent itself.

### Create the Platform Request blueprint

This blueprint will define the data model for platform requests.

1.  Go to the [blueprints](https://app.getport.io/blueprints) page in Port.
2.  Click `+ Create`.
3.  Toggle `Json mode` on.
4.  Copy and paste the following JSON schema:

    <details>
    <summary><b>Platform Request blueprint (Click to expand)</b></summary>

    ```json
    {
      "identifier": "platform_request",
      "title": "Platform Request",
      "icon": "Octopus",
      "schema": {
        "properties": {
          "title": {
            "title": "Request Title",
            "description": "Brief title describing the platform request",
            "type": "string"
          },
          "description": {
            "title": "Description",
            "description": "Detailed description of what you need from the platform team",
            "type": "string",
            "format": "markdown"
          },
          "request_type": {
            "title": "Request Type",
            "description": "Category of platform request",
            "type": "string"
          },
          "runId": {
            "title": "Run ID",
            "description": "The associated run that created the request",
            "type": "string"
          },
          "urgency": {
            "icon": "DefaultProperty",
            "title": "Urgency",
            "description": "The ticket urgency",
            "type": "string",
            "enum": [
              "High",
              "Medium",
              "Low"
            ],
            "enumColors": {
              "High": "yellow",
              "Medium": "darkGray",
              "Low": "bronze"
            }
          },
          "status": {
            "type": "string",
            "title": "Status",
            "description": "The ticket status",
            "enum": [
              "Open",
              "In Progress",
              "Done",
              "Rejected"
            ],
            "enumColors": {
              "Open": "lightGray",
              "In Progress": "purple",
              "Done": "lime",
              "Rejected": "yellow"
            }
          },
          "status_description": {
            "type": "string",
            "title": "Status Description"
          }
        },
        "required": [
          "title",
          "request_type",
          "urgency"
        ]
      },
      "mirrorProperties": {},
      "calculationProperties": {},
      "aggregationProperties": {},
      "relations": {
        "requestor": {
          "title": "Requestor",
          "description": "Person who submitted this platform request",
          "target": "_user",
          "required": false,
          "many": false
        }
      }
    }
    ```
    </details>

5.  Click `Create`.

### Create the self-service action

This action will be used by the AI agent to create new platform requests.

1.  Go to the [actions](https://app.getport.io/actions) page.
2.  Click `+ New Action`.
3.  Toggle `Json mode` on.
4.  Copy and paste the following JSON schema:

    <details>
    <summary><b>Create Platform Request action (Click to expand)</b></summary>

    ```json
    {
      "identifier": "create_platform_request",
      "title": "Create Platform Request",
      "icon": "Octopus",
      "description": "Submit a request to the platform team for infrastructure, CI/CD, or resource support",
      "trigger": {
        "type": "self-service",
        "operation": "CREATE",
        "userInputs": {
          "properties": {
            "title": {
              "type": "string",
              "title": "Request Title",
              "description": "Brief title describing what you need"
            },
            "urgency": {
              "enum": [
                "Low",
                "Medium",
                "High",
                "Urgent"
              ],
              "type": "string",
              "title": "Urgency",
              "default": "Medium",
              "enumColors": {
                "Low": "lightGray",
                "High": "orange",
                "Medium": "yellow",
                "Urgent": "red"
              },
              "description": "How urgent is this request?"
            },
            "description": {
              "type": "string",
              "title": "Description",
              "format": "markdown",
              "description": "Detailed description of your request. Include context, timeline, and any specific requirements."
            },
            "request_type": {
              "enum": [
                "Infrastructure",
                "CI/CD Support",
                "Resource Scaling",
                "Research",
                "Other"
              ],
              "type": "string",
              "title": "Request Type",
              "enumColors": {
                "Other": "lightGray",
                "Research": "purple",
                "CI/CD Support": "green",
                "Infrastructure": "blue",
                "Resource Scaling": "orange"
              },
              "description": "What category best describes your request?"
            }
          },
          "required": [
            "title",
            "request_type",
            "urgency"
          ]
        },
        "blueprintIdentifier": "platform_request"
      },
      "invocationMethod": {
        "type": "WEBHOOK",
        "url": "https://slack.com/api/chat.postMessage",
        "agent": false,
        "synchronized": true,
        "method": "POST",
        "headers": {
          "Content-Type": "application/json; charset=utf-8",
          "Authorization": "Bearer {{ .secrets.\"__SLACK_APP_BOT_TOKEN_YOUR_TOKEN\" }}"
        },
        "body": {
          "blocks": [
            {
              "type": "markdown",
              "text": "\nYour platform request for *{{ .inputs.title}}* has been approved and is now `Done`! 🎉\n\nFor more information click <https://app.getport.io/platform_requestEntity?identifier={{ .run.id }}|here>."
            }
          ],
          "channel": "YOUR_CHANNEL_ID"
        }
      },
      "requiredApproval": {
        "type": "ANY"
      },
      "approvalNotification": {
        "type": "email"
      }
    }
    ```
    </details>

    :::info Slack Configuration
    To use the Slack integration for notifications, you need to provide a bot token and a channel ID.

    - **Bot Token**: Replace `__SLACK_APP_BOT_TOKEN_YOUR_TOKEN` with the credential name from Port's credentials. To find your credential name:
      1. Click on the `...` button in the top right corner of your Port application.
      2. Click on **Credentials**.
      3. Click on the `Secrets` tab.
      The credential name follows the pattern `__SLACK_APP_BOT_TOKEN_Txxxxxxxxxx`.
    - **Channel ID**: Replace `YOUR_CHANNEL_ID` with the ID of the Slack channel where you want to send notifications. You can also use a JQ expression to dynamically select the channel.

    For more details, refer to the [Port Slack App](/ai-interfaces/slack-app) documentation.
    :::

5.  Click `Create`.

### Create an automation to generate the request entity

This automation will trigger when the self-service action runs, creating a new `platform_request` entity.

1.  Go to the [actions](https://app.getport.io/actions) page and select the `Automations` tab.
2.  Click `+ New Automation`.
3.  Toggle `Json mode` on.
4.  Copy and paste the following JSON schema:

    <details>
    <summary><b>Create Platform Request automation (Click to expand)</b></summary>

    ```json
    {
      "identifier": "create_platform_requests",
      "title": "Create Platform Requests",
      "description": "Create platform requests upon requests",
      "icon": "Octopus",
      "trigger": {
        "type": "automation",
        "event": {
          "type": "RUN_CREATED",
          "actionIdentifier": "create_platform_request"
        },
        "condition": {
          "type": "JQ",
          "expressions": [],
          "combinator": "and"
        }
      },
      "invocationMethod": {
        "type": "UPSERT_ENTITY",
        "blueprintIdentifier": "platform_request",
        "mapping": {
          "identifier": "{{ .event.diff.after.id }}",
          "title": "{{ .trigger.by.user.email }} - {{ .event.diff.after.properties.title }}",
          "properties": {
            "title": "{{ .event.diff.after.properties.title }}",
            "status": "Open",
            "urgency": "{{ .event.diff.after.properties.urgency }}",
            "description": "{{ .event.diff.after.properties.description }}",
            "request_type": "{{ .event.diff.after.properties.request_type }}",
            "runId": " {{ .event.diff.after.id }}"
          },
          "relations": {
            "requestor": "{{ .trigger.by.user.email }}"
          }
        }
      },
      "publish": true
    }
    ```
    </details>

5.  Click `Create`.

### Create an automation to approve the run

This automation will approve the original action run when the platform team updates the request's status.

1.  Go to the [actions](https://app.getport.io/actions) page and select the `Automations` tab.
2.  Click `+ New Automation`.
3.  Toggle `Json mode` on.
4.  Copy and paste the following JSON schema:

    <details>
    <summary><b>Approve Platform Request Run automation (Click to expand)</b></summary>

    ```json
    {
      "identifier": "approve_platform_request_run",
      "title": "Approve Platform Request Run",
      "description": "Approve platform requests runs when done",
      "icon": "Octopus",
      "trigger": {
        "type": "automation",
        "event": {
          "type": "ENTITY_UPDATED",
          "blueprintIdentifier": "platform_request"
        },
        "condition": {
          "type": "JQ",
          "expressions": [
            ".diff.after.properties.status  != \"Open\"",
            ".diff.after.properties.status  != \"In Progress\""
          ],
          "combinator": "and"
        }
      },
      "invocationMethod": {
        "type": "WEBHOOK",
        "url": "https://api.us.getport.io/v1/actions/runs/{{ .event.diff.after.properties.runId }}/approval",
        "agent": false,
        "synchronized": true,
        "method": "PATCH",
        "headers": {
          "RUN_ID": "{{ .run.id }}",
          "Content-Type": "application/json"
        },
        "body": {
          "status": "{{ .event.diff.after.properties | if .status == \"Done\" then \"APPROVE\" elif .status == \"Rejected\" then \"DECLINE\" else \"DECLINE\" end }}",
          "{{if (.event.diff.after.properties.status_description != null) then \"description\" else null end}}": "{{ .event.diff.after.properties.description }}"
        }
      },
      "publish": true
    }
    ```
    </details>

5.  Click `Create`.

### Create the AI agent

Finally, let's create the AI agent that will interact with users.

1.  Go to the [AI Agents](https://app.getport.io/_ai_agents) page.
2.  Click `+ AI Agent`.
3.  Toggle `Json mode` on.
4.  Copy and paste the following JSON schema:

    <details>
    <summary><b>Platform Bot agent (Click to expand)</b></summary>

    ```json
    {
      "identifier": "platform_bot",
      "title": "Platform Bot",
      "icon": "Octopus",
      "properties": {
        "description": "Platform Bot responsible for helping developers create platform requests and check their status. Assists with infrastructure, CI/CD, resource scaling, and research requests.",
        "status": "active",
        "allowed_blueprints": [
          "platform_request",
          "_user",
          "_team"
        ],
        "allowed_actions": [
          "create_platform_request"
        ],
        "prompt": "You are the Platform Team assistant. Help developers:\n1. Create platform requests by understanding their needs and pre-filling forms\n2. Check status of existing requests\n3. Provide guidance on request types",
        "execution_mode": "Automatic",
        "conversation_starters": [
          "I need help scaling our payment service resources",
          "Can you create a request for CI/CD pipeline optimization?",
          "What platform requests are currently open?",
          "Show me my pending platform requests",
          "I need research help for implementing Redis caching"
        ]
      },
      "relations": {}
    }
    ```
    </details>

5.  Click `Create`.

## How it works

Here's a summary of the workflow you just created:

1.  A developer uses the **Platform Bot** (from Slack or the Port UI) to create a new platform request.
2.  The AI agent triggers the **Create Platform Request** self-service action.
3.  The action run is created and is in an `Awaiting approval` state.
4.  The **Create Platform Requests** automation is triggered by the new run, creating a `platform_request` entity with a status of `Open`.
5.  A platform engineer reviews the open request. They can update its status to `In Progress`, and eventually to `Done` or `Rejected`.
6.  When the status changes to `Done` or `Rejected`, the **Approve Platform Request Run** automation is triggered.
7.  This automation approves or declines the original action run.
8.  Upon approval, the action's invocation method is executed, sending a **Slack notification** to the requester.

## Interact with the agent

You can interact with the Platform Bot AI agent in two main ways: through the Port UI or via Slack.

<Tabs groupId="interaction-methods" queryString>
<TabItem value="ui" label="Port UI">

Add an **AI Agent widget** to your Port dashboard:

1.  Go to the [homepage](https://app.getport.io/organization/home) of your portal.
2.  Click `+ Widget` and choose `AI agent`.
3.  Set the `Title` to "Platform Bot" and select it from the `Agent` dropdown.
4.  Click `Save`.

You can now use the widget to interact with your agent.
<img src="/img/ai-agents/aiAgentPlatformRequestWidget.png" width="100%" border="1px" />
</TabItem>
<TabItem value="slack" label="Slack Integration">

In Slack, you can either send a direct message to the Port AI Assistant or mention it in any channel it's part of.

Example queries:
```markdown
@Port I need to request a new CI/CD pipeline for my project. It's high urgency.
@Port What is the status of my request to scale the payment service?
@Port Show me all open platform requests.
```
<img src="/img/ai-agents/aiAgentPlatformRequestSlack.png" width="100%" border="1px" />
</TabItem>
</Tabs>

## Possible enhancements

- **Automated Request Fulfillment**: For common and simple requests, you can enhance the AI agent by allowing it to trigger other self-service actions that fulfill the request automatically, bypassing the manual triage process. For example, if you have an action to scaffold a new service, the agent can trigger it directly for such requests.
- **Dynamic Notifications**: Instead of a hardcoded Slack channel, you can use JQ in the `create_platform_request` action to send notifications to the requestor's team channel or to the requestor directly via DM.
- **Richer Context**: Add more blueprints to the agent's `allowed_blueprints` to provide it with more context about your services, environments, and teams. This will allow it to answer more complex questions. 