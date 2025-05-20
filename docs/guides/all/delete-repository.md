---
sidebar_position: 3
displayed_sidebar: null
description: Learn how to delete a repository in Port with this guide, ensuring secure and proper removal of unnecessary resources.
---

import PortTooltip from "/src/components/tooltip/tooltip.jsx";

# Delete GitHub Repository

In the following guide, you are going to create a self-service action in Port that executes a GitHub workflow to [delete a GitHub repository](https://docs.github.com/en/rest/repos/repos#delete-a-repository).

:::tip Use Cases

- **Declutter Development**: Clean up outdated, unused, or test repositories to streamline your GitHub environment.
- **Project Sunset**: Offboard completed projects by gracefully deleting their repositories.
- **Enhanced Control**: Manage repository lifecycles without needing in-depth GitHub permissions.
:::

## Prerequisites
1. **Port's GitHub Integration**: Install it by clicking [here](https://github.com/apps/getport-io/installations/new). This is essential for Port to interact with your GitHub repositories.
2. **GitHub Data in Port**: Ensure your repositories are synced with Port. If you haven't set this up yet, follow this quick [guide](/build-your-software-catalog/sync-data-to-catalog/git/github/examples/#mapping-repositories-file-contents-and-pull-requests).
3. **Workflow Repository**: Decide on an existing repository where you'll store your GitHub workflow file, or create a dedicated repository for your Port actions.


## Guide

Follow these steps to get started:

1. Create the following GitHub Action secrets:
    - Create the following Port credentials:
        - `PORT_CLIENT_ID` - Port Client ID [learn more](/build-your-software-catalog/custom-integration/api/#get-api-token).
        - `PORT_CLIENT_SECRET` - Port Client Secret [learn more](/build-your-software-catalog/custom-integration/api/#get-api-token).
    - `GH_TOKEN` - a [Classic Personal Access Token](https://github.com/settings/tokens) with the following scopes: `repo` and `delete_repo`

<br />


2. Create a Port action against in the [self-service page](https://app.getport.io/self-serve) with the following JSON definition:

<details>

  <summary>Port Action: Delete GitHub Repository</summary>
   :::tip
- `<GITHUB-ORG>` - your GitHub organization or user name.
- `<GITHUB-REPO-NAME>` - your GitHub repository name.

**Note**: Replace the `blueprintIdentifier` on line 30 with the id of your own blueprint.
:::


```json showLineNumbers
{
  "identifier": "service_delete_repo",
  "title": "Delete Repo",
  "icon": "Github",
  "description": "A github action that deletes a github repo",
  "trigger": {
    "type": "self-service",
    "operation": "DELETE",
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
    // highlight-start
    "blueprintIdentifier": "service"
    // highlight-end
  },
  "invocationMethod": {
    "type": "GITHUB",
    "org": "<GITHUB-ORG>",
    "repo": "<GITHUB-REPO-NAME>",
    "workflow": "delete-repo.yml",
    "workflowInputs": {
      "org_name": "{{inputs.org_name}}",
      "delete_dependents": "{{inputs.delete_dependents}}",
      "port_context": {
        "entity": "{{.entity.identifier}}",
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
      port_context:
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
          runId: ${{ fromJson(inputs.port_context).runId }}
          logMessage: |
            Deleting a github repository... ⛴️

      - name: Delete Repository
        env:
          GH_TOKEN: ${{ secrets.GH_TOKEN }}
          REPO_NAME: ${{ fromJson(inputs.port_context).entity }}
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
          identifier: ${{ fromJson(inputs.port_context).entity }}
          blueprint: ${{ fromJson(inputs.port_context).blueprint }}
      
      - name: Inform completion of deletion
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).runId }}
          logMessage: |
            GitHub repository deleted! ✅

```

</details>
<br />
4. Trigger the action from the [self-service](https://app.getport.io/self-serve) page of your Port application.


## More Relevant Guides

- [Scaffold a new service](/guides/all/scaffold-a-new-service/)
- [Manage Pull Requests](/guides/all/manage-pull-requests)
- [Create GitHub Secrets](/guides/all/create-github-secret)