---
sidebar_position: 1
---

import PortTooltip from "/src/components/tooltip/tooltip.jsx"

# Global search

In the top right corner of your [portal](https://app.getport.io/), you can find the global search bar.  

<img src='/img/software-catalog/search-in-port/globalSearchBar.png' width='80%' border='1px' />

<br/><br/>

The search bar uses an [Opensearch query](https://opensearch.org/docs/latest/query-dsl/full-text/match-bool-prefix/), and allows you to search for <PortTooltip id="entity">entities</PortTooltip> in your software catalog.  
You can search for entities by their title, description, or any other [property](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/).


## Search results

The search bar will return two types of results:

- **Entities**: Entities whose properties (including title & identifier) match your search query. 
- **Tech Docs**: Entities that have a `markdown` property whose content contains your search query. 

:::info Supported results
Note that the search bar does not return results for blueprints and actions, only entities.
:::