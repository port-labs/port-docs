---
sidebar_position: 3
title: Tools
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Available tools

The Port MCP Server exposes different sets of tools based on your role and use case. The tools you see will depend on your permissions in Port.

<Tabs groupId="user-role" queryString>
<TabItem value="developer" label="Developer">

**Developers** are typically users who consume and interact with the developer portal - querying services, running actions, and analyzing data. These tools help you get information and execute approved workflows.

**Query and analysis tools**
- **[`get_blueprints`](/api-reference/get-all-blueprints)**: Retrieve a list of all blueprints from Port.
- **[`get_blueprint`](/api-reference/get-a-blueprint)**: Retrieve information about a specific blueprint by its identifier.
- **[`get_entities`](/api-reference/get-all-entities-of-a-blueprint)**: Retrieve all entities for a given blueprint.
- **[`get_entity`](/api-reference/get-an-entity)**: Retrieve information about a specific entity.
- **[`get_scorecards`](/api-reference/get-all-scorecards)**: Retrieve all scorecards from Port.
- **[`get_scorecard`](/api-reference/get-a-scorecard)**: Retrieve information about a specific scorecard by its identifier.
- **[`describe_user_details`](/api-reference/get-organization-details)**: Get information about your Port account, organization, and user profile details.
- **`search_port_docs_sources`**: Search through Port documentation sources for relevant information.
- **`ask_port_docs`**: Ask questions about Port documentation and get contextual answers.

**Action execution tools**
- **[`run_<action_identifier>`](/api-reference/execute-a-self-service-action)**: Execute any action you have permission to run in Port.

**AI agent tools**
- **[`invoke_ai_agent`](/api-reference/invoke-an-agent)**: Invoke a Port AI agent with a specific prompt.

</TabItem>
<TabItem value="builder" label="Builder">

**Builders** are platform engineers or admins who design and configure the developer portal - creating blueprints, setting up scorecards, and managing the overall structure. These tools help you build and maintain the portal.

**All Developer tools**
Builders have access to all the tools available to Developers (listed above), plus the additional management tools below.

**Blueprint management tools**
- **[`create_blueprint`](/api-reference/create-a-blueprint)**
- **[`update_blueprint`](/api-reference/update-a-blueprint)**
- **[`delete_blueprint`](/api-reference/delete-a-blueprint)**

**Entity management tools**
- **[`create_entity`](/api-reference/create-an-entity)**
- **[`update_entity`](/api-reference/update-an-entity)**
- **[`delete_entity`](/api-reference/delete-an-entity)**

**Scorecard management tools**
- **[`create_scorecard`](/api-reference/create-a-scorecard)**
- **[`update_scorecard`](/api-reference/change-scorecards)**
- **[`delete_scorecard`](/api-reference/delete-a-scorecard)**

</TabItem>
</Tabs>

## Select which tools to use

By default, when you open a chat with Port MCP, all available tools (based on your permissions) are loaded and ready to use. However, you can customize which tools are available if you want to focus on specific workflows.

For example, if you only want to query data from Port without building or modifying anything, you can limit the tools to just the read-only ones. This helps reduce complexity and ensures you don't accidentally make changes.

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
