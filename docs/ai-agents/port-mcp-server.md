---
sidebar_position: 4
title: Port MCP Server
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Port MCP server


The Port Model Context Protocol (MCP) Server acts as a bridge, enabling Large Language Models (LLMs)—like those powering Claude, Cursor, or GitHub Copilot—to interact directly with your Port.io developer portal. This allows you to leverage natural language to query your software catalog, analyze service health, manage resources, and even streamline development workflows, all from your preferred interfaces.

:::info Standalone Value
The Port MCP Server provides significant value on its own, even if you are not using the [Port AI Agents feature](/ai-agents/overview). You can configure it directly with your LLM-powered tools (e.g., in your IDE via Cursor or VS Code, or with Claude Desktop) to unlock powerful interactions with your Port instance. Access to the Port AI Agents feature is not required to use the MCP Server.
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

Setting up the Port MCP Server involves a few key steps.

### Prerequisites

*   A Port.io account with appropriate permissions.
*   Your Port credentials (Client ID and Client Secret). You can create these from your Port.io dashboard under Settings > Credentials.

### Installation

The Port MCP Server can be installed using Docker or `uvx` (a package manager for Python). While the setup is straightforward, the specifics can vary based on your chosen MCP client (Claude, Cursor, VS Code, etc.).

:::info Detailed Installation Guide
For comprehensive, step-by-step installation instructions for various platforms and methods (Docker, UVX), please refer to the **[Port MCP Server GitHub README](https://github.com/port-labs/port-mcp-server)**.
The README provides the latest configuration details and examples for different setups.
:::