---
displayed_sidebar: null
description: Learn how to build a security analytics dashboard for Okta identity and access management using Port's integration
---

# Visualize Okta security insights

This guide demonstrates how to build a security analytics dashboard for Okta identity and access management. You'll learn how to visualize security metrics such as admin role exposure, user security posture, group access patterns, and more using Port's **Okta** integration.

<img src="/img/guides/okta-security-insights-dashboard.png" border="1px" width="100%" />

## Common use cases

- Monitor admin role exposure and privileged access
- Track user security status and lifecycle events
- Visualize group membership patterns and access distribution
- Identify security gaps in user provisioning and deprovisioning
- Audit access patterns and organizational structure
- Monitor compliance with security policies

## Prerequisites

This guide assumes the following:

- You have a Port account and have completed the [onboarding process](https://docs.port.io/getting-started/overview).
- Port's [Okta integration](/build-your-software-catalog/sync-data-to-catalog/identity-providers/okta) is installed and configured in your account.
- You have admin access to configure blueprints, scorecards, and dashboards in Port.

## Set up data model

We'll enhance the data model to capture security-related information from Okta. The Okta integration provides users and groups data, which we'll extend with security properties and relationships.

### Enhance the Okta user blueprint

First, let's add security-related properties to the Okta user blueprint to track security posture:

1. Go to the [Builder](https://app.getport.io/settings/data-model) page of your portal.
2. Find and click on the **okta-user** blueprint.
3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.
4. Update the blueprint to include security properties:

<details>
<summary><b>Enhanced Okta user blueprint (click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "okta-user",
  "title": "Okta User",
  "icon": "Okta",
  "schema": {
    "properties": {
      "login": {
        "title": "Login",
        "type": "string"
      },
      "email": {
        "title": "Email",
        "type": "string"
      },
      "firstName": {
        "title": "First Name",
        "type": "string"
      },
      "lastName": {
        "title": "Last Name",
        "type": "string"
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
      "employeeNumber": {
        "title": "Employee Number",
        "type": "string"
      },
      "mobilePhone": {
        "title": "Mobile Phone",
        "type": "string"
      },
      "primaryPhone": {
        "title": "Primary Phone",
        "type": "string"
      },
      "streetAddress": {
        "title": "Street Address",
        "type": "string"
      },
      "city": {
        "title": "City",
        "type": "string"
      },
      "state": {
        "title": "State",
        "type": "string"
      },
      "zipCode": {
        "title": "ZIP Code",
        "type": "string"
      },
      "countryCode": {
        "title": "Country Code",
        "type": "string"
      },
      "status": {
        "title": "Status",
        "type": "string",
        "enum": ["ACTIVE", "INACTIVE", "PASSWORD_EXPIRED", "LOCKED_OUT", "SUSPENDED", "DEPROVISIONED"]
      },
      "created": {
        "title": "Created Date",
        "type": "string",
        "format": "date-time"
      },
      "activated": {
        "title": "Activated Date",
        "type": "string",
        "format": "date-time"
      },
      "lastLogin": {
        "title": "Last Login",
        "type": "string",
        "format": "date-time"
      },
      "lastUpdated": {
        "title": "Last Updated",
        "type": "string",
        "format": "date-time"
      }
    },
    "required": ["login", "email"]
  },
  "calculationProperties": {
    "hasAdminRole": {
      "title": "Has Admin Role",
      "type": "boolean",
      "calculation": "[.groups[]?.name] | any(test(\"admin|Admin|ADMIN\"))"
    },
    "isPrivileged": {
      "title": "Is Privileged",
      "type": "boolean",
      "calculation": "[.groups[]?.name] | any(test(\"admin|Admin|ADMIN|privileged|Privileged|PRIVILEGED\"))"
    },
    "daysSinceLastLogin": {
      "title": "Days Since Last Login",
      "type": "number",
      "calculation": "if .lastLogin then (((now | todateiso8601) - (.lastLogin | fromdateiso8601)) / 86400) | floor else null end"
    },
    "securityRiskLevel": {
      "title": "Security Risk Level",
      "type": "string",
      "calculation": "if .status == \"LOCKED_OUT\" or .status == \"SUSPENDED\" then \"CRITICAL\" elif .status == \"PASSWORD_EXPIRED\" then \"HIGH\" elif .daysSinceLastLogin > 90 then \"MEDIUM\" elif .isPrivileged and .daysSinceLastLogin > 30 then \"MEDIUM\" else \"LOW\" end"
    },
    "groupCount": {
      "title": "Group Count",
      "type": "number",
      "calculation": ".groups | length"
    }
  },
  "relations": {
    "groups": {
      "title": "Groups",
      "target": "okta-group",
      "required": false,
      "many": true
    }
  }
}
```

</details>

5. Click `Save` to update the blueprint.

### Enhance the Okta group blueprint

Now let's enhance the group blueprint to track security-related group information:

1. Go to the [Builder](https://app.getport.io/settings/data-model) page of your portal.
2. Find and click on the **okta-group** blueprint.
3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.
4. Update the blueprint to include security properties:

<details>
<summary><b>Enhanced Okta group blueprint (click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "okta-group",
  "title": "Okta Group",
  "icon": "Okta",
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
      "type": {
        "title": "Type",
        "type": "string",
        "enum": ["BUILT_IN", "OKTA_GROUP", "APP_GROUP"]
      },
      "created": {
        "title": "Created Date",
        "type": "string",
        "format": "date-time"
      },
      "lastUpdated": {
        "title": "Last Updated",
        "type": "string",
        "format": "date-time"
      }
    },
    "required": ["name"]
  },
  "calculationProperties": {
    "isAdminGroup": {
      "title": "Is Admin Group",
      "type": "boolean",
      "calculation": ".name | test(\"admin|Admin|ADMIN|administrator|Administrator\")"
    },
    "isPrivileged": {
      "title": "Is Privileged",
      "type": "boolean",
      "calculation": ".name | test(\"admin|Admin|ADMIN|privileged|Privileged|PRIVILEGED|root|Root|ROOT\")"
    },
    "securityRiskLevel": {
      "title": "Security Risk Level",
      "type": "string",
      "calculation": "if .isPrivileged then \"MEDIUM\" else \"LOW\" end"
    }
  },
  "relations": {
    "members": {
      "title": "Members",
      "target": "okta-user",
      "required": false,
      "many": true
    }
  }
}
```

</details>

5. Click `Save` to update the blueprint.

## Update data source mapping

Ensure your Okta integration mapping includes groups and all necessary user fields:

1. Go to the [Data Sources](https://app.getport.io/settings/data-sources) page of your portal.
2. Select the Okta integration.
3. Verify your mapping configuration includes groups:

<details>
<summary><b>Okta integration configuration (click to expand)</b></summary>

```yaml showLineNumbers
resources:
  - kind: okta-user
    selector:
      query: 'true'
      include_groups: true
      include_applications: true
      fields: "id,status,created,activated,lastLogin,lastUpdated,profile:(login,firstName,lastName,displayName,email,title,department,employeeNumber,mobilePhone,primaryPhone,streetAddress,city,state,zipCode,countryCode)"
    port:
      entity:
        mappings:
          identifier: .id
          title: .profile.displayName // .profile.firstName + " " + .profile.lastName // .profile.login
          blueprint: '"okta-user"'
          properties:
            login: .profile.login
            email: .profile.email
            firstName: .profile.firstName
            lastName: .profile.lastName
            displayName: .profile.displayName
            title: .profile.title
            department: .profile.department
            employeeNumber: .profile.employeeNumber
            mobilePhone: .profile.mobilePhone
            primaryPhone: .profile.primaryPhone
            streetAddress: .profile.streetAddress
            city: .profile.city
            state: .profile.state
            zipCode: .profile.zipCode
            countryCode: .profile.countryCode
            status: .status
            created: .created
            activated: .activated
            lastLogin: .lastLogin
            lastUpdated: .lastUpdated
          relations:
            groups: .groups[]?.id
  - kind: okta-group
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: .id
          title: .profile.name
          blueprint: '"okta-group"'
          properties:
            name: .profile.name
            description: .profile.description
            type: .type
            created: .created
            lastUpdated: .lastUpdated
```

</details>

4. Click `Save & Resync` to apply the mapping and sync the data.

:::tip Verify data sync
Before creating widgets, verify that data is being synced:
1. Go to the [Catalog](https://app.getport.io/organization/catalog) page.
2. Search for `okta-user` or `okta-group` to see if entities are being created.
3. If no entities appear, check the [Data Sources](https://app.getport.io/settings/data-sources) page to ensure the Okta integration is running and syncing successfully.
:::

## Create security scorecards

Scorecards help track security compliance and identify areas that need attention. Let's create scorecards for user security posture and admin access.

### Create user security posture scorecard

1. Go to the [Builder](https://app.getport.io/settings/data-model) page.
2. Click on the **okta-user** blueprint.
3. Go to the **Scorecards** tab.
4. Click **+ Add Scorecard**.
5. Configure the scorecard:

<details>
<summary><b>User security posture scorecard configuration (click to expand)</b></summary>

**Scorecard Name:** `User Security Posture`

**Rules:**

1. **Active Status**
   - **Level:** Bronze
   - **Title:** User is active
   - **Rule:** `status == "ACTIVE"`

2. **Recent Activity**
   - **Level:** Silver
   - **Title:** User logged in within last 90 days
   - **Rule:** `daysSinceLastLogin != null and daysSinceLastLogin <= 90`

3. **Password Status**
   - **Level:** Bronze
   - **Title:** Password is not expired
   - **Rule:** `status != "PASSWORD_EXPIRED"`

4. **Account Status**
   - **Level:** Gold
   - **Title:** Account is not locked or suspended
   - **Rule:** `status != "LOCKED_OUT" and status != "SUSPENDED"`

5. **Privileged Access Review**
   - **Level:** Silver
   - **Title:** Privileged users logged in within last 30 days
   - **Filter:** `isPrivileged == true` (only applies to privileged users)
   - **Rule:** `daysSinceLastLogin != null and daysSinceLastLogin <= 30`

</details>

6. Click `Save` to create the scorecard.

### Create admin access scorecard

1. Go to the [Builder](https://app.getport.io/settings/data-model) page.
2. Click on the **okta-user** blueprint.
3. Go to the **Scorecards** tab.
4. Click **+ Add Scorecard**.
5. Configure the scorecard:

<details>
<summary><b>Admin access scorecard configuration (click to expand)</b></summary>

**Scorecard Name:** `Admin Access Compliance`

**Rules:**

1. **Admin Group Membership**
   - **Level:** Gold
   - **Title:** User is member of admin group
   - **Rule:** `hasAdminRole == true`

2. **Admin Activity**
   - **Level:** Silver
   - **Title:** Admin user logged in within last 30 days
   - **Filter:** `hasAdminRole == true` (only applies to admin users)
   - **Rule:** `daysSinceLastLogin != null and daysSinceLastLogin <= 30`

3. **Admin Account Status**
   - **Level:** Gold
   - **Title:** Admin account is active and not locked
   - **Filter:** `hasAdminRole == true` (only applies to admin users)
   - **Rule:** `status == "ACTIVE" and status != "LOCKED_OUT" and status != "SUSPENDED"`

</details>

6. Click `Save` to create the scorecard.

## Create dashboard

Now let's create a comprehensive security insights dashboard to visualize all the security metrics.

### Set up the dashboard

1. Navigate to your [software catalog](https://app.getport.io/organization/catalog).
2. Click on the **`+ New`** button in the left sidebar.
3. Select **New dashboard**.
4. Name the dashboard **Okta Security Insights**.
5. Click `Create`.

### Add widgets

In the new dashboard, create the following widgets to visualize security insights:

<details>
<summary><b>Users by status (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Pie chart**.
2. Title: `Users by Status` (add the `User` icon).
3. Choose the **okta-user** blueprint.
4. Under `Breakdown by property`, select **Status**.
5. Click **Save**.

</details>

<details>
<summary><b>Users by security risk level (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Pie chart**.
2. Title: `Users by Security Risk Level`.
3. Choose the **okta-user** blueprint.
4. Under `Breakdown by property`, select **Security Risk Level**.
5. Click **Save**.

</details>

<details>
<summary><b>Total active users (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Number Chart**.
2. Title: `Total Active Users` (add the `User` icon).
3. Select `Count entities` **Chart type** and choose **okta-user** as the **Blueprint**.
4. Select `count` for the **Function**.
5. Add this JSON to the **Additional filters** editor:
   ```json showLineNumbers
   {
     "combinator": "and",
     "rules": [
       {
         "property": "status",
         "operator": "=",
         "value": "ACTIVE"
       }
     ]
   }
   ```
6. Select `custom` as the **Unit** and input `users` as the **Custom unit**.
7. Click **Save**.

</details>

<details>
<summary><b>Users with admin roles (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Table**.
2. Title: `Users with Admin Roles`.
3. Choose the **okta-user** blueprint.
4. Leave the filter empty (calculation properties cannot be used in widget filters).
5. Configure columns to show: **Display Name**, **Email**, **Has Admin Role**, **Groups**, **Status**, **Last Login**.
6. Click **Save**.
7. After the widget is created, use the table's filter menu to filter by **Has Admin Role** equals `true`, or sort the table by the **Has Admin Role** column to see admin users at the top.

:::tip Table filters
Table widgets allow you to filter by calculation properties after the data is loaded, even though calculation properties cannot be used in the initial widget filter. Use the filter menu in the table to filter by **Has Admin Role** equals `true` to see only users with admin roles.
:::

</details>

<details>
<summary><b>Inactive users (90+ days) (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Number Chart**.
2. Title: `Inactive Users (90+ days)`.
3. Select `Count entities` **Chart type** and choose **okta-user** as the **Blueprint**.
4. Select `count` for the **Function**.
5. Add this JSON to the **Additional filters** editor:
   ```json showLineNumbers
   {
     "combinator": "or",
     "rules": [
       {
         "property": "lastLogin",
         "operator": "isEmpty"
       },
       {
         "property": "lastLogin",
         "operator": "notBetween",
         "value": {
           "preset": "last3Months"
         }
       }
     ]
   }
   ```
6. Select `custom` as the **Unit** and input `users` as the **Custom unit**.
7. Click **Save**.

</details>

<details>
<summary><b>Users with expired passwords (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Table**.
2. Title: `Users with Expired Passwords`.
3. Choose the **okta-user** blueprint.
4. Add filter where **Status** equals `PASSWORD_EXPIRED`.
5. Configure columns to show: **Display Name**, **Email**, **Status**, **Last Login**.
6. Click **Save**.

</details>

<details>
<summary><b>Locked or suspended users (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Table**.
2. Title: `Locked or Suspended Users`.
3. Choose the **okta-user** blueprint.
4. Add filter where **Status** is one of: `LOCKED_OUT`, `SUSPENDED`.
5. Configure columns to show: **Display Name**, **Email**, **Status**, **Security Risk Level**, **Last Login**.
6. Click **Save**.

</details>

<details>
<summary><b>Privileged users table (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Table**.
2. Title: `Privileged Users`.
3. Choose the **okta-user** blueprint.
4. Add filter using the JSON editor:
   ```json showLineNumbers
   {
     "combinator": "and",
     "rules": [
       {
         "property": "isPrivileged",
         "operator": "=",
         "value": true
       }
     ]
   }
   ```
   Or use the UI filter and search for **Is Privileged** in the property dropdown.
5. Configure columns to show: **Display Name**, **Email**, **Has Admin Role**, **Group Count**, **Days Since Last Login**, **Security Risk Level**.
6. Click **Save**.

</details>

<details>
<summary><b>Admin groups (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Bar chart**.
2. Title: `Admin Groups`.
3. Choose the **okta-group** blueprint.
4. Under **Breakdown by property**, select **Name**.
5. Add filter to find admin groups by filtering on the `name` property:
   ```json showLineNumbers
   {
     "combinator": "or",
     "rules": [
       {
         "property": "name",
         "operator": "contains",
         "value": "admin"
       },
       {
         "property": "name",
         "operator": "contains",
         "value": "Admin"
       },
       {
         "property": "name",
         "operator": "contains",
         "value": "ADMIN"
       },
       {
         "property": "name",
         "operator": "contains",
         "value": "administrator"
       },
       {
         "property": "name",
         "operator": "contains",
         "value": "Administrator"
       }
     ]
   }
   ```
6. Click **Save**.

</details>

<details>
<summary><b>Groups by type (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Pie chart**.
2. Title: `Groups by Type`.
3. Choose the **okta-group** blueprint.
4. Under `Breakdown by property`, select **Type**.
5. Click **Save**.

</details>

<details>
<summary><b>Privileged groups (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Table**.
2. Title: `Privileged Groups`.
3. Choose the **okta-group** blueprint.
4. Add filter using the JSON editor:
   ```json showLineNumbers
   {
     "combinator": "and",
     "rules": [
       {
         "property": "isPrivileged",
         "operator": "=",
         "value": true
       }
     ]
   }
   ```
   Or use the UI filter and search for **Is Privileged** in the property dropdown.
5. Configure columns to show: **Name**, **Type**, **Security Risk Level**, **Description**.
6. Click **Save**.

</details>

<details>
<summary><b>Security risk distribution (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Bar chart**.
2. Title: `Security Risk Distribution`.
3. Choose the **okta-user** blueprint.
4. Under **Breakdown by property**, select **Security Risk Level**.
5. Click **Save**.

</details>

## Troubleshooting

If your dashboard widgets show errors or no data, try the following:

### Widget shows "Failed to load data" or "Query Error"

1. **Verify data is synced:**
   - Go to the [Catalog](https://app.getport.io/organization/catalog) page.
   - Search for `okta-user` or `okta-group` entities.
   - If no entities exist, the Okta integration may not be syncing. Check the [Data Sources](https://app.getport.io/settings/data-sources) page.

2. **Check calculation properties:**
   - Calculation properties like `daysSinceLastLogin`, `isPrivileged`, and `isAdminGroup` are computed dynamically.
   - If filtering by these properties fails, try removing the filter temporarily to see if data appears.
   - Ensure the calculation properties are correctly defined in your blueprints.

3. **Verify filter syntax:**
   - For JSON filters, ensure the property identifier matches exactly (e.g., `isPrivileged` not `Is Privileged`).
   - Boolean values should be `true` or `false` (not strings).
   - Check that the property exists in the blueprint schema.

4. **Test without filters:**
   - Remove all filters from the widget to see if data appears.
   - If data appears without filters, the issue is with the filter configuration.
   - Gradually add filters back to identify which one is causing the problem.

### Widget shows "There are no okta users" or "0 results"

1. **Check if data exists:**
   - The filter may be working correctly, but there might genuinely be no users matching the criteria.
   - Try removing the filter to see all users.
   - Verify the filter values match actual data (e.g., status values are uppercase like `ACTIVE`, `LOCKED_OUT`).

2. **Verify property values:**
   - Status values are case-sensitive: `ACTIVE`, `LOCKED_OUT`, `SUSPENDED`, `PASSWORD_EXPIRED`.
   - Boolean calculation properties return `true` or `false`, not strings.

3. **Check the Okta integration:**
   - Ensure the integration has synced recently.
   - Check if users exist in your Okta organization that match the filter criteria.

## Summary

You've successfully created a comprehensive Okta Security Insights dashboard that visualizes:

- **User security posture** - Status distribution, risk levels, and compliance metrics
- **Admin role exposure** - Privileged users and administrative group memberships
- **Access patterns** - Group memberships and access distribution
- **Security gaps** - Inactive users, expired passwords, locked accounts
- **Risk assessment** - Security risk levels and prioritized remediation targets

## Next steps

### Extend with additional data sources

While the current Okta integration focuses on users and groups, you can extend this dashboard by:

1. **Integrating Okta System Log API** - Add sign-in events, failed authentication attempts, and security events
2. **Adding application data** - Track application assignments and security configurations
3. **Including MFA data** - Monitor multi-factor authentication enrollment and usage
4. **Risk events** - Integrate Okta Risk Insights for risky sign-in detection

### Set up automation

Create automations to:
- Alert security teams when high-risk users are identified
- Automatically update security risk levels based on user activity
- Generate reports for compliance audits
- Trigger remediation workflows for security gaps

### Create additional scorecards

Build scorecards for:
- Group security compliance
- Application access security
- MFA enrollment rates
- Password policy compliance

## Related guides

- [Visualize your GitHub identity and access management](/guides/all/visualize-your-github-identity-and-access-management)
- [Manage and visualize your AWS S3 buckets and RDS instances](/guides/all/visualize-your-aws-storage-configuration)
- [Visualize your Wiz security issues](/guides/all/visualize-your-wiz-vulnerabilities)

