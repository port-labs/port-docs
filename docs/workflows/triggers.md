---
sidebar_position: 3
title: Triggers
sidebar_label: "Triggers"
---

# Triggers

<h2>Triggering a workflow</h2>

Workflows can be triggered manually (self-serve) or automatically (events). Both trigger types create a workflow run and store the trigger output under `workflowRun.variables.outputs[<triggerNodeIdentifier>]`.

<h3>Self-serve triggers</h3>

A self-serve trigger starts from a `SELF_SERVE_TRIGGER` node. You typically use it when:
- You want a user to explicitly start the workflow.
- You want user inputs validated against a schema before the run starts.

If your workflow includes a `SELF_SERVE_TRIGGER` node, users can trigger it from Port’s UI.

If you want a dedicated self-service experience with additional UI capabilities, you can also trigger a workflow run through a self-service action that calls the workflows API.

<CodeBlock language="bash" showLineNumbers>{`curl --location --request POST 'https://api.getport.io/v1/workflows/<WORKFLOW_IDENTIFIER>/runs' \\
  --header 'Authorization: Bearer <ACCESS_TOKEN>' \\
  --header 'Content-Type: application/json' \\
  --data-raw '{
    "inputs": {
      "message": "hello from a self-service action"
    }
  }'`}</CodeBlock>

<Admonition type="info" title="API regions">
If you use the US region API, replace `https://api.getport.io` with `https://api.us.getport.io`.
</Admonition>

<h3>Event triggers</h3>

Event triggers start from an `EVENT_TRIGGER` node. You use them when you want workflows to run automatically based on entity changes.

Supported events include:
- `ENTITY_CREATED`.
- `ENTITY_UPDATED`.
- `ENTITY_DELETED`.
- `ANY_ENTITY_CHANGE`.
- `TIMER_EXPIRED`.

To use `TIMER_EXPIRED`, set your trigger to include both the blueprint identifier and the timer property identifier.

<h3>Filtering with trigger conditions</h3>

Event triggers can include a JQ condition. This is useful when you only want to trigger on a subset of events, for example when a property is set to a specific value.

<CodeBlock language="json" showLineNumbers>{`{
  "identifier": "event_trigger",
  "config": {
    "type": "EVENT_TRIGGER",
    "event": {
      "type": "ENTITY_CREATED",
      "blueprintIdentifier": "service"
    },
    "condition": {
      "type": "JQ",
      "expressions": [
        ".diff.after.properties.tier == \\"tier_1\\""
      ],
      "combinator": "and"
    }
  }
}`}</CodeBlock>

<h2>Using trigger outputs in later nodes</h2>

Both trigger types store their output under `workflowRun.variables.outputs[<triggerNodeIdentifier>]`.

This output can be referenced in later nodes on the same execution path using templates (for example `{{ .outputs.event_trigger.diff.after.properties.tier }}`), and is evaluated at runtime (see [data flow](/workflows/data-flow)).


