---
displayed_sidebar: null
description: Design Port scorecards that AI agents can query to evaluate compliance, security posture, and production readiness in real-time
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Build Port scorecards with MCP

AI agents need access to real-time compliance and quality metrics to make informed decisions. This guide provides MCP-first patterns for designing scorecards that agents can query to evaluate security posture, production readiness, and engineering standards across your software catalog.

Whether you're building security agents, compliance automation, or developer productivity tools, these patterns will help you create scorecards that provide actionable insights through natural language queries.

## Common use cases

- **Compliance monitoring**: Enable agents to query which services meet security or regulatory standards.
- **Risk assessment**: Let agents identify services with failing scorecard rules before deployments.
- **Automated remediation**: Trigger workflows based on scorecard level changes.
- **Developer guidance**: Help agents provide actionable feedback on how to improve scorecard scores.

## Prerequisites

This guide assumes you have:

- Basic understanding of [scorecards](/scorecards/) and [scorecard rules](/scorecards/concepts-and-structure).
- Port MCP server configured in your [IDE](/ai-interfaces/port-mcp-server/overview-and-installation?mcp-setup=cursor)

## Designing scorecards for MCP queries

Port's MCP server exposes tools like `get_scorecards`, `list_entities`, and `get_entities_by_identifiers` that AI agents use to query scorecard data. Your scorecard design directly impacts how effectively agents can assess compliance and provide recommendations.

<h3>Use descriptive identifiers and titles</h3>

Scorecard identifiers and titles help agents understand what each scorecard measures:

```json showLineNumbers
{
  "identifier": "security-maturity",
  "title": "Security Maturity",
  "levels": [
    {"title": "Basic", "color": "paleBlue"},
    {"title": "Maturing", "color": "purple"},
    {"title": "Bronze", "color": "bronze"},
    {"title": "Silver", "color": "silver"},
    {"title": "Gold", "color": "gold"}
  ]
}
```

:::tip Naming conventions
Use kebab-case identifiers that describe the domain (e.g., `security-maturity`, `production-readiness`, `quality-maturity`). This helps agents discover relevant scorecards when users ask about specific topics.
:::

<h3>Add descriptions to rules</h3>

Rule descriptions enable agents to explain why a service is failing and what needs to be fixed:

<details>
<summary><b>Example rule configuration (click to expand)</b></summary>
```json showLineNumbers
{
  "identifier": "noOpenCritical",
  "title": "No open critical vulnerabilities",
  "description": "The service does not have any open critical vulnerabilities",
  "level": "Bronze",
  "query": {
    "combinator": "and",
    "conditions": [
      {
        "property": "open_critical_vulnerabilities",
        "operator": "=",
        "value": 0
      }
    ]
  }
}
```
</details>

When an agent retrieves scorecard results, it can use these descriptions to provide actionable feedback:
- **Pass**: "This service meets the Bronze level requirement: no open critical vulnerabilities."
- **Fail**: "This service fails the Bronze level requirement. Action needed: remediate the open critical vulnerabilities."

<h3>Structure levels progressively</h3>

Define levels that represent a clear progression path. Agents can then guide users through incremental improvements:

<details>
<summary><b>Example scorecard configuration (click to expand)</b></summary>
  ```json showLineNumbers
  {
    "levels": [
      {"title": "Basic", "color": "paleBlue"},
      {"title": "Maturing", "color": "purple"},
      {"title": "Bronze", "color": "bronze"},
      {"title": "Silver", "color": "silver"},
      {"title": "Gold", "color": "gold"}
    ],
    "rules": [
      {"identifier": "has_snyk_code", "level": "Maturing", "title": "Has Snyk Code"},
      {"identifier": "has_snyk_open_source", "level": "Maturing", "title": "Has Snyk Open Source"},
      {"identifier": "noOpenCritical", "level": "Bronze", "title": "No open critical vulnerabilities"},
      {"identifier": "noOpenSnyk", "level": "Silver", "title": "No open critical or high vulnerabilities"},
      {"identifier": "someFixedIssues", "level": "Gold", "title": "Some issues actively fixed in the last 30 days"}
    ]
  }
  ```
</details>

## Querying scorecards via MCP

Agents use several MCP tools to interact with scorecards:

<h3>Discover available scorecards</h3>

The `get_scorecards` tool returns all scorecards with their rules and levels:

```
Agent: "What scorecards are defined for services?"
→ Calls get_scorecards
→ Returns: security-maturity, ProductionReadiness, quality_maturity
```

<h3>Query scorecard results for entities</h3>

Use `get_entities_by_identifiers` with scorecard identifiers in the `include` parameter:

```
Agent: "What's the security maturity level of the Stack-Nova-Proto-Repo service?"
→ Calls get_entities_by_identifiers with include: ["security-maturity"]
→ Returns: level "Basic", with rule-by-rule results
```

<h3>Filter entities by scorecard level</h3>

Use `list_entities` with scorecard filters to find entities at specific compliance levels:

```
Agent: "Which services have Gold security maturity?"
→ Calls list_entities with query filter on security-maturity scorecard
→ Returns: List of compliant services
```

## Embedding scorecard logic in agent decisions

