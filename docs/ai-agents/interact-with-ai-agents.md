---
sidebar_position: 3
title: Interact with AI agents
---

# Interact with AI agents

import ClosedBetaFeatureNotice from '/docs/generalTemplates/_closed_beta_feature_notice.md'
import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

<ClosedBetaFeatureNotice id="ai-form" />

## Getting started

Once you've built your AI agents, it's time to interact with them. Port provides several ways to communicate with your AI agents.

## Interaction options

You have two main approaches when interacting with AI agents in Port:

<Tabs groupId="interaction-approach" queryString>
<TabItem value="specific-agent" label="Specific agent">

Choose a specific agent when you have a structured scenario, such as triggering an agent from an automation or using an AI widget. This approach works best when you know exactly which agent has the expertise needed for your task, or when the interaction method requires you to select a specific agent.

</TabItem>
<TabItem value="agent-router" label="Agent router">

The agent router is used when you prefer a more conversational interaction, or when the interaction method doesn't allow for selecting a specific agent directly. The router intelligently determines which agent is best suited to handle your request based on its content and context. This is the default for interactions via Slack, unless a specific agent is targeted. For API and action-based interactions, you can choose to direct your request to the agent router.

</TabItem>
</Tabs>

## Interaction methods

<Tabs groupId="interaction-methods" queryString>
<TabItem value="widget" label="Widget">

You can add AI agents directly to your dashboards as interactive widgets, providing easy access to their capabilities right where you need them.

Follow these steps to add an AI agent widget:

1. Go to a dashboard.
2. Click on `+ Widget`.
3. Select the `AI Agent`.
4. Choose the agent and position it in the widget grid.

<img src='/img/ai-agents/AIAgentWidgetMenu.png' width='80%' border='1px' />

The widget provides a chat interface where you can ask questions and receive responses from the **specific agent you configured** without leaving your dashboard.

</TabItem>
<TabItem value="slack-integration" label="Slack Integration">

The Slack integration provides the most natural way to interact with Port's AI agents. This method abstracts all technical details, allowing for free-flowing conversations. By default, messages sent to the Port Slack app (either via direct message or by mentioning it in a channel) are handled by the **agent router**.

You can interact with agents in two ways:

1. **Direct messaging** the [Port Slack app](/ai-agents/slack-app). This will use the agent router.
2. **Mentioning** the app in any channel it's invited to. This will also use the agent router.

When you send a message, the app will:
1. Open a thread.
2. Respond with the agent's answer.

<img src='/img/ai-agents/AIAgentsSlackExample.png' width='80%' border='1px' />
<br/><br/>

**Tips for effective Slack interactions**

- To target a **specific agent** instead of using the router, include the agent's nickname at the beginning of your message (e.g., "@Port DevAgent what are our production services?").
- Send follow-up messages in the same thread and mention the app again to continue the conversation.
- Keep conversations focused on the same topic for best results.
- Limit threads to five consecutive messages for optimal performance.
- For best results, start new threads for new topics or questions.

</TabItem>
<TabItem value="actions-automations" label="Actions and automations">

You can trigger AI agents through Port's actions and automations, allowing you to integrate AI capabilities into your existing workflows. When configuring an action or automation, you can choose to invoke a **specific agent** or send the request to the **agent router**.

For example, when a new incident is created in Port, you can trigger an agent that:
- Triages the incident.
- Summarizes relevant information.
- Sends a notification to Slack.

<img src='/img/ai-agents/AIAgentsAutomationExample.png' width='80%' border='1px' />

</TabItem>
<TabItem value="api-integration" label="API integration">

Port is an API-first platform, allowing you to integrate AI agents into your custom workflows. You can interact with agents in two main ways: by **streaming responses** as Server-Sent Events (SSE) for real-time updates, or by **polling for a complete response**.

<Tabs groupId="api-interaction-methods" queryString>
<TabItem value="streaming" label="Streaming (Recommended)" default>

**Streaming Responses (Recommended)**

Streaming allows you to receive parts of the agent's response as they are generated, providing a more interactive experience. This is achieved by adding the `stream=true` query parameter to the invoke API call (see [Invoke a specific agent API](/api-reference/invoke-a-specific-agent) or [Invoke an agent API](/api-reference/invoke-an-agent)). The response will be in `text/event-stream` format.

**Interaction Process (Streaming):**

1.  Invoke the agent with the `stream=true` parameter.
2.  The API will start sending Server-Sent Events.
3.  Your client should process these events as they arrive. Each event provides a piece of information about the agent's progress or the final response.

**cURL Example for Streaming:**

The following example shows how to invoke a specific agent, but the router agent be similarly used as well.

