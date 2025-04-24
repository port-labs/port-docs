---
displayed_sidebar: null
description: Set up a Pull Request Enricher AI agent to automatically comment on pull requests with additional context
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import GithubDedicatedRepoHint from '/docs/guides/templates/github/_github_dedicated_workflows_repository_hint.mdx'

# Set up the Pull Request Enricher AI agent

## Overview

This guide will walk you through setting up a "Pull Request Enricher" AI agent in Port.  
By the end of this guide, your developers will receive automated, contextual comments on their pull requests to help streamline the review process.

<img src="/img/ai-agents/AIAgentPREnrichierGitHubComment.png" border="1px" />






## Common use cases

- Automatically comment on new pull requests with assessments based on PR metadata
- Highlight potential areas of concern
- Provide context from related Jira tickets directly in the PR comments
- Suggest relevant reviewers based on code changes

## Prerequisites

This guide assumes you have:
- A Port account with the [AI agents feature enabled](/ai-agents/overview#access-to-the-feature).
- Appropriate permissions to create and configure AI agents.
- [GitHub integration](/build-your-software-catalog/sync-data-to-catalog/git/github/) configured in your Port instance.
- [Jira integration](/build-your-software-catalog/sync-data-to-catalog/project-management/jira/) configured in your Port instance.

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

   ```json showLineNumbers
   {
     "identifier": "pr_assistant_ai_agent",
     "title": "PR Review Assistant",
     "description": "AI agent that analyzes pull requests and provides helpful context for reviewers",
     "icon": "Pipeline",
     "properties": {
       "description": "Comment on open PRs with additional context to assist developers",
       "status": "active",
       "allowed_blueprints": [
         "githubPullRequest",
         "githubRepository",
         "githubUser",
         "jiraIssue",
         "_user",
         "_team"
       ],
       "prompt": "Analyze pull request details and provide a structured review in the following format:\n\nPR Description:\n Summarize the PR description and key properties in one sentence \n\nKey Points:\n{{ List up to 3 key insights about the changes }}\n\nObservations:\nProvide up to 3 observations using 🟢 for low risk, 🟡 for medium risk, and 🔴 for high risk\n\nRecommendations:\nList up to 3 optional recommendations for improvement.provide this in markdown form",
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

    ```json showLineNumbers
    {
      "identifier": "pr_opened_to_agent",
      "title": "Upon PR opened, trigger PR Assistant",
      "description": "Automation to trigger PR Assistant when a new PR is opened",
      "trigger": {
        "type": "automation",
        "event": {
          "type": "ENTITY_CREATED",
          "blueprintIdentifier": "githubPullRequest"
        },
        "condition": {
          "type": "JQ",
          "expressions": [
            ".diff.after.properties.status == \"open\""
          ],
          "combinator": "and"
        }
      },
      "invocationMethod": {
        "type": "WEBHOOK",
        "url": "https://api.getport.io/v1/agent/pr_review_assistant/invoke",
        "synchronized": true,
        "body": {
          "prompt": "Analyze the pull request with identifier '{{ .event.diff.after.properties.prNumber }}' and provide a structured review in the following format:\n\nPR Description:\n Summarize the PR description and key properties in one sentence \n\nKey Points:\n{{ List up to 3 key insights about the changes }}\n\nObservations:\nProvide up to 3 observations using 🟢 for low risk, 🟡 for medium risk, and 🔴 for high risk\n\nRecommendations:\nList up to 3 optional recommendations for improvement.provide this in a markdown form",
          "labels": {
            "source": "Automation",
            "prNumber": "{{ .event.diff.after.properties.prNumber }}",
            "repo": "{{ .event.diff.after.relations.repository }} "
          }
        }
      },
      "publish": true
    }
    ```
  </details>

4. Click on `Create` to save the automation

#### Post PR enricher AI agent response on GitHub

This automation requires a GitHub Personal Access Token (PAT) with `repo` scope to post comments on pull requests. Store this token as a secret in Port.

1. **Create GitHub PAT:** Follow GitHub's guide to [create a fine-grained personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-fine-grained-personal-access-token) with **Read and Write** permissions for **Pull requests** for the repositories you want the agent to comment on.

2. **Add Secret to Port:**
   - Go to the [Secrets page](https://app.getport.io/secrets) in your Port application.
   - Click `+ Create Secret`.
   - Set the `Key` to `GITHUB_TOKEN`.
   - Paste your GitHub PAT into the `Value` field.
   - Click `Create`.

3. Go back to the [Automations](https://app.getport.io/automations) page
4. Click on `+ Automation`
5. Copy and paste the following JSON schema:
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
         "type": "ENTITY_CREATED",
         "blueprintIdentifier": "_ai_invocations"
       },
       "condition": {
         "type": "JQ",
         "expressions": [
           ".event.diff.after.relations.agent == \"pr_review_assistant\"",
           ".event.diff.after.properties.status == \"Completed\""
         ],
         "combinator": "and"
       }
     },
     "invocationMethod": {
       "type": "WEBHOOK",
       "url": "https://api.github.com/repos/<YOUR_GITHUB_ORG>/<YOUR_GITHUB_REPO>/actions/workflows/post-pr-comment.yml/dispatches",
       "method": "POST",
       "headers": {
         "Accept": "application/vnd.github+json",
         "Authorization": "Bearer {{ .secrets.GITHUB_TOKEN }}",
         "Content-Type": "application/json"
       },
       "body": {
         "ref": "main",
         "inputs": {
           "comment": "{{ .event.diff.after.properties.response }}",
           "pr": "{{ .event.diff.after.properties.prNumber }}",
           "repo": "{{ .event.diff.after.relations.repository }}"
         }
       }
     },
     "publish": true
   }
   ```

   </details>

  :::info Replace Placeholders
  Make sure to replace 'YOUR_GITHUB_ORG' and 'YOUR_GITHUB_REPO' in the `url` field above with the actual organization and repository where your `post-pr-comment.yml` workflow resides.
  :::

6. Click on `Create` to save the automation

### Create the GitHub workflow

Now let's create the workflow file that contains the logic to post the comment.   

<GithubDedicatedRepoHint/>

In your dedicated workflow repository, ensure you have a `.github/workflows` directory.
1. Create a new file named `post-pr-comment.yml`  
2. Copy and paste the following snippet:
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
                  description: 'Repository in "owner/repo" format (e.g., port-labs/puddle-integrations)'
                  required: true
                  type: string
                pr:
                  description: 'Pull request number'
                  required: true
                  type: string

          jobs:
            comment:
              runs-on: ubuntu-latest
              steps:
                - name: Set up Python
                  uses: actions/setup-python@v4
                  with:
                    python-version: '3.x'

                - name: Install Python dependencies
                  run: |
                    pip install PyJWT requests cryptography

                - name: Comment on PR using GitHub App
                  env:
                    PEM: ${{ secrets.PORT_GITHUB_APP_PEM }}
                    APP_ID: ${{ secrets.PORT_GITHUB_APP_ID }}
                    INSTALLATION_ID: ${{ secrets.PORT_GITHUB_APP_INSTALLATION_ID }}
                    COMMENT: ${{ github.event.inputs.comment }}
                    REPO: ${{ github.event.inputs.repo }}
                    PR_NUMBER: ${{ github.event.inputs.pr }}
                  run: |
                    python - <<'EOF'
                    import os, time, jwt, requests

                    # Load environment variables
                    pem = os.environ['PEM']
                    app_id = os.environ['APP_ID']
                    installation_id = os.environ['INSTALLATION_ID']
                    comment = os.environ['COMMENT']
                    repo = os.environ['REPO']
                    pr_number = os.environ['PR_NUMBER']

                    # Generate JWT (valid for 10 minutes)
                    now = int(time.time())
                    payload = {
                        'iat': now - 60,
                        'exp': now + (10 * 60),
                        'iss': app_id
                    }
                    jwt_token = jwt.encode(payload, pem, algorithm='RS256')

                    # Obtain an installation access token
                    headers = {
                        'Authorization': f'Bearer {jwt_token}',
                        'Accept': 'application/vnd.github+json'
                    }
                    token_url = f"https://api.github.com/app/installations/{installation_id}/access_tokens"
                    resp = requests.post(token_url, headers=headers)
                    resp.raise_for_status()
                    token = resp.json()['token']

                      # Comment on the pull request (PRs are issues in GitHub API)
                      owner, repo_name = repo.split('/')
                      comment_url = f"https://api.github.com/repos/{owner}/{repo_name}/issues/{pr_number}/comments"
                      comment_payload = {"body": comment}
                      headers = {
                          'Authorization': f'Bearer {token}',
                          'Accept': 'application/vnd.github.v3+json',
                          'Content-Type': 'application/json'
                      }
                      resp = requests.post(comment_url, headers=headers, json=comment_payload)
                      resp.raise_for_status()
                      print("Comment posted successfully!")
                      EOF
        ```
      </details>

3. Commit and push the changes to your repository

## Example responses

The PR Enricher agent will automatically comment on new pull requests with information like:

```markdown
## Pull Request Review: Test case with PR Enricher AI Agent 009

### PR Details
- **Title**: Test case with PR Enricher AI Agent 009
- **Status**: Open
- **PR Number**: 2477563661
- **Repository**: [Awesome-Service](https://app.getport.io/githubRepositoryEntity?identifier=kodjomiles%2FAwesome-Service)
- **Link**: [GitHub PR #11](https://github.com/kodjomiles/Awesome-Service/pull/11)
- **Creator**: [Jaden Miles](https://app.getport.io/_userEntity?identifier=jaden.m%2B1%40getport.io)
- **Assignees**: [Jaden Miles](https://app.getport.io/_userEntity?identifier=jaden.m%2B1%40getport.io)
- **Reviewers**: [Jaden Miles](https://app.getport.io/_userEntity?identifier=jaden.m%2B1%40getport.io)
- **Reviewer Teams**: kodjomiles

### PR Description
This pull request introduces a test case utilizing the PR Enricher AI Agent 009, aimed at enhancing the testing capabilities within the Awesome-Service repository.

### Key Points
1. The PR is currently open and actively being reviewed.
2. It is associated with the "Awesome-Service" repository, indicating a focus on improving service functionality.
3. The creator, assignee, and reviewer are all the same person, Jaden Miles, which may streamline the review process but could benefit from additional perspectives.

### Observations
- **Technical Risks**: 🟢 No immediate technical risks identified from metadata.
- **Architecture Implications**: 🟢 No significant architectural changes noted.
- **Test Coverage**: 🟡 Ensure adequate test coverage is included to validate new functionalities.

### Recommendations
- **Testing**: Verify that all new features and changes are covered by unit and integration tests to ensure robustness.
- **Documentation**: Ensure that any new functionality is well-documented for future reference and ease of understanding.
- **Review Focus**: Consider involving additional reviewers to gain broader insights and ensure comprehensive feedback.

*This summary provides a high-level overview based on available metadata. For a detailed analysis, reviewing the actual code changes is recommended.*
```

## Best practices

To get the most out of your PR Enricher agent:

1. **Ensure PR-Jira Linking**: Verify that your Port setup correctly establishes relations between `githubPullRequest` entities and `jiraIssue` entities.
2. **Start with basic assessment**: Begin with simple risk assessment and gradually add more context as you see how the agent performs.
3. **Monitor responses**: Regularly review the agent's comments to ensure they're helpful and accurate.
4. **Iterate on the prompt**: Refine the prompt based on the quality of responses and specific needs of your team.
5. **Test the workflow**: Create test pull requests to verify the entire flow works as expected.
6. **Troubleshoot**: If you're not getting the expected results, check our [troubleshooting guide](/ai-agents/interact-with-the-ai-agent#troubleshooting--faq) for common issues and solutions.

## Possible enhancements

You can further enhance the PR Enricher setup by:

- **Integration expansion**: [Add more data sources](/ai-agents/build-an-ai-agent#step-2-configure-data-access) like:
  - PagerDuty for checking active incidents
  - GitLab or Azure DevOps for additional PR context

- **Automated actions**: [Configure the agent](/ai-agents/interact-with-the-ai-agent#actions-and-automations) to:
  - Automatically assign reviewers based on code changes
  - Add relevant labels to the PR (e.g., based on Jira issue type)
  - Create related Jira tickets for follow-up tasks

- **Custom risk assessment**: Enhance the agent's prompt to:
  - Include organization-specific risk factors
  - Consider team-specific guidelines
  - Reference internal documentation

- **Monitor and improve**: [Check how your developers are interacting](/ai-agents/interact-with-the-ai-agent#ai-interaction-details) with the agent and:
  - Gather feedback on the quality of comments
  - Track which suggestions are most helpful
  - Adjust the prompt based on real usage patterns

