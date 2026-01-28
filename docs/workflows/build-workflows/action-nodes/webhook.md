---
sidebar_position: 2
title: Webhook
---

import ClosedBetaFeatureNotice from '/docs/generalTemplates/_closed_beta_feature_notice.md';

# Webhook

<ClosedBetaFeatureNotice id="workflows" />

The webhook action node sends HTTP requests to external endpoints. This is the most versatile action type, allowing you to integrate with any system that exposes an HTTP API.

## Configuration

| Field | Type | Description |
| ----- | ---- | ----------- |
| `type` | `"WEBHOOK"` | **Required.** Must be `"WEBHOOK"` |
| `url` | `string` | **Required.** The endpoint URL to send the request to |
| `method` | `string` | HTTP method: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`. Default: `POST` |
| `headers` | `object` | Custom HTTP headers to include |
| `body` | `object` | Request body (for POST, PUT, PATCH) |
| `synchronized` | `boolean` | Whether to wait for response. Default: `true` |

## Basic example

```json showLineNumbers
{
  "identifier": "send-webhook",
  "title": "Send Webhook",
  "config": {
    "type": "WEBHOOK",
    "url": "https://api.example.com/deploy",
    "method": "POST",
    "body": {
      "service": "{{ .outputs.trigger.service }}",
      "version": "{{ .outputs.trigger.version }}",
      "environment": "{{ .outputs.trigger.environment }}"
    }
  }
}
```

## Custom headers

Include custom headers in your request:

```json showLineNumbers
{
  "config": {
    "type": "WEBHOOK",
    "url": "https://api.example.com/webhook",
    "method": "POST",
    "headers": {
      "Content-Type": "application/json",
      "X-Custom-Header": "custom-value",
      "Authorization": "Bearer {{ .secrets[\"api-token\"] }}"
    },
    "body": {
      "data": "{{ .outputs.trigger.data }}"
    }
  }
}
```

## Using secrets

Reference organization secrets in your webhook configuration:

```json showLineNumbers
{
  "config": {
    "type": "WEBHOOK",
    "url": "https://api.example.com/webhook?token={{ .secrets[\"webhook-token\"] }}",
    "method": "POST",
    "headers": {
      "Authorization": "Bearer {{ .secrets[\"api-key\"] }}"
    },
    "body": {
      "message": "Hello from Port"
    }
  }
}
```

## Synchronous vs asynchronous

### Synchronous (default)

When `synchronized` is `true` (default), the workflow waits for the HTTP response before continuing. The response is available to subsequent nodes:

```json showLineNumbers
{
  "identifier": "create_resource",
  "config": {
    "type": "WEBHOOK",
    "url": "https://api.example.com/resources",
    "method": "POST",
    "synchronized": true,
    "body": {
      "name": "{{ .outputs.trigger.name }}"
    }
  }
}
```

Reference the response in later nodes:

```json
{
  "body": {
    "resourceId": "{{ .outputs.create_resource.id }}"
  }
}
```

### Asynchronous

When `synchronized` is `false`, the workflow continues immediately without waiting for a response:

```json showLineNumbers
{
  "config": {
    "type": "WEBHOOK",
    "url": "https://api.example.com/long-running-task",
    "synchronized": false,
    "body": {
      "task": "{{ .outputs.trigger.task }}"
    }
  }
}
```

:::note
With asynchronous webhooks, the external service is responsible for updating the workflow run status via Port's API.
:::

## Examples

### Send Slack notification

```json showLineNumbers
{
  "identifier": "slack-notify",
  "title": "Send Slack Message",
  "config": {
    "type": "WEBHOOK",
    "url": "https://hooks.slack.com/services/xxx/yyy/zzz",
    "method": "POST",
    "body": {
      "text": "Deployment started",
      "blocks": [
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": "*{{ .outputs.trigger.service }}* is being deployed to *{{ .outputs.trigger.environment }}*"
          }
        }
      ]
    }
  }
}
```

### Trigger GitHub workflow

```json showLineNumbers
{
  "identifier": "trigger-github",
  "title": "Trigger GitHub Workflow",
  "config": {
    "type": "WEBHOOK",
    "url": "https://api.github.com/repos/{{ .outputs.trigger.repo }}/actions/workflows/deploy.yml/dispatches",
    "method": "POST",
    "headers": {
      "Accept": "application/vnd.github.v3+json",
      "Authorization": "Bearer {{ .secrets[\"github-token\"] }}"
    },
    "body": {
      "ref": "main",
      "inputs": {
        "environment": "{{ .outputs.trigger.environment }}",
        "version": "{{ .outputs.trigger.version }}"
      }
    }
  }
}
```

### Call Port API

You can use webhook nodes to call [Port's API](/api-reference/port-api), allowing you to execute any route you wish with automatic authentication.

:::info No access token required
When calling Port's API (`https://api.getport.io`), you don't need to include an access token in the request headers. Port automatically authenticates the request using your organization's credentials.
:::

```json showLineNumbers
{
  "identifier": "create_port_entity",
  "title": "Create Port Entity",
  "config": {
    "type": "WEBHOOK",
    "url": "https://api.getport.io/v1/blueprints/deployment/entities",
    "method": "POST",
    "body": {
      "identifier": "{{ .outputs.trigger.service }}_{{ .outputs.trigger.environment }}",
      "title": "{{ .outputs.trigger.service }} ({{ .outputs.trigger.environment }})",
      "properties": {
        "version": "{{ .outputs.trigger.version }}",
        "deployedAt": "{{ now | date \"2006-01-02T15:04:05Z\" }}"
      },
      "relations": {
        "service": "{{ .outputs.trigger.service }}"
      }
    }
  }
}
```

This is useful when you want to:
- Fetch entities from the catalog (see [Data flow](/workflows/build-workflows/data-flow#fetching-data-from-the-catalog))
- Create or update entities
- Trigger other self-service actions
- Perform any operation available in Port's API

:::tip
For creating or updating entities, consider using the [Upsert entity](/workflows/build-workflows/action-nodes/upsert-entity) action node instead, which provides a simpler configuration.
:::

## Limitations

:::caution Not yet supported
Port Execution Agent is not yet available in Workflows
:::
