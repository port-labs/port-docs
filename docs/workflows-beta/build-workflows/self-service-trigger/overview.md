---
sidebar_position: 1
title: Overview
---

import ClosedBetaFeatureNotice from '/docs/generalTemplates/_closed_beta_feature_notice.md';

# Self-service trigger overview

<ClosedBetaFeatureNotice id="workflows-beta" />

A self-service trigger allows users to manually execute a workflow from Port's UI and API. This is useful for creating on-demand operations like provisioning resources, deploying services, or running maintenance tasks.

## Configuration

When configuring a self-service trigger node, you can define:

| Field | Description |
| ----- | ----------- |
| `userInputs` | The inputs that users must provide when executing the workflow |

## JSON structure

```json showLineNumbers
{
  "identifier": "trigger-node",
  "title": "Self-Service Trigger",
  "config": {
    "type": "SELF_SERVE_TRIGGER",
    "userInputs": {
      "properties": {
        "environment": {
          "type": "string",
          "title": "Environment",
          "enum": ["development", "staging", "production"]
        },
        "service": {
          "type": "string",
          "format": "entity",
          "blueprint": "service",
          "title": "Service"
        }
      },
      "required": ["environment", "service"],
      "order": ["service", "environment"]
    }
  }
}
```

## Outputs

The self-service trigger stores user inputs as outputs that can be referenced by subsequent nodes. Outputs are accessed using the pattern `.outputs.<trigger_node_identifier>.<input_key>`.

| Output | Description |
| ------ | ----------- |
| `.outputs.<trigger_node_identifier>.<input_key>` | The value of a user input |

### Referencing outputs in action nodes

Use JQ expressions wrapped in double curly brackets to reference trigger outputs. The trigger node identifier in the examples below is `trigger`:

```json showLineNumbers
{
  "config": {
    "type": "WEBHOOK",
    "url": "https://api.example.com/deploy",
    "body": {
      "environment": "{{ .outputs.trigger.environment }}",
      "service": "{{ .outputs.trigger.service }}"
    }
  }
}
```

## Supported input types

| Type | Description |
| ---- | ----------- |
| [Text](/workflows-beta/build-workflows/self-service-trigger/user-inputs/text) | Basic text input |
| [Number](/workflows-beta/build-workflows/self-service-trigger/user-inputs/number) | Numeric input |
| [Toggle](/workflows-beta/build-workflows/self-service-trigger/user-inputs/toggle) | Boolean true/false |
| [Entity](/workflows-beta/build-workflows/self-service-trigger/user-inputs/entity) | Select an entity from a blueprint |
| [User](/workflows-beta/build-workflows/self-service-trigger/user-inputs/user) | Select a Port user |
| [Team](/workflows-beta/build-workflows/self-service-trigger/user-inputs/team) | Select a Port team |
| [Datetime](/workflows-beta/build-workflows/self-service-trigger/user-inputs/datetime) | Date and time picker |
| [URL](/workflows-beta/build-workflows/self-service-trigger/user-inputs/url) | URL input with validation |
| [Email](/workflows-beta/build-workflows/self-service-trigger/user-inputs/email) | Email input with validation |
| [Array](/workflows-beta/build-workflows/self-service-trigger/user-inputs/array) | List of values |
| [Object](/workflows-beta/build-workflows/self-service-trigger/user-inputs/object) | JSON object input |
| [YAML](/workflows-beta/build-workflows/self-service-trigger/user-inputs/yaml) | YAML formatted input |

## Example: Service deployment workflow

```json showLineNumbers
{
  "identifier": "deploy-service",
  "title": "Deploy Service",
  "icon": "Deployment",
  "nodes": [
    {
      "identifier": "trigger",
      "title": "Request Deployment",
      "config": {
        "type": "SELF_SERVE_TRIGGER",
        "userInputs": {
          "properties": {
            "service": {
              "type": "string",
              "format": "entity",
              "blueprint": "service",
              "title": "Service to Deploy"
            },
            "version": {
              "type": "string",
              "title": "Version",
              "description": "The version tag to deploy"
            },
            "environment": {
              "type": "string",
              "title": "Target Environment",
              "enum": ["staging", "production"],
              "enumColors": {
                "staging": "blue",
                "production": "green"
              }
            }
          },
          "required": ["service", "version", "environment"]
        }
      }
    },
    {
      "identifier": "deploy-action",
      "title": "Trigger Deployment",
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
  ],
  "connections": [
    {
      "sourceIdentifier": "trigger",
      "targetIdentifier": "deploy-action"
    }
  ]
}
```
