---
sidebar_position: 3
title: Triggers
sidebar_label: "Triggers"
---

# Triggers

## Trigger a workflow

Workflows can be triggered manually (self-serve) or automatically (events). Both trigger types create a workflow run and store the trigger output under `workflowRun.variables.outputs[<triggerNodeIdentifier>]`.

### Self-serve triggers

A self-serve trigger starts from a `SELF_SERVE_TRIGGER` node. You typically use it when:
- You want a user to explicitly start the workflow.
- You want user inputs validated against a schema before the run starts.

If your workflow includes a `SELF_SERVE_TRIGGER` node, users can trigger it from Port's UI.

If you want a dedicated self-service experience with additional UI capabilities, you can also trigger a workflow run through a [self-service action](/actions-and-automations/create-self-service-experiences/) that calls the workflows API.

```bash showLineNumbers
curl --location --request POST 'https://api.getport.io/v1/workflows/<WORKFLOW_IDENTIFIER>/runs' \
  --header 'Authorization: Bearer <ACCESS_TOKEN>' \
  --header 'Content-Type: application/json' \
  --data-raw '{
    "inputs": {
      "message": "hello from a self-service action"
    }
  }'
```

:::info API regions
If you use the US region API, replace `https://api.getport.io` with `https://api.us.getport.io`.
:::

### Event triggers

Event triggers start from an `EVENT_TRIGGER` node. You use them when you want workflows to run automatically based on entity changes.

Supported events include:
- `ENTITY_CREATED`.
- `ENTITY_UPDATED`.
- `ENTITY_DELETED`.
- `ANY_ENTITY_CHANGE`.
- `TIMER_EXPIRED`.

To use `TIMER_EXPIRED`, set your trigger to include both the blueprint identifier and the timer property identifier.

### Filter events with condition nodes

When you want to filter or branch based on trigger data, use a `CONDITION` node after your trigger. This allows you to route the workflow differently based on the event data.

For example, to handle services differently based on their tier:

```json showLineNumbers
{
  "identifier": "notify_on_service_change",
  "title": "Handle service updates",
  "nodes": [
    {
      "identifier": "event_trigger",
      "config": {
        "type": "EVENT_TRIGGER",
        "event": {
          "type": "ENTITY_UPDATED",
          "blueprintIdentifier": "service"
        }
      }
    },
    {
      "identifier": "check_tier",
      "title": "Check service tier",
      "config": {
        "type": "CONDITION",
        "options": [
          {
            "identifier": "tier_1_option",
            "title": "Tier 1 service",
            "expression": ".outputs.event_trigger.diff.after.properties.tier == \"tier_1\""
          }
        ]
      }
    }
  ],
  "connections": [
    {
      "sourceIdentifier": "event_trigger",
      "targetIdentifier": "check_tier"
    }
  ]
}
```

See [condition nodes](/workflows/nodes#condition-nodes) for more details on routing logic.

## Use trigger outputs in later nodes

Both trigger types store their output under `workflowRun.variables.outputs[<triggerNodeIdentifier>]`.

This output can be referenced in later nodes on the same execution path using templates (for example `{{ .outputs.event_trigger.diff.after.properties.tier }}`), and is evaluated at runtime (see [data flow](/workflows/data-flow)).


