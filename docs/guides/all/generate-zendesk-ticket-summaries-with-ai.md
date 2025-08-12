---
displayed_sidebar: null
description: Generate on-demand summaries of Zendesk tickets in Port using MCP and self-service actions. No AI agents or automations required.
---

# Generate Zendesk ticket summaries with AI (via MCP)

When working on support, you often need quick, structured summaries of a ticket for internal handoffs or customer updates. This guide shows how to use three simple self-service actions with Port’s MCP Server so that any AI tool (Cursor, Claude, etc.) can fetch ticket context from Zendesk and produce a clear summary on demand — without defining AI agents or automations.

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

## Use with Port MCP in Cursor or Claude

You can now ask your AI to fetch the context and generate a summary on demand. There are two simple flows:

### A. Fully assisted (AI invokes actions via MCP)

- Ask your AI to run `get_ticket_comments` and `get_ticket_side_conversation` on the `zendesk_ticket` entity with the relevant identifier (the Zendesk ticket ID).
- From the side conversations response, pick the relevant `side_conversation_url` values.
- Ask the AI to run `get_side_conversation_messages` for each URL to collect the messages.
- Provide the prompt below and request the final summary.

### B. Manual retrieval, then summarize

- Manually invoke the three actions above from Port’s self-service UI for the target ticket.
- Copy the responses (comments and side conversations/messages) into your AI chat.
- Provide the prompt below and request the final summary.

## Summary prompt

<details>
<summary><b>Copy-ready prompt (Click to expand)</b></summary>

```
You are an ai assistant tasked with summarizing zendesk support tickets in port. Use the comments and the side conversations on the ticket to summarize it in the following format:

##request
What the customer wanted in a short sentence
##resolutiom
What was the resolution
##root cause
In case of a problem/bug, what was the root cause

##recommendations

Eg update docs,

To get the comments and the side conversations, send empty properties and use the entity identifier.

To use the side conversations you first need to get their urls and then get the messages sent in them, no need to send an entity identifier only the side conversation url in the properties.
```

</details>

:::caution Privacy and scope
Side conversations may contain internal discussion. Review generated summaries before sharing externally. This guide focuses on displaying summaries only; it does not post back to Zendesk.
:::

## Test the workflow

1. In Port, ensure a `zendesk_ticket` entity exists whose `identifier` equals a real Zendesk ticket ID.
2. Run `get_ticket_comments` on that entity.
3. Run `get_ticket_side_conversation` on that entity and copy one `side_conversation_url`.
4. Run `get_side_conversation_messages` with the copied URL.
5. In Cursor/Claude, provide the prompt and let the AI generate the summary.

## Best practices

- Keep summaries brief and action-oriented for faster handoffs.
- Use consistent formatting so summaries are scannable across tickets.
- If needed, create variants of the prompt for internal vs customer-facing language.

## Related guides

 - See how to work with Port’s AI Assistant and MCP Server in your editor: [Docs AI Assistant](../../docs-ai-assistant.md)


