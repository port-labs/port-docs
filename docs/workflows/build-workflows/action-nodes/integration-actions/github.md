---
sidebar_position: 2
title: GitHub
---

import ClosedBetaFeatureNotice from '/docs/generalTemplates/_closed_beta_feature_notice.md';

# GitHub integration action

<ClosedBetaFeatureNotice id="workflows" />

The GitHub integration action allows workflows to trigger GitHub Actions workflows directly using your installed GitHub integration.

## Prerequisites

- A GitHub integration installed in your Port organization
- The GitHub Actions workflow you want to trigger must exist in the target repository
- The workflow must be configured to accept `workflow_dispatch` events

## Configuration

| Field | Type | Description |
| ----- | ---- | ----------- |
| `type` | `"INTEGRATION_ACTION"` | **Required.** Must be `"INTEGRATION_ACTION"` |
| `installationId` | `string` | **Required.** Your GitHub integration installation ID |
| `integrationProvider` | `"GITHUB"` | **Required.** Must be `"GITHUB"` |
| `integrationInvocationType` | `"CREATE"` | **Required.** Operation type |
| `integrationActionExecutionProperties` | `object` | **Required.** GitHub-specific configuration |

### Execution properties

| Field | Type | Description |
| ----- | ---- | ----------- |
| `repo` | `string` | **Required.** Repository in format `owner/repo` |
| `workflowId` | `string` | **Required.** Workflow filename (e.g., `deploy.yml`) or workflow ID |
| `inputs` | `object` | Input parameters to pass to the workflow |
| `reportStatus` | `boolean` | Whether to report workflow status back to Port |

## Basic example

Trigger a GitHub Actions deployment workflow, passing environment and version from the trigger inputs:

```json showLineNumbers
{
  "identifier": "trigger-github-workflow",
  "title": "Trigger GitHub Deployment",
  "config": {
    "type": "INTEGRATION_ACTION",
    "installationId": "your-installation-id",
    "integrationProvider": "GITHUB",
    "integrationInvocationType": "CREATE",
    "integrationActionExecutionProperties": {
      "repo": "{{ .outputs.trigger.repository }}",
      "workflowId": "deploy.yml",
      "inputs": {
        "environment": "{{ .outputs.trigger.environment }}",
        "version": "{{ .outputs.trigger.version }}"
      }
    }
  }
}
```

## Workflow inputs

Pass inputs to your GitHub Actions workflow:

```json showLineNumbers
{
  "integrationActionExecutionProperties": {
    "repo": "my-org/my-repo",
    "workflowId": "build-and-deploy.yml",
    "inputs": {
      "environment": "{{ .outputs.trigger.environment }}",
      "version": "{{ .outputs.trigger.version }}",
      "dry_run": "{{ .outputs.trigger.dryRun | tostring }}"
    }
  }
}
```

:::info String inputs
GitHub Actions workflow inputs are always strings. Use JQ functions like `tostring` to convert non-string values.
:::

## Status reporting

Enable `reportStatus` to have the GitHub workflow report its status back to Port:

```json showLineNumbers
{
  "integrationActionExecutionProperties": {
    "repo": "my-org/my-repo",
    "workflowId": "deploy.yml",
    "inputs": {
      "environment": "{{ .outputs.trigger.environment }}"
    },
    "reportStatus": true
  }
}
```

When enabled, Port will monitor the GitHub workflow run and update the node status when it completes.

## Complete workflow example

A self-service deployment workflow that triggers GitHub Actions, waits for completion, and updates the service entity with deployment details:

<details>
<summary><b>Workflow example (click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "deploy-with-github",
  "title": "Deploy Service with GitHub Actions",
  "icon": "Github",
  "description": "Trigger a deployment using GitHub Actions",
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
              "title": "Service"
            },
            "environment": {
              "type": "string",
              "title": "Environment",
              "enum": ["staging", "production"]
            },
            "version": {
              "type": "string",
              "title": "Version",
              "description": "Git tag or commit SHA"
            }
          },
          "required": ["service", "environment", "version"]
        }
      }
    },
    {
      "identifier": "trigger-deploy",
      "title": "Trigger GitHub Deployment",
      "config": {
        "type": "INTEGRATION_ACTION",
        "installationId": "gh-integration-123",
        "integrationProvider": "GITHUB",
        "integrationInvocationType": "CREATE",
        "integrationActionExecutionProperties": {
          "repo": "my-org/{{ .outputs.trigger.service }}",
          "workflowId": "deploy.yml",
          "inputs": {
            "environment": "{{ .outputs.trigger.environment }}",
            "version": "{{ .outputs.trigger.version }}"
          },
          "reportStatus": true
        }
      }
    },
    {
      "identifier": "update-entity",
      "title": "Update Service Status",
      "config": {
        "type": "UPSERT_ENTITY",
        "blueprintIdentifier": "service",
        "mapping": {
          "identifier": "{{ .outputs.trigger.service }}",
          "properties": {
            "lastDeployedVersion": "{{ .outputs.trigger.version }}",
            "lastDeployedEnvironment": "{{ .outputs.trigger.environment }}",
            "lastDeployedAt": "{{ now | date \"2006-01-02T15:04:05Z\" }}"
          }
        }
      }
    }
  ],
  "connections": [
    {
      "sourceIdentifier": "trigger",
      "targetIdentifier": "trigger-deploy"
    },
    {
      "sourceIdentifier": "trigger-deploy",
      "targetIdentifier": "update-entity"
    }
  ]
}
```

</details>

## GitHub workflow configuration

Your GitHub Actions workflow must be configured to accept `workflow_dispatch`:

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Target environment'
        required: true
        type: choice
        options:
          - staging
          - production
      version:
        description: 'Version to deploy'
        required: true
        type: string
      triggered_by:
        description: 'User who triggered the deployment'
        required: false
        type: string

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ inputs.version }}
      
      - name: Deploy to ${{ inputs.environment }}
        run: |
          echo "Deploying version ${{ inputs.version }} to ${{ inputs.environment }}"
          echo "Triggered by: ${{ inputs.triggered_by }}"
          # Your deployment logic here
```
