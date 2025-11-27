---
sidebar_position: 2
title: Port AI Assistant
---

import BetaFeatureNotice from '/docs/generalTemplates/_beta_feature_notice.md'

# Port AI assistant

<BetaFeatureNotice id="ai-form" />

The Port AI Assistant is the fastest way to start using AI with Port - no configuration required. Available through a floating chat button, it provides instant, intelligent answers about your software catalog, actions, and Port's capabilities.

## What is the Port AI Assistant?

The Port AI Assistant is an out-of-the-box chat interface that:

- **Requires no setup**: Start asking questions immediately without defining agents or configurations.
- **Always accessible**: Available through a floating button whenever you have access to Port AI.
- **Comprehensive knowledge**: Understands your catalog, actions, and Port documentation.
- **Safe by default**: Uses read-only [MCP tools](/ai-interfaces/port-mcp-server/available-tools) and approval mode for actions.
- **Fastest experience**: Get answers without the customization overhead of [AI Agents](/ai-interfaces/ai-agents/overview).

Built on [Port AI](/ai-interfaces/port-ai/overview), the assistant operates using [Port AI's developer tools](/ai-interfaces/port-ai/overview#port-ai-tools) in safe mode - meaning all actions run in **approval mode** (you get a link to review and execute) and uses read-only tools for data queries. The assistant also has access to Port's documentation through a dedicated MCP tool.

## How to Use the Port AI Assistant

The Port AI Assistant is available through a floating chat button in the Port interface. Simply click the button at the bottom-right corner to open the chat interface and start asking questions.

<img src='/img/ai-agents/AIChatInitialState.png' width='70%' border='1px' />

Once you ask a question, the assistant analyzes your request and uses the appropriate tools to provide a comprehensive response.

<img src='/img/ai-agents/AIChatAskQuestion.png' width='40%' border='1px' />

After processing your request, you'll receive a detailed answer along with any relevant actions or next steps.

<img src='/img/ai-agents/AIChatFinalResponse.png' width='40%' border='1px' />

## Using AI agents in the assistant

While the Port AI Assistant provides comprehensive out-of-the-box capabilities, you can also select specific [AI Agents](/ai-interfaces/ai-agents/overview) to leverage their specialized expertise and custom configurations directly from the chat interface.

### Selecting an agent

To select an agent, click the **+** button next to the input field:

<img src='/img/ai-agents/AIChatPlusButton.png' width='40%' border='1px' />

This opens the categories menu where you can browse different options:

<img src='/img/ai-agents/AIChatCategoryMenu.png' width='40%' border='1px' />

From the categories menu, select the agents option to view all your active agents:

<img src='/img/ai-agents/AIChatAgentsMenu.png' width='40%' border='1px' />

Once you select an agent, it will be indicated in the chat interface, and your conversation will use that agent's specialized capabilities:

<img src='/img/ai-agents/AIChatSelectedAgent.png' width='40%' border='1px' />

### Switching between agents

You can switch between different agents at any time during your conversation. Simply click the **+** button again to select a different agent or return to the default Port AI Assistant. This flexibility allows you to leverage different specialized agents as your needs change throughout a conversation.

### When to use specific agents

Consider selecting a specific agent when:

- **Domain expertise needed**: You have a question that requires specialized knowledge (e.g., security, compliance, deployment workflows).
- **Custom tools**: The agent has access to custom tools or integrations not available in the default assistant.
- **Specific prompts**: The agent is configured with specific instructions or context for your team's workflows.
- **Consistent behavior**: You want responses aligned with a particular agent's configuration and personality.

For general questions about your catalog, Port features, or exploratory queries, the default Port AI Assistant provides the fastest and most flexible experience.

## Example Questions

The Port AI Assistant can help with a wide variety of questions out of the box:

<details>
<summary><b>Service Ownership & Information</b></summary>

- "Who owns the payment service?"
- "What services does the platform team own?"
- "Show me all microservices owned by the Backend team"
- "What is the checkout service about?"
- "What are the dependencies of the OrderProcessing service?"

</details>

<details>
<summary><b>Deployment & Operations</b></summary>

- "How do I deploy the auth service to production?"
- "When was the last successful deployment of the payment service?"
- "Show me failed deployments from last week"
- "What's deployed in production today?"
- "What's the deployment frequency of team X?"

</details>

<details>
<summary><b>Quality & Compliance</b></summary>

- "Which services are failing security checks?"
- "Give me a weekly summary of open bugs"
- "What's preventing the InventoryService from reaching Gold level?"
- "Show me services with high bug counts"
- "What's our overall security score?"

</details>

<details>
<summary><b>Incidents & Monitoring</b></summary>

- "Show me active incidents"
- "Which services had an incident in the last 30 days?"
- "Who is on call for the payment service?"
- "What is our mean time to resolution?"

</details>

<details>
<summary><b>Tasks & Workflow</b></summary>

- "What tasks are assigned to me?"
- "Show me my urgent Jira tickets"
- "How many issues were closed by the frontend team this month?"
- "What PRs are waiting for my review?"

</details>

<details>
<summary><b>Port Usage & Help</b></summary>

- "How do I create a new blueprint?"
- "What's the best way to set up scorecards?"
- "How can I trigger an action via API?"
- "Show me how to configure RBAC permissions"

</details>


## Security & Permissions

The Port AI Assistant respects your organization's security controls:

- **RBAC compliance**: Only accesses data you have permissions to view.
- **Safe operation**: Read-only tools for data queries.
- **Action approval**: All actions require your explicit approval before execution.
- **Audit trail**: All interactions are logged as [AI invocations](/ai-interfaces/port-ai/overview#ai-invocations).
- **Access control**: Access to the Port AI Assistant is controlled through the `_ai_invocation` blueprint permissions. Learn more about [controlling access to Port AI](/ai-interfaces/port-ai/overview#controlling-access-to-port-ai).

For comprehensive security information, see [AI Security and Data Controls](/ai-interfaces/port-ai/security-and-data-controls).

## Frequently Asked Questions

<details>
<summary><b>Do I need to configure anything to use the Port AI Assistant? (Click to expand)</b></summary>

No! The Port AI Assistant works out of the box. As soon as you have access to Port AI, you can start asking questions through the floating chat button. No setup, no configuration, no agent definitions required.

</details>

<details>
<summary><b>Can the Port AI Assistant run actions on my behalf? (Click to expand)</b></summary>

The assistant can help you execute actions, but it operates in **approval mode**. This means:
1. It will identify the right action for your request
2. It will populate the action parameters based on context
3. It will provide you a link to review and complete the action
4. You maintain full control over execution

This approach ensures safety while making actions easier to discover and use.

</details>

<details>
<summary><b>What's the difference between Port AI Assistant and AI Agents? (Click to expand)</b></summary>

**Port AI Assistant** is designed for:
- Immediate use with zero configuration
- General-purpose questions across your entire catalog
- Interactive exploration and ad-hoc queries
- Human interaction and learning

**[AI Agents](/ai-interfaces/ai-agents/overview)** are designed for:
- Domain-specific expertise and workflows
- Machine-to-machine communication
- Autonomous operations and automations
- Customized behavior for specific use cases

The assistant is the fastest way to get started, while agents provide advanced customization for specialized needs.

</details>

<details>
<summary><b>What data can the Port AI Assistant access? (Click to expand)</b></summary>

The assistant uses [Port AI's developer tools](/ai-interfaces/port-ai/overview#port-ai-tools), which include read-only access to your data model, entities, scorecards, self-service actions, and Port documentation. All data access respects your organization's RBAC policies - you can only access data you have permissions to view. Learn more about [Port AI's security controls](/ai-interfaces/port-ai/security-and-data-controls).

</details>

<details>
<summary><b>Can the Port AI Assistant help me learn how to use Port? (Click to expand)</b></summary>

Yes! The assistant has comprehensive knowledge of Port's documentation and can help you:
- Understand how features work
- Learn best practices
- Troubleshoot issues
- Discover new capabilities

Try asking questions like "How do I create a blueprint?" or "What's the best way to set up scorecards?"

</details>

<details>
<summary><b>When should I use the Port AI Assistant vs other AI interfaces? (Click to expand)</b></summary>

**Use the Port AI Assistant** when you want immediate AI access with zero configuration. It's perfect for quick questions, exploratory queries, learning Port, and ad-hoc analysis.

**Use AI Chat Widgets** (with [AI Agents](/ai-interfaces/ai-agents/overview)) when you need customized AI experiences embedded in dashboards - configure prompts, conversation starters, and specific tool selections for team-specific workflows.

**Use AI Agents** for domain-specific expertise, machine-to-machine communication, and autonomous operations that require advanced customization.

</details>

<details>
<summary><b>Can I select a specific AI Agent in the Port AI Assistant? (Click to expand)</b></summary>

Yes! You can select any of your active [AI Agents](/ai-interfaces/ai-agents/overview) directly from the Port AI Assistant by clicking the **+** button next to the input field. This allows you to leverage specialized agents with domain-specific expertise, custom tools, or specific configurations.

You can also switch between different agents at any time during your conversation, giving you the flexibility to use the right agent for each part of your workflow. Up to 50 agents are displayed in the selector, and you can use the search function to quickly find a specific agent if you have more.

For more details, see the [Using AI Agents in the Assistant](#using-ai-agents-in-the-assistant) section above.

</details>

<details>
<summary><b>Are there usage limits for the Port AI Assistant? (Click to expand)</b></summary>

Yes, the Port AI Assistant uses the same [usage limits as Port AI](/ai-interfaces/port-ai/overview#limits-and-usage). These limits are at the organization level and include hourly rate limits and monthly quotas.

Monitor your usage through [AI invocations](/ai-interfaces/port-ai/overview#ai-invocations) in your Port catalog.

</details>

