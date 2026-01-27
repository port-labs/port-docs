---
sidebar_position: 3
title: Configuration
description: Prerequisites, resource mapping, and advanced configuration for the Ocean custom integration
---

import AdvancedConfig from '/docs/generalTemplates/_ocean_advanced_configuration_note.md'

# Configuration

In this page we will cover the configuration steps that apply to both installation methods (hosted by Port and self-hosted). We will walk through the prerequisites you need to gather, how to configure resource mapping, and advanced configuration options for complex scenarios.


## How it works

The Ocean custom integration uses a [**two-step setup**](/build-your-software-catalog/sync-data-to-catalog/):

1. **Installation** - Configure connection settings that apply to all API calls ([hosted by Port](/build-your-software-catalog/custom-integration/ocean-custom-integration/installation-types/hosted-by-port) or [self-hosted](/build-your-software-catalog/custom-integration/ocean-custom-integration/installation-types/self-hosted/setup)).
2. **Resource mapping** - Define which endpoints to sync and how to map them to Port entities.

## Resource mapping

After installation, you define **which endpoints to sync** in your `port-app-config.yml` file (or using the integration's configuration in Port).

This is where you map each API endpoint to Port entities - similar to how you've mapped GitHub repositories or Jira issues in other integrations.

### Endpoint-as-kind feature

The `kind` field is now the **endpoint path itself**! This provides better visibility in Port's UI, allowing you to:

- ✅ Track each endpoint's sync status individually.
- ✅ Debug mapping issues per endpoint.
- ✅ Monitor data ingestion per API call.

### Example: Mapping two endpoints

```yaml showLineNumbers
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

### What each field does

- **`kind`**: The API endpoint path (combined with your base URL).
- **`selector.query`**: JQ filter to include/exclude entities (use `'true'` to sync all).
- **`selector.data_path`**: JQ expression pointing to the array of items in the response (see [Data path extraction](#data-path-extraction) below).
- **`selector.query_params`**: (Optional) Query parameters added to the URL.
- **`selector.method`**: (Optional) HTTP method, defaults to `GET`.
- **`port.entity.mappings`**: How to map API fields to Port entity properties.

### Data path extraction

The `data_path` field tells the integration where to find the array of items in your API response. Use a [JQ expression](https://jqlang.org/manual/) to point to the data array.

| Response structure | Example response | `data_path` value |
|--------------------|------------------|-------------------|
| Direct array | `[{"id": 1}, {"id": 2}]` | _(omit - not needed)_ |
| Single nested | `{"data": [{"id": 1}], "meta": {...}}` | `.data` |
| Deeply nested | `{"response": {"users": {"items": [...]}}}` | `.response.users.items` |
| Array flattening | `{"groups": [{"rules": [...]}, {"rules": [...]}]}` | `.groups[].rules[]` |

:::tip Array flattening
Use JQ's `[]` operator to flatten nested arrays. For example, `.groups[].rules[]` extracts all rules from all groups into a single flat array.
:::


## Advanced configurations

Once you have the basics working, these features handle more complex scenarios.

### Nested endpoints

Fetch data from dynamic endpoints that depend on other resources.

:::info Accessing path parameters in mappings
Use `.__<parameter_name>` to access path parameter values in your entity mappings. For example, with endpoint `/api/tickets/{ticket_id}/comments`, access the ticket ID using `.__ticket_id`.
:::

**Example: Tickets and comments**

```yaml showLineNumbers
resources:
  # Parent endpoint
  - kind: /api/tickets
    selector:
      query: 'true'
      data_path: '.tickets'
    port:
      entity:
        mappings:
          identifier: .id | tostring
          title: .subject
          blueprint: '"ticket"'

  # Nested endpoint - fetches comments for each ticket
  - kind: /api/tickets/{ticket_id}/comments
    selector:
      query: 'true'
      data_path: '.comments'
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
          properties:
            content: .body
            ticketId: .__ticket_id | tostring   # Access path parameter value
          relations:
            ticket: .__ticket_id | tostring     # Use for parent relation
```

The integration will:
1. Call `/api/tickets` → Get ticket IDs [101, 102, 103].
2. Call `/api/tickets/101/comments`, `/api/tickets/102/comments`, etc.
3. Sync all comments with relations to their parent tickets.

**More examples:**
- `/projects/{project_id}/tasks` → Access `.__project_id` in task mappings.
- `/repositories/{repo_id}/pull-requests` → Access `.__repo_id` in PR mappings.

### Pagination

For APIs that split data across multiple pages, configure how the integration fetches all pages.

Pagination types

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

- **Pagination parameter:** Use `skip` instead of `offset`, or `after` instead of `cursor`.
- **Size parameter:** Use `per_page` instead of `limit`, or `page_size` instead of `size`.
- **Start page:** Specify if pages start at 0 or 1.

**Example:**

```yaml showLineNumbers
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

```json showLineNumbers
{
  "data": [...],
  "meta": {
    "after_cursor": "xyz123",
    "has_more": true
  }
}
```

**Configuration:**

```yaml showLineNumbers
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
- Increase for slow APIs or large responses (e.g., 60 seconds).
- Decrease for fast, local APIs (e.g., 10 seconds).

<AdvancedConfig/>
