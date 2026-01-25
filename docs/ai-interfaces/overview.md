---
sidebar_position: 1
title: Overview
---

# AI Interfaces Overview

Port's AI interfaces provide intelligent assistance across your entire software development lifecycle. All AI features are currently in **open beta**.

We're committed to developing AI responsibly, maintaining high standards of data privacy and security. **[Learn more about our security & data controls →](/ai-interfaces/port-ai/security-and-data-controls)**

## What makes Port's AI different

Port's AI interfaces are powered by its [Context Lake](/ai-interfaces/context-lake) - your unified engineering knowledge layer that connects data from across your entire toolchain. Port's AI understands YOUR organization: your service ownership, deployment patterns, team structures, quality standards, and operational context.

This organizational intelligence enables AI to provide accurate answers about who owns what, make decisions within your governance guardrails, and take actions that align with your engineering standards.

**[Learn more about Context Lake →](/ai-interfaces/context-lake)**

## Port's AI Offerings

import BetaFeatureNotice from '/docs/generalTemplates/_beta_feature_notice.md'

<BetaFeatureNotice id="ai-form" />


### Port AI
The foundational AI infrastructure that powers all intelligent responses within Port. Port AI provides the underlying capabilities for natural language understanding, context awareness, and intelligent automation across your development ecosystem.

**[Learn more about Port AI →](/ai-interfaces/port-ai/overview)**

### Port AI Assistant
The fastest way to get started with Port's AI capabilities. An out-of-the-box chat interface available through a floating button that requires zero configuration.

**Use Port AI Assistant to:**
* Ask questions about your software catalog and actions.
* Get help with Port features and documentation.
* Execute actions with approval mode safety.
* Explore your data without complex queries.

**Example questions:**
* "Which services are failing security checks?"
* "How do I deploy the auth service to production?"
* "Give me a weekly summary of open bugs"
* "Who owns this component?"

Perfect for immediate insights without dedicated customizations. No agents, no configuration - just start asking questions.

**[Learn more about Port AI Assistant →](/ai-interfaces/port-ai-assistant)**


### AI Agents
Customize and orchestrate complicated workflows inside Port. Build intelligent agents that can be used as part of automations and engineering workflows.

**Use AI Agents to:**
* Automate incident response workflows
* Create intelligent PR review processes  
* Build custom task management assistants
* Generate automated deployment reports
* Orchestrate multi-step engineering processes

AI Agents provide advanced customization for teams that want to build sophisticated, domain-specific AI workflows.

**[Explore AI Agents →](/ai-interfaces/ai-agents/overview)**

### MCP Server

:::info Open Beta
Port MCP Server is currently in open beta and available for wide usage.
:::

Seamless connection to your IDE and AI agents, allowing builders to build Port in natural language and developers/AI agents to ask questions and run actions directly from their development environment.

**Use MCP Server to:**
* Ask questions about your catalog from within your IDE, like getting the API specs required for a task
* Run Port actions without leaving your code editor, like creating a new dev env for testing your feature
* Build and modify Port configurations using natural language, like creating a production readiness scorecard
* Access Port's API and tools through familiar development interfaces

The MCP Server provides AI machine interface capabilities that are compatible with AI Agents and integrates directly with your development workflow.

**[Set up MCP Server →](/ai-interfaces/port-mcp-server/overview-and-installation)**

### Slack App
Interact with Port's AI capabilities directly from Slack. Ask questions, run actions, and get insights without leaving your team communication platform.

**[Learn about the Slack App →](/ai-interfaces/slack-app)**

### Port n8n node
Integrate Port's AI capabilities into your n8n automation workflows. Use Port as a context lake to enrich your workflows with organizational context, invoke AI agents, and query your software catalog directly from n8n.

**[Set up Port n8n node →](/ai-interfaces/port-n8n-node)**

## Getting Started

### For Quick AI Interaction
Start with **Port AI Assistant** for immediate access to AI-powered insights about your development environment.

### For Custom Workflows  
Explore **AI Agents** to build sophisticated, customized AI workflows tailored to your team's specific needs. For n8n automation workflows, use the **Port n8n node** to integrate Port's Context Lake and AI capabilities into your existing automation infrastructure.

