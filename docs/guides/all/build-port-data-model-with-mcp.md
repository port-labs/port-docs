---
displayed_sidebar: null
description: Use AI to build and manage your Port software catalog through natural language conversations, creating blueprints, entities, relations, actions, and scorecards
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Build your software catalog with MCP

Use Port's MCP (Model Context Protocol) server to build and manage your software catalog through natural language conversations with AI. This guide shows you how to create blueprints, populate entities and define relations by describing what you need in plain English.

Instead of manually configuring JSON schemas or clicking through UI forms, you can have conversations with your AI assistant to build your catalog iteratively, getting instant feedback and making adjustments on the fly.

## Common use cases

- **Bootstrap new catalogs**: Describe your architecture and let AI create the initial blueprint structure.
- **Populate entities**: Ask AI to create services, teams, or environments based on your requirements.
- **Define relations**: Explain how components connect and let AI configure the relationships.
- **Set up actions**: Describe workflows you want to enable and have AI create self-service actions.
- **Create scorecards**: Explain quality standards and let AI build evaluation rules.

## Prerequisites

This guide assumes you have:

- Basic understanding of [blueprints](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/) and [relations](/build-your-software-catalog/customize-integrations/configure-data-model/relate-blueprints/).
- Port MCP server configured in your [IDE](/ai-interfaces/port-mcp-server/overview-and-installation?mcp-setup=cursor).

:::info Permissions
MCP operations use the permissions of the authenticated user. Only users with appropriate access (typically admins) can create or modify blueprints, entities, and other catalog components.
:::

## Creating blueprints with AI

Port's MCP server provides tools like `create_blueprint`, `list_blueprints`, and `update_blueprint` that enable AI agents to build your catalog through natural language conversations. You can describe what you need, and the AI will generate the appropriate JSON schema and create it in Port.

<h3>Start with a simple description</h3>

Describe the blueprint you want to create in natural language. The AI will interpret your requirements and generate the appropriate schema.

**Example conversation:**

*"Create a microservice blueprint with properties for programming language, repository URL, and deployment status"*

The AI will use the MCP `create_blueprint` tool to generate and create the blueprint:

<details>
<summary><b>Screenshot example (click to expand)</b></summary>
<img src="/img/guides/MCPCreateBlueprint.png" border="1px" />
</details>

:::tip Iterative refinement
After creating a blueprint, you can refine it by asking follow-up questions like "Add a team property" or "Change the status enum to include 'maintenance'".
:::

<h3>Create multiple related blueprints</h3>

You can describe an entire architecture and let AI create multiple blueprints at once:

**Example conversation:**

*"Create blueprints for libraries, packages, and dependencies. Libraries should have properties for programming language and license type. Packages should have version and publish date properties. Dependencies should connect packages to libraries they depend on."*

The AI will:

1. Create the library blueprint with appropriate properties.
2. Create the package blueprint.
3. Create the dependency blueprint with relations to both package and library.
4. Configure the relationships between them.


<Tabs groupId="mcp-output" queryString>
<TabItem value="mcp" label="MCP server input">
<img src="/img/guides/MCPCreateBlueprintMultiple.png" border="1px" />
</TabItem>
<TabItem value="port" label="Port output">
<img src="/img/guides/MCPCreateBlueprintMultiple2.png" border="1px" />
</TabItem>
</Tabs>



<h3>Add computed properties</h3>

Describe aggregations and calculations you need, and AI will configure them:

**Example conversations:**

*"Add an aggregation property to the service blueprint that counts the number of open incidents from PagerDuty"*

<Tabs groupId="mcp-output" queryString>
<TabItem value="mcp" label="MCP server input">
<img src="/img/guides/MCPAggregationPropertyAddition.png" border="1px" />
</TabItem>
<TabItem value="port" label="Port output">
<img src="/img/guides/MCPAggregationPropertyAdditionPort.png" border="1px" />
</TabItem>
</Tabs>

*"Add a calculation property that combines the service name and version into a display title"*

<Tabs groupId="mcp-output" queryString>
<TabItem value="mcp" label="MCP server input">
<img src="/img/guides/MCPCalculationPropertyAddition.png" border="1px" />
</TabItem>
<TabItem value="port" label="Port output">
<img src="/img/guides/MCPCalculationPropertyAdditionPort.png" border="1px" />
</TabItem>
</Tabs>

