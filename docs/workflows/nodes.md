---
sidebar_position: 4
title: Workflow nodes
sidebar_label: "Nodes"
---

# Workflow nodes

In Port workflows, a **node** is a single step in your workflow's execution path.

You define nodes under `nodes[]`, then connect them using `connections[]`. At runtime, each executed node writes its output into the workflow run variables (see [data flow](/workflows/data-flow)).

<h2>Action nodes</h2>

Action nodes are nodes whose `config.type` is one of the supported **invocation types** (for example `WEBHOOK`, `KAFKA`, `UPSERT_ENTITY`, `GITHUB`, `GITLAB`, `AZURE_DEVOPS`, or `INTEGRATION_ACTION`).

Action nodes can be either **synchronous** (the node completes in the workflow engine) or **asynchronous** (the node is completed by an external worker/integration that updates the node run).

<h3>Webhook</h3>

Use a `WEBHOOK` node to call an HTTP endpoint.

- If `synchronized` is set to `true`, the workflow engine will wait for the response and store it under the node run output (for example `output.response.data`).
- If `synchronized` is set to `false`, the workflow engine does not wait for the response. In that case, your run typically needs an external component to update the node run result (see [run and inspect workflows](/workflows/running-and-inspecting)).

<h3>Webhook (agent mode)</h3>

If you set `agent: true` on a `WEBHOOK` node, the workflow engine sends the request details to your organization's dedicated Kafka topic (`<ORG_ID>.runs`). Your agent is expected to perform the request and then update the node run in Port.

<h3>Kafka</h3>

Use a `KAFKA` node to publish a payload to your organization's dedicated Kafka topic (`<ORG_ID>.runs`).

<h3>Upsert entity</h3>

Use an `UPSERT_ENTITY` node to create or update an entity in your Port catalog. The node returns a response output that includes the created/updated entity identifier.

<h3>Third-party actions</h3>

Third-party action nodes (for example `GITHUB`, `GITLAB`, `AZURE_DEVOPS`, and `INTEGRATION_ACTION`) represent work that is executed outside the workflow-service runtime (for example by an integration worker).

In practice, this means:

- Your workflow run may stay **in progress** until the external system reports completion.
- You should validate your integration connectivity (and permissions) before sharing the workflow with end users.

:::caution Validate execution before publishing
If your workflow includes asynchronous nodes (for example agent-mode webhooks or third-party actions), make sure you have a corresponding worker/integration that updates node runs. Otherwise, runs can remain stuck in `IN_PROGRESS`.
:::

<h2>Condition nodes</h2>

A `CONDITION` node selects the next connection based on runtime data.

- Conditions are evaluated **in order** (top to bottom).
- The **first** expression that evaluates to `true` determines the next connection.
- If no expression matches, the node uses `defaultConnectionIdentifier`.

Condition expressions are evaluated against the workflow run variables (see [data flow](/workflows/data-flow)).

```json showLineNumbers
{
  "identifier": "decide_path",
  "title": "Choose a path",
  "config": {
    "type": "CONDITION",
    "conditions": [
      {
        "title": "Tier 1 service",
        "expression": ".outputs.trigger.tier == \"tier_1\"",
        "connectionIdentifier": "tier_1_path"
      }
    ],
    "defaultConnectionIdentifier": "default_path"
  }
}
```


