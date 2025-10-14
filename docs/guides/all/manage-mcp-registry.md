---
displayed_sidebar: null
description: Learn how to build and manage a centralized MCP server registry in Port for governance, discovery, and team collaboration
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Manage MCP Server Registry

This guide demonstrates how to build a centralized MCP (Model Context Protocol) server registry using Port, enabling your organization to govern, discover, and share approved MCP servers across development teams.


## Common use cases

This guide addresses five key use cases for MCP server management:

1. **MCP Server Discovery** - Enable developers to find approved MCP servers available for their team.

2. **Tool-Specific Recommendations** - Help developers discover which MCP servers support specific capabilities (e.g., Java development, database operations).

3. **Installation Guidance** - Provide clear setup instructions and configuration documentation for approved MCP servers.

4. **Governance Enforcement** - Track and control which MCP servers are allowed organization-wide with approval workflows.

5. **Internal MCP Management** - Catalog and distribute internally-built MCP servers to development teams.

## Prerequisites

This guide assumes you have:

- A Port account and have completed the [onboarding process](/getting-started/overview).

- A GitHub account and repository (optional, required only for the automated metadata extraction section).

- [AI agents feature enabled](/ai-interfaces/ai-agents/overview#access-to-the-feature) in your Port account (optional, required only for AI-powered discovery). 


## Set up data model

We'll create a blueprint to represent MCP registry in your organization's catalog, tracking their approval status, capabilities, and metadata.

<h3>Create MCP registry blueprint</h3>

1. Go to the [builder](https://app.getport.io/settings/data-model) page of your portal.

2. Click on `+ Blueprint`.

3. Click on the `{...} Edit JSON` button.

4. Copy and paste the following JSON configuration:

        <details>
        <summary><b>MCP Registry blueprint (Click to expand)</b></summary>

        ```json showLineNumbers
        {
          "identifier": "mcpRegistry",
          "title": "MCP Registry",
          "icon": "Microservice",
          "schema": {
            "properties": {
              "type": {
                "title": "Server Type",
                "type": "string",
                "enum": ["internal", "external"],
                "enumColors": {
                  "internal": "blue",
                  "external": "purple"
                },
                "description": "Whether this is an internally-built or external third-party MCP server"
              },
              "status": {
                "title": "Approval Status",
                "type": "string",
                "enum": ["approved", "pending", "rejected"],
                "enumColors": {
                  "approved": "green",
                  "pending": "yellow",
                  "rejected": "red"
                },
                "description": "Current approval status for organizational use"
              },
              "description": {
                "title": "Description",
                "type": "string",
                "format": "markdown",
                "description": "What this MCP server does and when to use it"
              },
              "capabilities": {
                "title": "Capabilities",
                "type": "array",
                "items": {
                  "type": "string"
                },
                "description": "Tags representing server capabilities (e.g., java, database, testing)"
              },
              "installation_url": {
                "title": "Installation URL",
                "type": "string",
                "format": "url",
                "description": "Link to installation documentation"
              },
              "repository_url": {
                "title": "Repository URL",
                "type": "string",
                "format": "url",
                "description": "Source code repository location"
              },
              "tools": {
                "title": "Available Tools",
                "type": "array",
                "items": {
                  "type": "string"
                },
                "description": "List of MCP tools provided by this server"
              },
              "prompts": {
                "title": "Available Prompts",
                "type": "array",
                "items": {
                  "type": "string"
                },
                "description": "List of MCP prompts provided by this server"
              },
              "approval_date": {
                "title": "Approval Date",
                "type": "string",
                "format": "date-time",
                "description": "When this server was approved for use"
              },
              "requested_by": {
                "title": "Requested By",
                "type": "string",
                "format": "user",
                "description": "User who requested this MCP server"
              }
            },
            "required": ["type", "status", "description"]
          },
          "mirrorProperties": {},
          "calculationProperties": {},
          "aggregationProperties": {},
          "relations": {
            "owningTeam": {
              "title": "Owning Team",
              "target": "_team",
              "required": false,
              "many": false
            }
          }
        }
        ```

    </details>

5. Click `Create` to save the blueprint.



## Ingest MCP servers to the catalog
Now that we have our data model setup, let's explore how to populate and discover MCP servers in the catalog.
You can add MCP servers to your Port catalog using three methods:

<Tabs groupId="ingestion-method" defaultValue="ui" values={[
{label: "Port UI", value: "ui"},
{label: "Port API", value: "api"},
{label: "Webhook", value: "webhook"}
]}>

<TabItem value="ui">
You can add MCP servers to your Port catalog using the Port UI by following these steps:

1. Go to your [MCP Servers catalog page](https://app.getport.io/mcpServer).

2. Click `+ MCP Server` in the top right.

3. Fill in the form with server details:

   - **Title**: Name of the MCP server (e.g., "Filesystem MCP")

   - **Type**: Select "internal" or "external".

   - **Status**: Set initial status (typically "pending" for new requests).

   - **Description**: What the server does.

   - **Capabilities**: Add relevant tags.

   - **Repository URL**: Link to source code.

   - **Installation URL**: Link to setup docs.

4. Click `Create` to add the server.

</TabItem>

<TabItem value="api">

Create MCP server entities programmatically using Port's REST API:

```bash showLineNumbers
curl -X POST 'https://api.getport.io/v1/blueprints/mcpServer/entities' \
  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "identifier": "filesystem-mcp",
    "title": "Filesystem MCP Server",
    "properties": {
      "type": "external",
      "status": "pending",
      "description": "Provides secure, read-only access to local filesystem for AI assistants",
      "capabilities": ["filesystem", "file-operations", "directory-listing"],
      "repository_url": "https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem",
      "installation_url": "https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem#readme",
      "requested_by": "developer@company.com"
    },
    "relations": {}
  }'
```

:::info Getting your access token
Learn how to [get your Port API credentials](/build-your-software-catalog/custom-integration/api/#get-api-token) to authenticate API requests.
:::

</TabItem>

<TabItem value="webhook">

You can automatically ingest MCP servers from external sources using Port's webhook integration. This is useful for bulk imports or integrating with external systems.

Follow these steps to set up the webhook integration:

1. Go to the [Data Sources](https://app.getport.io/settings/data-sources) page.

2. Click on `+ Data Source`.

3. Select **Webhook** and click on **Custom integration**.

4. Name it "MCP Server Registry Sync".

5. Copy the webhook URL - you'll need this to send data to Port.

6. Copy and paste the following mapping into the **Map the data from the external system into Port** field:

    <details>
    <summary><b>MCP server webhook mapping (Click to expand)</b></summary>

    ```json showLineNumbers
    [
        {
            "blueprint": "mcpRegistry",
            "filter": ".body.servers != null and (.body.servers | type == \"array\")",
            "itemsToParse": ".body.servers",
            "entity": {
                "identifier": ".item.identifier",
                "title": ".item.title",
                "properties": {
                    "type": ".item.type",
                    "status": ".item.status // \"pending\"",
                    "description": ".item.description",
                    "capabilities": ".item.capabilities",
                    "installation_url": ".item.installation_url",
                    "repository_url": ".item.repository_url",
                    "tools": ".item.tools // []",
                    "prompts": ".item.prompts // []",
                    "requested_by": ".item.requested_by"
                },
                "relations": {}
            }
        },
        {
            "blueprint": "mcpRegistry",
            "filter": ".body.identifier != null and .body.servers == null",
            "entity": {
                "identifier": ".body.identifier",
                "title": ".body.title",
                "properties": {
                    "type": ".body.type",
                    "status": ".body.status // \"pending\"",
                    "description": ".body.description",
                    "capabilities": ".body.capabilities",
                    "installation_url": ".body.installation_url",
                    "repository_url": ".body.repository_url",
                    "tools": ".body.tools // []",
                    "prompts": ".body.prompts // []",
                    "requested_by": ".body.requested_by"
                },
                "relations": {}
            }
        }
    ]
    ```
    </details>

7. Click on `Save`.

Now you can send MCP server data to your webhook URL. Here are examples for both single and bulk imports:

**Single MCP server:**
```bash showLineNumbers
curl -X POST 'https://ingest.getport.io/YOUR_WEBHOOK_ID' \
  -H 'Content-Type: application/json' \
  -d '{
    "identifier": "postgres-mcp",
    "title": "PostgreSQL MCP Server",
    "type": "external",
    "status": "approved",
    "description": "PostgreSQL database operations through MCP",
    "capabilities": ["database", "postgresql", "sql"],
    "repository_url": "https://github.com/modelcontextprotocol/servers/tree/main/src/postgres",
    "installation_url": "https://github.com/modelcontextprotocol/servers/tree/main/src/postgres#readme",
    "tools": ["query", "list_tables", "describe_table"],
    "prompts": ["analyze-schema", "mcp-demo"],
    "requested_by": "data-team@company.com"
  }'
```

</TabItem>

</Tabs>


:::tip Viewing MCP servers
**Browse the catalog**: Navigate to the MCP Servers page to see all registered servers (or [create a custom table view](https://docs.port.io/customize-pages-dashboards-and-plugins/dashboards/#table) to show different perspectives of your MCP server registry).
:::



## Create request MCP server action

1. Go to the [self-service](https://app.getport.io/self-serve) page of your portal.

2. Click on `+ New Action`.

3. Click on the `{...} Edit JSON` button.

4. Copy and paste the following JSON configuration:

        <details>
        <summary><b>Request MCP Server action (Click to expand)</b></summary>

        ```json showLineNumbers
        {
          "identifier": "request_mcp_server",
          "title": "Request New MCP Server",
          "icon": "Microservice",
          "description": "Request approval for a new MCP server to be added to the organization's approved registry",
          "trigger": {
            "type": "self-service",
            "operation": "CREATE",
            "userInputs": {
              "properties": {
                "server_name": {
                  "title": "Server Name",
                  "type": "string",
                  "icon": "DefaultProperty",
                  "description": "Name of the MCP server (e.g., 'Filesystem MCP', 'PostgreSQL MCP')"
                },
                "type": {
                  "title": "Server Type",
                  "type": "string",
                  "icon": "DefaultProperty",
                  "enum": ["internal", "external"],
                  "enumColors": {
                    "internal": "blue",
                    "external": "purple"
                  },
                  "description": "Is this an internally-built or external third-party MCP server?"
                },
                "repository_url": {
                  "title": "Repository URL",
                  "type": "string",
                  "format": "url",
                  "icon": "DefaultProperty",
                  "description": "Link to the source code repository"
                },
                "installation_url": {
                  "title": "Installation Documentation URL",
                  "type": "string",
                  "format": "url",
                  "icon": "DefaultProperty",
                  "description": "Link to installation and setup documentation"
                },
                "description": {
                  "title": "Description",
                  "type": "string",
                  "format": "markdown",
                  "icon": "DefaultProperty",
                  "description": "What does this MCP server do? Why should it be approved?"
                },
                "capabilities": {
                  "title": "Capabilities",
                  "type": "array",
                  "items": {
                    "type": "string"
                  },
                  "icon": "DefaultProperty",
                  "description": "Tags representing capabilities (e.g., database, filesystem, testing)"
                },
                "business_justification": {
                  "title": "Business Justification",
                  "type": "string",
                  "format": "markdown",
                  "icon": "DefaultProperty",
                  "description": "Explain the business need and expected benefits"
                }
              },
              "required": [
                "server_name",
                "type",
                "repository_url",
                "description",
                "capabilities"
              ],
              "order": [
                "server_name",
                "type",
                "repository_url",
                "installation_url",
                "description",
                "capabilities",
                "business_justification"
              ]
            },
            "blueprintIdentifier": "mcpServer"
          },
          "invocationMethod": {
            "type": "UPSERT_ENTITY",
            "blueprintIdentifier": "mcpServer",
            "mapping": {
              "identifier": ".inputs.server_name | gsub(\" \"; \"-\") | ascii_downcase",
              "title": ".inputs.server_name",
              "properties": {
                "type": ".inputs.type",
                "status": "\"pending\"",
                "description": ".inputs.description",
                "capabilities": ".inputs.capabilities",
                "repository_url": ".inputs.repository_url",
                "installation_url": ".inputs.installation_url // \"\"",
                "requested_by": ".trigger.by.user.email"
              },
              "relations": {}
            }
          },
          "requiredApproval": false,
          "publish": true
        }
        ```

        </details>

5. Click `Save` to create the action.


This action creates a new MCP Server entity with `status: pending`, triggering the approval workflow we'll set up in the next section.


## Set up approval automations

Create automations to streamline the MCP server approval process based on server type and organizational policies.


<h3>Auto-approve internal servers</h3>

1. Go to the [automations](https://app.getport.io/settings/automations) page of your portal.

2. Click on `+ Automation`.

3. Copy and paste the following JSON configuration:

        <details>
        <summary><b>Auto-approve internal servers automation (Click to expand)</b></summary>

        ```json showLineNumbers
        {
          "identifier": "auto_approve_internal_mcp",
          "title": "Auto-approve Internal MCP Servers",
          "description": "Automatically approve internally-built MCP servers and set approval date",
          "icon": "Microservice",
          "trigger": {
            "type": "automation",
            "event": {
              "type": "ENTITY_CREATED",
              "blueprintIdentifier": "mcpServer"
            },
            "condition": {
              "type": "JQ",
              "expressions": [
                ".diff.after.properties.type == \"internal\"",
                ".diff.after.properties.status == \"pending\""
              ],
              "combinator": "and"
            }
          },
          "invocationMethod": {
            "type": "WEBHOOK",
            "url": "https://api.getport.io/v1/blueprints/mcpServer/entities/{{ .event.diff.after.identifier }}",
            "agent": false,
            "synchronized": true,
            "method": "PATCH",
            "headers": {
              "Content-Type": "application/json"
            },
            "body": {
              "properties": {
                "status": "approved",
                "approval_date": "{{ now | strftime(\"%Y-%m-%dT%H:%M:%SZ\") }}"
              }
            }
          },
          "publish": true
        }
        ```

        </details>

4. Click `Create` to save the automation.


<h3>Notify for external server review</h3>

1. Go to the [automations](https://app.getport.io/settings/automations) page of your portal.

2. Click on `+ Automation`.

3. Copy and paste the following JSON configuration:

    <details>
    <summary><b>Notify for external server review automation (Click to expand)</b></summary>

    ```json showLineNumbers
    {
    "identifier": "notify_external_mcp_review",
    "title": "Notify Platform Team for External MCP Review",
    "description": "Send Slack notification when external MCP server needs approval",
    "icon": "Slack",
    "trigger": {
        "type": "automation",
        "event": {
        "type": "ENTITY_CREATED",
        "blueprintIdentifier": "mcpServer"
        },
        "condition": {
        "type": "JQ",
        "expressions": [
            ".diff.after.properties.type == \"external\"",
            ".diff.after.properties.status == \"pending\""
        ],
        "combinator": "and"
        }
    },
    "invocationMethod": {
        "type": "WEBHOOK",
        "url": "https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK",
        "agent": false,
        "synchronized": false,
        "method": "POST",
        "headers": {
        "Content-Type": "application/json"
        },
        "body": {
        "text": "🔔 New External MCP Server Approval Request",
        "blocks": [
            {
            "type": "header",
            "text": {
                "type": "plain_text",
                "text": "🔔 MCP Server Approval Needed"
            }
            },
            {
            "type": "section",
            "fields": [
                {
                "type": "mrkdwn",
                "text": "*Server:*\n{{ .event.diff.after.title }}"
                },
                {
                "type": "mrkdwn",
                "text": "*Type:*\nExternal"
                },
                {
                "type": "mrkdwn",
                "text": "*Requested By:*\n{{ .event.diff.after.properties.requested_by }}"
                },
                {
                "type": "mrkdwn",
                "text": "*Repository:*\n<{{ .event.diff.after.properties.repository_url }}|View Code>"
                }
            ]
            },
            {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "*Description:*\n{{ .event.diff.after.properties.description }}"
            }
            },
            {
            "type": "actions",
            "elements": [
                {
                "type": "button",
                "text": {
                    "type": "plain_text",
                    "text": "Review in Port"
                },
                "url": "https://app.getport.io/mcpServer/{{ .event.diff.after.identifier }}"
                }
            ]
            }
        ]
        }
    },
    "publish": true
    }
    ```

    </details>

4. Click `Create` to save the automation.

:::tip Slack webhook
Replace `YOUR/SLACK/WEBHOOK` with your actual [Slack webhook URL](https://api.slack.com/messaging/webhooks).
:::

## Python script for metadata extraction

Automatically extract MCP server tools and prompts metadata using a Python script that integrates with Port's API.

<h3>Overview</h3>

The Python script will:
1. Connect to an MCP server using the Model Context Protocol.

2. Extract available tools and prompts.

3. Update the Port entity with the extracted metadata.

4. Add tool descriptions and schemas.

<h3>Create the Python script</h3>

Create a file named `extract_mcp_metadata.py` in your repository:

<details>
<summary><b>Python MCP extraction script (Click to expand)</b></summary>

```python showLineNumbers
"""
MCP Server Metadata Extractor
Connects to MCP servers, extracts tools and prompts, and updates Port entities
"""

import asyncio
import json
import os
import sys
import logging
from typing import Dict, List, Any
import httpx
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class PortAPIClient:
    """Client for interacting with Port API"""
    
    def __init__(self, client_id: str, client_secret: str):
        self.client_id = client_id
        self.client_secret = client_secret
        self.base_url = "https://api.getport.io/v1"
        self.access_token = None
    
    async def authenticate(self):
        """Authenticate with Port API and get access token"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.getport.io/v1/auth/access_token",
                json={
                    "clientId": self.client_id,
                    "clientSecret": self.client_secret
                }
            )
            response.raise_for_status()
            data = response.json()
            self.access_token = data["accessToken"]
            logger.info("Successfully authenticated with Port API")
    
    async def update_mcp_server_entity(
        self,
        entity_identifier: str,
        tools: List[str],
        prompts: List[str],
        additional_properties: Dict[str, Any] = None
    ):
        """Update MCP Server entity in Port with extracted metadata"""
        if not self.access_token:
            await self.authenticate()
        
        properties = {
            "tools": tools,
            "prompts": prompts
        }
        
        if additional_properties:
            properties.update(additional_properties)
        
        async with httpx.AsyncClient() as client:
            response = await client.patch(
                f"{self.base_url}/blueprints/mcpServer/entities/{entity_identifier}",
                headers={
                    "Authorization": f"Bearer {self.access_token}",
                    "Content-Type": "application/json"
                },
                json={"properties": properties}
            )
            response.raise_for_status()
            logger.info(f"Successfully updated entity {entity_identifier}")
            return response.json()


class MCPServerInspector:
    """Inspector for MCP servers to extract tools and prompts"""
    
    def __init__(self, server_command: str, server_args: List[str] = None):
        self.server_command = server_command
        self.server_args = server_args or []
    
    async def extract_metadata(self) -> Dict[str, Any]:
        """Connect to MCP server and extract available tools and prompts"""
        server_params = StdioServerParameters(
            command=self.server_command,
            args=self.server_args,
            env=None
        )
        
        try:
            async with stdio_client(server_params) as (read, write):
                async with ClientSession(read, write) as session:
                    await session.initialize()
                    
                    # Extract tools
                    tools_list = []
                    try:
                        tools_result = await session.list_tools()
                        tools_list = [tool.name for tool in tools_result.tools]
                        logger.info(f"Extracted {len(tools_list)} tools")
                    except Exception as e:
                        logger.warning(f"Could not extract tools: {e}")
                    
                    # Extract prompts
                    prompts_list = []
                    try:
                        prompts_result = await session.list_prompts()
                        prompts_list = [prompt.name for prompt in prompts_result.prompts]
                        logger.info(f"Extracted {len(prompts_list)} prompts")
                    except Exception as e:
                        logger.warning(f"Could not extract prompts: {e}")
                    
                    return {
                        "tools": tools_list,
                        "prompts": prompts_list,
                        "server_info": {
                            "name": getattr(session, 'server_name', 'unknown'),
                            "version": getattr(session, 'server_version', 'unknown')
                        }
                    }
        except Exception as e:
            logger.error(f"Failed to connect to MCP server: {e}")
            raise


async def main():
    """Main execution function"""
    # Get configuration from environment variables
    port_client_id = os.getenv("PORT_CLIENT_ID")
    port_client_secret = os.getenv("PORT_CLIENT_SECRET")
    entity_identifier = os.getenv("MCP_ENTITY_IDENTIFIER")
    server_command = os.getenv("MCP_SERVER_COMMAND")
    server_args_str = os.getenv("MCP_SERVER_ARGS", "")
    
    if not all([port_client_id, port_client_secret, entity_identifier, server_command]):
        logger.error("Missing required environment variables")
        sys.exit(1)
    
    server_args = server_args_str.split() if server_args_str else []
    
    try:
        # Extract metadata from MCP server
        logger.info(f"Connecting to MCP server: {server_command}")
        inspector = MCPServerInspector(server_command, server_args)
        metadata = await inspector.extract_metadata()
        
        logger.info(f"Extracted metadata: {json.dumps(metadata, indent=2)}")
        
        # Update Port entity
        logger.info(f"Updating Port entity: {entity_identifier}")
        port_client = PortAPIClient(port_client_id, port_client_secret)
        await port_client.update_mcp_server_entity(
            entity_identifier,
            tools=metadata["tools"],
            prompts=metadata["prompts"]
        )
        
        logger.info("✅ Successfully extracted and updated MCP server metadata")
        
    except Exception as e:
        logger.error(f"❌ Failed to extract metadata: {e}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
```

</details>

## Create GitHub Action workflow

Create a workflow that runs the Python script to extract MCP metadata and update Port entities.

Create `.github/workflows/extract_mcp_metadata.yml`:

<details>
<summary><b>GitHub Action workflow for MCP extraction (Click to expand)</b></summary>

```yaml showLineNumbers
name: Extract MCP Server Metadata

on:
  workflow_dispatch:
    inputs:
      entity_identifier:
        description: 'Port entity identifier for the MCP server'
        required: true
        type: string
      server_command:
        description: 'Command to run the MCP server (e.g., npx, node, python)'
        required: true
        type: string
      server_args:
        description: 'Arguments for the MCP server command'
        required: false
        type: string
        default: ''
      repository_url:
        description: 'Git repository URL of the MCP server'
        required: true
        type: string

jobs:
  extract_metadata:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout extraction script
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install Python dependencies
        run: |
          pip install httpx mcp

      - name: Checkout MCP server repository
        uses: actions/checkout@v4
        with:
          repository: ${{ github.event.inputs.repository_url }}
          path: mcp-server-repo

      - name: Set up Node.js (for Node-based MCP servers)
        if: startsWith(github.event.inputs.server_command, 'node') || startsWith(github.event.inputs.server_command, 'npx')
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install MCP server dependencies
        working-directory: mcp-server-repo
        run: |
          if [ -f "package.json" ]; then
            npm install
          elif [ -f "requirements.txt" ]; then
            pip install -r requirements.txt
          fi

      - name: Extract MCP metadata
        env:
          PORT_CLIENT_ID: ${{ secrets.PORT_CLIENT_ID }}
          PORT_CLIENT_SECRET: ${{ secrets.PORT_CLIENT_SECRET }}
          MCP_ENTITY_IDENTIFIER: ${{ github.event.inputs.entity_identifier }}
          MCP_SERVER_COMMAND: ${{ github.event.inputs.server_command }}
          MCP_SERVER_ARGS: ${{ github.event.inputs.server_args }}
        run: |
          python extract_mcp_metadata.py

      - name: Report success
        if: success()
        run: |
          echo "✅ Successfully extracted and updated MCP server metadata for: ${{ github.event.inputs.entity_identifier }}"

      - name: Report failure
        if: failure()
        run: |
          echo "❌ Failed to extract MCP server metadata"
          exit 1
```

</details>

<h3>Add GitHub secrets</h3>

In your GitHub repository, [go to **Settings > Secrets**](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository) and add:

- `PORT_CLIENT_ID` - Your Port Client ID
- `PORT_CLIENT_SECRET` - Your Port Client Secret

Learn more about [getting your Port API credentials](/build-your-software-catalog/custom-integration/api/#get-api-token).

:::tip Running the workflow
After creating an MCP server entity in Port, you can manually trigger this workflow to extract and populate the tools and prompts metadata automatically.
:::

## AI agent integration

Leverage Port's AI capabilities to enable intelligent discovery and recommendations for MCP servers.
With your MCP server registry in Port, you can use [Port AI](/ai-interfaces/port-ai/overview) to answer questions like:

**Discovery queries:**
- "Which MCP servers are approved for our team to use?"
- "Show me all MCP servers that support database operations"
- "What internal MCP servers do we have?"

**Tool-specific recommendations:**
- "Which MCP servers can I use for Java development?"
- "Find MCP servers with filesystem capabilities"
- "What MCP servers provide testing tools?"

**Installation guidance:**
- "How do I install the PostgreSQL MCP server?"
- "Show me the setup instructions for approved MCP servers"
- "What are the installation steps for the Filesystem MCP?"




## Related resources

- [Port MCP Server](/ai-interfaces/port-mcp-server/overview-and-installation) - Connect AI assistants to your Port catalog
- [Port AI Agents](/ai-interfaces/ai-agents/overview) - Build intelligent agents for developer workflows
- [Self-Service Actions](/actions-and-automations/create-self-service-experiences/) - Learn more about creating actions in Port
- [Automations](/actions-and-automations/define-automations/) - Deep dive into Port's automation capabilities

