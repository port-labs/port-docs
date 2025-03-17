---
sidebar_position: 3
title: Interact with the AI agent
---

# Interact with the AI agent

import ClosedBetaFeatureNotice from '../generalTemplates/_closed_beta_feature_notice.md'
import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

<ClosedBetaFeatureNotice 
  accessRequestMethod={
    <span>please reach out to us by filling <a href='https://forms.gle/BygmbCWcf1Vy4KPW9'>this form</a>.</span>
  } 
/>

## Getting started

Once you've built your AI agents, it's time to interact with them. Port provides several ways to communicate with your AI agents.

## Interaction options

You have two main approaches when interacting with AI agents in Port:

<Tabs groupId="interaction-approach" queryString>
<TabItem value="specific-agent" label="Specific agent">

Choose a specific agent when you have a structured scenario, such as triggering an agent from an automation. This approach works best when you know exactly which agent has the expertise needed for your task.

</TabItem>
<TabItem value="agent-router" label="Agent router">

Use the agent router when having a more natural conversation, such as through Slack. The router intelligently determines which agent is best suited to handle your request based on its content and context.

</TabItem>
</Tabs>

## Interaction methods

<Tabs groupId="interaction-methods" queryString>
<TabItem value="api-integration" label="API integration">

Port is an API-first platform, allowing you to integrate AI agents into your custom workflows.  
The interaction process follows these steps:

1. Invoke the agent with your request.
2. Receive an invocation ID.
3. Poll the entity until the generation is completed.

<img src='/img/ai-agents/AIAgentTriggerFlowDiagram.png' width='70%' />

<details>
<summary><b>API example (Click to expand)</b></summary>

```python showLineNumbers
# Example API call to invoke an agent
import requests
import time

# Invoke the agent
response = requests.post(
    'https://api.getport.io/v1/agent/{agentIdentifier}/invoke',
    headers={
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_API_TOKEN'
    },
    json={
        'message': 'What services are currently experiencing incidents?'
    }
)

invocation_id = response.json()['invocationId']

# Function to check status
def check_status():
    status_response = requests.get(
        f'https://api.getport.io/v1/agent/invoke/{invocation_id}',
        headers={
            'Authorization': 'Bearer YOUR_API_TOKEN'
        }
    )
    return status_response.json()

# Poll until complete
result = None
while True:
    time.sleep(5)
    result = check_status()
    if result['status'] == 'Completed':
        break

print(result['response'])
```

</details>

</TabItem>
<TabItem value="actions-automations" label="Actions and automations">

You can trigger AI agents through Port's actions and automations, allowing you to integrate AI capabilities into your existing workflows.

For example, when a new incident is created in Port, you can trigger an agent that:
- Triages the incident.
- Summarizes relevant information.
- Sends a notification to Slack.

<img src='/img/ai-agents/AIAgentsAutomationExample.png' width='80%'/>

</TabItem>
<TabItem value="slack-integration" label="Slack Integration">

The Slack integration provides the most natural way to interact with Port's AI agents. This method abstracts all technical details, allowing for free-flowing conversations.

You can interact with agents in two ways:

1. **Direct messaging** the Port Slack app.
2. **Mentioning** the app in any channel it's invited to.

When you send a message, the app will:
1. Open a thread.
2. Respond with the agent's answer.

<img src='/img/ai-agents/AIAgentsSlackExample.png' width='80%'/>

#### Tips for effective Slack interactions

- To target a specific agent, include the agent's nickname at the beginning of your message (e.g., "@Port DevAgent what are our production services?").
- Send follow-up messages in the same thread and mention the app again to continue the conversation.
- Keep conversations focused on the same topic for best results.
- Limit threads to five consecutive messages for optimal performance.
- For best results, start new threads for new topics or questions.

</TabItem>
</Tabs>

## AI interaction details

Every AI agent interaction creates an entity in Port, allowing you to track and analyze the interaction. This information helps you understand how the agent processed your request and identify opportunities for improvement.

### Plan

The plan shows how the agent decided to tackle your request and the steps it intended to take. This provides insight into the agent's reasoning process.

<img src='/img/ai-agents/AIAgentsPlan.png' width='80%'/>


### Tools used

This section displays the actual steps the agent took and the APIs it used to complete your request. It can be particularly helpful for debugging when answers don't meet expectations, such as when an agent:

- Used an incorrect field name.
- Chose an inappropriate property.
- Made other logical errors.

<img src='/img/ai-agents/AIAgentsTools.png' width='80%'/>


### Tokens

Each interaction records both input and output tokens, helping you understand your LLM usage. This information can be valuable for:

- Identifying which agents consume more of your token allocation.
- Optimizing prompts for efficiency.
- Managing costs effectively.

## Limits

Port applies limits to AI agent interactions to ensure fair usage across all customers:

- **Daily query limit**: 100 queries per day.
- **Token usage limit**: 100,000 tokens per day.

:::caution Usage limits
Usage limits may change without prior notice. Once a limit is reached, you will need to wait until it resets.  
If you attempt to interact with an agent after reaching a limit, you will receive an error message indicating that the limit has been exceeded.
:::



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
- The Port Slack app is properly installed in your workspace.
- The app has been invited to the channel where you're mentioning it.
- You're correctly mentioning the app (@Port).
- You've completed the authentication flow with the app.
- You haven't exceeded your daily usage limits.
</details>

<details>
<summary><b>How can I provide feedback on agent responses? (Click to expand)</b></summary>

The AI invocation entity contains the `feedback` property where you can mark is as `Negative` or `Positive`. We're working on adding a more convenient way to rate conversation from Slack and from the UI.
</details>

## Security considerations

AI agent interactions in Port are designed with security and privacy as a priority.

For more information on security and data handling, see our [AI agents overview](/ai-agents/overview#security-and-data-handling). 