---
sidebar_position: 7
title: Run and inspect workflows
sidebar_label: "Run and inspect"
---

# Run and inspect workflows

Every execution of a workflow creates a **workflow run**. A run contains node runs (one per executed node), their outputs, and logs.

<h2>Trigger a run</h2>

You can trigger a run in two common ways:

- **From Port UI** using a self-serve trigger node.
- **From the API** by calling the workflow runs endpoint.

```bash showLineNumbers
curl --location --request POST 'https://api.getport.io/v1/workflows/<WORKFLOW_IDENTIFIER>/runs' \
  --header 'Authorization: Bearer <ACCESS_TOKEN>' \
  --header 'Content-Type: application/json' \
  --data-raw '{
    "inputs": {
      "message": "hello from a workflow run"
    }
  }'
```

:::info API regions
If you use the US region API, replace `https://api.getport.io` with `https://api.us.getport.io`.
:::

<h2>List runs</h2>

To list runs (for example for your runs history UI), call:

- `GET /v1/workflows/runs`.

Runs that you cannot view are filtered out based on the rules described in [permissions and access control](/workflows/permissions).

<h2>Get a run</h2>

To retrieve a single run by identifier, call:

- `GET /v1/workflows/runs/:identifier`.

<h2>Inspect node runs and logs</h2>

Each workflow run includes the node runs that were executed, including logs that help you understand:

- Which node ran.
- What data it produced.
- What failed (and why).

<h2>Completing asynchronous nodes</h2>

Some node types are designed to be completed by an external system (for example agent-mode webhooks, or third-party actions).

In those cases, the external component should update the node run using:

- `PATCH /v1/workflows/nodes/runs/:node_run_identifier`.

This endpoint is the mechanism used to:

- Set the node run `result` (`SUCCESS`, `FAILED`, or `CANCELLED`).
- Attach `output` payloads that can be transformed into stored outputs (see [data flow](/workflows/data-flow)).

<h3>Claiming and acknowledging pending node runs</h3>

Integration workers can also use a claim/ack flow:

- `POST /v1/org/:org_id/workflows/runs/claim-pending`.
- `PATCH /v1/org/:org_id/workflows/runs/ack`.

This flow is intended for workers that poll for pending work by `installationId`, process it, and then acknowledge completion.


