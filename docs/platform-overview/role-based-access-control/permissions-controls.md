---
sidebar_position: 3
---

# Permission controls

In Port, you can set granular permissions to any component, according to users and groups.

**Why is it beneficial for your organization?**

Admins will have control over their Software Catalog in Port, by setting **granular permissions** for every component. In addition, user experience will improve, by showing and giving the users individual control only over Entities that are relevant to them, thus preventing information overload.

## Roles

In Port, there are 3 types of roles:

| Role      | Description                                                                                                                                                |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Admin     | Perform any action on the platform (create Blueprints, Relations and Entities, modify and delete them). <br></br> Create users and teams, and modify them. |
| Moderator | Perform any action on specific Blueprints (edit properties, Relations, Entities, etc).<br></br> A user can be a moderator of several Blueprints.           |
| Member    | Can view and perform actions on Entities (create, modify, delete) according to the Admin’s permissions.                                                    |

:::info
In addition to the permissions specific to each role, they also inherit the permissions of the role below them:

Admin > Moderator > Member

For example, if members are allowed to edit `cluster` Entities, then `cluster` moderators are also allowed to edit them (admins can edit all Entities under all Blueprints).
:::

You can view each user’s role in the users table (via the main menu):

![Users page](../../../static/img/platform-overview/role-based-access-control/permissions/usersPage.png)

:::info
Refer to the [Teams and users](./teams-and-users-management) section for more information about the users page
:::

## Working with Permissions

:::caution
At the moment, please contact us to assign roles for your users on Port, and to set Blueprint permissions.

:::

### Permissions use-case examples

Using permissions management, the following configurations, among others, are available:

1. Blueprints can be made immutable/partially immutable (can only create/delete/modify) for specific users/roles.
   1. Example - Deployments are immutable for all roles, and Clusters are editable only by the moderators;
   2. Example - Members can create a new microservice but are not permitted to delete a microservice.
2. Each blueprint property and/or Relation can be immutable separately for specific users/roles.
   1. Example - The `repository_link` property can be immutable for all roles
3. Allow specific users/roles to only modify Entities owned by their team.
   1. Example - members can edit only microservices that belong to their team.

### UI behavior

Configuring user permissions is reflected in Port's UI. The UI also includes indication messages when trying to perform actions. For example:

The `register` and `unregister` buttons will be disabled in the UI, according to the Blueprint permissions (unauthorized users/groups will not be able to register or unregister entities).

![Create button disabled without permissions](../../../static/img/platform-overview/role-based-access-control/permissions/memberNoCreatePermission.png)

The `edit property` button will be disabled according to the permissions:

![Edit property disabled without permissions](../../../static/img/platform-overview/role-based-access-control/permissions/memberNoEditPermission.png)

Immutable properties (restricted properties) will be hidden from users when modifying Entities.

## Teams and permissions

Using the `team` field, you can give team permissions for a specific Blueprint.

This means that performing actions (create, modify, delete) on Entities will be available to all users of the specified team, in addition to permissions provided by specific roles.

:::info
The `team` field is not mandatory! You can give a user access to create microservices, regardless of their team.
:::

We support manually creating your team list in Port, as well as integrating with identity providers, such as Okta and AzureAD.

:::note
Okta and Azure integrations are available only after integrating the relevant identity provider.

For more details see [Single Sign-On (SSO)](../../single-sign-on/)
:::

## API

Please see the [Users](../../api-reference/#tag/Users), [Apps](../../api-reference/#tag/Apps) and [Roles](../../api-reference/#tag/Roles) sections in our [API reference](../../api-reference/)

:::info
For now, any permission change is done via API. Soon, we will provide an accessible UI for complete permission management process 🚀

Until then, we will be happy to assist with any permissions adjustments you want to perform in your environment.

:::
