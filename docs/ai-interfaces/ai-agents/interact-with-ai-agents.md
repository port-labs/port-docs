---
sidebar_position: 3
title: Interact with AI agents
---

# Interact with AI agents

import ClosedBetaFeatureNotice from '/docs/generalTemplates/_closed_beta_feature_notice.md'
import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

<ClosedBetaFeatureNotice id="ai-form" />

:::info Built on Port AI
AI Agents are specialized implementations built on top of [Port AI](/ai-interfaces/port-ai/overview), designed for machine-to-machine communication and autonomous operations within defined domains.
:::

## Getting started

Once you've built your AI agents, you can integrate them into your workflows and systems. AI agents are designed for machine-to-machine communication and can be triggered programmatically through Port's API or automatically through workflow automations.

## How AI Agents Work

AI Agents are domain-specific entities built on [Port AI](/ai-interfaces/port-ai/overview) with configured tools and prompts. For details on agent architecture and configuration, see [AI agents overview](/ai-interfaces/ai-agents/overview) and [Build an AI agent](/ai-interfaces/ai-agents/build-an-ai-agent).

## Interaction approaches

AI agents are designed for specific domains and use cases. When interacting with agents, you target the specific agent that has the expertise and tools needed for your task. This approach works best for structured scenarios like automation triggers and API integrations where you know which domain-specific capabilities you need.

## Interaction methods

<Tabs groupId="interaction-methods" queryString>
<TabItem value="api-integration" label="API integration">

AI agents can be integrated into your applications and workflows through Port's API. Agents use the same streaming API patterns as Port AI.

**Agent-specific endpoint:**
```bash
curl 'https://api.port.io/v1/agent/<AGENT_IDENTIFIER>/invoke?stream=true' \
  -H 'Authorization: Bearer <YOUR_API_TOKEN>' \
  -H 'Content-Type: application/json' \
  --data-raw '{"prompt":"Analyze the health of our production services"}'
```

For comprehensive details on API interaction, streaming responses, event types, quota management, and integration patterns, see [Port AI API Interaction](/ai-interfaces/port-ai/api-interaction).

</TabItem>
<TabItem value="actions-automations" label="Actions and automations">

You can trigger AI agents through Port's actions and automations, enabling integration of AI capabilities into your existing workflows. This is the primary method for creating autonomous, machine-to-machine AI systems.

### Automation Workflows

Automations allow you to automatically trigger AI agents based on events in your Port catalog. This enables reactive AI systems that respond to changes in your infrastructure or applications.

<details>
<summary><b>Example: Automatic Incident Response (Click to expand)</b></summary>

When a new incident is created, automatically trigger an agent that:
- Analyzes the incident context
- Gathers relevant information from related services
- Creates initial response documentation
- Notifies appropriate teams

```json showLineNumbers
{
  "identifier": "incident_response_automation",
  "title": "Automatic Incident Response",
  "trigger": {
    "type": "automation",
    "event": {
      "type": "ENTITY_CREATED",
      "blueprintIdentifier": "incident"
    }
  },
  "invocationMethod": {
    "type": "WEBHOOK",
    "url": "https://api.getport.io/v1/agent/incident_response_agent/invoke",
    "method": "POST",
    "headers": {
      "Content-Type": "application/json"
    },
    "body": {
      "prompt": "New incident created: {{ .entity.title }}. Severity: {{ .entity.properties.severity }}. Please analyze and provide initial response recommendations.",
      "labels": {
        "source": "automation",
        "incident_id": "{{ .entity.identifier }}",
        "trigger_type": "incident_created"
      }
    }
  }
}
```
</details>

<details>
<summary><b>Example: Infrastructure Healing (Click to expand)</b></summary>

Monitor infrastructure health and automatically trigger healing agents when issues are detected:

