---
sidebar_position: 1
title: Quickstart
---

import ClosedBetaFeatureNotice from '/docs/generalTemplates/_closed_beta_feature_notice.md';

# Quickstart

<ClosedBetaFeatureNotice id="workflows" />

In this page we are going to demonstrate how to create your first workflow in Port. We will build a simple self-service workflow that sends a webhook notification when triggered.

## Prerequisites

Get acccess to the workflows (beta) feature in your Port organization.

## Set up

You can create workflows in Port using three approaches:

- **Visual editor** - Build workflows by dragging and connecting nodes in a visual graph.
- **JSON editor** - Define workflows directly in JSON for precise control.
- **Build with AI** - Describe your workflow in natural language and let AI generate it for you.

### Using the visual editor

1. Go to the [Workflows page](https://app.getport.io/settings/workflows) of your portal.

2. Click on the `+ Workflow` button in the top-right corner.

3. Click on **Skip to editor** to open the workflow editor.

4. Add action nodes by clicking on nodes in the left sidebar and connecting them to build your workflow.

5. Configure each node by clicking on it and editing its properties in the right panel.

6. Click `Publish` to save your workflow.

### Using JSON

1. Click on the **JSON** tab in the editor to switch to JSON mode.

2. Copy and paste the following JSON into the editor:

   <details>
   <summary><b>Workflow JSON example (click to expand)</b></summary>

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

   </details>

### Build with AI

Port's AI assistant can help you build workflows using natural language:

1. Open the AI assistant on the right side of the workflow editor.

2. Describe what you want your workflow to do in natural language, for example:
   - "Create a workflow that sends a Slack notification when a service is deployed".
   - "Build a self-service workflow that creates a new GitHub repository".
   - "Make a workflow that updates an entity's status after a webhook response".

3. The AI will generate the workflow for you, which you can then review and modify as needed.

**Tips for AI-assisted workflow building:**

- Be specific about the trigger type (self-service vs event-based).
- Describe the actions you want to perform in sequence.
- Mention any conditions or branching logic needed.
- Specify the data you want to pass between nodes.
- Specify the secret *names* you want to use for authentication.

## Next steps

Now that you've created your first workflow, explore these topics:

- [Self-service trigger](/workflows/build-workflows/self-service-trigger/) - Learn how to configure user inputs and triggers.
- [Event trigger](/workflows/build-workflows/event-trigger) - Create workflows that respond to entity changes.
- [Action nodes](/workflows/build-workflows/action-nodes/) - Explore all available action types.
- [Examples](/workflows/examples) - See real-world workflow examples.
