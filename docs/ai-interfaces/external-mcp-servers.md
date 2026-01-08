---
sidebar_position: 7
title: External MCP servers
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# External MCP servers

import BetaFeatureNotice from '/docs/generalTemplates/_beta_feature_notice.md'

<BetaFeatureNotice id="ai-form" />

External MCP (Model Context Protocol) servers extend Port AI's capabilities by connecting tools like Notion, Atlassian, and others to your developer portal. Once configured, your team can interact with these tools directly through Port AI using natural language.

:::tip Understanding Port's MCP features
Port has two MCP-related features that work in opposite directions:

| Feature | Direction | Purpose |
|---------|-----------|---------|
| **[Port MCP Server](/ai-interfaces/port-mcp-server/overview-and-installation)** | Port → External | Lets IDEs and AI agents (Cursor, Claude) access Port |
| **External MCP servers** | External → Port | Lets Port AI access external tools (Notion, Atlassian) |

Together, they create a bidirectional bridge between Port and your AI ecosystem.
:::

## Why connect external tools to Port AI?

When you connect tools like Notion or Atlassian to Port AI:

- **Unified access**: Query documentation, wikis, and knowledge bases without switching tabs.
- **Contextual answers**: Port AI combines your software catalog context with external documentation for more relevant responses.
- **Reduced friction**: Developers stay in Port while accessing information from across your toolchain.

**Example queries after connecting external tools:**
- "Search in Notion for our API documentation"
- "Find Confluence pages about deployment procedures"
- "What did the team document about the new authentication flow?"

## How it works

External MCP servers follow a two-step setup process:

1. **Admin setup**: Organization admins add MCP servers and configure which capabilities are available to users.
2. **User connection**: Each user connects their own account to use the enabled tools through Port AI.

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  External Tool  │     │   MCP Server    │     │    Port AI      │
│  (Notion, etc.) │◄───►│   Connection    │◄───►│                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                              ▲
                              │
                    ┌─────────┴─────────┐
                    │  User's account   │
                    │  authentication   │
                    └───────────────────┘
```

## Setting up external MCP servers (admins)

Organization admins configure which external MCP servers are available to users and control what actions can be performed.

### Prerequisites

- Admin role in Port.
- Account credentials for the external tool you want to connect.

### Add an MCP server

1. Navigate to **Builder** in the Portal.
2. Go to the **Data Sources** section.
3. Find the **MCP Servers** area and click **+ Add MCP Server**.
4. Select the tool you want to connect (Notion, Atlassian, etc.).
5. Follow the authentication flow to connect the tool.

### Configure global scoping

Global scoping lets you control which capabilities from each MCP server are available to your organization. This is useful for limiting potentially destructive actions.

After adding an MCP server:

1. Click **Edit** on the MCP server you want to configure.
2. Under **Global Scoping**, review the available tools/methods.
3. Enable or disable specific capabilities based on your organization's needs.
4. Click **Save** to apply the configuration.

**Example configuration:**

| Capability | Recommended | Notes |
|------------|-------------|-------|
| Search | ✅ Enable | Low risk, high value |
| Read/Get | ✅ Enable | Low risk, high value |
| Create | ⚠️ Consider | Evaluate based on use case |
| Update | ⚠️ Consider | Evaluate based on use case |
| Delete | ❌ Disable | High risk, enable with caution |

:::caution Destructive actions
Consider carefully before enabling write or delete capabilities. Users will be able to perform these actions through Port AI based on their permissions in the external tool.
:::

### Communicate to users

After adding MCP servers, inform your team that new tools are available. Remember that users still need to connect their own accounts before they can use these tools.

## Connecting to MCP servers (users)

Once your admin has added MCP servers to your organization, you can connect your personal accounts to use them with Port AI.

### Connect your account

1. Click the **⋯** menu in the top-right corner of Port.
2. Select **MCP Servers**.
3. You'll see a list of available servers (configured by your admin).
4. Click **Connect** next to the server you want to use.
5. Follow the authentication flow to connect your account.

:::info One-time setup
You typically only need to connect once. Your connection remains active until you disconnect or your session expires.
:::

### Use connected tools with Port AI

After connecting, you can use natural language to interact with your connected tools through any Port AI interface:

**In Port AI Assistant:**
- "Search in Notion for onboarding documentation"
- "Find our team's API guidelines in Confluence"
- "What does our wiki say about the deployment process?"

**With AI Agents:**
Connected tools are also available to AI Agents, enabling automated workflows that span across your toolchain.

### Manage your connections

**View your connected servers:**
1. Click the **⋯** menu → **MCP Servers**.
2. See all available servers and your connection status.

**Disconnect from a server:**
1. Click the **⋯** menu → **MCP Servers**.
2. Click **Disconnect** next to the server you want to remove.

## Available MCP servers

Port supports connecting to various external MCP servers. The availability of specific servers may vary based on your organization's configuration.

:::info Expanding support
We're continuously adding support for more MCP servers. If you need a specific integration, contact [Port support](https://www.getport.io/community).
:::

## Security and permissions

- **Per-user authentication**: Each user authenticates with their own account, ensuring data access respects individual permissions.
- **No data storage**: Port does not store data from connected external tools.
- **Audit logging**: All interactions through external MCP servers are logged as part of [AI invocations](/ai-interfaces/port-ai/overview#ai-invocations).
- **RBAC compliance**: Access to external MCP server features respects your organization's Port permissions.

For comprehensive security information, see [AI Security and Data Controls](/ai-interfaces/port-ai/security-and-data-controls).

## Frequently asked questions

<details>
<summary><b>Who can add MCP servers to the organization?</b></summary>

Only organization admins can add and configure MCP servers. Regular users can only connect to servers that admins have already added.

</details>

<details>
<summary><b>Why don't I see any MCP servers available?</b></summary>

Your organization admin needs to add MCP servers first. Contact your platform team or Port admin to request the tools you need.

</details>

<details>
<summary><b>Can I add my own MCP servers?</b></summary>

Currently, only admins can add MCP servers at the organization level. Users can connect their accounts to the servers that admins have made available.

</details>

<details>
<summary><b>What happens if I disconnect from an MCP server?</b></summary>

You'll no longer be able to use that tool through Port AI until you reconnect. Your data in the external tool is not affected.

</details>

<details>
<summary><b>Can I use different accounts for different MCP servers?</b></summary>

Yes, each MCP server connection is independent. You can connect different accounts to different servers based on your needs.

</details>

<details>
<summary><b>Why can't I perform certain actions through an MCP server?</b></summary>

Your admin may have restricted certain capabilities through Global Scoping. Additionally, actions are limited by your permissions in the external tool itself.

</details>

<details>
<summary><b>Are my queries to external tools logged?</b></summary>

Yes, all interactions are logged as part of Port's AI invocation tracking. This helps with auditing and troubleshooting.

</details>

