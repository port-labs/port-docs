---
displayed_sidebar: null
description: Generate on-demand summaries of Zendesk tickets in Port using a reusable MCP Prompt (backed by self-service actions). No AI agents or automations required.
---

# Generate Zendesk ticket summaries with AI (via MCP)

When working on support, you often need quick, structured summaries of a ticket for internal handoffs or customer updates. This guide sets up a reusable MCP Prompt in Port that any AI tool (Cursor, Claude, etc.) can run to fetch context from Zendesk and produce a clear summary on demand. The prompt uses three self-service actions under the hood; no AI agents or automations are required.

## Common use cases

- Generate a concise, standardized ticket summary for internal handoffs.
- Produce a customer-facing summary capturing request, resolution, and root cause.
- Create quick recaps for weekly reviews or QA of support interactions.

## Prerequisites

- A Port account and basic familiarity with self-service actions.
- A `zendesk_ticket` blueprint where the entity `identifier` is the Zendesk ticket ID.
- Secret `ZENDESK_TOKEN` configured in Port containing the Base64-encoded Basic credential for Zendesk API.
- Port’s MCP Server available to your AI tool (e.g., Cursor or Claude).

:::info Zendesk authentication
Use a Base64-encoded Basic credential in `ZENDESK_TOKEN`, typically built from `email/token:apitoken`. This guide assumes your token is already Base64-encoded and is used as `Authorization: Basic {{ .secrets.ZENDESK_TOKEN }}`.
:::

## Set up self-service actions

Create the following actions to retrieve the ticket comments and side conversations from Zendesk. These actions have no inputs (except the side-conversation messages action) and can be invoked directly from your AI tool via MCP.

1. Go to the self-service page in Port.
2. Click on `+ New Action` and then `{...} Edit JSON`.
3. Paste each action JSON below and click `Save`.

    <details>
    <summary><b>Action: get ticket comments (Click to expand)</b></summary>

    ```json showLineNumbers
    {
        "identifier": "get_ticket_comments",
        "title": "get ticket comments",
        "trigger": {
            "type": "self-service",
            "operation": "DAY-2",
            "userInputs": {
            "properties": {},
            "required": [],
            "order": []
            },
            "blueprintIdentifier": "zendesk_ticket"
        },
        "invocationMethod": {
            "type": "WEBHOOK",
            "url": "https://<your_subdomain>.zendesk.com/api/v2/tickets/{{ .entity.identifier }}/comments",
            "agent": false,
            "synchronized": true,
            "method": "GET",
            "headers": {
                "Content-Type": "application/json",
                "Authorization": "Basic {{ .secrets.ZENDESK_TOKEN }}"
            },
            "body": {}
        },
        "requiredApproval": false
    }
    ```

    </details>

    <details>
    <summary><b>Action: get ticket side conversations (Click to expand)</b></summary>

    ```json showLineNumbers
    {
        "identifier": "get_ticket_side_conversation",
        "title": "get ticket side conversations",
        "trigger": {
            "type": "self-service",
            "operation": "DAY-2",
            "userInputs": {
            "properties": {},
            "required": [],
            "order": []
            },
            "blueprintIdentifier": "zendesk_ticket"
        },
        "invocationMethod": {
            "type": "WEBHOOK",
            "url": "https://<your_subdomain>.zendesk.com/api/v2/tickets/{{ .entity.identifier }}/side_conversations",
            "agent": false,
            "synchronized": true,
            "method": "GET",
            "headers": {
            "Content-Type": "application/json",
            "Authorization": "Basic {{ .secrets.ZENDESK_TOKEN }}"
            },
            "body": {}
        },
        "requiredApproval": false
    }
    ```

    </details>

    <details>
    <summary><b>Action: get side conversation messages (Click to expand)</b></summary>

    ```json showLineNumbers
    {
        "identifier": "get_side_conversation_messages",
        "title": "get side conversation messages",
        "trigger": {
            "type": "self-service",
            "operation": "DAY-2",
            "userInputs": {
                "properties": {
                    "side_conversation_url": {
                    "type": "string",
                    "title": "side conversation url",
                    "format": "url"
                    }
                },
                "required": [
                    "side_conversation_url"
                ],
                "order": [
                    "side_conversation_url"
                ]
            }
        },
        "invocationMethod": {
            "type": "WEBHOOK",
            "url": "{{ .inputs.side_conversation_url }}/events",
            "agent": false,
            "synchronized": true,
            "method": "GET",
            "headers": {
            "Content-Type": "application/json",
            "Authorization": "Basic {{ .secrets.ZENDESK_TOKEN }}"
            },
            "body": {}
        },
        "requiredApproval": false
    }
    ```

    </details>

