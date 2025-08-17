---
displayed_sidebar: null
description: Learn how to set up GitHub Copilot triggers from Port to enable AI-powered coding assistance in your development workflow.
---
import GithubActionModificationHint from '/docs/guides/templates/github/_github_action_modification_required_hint.mdx'

# Trigger GitHub Copilot from Port

This guide demonstrates how to set up GitHub Copilot triggers from Port, enabling AI-powered coding assistance in your development workflow.  
By leveraging AI coding agents like Copilot, you can significantly reduce manual coding tasks and enhance productivity, allowing developers to focus on more complex problem-solving. You will learn how to create self-service actions that can assign issues to GitHub Copilot and configure the necessary GitHub workflows to handle the assignment process.

<img src="/img/guides/trigger-copilot-from-port-flow.jpg" border="1px" width="100%" />


## Common use cases

- **Assign issues to Copilot** for automated code generation and assistance
- **Integrate Copilot with Port workflows** for seamless AI-powered development


## Prerequisites

This guide assumes the following:
- You have a Port account and have completed the [onboarding process](https://docs.port.io/getting-started/overview).
- [Port's GitHub app](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/git/github/) is installed in your account.
- You have access to [create and configure AI agents](https://docs.port.io/ai-agents/overview#getting-started-with-ai-agents) in Port.
- GitHub Copilot is enabled in your repository.


## Set up data model

We need to create a GitHub issue blueprint to support our Copilot workflow. This blueprint will be used to track issues that can be assigned to Copilot.


### Create GitHub issue blueprint

When installing Port's GitHub app, the pull request and repository blueprints are created by default. However, the GitHub issue blueprint needs to be created manually.

1. Go to the [builder](https://app.getport.io/settings/data-model) page of your portal.
2. Click on `+ Blueprint`.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration:

    <details>
    <summary><b>GitHub issue blueprint (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "githubIssue",
      "title": "Issue",
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
          "labels": {
            "title": "Labels",
            "type": "array"
          },
          "status": {
            "title": "Status",
            "type": "string",
            "enum": [
              "open",
              "closed"
            ],
            "enumColors": {
              "open": "green",
              "closed": "purple"
            }
          },
          "createdAt": {
            "title": "Created At",
            "type": "string",
            "format": "date-time"
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
          "description": {
            "title": "Description",
            "type": "string",
            "format": "markdown"
          },
          "issueNumber": {
            "title": "Issue Number",
            "type": "number"
          },
          "link": {
            "title": "Link",
            "type": "string",
            "format": "url"
          }
        },
        "required": []
      },
      "mirrorProperties": {},
      "calculationProperties": {},
      "aggregationProperties": {},
      "relations": {
        "repository": {
          "target": "githubRepository",
          "required": true,
          "many": false
        }
      }
    }
    ```
    </details>

5. Click `Create` to save the blueprint.


### Auto-assign issues to request creator

To ensure that issues created through Port are assigned to the user who initiated the request, follow these steps:

1. **Ingest GitHub Users**: Ensure GitHub users are imported into Port via the default integration.

2. **Create Relations Between Users and GitHub Users**: Use the `Onboard user` self-service action to link each Port user to their GitHub username.

This linkage keeps users connected to the issues they create and improves accountability.


## Set up self-service actions

We will create self-service actions that can create and assign GitHub issues to Copilot. First, we need to add the necessary secrets to Port.


### Add GitHub secrets

In your GitHub repository, [go to **Settings > Secrets**](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository) and add the following secrets:
- `PORT_CLIENT_ID` - Port Client ID [learn more](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token).
- `PORT_CLIENT_SECRET` - Port Client Secret [learn more](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token).
- `PORT_GITHUB_TOKEN`: A [GitHub fine-grained personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-fine-grained-personal-access-token) is required. This token must have read and write permissions for the "Issues", "Metadata" and "Pull request" section of your repositories.


### Add Port secrets

To add these secrets to your portal:

1. Click on the `...` button in the top right corner of your Port application.
2. Click on **Credentials**.
3. Click on the `Secrets` tab.
4. Click on `+ Secret` and add the following secret:

    - `GITHUB_TOKEN` - A [GitHub fine-grained personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-fine-grained-personal-access-token) is required. This token must have read and write permissions for the "Issues", "Metadata" and "Pull request" section of your repositories.

    :::info Note
    The `GITHUB_TOKEN` mentioned here is the same token that was created and added as a secret in GitHub in the previous steps.
    :::


### Create GitHub issue action

1. Go to the [self-service](https://app.getport.io/self-serve) page of your portal.
2. Click on `+ New Action`.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration:

    <details>
    <summary><b>Create GitHub issue action (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "create_github_issue",
      "title": "Create GitHub Issue",
      "icon": "Github",
      "description": "Create a new issue in this GitHub repository",
      "trigger": {
        "type": "self-service",
        "operation": "DAY-2",
        "userInputs": {
          "properties": {
            "title": {
              "icon": "DefaultProperty",
              "type": "string",
              "title": "Issue Title",
              "description": "A short description for the task"
            },
            "labels": {
              "items": {
                "type": "string"
              },
              "icon": "DefaultProperty",
              "type": "array",
              "title": "Issue Labels",
              "description": "Labels to add to the issue, following format: [\"label1\",\"label2\"]"
            },
            "body": {
              "title": "Issue Body",
              "icon": "DefaultProperty",
              "type": "string",
              "description": "The actual task expected. Add here additional context like the latest change or related commits/PR, relevant people for this task, and other relevant instructions",
              "format": "markdown"
            }
          },
          "required": [
            "title",
            "body"
          ],
          "order": [
            "title",
            "body",
            "labels"
          ]
        },
        "blueprintIdentifier": "githubRepository"
      },
      "invocationMethod": {
        "type": "WEBHOOK",
        "url": "https://api.github.com/repos/{{ .entity.identifier }}/issues",
        "agent": false,
        "synchronized": true,
        "method": "POST",
        "headers": {
          "Accept": "application/vnd.github+json",
          "Authorization": "Bearer {{ .secrets.GITHUB_TOKEN }}",
          "X-GitHub-Api-Version": "2022-11-28",
          "Content-Type": "application/json"
        },
        "body": {
          "title": "{{ .inputs.title }}",
          "body": "{{ .inputs.body }}",
          "labels": "{{ .inputs.labels }}"
        }
      },
      "requiredApproval": false
    }
    ```
    </details>

5. Click `Save` to create the action.


### Assign issue to Copilot action

1. Go to the [self-service](https://app.getport.io/self-serve) page of your portal.
2. Click on `+ New Action`.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration:

    <details>
    <summary><b>Assign to Copilot action (Click to expand)</b></summary>

    <GithubActionModificationHint/>

    ```json showLineNumbers
    {
      "identifier": "assign_to_copilot",
      "title": "Assign to Copilot",
      "icon": "Github",
      "description": "Assign this issue to GitHub Copilot coding agent",
      "trigger": {
        "type": "self-service",
        "operation": "DAY-2",
        "userInputs": {
          "properties": {
            "triggered_by": {
              "title": "Triggered By",
              "icon": "DefaultProperty",
              "type": "string"
            }
          },
          "required": [],
          "order": [
            "triggered_by"
          ]
        },
        "blueprintIdentifier": "githubIssue"
      },
      "invocationMethod": {
        "type": "GITHUB",
        "org": "<GITHUB-ORG>",
        "repo": "<GITHUB-REPO>",
        "workflow": "assign_to_copilot.yml",
        "workflowInputs": {
          "issue_number": "{{ .entity.properties.issueNumber }}",
          "port_run_id": "{{ .run.id }}",
          "repository_owner": "{{ .entity.relations.repository | split(\"/\") | .[0] }}",
          "repository_name": "{{ .entity.relations.repository | split(\"/\") | .[1] }}",
          "trigger_user_email": "{{ .inputs.triggered_by }}"
        },
        "reportWorkflowStatus": true
      },
      "requiredApproval": false
    }
    ```
    </details>

5. Click `Save` to create the action.


### Add GitHub workflow

Create the file `.github/workflows/assign_to_copilot.yml` in the `.github/workflows` folder of your repository. 

This workflow will check if Copilot is enabled for the repository and return its unique ID. It also handles the assignment of issues to Copilot and the triggering author, and includes progress reporting back to Port.

<details>
<summary><b>GitHub workflow for Copilot assignment (Click to expand)</b></summary>

```yaml showLineNumbers
name: Assign Issue to Copilot

on:
  workflow_dispatch:
    inputs:
      issue_number:
        description: 'The number of the issue to assign to Copilot'
        required: true
      repository_owner:
        description: 'Repository owner (org or user)'
        required: true
        type: string
      repository_name:
        description: 'Repository name'
        required: true
        type: string
      port_run_id:
        description: 'Port run ID, used for reporting back to Port'
        required: false
      issue_context_to_comment:
        description: 'Context to add to the issue comment'
        required: false
        type: string
      trigger_user_email:
        description: 'Email of the triggering user'
        required: false
        type: string
        default: ''

jobs:
  assign_to_copilot:
    runs-on: ubuntu-latest
    steps:
      - name: Validate inputs
        run: |
          echo "Target repository: ${{ inputs.repository_owner }}/${{ inputs.repository_name }}"
          echo "Issue number: ${{ inputs.issue_number }}"

      - name: Report progress to Port - Starting
        if: ${{ inputs.port_run_id != '' }}
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ inputs.port_run_id }}
          logMessage: "Workflow started for issue #${{ inputs.issue_number }} in ${{ inputs.repository_owner }}/${{ inputs.repository_name }}"

      - name: Check if Copilot is enabled and get Bot ID
        id: get_copilot_id
        run: |
          response=$(gh api graphql -f query='
            query {
              repository(owner: "${{ inputs.repository_owner }}", name: "${{ inputs.repository_name }}") {
                suggestedActors(capabilities: [CAN_BE_ASSIGNED], first: 100) {
                  nodes {
                    login
                    __typename
                    ... on Bot {
                      id
                    }
                    ... on User {
                      id
                    }
                  }
                }
              }
            }
          ')
          
          # Extract Copilot bot ID
          copilot_id=$(echo "$response" | jq -r '.data.repository.suggestedActors.nodes[] | select(.login == "copilot-swe-agent") | .id')
          
          if [ -z "$copilot_id" ]; then
            echo "Error: Copilot coding agent is not enabled in repository ${{ inputs.repository_owner }}/${{ inputs.repository_name }}"
            exit 1
          fi
          
          echo "copilot_id=$copilot_id" >> $GITHUB_OUTPUT
          echo "Found Copilot bot with ID: $copilot_id"
        env:
          # Use PAT instead of GITHUB_TOKEN for cross-org access
          GH_TOKEN: ${{ secrets.PORT_GITHUB_TOKEN }}

      - name: Report progress to Port - Found Copilot Bot
        if: ${{ inputs.port_run_id != '' }}
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ inputs.port_run_id }}
          logMessage: "Found Copilot bot with ID: ${{ steps.get_copilot_id.outputs.copilot_id }}"

      - name: Get Issue ID
        id: get_issue_id
        run: |
          response=$(gh api graphql -f query='
            query {
              repository(owner: "${{ inputs.repository_owner }}", name: "${{ inputs.repository_name }}") {
                issue(number: ${{ inputs.issue_number }}) {
                  id
                  title
                  state
                }
              }
            }
          ')
          
          issue_id=$(echo "$response" | jq -r '.data.repository.issue.id')
          issue_title=$(echo "$response" | jq -r '.data.repository.issue.title')
          issue_state=$(echo "$response" | jq -r '.data.repository.issue.state')
          
          if [ -z "$issue_id" ] || [ "$issue_id" = "null" ]; then
            echo "Error: Issue #${{ inputs.issue_number }} not found in ${{ inputs.repository_owner }}/${{ inputs.repository_name }}"
            exit 1
          fi
          
          if [ "$issue_state" = "CLOSED" ]; then
            echo "Warning: Issue #${{ inputs.issue_number }} is closed"
          fi
          
          echo "issue_id=$issue_id" >> $GITHUB_OUTPUT
          echo "issue_title=$issue_title" >> $GITHUB_OUTPUT
          echo "Found issue: $issue_title (ID: $issue_id)"
        env:
          GH_TOKEN: ${{ secrets.PORT_GITHUB_TOKEN }}

      - name: Report progress to Port - Found Issue
        if: ${{ inputs.port_run_id != '' }}
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ inputs.port_run_id }}
          logMessage: "Found issue '${{ steps.get_issue_id.outputs.issue_title }}' (ID: ${{ steps.get_issue_id.outputs.issue_id }})"

      - name: Comment on issue before assignment
        id: comment_on_issue
        if: ${{ inputs.issue_context_to_comment != '' }}
        run: |
          gh issue comment ${{ inputs.issue_number }} \
            --repo "${{ inputs.repository_owner }}/${{ inputs.repository_name }}" \
            --body "$ISSUE_CONTEXT"
        env:
          GH_TOKEN: ${{ secrets.PORT_GITHUB_TOKEN }}
          ISSUE_CONTEXT: ${{ inputs.issue_context_to_comment }}

      - name: Report progress to Port - Commented on issue
        if: ${{ inputs.port_run_id != '' }}
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ inputs.port_run_id }}
          logMessage: "Added initial comment to issue #${{ inputs.issue_number }}."
          
      - name: Get Trigger User from Port
        id: port_user_lookup
        if: ${{ inputs.trigger_user_email != '' && inputs.trigger_user_email != 'null' }}
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: GET
          identifier: ${{ inputs.trigger_user_email }}
          blueprint: _user

      - name: Extract GitHub Username
        id: extract_username
        if: ${{ inputs.trigger_user_email != '' && inputs.trigger_user_email != 'null' }}
        run: |
          username=$(echo '${{ steps.port_user_lookup.outputs.entity }}' | jq -r '.entity.properties.git_hub_username // .properties.git_hub_username')
          if [ "$username" = "null" ] || [ -z "$username" ]; then
            echo "No GitHub username found for ${{ inputs.trigger_user_email }}"
            echo "github_username=" >> $GITHUB_OUTPUT
          else
            echo "Found GitHub username: $username"
            echo "github_username=$username" >> $GITHUB_OUTPUT
          fi

      - name: Assign issue to Copilot
        id: assign_issue
        run: |
          actor_ids="[\"${{ steps.get_copilot_id.outputs.copilot_id }}\"]"
      
          # Only try to add the initiator if the extract_username step actually ran
          if [ "${{ inputs.trigger_user_email }}" != "null" ] && [ -n "${{ steps.extract_username.outputs.github_username }}" ]; then
            user_id=$(gh api graphql -f query="query { user(login: \"${{ steps.extract_username.outputs.github_username }}\") { id }}" | jq -r '.data.user.id')
            if [ -n "$user_id" ] && [ "$user_id" != "null" ]; then
              echo "Found user ID for initiator: $user_id"
              actor_ids="[\"${{ steps.get_copilot_id.outputs.copilot_id }}\", \"$user_id\"]"
            else
              echo "No valid GitHub user ID found for initiator"
            fi
          else
            echo "Skipping initiator assignment (no trigger_user_email or username)"
          fi
          response=$(gh api graphql -f query="
            mutation {
              replaceActorsForAssignable(input: {
                assignableId: \"${{ steps.get_issue_id.outputs.issue_id }}\", 
                actorIds: $actor_ids
              }) {
                assignable {
                  ... on Issue {
                    id
                    title
                    assignees(first: 10) {
                      nodes {
                        login
                      }
                    }
                  }
                }
              }
            }
          ")
      
          assignees=$(echo "$response" | jq -r '.data.replaceActorsForAssignable.assignable.assignees.nodes[].login' 2>/dev/null)
      
          if echo "$assignees" | grep -q "Copilot"; then
            echo "✅ Successfully assigned issue to Copilot"
          else
            echo "❌ Failed to assign issue to Copilot"
            exit 1
          fi
        env:
          GH_TOKEN: ${{ secrets.PORT_GITHUB_TOKEN }}

      - name: Report back to Port (if triggered from Port)
        if: ${{ inputs.port_run_id != '' }}
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ inputs.port_run_id }}
          status: "SUCCESS"
          logMessage: |
            ✅ Workflow completed successfully.
            Assigned issue #${{ inputs.issue_number }} to GitHub Copilot.
            Repository: ${{ inputs.repository_owner }}/${{ inputs.repository_name }}
            Issue: ${{ steps.get_issue_id.outputs.issue_title }}
```
</details>


## Set up automations

We will create an automation that automatically assigns GitHub issues to Copilot when they have the "auto_assign" label.


### Automation to assign to Copilot

This automation ensures that when a GitHub issue has the `auto_assign` label, it is automatically assigned to the Copilot agent. This streamlines the workflow by reducing manual intervention and ensuring that tasks are promptly assigned to the appropriate coding agent.

1. Go to the [automations](https://app.getport.io/settings/automations) page of your portal.
2. Click on `+ Automation`.
3. Copy and paste the following JSON schema:

    <details>
    <summary><b>Assign to Copilot automation (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "assign_to_copilot_automation",
      "title": "Assign to Copilot",
      "description": "When GitHub issue has auto_assign label, assign to Copilot",
      "icon": "GithubCopilot",
      "trigger": {
        "type": "automation",
        "event": {
          "type": "ENTITY_UPDATED",
          "blueprintIdentifier": "githubIssue"
        },
        "condition": {
          "type": "JQ",
          "expressions": [
            ".diff.after.properties.labels | index(\"auto_assign\") != null",
            ".diff.after.properties.assignees | index(\"Copilot\") == null"
          ],
          "combinator": "and"
        }
      },
      "invocationMethod": {
        "type": "WEBHOOK",
        "url": "https://api.getport.io/v1/actions/assign_to_copilot/runs",
        "agent": false,
        "synchronized": true,
        "method": "POST",
        "headers": {
          "RUN_ID": "{{ .run.id }}",
          "Content-Type": "application/json"
        },
        "body": {
          "entity": "{{ .event.diff.after.identifier }}",
          "properties": {
             "triggered_by": "{{ .trigger.by.user.email }}"
          }
        }
      },
      "publish": true
    }
    ```
    </details>

4. Click `Create` to save the automation.


## Test the workflow

Now let us test the complete workflow to ensure everything works correctly.


### Run the self-service action

1. Run the self-service action to create a new GitHub issue.
2. Make sure to add the `auto_assign` label to the issue.
3. Go to the issue in GitHub and verify that Copilot is assigned.
4. Check that a pull request (PR) is opened for the issue.

<img src="/img/guides/jira-to-github-copilot-test.png" border="1px" width="100%" />


## Related guides

- [Set up the Task Manager AI agent](/guides/all/setup-task-manager-ai-agent) - Create an AI agent to manage and prioritize development tasks
