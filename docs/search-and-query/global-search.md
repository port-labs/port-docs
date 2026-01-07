---
sidebar_position: 4
---

import PortTooltip from "/src/components/tooltip/tooltip.jsx"

# Global search

Port's global search provides a quick way to find <PortTooltip id="entity">entities</PortTooltip>, actions, blueprints, and more across your software catalog.

## Accessing the search

You can access the global search in several ways:

- **Keyboard shortcut**: Press `Cmd + K` (Mac) or `Win + K` (Windows);
- **Click**: Click on the search icon in the top right corner of your [portal](https://app.getport.io/).

The search opens a spotlight interface in the center of the page, displaying 3-6 relevant results as you type.

<img src='/img/software-catalog/search-in-port/globalSearchBar.png' width='80%' border='1px' />

<br/><br/>

You can search for entities by their title, description, or any other [property](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/).


## Search results

The search displays up to 3-6 results and returns four types of them:

- **Entities**: Entities whose properties (including title & identifier) match your search query;
- **Tech docs**: Entities that have a `markdown` property whose content contains your search query;
- **Actions**: Actions whose title or identifier match your search query;
- **Blueprints**: Blueprints whose title or identifier match your search query.

## Port highlight search - chrome extension

This handy [chrome extension](https://chromewebstore.google.com/detail/highlight-search-in-port/ekbladoiehfohpcppcclfkcnnlchejnb?hl=en-US&utm_source=ext_sidebar) allows you to highlight text in any webpage and quickly search for it in Port using the global search bar.
