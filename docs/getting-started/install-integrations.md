---
sidebar_position: 4
title: Install integrations
sidebar_label: "3. Install integrations"
---

import PortTooltip from "/src/components/tooltip/tooltip.jsx"

# Install integrations

The third step is to install integrations for the tools you selected in the previous step.  
This will connect the tools to Port, allowing Port to ingest data from them into your software catalog.

After completing the previous step, you will see a panel on the right side of the screen, with a list of the tools you selected.  
<img src="/img/quickstart/exampleToolsPanel.png" width="25%" border="1px" />
<br/><br/>

Clicking on a tool will take you to the [data sources page](https://app.getport.io/settings/data-sources), where you can install the relevant integration.

## Installation methods

Port offers several methods to install integrations, varying in hosting environments and resync mechanisms.  
Choose the one that best fits your organizational standards.  

The available methods for each integration can be found in the [integrations section](/build-your-software-catalog/sync-data-to-catalog) of the documentation.

## Expected outcome

- Data from the integrated tools will start being ingested into your [software catalog](https://app.getport.io/organization/catalog), creating <PortTooltip id="entity">entities</PortTooltip> for each resource as defined in its <PortTooltip id="blueprint">blueprint</PortTooltip>, using the initial mapping configuration.

- A new page will be created in your [software catalog](https://app.getport.io/organization/catalog) for each <PortTooltip id="blueprint">blueprint</PortTooltip>, displaying the <PortTooltip id="entity">entities</PortTooltip> created from it.

- The <PortTooltip id="action">self-service actions</PortTooltip> created in the previous step will become usable, as Port will be connected to your integrated tools.

- The <PortTooltip id="dashboard">dashboards</PortTooltip> and <PortTooltip id="widget">widgets</PortTooltip> created in the previous step will now display data from your software catalog. 