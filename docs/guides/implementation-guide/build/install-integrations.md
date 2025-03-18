---
sidebar_position: 1
---

# Install integrations

Integrations are the backbone of your developer portal. They allow you to ingest data from your tech stack and create a comprehensive **software catalog**.

Using your prioritized list of tools and platforms required to implement your MVP, install the relevant integrations as per the following steps:

## Install pre-built integrations

If Port offers a [pre-built integration](/build-your-software-catalog/sync-data-to-catalog/) for your desired tool, install it to quickly start ingesting data.  

Some components will be automatically created in your portal:

- Default [blueprints](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/) will be created in your [Builder](https://app.getport.io/settings/data-model) to model the incoming data.  
- Default [mapping](/build-your-software-catalog/customize-integrations/configure-mapping) will be defined to map the incoming data to the blueprint's properties.

:::tip Default components
All default components created by pre-built integrations can be fully customized to better fit your needs.
:::

<br/>
**Note** that for pre-built integrations, Port offers several installation methods, each with its own syncing mechanism and hosting options (see each integration's documentation for the available options).  

Choose the method that best fits your infrastructure and processes.

## Set up custom integrations

If Port does not offer a pre-built integration for your desired tool, you can create a custom integration and ingest data using one of the following methods:
- [Port's API](https://docs.port.io/api-reference/port-api).
- A generic [webhook](https://docs.port.io/build-your-software-catalog/custom-integration/webhook/).
- Infrastructure-as-code, using Port's [Terraform provider](https://registry.terraform.io/providers/port-labs/port-labs/) or [Pulumi provider](https://www.pulumi.com/registry/packages/port/).

For custom integrations, you will need to:
- Create custom [blueprints](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/) in your [Builder](https://app.getport.io/settings/data-model) to model the incoming data.
- When ingesting data, make sure to map it to the relevant [properties](https://docs.port.io/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/) in the target blueprint/s.

## Create logical connections between blueprints

Once your software catalog is populated with data from different sources, you can create logical connections between blueprints to define the relationship between them, using [relations](https://docs.port.io/build-your-software-catalog/customize-integrations/configure-data-model/relate-blueprints/).

This is one of the main strengths of a developer portal - tools in your ecosystem that were once unaware of each other are now part of a catalog that can be used to create new insights and workflows.

For example:
- Once you connect your **Jira issue** and **Service** blueprints, you can create a [dashboard widget](https://docs.port.io/customize-pages-dashboards-and-plugins/dashboards/) that tracks and displays the open issues in Jira that are related to a specific service.
- Once you connect your **PagerDuty incident** and **Service** blueprints, you can define an [automation](https://docs.port.io/actions-and-automations/define-automations/) that notifies the service owner when a new incident is created for their service.

:::tip Default relations
When installing pre-built integrations, some relations are automatically created between blueprints.  

The relations in the two examples above will be automatically created when installing the **Jira** and **PagerDuty** integrations respectively.
:::

Use [**relations**](/build-your-software-catalog/customize-integrations/configure-data-model/relate-blueprints/) to define the logical relationships between the blueprints in your portal.

## Next step - set up RBAC & ownership

Once you have installed your desired integrations, proceed to the [next step](/guides/implementation-guide/build/rbac-and-ownership).