### For IDE Integration
Set up the **MCP Server** to bring Port's AI capabilities directly into your development environment.

### For Team Collaboration
Use the **Slack App** to make AI insights available to your entire team in your communication platform.

## Feature Support Matrix

The following table shows which capabilities are supported across Port's AI interfaces:

<div style={{overflowX: 'auto'}}>

| Feature | Context Lake Query | Run Actions | Manage Blueprints | Manage Entities | Manage Scorecards | Manage Actions | Reuse Prompts | Load Skills | Memory | Invoke AI Agents | Manage Pages & Widgets | Manage Integrations | Manage Data Mapping |
|--------------------------------|-------------------|-------------------|-------------------|-------------------|-------------------|-------------------|-------------------|-------------------|-------------------|-------------------|-------------------|-------------------|-------------------|
| **Port MCP Server** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Port AI Invocation** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Port AI Agents** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Port AI Chat Widget** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Port Slack App** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Port AI Assistant** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Port n8n node** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |

</div>

## Frequently Asked Questions

<details>
<summary>What are the available Port AI interfaces? (Click to expand)</summary>

Port offers several AI interfaces:
- **Port AI Assistant**: Chat interface for quick questions and insights.
- **AI Agents**: Customizable workflows for automations.
- **MCP Server**: IDE integration for development workflows.
- **Slack App**: Team collaboration interface.
- **Port n8n node**: n8n automation integration for custom workflows.
</details>

<details>
<summary>What's the difference between Port AI Assistant and AI Agents? (Click to expand)</summary>

**Port AI Assistant** is designed for immediate use with zero configuration. It provides instant answers about your development environment through a floating chat button. It's perfect for quick insights, exploratory queries, and learning about Port. **[Learn more →](/ai-interfaces/port-ai-assistant)**

**AI Agents** are customizable entities designed for specific workflows and automations. They're built for machine-to-machine interactions and complex, domain-specific processes that require dedicated configuration. **[Learn more →](/ai-interfaces/ai-agents/overview)**
</details>

<details>
<summary>Which AI interface should I start with? (Click to expand)</summary>

For most users, start with **Port AI Assistant** - it provides immediate value with no setup required. Available through a floating button, you can ask questions and get insights right away. **[Get started with Port AI Assistant →](/ai-interfaces/port-ai-assistant)**

If you're a developer who works primarily in an IDE, consider starting with the **MCP Server** for seamless integration with your development workflow. **[Set up MCP Server →](/ai-interfaces/port-mcp-server/overview-and-installation)**

For custom workflows or automation, explore **AI Agents**. **[Learn about AI Agents →](/ai-interfaces/ai-agents/overview)**

For n8n automation workflows, use the **Port n8n node** to integrate Port's Context Lake and AI capabilities. **[Set up Port n8n node →](/ai-interfaces/port-n8n-node)**

For team collaboration, try the **Slack App** to bring AI insights into your communication platform. **[Explore Slack App →](/ai-interfaces/slack-app)**
</details>

<details>
<summary>What's the current availability status of Port's AI features? (Click to expand)</summary>

- **Port AI Assistant**: Open beta - available to all users.
- **MCP Server**: Open beta - available to all users.
- **AI Agents**: Open beta - available to all users.
- **Slack App**: Open beta - available to all users.
- **Port n8n node**: Open beta - available to all users.
</details>

<details>
<summary>How does Port handle AI security and data privacy? (Click to expand)</summary>

Port maintains high standards of data privacy and security across all AI interfaces. We provide comprehensive security controls, data governance policies, and privacy protections.

**[Learn more about our security & data controls →](/ai-interfaces/port-ai/security-and-data-controls)**
</details>

<details>
<summary>Can I use Port's AI capabilities from my IDE? (Click to expand)</summary>

Yes! The **MCP Server** provides seamless integration with popular IDEs like VS Code and Cursor. You can ask questions about your catalog, run Port actions, and build configurations using natural language directly from your development environment.

**[Set up MCP Server →](/ai-interfaces/port-mcp-server/overview-and-installation)**
</details>