```bash
curl 'https://api.port.io/v1/agent/<AGENT_IDENTIFIER>/invoke?stream=true' \\
  -H 'Authorization: Bearer <YOUR_API_TOKEN>' \\
  -H 'Content-Type: application/json' \\
  --data-raw '{"prompt":"What is my next task?"}'
```

**Streaming Response Details (Server-Sent Events):**

The API will respond with `Content-Type: text/event-stream; charset=utf-8`.

Each event in the stream has the following format:
```text
event: <event_name>
data: <json_payload_or_string>

```
Note the blank line after `data: ...` which separates events.

Here's an example sequence of events:
```text
event: plan
data: { "plan": "...", "toolCalls": [...] }

event: execution
data: Your final answer from the agent.

event: done
data: {}
```

**Possible Event Types:**

<details>
<summary><b><code>agentSelection</code> (Click to expand)</b></summary>

Provides the result from the agent router.

```json
{
  "type": "SELECTED_AGENT",
  "identifier": "agent_id",
  "thought_process": "Why this agent was selected..."
}
```
    *   `type` can also be `"NO_AGENT_MATCH"` if no suitable agent is found.
</details>

<details>
<summary><b><code>checkIfActionRequested</code> (Click to expand)</b></summary>

Indicates which self-service action, if any, the agent has decided to run.

```json
{
  "actionIdentifier": "action_id"
}
```
    *   Can also be `{"actionIdentifier": null}` if no action is requested.
</details>

<details>
<summary><b><code>plan</code> (Click to expand)</b></summary>

Details the agent's reasoning and intended steps (tools to be called, etc.).

```json
{
  "plan": "Detailed plan...",
  "toolCalls": [
    {
      "name": "tool_name",
      "arguments": {}
    }
  ]
}
```
</details>

<details>
<summary><b><code>execution</code> (Click to expand)</b></summary>

The final textual answer or a chunk of the answer from the agent for the user. For longer responses, multiple `execution` events might be sent.
</details>

<details>
<summary><b><code>done</code> (Click to expand)</b></summary>

Signals that the agent has finished processing and the response stream is complete.

```json
{}
```
</details>

</TabItem>
<TabItem value="polling" label="Polling">

**Polling for Responses**

If you prefer to get the entire response at once after processing is complete, or if your client doesn't support streaming, you can use the polling method.

