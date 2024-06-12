# Port RBAC capabilities overview

Port has extensive RBAC Capabilities. The purpose of this page is to provide a comprehensive summary of all Port RBAC capabilities and link to their associated documentation, to help you find the ones that are best for you. They are grouped 3 key topics:

[1- Catalog RBAC & Ownership](#catalog-rbac--ownership)

[2- RBAC for Self Service Actions](#rbac-for-self-service-actions)

[3- RBAC for operating Port platform](#rbac-for-operating-the-port-platform)


## Catalog RBAC & Ownership



### Hide & show catalog pages dynamically
With Port’s Internal Developer Portal, you can offer a personalized experience for the various personas of your organization. 

For instance, you may offer the following personalized experiences:

- A unique Costs dashboard only visible to team leaders.
- Deep dive service view for developers.
- Security dashboard & catalog view for the security teams.

![Personalized Catalog](/img/software-catalog/role-based-access-control/overview/personalizedcatalog.png)


To achieve this you can assign user or team ownership permissions to the various personas login in. To configure who can see what pages, you can refer to the following page: [Page Permissions](/customize-pages-dashboards-and-plugins/page/page-permissions)


### Configuring team ownership

Port offers various features to offer a “**show me my team’s services**” or “**my Pull requests**” view.  

#### team meta property
Every entity at Port has a meta property called `$team` or `Port Team`. The `$team` property as well as other meta properties are documented [here](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/meta-properties).

#### Port Team and Identity provider

Port teams are automatically fetched from your identity provider when [connecting to SSO](/sso-rbac/sso-providers/). So the Port Team options will be coming from the Port Teams available under **Users and teams** settings.


![Port Users and Teams settings](/img/software-catalog/role-based-access-control/overview/portteam.png)
 

#### Team inheritance

To simplify the setup of Ownership, Port supports team Inheritance. Team inheritance lets you to utilize relations to automatically retrieve Port Teams from a parent entity.

In the example below, I may configure a Port Team for every service: 

![Team inheritance graph](/img/software-catalog/role-based-access-control/overview/teaminheritancegraph.png)

When configuring Team Inheritance in Pull Requests every Pull Request will inherit its parent Port Team. 

![Team inheritance ](/img/software-catalog/role-based-access-control/overview/teaminheritance.png)

The documentation page describing Team inheritance can be found [here](/build-your-software-catalog/set-catalog-rbac/examples/#team-inheritance)




### Dynamic team filtering

Once the team ownership is properly configured we can create dynamic filtering, and provide a dynamic experience to show a user “`my pending Pull Requests`” or “`my team’s service`”, and lock views to prevent a user from seeing services that are outside of his team’s scope. 

#### My Team filter & Lock page view
By using the `My Teams filter` you will only see entities that belong to one of your teams. This means you will only see entities from teams that you are a member of.
![My Team filter](/img/software-catalog/role-based-access-control/overview/teamfilter.png)

You may “Save this view” to lock the page. Further description on customizing [this view can be found here](/customize-pages-dashboards-and-plugins/page/catalog-page/#my-teams-filter). 


#### Initial filters to filter out teams or advanced queries

Another option to lock a view is to create [initial filters](/customize-pages-dashboards-and-plugins/page/catalog-page/#initial-filters). Initial filters will allow you to create advanced and dynamic filters, invisible to regular users.

With initial filters you can create views such as:
- Filter all entities owned by My Team or my Business Unit or Department
- Filter out based on dates (PR created in the last 90 days)

Leveraging Team as Blueprint we can create advanced business logics, such as Product A’s services: 

![My Team filter](/img/software-catalog/role-based-access-control/overview/businesslogic.png)

To achieve this you may use related to dynamic filters available here, with syntax such as:
```json showLineNumbers
{
  "operator": "relatedTo",
  "blueprint": "githubTeam",
  "value": ["{{getUserTeams()}}"]
}
```



And you may use other dynamic properties and advanced queries: 
- [Dynamic properties](/search-and-query/#dynamic-properties)
- [Advanced search queries](/search-and-query/)


#### Widget dynamic filters

Advanced filters and dynamic filters are also available for [widgets created in the dashboard](/customize-pages-dashboards-and-plugins/dashboards/) or home page, and the same logic as described in the Initial Filters section applies here.

You can create views based on the logged in user’s properties (email, team) to create a personal view


## RBAC for Self Service Actions

### Self Service permissions

When creating/editing self-service actions, you can set permissions for who can trigger or approve an action.

![Self Service Actions permissions](/img/software-catalog/role-based-access-control/overview/ssapermissions.png)

The description on how to configure permissions to run or approve an action [is provided here](/create-self-service-experiences/set-self-service-actions-rbac/#configure-permissions-for-actions)


### Dynamic permissions for Self Service actions

Port allows setting `dynamic permissions` for executing and/or approving execution of self-service actions, based on any properties/relations of an action's corresponding blueprint.

Potential use-cases:

- Ensure that action executions requested by a team member can only be approved by his/her direct manager.
- Perform validations/manipulations on inputs that depend on data from related entities.
- Ensure that only those who are on-call can perform rollbacks of a service with issues.

Dynamic permissions for RBAC can run any query on the Port data model. 
[Full documentation and examples of Dynamic Permissions is provided here](/create-self-service-experiences/set-self-service-actions-rbac/dynamic-permissions/).


## RBAC for operating Port platform

### Port administration roles

Port supports 3 roles types to administrate Port: `member`, `collaborator` and `administrator`


| Role                         | Description                                                                                                      |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Admin**                    | Perform any operation on the platform                                                                            |
| **Moderator** of a Blueprint | Perform any operation on a specific blueprint and its entities. A user can be a moderator of multiple blueprints |
| **Member**                   | Read-only permissions + permissions to execute actions                                                           |


:::info
The roles above have configurable permissions that are described in the following section. Also there can be multiple moderator roles, leading to a highly granular permission management of Port.
:::


In addition to the permissions designated for each role, permissions are also inherited based on the following hierarchy: **Admin** > **Moderator** > **Member**


You can find the [full documentation around Port roles here](/sso-rbac/rbac/)


### Blueprint permissions
Also Blueprint permissions allows a granular configuration of the various roles: admin, member or blueprint collaborator. 
You may for instance decide that a member has edit permissions of a specific Blueprint but not another. 
You can find detailed information about [Blueprint permissions configuration here](/build-your-software-catalog/set-catalog-rbac/examples/#use-cases-).
