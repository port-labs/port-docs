---
sidebar_position: 2
title: Build an AI agent
---

# Build an AI agent

:::info Closed Beta
Port's AI offerings are currently in closed beta and will be gradually rolled out to users by the end of 2025.
:::

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

:::info Built on Port AI
AI Agents are built on top of [Port AI](/ai-interfaces/port-ai/overview) and leverage its underlying capabilities for data access, security, and execution. This guide focuses on agent-specific building techniques.
:::

## Getting started

Building an AI agent in Port involves several key steps.  
Let's walk through the process of creating an agent that can assist your developers with finding information and completing tasks.

## Create a new AI agent

To create a new agent, head to the AI Agents catalog page (this page will be created for you when you [activate the feature](/ai-interfaces/ai-agents/overview#access-to-the-feature)).

Click on the "New AI Agent" button and fill the form with the agent details.
<img src='/img/ai-agents/AIAgentsList.png' width='80%' border='1px' />
<img src='/img/ai-agents/AIAgentsAddAgentModal.png' width='80%' border='1px' />

We recommend following the steps below.


### Step 1: Define your agent's purpose

The first step in building an AI agent is deciding on its purpose.  
Here we will determine whether the agent will:

- Answer questions about your development environment.
- Help run actions and complete tasks.

We recommend starting with a simple use case that a junior assistant with access to your data could assist with. 

For inspiration, check our [AI agents guides](/guides?tags=AI).

### Step 2: Configure data access tools

Configure which data tools your agent can access. Configure access to Port data through [MCP tools](/ai-interfaces/port-mcp-server/overview-and-installation). For example:
- `list_blueprints` - Gives access to all blueprints in your catalog
- `search_entities` - Allows searching and querying entities
- `get_scorecards` - Provides access to scorecard data




### Step 3: Configure actions access
Actions tools are created dynamically based on your Port self-service actions. When you configure an action for the agent, it becomes available as a tool the agent can use. Here's how to add an action to the agent:

1. Get the action identifier from the [self-service](https://app.getport.io/self-serve) page.
2. Add it to your agent's configuration as an available tool with a syntax like `run_{action_identifier}`.
3. Decide whether the agent can run the action automatically or requires approval.

For details on manual approval vs automatic execution patterns, see [Port AI action handling](/ai-interfaces/port-ai/overview#tool-execution-modes).

### Step 4: Define the prompt

The prompt is your main tool for influencing your agent's success. You will likely iterate on it as you observe how the agent responds to different queries.

For comprehensive guidance on crafting effective prompts, see [Context Engineering](/ai-interfaces/port-ai/context-engineering). This covers prompt design principles, examples, and best practices for creating prompts that leverage your organization's specific data and terminology.

<img src='/img/ai-agents/AIAgentPrompt.png' width='80%' border='1px' />

### Step 5: Activate your agent

When you feel your agent is ready:

1. Set its status to "Active".
2. Start interacting with it through the [available interfaces](/ai-interfaces/ai-agents/interact-with-ai-agents).

## Evaluating your agent performance

Continuous evaluation and improvement are essential for maintaining effective AI agents. We recommend implementing a regular review process:

1. **Weekly reviews**: Set aside time each week to review agent interactions
2. **Identify patterns**: Look for recurring issues or misunderstandings in how the agent interprets queries
3. **Refine the prompt**: Update your agent's prompt based on your findings to address common issues

For details on how to analyze agent behavior and view execution plans, see [AI Invocations in Port AI](/ai-interfaces/port-ai/overview#ai-invocations).

## Examples

For comprehensive examples of AI agents in action, see our practical implementation guides:

**Infrastructure & Operations:**
- [Heal unhealthy Kubernetes pods](/guides/all/heal-unhealthy-k8s-pods) - Automated pod healing and recovery
- [Generate incident updates with AI](/guides/all/generate-incident-updates-with-ai) - AI-powered incident communication and updates

**Development Workflow:**
- [Automatically resolve tickets with coding agents](/guides/all/automatically-resolve-tickets-with-coding-agents) - AI-powered code generation and ticket resolution
- [PR Enricher AI Agent](/guides/all/setup-pr-enricher-ai-agent) - Enhanced pull request analysis and context

**Platform Operations:**
- [Platform Request Triage AI Agent](/guides/all/setup-platform-request-triage-ai-agent) - Intelligent request routing and prioritization
- [Service Explorer AI Agent](/guides/all/setup-service-explorer-ai-agent) - Service discovery and exploration

These guides provide step-by-step implementation details, including tool configuration, prompt engineering, and real-world integration patterns.

## Formatting the agent response
To format the agent's response, you can specify the desired format in its prompt. For optimal results when using the UI, it's recommended to request a markdown format response. 
This allows for better presentation and readability of the information provided by the agent.
When sending messages through Slack, our [Slack app](/ai-interfaces/slack-app) convert the markdown format into a Slack compatible formatting.

### Example of a Markdown Response
```markdown
:rocket: *New version deployed!*
[Added logs](https://www.example.com)
From [john-123](https://github.com/john-123)
```

## Troubleshooting & FAQ

<details>
<summary><b>I don't see an option to add an AI agent (Click to expand)</b></summary>

Make sure you have [access to the AI agents feature](/ai-interfaces/ai-agents/overview#access-to-the-feature). Note that it's currently in closed beta and requires special access. If you believe you should have access, please contact our support.
</details>

<details>
<summary><b>How do I configure which tools my agent can access? (Click to expand)</b></summary>

Configure tools in two categories:
- **Data access tools**: Add MCP tools like `list_blueprints`, `search_entities`, `get_scorecards` 
- **Action tools**: Add actions using syntax like `run_{action_identifier}` from your self-service actions

For comprehensive tool details, see [Port MCP Server documentation](/ai-interfaces/port-mcp-server/overview-and-installation).
</details>

<details>
<summary><b>My agent can't access the data I need - what's wrong? (Click to expand)</b></summary>

Check that you've configured the correct data access tools for your agent. Ensure you've added tools like `list_blueprints` or `search_entities` to give your agent access to Port data. AS Port AI agents act based on their permissions, ensure the right access to your resources.
</details>

<details>
<summary><b>How can I make sure the agent doesn't run actions without approval? (Click to expand)</b></summary>

When configuring actions for your agent, set the approval mode to "manual" instead of "automatic". This ensures the agent creates draft actions that require your review before execution. For details, see [Port AI action handling](/ai-interfaces/port-ai/overview#tool-execution-modes).
</details>

<details>
<summary><b>My agent isn't performing well - how do I improve it? (Click to expand)</b></summary>

1. Review agent interactions through [AI Invocations](/ai-interfaces/port-ai/overview#ai-invocations)
2. Refine your prompt based on common issues you identify
3. Ensure your agent has access to the right tools for its domain
4. Check our [Context Engineering](/ai-interfaces/port-ai/context-engineering) guide for prompt optimization

Start with simple prompts and iterate based on actual usage patterns.
</details>
