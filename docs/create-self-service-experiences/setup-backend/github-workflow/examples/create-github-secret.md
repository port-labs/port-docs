---
sidebar_position: 2
---

# Create GitHub Secret

This example demonstrates how to create [GitHub Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions) in your GitHub repository via Port Actions.

In this example we are using a pre-defined GitHub Action from GitHub Marketplace called [Create GitHub Secret Action](https://github.com/marketplace/actions/create-github-secret-action).

## Example - Create GitHub Secret

Follow these steps to get started:

1. Create the following GitHub Action secrets:

   1. `PERSONAL_ACCESS_TOKEN` - a [Classic Personal Access Token](https://github.com/settings/tokens) with the following scopes:

      ![Token Scopes](../../../../../static/img/self-service-actions/setup-backend/github-workflow/pat-scopes.png)

   2. `PORT_CLIENT_ID` - Port Client ID [learn more](../../../../build-your-software-catalog/custom-integration/api/#get-api-token).
   3. `PORT_CLIENT_SECRET` - Port Client Secret [learn more](../../../../build-your-software-catalog/custom-integration/api/#get-api-token).

2. Install Port's GitHub app by clicking [here](https://github.com/apps/getport-io/installations/new).

3. Create a Port blueprint with the following properties:

:::note
Keep in mind this can be any blueprint you would like and this is just an example.
:::

```json showLineNumbers
{
  "identifier": "githubsecret",
  "title": "GitHubSecret",
  "icon": "Github",
  "schema": {
    "properties": {
      "secret_key": {
        "icon": "DefaultProperty",
        "title": "Secret Key",
        "type": "string",
        "description": "All Uppercase",
        "pattern": "^[^a-z]*$"
      },
      "secret_value": {
        "icon": "DefaultProperty",
        "title": "Secret Value",
        "type": "string"
      }
    },
    "required": ["secret_key", "secret_value"]
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "relations": {}
}
```

4. Create a Port action using the following JSON definition:

:::note
Make sure to replace the placeholders for GITHUB_ORG_NAME and GITHUB_REPO_NAME in your Port Action to match your GitHub environment.
:::

```json showLineNumbers
[
  {
    "identifier": "create_github_secret",
    "title": "Create GitHub Secret",
    "icon": "Github",
    "userInputs": {
      "properties": {
        "secret_key": {
          "icon": "DefaultProperty",
          "title": "Secret Key",
          "type": "string",
          "pattern": "^[^a-z]*$"
        },
        "secret_value": {
          "icon": "DefaultProperty",
          "title": "Secret Value",
          "type": "string",
          "encryption": "aes256-gcm"
        }
      },
      "required": ["secret_key", "secret_value"],
      "order": ["secret_key", "secret_value"]
    },
    "invocationMethod": {
      "type": "GITHUB",
      "omitPayload": false,
      "omitUserInputs": false,
      "reportWorkflowStatus": true,
      "org": "<GITHUB_ORG_NAME>",
      "repo": "<GITHUB_REPO_NAME>",
      "workflow": "create-repo-secret.yml"
    },
    "trigger": "CREATE",
    "description": "Creates a GitHub secret in my repository",
    "requiredApproval": false
  }
]
```

5. Create a workflow file under `.github/workflows/create-repo-secret.yml` with the following content:

```yml showLineNumbers
name: Create Repository Secret

on:
  workflow_dispatch:
    inputs:
      secret_key:
        type: string
        description: Name of the secret's key
      secret_value:
        type: string
        description: value of the secret
      port_payload:
        required: false
        description:
          Port's payload, including details for who triggered the action and
          general context (blueprint, run id, etc...)
        type: string

jobs:
  create_secret:
    runs-on: ubuntu-latest
    steps:
      - uses: gliech/create-github-secret-action@v1
        with:
          name: ${{ inputs.secret_key }}
          value: ${{ inputs.secret_value }}
          pa_token: ${{ secrets.PERSONAL_ACCESS_TOKEN }}

      - name: UPSERT Entity
        uses: port-labs/port-github-action@v1
        with:
          identifier: ${{ inputs.secret_key }}
          title: ${{ inputs.secret_key }}
          team: "[]"
          icon: DefaultBlueprint
          blueprint: ${{ fromJson(inputs.port_payload).context.blueprint }}
          properties: |-
            {
              "secret_key": "${{ inputs.secret_key }}",
              "secret_value": "${{ inputs.secret_value }}"
            }
          relations: "{}"
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          operation: UPSERT
          runId: ${{ fromJson(inputs.port_payload).context.runId }}
```

6. Trigger the action from the [Self-service](https://app.getport.io/self-serve) tab of your Port application.
