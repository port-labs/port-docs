---
displayed_sidebar: null
description: Learn how to create an AI agent that automatically generates GitHub issues from Jira tickets, assigns them to Copilot and link pull requests back to Jira.
---

import GithubActionModificationHint from '/docs/guides/templates/github/_github_action_modification_required_hint.mdx'

# Automatically resolve tickets with coding agents

Coding agents can significantly speed up development, but crucial engineering context often gets lost in the process. 
In this guide, we will learn how to create an AI agent that not only automates the generation of GitHub issues from Jira tickets but also ensures that important context is preserved by assigning them to GitHub Copilot and linking pull requests back to Jira. 
This setup will help us establish a seamless ticket-to-PR workflow, bridging the gap between Jira and GitHub.

<img src="/img/guides/automatic-ticket-resolution-architecture.png" border="1px" width="100%" />


## Common use cases

- **Auto-create PRs for bug fixes** to minimize manual work.
- **Integrate with Copilot** for teams not relying on GitHub Issues.
- **Link Jira tickets to PRs** to improve cross-platform collaboration.
- **Generate GitHub issues from Jira** for faster prototyping.


## Prerequisites

This guide assumes the following:
- You have a Port account and have completed the [onboarding process](https://docs.port.io/getting-started/overview).
- [Port's GitHub app](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/git/github/) is installed in your account.
- [Port's Jira integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/project-management/jira/) is installed in your account.
- You have access to [create and configure AI agents](https://docs.port.io/ai-agents/overview#getting-started-with-ai-agents) in Port.
- You have completed the setup in the [Trigger GitHub Copilot from Port guide](https://docs.port.io/guides/all/trigger-github-copilot-from-port), ensuring that Copilot will be automatically assigned to any GitHub issues created through this guide.

:::tip Alternative integrations
While this guide uses GitHub and Jira, you can adapt it for other Git providers like GitLab or Azure DevOps, and other project management tools like Linear.
:::

:::info Alternative coding agents
This guide demonstrates using GitHub Copilot, but you can also use other coding agents like Claude Code, Devin, etc., to achieve similar automation and integration.
:::


## Set up data model

We will configure the necessary blueprints to support our AI-enhanced coding workflow. This involves updating the Jira issue blueprint with necessary relations.


### Update Jira issue blueprint

When you install Port's Jira integration, the Jira project and issue blueprints are created by default. However, we need to update the Jira issue blueprint to add the pull request relation and create a mirror property for the PR link.

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


### Update Jira integration configuration

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
            ((statusCategory != Done) OR (created >= -1w) OR (updated >= -1w))
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

### Update GitHub Integration Mapping

To track pull requests opened by Copilot that are meant to fix Jira issues, we need to update the GitHub integration mapping. This will allow us to establish a connection between the pull request and the corresponding Jira issue using the Jira issue key included in the PR title.

1. Go to the [builder](https://app.getport.io/settings/data-model) page of your portal.
2. Find and select your existing GitHub integration configuration.
3. Click on `{...} Edit JSON`.
4. Add the following mapping to the `mappings` section:

    <details>
    <summary><b>Pull request mapping (Click to expand)</b></summary>

    ```yaml showLineNumbers
    - kind: pull-request
      selector:
        query: ((.title // "") | test("[A-Z]+-[0-9]+")) and (.user.login == "Copilot")
      port:
        entity:
          mappings:
            identifier: (.title // "") | match("[A-Z]+-[0-9]+").string
            blueprint: '"jiraIssue"'
            properties: {}
            relations:
              pull_request: .id|tostring
    ```
    </details>

5. Click `Save` to update the integration configuration.


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
        "prompt": "Create a GitHub issue that builds on the context of a linked Jira ticket.\n\nThe GitHub issue should:\n1.\tSummarize and clearly explain the task, using the Jira description as a base.\n2.\tAugment the description with relevant insights from the repository — such as the README, setup or contribution instructions, existing issues, or implementation notes — to make the issue fully self-contained.\n3.\tThe **issue title MUST start with the Jira ticket key**, using the format: `<Jira-Ticket-ID> - <what needs to be done>` (e.g., `JIRA-1234 - Add missing lint configuration`). This ensures PRs created by Copilot are linkable back to Jira.\n4.\tAdd GitHub labels, including one with the Jira ticket key (e.g., `JIRA-1234`), and any additional relevant labels (e.g., bug, enhancement, infra).\n5.\tAlso include a label named `auto_assign` in all creations.\n6. The GitHub issue body should end with the following directive:\n🚨 **IMPORTANT NOTE FOR COPILOT**: When creating the pull request to resolve this issue:\n    1. You **must ALWAY include the Jira ticket ID** (e.g., `JIRA-1234`) in the **PR title**.\n    2. Do **not** rename the PR title or remove the Jira ticket reference.\n    3. Add GitHub labels with the Jira ticket key (e.g., `JIRA-1234`) to the PR.\n\nIf no direct match can be confidently made (e.g., across multiple repos), make a best guess, and clearly state any assumptions in the issue body.",
        "execution_mode": "Automatic",
        "conversation_starters": []
      },
      "relations": {}
    }
    ```
    </details>

5. Click `Create` to save the agent.

:::tip Enhance Context with Integrations
The more integrations and data you add to the agent, the richer the context it will provide to the Copilot agent. Consider integrating additional data sources like deployment history, related incidents, and more to enhance the AI agent's effectiveness.
:::


## Set up automations

We will create two automations to orchestrate the AI-enhanced release management workflow:

1. Trigger the AI agent when Jira tickets move to "In Progress" with "copilot" label
2. Update Jira tickets with pull request links


### Automation to trigger AI agent

:::tip Multiple Approaches
This automation can be configured to trigger based on various criteria. Currently, it triggers based on a label, but you can also set it to trigger based on different properties or ownership.
:::

1. Go to the [automations](https://app.getport.io/settings/automations) page of your portal.
2. Click on `+ Automation`.
3. Copy and paste the following JSON schema:

    <details>
    <summary><b>Create GitHub issue from Jira automation (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "create_github_issue_from_jira",
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
        "url": "https://api.getport.io/v1/agent/github_issue_creation/invoke",
        "agent": false,
        "synchronized": true,
        "method": "POST",
        "headers": {
          "RUN_ID": "{{ .run.id }}",
          "Content-Type": "application/json"
        },
        "body": {
          "prompt": "Jira Task title: \"{{.event.diff.after.title}}\"\n. Jira Task identifier: \"{{.event.diff.after.identifier}}\"\n Jira Task description: \"{{.event.diff.after.properties.description}}\"\nRepository:{{.event.diff.after.relations.repository}}.",
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


### Automation to add PR link to Jira ticket

This automation ensures that any new pull request related to a Jira ticket is promptly linked back to the ticket, providing clear traceability and context for development progress.

1. Go back to the [automations](https://app.getport.io/settings/automations) page of your portal.
2. Click on `+ Automation`.
3. Copy and paste the following JSON schema:

    <details>
    <summary><b>Add PR link to Jira issue automation (Click to expand)</b></summary>

    :::tip Atlassian domain replacement
    Remember to replace `<YOUR_ATLASSIAN_DOMAIN>` with your actual Atlassian domain.
    :::

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
        "url": "https://<YOUR_ATLASSIAN_DOMAIN>.atlassian.net/rest/api/3/issue/{{  .event.diff.before.identifier }}/comment",
        "agent": false,
        "synchronized": true,
        "method": "POST",
        "headers": {
          "RUN_ID": "{{ .run.id }}",
          "Authorization": "Basic {{ .secrets._JIRA_ATLASSIAN_USER_EMAIL + \":\" + .secrets._JIRA_ATLASSIAN_USER_TOKEN | @base64 }}",
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
                    "text": "Port opened a PR for this issue. Find the link below:"
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

1. Go to your GitHub repository.
2. Verify that a new issue was created with the appropriate title, description, and labels.
3. Check that the issue has the "auto_assign" label.


<h4> Test pull request linking </h4>

1. Verify that the GitHub issue is automatically assigned to Copilot.
2. Confirm that a pull request is automatically created with a title containing the Jira ticket key.
3. Check the Jira ticket to see if a comment was added with the PR link.

<img src="/img/guides/jira-to-github-ai-test.png" border="1px" width="100%" />


## Related guides

- [Trigger GitHub Copilot from Port](https://docs.port.io/guides/all/trigger-github-copilot-from-port)
- [Set up the Task Manager AI agent](https://docs.port.io/guides/all/setup-task-manager-ai-agent)