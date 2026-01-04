---
sidebar_position: 1
title: Overview
---

# Overview

Port's API provides tools to easily query, search and filter software catalog data. Port's search and query syntax can be used across the Port product to dynamically filter entities, control permissions, configure automations, and more.

## Where to use search & query?

You can use the search and query syntax in the following areas:

- **Catalog pages** - Initial filters for pages and tables.
- **Entity pages** - Filters for custom related entity tabs.
- **Dashboard widgets** - Dashboard-level filters and widget-specific filters for [data widgets](/customize-pages-dashboards-and-plugins/dashboards/data-widgets).
- **Blueprint read permissions** - Dynamic `policy` rules to control which entities users can see.
- **Aggregation properties** - Filters to determine which entities are included in [aggregation calculations](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/aggregation-property).
- **Scorecards** - Filters to determine which entities a rule evaluates.
- **Self-service actions** - Action conditions, entity input datasets, and dynamic permissions.
- **API** - Search endpoints ([search entities](/api-reference/search-entities) and [search a blueprint's entities](/api-reference/search-a-blueprints-entities)).

For practical examples of using search & query in each of these areas, see the [examples](/search-and-query/examples) page.

## Common queries usage

High quality search is essential to effectively track assets in your software catalog.  

Using Port's search you can:

- Find all running services that are not healthy.
- List all libraries that have known vulnerabilities.
- Filter all services running in a specific cluster (in a query or self service form).
- Catalog initial filters based on the logged in user's properties.

## Examples

Refer to the [examples](./examples.md) page for practical code snippets for search.

## Advanced

Refer to the [advanced](./advanced.md) page for advanced search use cases and outputs.