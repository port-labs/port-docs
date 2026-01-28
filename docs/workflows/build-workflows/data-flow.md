---
sidebar_position: 4
title: Data flow
---

import ClosedBetaFeatureNotice from '/docs/generalTemplates/_closed_beta_feature_notice.md';

# Data flow

<ClosedBetaFeatureNotice id="workflows" />

Workflows pass data between nodes using **outputs** and **variables**. Understanding how data flows through your workflow is essential for building effective automations.

## Outputs

Every node in a workflow produces outputs that can be referenced by subsequent nodes. Outputs are accessed using the pattern:

```
{{ .outputs.<node_identifier>.<field> }}
```

### Trigger node outputs

For **self-service triggers**, user inputs are stored directly as outputs:

```json
{
  "identifier": "trigger",
  "config": {
    "type": "SELF_SERVE_TRIGGER",
    "userInputs": {
      "properties": {
        "serviceName": { "type": "string" }
      }
    }
  }
}
```

Access the input in subsequent nodes:

```
{{ .outputs.trigger.serviceName }}
```

For **event triggers**, the full event object is stored as output:

```
{{ .outputs.trigger.diff.after.identifier }}
{{ .outputs.trigger.diff.after.properties.status }}
{{ .outputs.trigger.diff.before.properties.status }}
{{ .outputs.trigger.action }}
```

### Action node outputs

Webhook nodes store their response in the output:

```
{{ .outputs.my_webhook.response.status }}
{{ .outputs.my_webhook.response.data }}
```

## Variables

Variables allow you to transform and reshape node outputs before they're stored. This is useful for:

- Extracting specific fields from a response
- Simplifying complex data structures
- Removing sensitive data from outputs

Variables are defined on a node and evaluated **after** the node executes, using the node's raw output.

### Syntax

```json
{
  "identifier": "my_node",
  "config": { ... },
  "variables": {
    "myField": "{{ .response.data.someValue }}",
    "simplified": "{{ .response.data.items[0] }}"
  }
}
```

The variables are then accessible as:

```
{{ .outputs.my_node.myField }}
{{ .outputs.my_node.simplified }}
```

### Example: Extracting entity data

When fetching entities from Port's API, you might want to extract just the entity:

```json
{
  "identifier": "fetch_entity",
  "config": {
    "type": "WEBHOOK",
    "url": "https://api.getport.io/v1/blueprints/service/entities/search",
    "method": "POST",
    "body": {
      "query": {
        "rules": [
          {
            "property": "$identifier",
            "operator": "=",
            "value": "{{ .outputs.trigger.serviceId }}"
          }
        ],
        "combinator": "and"
      }
    }
  },
  "variables": {
    "entity": "{{ .response.data.entities[0] }}",
    "response": "{{ null }}"
  }
}
```

Now you can access the entity directly:

```
{{ .outputs.fetch_entity.entity.title }}
{{ .outputs.fetch_entity.entity.properties.status }}
```

Setting `"response": "{{ null }}"` removes the raw response from the outputs, keeping only the extracted entity.

## Fetching data from the catalog

Workflows can fetch entities from Port's catalog using webhook nodes. This is useful for:

- Getting related entities based on relations
- Looking up additional data not available in the trigger
- Building notifications with rich context

:::info Automatic authentication
When calling Port's API, you don't need to include an access token. Port automatically authenticates the request using your organization's credentials.
:::

### Port's entity search API

Use the entity search endpoint to query entities:

```
POST https://api.getport.io/v1/blueprints/<blueprint>/entities/search
```

### Example: Fetching a related entity

This workflow fetches a service entity when a deployment changes:

