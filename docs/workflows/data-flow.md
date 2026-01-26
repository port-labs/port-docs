---
sidebar_position: 5
title: Data flow
sidebar_label: "Data flow"
---

# Data flow

Workflows are **data-driven**: each node can produce an output, and later nodes can reference that output at runtime.

## Where outputs are stored

During a workflow run, node outputs accumulate under:

- `workflowRun.variables.outputs[<nodeIdentifier>]`.

For example, after a node with identifier `trigger` runs, you can reference its data under `workflowRun.variables.outputs.trigger`.

## Use outputs in later nodes

When a node is about to run, its config is evaluated using the current `workflowRun.variables`. This allows you to use values from earlier nodes in:

- Webhook URLs.
- Headers and request bodies.
- Kafka payloads.
- Upsert mappings.

```json showLineNumbers
{
  "identifier": "send_webhook",
  "title": "Send webhook",
  "config": {
    "type": "WEBHOOK",
    "url": "https://example.com/webhook",
    "method": "POST",
    "synchronized": true,
    "headers": {
      "Content-Type": "application/json"
    },
    "body": {
      "message": "{{ .outputs.trigger.message }}"
    }
  },
  "variables": {
    "request_id": "{{ .response.data.requestId }}"
  }
}
```

## Runtime evaluation

Workflows evaluate data in two phases:

- **Node config evaluation (before execution)**: templates inside `node.config` are evaluated against the current `workflowRun.variables`.
- **Node variables evaluation (after execution)**: templates inside `node.variables` are evaluated against the node's raw execution output, then stored into `workflowRun.variables.outputs[<nodeIdentifier>]`.

This means values are always computed **at runtime**, using the data available in the run at that moment.

## Branching and path-dependent outputs

Outputs are only created for nodes that actually ran. If your workflow branches, nodes that were not executed will not have outputs under `workflowRun.variables.outputs`.

## Trigger outputs you can reference

Both trigger types store their output under `workflowRun.variables.outputs[<triggerNodeIdentifier>]` (see [triggers](/workflows/triggers)).

Common examples include:

- **Self-serve trigger**: user inputs are available under the trigger output (for example `{{ .outputs.trigger.message }}`).
- **Event trigger**: event payload data is available under the trigger output (for example `.outputs.event_trigger.diff.after.properties` when using entity change events).

## Use secrets

Port secrets are referenced using the same template syntax used elsewhere in Port:

```json showLineNumbers
{
  "headers": {
    "Authorization": "Bearer {{ .secrets.MY_SECRET_NAME }}"
  }
}
```


