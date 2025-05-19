---
displayed_sidebar: null
description: Set up and use the Port MCP Server to interact with Port.io using natural language through Claude, helping you query information, analyze scorecards, and create resources.
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Using the Port MCP Server

## Overview

This guide will walk you through setting up and using the Port Model Context Protocol (MCP) server. The MCP server enables LLMS to interact with Port.io's developer platform capabilities using natural language, allowing you to query information, analyze scorecards, and create resources in Port through conversational interactions.

:::info
The Port MCP server screenshot image will be added soon. Stay tuned!
:::

## Common use cases

With the Port MCP server, you can:

### Find information quickly
- Get entity details (e.g., "Who is the owner of service X?")
- Check on-call status (e.g., "Who is on call right now?")
- Get catalog insights (e.g., "How many services do we have in production?")

### Analyze scorecards
- Identify weak points (e.g., "Which services are failing for the gold level and why?")
- Get compliance status (e.g., "Show me all services that don't meet our security requirements")
- Improve quality (e.g., "What do I need to fix to reach the next scorecard level?")

### Create resources
- Build scorecards (e.g., "Create a new scorecard called 'Security Posture' with levels Basic, Silver, and Gold")
- Define rules (e.g., "Add a rule that requires services to have a team owner to reach the Silver level")
- Setup quality gates (e.g., "Create a rule that checks if services have proper documentation")

## Prerequisites

Before setting up the Port MCP server, you need:

- A Port.io account with appropriate permissions
- Your Port credentials (Client ID and Client Secret)
- Claude Desktop, Cursor, or another application that supports MCP configuration

## Installation options

You can install the Port MCP server using either UVX or Docker. Choose the method that best fits your environment and requirements.

### Step 1: Obtain your Port credentials

