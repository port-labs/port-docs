---
displayed_sidebar: null
description: Use AI to create Port self-service actions and automations through natural language conversations, enabling workflow orchestration without manual configuration
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Build Port actions and automations with MCP

Use Port's MCP (Model Context Protocol) server to create self-service actions and automations through natural language conversations with AI. This guide shows you how to design workflows, configure action inputs, and set up automations—all by describing what you need in plain English.

Instead of manually writing JSON schemas or navigating complex forms, you can have conversations with your AI assistant to build actions iteratively, getting instant feedback and making adjustments on the fly.

## Common use cases

- **Create deployment workflows**: Describe deployment processes and let AI create the actions.
- **Set up incident management**: Ask AI to create PagerDuty or Opsgenie integration actions.
- **Build approval workflows**: Explain approval requirements and have AI configure the action.
- **Configure automations**: Describe event-driven workflows and let AI set them up.

## Prerequisites

This guide assumes you have:

- Basic understanding of [self-service actions](/actions-and-automations/create-self-service-experiences/) and [automations](/actions-and-automations/define-automations/).
- Port MCP server configured in your [IDE](/ai-interfaces/port-mcp-server/overview-and-installation?mcp-setup=cursor).

## Creating actions with AI

The Port MCP server provides tools like `create_action`, `list_actions`, and `update_action` that enable AI agents to build your actions through natural language conversations. You can describe what you need, and the AI will generate the appropriate configuration and create it in Port.

<h3>Start with a simple description</h3>

Describe the action you want to create in natural language. The AI will interpret your requirements and generate the appropriate schema.

**Example conversation:**

*"Create a self-service action called 'Deploy to Staging' for the service blueprint. It should trigger a GitHub workflow that accepts an optional version parameter and deployment environment."*

The AI will use the MCP `create_action` tool to generate and create the action:

<Tabs groupId="mcp-output" queryString>
<TabItem value="mcp" label="MCP server input">
<img src="/img/guides/MCPCreateAction.png" border="1px" />
</TabItem>
<TabItem value="port" label="Port output">
<img src="/img/guides/MCPCreateActionPort.png" border="1px" />
</TabItem>
</Tabs>

:::tip Iterative refinement
After creating an action, you can refine it by asking follow-up questions like "Add a required approval step" or "Change the backend to use a webhook instead of GitHub".
:::

<h3>Add complex user inputs</h3>

Describe dynamic forms and the AI will configure them:

**Example conversation:**

*"Add a multi-select input for deployment regions with options for us-east-1, us-west-2, and eu-west-1"*

The AI will update the action's `userInputs` schema with the appropriate configuration.

<h3>Configure different backends</h3>

Port actions support multiple backend types. Describe your preferred backend and AI will configure it:

**Example conversations:**

- *"Create a restart service action that triggers a GitHub workflow in the ops-automation repo"*
- *"Create an action that calls our internal API at https://api.internal.com/deploy"*
- *"Create an action that triggers a GitLab pipeline in the infrastructure project"*

The AI will configure the appropriate `invocationMethod` (GitHub, GitLab, Webhook, etc.).

## Setting up automation triggers

Automations respond to events in your software catalog. AI can help you create event-driven workflows that react to changes automatically.

<h3>Describe the trigger condition</h3>

Explain what event should trigger the automation:

**Example conversation:**

*"Create an automation that triggers a Slack notification when a service's health score drops below 50"*

<Tabs groupId="mcp-output" queryString>
<TabItem value="mcp" label="MCP server input">
<img src="/img/guides/MCPCreateAutomation.png" border="1px" />
</TabItem>
<TabItem value="port" label="Port output">
<img src="/img/guides/MCPCreateAutomationPort.png" border="1px" />
</TabItem>
</Tabs>

<h3>Common automation patterns</h3>

Here are patterns you can describe to AI:

**Entity lifecycle events:**
- *"When a new service is created, send a welcome message to the owning team's Slack channel"*
- *"When a service is deleted, create a cleanup task in Jira"*

**Property change events:**
- *"When a service's status changes to deprecated, notify the platform team"*
- *"When an incident severity is upgraded to critical, page the on-call engineer"*

**Timer-based events:**
- *"When a service's compliance certificate expires, create a renewal ticket"*

## Building incident management actions

A common use case is creating actions for incident management. Here's how to build a complete incident workflow using AI.

<h3>Create a trigger incident action</h3>

**Example conversation:**

