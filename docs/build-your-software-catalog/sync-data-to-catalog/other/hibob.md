# HiBob

Port's HiBob integration allows you to model HiBob HR resources in your software catalog and ingest data into them using the [Generic HTTP Integration](/build-your-software-catalog/custom-integration/ocean-custom-integration/overview).

## Overview

This integration allows you to:

- Map and organize your desired HiBob resources and their metadata in Port (see supported resources below).
- Periodically ingest HiBob resources into Port.

### Supported resources

The resources that can be ingested from HiBob into Port are listed below. It is possible to reference any field that appears in the API responses in the mapping configuration. For detailed API documentation, see the [HiBob API documentation](https://apidocs.hibob.com/).

- **People** - Employee profiles and their information. Use the [`/people/search`](https://apidocs.hibob.com/reference/post_people-search) endpoint to retrieve employee data. Department and work location information are also available as fields on employee records (e.g., `work.department`, `work.site`).
- **Departments** - Organizational departments. Use the [`/lists/department/items`](https://apidocs.hibob.com/reference/lists) endpoint to retrieve department list items.
- **Work Locations (Sites)** - Office and work locations. Use the [`/lists/site/items`](https://apidocs.hibob.com/reference/lists) endpoint to retrieve site list items.
- **Time Off** - Time off requests and balances. Use the [`/timeoff/employees/{id}/requests`](https://apidocs.hibob.com/reference/post_timeoff-employees-id-requests) endpoint to retrieve time off data.


## Prerequisites

### Create a HiBob service user

1. Log in to your HiBob admin console.
2. Navigate to **Settings** > **Integrations** > **Service Users**.
3. Click **Create Service User**.
4. Provide a name for your service user (e.g., "Port Integration").
5. Assign the necessary permissions:
   - **Read People** - To access employee data (including work-related fields like department and site)
   - **Read Time Off** - To access time off information (if needed)
   
   :::info Field Permissions
   Your service user must have permission on the appropriate field categories. For example, to read work-related fields (department, site), the service user needs permission on the "work" category. For time off data, permission on the "Time off" category is required.
   :::
6. Click **Create**.
7. Copy the generated API token and save it securely.

:::warning Token Security
Store your API token securely and never share it. The token provides access to your HiBob data.
:::

### HiBob API base URL

The HiBob API base URL follows this format: `https://api.hibob.com/v1`

## Setup

This integration uses Port's [Generic HTTP Integration](/build-your-software-catalog/custom-integration/ocean-custom-integration/overview) to connect to the HiBob API. You can use the [interactive builder](/build-your-software-catalog/custom-integration/ocean-custom-integration/build-your-integration) to configure and install the integration, or follow the manual setup below.

### Quick setup with interactive builder

1. Go to the [Generic HTTP Integration builder](/build-your-software-catalog/custom-integration/ocean-custom-integration/build-your-integration).
2. Configure your HiBob API connection:
   - **Base URL**: `https://api.hibob.com/v1`
   - **Authentication**: Bearer Token
   - **Token**: Your HiBob service user API token
3. Configure endpoints and mapping for the resources you want to sync.
4. Install using the generated commands.

### Manual setup

#### Step 1: Configure API connection

Configure the connection settings for the HiBob API:

**Base URL**: `https://api.hibob.com/v1`

**Authentication**: Bearer Token

**Token**: Your HiBob service user API token

#### Step 2: Configure resource mapping

After installation, configure which endpoints to sync. Here are example configurations for common HiBob resources:

##### People (Employees)

The People endpoint uses POST for search operations. Include the fields you want to retrieve, including `work.department` and `work.site` for department and location information.

```yaml
resources:
  - kind: /people/search
    selector:
      query: 'true'
      data_path: '.employees'
      method: POST
      body:
        fields: ["id", "firstName", "lastName", "email", "displayName", "work.title", "work.department", "work.site", "startDate", "status", "employeeNumber"]
    port:
      entity:
        mappings:
          identifier: .id | tostring
          title: (.firstName // "") + " " + (.lastName // "") | trim
          blueprint: '"hibob-person"'
          properties:
            firstName: .firstName
            lastName: .lastName
            email: .email
            displayName: .displayName
            title: .work.title
            department: .work.department
            location: .work.site
            startDate: .startDate
            status: .status
            employeeNumber: .employeeNumber
```

:::tip Field Metadata
To discover the exact field paths for your HiBob instance (especially if you have custom fields), use the [Fields Metadata API](https://apidocs.hibob.com/reference/get_company-people-fields) endpoint: `GET /v1/company/people/fields`. This will show you all available fields and their paths.
:::

##### Departments

Departments are available as list items through the List Items API.

```yaml
resources:
  - kind: /lists/department/items
    selector:
      query: 'true'
      data_path: '.items'
    port:
      entity:
        mappings:
          identifier: .id | tostring
          title: .name
          blueprint: '"hibob-department"'
          properties:
            name: .name
            description: .description
            active: .active
```

##### Work Locations (Sites)

Work locations (sites) are available as list items through the List Items API.

```yaml
resources:
  - kind: /lists/site/items
    selector:
      query: 'true'
      data_path: '.items'
    port:
      entity:
        mappings:
          identifier: .id | tostring
          title: .name
          blueprint: '"hibob-location"'
          properties:
            name: .name
            description: .description
            active: .active
```

##### Time Off

```yaml
resources:
  - kind: /timeoff/employees/{id}/requests
    selector:
      query: 'true'
      data_path: '.requests'
      path_parameters:
        id:
          endpoint: /people/search
          field: .id
          filter: 'true'
    port:
      entity:
        mappings:
          identifier: .id | tostring
          title: .policyType.displayName + " - " + (.startDate // "")
          blueprint: '"hibob-timeoff"'
          properties:
            requestId: .id
            employeeId: .employeeId
            policyType: .policyType.displayName
            startDate: .startDate
            endDate: .endDate
            days: .days
            status: .status
```

## Configuration

Port integrations use a [YAML mapping block](/build-your-software-catalog/customize-integrations/configure-mapping#configuration-structure) to ingest data from the HiBob API into Port.

The mapping makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from the HiBob API.

### API authentication

HiBob uses bearer token authentication. Include your service user API token in the Authorization header:

```
Authorization: Bearer <YOUR_API_TOKEN>
```

### Pagination

The HiBob People Search API uses pagination in the request body. Configure pagination in your integration settings:

- **Pagination Type**: `offset`
- **Pagination Parameter**: `offset`
- **Size Parameter**: `limit`
- **Page Size**: `100` (recommended)

For the `/people/search` endpoint, pagination is handled via the request body parameters `from` and `limit`.

### Rate limiting

HiBob has rate limits on their API. The integration handles rate limiting automatically with retries. You can configure:

- **Timeout**: `30` seconds (default)
- **Concurrent Requests**: `5` (recommended to avoid rate limits)

## Examples

To view and test the integration's mapping against examples of the HiBob API responses, use the jq playground in your [data sources page](https://app.getport.io/settings/data-sources). Find the integration in the list of data sources and click on it to open the playground.

### Person blueprint example

<details>
<summary><b>Person blueprint (click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "hibob-person",
  "title": "HiBob Person",
  "icon": "User",
  "schema": {
    "properties": {
      "firstName": {
        "title": "First Name",
        "type": "string"
      },
      "lastName": {
        "title": "Last Name",
        "type": "string"
      },
      "email": {
        "title": "Email",
        "type": "string",
        "format": "email"
      },
      "displayName": {
        "title": "Display Name",
        "type": "string"
      },
      "title": {
        "title": "Job Title",
        "type": "string"
      },
      "department": {
        "title": "Department",
        "type": "string"
      },
      "location": {
        "title": "Location",
        "type": "string"
      },
      "startDate": {
        "title": "Start Date",
        "type": "string",
        "format": "date"
      },
      "status": {
        "title": "Status",
        "type": "string",
        "enum": ["Active", "Inactive", "Pending"]
      },
      "employeeNumber": {
        "title": "Employee Number",
        "type": "string"
      }
    },
    "required": ["email"]
  },
  "calculationProperties": {}
}
```

</details>

### Department blueprint example

<details>
<summary><b>Department blueprint (click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "hibob-department",
  "title": "HiBob Department",
  "icon": "Folder",
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
      "active": {
        "title": "Active",
        "type": "boolean"
      }
    },
    "required": ["name"]
  },
  "calculationProperties": {}
}
```

</details>

### Location blueprint example

<details>
<summary><b>Location blueprint (click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "hibob-location",
  "title": "HiBob Location",
  "icon": "MapPin",
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
      "active": {
        "title": "Active",
        "type": "boolean"
      }
    },
    "required": ["name"]
  },
  "calculationProperties": {}
}
```

</details>

### Time Off blueprint example

<details>
<summary><b>Time Off blueprint (click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "hibob-timeoff",
  "title": "HiBob Time Off",
  "icon": "Calendar",
  "schema": {
    "properties": {
      "requestId": {
        "title": "Request ID",
        "type": "string"
      },
      "employeeId": {
        "title": "Employee ID",
        "type": "string"
      },
      "policyType": {
        "title": "Policy Type",
        "type": "string"
      },
      "startDate": {
        "title": "Start Date",
        "type": "string",
        "format": "date"
      },
      "endDate": {
        "title": "End Date",
        "type": "string",
        "format": "date"
      },
      "days": {
        "title": "Days",
        "type": "number"
      },
      "status": {
        "title": "Status",
        "type": "string"
      }
    },
    "required": ["requestId", "employeeId"]
  },
  "calculationProperties": {},
  "relations": {
    "employee": {
      "title": "Employee",
      "target": "hibob-person",
      "required": false,
      "many": false
    }
  }
}
```

</details>

## Limitations

- The integration currently supports polling-based sync only (no real-time webhooks).
- Departments and work locations can be accessed via the List Items API (`/lists/department/items` and `/lists/site/items`) or as fields on employee records (`work.department`, `work.site`).
- Custom HiBob fields are not automatically mapped but can be added to the configuration using the Fields Metadata API.
- Rate limits apply based on your HiBob subscription tier and are per-endpoint.
- The People Search endpoint requires POST requests with a request body.
- The deprecated `GET /v1/people` and `GET /v1/people/{id}` endpoints should not be used; use `/people/search` instead.

## Troubleshooting

### Common issues

1. **Authentication Errors**: Verify your HiBob service user API token has the correct permissions and is not expired. Ensure the service user has permission on the required field categories (e.g., "work" for department and site fields).
2. **Field Path Issues**: Use the Fields Metadata API (`GET /v1/company/people/fields`) to discover the exact field paths for your HiBob instance, especially for custom fields or renamed fields.
3. **Rate Limiting**: HiBob has API rate limits; the integration handles this automatically with retries. If you encounter frequent rate limit errors, reduce the concurrent requests setting.
4. **Data Path Issues**: Ensure the `data_path` in your mapping matches the structure of HiBob API responses. The People Search endpoint returns data in an `employees` array. Use the jq playground to test your expressions.
5. **Missing Fields**: If department or location fields are not appearing, verify that your service user has permission on the "work" category and that you're including the correct field paths (`work.department`, `work.site`) in your People Search request. Alternatively, you can retrieve departments and sites separately using the List Items API endpoints.
6. **List Items Access**: To access departments and sites via the List Items API, ensure your service user has the appropriate permissions for list management.

## Additional resources

- [HiBob API Documentation](https://apidocs.hibob.com/)
- [Generic HTTP Integration Overview](/build-your-software-catalog/custom-integration/ocean-custom-integration/overview)
- [Build Your Integration (Interactive Builder)](/build-your-software-catalog/custom-integration/ocean-custom-integration/build-your-integration)

