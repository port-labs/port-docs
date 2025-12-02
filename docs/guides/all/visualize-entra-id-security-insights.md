---
displayed_sidebar: null
description: Learn how to monitor Microsoft Entra ID security posture and gain identity insights using dashboards.
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortTooltip from "/src/components/tooltip/tooltip.jsx"

# Visualize Microsoft Entra ID security insights

This guide demonstrates how to set up a security analytics dashboard to gain visibility into your Microsoft Entra ID (formerly Azure AD) identity security posture. We will see how to visualize identity risks, sign-in activity, application security, and policy gaps using Port's **Microsoft Entra ID** integration.

## Common use cases

- Monitor risky sign-ins and compromised identities in your environment.
- Track sensitive admin roles and recent role assignment changes.
- Identify applications and service principals with security gaps (missing owners, expired credentials, weak configurations).
- Visualize conditional access policy coverage and enforcement status.
- Monitor device compliance and security posture across your organization.

## Prerequisites

This guide assumes the following:
- You have a Port account and have completed the [onboarding process](/getting-started/overview).
- Port's [Microsoft Entra ID integration](/build-your-software-catalog/sync-data-to-catalog/identity-providers/azure-ad) is installed in your account.

To extend the Entra ID integration with security insights, you need additional Microsoft Graph API permissions beyond the basic integration requirements:

**Additional API permissions required:**
- `IdentityRiskEvent.Read.All` - Read identity risk events and risky sign-ins.
- `Directory.Read.All` - Read directory roles and administrative units.
- `Policy.Read.All` - Read conditional access policies.
- `DeviceManagementManagedDevices.Read.All` - Read managed device information.

**To add these permissions:**

1. In your Azure Portal, navigate to your app registration.
2. Go to **API permissions**.
3. Click **Add a permission**.
4. Select **Microsoft Graph**.
5. Select **Application permissions**.
6. Add the permissions listed above.
7. Click **Grant admin consent for [Your Organization]**.

:::warning Admin consent required
An Entra ID administrator must grant consent for these permissions before the integration can access security data.
:::

## Set up data model

To visualize security insights, we need to extend the basic Entra ID integration with security-focused blueprints and properties. We will create additional blueprints for risky sign-ins, directory roles, conditional access policies, and device compliance.

### Extend user blueprint with security properties

