---
displayed_sidebar: null
description: Design your Port data model with MCP-first patterns to enable seamless AI agent integration, tool orchestration, and ecosystem interoperability
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Build Port data model with MCP

Developers using MCP (Model Context Protocol) need clear patterns for designing Port entities that AI agents can effectively consume. This guide provides MCP-first architecture patterns for building intelligent data models that enable seamless tool orchestration and ecosystem interoperability.

Whether you're building MCP servers, integrating Port with AI systems, or standardizing on MCP for tool integration, these patterns will help you create a data model that AI agents can reason about effectively.

## Common use cases

- **Tool orchestration**: Design entities that MCP tools can discover, query, and manipulate through natural language.
- **AI agent integration**: Structure your catalog so agents can traverse relationships and understand your software architecture.
- **Ecosystem interoperability**: Create consistent schemas that work across multiple MCP-enabled tools and platforms.
- **Automated workflows**: Enable agents to trigger actions and update entities based on contextual understanding.

## Prerequisites

This guide assumes you have:

- Basic understanding of [blueprints](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/) and [relations](/build-your-software-catalog/customize-integrations/configure-data-model/relate-blueprints/).
- Port MCP server configured in your [IDE](/ai-interfaces/port-mcp-server/overview-and-installation?mcp-setup=cursor)

## Designing blueprints for MCP tool consumption

Port's MCP server exposes tools like `list_blueprints`, `list_entities`, and `get_entities_by_identifiers` that AI agents use to interact with your catalog. Your blueprint design directly impacts how effectively these tools work. Focus on making blueprints discoverable, queryable, and self-documenting.

<h3>Use descriptive identifiers and titles</h3>

Choose blueprint identifiers and titles that clearly communicate their purpose:

```json showLineNumbers
{
  "identifier": "microservice",
  "title": "Microservice",
  "description": "A microservice in our architecture that can be independently deployed"
}
```

:::tip Clear naming
Avoid abbreviations or internal jargon. Use names that an AI agent can understand without domain-specific knowledge.
:::

<h3>Add meaningful descriptions</h3>

Include descriptions for blueprints and properties to help AI agents understand their purpose:

```json showLineNumbers
{
  "identifier": "service",
  "title": "Service",
  "description": "A service represents an application or microservice that provides business functionality. Services can be deployed to multiple environments and have dependencies on other services.",
  "schema": {
    "properties": {
      "tier": {
        "title": "Service Tier",
        "type": "string",
        "enum": ["tier-1", "tier-2", "tier-3"],
        "description": "The criticality tier of the service. Tier-1 services are customer-facing and require high availability."
      }
    }
  }
}
```

<h3>Structure properties for queryability</h3>

Design properties that enable effective filtering and searching:

- **Use enums for categorical data**: This helps agents understand valid values and filter effectively.
- **Include date-time properties**: Enable time-based queries and trend analysis.
- **Add status fields**: Help agents understand entity state and filter by status.

```json showLineNumbers
{
  "properties": {
    "status": {
      "title": "Status",
      "type": "string",
      "enum": ["active", "deprecated", "archived"],
      "enumColors": {
        "active": "green",
        "deprecated": "yellow",
        "archived": "gray"
      }
    },
    "lastDeployed": {
      "title": "Last Deployed",
      "type": "string",
      "format": "date-time"
    }
  }
}
```

## Entity schema best practices for AI agents

When an AI agent queries Port through MCP, it receives entity data as structured JSON. The agent then reasons about this data to answer questions or take actions. Well-structured schemas enable better reasoning and more accurate responses.

<h3>Provide context through properties</h3>

Include properties that give agents enough context to answer questions:

```json showLineNumbers
{
  "properties": {
    "description": {
      "title": "Description",
      "type": "string",
      "format": "markdown",
      "description": "A detailed description of what this service does, its main responsibilities, and key features"
    },
    "documentation": {
      "title": "Documentation URL",
      "type": "string",
      "format": "url",
      "description": "Link to service documentation or README"
    },
    "team": {
      "title": "Owning Team",
      "type": "string",
      "description": "The team responsible for maintaining this service"
    }
  }
}
```

<h3>Use consistent property naming</h3>

Maintain consistent naming conventions across blueprints to help agents understand patterns:

