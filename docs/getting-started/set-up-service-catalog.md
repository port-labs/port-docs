---
sidebar_position: 3
sidebar_label: "2. Set up service catalog"
---

import PortTooltip from "/src/components/tooltip/tooltip.jsx"

# Set up your service catalog

Now that your tools are connected to your portal, you can start creating your service catalog and add some users and teams to your organization.

This page will explain some basic concepts and describe the process of onboarding assets to your portal.

<!-- maybe split into "service catalog" and "users & teams" -->

## Service catalog

Every Port account comes with a set of default <PortTooltip id="blueprint">blueprints</PortTooltip>.  
Three of these blueprints are designed to help you create a rich and dynamic service catalog:

1. [`_service`](/getting-started/default-components#-service)
2. [`_workload`](/getting-started/default-components#-workload)
3. [`_environment`](/getting-started/default-components#-environment)

To manually onboard `services`, `workloads` and `environments`, go to the relevant page in the [Service catalog](https://app.getport.io/services) page, and click on the `+` button in the top right corner (for example, `+ Service` in the `Services` page).

This will create entities, with rich context from the tools you've integrated.  

*For example:*  
Say you've integrated `GitHub`, `Jira`, and `Pagerduty`.  
When onboarding a service via the `+ Service` button, you will be able to select the relevant `GitHub repository`, `Jira project`, and `Pagerduty service` related to that service.  

This will create a single `service` entity, with relations to the relevant entities you selected, serving as a single component to track & manage the service.  

## Users & teams

Two other default blueprints are designed to help you manage users, teams, and ownership in your portal:

1. [`_user`](/getting-started/default-components#-user)
2. [`_team`](/getting-started/default-components#-team)

To manually onboard users and teams, go to the relvant page in the [Organization catalog](https://app.getport.io/users), and click on the `+` button in the top right corner (for example, `+ User` in the `Users` page).

This will create entities, with rich context from the tools you've integrated.  

#### Register your user

First, in the [users](https://app.getport.io/users) page, choose `Register your user`.  
This will create a `user` entity with context of your user accounts in other tools you've integrated.  

Now that you've registered your user, some components in your portal will be populated with data.  

For example, the table named `Track your open pull requests` in the [Plan my day](https://app.getport.io/plan_my_day) page is configured to display `pull request` entities that were opened by the logged in user (in this case, you).  
This table should now be populated with PRs from your Git provider.

#### Register teams

In the [teams](https://app.getport.io/teams) page, choose `Register a new team` and select your user as a member.  
This will create a `team` entity and add your user to it.  
Now that your user is a member of a team, widgets in the [My team](https://app.getport.io/my_team) page will be populated with data.

#### Register more users

To see what components in your portal look like with more than one user, register additional users to add them to your Port organization.  

If you want to create users without inviting them to the portal just yet, make sure the `Invite to Port` toggle is disabled when creating the user.

:::tip User & team management
The `user` and `team` blueprints are powerful components that can be leveraged for many use cases, such as **ownership definition**, **RBAC definition**, **dynamic visualization**, and more. 

Read more about them in the [User & team management](/sso-rbac/rbac/) page.
:::

## How the service catalog works

As you may have seen, installing an integration will create one or more <PortTooltip id="blueprint">blueprints</PortTooltip>, some of which may have a <PortTooltip id="relation">relation</PortTooltip> to other blueprints.

For example, when installing the `PagerDuty` integration, the `pagerdutyIncident` blueprint has a relation to the `pagerdutyService` blueprint. 

Additionally, some of the blueprints will have a <PortTooltip id="relation">relation</PortTooltip> to one of the default blueprints (e.g. `service`).

In the `PagerDuty` example, the `pagerdutyIncident` blueprint has a relation to the `service` blueprint.

This results in a rich `service` component, as these relations give it context from other components in your data model.  
You can then use this service component to achieve many use cases, such as:

* Calculate "Mean time to recovery" for a `service` by adding an aggregation property to it, that will sum the `timeToRecovery` property of all `pagerdutyIncident` entities related to it.

* Calculate total monthly incident count for a `service` by adding an aggregation property to it, that will sum the number of related `pagerdutyIncident` entities.

* Create visualizations to track incidents, e.g. a chart that shows the number of incidents per service, a table that shows all incidents per service/team, and more.

### Relation mapping

To connect integration entities and default component entities, (like the `pagerdutyIncident`->`service` relation), we use a rule to find the relevant `service` entity for each `pagerdutyIncident` entity.

Read more about relation mapping [here](/build-your-software-catalog/customize-integrations/configure-mapping#mapping-relations-using-search-queries).

For example, here is part of the default mapping for the `PagerDuty` integration.  
Note the rule that is used under the `service` relation, which will find the relevant `service` entity for each `pagerdutyIncident` entity:

```yaml showLineNumbers
kind: incidents
selector:
    ...
port:
  entity:
    mappings:
      ...
      #highlight-start
      relations:
        pagerdutyService: .service.id
        service:
          combinator: '"and"'
          rules:
            - property: '"pagerdutyServiceId"'
              operator: '"="'
              value: .service.id
      #highlight-end
```

You can use this method to connect additional components to default components in your data model.

## Next step - automatic discovery

Proceed to the [next step](/getting-started/set-up-automatic-discovery) to learn how to manage your catalog automatically, creating and updating components based on changes in data from your tools.