1. Go to your [Builder page](https://app.getport.io/settings/data-model).
2. Find the **Entra ID User** blueprint and click on it.
3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.
4. Add the following security-related properties to the `schema.properties` section:

```json showLineNumbers
"riskLevel": {
  "title": "Risk Level",
  "type": "string",
  "enum": ["none", "low", "medium", "high", "hidden", "unknownFutureValue"]
},
"riskySignInCount": {
  "title": "Risky Sign-In Count",
  "type": "number"
},
"lastRiskySignInDateTime": {
  "title": "Last Risky Sign In",
  "type": "string",
  "format": "date-time"
},
"isAdmin": {
  "title": "Is Admin",
  "type": "boolean"
},
"adminRoles": {
  "title": "Admin Roles",
  "type": "array",
  "items": {
    "type": "string"
  }
}
```

5. Click `Save` to update the blueprint.

### Create risky sign-in blueprint

1. Go to your [Builder page](https://app.getport.io/settings/data-model).
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.
4. Add this JSON schema:

<details>
<summary><b>Risky sign-in blueprint (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "entra-id-risky-sign-in",
  "description": "A risky sign-in event detected by Microsoft Entra ID Identity Protection",
  "title": "Risky Sign-In",
  "icon": "Alert",
  "schema": {
    "properties": {
      "riskLevel": {
        "title": "Risk Level",
        "type": "string",
        "enum": ["none", "low", "medium", "high", "hidden", "unknownFutureValue"],
        "enumColors": {
          "none": "green",
          "low": "blue",
          "medium": "yellow",
          "high": "red",
          "hidden": "darkGray",
          "unknownFutureValue": "darkGray"
        }
      },
      "riskState": {
        "title": "Risk State",
        "type": "string",
        "enum": ["none", "confirmedSafe", "remediated", "dismissed", "atRisk", "confirmedCompromised", "unknownFutureValue"]
      },
      "riskType": {
        "title": "Risk Type",
        "type": "string"
      },
      "ipAddress": {
        "title": "IP Address",
        "type": "string"
      },
      "location": {
        "title": "Location",
        "type": "string"
      },
      "userDisplayName": {
        "title": "User Display Name",
        "type": "string"
      },
      "userPrincipalName": {
        "title": "User Principal Name",
        "type": "string",
        "format": "email"
      },
      "detectedDateTime": {
        "title": "Detected Date",
        "type": "string",
        "format": "date-time"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {
    "user": {
      "title": "User",
      "target": "entra-id-user",
      "required": false,
      "many": false
    }
  }
}
```

</details>

5. Click `Save` to create the blueprint.

### Create directory role blueprint

1. Go to your [Builder page](https://app.getport.io/settings/data-model).
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.
4. Add this JSON schema:

<details>
<summary><b>Directory role blueprint (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "entra-id-directory-role",
  "description": "A directory role in Microsoft Entra ID (e.g., Global Administrator, User Administrator)",
  "title": "Directory Role",
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
      "roleTemplateId": {
        "title": "Role Template ID",
        "type": "string"
      },
      "memberCount": {
        "title": "Member Count",
        "type": "number"
      },
      "isPrivileged": {
        "title": "Is Privileged",
        "type": "boolean"
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

5. Click `Save` to create the blueprint.

### Extend application blueprint with security properties

1. Go to your [Builder page](https://app.getport.io/settings/data-model).
2. Find the **Entra ID Application** blueprint and click on it.
3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.
4. Add the following security-related properties to the `schema.properties` section:

```json showLineNumbers
"ownerCount": {
  "title": "Owner Count",
  "type": "number"
},
"hasOwners": {
  "title": "Has Owners",
  "type": "boolean"
},
"expiredCredentials": {
  "title": "Expired Credentials",
  "type": "boolean"
},
"keyExpirationDate": {
  "title": "Key Expiration Date",
  "type": "string",
  "format": "date-time"
},
"passwordExpirationDate": {
  "title": "Password Expiration Date",
  "type": "string",
  "format": "date-time"
},
"isExposed": {
  "title": "Is Exposed",
  "type": "boolean"
}
```

5. Click `Save` to update the blueprint.

### Extend service principal blueprint with security properties

1. Go to your [Builder page](https://app.getport.io/settings/data-model).
2. Find the **Entra ID Service Principal** blueprint and click on it.
3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.
4. Add the following security-related properties to the `schema.properties` section:

```json showLineNumbers
"ownerCount": {
  "title": "Owner Count",
  "type": "number"
},
"hasOwners": {
  "title": "Has Owners",
  "type": "boolean"
},
"expiredCredentials": {
  "title": "Expired Credentials",
  "type": "boolean"
},
"keyExpirationDate": {
  "title": "Key Expiration Date",
  "type": "string",
  "format": "date-time"
},
"passwordExpirationDate": {
  "title": "Password Expiration Date",
  "type": "string",
  "format": "date-time"
},
"isExposed": {
  "title": "Is Exposed",
  "type": "boolean"
}
```

5. Click `Save` to update the blueprint.

## Update integration mapping

Now we need to extend the Entra ID integration configuration to sync security-related data from Microsoft Graph API.

1. Go to your [data sources page](https://app.getport.io/settings/data-sources).
2. Find your Entra ID integration and click on it.
3. Add the following resource mappings to your existing configuration:

<details>
<summary><b>Extended integration configuration (Click to expand)</b></summary>

```yaml showLineNumbers
resources:
  # Existing user mapping with security extensions
  - kind: /users
    selector:
      query: 'true'
      data_path: '.value'
      query_params:
        $top: "999"
        $select: "id,displayName,userPrincipalName,givenName,surname,mail,jobTitle,department,officeLocation,accountEnabled,createdDateTime,signInActivity"
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

  # Risky sign-ins mapping
  - kind: /identityProtection/riskySignIns
    selector:
      query: 'true'
      data_path: '.value'
      query_params:
        $top: "999"
        $filter: "riskLevel ne 'none'"
    port:
      entity:
        mappings:
          identifier: .id
          title: .userDisplayName + " - " + .riskLevel + " risk"
          blueprint: '"entra-id-risky-sign-in"'
          properties:
            riskLevel: .riskLevel
            riskState: .riskState
            riskType: .riskType
            ipAddress: .ipAddress
            location: .location
            userDisplayName: .userDisplayName
            userPrincipalName: .userPrincipalName
            detectedDateTime: .detectedDateTime
          relations:
            user: .userId

  # Directory roles mapping
  - kind: /directoryRoles
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
          blueprint: '"entra-id-directory-role"'
          properties:
            displayName: .displayName
            description: .description
            roleTemplateId: .roleTemplateId
            memberCount: ".members | length"
            isPrivileged: 'if .displayName | test("Administrator|Owner|Privileged") then true else false end'
          relations:
            members: "[.members[]?.id]"

  # Applications with security properties
  - kind: /applications
    selector:
      query: 'true'
      data_path: '.value'
      query_params:
        $top: "999"
        $expand: "owners($select=id)"
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
            ownerCount: ".owners | length"
            hasOwners: 'if (.owners | length) > 0 then true else false end'
            isExposed: 'if (.owners | length) == 0 then true else false end'

  # Service principals with security properties
  - kind: /servicePrincipals
    selector:
      query: 'true'
      data_path: '.value'
      query_params:
        $top: "999"
        $expand: "owners($select=id)"
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
            ownerCount: ".owners | length"
            hasOwners: 'if (.owners | length) > 0 then true else false end'
            isExposed: 'if (.owners | length) == 0 then true else false end'
```

</details>

4. Click `Save & Resync` to apply the mapping.

:::tip API endpoint availability
Some Microsoft Graph API endpoints may require specific licenses (e.g., Azure AD Premium P2 for Identity Protection features). Ensure your Entra ID tenant has the required licenses before configuring these mappings.
:::

## Visualize metrics

Once your Entra ID security data is synced, we can create a dedicated dashboard in Port to monitor and analyze identity security insights using customizable widgets.

### Create a dashboard

1. Navigate to the [Catalog](https://app.getport.io/organization/catalog) page of your portal.
2. Click on the **`+ New`** button in the left sidebar.
3. Select **New dashboard**.
4. Name the dashboard **Entra ID Security Insights**.
5. Input `Monitor and analyze Microsoft Entra ID identity security posture` under **Description**.
6. Select the `Microsoft` icon.
7. Click `Create`.

We now have a blank dashboard where we can start adding widgets to visualize insights from your Entra ID resources.

### Add widgets

In the new dashboard, create the following widgets:

<details>
<summary><b>Users by risk level (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Pie chart**.
2. Title: `Users by risk level` (add the `Microsoft` icon).
3. Choose the **Entra ID User** blueprint.
4. Under `Breakdown by property`, select the **Risk Level** property.
5. Click **Save**.

</details>

<details>
<summary><b>Risky sign-ins count (click to expand)</b></summary>

1. Click `+ Widget` and select **Number Chart**.
2. Title: `Risky sign-ins count` (add the `Alert` icon).
3. Select `Count entities` **Chart type** and choose **Risky Sign-In** as the **Blueprint**.
4. Select `count` for the **Function**.
5. Click `Save`.

</details>

<details>
<summary><b>High-risk sign-ins (click to expand)</b></summary>

1. Click `+ Widget` and select **Number Chart**.
2. Title: `High-risk sign-ins` (add the `Alert` icon).
3. Select `Count entities` **Chart type** and choose **Risky Sign-In** as the **Blueprint**.
4. Select `count` for the **Function**.
5. Add this JSON to the **Additional filters** editor to filter high-risk sign-ins:
    ```json showLineNumbers
    [
        {
            "combinator":"and",
            "rules":[
                {
                    "property":"riskLevel",
                    "operator":"=",
                    "value":"high"
                }
            ]
        }
    ]
    ```
6. Click `Save`.

</details>

<details>
<summary><b>Risky sign-ins by risk level (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Pie chart**.
2. Title: `Risky sign-ins by risk level` (add the `Alert` icon).
3. Choose the **Risky Sign-In** blueprint.
4. Under `Breakdown by property`, select the **Risk Level** property.
5. Click **Save**.

</details>

<details>
<summary><b>Recent risky sign-ins table (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Table**.
2. Title: `Recent risky sign-ins` (add the `Alert` icon).
3. Choose the **Risky Sign-In** blueprint.
4. Add this JSON to the **Additional filters** editor to show only recent risky sign-ins:
    ```json showLineNumbers
    [
        {
            "combinator":"and",
            "rules":[
                {
                    "property":"detectedDateTime",
                    "operator":">=",
                    "value":"{{ now | date: '%Y-%m-%d' | date_add: -7, 'days' }}"
                }
            ]
        }
    ]
    ```
5. Click **Save** to add the widget to the dashboard.
6. Click on the **`...`** button in the top right corner of the table and select **Customize table**.
7. In the top right corner of the table, click on `Manage Properties` and add the following properties:
    - **User Display Name**: The name of the user.
    - **Risk Level**: The risk level of the sign-in.
    - **Risk Type**: The type of risk detected.
    - **IP Address**: The IP address from which the sign-in occurred.
    - **Location**: The location of the sign-in.
    - **Detected Date**: When the risky sign-in was detected.
8. Click on the **save icon** in the top right corner of the widget to save the customized table.

</details>

<details>
<summary><b>Admin users count (click to expand)</b></summary>

1. Click `+ Widget` and select **Number Chart**.
2. Title: `Admin users count` (add the `Microsoft` icon).
3. Select `Count entities` **Chart type** and choose **Entra ID User** as the **Blueprint**.
4. Select `count` for the **Function**.
5. Add this JSON to the **Additional filters** editor to filter admin users:
    ```json showLineNumbers
    [
        {
            "combinator":"and",
            "rules":[
                {
                    "property":"isAdmin",
                    "operator":"=",
                    "value":true
                }
            ]
        }
    ]
    ```
6. Click `Save`.

</details>

<details>
<summary><b>Directory roles overview (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Table**.
2. Title: `Directory roles overview` (add the `Microsoft` icon).
3. Choose the **Directory Role** blueprint.
4. Click **Save** to add the widget to the dashboard.
5. Click on the **`...`** button in the top right corner of the table and select **Customize table**.
6. In the top right corner of the table, click on `Manage Properties` and add the following properties:
    - **Display Name**: The name of the role.
    - **Description**: The role description.
    - **Member Count**: The number of users assigned to this role.
    - **Is Privileged**: Whether this is a privileged role.
7. Click on the **save icon** in the top right corner of the widget to save the customized table.

</details>

<details>
<summary><b>Privileged roles by member count (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Pie chart**.
2. Title: `Privileged roles by member count` (add the `Microsoft` icon).
3. Choose the **Directory Role** blueprint.
4. Under `Breakdown by property`, select the **Display Name** property.
5. Add this JSON to the **Additional filters** editor to filter privileged roles:
    ```json showLineNumbers
    [
        {
            "combinator":"and",
            "rules":[
                {
                    "property":"isPrivileged",
                    "operator":"=",
                    "value":true
                }
            ]
        }
    ]
    ```
6. Click **Save**.

</details>

<details>
<summary><b>Applications without owners (click to expand)</b></summary>

1. Click `+ Widget` and select **Number Chart**.
2. Title: `Applications without owners` (add the `Microsoft` icon).
3. Select `Count entities` **Chart type** and choose **Entra ID Application** as the **Blueprint**.
4. Select `count` for the **Function**.
5. Add this JSON to the **Additional filters** editor to filter applications without owners:
    ```json showLineNumbers
    [
        {
            "combinator":"and",
            "rules":[
                {
                    "property":"hasOwners",
                    "operator":"=",
                    "value":false
                }
            ]
        }
    ]
    ```
6. Click `Save`.

</details>

<details>
<summary><b>Exposed service principals (click to expand)</b></summary>

1. Click `+ Widget` and select **Number Chart**.
2. Title: `Exposed service principals` (add the `Microsoft` icon).
3. Select `Count entities` **Chart type** and choose **Entra ID Service Principal** as the **Blueprint**.
4. Select `count` for the **Function**.
5. Add this JSON to the **Additional filters** editor to filter exposed service principals:
    ```json showLineNumbers
    [
        {
            "combinator":"and",
            "rules":[
                {
                    "property":"isExposed",
                    "operator":"=",
                    "value":true
                }
            ]
        }
    ]
    ```
6. Click `Save`.

</details>

<details>
<summary><b>Applications by owner status (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Pie chart**.
2. Title: `Applications by owner status` (add the `Microsoft` icon).
3. Choose the **Entra ID Application** blueprint.
4. Under `Breakdown by property`, select the **Has Owners** property.
5. Click **Save**.

</details>

<details>
<summary><b>Service principals by owner status (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Pie chart**.
2. Title: `Service principals by owner status` (add the `Microsoft` icon).
3. Choose the **Entra ID Service Principal** blueprint.
4. Under `Breakdown by property`, select the **Has Owners** property.
5. Click **Save**.

</details>

<details>
<summary><b>Exposed applications table (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Table**.
2. Title: `Exposed applications` (add the `Microsoft` icon).
3. Choose the **Entra ID Application** blueprint.
4. Add this JSON to the **Additional filters** editor to filter exposed applications:
    ```json showLineNumbers
    [
        {
            "combinator":"and",
            "rules":[
                {
                    "property":"isExposed",
                    "operator":"=",
                    "value":true
                }
            ]
        }
    ]
    ```
5. Click **Save** to add the widget to the dashboard.
6. Click on the **`...`** button in the top right corner of the table and select **Customize table**.
7. In the top right corner of the table, click on `Manage Properties` and add the following properties:
    - **Display Name**: The name of the application.
    - **Application ID**: The application ID.
    - **Owner Count**: The number of owners assigned.
    - **Sign-In Audience**: The sign-in audience configuration.
    - **Created Date**: When the application was created.
8. Click on the **save icon** in the top right corner of the widget to save the customized table.

</details>

<details>
<summary><b>Groups by security status (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Pie chart**.
2. Title: `Groups by security status` (add the `Microsoft` icon).
3. Choose the **Entra ID Group** blueprint.
4. Under `Breakdown by property`, select the **Security Enabled** property.
5. Click **Save**.

</details>

<details>
<summary><b>Disabled users count (click to expand)</b></summary>

1. Click `+ Widget` and select **Number Chart**.
2. Title: `Disabled users count` (add the `Microsoft` icon).
3. Select `Count entities` **Chart type** and choose **Entra ID User** as the **Blueprint**.
4. Select `count` for the **Function**.
5. Add this JSON to the **Additional filters** editor to filter disabled users:
    ```json showLineNumbers
    [
        {
            "combinator":"and",
            "rules":[
                {
                    "property":"accountEnabled",
                    "operator":"=",
                    "value":false
                }
            ]
        }
    ]
    ```
6. Click `Save`.

</details>

<details>
<summary><b>Users by account status (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Pie chart**.
2. Title: `Users by account status` (add the `Microsoft` icon).
3. Choose the **Entra ID User** blueprint.
4. Under `Breakdown by property`, select the **Account Enabled** property.
5. Click **Save**.

</details>

These widgets provide a comprehensive view of your Entra ID security posture, making it easy to monitor identity risks, admin roles, application exposure, and user account status across your organization.

## Possible daily routine integrations

- Send a Slack message to security teams when high-risk sign-ins are detected.
- Notify administrators when new privileged role assignments are made.
- Alert application owners when their applications have missing owners or expired credentials.
- Generate weekly security reports summarizing risky sign-ins, admin role changes, and exposed applications.
- Create automated workflows to remediate security issues (e.g., assign owners to exposed applications).

## Conclusion

Microsoft Entra ID security monitoring is critical for maintaining a strong identity security posture. Port's Entra ID integration allows you to easily model and visualize your identity security data, making it simple to detect misconfigurations, monitor risky activity, and track security controls.

Customize your views to display the data that matters to you, grouped or filtered by risk level, role type, or any other criteria. Use this dashboard to strengthen your identity posture and reduce the overhead of fragmented Azure monitoring.
