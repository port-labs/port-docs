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
