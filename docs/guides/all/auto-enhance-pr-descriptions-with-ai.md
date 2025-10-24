---
displayed_sidebar: null
description: Automatically enhance PR descriptions with AI-generated, template-compliant content using Port automations and Claude Code
---

import GithubDedicatedRepoHint from '/docs/guides/templates/github/_github_dedicated_workflows_repository_hint.mdx'
import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Auto-enhance PR descriptions with AI

This guide demonstrates how to automatically enhance GitHub pull request descriptions using Port's automation capabilities with either GitHub Copilot or Claude Code. When a PR is created with a minimal or empty description, Port triggers an AI coding agent to analyze the changes and generate a comprehensive, template-compliant description that includes contextual information from your software catalog.


This guide supports both GitHub Copilot and Claude Code - use whichever your team already has:

- **GitHub Copilot**: Simpler setup if you're already using it for coding. Works through GitHub's native issue assignment.
- **Claude Code**: Direct approach with more control. Requires an Anthropic API key.

## Common use cases

- **Template compliance**: Automatically generate descriptions that match organization-specific PR templates
- **Business context integration**: Link PRs to related Jira/Linear issues and pull business requirements
- **Architectural context**: Explain how changes fit into broader system architecture with service dependencies
- **Change impact analysis**: Describe what problems the PR solves and potential impacts on the system
- **Review guidance**: Provide context specifically helpful for human and AI code reviewers

## Prerequisites

