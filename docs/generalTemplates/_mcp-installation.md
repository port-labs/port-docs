import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

## Installing Port MCP

Installing Port's MCP is simple. Follow the instructions for your preferred tool, or learn about the archived local MCP server.

<Tabs groupId="mcp-setup" queryString>
<TabItem value="cursor" label="Cursor">
To connect Cursor to Port's remote MCP, follow these steps:

1. **Open Cursor settings**

   Go to Cursor settings, click on **Tools & Integrations**, and add a new MCP server.

   <img src="/img/ai-agents/MCPInstallCursorStep1.png" border="1px" width="100%" />

2. **Configure the MCP server**

   Add the appropriate configuration for your Port region:

<Tabs groupId="region" queryString>
<TabItem value="eu" label="EU">

```json showLineNumbers
{
  "mcpServers": {
    "port-eu": {
      "url": "https://mcp.port.io/v1",
      "headers": {
        "x-read-only-mode": "0"
      }
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
      "url": "https://mcp.us.port.io/v1",
      "headers": {
        "x-read-only-mode": "0"
      }
    }
  }
}
```

</TabItem>
</Tabs>

   :::tip Read-only mode
   The `x-read-only-mode` header defaults to `0`, which allows all tools based on your permissions. You can change it to `1` to restrict the MCP server to only expose read-only tools. When set to `1`, write tools are completely hidden from the available tools list, ensuring you can only query data without making modifications.
   :::

   <img src="/img/ai-agents/MCPInstallCursorStep2.png" border="1px" width="100%" />

3. **Authenticate with Port**

   Click on **"Needs login"** and complete the authentication flow in the window that opens.

   <img src="/img/ai-agents/MCPInstallCursorStep3.png" border="1px" width="100%" />

4. **Verify connection**

   After successful authentication, you'll see the list of available tools from the MCP server.

   <img src="/img/ai-agents/MCPInstallCursorStep4.png" border="1px" width="100%" />

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

<Tabs groupId="region" queryString>
<TabItem value="eu" label="EU">

```json showLineNumbers
{
  "mcpServers": {
    "port-vscode-eu": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://mcp.port.io/v1",
        "--header",
        "x-read-only-mode: 0"
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
        "https://mcp.us.port.io/v1",
        "--header",
        "x-read-only-mode: 0"
      ]
    }
  }
}
```

</TabItem>
</Tabs>

:::tip WSL Users
If you are running VS Code on Windows with WSL, you may need to explicitly specify `wsl` as the command and provide the full path to `npx` (run `which npx` in your WSL terminal to find the path). For example:

```json showLineNumbers
{
  "mcpServers": {
    "port-vscode": {
      "command": "wsl",
      "args": [
        "/usr/bin/npx",
        "-y",
        "mcp-remote",
        "https://mcp.port.io/v1",
        "--header",
        "x-read-only-mode: 0"
      ]
    }
  }
}
```
Make sure to replace the URL with `https://mcp.us.port.io/v1` if you are in the US region.
:::

   :::tip Read-only mode
   The `x-read-only-mode` header defaults to `0`, which allows all tools based on your permissions. You can change it to `1` to restrict the MCP server to only expose read-only tools. When set to `1`, write tools are completely hidden from the available tools list, ensuring you can only query data without making modifications.
   :::

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

<img src="/img/ai-agents/MCPVSCodeSetup.gif" border="1px" width="100%" />

</TabItem>
<TabItem value="claude" label="Claude">
To connect Claude to Port's remote MCP, you need to create a custom connector. This process does not require a client ID. For detailed instructions, refer to the [official Anthropic documentation on custom connectors](https://support.anthropic.com/en/articles/11175166-getting-started-with-custom-connectors-using-remote-mcp).

When prompted for the remote MCP server URL, use the appropriate URL for your region:

<Tabs groupId="region" queryString>
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

:::tip Read-only mode
The `x-read-only-mode` header defaults to `0`, which allows all tools based on your permissions. When configuring your custom connector, you can change it to `1` to restrict the MCP server to only expose read-only tools. When set to `1`, write tools are completely hidden from the available tools list, ensuring you can only query data without making modifications. Refer to the Claude custom connector documentation for details on how to add custom headers.
:::

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

