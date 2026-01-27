---
sidebar_position: 1
title: Overview
---

import ClosedBetaFeatureNotice from '/docs/generalTemplates/_closed_beta_feature_notice.md';

# Workflows (Beta)

<ClosedBetaFeatureNotice id="workflows-beta" />

:::warning Closed Beta Notice
As a closed beta feature, workflows may undergo breaking changes and occasional downtime without prior notice. There is no SLA or guaranteed issue-resolution timeline during this period. Support is provided directly by the Workflows team.
:::

Workflows provide a visual, node-based way to build automations and self-service experiences in Port. Unlike traditional actions and automations, workflows allow you to chain multiple operations together, add conditional logic, and create complex automation flows with an intuitive graph-based interface.

## Main concepts

A workflow consists of the following components:

### Nodes

Nodes are the building blocks of a workflow. There are three types of nodes:

| Node type | Description |
| --------- | ----------- |
| **Trigger** | The entry point that initiates the workflow. Can be a self-service trigger (manual execution) or an event trigger (automated based on entity changes). |
| **Action** | Performs an operation such as sending a webhook, upserting an entity, publishing to Kafka, or triggering an integration action. |
| **Condition** | Evaluates expressions and routes the workflow to different branches based on the results. |

### Connections

Connections define the flow between nodes. Each connection links a source node to a target node, determining the order of execution. Condition nodes can have multiple outgoing connections, one for each branch.

### Conditions

Condition nodes allow you to add branching logic to your workflows. Each condition has one or more options with JQ expressions that are evaluated at runtime. The workflow follows the path of the first matching expression, or a fallback path if none match.

### Outputs

Nodes can produce outputs that are available to subsequent nodes in the workflow. Use JQ expressions to reference outputs from previous nodes when configuring action payloads.

### Base information

Each workflow has base metadata:
- **Identifier** - A unique identifier for the workflow
- **Title** - A human-readable name
- **Description** - An optional description of what the workflow does
- **Icon** - An optional icon to display in the UI

## Comparison with Actions & Automations

Workflows are the next evolution of Port's [Actions & Automations](/actions-and-automations/overview). While they share many concepts, there are some key differences:

| Feature | Actions & Automations | Workflows (Beta) |
| ------- | --------------------- | ---------------- |
| Multi-step view | No | Yes |
| Backend types | All supported | Webhook, Kafka, Upsert Entity, GitHub (more coming soon) |
| Secret user inputs | Yes | Not yet supported |
| Multi-steps user inputs form | Yes | Not yet supported |
| Run from specific entity | Yes | Not yet supported |
| Port Execution Agent | Yes | Not yet supported |
| Approval flows | Yes (only for self-service actions) | Not yet supported |
| Re-run from UI | Yes | Not yet supported |
| Port's GitHub Action support | Yes | Not yet supported |
| MCP tools | Yes | Not yet supported |
| Dynamic permissions | Yes | Not yet supported |
| Custom widget button text | Yes | Not yet supported |
| Terraform / Pulumi resources | Yes | Not yet supported |

:::tip When to use Workflows
Use Workflows when you need to:

- Chain multiple operations together
- Add conditional logic to your automations
- Visualize complex flows
- Combine self-service actions with automated responses
:::

## Workflow JSON structure

The basic structure of a workflow looks like this:

```json showLineNumbers
{
  "identifier": "my-workflow",
  "title": "My Workflow",
  "icon": "Workflow",
  "description": "An example workflow",
  "nodes": [
    {
      "identifier": "trigger",
      "title": "Self-Service Trigger",
      "config": {
        "type": "SELF_SERVE_TRIGGER",
        "userInputs": {
          "properties": {},
          "required": []
        }
      }
    },
    {
      "identifier": "action1",
      "title": "Send Webhook",
      "config": {
        "type": "WEBHOOK",
        "url": "https://example.com/webhook",
        "method": "POST",
        "body": {
          "message": "Workflow executed"
        }
      }
    }
  ],
  "connections": [
    {
      "sourceIdentifier": "trigger",
      "targetIdentifier": "action1"
    }
  ]
}
```

## Next steps

- [Quickstart and build with AI](/workflows-beta/build-workflows/quickstart) - Get started building your first workflow
- [Self-service trigger](/workflows-beta/build-workflows/self-service-trigger/) - Create workflows triggered by users
- [Event trigger](/workflows-beta/build-workflows/event-trigger) - Create workflows triggered by entity changes
- [Action nodes](/workflows-beta/build-workflows/action-nodes/) - Learn about available action types
