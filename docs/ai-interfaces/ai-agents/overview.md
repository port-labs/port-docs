---
sidebar_position: 1
title: Overview
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortTooltip from "/src/components/tooltip/tooltip.jsx"
import ClosedBetaFeatureNotice from '/docs/generalTemplates/_closed_beta_feature_notice.md'

# AI agents overview

:::info Closed Beta
Port's AI offerings are currently in closed beta and will be gradually rolled out to users by the end of 2025.
:::

:::info Built on Port AI
AI Agents are specialized implementations built on top of [Port AI](/ai-interfaces/port-ai/overview), designed for specific domains and machine-to-machine communication. For general AI capabilities and human interaction, see [Port AI](/ai-interfaces/port-ai/overview).
:::

## What are Port AI Agents?

Port AI Agents are pre-configured, domain-specific entities built on [Port AI](/ai-interfaces/port-ai/overview) that enable intelligent machine-to-machine communication. Unlike general AI assistants designed for human interaction, AI Agents are purpose-built for specific domains (like incident management, deployment orchestration, or security monitoring) and excel at autonomous operations within defined boundaries.

<img src="/img/ai-agents/AIAgentsList.png" width="80%" border="1px" />


## Agent Characteristics

AI Agents are distinguished by three key characteristics that make them ideal for machine-to-machine workflows:

1. **Domain Ownership** - Each agent is specifically designed for a particular domain or function 
(incident management, security monitoring, deployment orchestration).
2. **Autonomous Operation** - Agents operate independently within defined boundaries  , making them perfect for automated workflows, background monitoring and alerting, and system-to-system communication where human intervention isn't required.
3. **Reusability Across Systems** - Agents can be integrated into multiple systems and workflows, like API-driven integration, third-party system integrations, etc.

## When to Use AI Agents vs Port AI

Choose **AI Agents** when you need:
- **Machine-to-machine communication** for automated workflows.
- **Domain-specific expertise** (e.g., incident response, security analysis).
- **Autonomous operations** that run without human intervention.
- **Reusable logic** that can be embedded in multiple systems.

Choose **[Port AI](/ai-interfaces/port-ai/overview)** when you need:
- **Human interaction** and conversational interfaces.
- **General-purpose queries** across your entire catalog.
- **Ad-hoc exploration** and discovery.

## Agent-Specific Use Cases

AI Agents excel at machine-to-machine scenarios that require domain expertise and autonomous operation:

<Tabs groupId="agent-examples" queryString>
<TabItem value="kubernetes-healing" label="Kubernetes Healing Agent">

This agent automatically monitors and heals Kubernetes infrastructure by detecting failures, analyzing resource constraints, and triggering remediation workflows through monitoring system integrations.

**Tools this agent would have:**
- Kubernetes cluster monitoring and diagnostics.
- Resource utilization analysis tools.
- Pod restart and scaling automation.
- Alert correlation and notification systems.

**Example scenarios:**
- Automatically detects pod failures and restart issues.
- Analyzes resource constraints and suggests scaling actions.
- Integrates with monitoring systems to trigger remediation workflows.

</TabItem>
<TabItem value="incident-response" label="Incident Response Agent">

This agent streamlines incident management by monitoring service health, creating automated incident reports, and reducing alert noise through intelligent correlation while keeping stakeholders informed throughout outages.

**Tools this agent would have:**
- Service health monitoring and alerting.
- Incident creation and management tools.
- Multi-system alert correlation engines.
- Stakeholder notification and communication systems.

**Example scenarios:**
- Monitors service health and automatically creates incident reports.
- Correlates alerts across multiple systems to reduce noise.
- Provides automated status updates to stakeholders during outages.

</TabItem>
<TabItem value="security-compliance" label="Security Compliance Agent">

This agent continuously maintains security posture by scanning for vulnerabilities and misconfigurations, creating prioritized remediation tickets, and preventing vulnerable code from reaching production through CI/CD integration.

**Tools this agent would have:**
- Vulnerability scanning and assessment tools.
- Security misconfiguration detection systems.
- Automated ticket creation and prioritization.
- CI/CD pipeline integration and gates.

**Example scenarios:**
- Continuously scans for security vulnerabilities and misconfigurations.
- Automatically creates remediation tickets with context and priority.
- Integrates with CI/CD pipelines to prevent deployment of vulnerable code.

</TabItem>
</Tabs>

## Getting Started with AI Agents

AI Agents are designed for organizations that need autonomous, domain-specific AI capabilities. Before applying, ensure you have:
- Experience with [Port AI](/ai-interfaces/port-ai/overview) and its capabilities.
- Understanding of your specific automation and machine-to-machine communication needs.
- Familiarity with [AI Security and Data Controls](/ai-interfaces/port-ai/security-and-data-controls).

Start by [creating custom agents](/ai-interfaces/ai-agents/build-an-ai-agent) for your specific domains, and Connect your agents to external systems and workflows.

## Agent Configuration

[Build and customize](/ai-interfaces/ai-agents/build-an-ai-agent) your AI agents for specific domains:
- Define agent instructions, goals, and expertise areas.
- Set allowed tools and configure autonomy levels for actions.
- Test agent behavior and validate responses.
- Integrate agents into workflow automations and external systems.

## Security and Governance

AI Agents inherit all security and governance controls from [Port AI](/ai-interfaces/port-ai/overview). They operate within the same secure framework with additional controls for autonomous operation:

- **RBAC compliance**: Agents respect all data access permissions and policies.
- **Audit trail**: All agent interactions are logged as AI invocations for monitoring.
- **Data governance**: Same data handling policies as [Port AI Security and Data Controls](/ai-interfaces/port-ai/security-and-data-controls).

For comprehensive security information, see [AI Security and Data Controls](/ai-interfaces/port-ai/security-and-data-controls).

## Implementation Strategy

Start with focused, high-value use cases that demonstrate clear ROI:

1. **Begin with monitoring and alerting** - Implement agents that enhance existing observability.
2. **Add workflow automation** - Build agents that streamline repetitive processes.
3. **Expand to complex orchestration** - Develop agents that manage multi-system workflows.
4. **Scale across domains** - Deploy specialized agents for different organizational areas.

## Data Model

AI Agents use the same data model as [Port AI](/ai-interfaces/port-ai/overview) with additional agent-specific blueprints:

1. **AI agents** - The agent configurations and domain specifications that define each agent's capabilities and boundaries. Learn more in our [Build an AI agent](/ai-interfaces/ai-agents/build-an-ai-agent) guide.

2. **[AI invocations](/ai-interfaces/port-ai/overview#ai-invocations)** - Each agent interaction is recorded as an invocation, providing comprehensive audit trails for autonomous operations. These records include execution context, decisions made, and outcomes for monitoring and debugging agent behavior.

## Relevant guides

Explore these guides to see AI agents in action and learn how to implement them in your organization:

- [Generate incident updates with AI](/guides/all/generate-incident-updates-with-ai)
- [Enrich tasks with AI-powered context](/guides/all/enrich-tasks-with-ai)
- [Setup PR enricher AI agent](/guides/all/setup-pr-enricher-ai-agent)
- [Setup service explorer AI agent](/guides/all/setup-service-explorer-ai-agent)
- [Setup platform request triage AI agent](/guides/all/setup-platform-request-triage-ai-agent)
- [Setup task manager AI agent](/guides/all/setup-task-manager-ai-agent)
- [Setup incident manager AI agent](/guides/all/setup-incident-manager-ai-agent)
- [Add RCA context to AI agents](/guides/all/add-rca-context-to-ai-agents)
- [Enrich security vulnerability using AI](/guides/all/enrich-security-vulnerability-using-ai)

## Frequently Asked Questions

<details>
<summary><b>What's the difference between AI Agents and Port AI Assistant? (Click to expand)</b></summary>

**AI Agents** are designed for:
- Machine-to-machine communication and agentic workflows
- Domain-specific expertise (incident management, security, deployment)
- Integration with external systems via API
- Autonomous operations that run without human intervention

**[Port AI](/ai-interfaces/port-ai/overview)** is designed for:
- Human interaction and conversational interfaces
- General-purpose queries across your entire catalog
- Ad-hoc exploration and interactive troubleshooting
- Direct user engagement through chat interfaces

Both are built on the same [Port AI](/ai-interfaces/port-ai/overview) foundation.
</details>

<details>
<summary><b>How do AI Agents integrate with external systems? (Click to expand)</b></summary>

AI Agents are designed for machine-to-machine communication and can be integrated through:
- **API**: Direct integration with your existing tools and workflows
- **Workflow orchestration**: Embedding agents into Port workflow automations

All integrations maintain the same security and governance controls as [Port AI](/ai-interfaces/port-ai/overview).
</details>

<details>
<summary><b>Can AI Agents operate autonomously without human approval? (Click to expand)</b></summary>

Yes, AI Agents can be configured for autonomous operation within defined boundaries. However, you have full control over:
- Which actions agents can execute automatically
- Which actions require human approval
- Data access permissions and scope
- Integration points and external system access

Autonomous operation is designed for well-defined, low-risk scenarios like monitoring, alerting, and status updates.
</details>

<details>
<summary><b>How are AI Agents different from general automation tools? (Click to expand)</b></summary>

AI Agents provide intelligent, context-aware automation rather than simple rule-based triggers:
- **Intelligent decision-making**: Agents analyze context and make informed decisions
- **Natural language understanding**: Process unstructured data and complex scenarios
- **Adaptive responses**: Learn from your Port catalog data to provide relevant actions
- **Domain expertise**: Pre-configured with knowledge specific to their area of focus

Traditional automation requires predefined rules, while AI Agents can adapt to new situations within their domain.
</details>

<details>
<summary><b>What security controls apply to autonomous AI Agents? (Click to expand)</b></summary>

AI Agents inherit all [Port AI security controls](/ai-interfaces/port-ai/security-and-data-controls) with additional safeguards for autonomous operation:
- **Bounded autonomy**: Agents operate only within explicitly defined parameters
- **Action approval workflows**: Critical actions can require human approval
- **Comprehensive audit trails**: All autonomous operations are logged and trackable
- **Permission inheritance**: Agents respect all RBAC and data access policies

All autonomous operations maintain the same security standards as human-initiated actions.

**Detailed Information:**
- [Human Oversight & Autonomy](/ai-interfaces/port-ai/security-and-data-controls#human-oversight--autonomy) - How AI features operate with human oversight.
- [Admin Controls](/ai-interfaces/port-ai/security-and-data-controls#what-controls-do-administrators-have-over-ai-usage) - Administrative controls over AI usage.
- [Data Access & Permissions](/ai-interfaces/port-ai/security-and-data-controls#data-access--permissions) - How AI respects your access controls.
</details> 