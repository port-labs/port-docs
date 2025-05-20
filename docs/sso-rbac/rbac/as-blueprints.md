---
sidebar_position: 1
---

import PortTooltip from "/src/components/tooltip/tooltip.jsx"
import Tabs from '@theme/Tabs'
import TabItem from '@theme/TabItem'

# As blueprints (new)

:::warning New default behavior
A new mechanism to manage users and teams has been released, using dedicated blueprints.  
Starting **January 14, 2025**, this will be the default behavior for all new Port accounts.

- If you created your account **after** this date, continue reading this page, which describes the **new behavior**.

- If you created your account **before** this date, and enabled the `"Users & teams as blueprints beta feature"` in your organization, see the [**users & teams as blueprints beta**](/sso-rbac/rbac/as-blueprints-beta) page.

- If you created your account **before** this date, and did not enable the beta feature, see the [**old users & teams behavior**](/sso-rbac/rbac/no-blueprints) page.
:::

## Overview

After creating a Port account, two <PortTooltip id="blueprint">blueprints</PortTooltip> will be automatically created in your [data model](https://app.getport.io/settings/data-model) - `User` and `Team`.

These blueprints represent Port users and teams, and their data will be synced accordingly:

- When you create a user/team <PortTooltip id="entity">entity</PortTooltip>, a matching Port user/team will be created as well.
- When you delete a user/team <PortTooltip id="entity">entity</PortTooltip>, the matching Port user/team will be deleted as well.

The syncing mechanism is bidirectional, meaning that every create/edit/delete action performed on a Port user/team will be reflected in the relevant entity as well.

The `User` and `Team` blueprints allow you to:

- Enrich your users and teams data by adding _properties_ to these blueprints - Slack URLs, titles, profiles, or any other data.
- Enrich your users and teams data by adding _relations_ to these blueprints - for example, you can relate a user to a domain, or a team to a project.

:::info Important
The `User` and `Team` blueprints cannot be deleted or edited, and their default properties cannot be changed.  
You can, however, create new properties and relations in them and edit/delete them as you wish.
:::

## Blueprints structure

The `User` and `Team` blueprints are comprised of the following properties:

<Tabs groupId="user-and-team-blueprint-structure" queryString values={[
{label: "User", value: "user"},
{label: "Team", value: "team"},
]}>

<TabItem value="user">
- Identifier - the user's email, which will be synced with the Port user's email.
- Title - the user's name, which will be synced with the Port user's first and last name.
- Status - the user's [status](#user-status).
- Port Role - the user's internal [role in Port](/sso-rbac/rbac/#roles). This property affects the permissions granted to this user.
- Moderated Blueprints - the blueprints that can be moderated by the user. Only relevant for `moderator` users.
- Port type - the type of the user, can be one of the following:
  - Standard - human users.
  - [Service Account](/sso-rbac/rbac/#service-accounts).
</TabItem>

<TabItem value="team">
- Identifier - the team's identifier.
- Title - the team's name, which will be synced with the Port team name.
- Description - the team's description, which will be synced with the Port team description.
- Size - the number of users in the team.
</TabItem>
</Tabs>

:::tip Using SSO for users and teams

When Single Sign-On (SSO) is enabled, users and teams information (including team membership) is taken directly from your identity provider (IdP).

Since these teams are synced from your IdP the following actions cannot be performed on them:

- Edit SSO team membership.
- Delete SSO teams.

:::

### Terraform support

Since the `User` and `Team` blueprints can only be extended, to configure them using Terraform you need use the `port_system_blueprint` resource.  
These blueprints can not be created so don't forget to **import** them to your Terraform state`.

The `port_system_blueprint` resource is supported in Terraform starting from version **2.2.0**.

For example:

```hcl showLineNumbers
resource "port_system_blueprint" "user" {
  identifier = "_user"
  # Only new properties that will be added to the blueprint
  properties = {
    string_props = {
      "age" = {
        type  = "number"
        title = "Age"
      }
    }
  }
}
```

## User status

A user can have one of the following statuses at any given time:

- `Active` - the user has logged into Port and can use the portal normally.
- `Invited` - the user was invited to Port via an invitation email.
- `Disabled` - the user is disabled and cannot use Port.

By default, all new users are created with the `Disabled` status (no email invitation is sent).

In your software catalog, admins can access the [Users](https://app.getport.io/_users) page to view and manage all of the user entities in the organization.  
Here admins can also change a user's status, and invite new users.

### Limitations

- Only users with a UI/API origin can invite users and change their status.  

- Users cannot change their own status.

## Ownership

Clear ownership of resources in an organization is critical for driving clear decision-making, maintaining consistency, and enabling rapid issue resolution.
Port allows you to define which team/s are responsible for specific entities in your software catalog, using the `ownership` property and the `$team` meta-property as described below.

### The `team` meta-property

The value returned by the `$team` meta-property depends on the [ownership type](#the-ownership-property) defined for the blueprint - it will be empty for blueprints with no ownership, directly set for blueprints with Direct ownership, or inherited for blueprints with Inherited ownership.

Each entity has a [meta-property](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/meta-properties.md) named `team`, that stores which teams own the entity.  
As an `admin`, you can also set blueprint permissions according to this field.

The `team` meta-property is an array of the owning teams' `identifiers`.  
Here is an example entity:

```json showLineNumbers
{
  "identifier": "pod-1",
  "title": "Awesome pod",
  "team": ["some-team-identifier", "another-team-identifier"],
  "blueprint": "Pod",
  "properties": {
    ...
  },
  "relations": {}
}
```

#### Reference an entity's team

In places where you need to reference an entity's team, use `$team` to reference the meta-property.  
For example, in a search query:

```json showLineNumbers
{
  "operator": "containsAny",
  "property": "$team",
  "value": ["team-identifier"]
}
```

### The `ownership` property

All blueprints have an `ownership` property that tells Port how to set team ownership for its entities.  
This field is not mandatory.

:::info Terraform support
The `ownership` property is also supported in Terraform starting from version **2.1.4**.
:::

These are the available options for the `ownership` property:

1. **No ownership**

    The blueprint has no defined ownership.  
    The `$team` property will have no meaningful value.

    ```json showLineNumbers
    {
      "identifier": "packageVersion",
      "title": "Package Version",
      ...
    }
    ```

2. **Direct**

    Ownership of the blueprint's entities will be defined by a hidden <PortTooltip id="relation">relation</PortTooltip> to the `Team` blueprint.  
    The `Owning teams` column will be visible in tables containing entities of the blueprint.

    ```json showLineNumbers
    {
      "identifier": "packageVersion",
      "title": "Package Version",
      "ownership": {
        "type": "Direct"
      }
      ...
    }
    ```

3. **Inherited**

    Ownership of the blueprint's entities will be inherited from a different related blueprint with `Direct` ownership.  
    The `Owning teams` column will be visible in tables containing entities of the blueprint, but will not be editable.

    The `path` key is a dot-separated path of **relation identifiers** that lead to the desired blueprint.

    ```json showLineNumbers
    {
      "identifier": "packageVersion",
      "title": "Package Version",
      "ownership": {
        "type": "Inherited",
        "path": "relationIdentifier1.relationIdentifier2.relationIdentifier3"
      }
      ...
    }
    ```

You can also change the `title` of the ownership property. The default value is `Owning teams`.

```json showLineNumbers
{
  "identifier": "packageVersion",
  "title": "Package Version",
  "ownership": {
    "type": "Direct",
    "title": "My Custom Ownership Title"
  }
  ...
}
```

---

## Additional capabilities

### Self-service actions

1. When using [Advanced input configurations](/actions-and-automations/create-self-service-experiences/setup-ui-for-action/advanced-form-configurations) in self-service actions, you can use a [jqQuery](/actions-and-automations/create-self-service-experiences/setup-ui-for-action/advanced-form-configurations#writing-your-configuration-schema) for the rule value.

   When using `.user` in this jqQuery, you have access any of the user's properties and/or relations.  
   For example:

   ```json showLineNumbers
   {
     "properties": {
       "namespace": {
         "type": "string",
         "format": "entity",
         "blueprint": "namespace",
         "dataset": {
           "combinator": "and",
           "rules": [
             {
               "property": "$team",
               "operator": "containsAny",
               "value": {
                 "jqQuery": ".user.team" 
               }
             }
           ]
         }
       }
     }
   }
   ```
<br/>
2. When using [dynamic permissions](/actions-and-automations/create-self-service-experiences/set-self-service-actions-rbac/dynamic-permissions) in self-service actions, under the `rules` and/or `conditions` keys, you can access the entire user object, including its properties and relations.

   For example:

   ```json showLineNumbers
   {
     "policy": {
       "queries": {
         "search_entity": {
           "rules": [
             {
               "value": "service",
               "operator": "=",
               "property": "$blueprint"
             },
             {
               "value": "{{ .inputs.name }}",
               "operator": "=",
               "property": "$identifier"
             }
           ],
           "combinator": "and"
         }
       },
       "conditions": [
         // highlight-next-line
         ".user.properties.port_role == \"Manager\""
       ]
     }
   }
   ```

## Service Accounts

Service accounts are non-human users (bots) that can be used for integrating external tools and automating daily tasks using Port. <br/> For example - creating a Slack bot that can execute Port [self service actions](/actions-and-automations/create-self-service-experiences/).

### Create a service account

:::info API-only
Creating service accounts is currently only available via Port's API.
:::

To create a new service account, create a new user entity using the [`Create entity` endpoint](/api-reference/create-an-entity) with the value `Service Account` in the `port_type` property.

Creating a service account has two limitations:

1. The new service account email domain must be `serviceaccounts.getport.io`.  
   For example, `my-new-service-account@serviceaccounts.getport.io`.

2. The `status` property of the new service account must be `Active`.

   <details>
   <summary><b>Full example (click to expand)</b></summary>
   ```bash
   curl -L -X POST 'https://api.getport.io/v1/blueprints/_user/entities' \
   -d '{
       "identifier": "my-new-service-account@serviceaccounts.getport.io",
       "title": "My New Service Account",
       "blueprint": "_user",
       "icon": "User",
       "properties": {
           "port_type": "Service Account",
           "port_role": "Member",
           "status": "Active"
       },
       "relations": {}
   }' \
   -H 'content-type: application/json' \
   -H 'Authorization: <YOUR API TOKEN>'

   ```
   </details>

### Using service accounts

When creating a new service account entity you might notice a new section in the response body named `additional_data`. Inside this section you can find the new service account credentials you can use to authenticate against Port's API.
:::warning Sensitive credentials
These credentials will not appear anywhere else. Make sure you keep it in a secure place and share them only with people in your organization.
:::
To use Port's API with the new service account, you can generate an API access token with the credentials using the [Create Access Token API](/api-reference/create-an-access-token) endpoint.
With the generated token you can use any of the API endpoints as the new service account.

<details>
<summary><b>Full response (click to expand)</b></summary>
```json
{
    "ok": true,
    "entity": {
        "identifier": "my-new-service-account@serviceaccounts.getport.io",
        "title": "My New Service Account",
        "icon": "User",
        "blueprint": "_user",
        "team": [],
        "properties": {
            "port_type": "Service Account",
            "port_role": "Member",
            "status": "Active"
        },
        "relations": {},
        "createdAt": "2024-09-21T08:56:38.062Z",
        "createdBy": "",
        "updatedAt": "2024-09-21T08:56:38.062Z",
        "updatedBy": ""
    },,
    "additionalData": {
        "credentials": {
            "clientId": "<YOUR SERVICE ACCOUNT CLIENT ID>",
            "clientSecret": "<YOUR SERVICE ACCOUNT CLIENT SECRET>"
        }
    }
}
```
</details>

### Service account permissions

Port service accounts are treated like any other users and extend the same RBAC mechanism. This means that you can define roles for them (Member, Admin, etc.) or add them to teams and they will be granted the relevant permissions accordingly.

### Disable a service account

Service accounts can easily be disabled at any time. To disable a service account, update it's `status` property to `Disabled`.
Disabled service accounts can no longer generate new API tokens or use existing ones. Disabled service accounts can be re-enabled at any time by updating the `status` property back to `Active`.
