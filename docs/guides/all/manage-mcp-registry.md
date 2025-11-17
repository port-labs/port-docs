---
displayed_sidebar: null
description: Learn how to build and manage a centralized MCP server registry in Port for governance, discovery, and team collaboration
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Manage MCP Server Registry

This guide demonstrates how to build a centralized MCP (Model Context Protocol) server registry using Port, enabling your organization to govern, discover, and share approved MCP servers across development teams.

<img src="/img/ai-agents/MCPRegistry.png" width="100%" border="1px" />

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

Create a Python script `scripts/extract_mcp_tools.py` in your repository. Visit the [Port experimental mcp server integration repository](https://github.com/port-experimental/mcp-server-integration/blob/main/scripts/extract_mcp_tools.py) to copy the script used in this guide.

The script performs the following operations:

- **Authenticates with Port API** using your `PORT_CLIENT_ID` and `PORT_CLIENT_SECRET` credentials
- **Fetches all MCP servers** from your Port catalog that have a `command` property defined
- **Connects to each MCP server** using the MCP protocol and extracts available tools
- **Handles secret placeholders** in commands by replacing patterns like `YOUR__SECRET_NAME` or `<YOUR_SECRET_NAME>` with environment variable values
- **Creates or updates tool entities** in Port's `mcpToolSpecification` blueprint, linking them to their parent MCP server
- **Updates MCP server entities** with the list of available tool names

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

You can find a ready-to-use template for the workflow [in the Port experimental mcp server integration repository](https://github.com/port-experimental/mcp-server-integration/blob/main/.github/workflows/extract_mcp_tools.yml). Copy this file into your own repository at `.github/workflows/extract_mcp_tools.yml`.

The template workflow performs the following steps:
- Installs dependencies (`mcp`, `httpx`, and `uv`).
- Authenticates using secrets from your repository.
- Runs the `extract_mcp_tools.py` script (`python scripts/extract_mcp_tools.py`).
- Provides a manual and scheduled trigger.


Once copied, customize the secrets and any details needed for your specific set of MCP servers.

:::warning Managing MCP server credentials
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
<TabItem value="port-ai" label="Port AI">

<img src="/img/guides/ApprovedMCPServersPortAI.png" width="100%" border="1px" />

</TabItem>

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

