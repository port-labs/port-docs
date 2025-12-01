import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import Prerequisites from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_helm_prerequisites_block.mdx"
import AdvancedConfig from '/docs/generalTemplates/_ocean_advanced_configuration_note.md'
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"
import CustomOceanIntegration from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_custom_ocean_integration.mdx"

# n8n

<CustomOceanIntegration />

Port's n8n integration ingests n8n resources into your software catalog using the [Ocean Custom Integration](/build-your-software-catalog/custom-integration/ocean-custom-integration/overview) framework. It focuses on three key data sources: users, projects, and workflows.

## Supported resources

The n8n integration can ingest the following resources into Port:

- `n8nUser` – n8n users from `/v1/users`.
- `n8nProject` – n8n projects from `/v1/projects`.
- `n8nWorkflow` – n8n workflows from `/v1/workflows`.

These resources provide visibility into your n8n automation platform, including user management, project organization, and workflow definitions.

## Prerequisites

To use this integration, you need:

1. Port credentials (`CLIENT_ID` and `CLIENT_SECRET`)
2. n8n instance URL (e.g., `https://your-instance.com/api`)
3. n8n API key (see [n8n API docs](https://docs.n8n.io/api/authentication/))

**To create an n8n API key:**

1. Navigate to your n8n instance and sign in to your account.
2. Go to **Settings** → **API**.
3. Click **Create API Key**.
4. Give your key a name (e.g., "Port Integration") and copy the API key.
5. Store the API key securely.

:::warning API key security
Store your API key securely and never share it. The key provides access to your n8n instance data.
:::

Review the [n8n API reference](https://docs.n8n.io/api/api-reference/) to understand the exact response structure returned by each endpoint.

## Installation

Choose one of the following installation methods to deploy the Ocean Custom Integration:

<Tabs groupId="installation-methods" queryString="installation-methods">

<TabItem value="helm" label="Helm" default>

<h2> Prerequisites </h2>

<Prerequisites />

<h2> Installation </h2>

1. Add Port's Helm repo and install the Ocean Custom Integration:

:::note Replace placeholders
Remember to replace the placeholders for `YOUR_PORT_CLIENT_ID`, `YOUR_PORT_CLIENT_SECRET`, `YOUR_N8N_INSTANCE_URL`, and `YOUR_N8N_API_KEY`.
:::

```bash showLineNumbers
helm repo add port-labs https://port-labs.github.io/helm-charts
helm repo update

helm install n8n-integration port-labs/port-ocean-custom \
  --set eventListener.type=ONCE \
  --set initializePortResources=true \
  --set sendRawDataExamples=true \
  --set integration.identifier=n8n-integration \
  --set integration.config.baseUrl=https://your-instance.com/api \
  --set integration.config.authType=api_key \
  --set integration.config.apiKeyHeader=X-N8N-API-KEY \
  --set integration.secrets.apiKey=YOUR_N8N_API_KEY \
  --set integration.config.paginationType=cursor \
  --set integration.config.paginationParam=cursor \
  --set integration.config.sizeParam=limit \
  --set integration.config.pageSize=100 \
  --set integration.config.cursorPath=nextCursor \
  --set integration.config.hasMorePath=nextCursor \
  --set port.clientId=YOUR_PORT_CLIENT_ID \
  --set port.clientSecret=YOUR_PORT_CLIENT_SECRET \
  --set port.baseUrl=https://api.getport.io
```

<PortApiRegionTip/>

<h2> Configuration parameters </h2>

| Parameter | Description | Example | Required |
| --- | --- | --- | --- |
| `port.clientId` | Your Port [client id](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials). |  | ✅ |
| `port.clientSecret` | Your Port [client secret](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials). |  | ✅ |
| `port.baseUrl` | Your Port API URL (`https://api.getport.io` for EU, `https://api.us.getport.io` for US). |  | ✅ |
| `integration.config.baseUrl` | Base URL for your n8n instance API. | https://your-instance.com/api | ✅ |
| `integration.config.authType` | Authentication type for n8n (use `api_key` for n8n). | api_key | ✅ |
| `integration.config.apiKeyHeader` | Header name for the API key. | X-N8N-API-KEY | ✅ |
| `integration.secrets.apiKey` | n8n API key. |  | ✅ |
| `integration.config.paginationType` | Pagination type used by n8n API. | cursor | ✅ |
| `integration.config.paginationParam` | Query parameter name for pagination cursor. | cursor | ✅ |
| `integration.config.sizeParam` | Query parameter name for page size. | limit | ✅ |
| `integration.config.pageSize` | Number of items per page. | 100 | ✅ |
| `integration.config.cursorPath` | JSON path to cursor value in response. | nextCursor | ✅ |
| `integration.config.hasMorePath` | JSON path to check if more pages exist. | nextCursor | ✅ |
| `integration.eventListener.type` | Event listener type for the integration. | ONCE | ✅ |
| `integration.identifier` | Unique identifier for this integration instance. | n8n-integration | ✅ |
| `initializePortResources` | Create default blueprints and mappings on first run. | true | ❌ |
| `sendRawDataExamples` | Send sample payloads for easier mapping. | true | ❌ |

<br/>

<AdvancedConfig/>

</TabItem>

<TabItem value="docker" label="Docker">

To run the integration using Docker for a one-time sync:

:::note Replace placeholders
Remember to replace the placeholders for `YOUR_PORT_CLIENT_ID`, `YOUR_PORT_CLIENT_SECRET`, `YOUR_N8N_INSTANCE_URL`, and `YOUR_N8N_API_KEY`.
:::

```bash showLineNumbers
docker run -i --rm --platform=linux/amd64 \
  -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
  -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
  -e OCEAN__SEND_RAW_DATA_EXAMPLES=true \
  -e OCEAN__INTEGRATION__IDENTIFIER=n8n-integration \
  -e OCEAN__INTEGRATION__CONFIG__BASE_URL="https://your-instance.com/api" \
  -e OCEAN__INTEGRATION__CONFIG__AUTH_TYPE="api_key" \
  -e OCEAN__INTEGRATION__CONFIG__API_KEY_HEADER="X-N8N-API-KEY" \
  -e OCEAN__INTEGRATION__CONFIG__API_KEY="YOUR_N8N_API_KEY" \
  -e OCEAN__INTEGRATION__CONFIG__PAGINATION_TYPE="cursor" \
  -e OCEAN__INTEGRATION__CONFIG__PAGINATION_PARAM="cursor" \
  -e OCEAN__INTEGRATION__CONFIG__SIZE_PARAM="limit" \
  -e OCEAN__INTEGRATION__CONFIG__PAGE_SIZE="100" \
  -e OCEAN__INTEGRATION__CONFIG__CURSOR_PATH="nextCursor" \
  -e OCEAN__INTEGRATION__CONFIG__HAS_MORE_PATH="nextCursor" \
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

Before syncing data, create the blueprints that define your n8n entities (users, projects, and workflows).

**To create the blueprints:**

1. Go to your [Builder page](https://app.getport.io/settings/data-model).
2. Click the `+ Blueprint` button.
3. Copy each blueprint JSON from the sections below.
    
    <details>
    <summary><b>n8n User blueprint (Click to expand)</b></summary>
    
    ```json showLineNumbers
    {
      "identifier": "n8nUser",
      "description": "This blueprint represents an n8n user",
      "title": "n8n User",
      "icon": "User",
      "schema": {
        "properties": {
          "created_at": {
            "type": "string",
            "title": "Created At",
            "format": "date-time"
          },
          "is_active": {
            "type": "boolean",
            "title": "Is Active"
          },
          "email": {
            "type": "string",
            "title": "Email"
          },
          "full_name": {
            "type": "string",
            "title": "Full Name"
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
    <summary><b>n8n Project blueprint (Click to expand)</b></summary>
    
    ```json showLineNumbers
    {
      "identifier": "n8nProject",
      "description": "This blueprint represents an n8n project",
      "title": "n8n Project",
      "icon": "OpenFolder",
      "schema": {
        "properties": {},
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
    <summary><b>n8n Workflow blueprint (Click to expand)</b></summary>
    
    ```json showLineNumbers
    {
      "identifier": "n8nWorkflow",
      "description": "This blueprint represents an n8n workflow",
      "title": "n8n Workflow",
      "icon": "Pipeline",
      "schema": {
        "properties": {
          "created_at": {
            "type": "string",
            "title": "Created At",
            "format": "date-time"
          },
          "updated_at": {
            "type": "string",
            "title": "Updated At",
            "format": "date-time"
          },
          "is_active": {
            "type": "boolean",
            "title": "Is Active"
          },
          "is_archived": {
            "type": "boolean",
            "title": "Is Archived"
          },
          "nodes": {
            "items": {
              "type": "object"
            },
            "icon": "DefaultProperty",
            "type": "array",
            "title": "Nodes"
          },
          "connections": {
            "type": "object",
            "title": "Connections"
          },
          "trigger_count": {
            "type": "number",
            "title": "Trigger Count"
          },
          "tags": {
            "items": {
              "type": "string"
            },
            "type": "array",
            "title": "Tags"
          }
        },
        "required": []
      },
      "mirrorProperties": {},
      "calculationProperties": {},
      "aggregationProperties": {},
      "relations": {
        "project": {
          "title": "Project",
          "target": "n8nProject",
          "required": false,
          "many": false
        }
      }
    }
    ```
    
    </details>

4. Click `Save` after each blueprint is added.

## Configuration 

Each resource maps an n8n endpoint to the Port entities defined above.

**Key mapping components:**

- **`kind`** – API endpoint path appended to your n8n base URL.
- **`selector`** – Request payload, pagination controls, and data selection logic.
- **`port.entity.mappings`** – JQ expressions that transform the API payload into Port entities.

<details>
<summary><b>Complete mapping configuration (Click to expand)</b></summary>

```yaml showLineNumbers
deleteDependentEntities: true
createMissingRelatedEntities: true
enableMergeEntity: true
resources:
  - kind: /v1/users
    selector:
      query: 'true'
      data_path: .data
    port:
      entity:
        mappings:
          identifier: .id
          title: .email
          blueprint: '"n8nUser"'
          properties:
            full_name: >-
              if (.firstName // null) != null or (.lastName // null) != null
              then ((.firstName // "") + " " + (.lastName // "")) else .email
              end
            is_active: (.isPending | not)
            created_at: .createdAt
            email: .email
  - kind: /v1/projects
    selector:
      query: 'true'
      data_path: .data
    port:
      entity:
        mappings:
          identifier: .id
          title: .name
          blueprint: '"n8nProject"'
          properties: {}
  - kind: /v1/workflows
    selector:
      query: 'true'
      data_path: .data
    port:
      entity:
        mappings:
          identifier: .id
          title: .name
          blueprint: '"n8nWorkflow"'
          properties:
            nodes: .nodes
            connections: .connections
            trigger_count: .triggerCount
            is_active: .active
            is_archived: .isArchived
            tags: (.tags | map(.name))
            created_at: .createdAt
            updated_at: .updatedAt
          relations:
            project: .shared[0].projectId
```

</details>

5. Click `Save` to persist the mapping.

## Customization

If you want to expand beyond the starter resources, use the [interactive builder](/build-your-software-catalog/custom-integration/ocean-custom-integration/build-your-integration) to:

1. Test additional n8n endpoints.
2. Explore the response shape and detected property types.
3. Generate blueprint JSON and mapping snippets automatically.
4. Export installation commands with your configuration pre-filled.

Start with the users, projects, and workflows entities above, then add more resources (such as executions or credentials) once you verify the value.

## API Reference

- [n8n Projects API](https://docs.n8n.io/api/api-reference/#tag/projects/get/projects)
- [n8n Users API](https://docs.n8n.io/api/api-reference/#tag/user/get/users)
- [n8n Workflows API](https://docs.n8n.io/api/api-reference/#tag/workflow/get/workflows)

