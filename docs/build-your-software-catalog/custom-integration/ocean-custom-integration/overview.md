---
sidebar_position: 1
title: Overview
description: Understanding the Ocean Custom Integration
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import Prerequisites from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/\_ocean_helm_prerequisites_block.mdx"
import AdvancedConfig from '/docs/generalTemplates/\_ocean_advanced_configuration_note.md'
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"

# Overview

This integration allows Port customers to connect to any custom API, internal system, or HTTP service without requiring custom development. Each integration instance connects to one API backend, and users can map multiple endpoints through standard Ocean resource configuration.

---

## When to use this integration?

This integration is ideal when:

- **No native Port integration exists** for your tool or service
- You're working with **internal or custom-built APIs** 
- Your API follows **REST conventions** (JSON responses, HTTP methods)
- You want a **configuration-only solution** without custom code

---

## Prerequisites

Before installing, gather this information about your API:

### 1. Authentication

How does your API verify requests?

- **Bearer Token:** OAuth2 tokens, personal access tokens (most modern APIs)
- **API Key:** Custom header like `X-API-Key` or `Authorization`
- **Basic Auth:** Username and password (legacy systems)
- **None:** Public APIs

**Where to find it:** Check your API's documentation or settings page. Look for sections titled "API Keys," "Access Tokens," or "Authentication."

### 2. Endpoints

Which API endpoint returns the data you want to ingest?

**Example:** `/api/v1/users`, `/v2/projects`, `/tickets`

**How to find it:** Check your API documentation for available endpoints. Look for GET endpoints that return lists of resources.

### 3. Data Structure

Where is the actual data in your API's response?

**Direct array:**
```json
[
  {"id": 1, "name": "Alice"},
  {"id": 2, "name": "Bob"}
]
```

**Nested data:**
```json
{
  "data": [
    {"id": 1, "name": "Alice"},
    {"id": 2, "name": "Bob"}
  ]
}
```

**Deeply nested:**
```json
{
  "response": {
    "users": {
      "items": [
        {"id": 1, "name": "Alice"}
      ]
    }
  }
}
```

You'll use a [JQ](https://jqlang.org/manual/) `data_path` expression in your mapping to tell the integration where to find the array of items (e.g., `.data`, `.users.items`).

---

## How it works

The Ocean Custom integration uses a [**two-step setup**](/build-your-software-catalog/sync-data-to-catalog/) similar to other Ocean integrations you've used:

1. **Installation** - Configure connection settings that apply to all API calls
2. **Resource mapping** - Define which endpoints to sync and how to map them to Port entities

---

## Setup

:::warning High-scale performance considerations

For high-scale environments with large datasets, consider the following:

- **Self-hosted installation** is recommended for better control over resources and performance tuning
- **Rate limiting** may be required to prevent overwhelming your API
- **Resource allocation** - allocate sufficient CPU and memory based on your data volume
:::

