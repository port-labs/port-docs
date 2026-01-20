---
sidebar_position: 2
title: Define workflows
sidebar_label: "Define"
---

import Admonition from "@theme/Admonition"
import CodeBlock from "@theme/CodeBlock"

# Define workflows

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

<h2>Related topics</h2>

If you are building workflows beyond the minimal example, these pages help you model and debug real runs:

- Learn about node types in [workflow nodes](/workflows/nodes).
- Learn how outputs are stored and referenced in [data flow](/workflows/data-flow).
- Learn how to run and debug workflows in [run and inspect workflows](/workflows/running-and-inspecting).


