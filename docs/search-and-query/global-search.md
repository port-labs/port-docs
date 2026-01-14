---
sidebar_position: 4
---

import PortTooltip from "/src/components/tooltip/tooltip.jsx"

# Global search

Port's global search provides a quick way to find <PortTooltip id="entity">entities</PortTooltip>, actions, blueprints, and more across your software catalog.

<img src='/img/software-catalog/search-in-port/globalSearchBar.png' width='60%' border='1px' style={{borderRadius:'6px'}}/>

## Accessing the search

You can access the global search in several ways:

- **Keyboard shortcut**: Press `Cmd + K` (Mac) or `Win + K` (Windows).
- **Click**: Click on the search bar in the top right corner of your [portal](https://app.getport.io/).

The search opens an interface in the center of the page, displaying relevant results as you type.

## Search results

The search displays the closest search results and returns four different types of them:

- **Entities**: Entities whose properties (including title & identifier) match your search query. You can search for entities by their title, identifier, description, or any other [property](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/).
- **Tech docs**: Entities that have a `markdown` property whose content contains your search query.
- **Actions**: Actions whose title or identifier match your search query.
- **Blueprints**: Blueprints whose title or identifier match your search query.

## Port highlight search - chrome extension

This handy [chrome extension](https://chromewebstore.google.com/detail/highlight-search-in-port/ekbladoiehfohpcppcclfkcnnlchejnb?hl=en-US&utm_source=ext_sidebar) allows you to highlight text in any webpage and quickly search for it in Port using the global search bar.
