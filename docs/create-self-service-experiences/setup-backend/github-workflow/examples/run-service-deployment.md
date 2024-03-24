---
sidebar_position: 1
---

# Run a deployment for a service

In the following guide, you are going to build a self-service action in Port, that executes a GitHub workflow behind the scenes.

The GitHub workflow in this example, will run a new deployment and report back a deployment entity to Port.

## Prerequisites

- A Port API `CLIENT_ID` and `CLIENT_SECRET`.

## Create a GitHub workflow

First, we need to set up a GitHub workflow that implements our business logic for deployment.

Here is a skeleton for the workflow - `deploy.yml` (including a placeholder for deployment logic):

<details>
<summary>Deployment GitHub workflow</summary>

```yaml showLineNumbers
name: CI
on:
  workflow_dispatch:
    inputs:
      service:
        required: true
        description: "Service name to deploy"
        type: string
      environment:
        required: true
        default: staging
        description: "Environment to deploy service to"
        type: string
      port_payload:
        required: true
        description: "Port's payload, including details for who triggered the action and general context (blueprint, run id, etc...)"
        type: string
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - id: echo-deploy
        run: echo "deploy"

      # ADD YOUR DEPLOYMENT LOGIC HERE!

  report-deployment:
    name: Report new deployment Entity
    runs-on: ubuntu-latest
    steps:
      - name: Extract SHA short
        run: echo "SHA_SHORT=${GITHUB_SHA:0:7}" >> $GITHUB_ENV
      - name: "Report deployment Entity to port 🚢"
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          identifier: ${{ inputs.service }}-${{ inputs.environment }}-${{ env.SHA_SHORT }}
          blueprint: deployment
          properties: |
            {
               "jobUrl": "${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}",
               "deployingUser": "${{ github.actor }}",
               "imageTag": "latest",
               "commitSha": "${{ env.SHA_SHORT }}"
            }
          runId: "${{fromJson(inputs.port_payload).context.runId}}"
```

</details>

:::note
Pay attention to the additional parameter in the workflow called `port_payload`.
This parameter is completed by default with [Port's action message](/create-self-service-experiences/reflect-action-progress/#action-run-json-structure).
You can disable it by specifying `"omitPayload": true` in Port's action definition.
For more details click [here](/create-self-service-experiences/setup-backend/#invocation-method-structure-fields)
:::

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
        "description": "The GitHub branch to deploy (Optional, otherwise will use repo's default branch)"
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
    "type": "GITHUB",
    "org": "<GITHUB_ORG>",
    "repo": "<GITHUB_REPO>",
    "workflow": "deploy.yml"
  },
  "trigger": "CREATE",
  "description": "Deploy a service to the environment"
}
```

You can see below the `python` code to create this action (remember to insert your `CLIENT_ID` and `CLIENT_SECRET` in order to get an access token).

:::note
Note how the `deployment` Blueprint identifier is used to add the action to the new Blueprint.

Moreover, don't forget to replace the placeholders for `YOUR_GITHUB_ORG`, `YOUR_GITHUB_REPO`.
:::

<details>
<summary>Click here to see code</summary>

```python showLineNumbers
import requests

CLIENT_ID = 'YOUR_CLIENT_ID'
CLIENT_SECRET = 'YOUR_CLIENT_SECRET'

GITHUB_ORG = 'YOUR_GITHUB_ORG'
GITHUB_REPO = 'YOUR_GITHUB_REPO'
GITHUB_WORKFLOW = 'deploy.yml'

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
        'type': 'GITHUB',
        'org': GITHUB_ORG,
        'repo': GITHUB_REPO,
        'workflow': GITHUB_WORKFLOW
    },
    'userInputs': {
        'properties': {
            'ref': {
                'type': 'string',
                'title': 'The GitHub branch to deploy (Optional, otherwise will use repo's default branch)'
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

![Action run audit log](../../../../../static/img/self-service-actions/run-service-deployment/runs-audit-log.png)

## Next step

This was a very basic example on how to trigger a GitHub workflow using Port's self-service action. We left placeholder code for you to insert your own custom logic that fits your infrastructure.
