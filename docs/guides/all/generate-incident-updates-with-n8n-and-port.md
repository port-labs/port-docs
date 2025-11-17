---
displayed_sidebar: null
description: Use Port as a context lake in n8n workflows to automatically generate contextual incident updates and send enriched Slack notifications
---

# Generate incident updates with n8n and Port

When you're busy fixing an incident, you don't have time to write updates. Yet others still need to know what's going on. This guide demonstrates how to use **Port as a context lake** in n8n workflows to automatically generate contextual incident updates and send enriched Slack notifications with relevant technical context.

Instead of manually writing incident updates, this workflow automatically:
1. Receives PagerDuty incident webhooks
2. Queries Port's Context Lake to retrieve service metadata, ownership, dependencies, and related information
3. Generates AI-powered incident summaries with contextual insights
4. Sends formatted Slack notifications to the appropriate channels

<img src='/img/guides/n8n-incident-updates-workflow.png' border="1px" width="100%" />

## Common use cases

- **Automated incident updates** — Generate contextual incident updates automatically when incidents are created or updated
- **Enriched Slack notifications** — Send notifications with service ownership, dependencies, recent deployments, and on-call information
- **Context-aware incident management** — Provide on-call engineers with enriched incident information from Port's catalog

## Prerequisites

Before you begin, ensure you have:

- Completed the [onboarding process](/getting-started/overview) with services, teams, and environments modeled in your Port catalog
- A Port account with [AI features enabled](/ai-interfaces/ai-agents/overview#access-to-the-feature)
- [PagerDuty integration](/build-your-software-catalog/sync-data-to-catalog/incident-management/pagerduty/) installed and syncing incidents to Port
- [Port's n8n custom node installed](/guides/all/setup-port-n8n-node) in your n8n instance
- An n8n instance (cloud or self-hosted) with access to create workflows
- Slack workspace and [developer token](https://api.slack.com/) for sending notifications
- Port API credentials configured in n8n — [learn how to get them](/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)

:::tip Alternative integrations
While this guide uses PagerDuty and Slack, you can adapt it for other incident management tools like OpsGenie or FireHydrant, and other communication platforms like Microsoft Teams or Discord.
:::

## Set up the n8n workflow

This workflow demonstrates how Port serves as a context lake by enriching incident data with organizational knowledge from your software catalog.

### Import the n8n workflow template

1. Open your n8n instance
2. Click on **Workflows** → **Import from File** or **Import from URL**
3. Copy the workflow JSON from the template below

    <details>
    <summary><b>n8n Workflow Template (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "name": "Generate Incident Updates with Port AI",
      "nodes": [
        {
          "parameters": {
            "select": "channel",
            "channelId": {
              "__rl": true,
              "value": "#incident-updates",
              "mode": "name"
            },
            "text": "={{ $json.result.message }}",
            "otherOptions": {}
          },
          "type": "n8n-nodes-base.slack",
          "typeVersion": 2.3,
          "position": [
            624,
            0
          ],
          "id": "e087f654-3439-4cb9-95b7-b3c1244b290b",
          "name": "Send a message",
          "webhookId": "65bc11b4-1b52-4d28-ad86-b947a780aa79",
          "credentials": {
            "slackApi": {
              "id": "GoOLAtWBRwTADKc8",
              "name": "Slack account"
            }
          }
        },
        {
          "parameters": {
            "operation": "generalInvoke",
            "userPrompt": "=A PagerDuty incident has been created or updated with the following details: {{ JSON.stringify($json.body.incident, null, 2) }}\n\nYou are an expert Incident Management AI assistant.\nYour job is to enrich PagerDuty incident updates with *contextual intelligence* from the Port catalog using the provided tools. Always retrieve the most relevant metadata and relationships including:\n\n* Affected services and their owners\n* Current on-call engineers\n* Recent deployments or last update timestamps\n* Related pull requests, commits, or changes that may explain the incident\n* Known vulnerabilities, risks, or past incidents for the affected services\n* Any dependency or topology information relevant to diagnosing the issue\n\n**🎯 Your Task**\n\nGenerate a concise, high-signal Slack notification summarizing the incident update with contextual insights that help engineers quickly understand **impact**, **likely cause**, and **recommended next actions**.\n\nYour Slack summary MUST follow this structure and tone:\n\n- 🚨 *Problem:* Brief summary of what changed and why it triggered this update.\n- 📊 *Impact:* Which services or what is affected? Any delivery, uptime, or user-facing issues?\n- 🧠 *Insights / Diagnostics:* Enrich with precise metadata from Port.\n- 🔧 *Action Required:* List next steps for the on-call team. Be specific about what they need to check or resolve.\n\n🔧 **Slack Output Rules**\nNEVER USE `**bold**` or `[text](url)` — instead use: `*bold*` for emphasis, `<https://url.com|Label>` for links, bullet points (`-`) for clarity\n\nYour output MUST be concise and actionable",
            "tools": "[\"^(list|get|search|track|describe)_.*\"]",
            "generalModel": "gpt-5",
            "systemPrompt": "You are a helpful assistant"
          },
          "type": "CUSTOM.portIo",
          "typeVersion": 1,
          "position": [
            208,
            0
          ],
          "id": "95ceebed-96ca-4cfb-82a8-a427f8c0c7d2",
          "name": "Extract Incident Context from Port",
          "credentials": {
            "portIoApi": {
              "id": "a9s5zHKi57ADlTON",
              "name": "Port.io account"
            }
          }
        },
        {
          "parameters": {
            "operation": "getInvocation",
            "invocationId": "={{ $json.invocationIdentifier }}"
          },
          "type": "CUSTOM.portIo",
          "typeVersion": 1,
          "position": [
            416,
            0
          ],
          "id": "c30fceda-20a5-4507-ad99-57cfd95b20b2",
          "name": "Get Port Context Response",
          "credentials": {
            "portIoApi": {
              "id": "a9s5zHKi57ADlTON",
              "name": "Port.io account"
            }
          }
        },
        {
          "parameters": {
            "httpMethod": "POST",
            "path": "a3c02869-071e-4bc7-bebe-28c692f26b68",
            "options": {}
          },
          "type": "n8n-nodes-base.webhook",
          "typeVersion": 2.1,
          "position": [
            0,
            0
          ],
          "id": "2db67b04-3240-4cf7-81bc-6c1066fee235",
          "name": "On PagerDuty Incident Update",
          "webhookId": "a3c02869-071e-4bc7-bebe-28c692f26b68"
        }
      ],
      "pinData": {},
      "connections": {
        "Extract Incident Context from Port": {
          "main": [
            [
              {
                "node": "Get Port Context Response",
                "type": "main",
                "index": 0
              }
            ]
          ]
        },
        "Get Port Context Response": {
          "main": [
            [
              {
                "node": "Send a message",
                "type": "main",
                "index": 0
              }
            ]
          ]
        },
        "On PagerDuty Incident Update": {
          "main": [
            [
              {
                "node": "Extract Incident Context from Port",
                "type": "main",
                "index": 0
              }
            ]
          ]
        }
      },
      "active": false,
      "settings": {
        "executionOrder": "v1"
      },
      "versionId": "ab6cfb55-8495-48c7-8fc3-25fb9b480014",
      "meta": {
        "templateCredsSetupCompleted": true,
        "instanceId": "e9a36cfd74df34fd103d5f6c7fed0e3d25bfc51a5d136cd0fb7eba9c77b96ae3"
      },
      "id": "q1yDUfKJ8ueTukOo",
      "tags": []
    }
    ```
    </details>

4. After importing, configure the following in n8n:
   - **Port.io credentials** — Use the Port.io credential you created during node installation
   - **Slack credentials** — Add your Slack API token and update the channel name
   - **Webhook URL** — Configure PagerDuty to send webhooks to the webhook URL from the "On PagerDuty Incident Update" node


## Test the workflow

### Test with a sample incident

1. **Trigger a test incident** in PagerDuty or use PagerDuty's webhook testing feature

2. **Verify Port context retrieval** — Check that the "Extract Incident Context from Port" and "Get Port Context Response" nodes successfully retrieve:
   - Related services
   - Ownership information
   - Recent deployments
   - On-call engineers
   - Dependencies

3. **Check Slack notification** — Verify the notification includes:
   - Incident details
   - Contextual information from Port
   - Formatted Slack message with proper structure

### Expected workflow behavior

- **Context enrichment** — Port returns structured information with service metadata
- **AI-powered summaries** — Incident updates include diagnostic insights and actionable recommendations
- **Slack formatting** — Messages are properly formatted for Slack with emojis and structured sections

  <img src='/img/guides/n8n-incident-updates-slack-notification.png' border="1px" width="100%" />


## Related guides

- [Set up Port's n8n custom node](/guides/all/setup-port-n8n-node) — Install and configure Port's custom n8n node
- [Generate incident updates with AI](/guides/all/generate-incident-updates-with-ai) — Use Port AI agents directly in Port to generate incident updates
- [Orchestrate incident response with AI](/guides/all/orchestrate-incident-response-with-ai) — Comprehensive guide on AI-powered incident management

