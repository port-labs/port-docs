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

### Vibe-build in Port

Leverage Claude's capabilities to manage and build your entire Port software catalog. You can create and configure blueprints, set up self-service actions, design scorecards, and more.

*   Ask: "Please help me apply this guide into my Port instance - [[guide URL]]"
*   Ask: "I want to start managing my k8s deployments, how can we build it in Port?"
*   Ask: "I want a new production readiness scorecard to track the code quality and service alerts"
*   Ask: "Create a new self-service action in Port to scaffold a new service"

![Claude building a self-service action](/img/ai-agents/MCPClaudeBuildSSA.png)

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
*   Ask: "Guide me through creating a new component blueprint with 'name', 'description', and 'owner' properties."
*   Ask: "Help me add a rule to the 'Tier1Services' scorecard that requires an on-call schedule to be defined."

![Getting instructions for new service setup](/img/ai-agents/MCPClaudeServiceSetup.png)

## Using Port MCP

### Setup

Setting up Port's MCP is simple. Follow the instructions for your preferred tool, or learn about the archived local MCP server.

<Tabs groupId="mcp-setup" queryString>
<TabItem value="cursor" label="Cursor">
To connect Cursor to Port's remote MCP, follow these steps:

1. **Go to Cursor settings, click on Tools & Integrations, and add a new MCP server**

![Go to Cursor Settings](/img/ai-agents/MCPInstallCursorStep1.png)

2. **Add the above configuration**

Use the appropriate configuration for your region:

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

![Add configuration](/img/ai-agents/MCPInstallCursorStep2.png)

3. **Login to Port**
Click on "Needs login", and complete the authentication flow in the window that opens up.
![Login to Port](/img/ai-agents/MCPInstallCursorStep3.png)

4. **See the MCP tools**
After successfully connecting to Port, you'll see the list of available tools from the MCP.
![See tools](/img/ai-agents/MCPInstallCursorStep4.png)


</TabItem>
<TabItem value="vscode" label="VSCode">
To connect VSCode to Port's remote MCP server, follow these detailed steps. For complete instructions, refer to the [official VS Code MCP documentation](https://code.visualstudio.com/docs/copilot/chat/mcp-servers).

:::info VSCode MCP requirements
Before proceeding, ensure your VS Code is updated to the latest version and that MCP is enabled for your GitHub organization. You may need to enable "Editor preview features" under Settings > Code, planning, and automation > Copilot via admin access from your organization.
:::

:::tip Prerequisites
This configuration uses the open-source `mcp-remote` package, which requires Node.js to be installed on your system. Before using the configuration, ensure Node.js is available by running:

```bash
npx -y mcp-remote --help
```

