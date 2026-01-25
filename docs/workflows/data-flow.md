---
sidebar_position: 5
title: Data flow
sidebar_label: "Data flow"
---

import Admonition from "@theme/Admonition"
import CodeBlock from "@theme/CodeBlock"

# Data flow

Workflows are **data-driven**: each node can produce an output, and later nodes can reference that output at runtime.

<h2>Where outputs are stored</h2>

During a workflow run, node outputs accumulate under:

- `workflowRun.variables.outputs[<nodeIdentifier>]`.

For example, after a `trigger` node runs, you can reference its data under `workflowRun.variables.outputs.trigger`.

<h2>Using outputs in later nodes</h2>

When a node is about to run, its config is evaluated using the current `workflowRun.variables`. This allows you to use values from earlier nodes in:

- Webhook URLs.
- Headers and request bodies.
- Kafka payloads.
- Upsert mappings.

<CodeBlock language="json" showLineNumbers>{`{
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
}`}</CodeBlock>

<h2>Runtime evaluation</h2>

Workflows evaluate data in two phases:

- **Node config evaluation (before execution)**: templates inside `node.config` are evaluated against the current `workflowRun.variables`.
- **Node variables evaluation (after execution)**: templates inside `node.variables` are evaluated against the node’s raw execution output, then stored into `workflowRun.variables.outputs[<nodeIdentifier>]`.

This means values are always computed **at runtime**, using the data available in the run at that moment.

<h2>Branching and path-dependent outputs</h2>

Outputs are only created for nodes that actually ran. If your workflow branches, nodes that were not executed will not have outputs under `workflowRun.variables.outputs`.

<h2>Trigger outputs you can reference</h2>

Both trigger types store their output under `workflowRun.variables.outputs[<triggerNodeIdentifier>]` (see [triggers](/workflows/triggers)).

Common examples include:

- **Self-serve trigger**: user inputs are available under the trigger output (for example `{{ .outputs.trigger.message }}`).
- **Event trigger**: event payload data is available under the trigger output (for example `.outputs.event_trigger.diff.after.properties` when using entity change events).

<h2>Using secrets</h2>

Port secrets are referenced using the same template syntax used elsewhere in Port:

<CodeBlock language="json" showLineNumbers>{`{
  "headers": {
    "Authorization": "Bearer {{ .secrets.MY_SECRET_NAME }}"
  }
}`}</CodeBlock>

<Admonition type="info" title="Port secrets reference">
For background and secret creation steps, see [port secrets](/sso-rbac/port-secrets/port-secrets).
</Admonition>


