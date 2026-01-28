---
sidebar_position: 3
title: Upsert entity
---

import ClosedBetaFeatureNotice from '/docs/generalTemplates/_closed_beta_feature_notice.md';

# Upsert entity

<ClosedBetaFeatureNotice id="workflows" />

The upsert entity action node creates or updates entities in your Port software catalog. If an entity with the specified identifier exists, it will be updated; otherwise, a new entity will be created.

## Configuration

| Field | Type | Description |
| ----- | ---- | ----------- |
| `type` | `"UPSERT_ENTITY"` | **Required.** Must be `"UPSERT_ENTITY"` |
| `blueprintIdentifier` | `string` | **Required.** The blueprint to create/update the entity in |
| `mapping` | `object` | **Required.** Entity field mappings |

### Mapping fields

| Field | Type | Description |
| ----- | ---- | ----------- |
| `identifier` | `string` | The entity identifier. If omitted, Port will auto-generate one |
| `title` | `string` | The entity title |
| `team` | `string` \| `string[]` | Team(s) owning the entity |
| `icon` | `string` | Icon for the entity |
| `properties` | `object` | Entity property values |
| `relations` | `object` | Entity relation values |

## Basic example

Create a deployment entity with properties from the trigger inputs and a timestamp:

```json showLineNumbers
{
  "identifier": "create-deployment",
  "title": "Create Deployment Entity",
  "config": {
    "type": "UPSERT_ENTITY",
    "blueprintIdentifier": "deployment",
    "mapping": {
      "identifier": "{{ .outputs.trigger.service }}-{{ .outputs.trigger.environment }}-{{ .outputs.trigger.version }}",
      "title": "{{ .outputs.trigger.service }} v{{ .outputs.trigger.version }}",
      "properties": {
        "version": "{{ .outputs.trigger.version }}",
        "environment": "{{ .outputs.trigger.environment }}",
        "deployedAt": "{{ now | date \"2006-01-02T15:04:05Z\" }}"
      },
      "relations": {
        "service": "{{ .outputs.trigger.service }}"
      }
    }
  }
}
```

## Update existing entity

When the identifier matches an existing entity, only the specified fields are updated. This example updates a service's status and deployment timestamp:

```json showLineNumbers
{
  "identifier": "update-service-status",
  "title": "Update Service Status",
  "config": {
    "type": "UPSERT_ENTITY",
    "blueprintIdentifier": "service",
    "mapping": {
      "identifier": "{{ .outputs.trigger.service }}",
      "properties": {
        "status": "deployed",
        "lastDeployedAt": "{{ now | date \"2006-01-02T15:04:05Z\" }}",
      }
    }
  }
}
```

## Using with event triggers

Update the triggering entity based on workflow logic. This example marks an entity as reviewed when an event trigger fires:

```json showLineNumbers
{
  "identifier": "mark-reviewed",
  "title": "Mark as Reviewed",
  "config": {
    "type": "UPSERT_ENTITY",
    "blueprintIdentifier": "{{ .outputs.trigger.diff.after.blueprint }}",
    "mapping": {
      "identifier": "{{ .outputs.trigger.diff.after.identifier }}",
      "properties": {
        "reviewStatus": "reviewed",
        "reviewedAt": "{{ now | date \"2006-01-02T15:04:05Z\" }}"
      }
    }
  }
}
```

## Setting relations

### Single relation

```json showLineNumbers
{
  "mapping": {
    "identifier": "my-deployment",
    "relations": {
      "service": "{{ .outputs.trigger.service }}",
      "environment": "{{ .outputs.trigger.environment }}"
    }
  }
}
```

### Multi-relation (array)

```json showLineNumbers
{
  "mapping": {
    "identifier": "my-service",
    "relations": {
      "dependencies": ["service-a", "service-b", "service-c"]
    }
  }
}
```

### Dynamic multi-relation

```json showLineNumbers
{
  "mapping": {
    "identifier": "my-service",
    "relations": {
      "dependencies": "{{ .outputs.trigger.dependencies | fromjson }}"
    }
  }
}
```

## Setting team ownership

### Single team

```json showLineNumbers
{
  "mapping": {
    "identifier": "my-service",
    "team": "{{ .outputs.trigger.owningTeam }}"
  }
}
```

### Multiple teams

```json showLineNumbers
{
  "mapping": {
    "identifier": "my-service",
    "team": ["team-a", "team-b"]
  }
}
```

## Examples

### Create environment on request

A complete workflow that creates a new environment entity when a user submits a self-service request with environment details and TTL:

<details>
<summary><b>Workflow example (click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "create-env-workflow",
  "title": "Create Environment",
  "nodes": [
    {
      "identifier": "trigger",
      "title": "Request Environment",
      "config": {
        "type": "SELF_SERVE_TRIGGER",
        "userInputs": {
          "properties": {
            "name": {
              "type": "string",
              "title": "Environment Name"
            },
            "type": {
              "type": "string",
              "title": "Type",
              "enum": ["development", "staging", "production"]
            },
            "ttlDays": {
              "type": "number",
              "title": "TTL (Days)",
              "default": 7
            }
          },
          "required": ["name", "type"]
        }
      }
    },
    {
      "identifier": "create-entity",
      "title": "Create Environment Entity",
      "config": {
        "type": "UPSERT_ENTITY",
        "blueprintIdentifier": "environment",
        "mapping": {
          "identifier": "{{ .outputs.trigger.name | lower | replace \" \" \"-\" }}",
          "title": "{{ .outputs.trigger.name }}",
          "team": "{{ .outputs.trigger.team }}",
          "properties": {
            "type": "{{ .outputs.trigger.type }}",
            "status": "provisioning",
            "createdAt": "{{ now | date \"2006-01-02T15:04:05Z\" }}",
            "expiresAt": "{{ now | add_duration (printf \"%dh\" (mul .outputs.trigger.ttlDays 24)) | date \"2006-01-02T15:04:05Z\" }}"
          }
        }
      }
    }
  ],
  "connections": [
    {
      "sourceIdentifier": "trigger",
      "targetIdentifier": "create-entity"
    }
  ]
}
```

</details>

### Update status after external action

Chain a webhook call with an entity update to record external API results in Port:

<details>
<summary><b>Workflow example (click to expand)</b></summary>

```json showLineNumbers
{
  "nodes": [
    {
      "identifier": "call_api",
      "title": "Call External API",
      "config": {
        "type": "WEBHOOK",
        "url": "https://api.example.com/provision",
        "method": "POST",
        "body": {
          "resourceName": "{{ .outputs.trigger.name }}"
        }
      }
    },
    {
      "identifier": "update-entity",
      "title": "Update Entity Status",
      "config": {
        "type": "UPSERT_ENTITY",
        "blueprintIdentifier": "resource",
        "mapping": {
          "identifier": "{{ .outputs.trigger.name }}",
          "properties": {
            "status": "provisioned",
            "externalId": "{{ .outputs.call_api.resourceId }}"
          }
        }
      }
    }
  ],
  "connections": [
    {
      "sourceIdentifier": "call_api",
      "targetIdentifier": "update-entity"
    }
  ]
}
```

</details>
