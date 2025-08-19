---
sidebar_position: 5
title: Connect Claude Code To Port MCP Server in GitHub Actions
---

# Connect Claude Code To Port MCP Server in GitHub Actions

Running Claude Code inside CI/CD differs from local usage because an interactive OAuth flow is not possible. Instead, a workflow must:

1. **Generate a short-lived Port access token** using the Client-Credentials grant (`clientId` + `clientSecret`).
2. **Start or connect to the remote MCP server** and pass the token so Claude Code can call the allowed tools.

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

#### How this workflow works

1. **Token** – The `port-auth` step exchanges your client credentials for an access token (no browser auth).
2. **Claude Code** – The action launches Claude Code, pointing `mcp-remote` at your MCP URL while injecting the token via the `Authorization` header.
3. **Prompt** – Claude can invoke only the tools you list in `allowed_tools`.

:::caution Keep your secrets safe
Store `PORT_CLIENT_ID`, `PORT_CLIENT_SECRET`, and `ANTHROPIC_API_KEY` as **encrypted GitHub Actions secrets**.
:::

:::tip Customise the tool list
For read-only workflows, shorten `allowed_tools` to just the query operations you need.
:::
