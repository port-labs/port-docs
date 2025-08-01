---
displayed_sidebar: null
description: Learn how to create an AI agent that automatically generates GitHub issues from Jira tickets, assigns them to Copilot and link pull requests back to Jira.
---

# Create AI agent to automate Jira to GitHub workflow

This guide demonstrates how to create an AI agent that streamlines your development workflow by automatically generating GitHub issues from Jira tickets, assigning them to GitHub Copilot and linking pull requests back to Jira. You will learn how to set up a complete automation that bridges Jira and GitHub, enabling seamless ticket-to-deployment workflow.

<img src="/img/guides/jira-to-github-pr-workflow.jpg" border="1px" width="100%" />


## Common use cases

- Automatically create GitHub issues from Jira tickets when they move to "In Progress"
- Assign GitHub issues to Copilot for automated code generation
- Link pull requests back to Jira tickets with automated comments
- Streamline the development workflow from ticket to deployment


## Prerequisites

This guide assumes the following:
- You have a Port account and have completed the [onboarding process](https://docs.port.io/getting-started/overview).
- [Port's GitHub app](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/git/github/) is installed in your account.
- [Port's Jira integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/project-management/jira/) is installed in your account.
- You have access to [create and configure AI agents](https://docs.port.io/ai-agents/overview#getting-started-with-ai-agents) in Port.

:::tip Alternative integrations
While this guide uses GitHub and Jira, you can adapt it for other Git providers like GitLab or Azure DevOps, and other project management tools like Linear.
:::


## Set up data model

We will create and configure blueprints to support our AI-enhanced release management workflow. This includes setting up the GitHub issue blueprint and updating the Jira issue blueprint with necessary relations.

### Create Task blueprint

We need to create a Task blueprint to store the AI agent's response before creating the GitHub issue.

1. Go to the [builder](https://app.getport.io/settings/data-model) page of your portal.
2. Click on `+ Blueprint`.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration:

    <details>
    <summary><b>Task blueprint (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "task",
      "title": "Task",
      "icon": "Task",
      "schema": {
        "properties": {
          "title": {
            "title": "Title",
            "type": "string"
          },
          "description": {
            "title": "Description",
            "type": "string",
            "format": "markdown"
          },
          "labels": {
            "title": "Labels",
            "type": "array"
          },
          "status": {
            "title": "Status",
            "type": "string",
            "enum": [
              "pending",
              "completed",
              "failed"
            ],
            "enumColors": {
              "pending": "yellow",
              "completed": "green",
              "failed": "red"
            }
          },
          "source": {
            "title": "Source",
            "type": "string"
          },
          "createdAt": {
            "title": "Created At",
            "type": "string",
            "format": "date-time"
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
        },
        "jiraIssue": {
          "target": "jiraIssue",
          "required": false,
          "many": false
        }
      }
    }
    ```
    </details>

5. Click `Create` to save the blueprint.

### Create GitHub issue blueprint

When installing the Port's GitHub app, the pull request and repository blueprints are created by default. However, the GitHub issue blueprint needs to be created manually.

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

### Update Jira issue blueprint

When you install the Port's Jira integration, the Jira project and issue blueprints are created by default. However, we need to update the Jira issue blueprint to add the pull request relation and create a mirror property for the PR link.

1. Go to the [builder](https://app.getport.io/settings/data-model) page of your portal.
2. Find and select your existing Jira issue blueprint (e.g., `jiraIssue`).
3. Click on `{...} Edit JSON`.
4. Add the following relation to the `relations` section:

    <details>
    <summary><b>Pull request relation (Click to expand)</b></summary>

    ```json showLineNumbers
    "pull_request": {
      "target": "githubPullRequest",
      "required": false,
      "many": false
    }
    ```
    </details>

5. Add the following mirror property to the `mirrorProperties` section:

    <details>
    <summary><b>Pull request link mirror property (Click to expand)</b></summary>

    ```json showLineNumbers
    "pull_request_link": {
      "title": "Pull Request Link",
      "path": "pull_request.link"
    }
    ```
    </details>

6. Click `Save` to update the blueprint.

### Update integration configuration

Now we need to update the Jira integration configuration mapping to establish the relationship between Jira issues and pull requests. The mapping will check if the pull request title contains the Jira issue key.

1. Go to the [data sources](https://app.getport.io/settings/data-sources) page of your portal.
2. Find your Jira integration and click on it.
3. Go to the `Mapping` tab.
4. Add the following YAML block into the editor to map the pull request relation:

    <details>
    <summary><b>Updated Jira integration configuration (Click to expand)</b></summary>

    ```yaml showLineNumbers
    resources:
      - kind: issue
        selector:
          query: 'true'
          jql: >-
            ((statusCategory != Done) OR (created >= -1w) OR (updated >= -1w)) and
            project=AI
        port:
          entity:
            mappings:
              identifier: .key
              title: .fields.summary
              blueprint: '"jiraIssue"'
              properties:
                url: (.self | split("/") | .[:3] | join("/")) + "/browse/" + .key
                status: .fields.status.name
                issueType: .fields.issuetype.name
                components: .fields.components
                description: >-
                  [.fields.description.content[]?.content[]?.text // empty] |
                  join("\n")
                creator: .fields.creator.emailAddress
                priority: .fields.priority.name
                labels: .fields.labels
                created: .fields.created
                updated: .fields.updated
                resolutionDate: .fields.resolutiondate
              relations:
                project: .fields.project.key
                parentIssue: .fields.parent.key
                subtasks: .fields.subtasks | map(.key)
                jira_user_assignee: .fields.assignee.accountId
                jira_user_reporter: .fields.reporter.accountId
                assignee:
                  combinator: '"or"'
                  rules:
                    - property: '"jira_user_id"'
                      operator: '"="'
                      value: .fields.assignee.accountId // ""
                    - property: '"$identifier"'
                      operator: '"="'
                      value: .fields.assignee.email // ""
                reporter:
                  combinator: '"or"'
                  rules:
                    - property: '"jira_user_id"'
                      operator: '"="'
                      value: .fields.reporter.accountId // ""
                    - property: '"$identifier"'
                      operator: '"="'
                      value: .fields.reporter.email // ""
                repository:
                  combinator: '"and"'
                  rules:
                    - property: '"$identifier"'
                      operator: '"="'
                      value: .fields.customfield_10039.value
                // highlight-start
                pull_request:
                  combinator: '"and"'
                  rules:
                    - property: '"$title"'
                      operator: '"contains"'
                      value: .key
                // highlight-end
    ```
    </details>

5. Click `Save` to update the integration configuration.


## Set up self-service actions

We will create self-service actions that the AI agent can use to create GitHub issues and assign them to Copilot. First, we will need to create secrets in Port, as the actions and automations will need them to function well.


### Add Port secrets

To add these secrets to your portal:

1. Click on the `...` button in the top right corner of your Port application.

2. Click on **Credentials**.

3. Click on the `Secrets` tab.

4. Click on `+ Secret` and add the following secret:
    - `JIRA_AUTH_TOKEN` - Base64 encoded string of your Jira credentials. Generate this by running:
        ```bash
        echo -n "your-email@domain.com:your-api-token" | base64
        ```
    - `GITHUB_TOKEN` - A GitHub personal access token with permissions to create issues in your repositories.


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
          "body": "{{ .inputs.body }}"
        }
      },
      "requiredApproval": false
    }
    ```
    </details>

5. Click `Save` to create the action.


### Create assign to Copilot action

1. Go back to the [self-service](https://app.getport.io/self-serve) page of your portal.
2. Click on `+ New Action`.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration:

    <details>
    <summary><b>Assign to Copilot action (Click to expand)</b></summary>

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
          "properties": {},
          "required": [],
          "order": []
        },
        "blueprintIdentifier": "githubIssue"
      },
      "invocationMethod": {
        "type": "GITHUB",
        "org": "your-org",
        "repo": "your-repo",
        "workflow": "assign_to_copilot.yml",
        "workflowInputs": {
          "issue_number": "{{ .entity.properties.issueNumber }}",
          "port_run_id": "{{ .run.id }}",
          "repository_owner": "{{ .entity.relations.repository | split(\"/\") | .[0] }}",
          "repository_name": "{{ .entity.relations.repository | split(\"/\") | .[1] }}"
        },
        "reportWorkflowStatus": true
      },
      "requiredApproval": false
    }
    ```
    </details>

5. Click `Save` to create the action.

:::tip GitHub workflow backend
You will need to create a GitHub workflow file named `assign_to_copilot.yml` in your repository. This workflow handles the assignment of issues to Copilot and includes progress reporting back to Port.

<details>
<summary><b>GitHub workflow for Copilot assignment (Click to expand)</b></summary>

Create a file named `.github/workflows/assign_to_copilot.yml` in your repository with the following content:

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
          clientId: ${{ secrets.PORT_AI_DEMO_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_AI_DEMO_CLIENT_SECRET }}
          baseUrl: https://api.us.getport.io
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
          GH_TOKEN: ${{ secrets.PORT_AI_DEMO_GITHUB_TOKEN }}

      - name: Report progress to Port - Found Copilot Bot
        if: ${{ inputs.port_run_id != '' }}
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_AI_DEMO_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_AI_DEMO_CLIENT_SECRET }}
          baseUrl: https://api.us.getport.io
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
          GH_TOKEN: ${{ secrets.PORT_AI_DEMO_CLIENT_SECRET }}

      - name: Report progress to Port - Found Issue
        if: ${{ inputs.port_run_id != '' }}
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_AI_DEMO_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_AI_DEMO_CLIENT_SECRET }}
          baseUrl: https://api.us.getport.io
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
          GH_TOKEN: ${{ secrets.PORT_AI_DEMO_GITHUB_TOKEN }}
          ISSUE_CONTEXT: ${{ inputs.issue_context_to_comment }}

      - name: Report progress to Port - Commented on issue
        if: ${{ inputs.port_run_id != '' }}
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_AI_DEMO_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_AI_DEMO_CLIENT_SECRET }}
          baseUrl: https://api.us.getport.io
          operation: PATCH_RUN
          runId: ${{ inputs.port_run_id }}
          logMessage: "Added initial comment to issue #${{ inputs.issue_number }}."

      - name: Assign issue to Copilot
        id: assign_issue
        run: |
          response=$(gh api graphql -f query='
            mutation {
              replaceActorsForAssignable(input: {
                assignableId: "${{ steps.get_issue_id.outputs.issue_id }}", 
                actorIds: ["${{ steps.get_copilot_id.outputs.copilot_id }}"]
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
          ')
          
          # Check if assignment was successful
          assignees=$(echo "$response" | jq -r '.data.replaceActorsForAssignable.assignable.assignees.nodes[].login' 2>/dev/null)
          
          if echo "$assignees" | grep -q "Copilot"; then
            echo "✅ Successfully assigned issue to Copilot"
          else
            echo "❌ Failed to assign issue to Copilot"
            exit 1
          fi
        env:
          GH_TOKEN: ${{ secrets.PORT_AI_DEMO_GITHUB_TOKEN }}

      - name: Report back to Port (if triggered from Port)
        if: ${{ inputs.port_run_id != '' }}
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_AI_DEMO_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_AI_DEMO_CLIENT_SECRET }}
          baseUrl: https://api.us.getport.io
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

:::caution Required secrets
You will need to add the following secrets to your GitHub repository:
- `PORT_AI_DEMO_CLIENT_ID`: Your Port client ID
- `PORT_AI_DEMO_CLIENT_SECRET`: Your Port client secret  
- `PORT_AI_DEMO_GITHUB_TOKEN`: A GitHub PAT with repository access
:::


## Create AI agent

Next, we will create an AI agent that generates GitHub issues from Jira tickets with appropriate context and labels.

### Configure the GitHub issue creation AI agent

1. Go to the [AI Agents](https://app.getport.io/_ai_agents) page of your portal.
2. Click on `+ AI Agent`.
3. Toggle `Json mode` on.
4. Copy and paste the following JSON schema:

    <details>
    <summary><b>GitHub issue creation AI agent configuration (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "github_issue_creation",
      "title": "Github Issue Creation",
      "icon": "Details",
      "team": [],
      "properties": {
        "description": "Creates Github issues from Jira tickets",
        "status": "active",
        "allowed_blueprints": [
          "service",
          "githubIssue",
          "githubRepository",
          "_user",
          "_team"
        ],
        "allowed_actions": [
          "create_github_issue"
        ],
        "prompt": "Create a GitHub issue that builds on the context of a linked Jira ticket.\n\nThe GitHub issue should:\n\t1.\tSummarize and clearly explain the task, using the Jira description as a base.\n\t2.\tAugment the description with relevant insights from the repository — such as the README, setup or contribution instructions, existing issues, or implementation notes — to make the issue fully self-contained.\n\t4.\tAdd GitHub labels, including one with the Jira ticket key (e.g., JIRA-1234), and any additional relevant labels (e.g., bug, enhancement, infra).\n    5. Also include a label named \"auto_assign\" in all creations.\n\nIf no direct match can be confidently made (e.g., across multiple repos), make a best guess, and clearly state any assumptions in the issue body.",
        "execution_mode": "Automatic",
        "conversation_starters": []
      },
      "relations": {}
    }
    ```
    </details>

5. Click `Create` to save the agent.


## Set up automations

We will create several automations to orchestrate the AI-enhanced release management workflow:

1. Trigger the AI agent when Jira tickets move to "In Progress" with "copilot" label
2. Assign GitHub issues to Copilot automatically
3. Add labels to GitHub issues after creation
4. Update Jira tickets with pull request links

### Automation to trigger AI agent

1. Go to the [automations](https://app.getport.io/settings/automations) page of your portal.
2. Click on `+ Automation`.
3. Copy and paste the following JSON schema:

    <details>
    <summary><b>Create GitHub issue from Jira automation (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "create_github_issue_from_Jira",
      "title": "Create a Github Issue from Jira Ticket",
      "description": "When Jira issue moves to In Progress with Copilot label, create a Github issue",
      "icon": "Github",
      "trigger": {
        "type": "automation",
        "event": {
          "type": "ENTITY_UPDATED",
          "blueprintIdentifier": "jiraIssue"
        },
        "condition": {
          "type": "JQ",
          "expressions": [
            ".diff.after.properties.status == \"In Progress\"",
            ".diff.before.properties.status == \"To Do\"",
            "(.diff.after.properties.labels | index(\"copilot\")) != null"
          ],
          "combinator": "and"
        }
      },
      "invocationMethod": {
        "type": "WEBHOOK",
        "url": "https://api.us.getport.io/v1/agent/github_issue_creation/invoke",
        "agent": false,
        "synchronized": true,
        "method": "POST",
        "headers": {
          "RUN_ID": "{{ .run.id }}",
          "Content-Type": "application/json"
        },
        "body": {
          "prompt": "Task title: \"{{.event.diff.after.title}}\"\n. Task identifier: \"{{.event.diff.after.identifier}}\"\n Task description: \"{{.event.diff.after.properties.description}}\"\nRepository:{{.event.diff.after.relations.repository}}.",
          "labels": {
            "source": "create_github_issue_automation",
            "jira_issue_id": "{{ .event.diff.after.identifier }}"
          }
        }
      },
      "publish": true
    }
    ```
    </details>

4. Click `Create` to save the automation.

### Automation to assign to Copilot

1. Go back to the [automations](https://app.getport.io/settings/automations) page of your portal.
2. Click on `+ Automation`.
3. Copy and paste the following JSON schema:

    <details>
    <summary><b>Assign to Copilot automation (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "jira_to_copilot_agent",
      "title": "Assign to Copilot from Jira",
      "description": "When Jira issue moves to In Progress with Copilot label, assign to Copilot",
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
        "url": "https://api.us.getport.io/v1/actions/assign_to_copilot/runs",
        "agent": false,
        "synchronized": true,
        "method": "POST",
        "headers": {
          "RUN_ID": "{{ .run.id }}",
          "Content-Type": "application/json"
        },
        "body": {
          "entity": "{{ .event.diff.after.identifier }}",
          "properties": {}
        }
      },
      "publish": true
    }
    ```
    </details>

4. Click `Create` to save the automation.

### Automation to add labels to GitHub issues

1. Go back to the [automations](https://app.getport.io/settings/automations) page of your portal.
2. Click on `+ Automation`.
3. Copy and paste the following JSON schema:

    <details>
    <summary><b>Add labels to GitHub issue automation (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "add_labels_to_a_github_issue",
      "title": "Add labels to a Github issue",
      "description": "Adds labels to a Github issue after SSA",
      "icon": "Github",
      "trigger": {
        "type": "automation",
        "event": {
          "type": "RUN_UPDATED",
          "actionIdentifier": "create_github_issue"
        },
        "condition": {
          "type": "JQ",
          "expressions": [
            ".diff.after.status == \"SUCCESS\""
          ],
          "combinator": "and"
        }
      },
      "invocationMethod": {
        "type": "WEBHOOK",
        "url": "https://api.github.com/repos/{{ .event.diff.before.entity.identifier }}/issues/{{ .event.diff.before.response.number }}/labels",
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
          "labels": "{{ .event.diff.before.properties.labels }}"
        }
      },
      "publish": true
    }
    ```
    </details>

4. Click `Create` to save the automation.

### Automation to add PR link to Jira ticket

1. Go back to the [automations](https://app.getport.io/settings/automations) page of your portal.
2. Click on `+ Automation`.
3. Copy and paste the following JSON schema:

    <details>
    <summary><b>Add PR link to Jira issue automation (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "add_pr_link_to_jira_issue",
      "title": "Add PR Link to Jira Issue",
      "description": "An automation that adds the PR link to the Jira issue as a comment",
      "icon": "GitPullRequest",
      "trigger": {
        "type": "automation",
        "event": {
          "type": "ENTITY_UPDATED",
          "blueprintIdentifier": "jiraIssue"
        },
        "condition": {
          "type": "JQ",
          "expressions": [
            ".diff.after.relations.pull_request != .diff.before.relations.pull_request"
          ],
          "combinator": "and"
        }
      },
      "invocationMethod": {
        "type": "WEBHOOK",
        "url": "https://your-domain.atlassian.net/rest/api/3/issue/{{  .event.diff.before.identifier }}/comment",
        "agent": false,
        "synchronized": true,
        "method": "POST",
        "headers": {
          "RUN_ID": "{{ .run.id }}",
          "Authorization": "Basic {{ .secrets.JIRA_AUTH_TOKEN }}",
          "Content-Type": "application/json"
        },
        "body": {
          "body": {
            "type": "doc",
            "version": 1,
            "content": [
              {
                "type": "paragraph",
                "content": [
                  {
                    "type": "text",
                    "text": "We've discovered a PR for this issue. Find the link below:"
                  }
                ]
              },
              {
                "type": "paragraph",
                "content": [
                  {
                    "type": "text",
                    "text": "View Pull Request",
                    "marks": [
                      {
                        "type": "link",
                        "attrs": {
                          "href": "{{ .event.diff.after.properties.pull_request_link }}"
                        }
                      },
                      {
                        "type": "strong"
                      }
                    ]
                  }
                ]
              }
            ]
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

<h4> Trigger a test Jira ticket update </h4>

1. Go to your Jira instance and find a test ticket.
2. Add the "copilot" label to the ticket.
3. Move the ticket status from "To Do" to "In Progress".

<h4> Verify the GitHub issue creation </h4>

1. Go to the [AI Agents](https://app.getport.io/_ai_agents) page of your portal.
2. Click on the `Github Issue Creation` agent.
3. Check the `AI Invocations` tab to see the generated GitHub issue.

<h4> Check GitHub repository </h4>

1. Go to your GitHub repository.
2. Verify that a new issue was created with the appropriate title, description, and labels.
3. Check that the issue has the "auto_assign" label.

<h4> Verify Copilot assignment </h4>

1. Check the GitHub issue to see if it was assigned to Copilot.
2. Verify that the GitHub workflow was triggered successfully.

<h4> Test pull request linking </h4>

1. Create a pull request with a title that contains the Jira ticket key.
2. Check the Jira ticket to see if a comment was added with the PR link.

<img src="/img/guides/jira-to-github-ai-test.png" border="1px" width="100%" />


## Best practices

To get the most out of your AI-enhanced release management workflow:

1. **Monitor AI responses**: Regularly review the quality and accuracy of AI-generated GitHub issues.

2. **Refine the prompt**: Adjust the AI agent prompt based on your team's specific needs and communication style.

3. **Customize labels**: Configure different labels for different types of tasks or teams.

4. **Add more context**: Consider enriching Jira tickets with additional metadata from other integrations.


## Related guides

- [Set up the Task Manager AI agent](https://docs.port.io/guides/all/setup-task-manager-ai-agent)