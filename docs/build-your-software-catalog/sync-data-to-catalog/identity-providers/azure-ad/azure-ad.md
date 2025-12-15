import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import Prerequisites from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_helm_prerequisites_block.mdx"
import AdvancedConfig from '/docs/generalTemplates/_ocean_advanced_configuration_note.md'
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"
import CustomOceanIntegration from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_custom_ocean_integration.mdx"

# Microsoft Entra ID

<CustomOceanIntegration />

Port's Microsoft Entra ID (formerly Azure AD) integration allows you to model Entra ID resources in your software catalog and ingest data into them using the [Ocean Custom Integration](/build-your-software-catalog/custom-integration/ocean-custom-integration/overview) framework.

## Supported resources

The Microsoft Entra ID integration can ingest the following resources into Port:

- `entra-id-user` - User accounts and their profile information from [`/users`](https://learn.microsoft.com/en-us/graph/api/user-list).
- `entra-id-group` - Security and Microsoft 365 groups from [`/groups`](https://learn.microsoft.com/en-us/graph/api/group-list).
- `entra-id-application` - Enterprise applications registered in Entra ID from [`/applications`](https://learn.microsoft.com/en-us/graph/api/application-list).
- `entra-id-service-principal` - Service principal objects representing applications from [`/servicePrincipals`](https://learn.microsoft.com/en-us/graph/api/serviceprincipal-list).

It is possible to reference any field that appears in the API responses linked above in the mapping configuration.

## Prerequisites

To use this integration, you need:

- A Microsoft Entra ID application registration with appropriate API permissions.
- A client secret for the application.
- Admin consent for the required permissions.
- An access token (bearer token) for Microsoft Graph API.

**To register an application in Microsoft Entra ID:**

1. Log in to the [Azure Portal](https://portal.azure.com).
2. Navigate to **Microsoft Entra ID** > **App registrations**.
3. Click **New registration**.
4. Provide a name for your application (e.g., "Port Integration").
5. Select **Accounts in this organizational directory only**.
6. Click **Register**.
7. Note the **Application (client) ID** and **Directory (tenant) ID**.

**To create a client secret:**

1. In your app registration, navigate to **Certificates & secrets**.
2. Click **New client secret**.
3. Provide a description (e.g., "Port Integration Secret").
4. Select an expiration period.
5. Click **Add**.
6. **Copy the secret value immediately** - it will not be shown again.

:::warning Secret security
Store your client secret securely and never share it. The secret provides access to your Entra ID data.
:::

**To grant API permissions:**

1. In your app registration, navigate to **API permissions**.
2. Click **Add a permission**.
3. Select **Microsoft Graph**.
4. Select **Application permissions**.
5. Add the following permissions:
   - `User.Read.All` - Read all users' full profiles.
   - `Group.Read.All` - Read all groups.
   - `Application.Read.All` - Read all applications.
   - `Directory.Read.All` - Read directory data.
6. Click **Add permissions**.
7. Click **Grant admin consent for [Your Organization]**.

:::info Admin consent required
An Entra ID administrator must grant consent for these permissions before the integration can access the data.
:::

**To get an access token (bearer token):**

You need to obtain an OAuth2 access token to authenticate with Microsoft Graph API. Use the following curl command to get a token:

```bash showLineNumbers
curl -X POST "https://login.microsoftonline.com/YOUR_TENANT_ID/oauth2/v2.0/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "scope=https://graph.microsoft.com/.default" \
  -d "grant_type=client_credentials" | jq -r '.access_token'
```

Replace:
- `YOUR_TENANT_ID` with your Directory (tenant) ID.
- `YOUR_CLIENT_ID` with your Application (client) ID.
- `YOUR_CLIENT_SECRET` with your client secret value.

:::warning Token expiration
Access tokens typically expire after 1 hour. For production use, consider implementing automatic token refresh or using OAuth2 client credentials flow with automatic token management.
:::

**To find your tenant ID:**

Your tenant ID is the **Directory (tenant) ID** from your app registration. You can also find it in the Microsoft Entra ID overview page.

## Installation

Choose one of the following installation methods to deploy the Ocean Custom Integration:

<Tabs groupId="installation-methods" queryString="installation-methods">

<TabItem value="helm" label="Helm" default>

<h2> Prerequisites </h2>

<Prerequisites />

<h2> Installation </h2>

1. Add Port's Helm repo and install the Ocean Custom Integration:

:::note Replace placeholders
Remember to replace the placeholders for `YOUR_PORT_CLIENT_ID`, `YOUR_PORT_CLIENT_SECRET`, and `YOUR_BEARER_TOKEN`. Get your bearer token using the curl command in the Prerequisites section.
:::

```bash showLineNumbers
helm repo add --force-update port-labs https://port-labs.github.io/helm-charts
helm upgrade --install my-ocean-entra-id-integration port-labs/port-ocean \
  --set port.clientId="YOUR_PORT_CLIENT_ID" \
  --set port.clientSecret="YOUR_PORT_CLIENT_SECRET" \
  --set port.baseUrl="https://api.getport.io" \
  --set initializePortResources=true \
  --set scheduledResyncInterval=120 \
  --set integration.identifier="entra-id-integration" \
  --set integration.type="custom" \
  --set integration.eventListener.type="POLLING" \
  --set integration.config.baseUrl="https://graph.microsoft.com/v1.0" \
  --set integration.config.authType="bearer_token" \
  --set integration.config.apiToken="YOUR_BEARER_TOKEN"
```

<PortApiRegionTip/>

<h2> Configuration parameters </h2>

This table summarizes the available parameters for the installation.

| Parameter | Description | Example | Required |
| --- | --- | --- | --- |
| `port.clientId` | Your Port [client id](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials). |  | ✅ |
| `port.clientSecret` | Your Port [client secret](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials). |  | ✅ |
| `port.baseUrl` | Your Port API URL (`https://api.getport.io` for EU, `https://api.us.getport.io` for US). |  | ✅ |
| `integration.config.baseUrl` | Base URL of the Microsoft Graph API. | https://graph.microsoft.com/v1.0 | ✅ |
| `integration.config.authType` | Authentication type for the API (use `bearer_token` for Entra ID). | bearer_token | ✅ |
| `integration.config.apiToken` | Microsoft Graph API bearer token created via the OAuth2 client credentials flow. | eyJ0eXAiOiJKV1QiLCJub25jZSI6... | ✅ |
| `integration.config.paginationType` | How the API handles pagination (offset, page, cursor, skip_token, or none). | skip_token | ❌ |
| `integration.eventListener.type` | Event listener type. See [event listeners](https://ocean.getport.io/framework/features/event-listener). | POLLING | ✅ |
| `integration.type` | Integration type (must be `custom`). | custom | ✅ |
| `integration.identifier` | Unique identifier for the integration instance. | entra-id-integration | ✅ |
| `scheduledResyncInterval` | Minutes between scheduled syncs. When omitted, the event listener interval is used. | 120 | ❌ |
| `initializePortResources` | When true, creates default blueprints and mappings on first run. | true | ❌ |
| `sendRawDataExamples` | Sends sample payloads from the API to Port for easier mapping. | true | ❌ |

<br/>

<AdvancedConfig/>

</TabItem>

<TabItem value="docker" label="Docker">

To run the integration using Docker for a one-time sync:

:::note Replace placeholders
Remember to replace the placeholders for `YOUR_PORT_CLIENT_ID`, `YOUR_PORT_CLIENT_SECRET`, and `YOUR_BEARER_TOKEN`. Get your bearer token using the curl command in the Prerequisites section.
:::

```bash showLineNumbers
docker run -i --rm --platform=linux/amd64 \
  -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
  -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
  -e OCEAN__SEND_RAW_DATA_EXAMPLES=true \
  -e OCEAN__INTEGRATION__CONFIG__BASE_URL="https://graph.microsoft.com/v1.0" \
  -e OCEAN__INTEGRATION__CONFIG__AUTH_TYPE="bearer_token" \
  -e OCEAN__INTEGRATION__CONFIG__API_TOKEN="YOUR_BEARER_TOKEN" \
  -e OCEAN__PORT__CLIENT_ID="YOUR_PORT_CLIENT_ID" \
  -e OCEAN__PORT__CLIENT_SECRET="YOUR_PORT_CLIENT_SECRET" \
  -e OCEAN__PORT__BASE_URL="https://api.getport.io" \
  ghcr.io/port-labs/port-ocean-custom:latest
```

<PortApiRegionTip/>

<AdvancedConfig/>

</TabItem>

<TabItem value="azure-container-instance" label="Azure Container Instance">
To Install Azure Entra ID integration using Azure Container Instance:

Navigate to Azure portal homepage, select `Create resource`.

![Azure Portal create resource](../../../../../static/img/sync-data-to-catalog/quickstart-portal-create-resource.png)

Select containers > Container instances

![Azure Portal create aci](../../../../../static/img/sync-data-to-catalog/aci-instance.png)

Follow the steps below.

1. Basics
  -	Select the Azure subscription and resource group that will own the container.
  -	Name the container group (for example, port-ocean-msgraph-custom) so future audits and portal searches clearly identify the workload.
  -	Choose the Azure region and align it with your Port region and Graph API latency requirements.
  -	Keep the default Single container image type unless your environment dictates otherwise.
  -	Point to the integration image:
    - Use the public image: ghcr.io/port-labs/port-ocean-custom:latest
    - (Optional) If your org requires it, import the image into ACR and deploy from there.
  -	Set the OS type to Linux.
  -	Size: start with 1 vCPU, 1.5 GiB memory, 0 GPUs. Increase only if you see CPU/memory pressure.
  -	Platform note: your docker command specifies --platform=linux/amd64. Most ACI Linux workloads run fine here; if your subscription/region exposes an architecture setting, choose amd64/x64.



2. Networking
  -	Choose Private networking if you need VNet control/egress governance; otherwise Public is fine (Graph + Port are outbound HTTPS).
  -	Ensure outbound connectivity to:
    - https://graph.microsoft.com
    - https://api.getport.io (or your Port region URL)
  -	Inbound ports: none are required for the ONCE-run ingestion pattern. (If your org requires a port, allow 443/TCP, but it’s typically unnecessary for this container.)

3. Insights
  - Enable container instance logs so diagnostics flow into Azure Monitor.
  -	Select the Log Analytics workspace that will receive the logs.

4. Advanced
  -	Restart policy:
  -	Use Never if you want a true “run once and stop” behavior.
  -	Use On failure if you want Azure to retry only when something crashes unexpectedly.
  -	Enter the environment variables exactly as listed below. Mark secret values as secure where indicated and double-check each entry before leaving the blade.

If you’re using Port’s US region, swap the base URL accordingly (example: https://api.us.port.io).

| Secure | Environment Variable | Value | Description |
|------|----------------------|-------|-------------|
| No | `OCEAN__EVENT_LISTENER` | `{"type":"ONCE"}` | Runs the integration once and exits |
| No | `OCEAN__INITIALIZE_PORT_RESOURCES` | `true` | Automatically creates required Port blueprints and resources |
| No | `OCEAN__SEND_RAW_DATA_EXAMPLES` | `true` | Sends raw data samples to Port for visibility/debugging |
| No | `OCEAN__INTEGRATION__CONFIG__BASE_URL` | `https://graph.microsoft.com/v1.0` | Base URL for Microsoft Graph API |
| No | `OCEAN__INTEGRATION__CONFIG__AUTH_TYPE` | `bearer_token` | Authentication method used for Graph API |
| Yes | `OCEAN__INTEGRATION__CONFIG__API_TOKEN` | `<YOUR_BEARER_TOKEN>` | Microsoft Graph API bearer token |
| No | `OCEAN__PORT__CLIENT_ID` | `<YOUR_PORT_CLIENT_ID>` | Port OAuth client ID |
| Yes | `OCEAN__PORT__CLIENT_SECRET` | `<YOUR_PORT_CLIENT_SECRET>` | Port OAuth client secret |
| No | `OCEAN__PORT__BASE_URL` | `https://api.getport.io` | Base URL for Port API (adjust for region if needed) |

5. Tags

Apply whatever Azure tags your organization requires (for example, Environment, Owner, CostCenter).

6. Review + Create

Inspect every section, verify the environment variables (especially the secure ones), and click Create. Once provisioning completes, confirm the container’s run state and check logs to ensure the ingestion completed successfully.
</TabItem>

</Tabs>


## Set up data model

Before the integration can sync data, you need to create the required blueprints in Port. These blueprints define the data model for your Entra ID resources.

**To create the blueprints:**

Create the blueprints in the following order:

1. Go to your [Builder page](https://app.getport.io/settings/data-model).

2. Click on the `+ Blueprint` button.

3. Copy and paste each blueprint JSON from the sections below in order:

    <details>
    <summary><b>1. Entra ID Application Blueprint (Click to expand)</b></summary>

    Enterprise applications registered in Entra ID:

    ```json showLineNumbers
    {
      "identifier": "entra-id-application",
      "description": "An application registration in Microsoft Entra ID",
      "title": "Entra ID Application",
      "icon": "Microsoft",
      "schema": {
        "properties": {
          "displayName": {
            "title": "Display Name",
            "type": "string"
          },
          "appId": {
            "title": "Application ID",
            "type": "string"
          },
          "publisherDomain": {
            "title": "Publisher Domain",
            "type": "string"
          },
          "signInAudience": {
            "title": "Sign-In Audience",
            "type": "string"
          },
          "createdDateTime": {
            "title": "Created Date",
            "type": "string",
            "format": "date-time"
          }
        },
        "required": ["displayName"]
      },
      "mirrorProperties": {},
      "calculationProperties": {},
      "aggregationProperties": {},
      "relations": {}
    }
    ```

    </details>

    <details>
    <summary><b>2. Entra ID Service Principal Blueprint (Click to expand)</b></summary>

    Service principal objects representing applications:

    ```json showLineNumbers
    {
      "identifier": "entra-id-service-principal",
      "description": "A service principal object in Microsoft Entra ID",
      "title": "Entra ID Service Principal",
      "icon": "Microsoft",
      "schema": {
        "properties": {
          "displayName": {
            "title": "Display Name",
            "type": "string"
          },
          "appId": {
            "title": "Application ID",
            "type": "string"
          },
          "appOwnerOrganizationId": {
            "title": "Owner Organization",
            "type": "string"
          },
          "accountEnabled": {
            "title": "Account Enabled",
            "type": "boolean"
          },
          "appRoleAssignmentRequired": {
            "title": "App Role Assignment Required",
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
      "mirrorProperties": {},
      "calculationProperties": {},
      "aggregationProperties": {},
      "relations": {}
    }
    ```

    </details>

    <details>
    <summary><b>3. Entra ID User Blueprint (Click to expand)</b></summary>

    User accounts and their profile information:

    ```json showLineNumbers
    {
      "identifier": "entra-id-user",
      "description": "A Microsoft Entra ID user account",
      "title": "Entra ID User",
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
      "mirrorProperties": {},
      "calculationProperties": {},
      "aggregationProperties": {},
      "relations": {}
    }
    ```

    </details>

    <details>
    <summary><b>4. Entra ID Group Blueprint (Click to expand)</b></summary>

    Security and Microsoft 365 groups:

    ```json showLineNumbers
    {
      "identifier": "entra-id-group",
      "description": "A Microsoft Entra ID group (security or Microsoft 365)",
      "title": "Entra ID Group",
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
      "mirrorProperties": {},
      "calculationProperties": {},
      "aggregationProperties": {},
      "relations": {
        "members": {
          "title": "Members",
          "target": "entra-id-user",
          "required": false,
          "many": true
        }
      }
    }
    ```

    </details>

4. Click `Save` to save each blueprint after creating it.

:::tip Adding relations after creation
After creating both the User and Group blueprints, you can edit the User blueprint to add a relation to Group. In the User blueprint, add this to the `relations` section:

```json showLineNumbers
"groups": {
  "title": "Groups",
  "target": "entra-id-group",
  "required": false,
  "many": true
}
```
:::



## Configuration 

After installation, define which endpoints to sync in your integration configuration. Each resource maps an API endpoint to Port entities using [JQ expressions](https://stedolan.github.io/jq/manual/) to transform the data.

**Key mapping components:**
- **`kind`**: The API endpoint path (combined with your base URL).
- **`selector.query`**: JQ filter to include/exclude entities (use `'true'` to sync all).
- **`selector.data_path`**: JQ expression pointing to the array of items in the response.
- **`port.entity.mappings`**: How to map API fields to Port entity properties.

For more details on how the Ocean Custom Integration works, see the [How it works](https://docs.port.io/build-your-software-catalog/custom-integration/ocean-custom-integration/overview#how-it-works) section in the custom integration overview.

**Microsoft Graph API response format:**

Microsoft Graph API responses typically follow this structure:

```json showLineNumbers
{
  "@odata.context": "https://graph.microsoft.com/v1.0/$metadata#users",
  "value": [
    {
      "id": "00000000-0000-0000-0000-000000000000",
      "displayName": "John Doe",
      ...
    }
  ],
  "@odata.nextLink": "https://graph.microsoft.com/v1.0/users?$skiptoken=..."
}
```

The actual data array is in the `.value` property, and pagination information is in `@odata.nextLink` with a `$skiptoken` parameter.

**To configure the mappings:**

1. Go to your [data sources page](https://app.getport.io/settings/data-sources).

2. Find your Entra ID integration in the list.

3. Click on the integration to open the mapping editor.

4. Add the resource mapping configurations below.

    <details>
    <summary><b>Users mapping (Click to expand)</b></summary>

    ```yaml showLineNumbers
    resources:
      - kind: /users
        selector:
          query: 'true'
          data_path: '.value'
          query_params:
            $top: "999"
        port:
          entity:
            mappings:
              identifier: .id
              title: .displayName // .userPrincipalName
              blueprint: '"entra-id-user"'
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

    </details>

    <details>
    <summary><b>Groups mapping (Click to expand)</b></summary>

    ```yaml showLineNumbers
    resources:
      - kind: /groups
        selector:
          query: 'true'
          data_path: '.value'
          query_params:
            $top: "999"
            $expand: "members($select=id)"
        port:
          entity:
            mappings:
              identifier: .id
              title: .displayName
              blueprint: '"entra-id-group"'
              properties:
                displayName: .displayName
                description: .description
                groupTypes: .groupTypes
                mailEnabled: .mailEnabled
                securityEnabled: .securityEnabled
                createdDateTime: .createdDateTime
              relations:
                members: "[.members[]?.id]"
    ```

    </details>

    <details>
    <summary><b>Applications mapping (Click to expand)</b></summary>

    ```yaml showLineNumbers
    resources:
      - kind: /applications
        selector:
          query: 'true'
          data_path: '.value'
          query_params:
            $top: "999"
        port:
          entity:
            mappings:
              identifier: .id
              title: .displayName
              blueprint: '"entra-id-application"'
              properties:
                displayName: .displayName
                appId: .appId
                publisherDomain: .publisherDomain
                signInAudience: .signInAudience
                createdDateTime: .createdDateTime
    ```

    </details>

    <details>
    <summary><b>Service principals mapping (Click to expand)</b></summary>

    ```yaml showLineNumbers
    resources:
      - kind: /servicePrincipals
        selector:
          query: 'true'
          data_path: '.value'
          query_params:
            $top: "999"
        port:
          entity:
            mappings:
              identifier: .id
              title: .displayName
              blueprint: '"entra-id-service-principal"'
              properties:
                displayName: .displayName
                appId: .appId
                appOwnerOrganizationId: .appOwnerOrganizationId
                accountEnabled: .accountEnabled
                appRoleAssignmentRequired: .appRoleAssignmentRequired
                createdDateTime: .createdDateTime
    ```

    </details>

5. Click `Save` to save the mapping.



## Customization

If you want to customize your setup or test different API endpoints before committing to a configuration, use the [interactive builder](/build-your-software-catalog/custom-integration/ocean-custom-integration/build-your-integration).

**The interactive builder helps you:**
1. Test your Microsoft Graph API endpoints with live data.
2. Automatically detect the data structure and field types.
3. Generate blueprints and resource mappings tailored to your preferences.
4. Get installation commands with your configuration pre-filled.

Simply provide your Entra ID API details, and the builder will generate everything you need to install and create the integration in Port.
