---
displayed_sidebar: null
description: Learn how to enhance AI agents with custom context like Root Cause Analysis documents using entities
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Add custom context to AI agents using entities

## Overview

This guide demonstrates how to provide additional context to your AI agents beyond what's available through integrations. We'll show how to add Root Cause Analysis (RCA) documents to an Incident Manager AI agent, enabling it to reference past incidents and their resolutions when answering questions.

With your AI agents enhanced with custom context, you will be able to:
- Reference past incident resolutions when similar issues occur
- Provide insights based on historical root cause analyses  
- Suggest solutions that worked for previous incidents
- Help identify patterns across incidents

In this step-by-step guide, we will create a custom blueprint to store RCA documents, populate it with sample data, and configure an existing AI agent to access this context. You will also learn how to expand this approach to other types of documentation.

## Common use cases

- Provide historical context when responding to new incidents that are similar to past ones
- Reference documented solutions and preventive measures from previous incidents
- Help identify patterns across multiple incidents and suggest proactive measures
- Store and access organizational knowledge in runbooks, architecture documents, and best practices

## Prerequisites

This guide assumes you have:
- A Port account with the [AI agents feature enabled](/ai-agents/overview#access-to-the-feature)
- An existing [Incident Manager AI agent](/guides/all/setup-incident-manager-ai-agent) (or similar)
- Basic familiarity with [creating blueprints](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/)

## Data model

For this guide, we will be creating a <PortTooltip id="blueprint">blueprint</PortTooltip> responsible for storing Root Cause Analysis documents that our AI agent can reference.

Let's create the following blueprint in your Port organization:

<details>
<summary>`Root Cause Analysis` blueprint</summary>

The entities of this blueprint will represent different RCA documents from past incidents.

```json showLineNumbers
{
  "identifier": "rootCauseAnalysis",
  "title": "Root Cause Analysis",
  "icon": "Bug",
  "schema": {
    "properties": {
      "summary": {
        "type": "string",
        "title": "Summary",
        "description": "Brief summary of the incident"
      },
      "incidentDate": {
        "type": "string",
        "format": "date-time",
        "title": "Incident Date",
        "description": "When the incident occurred"
      },
      "severity": {
        "type": "string",
        "title": "Severity",
        "enum": ["Critical", "High", "Medium", "Low"],
        "enumColors": {
          "Critical": "red",
          "High": "orange", 
          "Medium": "yellow",
          "Low": "green"
        }
      },
      "affectedServices": {
        "type": "array",
        "title": "Affected Services",
        "description": "Services impacted by this incident"
      },
      "rootCause": {
        "type": "string",
        "format": "markdown",
        "title": "Root Cause",
        "description": "Detailed analysis of what caused the incident"
      },
      "resolution": {
        "type": "string",
        "format": "markdown", 
        "title": "Resolution",
        "description": "How the incident was resolved"
      },
      "preventiveMeasures": {
        "type": "string",
        "format": "markdown",
        "title": "Preventive Measures",
        "description": "Actions taken to prevent similar incidents"
      },
      "lessonsLearned": {
        "type": "string",
        "format": "markdown",
        "title": "Lessons Learned",
        "description": "Key takeaways and learnings from this incident"
      },
      "tags": {
        "type": "array",
        "title": "Tags",
        "description": "Tags for categorizing and searching RCAs"
      }
    },
    "required": ["summary", "incidentDate", "severity", "rootCause", "resolution"]
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {}
}
```
</details>

<!-- Add an image of the final data model -->
<p align="center">
<img src='/img/ai-agents/RCADataModel.png' width='75%' border='1px' />
</p>

## Create the Root Cause Analysis blueprint

1. Go to the [Builder](https://app.getport.io/dev-portal) page of your portal
2. Click on `+ Blueprint`
3. Toggle `Json mode` on
4. Copy and paste the JSON schema from above
5. Click `Create` to save the blueprint

## Populate with sample RCA data

Now let's add some sample RCA documents that our AI agent can reference.

### Database Connection Pool Exhaustion incident

Let's create our first RCA entity:

1. Go to your [software catalog](https://app.getport.io/organization)
2. Find the "Root Cause Analysis" blueprint and click `+ RCA`
3. Fill in the following information:

<Tabs groupId="rca-input-method" queryString>
<TabItem value="ui-form" label="UI Form">

- **Identifier**: `rca-db-pool-exhaustion-2024-01`
- **Title**: `Database Connection Pool Exhaustion - Payment Service`
- **Summary**: `Payment service experienced 5-minute outage due to database connection pool exhaustion`
- **Incident Date**: `2024-01-15T14:30:00Z`
- **Severity**: `High`
- **Affected Services**: `["payment-service", "checkout-service"]`
- **Tags**: `["database", "connection-pool", "performance"]`

**Root Cause** (markdown):
```markdown
## Analysis
The payment service database connection pool was configured with a maximum of 10 connections. During peak traffic (Black Friday promotion), the service received 5x normal load, causing all connections to be exhausted.

## Timeline
- 14:30 - First alerts for payment service timeouts
- 14:32 - Database monitoring showed 100% connection pool utilization  
- 14:35 - Root cause identified as connection pool exhaustion
```

**Resolution** (markdown):
```markdown
## Immediate Fix
1. Increased database connection pool size from 10 to 50
2. Restarted payment service instances
3. Service restored at 14:35

## Technical Details
- Updated `application.yml` configuration
- Deployed hotfix version 1.2.1
- Verified connection pool metrics in monitoring dashboard
```

**Preventive Measures** (markdown):
```markdown
1. **Monitoring**: Added alerts for connection pool utilization >80%
2. **Load Testing**: Implemented regular load testing with 10x normal traffic
3. **Configuration**: Set connection pool size based on expected peak load + 50% buffer
4. **Documentation**: Updated runbooks with connection pool troubleshooting steps
```

**Lessons Learned** (markdown):
```markdown
- Always configure connection pools based on peak load, not average load
- Monitor connection pool utilization as a key metric
- Include database load in regular performance testing
- Have connection pool size adjustment procedures documented
```

</TabItem>
<TabItem value="api" label="API">

You can also create RCA entities programmatically using the Port API:

```bash showLineNumbers title="Create RCA via API"
curl -X POST 'https://api.getport.io/v1/blueprints/rootCauseAnalysis/entities' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "identifier": "rca-db-pool-exhaustion-2024-01",
    "title": "Database Connection Pool Exhaustion - Payment Service", 
    "properties": {
      "summary": "Payment service experienced 5-minute outage due to database connection pool exhaustion",
      "incidentDate": "2024-01-15T14:30:00Z",
      "severity": "High",
      "affectedServices": ["payment-service", "checkout-service"],
      "rootCause": "## Analysis\nThe payment service database connection pool was configured with a maximum of 10 connections...",
      "resolution": "## Immediate Fix\n1. Increased database connection pool size from 10 to 50...",
      "preventiveMeasures": "1. **Monitoring**: Added alerts for connection pool utilization >80%...",
      "lessonsLearned": "- Always configure connection pools based on peak load, not average load...",
      "tags": ["database", "connection-pool", "performance"]
    }
  }'
```

</TabItem>
</Tabs>

### Memory Leak incident

Add another RCA entity with these details:

- **Identifier**: `rca-memory-leak-user-service-2024-02`
- **Title**: `Memory Leak in User Service Authentication Module`
- **Summary**: `Gradual memory leak in user service caused OOM crashes every 6 hours`
- **Incident Date**: `2024-02-08T09:15:00Z` 
- **Severity**: `Critical`
- **Affected Services**: `["user-service", "authentication-service"]`
- **Tags**: `["memory-leak", "authentication", "jvm"]`

:::tip Add more RCAs
For a more comprehensive knowledge base, consider adding 5-10 RCA documents covering different types of incidents your organization has experienced.
:::

## Update your AI agent configuration

Now we'll modify the Incident Manager AI agent to include access to our RCA documents.

### Add RCA blueprint to allowed blueprints

1. Go to the [AI Agents](https://app.getport.io/_ai_agents) page
2. Find your Incident Manager agent and click on it
3. Click `Edit agent`
4. In the `allowed_blueprints` array, add `"rootCauseAnalysis"`:

```json showLineNumbers
"allowed_blueprints": [
  "pagerdutyService",
  "pagerdutyIncident", 
  "pagerdutyEscalationPolicy",
  "pagerdutySchedule",
  "pagerdutyOncall",
  "pagerdutyUser",
  "_user",
  "_team",
  "service",
  "rootCauseAnalysis"
]
```

### Update the agent prompt

Enhance the prompt to include instructions about using RCA context:

```markdown showLineNumbers title="Enhanced agent prompt"
You are an agent responsible for answering questions about PagerDuty incidents, services, escalation policies, schedules, and on-call rotations. You also have access to historical Root Cause Analysis (RCA) documents from past incidents.

### Guidelines
- Provide clear information about incidents
- Identify who is on-call for services (both primary and secondary on-call)  
- Report on incident statistics and resolution times
- **When relevant, reference past RCA documents to provide context and suggest solutions**
- **Use RCA lessons learned to help prevent similar incidents**
- **Suggest preventive measures based on historical incident patterns**

### Using RCA Context
- Search RCA documents when users ask about similar past incidents
- Reference specific resolution steps from past incidents when applicable
- Highlight patterns across multiple incidents
- Suggest preventive measures from historical data
```

### Add RCA-focused conversation starters

Add these conversation starters to help users discover the new capabilities:

```json showLineNumbers
"conversation_starters": [
  "Who is on call for the payment service?",
  "What are the active incidents right now?", 
  "What is our average incident resolution time?",
  "Have we seen database connection issues before?",
  "What can we learn from past payment service incidents?",
  "Show me RCAs for incidents similar to the current one"
]
```

## Test the enhanced agent

Let's test that our agent can now reference RCA documents.

### Example interactions

**Question**: "We're seeing database connection timeouts in the payment service. Have we experienced this before?"

**Expected response**: The agent should reference the RCA document we created and provide details about the previous database connection pool exhaustion incident, including the resolution steps and preventive measures.

**Question**: "What lessons have we learned from past payment service incidents?"

**Expected response**: The agent should search through RCA documents tagged with payment-related services and summarize key lessons learned.

**Question**: "How should we prevent memory leaks in our services?"

**Expected response**: The agent should reference preventive measures from relevant RCA documents.

## Summary

You have successfully enhanced your AI agent with custom context using entities! Your Incident Manager agent now has access to historical incident knowledge, making it significantly more valuable for both current incident response and prevention of future issues.

The approach we've demonstrated here can be extended to other types of documentation:
- **Runbooks**: Create a "Runbook" blueprint with markdown procedures
- **Architecture docs**: Store system architecture information
- **Process documentation**: Include incident response procedures  
- **Best practices**: Capture organizational standards and guidelines

## Next steps

Here are some ways to expand and improve your setup:

- **Automate RCA creation**: Set up automations to create RCA entities from incident post-mortems
- **Cross-reference data**: Link RCAs to services, teams, and other relevant entities using relations
- **Monitor agent usage**: Review AI invocation logs to see how effectively the agent uses RCA context
- **Add more context types**: Create additional blueprints for different types of organizational knowledge
- **Regular maintenance**: Periodically review and update RCA documents as processes evolve