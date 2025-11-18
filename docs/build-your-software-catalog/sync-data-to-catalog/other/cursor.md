# Cursor

Port's Cursor integration allows you to model Cursor background agents and related resources in your software catalog and ingest data into them using the [Generic HTTP Integration](/build-your-software-catalog/custom-integration/ocean-custom-integration/overview).

## Overview

This integration allows you to:

- Map and organize your desired Cursor resources and their metadata in Port (see supported resources below).
- Periodically ingest Cursor resources into Port.
- Track background agents and their configurations for better visibility into AI-powered coding workflows.

### Supported resources

The resources that can be ingested from Cursor into Port are listed below. It is possible to reference any field that appears in the API responses in the mapping configuration. For detailed API documentation, see the [Cursor API documentation](https://docs.cursor.com/background-agent/api/overview).

- **Background Agents** - AI-powered coding agents that work autonomously on repositories. Use the [`/agents`](https://docs.cursor.com/background-agent/api/overview) endpoint to retrieve agent data.
- **Repositories** - Code repositories connected to Cursor agents. Repository information is typically included in agent responses.

## Prerequisites

### Create a Cursor API key

1. Log in to your [Cursor Dashboard](https://cursor.com/dashboard).
2. Navigate to **API Keys** or **Settings** > **API**.
3. Click **Create API Key** or **Generate New Key**.
4. Provide a name for your API key (e.g., "Port Integration").
5. Select the appropriate permissions:
   - **Read Agents** - To access agent data
   - **Read Repositories** - To access repository information (if available)
6. Click **Create** or **Generate**.
7. Copy the generated API key and save it securely.

:::warning API Key Security
Store your API key securely and never share it. The API key provides access to your Cursor account and agents.
:::

### Cursor API base URL

The Cursor API base URL follows this format: `https://api.cursor.com/v1` or `https://api.cursor.sh/v1`

:::info API Base URL
The exact base URL may vary. Check the [Cursor API documentation](https://docs.cursor.com/background-agent/api/overview) for the current API endpoint URL.
:::

## Setup

This integration uses Port's [Generic HTTP Integration](/build-your-software-catalog/custom-integration/ocean-custom-integration/overview) to connect to the Cursor API. You can use the [interactive builder](/build-your-software-catalog/custom-integration/ocean-custom-integration/build-your-integration) to configure and install the integration, or follow the manual setup below.

### Quick setup with interactive builder

1. Go to the [Generic HTTP Integration builder](/build-your-software-catalog/custom-integration/ocean-custom-integration/build-your-integration).
2. Configure your Cursor API connection:
   - **Base URL**: `https://api.cursor.com/v1` (or the current API URL from Cursor documentation)
   - **Authentication**: Bearer Token
   - **Token**: Your Cursor API key
3. Configure endpoints and mapping for the resources you want to sync.
4. Install using the generated commands.

### Manual setup

#### Step 1: Configure API connection

Configure the connection settings for the Cursor API:

**Base URL**: `https://api.cursor.com/v1` (verify the current URL in Cursor's API documentation)

**Authentication**: Bearer Token

**Token**: Your Cursor API key

#### Step 2: Configure resource mapping

After installation, configure which endpoints to sync. Here are example configurations for common Cursor resources:

##### Background Agents

```yaml
resources:
  - kind: /agents
    selector:
      query: 'true'
      data_path: '.agents' // or '.data' depending on API response structure
    port:
      entity:
        mappings:
          identifier: .id | tostring
          title: .name // .title // .identifier
          blueprint: '"cursor-agent"'
          properties:
            name: .name
            description: .description
            status: .status
            repository: .repository.name // .repository
            createdAt: .createdAt // .created_at
            updatedAt: .updatedAt // .updated_at
            model: .model // .aiModel
            instructions: .instructions
```

:::tip API Response Structure
The exact structure of Cursor API responses may vary. Use the jq playground in Port's data sources page to inspect the actual response structure and adjust the `data_path` and field mappings accordingly.
:::

## Configuration

Port integrations use a [YAML mapping block](/build-your-software-catalog/customize-integrations/configure-mapping#configuration-structure) to ingest data from the Cursor API into Port.

The mapping makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from the Cursor API.

### API authentication

Cursor uses bearer token authentication. Include your API key in the Authorization header:

```
Authorization: Bearer <YOUR_API_KEY>
```

### Pagination

The Cursor API may use pagination depending on the endpoint. Configure pagination in your integration settings if needed:

- **Pagination Type**: `offset`, `page`, or `cursor` (check Cursor API documentation)
- **Pagination Parameter**: `offset`, `page`, or `cursor` (as appropriate)
- **Size Parameter**: `limit` or `pageSize`
- **Page Size**: `50` (recommended, adjust based on API limits)

### Rate limiting

Cursor has rate limits on their API. The integration handles rate limiting automatically with retries. You can configure:

- **Timeout**: `30` seconds (default)
- **Concurrent Requests**: `5` (recommended to avoid rate limits)

## Examples

To view and test the integration's mapping against examples of the Cursor API responses, use the jq playground in your [data sources page](https://app.getport.io/settings/data-sources). Find the integration in the list of data sources and click on it to open the playground.

### Agent blueprint example

<details>
<summary><b>Agent blueprint (click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "cursor-agent",
  "title": "Cursor Agent",
  "icon": "Cursor",
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
        "type": "string",
        "enum": ["active", "inactive", "pending", "running", "stopped"]
      },
      "repository": {
        "title": "Repository",
        "type": "string"
      },
      "createdAt": {
        "title": "Created At",
        "type": "string",
        "format": "date-time"
      },
      "updatedAt": {
        "title": "Updated At",
        "type": "string",
        "format": "date-time"
      },
      "model": {
        "title": "AI Model",
        "type": "string"
      },
      "instructions": {
        "title": "Instructions",
        "type": "string"
      }
    },
    "required": ["name"]
  },
  "calculationProperties": {}
}
```

</details>

## Limitations

- The integration currently supports polling-based sync only (no real-time webhooks).
- Custom Cursor fields are not automatically mapped but can be added to the configuration.
- Rate limits apply based on your Cursor subscription tier.
- API endpoint structure may vary; verify the current API documentation for exact endpoint paths and response formats.

## Troubleshooting

### Common issues

1. **Authentication Errors**: Verify your Cursor API key is valid and has not expired. Ensure the API key has the correct permissions for the resources you're trying to access.
2. **API Base URL**: The Cursor API base URL may change. Always verify the current API endpoint URL in the [Cursor API documentation](https://docs.cursor.com/background-agent/api/overview).
3. **Response Structure**: Cursor API responses may vary. Use the jq playground to inspect the actual response structure and adjust your `data_path` and field mappings accordingly.
4. **Rate Limiting**: Cursor has API rate limits; the integration handles this automatically with retries. If you encounter frequent rate limit errors, reduce the concurrent requests setting.
5. **Data Path Issues**: Ensure the `data_path` in your mapping matches the structure of Cursor API responses. The exact structure depends on the endpoint. Use the jq playground to test your expressions.

### Finding the correct API structure

1. Use the jq playground in Port's data sources page to inspect actual API responses.
2. Check the [Cursor API documentation](https://docs.cursor.com/background-agent/api/overview) for the latest endpoint specifications.
3. Test your mapping expressions with sample API responses before deploying.

## Additional resources

- [Cursor API Documentation](https://docs.cursor.com/background-agent/api/overview)
- [Cursor Background Agents Guide](https://docs.cursor.com/background-agent)
- [Generic HTTP Integration Overview](/build-your-software-catalog/custom-integration/ocean-custom-integration/overview)
- [Build Your Integration (Interactive Builder)](/build-your-software-catalog/custom-integration/ocean-custom-integration/build-your-integration)

