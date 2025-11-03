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
              "labels": {
                "title": "Labels",
                "type": "array",
                "items": {
                  "type": "string"
                },
                "description": "Tags representing server labels (e.g., java, database, testing)"
              },
              "installation_instructions": {
                "title": "Installation Instructions",
                "type": "string",
                "format": "markdown",
                "description": "Step-by-step installation and setup instructions for this MCP server"
              },
              "repository_url": {
                "title": "Repository URL",
                "type": "string",
                "format": "url",
                "description": "Source code repository location"
              },
              "endpoint": {
                "title": "Endpoint",
                "type": "string",
                "description": "Endpoint URL for the MCP server (if applicable)"
              },
              "command": {
                "title": "Command",
                "type": "string",
                "description": "Command to run the MCP server (e.g., 'npx -y @modelcontextprotocol/server-filesystem')"
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
            },
            "requestedBy": {
              "title": "Requested By",
              "target": "_user",
              "required": false,
              "many": false
            }
          }
        }
        ```

    </details>

5. Click `Create` to save the blueprint.

<h3>Create MCP Tool Specification blueprint</h3>

Create an MCP Tool Specification blueprint to catalog individual tools provided by MCP servers with governance metadata. This blueprint works with the GitHub Workflow ingestion method to automatically extract and track tools.

1. Go to the [builder](https://app.getport.io/settings/data-model) page of your portal.

2. Click on `+ Blueprint`.

3. Click on the `{...} Edit JSON` button.

4. Copy and paste the following JSON configuration:

        <details>
        <summary><b>MCP Tool Specification blueprint (Click to expand)</b></summary>

        ```json showLineNumbers
        {
          "identifier": "mcpToolSpecification",
          "title": "MCP Tool Specification",
          "icon": "Microservice",
          "description": "Details of an MCP Tool Specification with AI Governance metadata",
          "schema": {
            "properties": {
              "name": {
                "type": "string",
                "title": "Name",
                "description": "The name of the MCP tool"
              },
              "description": {
                "type": "string",
                "title": "Description",
                "description": "Description of what the tool does"
              },
              "parameters": {
                "type": "object",
                "title": "Parameters",
                "description": "Tool parameters and their descriptions"
              },
              "ai_category": {
                "type": "string",
                "title": "AI Category",
                "icon": "AI",
                "description": "The AI category this tool belongs to",
                "enum": [
                  "generative_ai",
                  "ml_prediction",
                  "nlp",
                  "computer_vision",
                  "recommendation",
                  "data_processing",
                  "automation",
                  "other"
                ],
                "enumColors": {
                  "generative_ai": "purple",
                  "ml_prediction": "blue",
                  "nlp": "green",
                  "computer_vision": "orange",
                  "recommendation": "pink",
                  "data_processing": "turquoise",
                  "automation": "yellow",
                  "other": "lightGray"
                }
              },
              "risk_classification": {
                "type": "string",
                "title": "Risk Classification",
                "icon": "Alert",
                "description": "Risk level associated with this tool",
                "enum": ["low", "medium", "high", "critical"],
                "enumColors": {
                  "low": "green",
                  "medium": "yellow",
                  "high": "orange",
                  "critical": "red"
                }
              },
              "data_access_level": {
                "type": "string",
                "title": "Data Access Level",
                "icon": "Lock",
                "description": "Level of data access this tool requires",
                "enum": ["none", "read_only", "read_write", "admin"],
                "enumColors": {
                  "none": "green",
                  "read_only": "yellow",
                  "read_write": "orange",
                  "admin": "red"
                }
              },
              "last_governance_review": {
                "type": "string",
                "title": "Last Governance Review",
                "format": "date-time",
                "icon": "AuditLog",
                "description": "When this tool was last reviewed for governance compliance"
              }
            },
            "required": []
          },
          "mirrorProperties": {},
          "calculationProperties": {},
          "aggregationProperties": {},
          "relations": {
            "mcpServer": {
              "title": "MCP Server",
              "target": "mcpRegistry",
              "required": false,
              "many": false
            }
          }
        }
        ```

        </details>

5. Click `Create` to save the blueprint.


## Ingest MCP servers and tools to the catalog

Now that we have our data model setup, let's explore how to populate MCP servers and automatically extract their tools using GitHub Workflows.

You can automatically extract MCP server tools and metadata using a GitHub workflow with an MCP client. This method connects directly to the MCP server, lists its tools, and creates Port entities.

<h3>Overview</h3>

1. Create an MCP server entity in Port using the self-service action (detailed in the next section).

2. Run a GitHub workflow that connects to the MCP server using its command.

3. Extract tool specifications and create `mcpToolSpecification` entities.

4. Link tools to the MCP server via relations.

<h3>Setup</h3>

1. Create a Python script `extract_mcp_tools.py` in your repository:

    <details>
    <summary><b>Python MCP tool extractor (Click to expand)</b></summary>

    ```python showLineNumbers
    """
    MCP Tool Extractor for Port
    Automatically syncs tools from all MCP servers in Port catalog
    """
    import asyncio
    import json
    import os
    import sys
    from typing import List, Dict, Any
    import httpx
    from mcp import ClientSession, StdioServerParameters
    from mcp.client.stdio import stdio_client

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
                    f"{self.base_url}/auth/access_token",
                    json={
                        "clientId": self.client_id,
                        "clientSecret": self.client_secret
                    }
                )
                response.raise_for_status()
                data = response.json()
                self.access_token = data["accessToken"]
                print("✅ Authenticated with Port API")
        
        async def get_all_mcp_servers(self) -> List[Dict[str, Any]]:
            """Fetch all MCP servers from Port"""
            if not self.access_token:
                await self.authenticate()
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/blueprints/mcpRegistry/entities",
                    headers={"Authorization": f"Bearer {self.access_token}"}
                )
                response.raise_for_status()
                data = response.json()
                servers = data.get("entities", [])
                print(f"📋 Found {len(servers)} MCP servers in Port")
                return servers
        
        async def create_tool_entity(self, tool_data: Dict[str, Any], server_id: str):
            """Create or update a tool entity in Port"""
            if not self.access_token:
                await self.authenticate()
            
            # Add relation to MCP server
            tool_data["relations"] = {"mcpServer": server_id}
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/blueprints/mcpToolSpecification/entities?upsert=true&merge=true",
                    headers={
                        "Authorization": f"Bearer {self.access_token}",
                        "Content-Type": "application/json"
                    },
                    json=tool_data
                )
                response.raise_for_status()

    async def extract_tools_from_mcp(command: str, args: List[str] = None) -> List[Dict[str, Any]]:
        """Connect to MCP server and extract tools"""
        server_params = StdioServerParameters(
            command=command,
            args=args or [],
            env=None
        )
        
        tools_data = []
        try:
            async with stdio_client(server_params) as (read, write):
                async with ClientSession(read, write) as session:
                    await session.initialize()
                    
                    # List all tools from the MCP server
                    tools_result = await session.list_tools()
                    
                    for tool in tools_result.tools:
                        tool_identifier = f"{tool.name.lower().replace(' ', '_').replace('-', '_')}"
                        tools_data.append({
                            "identifier": tool_identifier,
                            "title": tool.name,
                            "properties": {
                                "name": tool.name,
                                "description": tool.description or "",
                                "parameters": tool.inputSchema if hasattr(tool, 'inputSchema') else {}
                            }
                        })
                    
                    return tools_data
                    
        except Exception as e:
            print(f"⚠️  Error extracting tools: {e}")
            return []

    async def main():
        port_client_id = os.getenv("PORT_CLIENT_ID")
        port_client_secret = os.getenv("PORT_CLIENT_SECRET")
        
        if not port_client_id or not port_client_secret:
            print("❌ Missing PORT_CLIENT_ID or PORT_CLIENT_SECRET")
            sys.exit(1)
        
        try:
            # Initialize Port client
            port_client = PortAPIClient(port_client_id, port_client_secret)
            
            # Get all MCP servers from Port
            mcp_servers = await port_client.get_all_mcp_servers()
            
            total_tools_synced = 0
            servers_processed = 0
            
            # Process each MCP server
            for server in mcp_servers:
                server_id = server.get("identifier")
                server_title = server.get("title", server_id)
                command = server.get("properties", {}).get("command")
                
                if not command:
                    print(f"⏭️  Skipping {server_title}: no command specified")
                    continue
                
                print(f"\n🔄 Processing: {server_title}")
                print(f"   Command: {command}")
                
                # Extract tools from this MCP server
                tools = await extract_tools_from_mcp(command)
                
                if tools:
                    print(f"   ✅ Extracted {len(tools)} tools")
                    
                    # Create tool entities in Port
                    for tool in tools:
                        await port_client.create_tool_entity(tool, server_id)
                    
                    total_tools_synced += len(tools)
                    servers_processed += 1
                else:
                    print(f"   ⚠️  No tools found")
            
            print(f"\n🎉 Sync complete!")
            print(f"   Servers processed: {servers_processed}/{len(mcp_servers)}")
            print(f"   Total tools synced: {total_tools_synced}")
            
        except Exception as e:
            print(f"❌ Failed to sync MCP tools: {e}")
            sys.exit(1)

    if __name__ == "__main__":
        asyncio.run(main())
    ```

    </details>

2. Create a GitHub workflow `.github/workflows/extract_mcp_tools.yml`:

    <details>
    <summary><b>GitHub workflow for tool extraction (Click to expand)</b></summary>

    ```yaml showLineNumbers
    name: Sync All MCP Tools to Port

    on:
      workflow_dispatch:  # Allow manual trigger
      schedule:
        - cron: '0 0 * * 0'  # Weekly on Sunday at midnight

    jobs:
      sync-all-mcp-tools:
        runs-on: ubuntu-latest
        steps:
          - name: Checkout repository
            uses: actions/checkout@v4

          - name: Set up Python
            uses: actions/setup-python@v5
            with:
              python-version: '3.11'

          - name: Install dependencies
            run: |
              pip install mcp httpx

          - name: Sync tools from all MCP servers
            env:
              PORT_CLIENT_ID: ${{ secrets.PORT_CLIENT_ID }}
              PORT_CLIENT_SECRET: ${{ secrets.PORT_CLIENT_SECRET }}
            run: |
              python extract_mcp_tools.py

          - name: Report completion
            if: always()
            run: |
              echo "✅ MCP tools sync workflow completed"
    ```

    </details>

3. Add GitHub secrets:
   - `PORT_CLIENT_ID` - Your Port Client ID.
   - `PORT_CLIENT_SECRET` - Your Port Client Secret.

4. The workflow runs:
   - **Automatically** every Sunday at midnight (syncs all MCP servers).
   - **Manually** via GitHub Actions UI (syncs all MCP servers on demand).


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
                "description": {
                  "title": "Description",
                  "type": "string",
                  "format": "markdown",
                  "icon": "DefaultProperty",
                  "description": "What does this MCP server do? Why should it be approved?"
                },
                "labels": {
                  "title": "Labels",
                  "type": "array",
                  "items": {
                    "type": "string"
                  },
                  "icon": "DefaultProperty",
                  "description": "Tags representing labels (e.g., database, filesystem, testing)"
                },
                "command": {
                  "title": "Server Command",
                  "type": "string",
                  "icon": "DefaultProperty",
                  "description": "Command to run the MCP server (e.g., 'npx -y @modelcontextprotocol/server-filesystem')"
                },
                "endpoint": {
                  "title": "Endpoint",
                  "type": "string",
                  "format": "url",
                  "icon": "DefaultProperty",
                  "description": "Endpoint URL for the MCP server (optional)"
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
                "labels"
              ],
              "order": [
                "server_name",
                "type",
                "repository_url",
                "description",
                "labels",
                "command",
                "endpoint",
                "business_justification"
              ]
            },
            "blueprintIdentifier": "mcpRegistry"
          },
          "invocationMethod": {
            "type": "UPSERT_ENTITY",
            "blueprintIdentifier": "mcpRegistry",
            "mapping": {
              "identifier": ".inputs.server_name | gsub(\" \"; \"-\") | ascii_downcase",
              "title": ".inputs.server_name",
              "properties": {
                "type": ".inputs.type",
                "status": "\"pending\"",
                "description": ".inputs.description",
                "labels": ".inputs.labels",
                "repository_url": ".inputs.repository_url",
                "installation_instructions": ".inputs.business_justification // \"\"",
                "command": ".inputs.command // \"\"",
                "endpoint": ".inputs.endpoint // \"\""
              },
              "relations": {
                "requestedBy": ".trigger.by.user.id"
              }
            }
          },
          "requiredApproval": false,
          "publish": true
        }
        ```

        </details>

