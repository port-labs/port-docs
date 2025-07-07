---
displayed_sidebar: null
description: Learn how to create GitHub secrets in Port with this guide, enhancing security and managing sensitive data efficiently through self-service actions.
---

import GithubActionModificationHint from '/docs/guides/templates/github/_github_action_modification_required_hint.mdx'
import GithubDedicatedRepoHint from '/docs/guides/templates/github/_github_dedicated_workflows_repository_hint.mdx'

# Create GitHub Secret

This guide demonstrates how to implement a self-service action in Port that allows you to create [GitHub Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions) in your GitHub repository directly from Port.

In this example we are using a pre-defined GitHub Action from GitHub Marketplace called [Create GitHub Secret Action](https://github.com/marketplace/actions/create-github-secret-action).

## Common use cases

- **CI/CD Management**: Store API keys, deployment tokens, and other credentials needed for automated workflows.
- **Environment Configuration**: Manage environment-specific secrets for different deployment stages.
- **Security Compliance**: Centralize secret creation with proper approval workflows and audit trails.
- **Developer Productivity**: Enable developers to create secrets without requiring direct repository access.

## Prerequisites

- Complete the [onboarding process](/getting-started/overview).
- [Port's GitHub app](https://github.com/apps/getport-io) needs to be installed in your GitHub organization.
- A [Classic Personal Access Token](https://github.com/settings/tokens) with the following scopes:
  - `repo` (Full control of private repositories).
  - `admin:org` (Full control of orgs and teams, read and write org projects).
- Port Client ID and Client Secret ([learn more](/build-your-software-catalog/custom-integration/api/#get-api-token)).

## Set up data model

To represent GitHub secrets in your Port catalog, we'll create a dedicated blueprint.

### Create the GitHub Secret blueprint

1. Go to the [Builder](https://app.getport.io/settings/data-model) page of your portal.

2. Click on `+ Blueprint`.

3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.

4. Add this JSON schema:

    :::tip Blueprint flexibility
    Keep in mind this can be any blueprint you would like and this is just an example. You can customize the properties based on your organization's needs.
    :::

    <details>
    <summary><b>GitHub Secret blueprint (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "githubsecret",
      "title": "GitHubSecret",
      "icon": "Github",
      "schema": {
        "properties": {
          "secret_key": {
            "icon": "Github",
            "title": "Secret Key",
            "type": "string",
            "description": "All Uppercase",
            "pattern": "[^a-z]*$"
          },
          "secret_value": {
            "icon": "Github",
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

    </details>

5. Click `Save` to create the blueprint.

## Implementation

### Add GitHub secrets

In your GitHub repository, [go to **Settings > Secrets**](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository) and add the following secrets:

- `PERSONAL_ACCESS_TOKEN` - A [Classic Personal Access Token](https://github.com/settings/tokens) with the following scopes:

  ![Token Scopes](/img/self-service-actions/setup-backend/github-workflow/pat-scopes.png)

- `PORT_CLIENT_ID` - Port Client ID [learn more](/build-your-software-catalog/custom-integration/api/#get-api-token).
- `PORT_CLIENT_SECRET` - Port Client Secret [learn more](/build-your-software-catalog/custom-integration/api/#get-api-token).

### Add GitHub workflow

Create the file `.github/workflows/create-repo-secret.yml` in the `.github/workflows` folder of your repository.

<GithubDedicatedRepoHint/>

<details>
<summary><b>Create GitHub Secret Workflow (Click to expand)</b></summary>

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
      port_context:
        required: false
        description:
          Who triggered the action and general context (blueprint, run id, etc...)
        type: string

jobs:
  create_secret:
    runs-on: ubuntu-latest
    steps:
      - name: Mask secret value
        run: echo "::add-mask::${{ inputs.secret_value }}"

      - uses: gliech/create-github-secret-action@v1
        with:
          name: ${{ inputs.secret_key }}
          value: ${{ inputs.secret_value }}
          pa_token: ${{ secrets.PERSONAL_ACCESS_TOKEN }}

      - name: Mask secret key
        run: echo "::add-mask::${{ inputs.secret_key }}"

      - name: UPSERT Entity
        uses: port-labs/port-github-action@v1
        with:
          identifier: ${{ inputs.secret_key }}
          title: ${{ inputs.secret_key }}
          team: "[]"
          icon: DefaultBlueprint
          blueprint: ${{ fromJson(inputs.port_context).blueprint }}
          properties: |-
            {
              "secret_key": "${{ inputs.secret_key }}",
              "secret_value": "${{ inputs.secret_value }}"
            }
          relations: "{}"
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: UPSERT
          runId: ${{ fromJson(inputs.port_context).runId }}

      - name: Inform completion of request to create secret in Port
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          status: "SUCCESS"
          runId: ${{fromJson(inputs.port_context).runId}}
          logMessage: "Created github secret ${{ github.event.inputs.secret_key }}"
```
</details>

### Set up self-service action

Now we'll create a self-service action that allows users to create GitHub secrets through Port's interface.

1. Head to the [self-service](https://app.getport.io/self-serve) page.

2. Click on the `+ New Action` button.

3. Click on the `{...} Edit JSON` button.

4. Copy and paste the following JSON configuration into the editor.

    <details>
    <summary><b>Create GitHub Secret Action (Click to expand)</b></summary>

    <GithubActionModificationHint/>

    ```json showLineNumbers
    {
      "identifier": "create_git_hub_secret",
      "title": "Create GitHub Secret",
      "icon": "Github",
      "description": "Creates a GitHub secret in my repository",
      "trigger": {
        "type": "self-service",
        "operation": "CREATE",
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
          "required": [
            "secret_key",
            "secret_value"
          ],
          "order": [
            "secret_key",
            "secret_value"
          ]
        },
        "blueprintIdentifier": "githubsecret"
      },
      "invocationMethod": {
        "type": "GITHUB",
        "org": "<GITHUB_ORG_NAME>",
        "repo": "<GITHUB_REPO_NAME>",
        "workflow": "create-repo-secret.yml",
        "workflowInputs": {
          "secret_key": "{{ .inputs.\"secret_key\" }}",
          "secret_value": "{{ .inputs.\"secret_value\" }}",
          "port_context": {
            "entity": "{{.entity}}",
            "blueprint": "{{.action.blueprint}}",
            "runId": "{{.run.id}}",
            "trigger": "{{ .trigger }}"
          }
        },
        "reportWorkflowStatus": true
      },
      "requiredApproval": false
    }
    ```

    </details>

5. Click `Save`.

Now you should see the `Create GitHub Secret` action in the self-service page. 🎉

## Let's test it!

1. Head to the [self-service page](https://app.getport.io/self-serve) of your portal.

2. Click on the `Create GitHub Secret` action.

3. Fill in the secret details:
   - **Secret Key**: Enter a name for your secret (all uppercase, e.g., `MY_API_KEY`).
   - **Secret Value**: Enter the secret value (this will be encrypted).

4. Click on `Execute`.

5. Wait for the workflow to complete.

6. Verify the secret was created:
   - Check your GitHub repository's secrets in **Settings > Secrets and variables > Actions**.
   - Verify the new entity appears in your Port catalog under the GitHub Secret blueprint.

:::tip Action permissions
You may want to restrict this action to specific users or teams. To do this:
- Edit the action by hovering over it and clicking on the `...` button, then selecting `Edit`.
- In the `Permissions` tab, select the users or teams who can execute the action.
:::
