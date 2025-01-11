---
sidebar_position: 2
title: Getting started
sidebar_label: "1. Connect your Git provider"
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortTooltip from "/src/components/tooltip/tooltip.jsx"

# Getting started

After [signing up](https://app.getport.io) to Port, you will be prompted to follow an onboarding process that aims to help you get started with Port quickly, using real data from tools in your tech stack.

This page will walk you through the phases of the onboarding process, and describe the components that Port will create for you.

## Step 1: Connect your Git provider

The first step of the onboarding process is to connect your Git provider to Port.  
This will allow Port to fetch data from your Git provider and start populating your software catalog.

### Expected outcome

- Port will create the following <PortTooltip id="blueprint">blueprints</PortTooltip> in your [data model](https://app.getport.io/settings/data-model):
  - `Repository` - represents a repository in your Git provider.
  - `Pull Request` - represents a pull request in your Git provider.  
  
  These blueprints will contain some predefined [properties](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/), representing pieces of data that will be mapped from your Git provider to the entities created from these blueprints.

- Port will create an <PortTooltip id="entity">entity</PortTooltip> in your [software catalog](https://app.getport.io/organization/catalog) for each repository and pull request fetched from your Git provider, with populated properties.

- **How does Port know to map a piece of data to a property?**  
  Each <PortTooltip id="dataSource">data source</PortTooltip> (in this case, your Git provider) has a [mapping configuration](/build-your-software-catalog/customize-integrations/configure-mapping) that tells Port which pieces of data to fetch from the data source, and which properties of a blueprint to map them to.  
  
  Port will create a default mapping configuration for your Git provider, which can later be freely adjusted to ingest more/less data.

## Step 2: Choose the tools used in your organization

The second step is to select the tools and platforms that are used in your organization.  
This will allow Port to create components in your portal for the selected tools, preparing for integration with them.

### Expected outcome

- Port will create initial <PortTooltip id="blueprint">blueprints</PortTooltip> in your [data model](https://app.getport.io/settings/data-model) that represent resources from your selected tools.

- Depending on the tools you select, Port may create <PortTooltip id="action">self-service actions</PortTooltip> for  common use cases for the selected tools.  
    You can see all self-service actions in the [self-service page](https://app.getport.io/self-serve) of your portal.

    For example, selecting `Jira` will create a `Create a new issue` action, which allows users to create a Jira issue with predefined inputs and logic. 

    **Note** that until you install Port's Jira integration, your portal will not have access to your Jira organization data, therefore the action will not be usable. Installing integrations is covered in the next step.

- Depending on the tools you select, Port may create <PortTooltip id="dashboard">dashboards</PortTooltip> and <PortTooltip id="widget">widgets</PortTooltip> in your portal, that allow you to visualize and track data about your entities. 

    For example, selecting `Jira` will create a table widget named `My Jira issues`, that is filtered to display all Jira issues assigned to the logged in user.  
    This table will be found in the ["Plan my day" dashboard](https://app.getport.io/plan_my_day) in your portal.
    <img src="/img/quickstart/exampleDashboardJira.png" width="55%" border="1px" />

## Step 3: Install integrations

The third step is to install integrations for the tools you selected in the previous step.  
This will connect the tools to Port, allowing Port to ingest data from them into your software catalog.

After completing the previous step, you will see a panel on the right side of the screen, with a list of the tools you selected.  
<img src="/img/quickstart/exampleToolsPanel.png" width="25%" border="1px" />
<br/><br/>

Clicking on a tool will take you to the [data sources page](https://app.getport.io/settings/data-sources), where you can install the integration.

#### Installation methods

Port offers several methods to install integrations, varying in hosting environments and resync mechanisms.  
Choose the one that best fits your organizational standards.  

The available methods for each integration can be found in the [integrations section](/build-your-software-catalog/sync-data-to-catalog) of the documentation.

### Expected outcome

- Data from the integrated tools will start being ingested into your [software catalog](https://app.getport.io/organization/catalog), creating <PortTooltip id="entity">entities</PortTooltip> for each resource as defined in its <PortTooltip id="blueprint">blueprint</PortTooltip>, using the initial mapping configuration.

- A new page will be created in your [software catalog](https://app.getport.io/organization/catalog) for each <PortTooltip id="blueprint">blueprint</PortTooltip>, displaying the <PortTooltip id="entity">entities</PortTooltip> created from it.

- The <PortTooltip id="action">self-service actions</PortTooltip> created in the previous step will become usable, as Port will be connected to your integrated tools.

- The <PortTooltip id="dashboard">dashboards</PortTooltip> and <PortTooltip id="widget">widgets</PortTooltip> created in the previous step will now display data from your software catalog.


## Default components

In addition to the components created in the previous steps, Port will create a few default components for you (even if you did not select any tools).

### Blueprints

Several blueprints used to represent common concepts in your organization are created automatically by Port.

- `_service` - a flexible <PortTooltip id="blueprint">blueprint</PortTooltip> representing a piece of software that is owned by a team/group in your organization.  
  
  This blueprint serves as a single component with rich context about all the resources related to the software, such as:
  - `The code itself` - a repository or a specific folder in a monorepo.

  - `Incident management` components, such as a PagerDuty service.

  - `Code scanning` components, such as Snyk Targets or Sonar Cloud projects.

  - `Project management` components, such as Jira projects and issues.

  - `Runtime` components, such as workloads.
  
  Services are the core component of R&D operations within a developer portal, providing each team with a unified view of its services and their status across different domains, such as **security**, **stability**, **access management**, and more.

---

- `_environment` - a representation of an environment in your organization.  
  In addition to this <PortTooltip id="blueprint">blueprint</PortTooltip>, 3 default <PortTooltip id="entity">entities</PortTooltip> will be created: `Dev`, `Test` and `Prod`.  

  You can, of course, modify the default environments and/or create additional ones.

---

- `_workload` - represents a `service` running in a specific `environment`, with context of the relevant related components.

  For example, a `frontend` service in your organization can have `frontend-prod` and `frontend-test` workloads, each with its own Kubernetes namespace, Sentry project, and owning team.

---

- `_user` - represents a user in your organization.  
  This blueprint can be related to other "user" blueprints coming from your data sources, such as `github_user`, allowing you to manage a user across multiple tools from a single component.  

- `_team` - represents a team in your organization. 
  This blueprint can be related to other "team" blueprints coming from your data sources, such as `github_team`, allowing you to manage a team across multiple tools from a single component.

  Users in Port can be assigned to teams, allowing you to implement ownership of components in your portal.

