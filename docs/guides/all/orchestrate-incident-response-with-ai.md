---
displayed_sidebar: null
description: Learn how to implement an AI-powered incident response system that automatically orchestrates Slack channels, Zoom meetings, Jira tickets, and team notifications when incidents occur.
---

# Orchestrate incident response with AI

When incidents occur, engineers waste critical minutes manually coordinating response logistics instead of fixing the actual problem. They need to create dedicated Slack channels, set up Zoom meetings for war rooms, create tracking tickets in Jira, and notify the right people — all while gathering context about affected services.

This guide demonstrates how to implement an AI-powered incident response system in Port where a single incident trigger activates an AI agent that intelligently orchestrates the entire setup. The AI agent has access to Port actions (create Slack channel, generate meeting link, create Jira ticket, notify teams) and automatically executes the right sequence based on the incident context.

<img src="/img/guides/incident-orchestration-workflow.png" alt="Incident orchestration workflow to be updated" border="1px" width="100%" />

## Common use cases

- **Eliminate manual coordination delays** by automating incident setup tasks
- **Ensure consistent incident response** with standardized communication channels and tracking
- **Scale incident management** across teams without requiring every engineer to know all setup steps
- **Accelerate time to resolution** by removing logistics overhead during high-stress situations

## Prerequisites

