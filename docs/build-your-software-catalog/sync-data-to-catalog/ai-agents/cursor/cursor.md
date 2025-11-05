import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import Prerequisites from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_helm_prerequisites_block.mdx"
import AdvancedConfig from '/docs/generalTemplates/_ocean_advanced_configuration_note.md'
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"

# Cursor

Port's Cursor integration allows you to ingest Cursor usage metrics into your software catalog using the [Ocean Custom Integration](/build-your-software-catalog/custom-integration/ocean-custom-integration/overview) framework.


## Supported metrics

The Cursor integration can ingest various usage and AI code tracking metrics into Port. The metrics are organized into the following categories:

**Daily Usage Metrics** - Daily sync and backfill from Cursor Admin API with aggregation per day (UTC):
- `cursor_usage_record` - Organization-level daily metrics.
- `cursor_user_usage_record` - User-level daily metrics.  
- `cursor_team_usage_record` - Team-level daily metrics.

**AI Code Tracking** - Individual commit records and aggregations from Cursor AI Code Tracking API:
- `cursor_commit_record` - Individual commits with full metadata and AI assistance breakdown.
- `cursor_daily_commit_record` - Daily aggregated commit statistics by user.
- `cursor_ai_code_change_record` - Daily aggregated AI-generated code changes by user.

## Prerequisites

To use this integration, you need:

- A Cursor API token with appropriate permissions to access usage metrics.
- The token should have read access to organization or team usage data.



## Installation

Choose one of the following installation methods to deploy the Ocean Custom Integration:

<Tabs groupId="installation-methods" queryString="installation-methods">

<TabItem value="helm" label="Helm" default>

<h2> Prerequisites </h2>

<Prerequisites />

<h2> Installation </h2>

1. Add Port's Helm repo and install the Ocean Custom Integration:

:::note Replace placeholders
Remember to replace the placeholders for `YOUR_PORT_CLIENT_ID`, `YOUR_PORT_CLIENT_SECRET`, `CURSOR_API_TOKEN`, and `CURSOR_API_BASE_URL`.
:::

```bash showLineNumbers
helm repo add --force-update port-labs https://port-labs.github.io/helm-charts
helm upgrade --install my-ocean-cursor-integration port-labs/port-ocean \
  --set port.clientId="YOUR_PORT_CLIENT_ID" \
  --set port.clientSecret="YOUR_PORT_CLIENT_SECRET" \
  --set port.baseUrl="https://api.getport.io" \
  --set initializePortResources=true \
  --set scheduledResyncInterval=120 \
  --set integration.identifier="my-ocean-cursor-integration" \
  --set integration.type="custom" \
  --set integration.eventListener.type="POLLING" \
  --set integration.config.baseUrl="CURSOR_API_BASE_URL" \
  --set integration.config.authType="bearer_token" \
  --set integration.config.paginationType="none" \
  --set integration.secrets.authValue="CURSOR_API_TOKEN"
```

<PortApiRegionTip/>

<h2> Configuration parameters </h2>

This table summarizes the available parameters for the installation.

