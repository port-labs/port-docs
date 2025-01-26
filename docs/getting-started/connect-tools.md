---
sidebar_position: 2
sidebar_label: "1. Connect your tools"
---

import PortTooltip from "/src/components/tooltip/tooltip.jsx"

# Connect your tools

The first step of the onboarding process is to connect your tools to Port.  
This will allow Port to fetch data from your tools and start populating your software catalog.

The onboarding process breaks this step down into 3 parts, which are described on this page:

1. [Connect your Git provider](?#connect-your-git-provider).
2. [Choose relevant tools](?#choose-relevant-tools).
3. [Install integrations](?#install-integrations).

## Connect your Git provider

Git providers are some of the most common sources of information about your software, which makes them a great starting point for your software catalog.    

Choose the Git provider you use in your organization and connect it to Port.

### Expected outcome

- Port will create the following <PortTooltip id="blueprint">blueprints</PortTooltip> in your [data model](https://app.getport.io/settings/data-model):
  - `Repository` - represents a repository in your Git provider.
  - `Pull Request` - represents a pull request in your Git provider.  
  
  These blueprints will contain some predefined [properties](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/), representing pieces of data that will be mapped from your Git provider to the entities created from these blueprints.

- Port will create an <PortTooltip id="entity">entity</PortTooltip> in your [software catalog](https://app.getport.io/organization/catalog) for each repository and pull request fetched from your Git provider, with populated properties.

- **How does Port know to map a piece of data to a property?**  
  Each <PortTooltip id="dataSource">data source</PortTooltip> (in this case, your Git provider) has a [mapping configuration](/build-your-software-catalog/customize-integrations/configure-mapping) that tells Port which pieces of data to fetch from the data source, and which properties of a blueprint to map them to.  
  
  Port will create a default mapping configuration for your Git provider, which can later be freely adjusted to ingest more/less data. 

## Choose relevant tools

Next, Port will ask you to select the tools and platforms used in your organization.  
This will allow Port to create components in your portal for the selected tools, preparing for integration with them.

### Expected outcome

Port will create initial <PortTooltip id="blueprint">blueprints</PortTooltip> in your [data model](https://app.getport.io/settings/data-model) that represent resources from your selected tools.

For example, selecting Jira will create `Jira issue` and `Jira project` blueprints, with default <PortTooltip id="property">properties</PortTooltip> and <PortTooltip id="relation">relations</PortTooltip>.

- Depending on the tools you select, Port may create <PortTooltip id="action">self-service actions</PortTooltip> for common use cases for the selected tools.  
    You can see all self-service actions in the [self-service page](https://app.getport.io/self-serve) of your portal.

    For example, selecting `Jira` will create a `Create a new issue` action, which allows users to create a Jira issue with predefined inputs and logic. 

    **Note** that until you install Port's Jira integration, your portal will not have access to your Jira organization data, therefore the action will not be usable. Installing integrations is covered in the next step.

- Depending on the tools you select, Port may create <PortTooltip id="dashboard">dashboards</PortTooltip> and <PortTooltip id="widget">widgets</PortTooltip> in your portal, that allow you to visualize and track data about your entities. 

    For example, selecting `Jira` will create a table widget named `My Jira issues`, that is filtered to display all Jira issues assigned to the logged in user.  
    This table will be found in the ["Plan my day" dashboard](https://app.getport.io/plan_my_day) in your portal.
    
    Since you have not yet connected your Jira organization to Port, the widget will be empty.    
    Once you install the Jira integration, the widget will be automatically populated with the ingested data.
    <img src="/img/quickstart/exampleDashboardJira.png" width="55%" border="1px" /> 

## Install integrations

Lastly, install integrations for the tools you selected in the previous step.  
This will connect the tools to Port, allowing Port to ingest data from them into your software catalog.

After completing the previous step, you will see a panel on the right side of the screen, with a list of the tools you selected.  
<img src="/img/quickstart/exampleToolsPanel.png" width="25%" border="1px" />
<br/><br/>

Clicking on a tool will take you to the [data sources page](https://app.getport.io/settings/data-sources), where you can install the relevant integration.

### Installation methods

Port offers several methods to install integrations, varying in hosting environments and resync mechanisms.  
Choose the one that best fits your organizational standards.  

The available methods for each integration can be found in the [integrations section](/build-your-software-catalog/sync-data-to-catalog) of the documentation.

### Expected outcome

- Data from the integrated tools will start being ingested into your [software catalog](https://app.getport.io/organization/catalog), creating <PortTooltip id="entity">entities</PortTooltip> for each resource as defined in its <PortTooltip id="blueprint">blueprint</PortTooltip>, using the initial mapping configuration.

- A new page will be created in your [software catalog](https://app.getport.io/organization/catalog) for each <PortTooltip id="blueprint">blueprint</PortTooltip>, displaying the <PortTooltip id="entity">entities</PortTooltip> created from it.

- The <PortTooltip id="action">self-service actions</PortTooltip> created in the previous step will become usable, as Port will be connected to your integrated tools.

- The <PortTooltip id="dashboard">dashboards</PortTooltip> and <PortTooltip id="widget">widgets</PortTooltip> created in the previous step will now display data from your software catalog. 

## Next step

Proceed to [set up your service catalog](/getting-started/set-up-service-catalog.md).