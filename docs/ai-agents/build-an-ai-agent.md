---
sidebar_position: 2
title: Build an AI agent
---

# Build an AI agent

import ClosedBetaFeatureNotice from '/docs/generalTemplates/_closed_beta_feature_notice.md'
import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

<ClosedBetaFeatureNotice id="ai-form" />

## Getting started

Building an AI agent in Port involves several key steps.  
Let's walk through the process of creating an agent that can assist your developers with finding information and completing tasks.

## Create a new AI agent

To create a new agent, head to the AI Agents catalog page (this page will be created for you when you [activate the feature](/ai-agents/overview#access-to-the-feature)).

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

### Step 2: Configure data access

When setting up the data your agent has access to, ask yourself what information it needs to achieve its goals effectively. Consider:

- What entities and properties should the agent be able to query?
- What relationships between entities are important?

For example:
- To answer "What are my Jira tickets?", the agent needs access to `users`, `Jira issue`, and any entities connecting them.
- For "What are all the incidents affecting service X?", the agent needs access to `teams`, `incidents`, and `services`.

Pay attention to relationships between entities to ensure your agent can provide comprehensive answers.

### Step 3: Configure actions (optional)

If your agent needs to run actions, you will need to:

1. Get the action identifier from the [self-service](https://app.getport.io/self-serve) page.
2. Add it to your agent's configuration.
3. Decide whether the agent can run the action automatically or requires approval.

<Tabs groupId="action-approval" queryString>
<TabItem value="manual-approval" label="Manual Approval">

When configured for manual approval, the agent will:
1. Create a draft action based on the user's request.
2. Provide a link to the draft.
3. Allow the user to review and modify properties before execution.

An example answer might look like this:
```markdown
I've drafted the action for you. You can access it in this link
```

This approach provides an additional safety layer, ensuring users can verify all parameters before execution.

</TabItem>
<TabItem value="automatic-execution" label="Automatic Execution">

When configured for automatic execution, the agent will:
1. Determine the appropriate parameters based on the user's request.
2. Execute the action immediately.
3. Provide a link to the action run.

An example answer might look like this:
```markdown
I've ran the action for you. You can view its progress in this link.
```

This approach streamlines workflows but should be used carefully, especially for actions with significant impact.

</TabItem>
</Tabs>

### Step 4: Define the prompt

The prompt is your main tool for influencing your agent's success. You will likely iterate on it as you observe how the agent responds to different queries.  
In our experience, a good prompt includes:

1. **Goal**: Clearly explain what the agent is designed to do in business terms without diving too deep into technical details.

2. **Domain context**: Share specifics about your data and terminology. For example, explain what "service" means in your organization's context.

3. **Response style**: Define how you want the agent to communicate - formal, friendly, concise, etc.

We recommend starting with a simple prompt and refining it based on how the agent performs. Here's a basic template:

```markdown 
Your goal is to help developers [primary purpose, e.g., "find information about our services and assist with deployment processes"].

When answering questions:
- Be concise and direct
- Include links to relevant resources when available
```

<img src='/img/ai-agents/AIAgentPrompt.png' width='80%' border='1px' />

### Step 5: Add conversation starters

Conversation starters are example questions you expect users to ask your agent. They serve multiple important purposes:

1. **Set expectations**: They help users understand what the agent can do and what types of questions it can answer effectively.
2. **Provide guidance**: They give users a starting point for interacting with the agent.
3. **Test cases**: They serve as your first test cases to validate that the agent works as expected.

Conversation starters are saved as strings in an array. When creating your agent, add 3-5 example questions that represent common use cases.

For example, a service information agent might have these conversation starters:

```json
[
  "Who owns the payments service?",
  "When was the last PR merged in the purchase service?",
  "Who is on call now for the frontend application?",
  "What's the current health status of the authentication service?",
  "Show me all services owned by the platform team"
]
```

Choose conversation starters that:
- Cover the main use cases of your agent
- Use terminology specific to your organization
- Demonstrate the depth of knowledge your agent has access to

### Step 6: Activate your agent

When you feel your agent is ready:

1. Set its status to "Active".
2. Start interacting with it through the [available interfaces](/ai-agents/interact-with-ai-agents).

## Evaluating your agent performance

Continuous evaluation and improvement are essential for maintaining effective AI agents. We recommend implementing a regular review process to track and improve the quality of your agent's responses over time:

1. **Weekly reviews**: Set aside time each week to review a sample of agent interactions through the "Invocations" tab.
2. **Identify patterns**: Look for recurring issues or misunderstandings in how the agent interprets queries.
3. **Analyze execution plans**: Examine how the agent processes requests by reviewing the execution plan and tool calls for specific invocations. This helps identify where improvements are needed.
4. **Refine the prompt**: Update your agent's prompt based on your findings to address common issues.

For more details on how to view execution plans and analyze agent behavior, see [Interact with AI agents](/ai-agents/interact-with-ai-agents).

## Examples

### Example 1: Service Information Agent

This agent helps developers find information about services in their organization:

```markdown
Your goal is to help developers find information about our microservices, their owners, and current status.

When answering questions:
- Always include links to service documentation when available
- Include the team owner for each service mentioned
- Provide deployment status when relevant
```

### Example 2: Deployment Assistant

This agent helps with deployment processes:

```markdown
Your goal is to help developers initiate and track deployments to various environments.
```

## Formatting the agent response
To format the agent's response, you can specify the desired format in its prompt. For optimal results when using the UI, it's recommended to request a markdown format response. 
This allows for better presentation and readability of the information provided by the agent.
When sending messages through Slack, our [Slack app](/ai-agents/slack-app) convert the markdown format into a Slack compatible formatting.

### Example of a Markdown Response
```markdown
:rocket: *New version deployed!*
[Added logs](https://www.example.com)
From [john-123](https://github.com/john-123)
```

## Troubleshooting & FAQ

<details>
<summary><b>I don't see an option to add an AI agent (Click to expand)</b></summary>

Make sure you have [access to the AI agents feature](/ai-agents/overview#access-to-the-feature). Note that it's currently in closed beta and requires special access. If you believe you should have access, please contact our support.
</details>

<details>
<summary><b>I'm not sure what to write in the prompt (Click to expand)</b></summary>

Start with one sentence explaining what the agent is about, and then interact with it to see how it responds. It's better to start small and iterate based on actual usage rather than trying to create a perfect prompt from the beginning.
</details>

<details>
<summary><b>Are there any limitations to what the agents have access to? (Click to expand)</b></summary>

AI agents in Port can search, group, and index entities in your Port instance. However, there are some technical limitations to be aware of:

- **Search capabilities**: 
  - Search API returns up to 25 entities.
  - Similarity search returns up to 10 entities.
  - Similarity search indexes the first 8K tokens of identifier, title, and string properties above 50 characters (ignoring content beyond 8K tokens).

- **Data processing limits**:
  - 1 interaction for the plan, and up to 5 interactions for the execution (tools/final answer).
  - LLM output is limited to 2000 tokens per interaction.
  - Entities grouping tool can return count by property, scorecard, or relation (with additional filters supported like in the search tool).
  - Entities grouping can return up to 50 groups.
  - Entities search returns up to 10 related entities for each entity.
  - Entities search returns only the scorecard level (e.g., you can't ask about specific rules).

- **Context requirements**:
  - To select an action for the agent, all the blueprints of the entity selection fields must be included in the agent's blueprints.
  - The response can only be based on relations that can be achieved from the allowed blueprints.

- **Permission model**:
  - Interaction with the AI agent is based on your user permissions.
  - Sequential automations run as Admin.
</details>

<details>
<summary><b>How can I make sure the agent doesn't run an action without my approval? (Click to expand)</b></summary>

When configuring your agent's actions, make sure you select the "approval" option instead of allowing automatic execution. This ensures that the agent will create draft actions that require your review and approval before execution.
</details>

## Security considerations

AI agents in Port are designed with security and privacy as a priority.
For more information on security and data handling, see our [AI agents overview](/ai-agents/overview#security-and-data-handling). 