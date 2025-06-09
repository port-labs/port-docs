# Port MCP Server

The [Port IO](https://www.getport.io/) MCP server is a [Model Context Protocol (MCP)](https://modelcontextprotocol.io/introduction) server, enabling advanced automations and natual language interactions for developers and AI applications.

## What You Can Do With Port MCP

### Find Information Quickly
- **Get entity details** - "Who is the owner of service X?"
- **Check on-call status** - "Who is on call right now?"
- **Get catalog insights** - "How many services do we have in production?"

### Analyze Scorecards 
- **Identify weak points** - "Which services are failing for the gold level and why?"
- **Get compliance status** - "Show me all services that don't meet our security requirements"
- **Improve quality** - "What do I need to fix to reach the next scorecard level?"

### Create Resources
- **Build scorecards** - "Create a new scorecard called 'Security Posture' with levels Basic, Silver, and Gold"
- **Define rules** - "Add a rule that requires services to have a team owner to reach the Silver level"
- **Setup quality gates** - "Create a rule that checks if services have proper documentation"

We're continuously expanding Port MCP's capabilities. Have a suggestion? We'd love to hear your feedback on our [roadmap](https://roadmap.getport.io/ideas)!


# Installation

## Prerequisites
Before you begin, you'll need:

1. Create a Port Account (if you don't have one):
   - Visit [Port.io](https://app.port.io/)
   - Sign up for an account

2. Obtain Port Credentials:
   - Navigate to your Port dashboard
   - Go to Settings > Credentials
   - Save both the Client ID and Client Secret

3. Installation Requirements:
   - Either [Docker](https://www.docker.com/get-started/) installed on your system
   - OR [uvx](https://pypi.org/project/uvx/) package manager installed

>[!NOTE]
>You will also need to provide your Port region, which is either EU or US. If not provided, the default is EU.

## Installation methods
Port MCP Server can be installed using two methods:

### Package Installation (uvx)
Use our official [Port MCP server](https://pypi.org/project/mcp-server-port/) package.

### Docker Installation
Use our official Docker image:
```bash
docker pull ghcr.io/port-labs/port-mcp-server:0.2.8
```

### Additional configurations
You can pass these additional arguments for more advanced configuration:

| Configuration Parameter | UVX Flag | Docker Environment Variable | Description | Default Value |
|------------------------|----------|---------------------------|-------------|---------------|
| Log Level | `log-level` | `PORT_LOG_LEVEL` | Controls the level of log output | `ERROR` |
| API Validation | `api-validation-enabled` | `PORT_API_VALIDATION_ENABLED` | Controls if API schema should be validated and fail if it's not valid | `False` |

## Usage with Claude Desktop
1. Go to Settings > Developer and click on "Edit config".
2. Edit the `claude_desktop_config.json` file and add the below configuration based on the installation method.
3. Save the file and restart Claude.
4. In a new chat, check the Tools section and you'll see Port available tools.

![Claude MCP Tools](/assets/claude_mcp_tools.png)

### Docker

>[!TIP]
>Consider using the full path to Docker (e.g., `/usr/local/bin/docker`) instead of just `docker`. You can find this path by running `which docker` in your terminal. Using the full path helps avoid PATH resolution issues and ensures consistent behavior across different shell environments.

```json
{
  "mcpServers": {
    "port": {
      "command": "docker",
      "args": [
               "run",
                "-i",
                "--rm",
                "-e",
                "PORT_CLIENT_ID",
                "-e",
                "PORT_CLIENT_SECRET",
                "-e",
                "PORT_REGION",
                "-e",
                "PORT_LOG_LEVEL",
                "ghcr.io/port-labs/port-mcp-server:0.2.2"
              ],
              "env": {
                "PORT_CLIENT_ID": "<PORT_CLIENT_ID>",
                "PORT_CLIENT_SECRET": "<PORT_CLIENT_SECRET>",
                "PORT_REGION": "<PORT_REGION>",
                "PORT_LOG_LEVEL": "<PORT_LOG_LEVEL>"
              }
    }
  }
}
```

### uvx

>[!NOTE]
>If you want to run the command from a virtual Python environment, add a `PYTHONPATH` variable to the `env` object with its path, e.g., `/path/to/your/venv/bin/python`.

```json
{
  "mcpServers": {
    "Port": {
          "command": "uvx",
          "args": [
              "mcp-server-port@0.2.8",
              "--client-id",
              "<PORT_CLIENT_ID>",
              "--client-secret",
              "<PORT_CLIENT_SECRET>",
              "--region",
              "<PORT_REGION>"
          ],
          "env": {
              "PORT_CLIENT_ID": "<PORT_CLIENT_ID>",
              "PORT_CLIENT_SECRET": "<PORT_CLIENT_SECRET>",
              "PORT_REGION": "<PORT_REGION>",
              "PYTHONPATH": "/Users/matangrady/.venv-port-mcp/bin/python"
          }
      }
  }
}
```

## Usage with Cursor

1. Go to Cursor > Settings > Cursor Settings.
2. Click on the MCP tab, and "Add new global MCP server".
2. Edit the `mcp.json` file and add the below configuration based on the installation method.
3. Save the file and return to Cursor Settings.
4. You will see the new Port server and its available tools.

![Cursor MCP Screenshot](/assets/cursor_mcp_screenshot.png)

### Docker

>[!TIP]
>Consider using the full path to Docker (e.g., `/usr/local/bin/docker`) instead of just `docker`. You can find this path by running `which docker` in your terminal. Using the full path helps avoid PATH resolution issues and ensures consistent behavior across different shell environments.

```json
{
  "mcpServers": {
    "port": {
      "command": "docker",
      "args": [
               "run",
                "-i",
                "--rm",
                "-e",
                "PORT_CLIENT_ID",
                "-e",
                "PORT_CLIENT_SECRET",
                "-e",
                "PORT_REGION",
                "-e",
                "PORT_LOG_LEVEL",
                "ghcr.io/port-labs/port-mcp-server:0.2.2"
              ],
              "env": {
                "PORT_CLIENT_ID": "<PORT_CLIENT_ID>",
                "PORT_CLIENT_SECRET": "<PORT_CLIENT_SECRET>",
                "PORT_REGION": "<PORT_REGION>",
                "PORT_LOG_LEVEL": "<PORT_LOG_LEVEL>"
              }
    }
  }
}
```



### uvx
>[!NOTE]
>If you want to run the command from a virtual Python environment, add a `PYTHONPATH` variable to the `env` object with its path, e.g., `/path/to/your/venv/bin/python`.

```json
{
  "mcpServers": {
    "Port": {
          "command": "uvx",
          "args": [
              "mcp-server-port@0.2.8",
              "--client-id",
              "<PORT_CLIENT_ID>",
              "--client-secret",
              "<PORT_CLIENT_SECRET>",
              "--region",
              "<PORT_REGION>"
          ],
          "env": {
              "PORT_CLIENT_ID": "<PORT_CLIENT_ID>",
              "PORT_CLIENT_SECRET": "<PORT_CLIENT_SECRET>",
              "PORT_REGION": "<PORT_REGION>",
              "PYTHONPATH": "/Users/matangrady/.venv-port-mcp/bin/python"
          }
      }
  }
}
```

### Usage with VS Code

>[!TIP]
>VS Code can automatically discover MCP servers already installed in Cursor and Claude.

>[!NOTE]
>For quick installation, use the one-click install buttons and select where to add the MCP configuration. Make sure to replace the placeholders with your Port credentials.

[Docker quick installation](https://insiders.vscode.dev/redirect/mcp/install?name=port&config=%7B%22command%22%3A%22docker%22%2C%22args%22%3A%5B%22run%22%2C%22-i%22%2C%22--rm%22%2C%22-e%22%2C%22PORT_CLIENT_ID%22%2C%22-e%22%2C%22PORT_CLIENT_SECRET%22%2C%22-e%22%2C%22PORT_REGION%22%2C%22ghcr.io%2Fport-labs%2Fport-mcp-server%3A0.2.2%22%5D%2C%22env%22%3A%7B%22PORT_CLIENT_ID%22%3A%22%3CPORT_CLIENT_ID%3E%22%2C%22PORT_CLIENT_SECRET%22%3A%22%3CPORT_CLIENT_SECRET%3E%22%2C%22PORT_REGION%22%3A%22%3CPORT_REGION%3E%22%7D%7D)
[uvx quick installation](https://insiders.vscode.dev/redirect/mcp/install?name=port&config=%7B%22command%22%3A%22uvx%22%2C%22args%22%3A%5B%22mcp-server-port%400.2.8%22%2C%22--client-id%22%2C%22%3CPORT_CLIENT_ID%3E%22%2C%22--client-secret%22%2C%22%3CPORT_CLIENT_SECRET%3E%22%2C%22--region%22%2C%22%3CPORT_REGION%3E%22%5D%2C%22env%22%3A%7B%22PORT_CLIENT_ID%22%3A%22%3CPORT_CLIENT_ID%3E%22%2C%22PORT_CLIENT_SECRET%22%3A%22%3CPORT_CLIENT_SECRET%3E%22%2C%22PORT_REGION%22%3A%22%3CPORT_REGION%3E%22%7D%7D)

For manual installation follow these steps:
1. Go to the Command Palette by pressing `Cmd + Shift + P` / `Ctrl + Shift + P`.
2. Type `Preferences: Open User Settings (JSON)` and press enter.
2. Edit the `settings.json` file and add the below configuration under the `mcp`>`servers`.
3. Use Copilot in Agent mode, make sure the server is running and see its available Port tools.

![VS Code MCP Tools](/assets/vs_code_mcp_tools.png)

### Docker
>[!TIP]
>Consider using the full path to Docker (e.g., `/usr/local/bin/docker`) instead of just `docker`. You can find this path by running `which docker` in your terminal. Using the full path helps avoid PATH resolution issues and ensures consistent behavior across different shell environments.

```json
  "Port": {
      "type": "stdio",
      "command": "docker",
      "args": [
          "run",
          "-i",
          "--rm",
          "-e",
          "PORT_CLIENT_ID",
          "-e",
          "PORT_CLIENT_SECRET",
          "-e",
          "PORT_REGION",
          "ghcr.io/port-labs/port-mcp-server:0.2.2"
      ],
      "env": {
          "PORT_CLIENT_ID": "<PORT_CLIENT_ID>",
          "PORT_CLIENT_SECRET": "<PORT_CLIENT_SECRET>",
          "PORT_REGION": "<PORT_REGION>"
      }
  }
```

### uvx

>[!NOTE]
>If you want to run the command from a virtual Python environment, add a `PYTHONPATH` variable to the `env` object with its path, e.g., `/path/to/your/venv/bin/python`.

```json
  "Port": {
      "type": "stdio",
      "command": "uvx",
      "args": [
          "mcp-server-port@0.2.8",
          "--client-id",
          "<PORT_CLIENT_ID>",
          "--client-secret",
          "<PORT_CLIENT_SECRET>",
          "--region",
          "<PORT_REGION>"
      ],
      "env": {
          "PORT_CLIENT_ID": "<PORT_CLIENT_ID>",
          "PORT_CLIENT_SECRET": "<PORT_CLIENT_SECRET>",
          "PORT_REGION": "<PORT_REGION>"
      }
  }
```

# Available Tools

## Blueprint Tools

1. `get_blueprints`
   - Retrieve a list of all blueprints from Port
   - Optional inputs:
     - `detailed` (boolean, default: false): Return complete schema details for each blueprint
   - Returns: Formatted text representation of all available blueprints

2. `get_blueprint`
   - Retrieve information about a specific blueprint by its identifier
   - Required inputs:
     - `blueprint_identifier` (string): The unique identifier of the blueprint to retrieve
   - Optional inputs:
     - `detailed` (boolean, default: true): Return complete schema details

3. `create_blueprint`
   - Create a new blueprint in Port
   - Required inputs:
     - Various fields including identifier, title, properties, etc.
   - Returns: The created blueprint object

4. `update_blueprint`
   - Update an existing blueprint
   - Required inputs:
     - `identifier` (string): The unique identifier of the blueprint to update
     - Various fields to update
   - Returns: The updated blueprint object

5. `delete_blueprint`
   - Delete a blueprint from Port
   - Required inputs:
     - `blueprint_identifier` (string): The unique identifier of the blueprint to delete
   - Returns: Success status

## Entity Tools

1. `get_entities`
   - Retrieve all entities for a given blueprint
   - Required inputs:
     - `blueprint_identifier` (string): The identifier of the blueprint to get entities for
   - Optional inputs:
     - `detailed` (boolean, default: false): Return complete entity details including properties

2. `get_entity`
   - Retrieve information about a specific entity
   - Required inputs:
     - `blueprint_identifier` (string): The identifier of the blueprint the entity belongs to
     - `entity_identifier` (string): The unique identifier of the entity to retrieve
   - Optional inputs:
     - `detailed` (boolean, default: true): Return complete entity details

3. `create_entity`
   - Create a new entity for a specific blueprint
   - Required inputs:
     - `blueprint_identifier` (string): The identifier of the blueprint to create the entity for
     - `entity` (object): The entity data following the blueprint schema

4. `update_entity`
   - Update an existing entity
   - Required inputs:
     - `blueprint_identifier` (string): The identifier of the blueprint the entity belongs to
     - `entity_identifier` (string): The unique identifier of the entity to update
     - `entity` (object): The updated entity data

5. `delete_entity`
   - Delete an entity
   - Required inputs:
     - `blueprint_identifier` (string): The identifier of the blueprint the entity belongs to
     - `entity_identifier` (string): The unique identifier of the entity to delete
   - Optional inputs:
     - `delete_dependents` (boolean, default: false): If true, also deletes all dependencies

## Scorecard Tools

1. `get_scorecards`
   - Retrieve all scorecards from Port
   - Optional inputs:
     - `detailed` (boolean, default: false): Return complete scorecard details

2. `get_scorecard`
   - Retrieve information about a specific scorecard by its identifier
   - Required inputs:
     - `scorecard_id` (string): The unique identifier of the scorecard to retrieve
     - `blueprint_id` (string, optional): The identifier of the blueprint the scorecard belongs to

3. `create_scorecard`
   - Create a new scorecard for a specific blueprint
   - Required inputs:
     - `blueprint_id` (string): The identifier of the blueprint to create the scorecard for
     - `identifier` (string): The unique identifier for the new scorecard
     - `title` (string): The display title of the scorecard
     - `levels` (list): List of levels for the scorecard
   - Optional inputs:
     - `rules` (list): List of rules for the scorecard
     - `description` (string): Description for the scorecard

4. `update_scorecard`
   - Update an existing scorecard
   - Required inputs:
     - `blueprint_identifier` (string): The identifier of the blueprint the scorecard belongs to
     - `scorecard_identifier` (string): The unique identifier of the scorecard to update
     - Various fields to update (title, levels, rules, etc.)
   - Returns: The updated scorecard object

5. `delete_scorecard`
   - Delete a scorecard from Port
   - Required inputs:
     - `blueprint_identifier` (string): The identifier of the blueprint the scorecard belongs to
     - `scorecard_identifier` (string): The unique identifier of the scorecard to delete
   - Returns: Success status

## AI Agents Tool

1. `invoke_ai_agent`
   - Invoke a Port AI agent with a specific prompt
   - Required inputs:
     - `prompt` (string): The prompt to send to the AI agent
   - Returns: Invocation status and message from the AI agent

# Feedback and Roadmap

We're continuously improving Port MCP and would love to hear from you! Please share your feedback and feature requests on our [roadmap page](https://roadmap.getport.io/ideas).

# Troubleshooting

If you encounter authentication errors, verify that:
1. Your Port credentials are correctly set in the arguments.
2. You have the necessary permissions.
3. The credentials are properly copied to your configuration.

# License

This MCP server is licensed under the MIT License. This means you are free to use, modify, and distribute the software, subject to the terms and conditions of the [MIT License](https://github.com/port-labs/port-mcp-server/blob/main/LICENSE).