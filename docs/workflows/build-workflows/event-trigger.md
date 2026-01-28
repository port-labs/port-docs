---
sidebar_position: 3
title: Event trigger
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import ClosedBetaFeatureNotice from '/docs/generalTemplates/_closed_beta_feature_notice.md';

# Event trigger

<ClosedBetaFeatureNotice id="workflows" />

Event triggers allow workflows to run automatically in response to changes in your software catalog. When an entity is created, updated, or deleted, the workflow can be triggered to perform automated actions.

## Trigger types

You can configure the following event types:

| Event type | Description |
| ---------- | ----------- |
| `ENTITY_CREATED` | Triggered when a new entity is created in the specified blueprint |
| `ENTITY_UPDATED` | Triggered when an existing entity is updated |
| `ENTITY_DELETED` | Triggered when an entity is deleted |
| `ANY_ENTITY_CHANGE` | Triggered on any change (create, update, or delete) |
| `TIMER_EXPIRED` | Triggered when a timer property expires |

## Configuration

Here's how to configure each event trigger type:

<Tabs groupId="trigger-type" queryString defaultValue="created" values={[
{label: "Entity created", value: "created"},
{label: "Entity updated", value: "updated"},
{label: "Entity deleted", value: "deleted"},
{label: "Any entity change", value: "any"},
{label: "Timer expired", value: "timer"}
]}>

<TabItem value="created">

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

</TabItem>
<TabItem value="updated">

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

</TabItem>
<TabItem value="deleted">

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

</TabItem>
<TabItem value="any">

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

</TabItem>
<TabItem value="timer">

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

</TabItem>
</Tabs>

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

<Tabs groupId="condition-patterns" queryString defaultValue="changed" values={[
{label: "Property changed", value: "changed"},
{label: "Property equals value", value: "equals"},
{label: "Property changed to value", value: "changed-to"},
{label: "Has relation", value: "relation"}
]}>

<TabItem value="changed">

Check if a property value has changed:

```json
{
  "expressions": [
    ".diff.before.properties.status != .diff.after.properties.status"
  ]
}
```

</TabItem>
<TabItem value="equals">

Filter for entities with a specific property value:

```json
{
  "expressions": [
    ".diff.after.properties.tier == \"critical\""
  ]
}
```

</TabItem>
<TabItem value="changed-to">

Check if a property changed from any value to a specific value:

```json
{
  "expressions": [
    ".diff.before.properties.status != \"deployed\"",
    ".diff.after.properties.status == \"deployed\""
  ],
  "combinator": "and"
}
```

</TabItem>
<TabItem value="relation">

Check if an entity has a specific relation set:

```json
{
  "expressions": [
    ".diff.after.relations.team != null"
  ]
}
```

</TabItem>
</Tabs>

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

```json showLineNumbers
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

This example shows how to reference event trigger outputs in an action node. Since the trigger node's identifier is `trigger`, outputs are accessed via `.outputs.trigger`:

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

This workflow monitors critical services and sends a Slack notification when their status changes. It uses conditions to trigger only for services with `tier` set to critical.

<details>
<summary><b>Workflow example (click to expand)</b></summary>

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

</details>

### Clean up resources on environment deletion

This workflow triggers when an environment entity is deleted and calls an external API to clean up the associated cloud resources.

<details>
<summary><b>Workflow example (click to expand)</b></summary>

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

</details>

### Auto-expire TTL environments

This workflow uses a timer trigger to automatically mark environments as expired when their TTL property expires, then notifies the owner.

<details>
<summary><b>Workflow example (click to expand)</b></summary>

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

</details>