5. Click `Save` to create the action.


This action creates a new MCP Server entity with `status: pending`, allowing your team to track and manage MCP server requests.


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
          "description": "Automatically approve internally-built MCP servers",
          "icon": "Microservice",
          "trigger": {
            "type": "automation",
            "event": {
              "type": "ENTITY_CREATED",
              "blueprintIdentifier": "mcpRegistry"
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
            "url": "https://api.getport.io/v1/blueprints/mcpRegistry/entities/{{ .event.diff.after.identifier }}",
            "agent": false,
            "synchronized": true,
            "method": "PATCH",
            "headers": {
              "Content-Type": "application/json"
            },
            "body": {
              "properties": {
                "status": "approved"
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
        "blueprintIdentifier": "mcpRegistry"
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
                "url": "https://app.getport.io/mcpRegistry/{{ .event.diff.after.identifier }}"
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


## AI agent integration

Leverage Port's AI capabilities to enable intelligent discovery and recommendations for MCP servers.
With your MCP server registry in Port, you can use [Port AI](/ai-interfaces/port-ai/overview) to answer questions like:

**Discovery queries:**
- "Which MCP servers are approved for our team to use?"
- "Show me all MCP servers that support database operations"
- "What internal MCP servers do we have?"

**Tool-specific recommendations:**
- "Which MCP servers can I use for Java development?"
- "Find MCP servers with filesystem labels"
- "What MCP servers provide testing tools?"

**Installation guidance:**
- "Show me the installation instructions for the PostgreSQL MCP server"
- "What are the setup steps for approved MCP servers?"
- "How do I configure the Filesystem MCP server?"




## Related resources

- [Port MCP Server](/ai-interfaces/port-mcp-server/overview-and-installation) - Connect AI assistants to your Port catalog
- [Port AI Agents](/ai-interfaces/ai-agents/overview) - Build intelligent agents for developer workflows
- [Self-Service Actions](/actions-and-automations/create-self-service-experiences/) - Learn more about creating actions in Port
- [Automations](/actions-and-automations/define-automations/) - Deep dive into Port's automation capabilities

