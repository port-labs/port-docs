---
sidebar_position: 1
---

# Run a deployment for a service

In the following guide, you are going to build a self-service action in Port, that executes a Azure pipeline behind the scenes.

The Azure pipeline in this example, will run a new deployment and report back a deployment entity to Port.

## Prerequisites

- A Port API `CLIENT_ID` + `CLIENT_SECRET`.
- The organization + the webhook name in Azure.

## Create a Azure pipeline

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

You can see below the `python` code of the Blueprint (remember to insert your `CLIENT_ID` and `CLIENT_SECRET` in order to get an access token).

<details>
<summary>Click here to see the code</summary>

```python showLineNumbers
import requests

CLIENT_ID = 'YOUR_CLIENT_ID'
CLIENT_SECRET = 'YOUR_CLIENT_SECRET'

API_URL = 'https://api.getport.io/v1'

credentials = {'clientId': CLIENT_ID, 'clientSecret': CLIENT_SECRET}

token_response = requests.post(f'{API_URL}/auth/access_token', json=credentials)

access_token = token_response.json()['accessToken']

headers = {
    'Authorization': f'Bearer {access_token}'
}

blueprint = {
    "identifier": "deployment",
    "title": "Deployment",
    "icon": "Deployment",
    "schema": {
        "properties": {
            "jobUrl": {
                "title": "Job URL",
                "type": "string",
                "format": "url"
            },
            "deployingUser": {
                "title": "Deploying User",
                "type": "string"
            },
            "imageTag": {
                "title": "Image Tag",
                "type": "string"
            },
            "commitSha": {
                "title": "Commit SHA",
                "type": "string"
            }
        },
        "required": []
    },
    "calculationProperties": {},

}

response = requests.post(f'{API_URL}/blueprints', json=blueprint, headers=headers)

print(response.json())
```

</details>

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
      "ref": {
        "type": "string",
        "description": "The  branch to deploy (Optional, otherwise will use repo's default branch)"
      },
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

You can see below the `python` code to create this action (remember to insert your `CLIENT_ID` and `CLIENT_SECRET` in order to get an access token).

:::note
Note how the `deployment` Blueprint identifier is used to add the action to the new Blueprint.

Moreover, don't forget to replace the placeholders for `YOUR_AZURE_DEVOPS_ORG`, `YOUR_AZURE_DEVOPS_WEBHOOK_NAME`.
:::

<details>
<summary>Click here to see code</summary>

```python showLineNumbers
import requests

CLIENT_ID = 'YOUR_CLIENT_ID'
CLIENT_SECRET = 'YOUR_CLIENT_SECRET'

AZURE_DEVOPS_ORG = 'YOUR_AZURE_DEVOPS_ORG'
AZURE_DEVOPS_WEBHOOK_NAME = 'YOUR_AZURE_DEVOPS_WEBHOOK_NAME'

API_URL = 'https://api.getport.io/v1'

credentials = {'clientId': CLIENT_ID, 'clientSecret': CLIENT_SECRET}

token_response = requests.post(f'{API_URL}/auth/access_token', json=credentials)

access_token = token_response.json()['accessToken']

headers = {
    'Authorization': f'Bearer {access_token}'
}

blueprint_identifier = 'deployment'

action = {
    'identifier': 'deploy_service',
    'title': 'Deploy Service',
    'icon': 'DeployedAt',
    'description': 'Deploy a service to the environment',
    'trigger': 'CREATE',
    'invocationMethod': {
        'type': 'AZURE_DEVOPS',
        'org': AZURE_DEVOPS_ORG,
        'webhook': AZURE_DEVOPS_WEBHOOK_NAME
    },
    'userInputs': {
        'properties': {
            'ref': {
                'type': 'string',
                'title': 'The branch to deploy (Optional, otherwise will use repo's default branch)'
            },
            'service': {
                'type': 'string',
                'title': 'The service to deploy'
            },
            'environment': {
                'type': 'string',
                'title': 'The environment to deploy the service to'
            },
        },
        'required': [
            'service', 'environment'
        ]
    }
}

response = requests.post(f'{API_URL}/blueprints/{blueprint_identifier}/actions', json=action, headers=headers)

print(response.json())
```

</details>

Now that the Self-Service Action configured, you can begin invoking it.

## Trigger the action

Let's invoke the self-service action using Port API.

<details>
<summary>Click here to see the API call code</summary>

```python showLineNumbers
import requests

CLIENT_ID = 'YOUR_CLIENT_ID'
CLIENT_SECRET = 'YOUR_CLIENT_SECRET'

API_URL = 'https://api.getport.io/v1'

credentials = {'clientId': CLIENT_ID, 'clientSecret': CLIENT_SECRET}

token_response = requests.post(f'{API_URL}/auth/access_token', json=credentials)

access_token = token_response.json()['accessToken']

headers = {
    'Authorization': f'Bearer {access_token}'
}

blueprint_identifier = 'deployment'

action_identifier = 'deploy_service'

action_run = {
    'properties': {
        'service': 'backend',
        'environment': 'staging'
    }
}

response = requests.post(f'{API_URL}/blueprints/{blueprint_identifier}/actions/{action_identifier}/runs', json=action_run, headers=headers)

print(response.json())
```

</details>

When the action is finished, it will mark the action run as successful. That way, your developers can understand your deployment has finished successfully.

![Action run audit log](../../../../static/img/self-service-actions/run-service-deployment/azure-runs-audit-log.png)

## Next step

This was a very basic example on how to trigger a Azure pipeline using Port's self-service action. We left placeholder code for you to insert your own custom logic that fits your infrastructure.