*"Create a 'Trigger PagerDuty Incident' action for the pagerdutyService blueprint. It should accept a summary, severity (critical, high, low), and source. Use the PagerDuty Events API."*

<h3>Create complementary actions</h3>

Build a complete workflow by asking for related actions:

**Example conversations:**

- *"Create an 'Acknowledge Incident' action that acknowledges a PagerDuty incident"*
- *"Create a 'Resolve Incident' action that resolves and closes the incident"*

The AI will create actions that work together, enabling a complete incident lifecycle.

## Chaining actions for complex workflows

AI agents can chain multiple actions together. Design your actions to be composable by asking AI to create focused, single-purpose actions.

**Example conversation:**

*"Create three actions for feature rollouts: 'Create Feature Flag' to create a new LaunchDarkly flag, 'Deploy Service' to deploy the service version, and 'Enable Feature' to toggle the flag on"*

The AI will create three separate actions that can be chained:
1. Create a feature flag → Deploy the service → Toggle the flag

## Let's test it

After creating your actions, test them with an MCP-enabled AI assistant. In this example, we'll create a PagerDuty incident using the action we built.

<h3>Prompt</h3>

Ask your AI assistant:

> *"Create a high urgency PagerDuty incident for the PORT-2 service with title 'High latency detected in checkout flow'"*

<h3>What happens</h3>

The agent will:
1. **Discover the action** - Find `create_incident_webhook` via `list_actions`.
2. **Understand the inputs** - Use the action schema to determine required fields.
3. **Execute the action** - Call `run_create_incident_webhook` with the entity identifier and input parameters.
4. **Return the result** - Report whether the incident was created successfully.

<Tabs groupId="mcp-output" queryString>
<TabItem value="mcp" label="MCP server input">
<img src="/img/guides/MCPActionsCreateIncidentCursor.png" border="1px" />
</TabItem>
<TabItem value="port" label="Port output">
<img src="/img/guides/MCPActionsCreateIncidentPort.png" border="1px" />
</TabItem>
</Tabs>

## Best practices for AI-driven action creation

When using AI to create actions, follow these practices to get the best results:

<h3>Be specific about inputs</h3>

The more detail you provide about inputs, the better the action schema:

- **Good**: *"Create a deploy action with inputs for environment (enum: production, staging, dev), version (string, required), and notify_slack (boolean, default true)"*
- **Less effective**: *"Create a deploy action"*

<h3>Specify the backend type</h3>

Tell AI what backend to use:

- *"...that triggers a GitHub workflow in the deployments repo"*
- *"...that calls a webhook at https://api.example.com/deploy"*
- *"...that triggers a GitLab pipeline"*

<h3>Describe approval requirements</h3>

If your action needs approval:

*"Create a production deploy action that requires approval from the platform-admins team"*

<h3>Use clear action names</h3>

Use verb-noun patterns that AI can understand:

- Good: `deploy_to_production`, `restart_service`, `trigger_incident`
- Less clear: `prod_dep`, `svc_rst`, `inc`

## Real-world use cases

Here are practical scenarios where AI-driven action creation shines:

<h3>Setting up a new service workflow</h3>

**Scenario**: You need deployment and operational actions for a new service.

**Conversation:**

*"Create these actions for the service blueprint: 'Deploy to Staging' (GitHub workflow, accepts version), 'Promote to Production' (requires approval, GitHub workflow), and 'Rollback' (GitHub workflow, accepts version to rollback to)"*

<h3>Incident response automation</h3>

**Scenario**: Connect services to incident management with automation.

**Conversation:**

*"Create an automation that sends a Slack message to the #incidents channel whenever a new PagerDuty incident is created in Port. Include the incident title, severity, and a link to the Port entity."*

<h3>Compliance workflows</h3>

**Scenario**: Automate compliance checks and remediation.

**Conversation:**

*"Create an action called 'Request Security Review' that creates a Jira ticket in the SECURITY project with the service name, owner, and a checklist of compliance requirements"*



## Related documentation

- [Self-service actions](/actions-and-automations/create-self-service-experiences/) - Complete guide to creating actions.
- [Define automations](/actions-and-automations/define-automations/) - Event-driven workflow configuration.
- [Available MCP tools](/ai-interfaces/port-mcp-server/available-tools) - Complete reference for all MCP tools.
- [Action backends](/actions-and-automations/create-self-service-experiences/setup-the-backend/) - Configure webhooks, GitHub, GitLab, and more.
