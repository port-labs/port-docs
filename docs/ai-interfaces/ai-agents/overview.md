---
sidebar_position: 1
title: Overview
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortTooltip from "/src/components/tooltip/tooltip.jsx"
import ClosedBetaFeatureNotice from '/docs/generalTemplates/_closed_beta_feature_notice.md'
import AIAgentRegistration from "/src/components/AIAgentRegistration"

# AI agents overview

<ClosedBetaFeatureNotice id="ai-form" />

## What are Port AI agents?

Port AI agents are customizable building blocks that enhance your developer portal with intelligent assistance.  
These agents help your developers find information faster and complete tasks more efficiently across your development ecosystem.

<img src="/img/ai-agents/AIAgentIncidentManagerAgentPage.png" width="80%" border="1px" />
<img src='/img/ai-agents/AIAgentsSlackExample.png' width='80%' border="1px" />


## What can AI agents do?

AI agents serve two primary functions:

1. **Answer questions** about your development environment, services, and processes using natural language. Developers can ask questions and get immediate, contextual answers.

2. **Assist with actions** by helping developers complete common tasks faster. Agents can suggest and pre-fill forms, guide developers through workflows, and provide relevant context for decision-making. You can decide whether they can run an action or require human approval.

## Enhanced capabilities with MCP server backend

:::tip New capability
Port AI agents now support an enhanced **MCP server backend mode** that provides significantly expanded capabilities. This is a new feature that enhances your existing agents - you can enable it for any agent to unlock these advanced capabilities.
:::

When using the MCP server backend mode, your AI agents gain:

- **Expanded data access**: Intelligently queries your entire catalog without blueprint restrictions
- **Enhanced reasoning**: Powered by Claude models for improved analysis and decision-making  
- **Broader tool access**: Uses all read-only tools available in the MCP server for comprehensive insights
- **Smarter action selection**: Still respects your configured allowed actions while providing better context

Your existing agents can immediately benefit from these enhancements by enabling the MCP server backend mode when [interacting with them](/ai-interfaces/ai-agents/interact-with-ai-agents) through widgets and API calls.

### Example use cases

**Questions your agents can answer:**
- "Which services are failing security checks?".
- "When was the last successful deployment of the payment service?".
- "Who is the owner for this component?".

**Actions your agents can help with:**
- "Can you help me deploy service X to production?".
- "Please notify the reviewers of PR #1234".

## Getting started with AI agents

To start working with AI agents, follow these steps:

