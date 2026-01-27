---
sidebar_position: 3
title: Event trigger
---

import ClosedBetaFeatureNotice from '/docs/generalTemplates/_closed_beta_feature_notice.md';

# Event trigger

<ClosedBetaFeatureNotice id="workflows-beta" />

Event triggers allow workflows to run automatically in response to changes in your software catalog. When an entity is created, updated, or deleted, the workflow can be triggered to perform automated actions.

## Trigger types

| Event type | Description |
| ---------- | ----------- |
| `ENTITY_CREATED` | Triggered when a new entity is created in the specified blueprint |
| `ENTITY_UPDATED` | Triggered when an existing entity is updated |
| `ENTITY_DELETED` | Triggered when an entity is deleted |
| `ANY_ENTITY_CHANGE` | Triggered on any change (create, update, or delete) |
| `TIMER_EXPIRED` | Triggered when a timer property expires |

## Configuration

### Entity created trigger

```json showLineNumbers
{
  "identifier": "trigger",
  "title": "On Service Created",
  "config": {
    "type": "EVENT_TRIGGER",
    "event": {
      "type": "ENTITY_CREATED",
      "blueprintIdentifier": "service"
    }
  }
}
```

### Entity updated trigger

```json showLineNumbers
{
  "identifier": "trigger",
  "title": "On Service Updated",
  "config": {
    "type": "EVENT_TRIGGER",
    "event": {
      "type": "ENTITY_UPDATED",
      "blueprintIdentifier": "service"
    }
  }
}
```

### Entity deleted trigger

```json showLineNumbers
{
  "identifier": "trigger",
  "title": "On Service Deleted",
  "config": {
    "type": "EVENT_TRIGGER",
    "event": {
      "type": "ENTITY_DELETED",
      "blueprintIdentifier": "service"
    }
  }
}
```

### Any entity change trigger

```json showLineNumbers
{
  "identifier": "trigger",
  "title": "On Any Service Change",
  "config": {
    "type": "EVENT_TRIGGER",
    "event": {
      "type": "ANY_ENTITY_CHANGE",
      "blueprintIdentifier": "service"
    }
  }
}
```

### Timer expired trigger

Triggered when a timer property on an entity expires:

```json showLineNumbers
{
  "identifier": "trigger",
  "title": "On TTL Expired",
  "config": {
    "type": "EVENT_TRIGGER",
    "event": {
      "type": "TIMER_EXPIRED",
      "blueprintIdentifier": "environment",
      "propertyIdentifier": "ttl"
    }
  }
}
```

## Conditions

Add conditions to filter which events trigger the workflow using JQ expressions:

```json showLineNumbers
{
  "identifier": "trigger",
  "title": "On Production Service Updated",
  "config": {
    "type": "EVENT_TRIGGER",
    "event": {
      "type": "ENTITY_UPDATED",
      "blueprintIdentifier": "service"
    },
    "condition": {
      "type": "JQ",
      "expressions": [
        ".diff.after.properties.environment == \"production\""
      ],
      "combinator": "and"
    }
  }
}
```

### Condition properties

| Property | Description |
| -------- | ----------- |
| `type` | Must be `"JQ"` |
| `expressions` | Array of JQ expressions that must evaluate to true |
| `combinator` | How to combine expressions: `"and"` (all must match) or `"or"` (any must match) |

### Common condition patterns

**Property changed:**
```json
{
  "expressions": [
    ".diff.before.properties.status != .diff.after.properties.status"
  ]
}
```

**Property equals specific value:**
```json
{
  "expressions": [
    ".diff.after.properties.tier == \"critical\""
  ]
}
```

**Property changed to specific value:**
```json
{
  "expressions": [
    ".diff.before.properties.status != \"deployed\"",
    ".diff.after.properties.status == \"deployed\""
  ],
  "combinator": "and"
}
```

**Entity has specific relation:**
```json
{
  "expressions": [
    ".diff.after.relations.team != null"
  ]
}
```

## Outputs

Event triggers store the full event object as outputs that can be referenced in subsequent nodes. Outputs are accessed using the pattern `.outputs.<trigger_node_identifier>.<field>`.

| Output | Description |
| ------ | ----------- |
| `.outputs.<trigger_node_identifier>.diff.before` | The entity state before the change (null for created events) |
| `.outputs.<trigger_node_identifier>.diff.after` | The entity state after the change (null for deleted events) |
| `.outputs.<trigger_node_identifier>.action` | The action type: `"CREATE"`, `"UPDATE"`, or `"DELETE"` |
| `.outputs.<trigger_node_identifier>.context.blueprintIdentifier` | The blueprint identifier of the entity |
| `.outputs.<trigger_node_identifier>.context.entityIdentifier` | The identifier of the entity |

