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
This mechanism also differs in how **ownership** is defined.

Starting **`January 8, 2025`**, this will be the default behavior for all new Port accounts.

Accounts created before this date will continue to use the old behavior, with no changes to their current setup.

Choose the relevant section below to learn more about the behavior that applies to your account.
:::



#### [Classic](/sso-rbac/rbac/classic) (old behavior).
#### [As blueprints](/sso-rbac/rbac/as-blueprints) (new behavior).