- Use the same property names for similar concepts (e.g., `team` for ownership across all blueprints).
- Follow a consistent format for related properties (e.g., `lastDeployed`, `lastUpdated`, `lastModified`).

<h3>Include searchable metadata</h3>

Add properties that enable agents to find entities through natural language queries:

```json showLineNumbers
{
  "properties": {
    "tags": {
      "title": "Tags",
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Tags for categorizing and searching this entity"
    },
    "environment": {
      "title": "Environment",
      "type": "string",
      "enum": ["production", "staging", "development"],
      "description": "The environment where this entity is deployed"
    }
  }
}
```

## Defining relations that enable agent reasoning

Relations are how AI agents understand the topology of your software catalog. When an agent uses the `list_entities` tool with the `relatedTo` operator, it can traverse your entity graph to answer questions like "What services depend on this database?" or "Who owns the infrastructure this service runs on?".

<h3>Create explicit relations</h3>

Define relations that represent meaningful connections in your architecture:

```json showLineNumbers
{
  "relations": {
    "dependsOn": {
      "title": "Depends On",
      "target": "service",
      "required": false,
      "many": true,
      "description": "Services that this service depends on"
    },
    "deployedTo": {
      "title": "Deployed To",
      "target": "environment",
      "required": false,
      "many": true,
      "description": "Environments where this service is deployed"
    },
    "ownedBy": {
      "title": "Owned By",
      "target": "_team",
      "required": true,
      "many": false,
      "description": "The team that owns this service"
    }
  }
}
```

<h3>Use bidirectional thinking</h3>

Consider how agents might traverse relations in both directions:

- If Service A depends on Service B, agents should be able to find all services that depend on Service B.
- Use the `relatedTo` operator in queries to enable flexible relationship traversal.

<h3>Document relation purposes</h3>

Add descriptions to relations to help agents understand their meaning:

```json showLineNumbers
{
  "relations": {
    "parentService": {
      "title": "Parent Service",
      "target": "service",
      "required": false,
      "many": false,
      "description": "The parent service that this microservice belongs to. Used for grouping related microservices under a larger service boundary."
    }
  }
}
```

## Permission models for MCP service accounts

