---
displayed_sidebar: null
description: Automatically enhance PR descriptions with AI-generated, template-compliant content using Port automations and Claude Code
---

import GithubDedicatedRepoHint from '/docs/guides/templates/github/_github_dedicated_workflows_repository_hint.mdx'

# Auto-enhance PR descriptions with AI

This guide demonstrates how to automatically enhance GitHub pull request descriptions using Port's automation capabilities and Claude Code. When a PR is created with a minimal or empty description, Port triggers Claude Code to analyze the changes and generate a comprehensive, template-compliant description that includes contextual information from your software catalog.


## Common use cases

- **Enforce PR standards**: Automatically generate descriptions that follow your organization's PR template
- **Reduce review time**: Provide comprehensive context upfront for reviewers and AI coding assistants
- **Improve knowledge transfer**: Capture what changed, why it changed, and how it impacts the system
- **Enhance business context**: Link PRs to related services, incidents, deployments, and architectural decisions
- **Accelerate code reviews**: Help human and AI reviewers understand changes faster with complete documentation

## Prerequisites

This guide assumes the following:
- You have a Port account and have completed the [onboarding process](https://docs.port.io/getting-started/overview).
- [Port's GitHub app](/build-your-software-catalog/sync-data-to-catalog/git/github/) is installed in your account.
- You have an Anthropic API key for Claude Code access.
- You have a GitHub Personal Access Token with repository permissions.

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

Update the GitHub pull request mapping to connect PRs to their templates.

1. In the same GitHub integration mapping, locate the `pull-request` kind section.
2. Add the `prTemplate` relation to the `relations` section:

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
    ```
    </details>

3. Click `Save` to update the configuration.

## Add required secrets

### Add GitHub repository secrets

In your dedicated workflows repository, [go to **Settings > Secrets**](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository) and add the following secrets:

- `PORT_GITHUB_TOKEN`: A [GitHub fine-grained personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-fine-grained-personal-access-token) with **Read and Write** permissions for **Contents**, **Issues**, **Metadata**, and **Pull requests**.
- `ANTHROPIC_API_KEY`: Your Anthropic API key for Claude Code access.
- `PORT_CLIENT_ID` (Optional): Your Port Client ID for tracking enhancement metrics [learn more](/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token).
- `PORT_CLIENT_SECRET` (Optional): Your Port Client Secret [learn more](/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token).

## Create Port automation

This automation will trigger when a new pull request is created in Port, and it will invoke the GitHub workflow to enhance the PR description.

1. Go to the [Automations](https://app.getport.io/settings/automations) page of your portal.
2. Click on `+ Automation`.
3. Copy and paste the following JSON schema:

    <details>
    <summary><b>PR description enhancement automation (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "enhance_pr_description",
      "title": "Enhance PR Description with AI",
      "description": "Automatically enhance PR descriptions using Claude Code when a new PR is created",
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
          "pr_entity_identifier": "{{ .event.diff.after.identifier }}",
          "pr_template": "{{ .event.diff.after.relations.prTemplate }}",
          "service": "{{ .event.diff.after.relations.repository }}",
          "port_context": {
            "blueprint": "{{ .event.context.blueprint }}",
            "entity": "{{ .event.context.entityIdentifier }}"
          }
        },
        "reportWorkflowStatus": true
      },
      "publish": true
    }
    ```

    :::info Replace placeholders
    - Replace `<GITHUB_ORG>` with your GitHub organization name
    - Replace `<GITHUB_WORKFLOWS_REPO>` with your dedicated workflows repository name
    :::

    :::tip Conditional triggers
    You can customize the trigger condition to only enhance PRs that:
    - Have empty descriptions: Add `(.diff.after.properties.description | length) == 0`
    - Are from specific repositories: Add `.diff.after.relations.repository == "my-repo"`
    - Have specific labels: Add `.diff.after.properties.labels | contains(["needs-description"])`
    :::

    </details>

4. Click `Create` to save the automation.

## Create GitHub workflow

Now let's create the workflow that will use Claude Code to analyze the PR and enhance its description.

<GithubDedicatedRepoHint/>

1. In your dedicated workflows repository, create a new file: `.github/workflows/enhance-pr-description.yml`

2. Copy and paste the following workflow:

    <details>
    <summary><b>PR description enhancement workflow (Click to expand)</b></summary>

    :::note Replace Git Credentials
    Update the `<GIT USERNAME>` and `<GIT USER EMAIL>` fields with appropriate credentials for commit attribution.
    :::

    ```yaml showLineNumbers
    name: Enhance PR Description with AI

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
          pr_entity_identifier:
            required: true
            description: "Port entity identifier for the PR"
            type: string
          pr_template:
            required: false
            description: "PR template entity identifier"
            type: string
          service:
            required: false
            description: "Related service identifier"
            type: string
          port_context:
            required: false
            description: "Additional Port context"
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
          - name: Get PR Details
            id: pr_details
            run: |
              # Get PR information
              PR_DATA=$(gh api repos/${{ inputs.repository }}/pulls/${{ inputs.pr_number }})
              
              # Extract current description
              CURRENT_DESC=$(echo "$PR_DATA" | jq -r '.body // ""')
              
              echo "current_description<<EOF" >> $GITHUB_OUTPUT
              echo "$CURRENT_DESC" >> $GITHUB_OUTPUT
              echo "EOF" >> $GITHUB_OUTPUT
              
              # Get PR author
              PR_AUTHOR=$(echo "$PR_DATA" | jq -r '.user.login')
              echo "pr_author=$PR_AUTHOR" >> $GITHUB_OUTPUT
              
              # Get changed files
              CHANGED_FILES=$(gh api repos/${{ inputs.repository }}/pulls/${{ inputs.pr_number }}/files --jq '[.[] | {filename: .filename, status: .status, additions: .additions, deletions: .deletions}]')
              
              echo "changed_files<<EOF" >> $GITHUB_OUTPUT
              echo "$CHANGED_FILES" >> $GITHUB_OUTPUT
              echo "EOF" >> $GITHUB_OUTPUT

          - name: Get PR Template from Port
            if: ${{ inputs.pr_template != '' }}
            id: get_template
            run: |
              # Get Port access token
              TOKEN=$(curl -X POST \
                https://api.getport.io/v1/auth/access_token \
                -H "Content-Type: application/json" \
                -d "{\"clientId\":\"${{ secrets.PORT_CLIENT_ID }}\",\"clientSecret\":\"${{ secrets.PORT_CLIENT_SECRET }}\"}" \
                | jq -r '.accessToken')
              
              # Get PR template entity
              TEMPLATE_DATA=$(curl -X GET \
                "https://api.getport.io/v1/blueprints/prTemplate/entities/${{ inputs.pr_template }}" \
                -H "Authorization: Bearer $TOKEN" \
                | jq -r '.entity.properties.content // ""')
              
              echo "template_content<<EOF" >> $GITHUB_OUTPUT
              echo "$TEMPLATE_DATA" >> $GITHUB_OUTPUT
              echo "EOF" >> $GITHUB_OUTPUT

          - name: Get Service Context from Port
            if: ${{ inputs.service != '' && secrets.PORT_CLIENT_ID != '' }}
            id: get_service
            run: |
              # Get Port access token
              TOKEN=$(curl -X POST \
                https://api.getport.io/v1/auth/access_token \
                -H "Content-Type: application/json" \
                -d "{\"clientId\":\"${{ secrets.PORT_CLIENT_ID }}\",\"clientSecret\":\"${{ secrets.PORT_CLIENT_SECRET }}\"}" \
                | jq -r '.accessToken')
              
              # Get service entity
              SERVICE_DATA=$(curl -X GET \
                "https://api.getport.io/v1/blueprints/service/entities/${{ inputs.service }}?include=relations" \
                -H "Authorization: Bearer $TOKEN")
              
              SERVICE_SUMMARY=$(echo "$SERVICE_DATA" | jq -r '{
                title: .entity.title,
                description: .entity.properties.description // "N/A",
                language: .entity.properties.language // "N/A",
                team: .entity.relations.team // [],
                incidents: .entity.relations.incident // []
              }')
              
              echo "service_context<<EOF" >> $GITHUB_OUTPUT
              echo "$SERVICE_SUMMARY" >> $GITHUB_OUTPUT
              echo "EOF" >> $GITHUB_OUTPUT

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

          - name: Enhance PR Description with Claude Code
            id: claude_enhancement
            uses: anthropics/claude-code-action@beta
            with:
              anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
              allowed_tools: "Bash(git:*),Bash(gh:*),View,GlobTool,GrepTool"
              system_prompt: |
                You are a senior software engineer tasked with writing comprehensive, professional pull request descriptions.
                
                Your goal is to analyze the code changes and generate a description that follows the organization's PR template.
                
                Guidelines:
                - Follow the PR template structure provided
                - Analyze file changes to understand what was modified
                - Keep descriptions clear, concise, and professional
                - Include technical details about the implementation
                - Mention any breaking changes or migration notes
                - Do NOT make any code changes or commits
                - Focus ONLY on analyzing and describing the changes
                
                Output format:
                - Return ONLY the enhanced PR description in markdown format
                - Do not include explanations or meta-commentary
                - The description should be ready to use as-is
              prompt: |
                Please analyze this pull request and generate a comprehensive description following the template below.
                
                **PR Information:**
                - PR #${{ inputs.pr_number }} in ${{ inputs.repository }}
                - Author: ${{ steps.pr_details.outputs.pr_author }}
                - Current description: ${{ steps.pr_details.outputs.current_description }}
                
                **Changed Files:**
                ${{ steps.pr_details.outputs.changed_files }}
                
                **PR Template to Follow:**
                ${{ steps.get_template.outputs.template_content || '## Description\n\nDescribe what this PR accomplishes.\n\n## Changes\n\n- List key changes\n\n## Testing\n\nDescribe how this was tested.' }}
                
                **Service Context:**
                ${{ steps.get_service.outputs.service_context || 'No service context available' }}
                
                **Instructions:**
                1. Use `view` and `grep` tools to examine the changed files and understand the modifications
                2. Analyze the code changes to determine what was implemented
                3. Generate a comprehensive PR description following the template structure
                4. Use `gh pr edit ${{ inputs.pr_number }} --repo ${{ inputs.repository }} --body "<description>"` to update the PR description
                
                Remember: Only analyze and describe the changes. Do not modify any code.

          - name: Verify PR Description Update
            run: |
              # Wait a moment for the update to propagate
              sleep 2
              
              # Get updated PR description
              UPDATED_DESC=$(gh api repos/${{ inputs.repository }}/pulls/${{ inputs.pr_number }} --jq '.body')
              
              echo "✅ PR description has been enhanced!"
              echo ""
              echo "Updated description preview:"
              echo "$UPDATED_DESC" | head -20

          - name: Update Port Run Status
            if: always() && secrets.PORT_CLIENT_ID != ''
            run: |
              # Get Port access token
              TOKEN=$(curl -X POST \
                https://api.getport.io/v1/auth/access_token \
                -H "Content-Type: application/json" \
                -d "{\"clientId\":\"${{ secrets.PORT_CLIENT_ID }}\",\"clientSecret\":\"${{ secrets.PORT_CLIENT_SECRET }}\"}" \
                | jq -r '.accessToken')
              
              # Report back to Port (this is handled automatically by reportWorkflowStatus)
              echo "Port automation tracking enabled"
    ```
    </details>

3. Commit and push the workflow file to your repository.

## Test the workflow

Now let's test the complete workflow to ensure everything works correctly.

### Create a test PR

1. In a repository integrated with Port, create a new pull request with a minimal description (e.g., just "WIP" or "test").

2. Once the PR is created, it will be synced to Port as a `githubPullRequest` entity.

3. The automation should trigger automatically and invoke the GitHub workflow.

### Verify the enhancement

1. Go to the [Automations](https://app.getport.io/settings/automations) page and check the run history for the `Enhance PR Description with AI` automation.

2. Click on a run to see the details and check if the GitHub workflow was triggered successfully.

3. Go back to your GitHub PR and refresh the page. The description should now be enhanced with comprehensive information following your PR template.

4. Review the generated description to ensure it:
   - Follows your organization's PR template structure
   - Includes relevant technical details about the changes
   - Provides clear context for reviewers
   - Maintains a professional tone

### Example enhanced description

Here's an example of what an AI-enhanced PR description might look like:

```markdown
## Description

This pull request implements a new caching layer for the user authentication service to improve response times and reduce database load during peak traffic periods.

## Changes

- Added Redis-based session caching with configurable TTL
- Implemented cache invalidation logic for user profile updates
- Added monitoring metrics for cache hit/miss rates
- Updated authentication middleware to check cache before database
- Added integration tests for caching behavior

## Technical Details

The implementation uses Redis as the caching backend with a default TTL of 30 minutes. The cache key structure follows the pattern `auth:session:{userId}` to enable efficient lookups and targeted invalidation.

## Testing

- Unit tests added for cache service methods (95% coverage)
- Integration tests verify cache behavior during authentication flow
- Load testing shows 40% reduction in database queries during peak load
- Manual testing performed with cache failures to verify fallback behavior

## Related Context

- Service: `user-authentication-service`
- Team: `@platform-team`
- Related incident: No recent incidents on this service
```

## Best practices

To get the most out of your PR description enhancement automation:

1. **Start simple**: Begin with basic template compliance and gradually add more context sources as you refine the prompts.

2. **Customize the template**: Ensure your PR template in `.github/pull_request_template.md` includes all the sections important to your team (description, testing, breaking changes, etc.).

3. **Monitor token usage**: Track Claude Code's token consumption and costs, especially during high PR volume periods.

4. **Iterate on prompts**: Regularly review generated descriptions and refine the system prompt based on team feedback and quality.

5. **Handle edge cases**: Consider adding conditions to skip enhancement for:
   - Draft PRs that developers are still working on
   - PRs with already comprehensive descriptions
   - Automated dependency update PRs (like Dependabot)

6. **Preserve manual edits**: If a developer manually updates the description after enhancement, consider skipping re-enhancement on subsequent commits.

7. **Add approval gates**: For critical repositories, consider requiring manual approval before applying AI-generated descriptions.

## Possible enhancements

You can further enhance this setup by:

### Link to issue tracking systems

Add Jira or Linear integration to pull business context from related issues:

```yaml
# In the workflow, add a step to fetch Jira issue details
- name: Get Jira Context
  if: contains(github.event.pull_request.body, 'JIRA-')
  run: |
    # Extract Jira issue key and fetch details
    # Pass to Claude for business context inclusion
```

### Pull related PR discussions

Include context from related PRs or previous discussions:

```yaml
# Add to Claude's prompt
**Related PRs:**
- Check for PRs that modified similar files
- Include links to architectural decision records (ADRs)
```

### Add architectural context

Enhance descriptions with service architecture information from Port:

```yaml
# Fetch architecture documentation from Port
- name: Get Architecture Context
  run: |
    # Query Port for service dependencies, APIs, and design docs
    # Pass to Claude for architectural context
```

### Create quality scorecards

Track PR description quality over time with Port scorecards:

```json
{
  "identifier": "pr_description_quality",
  "title": "PR Description Quality",
  "rules": [
    {
      "identifier": "has_description",
      "title": "Has comprehensive description",
      "level": "Gold",
      "query": {
        "combinator": "and",
        "conditions": [
          {
            "property": "description",
            "operator": "isNotEmpty"
          },
          {
            "property": "description",
            "operator": "contains",
            "value": "## Description"
          }
        ]
      }
    }
  ]
}
```

### Customize by PR type

Generate different descriptions based on PR type (feature, bugfix, docs, refactor):

```yaml
# In the automation condition, detect PR type from branch name or labels
# Pass PR type to workflow for customized prompts
```

## Related guides

- [Enrich pull requests using AI](/guides/all/setup-pr-enricher-ai-agent) - Add AI-powered comments to PRs
- [Track AI-driven pull requests](/guides/all/track-ai-driven-pull-requests) - Monitor PRs created by AI coding agents
- [Trigger Claude Code from Port](/guides/all/trigger-claude-code-from-port) - Set up self-service Claude Code actions
- [Manage AI instructions with Port](/guides/all/manage-ai-instructions) - Centralize AI coding guidelines

