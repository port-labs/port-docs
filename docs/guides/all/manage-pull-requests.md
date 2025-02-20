---
sidebar_position: 4
displayed_sidebar: null
description: Learn how to effectively manage pull requests in Port, streamlining code reviews and collaboration processes.
---

import PortTooltip from "/src/components/tooltip/tooltip.jsx";

# Manage GitHub Pull Requests

In this guide, we are going to create a self-service action in Port that executes a GitHub workflow to manage GitHub Pull Requests. This action can be used to:

- Close a Pull Request
- Merge a Pull Request
- Approve a Pull Request

## Prerequisites

1. Install Port's GitHub app by clicking [here](https://github.com/apps/getport-io/installations/new). This will create the `Repository` and `Pull Request` blueprints then ingest your GitHub repositories and pull requests into Port.
3. A repository to contain your action resources i.e. the github workflow file.


## Guide

Follow these steps to get started:

1. Create the following GitHub Action secrets:
   - Create the following Port credentials:
     - `PORT_CLIENT_ID` - Port Client ID [learn more](/build-your-software-catalog/custom-integration/api/#get-api-token).
     - `PORT_CLIENT_SECRET` - Port Client Secret [learn more](/build-your-software-catalog/custom-integration/api/#get-api-token).
   - `GH_TOKEN` - a [Classic Personal Access Token](https://github.com/settings/tokens) with the following scopes: `repo` and `delete_repo`

<br />
2. Create a Port action against the `Pull Request` blueprint in the [self-service page](https://app.getport.io/self-serve) or with the following JSON definition:

<details>

  <summary>Port Action: Manage GitHub Pull Requests</summary>
   :::tip Replace the variables
- `<GITHUB-ORG>` - your GitHub organization or user name.
- `<GITHUB-REPO-NAME>` - your GitHub repository name.
:::

```json showLineNumbers
{
  "identifier": "service_manage_a_pr",
  "title": "Manage a GitHub PR",
  "icon": "Github",
  "description": "Manage a GitHub pull request",
  "trigger": {
    "type": "self-service",
    "operation": "DAY-2",
    "userInputs": {
      "properties": {
        "action": {
          "title": "Action",
          "description": "What action to take",
          "icon": "Git",
          "type": "string",
          "enum": [
            "close",
            "merge",
            "approve"
          ],
          "enumColors": {
            "close": "lightGray",
            "merge": "lightGray"
          }
        }
      },
      "required": [
        "action"
      ],
      "order": []
    },
    "blueprintIdentifier": "githubPullRequest"
  },
  "invocationMethod": {
    "type": "GITHUB",
    "org": "<GITHUB-ORG>",
    "repo": "<GITHUB-REPO-NAME>",
    "workflow": "manage-pr.yml",
    "workflowInputs": {
      "action": "{{.inputs.\"action\"}}",
      "port_context": {
        "entity": "{{.entity}}",
        "blueprint": "{{.action.blueprint}}",
        "runId": "{{.run.id}}",
        "trigger": "{{.trigger}}"
      }
    },
    "reportWorkflowStatus": true
  },
  "requiredApproval": false
}
```

</details>
<br />

3. Create a workflow file under `.github/workflows/manage-pr.yml` with the following content:

<details>

<summary>GitHub workflow script</summary>

```yaml showLineNumbers title="manage-pr.yml"
name: Manage Pull Request

on:
  workflow_dispatch:
    inputs:
      action: 
        required: true
        type: string
      port_context:
        required: true
        description: "Details about the action and general context (blueprint, run id, etc...)"
        type: string

jobs:
  manage-pr:
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
            Executing the ${{ github.event.inputs.action }} action on the GitHub pull request... ⛴️

      - name: Extract Repository and PR Number
        id: extract_info
        run: |
          link="${{ fromJson(inputs.port_context).entity.properties.link }}"
          repo_info=$(echo "$link" | sed 's|https://github.com/||' | awk -F'/' '{print $1 "/" $2}')
          pr_number=$(echo "$link" | awk -F'/' '{print $NF}')

          echo "REPO_INFO=$repo_info" >> $GITHUB_ENV
          echo "PR_NUMBER=$pr_number" >> $GITHUB_ENV

      - name: Determine Action
        run: |
          action="${{ github.event.inputs.action }}"
          repo_info="${{ env.REPO_INFO }}"
          pr_number="${{ env.PR_NUMBER }}"

          result=""
          result_message=""

          if [ -n "$repo_info" ] && [ -n "$pr_number" ]; then
            if [ "$action" == "close" ]; then
              result=$(curl -s -o /dev/null -w "%{http_code}" \
                -X PATCH \
                -H "Authorization: token ${{ secrets.GH_TOKEN }}" \
                -H "Accept: application/vnd.github.v3+json" \
                "https://api.github.com/repos/$repo_info/pulls/$pr_number" \
                -d '{"state": "closed"}')
            elif [ "$action" == "merge" ]; then
              result=$(curl -s -o /dev/null -w "%{http_code}" \
                -X PUT \
                -H "Authorization: token ${{ secrets.GH_TOKEN }}" \
                -H "Accept: application/vnd.github.v3+json" \
                "https://api.github.com/repos/$repo_info/pulls/$pr_number/merge")
            elif [ "$action" == "approve" ]; then
              result=$(curl -s -o /dev/null -w "%{http_code}" \
                -X PATCH \
                -H "Authorization: token ${{ secrets.GH_TOKEN }}" \
                -H "Accept: application/vnd.github.v3+json" \
                "https://api.github.com/repos/$repo_info/pulls/$pr_number/reviews" \
                -d '{"event": "APPROVE"}')
            else
              result="400" # Invalid action code
              result_message="Invalid action specified. Expected 'close', 'approve' or 'merge'."
              echo $result_message
              exit 1
            fi
          else
            result="400" # Invalid parameters code
            result_message="Failed to extract repository and PR number from the URL."
            echo $result_message
            exit 1
          fi

          echo "HTTP Status for $action: $result"

          if [ $result -eq 200 ]; then
            result_message="PR $action completed successfully"
          else
            result_message="PR $action failed. HTTP Status: $result"
          fi

          echo "Result for $action: $result_message"

          echo "GITHUB_ACTION_RESULT=$result" >> $GITHUB_ENV
          echo "GITHUB_ACTION_TYPE=$action" >> $GITHUB_ENV
          echo "GITHUB_ACTION_RESULT_MESSAGE=$result_message" >> $GITHUB_ENV

      - name: Notify Port
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          operation: PATCH_RUN
          baseUrl: https://api.getport.io
          runId: ${{ fromJson(inputs.port_context).runId }}
          logMessage: |
            GitHub Action result for ${{ env.GITHUB_ACTION_TYPE }} action on PR ${{ env.PR_NUMBER }}: ${{ env.GITHUB_ACTION_RESULT_MESSAGE }}
```

</details>
<br />
4. Trigger the action from the [self-service](https://app.getport.io/self-serve) page or the context menu of a Pull Request entity.

<img src='/img/self-service-actions/setup-backend/github-workflow/examples/prMenu.png' width='100%' border='1px' />

<br />
<br />

5. Choose an action to complete and execute the workflow.


<img src='/img/self-service-actions/setup-backend/github-workflow/examples/prForm.png' width='85%' border='1px' />

<br />
<br />

Done! 🎉 You can now manage a GitHub Pull Request with `close`, `merge` and `approve` actions.