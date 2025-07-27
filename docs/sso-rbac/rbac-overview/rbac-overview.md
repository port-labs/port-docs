# Port RBAC capabilities overview

This page provides a comprehensive summary of all of Port's RBAC capabilities, and links to their associated documentation pages. They are grouped into 3 key topics:

[1 - Catalog RBAC & Ownership](#catalog-rbac--ownership)

[2 - RBAC for Self Service Actions](#rbac-for-self-service-actions)

[3 - RBAC for operating the Port platform](#rbac-for-operating-the-port-platform)


## Catalog RBAC & Ownership

### Hide & show catalog pages dynamically

With Port, you can offer a personalized experience for the various personas of your organization. 

For instance, you can create:

- A unique Costs dashboard only visible to team leaders.
- A deep-dive view of services for developers.
- A security dashboard & catalog view for security teams.

<img src='/img/software-catalog/role-based-access-control/overview/personalizedcatalog.png' width='80%' border='1px' />
<br/><br/>

To achieve this, you can assign user or team ownership permissions to the various personas logging in to Port.  
To configure who can see which pages, refer to the [Page Permissions](/customize-pages-dashboards-and-plugins/page/page-permissions) page. 

### Configuring team ownership

Port allows you to assign ownership of specific entities to teams in your organization, enabling personalized views such as "**show me my team’s services**" or "**my pull requests**".

User and Teams are blueprints, enabling to create creations and inherit ownership. 
<img src='/img/software-catalog/role-based-access-control/overview/user-and-teams.png' width='80%' border='1px' />

Ownership concept consists in creating and inherating ownership to the ``Team`` blueprint, either through a direct relation or through ``Owning Team`` transitive relation 

For more details about **ownership** in Port, see the [relevant documentation](/sso-rbac/rbac/as-blueprints#overview).

### Dynamic team filtering

Once the team ownership is properly configured we can create dynamic filtering, and show users personalized views such as "`my open Pull Requests`" or "`my team’s services`". We can also lock views to prevent a user from seeing services that are outside of his/her team’s scope. 

#### My Team filter & Lock page view

By using the `My Teams filter` you will only see entities that belong to one of your teams. This means you will only see entities from teams that you are a member of.

<img src='/img/software-catalog/role-based-access-control/overview/myteamfilter.png' width='100%' border='1px' /> 
<br/><br/>

You may "Save this view" to permanently keep the filters.  
For more details about view customization, see the [customization documentation](/customize-pages-dashboards-and-plugins/page/catalog-page/#my-teams-filter).

#### Filter a catalog page to the user's team

Another way to personalize a catalog page view is to use [initial filters](/customize-pages-dashboards-and-plugins/page/catalog-page/#initial-filters). These allow you to create advanced and dynamic filters, invisible to "regular" users.

With initial filters you can create views such as:
- Filter all entities owned by `My Team` (or more dynamic queries).
- Filter entities based on dates (e.g. PRs created in the last 90 days).

Leveraging teams as blueprints, we can create advanced business logics, such as services belonging to a specific product: 

<img src='/img/software-catalog/role-based-access-control/overview/businesslogic.png' width='100%' border='1px' /> 
<br/><br/>

To achieve this, you can use the `Owning Teams` value to `My Teams`, or use the `relatedTo` dynamic filters, for example:

<img src='/img/software-catalog/role-based-access-control/overview/initial-filters.png' width='80%' border='1px' />
<br/><br/>

Initial filters offer an easy way to **lock a Catalog Page view dynamically for the logged in user's team**

#### Dynamic filters for dashboard widgets

Advanced filters and dynamic filters are also available for [dashboard widgets](/customize-pages-dashboards-and-plugins/dashboards/) in your catalog or homepage, using the same logic as described in the **Filters** or **Initial Filters** section above.

You can create widgets with data dynamically based on the logged in user’s identity or team's ownserhip.

### Granular entity permission control

It is possible to assign more granular permissions on **entities** to prevent users from reading or editing certain properties or relations. 
This is an advanced feature and is only recommended in large Enterprise with complex RBAC use cases. In most cases dynamic filtering would be a simpler and effective way to achieve the same outcome. 


[Granular Entity RBAC](//build-your-software-catalog/set-catalog-rbac/#set-granular-access-controls-to-catalog-data)



## RBAC for Self Service Actions

### Self Service permissions

When creating/editing self-service actions, you can set permissions for who can trigger or approve an action.

<img src='/img/software-catalog/role-based-access-control/overview/ssapermissions.png' width='80%' border='1px' /> 
<br/><br/>

For more details about action permissions, see the [relevant documentation](/actions-and-automations/create-self-service-experiences/set-self-service-actions-rbac/#configure-permissions-for-actions).

### Dynamic permissions for Self Service actions

Port allows setting `dynamic permissions` for executing and/or approving execution of self-service actions, based on any properties/relations of an action's corresponding blueprint.

Potential use-cases:

- Ensure that action executions requested by a team member can only be approved by his/her direct manager.
- Perform validations/manipulations on inputs that depend on data from related entities.
- Ensure that only those who are on-call can perform rollbacks of a service with issues.

Dynamic permissions for RBAC can run any query on the Port data model.  

For more details about dynamic permissions, see the [relevant documentation](/actions-and-automations/create-self-service-experiences/set-self-service-actions-rbac/dynamic-permissions/).

## RBAC for operating the Port platform

### Port administration roles

Port supports 3 role types:

| Role                         | Description                                                                                                      |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Admin**                    | Can perform any operation on the platform.                                                                            |
| **Moderator** of a Blueprint | Can perform any operation on a specific blueprint and its entities. A user can be a moderator of multiple blueprints. |
| **Member**                   | Has read-only permissions + permissions to execute actions.                                                           |


:::info Configurable permissions
The roles above have configurable permissions that are described in the following section. It is possible to have multiple moderator roles, allowing highly granular permission management across the developer portal.
:::

In addition to the permissions designated for each role, permissions are also inherited based on the following hierarchy: **Admin** > **Moderator** > **Member**.

For more details about Port roles, see the [relevant documentation](/sso-rbac/rbac/).

### Blueprint permissions

Blueprint permissions allow a granular configuration of the various roles: admin, member or blueprint collaborator. 
You can decide, for example, that a member has edit permissions for a specific Blueprint but not for another.  

For more details about Blueprint permissions, see the [relevant documentation](/build-your-software-catalog/set-catalog-rbac/examples/#use-cases-).
