---
sidebar_position: 2
sidebar_label: "1. Connect Git provider"
---

import PortTooltip from "/src/components/tooltip/tooltip.jsx"

# Connect your Git provider

The first step of the onboarding process is to connect your Git provider to Port.  
This will allow Port to fetch data from your Git provider and start populating your software catalog.

## Expected outcome

- Port will create the following <PortTooltip id="blueprint">blueprints</PortTooltip> in your [data model](https://app.getport.io/settings/data-model):
  - `Repository` - represents a repository in your Git provider.
  - `Pull Request` - represents a pull request in your Git provider.  
  
  These blueprints will contain some predefined [properties](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/), representing pieces of data that will be mapped from your Git provider to the entities created from these blueprints.

- Port will create an <PortTooltip id="entity">entity</PortTooltip> in your [software catalog](https://app.getport.io/organization/catalog) for each repository and pull request fetched from your Git provider, with populated properties.

- **How does Port know to map a piece of data to a property?**  
  Each <PortTooltip id="dataSource">data source</PortTooltip> (in this case, your Git provider) has a [mapping configuration](/build-your-software-catalog/customize-integrations/configure-mapping) that tells Port which pieces of data to fetch from the data source, and which properties of a blueprint to map them to.  
  
  Port will create a default mapping configuration for your Git provider, which can later be freely adjusted to ingest more/less data. 

## Next step

Proceed to [choose the tools](/getting-started/choose-tools.md) used in your organization.
