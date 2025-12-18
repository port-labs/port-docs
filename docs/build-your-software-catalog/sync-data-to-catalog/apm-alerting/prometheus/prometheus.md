import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import Prerequisites from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_helm_prerequisites_block.mdx"
import AdvancedConfig from '/docs/generalTemplates/_ocean_advanced_configuration_note.md'
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"
import CustomOceanIntegration from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_custom_ocean_integration.mdx"

# Prometheus

<CustomOceanIntegration />

Port's Prometheus integration allows you to ingest Prometheus monitoring and alerting data into your software catalog using the [Ocean Custom Integration](/build-your-software-catalog/custom-integration/ocean-custom-integration/overview) framework. After installing this integration, you can visualize your Prometheus alerts, alerting rules, and scrape targets using Port's dashboards.

## Supported resources

The Prometheus integration can ingest the following resources into Port. It is possible to reference any field that appears in the API responses in the mapping configuration. For detailed API documentation, see the [Prometheus HTTP API documentation](https://prometheus.io/docs/prometheus/latest/querying/api/).

- **Alerts** - Active alerts from [`/api/v1/alerts`](https://prometheus.io/docs/prometheus/latest/querying/api/#getting-alerts).
- **Rules** - Alerting and recording rules from [`/api/v1/rules`](https://prometheus.io/docs/prometheus/latest/querying/api/#rules).
- **Targets** - Scrape targets and their health status from [`/api/v1/targets`](https://prometheus.io/docs/prometheus/latest/querying/api/#targets).

## Prerequisites

To use this integration, you need:

- A Prometheus instance accessible via HTTP/HTTPS.
- Network access to the Prometheus API endpoints.
- If authentication is enabled, appropriate credentials (API token, username/password, or bearer token).

**Prometheus authentication:**

Prometheus does not require authentication by default. However, if your Prometheus instance has authentication enabled, you can use:

- **Basic Authentication** - Username and password.
- **Bearer Token** - API token in the Authorization header.
- **No Authentication** - If authentication is disabled (default).

## Installation

Choose one of the following installation methods to deploy the Ocean Custom Integration:

<Tabs groupId="installation-methods" queryString="installation-methods">

<TabItem value="helm" label="Helm" default>

<h2> Prerequisites </h2>

<Prerequisites />

<h2> Installation </h2>

Add Port's Helm repo and install the Ocean Custom Integration:

:::note Replace placeholders
Remember to replace the placeholders for `YOUR_PORT_CLIENT_ID`, `YOUR_PORT_CLIENT_SECRET`, and your Prometheus base URL. If authentication is enabled, also replace `YOUR_PROMETHEUS_USERNAME` and `YOUR_PROMETHEUS_PASSWORD` (or use bearer token).
:::

**Without authentication:**

```bash showLineNumbers
helm repo add --force-update port-labs https://port-labs.github.io/helm-charts
helm upgrade --install my-ocean-prometheus-integration port-labs/port-ocean \
  --set port.clientId="YOUR_PORT_CLIENT_ID" \
  --set port.clientSecret="YOUR_PORT_CLIENT_SECRET" \
  --set port.baseUrl="https://api.getport.io" \
  --set initializePortResources=false \
  --set scheduledResyncInterval=120 \
  --set integration.identifier="prometheus-integration" \
  --set integration.type="custom" \
  --set integration.eventListener.type="POLLING" \
  --set integration.config.baseUrl="http://prometheus:9090" \
  --set integration.config.authType="none"
```

**With basic authentication:**

```bash showLineNumbers
helm repo add --force-update port-labs https://port-labs.github.io/helm-charts
helm upgrade --install my-ocean-prometheus-integration port-labs/port-ocean \
  --set port.clientId="YOUR_PORT_CLIENT_ID" \
  --set port.clientSecret="YOUR_PORT_CLIENT_SECRET" \
  --set port.baseUrl="https://api.getport.io" \
  --set initializePortResources=false \
  --set scheduledResyncInterval=120 \
  --set integration.identifier="prometheus-integration" \
  --set integration.type="custom" \
  --set integration.eventListener.type="POLLING" \
  --set integration.config.baseUrl="http://prometheus:9090" \
  --set integration.config.authType="basic" \
  --set integration.config.username="YOUR_PROMETHEUS_USERNAME" \
  --set integration.config.password="YOUR_PROMETHEUS_PASSWORD"
```

**With bearer token:**

```bash showLineNumbers
helm repo add --force-update port-labs https://port-labs.github.io/helm-charts
helm upgrade --install my-ocean-prometheus-integration port-labs/port-ocean \
  --set port.clientId="YOUR_PORT_CLIENT_ID" \
  --set port.clientSecret="YOUR_PORT_CLIENT_SECRET" \
  --set port.baseUrl="https://api.getport.io" \
  --set initializePortResources=false \
  --set scheduledResyncInterval=120 \
  --set integration.identifier="prometheus-integration" \
  --set integration.type="custom" \
  --set integration.eventListener.type="POLLING" \
  --set integration.config.baseUrl="http://prometheus:9090" \
  --set integration.config.authType="bearer_token" \
  --set integration.config.apiToken="YOUR_PROMETHEUS_BEARER_TOKEN"
```

<PortApiRegionTip/>

<h2> Configuration parameters </h2>

This table summarizes the available parameters for the installation.

| Parameter | Description | Example | Required |
| --- | --- | --- | --- |
| `port.clientId` | Your Port [client id](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials). |  | ✅ |
| `port.clientSecret` | Your Port [client secret](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials). |  | ✅ |
| `port.baseUrl` | Your Port API URL (`https://api.getport.io` for EU, `https://api.us.getport.io` for US). |  | ✅ |
| `integration.config.baseUrl` | Base URL of your Prometheus instance. | http://prometheus:9090 | ✅ |
| `integration.config.authType` | Authentication type (`none`, `basic`, or `bearer_token`). | none | ✅ |
| `integration.config.username` | Username for basic authentication (required if `authType` is `basic`). |  | ❌ |
| `integration.config.password` | Password for basic authentication (required if `authType` is `basic`). |  | ❌ |
| `integration.config.apiToken` | Bearer token for authentication (required if `authType` is `bearer_token`). |  | ❌ |
| `integration.eventListener.type` | Event listener type. See [event listeners](https://ocean.getport.io/framework/features/event-listener). | POLLING | ✅ |
| `integration.type` | Integration type (must be `custom`). | custom | ✅ |
| `integration.identifier` | Unique identifier for the integration instance. | prometheus-integration | ✅ |
| `scheduledResyncInterval` | Minutes between scheduled syncs. When omitted, the event listener interval is used. | 120 | ❌ |
| `initializePortResources` | When true, creates default blueprints and mappings on first run. Set to `false` when using custom blueprints. | false | ❌ |
| `sendRawDataExamples` | Sends sample payloads from the API to Port for easier mapping. | true | ❌ |

<br/>

<AdvancedConfig/>

</TabItem>

<TabItem value="docker" label="Docker">

To run the integration using Docker for a one-time sync:

:::note Replace placeholders
Remember to replace the placeholders for `YOUR_PORT_CLIENT_ID`, `YOUR_PORT_CLIENT_SECRET`, and your Prometheus base URL. If authentication is enabled, also replace the authentication credentials.
:::

**Without authentication:**

```bash showLineNumbers
docker run -i --rm --platform=linux/amd64 \
  -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
  -e OCEAN__INITIALIZE_PORT_RESOURCES=false \
  -e OCEAN__SEND_RAW_DATA_EXAMPLES=true \
  -e OCEAN__INTEGRATION__IDENTIFIER="prometheus-integration" \
  -e OCEAN__INTEGRATION__CONFIG__BASE_URL="http://prometheus:9090" \
  -e OCEAN__INTEGRATION__CONFIG__AUTH_TYPE="none" \
  -e OCEAN__PORT__CLIENT_ID="YOUR_PORT_CLIENT_ID" \
  -e OCEAN__PORT__CLIENT_SECRET="YOUR_PORT_CLIENT_SECRET" \
  -e OCEAN__PORT__BASE_URL="https://api.getport.io" \
  ghcr.io/port-labs/port-ocean-custom:latest
```

**With basic authentication:**

```bash showLineNumbers
docker run -i --rm --platform=linux/amd64 \
  -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
  -e OCEAN__INITIALIZE_PORT_RESOURCES=false \
  -e OCEAN__SEND_RAW_DATA_EXAMPLES=true \
  -e OCEAN__INTEGRATION__IDENTIFIER="prometheus-integration" \
  -e OCEAN__INTEGRATION__CONFIG__BASE_URL="http://prometheus:9090" \
  -e OCEAN__INTEGRATION__CONFIG__AUTH_TYPE="basic" \
  -e OCEAN__INTEGRATION__CONFIG__USERNAME="YOUR_PROMETHEUS_USERNAME" \
  -e OCEAN__INTEGRATION__CONFIG__PASSWORD="YOUR_PROMETHEUS_PASSWORD" \
  -e OCEAN__PORT__CLIENT_ID="YOUR_PORT_CLIENT_ID" \
  -e OCEAN__PORT__CLIENT_SECRET="YOUR_PORT_CLIENT_SECRET" \
  -e OCEAN__PORT__BASE_URL="https://api.getport.io" \
  ghcr.io/port-labs/port-ocean-custom:latest
```

**With bearer token:**

```bash showLineNumbers
docker run -i --rm --platform=linux/amd64 \
  -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
  -e OCEAN__INITIALIZE_PORT_RESOURCES=false \
  -e OCEAN__SEND_RAW_DATA_EXAMPLES=true \
  -e OCEAN__INTEGRATION__IDENTIFIER="prometheus-integration" \
  -e OCEAN__INTEGRATION__CONFIG__BASE_URL="http://prometheus:9090" \
  -e OCEAN__INTEGRATION__CONFIG__AUTH_TYPE="bearer_token" \
  -e OCEAN__INTEGRATION__CONFIG__API_TOKEN="YOUR_PROMETHEUS_BEARER_TOKEN" \
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

Before the integration can sync data, you need to create the required blueprints in Port. These blueprints define the data model for your Prometheus resources.

**To create the blueprints:**

1. Go to your [Builder page](https://app.getport.io/settings/data-model).

2. Click on the `+ Blueprint` button.

3. Copy and paste each blueprint JSON from the sections below.

    <details>
    <summary><b>Prometheus Alert Blueprint (Click to expand)</b></summary>

    Active alerts from Prometheus:

    ```json showLineNumbers
    {
      "identifier": "prometheus-alert",
      "title": "Prometheus Alert",
      "icon": "Prometheus",
      "schema": {
        "properties": {
          "alertname": {
            "title": "Alert Name",
            "type": "string"
          },
          "state": {
            "title": "State",
            "type": "string"
          },
          "severity": {
            "title": "Severity",
            "type": "string"
          },
          "summary": {
            "title": "Summary",
            "type": "string"
          },
          "description": {
            "title": "Description",
            "type": "string"
          },
          "activeAt": {
            "title": "Active At",
            "type": "string",
            "format": "date-time"
          },
          "labels": {
            "title": "Labels",
            "type": "object"
          },
          "annotations": {
            "title": "Annotations",
            "type": "object"
          },
          "value": {
            "title": "Value",
            "type": "string"
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
    <summary><b>Prometheus Rule Blueprint (Click to expand)</b></summary>

    Alerting and recording rules:

    ```json showLineNumbers
    {
      "identifier": "prometheus-rule",
      "title": "Prometheus Rule",
      "icon": "Prometheus",
      "schema": {
        "properties": {
          "name": {
            "title": "Name",
            "type": "string"
          },
          "type": {
            "title": "Type",
            "type": "string"
          },
          "query": {
            "title": "Query",
            "type": "string"
          },
          "duration": {
            "title": "Duration",
            "type": "string"
          },
          "labels": {
            "title": "Labels",
            "type": "object"
          },
          "annotations": {
            "title": "Annotations",
            "type": "object"
          },
          "health": {
            "title": "Health",
            "type": "string"
          },
          "lastError": {
            "title": "Last Error",
            "type": "string"
          },
          "evaluationTime": {
            "title": "Evaluation Time",
            "type": "number"
          },
          "lastEvaluation": {
            "title": "Last Evaluation",
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
    <summary><b>Prometheus Target Blueprint (Click to expand)</b></summary>

    Scrape targets and their health status:

    ```json showLineNumbers
    {
      "identifier": "prometheus-target",
      "title": "Prometheus Target",
      "icon": "Prometheus",
      "schema": {
        "properties": {
          "scrapePool": {
            "title": "Scrape Pool",
            "type": "string"
          },
          "scrapeUrl": {
            "title": "Scrape URL",
            "type": "string",
            "format": "url"
          },
          "health": {
            "title": "Health",
            "type": "string"
          },
          "lastError": {
            "title": "Last Error",
            "type": "string"
          },
          "lastScrape": {
            "title": "Last Scrape",
            "type": "string",
            "format": "date-time"
          },
          "lastScrapeDuration": {
            "title": "Last Scrape Duration",
            "type": "number"
          },
          "labels": {
            "title": "Labels",
            "type": "object"
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

**Prometheus API response format:**

Prometheus API responses follow this structure:

```json showLineNumbers
{
  "status": "success",
  "data": {
    "alerts": [
      {
        "labels": {
          "alertname": "HighCPUUsage",
          "severity": "warning"
        },
        "annotations": {
          "summary": "CPU usage is above 80%"
        },
        "state": "firing",
        "activeAt": "2024-01-15T10:30:00Z",
        "value": "85.5"
      }
    ]
  }
}
```

The actual data array is typically nested under `.data.alerts`, `.data.groups` (for rules), or `.data.activeTargets` (for targets).

**To configure the mappings:**

1. Go to your [data sources page](https://app.getport.io/settings/data-sources).

2. Find your Prometheus integration in the list.

3. Click on the integration to open the mapping editor.

4. Add the resource mapping configurations below.

    <details>
    <summary><b>Alerts mapping (Click to expand)</b></summary>

    Active alerts from `/api/v1/alerts`:

    ```yaml showLineNumbers
    resources:
      - kind: /api/v1/alerts
        selector:
          query: 'true'
          data_path: '.data.alerts'
        port:
          entity:
            mappings:
              identifier: '"\(.labels.alertname)-\(.activeAt)"'
              title: .labels.alertname
              blueprint: '"prometheus-alert"'
              properties:
                alertname: .labels.alertname
                state: .state
                severity: (.labels.severity // "unknown")
                summary: (.annotations.summary // "")
                description: (.annotations.description // "")
                activeAt: .activeAt
                labels: .labels
                annotations: .annotations
                value: (.value // "")
    ```

    :::info Composite identifier
    The identifier uses a composite of `alertname` and `activeAt` to ensure uniqueness, as the same alert can fire multiple times. This prevents alerts from overwriting each other.
    :::

    </details>

    <details>
    <summary><b>Rules mapping (Click to expand)</b></summary>

    Alerting and recording rules from `/api/v1/rules`:

    ```yaml showLineNumbers
    resources:
      - kind: /api/v1/rules
        selector:
          query: 'true'
          data_path: '.data.groups[].rules[]'
        port:
          entity:
            mappings:
              identifier: .name
              title: .name
              blueprint: '"prometheus-rule"'
              properties:
                name: .name
                type: .type
                query: .query
                duration: (.duration // "")
                labels: (.labels // {})
                annotations: (.annotations // {})
                health: .health
                lastError: (.lastError // "")
                evaluationTime: (.evaluationTime // 0)
                lastEvaluation: .lastEvaluation
    ```

    :::info Rules structure
    The `/api/v1/rules` endpoint returns rules grouped by rule group. The mapping uses `.data.groups[].rules[]` to flatten all rules from all groups into a single array.
    :::

    </details>

    <details>
    <summary><b>Targets mapping (Click to expand)</b></summary>

    Scrape targets from `/api/v1/targets`:

    ```yaml showLineNumbers
    resources:
      - kind: /api/v1/targets
        selector:
          query: 'true'
          data_path: '.data.activeTargets[]'
        port:
          entity:
            mappings:
              identifier: .scrapeUrl
              title: (.labels.job // .scrapeUrl)
              blueprint: '"prometheus-target"'
              properties:
                scrapePool: .scrapePool
                scrapeUrl: .scrapeUrl
                health: .health
                lastError: (.lastError // "")
                lastScrape: .lastScrape
                lastScrapeDuration: (.lastScrapeDuration // 0)
                labels: .labels
    ```

    :::info Targets structure
    The `/api/v1/targets` endpoint returns both `activeTargets` and `droppedTargets`. This mapping only includes active targets. You can add a separate mapping for dropped targets if needed.
    :::

    </details>

5. Click `Save` to save the mapping.

## Customization

If you want to customize your setup or test different API endpoints before committing to a configuration, use the [interactive builder](/build-your-software-catalog/custom-integration/ocean-custom-integration/build-your-integration).

**The interactive builder helps you:**
1. Test your Prometheus API endpoints with live data.
2. Automatically detect the data structure and field types.
3. Generate blueprints and resource mappings tailored to your preferences.
4. Get installation commands with your configuration pre-filled.

Simply provide your Prometheus API details, and the builder will generate everything you need to install and create the integration in Port.


