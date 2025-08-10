---
displayed_sidebar: null
description: Learn how to leverage Port's AI capabilities to enhance incident management with contextual incident updates and automated Slack notifications.
---

# Generate incident updates with AI

When you are busy fixing an incident, you do not have time to write updates. Yes, others still need to know what is going on. In this guide, we will learn how to build an AI agent that generates incident updates and sends Slack notifications with relevant technical context.

<img src="/img/guides/incident-update-with-ai-workflow.png" border="1px" width="100%" />


## Common use cases

- Automatically generate contextual incident updates when incidents are updated
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

To enable AI-generated incident updates and Slack notifications, update your blueprints as follows:

1. **Add an `ai_update` property to the incident blueprint**
   - Go to the [builder](https://app.getport.io/settings/data-model) page of your portal.
   - Find and select your incident blueprint (e.g., `pagerdutyIncident`).
   - Click on `{...} Edit JSON`.
   - Add the following property to the `properties` section:
    
      <details>
      <summary><b>AI update property (Click to expand)</b></summary>

      ```json showLineNumbers
      "ai_update": {
        "type": "string",
        "title": "AI Update"
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

      :::tip Slack channel configuration
      This step is optional. You can choose to:
      - Send notifications to a static channel (hardcoded in the automation)
      - Store the Slack channel in other hierarchies (e.g., on the incident itself)
      - Use different channels based on incident severity or team
      :::


### Update repository blueprint with additional context

When installing the GitHub app, the `Repository` blueprint is created by default. However, we need to add additional properties to enrich incident updates with repository metadata.

1. Go to the [builder](https://app.getport.io/settings/data-model) page of your portal.
2. Find and select your existing repository blueprint (e.g., `githubRepository`).
3. Click on `{...} Edit JSON`.
4. Add the following properties to the `properties` section:

    <details>
    <summary><b>Additional repository properties (Click to expand)</b></summary>

    ```json showLineNumbers
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
    "vulnerabilities": {
      "type": "number",
      "title": "Known Vulnerabilities",
      "description": "Number of critical security vulnerabilities"
    }
    ```
    </details>

5. Click `Save` to update the blueprint.


### Add repository relation and mirror properties

We will now enhance the incident blueprint with mirror properties from the repository blueprint to provide better context for AI-generated incident updates.

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


## Set up self-service action

We will create a self-service action that the AI agent can run automatically to update the incident with the AI update. This approach provides more flexibility and allows manual triggering.

1. Go to the [self-service](https://app.getport.io/self-serve) page of your portal.
2. Click on `+ New Action`.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration:

    <details>
    <summary><b>Update incident with AI update action (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "update_incident_with_ai_update",
      "title": "Update Incident with AI Update",
      "icon": "Alert",
      "description": "Updates an incident with the AI-generated update",
      "trigger": {
        "type": "self-service",
        "operation": "DAY-2",
        "userInputs": {
          "properties": {
            "ai_update": {
              "title": "AI Update",
              "type": "string",
              "format": "markdown"
            }
          },
          "required": [
            "ai_update"
          ],
          "order": [
            "ai_update"
          ]
        },
        "blueprintIdentifier": "pagerdutyIncident"
      },
      "invocationMethod": {
        "type": "WEBHOOK",
        "url": "https://api.getport.io/v1/blueprints/pagerdutyIncident/entities/{{ .entity.identifier }}",
        "agent": false,
        "synchronized": true,
        "method": "PATCH",
        "headers": {
          "RUN_ID": "{{ .run.id }}",
          "Content-Type": "application/json"
        },
        "body": {
          "properties": {
            "ai_update": "{{ .inputs.ai_update }}"
          }
        }
      },
      "requiredApproval": false
    }
    ```
    </details>

5. Click `Save` to create the action.


## Create AI agent

Next, we will create an AI agent that generates helpful incident updates with contextual information.


### Configure the incident update AI agent

1. Go to the [AI Agents](https://app.getport.io/_ai_agents) page of your portal.
2. Click on `+ AI Agent`.
3. Toggle `Json mode` on.
4. Copy and paste the following JSON schema:

    <details>
    <summary><b>Incident update AI agent configuration (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "incident_update_ai",
      "title": "Incident Update AI",
      "icon": "Alert",
      "team": [],
      "properties": {
        "description": "AI agent that generates contextual incident updates and sends them to Slack with on-call tagging",
        "status": "active",
        "allowed_blueprints": [
          "pagerdutyIncident",
          "service",
          "githubRepository"
        ],
        "allowed_actions": [
          "update_incident_with_ai_update"
        ],
        "prompt": "You are an expert incident management AI agent generating clear, contextual incident updates for Slack notifications.\nYour task is to produce Slack-compatible incident updates for incident changes shared with engineering and on-call teams. Focus on clarity, relevance, and next steps.\n\nYour Slack incident update MUST follow this structure and tone:\n\n- 🚨 *Problem:* Brief description of what changed and why it triggered this update.\n- 📊 *Impact:* Which services or what is affected? Any delivery, uptime, or user-facing issues?\n- 🧠 *Insights / Diagnostics:* Add key technical context from repository metadata: last commit, contributor, vulnerabilities, etc or draw from your technical knowledge on what would have caused this.\n- 🔧 *Action Required:* List next steps for the on-call team. Be specific about what they need to check or resolve.\n\n🔧 **Slack Output Rules**\n* NEVER USE `**bold**` or `[text](url)` — instead use:\n    * `*bold*` for emphasis\n     * `<https://url.com|Label>` for links\n* Use emoji to indicate sections: `🚨`, `📋`, `👥`, `🔄`\n* Use bullet points (`-`) for clarity\n* Separate sections with one line space (not headers)\n* Never include raw markdown headers like `###` or `---`\n* Your final output **must** look clean when copy-pasted into a Slack message.\n\n*After generating your incident update, you MUST ALWAYS run the 'update_incident_with_ai_update' action to save the update to the incident record.*\n\n## Sample Response Format\n🚨 *Incident Update: API Latency Spike on analytics-service*\n\n*Problem:*\n`analytics-service` has breached its latency SLO for the past 15 minutes. Response time spiked from 800ms to 4.5s\n\n*Impact:*\nThis service powers real-time analytics for customer dashboards. Users may experience slow or failing dashboard loads, particularly in high-traffic regions.\n\n*Insights/Diagnostics:*\n- The latest deployment (2025-07-21 13:03 UTC) introduced new filtering logic\n- Recent commits by Maria include changes to Redis query batching and fallback caching\n- Maria is not currently on-call. Assigned engineers: Omri and Tal.\n- 2 known vulnerability exists—could be a contributing factor.\n\n🔧 *Action Required:*\n- On-call engineers Marvin and Tal should roll back to the previous deploy version while isolating the Redis call regressions.\n- Re-run load tests locally with Maria's changes to confirm memory/caching issues.\n",
        "execution_mode": "Automatic",
        "conversation_starters": [
          "What is the latest update on INC-123?",
          "Generate an update for INC-123, we've found the root cause",
          "Create a Slack update for incident INC-456",
          "Summarize the current status of incident INC-789",
          "What's the latest on the database outage incident?"
        ]
      },
      "relations": {}
    }
    ```
    </details>

5. Click `Create` to save the agent.


## Set up automations

We will create two automations to orchestrate the AI-enhanced incident management workflow:

1. Trigger the AI agent when incidents are updated
2. Send the update to Slack


### Automation to trigger AI agent

1. Go to the [automations](https://app.getport.io/settings/automations) page of your portal.
2. Click on `+ Automation`.
3. Copy and paste the following JSON schema:

    <details>
    <summary><b>Auto-generate incident update automation (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "auto_generate_incident_update_on_update",
      "title": "Auto-Generate Incident Update on Update",
      "description": "Automatically generate incident update on update",
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
        "url": "https://api.getport.io/v1/agent/incident_update_ai/invoke",
        "agent": false,
        "synchronized": true,
        "method": "POST",
        "headers": {
          "RUN_ID": "{{ .run.id }}",
          "Content-Type": "application/json"
        },
        "body": {
          "prompt": "Generate a Slack incident update for incident with target identifier {{ .event.context.entityIdentifier }}. The incident was updated with the following changes:\n\nPrevious Status: {{ .event.diff.before.properties.status }}\nNew Status: {{ .event.diff.after.properties.status }}\nPrevious Urgency: {{ .event.diff.before.properties.urgency }}\nNew Urgency: {{ .event.diff.after.properties.urgency }}\nPrevious Priority: {{ .event.diff.before.properties.priority }}\nNew Priority: {{ .event.diff.after.properties.priority }}\n\nIncident Details:\nTitle: {{ .event.diff.after.title }}\nDescription: {{ .event.diff.after.properties.description }}\nAffected Services: {{ .event.diff.after.relations.service }}\nOn-Call Engineer: {{ .event.diff.after.properties.assignees }}\nAssigned Team: {{ .event.diff.after.relations.assignedTeam }}\n\nRepository Metadata:\n- README Overview: {{ .event.diff.after.properties.readme }}\n- Last Push Date: {{ .event.diff.after.properties.repository_last_push }}\n- Last Contributor: {{ .event.diff.after.properties.repository_last_contributor }}\n- Known Vulnerabilities: {{ .event.diff.after.properties.repository_vulnerabilities }}\n\nIMPORTANT: This will be sent directly to Slack. You MUST format the response using Slack-compatible syntax:\n- Use *bold* for emphasis\n- Use emojis inline (🚨, 📋, 👥, etc.)\n- Use dashes - for bullet points\n- Use <https://url|label> for links\n- DO NOT use headers (###), raw markdown, or [label](url)\n- Add single line breaks between sections for readability\n\nYour incident update must adhere to the problem/impact/insight/action format",
                      "labels": {
              "source": "Incident Update",
              "entityIdentifier": "{{ .event.context.entityIdentifier }}",
              "blueprintIdentifier": "{{ .event.context.blueprintIdentifier }}"
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
    <summary><b>Send AI incident update to Slack automation (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "send_ai_update_to_slack",
      "title": "Send AI Incident Update to Slack",
      "description": "Automation to post the response of the AI incident update to Slack",
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
            ".diff.after.properties.ai_update != .diff.before.properties.ai_update"
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
          "text": "{{ .event.diff.after.properties.ai_update }}"
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

Now let us test the complete workflow to ensure everything works correctly.

<h4> Trigger a test incident update </h4>

1. Go to the [software catalog](https://app.getport.io/organization/catalog) page of your portal.
2. Find an existing PagerDuty incident or create a test incident.
3. Update the incident's status, urgency, or priority to trigger the automation.

<h4> Verify the AI incident update generation </h4>

1. Go to the [AI Agents](https://app.getport.io/_ai_agents) page of your portal.
2. Click on the `Incident Update AI` agent.
3. Check the `AI Invocations` tab to see the generated incident update.

<h4> Check Slack notification </h4>

The AI-generated incident update should appear in your configured Slack channel with proper formatting and context.

<img src="/img/guides/incident-ai-summary-workflow.png" border="1px" width="100%" />


## Best practices

To get the most out of your AI-enhanced incident management workflow:

1. **Monitor AI responses**: Regularly review the quality and accuracy of AI-generated incident updates.

2. **Refine the prompt**: Adjust the AI agent prompt based on your team's specific needs and communication style.

3. **Customize Slack channels**: Configure different Slack channels for different teams or incident severities.

4. **Add more context**: Consider enriching incidents with additional metadata from other integrations.


## Related guide
[Communicate incident response to stakeholders](https://docs.port.io/solutions/incident-management/communicate-internally-and-externally/)