1. Create a Port.io Account if you don't have one:
   - Visit [Port.io](https://www.port.io/)
   - Sign up for an account

2. Create an API Key:
   - Navigate to your Port.io dashboard
   - Go to Settings > Credentials
   - Save both the Client ID and Client Secret

:::caution Keep credentials secure
Your Client ID and Client Secret provide access to your Port.io account. Keep them secure and never share them publicly.
:::

### Step 2: Choose an installation method

<Tabs>
  <TabItem value="uvx" label="Using UVX" default>
    UVX is a package manager for Python that makes it easy to install and run the Port MCP server.

    1. Create a Python virtual environment:
    ```bash
    python -m venv ~/.venv-port-mcp
    ```

    2. Activate the virtual environment:
    ```bash
    source ~/.venv-port-mcp/bin/activate
    ```

    3. Install UVX:
    ```bash
    python -m pip install uvx
    ```

    4. Configure your MCP server in your configuration file:

    <Tabs>
      <TabItem value="claude" label="Claude Desktop" default>
        Add the following configuration to your `claude_desktop_config.json` file:

        ```json
        {
          "mcpServers": {
               "port-uvx": {
                    "command": "uvx",
                    "args": [
                        "mcp-server-port@0.2.8",
                        "--client-id",
                        "<PORT_CLIENT_ID>",
                        "--client-secret",
                        "<PORT_CLIENT_SECRET>",
                        "--region",
                        "EU",
                        "--log-level",
                        "INFO",
                    ],
                    "env": {
                        "PORT_CLIENT_ID": "<PORT_CLIENT_ID>",
                        "PORT_CLIENT_SECRET": "<PORT_CLIENT_SECRET>",
                        "PORT_REGION": "EU",
                        "PORT_LOG_LEVEL": "INFO",
                        "PYTHONPATH": "~/.venv-port-mcp/bin/python"
                    }
                }
          }
        }
        ```
      </TabItem>
      
      <TabItem value="cursor" label="Cursor">
        Add the following configuration to your `mcp.json` file:

        ```json
        {
          "mcpServers": {
               "port-uvx": {
                    "command": "uvx",
                    "args": [
                        "mcp-server-port@0.2.8",
                        "--client-id",
                        "<PORT_CLIENT_ID>",
                        "--client-secret",
                        "<PORT_CLIENT_SECRET>",
                        "--region",
                        "EU",
                        "--log-level",
                        "INFO",
                    ],
                    "env": {
                        "PORT_CLIENT_ID": "<PORT_CLIENT_ID>",
                        "PORT_CLIENT_SECRET": "<PORT_CLIENT_SECRET>",
                        "PORT_REGION": "EU",
                        "PORT_LOG_LEVEL": "INFO",
                        "PYTHONPATH": "~/.venv-port-mcp/bin/python"
                    }
                }
          }
        }
        ```
      </TabItem>
    </Tabs>

    :::tip Region selection
    The example uses "EU" as the region. If your Port.io instance is in a different region, replace "EU" with the appropriate region value.
    :::
  </TabItem>
  
  <TabItem value="docker" label="Using Docker">
    If you prefer using Docker, follow these steps:

    1. Make sure Docker is installed and running on your system

    2. Configure your MCP server in your configuration file:

    <Tabs>
      <TabItem value="claude" label="Claude Desktop" default>
        Add the following configuration to your `claude_desktop_config.json` file:

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
                        "ghcr.io/port-labs/port-mcp-server:0.2.8"
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
      </TabItem>
      
      <TabItem value="cursor" label="Cursor">
        Add the following configuration to your `mcp.json` file:

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
                        "ghcr.io/port-labs/port-mcp-server:0.2.8"
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
      </TabItem>
    </Tabs>

    :::info Required substitutions
    Replace `<PORT_CLIENT_ID>`, `<PORT_CLIENT_SECRET>`, `<PORT_REGION>`, and `<PORT_LOG_LEVEL>` with your specific values.
    :::
  </TabItem>
</Tabs>

## Using the Port MCP Server

Once the Port MCP Server is set up, you can start using it to interact with your Port.io instance through natural language.

### Available tools and capabilities

The Port MCP Server provides access to several tool categories:

#### Blueprint Tools
- Get a list of all blueprints
- Retrieve information about specific blueprints
- Create, update, and delete blueprints

#### Entity Tools
- Get all entities for a given blueprint
- Retrieve specific entity information
- Create, update, and delete entities

#### Scorecard Tools
- Get all scorecards
- Retrieve specific scorecard information
- Create, update, and delete scorecards

#### AI Agent Tool
- Invoke Port AI agents with specific prompts

### Example queries

Here are some examples of queries you can use with the Port MCP Server:

<Tabs>
  <TabItem value="find" label="Finding Information" default>
    ```
    What services are currently in production?
    ```
    
    ```
    Show me all the microservices owned by the Backend team
    ```
    
    ```
    When was the last deployment of the payment service?
    ```
    
    ```
    List all Kubernetes clusters in our AWS environment
    ```
  </TabItem>
  
  <TabItem value="analyze" label="Analyzing Scorecards">
    ```
    Which services are failing our security requirements?
    ```
    
    ```
    What's preventing the inventory service from reaching Gold level?
    ```
    
    ```
    Show me the compliance status of all production services
    ```
    
    ```
    Which teams have the highest scorecard compliance?
    ```
  </TabItem>
  
  <TabItem value="create" label="Creating Resources">
    ```
    Create a new service blueprint with name, description, and owner properties
    ```
    
    ```
    Add a new scorecard called "API Quality" with Bronze, Silver, and Gold levels
    ```
    
    ```
    Create a rule that requires all services to have an SLO defined
    ```
    
    ```
    Update the Security scorecard to include a check for updated dependencies
    ```
  </TabItem>
</Tabs>

## Troubleshooting

If you encounter issues when setting up or using the Port MCP Server, try these troubleshooting steps:

1. **Authentication errors**:
   - Verify that your Port credentials are correct and have not expired
   - Ensure you have the necessary permissions in your Port.io account
   - Check that your credentials are correctly set in your configuration file

2. **Connection issues**:
   - Confirm that you have internet connectivity
   - Verify that the Port.io service is available
   - Check if your region setting matches your Port.io instance

3. **Command not found errors**:
   - For UVX: Ensure the virtual environment is activated
   - For Docker: Verify that Docker is running

:::info Support resources
If you continue to experience issues, consider reaching out to Port.io support or checking the [Port.io community forums](https://port.io/community) for assistance.
:::

## Additional resources

- [Port.io Documentation](https://docs.port.io/)
- [Port.io API Reference](https://docs.port.io/api-reference/port-api)
- [Port Labs GitHub](https://github.com/port-labs)
- [Roadmap & Feature Requests](https://roadmap.getport.io/ideas)

## Feedback

We're continuously improving the Port MCP Server and would love to hear from you! Please share your feedback and feature requests on our [roadmap page](https://roadmap.getport.io/ideas). 