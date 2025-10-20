---
sidebar_position: 4
title: Context Engineering
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Context Engineering with Port AI

:::info Closed Beta
Port's AI offerings are currently in closed beta and will be gradually rolled out to users by the end of 2025.
:::

Context engineering is the practice of constructing an optimal information environment that provides the right amount of directions, tools, and knowledge for AI systems to successfully solve problems. Unlike prompt engineering, which focuses on crafting individual requests, context engineering ensures AI has access to relevant, structured data and capabilities needed for consistent, accurate results.

## What is Context Engineering?

Context engineering addresses a fundamental challenge: AI systems need curated, relevant context to perform effectively. If given too broad a range of information, AI experiences context distraction and task failure. If given insufficient context, it cannot understand how to complete tasks successfully.

Port AI solves this through a domain-integrated context approach, providing AI with structured access to your engineering ecosystem's knowledge graph while maintaining security boundaries.

## How Port AI Supports Context Engineering

Port AI implements context engineering through three core capabilities:

### 1. Effective Prompt Design

Port AI accepts custom prompts that you design to guide AI through your context systematically. Your job is to build effective prompts that leverage your organization's specific data and terminology.

**Guidelines for effective prompts:**
1. **Define Clear Goals**: Explicitly state what the AI should accomplish
2. **Provide Domain Context**: Include organization-specific terminology and processes  
3. **Set Response Style**: Define communication tone and level of detail

<Tabs groupId="prompt-examples" queryString>
<TabItem value="service-ownership" label="Service Ownership">

```markdown
Your goal is to help developers understand service ownership and responsibilities in our microservices architecture.

When answering questions about services:
- Always include the owning team and primary contacts
- Reference recent activity and deployment status
- Link to relevant documentation and runbooks
- Consider service dependencies and relationships

Use our organization's terminology:
- "Platform Team" owns infrastructure services
- "Product Teams" own feature services  
- "SRE Team" handles shared monitoring tools
```

</TabItem>
<TabItem value="incident-response" label="Incident Response">

```markdown
Your goal is to assist with incident management and system reliability.

When handling incident-related queries:
- Prioritize based on our severity levels (P0-P3)
- Include affected services and customer impact
- Reference our escalation procedures
- Suggest relevant runbooks and mitigation steps

Context about our environment:
- P0/P1 incidents require immediate escalation
- Customer-facing services take priority
- Include SLA impact in your responses
```

</TabItem>
<TabItem value="deployment-assistant" label="Deployment Assistant">

```markdown
Your goal is to help developers with deployment processes and environment management.

When assisting with deployments:
- Reference our staging → production pipeline
- Include prerequisite checks and approval gates
- Mention rollback procedures for each environment
- Consider feature flags and gradual rollouts

Our deployment standards:
- All production deployments require code review
- Database migrations need DBA approval
- Feature flags should be used for new functionality
```

</TabItem>
</Tabs>

### 2. Secure Engineering Data Access

Port AI provides structured access to your engineering ecosystem through [MCP (Model Context Protocol) tools](/ai-interfaces/port-mcp-server/overview-and-installation). This enables AI to explore and understand your engineering context while respecting security boundaries.

**Available Context Includes:**
- **Blueprints & Entities**: Complete software catalog with services, applications, and infrastructure
- **Relationships**: Dependencies, ownership, and architectural connections
- **Historical Data**: Deployment history, incident patterns, and change tracking
- **Task Context**: Current workloads, tickets, and priorities across systems
- **Organizational Standards**: Naming conventions, approval processes, and compliance requirements
- **Scorecards & Metrics**: Quality gates, SLA compliance, and performance indicators

**Flexible Data Model as Context:**
Port's flexible data model serves as engineering context for AI agents. Everything you've already built becomes available context:
- **Blueprint descriptions** explain what each entity type represents
- **Property configurations** provide meaning for each field, limits, and usage
- **Action configurations** include regex patterns, limits, and meaningful descriptions
- **Relationships** define how entities connect and depend on each other

To learn more about data controls and security, see [AI Security and Data Controls](/ai-interfaces/port-ai/security-and-data-controls).

:::tip MCP Server Benefits
Port's native MCP server integration means AI agents can intelligently navigate your entire engineering ecosystem without requiring custom training or data preparation.
:::

### 3. Safe Action Execution

Port AI enables controlled automation through configurable action permissions and autonomy levels.

**Action Control Options:**
- **Manual Approval**: AI creates draft actions that require human review before execution
- **Automatic Execution**: AI executes pre-approved actions within defined boundaries

AI agents can run actions in the same way developers can. They are restricted by the same mechanisms:
- User permissions and RBAC policies
- Action rules and validation requirements
- Approval workflows defined for each action
- Execution boundaries set in action configurations

## Context Engineering Examples

Here are real-world scenarios where Port AI's context engineering capabilities deliver value:

### Service Ownership Discovery
**Query**: "Who owns the checkout service?"

**Context Provided**:
- Software catalog with service definitions
- Team structures and membership
- Recent commit and deployment history
- Associated documentation and runbooks
- Current incident and ticket assignments

### Critical Incident Assessment  
**Query**: "What are our current critical incidents?"

**Context Provided**:
- Incident priority classifications
- Service dependency mapping
- Customer impact assessment
- Historical incident patterns
- On-call schedules and escalation paths

### Developer Task Prioritization
**Query**: "What should I work on today?"

**Context Provided**:
- Personal task assignments across systems
- Incident tickets requiring attention
- Code review requests and PR status
- Security issues approaching SLA deadlines
- Team priorities and strategic projects


:::info Integration with AI Features
Context engineering principles apply across all Port AI capabilities, from the [Port AI](/ai-interfaces/port-ai/overview) assistant interface to custom [AI Agents](/ai-interfaces/ai-agents/overview).
:::

<!-- TODO: Add specific examples of prompt templates -->
<!-- TODO: Include screenshots of context configuration in UI -->
<!-- TODO: Add troubleshooting section for common context issues -->
