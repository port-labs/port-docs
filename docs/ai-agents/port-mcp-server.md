---
sidebar_position: 4
title: Port MCP Server
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Port MCP server


The Port Model Context Protocol (MCP) Server acts as a bridge, enabling Large Language Models (LLMs)—like those powering Claude, Cursor, or GitHub Copilot—to interact directly with your Port.io developer portal. This allows you to leverage natural language to query your software catalog, analyze service health, manage resources, and even streamline development workflows, all from your preferred interfaces.

:::info AI Agents vs. MCP Server
The Port MCP Server is currently in open beta and provides significant standalone value, independent of our [AI Agents feature](/ai-agents/overview). Port AI Agents are currently in closed beta with limited access, while the MCP Server gives you immediate access to streamline building in Port, query your catalog, analyze service health, and streamline development workflows using natural language.

While the MCP Server can interact with Port AI Agents when available, the core MCP functionality can be used freely without requiring access to the closed beta AI Agents feature.
:::

## Why integrate LLMs with your developer portal?

The primary advantage of the Port MCP Server is the ability to bring your developer portal's data and actions into the conversational interfaces you already use. This offers several benefits:

*   **Reduced Context Switching:** Access Port information and initiate actions without leaving your IDE or chat tool.
*   **Increased Efficiency:** Get answers and perform tasks faster using natural language commands.
*   **Improved Developer Experience:** Make your developer portal more accessible and intuitive to interact with.
*   **Enhanced Data-Driven Decisions:** Easily pull specific data points from Port to inform your work in real-time.

As one user put it:

> "It would be interesting to build a use case where a developer could ask Copilot from his IDE about stuff Port knows about, without actually having to go to Port."

The Port MCP Server directly enables these kinds of valuable, in-context interactions.

## Key capabilities and use-cases

The Port MCP Server enables you to interact with your Port data and capabilities directly through natural language within your chosen LLM-powered tools. Here's what you can achieve:

### Find information quickly

Effortlessly query your software catalog and get immediate answers. This eliminates the need to navigate through UIs or write complex API queries when you need information.

*   Ask: "Who is the owner of service X?"
*   Ask: "How many services do we have in production?"
*   Ask: "Show me all the microservices owned by the Backend team."
*   Ask: "What are the dependencies of the 'OrderProcessing' service?"

![Querying the service catalog from an IDE](/img/ai-agents/MCPCopilotAskServices.png)

### Analyze scorecards and quality

Gain insights into service health, compliance, and quality by leveraging Port's scorecard data. Identify areas for improvement and track progress against your standards.

*   Ask: "Which services are failing our security requirements scorecard?"
*   Ask: "What's preventing the 'InventoryService' from reaching Gold level in the 'Production Readiness' scorecard?"
*   Ask: "Show me the bug count vs. test coverage for all Java microservices."

![Asking about bug counts and test coverage correlation](/img/ai-agents/MCPClaudeInsightsBugs.png)

*   Ask: "Which of our services are missing critical monitoring dashboards?"

![Identifying services lacking proper monitoring](/img/ai-agents/MCPClaudeMonitoringServices.png)

### Streamline development and operations

Receive assistance with common development and operational tasks, directly within your workflow.

*   Ask: "What do I need to do to set up a new 'ReportingService'?"
*   Ask: "Guide me through creating a new service blueprint with 'name', 'description', and 'owner' properties."
*   Ask: "Help me add a rule to the 'Tier1Services' scorecard that requires an on-call schedule to be defined."

![Getting instructions for new service setup](/img/ai-agents/MCPClaudeServiceSetup.png)

## Get started

Setting up Port's MCP is simple. Follow the instructions for your preferred tool, or learn about the archived local MCP server.

<Tabs groupId="mcp-setup" queryString>
<TabItem value="cursor" label="Cursor">
To connect Cursor to Port's remote MCP, you need to add a configuration to your `mcp.json` file. This file is usually located in your `.cursor` directory. Add the following object to your `mcpServers` configuration:

<Tabs>
<TabItem value="eu" label="EU">
```json showLineNumbers
{
  "mcpServers": {
    "port-eu": {
      "url": "https://mcp.port.io/v1"
    }
  }
}
```
</TabItem>
<TabItem value="us" label="US">
```json showLineNumbers
{
  "mcpServers": {
    "port-us": {
      "url": "https://mcp.us.port.io/v1"
    }
  }
}
```
</TabItem>
</Tabs>
</TabItem>
<TabItem value="vscode" label="VSCode">
To connect VSCode to Port's remote MCP, you need to add a configuration to your MCP JSON file, which is usually located in your VSCode configuration directory. Add the following object to your `mcpServers` configuration:

<Tabs>
<TabItem value="eu" label="EU">
```json showLineNumbers
{
  "mcpServers": {
    "port-vscode-eu": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://mcp.port.io/v1"
      ]
    }
  }
}
```
</TabItem>
<TabItem value="us" label="US">
```json showLineNumbers
{
  "mcpServers": {
    "port-vscode-us": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://mcp.us.port.io/v1"
      ]
    }
  }
}
```
</TabItem>
</Tabs>
</TabItem>
<TabItem value="claude" label="Claude">
To connect Claude to Port's remote MCP, you need to create a custom connector. This process does not require a client ID. For detailed instructions, refer to the [official Anthropic documentation on custom connectors](https://support.anthropic.com/en/articles/11175166-getting-started-with-custom-connectors-using-remote-mcp).

When prompted for the remote MCP server URL, use the appropriate URL for your region:

<Tabs>
<TabItem value="eu" label="EU">
```
https://mcp.port.io/v1
```
</TabItem>
<TabItem value="us" label="US">
```
https://mcp.us.port.io/v1
```
</TabItem>
</Tabs>
</TabItem>
<TabItem value="local-mcp" label="Local MCP - Archive">
The local MCP server is an open-source project that you can run on your own infrastructure. It offers a similar set of capabilities, but requires manual setup and maintenance.

<h2>Prerequisites</h2>

-   A Port.io account with appropriate permissions.
-   Your Port credentials (Client ID and Client Secret). You can create these from your Port.io dashboard under Settings > Credentials.

<h2>Installation</h2>

The Port MCP Server can be installed using Docker or `uvx` (a package manager for Python). While the setup is straightforward, the specifics can vary based on your chosen MCP client (Claude, Cursor, VS Code, etc.).

:::info Detailed Installation Guide
For comprehensive, step-by-step installation instructions for various platforms and methods (Docker, UVX), please refer to the **[Port MCP Server GitHub README](https://github.com/port-labs/port-mcp-server)**.
The README provides the latest configuration details and examples for different setups.
:::
</TabItem>
</Tabs>

## Available tools

The Port MCP Server exposes a rich set of tools to interact with your developer portal. Here are the available tools:

### Blueprint tools

-   **`get_blueprints`**: Retrieve a list of all blueprints from Port.
-   **`get_blueprint`**: Retrieve information about a specific blueprint by its identifier.
-   **`create_blueprint`**: Create a new blueprint in Port.
-   **`update_blueprint`**: Update an existing blueprint.
-   **`delete_blueprint`**: Delete a blueprint from Port.

### Entity tools

-   **`get_entities`**: Retrieve all entities for a given blueprint.
-   **`get_entity`**: Retrieve information about a specific entity.
-   **`create_entity`**: Create a new entity for a specific blueprint.
-   **`update_entity`**: Update an existing entity.
-   **`delete_entity`**: Delete an entity.

### Scorecard tools

-   **`get_scorecards`**: Retrieve all scorecards from Port.
-   **`get_scorecard`**: Retrieve information about a specific scorecard by its identifier.
-   **`create_scorecard`**: Create a new scorecard for a specific blueprint.
-   **`update_scorecard`**: Update an existing scorecard.
-   **`delete_scorecard`**: Delete a scorecard from Port.

### Action tools

-   **`run_<action_identifier>`**: This is a dynamic tool that allows you to execute any action you have in Port. The `action_identifier` corresponds to the identifier of the action you want to run. This tool is only available for actions that you have permission to execute (excluding actions with dynamic policies). For example, if you have an action with the identifier `scaffold_microservice`, you can run it using `run_scaffold_microservice`.

### AI agent tools

-   **`invoke_ai_agent`**: Invoke a Port AI agent with a specific prompt.