### Entity structure

The `diff.before` and `diff.after` objects have the following structure:

```json
{
  "identifier": "my-service",
  "title": "My Service",
  "blueprint": "service",
  "properties": {
    "language": "python",
    "status": "running"
  },
  "relations": {
    "team": "backend-team"
  },
  "team": ["backend-team"],
  "icon": "Service"
}
```

### Using outputs in action nodes

The trigger node identifier in the examples below is `trigger`:

```json showLineNumbers
{
  "config": {
    "type": "WEBHOOK",
    "url": "https://api.example.com/notify",
    "body": {
      "entityIdentifier": "{{ .outputs.trigger.diff.after.identifier }}",
      "entityTitle": "{{ .outputs.trigger.diff.after.title }}",
      "newStatus": "{{ .outputs.trigger.diff.after.properties.status }}",
      "previousStatus": "{{ .outputs.trigger.diff.before.properties.status }}",
      "action": "{{ .outputs.trigger.action }}"
    }
  }
}
```

## Examples

### Notify on critical service status change

```json showLineNumbers
{
  "identifier": "notify-critical-status",
  "title": "Notify on Critical Service Status Change",
  "nodes": [
    {
      "identifier": "trigger",
      "title": "On Status Change",
      "config": {
        "type": "EVENT_TRIGGER",
        "event": {
          "type": "ENTITY_UPDATED",
          "blueprintIdentifier": "service"
        },
        "condition": {
          "type": "JQ",
          "expressions": [
            ".diff.after.properties.tier == \"critical\"",
            ".diff.before.properties.status != .diff.after.properties.status"
          ],
          "combinator": "and"
        }
      }
    },
    {
      "identifier": "send-notification",
      "title": "Send Slack Notification",
      "config": {
        "type": "WEBHOOK",
        "url": "https://hooks.slack.com/services/xxx",
        "method": "POST",
        "body": {
          "text": "Critical service {{ .outputs.trigger.diff.after.title }} status changed from {{ .outputs.trigger.diff.before.properties.status }} to {{ .outputs.trigger.diff.after.properties.status }}"
        }
      }
    }
  ],
  "connections": [
    {
      "sourceIdentifier": "trigger",
      "targetIdentifier": "send-notification"
    }
  ]
}
```

### Clean up resources on environment deletion

```json showLineNumbers
{
  "identifier": "cleanup-environment",
  "title": "Cleanup on Environment Deletion",
  "nodes": [
    {
      "identifier": "trigger",
      "title": "On Environment Deleted",
      "config": {
        "type": "EVENT_TRIGGER",
        "event": {
          "type": "ENTITY_DELETED",
          "blueprintIdentifier": "environment"
        }
      }
    },
    {
      "identifier": "cleanup",
      "title": "Trigger Cleanup",
      "config": {
        "type": "WEBHOOK",
        "url": "https://api.example.com/cleanup",
        "method": "POST",
        "body": {
          "environmentId": "{{ .outputs.trigger.diff.before.identifier }}",
          "environmentName": "{{ .outputs.trigger.diff.before.title }}",
          "cloudProvider": "{{ .outputs.trigger.diff.before.properties.cloudProvider }}"
        }
      }
    }
  ],
  "connections": [
    {
      "sourceIdentifier": "trigger",
      "targetIdentifier": "cleanup"
    }
  ]
}
```

### Auto-expire TTL environments

```json showLineNumbers
{
  "identifier": "expire-environment",
  "title": "Expire Environment on TTL",
  "nodes": [
    {
      "identifier": "trigger",
      "title": "On TTL Expired",
      "config": {
        "type": "EVENT_TRIGGER",
        "event": {
          "type": "TIMER_EXPIRED",
          "blueprintIdentifier": "environment",
          "propertyIdentifier": "ttl"
        }
      }
    },
    {
      "identifier": "update-status",
      "title": "Mark as Expired",
      "config": {
        "type": "UPSERT_ENTITY",
        "blueprintIdentifier": "environment",
        "mapping": {
          "identifier": "{{ .outputs.trigger.diff.after.identifier }}",
          "properties": {
            "status": "expired"
          }
        }
      }
    },
    {
      "identifier": "notify",
      "title": "Notify Owner",
      "config": {
        "type": "WEBHOOK",
        "url": "https://api.example.com/notify",
        "body": {
          "message": "Environment {{ .outputs.trigger.diff.after.title }} has expired",
          "owner": "{{ .outputs.trigger.diff.after.relations.owner }}"
        }
      }
    }
  ],
  "connections": [
    {
      "sourceIdentifier": "trigger",
      "targetIdentifier": "update-status"
    },
    {
      "sourceIdentifier": "update-status",
      "targetIdentifier": "notify"
    }
  ]
}
```
