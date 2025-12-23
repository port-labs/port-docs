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