This guide assumes the following:
- You have a Port account and have completed the [onboarding process](https://docs.port.io/getting-started/overview)
- You have access to one of Port's [incident management integrations](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/incident-management/) (we'll use PagerDuty in this guide)
- You have access to a [Slack developer account](https://api.slack.com/) with permissions to create apps
- You have access to a [Zoom developer account](https://marketplace.zoom.us/) with permissions to create Server-to-Server OAuth apps
- You have access to a Jira instance with API access
- You have access to [create and configure AI agents](https://docs.port.io/ai-interfaces/ai-agents/overview#getting-started-with-ai-agents) in Port

:::tip Alternative integrations
While this guide uses PagerDuty for incident management, you can adapt it for other incident management tools like FireHydrant, Incident.io, or Opsgenie. The same principles apply regardless of the incident source.
:::

## Set up data model

We will configure the necessary blueprint to support our AI-powered incident orchestration workflow.

### Create PagerDuty Incident blueprint

The incident blueprint will store incident data from your incident management tool and track orchestration results.

1. Go to the [builder](https://app.getport.io/settings/data-model) page of your portal.
2. Click on `+ Blueprint`.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration:

    <details>
    <summary><b>PagerDuty Incident blueprint (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "pagerdutyIncident",
      "description": "This blueprint represents a PagerDuty incident in our software catalog",
      "title": "PagerDuty Incident",
      "icon": "pagerduty",
      "schema": {
      "properties": {
        "status": {
          "icon": "DefaultProperty",
          "title": "Incident Status",
          "type": "string",
          "enum": [
            "triggered",
            "annotated",
            "acknowledged",
            "reassigned",
            "escalated",
            "reopened",
            "resolved",
            "escalated to human"
          ],
          "enumColors": {
            "triggered": "red",
            "annotated": "blue",
            "acknowledged": "yellow",
            "reassigned": "blue",
            "escalated": "yellow",
            "reopened": "red",
            "resolved": "green",
            "escalated to human": "bronze"
          }
        },
        "url": {
          "type": "string",
          "format": "url",
          "title": "Incident URL"
        },
        "urgency": {
          "title": "Incident Urgency",
          "type": "string",
          "enum": [
            "high",
            "low"
          ],
          "enumColors": {
            "high": "red",
            "low": "green"
          }
        },
        "priority": {
          "title": "Priority",
          "type": "string"
        },
        "severity": {
          "type": "string",
          "title": "Severity",
          "enum": [
            "Critical",
            "High",
            "Medium",
            "Low"
          ],
          "enumColors": {
            "Critical": "red",
            "High": "red",
            "Medium": "yellow",
            "Low": "lime"
          }
        },
        "description": {
          "type": "string",
          "title": "Description"
        },
        "assignees": {
          "title": "Assignees",
          "type": "array",
          "items": {
            "type": "string",
            "format": "user"
          }
        },
        "escalation_policy": {
          "type": "string",
          "title": "Escalation Policy"
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
        },
        "resolved_at": {
          "title": "Incident Resolution Time",
          "type": "string",
          "format": "date-time",
          "description": "The timestamp when the incident was resolved"
        },
        "recovery_time": {
          "title": "Time to Recovery",
          "type": "number",
          "description": "The time (in minutes) between the incident being triggered and resolved"
        },
        "triggered_by": {
          "type": "string",
          "title": "Triggered By"
        },
        "slack_channel": {
          "type": "string",
          "title": "Slack Channel",
          "description": "The Slack channel created for this incident",
          "icon": "Slack"
        },
        "zoom_meeting_link": {
          "type": "string",
          "title": "Zoom Meeting Link",
          "description": "The Zoom meeting link for the war room",
          "icon": "Team",
          "format": "url"
        },
        "jira_tracking_ticket": {
          "type": "string",
          "title": "Jira Tracking Ticket",
          "icon": "Jira",
          "format": "url",
          "description": "The Jira ticket created to track this incident"
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
          "many": false
        }
      }
    }
    ```
    </details>

5. Click `Create` to save the blueprint.

:::info If you already have PagerDuty integration installed
Port's PagerDuty integration creates a `pagerdutyIncident` blueprint by default. You can extend this existing blueprint by adding the following properties to enable orchestration tracking:

1. Go to the [builder](https://app.getport.io/settings/data-model) page of your portal.
2. Select the `PagerDuty Incident` blueprint.
3. Click on the `{...} Edit JSON` button.
4. Add the following properties under the `properties` schema:

    <details>
    <summary><b>PagerDuty Incident blueprint extended properties (Click to expand)</b></summary>

    ```json showLineNumbers
    "slack_channel": {
      "type": "string",
      "title": "Slack Channel",
      "description": "The Slack channel created for this incident"
    },
    "zoom_meeting_link": {
      "type": "string",
      "format": "url",
      "title": "Zoom Meeting Link",
      "description": "The Zoom meeting link for the war room"
    },
    "jira_tracking_ticket": {
      "type": "string",
      "format": "url",
      "title": "Jira Tracking Ticket",
      "description": "The Jira ticket created to track this incident"
    }
    ```
    </details>

The rest of this guide will reference `pagerdutyIncident` as the blueprint identifier.
:::

## Set up external tools

We need to configure integrations with Slack, Zoom, and Jira to enable the orchestration actions.

### Set up Slack App

1. [Create a Slack app](https://api.slack.com/start/quickstart#creating) and install it on a workspace.
2. [Add the following permissions](https://api.slack.com/quickstart#scopes) to the Slack app:
   - **Create channel** (Required):
     - `channels:manage`
     - `groups:write`
     - `im:write`
     - `mpim:write`
   - **Find a user with an email address** (Optional):
     - `users:read.email`
   - **Invite users to channel** (Optional):
     - `channels:write.invites`
     - `groups:write.invites`
     - `mpim:write.invites`
   - **Send messages** (Required):
     - `chat:write`
     - `chat:write.public`

    :::warning User permissions
    Without scopes for `Find a user with an email address` and `Invite users to channel`, the channel will be created but users will not be added to it automatically.
    :::

3. [Install the app in your Slack workspace](https://api.slack.com/quickstart#installing).
4. Navigate back to the **OAuth & Permissions page**. You will see an access token under **OAuth Tokens for Your Workspace** that you will use in the `SLACK_BOT_TOKEN` Port secret.

    <img src='/img/self-service-actions/setup-backend/github-workflow/slack-app.png' width='70%' border="1px" />

### Set up Zoom Meeting

Create a Server-to-Server OAuth app:

1. Go to [Zoom Marketplace](https://marketplace.zoom.us/).
2. Click **Develop → Build App** → select **Server-to-Server OAuth**.
3. Fill in the app details and make note of:
   - **Account ID**
   - **Client ID**
   - **Client Secret**
4. Under **Scopes**, add:
   - `meeting:write`
   - `meeting:read`
   - (optionally) `user:read`

    <img src='/img/guides/incident-orchestration-zoom-setup.png' width='70%' border="1px" />

### Set up Jira API access

1. Log in to your Jira instance.
2. Generate an API token:
   - Go to [Atlassian Account Settings](https://id.atlassian.com/manage-profile/security/api-tokens)
   - Click **Create API token**
   - Copy the generated token (you will need this for the Port secret)

## Add Port secrets

To add secrets to your portal:

1. Click on the `...` button in the top right corner of your Port application.
2. Click on **Credentials**.
3. Click on the `Secrets` tab.
4. Click on `+ Secret` and add the following secrets:
   - `SLACK_BOT_TOKEN` - Your Slack bot token from the OAuth & Permissions page
   - `ZOOM_ACCOUNT_ID` - Your Zoom account ID
   - `ZOOM_CLIENT_ID` - Your Zoom client ID
   - `ZOOM_CLIENT_SECRET` - Your Zoom client secret
   - `JIRA_AUTH` - Base64 encoded string of your Jira credentials. Generate this by running:
        ```bash
        echo -n "your-email@domain.com:your-api-token" | base64
        ```
        Replace `your-email@domain.com` with your Jira email and `your-api-token` with your Jira API token.

## Create self-service actions

We will create self-service actions that the AI agent can invoke to orchestrate incident response setup.

### Create Incident Slack Channel

This action creates a dedicated Slack channel for the incident.

1. Go to the [self-service](https://app.getport.io/self-serve) page of your portal.
2. Click on `+ New Action`.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration:

    <details>
    <summary><b>Create Incident Slack Channel (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "create_incident_slack_channel",
      "title": "Create Incident Slack Channel",
      "icon": "Slack",
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
        "type": "WEBHOOK",
        "url": "https://slack.com/api/conversations.create",
        "agent": false,
        "synchronized": true,
        "method": "POST",
        "headers": {
          "RUN_ID": "{{ .run.id }}",
          "Content-Type": "application/json",
          "Authorization": "Bearer {{ .secrets.SLACK_BOT_TOKEN }}"
        },
        "body": {
          "name": "{{ .entity.identifier | ascii_downcase }}",
          "is_private": false
        }
      },
      "requiredApproval": false,
      "description": "Creates a dedicated Slack channel for an incident"
    }
    ```
    </details>

5. Click `Save` to create the action.

### Create Zoom Meeting Link Initializer

This action obtains a Zoom access token and then triggers the meeting creation.

1. Go back to the [self-service](https://app.getport.io/self-serve) page of your portal.
2. Click on `+ New Action`.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration:

    <details>
    <summary><b>Create Zoom Meeting Link Initializer (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "create_zoom_meeting_link_initializer",
      "title": "Initialize Zoom Meeting Setup",
      "icon": "Team",
      "description": "Obtain Zoom access token and prepare for meeting creation",
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
        "type": "WEBHOOK",
        "url": "https://zoom.us/oauth/token",
        "agent": false,
        "synchronized": true,
        "method": "POST",
        "headers": {
          "RUN_ID": "{{ .run.id }}",
          "Content-Type": "application/x-www-form-urlencoded",
          "INCIDENT_ENTITY": "{{ .entity.identifier }}",
          "Authorization": "Basic {{ .secrets.ZOOM_CLIENT_ID + \":\" + .secrets.ZOOM_CLIENT_SECRET | @base64 }}"
        },
        "body": {
          "grant_type": "account_credentials",
          "account_id": "{{ .secrets.ZOOM_ACCOUNT_ID }}"
        }
      }
    }
    ```
    </details>

5. Click `Save` to create the action.

### Create Zoom Meet Link

This action creates the actual Zoom meeting using the access token.

1. Go back to the [self-service](https://app.getport.io/self-serve) page of your portal.
2. Click on `+ New Action`.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration:

    <details>
    <summary><b>Create Zoom Meet Link (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "create_zoom_meet_link",
      "title": "Create Zoom Meeting Link",
      "icon": "Team",
      "description": "Creates a Zoom meeting link for the incident war room",
      "trigger": {
        "type": "self-service",
        "operation": "CREATE",
        "userInputs": {
          "properties": {
            "zoom_access_token": {
              "title": "Zoom Access Token",
              "icon": "DefaultProperty",
              "type": "string"
            },
            "incident": {
              "title": "Incident",
              "icon": "DefaultProperty",
              "type": "string",
              "blueprint": "pagerdutyIncident",
              "format": "entity"
            }
          },
          "required": [
            "zoom_access_token",
            "incident"
          ],
          "order": [
            "zoom_access_token",
            "incident"
          ]
        }
      },
      "invocationMethod": {
        "type": "WEBHOOK",
        "url": "https://api.zoom.us/v2/users/me/meetings",
        "agent": false,
        "synchronized": true,
        "method": "POST",
        "headers": {
          "RUN_ID": "{{ .run.id }}",
          "Content-Type": "application/json",
          "INCIDENT_ENTITY": "{{ .inputs.incident.identifier }}",
          "Authorization": "Bearer {{ .inputs.zoom_access_token }}"
        },
        "body": {
          "topic": "{{ .inputs.incident.title }}",
          "type": 2,
          "start_time": "{{ now | todateiso8601 }}",
          "duration": 60,
          "timezone": "UTC",
          "settings": {
            "join_before_host": true,
            "mute_upon_entry": true
          }
        }
      }
    }
    ```
    </details>

5. Click `Save` to create the action.

### Create Jira Tracking Ticket

This action creates a Jira ticket to track the incident.

1. Go back to the [self-service](https://app.getport.io/self-serve) page of your portal.
2. Click on `+ New Action`.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration:

    <details>
    <summary><b>Create Jira Tracking Ticket (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "create_jira_tracking_ticket",
      "title": "Create Jira Tracking Ticket",
      "icon": "Jira",
      "description": "Creates a Jira tracking ticket from an incident",
      "trigger": {
        "type": "self-service",
        "operation": "DAY-2",
        "userInputs": {
          "properties": {
            "title": {
              "type": "string",
              "title": "Title",
              "description": "Title of the issue"
            },
            "description": {
              "type": "string",
              "title": "Description",
              "description": "Detailed description about the issue"
            },
            "issue_type": {
              "icon": "DefaultProperty",
              "title": "Issue Type",
              "type": "string",
              "default": "Bug",
              "enum": [
                "Epic",
                "Task",
                "Bug"
              ],
              "enumColors": {
                "Epic": "green",
                "Task": "lightGray",
                "Bug": "red"
              }
            }
          },
          "required": [
            "title"
          ],
          "order": [
            "title",
            "description",
            "issue_type"
          ]
        },
        "blueprintIdentifier": "pagerdutyIncident"
      },
      "invocationMethod": {
        "type": "WEBHOOK",
        "url": "https://<YOUR_JIRA_ORGANIZATION_URL>/rest/api/3/issue",
        "agent": false,
        "synchronized": true,
        "method": "POST",
        "headers": {
          "RUN_ID": "{{ .run.id }}",
          "Content-Type": "application/json",
          "Authorization": "Basic {{.secrets.JIRA_AUTH}}"
        },
        "body": {
          "fields": {
            "project": {
              "key": "<YOUR_JIRA_PROJECT>"
            },
            "summary": "{{.inputs.title}}",
            "description": {
              "type": "doc",
              "version": 1,
              "content": [
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "{{.inputs.description}}"
                    }
                  ]
                }
              ]
            },
            "issuetype": {
              "name": "{{.inputs.issue_type}}"
            },
            "labels": [
              "port-ai"
            ]
          }
        }
      },
      "requiredApproval": false
    }
    ```
    </details>

    :::tip Configure your Jira environment
    Replace `<YOUR_JIRA_ORGANIZATION_URL>` in the webhook URL with your Jira organization URL (e.g., `example.atlassian.net`). Also replace `<YOUR_JIRA_PROJECT>` with your actual Jira project key.
    :::

5. Click `Save` to create the action.

### Create Send Slack Message

This action sends notification messages to Slack channels.

1. Go back to the [self-service](https://app.getport.io/self-serve) page of your portal.
2. Click on `+ New Action`.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration:

    <details>
    <summary><b>Send Slack Message (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "send_a_slack_message",
      "title": "Send Slack Message",
      "icon": "Slack",
      "description": "Sends a notification message to a Slack channel",
      "trigger": {
        "type": "self-service",
        "operation": "CREATE",
        "userInputs": {
          "properties": {
            "channel": {
              "title": "Channel ID",
              "icon": "DefaultProperty",
              "type": "string",
              "description": "The Slack channel ID where the message will be sent"
            },
            "message": {
              "title": "Message",
              "icon": "DefaultProperty",
              "type": "string",
              "description": "The message content to send"
            }
          },
          "required": [
            "channel",
            "message"
          ],
          "order": [
            "channel",
            "message"
          ]
        }
      },
      "invocationMethod": {
        "type": "WEBHOOK",
        "url": "https://slack.com/api/chat.postMessage",
        "agent": false,
        "synchronized": true,
        "method": "POST",
        "headers": {
          "RUN_ID": "{{ .run.id }}",
          "Content-Type": "application/json",
          "Authorization": "Bearer {{ .secrets.SLACK_BOT_TOKEN }}"
        },
        "body": {
          "channel": "{{ .inputs.channel }}",
          "text": "{{ .inputs.message }}"
        }
      },
      "requiredApproval": false
    }
    ```
    </details>

5. Click `Save` to create the action.

## Create AI agent

Now we will create the AI agent that orchestrates the incident response setup.

1. Go to the [AI Agents](https://app.getport.io/_ai_agents) page of your portal.
2. Click on `+ AI Agent`.
3. Toggle `Json mode` on.
4. Copy and paste the following JSON schema:

    <details>
    <summary><b>Incident Orchestrator AI agent (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "incident_orchestrator_agent",
      "title": "Incident Orchestrator Agent",
      "icon": "Details",
      "team": [],
      "properties": {
        "description": "AI agent to orchestrate incident management",
        "status": "active",
        "prompt": "You are an AI Incident Orchestrator responsible for automating incident response setup. When an incident is triggered, your role is to analyze its severity, affected services, and context — then immediately execute the appropriate actions (create Slack channel, generate meeting link, create Jira tracking ticket, notify teams) using the available tools.\n\nYour goal is to remove all manual coordination delays. You must not just recommend or summarize actions — you must autonomously invoke the correct self-service actions in real time.\n\nCore Responsibilities:\n1. Analyze the incident payload (severity, affected service, owner, tier, assignee, etc.) to determine response scope.\n2. Decide and EXECUTE the correct actions based on severity/urgency/priority:\n   - **Critical or High** → ALWAYS run all these 4 actions `create_incident_slack_channel`, `create_zoom_meeting_link_initializer`, `create_jira_tracking_ticket`, and `send_a_slack_message` to notify all relevant teams.\n   - **Medium** → ALWAYS run  `create_incident_slack_channel`, `create_jira_tracking_ticket` and `send_a_slack_message`; skip zoom meet link setup unless escalation occurs.\n   - **Low** → run `send_a_slack_message` only.\n3. Each action must be invoked directly — do not output instructions or links for humans to click.\n4. After execution, summarize the outcome: which actions were triggered, resource names/links, and any context derived from the incident.\n\n#IMPORTANT\n1. NEVER FORGET to call the create the Zoom meeting action for HIGH/CRITICAL incidents (DO NOT SKIP IT).\n2. When creating a Slack channel, derive the channel name from the incident identifier by converting it to lowercase and replacing any invalid characters with hyphens (only lowercase letters, numbers, hyphens, and underscores are allowed). Capture the exact channel id/name returned by the `create_incident_slack_channel` action response and use that channel id when invoking `send_a_slack_message`. Never invent or guess channel ids or names — if the create-channel tool fails to return one, reuse the sanitized incident identifier as the channel name and report the issue in the summary.\n3. In case you run into errors when calling an action, use the available tools to describe the action details to understand the required properties and parameters.\n\nOperate decisively, execute autonomously, and provide a concise summary once orchestration is complete.",
        "execution_mode": "Automatic",
        "tools": [
          "^(list|get|search|track|describe)_.*",
          "run_create_incident_slack_channel",
          "run_create_jira_tracking_ticket",
          "run_create_zoom_meeting_link_initializer",
          "run_send_a_slack_message"
        ]
      },
      "relations": {}
    }
    ```
    </details>

5. Click `Create` to save the agent.


## Set up automations

We will create automations to orchestrate the complete incident response workflow:

1. Trigger the AI agent when incidents are created
2. Update the incident with Slack channel ID after creation
3. Create Zoom meeting after obtaining access token
4. Update incident with Zoom meeting link
5. Update incident with Jira ticket link

### Trigger Incident Orchestrator Agent

This automation invokes the Incident Orchestrator agent as soon as an incident is created.

1. Go to the [automations](https://app.getport.io/settings/automations) page of your portal.
2. Click on `+ Automation`.
3. Copy and paste the following JSON schema:

    <details>
    <summary><b>Trigger Incident Orchestrator Agent automation (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "trigger_incident_orchestrator_agent",
      "title": "Trigger Incident Orchestrator Agent",
      "description": "Automation to invoke the Incident Response Orchestrator agent as soon as an incident is created",
      "trigger": {
        "type": "automation",
        "event": {
          "type": "ENTITY_CREATED",
          "blueprintIdentifier": "pagerdutyIncident"
        },
        "condition": {
          "type": "JQ",
          "expressions": [],
          "combinator": "and"
        }
      },
      "invocationMethod": {
        "type": "WEBHOOK",
        "url": "https://api.getport.io/v1/agent/incident_orchestrator_agent/invoke",
        "agent": false,
        "synchronized": true,
        "method": "POST",
        "headers": {
          "RUN_ID": "{{ .run.id }}",
          "Content-Type": "application/json"
        },
        "body": {
          "prompt": "Here is the created Incident:\n Incident identifier: {{.event.diff.after.identifier}}\n\nIncident Title:{{.event.diff.after.title}}\n\nFull Incident Entity: {{.event.diff.after.properties}}\n",
          "labels": {
            "source": "auto_orchestrate_incident_response",
            "incident_id": "{{ .event.diff.after.identifier }}"
          }
        }
      },
      "publish": true
    }
    ```
    </details>

4. Click `Create` to save the automation.

### Set Incident Slack Channel ID

This automation updates the incident with the Slack channel ID after the channel has been created.

1. Go back to the [automations](https://app.getport.io/settings/automations) page of your portal.
2. Click on `+ Automation`.
3. Copy and paste the following JSON schema:

    <details>
    <summary><b>Set Incident Slack Channel ID automation (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "set_incident_slack_channel_id_on_creation",
      "title": "Set Incident Slack Channel ID on Creation",
      "description": "This automation updates an incident with the slack channel ID after a Slack channel has been created",
      "icon": "Slack",
      "trigger": {
        "type": "automation",
        "event": {
          "type": "RUN_UPDATED",
          "actionIdentifier": "create_incident_slack_channel"
        },
        "condition": {
          "type": "JQ",
          "expressions": [
            ".diff.before.status== \"IN_PROGRESS\"",
            ".diff.after.status== \"SUCCESS\"",
            ".diff.after.response.ok == true"
          ],
          "combinator": "and"
        }
      },
      "invocationMethod": {
        "type": "UPSERT_ENTITY",
        "blueprintIdentifier": "pagerdutyIncident",
        "mapping": {
          "identifier": "{{.event.diff.after.entity.identifier}}",
          "properties": {
            "slack_channel": "{{ .event.diff.after.response.channel.name }}"
          }
        }
      },
      "publish": true
    }
    ```
    </details>

4. Click `Create` to save the automation.

### Create War Room Meeting

This automation calls the Zoom API to create the meeting after obtaining the access token.

1. Go back to the [automations](https://app.getport.io/settings/automations) page of your portal.
2. Click on `+ Automation`.
3. Copy and paste the following JSON schema:

    <details>
    <summary><b>Create War Room Meeting automation (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "create_war_room_meeting",
      "title": "Create War Room Meeting",
      "description": "Calls Zoom API to create the meeting after getting the access token",
      "icon": "Team",
      "trigger": {
        "type": "automation",
        "event": {
          "type": "RUN_UPDATED",
          "actionIdentifier": "create_zoom_meeting_link_initializer"
        },
        "condition": {
          "type": "JQ",
          "expressions": [
            ".diff.before.status== \"IN_PROGRESS\"",
            ".diff.after.status== \"SUCCESS\""
          ],
          "combinator": "and"
        }
      },
      "invocationMethod": {
        "type": "WEBHOOK",
        "url": "https://api.getport.io/v1/actions/create_zoom_meet_link/runs",
        "agent": false,
        "synchronized": true,
        "method": "POST",
        "headers": {
          "RUN_ID": "{{ .run.id }}",
          "Content-Type": "application/json"
        },
        "body": {
          "properties": {
            "zoom_access_token": "{{ .event.diff.after.response.access_token }}",
            "incident": "{{ .event.diff.before.entity.identifier }}"
          }
        }
      },
      "publish": true
    }
    ```
    </details>

4. Click `Create` to save the automation.

### Upsert Meeting Link on Success

This automation updates the incident with the created Zoom meeting link.

1. Go back to the [automations](https://app.getport.io/settings/automations) page of your portal.
2. Click on `+ Automation`.
3. Copy and paste the following JSON schema:

    <details>
    <summary><b>Upsert Meeting Link on Success automation (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "upsert_meeting_link_on_success",
      "title": "Upsert Meeting Link on Success",
      "description": "Updates the incident with the created zoom meeting link",
      "trigger": {
        "type": "automation",
        "event": {
          "type": "RUN_UPDATED",
          "actionIdentifier": "create_zoom_meet_link"
        },
        "condition": {
          "type": "JQ",
          "expressions": [
            ".diff.before.status== \"IN_PROGRESS\"",
            ".diff.after.status== \"SUCCESS\""
          ],
          "combinator": "and"
        }
      },
      "invocationMethod": {
        "type": "UPSERT_ENTITY",
        "blueprintIdentifier": "pagerdutyIncident",
        "mapping": {
          "identifier": "{{.event.diff.before.properties.incident.identifier}}",
          "properties": {
            "zoom_meeting_link": "{{ .event.diff.after.response.join_url }}"
          }
        }
      },
      "publish": true
    }
    ```
    </details>

4. Click `Create` to save the automation.

### Update Incident with Jira Ticket

This automation updates the incident with the response of the created Jira ticket.

1. Go back to the [automations](https://app.getport.io/settings/automations) page of your portal.
2. Click on `+ Automation`.
3. Copy and paste the following JSON schema:

    <details>
    <summary><b>Update Incident With Jira Ticket automation (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "update_incident_with_jira_ticket",
      "title": "Update Incident With Jira Ticket",
      "description": "automation to update the incident with the response of the created Jira ticket",
      "icon": "Jira",
      "trigger": {
        "type": "automation",
        "event": {
          "type": "RUN_UPDATED",
          "actionIdentifier": "create_jira_tracking_ticket"
        },
        "condition": {
          "type": "JQ",
          "expressions": [
            ".diff.before.status== \"IN_PROGRESS\"",
            ".diff.after.status== \"SUCCESS\""
          ],
          "combinator": "and"
        }
      },
      "invocationMethod": {
        "type": "UPSERT_ENTITY",
        "blueprintIdentifier": "pagerdutyIncident",
        "mapping": {
          "identifier": "{{.event.diff.after.entity.identifier}}",
          "properties": {
            "jira_tracking_ticket": "https://{{ (.event.diff.after.response.self | capture(\"https://(?<domain>[^/]+)\") ).domain }}/browse/{{ .event.diff.after.response.key }}"
          }
        }
      },
      "publish": true
    }
    ```
    </details>

4. Click `Create` to save the automation.

## Test the workflow

Now let us test the complete incident orchestration workflow to ensure everything works correctly.

### Create a test incident

1. Go to your PagerDuty instance and create a new incident, or use Port's API to create a test incident entity.
2. Verify that the incident appears in your Port catalog.

### Verify AI agent orchestration

1. Check the AI agent's execution logs in the [AI Invocation](https://app.getport.io/_ai_invocationsEntity) page.
2. Verify that the agent has:
   - Analyzed the incident severity and context
   - Executed the appropriate actions based on urgency
   - Created a Slack channel (for high/medium/critical incidents)
   - Created a Zoom meeting link (for high/critical incidents)
   - Created a Jira tracking ticket (for high/medium/critical incidents)
   - Sent notification messages

### Verify incident updates

1. Go to your Port catalog and find the incident entity.
2. Check that the incident has been updated with:
   - Slack channel ID
   - Zoom meeting link (if applicable)
   - Jira tracking ticket URL
3. Verify the links are functional and accessible.

    <img src="/img/guides/incident-orchestration-port-entity.png" border="1px" width="80%" />

### Test in Slack

1. Go to your Slack workspace.
2. Verify that:
   - A new channel was created with the incident identifier
   - Notification messages were posted to the channel
   - The channel contains relevant incident information

    <img src="/img/guides/incident-orchestration-slack-notify.png" border="1px" width="80%" />

## Related guides

- [Setup Incident Manager AI agent](/guides/all/setup-incident-manager-ai-agent)
- [Generate incident updates with AI](/guides/all/generate-incident-updates-with-ai)
- [Add RCA context to AI agents](/guides/all/add-rca-context-to-ai-agents)
- [Manage and visualize PagerDuty incidents](/guides/all/manage-and-visualize-pagerduty-incidents)

