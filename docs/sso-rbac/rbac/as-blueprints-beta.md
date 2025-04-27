---
sidebar_position: 2
---

import PortTooltip from "/src/components/tooltip/tooltip.jsx"
import Tabs from '@theme/Tabs'
import TabItem from '@theme/TabItem'

# As blueprints (beta version - deprecated)

:::warning Migration required
Starting **January 14, 2025**, a new default behavior for managing users & teams is applied to all new Port accounts.

If you created your account **before** this date, you will need to migrate to the new behavior using this [migration guide](/sso-rbac/rbac/migration) by **July 1, 2025**.

If you enabled the `"Users & teams as blueprints beta feature"` in your organization and do not wish to migrate yet, continue reading this page, which describes the **beta version behavior**.  
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

### The `team` meta-property

Each entity has a [meta-property](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/meta-properties.md) named `team`, that is used to define the team/s that own the entity.  
As an `admin`, you can also set blueprint permissions according to this field.

The `team` meta-property is an array of the owning teams' names.  
Here is an example entity:

```json showLineNumbers
{
  "identifier": "pod-1",
  "title": "Awesome pod",
  "team": ["Awesome team", "The best team"],
  "blueprint": "Pod",
  "properties": {
    ...
  },
  "relations": {}
}
```

#### Reference an entity's team

In places where you need to reference an entity's team, use `$team` to reference the meta-property.  

**Note** that any search query that includes `$team` will use the team's **identifier** instead of its **name**.  
For example:

```json showLineNumbers
{
  "operator": "containsAny",
  "property": "$team",
   "value": ["team-identifier"] // instead of ["team-name"]
}
```

This change will affect all search queries that include the `$team` property, in any component (widget filters, entity search, dynamic permissions, etc.).  
Note that the [getUserTeams()](https://docs.port.io/search-and-query/#dynamic-properties) function will automatically return the team's identifier, so it can be used as is.

### Team inheritance

To simplify the setup of ownership, Port allows you to utilize <PortTooltip id="relation">relations</PortTooltip> to automatically retrieve teams from a parent entity.  

You can configure team inheritance on a blueprint, so that every entity created from this blueprint will inherit the parent entity's team.

In the example below, we can configure a team for every `service`: 

<img src='/img/software-catalog/role-based-access-control/overview/teaminheritancegraph.png' width='100%' border='1px' /> 
<br/><br/>

When configuring team inheritance in `Pull requests`, every pull request will inherit its parent Port team. 

<img src='/img/software-catalog/role-based-access-control/overview/teaminheritance.png' width='50%' border='1px' /> 

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
                 "jqQuery": "[.user.team]"
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
         ".user.properties.role == \"Manager\""
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
   ```

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
