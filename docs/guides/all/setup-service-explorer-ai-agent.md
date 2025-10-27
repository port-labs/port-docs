---
displayed_sidebar: null
description: Set up a Service Explorer AI agent with MCP to help developers discover services, understand ownership, and access documentation for quick onboarding
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Set up the Service Explorer AI agent


This guide demonstrates how to set up a "Service Explorer" AI agent in Port with enhanced capabilities powered by MCP. This agent helps developers discover services, understand ownership, and access documentation for quick onboarding.

With the **MCP backend server**, the Service Explorer becomes even more powerful:  
- It can **auto-discover all blueprints, entities, and actions** in your service catalog.  
- It provides **transparency and visibility** into what the AI agent is doing behind the scenes.  
- It reduces manual configuration, since blueprint access is automatically managed.  

By the end of this guide, your developers will be able to get information about your services via Port's AI chat.

<img src="/img/guides/service-explorer-agent-demo-1.png" width="100%" border="1px" />
<img src="/img/guides/service-explorer-agent-demo-2.png" width="100%" border="1px" />


## Common use cases

- Quick service discovery for new developers.
- Understanding service ownership and team responsibilities.
- Accessing service documentation and READMEs.
- Checking service compliance and production readiness.
- Finding the right team to contact about a service.

## Prerequisites

