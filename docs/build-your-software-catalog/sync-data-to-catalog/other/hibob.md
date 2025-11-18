# HiBob

Port's HiBob integration allows you to model HiBob HR resources in your software catalog and ingest data into them using the [Generic HTTP Integration](/build-your-software-catalog/custom-integration/ocean-custom-integration/overview).

## Overview

This integration allows you to:

- Map and organize your desired HiBob resources and their metadata in Port (see supported resources below).
- Periodically ingest HiBob resources into Port.

### Supported resources

The resources that can be ingested from HiBob into Port are listed below. It is possible to reference any field that appears in the API responses linked below in the mapping configuration.

- [`People`](https://apidocs.hibob.com/reference/get_people) - Employee profiles and their information
- [`Departments`](https://apidocs.hibob.com/reference/get_departments) - Organizational departments
- [`Work Locations`](https://apidocs.hibob.com/reference/get_locations) - Office and work locations
- [`Time Off`](https://apidocs.hibob.com/reference/get_timeoff) - Time off requests and balances

## Prerequisites

### Create a HiBob service user

1. Log in to your HiBob admin console.
2. Navigate to **Settings** > **Integrations** > **Service Users**.
3. Click **Create Service User**.
4. Provide a name for your service user (e.g., "Port Integration").
5. Assign the necessary permissions:
   - **Read People** - To access employee data
   - **Read Departments** - To access department information
   - **Read Locations** - To access location data
   - **Read Time Off** - To access time off information (if needed)
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

```yaml
resources:
  - kind: /people
    selector:
      query: 'true'
      data_path: '.employees'
    port:
      entity:
        mappings:
          identifier: .id | tostring
          title: .firstName + " " + .lastName
          blueprint: '"hibob-person"'
          properties:
            firstName: .firstName
            lastName: .lastName
            email: .email
            displayName: .displayName
            title: .title
            department: .department
            location: .site
            startDate: .startDate
            status: .status
            employeeNumber: .employeeNumber
```

##### Departments

```yaml
resources:
  - kind: /company/departments
    selector:
      query: 'true'
      data_path: '.departments'
    port:
      entity:
        mappings:
          identifier: .id | tostring
          title: .name
          blueprint: '"hibob-department"'
          properties:
            name: .name
            description: .description
            manager: .manager.email
```

##### Work Locations

```yaml
resources:
  - kind: /company/locations
    selector:
      query: 'true'
      data_path: '.locations'
    port:
      entity:
        mappings:
          identifier: .id | tostring
          title: .name
          blueprint: '"hibob-location"'
          properties:
            name: .name
            address: .address
            country: .country
            timezone: .timezone
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

The HiBob API uses offset-based pagination. Configure pagination in your integration settings:

- **Pagination Type**: `offset`
- **Pagination Parameter**: `offset`
- **Size Parameter**: `limit`
- **Page Size**: `100` (recommended)

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
  "calculationProperties": {},
  "relations": {
    "department": {
      "title": "Department",
      "target": "hibob-department",
      "required": false,
      "many": false
    },
    "location": {
      "title": "Location",
      "target": "hibob-location",
      "required": false,
      "many": false
    }
  }
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
      "manager": {
        "title": "Manager Email",
        "type": "string",
        "format": "email"
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
- Custom HiBob fields are not automatically mapped but can be added to the configuration.
- Rate limits apply based on your HiBob subscription tier.

## Troubleshooting

### Common issues

1. **Authentication Errors**: Verify your HiBob service user API token has the correct permissions and is not expired.
2. **Rate Limiting**: HiBob has API rate limits; the integration handles this automatically with retries. If you encounter frequent rate limit errors, reduce the concurrent requests setting.
3. **Data Path Issues**: Ensure the `data_path` in your mapping matches the structure of HiBob API responses. Use the jq playground to test your expressions.

## Additional resources

- [HiBob API Documentation](https://apidocs.hibob.com/)
- [Generic HTTP Integration Overview](/build-your-software-catalog/custom-integration/ocean-custom-integration/overview)
- [Build Your Integration (Interactive Builder)](/build-your-software-catalog/custom-integration/ocean-custom-integration/build-your-integration)

