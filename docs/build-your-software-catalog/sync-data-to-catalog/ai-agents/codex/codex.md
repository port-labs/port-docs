import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import Prerequisites from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_helm_prerequisites_block.mdx"
import AdvancedConfig from '/docs/generalTemplates/_ocean_advanced_configuration_note.md'
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"
import CustomOceanIntegration from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_custom_ocean_integration.mdx"

# Codex

<CustomOceanIntegration />

Port's Codex integration ingests foundational OpenAI usage metrics into your software catalog using the [Ocean Custom Integration](/build-your-software-catalog/custom-integration/ocean-custom-integration/overview) framework. It focuses on two reliable data sources: daily cost summaries and model-level usage statistics.

## Supported metrics

- `openai_daily_usage` – Daily totals for requests, tokens, and spend from `/dashboard/billing/usage`.
- `openai_model_usage` – Model-level request and token breakdowns from `/usage`.

These two metrics give immediate visibility into overall spend and which models teams rely on most.

## Prerequisites

To use this integration, you need:

- An OpenAI API key with access to the usage and billing endpoints.
- Network access from the Ocean integration to `api.openai.com`.

**To create an OpenAI API key:**

1. Navigate to the [OpenAI Platform](https://platform.openai.com/) and sign in to your account.
2. Click on your profile icon in the top right corner and select **API keys**.
3. Click **Create new secret key**.
4. Give your key a name (e.g., "Port Integration") and click **Create secret key**.
5. Copy the API key immediately (it starts with `sk-`). You won't be able to see it again after closing the dialog.

:::warning API key security
Store your API key securely and never share it. The key provides access to your OpenAI account usage and billing data.
:::

:::info OpenAI API documentation
Review the [OpenAI usage docs](https://platform.openai.com/docs/api-reference/usage) to understand the exact response structure returned by each endpoint.
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
Remember to replace the placeholders for `YOUR_PORT_CLIENT_ID`, `YOUR_PORT_CLIENT_SECRET`, and `YOUR_OPENAI_API_KEY`.
:::

```bash showLineNumbers
helm repo add --force-update port-labs https://port-labs.github.io/helm-charts
helm upgrade --install my-ocean-codex-integration port-labs/port-ocean \
  --set port.clientId="YOUR_PORT_CLIENT_ID" \
  --set port.clientSecret="YOUR_PORT_CLIENT_SECRET" \
  --set port.baseUrl="https://api.getport.io" \
  --set initializePortResources=true \
  --set integration.identifier="codex-integration" \
  --set integration.type="custom" \
  --set integration.eventListener.type="POLLING" \
  --set integration.config.baseUrl="https://api.openai.com/v1" \
  --set integration.config.authType="bearer_token" \
  --set integration.config.apiToken="YOUR_OPENAI_API_KEY"
```

<PortApiRegionTip/>

<h2> Configuration parameters </h2>

| Parameter | Description | Example | Required |
| --- | --- | --- | --- |
| `port.clientId` | Your Port [client id](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials). |  | ✅ |
| `port.clientSecret` | Your Port [client secret](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials). |  | ✅ |
| `port.baseUrl` | Your Port API URL (`https://api.getport.io` for EU, `https://api.us.getport.io` for US). |  | ✅ |
| `integration.config.baseUrl` | Base URL for the OpenAI API. | https://api.openai.com/v1 | ✅ |
| `integration.config.authType` | Authentication type for OpenAI (use `bearer_token` for OpenAI). | bearer_token | ✅ |
| `integration.config.apiToken` | OpenAI API key (starts with `sk-`). | sk-abc123 | ✅ |
| `integration.eventListener.type` | Event listener type for the integration. | POLLING | ✅ |
| `integration.type` | Integration type. Must be `custom`. | custom | ✅ |
| `integration.identifier` | Unique identifier for this integration instance. | codex-integration | ✅ |
| `initializePortResources` | Create default blueprints and mappings on first run. | true | ❌ |
| `scheduledResyncInterval` | Minutes between scheduled syncs. Defaults to event listener interval when omitted. | 120 | ❌ |
| `sendRawDataExamples` | Send sample payloads for easier mapping. | true | ❌ |

<br/>

<AdvancedConfig/>

</TabItem>

<TabItem value="docker" label="Docker">

To run the integration using Docker for a one-time sync:

:::note Replace placeholders
Remember to replace the placeholders for `YOUR_PORT_CLIENT_ID`, `YOUR_PORT_CLIENT_SECRET`, and `YOUR_OPENAI_API_KEY`.
:::

```bash showLineNumbers
docker run -i --rm --platform=linux/amd64 \
  -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
  -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
  -e OCEAN__SEND_RAW_DATA_EXAMPLES=true \
  -e OCEAN__INTEGRATION__CONFIG__BASE_URL="https://api.openai.com/v1" \
  -e OCEAN__INTEGRATION__CONFIG__AUTH_TYPE="bearer_token" \
  -e OCEAN__INTEGRATION__CONFIG__API_TOKEN="YOUR_OPENAI_API_KEY" \
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

Before syncing data, create the blueprints that define your OpenAI usage entities.

**To create the blueprints:**

1. Go to your [Builder page](https://app.getport.io/settings/data-model).
2. Click the `+ Blueprint` button.
3. Copy each blueprint JSON from the sections below.

<details>
<summary><b>OpenAI daily usage blueprint (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "openai_daily_usage",
  "title": "OpenAI Daily Usage",
  "icon": "OpenAI",
  "schema": {
    "properties": {
      "date": {
        "type": "string",
        "format": "date",
        "title": "Date"
      },
      "total_requests": {
        "type": "number",
        "title": "Total Requests"
      },
      "total_tokens": {
        "type": "number",
        "title": "Total Tokens"
      },
      "total_cost": {
        "type": "number",
        "title": "Total Cost (USD)"
      }
    },
    "required": [
      "date"
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
<summary><b>OpenAI model usage blueprint (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "openai_model_usage",
  "title": "OpenAI Model Usage",
  "icon": "OpenAI",
  "schema": {
    "properties": {
      "model": {
        "type": "string",
        "title": "Model Name"
      },
      "date": {
        "type": "string",
        "format": "date",
        "title": "Date"
      },
      "requests": {
        "type": "number",
        "title": "Requests"
      },
      "tokens": {
        "type": "number",
        "title": "Tokens Used"
      }
    },
    "required": [
      "model",
      "date"
    ]
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {}
}
```

</details>

4. Click `Save` after each blueprint is added.

## Configuration 

Each resource maps an OpenAI endpoint to the Port entities defined above.

**Key mapping components:**

- **`kind`** – API endpoint path appended to `https://api.openai.com/v1`.
- **`selector`** – Request payload, pagination controls, and data selection logic.
- **`port.entity.mappings`** – JQ expressions that transform the API payload into Port entities.

<details>
<summary><b>Daily usage summary mapping (Click to expand)</b></summary>

```yaml showLineNumbers
resources:
  - kind: /dashboard/billing/usage
    selector:
      query: 'true'
      query_params:
        start_date: '((now | floor) - (86400 * 30)) | strftime("%Y-%m-%d")'
        end_date: '(now | floor) | strftime("%Y-%m-%d")'
    port:
      entity:
        mappings:
          identifier: "daily-" + (.timestamp // .aggregation_timestamp // "unknown")
          title: "OpenAI Usage " + (.timestamp // .aggregation_timestamp // "unknown")
          blueprint: '"openai_daily_usage"'
          properties:
            date: (.timestamp // .aggregation_timestamp // "" | split("T")[0])
            total_requests: .total_requests // 0
            total_tokens: .total_tokens // 0
            total_cost: (.total_usage // 0) / 100
```

:::info Cost units
`/dashboard/billing/usage` returns costs in cents. Divide by `100` to store USD.
:::

</details>

<details>
<summary><b>Model usage breakdown mapping (Click to expand)</b></summary>

```yaml showLineNumbers
resources:
  - kind: /usage
    selector:
      query: 'true'
      query_params:
        date: '(now | floor) | strftime("%Y-%m-%d")'
    port:
      entity:
        mappings:
          identifier: .snapshot_id + "-" + ((.aggregation_timestamp // 0) | tostring)
          title: .snapshot_id + " usage"
          blueprint: '"openai_model_usage"'
          properties:
            model: .snapshot_id
            date: (.aggregation_timestamp // 0 | strftime("%Y-%m-%d"))
            requests: .n_requests // 0
            tokens: (.n_context_tokens_total // 0) + (.n_generated_tokens_total // 0)
```

:::info Snapshot identifiers
`snapshot_id` typically corresponds to the model name (for example, `gpt-4o`). Use it for both the identifier and the model property to keep the mapping simple.
:::

</details>

5. Click `Save` to persist the mapping.

## Customization

If you want to expand beyond the starter resources, use the [interactive builder](/build-your-software-catalog/custom-integration/ocean-custom-integration/build-your-integration) to:

1. Test additional OpenAI endpoints.
2. Explore the response shape and detected property types.
3. Generate blueprint JSON and mapping snippets automatically.
4. Export installation commands with your configuration pre-filled.

Start with the daily and model usage entities above, then add more resources (such as per-organization or per-team reports) once you verify the value.

