import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import Prerequisites from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_helm_prerequisites_block.mdx"
import AdvancedConfig from '/docs/generalTemplates/_ocean_advanced_configuration_note.md'
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"

# Claude

Port's Claude integration allows you to ingest Claude API usage metrics into your software catalog using the [Ocean Custom Integration](/build-your-software-catalog/custom-integration/ocean-custom-integration/overview) framework.

<img src="/img/ai-agents/claudeDashboard.png" border="1px" width="100%" />


## Supported metrics

The Claude integration can ingest usage metrics from the Anthropic Admin API into Port:

**Available for all Claude organizations:**
- `claude_usage_record` - Organization-level usage metrics from `/v1/organizations/usage_report/messages` including token consumption (input/output/cache), request counts, and detailed breakdowns by workspace, user, and model.
- `claude_cost_record` - Cost tracking from `/v1/organizations/cost_report` for monitoring organizational spending.
- `claude_code_analytics` - Claude Code usage metrics from `/v1/organizations/usage_report/claude_code` including sessions, lines of code edited, commits, and pull requests (requires Claude Code access).

:::info Anthropic Admin API
The integration uses the [Anthropic Admin API](https://docs.anthropic.com/en/api/administration-api) to retrieve organization usage and cost data. You'll need an API key with appropriate permissions to access usage metrics and billing information. The Admin API provides detailed usage data grouped by workspace, user, model, and more.
:::


## Prerequisites

To use this integration, you need:

- An Anthropic Console API key with access to organization usage metrics.
- The API key should have permissions to read usage data and billing information.
- Access to the Anthropic Console at https://console.anthropic.com.



## Installation

Choose one of the following installation methods to deploy the Ocean Custom Integration:

<Tabs groupId="installation-methods" queryString="installation-methods">

<TabItem value="helm" label="Helm" default>

<h2> Prerequisites </h2>

<Prerequisites />

<h2> Installation </h2>

1. Add Port's Helm repo and install the Ocean Custom Integration:

:::note Replace placeholders
Remember to replace the placeholders for `YOUR_PORT_CLIENT_ID`, `YOUR_PORT_CLIENT_SECRET`, and `YOUR_ANTHROPIC_API_KEY`.
:::

```bash showLineNumbers
helm repo add --force-update port-labs https://port-labs.github.io/helm-charts
helm upgrade --install my-ocean-claude-integration port-labs/port-ocean \
  --set port.clientId="YOUR_PORT_CLIENT_ID" \
  --set port.clientSecret="YOUR_PORT_CLIENT_SECRET" \
  --set port.baseUrl="https://api.getport.io" \
  --set initializePortResources=true \
  --set scheduledResyncInterval=120 \
  --set integration.identifier="my-ocean-claude-integration" \
  --set integration.type="custom" \
  --set integration.eventListener.type="POLLING" \
  --set integration.config.baseUrl="https://api.anthropic.com" \
  --set integration.config.authType="bearer" \
  --set integration.config.paginationType="none" \
  --set integration.secrets.token="YOUR_ANTHROPIC_API_KEY"
```

<PortApiRegionTip/>

<h2> Configuration parameters </h2>

This table summarizes the available parameters for the installation.

| Parameter                          | Description                                                                                                                                                                                                                                                                                    | Example                          | Required |
|------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------|----------|
| `port.clientId`                    | Your Port [client id](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)                                                                                                                                                                  |                                  | ✅        |
| `port.clientSecret`                | Your Port [client secret](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)                                                                                                                                                              |                                  | ✅        |
| `port.baseUrl`                     | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US                                                                                                                                                                                                        |                                  | ✅        |
| `integration.config.baseUrl`       | The base URL of the Anthropic API instance                                                                                                                                                                           | https://api.anthropic.com | ✅        |
| `integration.config.authType`   | The authentication type for the API (use `bearer` for Anthropic)                                                                                                                                                                         | bearer                                  | ✅        |
| `integration.secrets.token`   | Your Anthropic Console API key                                                                                                                                                                         | sk-ant-api03-...                                  | ✅        |
| `integration.config.paginationType` | How your API handles pagination (offset, page, cursor, or none)                                                                                                                                                                         | none                                  | ❌        |
| `integration.eventListener.type`   | The event listener type. Read more about [event listeners](https://ocean.getport.io/framework/features/event-listener)                                                                                                                                                                         | POLLING                                  | ✅        |
| `integration.type`                 | The integration type (must be `custom` for Ocean Custom Integration)                                                                                                                                                                                                                                                                | custom                                  | ✅        |
| `integration.identifier`          | Unique identifier for the integration instance                                                                                                                                                                         | my-ocean-claude-integration                                  | ✅        |
| `scheduledResyncInterval`          | The number of minutes between each resync. When not set the integration will resync for each event listener resync event. Read more about [scheduledResyncInterval](https://ocean.getport.io/develop-an-integration/integration-configuration/#scheduledresyncinterval---run-scheduled-resync) | 120                                  | ❌        |
| `initializePortResources`          | Default true, When set to true the integration will create default blueprints and the port App config Mapping. Read more about [initializePortResources](https://ocean.getport.io/develop-an-integration/integration-configuration/#initializeportresources---initialize-port-resources)       | true                                  | ❌        |
| `sendRawDataExamples`              | Enable sending raw data examples from the third party API to port for testing and managing the integration mapping. Default is true                                                                                                                                                            | true                                  | ❌        |

<br/>

<AdvancedConfig/>

</TabItem>

<TabItem value="docker" label="Docker">

To run the integration using Docker for a one-time sync:

:::note Replace placeholders
Remember to replace the placeholders for `YOUR_PORT_CLIENT_ID`, `YOUR_PORT_CLIENT_SECRET`, and `YOUR_ANTHROPIC_API_KEY`.
:::

```bash showLineNumbers
docker run -i --rm --platform=linux/amd64 \
  -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
  -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
  -e OCEAN__SEND_RAW_DATA_EXAMPLES=true \
  -e OCEAN__INTEGRATION__CONFIG__BASE_URL="https://api.anthropic.com" \
  -e OCEAN__INTEGRATION__CONFIG__AUTH_TYPE="bearer" \
  -e OCEAN__INTEGRATION__CONFIG__PAGINATION_TYPE="none" \
  -e OCEAN__INTEGRATION__SECRETS__TOKEN="YOUR_ANTHROPIC_API_KEY" \
  -e OCEAN__PORT__CLIENT_ID="YOUR_PORT_CLIENT_ID" \
  -e OCEAN__PORT__CLIENT_SECRET="YOUR_PORT_CLIENT_SECRET" \
  -e OCEAN__PORT__BASE_URL="https://api.getport.io" \
  ghcr.io/port-labs/port-ocean-custom:latest
```

<PortApiRegionTip/>

<AdvancedConfig/>

</TabItem>

</Tabs>


## Set up data model

Before the integration can sync data, you need to create the required blueprints in Port. These blueprints define the data model for your Claude metrics.

**To create the blueprints:**

1. Go to your [Builder page](https://app.getport.io/settings/data-model).

2. Click on the `+ Blueprint` button.

3. Copy and paste each blueprint JSON from the sections below.

    <details>
    <summary><b>Claude Usage Record Blueprint (Click to expand)</b></summary>

    Organization-level daily usage metrics:

    ```json showLineNumbers
    {
      "identifier": "claude_usage_record",
      "description": "A daily summary record of Claude API usage for an organization",
      "title": "Claude Usage Record",
      "icon": "Anthropic",
      "schema": {
        "properties": {
          "record_date": { 
            "type": "string", 
            "format": "date-time", 
            "title": "Record Date (UTC)" 
            },
          "organization_id": { 
            "type": "string", 
            "title": "Organization ID" 
            },
          "organization_name": { 
            "type": "string", 
            "title": "Organization Name" 
            },
          "total_requests": { 
            "type": "number", 
            "title": "Total Requests" 
            },
          "successful_requests": { 
            "type": "number", 
            "title": "Successful Requests" 
            },
          "failed_requests": { 
            "type": "number", 
            "title": "Failed Requests" 
            },
          "total_input_tokens": { 
            "type": "number", 
            "title": "Total Input Tokens" 
            },
          "total_output_tokens": { 
            "type": "number", 
            "title": "Total Output Tokens" 
            },
          "total_cache_read_tokens": { 
            "type": "number", 
            "title": "Total Cache Read Tokens" 
            },
          "total_cache_write_tokens": { 
            "type": "number", 
            "title": "Total Cache Write Tokens" 
            },
          "total_cost_usd": { 
            "type": "number", 
            "title": "Total Cost (USD)" 
            },
          "most_used_model": { 
            "type": "string", 
            "title": "Most Used Model" 
            },
          "model_breakdown": { 
            "type": "object", 
            "title": "Model Usage Breakdown" 
            },
          "active_api_keys": { 
            "type": "number", 
            "title": "Active API Keys" 
            }
        },
        "required": ["record_date", "organization_id"]
      },
      "mirrorProperties": {},
      "calculationProperties": {
        "success_rate": {
          "title": "Success Rate",
          "description": "Percentage of successful API requests",
          "calculation": "if .properties.total_requests > 0 then (.properties.successful_requests / .properties.total_requests) * 100 else 0 end",
          "type": "number",
          "colorized": true,
          "colors": {
            "80": "red",
            "90": "orange",
            "95": "yellow",
            "98": "green"
          }
        },
        "total_tokens": {
          "title": "Total Tokens",
          "description": "Sum of input and output tokens",
          "calculation": ".properties.total_input_tokens + .properties.total_output_tokens",
          "type": "number"
        }
      },
      "aggregationProperties": {},
      "relations": {}
    }
    ```

    </details>

    <details>
    <summary><b>Claude Cost Record Blueprint (Click to expand)</b></summary>

    Cost tracking for organizational spending:

    ```json showLineNumbers
    {
      "identifier": "claude_cost_record",
      "description": "Daily cost tracking for Claude API usage",
      "title": "Claude Cost Record",
      "icon": "Anthropic",
      "schema": {
        "properties": {
          "record_date": {
            "type": "string",
            "format": "date-time",
            "title": "Record Date (UTC)"
          },
          "organization_id": {
            "type": "string",
            "title": "Organization ID"
          },
          "organization_name": {
            "type": "string",
            "title": "Organization Name"
          },
          "total_cost_usd": {
            "type": "number",
            "title": "Total Cost (USD)"
          },
          "cost_breakdown": {
            "type": "object",
            "title": "Cost Breakdown"
          }
        },
        "required": [
          "record_date",
          "organization_id"
        ]
      },
      "mirrorProperties": {},
      "calculationProperties": {},
      "aggregationProperties": {},
      "relations": {}
    }
    ```

    </details>

    <details>
    <summary><b>Claude User Activity Blueprint (Click to expand)</b></summary>

    User-level activity metrics:

    ```json showLineNumbers
    {
      "identifier": "claude_user_activity",
      "description": "User-level Claude API usage and activity metrics",
      "title": "Claude User Activity",
      "icon": "Anthropic",
      "schema": {
        "properties": {
          "record_date": {
            "type": "string",
            "format": "date-time",
            "title": "Record Date (UTC)"
          },
          "organization_id": {
            "type": "string",
            "title": "Organization ID"
          },
          "user_id": {
            "type": "string",
            "title": "User ID"
          },
          "user_email": {
            "type": "string",
            "title": "User Email"
          },
          "is_active": {
            "type": "boolean",
            "title": "Active User"
          },
          "total_requests": {
            "type": "number",
            "title": "Total Requests"
          },
          "successful_requests": {
            "type": "number",
            "title": "Successful Requests"
          },
          "failed_requests": {
            "type": "number",
            "title": "Failed Requests"
          },
          "input_tokens": {
            "type": "number",
            "title": "Input Tokens"
          },
          "output_tokens": {
            "type": "number",
            "title": "Output Tokens"
          },
          "cache_read_tokens": {
            "type": "number",
            "title": "Cache Read Tokens"
          },
          "cache_write_tokens": {
            "type": "number",
            "title": "Cache Write Tokens"
          },
          "cost_usd": {
            "type": "number",
            "title": "Cost (USD)"
          },
          "model_breakdown": {
            "type": "object",
            "title": "Model Usage Breakdown"
          }
        },
        "required": [
          "record_date",
          "organization_id",
          "user_id"
        ]
      },
      "mirrorProperties": {},
      "calculationProperties": {
        "success_rate": {
          "title": "Success Rate",
          "description": "Percentage of successful requests by this user",
          "calculation": "if .properties.total_requests > 0 then (.properties.successful_requests / .properties.total_requests) * 100 else 0 end",
          "type": "number",
          "colorized": true,
          "colors": {
            "80": "red",
            "90": "orange",
            "95": "yellow",
            "98": "green"
          }
        },
        "total_tokens": {
          "title": "Total Tokens",
          "calculation": ".properties.input_tokens + .properties.output_tokens",
          "type": "number"
        },
        "average_tokens_per_request": {
          "title": "Avg Tokens/Request",
          "calculation": "if .properties.total_requests > 0 then ((.properties.input_tokens + .properties.output_tokens) / .properties.total_requests) else 0 end",
          "type": "number"
        }
      },
      "aggregationProperties": {},
      "relations": {
        "user": {
          "title": "User",
          "target": "_user",
          "required": false,
          "many": false
        }
      }
    }
    ```

    </details>

    <details>
    <summary><b>Claude Model Usage Blueprint (Click to expand)</b></summary>

    Model-level usage statistics:

    ```json showLineNumbers
    {
      "identifier": "claude_model_usage",
      "description": "Usage metrics broken down by Claude model type",
      "title": "Claude Model Usage",
      "icon": "Anthropic",
      "schema": {
        "properties": {
          "record_date": {
            "type": "string",
            "format": "date-time",
            "title": "Record Date (UTC)"
          },
          "organization_id": {
            "type": "string",
            "title": "Organization ID"
          },
          "model_name": {
            "type": "string",
            "title": "Model Name"
          },
          "model_id": {
            "type": "string",
            "title": "Model ID"
          },
          "total_requests": {
            "type": "number",
            "title": "Total Requests"
          },
          "successful_requests": {
            "type": "number",
            "title": "Successful Requests"
          },
          "failed_requests": {
            "type": "number",
            "title": "Failed Requests"
          },
          "input_tokens": {
            "type": "number",
            "title": "Input Tokens"
          },
          "output_tokens": {
            "type": "number",
            "title": "Output Tokens"
          },
          "cache_read_tokens": {
            "type": "number",
            "title": "Cache Read Tokens"
          },
          "cache_write_tokens": {
            "type": "number",
            "title": "Cache Write Tokens"
          },
          "cost_usd": {
            "type": "number",
            "title": "Cost (USD)"
          }
        },
        "required": [
          "record_date",
          "organization_id",
          "model_name"
        ]
      },
      "mirrorProperties": {},
      "calculationProperties": {
        "success_rate": {
          "title": "Success Rate",
          "calculation": "if .properties.total_requests > 0 then (.properties.successful_requests / .properties.total_requests) * 100 else 0 end",
          "type": "number",
          "colorized": true,
          "colors": {
            "80": "red",
            "90": "orange",
            "95": "yellow",
            "98": "green"
          }
        },
        "total_tokens": {
          "title": "Total Tokens",
          "calculation": ".properties.input_tokens + .properties.output_tokens",
          "type": "number"
        },
        "average_tokens_per_request": {
          "title": "Avg Tokens/Request",
          "calculation": "if .properties.total_requests > 0 then ((.properties.input_tokens + .properties.output_tokens) / .properties.total_requests) else 0 end",
          "type": "number"
        }
      },
      "aggregationProperties": {},
      "relations": {}
    }
    ```

    </details>

    <details>
    <summary><b>Claude Code Analytics Blueprint (Click to expand)</b></summary>

    Claude Code usage metrics for tracking development activity:

    ```json showLineNumbers
    {
      "identifier": "claude_code_analytics",
      "description": "Daily Claude Code usage metrics including sessions, lines of code, commits, and PRs",
      "title": "Claude Code Analytics",
      "icon": "Anthropic",
      "schema": {
        "properties": {
          "record_date": {
            "type": "string",
            "format": "date-time",
            "title": "Record Date (UTC)"
          },
          "organization_id": {
            "type": "string",
            "title": "Organization ID"
          },
          "organization_name": {
            "type": "string",
            "title": "Organization Name"
          },
          "total_sessions": {
            "type": "number",
            "title": "Total Sessions"
          },
          "total_lines_edited": {
            "type": "number",
            "title": "Total Lines Edited"
          },
          "total_commits": {
            "type": "number",
            "title": "Total Commits"
          },
          "total_pull_requests": {
            "type": "number",
            "title": "Total Pull Requests"
          },
          "active_users": {
            "type": "number",
            "title": "Active Users"
          },
          "breakdown": {
            "type": "object",
            "title": "Usage Breakdown"
          }
        },
        "required": [
          "record_date",
          "organization_id"
        ]
      },
      "mirrorProperties": {},
      "calculationProperties": {
        "avg_lines_per_session": {
          "title": "Avg Lines/Session",
          "calculation": "if .properties.total_sessions > 0 then (.properties.total_lines_edited / .properties.total_sessions) else 0 end",
          "type": "number"
        },
        "avg_commits_per_user": {
          "title": "Avg Commits/User",
          "calculation": "if .properties.active_users > 0 then (.properties.total_commits / .properties.active_users) else 0 end",
          "type": "number"
        }
      },
      "aggregationProperties": {},
      "relations": {}
    }
    ```

    </details>

4. Click `Save` to save the blueprint.



## Configuration 

After installation, define which endpoints to sync in your integration configuration. Each resource maps an API endpoint to Port entities using [JQ expressions](https://stedolan.github.io/jq/manual/) to transform the data.

**Key mapping components:**
- **`kind`**: The API endpoint path (combined with your base URL).
- **`selector.query`**: JQ filter to include/exclude entities (use `'true'` to sync all).
- **`selector.data_path`**: JQ expression pointing to the array of items in the response.
- **`port.entity.mappings`**: How to map API fields to Port entity properties.

For more details on how the Ocean Custom Integration works, see the [How it works](https://docs.port.io/build-your-software-catalog/custom-integration/ocean-custom-integration/overview#how-it-works) section in the custom integration overview.


**To configure the mappings:**

1. Go to your [data sources page](https://app.getport.io/settings/data-sources).

2. Find your Claude integration in the list.

3. Click on the integration to open the mapping editor.

4. Add the resource mapping configurations below.

    <details>
    <summary><b>Organization usage metrics mapping (Click to expand)</b></summary>

    This endpoint provides detailed usage metrics including token consumption and request counts:

    ```yaml showLineNumbers
    resources:
      - kind: /v1/organizations/usage_report/messages
        selector:
          query: 'true'
          method: POST
          body: '{"start_date": ((now | floor) - (86400 * 30)) | strftime("%Y-%m-%d"), "end_date": (now | floor) | strftime("%Y-%m-%d"), "granularity": "day"}'
          data_path: '.data'  
        port:
          entity:
            mappings:
              identifier: .organization_id + "@" + .date
              title: "Claude Usage - " + .date
              blueprint: '"claude_usage_record"'
              properties:
                record_date: .date + "T00:00:00Z"
                organization_id: .organization_id
                organization_name: .organization_name
                total_requests: .total_requests
                successful_requests: .successful_requests
                failed_requests: (.total_requests - .successful_requests)
                total_input_tokens: .input_tokens
                total_output_tokens: .output_tokens
                total_cache_read_tokens: .cache_read_input_tokens
                total_cache_write_tokens: .cache_creation_input_tokens
                total_cost_usd: .cost_usd
                model_breakdown: .model_breakdown
    ```

    :::tip Group by dimensions
    The usage report API supports grouping by `workspace_id`, `user_id`, and `model_id`. You can create separate mappings for workspace-level and user-level metrics by including these dimensions in the request body.
    :::

    </details>

    <details>
    <summary><b>Cost report mapping (Click to expand)</b></summary>

    This endpoint provides cost data for monitoring organizational spending:

    ```yaml showLineNumbers
    resources:
      - kind: /v1/organizations/cost_report
        selector:
          query: 'true'
          method: POST
          body: '{"start_date": ((now | floor) - (86400 * 30)) | strftime("%Y-%m-%d"), "end_date": (now | floor) | strftime("%Y-%m-%d"), "granularity": "day"}'
          data_path: '.data'  
        port:
          entity:
            mappings:
              identifier: .organization_id + "@cost@" + .date
              title: "Claude Cost - " + .date
              blueprint: '"claude_cost_record"'
              properties:
                record_date: .date + "T00:00:00Z"
                organization_id: .organization_id
                organization_name: .organization_name
                total_cost_usd: .cost_usd
                cost_breakdown: .cost_breakdown
    ```

    </details>

    <details>
    <summary><b>User-level usage metrics mapping (Click to expand)</b></summary>

    Track usage metrics at the user level by grouping the usage report by `user_id`:

    ```yaml showLineNumbers
    resources:
      - kind: /v1/organizations/usage_report/messages
        selector:
          query: 'true'
          method: POST
          body: '{"start_date": ((now | floor) - (86400 * 30)) | strftime("%Y-%m-%d"), "end_date": (now | floor) | strftime("%Y-%m-%d"), "granularity": "day", "group_by": ["user_id"]}'
          data_path: '.data'  
        port:
          entity:
            mappings:
              identifier: .user_id + "@" + .date
              title: .user_email + " - " + .date
              blueprint: '"claude_user_activity"'
              properties:
                record_date: .date + "T00:00:00Z"
                organization_id: .organization_id
                user_id: .user_id
                user_email: .user_email
                is_active: 'if .total_requests > 0 then true else false end'
                total_requests: .total_requests
                successful_requests: .successful_requests
                failed_requests: (.total_requests - .successful_requests)
                input_tokens: .input_tokens
                output_tokens: .output_tokens
                cache_read_tokens: .cache_read_input_tokens
                cache_write_tokens: .cache_creation_input_tokens
                cost_usd: .cost_usd
                model_breakdown: .model_breakdown
              relations:
                user: .user_email
    ```

    </details>

    <details>
    <summary><b>Model-level usage metrics mapping (Click to expand)</b></summary>

    Track usage metrics at the model level by grouping the usage report by `model_id`:

    ```yaml showLineNumbers
    resources:
      - kind: /v1/organizations/usage_report/messages
        selector:
          query: 'true'
          method: POST
          body: '{"start_date": ((now | floor) - (86400 * 30)) | strftime("%Y-%m-%d"), "end_date": (now | floor) | strftime("%Y-%m-%d"), "granularity": "day", "group_by": ["model_id"]}'
          data_path: '.data'  
        port:
          entity:
            mappings:
              identifier: .model_id + "@" + .date
              title: .model_name + " usage - " + .date
              blueprint: '"claude_model_usage"'
              properties:
                record_date: .date + "T00:00:00Z"
                organization_id: .organization_id
                model_name: .model_name
                model_id: .model_id
                total_requests: .total_requests
                successful_requests: .successful_requests
                failed_requests: (.total_requests - .successful_requests)
                input_tokens: .input_tokens
                output_tokens: .output_tokens
                cache_read_tokens: .cache_read_input_tokens
                cache_write_tokens: .cache_creation_input_tokens
                cost_usd: .cost_usd
    ```

    </details>

    <details>
    <summary><b>Claude Code analytics mapping (Click to expand)</b></summary>

    Track Claude Code usage metrics including sessions, lines of code, commits, and pull requests:

    :::info Requires Claude Code access
    This endpoint requires access to Claude Code. You'll receive an error if your organization doesn't have Claude Code enabled.
    :::

    ```yaml showLineNumbers
    resources:
      - kind: /v1/organizations/usage_report/claude_code
        selector:
          query: 'true'
          method: POST
          body: '{"start_date": ((now | floor) - (86400 * 30)) | strftime("%Y-%m-%d"), "end_date": (now | floor) | strftime("%Y-%m-%d"), "granularity": "day"}'
          data_path: '.data'  
        port:
          entity:
            mappings:
              identifier: .organization_id + "@code@" + .date
              title: "Claude Code Analytics - " + .date
              blueprint: '"claude_code_analytics"'
              properties:
                record_date: .date + "T00:00:00Z"
                organization_id: .organization_id
                organization_name: .organization_name
                total_sessions: .sessions
                total_lines_edited: .lines_of_code_edited
                total_commits: .commits
                total_pull_requests: .pull_requests
                active_users: .active_users
                breakdown: .breakdown
    ```

    </details>

5. Click `Save` to save the mapping.



## Customization

If you want to customize your setup or test different API endpoints before committing to a configuration, use the [interactive builder](/build-your-software-catalog/custom-integration/ocean-custom-integration/build-your-integration).

**The interactive builder helps you:**
1. Test your Claude API endpoints with live data.
2. Automatically detect the data structure and field types.
3. Generate blueprints and resource mappings tailored to your preferences.
4. Get installation commands with your configuration pre-filled.

Simply provide your Anthropic API details, and the builder will generate everything you need to install and create the integration in Port.


## Visualize Claude metrics

Once your Claude data is synced to Port, you can create dashboards to monitor API usage, track costs, analyze model performance, and measure user activity. This section shows you how to build insightful visualizations using Port's dashboard widgets.

<img src="/img/ai-agents/claudeMetrics.png" border="1px" width="100%" />

### Create a dashboard

1. Navigate to your [software catalog](https://app.getport.io/organization/catalog).

2. Click on the **`+ New`** button in the left sidebar.

3. Select **New dashboard**.

4. Name the dashboard **Claude AI Insights**.

5. Input `Monitor Claude API usage, costs, and performance metrics` under **Description**.

6. Select the `Anthropic` icon.

7. Click `Create`.

You now have a blank dashboard where you can add widgets to visualize your Claude metrics.

### Add widgets

Create the following widgets to gain insights into your Claude API usage:

<h3>Total API Requests</h3>

1. Click on **`+ Widget`** and select **Number Chart**.

2. Fill in the following details:
   - **Title**: `Total API Requests`.

   - **Description**: `Total number of Claude API requests`.

   - **Icon**: `Api`.

   - **Blueprint**: `claude_usage_record`.

   - **Chart type**: Select `Aggregate by property`.

   - **Property**: `total_requests`.

   - **Function**: `Sum`.

3. Click **Save**.

<h3>Total Cost</h3>

1. Click on **`+ Widget`** and select **Number Chart**.

2. Fill in the following details:

   - **Title**: `Total Cost (USD)`.

   - **Description**: `Total cost of Claude API usage`.

   - **Icon**: `DollarSign`.

   - **Blueprint**: `claude_usage_record`.

   - **Chart type**: Select `Aggregate by property`.

   - **Property**: `total_cost_usd`.

   - **Function**: `Sum`.

3. Click **Save**.

<h3>API Success Rate</h3>

1. Click on **`+ Widget`** and select **Number Chart**.

2. Fill in the following details:

   - **Title**: `API Success Rate`.

   - **Description**: `Overall success rate of API requests`.

   - **Blueprint**: `claude_usage_record`.

   - **Chart type**: Select `Aggregate by property`.

   - **Property**: `success_rate`.

   - **Function**: `Average`.

3. Click **Save**.

<h3>Token Usage Over Time</h3>

1. Click on **`+ Widget`** and select **Line Chart**.

2. Fill in the following details:

   - **Title**: `Token Usage Over Time`.

   - **Description**: `Track input and output token consumption`.

   - **Icon**: `LineChart`.

   - **Blueprint**: `claude_usage_record`.

   - **Chart type**: Select `Aggregate by property`.
   
   - **Property**: `total_input_tokens`, `total_output_tokens`.
   
   - **Function**: `Sum`.
   
   - **Time interval**: `Week`.
   
   - **Time range**: `In the past 30 days`.
   
   - **Measure time by**: `record_date`.

3. Click **Save**.

<h3>Daily Cost Trends</h3>

1. Click on **`+ Widget`** and select **Line Chart**.

2. Fill in the following details:

   - **Title**: `Daily Cost Trends`.

   - **Description**: `Track API costs over time`.
   
   - **Icon**: `LineChart`. 

   - **Blueprint**: `claude_usage_record`.

   - **Chart type**: Select `Aggregate by property`.
   
   - **Property**: `total_cost_usd`.
   
   - **Function**: `Sum`.

   - **Time interval**: `Week`.
   
   - **Time range**: `In the past 30 days`.
   
   - **Measure time by**: `record_date`.

3. Click **Save**.

<h3>Model Usage Distribution</h3>

1. Click on **`+ Widget`** and select **Pie Chart**.

2. Fill in the following details:

   - **Title**: `Model Usage Distribution`.

   - **Description**: `Which Claude models are being used most frequently`.
   
   - **Icon**: `Pie`.

   - **Blueprint**: `claude_model_usage`.

   - **Property**: `model_name`.

   - **Chart type**: Select `Aggregate by property`.

   - **Function**: `Sum`.

   - **Aggregate property**: `total_requests`.

3. Click **Save**.

<h3>Request Success vs Failure Rate</h3>

1. Click on **`+ Widget`** and select **Line Chart**.

2. Fill in the following details:

   - **Title**: `Request Success vs Failure Rate`.

   - **Description**: `Monitor API reliability over time`.
   
   - **Icon**: `LineChart`.

   - **Blueprint**: `claude_usage_record`.

   - **Chart type**: Select `Aggregate by property`.
   
   - **Property**: `successful_requests`, `failed_requests`.
   
   - **Function**: `Sum`.
   
   - **Time interval**: `Week`.
   
   - **Time range**: `In the past 30 days`.
   
   - **Measure time by**: `record_date`.

3. Click **Save**.

<h3>User Activity Breakdown</h3>

1. Click on **`+ Widget`** and select **Table**.

2. Fill in the following details:

   - **Title**: `User Activity Breakdown`.
   
   - **Description**: `Detailed view of individual user API usage patterns`.

   - **Icon**: `Table`.
   
   - **Blueprint**: `claude_user_activity`.
   
3. In the **Displayed properties** section, select the following columns:
   - `$identifier`
   - `$title`
   - `user_email`
   - `total_requests`
   - `success_rate`
   - `total_tokens`
   - `cost_usd`
   - `most_used_model`
   - `record_date`

4. Click **Save**.

<h3>Claude Code Activity</h3>

1. Click on **`+ Widget`** and select **Line Chart**.

2. Fill in the following details:

   - **Title**: `Claude Code Activity`.
   
   - **Description**: `Track Claude Code sessions, commits, and PRs over time`.

   - **Icon**: `LineChart`.
   
   - **Blueprint**: `claude_code_analytics`.
   
   - **Chart type**: Select `Aggregate by property`.
   
   - **Property**: `total_sessions`, `total_commits`, `total_pull_requests`.
   
   - **Function**: `Sum`.
   
   - **Time interval**: `Week`.
   
   - **Time range**: `In the past 30 days`.
   
   - **Measure time by**: `record_date`.

3. Click **Save**.

<h3>Cache Efficiency</h3>

1. Click on **`+ Widget`** and select **Line Chart**.

2. Fill in the following details:

   - **Title**: `Cache Efficiency`.

   - **Description**: `Track cache read vs write tokens for cost optimization`.
   
   - **Icon**: `LineChart`.

   - **Blueprint**: `claude_usage_record`.

   - **Chart type**: Select `Aggregate by property`.
   
   - **Property**: `total_cache_read_tokens`, `total_cache_write_tokens`.
   
   - **Function**: `Sum`.
   
   - **Time interval**: `Week`.
   
   - **Time range**: `In the past 30 days`.
   
   - **Measure time by**: `record_date`.

3. Click **Save**.

