---
displayed_sidebar: null
description: Set up a Pull Request Enricher AI agent to automatically comment on pull requests with additional context
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Set up the Pull Request Enricher AI agent

## Overview

This guide will walk you through setting up a "Pull Request Enricher" AI agent in Port.  
By the end of this guide, your developers will receive automated, contextual comments on their pull requests to help streamline the review process.


## Common use cases

- Automatically comment on new pull requests with risk assessment
- Provide code change summaries for reviewers
- Highlight potential areas of concern
- Suggest relevant reviewers based on code changes

## Prerequisites

This guide assumes you have:
- A Port account with the [AI agents feature enabled](/ai-agents/overview#access-to-the-feature).
- Appropriate permissions to create and configure AI agents.
- [GitHub integration](/build-your-software-catalog/sync-data-to-catalog/git/github/) configured in your Port instance.

## Set up data model

First, we'll need to create the Pull Request Enricher AI agent in Port.  
We will need to configure:
- The data sources it will use to analyze pull requests.
- The agent configuration that defines its capabilities.
- An automation to trigger the agent when new pull requests are opened.

### Configure data source access

For this guide, we will be using **GitHub** as our data source to provide comprehensive pull request analysis capabilities.
Make sure you have [Port's GitHub app](/build-your-software-catalog/sync-data-to-catalog/git/github/) installed and configured.

:::info Additional data sources
While this guide uses GitHub, you can enhance the agent's capabilities by adding other data sources like:
- Jira for linking related tickets
- PagerDuty for checking active incidents
- Your software catalog services for broader context
:::

### Create the agent configuration

1. Go to the [AI Agents](https://app.getport.io/_ai_agents) page of your portal
2. Click on `+ AI Agent`
3. Toggle `Json mode` on
4. Copy and paste the following JSON schema:

   <details>
   <summary><b>Pull Request Enricher agent configuration (Click to expand)</b></summary>

   ```json
   {
     "identifier": "pr_assistant_ai_agent",
     "title": "PR Review Assistant",
     "icon": "Pipeline",
     "properties": {
       "description": "Comment on open PRs with additional context to assist developers",
       "status": "active",
       "allowed_blueprints": [
         "githubPullRequest",
         "githubRepository",
         "githubUser",
         "_user",
         "_team"
       ],
       "prompt": "You are an experienced Technical Engineering Team Lead. Your job is to enrich pull requests with helpful context for reviewers. Based on the linked Jira issue, the author, and their team, write a short risk assessment: what's changed, what could break, and anything worth a second look. Add fun, clear emojis (✅🟡🔴, etc.) to highlight risk levels. No need to be exact—just provide quick, useful insights to speed up review.",
       "execution_mode": "Automatic"
     }
   }
   ```
   </details>

5. Click on `Create` to save the agent

### Create the automations

We'll need two automations:
1. One to trigger the AI agent when a PR is opened
2. Another to post the agent's response as a comment

#### Trigger PR enricher AI agent

1. Go to the [Automations](https://app.getport.io/automations) page
2. Click on `+ Automation`
3. Copy and paste the following JSON schema:

   <details>
   <summary><b>PR Enricher agent trigger automation (Click to expand)</b></summary>

   ```json
   {
     "identifier": "pr_opened_to_agent",
     "title": "Upon PR opened, trigger PR Assistant",
     "description": "Automation to trigger PR Assistant when a new PR is opened",
     "trigger": {
       "type": "automation",
       "event": {
         "type": "ANY_ENTITY_CHANGE",
         "blueprintIdentifier": "githubPullRequest"
       },
       "condition": {
         "type": "JQ",
         "expressions": [
           ".diff.before == null",
           ".diff.after.status == \"open\""
         ],
         "combinator": "and"
       }
     },
     "invocationMethod": {
       "type": "WEBHOOK",
       "url": "https://api.getport.io/v1/agent/pr_assistant_ai_agent/invoke",
       "synchronized": true,
       "body": {
         "prompt": "A new pull request has been opened. Please analyze it and provide a risk assessment. \n## PR Details\nTitle: {{ .event.diff.properties.title }}\nDescription: {{ .event.diff.properties.description }}\nRepository: {{ .event.diff.properties.repository }}\nAuthor: {{ .event.diff.properties.author }}",
         "labels": {
           "source": "Automation"
         }
       }
     },
     "publish": true
   }
   ```
   </details>

4. Click on `Create` to save the automation

#### Post PR enricher AI agent response on GitHub

1. Go back to the [Automations](https://app.getport.io/automations) page
2. Click on `+ Automation`
3. Copy and paste the following JSON schema:

   <details>
   <summary><b>Post PR comment from agent response automation (Click to expand)</b></summary>

        ```json showLineNumbers
        {
        "identifier": "post_pr_comment",
        "title": "Post PR comment from agent response",
        "description": "Automation to post the agent's response as a PR comment",
        "trigger": {
            "type": "automation",
            "event": {
            "type": "ANY_ENTITY_CHANGE",
            "blueprintIdentifier": "githubPullRequest"
            },
            "condition": {
            "type": "JQ",
            "expressions": [
                ".diff.after.properties.ai_agent_response != null",
                ".diff.after.properties.ai_agent == \"pr_assistant_ai_agent\""
            ],
            "combinator": "and"
            }
        },
        "invocationMethod": {
            "type": "WEBHOOK",
            "url": "https://api.github.com/repos/{{ .event.diff.properties.organization }}/{{ .event.diff.properties.repository }}/actions/workflows/post-pr-comment.yml/dispatches",
            "method": "POST",
            "headers": {
            "Accept": "application/vnd.github+json",
            "Authorization": "Bearer {{ .secrets.GITHUB_TOKEN }}",
            "Content-Type": "application/json"
            },
            "body": {
            "ref": "main",
            "inputs": {
                "comment": "{{ .event.diff.after.properties.ai_agent_response }}",
                "repo": "{{ .event.diff.properties.organization }}/{{ .event.diff.properties.repository }}",
                "pr": "{{ .event.diff.properties.number }}"
            }
            }
        },
        "publish": true
        }
        ```
   </details>
4. Click on `Create` to save the automation

### Create the GitHub workflow

Create a workflow file in your repository to comment on pull requests. 
This workflow will run when triggered by the automation.

1. Create a new file at `.github/workflows/post-pr-comment.yml`
2. Copy and paste the following workflow configuration:

   <details>
   <summary><b>Post PR comment workflow (Click to expand)</b></summary>

        ```yaml showLineNumbers
        name: Comment on PR

        on:
        workflow_dispatch:
            inputs:
            comment:
                description: 'The comment text to post'
                required: true
                type: string
            repo:
                description: 'Repository in "owner/repo" format (e.g., port-labs/port)'
                required: true
                type: string
            pr:
                description: 'Pull request number'
                required: true
                type: string

        jobs:
        comment:
            runs-on: ubuntu-latest
            permissions:
                issues: write
                pull-requests: write
            steps:
                - name: Comment on PR
                    uses: actions/github-script@v7
                    with:
                        github-token: ${{ secrets.GITHUB_TOKEN }}
                        script: |
                            const [owner, repo] = context.payload.inputs.repo.split('/');
                            await github.rest.issues.createComment({
                                owner,
                                repo,
                                issue_number: parseInt(context.payload.inputs.pr),
                                body: context.payload.inputs.comment
                            });
        ```
   </details>

:::tip Permissions
This workflow uses the default `GITHUB_TOKEN` which is automatically provided by GitHub Actions. Make sure your repository's Actions permissions allow writing to pull requests.
You can configure this in your repository's Settings > Actions > General > Workflow permissions.
:::

## Example responses

The PR Enricher agent will automatically comment on new pull requests with information like:

```markdown
🔍 **Risk Assessment for PR #123**

🟢 **Low Risk Changes**
- Minor UI updates to the login page
- No database schema changes

⚠️ **Areas to Review**
- Changes to authentication flow
- New environment variables added

🔗 **Related Services**
- [Auth Service](https://app.getport.io/services/auth-service)
- [User Management](https://app.getport.io/services/user-management)

👥 **Suggested Reviewers**
- @security-team for auth changes
- @frontend-team for UI updates

💡 **Tips**
- Consider adding tests for the new auth flow
- Update documentation for new env vars
```

## Best practices

To get the most out of your PR Enricher agent:

1. **Start with basic assessment**: Begin with simple risk assessment and gradually add more context as you see how the agent performs.

2. **Monitor responses**: Regularly review the agent's comments to ensure they're helpful and accurate.

3. **Iterate on the prompt**: Refine the prompt based on the quality of responses and specific needs of your team.

4. **Test the workflow**: Create test pull requests to verify the entire flow works as expected.

5. **Troubleshoot**: If you're not getting the expected results, check our [troubleshooting guide](/ai-agents/interact-with-the-ai-agent#troubleshooting--faq) for common issues and solutions.

## Possible enhancements

You can further enhance the PR Enricher setup by:

- **Integration expansion**: [Add more data sources](/ai-agents/build-an-ai-agent#step-2-configure-data-access) like:
  - Jira for linking related tickets
  - PagerDuty for checking active incidents
  - GitLab or Azure DevOps for additional PR context

- **Automated actions**: [Configure the agent](/ai-agents/interact-with-the-ai-agent#actions-and-automations) to:
  - Automatically assign reviewers based on code changes
  - Add relevant labels to the PR
  - Create related Jira tickets for follow-up tasks

- **Custom risk assessment**: Enhance the agent's prompt to:
  - Include organization-specific risk factors
  - Consider team-specific guidelines
  - Reference internal documentation

- **Monitor and improve**: [Check how your developers are interacting](/ai-agents/interact-with-the-ai-agent#ai-interaction-details) with the agent and:
  - Gather feedback on the quality of comments
  - Track which suggestions are most helpful
  - Adjust the prompt based on real usage patterns 

