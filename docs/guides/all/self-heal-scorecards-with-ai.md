---
displayed_sidebar: null
description: Learn how to use Port's AI capabilities to detect scorecard degradation and automatically use a coding agent like GitHub Copilot to fix it.
---

# Self-Heal Scorecards with AI

Scorecards in Port help you evaluate the maturity, production readiness, and engineering quality of entities in your software catalog. However, when scorecard statistics degrade, manual intervention is often required to identify and fix the issues. This guide shows you how to create an AI-powered system that automatically detects scorecard degradation and trigger Github Copilot for automated code fixes.

<img src="/img/guides/self-healing-scorecard-workflow.jpg" border="1px" width="100%" />


## Common use cases

- **Maintain engineering standards** by detecting missing license files, code owners, or deployment configurations
- **Track code quality metrics** for missing linters, tests, or security scanning
- **Ensure compliance** by monitoring regulatory requirements, security protocols, and data protection measures


## Prerequisites

This guide assumes the following:
- You have a Port account and have completed the [onboarding process](https://docs.port.io/getting-started/overview)
- [Port's GitHub app](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/git/github/) is installed in your account
- [Port's AI capabilities](https://docs.port.io/ai-agents/overview#getting-started-with-ai-agents) are enabled in your account
- You have access to GitHub Copilot in your repositories

:::tip Flexibility with Coding Agents
While this guide describes GitHub Copilot, you can replace it with any other coding agent you have that can be triggered via an API.
:::


## Set up data model

We will create and configure blueprints to support our AI-powered self-healing scorecard workflow. This includes updating the GitHub repository blueprint with scorecard-relevant properties and creating new blueprints for tracking AI agent tasks.

### Update GitHub repository blueprint

First, let us enhance the GitHub repository blueprint with properties that can be used to measure scorecard metrics and that GitHub Copilot can actually fix:

1. Go to the [builder](https://app.getport.io/settings/data-model) page of your portal.
2. Find and select your existing GitHub repository blueprint.
3. Click on `{...} Edit JSON`.
4. Update the properties section to include scorecard-relevant properties:

    <details>
    <summary><b>Updated GitHub repository blueprint properties (Click to expand)</b></summary>

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
            "icon": "Shield",
            "description": "Requires review from code owners before a pull request can be merged"
          },
          "require_approval_count": {
            "title": "Require approvals",
            "type": "number",
            "icon": "Users",
            "description": "The number of approvals required before merging a pull request"
          },
          "has_security_scanning": {
            "title": "Security Scanning Enabled",
            "description": "Whether security scanning is enabled for this repository",
            "icon": "Shield",
            "type": "boolean"
          },
          "has_dependabot_enabled": {
            "title": "Dependabot Enabled",
            "description": "Whether Dependabot is enabled for dependency updates",
            "icon": "Shield",
            "type": "boolean"
          },
          "has_ci_cd": {
            "title": "CI/CD Pipeline",
            "description": "Whether the repository has CI/CD pipelines configured",
            "icon": "GitVersion",
            "type": "boolean"
          },
          "deployment_frequency": {
            "title": "Deployment Frequency",
            "description": "How often code is deployed (daily/weekly/monthly)",
            "icon": "Deployment",
            "type": "string"
          },
          "has_monitoring": {
            "title": "Monitoring Enabled",
            "description": "Whether production monitoring is configured",
            "icon": "Grafana",
            "type": "boolean"
          },
          "has_runbook": {
            "title": "Has Runbook",
            "description": "Whether operational runbooks are documented",
            "icon": "Book",
            "type": "boolean"
          },
          "test_coverage": {
            "title": "Test Coverage %",
            "description": "Percentage of code covered by tests",
            "icon": "Checklist",
            "type": "number"
          },
          "has_code_owners": {
            "title": "Has Code Owners",
            "description": "Whether CODEOWNERS file is configured",
            "icon": "Users",
            "type": "boolean"
          },
          "license": {
            "type": "string",
            "title": "License",
            "format": "markdown"
          },
          "contributing_guide": {
            "type": "string",
            "title": "Contributing Guide",
            "format": "markdown"
          },
          "has_linter": {
            "type": "boolean",
            "title": "Has Linter"
          },
          "manifest": {
            "type": "string",
            "title": "Package JSON"
          }
        },
        "required": []
      },
      "mirrorProperties": {},
      "calculationProperties": {},
      "aggregationProperties": {},
      "relations": {}
    }
    ```
    </details>

5. Click `Save` to update the blueprint.


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

Let us create scorecards to track the production readiness and code maturity of each GitHub repository. We will focus on rules that GitHub Copilot can actually fix.

### Create production readiness scorecard

1. Go to your Builder page.
2. Search for the `GitHub repository` blueprint and select it.
3. Click on the `Scorecards` tab.
4. Click on `+ New Scorecard` to create a new scorecard.
5. Add this JSON configuration:

    <details>
    <summary><b>Production readiness scorecard (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "production_readiness",
      "title": "Production Readiness",
      "levels": [
        {
          "title": "Development",
          "color": "red"
        },
        {
          "title": "Staging Ready",
          "color": "yellow"
        },
        {
          "title": "Production Ready",
          "color": "green"
        },
        {
          "title": "Elite",
          "color": "gold"
        }
      ],
      "rules": [
        {
          "identifier": "has_cicd",
          "title": "CI/CD Pipeline Configured",
          "level": "Staging Ready",
          "query": {
            "combinator": "and",
            "conditions": [
              {
                "property": "has_ci_cd",
                "operator": "=",
                "value": true
              }
            ]
          },
          "description": "Repository must have CI/CD pipelines set up"
        },
        {
          "identifier": "has_monitoring",
          "title": "Monitoring Configured",
          "level": "Production Ready",
          "query": {
            "combinator": "and",
            "conditions": [
              {
                "property": "has_monitoring",
                "operator": "=",
                "value": true
              }
            ]
          },
          "description": "Production monitoring must be enabled"
        },
        {
          "identifier": "has_runbook",
          "title": "Operational Runbook",
          "level": "Production Ready",
          "query": {
            "combinator": "and",
            "conditions": [
              {
                "property": "has_runbook",
                "operator": "=",
                "value": true
              }
            ]
          },
          "description": "Operational runbooks must be documented"
        },
        {
          "identifier": "high_sla",
          "title": "High Availability SLA",
          "level": "Production Ready",
          "query": {
            "combinator": "and",
            "conditions": [
              {
                "property": "uptime_sla",
                "operator": ">=",
                "value": 99
              }
            ]
          },
          "description": "Uptime SLA must be 99% or higher"
        },
        {
          "identifier": "frequent_deploy",
          "title": "Frequent Deployments",
          "level": "Elite",
          "query": {
            "combinator": "and",
            "conditions": [
              {
                "property": "deployment_frequency",
                "operator": "=",
                "value": "daily"
              }
            ]
          },
          "description": "Deployment frequency must be daily"
        },
        {
          "identifier": "multi_approval",
          "title": "Multiple Approvers",
          "level": "Elite",
          "query": {
            "combinator": "and",
            "conditions": [
              {
                "property": "require_approval_count",
                "operator": ">=",
                "value": 2
              }
            ]
          },
          "description": "Requires at least 2 approvals before merge"
        }
      ]
    }
    ```
    </details>

