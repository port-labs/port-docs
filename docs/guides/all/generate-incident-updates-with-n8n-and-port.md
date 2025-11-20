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
          "id": "2c8d4a08-8b21-42ce-8b76-7af1b6122684",
          "name": "Send a message",
          "webhookId": "65bc11b4-1b52-4d28-ad86-b947a780aa79",
          "credentials": {
            "slackApi": {
              "id": "WbMbgVb4paOjFSiI",
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
          "id": "dcb95f48-554b-45bb-8734-e652167959a0",
          "name": "Extract Incident Context from Port",
          "credentials": {
            "portIoApi": {
              "id": "vphYNYaTZimXT7su",
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
          "id": "27168b70-560b-49bb-ab6b-0cf90c0e3bcf",
          "name": "Get Port Context Response",
          "credentials": {
            "portIoApi": {
              "id": "vphYNYaTZimXT7su",
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
          "id": "4438b0a6-e3d6-4d8e-bfc4-4b667527439d",
          "name": "On PagerDuty Incident Update",
          "webhookId": "a3c02869-071e-4bc7-bebe-28c692f26b68"
        },
        {
          "parameters": {
            "content": "## Generate Incident Updates with Port AI\n\n### How it works\n1. A PagerDuty incident create/update arrives via the webhook trigger.\n2. The workflow calls Port.io to gather contextual metadata: affected services, owners, on-call, recent deployments, related PRs/commits, vulnerabilities, and topology.\n3. An AI step synthesizes a concise, structured incident summary (Problem, Impact, Insights/Diagnostics, Action Required) using Port context.\n4. The final message is posted to the #incident-updates Slack channel so the on-call team gets actionable guidance.\n\n### Setup\n- [ ] Create a PagerDuty webhook and point it to the workflow webhook URL.\n- [ ] Register for a free account with Port.io\n- [ ] Connect your Port.io account and add the API key/credentials.\n- [ ] Grant Port.io read access to service catalog, deployment history, and code links.\n- [ ] Connect your Slack account and confirm or set the channel to #incident-updates.\n- [ ] Enable the Port AI tools/model credentials used to enrich incidents.\n- [ ] Send a test incident to verify the Slack summary format and actionable recommendations.",
            "height": 608,
            "width": 416
          },
          "type": "n8n-nodes-base.stickyNote",
          "typeVersion": 1,
          "position": [
            -464,
            -224
          ],
          "id": "67b8c149-f1d8-47ab-803c-d9a2a1d90d1a",
          "name": "Sticky Note"
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
      "versionId": "20e3058d-5c29-46cc-80d9-3c60e2c32d7d",
      "meta": {
        "templateCredsSetupCompleted": true,
        "instanceId": "be7665cef51b13547e586e0f385e42416ebee48719c71d7dc7c03dbdf41fc246"
      },
      "id": "fwnjT4a7bagWJqXd",
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

