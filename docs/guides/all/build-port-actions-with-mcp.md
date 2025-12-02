---
displayed_sidebar: null
description: Create Port self-service actions and automations optimized for MCP tool consumption, enabling AI agents to execute workflows and chain complex operations
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Build Port actions and automations with MCP

Developers using MCP need clear patterns for creating Port actions that AI agents can discover, understand, and execute. This guide provides MCP-first patterns for designing self-service actions and automations that enable seamless tool orchestration through natural language.

Whether you're building developer workflows, creating automated pipelines, or enabling AI-driven operations, these patterns will help you create actions that MCP clients can effectively invoke and chain together.

## Common use cases

- **Natural language operations**: Enable developers to trigger complex workflows through conversational AI interfaces.
- **Workflow chaining**: Design actions that can be combined into multi-step operations by AI agents.
- **Automated responses**: Create automations that AI agents can monitor and respond to.
- **Self-service at scale**: Expose organizational capabilities as discoverable MCP tools.

## Prerequisites

This guide assumes you have:

- Basic understanding of [self-service actions](/actions-and-automations/create-self-service-experiences/) and [automations](/actions-and-automations/define-automations/).
- Port MCP server configured in your [IDE](/ai-interfaces/port-mcp-server/overview-and-installation?mcp-setup=cursor).

## Creating actions for MCP tool consumption

Port's MCP server dynamically generates `run_*` tools for each self-service action in your organization. When you create an action called `trigger_pagerduty_incident`, MCP exposes it as `run_trigger_pagerduty_incident`. The action's input schema becomes the tool's parameters, making your action immediately available to AI agents.

<h3>Use descriptive identifiers and titles</h3>

Choose action identifiers that clearly communicate what the action does:

```json showLineNumbers
{
  "identifier": "trigger_pagerduty_incident",
  "title": "Trigger PagerDuty incident",
  "description": "Trigger a new PagerDuty incident directly from Port"
}
```

:::tip Clear naming
Use verb-noun patterns like `create_service`, `deploy_to_environment`, or `restart_workload`. Avoid abbreviations that AI agents might not understand.
:::

<h3>Write detailed descriptions</h3>

The action description appears in the MCP tool listing. Include enough context for AI agents to understand when to use the action:

```json showLineNumbers
{
  "identifier": "scale_k8s_workload",
  "title": "Scale Kubernetes Workload",
  "description": "Scale a Kubernetes workload up or down to resolve resource issues. Use this when a service needs more capacity or to reduce costs during low-traffic periods."
}
```

<h3>Choose appropriate operations</h3>

Port actions support three operation types that determine how they appear in MCP:

- **CREATE**: For provisioning new resources. Appears without requiring an entity context.
- **DAY-2**: For operations on existing entities. Requires an entity identifier.
- **DELETE**: For removing resources. Requires an entity identifier.

```json showLineNumbers
{
  "trigger": {
    "type": "self-service",
    "operation": "DAY-2",
    "blueprintIdentifier": "service"
  }
}
```

## Action input schemas for MCP compliance

When an AI agent calls a Port action through MCP, it needs to understand what inputs are required and what values are valid. Well-designed input schemas enable agents to construct correct requests without user intervention.

<h3>Define clear input properties</h3>

Include titles and descriptions for every input:

<details>
<summary><b>Example action input schema (click to expand)</b></summary>
```json showLineNumbers
{
  "userInputs": {
    "properties": {
      "environment": {
        "title": "Target Environment",
        "type": "string",
        "description": "The environment to deploy to",
        "enum": ["production", "staging", "development"],
        "default": "staging"
      },
      "replicas": {
        "title": "Number of Replicas",
        "type": "number",
        "description": "How many instances to run (1-10)",
        "minimum": 1,
        "maximum": 10,
        "default": 2
      }
    },
    "required": ["environment"]
  }
}
```
</details>

<h3>Use enums for constrained choices</h3>

Enums help AI agents understand valid options:

<details>
<summary><b>Example enum input schema (click to expand)</b></summary>
```json showLineNumbers
{
  "severity": {
    "title": "Severity",
    "type": "string",
    "description": "The severity level of the incident",
    "enum": ["critical", "error", "warning", "info"],
    "enumColors": {
      "critical": "red",
      "error": "red",
      "warning": "yellow",
      "info": "blue"
    },
    "default": "warning"
  }
}
```
</details>