1. **Apply for access** - Submit your application via [this form](https://forms.gle/krhMY7c9JM8MyJJf7).
2. **Access the feature** - If accepted, you will be able to [activate the AI agents](/ai-interfaces/ai-agents/overview#access-to-the-feature) in your Port organization.
3. **Build your agents** - [Create custom agents](/ai-interfaces/ai-agents/build-an-ai-agent) to meet your developers' needs.
4. **Interact with your agents** - Engage with your agents by following our [interaction guide](/ai-interfaces/ai-agents/interact-with-ai-agents).

## Customization and control

[Build and customize](/ai-interfaces/ai-agents/build-an-ai-agent) your AI agents:
- Define which data sources your agents can access.
- Determine what actions your agents can assist with.
- Set permissions for who can use specific agents.
- Configure how agents integrate with your workflows.
- Choose between standard and MCP server backend modes when [interacting with agents](/ai-interfaces/ai-agents/interact-with-ai-agents).

## Security and data handling

AI agents are designed with security as a priority:
- Agents only have access to the data you explicitly provide.
- Your data remains within Port's secure infrastructure.
- LLM processing happens within our cloud infrastructure.
- Your data is not used for model training.

We store data from your interactions with AI agents for up to 30 days. We use this data to ensure agents function correctly and to identify and prevent problematic or inappropriate AI behavior. 
We limit this data storage strictly to these purposes. You can contact us to opt-out of this data storage.

## Start simple & expand as needed

Begin with focused use cases that deliver immediate value, such as helping developers find service information or streamlining incident management.  
As your team builds confidence in the agents, you can expand their capabilities to cover more complex scenarios and workflows.

## Access to the feature

Currently, AI agents are in closed beta access, and you must get approved for the feature first. Once approved, you can enable the feature in your Port organization using the interactive tool below:

<AIAgentRegistration />

Your organization now has the system blueprints required for the feature to work.

## Data Model
The data model of AI agents includes two main blueprints:

1. **AI agents** - The agents themselves that you can interact with. You can build new ones and customize them as you wish. Learn more in our [Build an AI agent](/ai-interfaces/ai-agents/build-an-ai-agent) guide.

2. **AI invocations** - Each interaction made with an AI agent is recorded as an invocation. This acts as a log of everything going through your AI agents so you can monitor and improve them over time. Learn more in our [Interact with AI agents](/ai-interfaces/ai-agents/interact-with-ai-agents) guide.

## Relevant guides

Explore these guides to see AI agents in action and learn how to implement them in your organization:

- [Generate incident updates with AI](/guides/all/generate-incident-updates-with-ai)
- [Enrich tasks with AI-powered context](/guides/all/enrich-tasks-with-ai)
- [Setup PR enricher AI agent](/guides/all/setup-pr-enricher-ai-agent)
- [Setup service explorer AI agent](/guides/all/setup-service-explorer-ai-agent)
- [Setup platform request triage AI agent](/guides/all/setup-platform-request-triage-ai-agent)
- [Setup task manager AI agent](/guides/all/setup-task-manager-ai-agent)
- [Setup incident manager AI agent](/guides/all/setup-incident-manager-ai-agent)
- [Add RCA context to AI agents](/guides/all/add-rca-context-to-ai-agents)
- [Enrich security vulnerability using AI](/guides/all/enrich-security-vulnerability-using-ai)

## Frequently asked questions

<details>
<summary>What are the main use cases Port AI will support? (Click to expand)</summary>

Port AI supports two primary interaction types:

1. **Ask Me Anything (Information Queries)**
    - Natural language queries about your development ecosystem
    - Examples: "Who owns service X?", "What's the deployment frequency of team Y?"
    - Focused on surfacing information from connected data sources
2. **Run an Action (Form Generation)**
    - Assist with running or pre-filling self-service actions
    - Examples: "Create a bug report", "Set up a new service"
    - Important: you can decide whether the agent can run the action automatically
</details>

<details>
<summary>How do users interact with Port AI? (Click to expand)</summary>

- Primary interface is through our [Slack app](/ai-interfaces/ai-agents/slack-app).
- Full [API availability](/api-reference/port-api/).
</details>

<details>
<summary>Can customers customize the AI agents? (Click to expand)</summary>

Yes - you can create custom AI agents within Port. Customization includes:
- Creating new agents using Port's blueprint system.
- Configuring agent knowledge base and access to tools.
- Adjusting prompts and agent behaviors.
- Setting permissions and usage boundaries.

All agents operate within Port's secure framework and governance controls.
</details>

<details>
<summary>How is customer data handled? (Click to expand)</summary>

All data processing occurs within our cloud infrastructure, and no data used for model training. We ensure complete logical separation between different customers' data. 

We store data from your interactions with AI agents for up to 30 days. We use this data to ensure agents function correctly and to identify and prevent problematic or inappropriate AI behavior. 
We limit this data storage strictly to these purposes. You can contact us to opt-out of this data storage.
</details>

<details>
<summary>Which LLM models are you using? (Click to expand)</summary>

We use different models depending on the backend mode:

- **Standard backend**: OpenAI's GPT models for reliable performance and broad compatibility
- **MCP server backend**: Claude models for enhanced reasoning and analysis capabilities

We aim to use the best models that will yield the best results while keeping your data safe. Model selection may evolve as we continue to optimize agent performance.
</details>

<details>
<summary>How can we audit and control AI usage? (Click to expand)</summary>

Each interaction of the agent is saved and can be viewed in the audit logs, ensuring transparency and accountability. You have control over who can interact with and see the agents through our granular permission controls, along with an admin dashboard for monitoring usage, export capabilities for audit logs, and available rate limiting and usage controls.
</details> 