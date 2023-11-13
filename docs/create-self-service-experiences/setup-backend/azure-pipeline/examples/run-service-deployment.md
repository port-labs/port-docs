# Run a deployment for a service

In the following guide, you are going to build a self-service action in Port that executes an Azure pipeline behind the scenes.

### Prerequisites

- You will need your [Port credentials](../../../../build-your-software-catalog/sync-data-to-catalog/api/api.md#find-your-port-credentials) to create the action;
- You will need your Azure DevOps organization;
- You will need the name of the webhook that you configured in your Azure pipelines yaml;

:::tip
<FindCredentials />
:::

### Create an Azure pipeline

First, we need to set up an Azure pipeline that implements our business logic to create a new deployment.

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
  # ADD YOUR DEPLOYMENT LOGIC HERE!
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
  // highlight-start
  "invocationMethod": {
    "type": "AZURE-DEVOPS",
    "org": "<AZURE-DEVOPS-ORG>",
    "webhook": "<AZURE-DEVOPS-WEBHOOK-NAME>"
  },
  // highlight-end
  "trigger": "CREATE",
  "description": "Deploy a service to the environment"
}
```

:::note
Don't forget to replace the placeholders for `AZURE-DEVOPS-ORG` and `AZURE-DEVOPS-WEBHOOK-NAME`.
:::

To learn how to generate an API token to interact with Port, look [here](../../../../build-your-software-catalog/sync-data-to-catalog/api/#generate-an-api-token).

To update the status of the action in Port, use the following API call in your Azure pipeline:

```bash
curl -X PATCH \
 -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
 -H "Content-Type: application/json" \
 -d '{"status": "SUCCESS"}' \
 https://api.getport.io/v1/actions/runs/YOUR_RUN_ID
```

## Summary

In this example, you were introduced to the concept of self-service actions and how to create a simple action that triggers an Azure pipeline. You can use this example as a starting point for your own self-service actions.