<h3>Provide sensible defaults</h3>

Defaults reduce the information agents need to collect:

```json showLineNumbers
{
  "source": {
    "title": "Source",
    "type": "string",
    "description": "The source system triggering this action",
    "default": "Port MCP"
  }
}
```

<h3>Order inputs logically</h3>

Use the `order` array to present inputs in a logical sequence:

```json showLineNumbers
{
  "userInputs": {
    "properties": { ... },
    "required": ["summary", "severity"],
    "order": ["summary", "severity", "source", "event_action"]
  }
}
```

## Chaining actions for complex workflows

AI agents can chain multiple actions together to accomplish complex tasks. Design your actions to be composable—each action should do one thing well and return useful information for subsequent actions.

<h3>Return actionable data</h3>

Configure your action's backend to return data that can inform the next step:

<details>
<summary><b>Example action return schema (click to expand)</b></summary>
```json showLineNumbers
{
  "invocationMethod": {
    "type": "WEBHOOK",
    "url": "https://api.example.com/deploy",
    "synchronized": true,
    "method": "POST",
    "body": {
      "service": "{{.entity.identifier}}",
      "environment": "{{.inputs.environment}}"
    }
  }
}
```
</details>

:::info Synchronized actions
Set `synchronized: true` for actions where you want the MCP client to wait for completion. This enables agents to use the result before proceeding to the next action.
:::

<h3>Design for composition</h3>

Create actions that work well together:

| Action | Purpose | Enables |
|--------|---------|---------|
| `create_feature_flag` | Create a new feature flag | Controlled rollouts |
| `toggle_feature_flag` | Enable/disable a flag | Quick feature control |
| `deploy_to_environment` | Deploy service version | Code releases |

An agent can chain these: create a feature flag → deploy the service → toggle the flag to enable the feature.

## Complementing actions with automations

[Automations](/actions-and-automations/define-automations/) are event-driven workflows that complement MCP-triggered actions. When an agent triggers an action that creates or updates entities, automations can automatically handle follow-up tasks—extending your workflows beyond the initial action.

<h3>How automations extend MCP workflows</h3>

Automations respond to events in your software catalog, enabling you to build reactive workflows:

<details>
<summary><b>Sync PagerDuty incident status automation (click to expand)</b></summary>
```json showLineNumbers
{
  "identifier": "sync_incident_status",
  "title": "Sync PagerDuty Incident Status",
  "trigger": {
    "type": "automation",
    "event": {
      "type": "ENTITY_UPDATED",
      "blueprintIdentifier": "pagerdutyIncident"
    },
    "condition": {
      "type": "JQ",
      "expressions": [".diff.after.properties.status != .diff.before.properties.status"],
      "combinator": "and"
    }
  }
}
```
</details>

<h3>Build end-to-end workflows</h3>

Combine MCP-triggered actions with automations to create complete workflows:

1. **Agent triggers action**: An agent calls `run_trigger_pagerduty_incident` to create an incident.
2. **Automation responds**: When the incident status changes in PagerDuty, an automation syncs the update to Port.
3. **Follow-up automation**: When the incident is resolved, another automation notifies the team via Slack.


## Example: multi-step workflow action

The following action demonstrates MCP-first patterns with clear inputs, detailed descriptions, and a structure that enables AI agents to execute it effectively:

<details>
<summary><b>PagerDuty incident action (click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "trigger_pagerduty_incident",
  "title": "Trigger PagerDuty incident",
  "icon": "pagerduty",
  "description": "Trigger a new PagerDuty incident directly from Port. Use this to alert on-call engineers about service issues.",
  "trigger": {
    "type": "self-service",
    "operation": "DAY-2",
    "blueprintIdentifier": "pagerdutyService",
    "userInputs": {
      "properties": {
        "summary": {
          "title": "Summary",
          "type": "string",
          "description": "A brief description of the incident"
        },
        "source": {
          "title": "Source",
          "type": "string",
          "description": "The system or person reporting the incident",
          "default": "Port MCP"
        },
        "severity": {
          "title": "Severity",
          "type": "string",
          "description": "The severity level determines escalation urgency",
          "enum": ["critical", "error", "warning", "info"],
          "enumColors": {
            "critical": "red",
            "error": "red",
            "warning": "yellow",
            "info": "blue"
          },
          "default": "warning"
        },
        "event_action": {
          "title": "Event Action",
          "type": "string",
          "description": "The action to take: trigger creates new, acknowledge confirms receipt, resolve closes",
          "enum": ["trigger", "acknowledge", "resolve"],
          "default": "trigger"
        }
      },
      "required": ["summary", "severity"],
      "order": ["summary", "severity", "source", "event_action"]
    }
  },
  "invocationMethod": {
    "type": "WEBHOOK",
    "url": "https://events.pagerduty.com/v2/enqueue",
    "synchronized": true,
    "method": "POST",
    "headers": {
      "Content-Type": "application/json"
    },
    "body": {
      "payload": {
        "summary": "{{.inputs.summary}}",
        "source": "{{.inputs.source}}",
        "severity": "{{.inputs.severity}}"
      },
      "routing_key": "{{.secrets.PAGERDUTY_ROUTING_KEY}}",
      "event_action": "{{.inputs.event_action}}"
    }
  }
}
```

</details>

This action design enables AI agents to:

- **Trigger incidents naturally**: "Create a critical PagerDuty incident for the payment service".
- **Use sensible defaults**: Agent only needs to provide summary and severity.
- **Chain with other actions**: Follow up with `acknowledge_pagerduty_incident` or `resolve_pagerduty_incident`.

## Let's test it

After creating your actions, test them with an MCP-enabled AI assistant. In this example, we'll create a PagerDuty incident using the `create_incident_webhook` action.

<h3>Prompt</h3>

Ask your AI assistant:

> *"Create a high urgency PagerDuty incident for the PORT-2 service with title 'High latency detected in checkout flow'"*

<h3>What happens</h3>

The agent will:
1. **Discover the action** - Find `create_incident_webhook` via `list_actions`.
2. **Understand the inputs** - Use the action schema to determine required fields (title, urgency).
3. **Execute the action** - Call `run_create_incident_webhook` with the entity identifier and input parameters.
4. **Return the result** - Report whether the incident was created successfully.
5. **Automation triggered** - The `pagerduty_incident_to_slack` automation sends a Slack notification to the team.

    <details>
    <summary><b>Slack notification automation setup (click to expand)</b></summary>

    ```json showLineNumbers
    {
    "identifier": "pagerduty_incident_to_slack",
    "title": "PagerDuty incident to Slack",
    "description": "Sends a Slack message when a new incident is created",
    "trigger": {
        "type": "automation",
        "event": {
        "type": "ENTITY_CREATED",
        "blueprintIdentifier": "pagerdutyIncident"
        }
    },
    "invocationMethod": {
        "type": "WEBHOOK",
        "url": "https://slack.com/api/chat.postMessage",
        "synchronized": true,
        "method": "POST",
        "headers": {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": "Bearer {{ .secrets.SLACK_BOT_TOKEN }}"
        },
        "body": {
        "channel": "incident-alerts",
        "blocks": [
            {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "*New PagerDuty Incident*\n*Title:* {{ .event.diff.after.title }}\n*Assignees:* {{ .event.diff.after.properties.assignees }}"
            }
            }
        ]
        }
    }
    }
    ```

    </details>

<Tabs queryString="ide">
<TabItem value="cursor" label="Cursor">

<details>
<summary><b>Example output (click to expand)</b></summary>

<img src="/img/guides/MCPActionsCreateIncidentCursor.png" border="1px" />

<img src="/img/guides/MCPActionsCreateIncidentPort.png" border="1px" />

</details>

</TabItem>
<TabItem value="vscode" label="VS Code">

<details>
<summary><b>Example output (click to expand)</b></summary>

<img src="/img/guides/MCPActionsCreateIncidentVSCode.png" border="1px" />

<img src="/img/guides/MCPActionsCreateIncidentPort.png" border="1px" />

</details>

</TabItem>
</Tabs>

## Related documentation

- [Self-service actions](/actions-and-automations/create-self-service-experiences/) - Complete guide to creating actions.
- [Define automations](/actions-and-automations/define-automations/) - Event-driven workflow configuration.
- [Available MCP tools](/ai-interfaces/port-mcp-server/available-tools) - Complete reference for all MCP tools.
- [Action backends](/actions-and-automations/create-self-service-experiences/setup-the-backend/) - Configure webhooks, GitHub, GitLab, and more.

