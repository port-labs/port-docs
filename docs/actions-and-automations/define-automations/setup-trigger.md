---
sidebar_position: 1
title: Setup trigger
---

# Setup trigger

Automation triggers are entity events in your software catalog that you want to act upon.  
All triggers are defined for a specific blueprint, and will apply to entities based on that blueprint.

## Available triggers

The following trigger events are available to use in your automations:

| Trigger | Description | JSON event type identifier |
| --- | --- | --- |
| Any entity change | Triggered when any entity based on the selected blueprint is **created**, **updated**, or **deleted**. | `ANY_ENTITY_CHANGE` |
| Entity creation | Triggered when any entity based on the selected blueprint is **created**. | `ENTITY_CREATED` |
| Entity update | Triggered when any entity based on the selected blueprint is **updated**. | `ENTITY_UPDATED` |
| Entity deletion | Triggered when any entity based on the selected blueprint is **deleted**. | `ENTITY_DELETED` |
| Timer expiration | Triggered when the selected timer property set on an entity based on the selected blueprint **expires**. | `TIMER_PROPERTY_EXPIRED` |

## JSON structure

An automation's trigger is defined under the `trigger` key:

```json showLineNumbers
{
  "identifier": "unique_id",
  "title": "Title",
  "icon": "icon_identifier",
  "description": "automation description",
  # highlight-start
  "trigger": {
    "type": "automation",
    "event": {
      "type": "event_type",
      "blueprintIdentifier": "blueprint_id"
    },
    "condition": {
      "type": "JQ",
      "expressions": ["expression1", "expression2"],
      "combinator": "and"
    }
  },
  # highlight-end
  "invocationMethod": {
    "type": "WEBHOOK",
    "url": "https://example.com"
  },
  "publish": false
}
```
<br/>

The table below describes the fields in the JSON structure under the `trigger` key (fields in **bold** are required):

| Field | Description |
| --- | --- |
| **`type`** | The automation's trigger type. Should be set to `automation`. |
| **`event`** | An object containing data about the event that triggers the automation. |
| **`event.type`** | The [trigger event type](/actions-and-automations/define-automations/setup-trigger#available-triggers). |
| **`event.blueprintIdentifier`** | The identifier of the blueprint whose entities will trigger the automation. |
| `condition` | An optional object containing `jq` expressions used to determine which entities the automation will be triggered for. |
| `condition.type` | The type of condition. Should be set to `JQ`. |
| `condition.expressions` | An array of expressions used to filter the entities for which the automation will be triggered. |
| `condition.combinator` | The combinator used to combine the expressions. Should be set to `and` or `or`. |

## Conditions

You can use the `condition` key to filter the entities for which the automation will be triggered.  

The following condition example contains a single expression that will cause the automation to trigger only for entities with a `status` property set to `Active`:

```json showLineNumbers
"condition": {
  "type": "JQ",
  "expressions": [
    ".diff.after.properties.status == \"Active\""
  ],
  "combinator": "and"
}
```

The data that is available to you when writing expressions contains useful information about the entity and the event that triggered the automation. 

Here is an example of what this object could look like for an automation that triggers whenever a `service` entity is **updated**:

```json showLineNumbers
{
  "action": "UPDATE",
  "resourceType": "entity",
  "trigger": {
    "by": {
      "orgId": "org_BneDtWovPqXaA2VZ",
      "userId": "auth0|62ceaea697ca00f09d7c4f45"
    },
    "origin": "UI",
    "at": "2024-06-09T12:28:18.477Z"
  },
  "context": {
    "blueprintIdentifier": "service",
    "entityIdentifier": "example-service-identifier",
    "propertyIdentifier": null
  },
  "diff": {
    "before": {
      "identifier": "example-service-identifier",
      "title": "Example service",
      "icon": null,
      "blueprint": "service",
      "team": [
        "Rocket"
      ],
      "properties": {
        "latestVersion": "12.8.2",
        "language": "TypeScript",
        "one_hop_service_language": "Ruby",
        "two_hops_service_language": "Ruby",
        "repo": "https://github.com/some-org/example-service"
      },
      "relations": {
        "using": "rogue-service"
      },
      "createdAt": "2024-06-09T09:57:52.931Z",
      "createdBy": "60EsooJtOqimlekxrNh7nfr2iOgTcyLZ",
      "updatedAt": "2024-06-09T09:57:52.931Z",
      "updatedBy": "60EsooJtOqimlekxrNh7nfr2iOgTcyLZ"
    },
    "after": {
      "identifier": "example-service-identifier",
      "title": "Example service renamed",
      "icon": "Microservice",
      "blueprint": "service",
      "team": [
        "Rocket"
      ],
      "properties": {
        "latestVersion": "12.8.22",
        "language": "Python",
        "one_hop_service_language": "Ruby",
        "two_hops_service_language": "Ruby",
        "repo": "https://github.com/some-org/example-service"
      },
      "relations": {
        "using": "rogue-service"
      },
      "createdAt": "2024-06-09T09:57:52.931Z",
      "createdBy": "60EsooJtOqimlekxrNh7nfr2iOgTcyLZ",
      "updatedAt": "2024-06-09T12:28:18.628Z",
      "updatedBy": "auth0|62ceaea697ca00f09d7c4f45"
    }
  }
}
```

The example above is for an automation that uses the `ENTITY_UPDATED` trigger event. The `diff` object contains data from `before` and `after` the update.  

The other trigger events have the same structure, with the following differences:

- `ENTITY_CREATED` - In the `diff` object, `before` will be `null`, and `after` will contain the new entity data.

- `ENTITY_DELETED` - In the `diff` object, `before` will contain the entity data before deletion, and `after` will be `null`.

- `ANY_ENTITY_CHANGE` - The `diff` object will contain `before` and `after` data according to the entity change.

- `TIMER_PROPERTY_EXPIRED` - In the `diff` object, there will be an `after` object containing the entity data.