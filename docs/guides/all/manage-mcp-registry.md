---
displayed_sidebar: null
description: Learn how to build and manage a centralized MCP server registry in Port for governance, discovery, and team collaboration
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Manage MCP Server Registry

This guide demonstrates how to build a centralized MCP (Model Context Protocol) server registry using Port, enabling your organization to govern, discover, and share approved MCP servers across development teams.


<img src="/img/guides/MCPRegistryOverview.png" width="100%" border="1px" />

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


## Ingest MCP server using a self-service action

Now that we have our data model setup, let's explore how to populate MCP servers using a self-service action.


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
                "identifier": "{{ .inputs.server_name | gsub(\" \"; \"-\") | ascii_downcase }}",
                "title": "{{ .inputs.server_name }}",
                "properties": {
                  "type": "{{ .inputs.type }}",
                  "status": "pending",
                  "description": "{{ .inputs.description }}",
                  "labels": "{{ .inputs.labels }}",
                  "repository_url": "{{ .inputs.repository_url }}",
                  "installation_instructions": "{{ .inputs.business_justification }}",
                  "command": "{{ .inputs.command }}",
                  "endpoint": "{{ .inputs.endpoint }}"
                },
                "relations": {
                  "requestedBy": "{{ .trigger.by.user.email }}"
                }
            }
          },
          "requiredApproval": false
        }
        ```

        </details>

5. Click `Save` to create the action.


This action creates a new MCP Server entity with `status: pending`, allowing your team to track and manage MCP server requests.

<img src="/img/guides/mcpRequestImagePendingApproval.png" width="100%" border="1px" />

Once the MCP server is approved, it will be added to the catalog and the status will be updated to `approved`.

<img src="/img/guides/mcpRequestEntityApproved.png" width="100%" border="1px" />
<img src="/img/guides/moreMcpDetailsInMCPRegistry.png" width="100%" border="1px" />



## Ingest MCP servers tools into the catalog

Now that we have our mcp server entities in the catalog, let's explore how to automatically extract the mcp tools from the mcp server using GitHub Workflows.

<h3>Add GitHub secrets</h3>

In your GitHub repository, [go to **Settings > Secrets**](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository) and add the following secrets:

**Required for Port API:**
- `PORT_CLIENT_ID` - Port Client ID [learn more](/build-your-software-catalog/custom-integration/api/#get-api-token).
- `PORT_CLIENT_SECRET` - Port Client Secret [learn more](/build-your-software-catalog/custom-integration/api/#get-api-token).


### Add MCP tools extraction script

Create a Python script `scripts/extract_mcp_tools.py` in your repository:

:::tip Reference implementation
You can find latest update of this script in the [Port product experiments repository](https://github.com/port-labs/port-product-experiments/blob/main/scripts/extract_mcp_tools.py).
:::

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
            print(f"🔐 Authenticating with Port API at {self.base_url}...")
            async with httpx.AsyncClient() as client:
                try:
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
                    print("✅ Successfully authenticated with Port API")
                except httpx.HTTPError as e:
                    print(f"❌ Authentication failed: {e}")
                    raise
        
        async def get_all_mcp_servers(self) -> List[Dict[str, Any]]:
            """Fetch all MCP servers from Port"""
            if not self.access_token:
                await self.authenticate()
            
            print(f"📡 Fetching MCP servers from Port...")
            print(f"   API endpoint: {self.base_url}/blueprints/mcpRegistry/entities")
            
            async with httpx.AsyncClient() as client:
                try:
                    response = await client.get(
                        f"{self.base_url}/blueprints/mcpRegistry/entities",
                        headers={"Authorization": f"Bearer {self.access_token}"}
                    )
                    response.raise_for_status()
                    data = response.json()
                    servers = data.get("entities", [])
                    print(f"✅ Successfully fetched {len(servers)} MCP servers from Port")
                    
                    if servers:
                        print("\n📋 MCP Servers found:")
                        for idx, server in enumerate(servers, 1):
                            print(f"   {idx}. {server.get('title', 'Untitled')} (ID: {server.get('identifier')})")
                    else:
                        print("⚠️  No MCP servers found in Port catalog")
                    
                    return servers
                except httpx.HTTPError as e:
                    print(f"❌ Failed to fetch MCP servers: {e}")
                    raise
        
        async def create_tool_entity(self, tool_data: Dict[str, Any], server_id: str):
            """Create or update a tool entity in Port"""
            if not self.access_token:
                await self.authenticate()
            
            # Add relation to MCP server
            tool_data["relations"] = {"mcpServer": server_id}
            tool_identifier = tool_data.get("identifier", "unknown")
            
            print(f"      📤 Creating/updating tool '{tool_identifier}' in Port...")
            
            async with httpx.AsyncClient() as client:
                try:
                    response = await client.post(
                        f"{self.base_url}/blueprints/mcpToolSpecification/entities?upsert=true&merge=true",
                        headers={
                            "Authorization": f"Bearer {self.access_token}",
                            "Content-Type": "application/json"
                        },
                        json=tool_data
                    )
                    response.raise_for_status()
                    print(f"      ✅ Successfully synced tool '{tool_identifier}'")
                except httpx.HTTPError as e:
                    print(f"      ❌ Failed to sync tool '{tool_identifier}': {e}")
                    raise
        
        async def update_server_tools(self, server_id: str, tool_names: List[str]):
            """Update MCP server entity with list of available tools"""
            if not self.access_token:
                await self.authenticate()
            
            print(f"   📝 Updating MCP server with {len(tool_names)} tools...")
            
            async with httpx.AsyncClient() as client:
                try:
                    response = await client.patch(
                        f"{self.base_url}/blueprints/mcpRegistry/entities/{server_id}",
                        headers={
                            "Authorization": f"Bearer {self.access_token}",
                            "Content-Type": "application/json"
                        },
                        json={
                            "properties": {
                                "tools": tool_names
                            }
                        }
                    )
                    response.raise_for_status()
                    print(f"   ✅ Updated MCP server entity with tools list")
                except httpx.HTTPError as e:
                    print(f"   ⚠️  Failed to update server tools: {e}")
                    # Don't raise - this is not critical

    def parse_command(command_str: str) -> tuple[str, List[str]]:
        """Parse command string into command and arguments"""
        import shlex
        
        # Use shlex to properly parse shell commands
        parts = shlex.split(command_str)
        
        if not parts:
            raise ValueError("Empty command string")
        
        command = parts[0]
        args = parts[1:] if len(parts) > 1 else []
        
        return command, args
    
    def replace_secret_placeholders(command_str: str) -> str:
        """Replace YOUR__SECRET_NAME placeholders with actual environment variable values
        
        Supports two patterns:
            1. YOUR__SECRET_NAME  -> replaces with os.getenv("SECRET_NAME")
            2. <YOUR_SECRET_NAME> -> replaces with os.getenv("SECRET_NAME")
        
        Example:
            Command: "uvx server --key YOUR__API_KEY"
            Replaces YOUR__API_KEY with value from os.getenv("API_KEY")
        """
        import re
        
        # Pattern 1: YOUR__SECRET_NAME (double underscore)
        pattern1 = r'YOUR__([A-Z_]+)'
        matches1 = re.findall(pattern1, command_str)
        
        # Pattern 2: <YOUR_SECRET_NAME> (angle brackets, single underscore)
        pattern2 = r'<YOUR_([A-Z_]+)>'
        matches2 = re.findall(pattern2, command_str)
        
        all_matches = list(set(matches1 + matches2))
        
        if all_matches:
            print(f"   🔑 Found secret placeholders: {all_matches}")
        
        for secret_name in all_matches:
            secret_value = os.getenv(secret_name)
            if secret_value:
                # Replace both patterns
                command_str = command_str.replace(f"YOUR__{secret_name}", secret_value)
                command_str = command_str.replace(f"<YOUR_{secret_name}>", secret_value)
                print(f"      ✅ Replaced placeholder with {secret_name} environment variable")
            else:
                print(f"      ⚠️  Warning: Environment variable {secret_name} not found")
        
        return command_str

    async def extract_tools_from_mcp(command_str: str) -> List[Dict[str, Any]]:
        """Connect to MCP server and extract tools"""
        print(f"   🔌 Connecting to MCP server...")
        print(f"      📝 Original command: {command_str}")
        
        # Replace secret placeholders (YOUR__SECRET_NAME pattern)
        command_str_with_secrets = replace_secret_placeholders(command_str)
        print(f"      🔐 Command after secret replacement: {command_str_with_secrets[:100]}..." if len(command_str_with_secrets) > 100 else f"      🔐 Command after secret replacement: {command_str_with_secrets}")
        
        # Parse command into executable and arguments
        try:
            command, args = parse_command(command_str_with_secrets)
            print(f"      ⚙️  Executable: {command}")
            print(f"      📋 Arguments: {args[:3]}..." if len(args) > 3 else f"      📋 Arguments: {args}")
        except Exception as e:
            print(f"   ❌ Failed to parse command: {e}")
            return []
        
        server_params = StdioServerParameters(
            command=command,
            args=args,
            env=None
        )
        
        tools_data = []
        try:
            async with stdio_client(server_params) as (read, write):
                print(f"   ✅ Connected to MCP server")
                async with ClientSession(read, write) as session:
                    print(f"   🔄 Initializing session...")
                    await session.initialize()
                    print(f"   ✅ Session initialized")
                    
                    # List all tools from the MCP server
                    print(f"   📋 Listing tools from MCP server...")
                    tools_result = await session.list_tools()
                    print(f"   ✅ Found {len(tools_result.tools)} tools")
                    
                    for tool in tools_result.tools:
                        tool_identifier = f"{tool.name.lower().replace(' ', '_').replace('-', '_')}"
                        print(f"      - {tool.name} (ID: {tool_identifier})")
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
            print(f"   ❌ Error extracting tools: {type(e).__name__}: {str(e)}")
            import traceback
            print(f"   Stack trace:\n{traceback.format_exc()}")
            return []

    async def main():
        print("=" * 60)
        print("🚀 MCP Tool Extractor for Port")
        print("=" * 60)
        
        port_client_id = os.getenv("PORT_CLIENT_ID")
        port_client_secret = os.getenv("PORT_CLIENT_SECRET")
        
        if not port_client_id or not port_client_secret:
            print("❌ Missing required environment variables:")
            if not port_client_id:
                print("   - PORT_CLIENT_ID is not set")
            if not port_client_secret:
                print("   - PORT_CLIENT_SECRET is not set")
            sys.exit(1)
        
        print(f"✅ Environment variables loaded")
        print(f"   Client ID: {port_client_id[:8]}...")
        
        try:
            # Initialize Port client
            print(f"\n{'=' * 60}")
            print("Step 1: Initializing Port API Client")
            print("=" * 60)
            port_client = PortAPIClient(port_client_id, port_client_secret)
            
            # Get all MCP servers from Port
            print(f"\n{'=' * 60}")
            print("Step 2: Fetching MCP Servers from Port")
            print("=" * 60)
            mcp_servers = await port_client.get_all_mcp_servers()
            
            if not mcp_servers:
                print("\n⚠️  No MCP servers to process. Exiting.")
                return
            
            total_tools_synced = 0
            servers_processed = 0
            servers_skipped = 0
            servers_failed = 0
            
            # Process each MCP server
            print(f"\n{'=' * 60}")
            print("Step 3: Processing MCP Servers")
            print("=" * 60)
            
            for idx, server in enumerate(mcp_servers, 1):
                print(f"\n[{idx}/{len(mcp_servers)}] Processing MCP Server")
                print("-" * 60)
                
                server_id = server.get("identifier")
                server_title = server.get("title", server_id)
                command = server.get("properties", {}).get("command")
                
                print(f"   📦 Server: {server_title}")
                print(f"   🆔 Identifier: {server_id}")
                print(f"   💻 Command: {command or 'Not specified'}")
                
                if not command:
                    print(f"   ⏭️  Skipping: no command specified")
                    servers_skipped += 1
                    continue
                
                # Extract tools from this MCP server
                try:
                    tools = await extract_tools_from_mcp(command)
                    
                    if tools:
                        print(f"\n   📤 Syncing {len(tools)} tools to Port...")
                        
                        # Create tool entities in Port
                        for tool in tools:
                            await port_client.create_tool_entity(tool, server_id)
                        
                        # Update MCP server entity with list of tool names
                        tool_names = [tool["title"] for tool in tools]
                        await port_client.update_server_tools(server_id, tool_names)
                        
                        total_tools_synced += len(tools)
                        servers_processed += 1
                        print(f"   ✅ Successfully processed server: {server_title}")
                    else:
                        print(f"   ⚠️  No tools found for server: {server_title}")
                        servers_skipped += 1
                except Exception as e:
                    print(f"   ❌ Failed to process server: {server_title}")
                    print(f"      Error: {type(e).__name__}: {str(e)}")
                    servers_failed += 1
            
            # Final summary
            print(f"\n{'=' * 60}")
            print("🎉 Sync Complete - Summary")
            print("=" * 60)
            print(f"   Total servers found: {len(mcp_servers)}")
            print(f"   ✅ Successfully processed: {servers_processed}")
            print(f"   ⏭️  Skipped (no command): {servers_skipped}")
            print(f"   ❌ Failed: {servers_failed}")
            print(f"   📊 Total tools synced: {total_tools_synced}")
            print("=" * 60)
            
            if servers_failed > 0:
                sys.exit(1)
            
        except Exception as e:
            print(f"\n{'=' * 60}")
            print(f"❌ Fatal Error")
            print("=" * 60)
            print(f"   {type(e).__name__}: {str(e)}")
            import traceback
            print(f"\nStack trace:\n{traceback.format_exc()}")
            sys.exit(1)

    if __name__ == "__main__":
        asyncio.run(main())
    ```

    </details>

