---
sidebar_position: 1
title: Quickstart
---

import ClosedBetaFeatureNotice from '/docs/generalTemplates/_closed_beta_feature_notice.md';

# Quickstart

<ClosedBetaFeatureNotice id="workflows-beta" />

This guide will help you create your first workflow in Port. You'll learn how to build a simple self-service workflow that sends a webhook notification.

## Prerequisites

- Access to the Workflows (Beta) feature in your Port organization

## Creating your first workflow

### Using the visual editor

1. Navigate to the [Workflows page](https://app.getport.io/settings/workflows) in your Port portal.

2. Click the **+ Workflow** button in the top-right corner.

3. Describe the workflows you want to create, and send it to the AI assistant, or click **Skip to editor** to open the workflow editor.

4. You'll see the visual workflow editor with a default trigger node. If you used the AI assistant, the side-chat will open and start generating the workflow for you.
   Once the workflow is generated, you can review and apply the changes from the side-chat.

5. You can continue the conversation with the side-chat to make changes to the workflows at any time. Or, you can manually edit the JSON in the editor.

7. Click **Publish** to save and activate your workflow.

### Using JSON

Click the **JSON** tab in the editor to switch to JSON mode:

```json showLineNumbers
{
  "identifier": "my-first-workflow",
  "title": "My First Workflow",
  "icon": "Workflow",
  "description": "A simple webhook workflow",
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
              "title": "Message",
              "description": "The message to send"
            }
          },
          "required": ["message"]
        }
      }
    },
    {
      "identifier": "send-webhook",
      "title": "Send Webhook",
      "config": {
        "type": "WEBHOOK",
        "url": "https://example.com/webhook",
        "method": "POST",
        "body": {
          "message": "{{ .outputs.trigger.message }}"
        }
      }
    }
  ],
  "connections": [
    {
      "sourceIdentifier": "trigger",
      "targetIdentifier": "send-webhook"
    }
  ]
}
```

## Build with AI

Port's AI assistant can help you build workflows using natural language. In the workflow editor:

1. Use the side-chat on the right side.

2. Describe what you want your workflow to do in natural language, for example:
   - "Create a workflow that sends a Slack notification when a service is deployed"
   - "Build a self-service workflow that creates a new GitHub repository"
   - "Make a workflow that updates an entity's status after a webhook response"

3. The AI will generate the workflow for you, which you can then review and modify as needed.

:::tip Tips for AI-assisted workflow building
- Be specific about the trigger type (self-service vs event-based)
- Describe the actions you want to perform in sequence
- Mention any conditions or branching logic needed
- Specify the data you want to pass between nodes
- Specify the secret *names* you want to use for authentication
:::

## Next steps

Now that you've created your first workflow, explore these topics:

- [Self-service trigger](/workflows-beta/build-workflows/self-service-trigger/) - Learn how to configure user inputs and triggers
- [Event trigger](/workflows-beta/build-workflows/event-trigger) - Create workflows that respond to entity changes
- [Action nodes](/workflows-beta/build-workflows/action-nodes/) - Explore all available action types
- [Examples](/workflows-beta/examples) - See real-world workflow examples
