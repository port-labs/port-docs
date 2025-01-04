import PortTooltip from "/src/components/tooltip/tooltip.jsx"
import BetaFeatureNotice from "/docs/generalTemplates/_beta_feature_notice.md"
import PortApiRegion from "/docs/generalTemplates/_port_api_available_regions.md"
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# User & team management

Port offers a robust Role-Based Access Control (RBAC) mechanism that allows you to control and manage all your users and teams in one place.  

This makes it easy to assign **roles** and **permissions** to specific users and teams, as well as define **ownership** of assets within your organization.

This allows **admins** to:

- Invite users to their organization and assign them specific roles and teams.
- Manage teams and their members.
- Promote ownership of assets within the organization (with team assignments).
- Set granular permissions on the portal (permission management).

This also benefits **developers**, who can:

- Know what software assets they own and are responsible for.
- View and perform actions on their assets, according to their role and teams.

## Configuration methods

There are several ways to manage users and teams in Port:

- Via the [Users & Teams page](https://app.getport.io/settings/users) in your portal.  
  This page allows you to view/delete/invite users, assign roles, and manage teams.
- Via Port's [API](https://docs.getport.io/api-reference/get-all-users-in-your-organization).
- By integrating with your [identity provider (IdP)](/sso-rbac/sso-providers/) to sync users and teams from your organization.

## Roles & permissions

Users in Port have one of 3 types of roles:

| Role                         | Description |
| ---------------------------- |--------------------------------------- |
| **Admin**                    | Can perform any operation in the portal |
| **Moderator** of a blueprint | Can perform any operation on a specific blueprint and its entities. A user can be a moderator of multiple blueprints |
| **Member** | Has raad-only permissions + permissions to execute self-service actions |

### Software catalog permissions

These roles can be used to define specific permissions for assets in your software catalog.  

For example, you can define that all `Members` can create new entities from a specific blueprint, while only `Moderators` can edit them.  
For more information and examples, see the [catalog RBAC](/build-your-software-catalog/set-catalog-rbac/) section.

## Ownership & user management

:::warning New default behavior
A new mechanism to manage users and teams has been released, using dedicated blueprints.  
Starting **January 6, 2025**, this will be the default behavior for all new Port accounts.

Accounts created before this date will continue to use the old behavior, with no changes to their current setup.

Choose the relevant section below to learn more about the behavior that applies to your account.
:::

#### [Classic](/) (old behavior).
#### [As blueprints](./as-blueprints.md) (new behavior).

---

## Manage users and teams

:::warning New default behavior
A new way of managing users and teams has been released, using dedicated blueprints.  
Starting **January 6, 2024**, this will be the default behavior for all new Port accounts.

Accounts created before this date will continue to use the old behavior, with no changes to their current setup.

Choose the relevant section below to learn more about the behavior that applies to your account.
:::

<Tabs groupId="behavior" queryString>

<TabItem value="old" label="Classic (old behavior)">



</TabItem>

<TabItem value="new" label="As blueprints (new behavior)">



</TabItem>

</Tabs>


Each user is defined by the following properties:

1. Basic information - image, name, and email address.
2. [Role](/sso-rbac/rbac/#roles) - the user’s permissions level.
3. [Teams](#team-meta-property) - a `team` is a group of users that owns Entities.

:::tip Using SSO for users and teams

When Single Sign-On (SSO) is enabled, users and teams information (including team membership) is taken directly from your identity provider (IdP).

Since these teams are synced from your IdP the following actions cannot be performed on them:

- Edit SSO team membership.
- Delete SSO teams.

:::



### `Team` meta property

Each entity has a [meta-property](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/meta-properties.md) called `team`, that allows you to set which team owns the entity. As an admin, you can also set blueprint permissions according to this field.

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

<img src="/img/software-catalog/role-based-access-control/users-and-teams/teamPropertyMarkedInUIForm.png" width="70%" border='1px' />
<br/><br/>

| Field | Type | Description                                            | Default      |
| ----- | ---- | ------------------------------------------------------ | ------------ |
| team  | List | System field that defines the team that owns an Entity | `"team": []` |

- We support the manual creation of teams on Port, as well as integrating with identity providers, such as [Okta](/sso-rbac/sso-providers/oidc/okta.md) and [AzureAD](/sso-rbac/sso-providers/oidc/azure-ad.md), to import existing teams.
- When users log in to Port, their groups will be pulled automatically from their identity provider, and the allowed team values will be updated accordingly.
- It is also possible to configure [team inheritance](/build-your-software-catalog/set-catalog-rbac/examples.md#team-inheritance) and utilize relations to auto-populate the `team` key of entities.

:::info
Okta and AzureAD integrations are only available after configuring SSO from the relevant identity provider, refer to the [Single Sign-On (SSO)](../sso-providers/) section for more details
:::
