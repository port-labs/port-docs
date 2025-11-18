# Azure AD

Port's Azure AD integration allows you to model Microsoft Entra ID (Azure Active Directory) resources in your software catalog and ingest data into them using the [Generic HTTP Integration](/build-your-software-catalog/custom-integration/ocean-custom-integration/overview).

## Overview

This integration allows you to:

- Map and organize your desired Azure AD resources and their metadata in Port (see supported resources below).
- Periodically ingest Azure AD resources into Port.
- Track user and group relationships for better access management visibility.

### Supported resources

The resources that can be ingested from Azure AD into Port are listed below. It is possible to reference any field that appears in the API responses linked below in the mapping configuration.

- [`Users`](https://learn.microsoft.com/en-us/graph/api/user-list) - User accounts and their profile information
- [`Groups`](https://learn.microsoft.com/en-us/graph/api/group-list) - Security and Microsoft 365 groups
- [`Applications`](https://learn.microsoft.com/en-us/graph/api/application-list) - Enterprise applications registered in Azure AD
- [`Service Principals`](https://learn.microsoft.com/en-us/graph/api/serviceprincipal-list) - Service principal objects representing applications

## Prerequisites

### Register an application in Azure AD

1. Log in to the [Azure Portal](https://portal.azure.com).
2. Navigate to **Azure Active Directory** > **App registrations**.
3. Click **New registration**.
4. Provide a name for your application (e.g., "Port Integration").
5. Select **Accounts in this organizational directory only**.
6. Click **Register**.
7. Note the **Application (client) ID** and **Directory (tenant) ID**.

### Create a client secret

1. In your app registration, navigate to **Certificates & secrets**.
2. Click **New client secret**.
3. Provide a description (e.g., "Port Integration Secret").
4. Select an expiration period.
5. Click **Add**.
6. **Copy the secret value immediately** - it will not be shown again.

:::warning Secret Security
Store your client secret securely and never share it. The secret provides access to your Azure AD data.
:::

### Grant API permissions

1. In your app registration, navigate to **API permissions**.
2. Click **Add a permission**.
3. Select **Microsoft Graph**.
4. Select **Application permissions**.
5. Add the following permissions:
   - `User.Read.All` - Read all users' full profiles
   - `Group.Read.All` - Read all groups
   - `Application.Read.All` - Read all applications
   - `Directory.Read.All` - Read directory data
6. Click **Add permissions**.
7. Click **Grant admin consent for [Your Organization]**.

:::info Admin Consent Required
An Azure AD administrator must grant consent for these permissions before the integration can access the data.
:::

### Azure AD tenant ID

Your tenant ID is the **Directory (tenant) ID** from your app registration. You can also find it in the Azure AD overview page.

## Setup

This integration uses Port's [Generic HTTP Integration](/build-your-software-catalog/custom-integration/ocean-custom-integration/overview) to connect to the Microsoft Graph API. You can use the [interactive builder](/build-your-software-catalog/custom-integration/ocean-custom-integration/build-your-integration) to configure and install the integration, or follow the manual setup below.

### Quick setup with interactive builder

1. Go to the [Generic HTTP Integration builder](/build-your-software-catalog/custom-integration/ocean-custom-integration/build-your-integration).
2. Configure your Microsoft Graph API connection:
   - **Base URL**: `https://graph.microsoft.com/v1.0`
   - **Authentication**: OAuth2 Client Credentials
   - **Tenant ID**: Your Azure AD tenant ID
   - **Client ID**: Your application (client) ID
   - **Client Secret**: Your client secret value
3. Configure endpoints and mapping for the resources you want to sync.
4. Install using the generated commands.

### Manual setup

#### Step 1: Configure API connection

Configure the connection settings for the Microsoft Graph API:

**Base URL**: `https://graph.microsoft.com/v1.0`

**Authentication**: OAuth2 Client Credentials

**OAuth2 Configuration**:
- **Token URL**: `https://login.microsoftonline.com/{tenant-id}/oauth2/v2.0/token`
- **Client ID**: Your application (client) ID
- **Client Secret**: Your client secret value
- **Scope**: `https://graph.microsoft.com/.default`

#### Step 2: Configure resource mapping

After installation, configure which endpoints to sync. Here are example configurations for common Azure AD resources:

##### Users

```yaml
resources:
  - kind: /users
    selector:
      query: 'true'
      data_path: '.value'
    port:
      entity:
        mappings:
          identifier: .id
          title: .displayName // .userPrincipalName
          blueprint: '"azure-ad-user"'
          properties:
            userPrincipalName: .userPrincipalName
            displayName: .displayName
            givenName: .givenName
            surname: .surname
            mail: .mail
            jobTitle: .jobTitle
            department: .department
            officeLocation: .officeLocation
            accountEnabled: .accountEnabled
            createdDateTime: .createdDateTime
            lastSignInDateTime: .signInActivity.lastSignInDateTime
```

##### Groups

```yaml
resources:
  - kind: /groups
    selector:
      query: 'true'
      data_path: '.value'
    port:
      entity:
        mappings:
          identifier: .id
          title: .displayName
          blueprint: '"azure-ad-group"'
          properties:
            displayName: .displayName
            description: .description
            groupTypes: .groupTypes
            mailEnabled: .mailEnabled
            securityEnabled: .securityEnabled
            createdDateTime: .createdDateTime
          relations:
            members: .members[]?.id
```

##### Applications

```yaml
resources:
  - kind: /applications
    selector:
      query: 'true'
      data_path: '.value'
    port:
      entity:
        mappings:
          identifier: .id
          title: .displayName
          blueprint: '"azure-ad-application"'
          properties:
            displayName: .displayName
            appId: .appId
            publisherDomain: .publisherDomain
            signInAudience: .signInAudience
            createdDateTime: .createdDateTime
```

## Configuration

Port integrations use a [YAML mapping block](/build-your-software-catalog/customize-integrations/configure-mapping#configuration-structure) to ingest data from the Microsoft Graph API into Port.

The mapping makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from the Microsoft Graph API.

### API authentication

Microsoft Graph uses OAuth2 client credentials flow. The integration automatically handles token acquisition and refresh. Configure:

- **Token URL**: `https://login.microsoftonline.com/{tenant-id}/oauth2/v2.0/token`
- **Client ID**: Your Azure AD application (client) ID
- **Client Secret**: Your Azure AD client secret
- **Scope**: `https://graph.microsoft.com/.default`

### Pagination

The Microsoft Graph API uses skip token pagination. Configure pagination in your integration settings:

- **Pagination Type**: `skip_token`
- **Pagination Parameter**: `$skiptoken`
- **Size Parameter**: Not applicable (uses `$top` for page size)
- **Page Size**: `999` (Microsoft Graph maximum)

### Rate limiting

Microsoft Graph has rate limits on their API. The integration handles rate limiting automatically with retries. You can configure:

- **Timeout**: `30` seconds (default)
- **Concurrent Requests**: `5` (recommended to avoid rate limits)

## Examples

To view and test the integration's mapping against examples of the Microsoft Graph API responses, use the jq playground in your [data sources page](https://app.getport.io/settings/data-sources). Find the integration in the list of data sources and click on it to open the playground.

### User blueprint example

<details>
<summary><b>User blueprint (click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "azure-ad-user",
  "title": "Azure AD User",
  "icon": "Microsoft",
  "schema": {
    "properties": {
      "userPrincipalName": {
        "title": "User Principal Name",
        "type": "string",
        "format": "email"
      },
      "displayName": {
        "title": "Display Name",
        "type": "string"
      },
      "givenName": {
        "title": "Given Name",
        "type": "string"
      },
      "surname": {
        "title": "Surname",
        "type": "string"
      },
      "mail": {
        "title": "Email",
        "type": "string",
        "format": "email"
      },
      "jobTitle": {
        "title": "Job Title",
        "type": "string"
      },
      "department": {
        "title": "Department",
        "type": "string"
      },
      "officeLocation": {
        "title": "Office Location",
        "type": "string"
      },
      "accountEnabled": {
        "title": "Account Enabled",
        "type": "boolean"
      },
      "createdDateTime": {
        "title": "Created Date",
        "type": "string",
        "format": "date-time"
      },
      "lastSignInDateTime": {
        "title": "Last Sign In",
        "type": "string",
        "format": "date-time"
      }
    },
    "required": ["userPrincipalName"]
  },
  "calculationProperties": {},
  "relations": {
    "groups": {
      "title": "Groups",
      "target": "azure-ad-group",
      "required": false,
      "many": true
    }
  }
}
```

</details>

### Group blueprint example

<details>
<summary><b>Group blueprint (click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "azure-ad-group",
  "title": "Azure AD Group",
  "icon": "Microsoft",
  "schema": {
    "properties": {
      "displayName": {
        "title": "Display Name",
        "type": "string"
      },
      "description": {
        "title": "Description",
        "type": "string"
      },
      "groupTypes": {
        "title": "Group Types",
        "type": "array",
        "items": {
          "type": "string"
        }
      },
      "mailEnabled": {
        "title": "Mail Enabled",
        "type": "boolean"
      },
      "securityEnabled": {
        "title": "Security Enabled",
        "type": "boolean"
      },
      "createdDateTime": {
        "title": "Created Date",
        "type": "string",
        "format": "date-time"
      }
    },
    "required": ["displayName"]
  },
  "calculationProperties": {},
  "relations": {
    "members": {
      "title": "Members",
      "target": "azure-ad-user",
      "required": false,
      "many": true
    }
  }
}
```

</details>

## Limitations

- The integration currently supports polling-based sync only (no real-time webhooks).
- Custom Azure AD attributes are not automatically mapped but can be added to the configuration.
- Rate limits apply based on your Microsoft 365 subscription tier.
- Some advanced Microsoft Graph features (like delta queries) require additional configuration.

## Troubleshooting

### Common issues

1. **Authentication Errors**: Verify your Azure AD application has the correct permissions and admin consent has been granted. Check that your client secret has not expired.
2. **Permission Errors**: Ensure all required API permissions are granted and admin consent is provided. Some permissions require global administrator consent.
3. **Rate Limiting**: Microsoft Graph has API rate limits; the integration handles this automatically with retries. If you encounter frequent rate limit errors, reduce the concurrent requests setting.
4. **Data Path Issues**: Ensure the `data_path` in your mapping matches the structure of Microsoft Graph API responses. Microsoft Graph typically returns data in a `.value` array. Use the jq playground to test your expressions.

### OAuth2 token refresh

The integration automatically handles OAuth2 token acquisition and refresh. If you encounter authentication errors:

1. Verify your client secret has not expired.
2. Check that your application registration is still active.
3. Ensure the required API permissions are still granted.

## Additional resources

- [Microsoft Graph API Documentation](https://learn.microsoft.com/en-us/graph/overview)
- [Microsoft Graph Permissions Reference](https://learn.microsoft.com/en-us/graph/permissions-reference)
- [Generic HTTP Integration Overview](/build-your-software-catalog/custom-integration/ocean-custom-integration/overview)
- [Build Your Integration (Interactive Builder)](/build-your-software-catalog/custom-integration/ocean-custom-integration/build-your-integration)

