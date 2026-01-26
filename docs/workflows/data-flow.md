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

## Template expressions with JQ

Workflows use **JQ expressions** wrapped in `{{ }}` to reference and transform data at runtime. JQ is a powerful query language for JSON data that allows you to extract, filter, and manipulate values.

Common JQ patterns in workflows:

- **Access nested values**: `{{ .outputs.trigger.message }}`
- **Access array elements**: `{{ .outputs.webhook.data[0].id }}`
- **Transform data**: `{{ .outputs.trigger.name | upper }}`
- **Conditional logic**: `{{ if .outputs.trigger.tier == "tier_1" then "high" else "low" end }}`

For condition nodes, JQ expressions are used without the `{{ }}` wrapper (for example `.outputs.trigger.tier == "tier_1"`).

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

## Default output variables by node type

Each node type provides default output variables that are automatically available:

### Webhook nodes

Default output structure:

```json
{
  "response": {
    "data": {
      // Response body from the HTTP call
    }
  }
}
```

**Example**: After a webhook node runs, access the response with `{{ .outputs.webhook_node.response.data.field }}`.

### Upsert entity nodes

Default output structure:

```json
{
  "response": {
    "data": {
      "identifier": "entity-identifier"
    }
  }
}
```

The `identifier` field contains the identifier of the created or updated entity.

**Example**: Reference the created entity with `{{ .outputs.create_entity.response.data.identifier }}`.

### Kafka nodes

Kafka nodes do not produce output variables by default (fire-and-forget).

### Integration action nodes

Output structure depends on the integration's response format. Check your integration documentation for details.

## Custom variables override defaults

:::warning Variables completely replace default output
When you define custom variables on a node, they completely replace the default output. The default fields (like `response`) are **not preserved** unless you explicitly include them in your variables.
:::

**Example - Without custom variables:**

```json
{
  "identifier": "call_api",
  "config": {
    "type": "WEBHOOK",
    "url": "https://api.example.com/data"
  }
}
```

Output available to later nodes:

```json
{
  "response": {
    "data": {
      "id": "123",
      "name": "example"
    }
  }
}
```

**Example - With custom variables (response is lost):**

```json
{
  "identifier": "call_api",
  "config": {
    "type": "WEBHOOK",
    "url": "https://api.example.com/data"
  },
  "variables": {
    "item_id": "{{ .response.data.id }}"
  }
}
```

Output available to later nodes:

```json
{
  "item_id": "123"
}
```

The `response` field is **gone** because variables replaced it.

**Example - Preserve defaults and add custom fields:**

To keep the default output and add custom fields, explicitly include the default fields in your variables:

```json
{
  "identifier": "call_api",
  "config": {
    "type": "WEBHOOK",
    "url": "https://api.example.com/data"
  },
  "variables": {
    "response": "{{ .response }}",
    "item_id": "{{ .response.data.id }}",
    "item_name": "{{ .response.data.name }}"
  }
}
```

Output available to later nodes:

```json
{
  "response": {
    "data": {
      "id": "123",
      "name": "example"
    }
  },
  "item_id": "123",
  "item_name": "example"
}
```

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


