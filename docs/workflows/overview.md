---
sidebar_position: 1
title: Workflows
sidebar_label: Workflows (closed beta)
---

import Admonition from "@theme/Admonition"
import CodeBlock from "@theme/CodeBlock"
import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Workflows (closed beta)

Workflows let you define and run multi-step processes in Port using a JSON definition. A workflow is built from **nodes** connected by **connections**, and every execution creates a **workflow run** you can inspect in Port.

<Admonition type="warning" title="Closed beta notice">
Workflows are in **closed beta**, which means behavior, limits, and APIs can change without notice.
</Admonition>

<Tabs groupId="workflows" queryString>
  <TabItem value="overview" label="Overview" default>
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

    <Admonition type="warning" title="Closed beta expectations">
    During closed beta:
    - **No SLA is provided** for workflows.
    - **Breaking changes can happen** without notice.
    - **We may delete workflows, versions, or runs** as part of beta iteration, incident response, or internal migrations.
    - **Support is best-effort** and scoped to your beta agreement.
    </Admonition>
  </TabItem>

  <TabItem value="define" label="Define">
    <h2>Defining a workflow (JSON-first)</h2>

    Workflows are defined as JSON. At a minimum, you define:
    - A **trigger node** (the start of the workflow).
    - One or more **nodes** to execute after the trigger.
    - **Connections** between nodes that define the execution path.

    A workflow definition is identified by its `identifier`. When you update a workflow, Port stores a new version and future runs use the latest version.

    <Admonition type="info" title="Video walkthrough">
    During closed beta, your Port contact can share a short walkthrough video for defining and running workflows.
    </Admonition>

    <h2>Minimal example</h2>

    The workflow below starts from a self-serve trigger, collects a `message`, sends a webhook, and stores a `request_id` that can be referenced later.

    <CodeBlock language="json" showLineNumbers>{`{
  "identifier": "notify_on_demand",
  "title": "Notify on demand",
  "description": "Send a notification based on user input",
  "allowAnyoneToViewRuns": false,
  "nodes": [
    {
      "identifier": "trigger",
      "title": "Start",
      "config": {
        "type": "SELF_SERVE_TRIGGER",
        "userInputs": {
          "properties": {
            "message": {
              "type": "string",
              "title": "Message"
            }
          },
          "required": ["message"]
        }
      },
      "variables": {}
    },
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
  ],
  "connections": [
    {
      "identifier": "trigger_to_webhook",
      "sourceIdentifier": "trigger",
      "targetIdentifier": "send_webhook"
    }
  ]
}`}</CodeBlock>

    <Admonition type="caution" title="Trigger node wiring">
    Trigger nodes cannot have incoming connections. A trigger is always a start point.
    </Admonition>
  </TabItem>

  <TabItem value="triggers" label="Triggers">
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
  </TabItem>

  <TabItem value="nodes" label="Nodes">
    <h2>Nodes</h2>

    Nodes are the building blocks of workflows. Each node either starts a run (trigger), executes logic (action nodes), or routes execution (condition nodes).

    <h3>Action nodes</h3>

    Action nodes invoke external systems. In closed beta, the supported invocation types include:
    - `WEBHOOK`.
    - `KAFKA`.
    - `GITHUB`.
    - `GITLAB`.
    - `AZURE_DEVOPS`.
    - `UPSERT_ENTITY`.
    - `INTEGRATION_ACTION`.

    <Admonition type="caution" title="Third-party actions readiness">
    Some third-party integrations may not be fully supported for workflows during closed beta. Verify the integration’s workflow support in your Port environment before using it in production flows.
    </Admonition>

    <h3>Condition nodes</h3>

    Condition nodes let you branch based on runtime data. A condition node:
    - Evaluates conditions in order.
    - Selects the first matching connection.
    - Falls back to a default connection when no conditions match.

    Conditions are evaluated at runtime using the workflow variables available at that point in the run.
  </TabItem>

  <TabItem value="data" label="Data flow">
    <h2>Data flow in workflows</h2>

    Workflows pass data forward using **workflow variables**. The key idea is simple: every node can produce output, and later nodes can reference those outputs to build their own requests or decide which path to take.

    <h3>How outputs work</h3>

    - Each node run can produce an output object.
    - When a node completes, its output is stored under `workflowRun.variables.outputs[<nodeIdentifier>]`.
    - Later nodes can reference earlier node outputs using templates like `{{ .outputs.<nodeIdentifier>.<field> }}`.

    <h3>What gets evaluated (and when)</h3>

    Workflows evaluate templates at runtime in two places:
    - **Node config evaluation** (before execution): Use `{{ .outputs.<nodeIdentifier>... }}` to build the config you send to the external system.
    - **Node variables evaluation** (after execution): Use `{{ .response... }}` to map the raw node output into a smaller, stable shape for downstream nodes.

    <h3>Example: map webhook response to a stable output</h3>

    The webhook node below calls an external system and then stores a stable `service_url` value that later nodes can reuse.

    <CodeBlock language="json" showLineNumbers>{`{
  "identifier": "send_webhook",
  "title": "Send webhook",
  "config": {
    "type": "WEBHOOK",
    "url": "https://example.com/webhook",
    "method": "POST",
    "synchronized": true,
    "body": {
      "message": "{{ .outputs.trigger.message }}"
    }
  },
  "variables": {
    "service_url": "{{ .response.data.serviceUrl }}"
  }
}`}</CodeBlock>

    <h3>Secrets</h3>

    Workflows support **encrypted user inputs** (for example, secret inputs) and you can pass them to downstream nodes as inputs.

    <Admonition type="warning" title="Secrets in templates limitation">
    In the current closed beta, secrets injection into workflow templates is limited, and you should assume secrets are **not automatically available** in node config templating. Use encrypted user inputs and pass secrets explicitly to the node that needs them.
    </Admonition>
  </TabItem>

  <TabItem value="permissions" label="Permissions">
    <h2>Permissions and access control</h2>

    Workflows have two separate permission questions:
    - Who can **see** the workflow in self-serve entry points (and trigger it).
    - Who can **view** runs after they were created.

    <h3>Who can execute a workflow</h3>

    Self-serve workflow execution is controlled by a **permission policy** on the self-serve trigger node. If you cannot execute a workflow, ask your admin to update the workflow’s execute permissions.

    If you already use dynamic permissions for actions, the model is similar. See [dynamic permissions](https://docs.port.io/actions-and-automations/create-self-service-experiences/set-self-service-actions-rbac/dynamic-permissions/).

    <h3>Who can view runs</h3>

    Viewing workflow runs is restricted unless:
    - You created the run.
    - The workflow is configured with `allowAnyoneToViewRuns: true`.
    - You are an org admin.
  </TabItem>

  <TabItem value="runs" label="Runs">
    <h2>Running and inspecting workflows</h2>

    You can inspect workflow runs in Port, including:
    - Selected path (from condition nodes).
    - Node run status and result.
    - Node run logs and outputs.

    <h2>API endpoints for runs</h2>

    You can list and query runs using the workflows API:

    <CodeBlock language="bash" showLineNumbers>{`curl --location --request GET 'https://api.getport.io/v1/workflows/runs?workflowIdentifiers=<WORKFLOW_IDENTIFIER>' \\
  --header 'Authorization: Bearer <ACCESS_TOKEN>'`}</CodeBlock>
  </TabItem>

  <TabItem value="api" label="API and limits">
    <h2>API</h2>

    Workflows are exposed via the Port API gateway under `https://api.getport.io/v1/workflows`.

    Common endpoints include:
    - `POST /v1/workflows`.
    - `GET /v1/workflows`.
    - `GET /v1/workflows/<workflow_identifier>`.
    - `PATCH /v1/workflows/<workflow_identifier>`.
    - `DELETE /v1/workflows/<workflow_identifier>`.
    - `POST /v1/workflows/<workflow_identifier>/runs`.
    - `GET /v1/workflows/runs`.
    - `GET /v1/workflows/runs/<workflow_run_identifier>`.

    <Admonition type="info" title="OpenAPI specification">
    If you run the workflow service directly (for example, in a non-production environment), the Swagger UI is served at the service root path, and the OpenAPI spec is available at `/openapi.json`.
    </Admonition>

    <h2>Feature parity</h2>

    | Capability | Workflows (closed beta) | Actions | Automations |
    | --- | --- | --- | --- |
    | Multi-step orchestration. | Yes. | No (single run). | No (single run). |
    | Branching. | Yes (condition nodes). | No. | Limited (by trigger logic). |
    | Many user inputs. | Yes (self-serve trigger schema). | Yes. | No. |
    | Approvals. | No. | Yes. | No. |
    | Run logs. | Yes (node run logs). | Yes (run logs). | Yes (run logs). |
    | Parallelism. | Limited in closed beta. | Not applicable. | Limited (event-driven runs). |
    | Audit logs. | Partial (beta). | Yes. | Yes. |
    | Widgets. | Run history widget is available. | Yes. | Yes. |
    | Blueprint attachment. | No (workflows are separate objects). | Yes (actions attach to blueprints). | Yes (automations attach to blueprints). |

    <h2>Known limitations</h2>

    - **Regular API limits apply** (rate limits, payload size limits, and timeouts apply).
    - **Agent-based execution may be limited** in this closed beta and should be validated in your environment before you depend on it.
    - **Secrets injection is limited** (see the data flow tab).

    <h2>What’s next for workflows</h2>

    The workflows roadmap is evolving during closed beta, and common focus areas include:
    - Expanded node types and deeper integration coverage.
    - Improved secrets handling and template ergonomics.
    - Better parity with actions run UX (including approvals and richer auditability).

    <h2>Feedback welcome</h2>

    If you are using workflows in closed beta, share feedback with your Port contact so we can prioritize the next improvements.
  </TabItem>
</Tabs>


