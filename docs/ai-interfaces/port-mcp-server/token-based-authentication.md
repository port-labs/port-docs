---
sidebar_position: 2
title: Token-based connection
---

# Token-based connection to Port MCP server

When integrating the Port MCP Server with AI agents in automated environments like CI/CD pipelines, the authentication approach differs from interactive local usage. This guide explains how to establish secure connections between AI agents and the Port MCP Server without requiring user interaction.

## The Challenge

Interactive OAuth flows that work well for local development become problematic in automated environments because:

- **No User Interaction**: CI/CD pipelines and automated agents can't handle browser-based authentication flows
- **Security Requirements**: Credentials must be managed securely without exposing them in logs or configurations
- **Token Management**: Short-lived tokens are preferred for security, but must be programmatically generated

## The Solution

The Port MCP Server supports programmatic authentication using the Client Credentials flow, which enables AI agents to:

1. **Generate short-lived access tokens** using your Port client credentials (`clientId` + `clientSecret`)
2. **Connect to the remote MCP server** with the generated token for secure API access
3. **Invoke Port tools** through the MCP interface without user intervention

This approach maintains security while enabling powerful automation capabilities.

## Example: Claude Code in GitHub Actions

Here's a complete example showing how to connect Claude Code to the Port MCP Server within a GitHub Actions workflow:

<details>
<summary>Show example workflow</summary>

```yaml title=".github/workflows/claude-code-mcp.yml" showLineNumbers
name: Port MCP Server Demo with Claude Code
on: workflow_dispatch

env:
  PORT_MCP_URL: ${{ vars.PORT_MCP_URL }}
  PORT_AUTH_BASE_URL: ${{ vars.PORT_AUTH_BASE_URL }}

jobs:
  demo:
    runs-on: ubuntu-latest
    permissions:
      id-token: write
      contents: read

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Authenticate with Port
        id: port-auth
        run: |
          response=$(curl -s -X POST "${{ env.PORT_AUTH_BASE_URL }}/auth/access_token" \
            -H "Content-Type: application/json" \
            -d '{"clientId":"${{ secrets.PORT_CLIENT_ID }}","clientSecret":"${{ secrets.PORT_CLIENT_SECRET }}"}')
          token=$(echo "$response" | jq -r '.accessToken')
          echo "::add-mask::$token"
          echo "access_token=$token" >> "$GITHUB_OUTPUT"

      - name: Claude Code against Port MCP
        uses: anthropics/claude-code-action@beta
        with:
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
          mode: agent
          mcp_config: |
            {
              "mcpServers": {
                "port-prod": {
                  "command": "npx",
                  "args": [
                    "mcp-remote",
                    "${{ env.PORT_MCP_URL }}",
                    "--header",
                    "Authorization: Bearer ${{ steps.port-auth.outputs.access_token }}"
                  ]
                }
              }
            }
          allowed_tools: "mcp__port-prod__list_blueprints,mcp__port-prod__get_entities"
          direct_prompt: |
            List all blueprints, then show entities of the "zendesk_ticket" blueprint.
```
</details>

### How this workflow works

1. **Authentication** – The `port-auth` step exchanges your Port client credentials for a short-lived access token using the Client Credentials flow
2. **MCP Connection** – Claude Code connects to the remote MCP server using the `mcp-remote` package, passing the access token in the Authorization header
3. **Tool Access** – Claude Code can invoke only the specific Port tools listed in `allowed_tools`, ensuring controlled access to your Port instance
4. **Execution** – The AI agent executes the provided prompt using the available Port tools to query your software catalog

:::tip Customize your integration
For read-only workflows, limit `allowed_tools` to just the query operations you need.
Choose the appropriate MCP URL for your Port region (EU: `https://mcp.port.io/v1`, US: `https://mcp.us.port.io/v1`)
:::

## Adapting for Other AI Agents

While this example focuses on Claude Code, the same authentication pattern can be applied to other AI agents and platforms:

### General Integration Steps

1. **Obtain Port Credentials**: Create a client ID and secret in your Port dashboard.
2. **Generate Access Token**: Use the Client Credentials flow to get a short-lived token.
3. **Configure MCP Connection**: Point your AI agent to the remote MCP server with the token.
4. **Define Tool Permissions**: Specify which Port tools the AI agent can access.
5. **Execute Workflows**: Let the AI agent interact with your Port data and capabilities.