| Parameter                          | Description                                                                                                                                                                                                                                                                                    | Example                          | Required |
|------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------|----------|
| `port.clientId`                    | Your Port [client id](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)                                                                                                                                                                  |                                  | ✅        |
| `port.clientSecret`                | Your Port [client secret](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)                                                                                                                                                              |                                  | ✅        |
| `port.baseUrl`                     | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US                                                                                                                                                                                                        |                                  | ✅        |
| `integration.secrets.authValue` | Cursor API token used to authenticate with the Cursor API                                                                                                                               |                                  | ✅        |
| `integration.config.baseUrl`       | The base URL of the Cursor API instance                                                                                                                                                                           | https://api.cursor.com | ✅        |
| `integration.config.authType`   | The authentication type for the API (bearer_token, api_key, basic_auth, or none)                                                                                                                                                                         | bearer_token                                  | ✅        |
| `integration.config.paginationType` | How your API handles pagination (offset, page, cursor, or none)                                                                                                                                                                         | none                                  | ❌        |
| `integration.eventListener.type`   | The event listener type. Read more about [event listeners](https://ocean.getport.io/framework/features/event-listener)                                                                                                                                                                         | POLLING                                  | ✅        |
| `integration.type`                 | The integration type (must be `custom` for Ocean Custom Integration)                                                                                                                                                                                                                                                                | custom                                  | ✅        |
| `integration.identifier`          | Unique identifier for the integration instance                                                                                                                                                                         | my-ocean-cursor-integration                                  | ✅        |
| `scheduledResyncInterval`          | The number of minutes between each resync. When not set the integration will resync for each event listener resync event. Read more about [scheduledResyncInterval](https://ocean.getport.io/develop-an-integration/integration-configuration/#scheduledresyncinterval---run-scheduled-resync) | 120                                  | ❌        |
| `initializePortResources`          | Default true, When set to true the integration will create default blueprints and the port App config Mapping. Read more about [initializePortResources](https://ocean.getport.io/develop-an-integration/integration-configuration/#initializeportresources---initialize-port-resources)       | true                                  | ❌        |
| `sendRawDataExamples`              | Enable sending raw data examples from the third party API to port for testing and managing the integration mapping. Default is true                                                                                                                                                            | true                                  | ❌        |

<br/>

<AdvancedConfig/>

</TabItem>

<TabItem value="docker" label="Docker">

To run the integration using Docker for a one-time sync:

:::note Replace placeholders
Remember to replace the placeholders for `YOUR_PORT_CLIENT_ID`, `YOUR_PORT_CLIENT_SECRET`, `CURSOR_API_TOKEN`, and `CURSOR_API_BASE_URL`.
:::

```bash showLineNumbers
docker run -i --rm --platform=linux/amd64 \
  -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
  -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
  -e OCEAN__SEND_RAW_DATA_EXAMPLES=true \
  -e OCEAN__INTEGRATION__CONFIG__BASE_URL="CURSOR_API_BASE_URL" \
  -e OCEAN__INTEGRATION__CONFIG__AUTH_TYPE="bearer_token" \
  -e OCEAN__INTEGRATION__CONFIG__PAGINATION_TYPE="none" \
  -e OCEAN__INTEGRATION__SECRETS__AUTH_VALUE="CURSOR_API_TOKEN" \
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

Before the integration can sync data, you need to create the required blueprints in Port. These blueprints define the data model for your Cursor metrics.

**To create the blueprints:**

1. Go to your [Builder page](https://app.getport.io/settings/data-model).

2. Click on the `+ Blueprint` button.

3. Copy and paste each blueprint JSON from the sections below.

    <details>
    <summary><b>Cursor Usage Record Blueprint (Click to expand)</b></summary>

    Organization-level daily usage metrics:

    ```json showLineNumbers
    {
      "identifier": "cursor_usage_record",
      "description": "A daily summary record of Cursor usage for an organization (UTC)",
      "title": "Cursor Usage Record",
      "icon": "AI",
      "schema": {
        "properties": {
          "record_date": { 
            "type": "string", 
            "format": "date-time", 
            "title": "Record Date (UTC)" 
            },
          "org": { 
            "type": "string", 
            "title": "Organization" 
            },
          "total_accepts": { 
            "type": "number", 
            "title": "Total Accepts" 
            },
          "total_rejects": { 
            "type": "number", 
            "title": "Total Rejects" 
            },
          "total_tabs_shown": { 
            "type": "number", 
            "title": "Total Tabs Shown" 
            },
          "total_tabs_accepted": { 
            "type": "number", 
            "title": "Total Tabs Accepted" 
            },
          "total_lines_added": { 
            "type": "number", 
            "title": "Total Lines Added" 
            },
          "total_lines_deleted": { 
            "type": "number", 
            "title": "Total Lines Deleted" 
            },
          "accepted_lines_added": { 
            "type": "number", 
            "title": "Accepted Lines Added" 
            },
          "accepted_lines_deleted": { 
            "type": "number", 
            "title": "Accepted Lines Deleted" 
            },
          "composer_requests": { 
            "type": "number", 
            "title": "Composer Requests" 
            },
          "chat_requests": { 
            "type": "number", 
            "title": "Chat Requests" 
            },
          "agent_requests": { 
            "type": "number", 
            "title": "Agent Requests" 
            },
          "subscription_included_reqs": { 
            "type": "number", 
            "title": "Subscription Included Requests" 
            },
          "api_key_reqs": { 
            "type": "number", 
            "title": "API Key Requests" 
            },
          "usage_based_reqs": { 
            "type": "number", 
            "title": "Usage-based Requests" 
            },
          "bugbot_usages": { 
            "type": "number", 
            "title": "Bugbot Usages"
            },
          "most_used_model": { 
            "type": "string", 
            "title": "Most Used Model" 
            },
          "total_active_users": { 
            "type": "number", 
            "title": "Total Active Users" 
            },
          "total_input_tokens": { 
            "type": "number", 
            "title": "Total Input Tokens" 
            },
          "total_output_tokens": { 
            "type": "number", 
            "title": "Total Output Tokens" 
            },
          "total_cache_write_tokens": { 
            "type": "number", 
            "title": "Total Cache Write Tokens" 
            },
          "total_cache_read_tokens": { 
            "type": "number", 
            "title": "Total Cache Read Tokens" 
            },
          "total_cents": { 
            "type": "number", 
            "title": "Total Cost (cents)" 
            },
          "breakdown": { 
            "type": "object", 
            "title": "Breakdown" 
            }
        },
        "required": ["record_date", "org"]
      },
      "mirrorProperties": {},
      "calculationProperties": {
        "acceptance_rate": {
          "title": "Acceptance Rate",
          "description": "Percentage of AI suggestions that were accepted",
          "calculation": "if (.properties.total_accepts + .properties.total_rejects) > 0 then (.properties.total_accepts / (.properties.total_accepts + .properties.total_rejects)) * 100 else 0 end",
          "type": "number",
          "colorized": true,
          "colors": {
            "25": "red",
            "50": "orange",
            "75": "yellow",
            "90": "green"
          }
        }
      },
      "aggregationProperties": {},
      "relations": {}
    }
    ```

    </details>

    <details>
    <summary><b>Cursor User Usage Record Blueprint (Click to expand)</b></summary>

    User-level daily usage metrics:

    ```json showLineNumbers
    {
      "identifier": "cursor_user_usage_record",
      "description": "A daily summary record of Cursor usage for a single user (UTC)",
      "title": "Cursor User Usage Record",
      "icon": "User",
      "schema": {
        "properties": {
          "record_date": {
            "type": "string",
            "format": "date-time",
            "title": "Record Date (UTC)"
          },
          "org": {
            "type": "string",
            "title": "Organization"
          },
          "email": {
            "type": "string",
            "title": "User Email"
          },
          "is_active": {
            "type": "boolean",
            "title": "Active"
          },
          "total_accepts": {
            "type": "number",
            "title": "Total Accepts"
          },
          "total_rejects": {
            "type": "number",
            "title": "Total Rejects"
          },
          "total_tabs_shown": {
            "type": "number",
            "title": "Total Tabs Shown"
          },
          "total_tabs_accepted": {
            "type": "number",
            "title": "Total Tabs Accepted"
          },
          "total_lines_added": {
            "type": "number",
            "title": "Total Lines Added"
          },
          "total_lines_deleted": {
            "type": "number",
            "title": "Total Lines Deleted"
          },
          "accepted_lines_added": {
            "type": "number",
            "title": "Accepted Lines Added"
          },
          "accepted_lines_deleted": {
            "type": "number",
            "title": "Accepted Lines Deleted"
          },
          "composer_requests": {
            "type": "number",
            "title": "Composer Requests"
          },
          "chat_requests": {
            "type": "number",
            "title": "Chat Requests"
          },
          "agent_requests": {
            "type": "number",
            "title": "Agent Requests"
          },
          "subscription_included_reqs": {
            "type": "number",
            "title": "Subscription Included Requests"
          },
          "api_key_reqs": {
            "type": "number",
            "title": "API Key Requests"
          },
          "usage_based_reqs": {
            "type": "number",
            "title": "Usage-based Requests"
          },
          "bugbot_usages": {
            "type": "number",
            "title": "Bugbot Usages"
          },
          "most_used_model": {
            "type": "string",
            "title": "Most Used Model"
          },
          "input_tokens": {
            "type": "number",
            "title": "Input Tokens"
          },
          "output_tokens": {
            "type": "number",
            "title": "Output Tokens"
          },
          "cache_write_tokens": {
            "type": "number",
            "title": "Cache Write Tokens"
          },
          "cache_read_tokens": {
            "type": "number",
            "title": "Cache Read Tokens"
          },
          "total_cents": {
            "type": "number",
            "title": "Total Cost (cents)"
          },
          "breakdown": {
            "type": "object",
            "title": "Breakdown"
          }
        },
        "required": [
          "record_date",
          "org",
          "email"
        ]
      },
      "mirrorProperties": {},
      "calculationProperties": {
        "acceptance_rate": {
          "title": "Acceptance Rate",
          "description": "Percentage of AI suggestions that were accepted by this user",
          "calculation": "if (.properties.total_accepts + .properties.total_rejects) > 0 then (.properties.total_accepts / (.properties.total_accepts + .properties.total_rejects)) * 100 else 0 end",
          "type": "number",
          "colorized": true,
          "colors": {
            "25": "red",
            "50": "orange",
            "75": "yellow",
            "90": "green"
          }
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
    <summary><b>Cursor Team Usage Record Blueprint (Click to expand)</b></summary>

    Team-level daily usage metrics:

    ```json showLineNumbers
    {
      "identifier": "cursor_team_usage_record",
      "description": "A daily summary record of Cursor usage for a team (UTC)",
      "title": "Cursor Team Usage Record",
      "icon": "Team",
      "schema": {
        "properties": {
          "record_date": {
            "type": "string",
            "format": "date-time",
            "title": "Record Date (UTC)"
          },
          "org": {
            "type": "string",
            "title": "Organization"
          },
          "team": {
            "type": "string",
            "title": "Team"
          },
          "total_accepts": {
            "type": "number",
            "title": "Total Accepts"
          },
          "total_rejects": {
            "type": "number",
            "title": "Total Rejects"
          },
          "total_tabs_shown": {
            "type": "number",
            "title": "Total Tabs Shown"
          },
          "total_tabs_accepted": {
            "type": "number",
            "title": "Total Tabs Accepted"
          },
          "total_lines_added": {
            "type": "number",
            "title": "Total Lines Added"
          },
          "total_lines_deleted": {
            "type": "number",
            "title": "Total Lines Deleted"
          },
          "accepted_lines_added": {
            "type": "number",
            "title": "Accepted Lines Added"
          },
          "accepted_lines_deleted": {
            "type": "number",
            "title": "Accepted Lines Deleted"
          },
          "composer_requests": {
            "type": "number",
            "title": "Composer Requests"
          },
          "chat_requests": {
            "type": "number",
            "title": "Chat Requests"
          },
          "agent_requests": {
            "type": "number",
            "title": "Agent Requests"
          },
          "subscription_included_reqs": {
            "type": "number",
            "title": "Subscription Included Requests"
          },
          "api_key_reqs": {
            "type": "number",
            "title": "API Key Requests"
          },
          "usage_based_reqs": {
            "type": "number",
            "title": "Usage-based Requests"
          },
          "bugbot_usages": {
            "type": "number",
            "title": "Bugbot Usages"
          },
          "most_used_model": {
            "type": "string",
            "title": "Most Used Model"
          },
          "total_active_users": {
            "type": "number",
            "title": "Total Active Users"
          },
          "input_tokens": {
            "type": "number",
            "title": "Input Tokens"
          },
          "output_tokens": {
            "type": "number",
            "title": "Output Tokens"
          },
          "cache_write_tokens": {
            "type": "number",
            "title": "Cache Write Tokens"
          },
          "cache_read_tokens": {
            "type": "number",
            "title": "Cache Read Tokens"
          },
          "total_cents": {
            "type": "number",
            "title": "Total Cost (cents)"
          },
          "breakdown": {
            "type": "object",
            "title": "Breakdown"
          }
        },
        "required": [
          "record_date",
          "org",
          "team"
        ]
      },
      "mirrorProperties": {},
      "calculationProperties": {
        "acceptance_rate": {
          "title": "Acceptance Rate",
          "description": "Percentage of AI suggestions that were accepted by this team",
          "calculation": "if (.properties.total_accepts + .properties.total_rejects) > 0 then (.properties.total_accepts / (.properties.total_accepts + .properties.total_rejects)) * 100 else 0 end",
          "type": "number",
          "colorized": true,
          "colors": {
            "25": "red",
            "50": "orange",
            "75": "yellow",
            "90": "green"
          }
        }
      },
      "aggregationProperties": {},
      "relations": {
        "team_members": {
          "title": "Team Members",
          "target": "cursor_user_usage_record",
          "many": true,
          "required": false
        }
      }
    }
    ```

    </details>

    <details>
    <summary><b>Cursor Commit Record Blueprint (Click to expand)</b></summary>

    Individual commit tracking with AI assistance breakdown:

    ```json showLineNumbers
    {
      "identifier": "cursor_commit_record",
      "description": "Individual AI-generated commit record with full details",
      "title": "Cursor Commit Record",
      "icon": "Git",
      "schema": {
        "properties": {
          "commitHash": {
            "type": "string",
            "title": "Commit Hash"
          },
          "userId": {
            "type": "string",
            "title": "User ID"
          },
          "userEmail": {
            "type": "string",
            "title": "User Email"
          },
          "repoName": {
            "type": "string",
            "title": "Repository Name"
          },
          "branchName": {
            "type": "string",
            "title": "Branch Name"
          },
          "isPrimaryBranch": {
            "type": "boolean",
            "title": "Is Primary Branch"
          },
          "totalLinesAdded": {
            "type": "number",
            "title": "Total Lines Added"
          },
          "totalLinesDeleted": {
            "type": "number",
            "title": "Total Lines Deleted"
          },
          "tabLinesAdded": {
            "type": "number",
            "title": "TAB Lines Added"
          },
          "tabLinesDeleted": {
            "type": "number",
            "title": "TAB Lines Deleted"
          },
          "composerLinesAdded": {
            "type": "number",
            "title": "Composer Lines Added"
          },
          "composerLinesDeleted": {
            "type": "number",
            "title": "Composer Lines Deleted"
          },
          "nonAiLinesAdded": {
            "type": "number",
            "title": "Non-AI Lines Added"
          },
          "nonAiLinesDeleted": {
            "type": "number",
            "title": "Non-AI Lines Deleted"
          },
          "message": {
            "type": "string",
            "title": "Commit Message"
          },
          "commitTs": {
            "type": "string",
            "format": "date-time",
            "title": "Commit Timestamp"
          },
          "createdAt": {
            "type": "string",
            "format": "date-time",
            "title": "Created At"
          },
          "org": {
            "type": "string",
            "title": "Organization"
          }
        },
        "required": [
          "commitHash",
          "userId",
          "userEmail",
          "repoName",
          "branchName",
          "org"
        ]
      },
      "mirrorProperties": {},
      "calculationProperties": {
        "ai_assistance_percentage": {
          "title": "AI Assistance %",
          "calculation": "if (.properties.totalLinesAdded + .properties.totalLinesDeleted) == 0 then 0 else ((.properties.tabLinesAdded + .properties.tabLinesDeleted + .properties.composerLinesAdded + .properties.composerLinesDeleted) / (.properties.totalLinesAdded + .properties.totalLinesDeleted)) * 100 end",
          "type": "number"
        },
        "total_ai_lines": {
          "title": "Total AI Lines Changed",
          "calculation": ".properties.tabLinesAdded + .properties.tabLinesDeleted + .properties.composerLinesAdded + .properties.composerLinesDeleted",
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
        },
        "repository": {
          "title": "Repository",
          "target": "service",
          "required": false,
          "many": false
        },
        "githubPullRequest": {
          "title": "GitHub Pull Request",
          "target": "githubPullRequest",
          "required": false,
          "many": false
        }
      }
    }
    ```

    </details>

    <details>
    <summary><b>Cursor Daily Commit Record Blueprint (Click to expand)</b></summary>

    Daily aggregated commit statistics by user:

    ```json showLineNumbers
    {
      "identifier": "cursor_daily_commit_record",
      "description": "A daily aggregated record of AI-generated commits by user",
      "title": "Cursor Daily Commit Record",
      "icon": "Git",
      "schema": {
        "properties": {
          "record_date": {
            "type": "string",
            "format": "date-time",
            "title": "Record Date (UTC)"
          },
          "org": {
            "type": "string",
            "title": "Organization"
          },
          "user_email": {
            "type": "string",
            "title": "User Email"
          },
          "total_commits": {
            "type": "number",
            "title": "Total Commits"
          },
          "total_lines_added": {
            "type": "number",
            "title": "Total Lines Added"
          },
          "total_lines_deleted": {
            "type": "number",
            "title": "Total Lines Deleted"
          },
          "tab_lines_added": {
            "type": "number",
            "title": "TAB Lines Added"
          },
          "tab_lines_deleted": {
            "type": "number",
            "title": "TAB Lines Deleted"
          },
          "composer_lines_added": {
            "type": "number",
            "title": "Composer Lines Added"
          },
          "composer_lines_deleted": {
            "type": "number",
            "title": "Composer Lines Deleted"
          },
          "non_ai_lines_added": {
            "type": "number",
            "title": "Non-AI Lines Added"
          },
          "non_ai_lines_deleted": {
            "type": "number",
            "title": "Non-AI Lines Deleted"
          },
          "primary_branch_commits": {
            "type": "number",
            "title": "Primary Branch Commits"
          },
          "total_unique_repos": {
            "type": "number",
            "title": "Total Unique Repositories"
          },
          "most_active_repo": {
            "type": "string",
            "title": "Most Active Repository"
          },
          "breakdown": {
            "type": "object",
            "title": "Breakdown Details"
          }
        },
        "required": [
          "record_date",
          "org",
          "user_email"
        ]
      },
      "mirrorProperties": {},
      "calculationProperties": {
        "ai_assistance_percentage_calc": {
          "title": "AI Assistance %",
          "calculation": "if (.properties.total_lines_added + .properties.total_lines_deleted) == 0 then 0 else ((.properties.tab_lines_added + .properties.tab_lines_deleted + .properties.composer_lines_added + .properties.composer_lines_deleted) / (.properties.total_lines_added + .properties.total_lines_deleted)) * 100 end",
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
    <summary><b>Cursor AI Code Change Record Blueprint (Click to expand)</b></summary>

    Daily aggregated AI-generated code changes by user:

    ```json showLineNumbers
    {
      "identifier": "cursor_ai_code_change_record",
      "description": "A daily aggregated record of AI-generated code changes by user",
      "title": "Cursor AI Code Change Record",
      "icon": "Code",
      "schema": {
        "properties": {
          "record_date": {
            "type": "string",
            "format": "date-time",
            "title": "Record Date (UTC)"
          },
          "org": {
            "type": "string",
            "title": "Organization"
          },
          "user_email": {
            "type": "string",
            "title": "User Email"
          },
          "total_changes": {
            "type": "number",
            "title": "Total AI Changes"
          },
          "total_lines_added": {
            "type": "number",
            "title": "Total Lines Added"
          },
          "total_lines_deleted": {
            "type": "number",
            "title": "Total Lines Deleted"
          },
          "tab_changes": {
            "type": "number",
            "title": "TAB Changes Count"
          },
          "composer_changes": {
            "type": "number",
            "title": "Composer Changes Count"
          },
          "tab_lines_added": {
            "type": "number",
            "title": "TAB Lines Added"
          },
          "tab_lines_deleted": {
            "type": "number",
            "title": "TAB Lines Deleted"
          },
          "composer_lines_added": {
            "type": "number",
            "title": "Composer Lines Added"
          },
          "composer_lines_deleted": {
            "type": "number",
            "title": "Composer Lines Deleted"
          },
          "most_used_model": {
            "type": "string",
            "title": "Most Used AI Model"
          },
          "unique_file_extensions": {
            "type": "number",
            "title": "Unique File Extensions"
          },
          "breakdown": {
            "type": "object",
            "title": "Breakdown Details"
          }
        },
        "required": [
          "record_date",
          "org",
          "user_email"
        ]
      },
      "mirrorProperties": {},
      "calculationProperties": {
        "tab_vs_composer_ratio_calc": {
          "title": "TAB vs Composer Ratio",
          "calculation": "if .properties.composer_changes > 0 then .properties.tab_changes / .properties.composer_changes else null end",
          "type": "number"
        },
        "average_change_size_calc": {
          "title": "Average Change Size",
          "calculation": "if .properties.total_changes > 0 then (.properties.total_lines_added + .properties.total_lines_deleted) / .properties.total_changes else 0 end",
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
        },
        "ai_commits": {
          "title": "AI Commits",
          "target": "cursor_daily_commit_record",
          "required": false,
          "many": true
        }
      }
    }
    ```

    </details>

4. Click `Save` to save the blueprint.



## Configuration 

After installation, define which endpoints to sync in your integration configuration. Each resource maps an API endpoint to Port entities using [JQ expressions](https://stedolan.github.io/jq/manual/) to transform the data.

**Key mapping components:**
- **`kind`**: The API endpoint path (combined with your base URL)
- **`selector.query`**: JQ filter to include/exclude entities (use `'true'` to sync all)
- **`selector.data_path`**: JQ expression pointing to the array of items in the response
- **`port.entity.mappings`**: How to map API fields to Port entity properties

For more details on how the Ocean Custom Integration works, see the [How it works](https://docs.port.io/build-your-software-catalog/custom-integration/ocean-custom-integration/overview#how-it-works) section in the custom integration overview.

**To configure the mappings:**

1. Go to your [data sources page](https://app.getport.io/settings/data-sources).

2. Find your Cursor integration in the list.

3. Click on the integration to open the mapping editor.

4. Add the resource mapping configurations below.

    <details>
    <summary><b>Organization usage metrics mapping (Click to expand)</b></summary>

    ```yaml showLineNumbers
    resources:
      - kind: /api/v1/usage/org
        selector:
          query: 'true'
          data_path: '.data'  # Adjust based on your API response structure
        port:
          entity:
            mappings:
              identifier: .org + "@" + .date
              title: .org + " usage " + .date
              blueprint: '"cursor_usage_record"'
              properties:
                record_date: .date + "T00:00:00Z"
                org: .org
                total_accepts: .totals.total_accepts
                total_rejects: .totals.total_rejects
                total_tabs_shown: .totals.total_tabs_shown
                total_tabs_accepted: .totals.total_tabs_accepted
                total_lines_added: .totals.total_lines_added
                total_lines_deleted: .totals.total_lines_deleted
                accepted_lines_added: .totals.accepted_lines_added
                accepted_lines_deleted: .totals.accepted_lines_deleted
                composer_requests: .totals.composer_requests
                chat_requests: .totals.chat_requests
                agent_requests: .totals.agent_requests
                subscription_included_reqs: .totals.subscription_included_reqs
                api_key_reqs: .totals.api_key_reqs
                usage_based_reqs: .totals.usage_based_reqs
                bugbot_usages: .totals.bugbot_usages
                most_used_model: .totals.most_used_model
                total_active_users: .totals.total_active_users
                total_input_tokens: .totals.total_input_tokens
                total_output_tokens: .totals.total_output_tokens
                total_cache_write_tokens: .totals.total_cache_write_tokens
                total_cache_read_tokens: .totals.total_cache_read_tokens
                total_cents: .totals.total_cents
                breakdown: .breakdown
    ```

    </details>

    <details>
    <summary><b>User usage metrics mapping (Click to expand)</b></summary>

    ```yaml showLineNumbers
    resources:
      - kind: /api/v1/usage/users
        selector:
          query: 'true'
          data_path: '.data'  # Adjust based on your API response structure
        port:
          entity:
            mappings:
              identifier: .email + "@" + .date
              title: .email + " usage " + .date
              blueprint: '"cursor_user_usage_record"'
              properties:
                record_date: .date + "T00:00:00Z"
                org: .org
                email: .totals.email
                is_active: .totals.is_active
                total_accepts: .totals.total_accepts
                total_rejects: .totals.total_rejects
                total_tabs_shown: .totals.total_tabs_shown
                total_tabs_accepted: .totals.total_tabs_accepted
                total_lines_added: .totals.total_lines_added
                total_lines_deleted: .totals.total_lines_deleted
                accepted_lines_added: .totals.accepted_lines_added
                accepted_lines_deleted: .totals.accepted_lines_deleted
                composer_requests: .totals.composer_requests
                chat_requests: .totals.chat_requests
                agent_requests: .totals.agent_requests
                subscription_included_reqs: .totals.subscription_included_reqs
                api_key_reqs: .totals.api_key_reqs
                usage_based_reqs: .totals.usage_based_reqs
                bugbot_usages: .totals.bugbot_usages
                most_used_model: .totals.most_used_model
                input_tokens: .totals.input_tokens
                output_tokens: .totals.output_tokens
                cache_write_tokens: .totals.cache_write_tokens
                cache_read_tokens: .totals.cache_read_tokens
                total_cents: .totals.total_cents
                breakdown: .breakdown
              relations:
                user: .totals.email
    ```

    </details>

    <details>
    <summary><b>Individual commit records mapping (Click to expand)</b></summary>

    ```yaml showLineNumbers
    resources:
      - kind: /api/v1/commits
        selector:
          query: 'true'
          data_path: '.data'  # Adjust based on your API response structure
        port:
          entity:
            mappings:
              identifier: .commitHash
              title: .commitHash + " by " + .userEmail
              blueprint: '"cursor_commit_record"'
              properties:
                commitHash: .commitHash
                userId: .userId
                userEmail: .userEmail
                repoName: .repoName
                branchName: .branchName
                isPrimaryBranch: .isPrimaryBranch
                totalLinesAdded: .totalLinesAdded
                totalLinesDeleted: .totalLinesDeleted
                tabLinesAdded: .tabLinesAdded
                tabLinesDeleted: .tabLinesDeleted
                composerLinesAdded: .composerLinesAdded
                composerLinesDeleted: .composerLinesDeleted
                nonAiLinesAdded: .nonAiLinesAdded
                nonAiLinesDeleted: .nonAiLinesDeleted
                message: .message
                commitTs: .commitTs
                createdAt: .createdAt
                org: .org
              relations:
                user: .userEmail
                repository: .repoName
    ```

    </details>

    <details>
    <summary><b>Daily commit aggregations mapping (Click to expand)</b></summary>

    ```yaml showLineNumbers
    resources:
      - kind: /api/v1/commits/daily
        selector:
          query: 'true'
          data_path: '.data'  # Adjust based on your API response structure
        port:
          entity:
            mappings:
              identifier: .user_email + "@" + .date
              title: .user_email + " commits " + .date
              blueprint: '"cursor_daily_commit_record"'
              properties:
                record_date: .date + "T00:00:00Z"
                org: .org
                user_email: .user_email
                total_commits: .totals.total_commits
                total_lines_added: .totals.total_lines_added
                total_lines_deleted: .totals.total_lines_deleted
                tab_lines_added: .totals.tab_lines_added
                tab_lines_deleted: .totals.tab_lines_deleted
                composer_lines_added: .totals.composer_lines_added
                composer_lines_deleted: .totals.composer_lines_deleted
                non_ai_lines_added: .totals.non_ai_lines_added
                non_ai_lines_deleted: .totals.non_ai_lines_deleted
                primary_branch_commits: .totals.primary_branch_commits
                total_unique_repos: .totals.total_unique_repos
                most_active_repo: .totals.most_active_repo
                breakdown: .breakdown
              relations:
                user: .user_email
    ```

    </details>

5. Click `Save` to save the mapping.




## Customization

If you want to customize your setup or test different API endpoints before committing to a configuration, use the [interactive builder](/build-your-software-catalog/custom-integration/ocean-custom-integration/build-your-integration).

**The interactive builder helps you:**
1. Test your Cursor API endpoints with live data.
2. Automatically detect the data structure and field types.
3. Generate blueprints and resource mappings tailored to your preferences.
4. Get installation commands with your configuration pre-filled.

Simply provide your Cursor API details, and the builder will generate everything you need to install and create the integration in Port.



