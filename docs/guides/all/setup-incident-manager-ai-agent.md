---
displayed_sidebar: null
description: Set up an Incident Manager AI agent to help developers track and manage incidents efficiently
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Set up the Incident Manager AI agent

## Overview

This guide will walk you through setting up an "Incident Manager" AI agent in Port.  
By the end of this guide, your developers will be able to get information about incidents and on-call status via Port's AI chat.

<img src="/img/ai-agents/AIAgentIncidentManagerAgentPage.png" width="100%" border="1px" />

## Common use cases

- Get a quick overview of active incidents and their priorities.
- Check who is currently on-call for specific services.
- Monitor incident resolution times and trends.
- Acknowledge or trigger incidents directly from Port.

## Prerequisites

This guide assumes you have:
- A Port account with the [AI agents feature enabled](/ai-agents/overview#access-to-the-feature).
- Appropriate permissions to create and configure AI agents.

## Set up data model

To create an Incident Manager AI agent in Port, we'll need to configure two main components as described in our [Build an AI agent](/ai-agents/build-an-ai-agent) guide:
-  The data sources it will use to answer questions about incidents and on-call rotations.
-  The agent configuration that defines its capabilities and conversation starters.

### Configure data source access

For this guide, we will be using **PagerDuty** as our primary data source to provide comprehensive incident management capabilities. 
This integration will automatically create and configure all the necessary resources needed by the Incident Manager AI agent.

Install the following integration to have access to these data sources:
- [Port's PagerDuty integration](/build-your-software-catalog/sync-data-to-catalog/incident-management/pagerduty/) for incidents, on-call schedules, and escalation policies.

:::info Optional tools
While this guide uses PagerDuty, you can choose tools that best fit your organization's needs. 
For example, Opsgenie or Firehydrant.
:::

### Create the agent configuration

1. Go to the [AI Agents](https://app.getport.io/_ai_agents) page of your portal.
2. Click on `+ AI Agent`.
3. Toggle `Json mode` on.
4. Copy and paste the following JSON schema:

   <details>
   <summary><b>Incident Manager agent configuration (Click to expand)</b></summary>

   ```json
   {
     "identifier": "incident_manager",
     "title": "Incident Manager",
     "icon": "Details",
     "properties": {
       "description": "Incident Manager responsible for answering questions about PagerDuty incidents, services, MTTR, escalation policies, schedules, and on-call rotations.",
       "status": "active",
       "allowed_blueprints": [
         "pagerdutyService",
         "pagerdutyIncident",
         "pagerdutyEscalationPolicy",
         "pagerdutySchedule",
         "pagerdutyOncall",
         "pagerdutyUser",
         "_user",
         "_team",
         "service"
       ],
       "prompt":"You are an agent responsible for answering questions about PagerDuty incidents, services, escalation policies, schedules, and on-call rotations. ### Guidelines \n - Provide clear information about incidents \n - Identify who is on-call for services (both primary and secondary on-call) \n - Report on incident statistics and resolution times",
       "execution_mode": "Approval Required",
       "allowed_actions": [ "_triggerPagerdutyIncident", "_acknowledgePagerdutyIncident" ],
       "conversation_starters": [
         "Who is on call for the payment service?",
         "What are the active incidents right now?",
         "What is our average incident resolution time?"
       ]
     }
   }
   ```
   </details>

5. Click on `Create` to save the agent.

## Interact with the Incident Manager

You can interact with the Incident Manager AI agent in [several ways](/ai-agents/interact-with-ai-agents).  
This guide will demonstrate the two main ways.

<Tabs groupId="interaction-methods" queryString>
<TabItem value="ui" label="Port UI">

The Incident Manager AI agent can be accessed through an **AI Agent widget** in your Port dashboard.   
Follow the step below to set it up:

1. Go to the [homepage](https://app.getport.io/organization/home) of your portal

2. Click on `+ Widget`.

3. Choose `AI agent`.

4. Type **Incident Manager** for `Title`.

5. Select **Incident Manager** from the `Agent` dropdown.
   
   <img src="/img/ai-agents/AIAgentsIncidentManagerWidget.png" width="60%" border="1px" />

6. Click on `Save`.

Once the widget is set up, you can:

- Use the conversation starter buttons to quickly check:
  - Who is on-call for specific services.
  - Active incidents.
  - Average incident resolution times.

- Type custom questions in the chat field about:
  - Incident status and severity.
  - On-call rotations.
  - Historical incident data.

- Engage in natural follow-up conversations to explore specific topics.

<img src="/img/ai-agents/AIAgentIncidentManagerDashboard.png" width="100%" border="1px" />

</TabItem>
<TabItem value="slack" label="Slack Integration">

The Slack integration provides a natural way to interact with the Incident Manager agent. Before using this method, ensure you have installed and configured the **[Port AI Assistant Slack App](/ai-agents/slack-app)**.

You can interact with the Incident Manager agent in two ways:
1. **Direct message** the Port AI Assistant.
2. **Mention** the app in any channel it's invited to.

When you send a message, the app will:
1. Open a thread.
2. Respond with the agent's answer.

Example queries:
```markdown
@Port incident-manager Who is on-call for the payment service?
@Port Show me all active P1 incidents
@Port What was our MTTR for March 2024?
```

:::tip Including the agent name
While including "incident-manager" in your message can help when you have multiple agents, it's not mandatory.   
The Slack app is smart enough to route your request to the appropriate agent based on the context.
:::

<img src="/img/ai-agents/AIAgentIncidentManagerSlack.png" width="100%" border="1px" />


</TabItem>
</Tabs>

## Example questions

Here are some questions you can ask the Incident Manager agent:

- "Which team has the highest number of open incidents?".
- "How many open incidents are there currently?".
- "Who is currently on-call for the payment gateway service?".
- "What is our mean time to resolution?".
- "What services were impacted by the outage on Jan 16th 2024?".
- "Trigger an incident for the Checkout service regarding increase in response time".

## Best practices

To get the most out of your Incident Manager agent:

1. **Try it out**: Start with simple queries and see how the agent responds.
2. **Add context**: If the response isn't what you expected, try asking again with more details.
3. **Troubleshoot**: If you're still not getting the right answers, check our [troubleshooting guide](/ai-agents/interact-with-ai-agents#troubleshooting--faq) for common issues and solutions.

## Possible enhancements

You can further enhance the Incident Manager setup by:
- **Integration expansion**: [Add more data sources](/ai-agents/build-an-ai-agent#step-2-configure-data-access) like Opsgenie or ServiceNow.
- **Automated notifications**: [Configure the agent](/ai-agents/interact-with-ai-agents#actions-and-automations) to proactively notify about incident updates or escalations.
- **Custom conversation starters**: Add organization-specific queries to the [conversation starters](/ai-agents/build-an-ai-agent#step-5-add-conversation-starters).
- **Monitor and improve**: [Check how your developers are interacting](/ai-agents/interact-with-ai-agents#ai-interaction-details) with the agent and improve it according to feedback.
