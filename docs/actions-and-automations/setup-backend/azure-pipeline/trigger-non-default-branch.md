---
title: Trigger pipelines in non-default branch
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Trigger pipelines in non-default branch

By default, Azure DevOps pipelines triggered through Port self-service actions run from the repository's default branch (typically `main` or `master`).   
We will demonstrate how to configure your action to trigger pipelines from a specific non-default branch.

## Understanding the challenge

1. Azure DevOps webhook triggers don't automatically handle branch specification like GitHub.
2. The pipeline YAML file location and the branch to run from need to be explicitly defined.
3. The API payload structure requires specific `refName` formatting.


## Solution overview

To trigger Azure DevOps pipelines in a non-default branch, you need to:

1. **Add a branch input** to your self-service action (optional - for user selection).
2. **Configure the webhook payload** to include the correct `refName` parameter.
3. **Ensure your pipeline YAML** exists in the target branch.

## Implementation methods

<Tabs>
<TabItem value="fixed-branch" label="Fixed branch" default>

Use this approach when you always want to trigger from a specific branch.

<h4> Step 1: Configure the action backend</h4>

In your self-service action configuration, use the webhook backend with a payload that specifies the target branch:

```json showLineNumbers
{
  "invocationMethod": {
    "type": "WEBHOOK",
    "url": "https://dev.azure.com/{{.secrets.AZURE_DEVOPS_ORG}}/{{.secrets.AZURE_DEVOPS_PROJECT}}/_apis/pipelines/{{.secrets.PIPELINE_ID}}/runs?api-version=7.1",
    "agent": false,
    "synchronized": true,
    "method": "POST",
    "headers": {
      "Content-Type": "application/json",
      "Authorization": "Basic {{.secrets.AZURE_DEVOPS_PAT_BASE64}}"
    },
    "body": {
      "resources": {
        "repositories": {
          "self": {
            "refName": "refs/heads/feature/my-feature-branch"
          }
        }
      },
      "templateParameters": {
        "{{ spreadValue() }}": "{{ .inputs }}"
      },
      "variables": {
        "PORT_RUN_ID": {
          "value": "{{ .run.id }}"
        }
      }
    }
  }
}
```

<h4> Step 2: Set up secrets</h4>

Add the following secrets to your Port organization:

- `AZURE_DEVOPS_ORG`: Your Azure DevOps organization name.
- `AZURE_DEVOPS_PROJECT`: Your project name.
- `PIPELINE_ID`: The numeric ID of your pipeline.
- `AZURE_DEVOPS_PAT_BASE64`: Base64 encoded Personal Access Token.

:::tip Getting your pipeline ID
You can find your pipeline ID in the Azure DevOps URL when viewing the pipeline: 
`https://dev.azure.com/{org}/{project}/_build?definitionId={PIPELINE_ID}`
:::

</TabItem>
<TabItem value="user-selectable" label="User-selectable branch">

Use this approach when you want users to choose which branch to trigger.

<h4> Step 1: Add branch input to your action</h4>

Add a branch selection input to your action's user interface:

```json showLineNumbers
{
  "userInputs": {
    "properties": {
      "target_branch": {
        "title": "Target Branch",
        "type": "string",
        "enum": [
          "main",
          "develop", 
          "feature/deployment",
          "hotfix/critical-fix"
        ],
        "default": "main",
        "description": "Select the branch to run the pipeline from"
      }
      // ... other inputs
    }
  }
}
```

<h4> Step 2: Use the input in the webhook payload</h4>

Reference the user input in your webhook body:

```json showLineNumbers
{
  "body": {
    "resources": {
      "repositories": {
        "self": {
          "refName": "refs/heads/{{ .inputs.target_branch }}"
        }
      }
    },
    "templateParameters": {
      "{{ spreadValue() }}": "{{ .inputs }}"
    }
  }
}
```

</TabItem>
<TabItem value="dynamic-branch" label="Dynamic branch selection">

For advanced use cases, you can use JQ expressions to dynamically determine the branch:

```json showLineNumbers
{
  "body": {
    "resources": {
      "repositories": {
        "self": {
          "refName": "{{ if .trigger.operation == \"CREATE\" then \"refs/heads/main\" elif .inputs.environment == \"staging\" then \"refs/heads/develop\" else \"refs/heads/feature/\" + .inputs.feature_name end }}"
        }
      }
    }
  }
}
```

This approach is useful when you need to:
- Route different operations to different branches.
- Use environment-specific branches (staging → develop, production → main).
- Create dynamic branch names based on user inputs.

</TabItem>
</Tabs>

### Complete example

Here's a complete self-service action that allows users to deploy from different branches:

<details>
<summary><b>Complete action JSON</b></summary>

```json showLineNumbers
{
  "identifier": "deploy_to_environment",
  "title": "Deploy to Environment",
  "icon": "Azure",
  "description": "Deploy application to specified environment from selected branch",
  "trigger": {
    "type": "self-service",
    "operation": "DAY-2",
    "userInputs": {
      "properties": {
        "environment": {
          "title": "Environment",
          "type": "string",
          "enum": ["staging", "production"],
          "enumColors": {
            "staging": "orange",
            "production": "red"
          }
        },
        "target_branch": {
          "title": "Branch",
          "type": "string",
          "enum": ["main", "develop", "feature/latest"],
          "default": "main"
        },
        "deployment_notes": {
          "title": "Deployment Notes",
          "type": "string",
          "description": "Optional notes for this deployment"
        }
      },
      "required": ["environment", "target_branch"],
      "order": ["environment", "target_branch", "deployment_notes"]
    },
    "blueprintIdentifier": "service"
  },
  "invocationMethod": {
    "type": "WEBHOOK",
    "url": "https://dev.azure.com/{{.secrets.AZURE_DEVOPS_ORG}}/{{.secrets.AZURE_DEVOPS_PROJECT}}/_apis/pipelines/{{.secrets.DEPLOYMENT_PIPELINE_ID}}/runs?api-version=7.1",
    "agent": false,
    "synchronized": true,
    "method": "POST",
    "headers": {
      "Content-Type": "application/json",
      "Authorization": "Basic {{.secrets.AZURE_DEVOPS_PAT_BASE64}}"
    },
    "body": {
      "resources": {
        "repositories": {
          "self": {
            "refName": "refs/heads/{{ .inputs.target_branch }}"
          }
        }
      },
      "templateParameters": {
        "environment": "{{ .inputs.environment }}",
        "deployment_notes": "{{ .inputs.deployment_notes }}",
        "triggered_by": "{{ .trigger.by.user.email }}",
        "port_run_id": "{{ .run.id }}"
      },
      "variables": {
        "ENVIRONMENT": {
          "value": "{{ .inputs.environment }}"
        },
        "PORT_RUN_ID": {
          "value": "{{ .run.id }}"
        }
      }
    }
  },
  "requiredApproval": false
}
```

</details>

<h4> Pipeline YAML considerations</h4>

Ensure your pipeline YAML file exists in the target branch and is configured to handle webhook triggers:

```yaml showLineNumbers title="azure-pipelines.yml"
# Disable automatic CI triggers since we're using webhooks
trigger: none

# Define the webhook resource
resources:
  webhooks:
    - webhook: port_trigger
      connection: port_trigger  # Your service connection name

# Pipeline parameters (optional)
parameters:
- name: environment
  type: string
  default: 'staging'
- name: deployment_notes
  type: string
  default: ''

variables:
- name: targetEnvironment
  value: ${{ parameters.environment }}

stages:
- stage: Deploy
  jobs:
  - job: DeployJob
    steps:
    - script: |
        echo "Deploying to: $(targetEnvironment)"
        echo "Branch: $(Build.SourceBranch)"
        echo "Notes: ${{ parameters.deployment_notes }}"
        echo "Port Run ID: $(PORT_RUN_ID)"
      displayName: 'Deploy Application'
    
    # Add your actual deployment steps here
    - script: |
        # Your deployment logic
        echo "Deployment completed successfully"
      displayName: 'Run Deployment'
```

## Troubleshooting
See the [troubleshooting guide](/actions-and-automations/setup-backend/azure-pipeline/troubleshooting) for common issues and their solutions.