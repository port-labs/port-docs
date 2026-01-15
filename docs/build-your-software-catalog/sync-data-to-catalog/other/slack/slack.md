import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import Prerequisites from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_helm_prerequisites_block.mdx"
import AdvancedConfig from '/docs/generalTemplates/_ocean_advanced_configuration_note.md'
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"
import CustomOceanIntegration from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_custom_ocean_integration.mdx"

# Slack

<CustomOceanIntegration />

Port's Slack integration allows you to model Slack resources in your software catalog and ingest data into them using the [Ocean Custom Integration](/build-your-software-catalog/custom-integration/ocean-custom-integration/overview) framework.

## Supported resources

The Slack integration can ingest the following resources into Port:

- `slack-user` - Workspace users and their profile information from [`/users.list`](https://api.slack.com/methods/users.list).
- `slack-channel` - Public and private channels from [`/conversations.list`](https://api.slack.com/methods/conversations.list).
- `slack-user-group` - User groups and their memberships from [`/usergroups.list`](https://api.slack.com/methods/usergroups.list).

It is possible to reference any field that appears in the API responses linked above in the mapping configuration.

## Prerequisites

To use this integration, you need:

- A Slack Bot User OAuth Token with the following scopes:
  - `users:read` - View people in a workspace.
  - `channels:read` - View basic information about public channels.
  - `groups:read` - View basic information about private channels.
  - `usergroups:read` - View user groups in a workspace.

**To create a Slack app and obtain an access token:**

1. Navigate to the [Slack API](https://api.slack.com/apps) and click **Create New App**.
2. Choose **From scratch** and provide a name for your app (e.g., "Port Integration").
3. Select the workspace where you want to install the app.
4. In your app's settings, go to **OAuth & Permissions**.
5. Add the required scopes under **Bot Token Scopes**.
6. Click **Install App to Workspace** and authorize the app.
7. Copy the **Bot User OAuth Token** (starts with `xoxb-`) from the **OAuth & Permissions** page.

:::warning Token security
Store your OAuth token securely and never share it. The token provides access to your Slack workspace data.
:::

## Installation

Choose one of the following installation methods to deploy the Ocean Custom Integration:

<Tabs groupId="installation-methods" queryString="installation-methods">

<TabItem value="helm" label="Helm" default>

<h2> Prerequisites </h2>

<Prerequisites />

<h2> Installation </h2>

1. Add Port's Helm repo and install the Ocean Custom Integration:

:::note Replace placeholders
Remember to replace the placeholders for `YOUR_PORT_CLIENT_ID`, `YOUR_PORT_CLIENT_SECRET`, and `YOUR_SLACK_BOT_TOKEN`.
:::

```bash showLineNumbers
helm repo add --force-update port-labs https://port-labs.github.io/helm-charts
helm upgrade --install my-ocean-slack-integration port-labs/port-ocean \
  --set port.clientId="YOUR_PORT_CLIENT_ID" \
  --set port.clientSecret="YOUR_PORT_CLIENT_SECRET" \
  --set port.baseUrl="https://api.getport.io" \
  --set initializePortResources=true \
  --set scheduledResyncInterval=60 \
  --set integration.identifier="my-ocean-slack-integration" \
  --set integration.type="custom" \
  --set integration.eventListener.type="POLLING" \
  --set integration.config.baseUrl="https://slack.com/api" \
  --set integration.config.authType="bearer_token" \
  --set integration.config.apiToken="YOUR_SLACK_BOT_TOKEN" \
  --set integration.config.paginationType="cursor" \
  --set integration.config.paginationParam="cursor" \
  --set integration.config.cursorPath="response_metadata.next_cursor" \
  --set integration.config.hasMorePath="response_metadata.next_cursor"
```

<PortApiRegionTip/>

<h2> Configuration parameters </h2>

This table summarizes the available parameters for the installation.

| Parameter                          | Description                                                                                                                                                                                                                                                                                    | Example                          | Required |
|------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------|----------|
| `port.clientId`                    | Your Port [client id](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)                                                                                                                                                                  |                                  | ✅        |
| `port.clientSecret`                | Your Port [client secret](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)                                                                                                                                                              |                                  | ✅        |
| `port.baseUrl`                     | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US                                                                                                                                                                                                        |                                  | ✅        |
| `integration.config.baseUrl`       | The base URL of the Slack API instance                                                                                                                                                                           | https://slack.com/api | ✅        |
| `integration.config.authType`   | The authentication type for the API (use `bearer_token` for Slack)                                                                                                                                                                         | bearer_token                                  | ✅        |
| `integration.config.apiToken`   | Your Slack Bot User OAuth Token (starts with `xoxb-`)                                                                                                                                                                         | xoxb-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx                                  | ✅        |
| `integration.config.paginationType` | How your API handles pagination (offset, page, cursor, or none)                                                                                                                                                                         | cursor                                  | ✅        |
| `integration.config.paginationParam` | The query parameter name for the cursor (Slack API uses `cursor`)                                                                                                                                                                         | cursor                                  | ✅        |
| `integration.config.cursorPath` | JQ expression pointing to the cursor field in the response                                                                                                                                                                         | response_metadata.next_cursor                                  | ✅        |
| `integration.config.hasMorePath` | Path to check if there are more pages.                                                                                                                                                                         | response_metadata.next_cursor                                  | ✅        |
| `integration.eventListener.type`   | The event listener type. Read more about [event listeners](https://ocean.getport.io/framework/features/event-listener)                                                                                                                                                                         | POLLING                                  | ✅        |
| `integration.type`                 | The integration type (must be `custom` for Ocean Custom Integration)                                                                                                                                                                                                                                                                | custom                                  | ✅        |
| `integration.identifier`          | Unique identifier for the integration instance                                                                                                                                                                         | my-ocean-slack-integration                                  | ✅        |
| `scheduledResyncInterval`          | The number of minutes between each resync. When not set the integration will resync for each event listener resync event. Read more about [scheduledResyncInterval](https://ocean.port.io/developing-an-integration/trigger-your-integration) | 60                                  | ❌        |
| `initializePortResources`          | Default true, When set to true the integration will create default blueprints and the port App config Mapping.        | true                                  | ❌        |
| `sendRawDataExamples`              | Enable sending raw data examples from the third party API to port for testing and managing the integration mapping. Default is true                                                                                                                                                            | true                                  | ❌        |

<br/>

<AdvancedConfig/>

</TabItem>

<TabItem value="docker" label="Docker">

To run the integration using Docker for a one-time sync:

:::note Replace placeholders
Remember to replace the placeholders for `YOUR_PORT_CLIENT_ID`, `YOUR_PORT_CLIENT_SECRET`, and `YOUR_SLACK_BOT_TOKEN`.
:::

```bash showLineNumbers
docker run -i --rm --platform=linux/amd64 \
  -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
  -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
  -e OCEAN__SEND_RAW_DATA_EXAMPLES=true \
  -e OCEAN__INTEGRATION__CONFIG__BASE_URL="https://slack.com/api" \
  -e OCEAN__INTEGRATION__CONFIG__AUTH_TYPE="bearer_token" \
  -e OCEAN__INTEGRATION__CONFIG__API_TOKEN="YOUR_SLACK_BOT_TOKEN" \
  -e OCEAN__INTEGRATION__CONFIG__PAGINATION_TYPE="cursor" \
  -e OCEAN__INTEGRATION__CONFIG__PAGINATION_PARAM="cursor" \
  -e OCEAN__INTEGRATION__CONFIG__CURSOR_PATH="response_metadata.next_cursor" \
  -e OCEAN__INTEGRATION__CONFIG__HAS_MORE_PATH="response_metadata.next_cursor" \
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

Before the integration can sync data, you need to create the required blueprints in Port. These blueprints define the data model for your Slack resources.

**To create the blueprints:**

1. Go to your [Builder page](https://app.getport.io/settings/data-model).

2. Click on the `+ Blueprint` button.

3. Copy and paste each blueprint JSON from the sections below.

    <details>
    <summary><b>Slack User Blueprint (Click to expand)</b></summary>

    Workspace users and their profile information:

    ```json showLineNumbers
    {
      "identifier": "slack-user",
      "description": "A Slack workspace user",
      "title": "Slack User",
      "icon": "Slack",
      "schema": {
        "properties": {
          "name": {
            "title": "Username",
            "type": "string"
          },
          "realName": {
            "title": "Real Name",
            "type": "string"
          },
          "displayName": {
            "title": "Display Name",
            "type": "string"
          },
          "email": {
            "title": "Email",
            "type": "string",
            "format": "email"
          },
          "title": {
            "title": "Job Title",
            "type": "string"
          },
          "phone": {
            "title": "Phone",
            "type": "string"
          },
          "statusText": {
            "title": "Status Text",
            "type": "string"
          },
          "statusEmoji": {
            "title": "Status Emoji",
            "type": "string"
          },
          "isAdmin": {
            "title": "Is Admin",
            "type": "boolean"
          },
          "isOwner": {
            "title": "Is Owner",
            "type": "boolean"
          },
          "isBot": {
            "title": "Is Bot",
            "type": "boolean"
          },
          "isDeleted": {
            "title": "Is Deleted",
            "type": "boolean"
          },
          "timezone": {
            "title": "Timezone",
            "type": "string"
          },
          "timezoneLabel": {
            "title": "Timezone Label",
            "type": "string"
          },
          "updated": {
            "title": "Last Updated",
            "type": "string",
            "format": "date-time"
          }
        },
        "required": ["name"]
      },
      "mirrorProperties": {},
      "calculationProperties": {},
      "aggregationProperties": {},
      "relations": {}
    }
    ```

    </details>

    <details>
    <summary><b>Slack Channel Blueprint (Click to expand)</b></summary>

    Public and private channels:

    ```json showLineNumbers
    {
      "identifier": "slack-channel",
      "description": "A Slack channel (public or private)",
      "title": "Slack Channel",
      "icon": "Slack",
      "schema": {
        "properties": {
          "name": {
            "title": "Channel Name",
            "type": "string"
          },
          "topic": {
            "title": "Topic",
            "type": "string"
          },
          "purpose": {
            "title": "Purpose",
            "type": "string"
          },
          "isPrivate": {
            "title": "Is Private",
            "type": "boolean"
          },
          "isArchived": {
            "title": "Is Archived",
            "type": "boolean"
          },
          "isGeneral": {
            "title": "Is General",
            "type": "boolean"
          },
          "isMember": {
            "title": "Is Member",
            "type": "boolean"
          },
          "memberCount": {
            "title": "Member Count",
            "type": "number"
          },
          "created": {
            "title": "Created Date",
            "type": "string",
            "format": "date-time"
          },
          "updated": {
            "title": "Last Updated",
            "type": "string",
            "format": "date-time"
          }
        },
        "required": ["name"]
      },
      "mirrorProperties": {},
      "calculationProperties": {},
      "aggregationProperties": {},
      "relations": {
        "creator": {
          "title": "Creator",
          "target": "slack-user",
          "required": false,
          "many": false
        }
      }
    }
    ```

    </details>

    <details>
    <summary><b>Slack User Group Blueprint (Click to expand)</b></summary>

    User groups and their memberships:

    ```json showLineNumbers
    {
      "identifier": "slack-user-group",
      "description": "A Slack user group",
      "title": "Slack User Group",
      "icon": "Slack",
      "schema": {
        "properties": {
          "name": {
            "title": "Name",
            "type": "string"
          },
          "handle": {
            "title": "Handle",
            "type": "string"
          },
          "description": {
            "title": "Description",
            "type": "string"
          },
          "isExternal": {
            "title": "Is External",
            "type": "boolean"
          },
          "dateCreate": {
            "title": "Date Created",
            "type": "number"
          },
          "dateUpdate": {
            "title": "Date Updated",
            "type": "number"
          },
          "updatedBy": {
            "title": "Updated By",
            "type": "string"
          }
        },
        "required": ["name"]
      },
      "mirrorProperties": {},
      "calculationProperties": {},
      "aggregationProperties": {},
      "relations": {
        "members": {
          "title": "Members",
          "target": "slack-user",
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
- **`kind`**: The API endpoint path (combined with your base URL).
- **`selector.query`**: JQ filter to include/exclude entities (use `'true'` to sync all).
- **`selector.data_path`**: JQ expression pointing to the array of items in the response.
- **`port.entity.mappings`**: How to map API fields to Port entity properties.

For more details on how the Ocean Custom Integration works, see the [How it works](https://docs.port.io/build-your-software-catalog/custom-integration/ocean-custom-integration/overview#how-it-works) section in the custom integration overview.

**Slack API response format:**

Slack API responses typically follow this structure:

```json showLineNumbers
{
  "ok": true,
  "members": [...],
  "response_metadata": {
    "next_cursor": "dXNlcjpVMEc5V0ZYTlo="
  }
}
```

The actual data array is usually at the root level (e.g., `members`, `channels`, `usergroups`), and pagination information is in `response_metadata.next_cursor`.

:::info User Groups require include_users parameter
The Slack API's `usergroups.list` endpoint does not return the `users` field by default. To populate the `members` relation, you must include `include_users: "true"` in the `query_params` section of your mapping configuration.
:::

**To configure the mappings:**

1. Go to your [data sources page](https://app.getport.io/settings/data-sources).

2. Find your Slack integration in the list.

3. Click on the integration to open the mapping editor.

4. Add the resource mapping configurations below.

    <details>
    <summary><b>Slack Users mapping (Click to expand)</b></summary>

    ```yaml showLineNumbers
    resources:
      - kind: /users.list
        selector:
          query: 'true'
          data_path: '.members'
          query_params:
            limit: "200"
        port:
          entity:
            mappings:
              identifier: .id
              title: .real_name // .name // .id
              blueprint: '"slack-user"'
              properties:
                name: .name
                realName: .real_name
                displayName: .profile.display_name
                email: .profile.email
                title: .profile.title
                phone: .profile.phone
                statusText: .profile.status_text
                statusEmoji: .profile.status_emoji
                isAdmin: .is_admin
                isOwner: .is_owner
                isBot: .is_bot
                isDeleted: .deleted
                timezone: .tz
                timezoneLabel: .tz_label
    ```

    </details>

    <details>
    <summary><b>Slack Channels mapping (Click to expand)</b></summary>

    ```yaml showLineNumbers
    resources:
      - kind: /conversations.list
        selector:
          query: 'true'
          data_path: '.channels'
          query_params:
            types: "public_channel,private_channel"
            limit: "200"
        port:
          entity:
            mappings:
              identifier: .id
              title: .name
              blueprint: '"slack-channel"'
              properties:
                name: .name
                topic: .topic.value
                purpose: .purpose.value
                isPrivate: .is_private
                isArchived: .is_archived
                isGeneral: .is_general
                isMember: .is_member
                memberCount: .num_members
              relations:
                creator: .creator
    ```

    </details>

    <details>
    <summary><b>Slack User Groups mapping (Click to expand)</b></summary>

    ```yaml showLineNumbers
    resources:
      - kind: /usergroups.list
        selector:
          query: 'true'
          data_path: '.usergroups'
          query_params:
            include_users: "true"
        port:
          entity:
            mappings:
              identifier: .id
              title: .name
              blueprint: '"slack-user-group"'
              properties:
                name: .name
                handle: .handle
                description: .description
                isExternal: .is_external
                dateCreate: .date_create
                dateUpdate: .date_update
                updatedBy: .updated_by
              relations:
                members: .users[]
    ```

    </details>

5. Click `Save` to save the mapping.



## Customization

If you want to customize your setup or test different API endpoints before committing to a configuration, use the [interactive builder](/build-your-software-catalog/custom-integration/ocean-custom-integration/installation-types/self-hosted/build-your-integration).

**The interactive builder helps you:**
1. Test your Slack API endpoints with live data.
2. Automatically detect the data structure and field types.
3. Generate blueprints and resource mappings tailored to your preferences.
4. Get installation commands with your configuration pre-filled.

Simply provide your Slack API details, and the builder will generate everything you need to install and create the integration in Port.

