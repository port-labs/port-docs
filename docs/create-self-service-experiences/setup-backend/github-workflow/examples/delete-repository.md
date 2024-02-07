---
sidebar_position: 4
---

import PortTooltip from "/src/components/tooltip/tooltip.jsx";

# Delete GitHub Repository

In the following guide, you are going to create a self-service action in Port that executes a GitHub workflow to [delete a GitHub repository](https://docs.github.com/en/rest/repos/repos#delete-a-repository).

## Prerequisites
1. Install Port's GitHub app by clicking [here](https://github.com/apps/getport-io/installations/new).
2. This guide assumes the presence of a blueprint representing your repositories. If you haven't done so yet, initiate the setup of your GitHub data model by referring to this [guide](http://localhost:4000/build-your-software-catalog/sync-data-to-catalog/git/github/examples#mapping-repositories-file-contents-and-pull-requests) first.
3. A repository to contain your action resources i.e. the github workflow file.


## Guide

Follow these steps to get started:

1. Create the following GitHub Action secrets:
    1. Create the following Port credentials:
        1. `PORT_CLIENT_ID` - Port Client ID [learn more](/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token).
        2. `PORT_CLIENT_SECRET` - Port Client Secret [learn more](/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token).
    2. `GH_TOKEN` - a [Classic Personal Access Token](https://github.com/settings/tokens) with the following scopes: `repo` and `delete_repo`

<br />
2. Create a Port action in the [self-service page](https://app.getport.io/self-serve) or with the following JSON definition:

<details>

  <summary>Port Action: Delete GitHub Repository</summary>
   :::tip
- `<GITHUB-ORG>` - your GitHub organization or user name.
- `<GITHUB-REPO-NAME>` - your GitHub repository name.
:::


```json showLineNumbers
[
  {
    "identifier": "delete_repo",
    "title": "Delete Repo",
    "icon": "Github",
    "userInputs": {
      "properties": {
        "org_name": {
          "icon": "Github",
          "title": "Organisation Name",
          "type": "string",
          "default": "default-org"
        },
        "delete_dependents": {
          "icon": "Github",
          "title": "Delete Dependent Items",
          "type": "boolean",
          "default": false
        }
      },
      "required": [],
      "order": [
        "org_name",
        "delete_dependents"
      ]
    },
    "invocationMethod": {
      "type": "GITHUB",
      "org": "<GITHUB-ORG>",
      "repo": "<GITHUB-REPO-NAME>",
      "workflow": "delete-repo.yml",
      "omitUserInputs": false,
      "omitPayload": false,
      "reportWorkflowStatus": true
    },
    "trigger": "DELETE",
    "description": "A github action that deletes a github repo",
    "requiredApproval": false
  }
]
```

</details>
<br />

3. Create a workflow file under `.github/workflows/delete-repo.yml` with the following content:

<details>

<summary>GitHub workflow script</summary>

```yaml showLineNumbers title="delete-repo.yml"
name: Delete Repository

on:
  workflow_dispatch:
    inputs:
      org_name:
        required: true
        type: string
      delete_dependents:
        required: false
        type: boolean
        default: false
      port_payload:
        required: true
        type: string
jobs:
  delete-repo:
    runs-on: ubuntu-latest

    steps:
      - name: Inform starting of deletion
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_payload).context.runId }}
          logMessage: |
            Deleting a github repository... ⛴️

      - name: Delete Repository
        env:
          GH_TOKEN: ${{ secrets.GH_TOKEN }}
          REPO_NAME: ${{ fromJson(inputs.port_payload).context.entity }}
        run: |
          echo $GH_TOKEN
          HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
            -X DELETE \
            -H "Accept: application/vnd.github+json" \
            -H "Authorization: Bearer $GH_TOKEN" \
            "https://api.github.com/repos/${{ inputs.org_name }}/$REPO_NAME")

          echo "HTTP Status: $HTTP_STATUS"

          # Check if HTTP_STATUS is 204 (No Content)
          if [ $HTTP_STATUS -eq 204 ]; then
            echo "Repository deleted successfully."
            echo "delete_successful=true" >> $GITHUB_ENV
          else
            echo "Failed to delete repository. HTTP Status: $HTTP_STATUS"
            echo "delete_successful=false" >> $GITHUB_ENV
          fi

      - name: Delete record in Port
        if: ${{ env.delete_successful == 'true' }}
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          operation: DELETE
          delete_dependents: ${{ inputs.delete_dependents }}
          identifier: ${{ fromJson(inputs.port_payload).context.entity }}
          blueprint: ${{ fromJson(inputs.port_payload).context.blueprint }}
      
      - name: Inform completion of deletion
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_payload).context.runId }}
          logMessage: |
            GitHub repository deleted! ✅

```

</details>
<br />
4. Trigger the action from the [self-service](https://app.getport.io/self-serve) page of your Port application.
