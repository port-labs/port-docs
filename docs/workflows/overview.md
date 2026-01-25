---
sidebar_position: 1
title: Workflows
sidebar_label: "Overview"
---

# Workflows (closed beta)

Workflows let you define and run multi-step processes in Port using a JSON definition. A workflow is built from **nodes** connected by **connections**, and every execution creates a **workflow run** you can inspect in Port.

:::warning Closed beta notice
Workflows are in **closed beta**, which means behavior, limits, and APIs can change without notice.
:::

<h2>What this is (and what it isn’t)</h2>

Workflows are best when you want a **single run** to represent a multi-step process with an explicit execution path. Instead of managing several independent runs across systems, you get one timeline of what happened: which node ran, what it produced, what failed, and why the workflow took a certain branch.

Workflows are a good fit for:
- **Multi-step orchestration** where each step depends on previous outputs.
- **Branching** (for example, tier 1 services take a stricter path than tier 3 services).
- **Runnable operational processes** where you want a stable “start point” and a run history your teams can debug.

Workflows are not a replacement for:
- **Self-service actions**: Use actions when you want a single “unit of work” with a mature execution and audit model (including approvals). See [create actions](https://docs.port.io/actions-and-automations/create-self-service-experiences/).
- **Automations**: Use automations when you want event-driven execution that is optimized for “fire-and-forget” patterns and reactive behavior. See [define automations](https://docs.port.io/actions-and-automations/define-automations/).

<h2>Core concepts</h2>

<h3>Workflow</h3>

A **workflow** is a versioned JSON definition that includes:
- **Nodes**: The steps in your process.
- **Connections**: The edges between nodes that define valid paths.

<h3>Node</h3>

A **node** is a single step in a workflow. In closed beta, nodes can be:
- **Trigger nodes**: Start the workflow.
- **Action nodes**: Invoke an external system (webhook, GitHub, GitLab, Kafka, and more).
- **Condition nodes**: Choose a path based on runtime data.

<h3>Workflow run</h3>

A **workflow run** is a single execution of a workflow. A workflow run contains:
- **Node runs**: The executions of each node along the selected path.
- **Variables**: Accumulated outputs from completed nodes, available to later nodes.

<h3>Node run</h3>

A **node run** is a single execution of a node inside a workflow run. Node runs have:
- **Status**: `IN_PROGRESS` or `COMPLETED`.
- **Result** (when completed): `SUCCESS`, `FAILED`, or `CANCELLED`.
- **Logs**: Node run logs that help you debug what happened.

<h3>Trigger</h3>

A **trigger** defines how a workflow starts:
- **Self-serve triggers**: A user triggers a run from Port, optionally providing inputs.
- **Event triggers**: Port triggers a run automatically on entity events.

<h3>Condition</h3>

A **condition** is a runtime expression that decides which connection to follow.

<h3>Connection</h3>

A **connection** links one node to another and defines the possible next step(s).

<h2>What’s included in the closed beta</h2>

:::warning Closed beta expectations
During closed beta:
- **No SLA is provided** for workflows.
- **Breaking changes can happen** without notice.
- **We may delete workflows, versions, or runs** as part of beta iteration, incident response, or internal migrations.
- **Support is best-effort** and scoped to your beta agreement.
:::

<h2>Next steps</h2>

If you want to go deeper, start here:

- Read how to define a workflow in JSON in [define workflows](/workflows/define).
- Learn about available node types in [workflow nodes](/workflows/nodes).
- Understand how outputs flow between nodes in [data flow](/workflows/data-flow).
- Configure who can execute and who can view runs in [permissions and access control](/workflows/permissions).
- Learn how to debug and complete asynchronous nodes in [run and inspect workflows](/workflows/running-and-inspecting).
- Use organization secrets safely in [use secrets in workflows](/workflows/secrets).

