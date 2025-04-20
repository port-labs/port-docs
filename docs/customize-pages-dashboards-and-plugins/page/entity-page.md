---
sidebar_position: 2
---

import ChartFilters from "/docs/customize-pages-dashboards-and-plugins/templates/_chart_filters.md"

# Entity page

Each [entity](/build-your-software-catalog/sync-data-to-catalog/sync-data-to-catalog.md#entity-json-structure) has a dedicated page that contains 4 tabs (by default):

- [Overview](#overview)
- [Related entities](#related-entities)
- [Runs](#runs)
- [Audit log](#audit-log)

## Overview

The overview tab is a dashboard, used to display [widgets](/customize-pages-dashboards-and-plugins/dashboards/) related to the entity.

By default, each entity will have a `Details` widget, which displays the entity's properties and their values, and other metadata.

Additional widgets can be added by clicking on the `+ Widget` button in the top right corner of the dashboard.

## Related entities

By default, all related entities in the same direction will automatically appear in this table. This is true for both forward-related and backward-related entities. Indirectly-related entities will not appear.

For example:

`Workflow Run` has a forward-relation to `Deployment Workflow`, which has a forward-relation to `Service`, which has a **backward**-relation to `Deployment`.  
Since we changed direction midway, this relation is **indirect**:

<img src='/img/software-catalog/pages/builderRelationsExample.png' border='1px' />

When looking at the entity page of a certain `Workflow Run`, the related entities `Deployment Workflow` and `Service` automatically appear, but `Deployment` does not, since its relation is in the other direction.

You can add additional entities to the `Related entities` table by clicking on the `+` button above the table.  

In the form that appears, the `Related blueprint` dropdown will display all entities that are related in any way to the current entity. In our `Workflow Run` example above, we can use this button to add a `Deployment` tab to our widget.

#### Show/hide columns

By default, the related entities table will display the following columns for each entity:  
`Title`, `Last update time`, and `Creation time`.  
Other properties will be hidden by default.  

You can always customize the table to [hide/show columns](/customize-pages-dashboards-and-plugins/page/catalog-page?create-page=ui#hideshow-columns).

## Runs

If the entity's blueprint has any [actions](/actions-and-automations/create-self-service-experiences/) configured, the `Runs` tab will display their history log, results, log streams, and more.

## Audit log

This tab displays all actions (including CRUD) that caused any change to the entity's configuration.  
For each change, useful metadata will be shown such as the initiator, diff before and after the change, relevant blueprint, and more.

## Additional tabs

### Visual properties
Some of the [available property types](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/#supported-properties) are visual by nature. When defining one of these properties in a blueprint, an additional tab will be automatically created in each entity page related to this blueprint, displaying the property's content in the relevant visual format.

The following property types are supported:

- [Markdown](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/markdown)
- [Embedded URL](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/embedded-url)
- [Swagger UI](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/swagger)

### Scorecards

If the entity's blueprint has any [scorecards](/promote-scorecards/) configured, a `Scorecards` tab will be automatically created in the entity page.

The tab will display the entity's compliance status with each of its scorecards.

### Dashboard tabs

You can add additional, customizable dashboard tabs to an entity page by clicking the `+` button.  
Each dashboard tab name can be customized and edited.

#### Limitations
- You can add up to 5 dashboard tabs per entity page.
- Dashboard tab names must be unique and are limited to 30 characters.