1.  Invoke the agent (see [Invoke a specific agent API](/api-reference/invoke-a-specific-agent)) or agent router (see [Invoke an agent API](/api-reference/invoke-an-agent)) with your request (without `stream=true`).
2.  Receive an `invocationId` in the response.
3.  Periodically poll the AI invocation endpoint (see [Get an invocation's result API](/api-reference/get-an-invocations-result)) using the `invocationId` until the `status` field indicates completion (e.g., `Completed` or `Failed`).
4.  The final response will be available in the polled data once completed.

<img src='/img/ai-agents/AIAgentTriggerFlowDiagram.png' width='70%' border='1px' />

</TabItem>
</Tabs>

</TabItem>
</Tabs>

## Discovering Available Agents

:::info AI Agents as Entities
AI agents are standard Port entities belonging to the `_ai_agent` blueprint. This means you can query, manage, and interact with them using the same API endpoints and methods you use for any other entity in your software catalog.
:::

You can discover available AI agents in your Port environment in a couple of ways:

1.  **AI Agents Catalog Page**: Navigate to the AI Agents catalog page in Port. This page lists all the agents that have been created in your organization. For more details on creating agents, refer to the [Build an AI agent guide](/ai-agents/build-an-ai-agent).
2.  **Via API**: Programmatically retrieve a list of all AI agents using the Port API. AI agents are entities of the `_ai_agent` blueprint. You can use the [Get all entities of a blueprint API endpoint](https://docs.port.io/api-reference/get-all-entities-of-a-blueprint) to fetch them, specifying `_ai_agent` as the blueprint identifier.

<details>
<summary>cURL Example</summary>

```bash
curl -L 'https://api.port.io/v1/blueprints/_ai_agent/entities' \
    -H 'Accept: application/json' \
    -H 'Authorization: Bearer <YOUR_API_TOKEN>'
```

</details>

## AI interaction details

Every AI agent interaction creates an entity in Port, allowing you to track and analyze the interaction. This information helps you understand how the agent processed your request and identify opportunities for improvement.

### Plan

The plan shows how the agent decided to tackle your request and the steps it intended to take. This provides insight into the agent's reasoning process.

<img src='/img/ai-agents/AIAgentsPlan.png' width='80%' border='1px' />


### Tools used

This section displays the actual steps the agent took and the APIs it used to complete your request. It can be particularly helpful for debugging when answers don't meet expectations, such as when an agent:

- Used an incorrect field name.
- Chose an inappropriate property.
- Made other logical errors.

<img src='/img/ai-agents/AIAgentsTools.png' width='80%' border='1px' />


### Tokens

Each interaction records both input and output tokens, helping you understand your LLM usage. This information can be valuable for:

- Identifying which agents consume more of your token allocation.
- Optimizing prompts for efficiency.
- Managing costs effectively.

### Data handling

We store data from your interactions with AI agents for up to 30 days. We use this data to ensure agents function correctly and to identify and prevent problematic or inappropriate AI behavior. 
We limit this data storage strictly to these purposes. You can contact us to opt-out of this data storage.

## Limits

Port applies limits to AI agent interactions to ensure fair usage across all customers:

- **Query limit**: ~40 queries per hour.
- **Token usage limit**: 800,000 tokens per hour.

:::caution Usage limits
Usage limits may change without prior notice. Once a limit is reached, you will need to wait until it resets.  
If you attempt to interact with an agent after reaching a limit, you will receive an error message indicating that the limit has been exceeded.
The query limit is estimated and depends on the actual token usage.
:::

## Common errors

Here are some common errors you might encounter when working with AI agents and how to resolve them:

<details>
<summary><b>Missing Blueprints Error (Click to expand)</b></summary>

**Error message:**  
`{"missingBlueprints":["{{blueprint name}}","{{blueprint name}}"]}`

**What it means:**  
This error occurs when an AI agent tries to execute a self-service action that requires selecting entities from specific blueprints, but the agent doesn't have access to those blueprints.

**How to fix:**  
Add the missing blueprints listed in the error message to the agent's configuration.
</details>

## Security considerations

AI agent interactions in Port are designed with security and privacy as a priority.

For more information on security and data handling, see our [AI agents overview](/ai-agents/overview#security-and-data-handling). 

## Troubleshooting & FAQ

<details>
<summary><b>The agent is taking long to respond (Click to expand)</b></summary>

Depending on the agent definition and task, as well as load on the system, it may take a few seconds for the agent to respond. Response times between 20 to 40 seconds are acceptable and expected. 

If responses consistently take longer than this, consider:
- Checking the details of the invocation.
- Reaching out to our Support if you feel something is not right.
</details>

<details>
<summary><b>How can I interact with the agent? (Click to expand)</b></summary>

Currently, you can interact with Port AI agents through:
- The AI agent widget in the dashboards.
- Slack integration.
- API integration.

We're working on adding direct interaction through the Port UI in the future.
</details>

<details>
<summary><b>What can I ask the agent? (Click to expand)</b></summary>

Each agent has optional conversation starters to help you understand what it can help with. The questions you can ask depend on which agents were built in your organization.

For information on building agents with specific capabilities, see our [Build an AI agent](/ai-agents/build-an-ai-agent) guide.
</details>

<details>
<summary><b>What happens if there is no agent that can answer my question? (Click to expand)</b></summary>

If no agent in your organization has the knowledge or capabilities to answer your question, you'll receive a response mentioning that the agent can't assist you with your query.
</details>

<details>
<summary><b>The agent is getting it wrong and has incorrect answers (Click to expand)</b></summary>

AI agents can make mistakes. If you're receiving incorrect answers:

1. Analyze the tools and plan the agent used (visible in the invocation details).
2. Consider improving the agent's prompt to better guide its responses.
3. Try rephrasing your question or breaking it into smaller, more specific queries.
4. Reach out to our support for additional assistance if problems persist.

Remember that AI agents are constantly learning and improving, but they're not infallible.
</details>

<details>
<summary><b>My agent isn't responding in Slack (Click to expand)</b></summary>

Ensure that:
- The [Port Slack app](/ai-agents/slack-app) is properly installed in your workspace.
- The app has been invited to the channel where you're mentioning it.
- You're correctly mentioning the app (@Port).
- You've completed the authentication flow with the app.
- You haven't exceeded your daily usage limits.
</details>

<details>
<summary><b>How can I provide feedback on agent responses? (Click to expand)</b></summary>

The AI invocation entity contains the `feedback` property where you can mark is as `Negative` or `Positive`. We're working on adding a more convenient way to rate conversation from Slack and from the UI.
</details>

<details>
<summary><b>How is my data with AI agents handled? (Click to expand)</b></summary>

We store data from your interactions with AI agents for up to 30 days. We use this data to ensure agents function correctly and to identify and prevent problematic or inappropriate AI behavior. 
We limit this data storage strictly to these purposes. You can contact us to opt-out of this data storage.
</details> 