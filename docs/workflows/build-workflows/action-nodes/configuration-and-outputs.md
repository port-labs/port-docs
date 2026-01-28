---
sidebar_position: 1
title: Configuration and outputs
---

import ClosedBetaFeatureNotice from '/docs/generalTemplates/_closed_beta_feature_notice.md';

# Configuration and outputs

<ClosedBetaFeatureNotice id="workflows" />

Action nodes perform operations in your workflow. They execute after trigger nodes and can be chained together to create complex automation flows.

## Common configuration

All action nodes share these common fields:

| Field | Description |
| ----- | ----------- |
| `identifier` | Unique identifier for the node within the workflow |
| `title` | Display name for the node |
| `icon` | Optional icon for the node |
| `description` | Optional description of what the node does |
| `config` | The action configuration (type-specific) |
| `variables` | Optional key-value pairs for reusable expressions |

## Referencing outputs

Action nodes can reference outputs from previous nodes using the pattern `.outputs.<node_identifier>.<field>`:

| Context | Description |
| ------- | ----------- |
| `.outputs.<node_identifier>.<field>` | Output from any previous node (including trigger) |
| `.secrets["<name>"]` | Organization secrets |

For self-service triggers, the user inputs are stored directly at `.outputs.<trigger_node_identifier>.<input_key>`.

For event triggers, the event data is stored at `.outputs.<trigger_node_identifier>.diff.after`, `.outputs.<trigger_node_identifier>.action`, etc.

### Example: Chaining node outputs

```json showLineNumbers
{
  "nodes": [
    {
      "identifier": "trigger",
      "title": "Start",
      "config": {
        "type": "SELF_SERVE_TRIGGER",
        "userInputs": {
          "properties": {
            "resourceName": { "type": "string" }
          }
        }
      }
    },
    {
      "identifier": "create_resource",
      "title": "Create Resource",
      "config": {
        "type": "WEBHOOK",
        "url": "https://api.example.com/resources",
        "method": "POST",
        "body": {
          "name": "{{ .outputs.trigger.resourceName }}"
        }
      }
    },
    {
      "identifier": "notify",
      "title": "Send Notification",
      "config": {
        "type": "WEBHOOK",
        "url": "https://hooks.slack.com/xxx",
        "method": "POST",
        "body": {
          "text": "Created resource with ID: {{ .outputs.create_resource.response.body.resourceId }}"
        }
      }
    }
  ],
  "connections": [
    {
      "sourceIdentifier": "trigger",
      "targetIdentifier": "create_resource"
    },
    {
      "sourceIdentifier": "create_resource",
      "targetIdentifier": "notify"
    }
  ]
}
```

## Condition nodes

In addition to action nodes, workflows support **condition nodes** for branching logic:

```json showLineNumbers
{
  "identifier": "check-environment",
  "title": "Check Environment",
  "config": {
    "type": "CONDITION",
    "options": [
      {
        "identifier": "production",
        "title": "Production",
        "expression": ".outputs.trigger.environment == \"production\""
      },
      {
        "identifier": "staging",
        "title": "Staging",
        "expression": ".outputs.trigger.environment == \"staging\""
      }
    ]
  }
}
```

Connections from condition nodes must specify which option they're connected to:

```json showLineNumbers
{
  "connections": [
    {
      "sourceIdentifier": "check-environment",
      "targetIdentifier": "production-deploy",
      "sourceOptionIdentifier": "production"
    },
    {
      "sourceIdentifier": "check-environment",
      "targetIdentifier": "staging-deploy",
      "sourceOptionIdentifier": "staging"
    },
    {
      "sourceIdentifier": "check-environment",
      "targetIdentifier": "default-deploy",
      "fallback": true
    }
  ]
}
```
