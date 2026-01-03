import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import Prerequisites from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_helm_prerequisites_block.mdx"
import AdvancedConfig from '/docs/generalTemplates/_ocean_advanced_configuration_note.md'
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"
import CustomOceanIntegration from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_custom_ocean_integration.mdx"

# Tenable

<CustomOceanIntegration />

Port's Tenable integration allows you to ingest Tenable.io vulnerability management data into your software catalog using the [Ocean Custom Integration](/build-your-software-catalog/custom-integration/ocean-custom-integration/overview) framework. After installing this integration, you can visualize vulnerabilities, assets, scans, and findings from your Tenable.io instance.

## Supported resources

The Tenable integration can ingest the following resources into Port. It is possible to reference any field that appears in the API responses in the mapping configuration. For detailed API documentation, see the [Tenable.io API documentation](https://developer.tenable.com/reference/navigate).

- **Assets** - Asset information from [`/assets`](https://developer.tenable.com/reference/io-v2-assets-list).
- **Findings** - Vulnerability findings with asset context from [`/workbenches/vulnerabilities`](https://developer.tenable.com/reference/io-v2-workbenches-vulnerabilities-list). This endpoint provides per-asset vulnerability findings with fields like `first_seen`, `last_seen`, `state`, and `severity`.
- **Scans** - Scan configurations and results from [`/scans`](https://developer.tenable.com/reference/io-v2-scans-list).

## Prerequisites

To use this integration, you need:

- A Tenable.io account with API access.
- An API key pair (Access Key and Secret Key) for authentication.
- Appropriate permissions to access assets, vulnerabilities, and scans.

**To create API keys in Tenable.io:**

1. Log in to your [Tenable.io account](https://cloud.tenable.com).
2. Navigate to **Settings** > **API Keys**.
3. Click **Generate** to create a new API key pair.
4. **Copy both the Access Key and Secret Key immediately** - the Secret Key will not be shown again.
5. Store the keys securely.

:::warning API key security
Store your API keys securely and never share them. The keys provide access to your Tenable.io data.
:::

**API key format:**

Tenable.io uses API key authentication where:
- **Access Key**: Used as the username in HTTP Basic Authentication
- **Secret Key**: Used as the password in HTTP Basic Authentication

The integration will use Basic Authentication with these credentials.

## Installation

Choose one of the following installation methods to deploy the Ocean Custom Integration:

<Tabs groupId="installation-methods" queryString="installation-methods">

<TabItem value="helm" label="Helm" default>

<h2> Prerequisites </h2>

<Prerequisites />

<h2> Installation </h2>

Add Port's Helm repo and install the Ocean Custom Integration:

:::note Replace placeholders
Remember to replace the placeholders for `YOUR_PORT_CLIENT_ID`, `YOUR_PORT_CLIENT_SECRET`, `YOUR_TENABLE_ACCESS_KEY`, and `YOUR_TENABLE_SECRET_KEY`.
:::

```bash showLineNumbers
helm repo add --force-update port-labs https://port-labs.github.io/helm-charts
helm upgrade --install my-ocean-tenable-integration port-labs/port-ocean \
  --set port.clientId="YOUR_PORT_CLIENT_ID" \
  --set port.clientSecret="YOUR_PORT_CLIENT_SECRET" \
  --set port.baseUrl="https://api.getport.io" \
  --set initializePortResources=false \
  --set scheduledResyncInterval=120 \
  --set integration.identifier="tenable-integration" \
  --set integration.type="custom" \
  --set integration.eventListener.type="POLLING" \
  --set integration.config.baseUrl="https://cloud.tenable.com" \
  --set integration.config.authType="basic" \
  --set integration.config.username="YOUR_TENABLE_ACCESS_KEY" \
  --set integration.config.password="YOUR_TENABLE_SECRET_KEY"
```

<PortApiRegionTip/>

<h2> Configuration parameters </h2>

This table summarizes the available parameters for the installation.

| Parameter | Description | Example | Required |
| --- | --- | --- | --- |
| `port.clientId` | Your Port [client id](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials). |  | ✅ |
| `port.clientSecret` | Your Port [client secret](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials). |  | ✅ |
| `port.baseUrl` | Your Port API URL (`https://api.getport.io` for EU, `https://api.us.getport.io` for US). |  | ✅ |
| `integration.config.baseUrl` | Base URL of the Tenable.io API. | https://cloud.tenable.com | ✅ |
| `integration.config.authType` | Authentication type for the API (use `basic` for Tenable.io). | basic | ✅ |
| `integration.config.username` | Your Tenable.io Access Key (used as username in Basic Auth). |  | ✅ |
| `integration.config.password` | Your Tenable.io Secret Key (used as password in Basic Auth). |  | ✅ |
| `integration.config.paginationType` | How the API handles pagination. Use `offset` for `/assets` and `/scans`, `cursor` for `/workbenches/vulnerabilities`. | offset | ❌ |
| `integration.eventListener.type` | Event listener type. See [event listeners](https://ocean.getport.io/framework/features/event-listener). | POLLING | ✅ |
| `integration.type` | Integration type (must be `custom`). | custom | ✅ |
| `integration.identifier` | Unique identifier for the integration instance. | tenable-integration | ✅ |
| `scheduledResyncInterval` | Minutes between scheduled syncs. When omitted, the event listener interval is used. | 120 | ❌ |
| `initializePortResources` | When true, creates default blueprints and mappings on first run. | true | ❌ |
| `sendRawDataExamples` | Sends sample payloads from the API to Port for easier mapping. | true | ❌ |

<br/>

<AdvancedConfig/>

</TabItem>

<TabItem value="docker" label="Docker">

To run the integration using Docker for a one-time sync:

:::note Replace placeholders
Remember to replace the placeholders for `YOUR_PORT_CLIENT_ID`, `YOUR_PORT_CLIENT_SECRET`, `YOUR_TENABLE_ACCESS_KEY`, and `YOUR_TENABLE_SECRET_KEY`.
:::

```bash showLineNumbers
docker run -i --rm --platform=linux/amd64 \
  -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
  -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
  -e OCEAN__SEND_RAW_DATA_EXAMPLES=true \
  -e OCEAN__INTEGRATION__CONFIG__BASE_URL="https://cloud.tenable.com" \
  -e OCEAN__INTEGRATION__CONFIG__AUTH_TYPE="basic" \
  -e OCEAN__INTEGRATION__CONFIG__USERNAME="YOUR_TENABLE_ACCESS_KEY" \
  -e OCEAN__INTEGRATION__CONFIG__PASSWORD="YOUR_TENABLE_SECRET_KEY" \
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

Before the integration can sync data, you need to create the required blueprints in Port. These blueprints define the data model for your Tenable resources.

**To create the blueprints:**

1. Go to your [Builder page](https://app.getport.io/settings/data-model).

2. Click on the `+ Blueprint` button.

3. Copy and paste each blueprint JSON from the sections below.

    <details>
    <summary><b>Tenable Asset Blueprint (Click to expand)</b></summary>

    Asset information:

    ```json showLineNumbers
    {
      "identifier": "tenable-asset",
      "title": "Tenable Asset",
      "icon": "Security",
      "schema": {
        "properties": {
          "hostname": {
            "title": "Hostname",
            "type": "string"
          },
          "ipAddress": {
            "title": "IP Address",
            "type": "string"
          },
          "fqdn": {
            "title": "FQDN",
            "type": "string"
          },
          "operatingSystem": {
            "title": "Operating System",
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "macAddress": {
            "title": "MAC Address",
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "agentUuid": {
            "title": "Agent UUID",
            "type": "string"
          },
          "lastSeen": {
            "title": "Last Seen",
            "type": "string",
            "format": "date-time"
          },
          "firstSeen": {
            "title": "First Seen",
            "type": "string",
            "format": "date-time"
          },
          "hasAgent": {
            "title": "Has Agent",
            "type": "boolean"
          },
          "vulnerabilityCount": {
            "title": "Vulnerability Count",
            "type": "number"
          }
        },
        "required": []
      },
      "mirrorProperties": {},
      "calculationProperties": {},
      "aggregationProperties": {},
      "relations": {}
    }
    ```

    </details>

    <details>
    <summary><b>Tenable Finding Blueprint (Click to expand)</b></summary>

    Vulnerability findings with asset context:

    ```json showLineNumbers
    {
      "identifier": "tenable-finding",
      "title": "Tenable Finding",
      "icon": "Security",
      "schema": {
        "properties": {
          "pluginId": {
            "title": "Plugin ID",
            "type": "string"
          },
          "pluginName": {
            "title": "Plugin Name",
            "type": "string"
          },
          "severity": {
            "title": "Severity",
            "type": "string"
          },
          "state": {
            "title": "State",
            "type": "string"
          },
          "description": {
            "title": "Description",
            "type": "string"
          },
          "solution": {
            "title": "Solution",
            "type": "string"
          },
          "cvssScore": {
            "title": "CVSS Score",
            "type": "number"
          },
          "cvssV3Score": {
            "title": "CVSS v3 Score",
            "type": "number"
          },
          "cve": {
            "title": "CVE",
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "assetId": {
            "title": "Asset ID",
            "type": "string"
          },
          "assetHostname": {
            "title": "Asset Hostname",
            "type": "string"
          },
          "firstSeen": {
            "title": "First Seen",
            "type": "string",
            "format": "date-time"
          },
          "lastSeen": {
            "title": "Last Seen",
            "type": "string",
            "format": "date-time"
          }
        },
        "required": []
      },
      "mirrorProperties": {},
      "calculationProperties": {},
      "aggregationProperties": {},
      "relations": {}
    }
    ```

    </details>

    <details>
    <summary><b>Tenable Scan Blueprint (Click to expand)</b></summary>

    Scan configurations and results:

    ```json showLineNumbers
    {
      "identifier": "tenable-scan",
      "title": "Tenable Scan",
      "icon": "Security",
      "schema": {
        "properties": {
          "name": {
            "title": "Name",
            "type": "string"
          },
          "description": {
            "title": "Description",
            "type": "string"
          },
          "status": {
            "title": "Status",
            "type": "string"
          },
          "scanType": {
            "title": "Scan Type",
            "type": "string"
          },
          "scheduleEnabled": {
            "title": "Schedule Enabled",
            "type": "boolean"
          },
          "timezone": {
            "title": "Timezone",
            "type": "string"
          },
          "startTime": {
            "title": "Start Time",
            "type": "number"
          },
          "endTime": {
            "title": "End Time",
            "type": "number"
          },
          "createdAt": {
            "title": "Created At",
            "type": "number"
          },
          "updatedAt": {
            "title": "Updated At",
            "type": "number"
          }
        },
        "required": []
      },
      "mirrorProperties": {},
      "calculationProperties": {},
      "aggregationProperties": {},
      "relations": {}
    }
    ```

    </details>

## Configuration

After installation, define which endpoints to sync in your integration configuration. Each resource maps an API endpoint to Port entities using [JQ expressions](https://stedolan.github.io/jq/manual/) to transform the data.

**Key mapping components:**
- **`kind`**: The API endpoint path (combined with your base URL).
- **`selector.query`**: JQ filter to include/exclude entities (use `'true'` to sync all).
- **`selector.data_path`**: JQ expression pointing to the array of items in the response.
- **`port.entity.mappings`**: How to map API fields to Port entity properties.

For more details on how the Ocean Custom Integration works, see the [How it works](https://docs.port.io/build-your-software-catalog/custom-integration/ocean-custom-integration/overview#how-it-works) section in the custom integration overview.

**Tenable.io API response format:**

Tenable.io API responses vary by endpoint:

- **`/assets`** - Returns data in `.assets` array with offset-based pagination in `.pagination`
- **`/workbenches/vulnerabilities`** - Returns data in `.vulnerabilities` array with cursor-based pagination
- **`/scans`** - Returns data in `.scans` array with offset-like pagination

**Important notes:**

- Timestamps in Tenable API responses are often returned as **epoch timestamps** (numbers), not ISO strings. You may need to convert them or store them as numbers.
- The `mac_address` field is typically an **array**, not a string.
- Pagination types differ by endpoint - use `offset` for `/assets`, `cursor` for `/workbenches/vulnerabilities`.

**To configure the mappings:**

1. Go to your [data sources page](https://app.getport.io/settings/data-sources).

2. Find your Tenable integration in the list.

3. Click on the integration to open the mapping editor.

4. Add the resource mapping configurations below.

    <details>
    <summary><b>Assets mapping (Click to expand)</b></summary>

    ```yaml showLineNumbers
    resources:
      - kind: /assets
        selector:
          query: 'true'
          data_path: '.assets'
          query_params:
            limit: "50"
            offset: "0"
        port:
          entity:
            mappings:
              identifier: .id
              title: .hostname // .ipv4[0] // .id
              blueprint: '"tenable-asset"'
              properties:
                hostname: .hostname
                ipAddress: .ipv4[0] // ""
                fqdn: .fqdn[0] // ""
                operatingSystem: .operating_system
                macAddress: (.mac_address | if type == "array" then . else [.] end)
                agentUuid: .agent_uuid
                lastSeen: .last_seen
                firstSeen: .first_seen
                hasAgent: .has_agent
                vulnerabilityCount: .vulnerability_count
    ```

    :::info Pagination for /assets
    The `/assets` endpoint uses offset-based pagination. Set `paginationType` to `offset` in your integration configuration. Use `limit` and `offset` query parameters to paginate through results.
    :::

    </details>

    <details>
    <summary><b>Findings mapping (Click to expand)</b></summary>

    Vulnerability findings with asset context from `/workbenches/vulnerabilities`:

    ```yaml showLineNumbers
    resources:
      - kind: /workbenches/vulnerabilities
        selector:
          query: 'true'
          data_path: '.vulnerabilities'
          query_params:
            limit: "50"
        port:
          entity:
            mappings:
              identifier: '"\(.plugin.id)-\(.asset.uuid)"'
              title: .plugin.name
              blueprint: '"tenable-finding"'
              properties:
                pluginId: .plugin.id
                pluginName: .plugin.name
                severity: (.severity.name // .severity)
                state: .state
                description: .plugin.description
                solution: .plugin.solution
                cvssScore: (.plugin.cvss_base_score // .cvss_score)
                cvssV3Score: (.plugin.cvss3_base_score // .cvss_v3_score)
                cve: (.plugin.cve // [])
                assetId: .asset.uuid
                assetHostname: .asset.hostname
                firstSeen: .first_found
                lastSeen: .last_found
    ```

    :::warning Pagination for /workbenches/vulnerabilities
    The `/workbenches/vulnerabilities` endpoint uses **cursor-based pagination**, not offset. Set `paginationType` to `cursor` in your integration configuration. The cursor path is typically `.pagination.cursor` or similar. Do not use `offset` query parameters with this endpoint.
    :::

    :::info Composite identifier
    The identifier uses a composite of `plugin_id` and `asset.uuid` to ensure uniqueness, as the same plugin can appear on multiple assets. This prevents findings from overwriting each other.
    :::

    </details>

    <details>
    <summary><b>Scans mapping (Click to expand)</b></summary>

    ```yaml showLineNumbers
    resources:
      - kind: /scans
        selector:
          query: 'true'
          data_path: '.scans'
          query_params:
            limit: "50"
            offset: "0"
        port:
          entity:
            mappings:
              identifier: .id
              title: .name
              blueprint: '"tenable-scan"'
              properties:
                name: .name
                description: .description
                status: .status
                scanType: .type
                scheduleEnabled: (.schedule.enabled // false)
                timezone: .schedule.timezone
                startTime: (.starttime // null)
                endTime: (.endtime // null)
                createdAt: (.creation_date // null)
                updatedAt: (.last_modification_date // null)
    ```

    :::caution Timestamp format
    Tenable scan timestamps (`starttime`, `endtime`, `creation_date`, `last_modification_date`) are often returned as **epoch timestamps** (numbers), not ISO date strings. The blueprint stores them as numbers. If you need ISO format, you can convert them using JQ expressions or store them as strings.
    :::

    :::info Pagination for /scans
    The `/scans` endpoint uses offset-like pagination. Set `paginationType` to `offset` in your integration configuration.
    :::

    </details>

5. Click `Save` to save the mapping.

## Customization

If you want to customize your setup or test different API endpoints before committing to a configuration, use the [interactive builder](/build-your-software-catalog/custom-integration/ocean-custom-integration/build-your-integration).

**The interactive builder helps you:**
1. Test your Tenable.io API endpoints with live data.
2. Automatically detect the data structure and field types.
3. Generate blueprints and resource mappings tailored to your preferences.
4. Get installation commands with your configuration pre-filled.

Simply provide your Tenable.io API details, and the builder will generate everything you need to install and create the integration in Port.