### Create code maturity scorecard

1. Go back to the `Scorecards` tab.
2. Click on `+ New Scorecard` to create another scorecard.
3. Add this JSON configuration:

    <details>
    <summary><b>Code maturity scorecard (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "code_maturity",
      "title": "Code Maturity",
      "levels": [
        {
          "color": "paleBlue",
          "title": "Basic"
        },
        {
          "color": "darkGray",
          "title": "Low"
        },
        {
          "color": "orange",
          "title": "Medium"
        },
        {
          "color": "red",
          "title": "High"
        }
      ],
      "rules": [
        {
          "identifier": "has_ci",
          "title": "CI/CD Configuration",
          "description": "Ensures that CI pipelines exist to automate testing and deployments.",
          "level": "High",
          "query": {
            "combinator": "and",
            "conditions": [
              {
                "operator": "=",
                "property": "has_ci_cd",
                "value": true
              }
            ]
          }
        },
        {
          "identifier": "has_license",
          "title": "License File",
          "description": "Project contains a LICENSE file. Indicates the project's usage and distribution rights.",
          "level": "Low",
          "query": {
            "combinator": "and",
            "conditions": [
              {
                "operator": "isNotEmpty",
                "property": "license"
              }
            ]
          }
        },
        {
          "identifier": "has_readme",
          "title": "Has README",
          "description": "Project contains a README file to describe the purpose, usage, and setup instructions. Encouraged for onboarding and documentation clarity.",
          "level": "Medium",
          "query": {
            "combinator": "and",
            "conditions": [
              {
                "operator": "isNotEmpty",
                "property": "readme"
              }
            ]
          }
        },
        {
          "identifier": "has_tests",
          "title": "Has Tests",
          "description": "Project contains test files. This is a basic engineering quality requirement.",
          "level": "High",
          "query": {
            "combinator": "and",
            "conditions": [
              {
                "operator": "contains",
                "property": "manifest",
                "value": "test"
              }
            ]
          }
        },
        {
          "identifier": "has_contrib_guide",
          "title": "Contributing Guide",
          "description": "Presence of a CONTRIBUTING.md file helps standardize external and internal collaboration.",
          "level": "Low",
          "query": {
            "combinator": "and",
            "conditions": [
              {
                "operator": "isNotEmpty",
                "property": "contributing_guide"
              }
            ]
          }
        },
        {
          "identifier": "has_linter",
          "title": "Code Linter Configured",
          "description": "Project includes standard linting configurations to enforce code quality and consistency.",
          "level": "Medium",
          "query": {
            "combinator": "and",
            "conditions": [
              {
                "operator": "contains",
                "property": "manifest",
                "value": "lint"
              }
            ]
          }
        },
        {
          "identifier": "has_node_version",
          "title": "Node Version Defined in Poetry",
          "description": "Specifying Node version in `package.json` improves reproducibility and environment stability.",
          "level": "Medium",
          "query": {
            "combinator": "and",
            "conditions": [
              {
                "operator": "contains",
                "property": "manifest",
                "value": "node"
              }
            ]
          }
        }
      ]
    }
    ```
    </details>

:::tip Focus on actionable rules
The scorecard rules selected above are specifically chosen because GitHub Copilot can generate code to fix them:
- Missing README.md files
- Missing CONTRIBUTING.md files
- Missing LICENSE files
- Missing CI/CD configurations
- Missing linter configurations
- Missing test setups
:::

## Set up self-service actions

We will create self-service actions that the AI agent can use to create GitHub issues and AI agent tasks for scorecard remediation.

### Add Port secrets

To add these secrets to your portal:

1. Click on the `...` button in the top right corner of your Port application.
2. Click on **Credentials**.
3. Click on the `Secrets` tab.
4. Click on `+ Secret` and add the following secret:
   - `GITHUB_TOKEN` - A [GitHub fine-grained access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-fine-grained-personal-access-token) with read and write permissions for the "Issues" section of your repositories.

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

### Create AI agent task action

1. Go back to the [self-service](https://app.getport.io/self-serve) page of your portal.
2. Click on `+ New Action`.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration:

    <details>
    <summary><b>Create AI agent task action (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "create_ai_task_from_scorcard",
      "title": "Create Task from Scorecard",
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
          "create_ai_task_from_scorcard"
        ],
        "prompt": "You are a **Self-Healing Scorecards AI Agent**. Your role is to **analyze scorecard degradation** and create **comprehensive remediation workflows**.\n\n## Context\n\nWhen a scorecard's statistics decrease (indicating degraded performance), you need to:\n\n1. Analyze which specific rules failed and caused the degradation\n2. Create a task that will be used to generate a GitHub issues for remediation\n\n## 🔍 Analysis Process\n\n### ✅ Step 1: Identify Failed Rules\n\n* Examine the scorecard rule results to identify which rules are now failing\n* Compare the current state with the previous state to understand what changed\n* Focus on rules whose status transitioned from **SUCCESS → FAILURE**\n\n### 🧠 Step 2: Root Cause Analysis\n\nFor each failed rule, determine:\n\n* What specific condition is not being met\n* What entity properties or relationships are missing or incorrect\n* What actions would resolve the issue\n* Assign a **priority** level based on impact (**High / Medium / Low**)\n\n\n### 📝 Step 3: Create Task for Remediation\n\nGenerate a task entity by calling the \"create_ai_task_from_scorcard\" self service action with:\n\n* **Title**:\n  `\"Fix Scorecard Degradation: [What Specific Rule Changed]\"`\n\n* **Description** (include):\n  * List of failed rules with specific failure reasons\n  * Impact assessment\n  * Specific code or configuration changes needed\n  * Files that need to be modified\n  * Examples of correct implementations\n  * Links to relevant entities and scorecards\n\n* **Labels**:\nAdd  relevant labels (e.g., bug, enhancement, infra, docs) including a MANDATORY \"auto_assign\" label in all creations. This will be used to track issues created by Port's AI agent.\n\nNOTE: The \"create_ai_task_from_scorcard\" is a DAY-2 operation so you need to add the \"$targetEntity\" key to the action JSON input which will be the identifier of the repository.\n\n## 📏 Guidelines\n\n* Be **specific** about what needs to be fixed\n* Provide **actionable**, implementable steps\n* Include **relevant links and context**\n* Prioritize issues based on **impact**\n* Ensure both tickets contain **sufficient detail** for human or AI resolution\n* Use **markdown formatting** for better readability",
        "execution_mode": "Automatic"
      },
      "relations": {}
    }
    ```
    </details>

5. Click `Create` to save the agent.

:::tip AI agent capabilities
This AI agent is designed to analyze scorecard degradation and create detailed remediation tasks. It focuses on rules that can be fixed through code changes, making it perfect for integration with GitHub Copilot.
:::

## Set up automations

We will create several automations to orchestrate the AI-powered scorecard self-healing workflow:

1. Monitor scorecard statistics and trigger the AI agent when degradation is detected
2. Create GitHub issues from AI agent tasks
3. Assign GitHub issues to Copilot automatically

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
          "prompt": "Scorecard degradation detected for entity: {{ .event.diff.after.title }}\nEntity identifier: {{ .event.diff.after.identifier }}\nPrevious scorecard statistics: {{ .diff.before.scorecardsStats }}\nCurrent scorecard statistics: {{ .diff.after.scorecardsStats }}\nPrevious Entity properties: {{ .event.diff.before.properties }}\nCurrent Entity properties: {{ .event.diff.after.properties }}\nPrevious Entity relations: {{ .event.diff.before.relations }}\nCurrent Entity relations: {{ .event.diff.after.relations }}\nPrevious Scorecard Details: {{ .event.diff.before.scorecards }}\nCurrent Scorecard Details: {{ .event.diff.after.scorecards }}\n\nAnalyze the scorecard degradation and create a task for remediation. NEVER FORGET TO CALL the *create_ai_task_from_scorcard* self service action",
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
          "actionIdentifier": "create_ai_task_from_scorcard"
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

### Automation to assign GitHub issues to Copilot

This automation ensures that GitHub issues created for scorecard remediation are automatically assigned to GitHub Copilot. It streamlines the development process by eliminating manual assignment and enabling immediate AI-powered code generation to fix the identified issues.

1. Go back to the [automations](https://app.getport.io/settings/automations) page of your portal.
2. Click on `+ Automation`.
3. Copy and paste the following JSON schema:

    <details>
    <summary><b>Assign GitHub issue to Copilot automation (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "jira_to_copilot_agent",
      "title": "Assign GitHub Issue to Copilot",
      "description": "When an issue moves to In Progress with Copilot label, assign to Copilot",
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
        "url": "https://api.getport.io/v1/actions/assign_to_copilot_no_comment/runs",
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


### Add GitHub workflow for Copilot assignment

Create the file `.github/workflows/assign_to_copilot.yml` in the `.github/workflows` folder of your repository. 

This workflow will check if Copilot is enabled for the repository and return its unique ID. It also handles the assignment of issues to Copilot and includes progress reporting back to Port.

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
          GH_TOKEN: ${{ secrets.PORT_GITHUB_TOKEN }}

      - name: Report progress to Port - Found Copilot Bot
        if: ${{ inputs.port_run_id != '' }}
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
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
          GH_TOKEN: ${{ secrets.PORT_CLIENT_SECRET }}

      - name: Report progress to Port - Found Issue
        if: ${{ inputs.port_run_id != '' }}
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
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
          GH_TOKEN: ${{ secrets.PORT_GITHUB_TOKEN }}
          ISSUE_CONTEXT: ${{ inputs.issue_context_to_comment }}

      - name: Report progress to Port - Commented on issue
        if: ${{ inputs.port_run_id != '' }}
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
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
          GH_TOKEN: ${{ secrets.PORT_GITHUB_TOKEN }}

      - name: Report back to Port (if triggered from Port)
        if: ${{ inputs.port_run_id != '' }}
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
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
- `PORT_CLIENT_ID`: Your Port client ID
- `PORT_CLIENT_SECRET`: Your Port client secret  
- `PORT_GITHUB_TOKEN`: A GitHub PAT with repository access
:::


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


## Related guides

- [Automate Jira to GitHub Copilot](https://docs.port.io/guides/all/automate-jira-to-github-copilot)
- [Set up the Task Manager AI agent](https://docs.port.io/guides/all/setup-task-manager-ai-agent)