This guide assumes you have:
- A Port account with the [AI agents feature enabled](/ai-interfaces/ai-agents/overview#access-to-the-feature).
- Appropriate permissions to create and configure AI agents.
- [GitHub integration](/build-your-software-catalog/sync-data-to-catalog/git/github/) installed.
- **Optional but recommended integrations for richer context**:
    - [PagerDuty](/build-your-software-catalog/sync-data-to-catalog/incident-management/pagerduty/) for incident management.
    - [Kubernetes](/build-your-software-catalog/sync-data-to-catalog/kubernetes-stack/kubernetes/) tools for deployment information.
    - Monitoring tools (e.g., [New Relic](/build-your-software-catalog/sync-data-to-catalog/apm-alerting/newrelic/)) for service health.

## Set up

To create a Service Explorer AI agent in Port, we'll need to configure two main components as described in our [Build an AI agent](/ai-interfaces/ai-agents/build-an-ai-agent) guide:
- The data sources it will use to answer questions.
- The agent configuration that defines its capabilities and conversation starters.

### Create the agent configuration

1. Go to the [AI Agents](https://app.getport.io/_ai_agents) page of your portal.
2. Click on `+ AI Agent`.
3. Toggle `Json mode` on.
4. Copy and paste the following JSON schema:

   <details>
   <summary><b>Service Explorer agent configuration (Click to expand)</b></summary>

   ```json
   {
     "identifier": "service_ownership_onboarding",
     "title": "Service Explorer",
     "icon": "Service",
     "properties": {
       "description": "Helps developers discover services, understand ownership, and access documentation for quick onboarding",
       "status": "active",
       "allowed_blueprints": [
         "service",
         "githubRepository",
         "_team",
         "_user",
         "githubTeam",
         "githubUser"
       ],
       "prompt": "You are an agent responsible for helping developers understand the service landscape, ownership, and onboarding information.\n\n### Guidelines\n- Provide clear information about service ownership (teams and individuals)\n- Explain what services do based on their README and description\n- Identify service dependencies and relationships\n- Share service quality metrics and scorecard compliance\n- Help new developers understand which team owns which services\n- When asked about a service, always include: owner, team, description, and key technical details\n- If a service has a README, prioritize information from there\n- Mention service tier/criticality when relevant",
       "execution_mode": "Approval Required",
       "conversation_starters": [
         "Who owns the oauth service?",
         "What is the payments service about?",
         "Which services does the platform team own?",
         "Show me all services that don't have a README",
         "Which services are failing their production readiness scorecard?"
       ]
     }
   }
   ```
   </details>

5. Click on `Create` to save the agent.

## Blueprint configuration

### Minimum configuration

The Service Explorer agent requires access to the `service` and `githubRepository` blueprints.  
This gives the agent basic visibility into your services and their corresponding code repositories.  

From here, you can expand the agent’s capabilities in one of two ways:  
- **Classic mode**: Manually add more blueprints to provide richer service context (e.g., incidents, deployments, monitoring).  
- **MCP mode**: Enable automatic discovery and management of blueprints, entities, and actions, with built-in transparency.  


### Classic mode
To make the Service Explorer more powerful, you can add more blueprints to the `allowed_blueprints` array in the agent's configuration. The more context you provide, the more detailed and accurate the agent's responses will be.

Here are some examples of how you can enhance the agent by adding more blueprints:

- **PagerDuty** (`pagerdutyService`, `pagerdutyIncident`): Adds incident history, on-call information, and service health.
- **Kubernetes** (`workload`, `argocdApplication`): Shows deployment status, pod health, and runtime information.
- **Monitoring** (`newRelicService`, `newRelicAlert`): Provides performance metrics and alert status.
- **Feature Flags** (`launchDarklyFeatureFlag`): Shows which features are enabled for each service.
- **Documentation** (`jiraProject`, `jiraIssue`): Links to project documentation and known issues.

<h4> Customizing Blueprint Access </h4>
You can modify the `allowed_blueprints` array at any time to add or remove blueprints.

For example, if you want to give the agent access to Kubernetes information, you would add `"workload"` and `"argocdApplication"` to the array:
```json
"allowed_blueprints": [
  "service",
  "githubRepository",
  // ... other blueprints
  "workload",
  "argocdApplication"
]
```

### MCP mode
When using [MCP server backend mode](/ai-interfaces/ai-agents/interact-with-ai-agents), no manual additional blueprint configuration is required. MCP auto-discovers and manages access to blueprints, entities, and actions. This simplifies setup and ensures the agent always has the latest catalog context.


## Interact with the Service Explorer

You can interact with the Service Explorer AI agent in [several ways](/ai-interfaces/ai-agents/interact-with-ai-agents). This guide will demonstrate the two main ways.

<Tabs groupId="interaction-methods" queryString>
<TabItem value="ui" label="Port UI">

The Service Explorer AI agent can be accessed through an **AI Agent widget** in your Port dashboard. Follow the steps below to set it up:

1. Go to the [homepage](https://app.getport.io/organization/home) of your portal.
2. Click on `+ Widget`.
3. Choose `AI agent`.
4. Type **Service Explorer** for `Title`.
5. Select **Service Explorer** from the `Agent` dropdown.
6. **Enable MCP backend mode** (optional): Toggle the "Use MCP" option to enable enhanced capabilities with intelligent catalog access and Claude models.
7. Click on `Save`.

Once the widget is set up, you can ask questions directly in the chat field.

<img src="/img/ai-agents/AIAgentsServiceExplorerWidget.png" width="100%" border="1px" />

</TabItem>
<TabItem value="slack" label="Slack Integration">

The Slack integration provides a natural way to interact with the Service Explorer agent. Before using this method, ensure you have installed and configured the **[Port AI Assistant Slack App](/ai-interfaces/slack-app)**.

You can interact with the Service Explorer agent in two ways:
1. **Direct message** the Port AI Assistant.
2. **Mention** the app in any channel it's invited to.

When you send a message, the app will open a thread and respond with the agent's answer.

Example queries:
```markdown
@Port Who owns the oauth service?
@Port What is the payments service about?
@Port Which services does the platform team own?
```

<img src="/img/ai-agents/AIAgentsServiceExplorerSlack.png" width="100%" border="1px" />

</TabItem>
</Tabs>

## Example questions

Here are some questions you can ask the Service Explorer agent:

- "Who owns the oauth service?"
- "What is the payments service about?"
- "Which services does the platform team own?"
- "Show me all tier 1 services"
- "Which services don't have a README?"
- "What services is John Smith responsible for?"
- "Show me all services with active incidents"
- "Which services are failing their production readiness scorecard?"

## Possible enhancements

You can further enhance the Service Explorer setup by:

- **Classic mode:**: Include additional blueprints like `workload`, `newRelicService`, or `argocdApplication`.
- **MCP mode**: Relying on MCP’s discovery to automatically include new entities and actions.
- **Transparency logs**: Using MCP’s visibility features to monitor how the agent answers questions.
- **Custom metadata**: Add organization-specific properties to the service blueprint for richer answers.