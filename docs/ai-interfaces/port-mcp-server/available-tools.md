---
sidebar_position: 3
title: Tools
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import ToolsList from "@site/src/components/ToolsList"

# Available tools

The Port MCP Server exposes different sets of tools based on your role and use case. The tools you see will depend on your permissions in Port.

<Tabs groupId="user-role" queryString>
<TabItem value="developer" label="Developer">

**Developers** are typically users who consume and interact with the developer portal - querying services, running actions, and analyzing data. These tools help you get information and execute approved workflows.

<ToolsList role="developer" />

</TabItem>
<TabItem value="builder" label="Builder">

**Builders** are platform engineers or admins who design and configure the developer portal - creating blueprints, setting up scorecards, and managing the overall structure. These tools help you build and maintain the portal.

Builders have access to all the tools available to Developers, plus additional management tools for creating and configuring the portal.

<ToolsList role="builder" />

</TabItem>
</Tabs>

:::info Client Support
Tool support in external MCP clients depends on whether the client implements the tools feature according to the [MCP specification](https://modelcontextprotocol.info/docs/clients/). Most MCP clients support tools. Check the [MCP client documentation](https://modelcontextprotocol.info/docs/clients/) to see which features your client supports.
:::

## Select which tools to use

By default, when you open a chat with Port MCP, all available tools (based on your permissions) are loaded and ready to use. However, you can customize which tools are available if you want to focus on specific workflows.

For example, if you only want to query data from Port without building or modifying anything, you can limit the tools to just the read-only ones. This helps reduce complexity and ensures you don't accidentally make changes.

:::tip Read-only mode header
The `x-read-only-mode` header defaults to `0`, which allows all tools based on your permissions. You can change it to `1` when configuring your MCP server connection to automatically restrict to read-only tools. When set to `1`, write tools are completely hidden from the available tools list. See the [installation guide](/ai-interfaces/port-mcp-server/overview-and-installation#installing-port-mcp) for details on how to configure this header.
:::

:::tip Control which actions are available
The `x-allowed-actions-to-run` header allows you to control which actions are available through the `run_action` tool. This header accepts a comma-separated list of action identifiers. Only the specified actions will be available.

For example:
- `x-allowed-actions-to-run: "create_github_issue,create_incident"` - Allows only the specified GitHub and incident actions.
- `x-allowed-actions-to-run: "create_service,deploy_to_production"` - Allows only the specified deployment actions.
- `x-allowed-actions-to-run: ""` - No actions will be allowed to run (empty string disables all actions).

If the header is not specified, all actions you have permission to run will be available. This provides granular control over which actions can be executed through the MCP server, helping you restrict access to specific workflows or integrations. See the [MCP server headers](/ai-interfaces/port-mcp-server/overview-and-installation#mcp-server-headers) section for details on all available headers.
:::

<Tabs groupId="tool-selection" queryString>
<TabItem value="cursor" label="Cursor">

In Cursor, you can customize which tools are available through the UI after connecting to Port MCP. Once connected, you can select specific tools as shown below.

![Enabling specific tools in Cursor](/img/ai-agents/MCPCursorEnableTools.png)

</TabItem>
<TabItem value="vscode" label="VSCode">

In VSCode, you can choose the tools through the UI after connecting to Port MCP.

![Enabling specific tools in VSCode](/img/ai-agents/MCPVSCodeEnableTools.png)

</TabItem>
<TabItem value="claude" label="Claude">

When creating a custom connector in Claude, you can specify exactly which tools to expose instead of enabling everything.

![Enabling specific tools in Claude](/img/ai-agents/MCPClaudeEnableTools.png)

Refer to the [Claude custom connector documentation](https://support.anthropic.com/en/articles/11175166-getting-started-with-custom-connectors-using-remote-mcp) for detailed instructions.

</TabItem>
</Tabs>