```json showLineNumbers
{
  "identifier": "notify-on-deployment",
  "title": "Notify on Deployment",
  "nodes": [
    {
      "identifier": "trigger",
      "title": "On Deployment Change",
      "config": {
        "type": "EVENT_TRIGGER",
        "event": {
          "type": "ANY_ENTITY_CHANGE",
          "blueprintIdentifier": "deployment"
        }
      }
    },
    {
      "identifier": "fetch_service",
      "title": "Fetch Service",
      "config": {
        "type": "WEBHOOK",
        "url": "https://api.getport.io/v1/blueprints/service/entities/search",
        "method": "POST",
        "headers": {
          "Content-Type": "application/json"
        },
        "body": {
          "query": {
            "rules": [
              {
                "property": "$identifier",
                "operator": "=",
                "value": "{{ .outputs.trigger.diff.after.relations.service }}"
              }
            ],
            "combinator": "and"
          }
        }
      },
      "variables": {
        "entity": "{{ .response.data.entities[0] }}"
      }
    },
    {
      "identifier": "send_notification",
      "title": "Send Notification",
      "config": {
        "type": "WEBHOOK",
        "url": "https://hooks.slack.com/services/xxx",
        "method": "POST",
        "body": {
          "text": "Deployment updated for {{ .outputs.fetch_service.entity.title }}",
          "blocks": [
            {
              "type": "section",
              "fields": [
                {
                  "type": "mrkdwn",
                  "text": "*Service:*\n{{ .outputs.fetch_service.entity.title }}"
                },
                {
                  "type": "mrkdwn",
                  "text": "*Status:*\n{{ .outputs.trigger.diff.after.properties.status }}"
                }
              ]
            }
          ]
        }
      }
    }
  ],
  "connections": [
    {
      "sourceIdentifier": "trigger",
      "targetIdentifier": "fetch_service"
    },
    {
      "sourceIdentifier": "fetch_service",
      "targetIdentifier": "send_notification"
    }
  ]
}
```

### Chaining multiple fetches

You can chain multiple fetch operations to traverse entity relations:

```json showLineNumbers
{
  "nodes": [
    {
      "identifier": "trigger",
      "config": {
        "type": "EVENT_TRIGGER",
        "event": {
          "type": "ENTITY_UPDATED",
          "blueprintIdentifier": "deployment"
        }
      }
    },
    {
      "identifier": "fetch_environment",
      "title": "Fetch Environment",
      "config": {
        "type": "WEBHOOK",
        "url": "https://api.getport.io/v1/blueprints/environment/entities/search",
        "method": "POST",
        "body": {
          "query": {
            "rules": [
              {
                "property": "$identifier",
                "operator": "=",
                "value": "{{ .outputs.trigger.diff.after.relations.environment }}"
              }
            ],
            "combinator": "and"
          }
        }
      },
      "variables": {
        "entity": "{{ .response.data.entities[0] }}"
      }
    },
    {
      "identifier": "fetch_cluster",
      "title": "Fetch Cluster",
      "config": {
        "type": "WEBHOOK",
        "url": "https://api.getport.io/v1/blueprints/cluster/entities/search",
        "method": "POST",
        "body": {
          "query": {
            "rules": [
              {
                "property": "$identifier",
                "operator": "=",
                "value": "{{ .outputs.fetch_environment.entity.relations.cluster }}"
              }
            ],
            "combinator": "and"
          }
        }
      },
      "variables": {
        "entity": "{{ .response.data.entities[0] }}"
      }
    },
    {
      "identifier": "notify",
      "title": "Send Alert",
      "config": {
        "type": "WEBHOOK",
        "url": "https://api.example.com/alert",
        "method": "POST",
        "body": {
          "deployment": "{{ .outputs.trigger.diff.after.identifier }}",
          "environment": "{{ .outputs.fetch_environment.entity.title }}",
          "cluster": "{{ .outputs.fetch_cluster.entity.title }}",
          "region": "{{ .outputs.fetch_cluster.entity.properties.region }}"
        }
      }
    }
  ],
  "connections": [
    { "sourceIdentifier": "trigger", "targetIdentifier": "fetch_environment" },
    { "sourceIdentifier": "fetch_environment", "targetIdentifier": "fetch_cluster" },
    { "sourceIdentifier": "fetch_cluster", "targetIdentifier": "notify" }
  ]
}
```

## Secrets

Access organization secrets using the `.secrets` context:

```
{{ .secrets["my-api-key"] }}
```

Example with authorization header:

```json
{
  "config": {
    "type": "WEBHOOK",
    "url": "https://api.example.com/endpoint",
    "headers": {
      "Authorization": "Bearer {{ .secrets[\"api-token\"] }}"
    }
  }
}
```

## Summary

| Context | Description | Example |
| ------- | ----------- | ------- |
| `.outputs.<node>.<field>` | Output from a previous node | `{{ .outputs.trigger.serviceName }}` |
| `.secrets["<name>"]` | Organization secret | `{{ .secrets["api-key"] }}` |
| `.response` | Raw response (in variables only) | `{{ .response.data.items[0] }}` |