Choose one of the following installation methods:  
Not sure which method is right for your use case? Check the available [installation methods](/build-your-software-catalog/sync-data-to-catalog/#installation-methods).

<Tabs groupId="installation-methods" queryString="installation-methods">

<TabItem value="hosted-by-port" label="Hosted by Port" default>

Using this installation option means that the integration will be hosted by Port, with a customizable resync interval to ingest data into Port.

:::tip Self-hosted installation
Alternatively, you can install the integration using the [Self-hosted](?installation-methods=real-time-self-hosted#setup) method for more control over resources and configuration.
:::

<h3>Installation</h3>

To install, follow these steps:

1. Go to the [Data sources](https://app.getport.io/settings/data-sources) page of your portal.

2. Click on the `+ Data source` button in the top-right corner.

3. Click on the **Custom** integration in the list.

4. Under `Select your installation method`, choose `Hosted by Port`.

5. Configure the `integration settings` and `application settings` as you wish (see below for details).

<h3>Application settings</h3>

Every integration hosted by Port has the following customizable application settings, which are configurable after installation:

- `Resync interval`: The frequency at which Port will ingest data from the integration. There are various options available, ranging from every 1 hour to once a day. If a sync is still in progress when the next one is due, the new sync will be skipped (up to 24 hours delay).  
This ensures that all kinds are fully synchronized and that cleanup of stale entities always takes place at the end of each sync.

- `Send raw data examples`: A boolean toggle (`enabled` by default). If enabled, raw data examples will be sent from the integration to Port. These examples are used when [testing your mapping configuration](/build-your-software-catalog/customize-integrations/configure-mapping#test-your-mapping---jq-playground), they allow you to run your `jq` expressions against real data and see the results.

<h3>Integration settings</h3>

The following integration settings are available for the Custom integration. Each setting has an ⓘ icon next to it in the UI, which you can hover over to see a description.

<h4>Connection settings</h4>

| Setting | Description | Required | Default |
|---------|-------------|----------|---------|
| **Base Url** | The base URL of your HTTP API, for example: `https://api.example.com` | ✅ | - |
| **Auth Type** | Authentication method: `none`, `bearer_token`, `basic`, or `api_key` | ❌ | `none` |

<h4>Authentication settings</h4>

These settings are required based on your selected `Auth Type`:

| Setting | Description | Required When | Default |
|---------|-------------|---------------|---------|
| **Api Token** | Bearer token for authentication | `Auth Type` is `bearer_token` | - |
| **Username** | Username for basic authentication | `Auth Type` is `basic` | - |
| **Password** | Password for basic authentication | `Auth Type` is `basic` | - |
| **Api Key** | API key for authentication | `Auth Type` is `api_key` | - |
| **Api Key Header** | Header name for API key authentication | `Auth Type` is `api_key` | `X-API-Key` |

:::info Port secrets
Settings marked with sensitive data (such as tokens, passwords, and API keys) use [Port secrets](/sso-rbac/port-secrets/) to ensure your sensitive data is encrypted and secure. When filling in such a setting, its value will be obscured (shown as `••••••••`). Port will automatically create a secret in your organization for each sensitive setting.
:::

<h4>Pagination settings</h4>

| Setting | Description | Required | Default |
|---------|-------------|----------|---------|
| **Pagination Type** | Pagination method: `none`, `offset`, `page`, or `cursor` | ❌ | `none` |
| **Page Size** | Number of items per page for pagination | ❌ | `100` |
| **Pagination Param** | Query parameter name for the main pagination value. For cursor: `cursor`, `page[after]`, `after`. For page: `page`, `pageNumber`. For offset: `offset`, `skip`. Defaults vary by paginationType. | ❌ | - |
| **Size Param** | Query parameter name for page size/limit. Examples: `limit`, `size`, `page[size]`, `per_page`. Defaults vary by paginationType. | ❌ | - |
| **Start Page** | Starting page number for page-based pagination (e.g., 0 or 1). Defaults to 1. | ❌ | `1` |
| **Cursor Path** | Dot-notation path to extract cursor from response for cursor pagination (e.g., `meta.after_cursor`, `links.next`). Defaults to common patterns if not specified. | ❌ | - |
| **Has More Path** | Dot-notation path to check if more pages exist (e.g., `meta.has_more`, `pagination.hasMore`). Works with all pagination types. Defaults to common patterns if not specified. | ❌ | - |

<h4>Performance settings</h4>

| Setting | Description | Required | Default |
|---------|-------------|----------|---------|
| **Timeout** | Request timeout in seconds | ❌ | `30` |
| **Verify Ssl** | Whether to verify SSL certificates | ❌ | `true` |
| **Max Concurrent Requests** | Maximum concurrent API requests (uses Ocean's built-in rate limiting and caching) | ❌ | `10` |

<h3>Port source IP addresses</h3>

When using this installation method, Port will make outbound calls to your API from static IP addresses.  
You may need to add these addresses to your allowlist, in order to allow Port to interact with your API:

<Tabs>
<TabItem value="eu" label="Europe (EU)">
```
54.73.167.226  
63.33.143.237  
54.76.185.219
```
</TabItem>
<TabItem value="us" label="United States (US)">
```
3.234.37.33  
54.225.172.136  
3.225.234.99
```
</TabItem>
</Tabs>

</TabItem>

<TabItem value="real-time-self-hosted" label="Self-hosted">

Using this installation option means that the integration will run in your own infrastructure, giving you full control over resources and configuration.

<h2>Prerequisites</h2>

<Prerequisites />

For details about the available parameters for the installation, see the table below.

<Tabs groupId="deploy" queryString="deploy">

<TabItem value="helm" label="Helm" default>

To install the integration using Helm:

1. Go to the [Custom data source page](https://app.getport.io/settings/data-sources?section=EXPORTERS&provider=Custom) in your portal.

2. Select the `Real-time and always on` method:
    <img src="/img/sync-data-to-catalog/selfHostedMethod.png" width="40%" border='1px' />

3. A `helm` command will be displayed, with default values already filled out (e.g. your Port client ID, client secret, etc).  
Copy the command, replace the placeholders with your values, then run it in your terminal to install the integration.

Alternatively, you can install manually using the following steps:

1. Add Port's Helm chart repository:

```bash
helm repo add --force-update port-labs https://port-labs.github.io/helm-charts
```

2. Install the Helm chart with your configuration:

```bash
helm install ocean-custom port-labs/port-ocean \
  --set port.clientId="<PORT_CLIENT_ID>" \
  --set port.clientSecret="<PORT_CLIENT_SECRET>" \
  --set port.baseUrl="https://api.getport.io" \
  --set initializePortResources=true \
  --set scheduledResyncInterval=60 \
  --set integration.identifier="ocean-custom" \
  --set integration.type="custom" \
  --set integration.eventListener.type="POLLING" \
  --set integration.config.baseUrl="https://api.yourcompany.com" \
  --set integration.config.authType="bearer_token" \
  --set integration.secrets.authValue="<YOUR_API_TOKEN>" \
  --set integration.config.paginationType="page" \
  --set integration.config.pageSize=100
```

<PortApiRegionTip/>

</TabItem>

<TabItem value="docker" label="Docker">

To install the integration using Docker:

1. Pull the Docker image:

```bash
docker pull ghcr.io/port-labs/port-ocean-custom:latest
```

2. Run the container with your configuration:

```bash
docker run -i --rm \
  -e OCEAN__PORT__CLIENT_ID="<PORT_CLIENT_ID>" \
  -e OCEAN__PORT__CLIENT_SECRET="<PORT_CLIENT_SECRET>" \
  -e OCEAN__PORT__BASE_URL="https://api.getport.io" \
  -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
  -e OCEAN__SCHEDULED_RESYNC_INTERVAL=60 \
  -e OCEAN__INTEGRATION__IDENTIFIER="ocean-custom" \
  -e OCEAN__INTEGRATION__TYPE="custom" \
  -e OCEAN__EVENT_LISTENER='{"type":"POLLING"}' \
  -e OCEAN__INTEGRATION__CONFIG__BASE_URL="https://api.yourcompany.com" \
  -e OCEAN__INTEGRATION__CONFIG__AUTH_TYPE="bearer_token" \
  -e OCEAN__INTEGRATION__SECRETS__AUTH_VALUE="<YOUR_API_TOKEN>" \
  -e OCEAN__INTEGRATION__CONFIG__PAGINATION_TYPE="page" \
  -e OCEAN__INTEGRATION__CONFIG__PAGE_SIZE=100 \
  ghcr.io/port-labs/port-ocean-custom:latest
```

<PortApiRegionTip/>

</TabItem>

</Tabs>

This table summarizes the available parameters for the installation.

| Parameter                                | Description                                                                                                                                                                                                                                                                                    | Example                          | Required |
|------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------|----------|
| `port.clientId`                          | Your port [client id](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)                                                                                                                                                                  |                                  | ✅        |
| `port.clientSecret`                      | Your port [client secret](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)                                                                                                                                                              |                                  | ✅        |
| `port.baseUrl`                           | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US                                                                                                                                                                                                        |                                  | ✅        |
| `integration.config.baseUrl`             | The root URL of your API (e.g., `https://api.yourcompany.com`)                                                                                                                                                                                                                                 | https://api.yourcompany.com       | ✅        |
| `integration.config.authType`            | Authentication type: `bearer_token`, `api_key`, `basic_auth`, or `none`                                                                                                                                                                                                                       | bearer_token                      | ✅        |
| `integration.secrets.authValue`          | Authentication value (token, API key, or base64-encoded username:password for basic auth)                                                                                                                                                                                                     |                                  | ✅        |
| `integration.config.paginationType`      | Pagination type: `offset`, `page`, `cursor`, or `none`                                                                                                                                                                                                                                        | page                              | ❌        |
| `integration.config.pageSize`            | Number of items per page (for offset/page pagination)                                                                                                                                                                                                                                        | 100                               | ❌        |
| `integration.config.timeout`             | Request timeout in seconds (default: 30)                                                                                                                                                                                                                                                       | 30                                | ❌        |
| `integration.eventListener.type`         | The event listener type. Read more about [event listeners](https://ocean.getport.io/framework/features/event-listener)                                                                                                                                                                         | POLLING                           | ✅        |
| `integration.type`                       | The integration to be installed                                                                                                                                                                                                                                                                | custom                            | ✅        |
| `scheduledResyncInterval`                 | The number of minutes between each resync. When not set the integration will resync for each event listener resync event. Read more about [scheduledResyncInterval](https://ocean.getport.io/develop-an-integration/integration-configuration/#scheduledresyncinterval---run-scheduled-resync) | 60                                | ❌        |
| `initializePortResources`                | Default true, When set to true the integration will create default blueprints and the port App config Mapping. Read more about [initializePortResources](https://ocean.getport.io/develop-an-integration/integration-configuration/#initializeportresources---initialize-port-resources)       | true                              | ❌        |
| `sendRawDataExamples`                    | Enable sending raw data examples from the third party API to port for testing and managing the integration mapping. Default is true                                                                                                                                                            | true                              | ❌        |

<AdvancedConfig/>

</TabItem>

</Tabs>

---

## Step 2: Resource mapping

After installation, you define **which endpoints to sync** in your `port-app-config.yml` file (or using the integration's configuration in Port).

This is where you map each API endpoint to Port entities - similar to how you've mapped GitHub repositories or Jira issues in other integrations.

#### 🆕 Endpoint-as-kind feature

The `kind` field is now the **endpoint path itself**! This provides better visibility in Port's UI, allowing you to:

- ✅ Track each endpoint's sync status individually
- ✅ Debug mapping issues per endpoint
- ✅ Monitor data ingestion per API call

#### Example: Mapping two endpoints

```yaml
resources:
  # First endpoint: users
  - kind: /api/v1/users
    selector:
      query: 'true'         # JQ filter - 'true' means sync all entities
      data_path: '.users'   # Where to find the data array in the response
      query_params:         # Optional: add query parameters to the API call
        active: "true"
        department: "engineering"
    port:
      entity:
        mappings:
          identifier: .id
          title: .name
          blueprint: '"user"'
          properties:
            email: .email
            department: .department
            active: .is_active
            created: .created_at

  # Second endpoint: projects
  - kind: /api/v1/projects
    selector:
      query: 'true'
      data_path: '.data.projects'  # Nested data extraction
      query_params:
        status: "active"
    port:
      entity:
        mappings:
          identifier: .project_id
          title: .project_name
          blueprint: '"project"'
          properties:
            description: .description
            owner: .owner.email
            budget: .budget_amount
            created: .created_date
```

#### What each field does

- **`kind`**: The API endpoint path (combined with your base URL)
- **`selector.query`**: JQ filter to include/exclude entities (use `'true'` to sync all)
- **`selector.data_path`**: JQ expression pointing to the array of items in the response
- **`selector.query_params`**: (Optional) Query parameters added to the URL
- **`selector.method`**: (Optional) HTTP method, defaults to `GET`
- **`port.entity.mappings`**: How to map API fields to Port entity properties

---

## Advanced configurations

Once you have the basics working, these features handle more complex scenarios.

### Nested Endpoints

Fetch data from dynamic endpoints that depend on other resources.

**Use case:** Get all tickets, then fetch comments for each ticket.

#### How it works

**Step 1 - Define parent endpoint:**
```yaml
resources:
  - kind: /api/tickets
    port:
      entity:
        mappings:
          identifier: .id | tostring
          blueprint: '"ticket"'
```

**Step 2 - Define nested endpoint:**
```yaml
resources:
  - kind: /api/tickets/{ticket_id}/comments
    selector:
      path_parameters:
        ticket_id:
          endpoint: /api/tickets
          field: .id
          filter: 'true'
    port:
      entity:
        mappings:
          identifier: .id | tostring
          blueprint: '"comment"'
          relations:
            ticket: .ticket_id | tostring
```

The integration will:
1. Call `/api/tickets` → Get ticket IDs [101, 102, 103]
2. Call `/api/tickets/101/comments`, `/api/tickets/102/comments`, `/api/tickets/103/comments`
3. Sync all comments with relations to their parent tickets

**Real-world examples:**
- `/projects/{project_id}/tasks` - Tasks within projects
- `/repositories/{repo_id}/pull-requests` - PRs in repositories
- `/customers/{customer_id}/orders` - Orders for customers

### Pagination

For APIs that split data across multiple pages, configure how the integration fetches all pages.

#### Pagination types

**Offset-based** (like SQL):
```
GET /api/users?offset=0&limit=100
GET /api/users?offset=100&limit=100
```

**Page-based** (traditional):
```
GET /api/users?page=1&size=100
GET /api/users?page=2&size=100
```

**Cursor-based** (for large datasets):
```
GET /api/users?cursor=abc123&limit=100
GET /api/users?cursor=xyz789&limit=100
```

#### Custom parameter names

APIs often use different parameter names. You can configure:

- **Pagination parameter:** Use `skip` instead of `offset`, or `after` instead of `cursor`
- **Size parameter:** Use `per_page` instead of `limit`, or `page_size` instead of `size`
- **Start page:** Specify if pages start at 0 or 1

**Example:**
```yaml
# GitHub uses page/per_page
paginationType: page
paginationParam: page
sizeParam: per_page
startPage: 1

# Stripe uses limit/starting_after
paginationType: cursor
paginationParam: starting_after
sizeParam: limit
```

#### Cursor path configuration

For cursor-based pagination, tell the integration where to find the next cursor in responses:

**Example API response:**
```json
{
  "data": [...],
  "meta": {
    "after_cursor": "xyz123",
    "has_more": true
  }
}
```

**Configuration:**
```yaml
cursorPath: meta.after_cursor
hasMorePath: meta.has_more
```

### Rate limiting

Control how the integration interacts with your API to prevent overwhelming it or hitting rate limits.

#### Request timeout

How long to wait for each API call to complete.

```yaml
timeout: 30  # seconds (default: 30)
```

**When to adjust:**
- Increase for slow APIs or large responses (e.g., 60 seconds)
- Decrease for fast, local APIs (e.g., 10 seconds)

---

## Ready to build?

Head to [Build your integration](./build-your-integration) for a step-by-step guide with an interactive configuration builder.

---

## More resources

For all configuration options, code examples, and advanced use cases, check out the [Ocean Custom integration repository on GitHub](https://github.com/port-labs/ocean/tree/main/integrations/custom).

