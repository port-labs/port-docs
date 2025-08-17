---
displayed_sidebar: null
description: Summarize Zendesk tickets with AI using a reusable Port MCP Prompt (backed by self-service actions). Requires Port remote MCP installed and connected in your IDE. No AI agents or automations required.
---

# Summarize Zendesk tickets with AI

When working on support, you often need quick, structured summaries of a ticket for internal handoffs or customer updates. In this guide, we will set up a Prompt in Port so that any AI tool can help you summarize Zendesk tickets with all the relevant context.

## Scenario

You’re the on-call support engineer. A customer requests the ability to set labels for tickets on Zendesk ticket `4095`. Before hand-off, you need a concise internal summary and a customer-facing version.

Example context snippets the prompt will fetch:

```text
Ticket subject: Add the ability to set labels for tickets

Recent comments
- 2025-08-13 13:12: Customer: "I want the ability to set labels for tickets"
- 2025-08-13 13:16: Agent: "Thanks for reaching out! Can you share a bit more about how you’d like to use these labels?"
```

Example output from the prompt:

<img src='/img/guides/analyzeZendeskTicketExample.png' border="1px" width="70%" />

## Flow overview

<img src='/img/guides/analyzeZendeskTicketsFlow.jpg' border="1px" width="70%"/>

- Developer runs the reusable `zendesk_ticket_summary` prompt with `ticket_id`
- Prompt uses actions to fetch comments and side conversations → returns a structured summary

## Common use cases

- Generate a concise, standardized ticket summary for internal handoffs.
- Produce a customer-facing summary capturing request, resolution, and root cause.
- Create quick recaps for weekly reviews or QA of support interactions.

## Prerequisites

- Port remote MCP installed and connected in your IDE (Cursor, Claude, etc.). Follow the setup guide: [Port MCP Server - Setup](/ai-agents/port-mcp-server#setup)
- A Port account and basic familiarity with self-service actions.
- A `zendesk_ticket` blueprint where the entity `identifier` is the Zendesk ticket ID.
- Secret `ZENDESK_TOKEN` configured in Port containing the Base64-encoded Basic credential for Zendesk API.

:::info Zendesk authentication
Use a Base64-encoded Basic credential in `ZENDESK_TOKEN`, typically built from `email/token:apitoken`. This guide assumes your token is already Base64-encoded and is used as `Authorization: Basic {{ .secrets.ZENDESK_TOKEN }}`.
:::

## Set up self-service actions

We will create the following actions to retrieve ticket comments and side conversations from Zendesk. These actions have no inputs (except the side-conversation messages action) and can be invoked directly from your AI tool via MCP.

#### Get Ticket Comments

This action fetches all comments for the Zendesk ticket identified by the entity identifier.

1. Go to the [self-service](https://app.getport.io/self-serve) page of your portal.
2. Click on `+ New Action`.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration:

    <details>
    <summary><b>Action: Get Ticket Comments (Click to expand)</b></summary>

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
    
5. Click `Save`.

#### Get Ticket Side Conversations

This action lists all side conversations for the Zendesk ticket.

1. Go to the [self-service](https://app.getport.io/self-serve) page of your portal.
2. Click on `+ New Action`.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration:

    <details>
    <summary><b>Action: Get Ticket Side Conversations (Click to expand)</b></summary>

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
    
5. Click `Save`.

#### Get Side Conversation Messages

This action retrieves the messages for a specific side conversation using its URL.

1. Go to the [self-service](https://app.getport.io/self-serve) page of your portal.
2. Click on `+ New Action`.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration:

    <details>
    <summary><b>Action: Get Side Conversation Messages (Click to expand)</b></summary>

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
    
5. Click `Save`.

:::tip Subdomain flexibility
Replace `<your_subdomain>` with your Zendesk subdomain, for example: `https://acme.zendesk.com/...`.
:::

## Create a reusable Prompt

We will now define a Prompt entity that your IDE can invoke via Port MCP. Once created, you can run it with the ticket ID, and it will gather context and produce a structured summary.

1. Go to the [Prompts page](https://app.getport.io/prompts) in Port.
2. Click `Create prompt`.
3. Toggle JSON mode.
4. Paste the following JSON and adjust if needed.

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

5. Click `Create`.



### How to use the Prompt from your IDE via MCP

1. In your IDE assistant, select Port MCP as a tool/provider.
2. Run the `zendesk_ticket_summary` prompt with the argument `ticket_id` set to your Zendesk ticket ID (same as the `zendesk_ticket` entity identifier).
3. If needed, the assistant will use the actions in this guide to fetch comments and side conversations, then return the structured summary.

:::info Using Port MCP prompts
For setup and capabilities, see the Port MCP Server prompts documentation: [Port MCP Server - Prompts](/ai-agents/port-mcp-server#prompts)
:::

## Run the Prompt

Run the `zendesk_ticket_summary` Prompt with `ticket_id` set to the Zendesk ticket ID (same as the `zendesk_ticket` entity identifier). The Prompt will automatically use the actions in this guide to fetch comments and side conversations and return a structured summary.

```text
Example run
Prompt: zendesk_ticket_summary
Arguments:
- ticket_id: 4095
```

:::caution Privacy and scope
Side conversations may contain internal discussion. Review generated summaries before sharing externally. This guide focuses on displaying summaries only; it does not post back to Zendesk.
:::

## Test the workflow

1. In Port, ensure a `zendesk_ticket` entity exists whose `identifier` equals a real Zendesk ticket ID.
2. In Cursor/Claude, run the `zendesk_ticket_summary` prompt with `ticket_id` set to the ticket ID to generate the summary.

## Best practices

- Keep summaries brief and action-oriented for faster handoffs.
- Use consistent formatting so summaries are scannable across tickets.
- Consider variants: internal vs customer-facing tone; enforce English or match ticket locale.
- Ask the prompt to ignore non-informative system/autoresponder comments.
- For richer context, optionally add mirrors like product area, account tier, or severity.

## Related guides

 - See how to work with Port’s AI Assistant and MCP Server in your editor: [Docs AI Assistant](../../docs-ai-assistant.md)