MCP servers authenticate with Port using client credentials. When deploying MCP servers for team use, configure [service accounts](/sso-rbac/users-and-teams/manage-users-teams#service-accounts) with appropriate permissions to balance security with functionality.

### Create a service account for MCP

[Service accounts](https://docs.port.io/sso-rbac/users-and-teams/manage-users-teams/#service-accounts) are non-human users (bots) that can be used for integrating external tools like MCP servers. Create one via Port's API:

<details>
<summary><b>Full example (click to expand)</b></summary>
```bash showLineNumbers
curl -L -X POST 'https://api.getport.io/v1/blueprints/_user/entities' \
-d '{
    "identifier": "mcp-agent@serviceaccounts.getport.io",
    "title": "MCP Agent Service Account",
    "blueprint": "_user",
    "icon": "User",
    "properties": {
        "port_type": "Service Account",
        "port_role": "Member",
        "status": "Active"
    },
    "relations": {}
}' \
-H 'content-type: application/json' \
-H 'Authorization: <YOUR_API_TOKEN>'
```
</details>

:::info Credentials in response
The response contains a `additionalData.credentials` object with `clientId` and `clientSecret`. Store these securely—they will not be shown again.
:::

### Configure role-based access

Assign appropriate roles to service accounts based on their intended use:

- **Member role**: For read-only access to query catalog data via MCP.
- **Admin role**: For service accounts that need to create or update entities through MCP tools.

### Add service accounts to teams

Service accounts can be added to [teams](/sso-rbac/users-and-teams/manage-users-teams) to inherit team-based permissions, giving them access to team-owned entities:

```json showLineNumbers
{
  "team": ["platform-team"],
  "properties": {
    "port_type": "Service Account",
    "port_role": "Member"
  }
}
```

:::tip Least privilege
Follow the principle of least privilege: grant service accounts only the permissions they need. For most MCP use cases, the Member role with team membership is sufficient.
:::

## Service blueprint optimized for MCP

The following blueprint demonstrates MCP-first patterns with properties optimized for AI agent queries. This example includes queryable enums for filtering, relations for graph traversal, and aggregation properties for computed metrics:

<details>
<summary><b>Service blueprint optimized for MCP (click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "service",
  "title": "Service",
  "icon": "Microservice",
  "description": "A service represents an application or microservice. Services have ownership, can be deployed to environments, and connect to monitoring and security tools.",
  "ownership": {
    "type": "Direct"
  },
  "schema": {
    "properties": {
      "type": {
        "type": "string",
        "title": "Type",
        "description": "The service type for categorization",
        "enum": ["backend", "frontend", "library"],
        "enumColors": {
          "backend": "blue",
          "frontend": "green",
          "library": "purple"
        }
      },
      "lifecycle": {
        "type": "string",
        "title": "Lifecycle",
        "description": "The lifecycle state determines if this service is actively maintained",
        "enum": ["Production", "Experimental", "Deprecated"],
        "enumColors": {
          "Production": "green",
          "Experimental": "yellow",
          "Deprecated": "red"
        }
      }
    },
    "required": []
  },
  "relations": {
    "owning_team": {
      "title": "Owning Team",
      "target": "_team",
      "required": false,
      "many": false,
      "description": "The team responsible for this service"
    },
    "repository": {
      "title": "Repository",
      "target": "githubRepository",
      "required": false,
      "many": false,
      "description": "The source code repository"
    },
    "pager_duty_service": {
      "title": "PagerDuty Service",
      "target": "pagerdutyService",
      "required": false,
      "many": false,
      "description": "The PagerDuty service for on-call alerts"
    },
    "domain": {
      "title": "Domain",
      "description": "The business domain this service belongs to",
      "target": "domain",
      "required": false,
      "many": false
    }
  },
  "aggregationProperties": {
    "total_incidents": {
      "title": "Total Monthly Incidents",
      "type": "number",
      "target": "pagerdutyIncident",
      "calculationSpec": {
        "calculationBy": "entities",
        "func": "count"
      }
    },
    "open_critical_vulnerabilities": {
      "title": "Open Critical Vulnerabilities",
      "type": "number",
      "target": "snykVulnerability",
      "query": {
        "combinator": "and",
        "rules": [
          { "property": "status", "operator": "=", "value": "open" },
          { "property": "severity", "operator": "=", "value": "critical" }
        ]
      },
      "calculationSpec": {
        "func": "count",
        "calculationBy": "entities"
      }
    }
  }
}
```

</details>

This blueprint design enables AI agents to:

- **Filter by type and lifecycle**: "Show me all deprecated backend services".
- **Traverse ownership**: "Which team owns the order-service?".
- **Access computed metrics**: "Which services have open critical vulnerabilities?".
- **Navigate the service graph**: "What repository is the payment-service connected to?".

## Let's test it

After designing your data model, test it with an MCP-enabled AI assistant to ensure agents can query and reason about your catalog effectively.

<Tabs queryString="ide">
<TabItem value="cursor" label="Cursor">

<h4>Filter by type and lifecycle</h4>

Ask: *"Show me all deprecated backend services"*

<details>
<summary><b>Example (click to expand)</b></summary>
<img src="/img/guides/MCPDataModelCursorFilter.png" border="1px" />
</details>

<h4>Traverse ownership</h4>

Ask: *"Which team owns the order-service?"*

<details>
<summary><b>Example (click to expand)</b></summary>
<img src="/img/guides/MCPDataModelCursorOwnership.png" border="1px" />
</details>



</TabItem>
<TabItem value="vscode" label="VS Code">


<h4>Filter by type and lifecycle</h4>

Ask: *"Show me all deprecated backend services"*

<details>
<summary><b>Example (click to expand)</b></summary>
<img src="/img/guides/MCPDataModelVSCodeFilter.png" border="1px" />
</details>

<h4>Traverse ownership</h4>

Ask: *"Which team owns the order-service?"*

<details>
<summary><b>Example (click to expand)</b></summary>
<img src="/img/guides/MCPDataModelVSCodeOwnership.png" border="1px" />
</details>

</TabItem>
</Tabs>



## Related documentation

- [Port MCP server overview](/ai-interfaces/port-mcp-server/overview-and-installation) - Installation and configuration.
- [Available MCP tools](/ai-interfaces/port-mcp-server/available-tools) - Complete reference for all MCP tools.
- [Set up blueprints](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/) - Blueprint configuration reference.
- [Service accounts](/sso-rbac/users-and-teams/manage-users-teams#service-accounts) - Creating and managing service accounts.