```json showLineNumbers
{
  "identifier": "k8s_healing_automation",
  "title": "Kubernetes Workload Healing",
  "trigger": {
    "type": "automation",
    "event": {
      "type": "ENTITY_UPDATED",
      "blueprintIdentifier": "k8s_workload"
    },
    "condition": {
      "type": "JQ",
      "expressions": [
        ".diff.before.properties.isHealthy == \"Healthy\"",
        ".diff.after.properties.isHealthy == \"Unhealthy\""
      ],
      "combinator": "and"
    }
  },
  "invocationMethod": {
    "type": "WEBHOOK",
    "url": "https://api.getport.io/v1/agent/k8s_healing_agent/invoke",
    "method": "POST",
    "headers": {
      "Content-Type": "application/json"
    },
    "body": {
      "prompt": "Workload {{ .event.diff.after.title }} is unhealthy. Current state: {{ .event.diff.after.properties.replicas }} replicas, {{ .event.diff.after.properties.readyReplicas }} ready. Please analyze and fix.",
      "labels": {
        "source": "automation",
        "workload_name": "{{ .event.diff.after.identifier }}",
        "namespace": "{{ .event.diff.after.properties.namespace }}"
      }
    }
  }
}
```
</details>

### Self-Service Actions

You can create self-service actions that invoke AI agents, allowing users to trigger intelligent workflows on-demand.

<details>
<summary><b>Example: Service Analysis Action (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "analyze_service_health",
  "title": "Analyze Service Health",
  "description": "Get AI-powered analysis of service health and recommendations",
  "trigger": {
    "type": "self-service",
    "operation": "DAY-2",
    "blueprintIdentifier": "service"
  },
  "invocationMethod": {
    "type": "WEBHOOK",
    "url": "https://api.getport.io/v1/agent/service_health_agent/invoke",
    "method": "POST",
    "headers": {
      "Content-Type": "application/json"
    },
    "body": {
      "prompt": "Analyze the health of service {{ .entity.title }}. Check metrics, recent deployments, and incidents.",
      "labels": {
        "source": "self_service",
        "service_name": "{{ .entity.identifier }}",
        "requested_by": "{{ .trigger.by.user.email }}"
      }
    }
  }
}
```
</details>

For comprehensive examples, see our [AI guides](/guides?tags=AI).

</TabItem>
</Tabs>

## Discovering Available Agents

You can discover available AI agents through the AI Agents catalog page or programmatically via the API using the `_ai_agent` blueprint.

<details>
<summary>cURL Example</summary>

```bash
curl -L 'https://api.port.io/v1/blueprints/_ai_agent/entities' \
    -H 'Accept: application/json' \
    -H 'Authorization: Bearer <YOUR_API_TOKEN>'
```

</details>

## AI interaction details

Every AI agent interaction creates an entity in Port, providing tracking and analysis capabilities. For comprehensive details on AI invocations, execution plans, and tools used, see [Port AI Overview](/ai-interfaces/port-ai/overview#ai-invocations).

### Data & security considerations

For information on data handling and security, see [AI Security and Data Controls](/ai-interfaces/port-ai/security-and-data-controls).

## Limits

AI agents use the same rate limits and quotas as Port AI. For detailed information on limits, monitoring, and quota management, see [Port AI API Interaction](/ai-interfaces/port-ai/api-interaction#rate-limits-and-quotas).

## Troubleshooting & FAQ

<details>
<summary><b>How can I integrate agents into my workflows? (Click to expand)</b></summary>

AI agents are designed for machine-to-machine communication and can be integrated through:
- **API integration**: Direct HTTP calls to agent endpoints
- **Workflow automations**: Automatic triggering based on Port catalog events
- **Self-service actions**: User-initiated agent workflows

For examples, see our [automation guides](/guides?tags=AI).
</details>

<details>
<summary><b>What happens if an agent can't answer my question? (Click to expand)</b></summary>

If the agent doesn't have the knowledge or capabilities to answer your question, you'll receive a response mentioning that it can't assist you with your specific query. Consider using a different agent that's specialized for your domain or task.
</details>

<details>
<summary><b>How do I improve agent performance? (Click to expand)</b></summary>

For comprehensive guidance on improving AI performance, debugging issues, and analyzing invocation details, see [Port AI Overview](/ai-interfaces/port-ai/overview). The troubleshooting approaches for Port AI apply to AI agents as well.

For agent-specific improvements, see [Build an AI agent](/ai-interfaces/ai-agents/build-an-ai-agent) for prompt engineering and tool configuration guidance.
</details>