If you encounter errors:
- **Missing Node.js**: Install Node.js from [nodejs.org](https://nodejs.org/)
- **Network issues**: Check your internet connection and proxy settings
- **Permission issues**: You may need to run with appropriate permissions
:::


**Step 1: Configure MCP Server Settings**

1. Open VS Code settings
2. Search for "MCP: Open user configuration" (or follow the instructions on a workspace installation)
3. Add the server configuration using the appropriate configuration for your region:

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

**Step 2: Start the MCP Server**

1. After adding the configuration, click on "Start" to initialize the MCP server
2. If you don't see the "Start" button, ensure:
   - Your VS Code version is updated to the latest version
   - MCP is enabled for your GitHub organization
   - "Editor preview features" is enabled under Settings > Code, planning, and automation > Copilot

**Step 3: Verify Connection**

1. Once started, you should see the number of available tools displayed
2. If you don't see the tools count:
   - Click on "More" to expand additional options
   - Select "Show output" to view detailed logs
   - Check the output panel for any error messages or connection issues

**Step 4: Access Port Tools**

1. Start a new chat session in VS Code
2. Click on the tools icon in the chat interface
3. You should now see Port tools available for use

![VS Code MCP Setup](/img/ai-agents/MCPVSCodeSetup.gif)

</TabItem>
<TabItem value="claude" label="Claude">
To connect Claude to Port's remote MCP, you need to create a custom connector. This process does not require a client ID. For detailed instructions, refer to the [official Anthropic documentation on custom connectors](https://support.anthropic.com/en/articles/11175166-getting-started-with-custom-connectors-using-remote-mcp).

:::info Connection Stability
While Port MCP is in open beta, you may occasionally experience connection issues. We're actively working to improve reliability and stability. If you encounter problems, try reconnecting or restarting your MCP client.
:::

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
<TabItem value="local-mcp" label="Local MCP - Deprecated">
The local MCP server is an open-source project that you can run on your own infrastructure. It offers a similar set of capabilities, but requires manual setup and maintenance.
	
While you can use it, we are no longer supporting it and are not tracking the project issues and activities.

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

### Available tools

The Port MCP Server exposes different sets of tools based on your role and use case. The tools you see will depend on your permissions in Port.

<Tabs groupId="user-role" queryString>
<TabItem value="developer" label="Developer">

**Developers** are typically users who consume and interact with the developer portal - querying services, running actions, and analyzing data. These tools help you get information and execute approved workflows.

**Query and analysis tools**
-   **[`get_blueprints`](/api-reference/get-all-blueprints)**: Retrieve a list of all blueprints from Port.
-   **[`get_blueprint`](/api-reference/get-a-blueprint)**: Retrieve information about a specific blueprint by its identifier.
-   **[`get_entities`](/api-reference/get-all-entities-of-a-blueprint)**: Retrieve all entities for a given blueprint.
-   **[`get_entity`](/api-reference/get-an-entity)**: Retrieve information about a specific entity.
-   **[`get_scorecards`](/api-reference/get-all-scorecards)**: Retrieve all scorecards from Port.
-   **[`get_scorecard`](/api-reference/get-a-scorecard)**: Retrieve information about a specific scorecard by its identifier.
-   **[`describe_organization`](/api-reference/get-organization-details)**: Get information about your Port organization and its configuration.
-   **`search_docs_sources`**: Search through Port documentation and knowledge sources for relevant information.
-   **`ask_docs_question`**: Ask questions about Port documentation and get contextual answers.

**Action execution tools**
-   **[`run_<action_identifier>`](/api-reference/execute-a-self-service-action)**: Execute any action you have permission to run in Port. The `action_identifier` corresponds to the identifier of the action you want to run. For example, if you have an action with the identifier `scaffold_microservice`, you can run it using `run_scaffold_microservice`.

**AI agent tools**
-   **[`invoke_ai_agent`](/api-reference/invoke-an-agent)**: Invoke a Port AI agent with a specific prompt.

</TabItem>
<TabItem value="builder" label="Builder">

**Builders** are typically platform engineers or admins who design and configure the developer portal - creating blueprints, setting up scorecards, and managing the overall structure. These tools help you build and maintain the portal.

**All Developer tools**
Builders have access to all the tools available to Developers (listed in the Developer tab), plus the additional management tools below.

**Blueprint management tools**
-   **[`create_blueprint`](/api-reference/create-a-blueprint)**: Create a new blueprint in Port.
-   **[`update_blueprint`](/api-reference/update-a-blueprint)**: Update an existing blueprint.
-   **[`delete_blueprint`](/api-reference/delete-a-blueprint)**: Delete a blueprint from Port.

**Entity management tools**
-   **[`create_entity`](/api-reference/create-an-entity)**: Create a new entity for a specific blueprint.
-   **[`update_entity`](/api-reference/update-an-entity)**: Update an existing entity.
-   **[`delete_entity`](/api-reference/delete-an-entity)**: Delete an entity.

**Scorecard management tools**
-   **[`create_scorecard`](/api-reference/create-a-scorecard)**: Create a new scorecard for a specific blueprint.
-   **[`update_scorecard`](/api-reference/change-scorecards)**: Update an existing scorecard.
-   **[`delete_scorecard`](/api-reference/delete-a-scorecard)**: Delete a scorecard from Port.

</TabItem>
</Tabs>

### Select which tools to use

By default, when you open a chat with Port MCP, all available tools (based on your permissions) are loaded and ready to use. However, you can customize which tools are available if you want to focus on specific workflows.

For example, if you only want to query data from Port without building or modifying anything, you can limit the tools to just the read-only ones. This can help reduce complexity and ensure you don't accidentally make changes.

<Tabs groupId="tool-selection" queryString>
<TabItem value="cursor" label="Cursor">

In Cursor, you can customize which tools are available through the UI after connecting to Port MCP. Once connected, you can select specific tools through Cursor's interface as shown below.

![Enabling specific tools in Cursor](/img/ai-agents/MCPCursorEnableTools.png)

</TabItem>
<TabItem value="vscode" label="VSCode">

In VSCode, you can customize which tools are available through the UI after connecting to Port MCP. Once connected, you can select specific tools through VSCode's interface as shown below.

![Enabling specific tools in VSCode](/img/ai-agents/MCPVSCodeEnableTools.png)

</TabItem>
<TabItem value="claude" label="Claude">

In Claude, you can specify which tools to enable during the custom connector setup process. You'll have the option to select specific tools through Claude's interface rather than enabling all available tools.

![Enabling specific tools in Claude](/img/ai-agents/MCPClaudeEnableTools.png)

Refer to the [Claude custom connector documentation](https://support.anthropic.com/en/articles/11175166-getting-started-with-custom-connectors-using-remote-mcp) for detailed instructions on tool selection during setup.

</TabItem>
</Tabs>

## Troubleshooting

If you encounter issues while setting up or using the Port MCP Server, expand the relevant section below:

<details>
<summary>How can I connect to the MCP? (Click to expand)</summary>

Refer back to the [setup instructions](/ai-agents/port-mcp-server#setup) for your specific application (Cursor, VSCode, or Claude). Make sure you're using the correct regional URL for your Port organization.

</details>

<details>
<summary>I completed the connection but nothing happens (Click to expand)</summary>

Check that you've followed all the [setup steps](/ai-agents/port-mcp-server#setup) correctly for your application. Ensure you're authenticated with Port and have the necessary permissions. If you've followed all the steps and still have issues, please reach out to our support team.

</details>

<details>
<summary>How can I use the MCP server? (Click to expand)</summary>

Once connected, you can interact with Port through natural language in your application's chat interface. Ask questions about your software catalog, request help with building Port resources, or analyze your data. The [available tools](/ai-agents/port-mcp-server#available-tools) depend on your permissions (Developer vs Builder role).

</details>

:::tip Getting Help
If you continue to experience issues, please reach out to Port support with:
- Your IDE/application version
- The specific error messages you're seeing
- Your Port region (EU/US)
- Steps you've already tried

This information will help us provide more targeted assistance.
:::