:::tip Subdomain flexibility
Replace `<your_subdomain>` with your Zendesk subdomain, for example: `https://acme.zendesk.com/...`.
:::

## Run the reusable Prompt via Port MCP (Cursor/Claude)

Run the `zendesk_ticket_summary` prompt with `ticket_id` set to the Zendesk ticket ID (same as the `zendesk_ticket` entity identifier). The prompt will automatically use the actions in this guide to fetch comments and side conversations and return the structured summary.

:::caution Privacy and scope
Side conversations may contain internal discussion. Review generated summaries before sharing externally. This guide focuses on displaying summaries only; it does not post back to Zendesk.
:::

## Expose as a reusable Prompt via Port MCP Server

Port MCP Server can expose prompts you create and manage in Port to your IDE assistants (Cursor, Claude, etc.). Create a Prompt entity in Port and invoke it with an argument for the ticket ID.

<details>
<summary><b>Prompt entity: Zendesk Ticket Summary (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "zendesk_ticket_summary",
  "title": "Zendesk Ticket Summary",
  "icon": "AI",
  "properties": {
    "description": "Summarize a Zendesk support ticket using comments and side conversations",
    "arguments": [
      {
        "name": "ticket_id",
        "required": true,
        "description": "The Zendesk ticket ID to summarize"
      }
    ],
    "template": "You are an AI assistant tasked with summarizing Zendesk support tickets in Port. Use the comments and the side conversations on the ticket to summarize it in the following format:\n\n## Request\nWhat the customer wanted in a short sentence\n\n## Resolution  \nWhat was the resolution\n\n## Root Cause\nIn case of a problem/bug, what was the root cause\n\n## Recommendations\nE.g., update docs, improve error messages, etc.\n\nInstructions for data gathering:\n- To get the comments and side conversations, send empty properties and use the entity identifier: {{ticket_id}}\n- To use the side conversations, you first need to get their URLs and then get the messages sent in them\n- No need to send an entity identifier for side conversation messages, only the side conversation URL in the properties\n\nTicket ID to analyze: {{ticket_id}}"
  },
  "relations": {}
}
```

</details>

### How to use the Prompt from your IDE via MCP

1. In your IDE assistant, select Port MCP as a tool/provider.
2. Run the `zendesk_ticket_summary` prompt with the argument `ticket_id` set to your Zendesk ticket ID (same as the `zendesk_ticket` entity identifier).
3. If needed, the assistant will use the actions in this guide to fetch comments and side conversations, then return the structured summary.

:::info Using Port MCP prompts
For setup and capabilities, see the Port MCP Server prompts documentation: [Port MCP Server - Prompts](/ai-agents/port-mcp-server#prompts)
:::

## Test the workflow

1. In Port, ensure a `zendesk_ticket` entity exists whose `identifier` equals a real Zendesk ticket ID.
2. In Cursor/Claude, run the `zendesk_ticket_summary` prompt with `ticket_id` set to the ticket ID to generate the summary.

## Best practices

- Keep summaries brief and action-oriented for faster handoffs.
- Use consistent formatting so summaries are scannable across tickets.
- If needed, create variants of the prompt for internal vs customer-facing language.

## Related guides

 - See how to work with Port’s AI Assistant and MCP Server in your editor: [Docs AI Assistant](../../docs-ai-assistant.md)


