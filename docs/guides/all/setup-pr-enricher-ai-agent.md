---
displayed_sidebar: null
description: Set up a Pull Request Enricher AI agent to automatically comment on pull requests with additional context
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Set up a Pull Request Enricher AI agent

## Overview

This guide will walk you through enriching pull requests using our AI agents to boost your developers' productivity and reduce the time to review a PR. 
By the end of this guide, developers will have summarized organizational context on their PRs, allowing faster review time.

<img src="/img/ai-agents/AIAgentPREnricherPage.png" width="100%" border="1px" />

## Common use cases

- Automatically comment on new pull requests with risk assessment.
- Provide additional context about related services and components.
- Alert about potential impacts on production systems.
- Suggest relevant reviewers based on code changes.

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

For this guide, we will be using **GitHub** as our primary data source, along with related services and components in your software catalog.

Make sure you have:
- [Port's GitHub app](/build-your-software-catalog/sync-data-to-catalog/git/github/) installed and configured.
- Your services and components properly mapped in Port.

### Create the agent configuration

1. Go to the [AI Agents](https://app.getport.io/_ai_agents) page of your portal.
2. Click on `+ AI Agent`.
3. Toggle `Json mode` on.
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
         "service",
         "githubPullRequest",
         "pagerdutyIncident",
         "jiraIssue",
         "_user",
         "_team"
       ],
       "prompt": "You are an experienced Technical Engineering Team Lead. Your primary function is to generate risk assessment. If you can, add emojis (green, yellow, red, and more for fun) 😃 Don't try to be precise, just put what you can.",
       "execution_mode": "Automatic"
     }
   }
   ```
   </details>

5. Click on `Create` to save the agent

### Create the automation

To automatically trigger the agent when a new pull request is opened, create a new automation:

1. Go to the [Automations](https://app.getport.io/automations) page.
2. Click on `+ Automation`.
3. Toggle `Json mode` on.
4. Copy and paste the following JSON schema:

   <details>
   <summary><b>Pull Request Enricher automation configuration (Click to expand)</b></summary>

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

5. Click on `Create` to save the automation

### Add a GitHub workflow

To ensure the agent is triggered when a pull request is opened, you'll need to add a GitHub workflow.   
This workflow will notify Port about the new pull request, which will then trigger the automation we just created.

1. In your repository, create a new workflow file at `.github/workflows/pr-enricher.yml`
2. Copy and paste the following workflow configuration:

   <details>
   <summary><b>GitHub workflow configuration (Click to expand)</b></summary>

   ```yaml
   name: PR Enricher
   
   on:
     pull_request:
       types: [opened, reopened]
   
   jobs:
     notify-port:
       runs-on: ubuntu-latest
       steps:
         - name: Notify Port about PR
           uses: getport/port-action@v1
           with:
             clientId: ${{ secrets.PORT_CLIENT_ID }}
             clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
             blueprint: githubPullRequest
             identifier: ${{ github.event.pull_request.number }}
             properties: |
               {
                 "title": "${{ github.event.pull_request.title }}",
                 "description": "${{ github.event.pull_request.body }}",
                 "repository": "${{ github.repository }}",
                 "author": "${{ github.event.pull_request.user.login }}",
                 "status": "open",
                 "url": "${{ github.event.pull_request.html_url }}"
               }
   ```
   </details>

3. Add the following secrets to your repository:
   - `PORT_CLIENT_ID`: Your Port client ID
   - `PORT_CLIENT_SECRET`: Your Port client secret

This workflow will:
1. Run whenever a pull request is opened or reopened
2. Use the Port GitHub Action to create/update a pull request entity in Port
3. The automation we created earlier will detect this change and trigger the AI agent
4. The agent will analyze the pull request and provide its assessment

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