The AI will add the appropriate `aggregationProperties` or `calculationProperties` section with the correct structure.

## Populating entities with AI

Once you have blueprints, use AI to create entities. The MCP server provides `create_entity` and `update_entity` tools that work through natural language.

<h3>Create individual entities</h3>

Describe the entity you want to create:

**Example conversation:**

*"Create a service called order-api with Python as the language, status active, and assign it to the platform team"*


<Tabs groupId="mcp-output" queryString>
<TabItem value="mcp" label="MCP server input">
<img src="/img/guides/MCPCreateEntity.png" border="1px" />
</TabItem>
<TabItem value="port" label="Port output">
<img src="/img/guides/MCPCreateEntityPort.png" border="1px" />
</TabItem>
</Tabs>


<h3>Bulk entity creation</h3>

You can describe multiple entities and let AI create them all:

**Example conversation:**

*"Create three services: payment-api (Node.js, active, payments team), user-service (Python, active, identity team), and notification-service (Go, experimental, platform team)"*

The AI will create all three entities with the correct properties and team assignments.

<Tabs groupId="mcp-output" queryString>
<TabItem value="mcp" label="MCP server input">
<img src="/img/guides/MCPCreateEntityMultiple.png" border="1px" />
</TabItem>
<TabItem value="port" label="Port output">
<img src="/img/guides/MCPCreateEntityMultiplePortOutput.png" border="1px" />
</TabItem>
</Tabs>

<h3>Update existing entities</h3>

Modify entities by describing the changes:

**Example conversation:**

*"Change the status of notification-service to active and update its description to include SMS and email capabilities"*

<Tabs groupId="mcp-output" queryString>
<TabItem value="mcp" label="MCP server input">
<img src="/img/guides/MCPCreateEntityUpdate.png" border="1px" />
</TabItem>
<TabItem value="port" label="Port output">
<img src="/img/guides/MCPCreateEntityUpdatePort.png" border="1px" />
</TabItem>
</Tabs>

## Defining relations with AI

Relations connect entities in your catalog. AI can help you understand existing relations and create new ones based on your architecture.

<h3>Query existing relations</h3>

Ask AI about how entities are connected:

**Example conversation:**

*"What services depend on the payment-database?"*

The AI uses `list_entities` with the `relatedTo` operator to traverse relationships and answer your question.

<img src="/img/guides/MCPQueryRelations.png" border="1px" />

<h3>Update blueprint relations</h3>

Add new relations by describing them:

**Example conversation:**

*"Update the service blueprint to include a relation to databases. Services should be able to connect to multiple databases."*

The AI will use `update_blueprint` to add the relation configuration.

<img src="/img/guides/MCPUpdateBlueprintRelations.png" border="1px" />

## Best practices for AI-driven catalog building

When using AI to build your catalog, follow these practices to get the best results:

<h3>Be specific in your requests</h3>

The more detail you provide, the better AI can configure your catalog:

- **Good**: *"Create a service blueprint with properties for language (enum: Python, Node.js, Go), status (enum: active, deprecated), and a markdown description field"*
- **Less effective**: *"Create a service blueprint"*

<h3>Iterate incrementally</h3>

Build your catalog in steps, refining as you go:

1. Start with basic blueprints and a few properties.
2. Add more properties and relations based on your needs.
3. Create entities to test the structure.
4. Adjust based on what works.

<h3>Use consistent naming</h3>

Ask AI to follow consistent naming patterns across blueprints:

*"Use the same property name 'owning_team' for team ownership across all blueprints"*

<h3>Validate and review</h3>

After AI creates components, review them in the Port UI:

- Check that enums have the right values.
- Verify relations point to the correct blueprints.
- Test actions in a non-production environment first.


## Querying and managing your catalog

Once your catalog is built, use natural language to query and manage it:

- *"Show me all services owned by the platform team"*
- *"Give me a summary of services by deployment status"*

For more query examples and capabilities, see the [MCP server documentation](/ai-interfaces/port-mcp-server/available-tools).

## Related documentation

- [Port MCP server overview](/ai-interfaces/port-mcp-server/overview-and-installation) - Installation and configuration for your IDE.
- [Available MCP tools](/ai-interfaces/port-mcp-server/available-tools) - Complete reference for all MCP tools and their capabilities.
- [Set up blueprints](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/) - Detailed blueprint configuration reference.