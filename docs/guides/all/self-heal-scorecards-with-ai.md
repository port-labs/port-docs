---
displayed_sidebar: null
description: Learn how to use Port's AI capabilities to detect scorecard degradation and automatically use a coding agent like GitHub Copilot to fix it.
---

# Auto-fix services when scorecards degrade

Scorecards in Port help you evaluate the maturity, production readiness, and engineering quality of entities in your software catalog. 
However, when scorecard statistics degrade, manual intervention is often required to identify and fix the issues. This guide shows you how to create an AI-powered system that automatically detects scorecard degradation and trigger Github Copilot for automated code fixes.

<img src="/img/guides/self-healing-scorecard-architecture.png" border="1px" width="100%" />


## Common use cases

- **Automatically maintain engineering standards** by detecting and fixing missing license files, code owners, or deployment configurations
- **Automatically improve code quality** by fixing missing linters, tests, or security scanning
- **Constantly enhance compliance** by automatically reacting to degraded security scores and monitoring regulatory requirements, security protocols, and data protection measures


## Prerequisites

This guide assumes the following:
- You have a Port account and have completed the [onboarding process](https://docs.port.io/getting-started/overview)
- [Port's GitHub app](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/git/github/) is installed in your account
- You have access to [create and configure AI agents](https://docs.port.io/ai-agents/overview#getting-started-with-ai-agents) in Port.
- You have completed the setup in the [Trigger GitHub Copilot from Port guide](https://docs.port.io/guides/all/trigger-github-copilot-from-port), ensuring that Copilot will be automatically assigned to any GitHub issues created through this guide.
- You have completed the setup in the [Track AI-driven Pull Requests guide](/guides/all/track-ai-driven-pull-requests) to monitor AI-driven pull requests.



:::tip Flexibility with Coding Agents
While this guide describes GitHub Copilot, you can replace it with any other coding agent you have that can be triggered via an API.
:::


## Set up data model

We will create and configure blueprints to support our AI-powered self-healing scorecard workflow. This includes creating new blueprints for tracking AI agent tasks and updating the GitHub integration mapping.


### Create AI agent tasks blueprint

This blueprint will track tasks created by the AI agent for scorecard remediation:

1. Go to the [builder](https://app.getport.io/settings/data-model) page of your portal.
2. Click on `+ Blueprint`.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration:

    <details>
    <summary><b>AI agent tasks blueprint (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "aiAgentTask",
      "title": "AI Agent Task",
      "icon": "AI",
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
          "source": {
            "title": "Source",
            "type": "string"
          }
        },
        "required": []
      },
      "mirrorProperties": {
        "pr_status": {
          "title": "PR Status",
          "path": "pull_request.status"
        },
        "pr_link": {
          "title": "PR Link",
          "path": "pull_request.link"
        },
        "coding_agent_status": {
          "title": "Coding agent status",
          "path": "pull_request.workStatus"
        }
      },
      "calculationProperties": {},
      "aggregationProperties": {},
      "relations": {
        "pull_request": {
          "title": "Pull Request",
          "target": "githubPullRequest",
          "required": false,
          "many": false
        },
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


### Update GitHub integration mapping

Update the GitHub integration configuration to link pull requests to AI agent tasks for visibility and tracking:

1. Go to the [data sources](https://app.getport.io/settings/data-sources) page of your portal.
2. Find your GitHub integration and click on it.
3. Go to the `Mapping` tab.
4. Add the following YAML block to map pull requests to AI agent tasks:

    <details>
    <summary><b>Updated GitHub integration configuration (Click to expand)</b></summary>
    
    :::tip JQ Pattern Explanation
    We search for the "task-r" pattern because it is used when saving an AI task. The agent is programmed to include the task identifier in the pull request description. This allows us to map pull requests to their corresponding tasks when fetching them.
    :::

    ```yaml showLineNumbers
    resources:
      - kind: pull-request
        selector:
          query: (.body // "") | test("task-r_[a-zA-Z0-9]{16}")
        port:
          entity:
            mappings:
              identifier: (.body // "") | match("task-r_[a-zA-Z0-9]{16}").string | tostring
              blueprint: '"aiAgentTask"'
              properties: {}
              relations:
                pull_request: .id|tostring
    ```
    </details>

5. Click `Save` to update the integration configuration.


## Set up scorecards

To track the production readiness and code maturity of each GitHub repository, you can set up scorecards that focus on rules GitHub Copilot can fix. Instead of detailing the setup process here, please refer to the following guides to configure your scorecards:

- [Ensure Production Readiness](https://docs.port.io/guides/all/ensure-production-readiness/#update-your-existing-services-scorecard)
- [Code Maturity Scorecard](https://docs.port.io/guides/all/track-gitlab-project-maturity-with-scorecards/)

:::tip Focus on actionable rules
When configuring your scorecards, consider selecting rules that GitHub Copilot can generate code to fix, such as:
- Missing README.md files
- Missing CONTRIBUTING.md files
- Missing LICENSE files
- Missing CI/CD configurations
- Missing linter configurations
- Missing test setups
:::


## Set up self-service actions

We will create self-service actions that the AI agent can use for scorecard remediation.


### Create AI agent task action

1. Go back to the [self-service](https://app.getport.io/self-serve) page of your portal.
2. Click on `+ New Action`.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration:

    <details>
    <summary><b>Create AI agent task action (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "create_ai_agent_task",
      "title": "Create an AI agent task",
      "icon": "Alert",
      "description": "Create a new task for scorecard remediation",
      "trigger": {
        "type": "self-service",
        "operation": "DAY-2",
        "userInputs": {
          "properties": {
            "title": {
              "icon": "DefaultProperty",
              "type": "string",
              "title": "Task Title",
              "description": "A short description for the task"
            },
            "labels": {
              "items": {
                "type": "string"
              },
              "icon": "DefaultProperty",
              "type": "array",
              "title": "Task Labels",
              "description": "Labels to add to the task, following format: [\"label1\",\"label2\"]"
            },
            "description": {
              "title": "Task Description",
              "icon": "DefaultProperty",
              "type": "string",
              "description": "Detailed description of the scorecard degradation and remediation requirements",
              "format": "markdown"
            }
          },
          "required": [
            "title",
            "description"
          ],
          "order": [
            "title",
            "description",
            "labels"
          ]
        },
        "blueprintIdentifier": "githubRepository"
      },
      "invocationMethod": {
        "type": "WEBHOOK",
        "url": "https://api.getport.io/v1/blueprints/aiAgentTask/entities",
        "agent": false,
        "synchronized": true,
        "method": "POST",
        "headers": {
          "Content-Type": "application/json"
        },
        "body": {
          "identifier": "task-{{ .run.id }}",
          "title": "{{ .inputs.title }}",
          "properties": {
            "title": "{{ .inputs.title }}",
            "description": "{{ .inputs.description }}",
            "labels": "{{ .inputs.labels }}",
            "source": "ai_agent"
          },
          "relations": {
            "repository": "{{ .entity.identifier }}"
          }
        }
      },
      "requiredApproval": false
    }
    ```
    </details>

5. Click `Save` to create the action. 


## Create AI agent

Next, we will create an AI agent that analyzes scorecard degradation and creates comprehensive remediation workflows.

### Configure the self-healing scorecard AI agent

1. Go to the [AI Agents](https://app.getport.io/_ai_agents) page of your portal.
2. Click on `+ AI Agent`.
3. Toggle `Json mode` on.
4. Copy and paste the following JSON schema:

    <details>
    <summary><b>Self-healing scorecard AI agent configuration (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "self_healing_scorecard",
      "title": "Self Healing Scorecard",
      "icon": "Details",
      "team": [],
      "properties": {
        "description": "Analyzes scorecard rule failures and creates tasks for remediation",
        "status": "active",
        "allowed_blueprints": [
          "githubIssue",
          "githubRepository",
          "aiAgentTask",
          "githubPullRequest"
        ],
        "allowed_actions": [
          "create_ai_agent_task"
        ],
        "prompt": "You are a **Self-Healing Scorecards AI Agent**. Your role is to **analyze scorecard degradation** and create **comprehensive remediation workflows**.\n\n## Context\n\nWhen a scorecard's statistics decrease (indicating degraded performance), you need to:\n\n1. Analyze which specific rule(s) failed and caused the degradation\n2. Create a task that will be used to generate a GitHub issue for remediation\n\n⚠️ IMPORTANT:\nYou must only address rules that have changed from SUCCESS to FAILURE in the current diff.\nDo not include or attempt to fix any unrelated or previously failing rules. This avoids unnecessary scope expansion and ensures Copilot-generated PRs remain focused and minimal.\n\n## 🔍 Analysis Process\n\n### ✅ Step 1: Identify Failed Rules\n\n* Examine the scorecard rule results to identify which rule(s) transitioned from **SUCCESS → FAILURE**\n* Compare the current state with the previous state to determine the diff and understand what changed\n* Only include rules that newly failed in this diff\n\n### 🧠 Step 2: Root Cause Analysis\n\nFor each newly failed rule:\n\n* Determine what specific condition is not being met\n* Identify what entity properties or relationships are missing or incorrect\n* Specify what actions would resolve the issue\n\n### 📝 Step 3: Create Task for Remediation\n\nGenerate a task entity by calling the \"create_ai_agent_task\" self service action with:\n\n* **Title**:\n  `\"Fix Scorecard Degradation: [What Specific Rule Changed]\"`\n\n* **Description** (include):\n  * Identify the failed rule with specific failure reasons\n  * Impact assessment\n  * Specific code or configuration changes needed\n  * Files that need to be modified\n  * Examples of correct implementations\n  * Links to relevant entities and scorecards\n\n* **Labels**:\nAdd  relevant labels (e.g., bug, enhancement, infra, docs) including a MANDATORY \"auto_assign\" label in all creations. This will be used to track issues created by Port's AI agent.\n\n## 📏 Guidelines\n\n* Be **specific** about what needs to be fixed\n* Provide **actionable**, implementable steps\n* Include **relevant links and context**\n* Prioritize issues based on **impact**\n* Ensure each task contain **sufficient detail** for human or AI resolution\n* Use **markdown formatting** for better readability\n* Only generate tasks for rules that degraded in this specific diff",
        "execution_mode": "Automatic"
      },
      "relations": {}
    }
    ```
    </details>

5. Click `Create` to save the agent.


## Set up automations

We will create several automations to orchestrate the AI-powered scorecard self-healing workflow:

1. Monitor scorecard statistics and trigger the AI agent when degradation is detected
2. Create GitHub issues from AI agent tasks


### Automation to monitor scorecard degradation

This automation continuously monitors scorecard statistics and triggers the AI agent when degradation is detected. It ensures that scorecard issues are caught early and remediation tasks are created automatically, preventing technical debt from accumulating.

1. Go to the [automations](https://app.getport.io/settings/automations) page of your portal.
2. Click on `+ Automation`.
3. Copy and paste the following JSON schema:

    <details>
    <summary><b>Scorecard degradation monitoring automation (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "repository_scorecard_update",
      "title": "Repository Scorecard Update",
      "description": "Trigger this automation when the scorecard associated with a repository is degraded",
      "icon": "Github",
      "trigger": {
        "type": "automation",
        "event": {
          "type": "ENTITY_UPDATED",
          "blueprintIdentifier": "githubRepository"
        },
        "condition": {
          "type": "JQ",
          "expressions": [
            ".diff.after.scorecardsStats < .diff.before.scorecardsStats"
          ],
          "combinator": "and"
        }
      },
      "invocationMethod": {
        "type": "WEBHOOK",
        "url": "https://api.getport.io/v1/agent/self_healing_scorecard/invoke",
        "agent": false,
        "synchronized": true,
        "method": "POST",
        "headers": {
          "RUN_ID": "{{ .run.id }}",
          "Content-Type": "application/json"
        },
        "body": {
          "prompt": "Scorecard degradation detected for entity: {{ .event.diff.after.title }}\nEntity identifier: {{ .event.diff.after.identifier }}\nPrevious scorecard statistics: {{ .diff.before.scorecardsStats }}\nCurrent scorecard statistics: {{ .diff.after.scorecardsStats }}\nPrevious Entity properties: {{ .event.diff.before.properties }}\nCurrent Entity properties: {{ .event.diff.after.properties }}\nPrevious Entity relations: {{ .event.diff.before.relations }}\nCurrent Entity relations: {{ .event.diff.after.relations }}\nPrevious Scorecard Details: {{ .event.diff.before.scorecards }}\nCurrent Scorecard Details: {{ .event.diff.after.scorecards }}\n\nAnalyze the scorecard degradation and create a task for remediation. NEVER FORGET TO CALL the *create_ai_agent_task* self service action",
          "labels": {
            "source": "scorecard_degradation_automation",
            "entity_id": "{{ .event.diff.after.identifier }}",
            "scorecard_change": "degradation"
          }
        }
      },
      "publish": true
    }
    ```
    </details>

4. Click `Create` to save the automation.


### Automation to create GitHub issues from AI agent tasks

This automation bridges the gap between Port's AI agent analysis and GitHub's development workflow. It automatically creates detailed GitHub issues with remediation instructions, ensuring that scorecard degradation issues are properly tracked and actionable for development teams.

1. Go back to the [automations](https://app.getport.io/settings/automations) page of your portal.
2. Click on `+ Automation`.
3. Copy and paste the following JSON schema:

    <details>
    <summary><b>Create GitHub issue from AI agent task automation (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "create_git_hub_issue_from_scorecard",
      "title": "Create GitHub Issue from Scorecard",
      "description": "Automation to create a GitHub issue with remediation on how to fix a scorecard degradation.",
      "icon": "Github",
      "trigger": {
        "type": "automation",
        "event": {
          "type": "RUN_UPDATED",
          "actionIdentifier": "create_ai_agent_task"
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
        "url": "https://api.getport.io/v1/actions/create_github_issue/runs",
        "agent": false,
        "synchronized": true,
        "method": "POST",
        "headers": {
          "RUN_ID": "{{ .run.id }}",
          "Content-Type": "application/json"
        },
        "body": {
          "properties": {
            "title": "{{ .event.diff.after.response.entity.properties.title }}",
            "body": "{{.event.diff.after.response.entity.properties.description}} *IMPORTANT NOTE FOR COPILOT*: When creating a pull request to fix this issue, you MUST ALWAYS include the Port Task Identifier in the PR description or body for tracking purposes. Here is the Port Task Identifier for this issue: {{ .event.diff.after.response.entity.identifier }}",
            "labels": "{{.event.diff.after.response.entity.properties.labels}}"
          },
          "entity": "{{ .event.diff.after.response.entity.relations.repository }}"
        }
      },
      "publish": true
    }
    ```
    </details>

4. Click `Create` to save the automation.


## Test the workflow

Now let us test the complete workflow to ensure everything works correctly.


### Trigger a test scorecard degradation

1. Go to your GitHub repository and manually modify a property that affects a scorecard rule (e.g., remove a README.md file or disable CI/CD).
2. Wait for the scorecard statistics to update in Port.


### Verify the AI agent task creation

1. Go to the [Catalog](https://app.getport.io/catalog) page of your portal.
2. Navigate to the `AI Agent Task` entities.
3. Check the list to see the generated task.


### Check the GitHub issue creation

1. Go to your GitHub repository.
2. Verify that a new issue was created with the appropriate title, description, and labels.
3. Check that the issue has the "auto_assign" label.


### Verify Copilot assignment

1. Check the GitHub issue to see if it was assigned to Copilot.
2. Verify that the GitHub workflow was triggered successfully.
3. See Copilot created a new PR.


### Monitor the remediation process

1. Watch as GitHub Copilot generates code to fix the scorecard issues.
2. Check that pull requests are created and linked back to the AI agent tasks.
3. Verify that the scorecard statistics improve after the fixes are merged.

<img src="/img/guides/self-healing-scorecard-dashboard-1.png" border="1px" width="100%" />
<img src="/img/guides/self-healing-scorecard-dashboard-2.png" border="1px" width="100%" />


## Related guides

- [Automate Jira to GitHub Copilot](https://docs.port.io/guides/all/automate-jira-to-github-copilot)
- [Set up the Task Manager AI agent](https://docs.port.io/guides/all/setup-task-manager-ai-agent)
