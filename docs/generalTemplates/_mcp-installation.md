## Installing Port MCP

Installing Port's MCP is simple. Follow the instructions for your preferred tool, or learn about the archived local MCP server.

<Tabs groupId="mcp-setup" queryString>
<TabItem value="cursor" label="Cursor">
To connect Cursor to Port's remote MCP, follow these steps:

1. **Open Cursor settings**

   Go to Cursor settings, click on **Tools & Integrations**, and add a new MCP server.

   ![Go to Cursor Settings](/img/ai-agents/MCPInstallCursorStep1.png)

2. **Configure the MCP server**

   Add the appropriate configuration for your Port region:

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

3. **Authenticate with Port**

   Click on **"Needs login"** and complete the authentication flow in the window that opens.

   ![Login to Port](/img/ai-agents/MCPInstallCursorStep3.png)

4. **Verify connection**

   After successful authentication, you'll see the list of available tools from the MCP server.

   ![See tools](/img/ai-agents/MCPInstallCursorStep4.png)

:::warning Authentication window behavior
In some cases, after clicking "Accept" in the authentication popup, the window won't get closed but the connection is established successfully. You can safely close the window.

If you still don't see the tool, try it a couple of times. We are aware of this behavior and working to improve it.
:::

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

:::warning VSCode action tool issue
In some versions of VS Code, the MCP server might not start or return an error in the chat because of a configuration issue with the action related tools. To deal with it, [deselect](./available-tools#select-which-tools-to-use)  the tools `create_action`, `update_action`, and `delete_action`.
This is relevant for cases where you see an error like this one:
```
Failed to validate tool mcp_port_create_action: Error: tool parameters array type must have items. Please open a Github issue for the MCP server or extension which provides this tool
```
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
<TabItem value="local-mcp" label="Local MCP">
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

