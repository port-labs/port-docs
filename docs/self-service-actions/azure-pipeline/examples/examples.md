---
sidebar_position: 1
---

import FindCredentials from "../../../build-your-software-catalog/sync-data-to-catalog/api/\_template_docs/\_find_credentials_collapsed.mdx";

# Examples

## Run a deployment for a service

In the following guide, you are going to build a self-service action in Port that executes an Azure pipeline behind the scenes.

### Prerequisites

- You will need your [Port credentials](../../../build-your-software-catalog/sync-data-to-catalog/api/api.md#find-your-port-credentials) to create the action;
- You will need your Azure DevOps organization;
- You will need the webhook name that your configure in your Azure pipeline yaml;

:::tip
<FindCredentials />
:::

### Create a Azure pipeline

First, we need to set up a Azure pipeline that implements our business logic for deployment.

Here is a skeleton for the workflow - `deploy.yml` (including a placeholder for deployment logic):

<details>
<summary>Deployment Azure pipeline</summary>

```yaml showLineNumbers
trigger: none

resources:
  webhooks:
    - webhook: { WEBHOOK_NAME }
      connection: { SERVICE_CONNECTION_NAME }
stages:
  # ADD YOUR DEPLOYMENT LOGIC HERE!!!
```

</details>

## Create a deployment Blueprint

Let’s configure a `Deployment` Blueprint. Its base structure is:

```json showLineNumbers
{
  "identifier": "deployment",
  "title": "Deployment",
  "icon": "Deployment",
  "schema": {
    "properties": {
      "jobUrl": {
        "type": "string",
        "format": "url",
        "title": "Job URL"
      },
      "deployingUser": {
        "type": "string",
        "title": "Deploying User"
      },
      "imageTag": {
        "type": "string",
        "title": "Image Tag"
      },
      "commitSha": {
        "type": "string",
        "title": "Commit SHA"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "relations": {}
}
```

## Create a Port action

Now let’s configure a self-service action. Add a `CREATE` action that will be triggered every time a developer wants to initiate a new deployment for a service.

Here is the JSON of the action:

```json showLineNumbers
{
  "identifier": "deploy_service",
  "title": "Deploy Service",
  "icon": "DeployedAt",
  "userInputs": {
    "properties": {
      "service": {
        "type": "string",
        "description": "The service to deploy"
      },
      "environment": {
        "type": "string",
        "description": "The environment to deploy the service to"
      }
    },
    "required": ["service", "environment"]
  },
  "invocationMethod": {
    "type": "AZURE_DEVOPS",
    "org": "<AZURE_DEVOPS_ORG>",
    "webhook": "<AZURE_DEVOPS_WEBHOOK_NAME>"
  },
  "trigger": "CREATE",
  "description": "Deploy a service to the environment"
}
```

:::note
Note how the `deployment` Blueprint identifier is used to add the action to the new Blueprint.

Moreover, don't forget to replace the placeholders for `YOUR_AZURE_DEVOPS_ORG`, `YOUR_AZURE_DEVOPS_WEBHOOK_NAME`.
:::

When the action is finished, it will mark the action run as successful. That way, your developers can understand your deployment has finished successfully.

![Action run audit log](../../../../static/img/self-service-actions/run-service-deployment/azure-runs-audit-log.png)
