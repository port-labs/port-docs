---
sidebar_position: 6
title: Permissions and access control
sidebar_label: "Permissions"
---

import Admonition from "@theme/Admonition"
import CodeBlock from "@theme/CodeBlock"

# Permissions and access control

Workflows support access control in two main areas:

- **Who can execute a workflow’s self-serve trigger**.
- **Who can view workflow runs**.

<h2>Execution permissions for self-serve triggers</h2>

Execution permissions are evaluated on the `SELF_SERVE_TRIGGER` node using a **permission query**. The workflow-service evaluates this query at runtime for:

- Listing workflows (workflows you cannot execute are filtered out).
- Fetching a specific workflow.
- Triggering a self-serve workflow run.

<h3>Where you can set permissions</h3>

Permissions can only be set on `SELF_SERVE_TRIGGER` nodes.

<Admonition type="info" title="Self-serve triggers only">
In the current implementation, workflow permissions can only be configured on the self-serve trigger node, not on every node type.
</Admonition>

<h3>Permissions API</h3>

You can manage trigger permissions using these endpoints:

- `POST /v1/workflows/:workflow_identifier/nodes/:node_identifier/permissions`.
- `PATCH /v1/workflows/:workflow_identifier/nodes/:node_identifier/permissions`.
- `GET /v1/workflows/:workflow_identifier/nodes/:node_identifier/permissions`.
- `DELETE /v1/workflows/:workflow_identifier/nodes/:node_identifier/permissions`.

<h3>Policy-based permissions</h3>

The permission query supports policy-based evaluation (similar to self-service action RBAC). This is useful when your “who can execute” logic depends on catalog data and user inputs.

<CodeBlock language="json" showLineNumbers>{`{
  "policy": {
    "queries": {
      "service": {
        "rules": [
          {
            "property": "$blueprint",
            "operator": "=",
            "value": "service"
          },
          {
            "property": "$identifier",
            "operator": "=",
            "value": "{{ .inputs.service }}"
          }
        ],
        "combinator": "and"
      }
    },
    "conditions": [
      ".results.service.entities | length == 1"
    ]
  }
}`}</CodeBlock>

If you already use policy-based permissions for actions, you can reuse the same mental model here. For more details about policy structure, see [dynamic permissions](/actions-and-automations/create-self-service-experiences/set-self-service-actions-rbac/dynamic-permissions).

<h2>Run visibility</h2>

Run visibility is controlled by the workflow’s `allowAnyoneToViewRuns` field and the run creator.

In the workflow-service, a user is allowed to view a workflow run if at least one of the following is true:

- The requester is a machine actor.
- The requester is the user who created the run.
- `allowAnyoneToViewRuns` is set to `true`.
- The requester is an **Admin** in Port.

<Admonition type="tip" title="Make runs visible for debugging">
If you want more users to be able to help debug runs, set `allowAnyoneToViewRuns` to `true` in the workflow definition.
</Admonition>