Agents can use scorecard data to make intelligent decisions about deployments, prioritization, and remediation.

<h3>Pre-deployment checks</h3>

Before deploying, an agent can verify scorecard compliance:

```
User: "Deploy the checkout service to production"
Agent: 
  1. Queries security-maturity scorecard for checkout service
  2. Finds level is "Basic" (failing critical rules)
  3. Responds: "Cannot deploy - service has open critical vulnerabilities. 
     Fix these issues first or request an exception."
```

<h3>Prioritization based on compliance</h3>

Agents can prioritize work based on scorecard results:

```
User: "What should I work on to improve our security posture?"
Agent:
  1. Queries all services with security-maturity scorecard
  2. Identifies services at "Basic" level with failing rules
  3. Responds with prioritized list based on rule failures
```

## Example: security maturity scorecard

Here's a complete security maturity scorecard optimized for MCP queries:

<details>
<summary><b>Full scorecard configuration (click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "security-maturity",
  "title": "Security Maturity",
  "blueprint": "service",
  "levels": [
    {"title": "Basic", "color": "paleBlue"},
    {"title": "Maturing", "color": "purple"},
    {"title": "Bronze", "color": "bronze"},
    {"title": "Silver", "color": "silver"},
    {"title": "Gold", "color": "gold"}
  ],
  "rules": [
    {
      "identifier": "has_snyk_code",
      "title": "Has Snyk Code",
      "description": "All services should have Snyk Code to scan 1st party code",
      "level": "Maturing",
      "query": {
        "combinator": "and",
        "conditions": [
          {
            "property": "enabled_snyk_products",
            "operator": "contains",
            "value": "Snyk Code"
          }
        ]
      }
    },
    {
      "identifier": "has_snyk_open_source",
      "title": "Has Snyk Open Source",
      "description": "All services should have Snyk Open Source to scan 3rd party code",
      "level": "Maturing",
      "query": {
        "combinator": "and",
        "conditions": [
          {
            "property": "enabled_snyk_products",
            "operator": "contains",
            "value": "Snyk Open Source"
          }
        ]
      }
    },
    {
      "identifier": "noOpenCritical",
      "title": "No open critical vulnerabilities",
      "description": "The service does not have any open critical vulnerabilities",
      "level": "Bronze",
      "query": {
        "combinator": "and",
        "conditions": [
          {
            "property": "open_critical_vulnerabilities",
            "operator": "=",
            "value": 0
          }
        ]
      }
    },
    {
      "identifier": "noOpenSnyk",
      "title": "No open critical or high vulnerabilities",
      "description": "The service does not have any open critical or high vulnerabilities",
      "level": "Silver",
      "query": {
        "combinator": "and",
        "conditions": [
          {
            "property": "open_critical_vulnerabilities",
            "operator": "=",
            "value": 0
          },
          {
            "property": "open_high_vulnerabilities",
            "operator": "=",
            "value": 0
          }
        ]
      }
    },
    {
      "identifier": "someResolvedIssues",
      "title": "Some issues resolved in the last 30 days",
      "description": "Any Snyk issues resolved in the last 30 days",
      "level": "Silver",
      "query": {
        "combinator": "and",
        "conditions": [
          {
            "property": "resolved_in_last_30_days",
            "operator": ">",
            "value": 0
          }
        ]
      }
    },
    {
      "identifier": "someFixedIssues",
      "title": "Some issues actively fixed in the last 30 days",
      "description": "Any Snyk issues actively fixed in the last 30 days",
      "level": "Gold",
      "query": {
        "combinator": "and",
        "conditions": [
          {
            "property": "fixes_in_the_last_30_days",
            "operator": ">",
            "value": 0
          }
        ]
      }
    }
  ]
}
```

</details>

This scorecard design enables AI agents to:

- **Assess compliance**: "What's the security maturity of my service?"
- **Identify gaps**: "Which security rules is my service failing?"
- **Provide guidance**: "What do I need to do to reach Silver level?"
- **Track progress**: "Have we fixed any vulnerabilities this month?"

## Let's test it

After creating your scorecards, test them with an MCP-enabled AI assistant. In this example, we'll query the security maturity of a service.

<h3>Prompt</h3>

Ask your AI assistant:

> *"What's the security maturity level of the AwesomeService service and which rules is it failing?"*

<h3>What happens</h3>

The agent will:
1. **Find the service** - Locate the entity via `list_entities` or `get_entities_by_identifiers`.
2. **Query scorecard results** - Include `security-maturity` in the entity request.
3. **Analyze rule results** - Identify which rules have `status: FAILURE`.
4. **Provide recommendations** - Explain what needs to be fixed to improve the level.

<img src="/img/guides/MCPScorecardsSecurityCursor.png" border="1px" />


## Related documentation

- [Scorecards overview](/scorecards/) - Introduction to scorecards and their use cases.
- [Scorecard structure](/scorecards/concepts-and-structure) - Detailed guide on rules, levels, and conditions.
- [Available MCP tools](/ai-interfaces/port-mcp-server/available-tools) - Complete reference for all MCP tools.
- [Manage scorecards](/scorecards/manage-scorecards) - Creating and updating scorecards via UI and API.

