---
sidebar_position: 1
title: Overview & Installation
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import MCPInstallation from '/docs/generalTemplates/_mcp-installation.md'

# Port MCP server

<center>
<div className="video-container">
  <iframe 
    style={{borderRadius:'4px'}}
    width="568"
    height="320"
    src="https://www.youtube.com/embed/WrVgQ-whBiE" 
    title="YouTube video player" 
    frameborder="0" 
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
    allowfullscreen>
  </iframe>
</div>
</center>
<br/>

The Port Model Context Protocol (MCP) Server acts as a bridge, enabling Large Language Models (LLMs)—like those powering Claude, Cursor, or GitHub Copilot—to interact directly with your Port.io developer portal. This allows you to leverage natural language to query your software catalog, analyze service health, manage resources, and even streamline development workflows, all from your preferred interfaces.

:::info AI Agents vs. MCP Server
The Port MCP Server is currently in open beta and provides significant standalone value, independent of our [AI Agents feature](/ai-interfaces/ai-agents/overview). Both the MCP Server and AI Agents are in open beta and available to all users. The MCP Server gives you immediate access to streamline building in Port, query your catalog, analyze service health, and streamline development workflows using natural language.

While the MCP Server can interact with Port AI Agents when available, the core MCP functionality can be used freely on its own.
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

<center>
<div className="video-container">
  <iframe 
    style={{borderRadius:'4px'}}
    width="568"
    height="320"
    src="https://www.youtube.com/embed/hxUTTPSApQs" 
    title="YouTube video player" 
    frameborder="0" 
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
    allowfullscreen>
  </iframe>
</div>
</center>

The Port MCP Server enables you to interact with your Port data and capabilities directly through natural language within your chosen LLM-powered tools. Here's what you can achieve:

### Find information quickly

Effortlessly query your software catalog and get immediate answers. This eliminates the need to navigate through UIs or write complex API queries when you need information.

*   Ask: "Who is the owner of service X?"
*   Ask: "How many services do we have in production?"
*   Ask: "Show me all the microservices owned by the Backend team."
*   Ask: "What are the dependencies of the 'OrderProcessing' service?"

<img src="/img/ai-agents/MCPCopilotAskServices.png" width="100%" border="1px" />

### Vibe-build in Port

Leverage Claude's capabilities to manage and build your entire Port software catalog. You can create and configure blueprints, set up self-service actions, design scorecards, and more.

*   Ask: "Please help me apply this guide into my Port instance - [[guide URL]]"
*   Ask: "I want to start managing my k8s deployments, how can we build it in Port?"
*   Ask: "I want a new production readiness scorecard to track the code quality and service alerts"
*   Ask: "Create a new self-service action in Port to scaffold a new service"

<img src="/img/ai-agents/MCPClaudeBuildSSA.png" width="100%" border="1px" />

### Analyze scorecards and quality

Gain insights into service health, compliance, and quality by leveraging Port's scorecard data. Identify areas for improvement and track progress against your standards.

*   Ask: "Which services are failing our security requirements scorecard?"
*   Ask: "What's preventing the 'InventoryService' from reaching Gold level in the 'Production Readiness' scorecard?"
*   Ask: "Show me the bug count vs. test coverage for all Java microservices."

<img src="/img/ai-agents/MCPClaudeInsightsBugs.png" width="100%" border="1px" />

*   Ask: "Which of our services are missing critical monitoring dashboards?"

<img src="/img/ai-agents/MCPClaudeMonitoringServices.png" width="100%" border="1px" />

### Streamline development and operations

Receive assistance with common development and operational tasks, directly within your workflow.

*   Ask: "What do I need to do to set up a new 'ReportingService'?"
*   Ask: "Guide me through creating a new component blueprint with 'name', 'description', and 'owner' properties."
*   Ask: "Help me add a rule to the 'Tier1Services' scorecard that requires an on-call schedule to be defined."

<img src="/img/ai-agents/MCPClaudeServiceSetup.png" width="100%" border="1px" />

### Find your own use cases

You can use Port's MCP to find the use cases that will be valuable to you. Try using this prompt: "think of creative prompts I can use to showcase the power of Port's MCP, based on the data available in Port"

<MCPInstallation />

## Connect the server to multiple organizations

Port uses your browser's OAuth session to approve MCP connections. When your MCP client opens the authentication prompt, you approve access in the organization where you are currently logged in. Follow these steps to connect to the correct organization:

- Make sure you are logged in to the desired organization in your browser before you start the MCP connection flow.
- Approve the OAuth prompt from your MCP client while you remain logged in to that organization.
- Continue using the MCP client; changing your browser session afterward does not change the connected organization.

To connect another organization from the same MCP client, add a second configuration and repeat the flow while logged in to the other organization. Each configuration keeps its own OAuth approval, so you can work with multiple organizations in parallel.

## Token-based authentication

You can also connect using token-based authentication for automated environments like CI/CD pipelines where interactive authentication isn't possible:

```bash showLineNumbers
curl -X POST "https://api.getport.io/v1/auth/access_token" \
  -H "Content-Type: application/json" \
  -d '{"clientId":"YOUR_CLIENT_ID","clientSecret":"YOUR_CLIENT_SECRET"}'
```

For complete examples and detailed setup instructions, see our [token-based authentication guide](/ai-interfaces/port-mcp-server/token-based-authentication).

## Connecting to AI Agents

To connect the Port MCP server to AI agents in CI/CD environments or other automated contexts where interactive authentication isn't possible, see our [token-based authentication](/ai-interfaces/port-mcp-server/token-based-authentication).

## FAQ

<details>
<summary><b>Can I change the organization after connecting? (Click to expand)</b></summary>

You cannot move an existing MCP connection. Update the configuration for your MCP client and reconnect while you are logged in to the organization you want to use.

</details>

<details>
<summary><b>How does the remote MCP server work with multiple organizations? (Click to expand)</b></summary>

Each organization requires a separate connection. Create separate MCP configurations and start each one while you are logged in to the desired organization in your browser. Each configuration keeps its own connection.

</details>

<details>
<summary><b>Do I need to stay logged in to the same browser session? (Click to expand)</b></summary>

You do not need to keep the browser logged in after approval. Your MCP client stays connected to the organization you authorized.

</details>

<details>
<summary><b>What happens if I approve the OAuth prompt in the wrong organization? (Click to expand)</b></summary>

Disconnect the MCP client or remove its credentials, then reconnect while logged in to the correct organization in your browser so you grant access to the right workspace.

</details>

<details>
<summary><b>How do I connect without using my browser for approval? (Click to expand)</b></summary>

Use token-based authentication when you are in CI/CD or another non-interactive environment. Generate a token with your client credentials and configure the MCP client with that token instead of signing in through the browser.

</details>
