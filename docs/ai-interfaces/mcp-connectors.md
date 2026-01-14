---
sidebar_position: 7
title: MCP connectors
---

# MCP connectors

import BetaFeatureNotice from '/docs/generalTemplates/_beta_feature_notice.md'

<BetaFeatureNotice id="ai-form" />

MCP Connectors turn Port into a unified MCP gateway, routing requests from developers and AI agents to external MCP servers while applying Port's governance, RBAC, and audit controls. Platform engineers configure which MCP servers are available and which tools are exposed. Developers and AI agents access everything through a single interface.

## Why MCP connectors?

Organizations building AI agents need access to tools beyond Port's native integrations. For example, internal documentation, custom systems, third-party platforms. Without MCP Connectors, teams either run parallel MCP systems (creating confusion) or build their own gateway infrastructure (recreating governance from scratch).

MCP Connectors solve three critical challenges:

- **Unified developer experience**: Connect once to Port's MCP gateway instead of managing multiple separate integrations. Developers access Port's native tools and all approved external MCPs through one interface.

- **Governance and control**: Platform engineers choose which MCPs are approved, which tools are exposed, and who can access them. Complete audit trails and RBAC enforcement apply to all tool invocations.

- **Better AI accuracy**: Port AI uses the [Context Lake](/ai-interfaces/context-lake) for modeled organizational data and MCP Connectors for real-time external data you wouldn't model (technical docs, logs, tickets). Structured context combined with just-in-time data leads to better AI decisions.

## Setting up MCP connectors

Admins configure which MCP connectors are available organization-wide and control which tools each connector exposes.

### Prerequisites

- Admin role in Port.
- Account credentials for the external tool you want to connect.

### Add a connector

1. Go to the [data sources](https://app.getport.io/settings/data-sources) page of your portal.
2. Click on the `+ Data source` in the top-right corner.
3. Select the **MCP Servers** tab.
4. Choose from the available MCP servers (Notion, Linear, Slack, GitLab, Jira) or select **Custom Server** to add your own.
5. Fill in the connector details:
   - **Name**: A display name for this connector.
   - **Instructions**: Guidance for when the AI should use this connector.
   - **URL**: The MCP server URL (for custom servers).
6. Click **Connect** and complete the OAuth authentication flow.
7. Under **Allowed Tools**, select which tools to expose to your organization using `+ Add Tool`. Only the tools you add will be visible to users.
8. Test the connector using the AI agent playground on the right side of the modal.
9. Click `Publish` to make the connector available to users.

{/* TODO: Clarify what the "Instructions" field is used for - is this organization context for AI routing? */}
{/* TODO: Clarify if admins can remove default tools or only add from available tools */}

:::caution Destructive actions
Consider carefully before enabling write or delete capabilities. Users and AI agents will be able to perform these actions based on their permissions in the external tool. All actions are logged in Port's audit trail.
:::

## Authenticate to connectors

Once your admin has configured MCP connectors, you need to authenticate your personal account to use them.

{/* TODO: Confirm if the MCP Servers menu under avatar is available to both admins and regular users */}

### From the MCP Servers menu

1. Click your **avatar** in the top-right corner of Port.
2. Select **MCP Servers**.
3. In the modal, select the **External MCP servers** tab.
4. You will see the MCP servers your admin has made available.
5. Click on one and complete the OAuth authentication flow.
6. The MCP server is now available in all Port AI interfaces.

### From Port AI chat

1. Open the Port AI chat interface.
2. Click the **+** button to see available MCP servers.
3. Under **Need to Connect**, you will see servers that require authentication.
4. Click on one to initiate authentication.
5. Complete the OAuth flow.
6. After authenticating, the server appears under **Connectors** with the number of enabled tools (e.g., "9 of 10").

### Manage your tools

After authenticating, you can toggle which tools are active for your account:

1. In the Port AI chat, click the **+** button.
2. Under **Connectors**, click the arrow next to an authenticated server.
3. Toggle individual tools on or off based on your needs.

You can only toggle tools that your admin has enabled. Tools not added by the admin will not appear.

### From your IDE

When using MCP clients (Cursor, Claude Desktop, VS Code):

1. Connect your IDE to Port's MCP server (see [Port MCP Server setup](/ai-interfaces/port-mcp-server/overview-and-installation)).
2. When you invoke a tool you haven't authenticated to, Port returns the OAuth URL.
3. Your IDE displays a prompt to authenticate.
4. Complete the OAuth flow in your browser.
5. Restart your MCP client.
6. All authenticated tools now appear alongside Port's native tools.

:::info One-time setup
You typically authenticate once per MCP server. Port handles token refresh automatically where supported by the OAuth provider. If a token expires and can't be refreshed, you will be prompted to re-authenticate.
:::

## Using MCP connectors

After authenticating, you can use natural language to interact with external tools through any Port AI interface.

**Example queries:**

- "Search Notion for our API authentication documentation"
- "Find the deployment runbook in Confluence"
- "Show me open Jira tickets for the payments service"
- "What alerts fired in the last hour?"

MCP connector tools are also available to [AI Agents](/ai-interfaces/ai-agents/overview) for automated workflows.

## Security and permissions

- **Per-user authentication**: Each user authenticates with their own account. Data access respects individual permissions in the external tool.
- **RBAC enforcement**: Port's role-based access controls apply to all MCP connector access.
- **Audit logging**: All tool invocations are logged as part of [AI invocations](/ai-interfaces/port-ai/overview#ai-invocations).

For more details, see [AI Security and Data Controls](/ai-interfaces/port-ai/security-and-data-controls).

## FAQs

<details>
<summary><b>Who can add MCP connectors?</b></summary>

Only admins can add and configure MCP connectors. Regular users can only authenticate to the MCP servers that admins have made available.

</details>

<details>
<summary><b>Why don't I see any connectors available?</b></summary>

Your organization admin needs to add connectors first. Contact your platform team to request the tools you need.

</details>

<details>
<summary><b>What happens if my authentication expires?</b></summary>

Port automatically refreshes OAuth tokens where supported. If refresh fails or isn't available, you will be prompted to re-authenticate.

</details>

