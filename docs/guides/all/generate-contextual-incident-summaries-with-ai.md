---
displayed_sidebar: null
description: Learn how to leverage Port's AI capabilities to enhance incident management with contextual summaries and automated Slack notifications.
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Generate contextual incident summaries with AI

This guide demonstrates how to enhance your incident management workflow using Port's AI capabilities. You will learn how to create an AI agent that generates contextual incident summaries and sends slack notification with relevant technical context.

<img src="/img/guides/incident-ai-summary-workflow.png" border="1px" width="100%" />


## Common use cases

- Automatically generate contextual summaries when incidents are updated
- Send notifications to Slack with relevant technical context
- Provide on-call engineers with enriched incident information


## Prerequisites

This guide assumes the following:
- You have a Port account and have completed the [onboarding process](https://docs.port.io/getting-started/overview).
- [PagerDuty integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/incident-management/pagerduty/) is installed in your account.
- [GitHub integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/git/github/) is installed in your account.
- You have access to [create and configure AI agents](https://docs.port.io/ai-agents/overview#getting-started-with-ai-agents) in Port.

:::tip Alternative integrations
While this guide uses PagerDuty and GitHub, you can adapt it for other incident management tools like OpsGenie or FireHydrant, and other Git providers like GitLab or Azure DevOps.
:::


## Set up data model

We will create and configure blueprints to support our AI-enhanced incident management workflow. This includes setting up the incident data model and enriching it with repository metadata.


### Update the incident and service blueprints

To enable AI-generated summaries and Slack notifications, update your blueprints as follows:

1. **Add an `ai_summary` property to the incident blueprint**
   - Go to the [builder](https://app.getport.io/settings/data-model) page of your portal.
   - Find and select your incident blueprint (e.g., `pagerdutyIncident`).
   - Click on `{...} Edit JSON`.
   - Add the following property to the `properties` section:
    
      <details>
      <summary><b>AI summary property (Click to expand)</b></summary>

      ```json showLineNumbers
      "ai_summary": {
        "type": "string",
        "title": "AI Summary"
      }
      ```
      </details>

   - Click `Save` to update the blueprint.

2. **Add a `slack_channel` property to the service blueprint**
   - Go to the [builder](https://app.getport.io/settings/data-model) page of your portal.
   - Find and select your service blueprint (e.g., `pagerdutyService`).
   - Click on `{...} Edit JSON`.
   - Add the following property to the `properties` section:
    
      <details>
      <summary><b>Slack channel property (Click to expand)</b></summary>

      ```json showLineNumbers
      "slack_channel": {
        "type": "string",
        "title": "Slack Channel"
      }
      ```
      </details>

   - Click `Save` to update the blueprint.


### Create repository blueprint

We will create a repository blueprint to store metadata that will be used to enrich incident summaries.

1. Go to the [builder](https://app.getport.io/settings/data-model) page of your portal.
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.
4. Add this JSON schema:

    <details>
    <summary><b>Repository blueprint (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "githubRepository",
      "title": "Repository",
      "icon": "GitHub",
      "schema": {
        "properties": {
          "url": {
            "type": "string",
            "format": "url",
            "title": "URL"
          },
          "description": {
            "type": "string",
            "title": "Description"
          },
          "language": {
            "type": "string",
            "title": "Language"
          },
          "last_push": {
            "type": "string",
            "format": "date-time",
            "title": "Last Push Date"
          },
          "last_contributor": {
            "type": "string",
            "title": "Last Contributor"
          },
          "vulnerabilities": {
            "type": "number",
            "title": "Known Vulnerabilities"
          },
          "readme": {
            "type": "string",
            "title": "README Content",
            "format": "markdown"
          }
        },
        "required": []
      },
      "mirrorProperties": {},
      "calculationProperties": {},
      "aggregationProperties": {},
      "relations": {
        "service": {
          "title": "Service",
          "target": "service",
          "required": false,
          "many": false
        }
      }
    }
    ```
    </details>

5. Click `Save` to create the blueprint.


### Add repository relation and mirror properties

We will now enhance the incident blueprint with mirror properties from the repository to provide better context for AI summaries.

1. Go to the [builder](https://app.getport.io/settings/data-model) page of your portal.
2. Find the `pagerdutyIncident` blueprint and click on it.
3. Add a relation to the `Repository` blueprint.
4. Add the following mirror properties:

    <details>
    <summary><b>Mirror properties configuration (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "mirrorProperties": {
        "repository_last_push": {
          "title": "Repository Last Push",
          "path": "repository.last_push"
        },
        "repository_last_contributor": {
          "title": "Repository Last Contributor", 
          "path": "repository.last_contributor"
        },
        "repository_vulnerabilities": {
          "title": "Repository Vulnerabilities",
          "path": "repository.vulnerabilities"
        },
        "repository_readme": {
          "title": "Repository README",
          "path": "repository.readme"
        },
        "slack_channel": {
          "title": "Slack Channel",
          "path": "pagerdutyService.slack_channel"
        }
      }
    }
    ```
    </details>

5. Click `Save` to apply the mirror properties.


## Create AI agent

Next, we will create an AI agent that generates helpful incident summaries with contextual information.


### Configure the incident summary AI agent

1. Go to the [AI Agents](https://app.getport.io/_ai_agents) page of your portal.
2. Click on `+ AI Agent`.
3. Toggle `Json mode` on.
4. Copy and paste the following JSON schema:

    <details>
    <summary><b>Incident Summary AI agent configuration (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "incident_summary_ai",
      "title": "Incident Summary AI",
      "icon": "Alert",
      "properties": {
        "description": "AI agent that generates helpful incident summaries and sends them to Slack with on-call tagging",
        "status": "active",
        "allowed_blueprints": [
          "pagerdutyOncall",
          "pagerdutyIncident",
          "pagerdutyService",
          "pagerdutyUser",
          "pagerdutySchedule",
          "pagerdutyEscalationPolicy",
          "_user",
          "service",
          "githubRepository",
          "running_service",
          "githubPullRequest"
        ],
        "prompt": "You are an expert incident management AI agent generating clear, contextual summaries for Slack notifications.\nYour task is to produce Slack-compatible summaries for incident updates shared with engineering and on-call teams. Focus on clarity, relevance, and next steps.\n\nYour Slack summary MUST follow this structure and tone:\n\n- 🚨 *Problem:* Brief summary of what changed and why it triggered this update.\n- 📊 *Impact:* Which services or what is affected? Any delivery, uptime, or user-facing issues?\n- 🧠 *Insights / Diagnostics:* Add key technical context from repository metadata: last commit, contributor, vulnerabilities, etc or draw from your technical knowledge on what would have caused this.\n- 🔧 *Action Required:* List next steps for the on-call team. Be specific about what they need to check or resolve.\n\n🔧 **Slack Output Rules**\n* NEVER USER `**bold**` or `[text](url)` — instead use:\n    * `*bold*` for emphasis\n     * `<https://url.com|Label>` for links\n* Use emoji to indicate sections: `🚨`, `📋`, `👥`, `🔄`\n* Use bullet points (`-`) for clarity\n* Separate sections with one line space (not headers)\n* Never include raw markdown headers like `###` or `---`\n* Your final output **must** look clean when copy-pasted into a Slack message.\n\n## Sample Response Format\n🚨 *Incident Update: CI Pipeline Timeout for ci-runner-template*\n\n*Problem:*\nCI pipeline for `ci-runner-template` timed out, triggering incident reassignment.\n\n*Impact:*\nDeployment or testing processes in the aggregated service may be blocked for this repository. Risk of delayed releases.\n\n*Insights/Diagnostics:*\n- Repository is actively maintained (last push: 2025-07-20 by Maria).\n- Maria is not currently on-call. Assigned engineers: Omri and Tal.\n- 3 known vulnerability exists—could be a contributing factor.\n\n🔧 *Action Required:*\n- Omri and Tal to review Maria's recent commits.\n- Investigate pipeline logs for signs of external failures or internal misconfigurations.\n- Assess whether the known vulnerability is impacting build steps.\n",
        "execution_mode": "Automatic",
        "conversation_starters": [
          "Generate a status update summary",
          "Create a progress update for this incident",
          "Summarize the resolution for stakeholders",
          "Generate an escalation notification"
        ]
      },
      "relations": {}
    }
    ```
    </details>

5. Click `Create` to save the agent.


## Set up automations

We will create three automations to orchestrate the AI-enhanced incident management workflow:

1. Trigger the AI agent when incidents are updated
2. Update the incident with the AI summary response
3. Send the summary to Slack


### Automation to trigger AI agent

1. Go to the [automations](https://app.getport.io/settings/automations) page of your portal.
2. Click on `+ Automation`.
3. Copy and paste the following JSON schema:

    <details>
    <summary><b>Auto-generate incident summary automation (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "auto_generate_incident_summary_on_update",
      "title": "Auto-Generate Incident Summary on Update",
      "description": "Automatically generate incident summary on update",
      "trigger": {
        "type": "automation",
        "event": {
          "type": "ENTITY_UPDATED",
          "blueprintIdentifier": "pagerdutyIncident"
        },
        "condition": {
          "type": "JQ",
          "expressions": [
            ".diff.after.properties.status != .diff.before.properties.status or .diff.after.properties.urgency != .diff.before.properties.urgency or .diff.after.properties.priority != .diff.before.properties.priority"
          ],
          "combinator": "or"
        }
      },
      "invocationMethod": {
        "type": "WEBHOOK",
        "url": "https://api.getport.io/v1/agent/incident_summary_ai/invoke",
        "agent": false,
        "synchronized": true,
        "method": "POST",
        "headers": {
          "RUN_ID": "{{ .run.id }}",
          "Content-Type": "application/json"
        },
        "body": {
          "prompt": "Generate a Slack summary for incident {{ .event.context.entityIdentifier }}. The incident was updated with the following changes:\n\nPrevious Status: {{ .event.diff.before.properties.status }}\nNew Status: {{ .event.diff.after.properties.status }}\nPrevious Urgency: {{ .event.diff.before.properties.urgency }}\nNew Urgency: {{ .event.diff.after.properties.urgency }}\nPrevious Priority: {{ .event.diff.before.properties.priority }}\nNew Priority: {{ .event.diff.after.properties.priority }}\n\nIncident Details:\nTitle: {{ .event.diff.after.title }}\nDescription: {{ .event.diff.after.properties.description }}\nAffected Services: {{ .event.diff.after.relations.pagerdutyService }}\nOn-Call Engineer: {{ .event.diff.after.properties.assignees }}\nAssigned Team: {{ .event.diff.after.relations.assignedTeam }}\n\nRepository Metadata:\n- README Overview: {{ .event.diff.after.properties.readme }}\n- Last Push Date: {{ .event.diff.after.properties.repository_last_push }}\n- Last Contributor: {{ .event.diff.after.properties.repository_last_contributor }}\n- Known Vulnerabilities: {{ .event.diff.after.properties.repository_vulnerabilities }}\n\nIMPORTANT: This will be sent directly to Slack. You MUST format the response using Slack-compatible syntax:\n- Use *bold* for emphasis\n- Use emojis inline (🚨, 📋, 👥, etc.)\n- Use dashes - for bullet points\n- Use <https://url|label> for links\n- DO NOT use headers (###), raw markdown, or [label](url)\n- Add single line breaks between sections for readability\n\nYour summary must adhere to the problem/impact/insight/action format",
        "labels": {
          "source": "Incident Update Summary",
          "entityIdentifier": "{{ .event.context.entityIdentifier }}",
          "blueprintIdentifier": "{{ .event.context.blueprintIdentifier }}"
        }
      }
    }
    ```
    </details>

4. Click `Create` to save the automation.


### Automation to update incident with AI summary

1. Go back to the [automations](https://app.getport.io/settings/automations) page of your portal.
2. Click on `+ Automation`.
3. Copy and paste the following JSON schema:

    <details>
    <summary><b>Update incident with AI summary automation (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "update_incident_summary",
      "title": "Update Incident Summary",
      "description": "Automation to update the incident with the response of the AI incident summary",
      "icon": "Pagerduty",
      "trigger": {
        "type": "automation",
        "event": {
          "type": "ENTITY_UPDATED",
          "blueprintIdentifier": "_ai_invocations"
        },
        "condition": {
          "type": "JQ",
          "expressions": [
            ".diff.after.relations.agent == \"incident_summary_ai\"",
            ".diff.after.properties.status == \"Completed\""
          ],
          "combinator": "and"
        }
      },
      "invocationMethod": {
        "type": "UPSERT_ENTITY",
        "blueprintIdentifier": "pagerdutyIncident",
        "mapping": {
          "identifier": "{{ .event.diff.after.properties.labels.entityIdentifier }}",
          "properties": {
            "ai_summary": "{{ .event.diff.after.properties.response }}"
          }
        }
      },
      "publish": true
    }
    ```
    </details>

4. Click `Create` to save the automation.


### Automation to send summary to Slack

1. Go back to the [automations](https://app.getport.io/settings/automations) page of your portal.
2. Click on `+ Automation`.
3. Copy and paste the following JSON schema:

    <details>
    <summary><b>Send AI summary to Slack automation (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "send_ai_summary_to_slack",
      "title": "Send AI Summary to Slack",
      "description": "Automation to post the response of the AI incident summary to Slack",
      "icon": "Slack",
      "trigger": {
        "type": "automation",
        "event": {
          "type": "ENTITY_UPDATED",
          "blueprintIdentifier": "pagerdutyIncident"
        },
        "condition": {
          "type": "JQ",
          "expressions": [
            ".diff.after.properties.ai_summary != .diff.before.properties.ai_summary"
          ],
          "combinator": "and"
        }
      },
      "invocationMethod": {
        "type": "WEBHOOK",
        "url": "https://slack.com/api/chat.postMessage",
        "agent": false,
        "synchronized": true,
        "method": "POST",
        "headers": {
          "RUN_ID": "{{ .run.id }}",
          "Content-Type": "application/json; charset=utf-8",
          "Authorization": "Bearer {{ .secrets.__SLACK_APP_BOT_TOKEN_<TEAM-ID> }}"
        },
        "body": {
          "channel": "{{ .event.diff.after.properties.slack_channel }}",
          "username": "Incident AI Assistant",
          "text": "{{ .event.diff.after.properties.ai_summary }}"
        }
      },
      "publish": true
    }
    ```
    </details>

4. Click `Create` to save the automation.

:::caution Slack token setup
You will need to add your Slack bot token as a secret in Port. Head to our [guide on how to install the Slack app](https://docs.port.io/ai-agents/slack-app#installation).
:::


## Test the workflow

With our AI agent and automations configured, let us test the complete workflow to ensure everything works correctly.

<h4> Trigger a test incident update </h4>

1. Go to the [software catalog](https://app.getport.io/organization/catalog) page of your portal.
2. Find an existing PagerDuty incident or create a test incident.
3. Update the incident's status, urgency, or priority to trigger the automation.

<h4> Verify the AI summary generation </h4>

1. Go to the [AI Agents](https://app.getport.io/_ai_agents) page of your portal.
2. Click on the `Incident Summary AI` agent.
3. Check the `AI Invocations` tab to see the generated summary.

<h4> Check Slack notification </h4>

The AI-generated summary should appear in your configured Slack channel with proper formatting and context.


## Best practices

To get the most out of your AI-enhanced incident management:

1. **Monitor AI responses**: Regularly review the quality and accuracy of AI-generated summaries.

2. **Refine the prompt**: Adjust the AI agent prompt based on your team's specific needs and communication style.

3. **Customize Slack channels**: Configure different Slack channels for different teams or incident severities.

4. **Add more context**: Consider enriching incidents with additional metadata from other integrations.