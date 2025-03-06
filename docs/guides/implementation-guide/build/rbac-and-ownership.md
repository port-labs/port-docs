---
sidebar_position: 2
---

# Set up RBAC and ownership

## Define roles and permissions

Port allows you to define roles and permissions to users, in order to control who can view, edit, and delete components in your portal.

- Assign [roles](/sso-rbac/rbac/) to users in your organization, defining their permissions when operating in the portal.
  
- Define your software catalog's [RBAC](/build-your-software-catalog/set-catalog-rbac/). This allows you to define CRUD permissions for each blueprint in your catalog.

- The final type of RBAC is [self-service actions permissions](/actions-and-automations/create-self-service-experiences/set-self-service-actions-rbac/). Port allows you to define which users can execute and/or approve actions in your portal.  
Since we have not yet set up any self-service actions, this step should be done in the next section.

## Define ownership

Ownership is a way to assign responsibility for a specific [**entity**](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/#entities) in your software catalog.  
Each entity can be assigned to one or more **teams** of users.

Ownership can also be used to enforce permissions, as it allows you to make sure developers can only perform actions or view entities that are **owned by their team**.

See the [documentation](https://docs.port.io/sso-rbac/rbac-overview/#configuring-team-ownership) for more information.

## Next step - set up scorecards & dashboards

Once you have set up RBAC and ownership, proceed to the [next step](/guides/implementation-guide/build/scorecards-and-dashboards) to define scorecards and create dashboards in your portal.