This guide assumes the following:
- You have a Port account and have completed the [onboarding process](https://docs.port.io/getting-started/overview).
- [Port's GitHub app](/build-your-software-catalog/sync-data-to-catalog/git/github/) is installed in your account.
- You have a GitHub Personal Access Token with repository permissions.
- **For GitHub Copilot path**: You have completed the [Trigger GitHub Copilot from Port guide](/guides/all/trigger-github-copilot-from-port) and GitHub Copilot is enabled in your repositories.
- **For Claude Code path**: You have an Anthropic API key for Claude Code access.

## Set up data model

We'll create a PR Template blueprint to store your organization's PR templates and configure the GitHub integration to ingest these templates from your repositories.

### Create PR template blueprint

This blueprint will store your organization's pull request templates.

1. Go to the [Builder](https://app.getport.io/settings/data-model) page of your portal.
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.
4. Copy and paste the following JSON schema:

    <details>
    <summary><b>PR Template blueprint (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "prTemplate",
      "title": "PR Template",
      "icon": "GitPullRequest",
      "schema": {
        "properties": {
          "content": {
            "title": "Template Content",
            "type": "string",
            "format": "markdown",
            "description": "The PR template content in markdown format"
          },
          "repository": {
            "title": "Repository",
            "type": "string",
            "description": "Repository where this template is defined"
          },
          "path": {
            "title": "File Path",
            "type": "string",
            "description": "Path to the template file in the repository"
          }
        },
        "required": ["content"]
      },
      "mirrorProperties": {},
      "calculationProperties": {},
      "aggregationProperties": {},
      "relations": {}
    }
    ```
    </details>

5. Click `Create` to save the blueprint.

### Update pull request blueprint

Now we'll add a relation from the pull request blueprint to the PR template blueprint.

1. Go to the [Builder](https://app.getport.io/settings/data-model) page.

2. Find and click on your `Pull Request` blueprint (usually named `githubPullRequest`).

3. Click on `{...} Edit JSON`.

4. Add the following relation to the `relations` section:

    <details>
    <summary><b>PR Template relation (Click to expand)</b></summary>

    ```json showLineNumbers
    "prTemplate": {
      "title": "PR Template",
      "target": "prTemplate",
      "required": false,
      "many": false
    }
    ```
    </details>

5. Click `Save` to update the blueprint.

### Configure GitHub integration to ingest PR templates

Now we'll configure the GitHub integration to ingest PR template files from your repositories.

1. Go to the [Data sources](https://app.getport.io/settings/data-sources) page of your portal.

2. Find your GitHub integration and click on it.

3. Go to the `Mapping` tab.

4. Add the following YAML configuration to ingest PR template files:

    <details>
    <summary><b>GitHub PR template mapping (Click to expand)</b></summary>

    ```yaml showLineNumbers
    - kind: file
      selector:
        query: "true"
        files:
          - path: ".github/pull_request_template.md"
      port:
        entity:
          mappings:
            identifier: .repo.name + "-pr-template"
            title: .repo.name + " PR Template"
            blueprint: '"prTemplate"'
            properties:
              content: .file.content
              repository: .repo.name
              path: .file.path
    ```

    :::tip Alternative template paths
    If your organization uses different PR template paths, you can modify the `files.path` configuration:
    - Multiple templates: `- path: ".github/PULL_REQUEST_TEMPLATE/*.md"`
    - Docs folder: `- path: "docs/pull_request_template.md"`
    - Root level: `- path: "pull_request_template.md"`
    :::

    </details>

5. Click `Save` to update the integration configuration.

6. Wait for the integration to re-sync, or manually trigger a resync. Your PR templates will appear in the catalog under the `PR Template` blueprint.

### Update pull request integration mapping

Update the GitHub pull request mapping to connect PRs to their templates and optionally to Jira issues for business context.

1. In the same GitHub integration mapping, locate the `pull-request` kind section.
2. Add the `prTemplate` relation and optional `jiraIssue` relation to the `relations` section:

    <details>
    <summary><b>Updated pull request mapping (Click to expand)</b></summary>

    ```yaml showLineNumbers
    - kind: pull-request
      selector:
        query: "true"
      port:
        entity:
          mappings:
            identifier: .id|tostring
            title: .title
            blueprint: '"githubPullRequest"'
            properties:
              status: .status
              closedAt: .closed_at
              updatedAt: .updated_at
              mergedAt: .merged_at
              createdAt: .created_at
              prNumber: .number
              link: .html_url
              labels: '[.labels[].name]'
              branch: .head.ref
            relations:
              repository: .head.repo.name
              prTemplate: .head.repo.name + "-pr-template"
              jiraIssue: .title | match("[A-Z]+-[0-9]+") .string  # Optional: extracts Jira key from PR title
    ```

    :::tip Business context integration
    The `jiraIssue` relation is optional and extracts Jira issue keys from PR titles (e.g., "JIRA-1234: Add caching layer"). This enables the automation to pull business requirements and acceptance criteria from Jira issues. If you're using Linear or don't want business context, you can omit this relation.
    
    To set this up:
    - Install [Port's Jira integration](/build-your-software-catalog/sync-data-to-catalog/project-management/jira/)
    - Ensure your team follows a convention of including Jira keys in PR titles
    - See the [Connect GitHub PR with Jira Issue guide](/guides/all/connect-github-pr-with-jira-issue) for more details
    :::

    </details>

3. Click `Save` to update the configuration.


## Set up Port automation

This automation will trigger when a new pull request is created in Port, and it will invoke the GitHub workflow to enhance the PR description.

1. Go to the [Automations](https://app.getport.io/settings/automations) page of your portal.
2. Click on `+ Automation`.
3. Copy and paste the following JSON schema:

    <details>
    <summary><b>PR description enhancement automation (Click to expand)</b></summary>

    :::info Replace placeholders and choose your workflow
    - Replace `<GITHUB_ORG>` with your GitHub organization name
    - Replace `<GITHUB_WORKFLOWS_REPO>` with your dedicated workflows repository name
    - Set `workflow` to either:
      - `"enhance-pr-description-copilot.yml"` if using GitHub Copilot
      - `"enhance-pr-description-claude.yml"` if using Claude Code
    :::

    ```json showLineNumbers
    {
      "identifier": "enhance_pr_description",
      "title": "Enhance PR Description with AI",
      "description": "Automatically enhance PR descriptions when a new PR is created",
      "icon": "GitPullRequest",
      "trigger": {
        "type": "automation",
        "event": {
          "type": "ENTITY_CREATED",
          "blueprintIdentifier": "githubPullRequest"
        },
        "condition": {
          "type": "JQ",
          "expressions": [
            ".diff.after.properties.status == \"open\"",
            "(.diff.after.title | length) > 0"
          ],
          "combinator": "and"
        }
      },
      "invocationMethod": {
        "type": "GITHUB",
        "org": "<GITHUB_ORG>",
        "repo": "<GITHUB_WORKFLOWS_REPO>",
        "workflow": "enhance-pr-description.yml",
        "workflowInputs": {
          "pr_number": "{{ .event.diff.after.properties.prNumber | tostring }}",
          "repository": "{{ .event.diff.after.properties.link | split(\"/\") | .[3] + \"/\" + .[4] }}",
          "port_run_id": "{{ .run.id }}"
        },
        "reportWorkflowStatus": true
      },
      "publish": true
    }
    ```

    :::tip Conditional triggers
    You can customize the trigger condition to only enhance PRs that:
    - Have empty descriptions: Add `(.diff.after.properties.description | length) == 0`
    - Are from specific repositories: Add `.diff.after.relations.repository == "my-repo"`
    - Have specific labels: Add `.diff.after.properties.labels | contains(["needs-description"])`
    :::

    </details>

4. Click `Create` to save the automation.


## Add GitHub repository secrets

In your dedicated workflows repository, [go to **Settings > Secrets**](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository) and add the following secrets:

**Required for both Copilot and Claude Code:**
- `PORT_GITHUB_TOKEN`: A [GitHub fine-grained personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-fine-grained-personal-access-token) with **Read and Write** permissions for **Contents**, **Issues**, **Metadata**, and **Pull requests**.
- `PORT_CLIENT_ID`: Your Port Client ID [learn more](https://docs.port.io/build-your-software-catalog/custom-integration/api/#get-api-token).
- `PORT_CLIENT_SECRET`: Your Port Client Secret [learn more](https://docs.port.io/build-your-software-catalog/custom-integration/api/#get-api-token).

**Required only for Claude Code path:**
- `ANTHROPIC_API_KEY`: Your Anthropic API key for Claude Code access.
## Create GitHub workflow

Choose your preferred AI coding agent below and implement the corresponding workflow.

<GithubDedicatedRepoHint/>

<Tabs groupId="coding-agent" defaultValue="copilot" values={[
{label: "GitHub Copilot", value: "copilot"},
{label: "Claude Code", value: "claude"}
]}>

<TabItem value="copilot">

This approach uses GitHub Copilot to analyze the PR and enhance its description. Copilot is assigned to a temporary issue with all the context, then updates the PR description automatically.

1. In your dedicated workflows repository, create a new file: `.github/workflows/enhance-pr-description-copilot.yml`

2. Copy and paste the following workflow:

    <details>
    <summary><b>GitHub Copilot PR enhancement workflow (Click to expand)</b></summary>

    ```yaml showLineNumbers
    name: Enhance PR Description with Copilot

    on:
      workflow_dispatch:
        inputs:
          pr_number:
            required: true
            description: "Pull request number"
            type: string
          repository:
            required: true
            description: "Repository in 'owner/repo' format"
            type: string
          port_run_id:
            required: false
            description: "Port run ID for tracking"
            type: string

    permissions:
      contents: read
      pull-requests: write
      issues: write

    jobs:
      enhance-description:
        runs-on: ubuntu-latest
        env:
          GITHUB_TOKEN: ${{ secrets.PORT_GITHUB_TOKEN }}
        steps:
          - name: Get Port Access Token
            id: port_token
            run: |
              TOKEN=$(curl -X POST \
                https://api.getport.io/v1/auth/access_token \
                -H "Content-Type: application/json" \
                -d "{\"clientId\":\"${{ secrets.PORT_CLIENT_ID }}\",\"clientSecret\":\"${{ secrets.PORT_CLIENT_SECRET }}\"}" \
                | jq -r '.accessToken')
              echo "token=$TOKEN" >> $GITHUB_OUTPUT

          - name: Get PR Details and Port Context
            id: pr_details
            run: |
              # Get PR information from GitHub
              PR_DATA=$(gh api repos/${{ inputs.repository }}/pulls/${{ inputs.pr_number }})
              
              CURRENT_DESC=$(echo "$PR_DATA" | jq -r '.body // ""')
              echo "current_description<<EOF" >> $GITHUB_OUTPUT
              echo "$CURRENT_DESC" >> $GITHUB_OUTPUT
              echo "EOF" >> $GITHUB_OUTPUT
              
              echo "pr_title=$(echo "$PR_DATA" | jq -r '.title')" >> $GITHUB_OUTPUT
              echo "pr_author=$(echo "$PR_DATA" | jq -r '.user.login')" >> $GITHUB_OUTPUT
              
              # Get changed files summary
              CHANGED_FILES=$(gh api repos/${{ inputs.repository }}/pulls/${{ inputs.pr_number }}/files --jq '[.[] | {filename: .filename, status: .status, additions: .additions, deletions: .deletions}]')
              echo "changed_files<<EOF" >> $GITHUB_OUTPUT
              echo "$CHANGED_FILES" >> $GITHUB_OUTPUT
              echo "EOF" >> $GITHUB_OUTPUT
              
              # Get PR entity from Port to fetch related context
              PR_ENTITY=$(curl -s -X POST "https://api.getport.io/v1/blueprints/githubPullRequest/entities/search" \
                -H "Authorization: Bearer ${{ steps.port_token.outputs.token }}" \
                -H "Content-Type: application/json" \
                -d "{\"rules\":[{\"property\":\"\$identifier\",\"operator\":\"=\",\"value\":\"${{ inputs.pr_number }}\"}]}" \
                | jq -r '.entities[0]')
              
              # Extract relation identifiers
              REPO_NAME=$(echo "$PR_ENTITY" | jq -r '.relations.repository // ""')
              echo "repo_name=$REPO_NAME" >> $GITHUB_OUTPUT
              
              PR_TEMPLATE=$(echo "$PR_ENTITY" | jq -r '.relations.prTemplate // ""')
              echo "pr_template=$PR_TEMPLATE" >> $GITHUB_OUTPUT
              
              JIRA_ISSUE=$(echo "$PR_ENTITY" | jq -r '.relations.jiraIssue // ""')
              echo "jira_issue=$JIRA_ISSUE" >> $GITHUB_OUTPUT

          - name: Fetch Optional Context from Port
            id: port_context
            run: |
              # Fetch PR template if available
              if [ -n "${{ steps.pr_details.outputs.pr_template }}" ]; then
                TEMPLATE=$(curl -s -X GET \
                  "https://api.getport.io/v1/blueprints/prTemplate/entities/${{ steps.pr_details.outputs.pr_template }}" \
                  -H "Authorization: Bearer ${{ steps.port_token.outputs.token }}" \
                  | jq -r '.entity.properties.content // ""')
                echo "template_content<<EOF" >> $GITHUB_OUTPUT
                echo "$TEMPLATE" >> $GITHUB_OUTPUT
                echo "EOF" >> $GITHUB_OUTPUT
              fi
              
              # Fetch Jira issue if available
              if [ -n "${{ steps.pr_details.outputs.jira_issue }}" ]; then
                JIRA=$(curl -s -X GET \
                  "https://api.getport.io/v1/blueprints/jiraIssue/entities/${{ steps.pr_details.outputs.jira_issue }}" \
                  -H "Authorization: Bearer ${{ steps.port_token.outputs.token }}" \
                  | jq -r '{key: .entity.identifier, title: .entity.title, description: .entity.properties.description // "N/A"}')
                echo "jira_context<<EOF" >> $GITHUB_OUTPUT
                echo "$JIRA" >> $GITHUB_OUTPUT
                echo "EOF" >> $GITHUB_OUTPUT
              fi
              
              # Fetch service context if available
              if [ -n "${{ steps.pr_details.outputs.repo_name }}" ]; then
                SERVICE=$(curl -s -X GET \
                  "https://api.getport.io/v1/blueprints/service/entities/${{ steps.pr_details.outputs.repo_name }}" \
                  -H "Authorization: Bearer ${{ steps.port_token.outputs.token }}" \
                  | jq -r '{title: .entity.title, description: .entity.properties.description // "N/A", team: .entity.relations.team // []}')
                echo "service_context<<EOF" >> $GITHUB_OUTPUT
                echo "$SERVICE" >> $GITHUB_OUTPUT
                echo "EOF" >> $GITHUB_OUTPUT
              fi

          - name: Create Enhancement Instructions
            id: create_instructions
            run: |
              cat > /tmp/enhancement_instructions.md << 'INSTRUCTIONS_EOF'
              # Task: Enhance PR Description
              
              You are tasked with analyzing this PR and updating its description to be comprehensive and follow the organization's standards.
              
              ## PR Information
              See the PR details provided by the workflow.
              
              ## Your Task
              
              1. **Analyze the code changes** in this PR by checking out the code and examining the modified files
              2. **Generate a comprehensive PR description** that:
                 - Follows the PR template structure provided
                 - Includes what changed and why (template compliance)
                 - References the Jira issue context if available (business context)
                 - Explains how changes fit into the service architecture (architectural context)
                 - Describes the impact of changes (change impact analysis)
                 - Provides guidance for reviewers on what to focus on (review guidance)
              3. **Update the PR description** using the gh CLI
              
              ## Important Guidelines
              - Be comprehensive but concise
              - Use professional, clear language
              - Include all relevant context from business and architectural sources
              - Highlight any breaking changes or migration requirements
              - Make it easy for both human and AI reviewers to understand the changes
              
              INSTRUCTIONS_EOF
              
              # Append dynamic content to instructions
              cat >> /tmp/enhancement_instructions.md << EOF
              
              ## PR Details
              - PR Number: #${{ inputs.pr_number }}
              - Repository: ${{ inputs.repository }}
              - Title: ${{ steps.pr_details.outputs.pr_title }}
              - Author: @${{ steps.pr_details.outputs.pr_author }}
              
              ## Current Description
              ${{ steps.pr_details.outputs.current_description }}
              
              ## Changed Files
              ${{ steps.pr_details.outputs.changed_files }}
              
              ## PR Template
              ${{ steps.port_context.outputs.template_content || 'Use standard template structure' }}
              
              ## Jira Context
              ${{ steps.port_context.outputs.jira_context || 'No Jira issue linked' }}
              
              ## Service Context
              ${{ steps.port_context.outputs.service_context || 'No service context available' }}
              
              ## Action Required
              Update PR description using: gh pr edit ${{ inputs.pr_number }} --repo ${{ inputs.repository }} --body-file <file>
              EOF
              
              echo "Instructions created successfully"

          - name: Create GitHub Issue for Copilot
            id: create_issue
            run: |
              INSTRUCTIONS=$(cat /tmp/enhancement_instructions.md)
              
              ISSUE_RESPONSE=$(gh api repos/${{ inputs.repository }}/issues \
                -X POST \
                -f title="[Auto] Enhance PR #${{ inputs.pr_number }} Description" \
                -f body="$INSTRUCTIONS" \
                -f labels[]="auto_assign" \
                -f labels[]="pr-enhancement" \
                --jq '{number: .number, id: .node_id}')
              
              echo "issue_number=$(echo "$ISSUE_RESPONSE" | jq -r '.number')" >> $GITHUB_OUTPUT
              echo "issue_id=$(echo "$ISSUE_RESPONSE" | jq -r '.id')" >> $GITHUB_OUTPUT
              echo "✅ Created issue #$(echo "$ISSUE_RESPONSE" | jq -r '.number') for Copilot"

          - name: Wait for Copilot to Process
            run: |
              echo "Waiting for Copilot to be assigned and process the issue..."
              sleep 5
              
              # Check if Copilot was assigned (this happens via the automation from trigger-github-copilot guide)
              ISSUE_DATA=$(gh api repos/${{ inputs.repository }}/issues/${{ steps.create_issue.outputs.issue_number }})
              ASSIGNEES=$(echo "$ISSUE_DATA" | jq -r '.assignees[].login')
              
              if echo "$ASSIGNEES" | grep -q "Copilot"; then
                echo "✅ Copilot has been assigned to the issue"
              else
                echo "⚠️  Copilot not yet assigned, but automation should handle this"
              fi

          - name: Monitor Copilot Progress
            id: monitor_copilot
            run: |
              echo "Monitoring for PR from Copilot..."
              MAX_WAIT=300  # 5 minutes
              ELAPSED=0
              
              while [ $ELAPSED -lt $MAX_WAIT ]; do
                # Check for PRs from Copilot that mention the issue
                PRS=$(gh api "repos/${{ inputs.repository }}/pulls?state=open" \
                  --jq '[.[] | select(.user.login == "Copilot" or .user.login == "github-copilot[bot]") | select(.body | contains("#${{ steps.create_issue.outputs.issue_number }}")) | {number: .number, title: .title}]')
                
                if [ "$(echo "$PRS" | jq '. | length')" -gt 0 ]; then
                  COPILOT_PR=$(echo "$PRS" | jq -r '.[0].number')
                  echo "copilot_pr_number=$COPILOT_PR" >> $GITHUB_OUTPUT
                  echo "✅ Copilot created PR #$COPILOT_PR"
                  break
                fi
                
                sleep 10
                ELAPSED=$((ELAPSED + 10))
              done
              
              if [ -z "${COPILOT_PR:-}" ]; then
                echo "⚠️  Copilot did not create a PR within the timeout period"
                echo "copilot_pr_number=" >> $GITHUB_OUTPUT
              fi

          - name: Extract Enhanced Description
            if: ${{ steps.monitor_copilot.outputs.copilot_pr_number != '' }}
            id: extract_description
            run: |
              # Get the description from Copilot's PR (it should contain the enhanced description)
              COPILOT_PR_DATA=$(gh api repos/${{ inputs.repository }}/pulls/${{ steps.monitor_copilot.outputs.copilot_pr_number }})
              COPILOT_PR_BODY=$(echo "$COPILOT_PR_DATA" | jq -r '.body // ""')
              
              # Try to extract the enhanced description (Copilot might include it in a specific format)
              # For now, we'll check if Copilot updated the original PR directly
              ORIGINAL_PR_DATA=$(gh api repos/${{ inputs.repository }}/pulls/${{ inputs.pr_number }})
              UPDATED_DESC=$(echo "$ORIGINAL_PR_DATA" | jq -r '.body // ""')
              
              if [ "$UPDATED_DESC" != "${{ steps.pr_details.outputs.current_description }}" ]; then
                echo "✅ Original PR description was updated!"
              else
                echo "ℹ️  Original PR not yet updated, Copilot may still be working"
              fi

          - name: Close Temporary Issue
            if: always()
            run: |
              gh api repos/${{ inputs.repository }}/issues/${{ steps.create_issue.outputs.issue_number }} \
                -X PATCH \
                -f state="closed" \
                -f state_reason="completed"
              echo "✅ Closed temporary enhancement issue"

          - name: Verify Enhancement
            run: |
              sleep 3
              UPDATED_DESC=$(gh api repos/${{ inputs.repository }}/pulls/${{ inputs.pr_number }} --jq '.body')
              
              echo "✅ PR description enhancement workflow completed!"
              echo ""
              echo "Updated description preview:"
              echo "$UPDATED_DESC" | head -30
    ```
    </details>

3. Commit and push the workflow file to your repository.

:::tip How it works
This workflow creates a temporary GitHub issue with comprehensive enhancement instructions, assigns it to Copilot via the `auto_assign` label (leveraging your existing Copilot automation), monitors Copilot's work, and cleans up afterward. Copilot analyzes the code changes and updates the original PR description.
:::

</TabItem>

<TabItem value="claude">

This approach uses Claude Code to directly analyze the PR and enhance its description with fine-grained control over the process.

1. In your dedicated workflows repository, create a new file: `.github/workflows/enhance-pr-description-claude.yml`

2. Copy and paste the following workflow:

    <details>
    <summary><b>Claude Code PR enhancement workflow (Click to expand)</b></summary>

    :::note Replace Git Credentials
    Update the `<GIT USERNAME>` and `<GIT USER EMAIL>` fields with appropriate credentials for commit attribution.
    :::

    ```yaml showLineNumbers
    name: Enhance PR Description with Claude Code

    on:
      workflow_dispatch:
        inputs:
          pr_number:
            required: true
            description: "Pull request number"
            type: string
          repository:
            required: true
            description: "Repository in 'owner/repo' format"
            type: string
          port_run_id:
            required: false
            description: "Port run ID for tracking"
            type: string

    permissions:
      contents: read
      pull-requests: write

    jobs:
      enhance-description:
        runs-on: ubuntu-latest
        env:
          GITHUB_TOKEN: ${{ secrets.PORT_GITHUB_TOKEN }}
        steps:
          - name: Get Port Access Token
            id: port_token
            run: |
              TOKEN=$(curl -X POST \
                https://api.getport.io/v1/auth/access_token \
                -H "Content-Type: application/json" \
                -d "{\"clientId\":\"${{ secrets.PORT_CLIENT_ID }}\",\"clientSecret\":\"${{ secrets.PORT_CLIENT_SECRET }}\"}" \
                | jq -r '.accessToken')
              echo "token=$TOKEN" >> $GITHUB_OUTPUT

          - name: Get PR Details and Port Context
            id: pr_details
            run: |
              # Get PR information from GitHub
              PR_DATA=$(gh api repos/${{ inputs.repository }}/pulls/${{ inputs.pr_number }})
              
              CURRENT_DESC=$(echo "$PR_DATA" | jq -r '.body // ""')
              echo "current_description<<EOF" >> $GITHUB_OUTPUT
              echo "$CURRENT_DESC" >> $GITHUB_OUTPUT
              echo "EOF" >> $GITHUB_OUTPUT
              
              echo "pr_title=$(echo "$PR_DATA" | jq -r '.title')" >> $GITHUB_OUTPUT
              echo "pr_author=$(echo "$PR_DATA" | jq -r '.user.login')" >> $GITHUB_OUTPUT
              echo "pr_branch=$(echo "$PR_DATA" | jq -r '.head.ref')" >> $GITHUB_OUTPUT
              
              # Get changed files summary
              CHANGED_FILES=$(gh api repos/${{ inputs.repository }}/pulls/${{ inputs.pr_number }}/files --jq '[.[] | {filename: .filename, status: .status, additions: .additions, deletions: .deletions}]')
              echo "changed_files<<EOF" >> $GITHUB_OUTPUT
              echo "$CHANGED_FILES" >> $GITHUB_OUTPUT
              echo "EOF" >> $GITHUB_OUTPUT
              
              # Get PR entity from Port to fetch related context
              PR_ENTITY=$(curl -s -X POST "https://api.getport.io/v1/blueprints/githubPullRequest/entities/search" \
                -H "Authorization: Bearer ${{ steps.port_token.outputs.token }}" \
                -H "Content-Type: application/json" \
                -d "{\"rules\":[{\"property\":\"\$identifier\",\"operator\":\"=\",\"value\":\"${{ inputs.pr_number }}\"}]}" \
                | jq -r '.entities[0]')
              
              # Extract relation identifiers
              REPO_NAME=$(echo "$PR_ENTITY" | jq -r '.relations.repository // ""')
              echo "repo_name=$REPO_NAME" >> $GITHUB_OUTPUT
              
              PR_TEMPLATE=$(echo "$PR_ENTITY" | jq -r '.relations.prTemplate // ""')
              echo "pr_template=$PR_TEMPLATE" >> $GITHUB_OUTPUT
              
              JIRA_ISSUE=$(echo "$PR_ENTITY" | jq -r '.relations.jiraIssue // ""')
              echo "jira_issue=$JIRA_ISSUE" >> $GITHUB_OUTPUT

          - name: Fetch Optional Context from Port
            id: port_context
            run: |
              # Fetch PR template if available
              if [ -n "${{ steps.pr_details.outputs.pr_template }}" ]; then
                TEMPLATE=$(curl -s -X GET \
                  "https://api.getport.io/v1/blueprints/prTemplate/entities/${{ steps.pr_details.outputs.pr_template }}" \
                  -H "Authorization: Bearer ${{ steps.port_token.outputs.token }}" \
                  | jq -r '.entity.properties.content // ""')
                echo "template_content<<EOF" >> $GITHUB_OUTPUT
                echo "$TEMPLATE" >> $GITHUB_OUTPUT
                echo "EOF" >> $GITHUB_OUTPUT
              fi
              
              # Fetch Jira issue if available
              if [ -n "${{ steps.pr_details.outputs.jira_issue }}" ]; then
                JIRA=$(curl -s -X GET \
                  "https://api.getport.io/v1/blueprints/jiraIssue/entities/${{ steps.pr_details.outputs.jira_issue }}" \
                  -H "Authorization: Bearer ${{ steps.port_token.outputs.token }}" \
                  | jq -r '{key: .entity.identifier, title: .entity.title, description: .entity.properties.description // "N/A"}')
                echo "jira_context<<EOF" >> $GITHUB_OUTPUT
                echo "$JIRA" >> $GITHUB_OUTPUT
                echo "EOF" >> $GITHUB_OUTPUT
              fi
              
              # Fetch service context if available
              if [ -n "${{ steps.pr_details.outputs.repo_name }}" ]; then
                SERVICE=$(curl -s -X GET \
                  "https://api.getport.io/v1/blueprints/service/entities/${{ steps.pr_details.outputs.repo_name }}" \
                  -H "Authorization: Bearer ${{ steps.port_token.outputs.token }}" \
                  | jq -r '{title: .entity.title, description: .entity.properties.description // "N/A", team: .entity.relations.team // []}')
                echo "service_context<<EOF" >> $GITHUB_OUTPUT
                echo "$SERVICE" >> $GITHUB_OUTPUT
                echo "EOF" >> $GITHUB_OUTPUT
              fi

          - name: Checkout PR Repository
            uses: actions/checkout@v4
            with:
              token: ${{ secrets.PORT_GITHUB_TOKEN }}
              repository: ${{ inputs.repository }}
              ref: refs/pull/${{ inputs.pr_number }}/head
              fetch-depth: 0

          - name: Configure Git
            run: |
              git config --global user.name "<GIT USERNAME>"
              git config --global user.email "<GIT USER EMAIL>"

          - name: Create Claude Code Context File
            run: |
              cat > /tmp/claude_context.md << 'EOF'
              You are tasked with enhancing a PR description by analyzing code changes and generating a comprehensive description.
              
              Follow the PR template structure if provided, include business context from Jira if available, explain architectural impact from service context, and provide guidance for reviewers.
              
              Use the view and grep tools to examine code changes. Then use gh CLI to update the PR description.
              EOF
              
              # Append dynamic data
              cat >> /tmp/claude_context.md << EOF
              
              Repository: ${{ inputs.repository }}
              PR Number: ${{ inputs.pr_number }}
              PR Title: ${{ steps.pr_details.outputs.pr_title }}
              PR Author: ${{ steps.pr_details.outputs.pr_author }}
              
              Current Description:
              ${{ steps.pr_details.outputs.current_description }}
              
              Changed Files:
              ${{ steps.pr_details.outputs.changed_files }}
              
              Template:
              ${{ steps.port_context.outputs.template_content || 'Use standard sections: Description, Changes, Testing, Impact, Review Guidance' }}
              
              Jira Context:
              ${{ steps.port_context.outputs.jira_context || 'No Jira issue linked' }}
              
              Service Context:
              ${{ steps.port_context.outputs.service_context || 'No service context' }}
              EOF

          - name: Enhance PR Description with Claude Code
            id: claude_enhancement
            uses: anthropics/claude-code-action@beta
            with:
              anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
              allowed_tools: "Bash(git:*),Bash(gh:*),View,GlobTool,GrepTool"
              system_prompt: |
                You are a senior software engineer writing professional PR descriptions.
                
                Analyze code changes and generate descriptions that:
                1. Follow the PR template (template compliance)
                2. Include business context from Jira (business integration)
                3. Explain architectural fit (architectural context)
                4. Describe change impact (impact analysis)
                5. Guide reviewers (review guidance)
                
                Keep descriptions clear and professional. Do NOT modify code.
              prompt_file: /tmp/claude_context.md

          - name: Verify PR Description Update
            run: |
              sleep 2
              
              UPDATED_DESC=$(gh api repos/${{ inputs.repository }}/pulls/${{ inputs.pr_number }} --jq '.body')
              
              echo "✅ PR description has been enhanced!"
              echo ""
              echo "Updated description preview:"
              echo "$UPDATED_DESC" | head -30

          - name: Update Port Run Status
            if: always()
            run: |
              TOKEN=$(curl -X POST \
                https://api.getport.io/v1/auth/access_token \
                -H "Content-Type: application/json" \
                -d "{\"clientId\":\"${{ secrets.PORT_CLIENT_ID }}\",\"clientSecret\":\"${{ secrets.PORT_CLIENT_SECRET }}\"}" \
                | jq -r '.accessToken')
              
              echo "Port automation tracking enabled"
    ```
    </details>

3. Commit and push the workflow file to your repository.

:::tip How it works
This workflow directly uses Claude Code to analyze the PR code changes, pull context from Port (templates, Jira, services), and generate a comprehensive description that addresses all 5 use cases. Claude has direct access to view files, grep code, and use gh CLI to update the PR description.
:::

</TabItem>

</Tabs>

## Test the workflow

Now let's test the complete workflow to ensure everything works correctly.

<h3> Create a test PR </h3>

1. In a repository integrated with Port, create a new pull request with a minimal description (e.g., just "WIP" or "test").

2. Once the PR is created, it will be synced to Port as a `githubPullRequest` entity.

3. The automation should trigger automatically and invoke the GitHub workflow.

<h3> Verify the enhancement </h3>

1. Go to the [Automations](https://app.getport.io/settings/automations) page and check the run history for the `Enhance PR Description with AI` automation.

2. Click on a run to see the details and check if the GitHub workflow was triggered successfully.

3. Go back to your GitHub PR and refresh the page. The description should now be enhanced with comprehensive information following your PR template.

4. Review the generated description to ensure it:
   - Follows your organization's PR template structure
   - Includes relevant technical details about the changes
   - Provides clear context for reviewers
   - Maintains a professional tone



## Related guides

- [Trigger GitHub Copilot from Port](/guides/all/trigger-github-copilot-from-port) - Set up GitHub Copilot for automated coding tasks
- [Trigger Claude Code from Port](/guides/all/trigger-claude-code-from-port) - Set up self-service Claude Code actions
- [Enrich pull requests using AI](/guides/all/setup-pr-enricher-ai-agent) - Add AI-powered comments to PRs
- [Track AI-driven pull requests](/guides/all/track-ai-driven-pull-requests) - Monitor PRs created by AI coding agents
- [Connect GitHub PR with Jira Issue](/guides/all/connect-github-pr-with-jira-issue) - Link PRs to Jira for business context
- [Manage AI instructions with Port](/guides/all/manage-ai-instructions) - Centralize AI coding guidelines

