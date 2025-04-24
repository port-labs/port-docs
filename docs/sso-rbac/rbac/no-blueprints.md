---
sidebar_position: 3
---

import PortTooltip from "/src/components/tooltip/tooltip.jsx"
import Tabs from '@theme/Tabs'
import TabItem from '@theme/TabItem'

# No blueprints (old - deprecated)

:::warning Migration required
Starting **January 14, 2025**, a new default behavior for managing users & teams is applied to all new Port accounts.

If you created your account **before** this date, you will need to migrate to the new behavior using this [migration guide](/sso-rbac/rbac/migration) by **July 1, 2025**.

If you do not wish to migrate yet, continue reading this page, which describes the **old behavior**.  
:::

## Overview

Users and teams are managed in the dedicated [Users and teams page](https://app.getport.io/settings/users) in your portal.

In this page you can:

- View all users and teams in your organization.
- Invite new users to your organization and create new teams.
- Assign roles to users.
- Edit existing users and teams.
- Delete existing users and teams.

## Structure

Users and teams are made up of the following properties:

<Tabs groupId="user-and-team-blueprint-structure" queryString values={[
{label: "User", value: "user"},
{label: "Team", value: "team"},
]}>

<TabItem value="user">

Each user is defined by the following properties:

- Name and image.
- Email address.
- [Role](/sso-rbac/rbac/#roles).
- Teams - a list of teams this user is a member of.
- Status - the user's [status](#user-status).

</TabItem>

<TabItem value="team">
- Name.
- Description.
- Users - a list of users belonging to this team.
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

Admins can access the [Users](https://app.getport.io/settings/users) page to view and manage all of the users in the organization.  
Here admins can also change a user's status, and invite new users.

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
For example, in a search query:

```json showLineNumbers
{
  "operator": "containsAny",
  "property": "$team",
  "value": ["Team name"]
}
```

### Team inheritance

To simplify the setup of ownership, Port allows you to utilize <PortTooltip id="relation">relations</PortTooltip> to automatically retrieve teams from a parent entity.  

You can configure team inheritance on a blueprint, so that every entity created from this blueprint will inherit the parent entity's team.

In the example below, we can configure a team for every `service`: 

<img src='/img/software-catalog/role-based-access-control/overview/teaminheritancegraph.png' width='100%' border='1px' /> 
<br/><br/>

When configuring team inheritance in `Pull requests`, every pull request will inherit its parent Port team. 

<img src='/img/software-catalog/role-based-access-control/overview/teaminheritance.png' width='50%' border='1px' /> 
<br/><br/>

