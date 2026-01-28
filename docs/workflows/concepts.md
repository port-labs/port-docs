---
sidebar_position: 2
title: Concepts and structure
---

import ClosedBetaFeatureNotice from '/docs/generalTemplates/_closed_beta_feature_notice.md';

# Concepts and structure

<ClosedBetaFeatureNotice id="workflows" />

Understanding the core components of workflows will help you design effective automations. Each workflow is built by connecting different components together to create an execution flow.

## Nodes

Nodes are the building blocks of a workflow. There are three types of nodes:

| Node type | Description |
| --------- | ----------- |
| **Trigger** | The entry point that initiates the workflow. Can be a [self-service trigger](/workflows/build-workflows/self-service-trigger/) (manual execution) or an [event trigger](/workflows/build-workflows/event-trigger) (automated based on entity changes). |
| **Action** | Performs an operation such as sending a webhook, upserting an entity, publishing to Kafka, or triggering an integration action. See [action nodes](/workflows/build-workflows/action-nodes/) for more information. |
| **Condition** | Evaluates expressions and routes the workflow to different branches based on the results. See [action nodes overview](/workflows/build-workflows/action-nodes/overview#condition-nodes) for more information. |

## Connections

Connections define the flow between nodes. Each connection links a source node to a target node, determining the order of execution. Condition nodes can have multiple outgoing connections, one for each branch.

When you connect nodes together, data flows from one to the next, allowing you to chain operations and pass outputs through your workflow.

## Conditions

Condition nodes allow you to add branching logic to your workflows. Each condition has one or more options with JQ expressions that are evaluated at runtime. The workflow follows the path of the first matching expression, or a fallback path if none match.

For more information, see [condition nodes](/workflows/build-workflows/action-nodes/overview#condition-nodes).

## Outputs

Nodes can produce outputs that are available to subsequent nodes in the workflow. Use JQ expressions to reference outputs from previous nodes when configuring action payloads.

For more information, see [data flow](/workflows/build-workflows/data-flow).

## Base information

Each workflow has base metadata:
- **Identifier** - A unique identifier for the workflow.
- **Title** - A human-readable name.
- **Description** - An optional description of what the workflow does.
- **Icon** - An optional icon to display in the UI.

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

- [Quickstart and build with AI](/workflows/build-workflows/quickstart) - Get started building your first workflow
- [Self-service trigger](/workflows/build-workflows/self-service-trigger/) - Create workflows triggered by users
- [Event trigger](/workflows/build-workflows/event-trigger) - Create workflows triggered by entity changes
- [Action nodes](/workflows/build-workflows/action-nodes/) - Learn about available action types