:::info Secret management pattern
The script uses a secure pattern for handling MCP server credentials:

**Use placeholder patterns in commands:**
- **Pattern 1**: `YOUR__SECRET_NAME` (double underscore)
- **Pattern 2**: `<YOUR_SECRET_NAME>` (angle brackets, single underscore)  
- Example: `uvx mcp-server-port@latest --client-id <YOUR_PORT_CLIENT_ID> --client-secret <YOUR_PORT_CLIENT_SECRET> --region EU`

**The workflow automatically:**
1. Detects placeholder patterns in commands
2. Replaces them with values from GitHub Secrets (e.g., `<YOUR_PORT_CLIENT_ID>` → value of `PORT_CLIENT_ID` secret)
3. Executes the command with actual credentials
:::

<h3>Create GitHub workflow for MCP tools extraction</h3>

Create the file `.github/workflows/extract_mcp_tools.yml` in the `.github/workflows` folder of your repository.

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
              pip install uv  # Install uv which provides uvx

          - name: Sync tools from all MCP servers
            env:
              # Port API credentials (required)
              PORT_CLIENT_ID: ${{ secrets.PORT_CLIENT_ID }}
              PORT_CLIENT_SECRET: ${{ secrets.PORT_CLIENT_SECRET }}
              # Add secrets for your MCP servers here (matching YOUR__* placeholders in commands)
              # Example: If command uses YOUR__GITHUB_TOKEN, add: GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
            run: |
              python scripts/extract_mcp_tools.py

          - name: Report completion
            if: always()
            run: |
              echo "✅ MCP tools sync workflow completed"
    ```

    </details>

:::warning Important: Managing MCP server credentials
For each MCP server that requires credentials, you must:

1. **Add secrets to GitHub**: Store actual credential values in GitHub Secrets.
2. **Update workflow env section**: Add the secret to the `env` block of the workflow.
   Example: `PORT_CLIENT_ID: ${{ secrets.PORT_CLIENT_ID }}`
3. **Use placeholder in command**: Reference using one of these patterns:
   - Example: `--client-id <YOUR_PORT_CLIENT_ID>` or `--client-id YOUR__PORT_CLIENT_ID`

**Limitation**: GitHub Actions requires secrets to be explicitly defined in the workflow file. You cannot dynamically pass all secrets, so each MCP server's credentials must be manually added to the workflow's `env` section.
:::

The workflow runs automatically every Sunday at midnight (syncs all MCP servers) but can be adjusted to fit your organization's use case.

## Let's test it

Trigger the workflow manually or set it to run automatically on a schedule.

1. Go to the Actions page of your repository.

2. Click on the `extract_mcp_tools` workflow.

3. Click on the `Run workflow` button.

4. Wait for the workflow to complete.

5. Check the logs to see if the tools were synced successfully.

    <img src="/img/guides/MCPToolsExtractorWorkflow.png" border="1px" width="100%" />

<h3>Verify the tools in the catalog</h3>

1. Go to the [MCP Registry](https://app.getport.io/mcpServers) page of your portal.

2. Click on the `MCP Server` you want to inspect.

3. Verify that the available MCP tools were synced successfully.

    <img src="/img/guides/IngestedMCPToolsExtractorWorkflow.png" border="1px" width="100%" />

    <img src="/img/guides/MCPToolsExtractorWorkflowDetails.png" border="1px" width="100%" />




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

<Tabs>
<TabItem value="cursor" label="Cursor IDE">

<img src="/img/guides/ApprovedMCPServersCursor.png" width="100%" border="1px" />

</TabItem>

<TabItem value="vscode" label="VS Code">

<img src="/img/guides/ApprovedMCPServersVSCode.png" width="100%" border="1px" />

</TabItem>
</Tabs>




## Related resources

- [Port MCP Server](/ai-interfaces/port-mcp-server/overview-and-installation) - Connect AI assistants to your Port catalog
- [Port AI Agents](/ai-interfaces/ai-agents/overview) - Build intelligent agents for developer workflows
- [Self-Service Actions](/actions-and-automations/create-self-service-experiences/) - Learn more about creating actions in Port
- [Automations](/actions-and-automations/define-automations/) - Deep dive into Port's automation capabilities

