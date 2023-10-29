# Roles, Teams & Ownership

Port's RBAC mechanism makes it possible to assign permissions to specific users and teams, as well as configure custom roles tailored to the needs of the different personas in Port.

## Assigning permissions

In Port, you can assign permissions by using [roles](#roles), [team ownership](../../build-your-software-catalog/set-catalog-rbac/examples.md#team-ownership-examples) and [users](../../build-your-software-catalog/set-catalog-rbac/examples.md#user-examples).

### Roles

There are 3 types of roles. Below are their out-of-the-box permissions:

| Role                         | Description                                                                                                      |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Admin**                    | Perform any operation on the platform                                                                            |
| **Moderator** of a Blueprint | Perform any operation on a specific blueprint and its entities. A user can be a moderator of multiple blueprints |
| **Member**                   | Read-only permissions + permissions to execute actions                                                           |

:::info
The **Moderator** role is automatically created during blueprint creation.
For example, creating the blueprint `Env` will generate a role named `Env-moderator`, which can perform any operation on the `Env` blueprint and its entities.
:::

### Hierarchy

In addition to the permissions designated for each role, permissions are also inherited based on the following hierarchy:

**Admin** > **Moderator** > **Member**

For example, if **Members** are allowed to edit `Cluster` entities, then `Microservices` **Moderators** are also allowed to edit them (**Admins** can edit all entities under all blueprints).

You can view (and edit) each user’s role in the users table:

![Users page](../../../static/img/software-catalog/role-based-access-control/permissions/usersPageRolesHightlight.png)

Refer to the [Users and Teams](#users-and-teams-management) section for more information about the users page

## Users and Teams management

In Port, you can control and manage all your users and teams, in one place.

This allows admins to:

- Invite users to their organization and assign them specific roles and teams.
- Manage teams and their members.
- Promote ownership of assets within the organization (with team assignments).
- Set granular permissions on the portal (permission management).

It will also benefit developers, who could:

- Know what software assets they own and are responsible for.
- View and perform actions on their assets, according to their role and team.

Each user is defined by the following properties:

1. Basic information - image, name, and email.
2. Role - the user’s permissions level (see the [set catalog RBAC](../../build-your-software-catalog/set-catalog-rbac/set-catalog-rbac.md) section);
3. Teams - a `team` is a group of users that owns Entities (see the [team](#team-meta-property) section).

Users and teams can be managed via:

- The [Users & Teams page](#users--teams-page)
- Port's [Terraform provider](#terraform-provider)
- The [Port API](#port-api)

### Users & Teams Page

![Teams and Users page](../../../static/img/software-catalog/role-based-access-control/users-and-teams/usersAndTeams.png)

#### Users tab

In the users tab, you can:

- View all users;
- Invite new users;
- Edit users;
- Delete users;
- Etc.

#### Teams tab

In the teams tab, you can:

- View all teams;
- Create new teams;
- Edit teams;
- Delete teams;
- Etc.

:::tip Using SSO for users and teams
When Single Sign-On (SSO) is enabled, users and teams information (including team membership) is taken directly from your identity provider (IdP).

Since the information is taken from your IdP, some actions can't be performed when SSO is active, such as:

- Create teams;
- Edit team membership;
- Delete teams.

If you try to perform one of the disabled actions, the interface will display an explanation:

![Managed by SSO notice](../../../static/img/software-catalog/role-based-access-control/users-and-teams/createTeamNoticeWithSSO.png)
:::

### Terraform provider

You can perform the aforementioned actions via the [Terraform provider](https://registry.terraform.io/providers/port-labs/port-labs/latest).  
Here is a basic example of a `main.tf` file that defines a team with 3 users:

```bash showLineNumbers
resource "port_team" "example" {
  name        = "example"
  description = "example"
  users = [
    "user1@test.com",
    "user2@test.com",
    "user3@test.com",
  ]
}
```

You can browse the `team` schema [here](https://registry.terraform.io/providers/port-labs/port-labs/latest/docs/resources/port_team).

### Port API

The API allows you to manage [teams](https://api.getport.io/static/index.html#/Teams) and [users](https://api.getport.io/static/index.html#/Users).

### `Team` meta property

Each entity has a [meta-property](../../build-your-software-catalog/define-your-data-model/setup-blueprint/properties/meta-properties.md) called `team`, that allows you to set which team owns the entity. As an admin, you can also set blueprint permissions according to this field.

Entity JSON example with `team` field:

```json showLineNumbers
{
  "identifier": "unique-ID",
  "title": "Entity Title",
  "team": [],
  "blueprint": "testBlueprint",
  "properties": {
    "prop1": "value"
  },
  "relations": {}
}
```

Team dropdown selector in the entity create/edit page:

![Team property](../../../static/img/software-catalog/role-based-access-control/users-and-teams/teamPropertyMarkedInUIForm.png)

| Field | Type | Description                                            | Default      |
| ----- | ---- | ------------------------------------------------------ | ------------ |
| team  | List | System field that defines the team that owns an Entity | `"team": []` |

- We support the manual creation of teams on Port, as well as integrating with identity providers, such as [Okta](../sso-providers/okta.md) and [AzureAD](../sso-providers/azure-ad.md), to import existing teams.
- When users log in to Port, their groups will be pulled automatically from their identity provider, and the allowed team values will be updated accordingly.
- It is also possible to configure [team inheritance](../../build-your-software-catalog/set-catalog-rbac/examples.md#team-inheritance) and utilize relations to auto-populate the `team` key of entities.

:::info
Okta and AzureAD integrations are only available after configuring SSO from the relevant identity provider, refer to the [Single Sign-On (SSO)](../sso-providers/) section for more details
:::
