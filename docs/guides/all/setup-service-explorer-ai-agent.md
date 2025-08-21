---
displayed_sidebar: null
description: Set up a Service Explorer AI agent to help developers discover services, understand ownership, and access documentation for quick onboarding
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Set up the Service Explorer AI agent

## Overview

This guide will walk you through setting up a "Service Explorer" AI agent in Port. This agent helps developers discover services, understand ownership, and access documentation for quick onboarding. By the end of this guide, your developers will be able to get information about your services via Port's AI chat.

<img src="/img/ai-agents/AIAgentsServiceExplorerWidgetExample.png" width="100%" border="1px" />

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

## Blueprint Configuration

### Minimum Configuration
The guide's configuration provides a good starting point. The minimum configuration for the Service Explorer agent requires the `service` and `githubRepository` blueprints. This provides the agent with basic information about your services and their corresponding code repositories.

### Enhancing the Agent with More Blueprints
To make the Service Explorer more powerful, you can add more blueprints to the `allowed_blueprints` array in the agent's configuration. The more context you provide, the more detailed and accurate the agent's responses will be.

Here are some examples of how you can enhance the agent by adding more blueprints:

- **PagerDuty** (`pagerdutyService`, `pagerdutyIncident`): Adds incident history, on-call information, and service health.
- **Kubernetes** (`workload`, `argocdApplication`): Shows deployment status, pod health, and runtime information.
- **Monitoring** (`newRelicService`, `newRelicAlert`): Provides performance metrics and alert status.
- **Feature Flags** (`launchDarklyFeatureFlag`): Shows which features are enabled for each service.
- **Documentation** (`jiraProject`, `jiraIssue`): Links to project documentation and known issues.

### Customizing Blueprint Access
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

Keep in mind that there is a trade-off between context richness and response time. The more blueprints the agent has access to, the longer it may take to generate a response. It's best to start with a minimal set of blueprints and add more as needed.

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
6. Click on `Save`.

Once the widget is set up, you can ask questions directly in the chat field.

<img src="/img/ai-agents/AIAgentsServiceExplorerWidget.png" width="100%" border="1px" />

</TabItem>
<TabItem value="slack" label="Slack Integration">

The Slack integration provides a natural way to interact with the Service Explorer agent. Before using this method, ensure you have installed and configured the **[Port AI Assistant Slack App](/ai-interfaces/ai-agents/slack-app)**.

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

- **Adding more service context**: Include additional blueprints like `workload`, `newRelicService`, or `argocdApplication`.
- **Enriching with incidents**: Add the `pagerdutyIncident` blueprint to see the incident history for each service.
- **Including deployments**: Add deployment-related blueprints for release information.
- **Adding custom metadata**: Add organization-specific properties to the service blueprint to provide more context.