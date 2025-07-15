---
sidebar_position: 4
displayed_sidebar: null
description: Learn how to effectively manage pull requests in Port, streamlining code reviews and collaboration processes.
---

import PortTooltip from "/src/components/tooltip/tooltip.jsx";
import GithubActionModificationHint from '/docs/guides/templates/github/_github_action_modification_required_hint.mdx'
import GithubDedicatedRepoHint from '/docs/guides/templates/github/_github_dedicated_workflows_repository_hint.mdx'

# Manage GitHub Pull Requests

This guide will demonstrate how to create a self-service action in Port that executes a GitHub workflow to manage GitHub Pull Requests directly from your Port catalog. You'll be able to streamline your code review process by performing common PR operations without leaving Port.

Once implemented, you'll be able to:
- Close pull requests with a single click
- Merge approved pull requests efficiently  
- Approve pull requests as part of your review workflow
- Track PR operations and their results within Port

## Prerequisites
- Complete the [onboarding process](/getting-started/overview).
- [Port's GitHub app](https://github.com/apps/getport-io) needs to be installed in your GitHub organization.

## Set up data model

If you haven't installed the GitHub integration, you'll need to create a blueprint for GitHub pull requests and repositories.
However, we highly recommend you install the GitHub integration to have these automatically set up for you.

<h3> Create the GitHub repository blueprint </h3>

1. Go to your [Builder](https://app.getport.io/settings/data-model) page.

2. Click on `+ Blueprint`.

3. Click on the `{...}` button in the top right corner, and choose "Edit JSON".

4. Add this JSON schema:

    <details>
    <summary><b>GitHub repository blueprint (click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "githubRepository",
      "title": "Repository",
      "icon": "Github",
      "ownership": {
        "type": "Direct"
      },
      "schema": {
        "properties": {
          "readme": {
            "title": "README",
            "type": "string",
            "format": "markdown"
          },
          "url": {
            "icon": "DefaultProperty",
            "title": "Repository URL",
            "type": "string",
            "format": "url"
          },
          "defaultBranch": {
            "title": "Default branch",
            "type": "string"
          },
          "last_contributor": {
            "title": "Last contributor",
            "icon": "TwoUsers",
            "type": "string",
            "format": "user"
          },
          "last_push": {
            "icon": "GitPullRequest",
            "title": "Last push",
            "description": "Last commit to the main branch",
            "type": "string",
            "format": "date-time"
          },
          "require_code_owner_review": {
            "title": "Require code owner review",
            "type": "boolean",
            "icon": "DefaultProperty",
            "description": "Requires review from code owners before a pull request can be merged"
          },
          "require_approval_count": {
            "title": "Require approvals",
            "type": "number",
            "icon": "DefaultProperty",
            "description": "The number of approvals required before merging a pull request"
          }
        },
        "required": []
      },
      "mirrorProperties": {
        "snyk_target_id": {
          "title": "snyk_target_id",
          "path": "snyk_target.$identifier"
        }
      },
      "calculationProperties": {},
      "aggregationProperties": {},
      "relations": {}
    }
    ```

    </details>

5. Click on the `Save` button.


<h3> Create the GitHub pull request blueprint </h3>

1. Go to your [Builder](https://app.getport.io/settings/data-model) page.

2. Click on `+ Blueprint`.

3. Click on the `{...}` button in the top right corner, and choose "Edit JSON".

4. Add this JSON schema:

    <details>
    <summary><b>GitHub pull request blueprint (click to expand)</b></summary>

    ```json showLineNumbers
        {
          "identifier": "githubPullRequest",
          "title": "Pull Request",
          "icon": "Github",
          "schema": {
            "properties": {
              "creator": {
                "title": "Creator",
                "type": "string"
              },
              "assignees": {
                "title": "Assignees",
                "type": "array"
              },
              "reviewers": {
                "title": "Reviewers",
                "type": "array"
              },
              "status": {
                "title": "Status",
                "type": "string",
                "enum": ["merged", "open", "closed"],
                "enumColors": {
                  "merged": "purple",
                  "open": "green",
                  "closed": "red"
                }
              },
              "closedAt": {
                "title": "Closed At",
                "type": "string",
                "format": "date-time"
              },
              "updatedAt": {
                "title": "Updated At",
                "type": "string",
                "format": "date-time"
              },
              "mergedAt": {
                "title": "Merged At",
                "type": "string",
                "format": "date-time"
              },
              "createdAt": {
                "title": "Created At",
                "type": "string",
                "format": "date-time"
              },
              "link": {
                "format": "url",
                "type": "string"
              },
              "leadTimeHours": {
                "title": "Lead Time in hours",
                "type": "number"
              }
            },
            "required": []
          },
          "mirrorProperties": {},
          "calculationProperties": {
            "days_old": {
              "title": "Days Old",
              "icon": "DefaultProperty",
              "calculation": "(now / 86400) - (.properties.createdAt | capture(\"(?<date>\\\\d{4}-\\\\d{2}-\\\\d{2})\") | .date | strptime(\"%Y-%m-%d\") | mktime / 86400) | floor",
              "type": "number"
            }
          },
          "relations": {
            "repository": {
              "title": "Repository",
              "target": "githubRepository",
              "required": false,
              "many": false
            }
          }
        }
     ``` 

    </details>

5. Click on the `Save` button.




## Implentation

### Add GitHub secrets

In your GitHub repository, [go to **Settings > Secrets**](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository) and add the following secrets:
- `PORT_CLIENT_ID` - Port Client ID [learn more](/build-your-software-catalog/custom-integration/api/#get-api-token).
- `PORT_CLIENT_SECRET` - Port Client Secret [learn more](/build-your-software-catalog/custom-integration/api/#get-api-token).
- `GH_TOKEN` - a [Classic Personal Access Token](https://github.com/settings/tokens) with the following scopes: `repo` and `delete_repo`.

### Create GitHub workflow

Create a workflow file under `.github/workflows/manage-pr.yml` with the following content:

<details>

<summary><b>GitHub workflow (click to expand) </b></summary>

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

:::tip Customize your workflow
You can customize this workflow to include additional PR management operations or integrate with other tools in your development workflow. Refer to the [GitHub API documentation](https://docs.github.com/en/rest/pulls) for more available operations.
:::

### Set up the self-service action

1. Go to the [Self-service](https://app.getport.io/self-serve) page of your portal.

2. Click on the `+ New Action` button.

3. Click on the `{...} Edit JSON` button.

4. Copy and paste the following JSON configuration into the editor: 

    <details>
    <summary><b>Manage GitHub Pull Requests Action (click to expand)</b></summary>

    <GithubActionModificationHint/>

    :::tip Replace the variables
    - `<GITHUB-ORG>` - your GitHub organization or user name
    - `<GITHUB-REPO-NAME>` - your GitHub repository name
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

5. Click on the `Save` button.

Now you should see the `Manage a GitHub PR` action in the self-service page.

## Let's test it!

1. Go to the [self-service hub](https://app.getport.io/self-serve) in Port.

2. Click the **Manage a GitHub PR** action.

3. Select a pull request from your catalog.

4. Choose the action you want to perform (close, merge, or approve).

5. Click Execute.


Congrats 🎉 You can now manage GitHub Pull Requests directly from Port with `close`, `merge`, and `approve` actions! 🔥



