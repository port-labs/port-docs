---
sidebar_position: 1
title: Hosted by Port
description: Install the Ocean custom integration hosted by Port
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"

# Hosted by Port

Using this installation option means that the integration will be hosted by Port, with a customizable resync interval to ingest data into Port. Port manages the infrastructure, updates, and maintenance, allowing you to focus on configuring your API connection.

:::warning High-scale performance considerations

For high-scale environments with large datasets, consider the following:

- **Self-hosted installation** is recommended for better control over resources and performance tuning.
- **Rate limiting** may be required to prevent overwhelming your API.
- **Resource allocation** - allocate sufficient CPU and memory based on your data volume.
:::

## Installation

To install, follow these steps:

1. Go to the [data sources](https://app.getport.io/settings/data-sources) page of your portal.

2. Click on the **+ Data source** button in the top-right corner.

3. Click on the **Custom** integration in the list.

4. Under **Select your installation method**, choose **Hosted by Port**.

5. Configure the **integration settings** and **application settings** as you wish (see below for details).

## Application settings

Every integration hosted by Port has the following customizable application settings, which are configurable after installation:

- **Resync interval**: The frequency at which Port will ingest data from the integration. There are various options available, ranging from every 1 hour to once a day. If a sync is still in progress when the next one is due, the new sync will be skipped (up to 24 hours delay). This ensures that all kinds are fully synchronized and that cleanup of stale entities always takes place at the end of each sync.

- **Send raw data examples**: A boolean toggle (**enabled** by default). If enabled, raw data examples will be sent from the integration to Port. These examples are used when [testing your mapping configuration](/build-your-software-catalog/customize-integrations/configure-mapping#test-your-mapping---jq-playground), they allow you to run your `jq` expressions against real data and see the results.

## Integration settings

The following integration settings are available for the custom integration. Each setting has an ⓘ icon next to it in the UI, which you can hover over to see a description.

### Connection settings

| Setting | Description | Required | Default |
|---------|-------------|----------|---------|
| **Base Url** | The base URL of your HTTP API, for example: `https://api.example.com` | ✅ | - |
| **Auth Type** | Authentication method: `none`, `bearer_token`, `basic`, or `api_key` | ❌ | `none` |

### Authentication settings

These settings are required based on your selected **Auth Type**:

| Setting | Description | Required When | Default |
|---------|-------------|---------------|---------|
| **Api Token** | Bearer token for authentication | **Auth Type** is `bearer_token` | - |
| **Username** | Username for basic authentication | **Auth Type** is `basic` | - |
| **Password** | Password for basic authentication | **Auth Type** is `basic` | - |
| **Api Key** | API key for authentication | **Auth Type** is `api_key` | - |
| **Api Key Header** | Header name for API key authentication | **Auth Type** is `api_key` | `X-API-Key` |

:::info Port secrets
Settings marked with sensitive data (such as tokens, passwords, and API keys) use [Port secrets](/sso-rbac/port-secrets/) to ensure your sensitive data is encrypted and secure. When filling in such a setting, its value will be obscured (shown as `••••••••`). Port will automatically create a secret in your organization for each sensitive setting.
:::

### Pagination settings

| Setting | Description | Required | Default |
|---------|-------------|----------|---------|
| **Pagination Type** | Pagination method: `none`, `offset`, `page`, or `cursor` | ❌ | `none` |
| **Page Size** | Number of items per page for pagination | ❌ | `100` |
| **Pagination Param** | Query parameter name for the main pagination value. For cursor: `cursor`, `page[after]`, `after`. For page: `page`, `pageNumber`. For offset: `offset`, `skip`. Defaults vary by paginationType. | ❌ | - |
| **Size Param** | Query parameter name for page size/limit. Examples: `limit`, `size`, `page[size]`, `per_page`. Defaults vary by paginationType. | ❌ | - |
| **Start Page** | Starting page number for page-based pagination (e.g., 0 or 1). Defaults to 1. | ❌ | `1` |
| **Cursor Path** | Dot-notation path to extract cursor from response for cursor pagination (e.g., `meta.after_cursor`, `links.next`). Defaults to common patterns if not specified. | ❌ | - |
| **Has More Path** | Dot-notation path to check if more pages exist (e.g., `meta.has_more`, `pagination.hasMore`). Works with all pagination types. Defaults to common patterns if not specified. | ❌ | - |

### Performance settings

| Setting | Description | Required | Default |
|---------|-------------|----------|---------|
| **Timeout** | Request timeout in seconds | ❌ | `30` |
| **Verify Ssl** | Whether to verify SSL certificates | ❌ | `true` |
| **Max Concurrent Requests** | Maximum concurrent API requests (uses Ocean's built-in rate limiting and caching) | ❌ | `10` |

## Port source IP addresses

When using this installation method, Port will make outbound calls to your API from static IP addresses. You may need to add these addresses to your allowlist, in order to allow Port to interact with your API:

<Tabs groupId="region" queryString="region">
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

## More resources

For all configuration options, code examples, and advanced use cases, check out the [Ocean custom integration repository on GitHub](https://github.com/port-labs/ocean/tree/main/integrations/custom).

