---
sidebar_position: 1
title: Overview
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortTooltip from "/src/components/tooltip/tooltip.jsx"
import ClosedBetaFeatureNotice from '/src/components/ClosedBetaFeatureNotice'

# AI agents overview

<ClosedBetaFeatureNotice id="aiAgents" />

## What are Port AI agents?

Port AI agents are customizable building blocks that enhance your developer portal with intelligent assistance.  
These agents help your developers find information faster and complete tasks more efficiently across your development ecosystem.

## What can AI agents do?

AI agents serve two primary functions:

1. **Answer questions** about your development environment, services, and processes using natural language. Developers can ask questions and get immediate, contextual answers.

2. **Assist with actions** by helping developers complete common tasks faster. Agents can suggest and pre-fill forms, guide developers through workflows, and provide relevant context for decision-making. You can decide whether they can run an action or require human approval.

### Example use cases

**Questions your agents can answer:**
- "Which services are failing security checks?"
- "When was the last successful deployment of the payment service?"
- "Who is the owner for this component?"

**Actions your agents can help with:**
- "Can you help me deploy service X to production?"
- "Please notify the reviewers of PR #1234"

## Getting started with AI agents

To start working with AI agents, follow these steps:

1. **Apply for access** - Submit your application via [this form](https://forms.gle/krhMY7c9JM8MyJJf7).
2. **Access the feature** - If accepted, you will be able to activate the AI agents in your Port organization.
3. **Build your agents** - [Create custom agents](/ai-agents/build-an-ai-agent) to meet your developers' needs.
4. **Interact with your agents** - Engage with your agents by following our [interaction guide](/ai-agents/interact-with-the-ai-agent).

## Customization and control

[Build and customize](/ai-agents/build-an-ai-agent) your AI agents:
- Define which data sources your agents can access.
- Determine what actions your agents can assist with.
- Set permissions for who can use specific agents.
- Configure how agents integrate with your workflows.

## Security and data handling

AI agents are designed with security as a priority:
- Agents only have access to the data you explicitly provide.
- Your data remains within Port's secure infrastructure.
- LLM processing happens within our cloud infrastructure. 
- Your data is not used for model training.

## Start simple & expand as needed

Begin with focused use cases that deliver immediate value, such as helping developers find service information or streamlining incident management.  
As your team builds confidence in the agents, you can expand their capabilities to cover more complex scenarios and workflows.

## Access to the feature

Currently, AI agents are in closed beta access, and you must get approved for the feature first. Once approved, you can enable the feature in your Port organization by calling this API:

```bash showLineNumbers
curl --location --request PATCH 'https://api.getport.io/v1/organization/ai/register' \
--header 'Authorization: Bearer <YOUR_PORT_API_TOKEN>'
```

Your organization now has the system blueprints required for the feature to work.

## Data Model
The data model of AI agents includes two main blueprints:

1. **AI agents** - The agents themselves that you can interact with. You can build new ones and customize them as you wish. Learn more in our [Build an AI agent](/ai-agents/build-an-ai-agent) guide.

2. **AI invocations** - Each interaction made with an AI agent is recorded as an invocation. This acts as a log of everything going through your AI agents so you can monitor and improve them over time. Learn more in our [Interact with the AI agent](/ai-agents/interact-with-the-ai-agent) guide.

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

- Primary interface is through our Slack app
- Full API availability
</details>

<details>
<summary>Can customers customize the AI agents? (Click to expand)</summary>

Yes - you can create custom AI agents within Port. Customization includes:
- Creating new agents using Port's blueprint system
- Configuring agent knowledge base and access to tools
- Adjusting prompts and agent behaviors
- Setting permissions and usage boundaries

All agents operate within Port's secure framework and governance controls.
</details>

<details>
<summary>How is customer data handled? (Click to expand)</summary>

All data processing occurs within our cloud infrastructure, and no data used for model training. We ensure complete logical separation between different customers' data.
</details>

<details>
<summary>Which LLM models are you using? (Click to expand)</summary>

We aim to use the best models that will yield the best results while keeping your data safe; at the moment, we work with Open AI's GPT models, but this could change in the future.
</details>

<details>
<summary>How can we audit and control AI usage? (Click to expand)</summary>

Each interaction of the agent is saved and can be viewed in the audit logs, ensuring transparency and accountability. You have control over who can interact with and see the agents through our granular permission controls, along with an admin dashboard for monitoring usage, export capabilities for audit logs, and available rate limiting and usage controls.
</details> 