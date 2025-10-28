---
displayed_sidebar: null
description: Learn how to implement an AI-powered triage system that automatically evaluates Jira tickets, enriches them with missing context, and ensures only well-defined tasks reach your coding agents.
---

import MCPCapabilitiesHint from '/docs/guides/templates/ai/_mcp_capabilities_hint.mdx'


# Improve specifications with Port AI

Coding agents often fail or produce suboptimal results when given incomplete or poorly defined tasks. Developers waste time and resources on unsuccessful runs caused by missing context, unclear success criteria, or insufficient requirements.

This guide demonstrates how to implement an AI-powered triage system in Port that automatically evaluates incoming Jira tickets, enriches them with missing details, and ensures only well-defined tasks reach your coding agents.

<img src="/img/guides/improve-feature-spec-with-ai-workflow.jpg" alt="Workflow diagram" border="1px" width="100%" />

## Common use cases

- **Prevent coding agent failures** by ensuring tickets have sufficient context before assignment.
- **Streamline human review process** with clear approval workflows for AI suggestions.
- **Reduce development bottlenecks** by catching poorly defined tasks early in the process.

## Prerequisites

This guide assumes the following:
- You have a Port account and have completed the [onboarding process](https://docs.port.io/getting-started/overview).
- [Port's Jira integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/project-management/jira/) is installed in your account.
- You have access to [create and configure AI agents](https://docs.port.io/ai-interfaces/ai-agents/overview#getting-started-with-ai-agents) in Port.
- You have a coding agent setup (like [Claude Code](https://docs.port.io/guides/all/trigger-claude-code-from-port), [GitHub Copilot](https://docs.port.io/guides/all/trigger-github-copilot-from-port), or similar) that can be triggered via webhook.

:::tip Alternative integrations and coding agents
While this guide uses Jira for ticket management, you can adapt it for other project management tools like Linear, Asana, or Azure DevOps. Additionally, you can integrate with various coding agents including Claude Code, GitHub Copilot, Devin, or any other AI coding assistant that accepts webhook triggers.
:::

## Set up data model

We will configure the necessary blueprints and scorecards to support our AI triage workflow.

### Create Feature blueprint

To implement the AI triage system, we need a blueprint to store different features (tickets) from your project management tool. This blueprint will track the AI readiness status, triage stages, and enrichment suggestions for each feature.

:::info If you already have Jira integration installed
Port's Jira integration creates a `jiraIssue` blueprint by default. You can extend this existing blueprint by adding the following properties to enable AI triage functionality:

1. Go to the [builder](https://app.getport.io/settings/data-model) page of your portal.
2. Select the `Jira Issue` blueprint.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration under the `properties` schema:

<details>
<summary><b>Extended Jira ticket blueprint (Click to expand)</b></summary>

```json showLineNumbers
      "description": {
        "type": "string",
        "title": "Description",
        "description": "Detailed description of the issue",
        "format": "markdown"
      },
      "current_stage": {
        "icon": "DefaultProperty",
        "title": "Triage Stage",
        "description": "Current triage stage of the issue",
        "type": "string",
        "default": "Not started",
        "enum": [
          "Awaiting approval",
          "Not started",
          "Draft",
          "Approved"
        ],
        "enumColors": {
          "Awaiting approval": "yellow",
          "Not started": "lightGray",
          "Draft": "orange",
          "Approved": "green"
        }
      },
      "confidence_score": {
        "type": "number",
        "title": "Confidence Score",
        "description": "AI's assessment of readiness for coding agent (0-100)",
        "minimum": 0,
        "maximum": 100
      },
      "ai_suggested_description": {
        "type": "string",
        "title": "AI Suggested Description",
        "description": "AI-generated suggestions for improving the ticket",
        "format": "markdown"
      },
      "prioritized": {
        "type": "boolean",
        "title": "Prioritized"
      }
```
</details>

The rest of this guide will reference `jira_ticket` as the blueprint identifier.
:::

If you don't have Jira integration or want to create a custom blueprint, follow these steps:

1. Go to the [builder](https://app.getport.io/settings/data-model) page of your portal.
2. Click on `+ Blueprint`.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration:

<details>
<summary><b>Jira ticket blueprint (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "jira_ticket",
  "title": "Feature",
  "icon": "Jira",
  "schema": {
    "properties": {
      "status": {
        "type": "string",
        "title": "Status",
        "description": "Current status of the Jira issue"
      },
      "issue_type": {
        "type": "string",
        "title": "Issue Type",
        "description": "Type of the Jira issue (Bug, Story, Task, etc.)"
      },
      "priority": {
        "type": "string",
        "title": "Priority",
        "description": "Priority level of the issue"
      },
      "creator": {
        "type": "string",
        "title": "Creator",
        "description": "User who created the issue"
      },
      "assignee": {
        "type": "string",
        "title": "Assignee",
        "description": "User assigned to the issue"
      },
      "manager": {
        "type": "string",
        "title": "Manager",
        "description": "Manager responsible for the issue"
      },
      "description": {
        "type": "string",
        "title": "Description",
        "description": "Detailed description of the issue",
        "format": "markdown"
      },
      "date_created": {
        "type": "string",
        "title": "Date Created",
        "description": "Date when the issue was created",
        "format": "date-time"
      },
      "current_stage": {
        "icon": "DefaultProperty",
        "title": "Triage Stage",
        "description": "Current triage stage of the issue",
        "type": "string",
        "default": "Not started",
        "enum": [
          "Awaiting approval",
          "Not started",
          "Draft",
          "Approved"
        ],
        "enumColors": {
          "Awaiting approval": "yellow",
          "Not started": "lightGray",
          "Draft": "orange",
          "Approved": "green"
        }
      },
      "confidence_score": {
        "type": "number",
        "title": "Confidence Score",
        "description": "AI's assessment of readiness for coding agent (0-100)",
        "minimum": 0,
        "maximum": 100
      },
      "ai_suggested_description": {
        "type": "string",
        "title": "AI Suggested Description",
        "description": "AI-generated suggestions for improving the ticket",
        "format": "markdown"
      },
      "prioritized": {
        "type": "boolean",
        "title": "Prioritized"
      }
    },
    "required": [
      "status",
      "issue_type",
      "priority",
      "creator",
      "description",
      "date_created",
      "current_stage"
    ]
  },
  "mirrorProperties": {
    "success_criteria": {
      "title": "Success Checklist",
      "path": "jira_project.success_criteria_definition"
    }
  },
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {
    "jira_project": {
      "title": "Jira Project",
      "target": "jiraProject",
      "required": true,
      "many": false
    }
  }
}
```
</details>

5. Click `Create` to save the blueprint.

### Create AI readiness scorecard

Next, we will create a scorecard that evaluates whether tickets are ready for coding agents based on completeness criteria. This ensures that only well-defined and complete tasks reach your AI coding assistants, preventing wasted compute resources and failed runs.

The scorecard evaluates tickets based on three key readiness criteria:
- Whether the ticket has been prioritized for development.
- Current stage status (must be approved).
- Assignment status (requires an assignee).

1. Open the newly created `Feature` blueprint.
2. Click on `+ Scorecard`.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration:

<details>
<summary><b>AI readiness scorecard (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "ai_readiness_stage",
  "title": "AI Readiness Stage",
  "rules": [
    {
      "identifier": "readiness_status",
      "level": "Ready for coding agent",
      "query": {
        "combinator": "and",
        "conditions": [
          {
            "operator": "=",
            "property": "prioritized",
            "value": true
          },
          {
            "operator": "=",
            "property": "current_stage",
            "value": "Approved"
          },
          {
            "operator": "isNotEmpty",
            "property": "assignee"
          }
        ]
      },
      "description": "Ticket has been prioritized, approved, and assigned",
      "title": "Readiness Status"
    }
  ],
  "levels": [
    {
      "color": "red",
      "title": "Not ready for coding agent"
    },
    {
      "color": "green",
      "title": "Ready for coding agent"
    }
  ]
}
```
</details>

5. Click `Create` to save the scorecard

<img src="/img/guides/ai-triage-scorecard-entity.png" border="1px" width="70%"/>


## Create self-service actions

We will create three self-service actions to handle the triage workflow: improving tickets with AI suggestions, approving suggestions, and requesting refinements.

### Create AI improvement action

This action allows the AI agent to suggest improvements to ticket descriptions.

1. Go to the [self-service](https://app.getport.io/self-serve) page of your portal.
2. Click on `+ New Action`.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration:

<details>
<summary><b>Ask AI to improve ticket action (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "ask_ai_to_improve_on_ticket",
  "title": "Ask AI to Improve Ticket",
  "description": "Self-service action that enriches tickets with additional context based on AI suggestions",
  "trigger": {
    "type": "self-service",
    "operation": "CREATE",
    "userInputs": {
      "properties": {
        "ai_suggested_description": {
          "title": "AI Suggested Description",
          "icon": "DefaultProperty",
          "type": "string",
          "format": "markdown"
        },
        "confidence_score": {
          "icon": "DefaultProperty",
          "type": "number",
          "title": "Confidence Score",
          "maximum": 100,
          "minimum": 0,
          "description": "The estimated confidence score for the current ticket description"
        },
        "current_stage": {
          "type": "string",
          "title": "Current Stage",
          "enum": [
            "Awaiting approval",
            "Not started",
            "Draft",
            "Approved"
          ],
          "enumColors": {
            "Awaiting approval": "yellow",
            "Not started": "lightGray",
            "Draft": "orange",
            "Approved": "green"
          }
        },
        "ticket": {
          "type": "string",
          "blueprint": "jira_ticket",
          "title": "Ticket",
          "format": "entity"
        }
      },
      "required": [
        "confidence_score",
        "current_stage",
        "ticket"
      ],
      "order": [
        "ticket",
        "ai_suggested_description",
        "confidence_score",
        "current_stage"
      ]
    }
  },
  "invocationMethod": {
    "type": "UPSERT_ENTITY",
    "blueprintIdentifier": "jira_ticket",
    "mapping": {
      "identifier": "{{ .inputs.ticket.identifier }}",
      "properties": {
        "ai_suggested_description": "{{ .inputs.ai_suggested_description }}",
        "confidence_score": "{{ .inputs.confidence_score }}",
        "current_stage": "{{ .inputs.current_stage }}"
      }
    }
  },
  "requiredApproval": false
}
```
</details>

5. Click `Save` to create the action.

### Create approval action

This action allows human reviewers to approve or reject AI suggestions.

1. Go back to the [self-service](https://app.getport.io/self-serve) page of your portal.
2. Click on `+ New Action`.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration:

<details>
<summary><b>Approve AI suggestions action (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "approve_ai_suggested_ticket_descripted",
  "title": "Approve AI Suggestions",
  "description": "Approves the suggested ticket description from the triage agent and proceeds to the next step",
  "trigger": {
    "type": "self-service",
    "operation": "DAY-2",
    "userInputs": {
      "properties": {
        "decision": {
          "type": "string",
          "title": "Decision",
          "enum": [
            "Approve & Proceed",
            "Reject"
          ],
          "icon": "DefaultProperty",
          "enumColors": {
            "Approve & Proceed": "green",
            "Reject": "red"
          }
        }
      },
      "required": [
        "decision"
      ],
      "order": [
        "title_section",
        "decision"
      ],
      "titles": {
        "title_section": {
          "title": "Approve to apply the AI's suggested description and mark as ready, or reject to keep current state."
        }
      }
    },
    "blueprintIdentifier": "jira_ticket"
  },
  "invocationMethod": {
    "type": "UPSERT_ENTITY",
    "blueprintIdentifier": "jira_ticket",
    "mapping": {
      "identifier": "{{ .entity.identifier }}",
      "properties": {
        "description": "{{if (.inputs.decision == (\"Approve & Proceed\")) then .entity.properties.ai_suggested_description else .entity.properties.description end}}",
        "current_stage": "{{if (.inputs.decision == (\"Approve & Proceed\")) then \"Approved\" else .entity.properties.current_stage end}}",
        "confidence_score": 95
      }
    }
  },
  "requiredApproval": false
}
```
</details>

5. Click `Save` to create the action.

### Create retry action

This action allows users to provide feedback and request AI to refine its suggestions.

1. Go back to the [self-service](https://app.getport.io/self-serve) page of your portal.
2. Click on `+ New Action`.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration:

<details>
<summary><b>Retry AI suggestions action (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "retry_ai_suggested_ticket_description",
  "title": "Retry AI Suggestions",
  "description": "Request AI to re-evaluate and improve the suggested ticket description based on your feedback.",
  "trigger": {
    "type": "self-service",
    "operation": "DAY-2",
    "userInputs": {
      "properties": {
        "notes": {
          "type": "string",
          "title": "Feedback Notes",
          "description": "Provide guidance or missing details to help the AI improve its next suggestion."
        }
      },
      "required": [],
      "order": [
        "notes"
      ]
    },
    "condition": {
      "type": "SEARCH",
      "rules": [
        {
          "operator": "isNotEmpty",
          "property": "ai_suggested_description"
        }
      ],
      "combinator": "and"
    },
    "blueprintIdentifier": "jira_ticket"
  },
  "invocationMethod": {
    "type": "WEBHOOK",
    "url": "https://api.getport.io/v1/agent/ticket_triage_agent/invoke",
    "agent": false,
    "synchronized": true,
    "method": "POST",
    "headers": {
      "RUN_ID": "{{ .run.id }}",
      "Content-Type": "application/json"
    },
    "body": {
      "prompt": "The Project Manager has requested changes to the AI-suggested description.\n\nFeedback:\n{{ .inputs.notes }}\n\nTicket Details:\n- Jira Ticket ID: {{ .entity.identifier }}\n- Current Description: {{ .entity.properties.description }}\n- AI Suggested Description: {{ .entity.properties.ai_suggested_description }}\n- Success Criteria: {{ .entity.properties.success_criteria }}",
      "labels": {
        "source": "request_changes_to_jira_task_action",
        "jira_ticket_id": "{{ .entity.identifier }}"
      }
    }
  },
  "requiredApproval": false
}
```
</details>

5. Click `Save` to create the action.

## Create AI agent

Now we will create the AI agent that evaluates tickets and suggests improvements.

1. Go to the [AI Agents](https://app.getport.io/_ai_agents) page of your portal.
2. Click on `+ AI Agent`.
3. Toggle `Json mode` on.
4. Copy and paste the following JSON schema:

<details>
<summary><b>Ticket triage AI agent (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "ticket_triage_agent",
  "title": "Ticket Triage Agent",
  "icon": "Details",
  "team": [],
  "properties": {
    "description": "An agent that evaluate whether a ticket has sufficient context and well-defined requirements for successful execution by a coding agent",
    "status": "active",
    "prompt": "Your task is to evaluate, score, and update each ticket to determine whether it's ready for execution by a coding agent, and if not, produce a clear and complete version that would satisfy the criteria.\n\n### Steps\n\n1. **Evaluate Context:** Compare the ticket description to the project's success criteria or to a template embedded in the ticket's description. If the ticket description contains a template/PRD structure, treat that template as canonical: fill each template section with specific, actionable content (do not replace or remove headings unless improving clarity). If no template is present, generate a concise, well-structured Markdown description meeting the success criteria.\n2. **Identify Gaps:** Determine what specs, context, or acceptance criteria are missing.\n3. **Score (0–100):** Rate the ticket's completeness and clarity.\n4. **Assign Stage**: Determine the appropriate current stage for the ticket using either \"Awaiting approval\" or \"Approved\".\n\n## Response Rules\n\n1. ALWAYS respond by calling the `ask_ai_to_improve_on_ticket` self-service action with:\n\n   ```json\n   {\n     \"actionIdentifier\": \"ask_ai_to_improve_on_ticket\",\n     \"properties\": {\n       \"ticket\": \"<provided entity identifier>\",\n       \"current_stage\": \"<determined stage>\",\n       \"confidence_score\": <number 0-100>\n       \"ai_suggested_description\": \"<markdown-formatted with filled template or empty if already perfect>\"\n     }\n   }\n   ```\n\n### Rules\n\n* Always include `confidence_score` and `current_stage`.\n* If score < 90 → generate a complete, well-structured description in Markdown that fills all missing context, acceptance criteria, and technical details.\n* If score ≥ 90 → leave `ai_suggested_description` with empty string (ticket appears complete).\n* Be concise, actionable, and technically accurate — focus on what makes the ticket immediately executable by a coding agent.\n* Avoid repetition or irrelevant content",
    "execution_mode": "Automatic",
    "tools": [
      "^(list|get|search|track|describe)_.*",
      "run_ask_ai_to_improve_on_ticket"
    ]
  },
  "relations": {}
}
```
</details>

5. Click `Create` to save the agent.

<MCPCapabilitiesHint/>

## Set up automations

We'll create two automations to orchestrate the AI triage workflow:

1. Trigger the AI agent when new tickets are created or synced.
2. Automatically assign coding agents to approved tickets.

### Create ticket sync trigger automation

This automation triggers the AI triage agent whenever a new Jira ticket is created or synced to the Catalog.

1. Go to the [automations](https://app.getport.io/settings/automations) page of your portal.
2. Click on `+ Automation`.
3. Copy and paste the following JSON schema:

<details>
<summary><b>Ticket sync trigger automation (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "trigger_triage_agent_on_sync",
  "title": "Trigger Triage Agent On Ticket Creation",
  "description": "Automation that triggers AI triage analysis when a Jira ticket is created or synced to the catalog",
  "icon": "AI",
  "trigger": {
    "type": "automation",
    "event": {
      "type": "ENTITY_CREATED",
      "blueprintIdentifier": "jira_ticket"
    },
    "condition": {
      "type": "JQ",
      "expressions": [],
      "combinator": "and"
    }
  },
  "invocationMethod": {
    "type": "WEBHOOK",
    "url": "https://api.getport.io/v1/agent/ticket_triage_agent/invoke",
    "agent": false,
    "synchronized": true,
    "method": "POST",
    "headers": {
      "RUN_ID": "{{ .run.id }}",
      "Content-Type": "application/json"
    },
    "body": {
      "prompt": "Here is the created Jira ticket:\n Jira Ticket identifier: {{.event.diff.after.identifier}}\n\nJira Ticket Title:{{.event.diff.after.title}}\n\nFull Jira Ticket Entity: {{.event.diff.after.properties}}\n",
      "labels": {
        "source": "auto_enhance_jira_task_automation",
        "jira_ticket_id": "{{ .event.diff.after.identifier }}"
      }
    }
  },
  "publish": true
}
```
</details>

4. Click `Create` to save the automation.

### Create coding agent assignment automation

This automation automatically assigns coding agents to tickets once they're approved and ready.

1. Go back to the [automations](https://app.getport.io/settings/automations) page of your portal.
2. Click on `+ Automation`.
3. Copy and paste the following JSON schema:

<details>
<summary><b>Auto-assign coding agent automation (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "auto_assign_claude_on_ready_for_ai",
  "title": "Auto-Assign Claude Coding Agent on Ready for AI",
  "description": "Automatically triggers Claude to begin code generation once a Jira ticket is approved and marked as 'Ready for AI'. This ensures a seamless handoff from human triage to AI execution.",
  "trigger": {
    "type": "automation",
    "event": {
      "type": "ENTITY_UPDATED",
      "blueprintIdentifier": "jira_ticket"
    },
    "condition": {
      "type": "JQ",
      "expressions": [
        ".diff.before.scorecards.ai_readiness_stage.level != \"Ready for coding agent\"",
        ".diff.after.scorecards.ai_readiness_stage.level == \"Ready for coding agent\""
      ],
      "combinator": "and"
    }
  },
  "invocationMethod": {
    "type": "WEBHOOK",
    "url": "https://api.getport.io/v1/actions/run_claude_code_demo/runs",
    "agent": false,
    "synchronized": true,
    "method": "POST",
    "headers": {
      "RUN_ID": "{{ .run.id }}",
      "Content-Type": "application/json"
    },
    "body": {
      "properties": {
        "service": "<GITHUB-ORG>/<REPO>",
        "prompt": "You are a senior software engineer tasked with implementing the following approved ticket: '{{ .event.diff.after.title }}'.\n\nBase your implementation on the approved technical description below:\n\n{{ .event.diff.after.properties.description }}\n\nOnce complete, generate a pull request summarizing what was implemented and why."
      }
    }
  },
  "publish": true
}
```
</details>

:::tip Customize coding agent integration
Replace the **service** with the name of the Github repository. Also, replace the webhook URL and payload structure in the automation to match your preferred coding agent's API. You can integrate with Claude Code, GitHub Copilot, Devin, or any other AI coding assistant that accepts webhook triggers. 
:::

4. Click `Create` to save the automation.

## Test the workflow

Now let us test the complete AI triage workflow to ensure everything works correctly.

### Create a test ticket

1. Go to your Jira instance and create a new ticket with minimal information, for example:
   - **Title**: "Implement Product Search and Filtering on Storefront"
   - **Description**: "Users can't search for products on the website"
   - **Labels**: Add any relevant labels

### Verify AI triage analysis

1. Go to your Port catalog and find the synced Jira ticket
2. Check that the AI agent has analyzed the ticket and provided:
   - A confidence score
   - A suggested improved description (if the original was incomplete)
   - An appropriate current stage

<img src="/img/guides/ai-triage-sample-ai-description.png" border="1px" width="80%" />

### Test human review process

1. If the AI suggested improvements, use the `Approve AI Suggestions` action to review and approve the changes
2. If you want to request refinements, use the `Retry AI Suggestions `action to provide feedback

<img src="/img/guides/ai-triage-test-workflow.png" border="1px" width="80%" />

### Verify coding agent assignment

1. Once a ticket is approved and marked as `Ready for coding agent`, check that your coding agent is automatically triggered
2. Verify that the coding agent receives the enriched ticket description with all necessary context

<img src="/img/guides/ai-triage-pr-creation.png" border="1px" width="80%" />


## Related guides

- [Automatically resolve tickets with coding agents](/guides/all/automatically-resolve-tickets-with-coding-agents)
- [Trigger Claude Code from Port](/guides/all/trigger-claude-code-from-port)
- [Trigger GitHub Copilot from Port](/guides/all/trigger-github-copilot-from-port)
- [Track AI-driven pull requests](/guides/all/track-ai-driven-pull-requests)
