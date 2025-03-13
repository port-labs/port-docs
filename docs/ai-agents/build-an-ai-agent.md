---
sidebar_position: 2
title: Build an AI agent
---

# Build an AI agent

import ClosedBetaFeatureNotice from '../generalTemplates/_closed_beta_feature_notice.md'
import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

<ClosedBetaFeatureNotice 
  accessRequestMethod={
    <span>please reach out to us by filling <a href='https://forms.gle/krhMY7c9JM8MyJJf7'>this form</a>.</span>
  } 
/>

## Getting started

Building an AI agent in Port involves several key steps.  
Let's walk through the process of creating an agent that can assist your developers with finding information and completing tasks.

<!-- IMAGE SUGGESTION: Add a screenshot of the AI agent creation page or dashboard here -->

## Create a new AI agent

There are two ways to create an AI agent:

1. Create a new entity through the Port interface.
2. Using Port's custom action.

<!-- IMAGE SUGGESTION: Add a screenshot showing the two ways to create an agent (UI navigation) -->

Both approaches follow similar steps:

1. Decide on the data the agent needs access to.
2. Determine which actions the agent can run (if any).
3. Build a prompt for your agent.

TBD TO ADD:
* JSON to the action that adds an AI agent
* Screenshots

### Step 1: Define your agent's purpose

The first step in building an AI agent is deciding on its purpose. Let's determine whether the agent will:

- Answer questions about your development environment.
- Help run actions and complete tasks.

We recommend starting with a simple use case that a junior assistant with access to your data could assist with. 

<!--  For inspiration, check our [AI agents guides](/guides). -->

### Step 2: Configure data access

When setting up the data your agent has access to, ask yourself what information it needs to achieve its goals effectively. Consider:

- What entities and properties should the agent be able to query?
- What relationships between entities are important?

For example:
- To answer "What are my Jira tickets?", the agent needs access to `users`, `Jira issue`, and any entities connecting them.
- For "What are all the incidents affecting service X?", the agent needs access to `teams`, `incidents`, and `services`.

Pay attention to relationships between entities to ensure your agent can provide comprehensive answers.

<!-- IMAGE SUGGESTION: Add a screenshot of the data access configuration interface -->

### Step 3: Configure actions (optional)

If your agent needs to run actions, you'll need to:

1. Get the action identifier from the self-service actions page.
2. Add it to your agent's configuration.
3. Decide whether the agent can run the action automatically or requires approval.

<!-- IMAGE SUGGESTION: Add a screenshot of the action configuration interface -->

<Tabs groupId="action-approval" queryString>
<TabItem value="manual-approval" label="Manual Approval">

When configured for manual approval, the agent will:
1. Create a draft action based on the user's request.
2. Provide a link to the draft.
3. Allow the user to review and modify properties before execution.

<img src='/img/ai-agents/manual-approval-flow.png' width='80%' border='1px' />

This approach provides an additional safety layer, ensuring users can verify all parameters before execution.

</TabItem>
<TabItem value="automatic-execution" label="Automatic Execution">

When configured for automatic execution, the agent will:
1. Determine the appropriate parameters based on the user's request.
2. Execute the action immediately.
3. Provide a link to the action run.

<img src='/img/ai-agents/automatic-execution-flow.png' width='80%' border='1px' />

This approach streamlines workflows but should be used carefully, especially for actions with significant impact.

</TabItem>
</Tabs>

### Step 4: Define the prompt

The prompt is your main tool for influencing your agent's success. You'll likely iterate on it as you observe how the agent responds to different queries. From our experience, a good prompt includes:

1. **Goal**: Clearly explain what the agent is designed to do in business terms without diving too deep into technical details.

2. **Domain context**: Share specifics about your data and terminology. For example, explain what "service" means in your organization's context.

3. **Response style**: Define how you want the agent to communicate - formal, friendly, concise, etc.

We recommend starting with a simple prompt and refining it based on how the agent performs. Here's a basic template:

```markdown 
You are an AI assistant for [Company Name]'s development team.

Your goal is to help developers [primary purpose, e.g., "find information about our services and assist with deployment processes"].

When answering questions:
- Be concise and direct
- Include links to relevant resources when available
- If you're unsure about something, acknowledge it rather than guessing

Key terminology:
- Service: [your definition]
- [Other important terms]: [definitions]
```

<!-- IMAGE SUGGESTION: Add a screenshot of the prompt configuration interface -->

### Step 5: Activate your agent

When you feel your agent is ready:

1. Set its status to "Active".
2. Start interacting with it through the [available interfaces](/ai-agents/interact-with-the-ai-agent).

## Examples

### Example 1: Service Information Agent

This agent helps developers find information about services in your organization:

```markdown
You are an AI assistant for the DevOps team.

Your goal is to help developers find information about our microservices, their owners, and current status.

When answering questions:
- Always include links to service documentation when available
- Include the team owner for each service mentioned
- Provide deployment status when relevant

Key terminology:
- Service: A microservice in our architecture that serves a specific business function
- Owner: The team responsible for maintaining and developing a service
- Health: The current operational status of a service based on its Production Readiness scorecard
```

TBD - add a full JSON and screenshot

### Example 2: Deployment Assistant

This agent helps with deployment processes:

```markdown
You are a deployment assistant for the engineering team.

Your goal is to help developers initiate and track deployments to various environments.

When helping with deployments:
- Confirm the service name and version
- Verify the target environment
- Remind users of any pre-deployment checks
```
TBD - add a full JSON and screenshot

## Troubleshooting & FAQ

<details>
<summary><b>I don't see an option to add an AI agent (Click to expand)</b></summary>

Make sure you have access to the AI agents feature. Note that it's currently in closed beta and requires special access. If you believe you should have access, please contact our support.
</details>

<details>
<summary><b>I'm not sure what to write in the prompt (Click to expand)</b></summary>

Start with one sentence explaining what the agent is about, and then interact with it to see how it responds. It's better to start small and iterate based on actual usage rather than trying to create a perfect prompt from the beginning.
</details>

<details>
<summary><b>Are there any limitations to what the agents have access to? (Click to expand)</b></summary>

TBD TO ADD
</details>

<details>
<summary><b>How can I make sure the agent doesn't run an action without my approval? (Click to expand)</b></summary>

When configuring your agent's actions, make sure you select the "approval" option instead of allowing automatic execution. This ensures that the agent will create draft actions that require your review and approval before execution.
</details>

## Security considerations

AI agents in Port are designed with security and privacy as a priority.
For more information on security and data handling, see our [AI agents overview](/ai-agents/overview#security-and-data-handling). 