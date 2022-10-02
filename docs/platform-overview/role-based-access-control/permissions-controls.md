---
sidebar_position: 3
---

# Permission controls

In Port, you can set granular permissions to **Blueprints** and **Actions**, according to users and teams.

**How is it beneficial for your organization?**

Admins will have control over their Software Catalog in Port, by setting **granular permissions** for every component. In addition, user experience will improve, by displaying and granting control over specific Entities to their designated users, thus preventing information overload.

In Port, you can enforce permissions by [Roles](#roles), and/or by [Team Ownership](#setting-permissions-by-team-ownership).

## Roles

There are 3 types of roles. Below are their out-of-the-box permissions:

| Role                     | Description                                                                                                  |
| ------------------------ | ------------------------------------------------------------------------------------------------------------ |
| Admin                    | Perform any action on the platform                                                                        |
| Moderator of a Blueprint | Perform any action on a specific Blueprint and it's Entities. A user can be moderator of several Blueprints |
| Member                   | Read-only permissions, And permissions to execute Actions                                                    |

As mentioned above, these permissions are given by default when you first set up your organization, based on the behaviours we learned to be best-practices.
However, as part of Port's [builder-approach](../../faq/faq.md#whats-a-builder-based-developer-portal), we let you decide and control the permissions you want to grant, in a way that fits your organization best. We'll explore those options down below and in the tutorials section.

:::info
In addition to the permissions designated for each role, permissions are also inherited from the role below them:

Admin > Moderator > Member

For example, if members are allowed to edit `Cluster` Entities, then `Microservices` moderators are also allowed to edit them (admins can edit all Entities under all Blueprints).
:::

You can view (and edit) each user’s role in the users table (via the main menu):

![Users page](../../../static/img/platform-overview/role-based-access-control/permissions/usersPageRolesHightlight.png)

:::info
Refer to the [Users and Teams](./users-and-teams-management) section for more information about the users page
:::

## Working with Permissions

In this section we'll show you a few examples of ways to use permissions in your organization, and how to apply them.

### Use-case examples

The following configurations, among others, are available when using permissions management:

1. Entities can be made immutable/partially immutable (can only create/delete/modify) for specific users/roles. For example:
   a. "Deployment" Entities are immutable for all roles, and "Cluster" Entities are editable only by the moderators.
   b. Members can create a new "Microservice" Entity, but are not permitted to delete a "Microservice" Entity.
2. Each Entity property/relation can be immutable separately for specific users/roles. For example, the `repository_link` property can be immutable for all roles (except Admin).
3. Allow specific users/roles to only modify Entities [owned by their team](#setting-permissions-by-team-ownership). For example, members can edit only "Microservices" that belong to their team.
4. Actions execution grants can be given to specific users or roles. For example, you can allow every Member to create a new "Deployment" Entity but only "Deployment" moderators can perform a day-2 Action of "adding resources".

### Setting permissions for a Blueprint (and its Actions)

To set permissions for a Blueprint, click on the permissions icon of the desired Blueprint in the Blueprints page:

![Permissions button for blueprint](../../../static/img/platform-overview/role-based-access-control/permissions/permissionsOfBlueprint.png)

This will open the following window:

![Permissions Window](../../../static/img/platform-overview/role-based-access-control/permissions/permissionsModal.png)

As you can see, every operation that can be performed on the Blueprint or its Entities is listed in the JSON and can be controlled.

For example, If we want to enable a specific user to update the Blueprint, you can change the JSON as follows:

```json showLineNumbers
{
  "update": {
    "roles": ["Env-moderator"],
    "users": ["some-user@myorg.com"]
  }
}
```

To enable Members to create Entities of "Env" Blueprint:

```json showLineNumbers
{
  "entities": {
    "create": {
      "roles": ["Env-moderator", "Member"],
      "users": [],
      "ownedByTeam": false
    }
  }
}
```

To allow only Admins to change the property `slackChannelUrl`, remove the Moderator role:

```json showLineNumbers
{
  "entities": {
    "updateProperties": {
      "slackChannelUrl": {
        "roles": [],
        "users": [],
        "ownedByTeam": false
      }
    }
  }
}
```

By default, "Member" users can execute every new Action of the Blueprint. If you want, you can change it, for example to only allow Moderators (and Admins) to execute the Action "clone_env":

```json showLineNumbers diff
{
  "actions": {
    "clone_env": {
      "execute": {
        "roles": ["Env-moderator"], // changed from ["Env-moderator", "Member"]
        "users": [],
        "ownedByTeam": false
      }
    }
  }
}
```

### Setting permissions by team ownership

You will notice that some operations have the `ownedByTeam` flag. This allows you to set permissions by team ownership, rather than by Roles or direct assignment.
For example, the following JSON will allow **every user**, regardless of their roles, to perform the Action "delete_env" on "Env" Entities that belong to a team they are part of (entities that have the [`team` property](../port-components/entity#teams-and-ownership) set):

```json showLineNumbers
{
  "actions": {
    "delete_env": {
      "execute": {
        "roles": ["Env-moderator"],
        "users": [],
        "ownedByTeam": true // changed from false
      }
    }
  }
}
```

:::info
The `team` field is not mandatory! You can give a user access to create "Env", regardless of their team.
:::

:::note
Okta and Azure integrations are available only after integrating the relevant identity provider.

For more details see [Single Sign-On (SSO)](../../single-sign-on/)
:::

## UI behavior

Configuring user permissions is reflected in Port's UI. The UI also includes indication messages when trying to perform actions. For example:

The `register` and `unregister` buttons will be disabled in the UI, in accordance with the Blueprint permissions (unauthorized users/groups will not be able to register or unregister entities).

![Create button disabled without permissions](../../../static/img/platform-overview/role-based-access-control/permissions/memberNoCreatePermission.png)

The `edit property` button will be disabled according to the permissions:

![Edit property disabled without permissions](../../../static/img/platform-overview/role-based-access-control/permissions/memberNoEditPermission.png)

Immutable properties (restricted properties) will be hidden from users when modifying Entities.

## API

Please see the [Blueprint Permissions](../../api-reference/#tag/Blueprints/paths/~1v1~1blueprints~1%7Bblueprint_identifier%7D~1permissions) and [Actions Permissions](../../api-reference/#tag/Actions/paths/~1v1~1blueprints~1%7Bblueprint_identifier%7D~1actions~1%7Baction_identifier%7D~1permissions/get) sections in our [API reference](../../api-reference/)
