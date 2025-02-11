---
sidebar_position: 3
title: Choose your tools
sidebar_label: "2. Choose tools"
---

import PortTooltip from "/src/components/tooltip/tooltip.jsx"

# Choose your tools

The second step is to select the tools and platforms that are used in your organization.  
This will allow Port to create components in your portal for the selected tools, preparing for integration with them.

## Expected outcome

### Blueprints

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

## Next step

Proceed to [install integrations](/getting-started/install-integrations.md).