---
sidebar_position: 4
title: Workflow nodes
sidebar_label: "Nodes"
---

# Workflow nodes

In Port workflows, a **node** is a single step in your workflow's execution path.

You define nodes under `nodes[]`, then connect them using `connections[]`. At runtime, each executed node writes its output into the workflow run variables (see [data flow](/workflows/data-flow)).

## Action nodes

Action nodes are nodes whose `config.type` is one of the supported **invocation types** (for example `WEBHOOK`, `KAFKA`, `UPSERT_ENTITY`).

Action nodes can be either **synchronous** (the node completes in the workflow engine) or **asynchronous** (the node is completed by an external worker/integration that updates the node run).

### Webhook

Use a `WEBHOOK` node to call an HTTP endpoint.

- If `synchronized` is set to `true`, the workflow engine will wait for the response and store it under the node run output (for example `output.response.data`).
- If `synchronized` is set to `false`, the workflow engine does not wait for the response. In that case, your run typically needs an external component to update the node run result (see [run and inspect workflows](/workflows/running-and-inspecting)).

**Example - Synchronized webhook:**

```json showLineNumbers
{
  "identifier": "send_notification",
  "title": "Send notification",
  "config": {
    "type": "WEBHOOK",
    "url": "https://api.example.com/notify",
    "method": "POST",
    "synchronized": true,
    "headers": {
      "Content-Type": "application/json",
      "Authorization": "Bearer {{ .secrets.API_TOKEN }}"
    },
    "body": {
      "message": "{{ .outputs.trigger.message }}",
      "priority": "high"
    }
  },
  "variables": {
    "notification_id": "{{ .response.data.id }}",
    "status": "{{ .response.data.status }}"
  }
}
```

**Example - Unsynchronized webhook:**

```json showLineNumbers
{
  "identifier": "trigger_long_process",
  "title": "Trigger long-running process",
  "config": {
    "type": "WEBHOOK",
    "url": "https://api.example.com/start-job",
    "method": "POST",
    "synchronized": false,
    "headers": {
      "Content-Type": "application/json"
    },
    "body": {
      "jobType": "deployment",
      "target": "{{ .outputs.trigger.environment }}"
    }
  }
}
```

### Kafka

Use a `KAFKA` node to publish a payload to your organization's dedicated Kafka topic (`<ORG_ID>.runs`).

**Example:**

```json showLineNumbers
{
  "identifier": "publish_event",
  "title": "Publish to Kafka",
  "config": {
    "type": "KAFKA",
    "payload": {
      "action": "service_deployed",
      "service": "{{ .outputs.trigger.service_name }}",
      "version": "{{ .outputs.trigger.version }}",
      "timestamp": "{{ .outputs.trigger.timestamp }}"
    }
  }
}
```

### Upsert entity

Use an `UPSERT_ENTITY` node to create or update an entity in your Port catalog. The node returns a response output that includes the created/updated entity identifier.

**Example:**

```json showLineNumbers
{
  "identifier": "create_deployment",
  "title": "Create deployment entity",
  "config": {
    "type": "UPSERT_ENTITY",
    "blueprintIdentifier": "deployment",
    "mapping": {
      "identifier": "{{ .outputs.trigger.service_name }}-{{ .outputs.trigger.version }}",
      "title": "Deployment of {{ .outputs.trigger.service_name }}",
      "properties": {
        "version": "{{ .outputs.trigger.version }}",
        "environment": "{{ .outputs.trigger.environment }}",
        "status": "in_progress"
      },
      "relations": {
        "service": "{{ .outputs.trigger.service_name }}"
      }
    }
  },
  "variables": {
    "entity_identifier": "{{ .entity.identifier }}"
  }
}
```

### Integration actions

`INTEGRATION_ACTION` nodes represent work that is executed outside the workflow-service runtime by an integration worker.

In practice, this means:

- Your workflow run may stay **in progress** until the external system reports completion.
- You should validate your integration connectivity (and permissions) before sharing the workflow with end users.

**Example:**

```json showLineNumbers
{
  "identifier": "run_integration",
  "title": "Execute integration action",
  "config": {
    "type": "INTEGRATION_ACTION",
    "integration": "my-custom-integration",
    "action": "deploy",
    "invocationMethod": {
      "type": "WEBHOOK",
      "url": "{{ .secrets.INTEGRATION_WEBHOOK_URL }}",
      "body": {
        "service": "{{ .outputs.trigger.service_name }}",
        "environment": "{{ .outputs.trigger.environment }}"
      }
    }
  },
  "variables": {
    "deployment_url": "{{ .response.data.url }}"
  }
}
```

:::caution Validate execution before publishing
If your workflow includes asynchronous nodes (for example integration actions or unsynchronized webhooks), make sure you have a corresponding worker/integration that updates node runs. Otherwise, runs can remain stuck in `IN_PROGRESS`.

To manually update a node run status, use the API:

```bash
PATCH /v1/workflows/nodes/runs/:node_run_identifier
```

This allows you to set the node run `result` (`SUCCESS`, `FAILED`, or `CANCELLED`) and attach output data. In the future, this capability will be available in the UI as well.
:::

## Condition nodes

A `CONDITION` node selects the next connection based on runtime data.

- Options are evaluated **in order** (top to bottom).
- The **first** expression that evaluates to `true` determines the next connection.
- If no expression matches, the node follows the fallback connection.

Condition expressions are evaluated against the workflow run variables (see [data flow](/workflows/data-flow)).

```json showLineNumbers
{
  "identifier": "decide_path",
  "title": "Choose a path",
  "config": {
    "type": "CONDITION",
    "options": [
      {
        "identifier": "tier_1_option",
        "title": "Tier 1 service",
        "expression": ".outputs.trigger.tier == \"tier_1\""
      }
    ]
  }
}
```

Connections from condition nodes reference the option identifier:

```json showLineNumbers
{
  "sourceIdentifier": "decide_path",
  "sourceOptionIdentifier": "tier_1_option",
  "targetIdentifier": "tier_1_handler"
}
```

For the fallback path (when no option matches), use a connection with `fallback: true`:

```json showLineNumbers
{
  "sourceIdentifier": "decide_path",
  "fallback": true,
  "targetIdentifier": "default_handler"
}
```


