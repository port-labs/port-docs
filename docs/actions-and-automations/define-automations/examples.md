---
sidebar_position: 3
title: Examples
---

# Examples

This section provides examples of automation definitions in Port.

## Example 1: Trigger a webhook when a timer property expires

By using the `TIMER_EXPIRED` trigger type, we can run custom logic whenever a [timer property](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/timer) expires.

A common use case for this is to handle ephemeral environments that need to be cleaned up after a certain period of time (`TTL`).  
The following configuration will cause a webhook to be triggered whenever the `ttl` property expires on an `environment` entity:

```json showLineNumbers
{
  "identifier": "ttlEphemeralEnvironment",
  "title": "Terminate ephemeral environment",
  "trigger": {
    "type": "automation",
    "event": {
      "type": "TIMER_PROPERTY_EXPIRED",
      "blueprintIdentifier": "environment",
      "propertyIdentifier": "ttl"
    }
  },
  "invocationMethod": {
    "type": "WEBHOOK",
    "url": "https://myWebhookUrl.com",
    "body": {
      "entityId": "{{ .event.context.entityIdentifier }}"
    },
  },
  "publish": true
}
```

**Note**: The `body` field is where we define the [payload](/actions-and-automations/setup-backend/#define-the-actions-payload) when using the Webhook invocation method. In this example, we configured the id of the relevant entity to be passed to the webhook upon every execution of the automation. 

The webhook backend can terminate the environment, clean up resources, send a notification to the relevant team, and anything else that you want to happen as part of the termination process.

## Example 2: Run a GitHub workflow when a service is created

By using the `ENTITY_CREATED` trigger type, we can run custom logic whenever an entity of a specific type is created.  

For example, the following configuration will cause `workflow.yaml` to run whenever a new `service` is created in your catalog:
```json showLineNumbers
{
  "identifier": "serviceCreated",
  "title": "Service created",
  "trigger": {
    "type": "automation",
    "event": {
      "type": "ENTITY_CREATED",
      "blueprintIdentifier": "service"
    }
  },
  "invocationMethod": {
    "type": "GITHUB",
    "org": "Github-org-name",
    "repo": "Github-repo-name",
    "workflow": "workflow.yaml",
    "workflowInputs": {
        "runId": "{{ .run.id }}"
    },
    "reportWorkflowStatus": true
  },
  "publish": true
}
```

**Note**: The `workflowInputs` field is where we define the [payload](/actions-and-automations/setup-backend/#define-the-actions-payload) when using the GitHub invocation method. In this example, we configured the run id to be passed to the GitHub workflow upon every execution of the automation.

In the `workflow.yaml` file, you can implement any logic you want to run when a new service is created, (e.g. add a property to the entity, send a Slack notification, etc.).
