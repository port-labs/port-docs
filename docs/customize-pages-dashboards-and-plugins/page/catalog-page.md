---
sidebar_position: 1
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import ThemedImage from "@theme/ThemedImage"
import SaveTableView from "/docs/customize-pages-dashboards-and-plugins/templates/_save_table_view.md"

# Catalog page

A catalog page displays a table of all existing [entities](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/#creating-entities) created from a [blueprint](https://docs.port.io/build-your-software-catalog/define-your-data-model/setup-blueprint/#what-is-a-blueprint).  
In this example we can see all of the microservice entities we created from the `microservice` blueprint:

<img src='/img/software-catalog/pages/catalogPage.png' width='80%' border='1px' />
<br/><br/>

:::info Entity limit
Tables are limited to displaying up to **100,000** entities.  
All UI table operations such as searching, filtering, grouping, etc. will be limited only to the entities that are displayed in the table.  
If one of your blueprints has more than 100,000 entities, you can use the [initial filters](/customize-pages-dashboards-and-plugins/page/catalog-page/#initial-filters) to narrow down the entities displayed in the table.
:::

## Page creation

When a blueprint is created, a catalog page is automatically generated in the Software Catalog.  
You can also manually create additional catalog pages for any existing blueprint, and customize them as you wish. Read on to see the available customization options.

<Tabs groupId="create-page" queryString values={[
{label: "From the UI", value: "ui"},
{label: "From the API", value: "api"},
{label: "From Pulumi", value: "pulumi"}
]}>

<TabItem value="ui">

To create a new catalog page, go to the [Catalog](https://app.getport.io/organization/catalog) page, click the `+ New` button in the top left corner, and select `New catalog page`.

</TabItem>

<TabItem value="api">

:::tip API options
See all the available API fields [here](https://api.getport.io/swagger/static/index.html#/Pages/post_v1_pages).
:::

```json showLineNumbers
{
   "identifier":"my_catalog_page",
   "title":"Our Services",
   "blueprint":"service",
   "icon":"Microservice",
   "widgets":[
      {
         "id":"46bf2483-97b7-4c6f-88fb-8987c9875d98",
         "type":"table-entities-explorer",
         "excludedFields":[
            "properties.readme",
            "properties.slack"
         ],
         "dataset":{
            "combinator":"and",
            "rules":[
               {
                  "operator":"=",
                  "property":"$blueprint",
                  "value":"{{blueprint}}"
               }
            ]
         }
      }
   ],
   "type":"blueprint-entities",
   "showInSidebar":true,
   "after":"githubRepositories"
}
```
</TabItem>

<TabItem value="pulumi">

:::info Port Pulumi
See all the supported variables in the Port Pulumi [documentation](https://www.pulumi.com/registry/packages/port/api-docs/page/#create)
:::

<Tabs groupId="pulumi-create-pages" queryString values={[
{label: "Python", value: "python"},
{label: "Typescript", value: "typescript"}
]}>

<TabItem value="python">

```python showLineNumbers
import json
from port_pulumi import Page

catalog_page = Page(
    "my-catalog-page-resource",
    identifier="my_catalog_page",
    title="Our Services",
    blueprint="service",
    icon="Microservice",
    type="blueprint-entities",
    widgets=[
        json.dumps(
            {
                "displayMode": "widget",
                "title": "Services",
                "type": "table-entities-explorer",
                "dataset": {
                    "combinator": "and",
                    "rules": [
                        {"operator": "=", "value": "service", "property": "$blueprint"}
                    ],
                },
                "id": "servicesTable-en",
                "excludedFields": ["properties.readme", "properties.slack"],
            }
        )
    ],
)
```
</TabItem>

<TabItem value="typescript">

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as port from "@port-labs/port";

const catalogPage = new port.Page(
    "my-catalog-page-resource",
    {
        identifier: "my_catalog_page",
        title: "Our Services",
        blueprint: "service",
        icon: "Microservice",
        type: "blueprint-entities",
        widgets: [ 
          JSON.stringify({
              displayMode: "widget",
              title: "Services",
              type: "table-entities-explorer",
              dataset: {
                  combinator: "and",
                  rules: [
                      { operator: "=", value: "service", property: "$blueprint" }
                  ],
              },
              id: "servicesTable-en",
              excludedFields: ["properties.readme", "properties.slack"],
          })
        ]
    }
);
```

</TabItem>

</Tabs>

</TabItem>

</Tabs>

:::info Default table columns
By default, the table in a catalog page will display the following columns for each entity:  
`Identifier`, `Last update time`, and `Creation time`.  
Other properties will be hidden by default.  

You can always customize the table to [hide/show columns](/customize-pages-dashboards-and-plugins/page/catalog-page?create-page=ui#hideshow-columns).
:::

### Description

You can provide additional context to your developers by using the `Description` field when creating a catalog page.  
This field supports adding links in markdown format: `[link text](https://www.address.com)`.

<img src='/img/software-catalog/pages/catalogPageDescriptionForm.png' width='40%' border='1px' />

<br/><br/>

The description will be displayed at the top of the page, under the page title:

<img src='/img/software-catalog/pages/catalogPageDescription.png' width='80%' border='1px' />

## Performance

Large entity tables can result in long loading times. Use the following tips and best practices to improve performance.

The [initial filters](#initial-filters) and [excluded properties](#excluded-properties) are defined when creating the page, while [calculation properties](#calculation-properties) are configured as part of the blueprint definition.

### Initial filters

Initial filters are the most effective way to reduce loading times. You can define filters that resolve when Port queries the data (rather than after querying, like table filters), reducing the number of entities displayed in the table.

To define such a filter, use the `Initial filters` field when creating a page:

<img src='/img/software-catalog/pages/initialFiltersForm.png' width='50%' border='1px' style={{borderRadius:'8px'}} />

<br/><br/>

You can define any [supported rule](/search-and-query/#rules) in JSON format.  
Here is an example that will only display `Deployments` that were updated in the past month:

```json showLineNumbers
[
  {
    "property": "$updatedAt",
    "operator": "between",
    "value": { "preset": "lastMonth" }
  }
]
```

#### Dynamic filters

You can use [dynamic properties](/search-and-query/#dynamic-properties) of the logged-in user when creating a catalog page.

### Excluded properties

Another way to reduce loading times is to exclude undesired properties from an entities table when querying the data. When using this option, the new table will not contain columns for the excluded properties.  

We recommend excluding properties with no actual benefit when shown in the table, such as large object properties, long array properties, and other complex data types.

To do this, use the `Excluded properties` field when creating a page:

<img src='/img/software-catalog/pages/excludePropertiesForm.png' width='50%'  border='1px' />

### Calculation properties

While calculation properties provide powerful functionality, they can impact performance when used in blueprints that have many entities. To improve performance, consider excluding calculation properties from the table or replacing them with regular properties.

To learn more about calculation properties performance, refer to the [calculation property](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/calculation-property/#performance-impact) page.

## Customization

The entities table can be customized, which will define the users' view of the Port platform.

:::tip Recommended customizations

We highly recommend using these customizations to provide a clean and accurate view of the platform for your developers.

:::

All table customizations are available on the top bar of the table:

![Table operations bar](/img/software-catalog/pages/TableOperationsBar.png)

### Filter

You can filter the table by using the following menu:

![Table filter menu marked](/img/software-catalog/pages/TableFilterMenu.png)

You can define any filtering operator with a suitable value.

You can filter one or more values while setting the relation between each field with a `And/Or`.

#### `My Teams` filter

By using the `My Teams` filter you will only see entities that belong to one of your teams. This means you will only see entities from teams that you are a member of.

This filter works on:

- `string` properties with the format `team`.
- The [meta property](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/meta-properties) `Team`.

![My Teams Filter](/img/software-catalog/pages/MyTeamsFilter.png)

#### `Me` filter

By using the `Me` filter you will only see entities that belong to the logged-in user.

This filter works on [`User`](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/user) properties.

![Me Filter](../../../static/img/software-catalog/pages/meFilter.png)

### Sort

You can sort the table by using the following menu:

![Table sort menu marked](/img/software-catalog/pages/TableSortMenu.png)

You can sort by one or more fields of any kind.

:::tip Column sorting
To sort a specific column, click on the column title.
:::

### Hide/show columns

You can show/hide properties by using the `Manage Properties` option in the top-right corner of the table:

<img src='/img/software-catalog/pages/TableHideMenu.png' width='30%' border='1px' />
<br/><br/>

You can also drag and drop the properties in this view to reorder them in the table.

:::tip Hide irrelevant data
We highly recommend hiding irrelevant data from users, to provide them with a clean work environment, relieving them from any distractions.
:::

### Manage properties

You can add, edit, or delete a blueprint's properties directly from the table by using the `Manage properties` button.  
See the [Configure properties](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/#from-the-software-catalog) section for more details.

### Group by

You can group table entities by a specific property using the following menu:

<img src="/img/software-catalog/pages/TableGroupByMenu.png" width="80%" border="1px" />
<br/><br/>

You can group entities by any **non-array** property.

:::tip Use-case
The `group-by` option is useful when you want to create custom views for users, such as "microservices by owners".

Just create your `group-by` view (and any other table customizations you desire), and [save as a new page](#save-a-view).
:::

### Search

Port provides a free-text search option on tables. This will search all of the entities' properties and display the entities that match the query.  
If the query contains multiple words, entities that contain all of these words will be displayed, even if they are spread across different properties. 

![Table search bar marked](/img/software-catalog/pages/TableSearchBar.png)

-> [Explore how to control page visibility and permissions](./page-permissions.md)

## Page operations

Pages have a set of operations that can be performed from the UI.  

:::info Default page
A default catalog page is automatically created when a new Blueprint is created. This page is directly tied to its Blueprint, meaning that if the blueprint is deleted, the default page will be deleted as well.

You can still edit or delete a default page if you'd like.

It's possible to filter, sort, group by, and use the table widget controls to change the layout of the default page.
:::

### Save a view

Since the main component of a catalog page is a table, the same rules apply to it.

<SaveTableView />

To save the view for all users as a new page, click the small arrow on the right side of the button:

<img src='/img/software-catalog/pages/catalogPageSaveView.png' width='70%' border='1px' />

### Edit, lock or delete a page

You can edit, lock or delete a page by clicking the `...` button in the top right corner:

<center>

![Page menu](/img/software-catalog/pages/PageMenu.png)

</center>

#### Editing pages

Editing a page allows you to change various properties:

![Edit Page popup window](/img/software-catalog/pages/EditPageForm.png)

#### Locking pages

Locking a catalog page disables the option to hide columns or apply filters to modify the displayed data.

Locking pages gives you a way to specifically curate pages to your developers' needs. This ensures that they can't modify the views or see data that isn't relevant to them.

To learn how to lock pages, refer to [page permissions](./page-permissions.md#lock-pages).

#### Deleting pages

Any page (whether created automatically or manually) can be deleted by clicking the `Delete page` button.

:::warning Default pages
When deleting a blueprint from your portal, all pages tied to that blueprint (including the default page that was created for it) will be deleted as well.
:::

## Catalog auto discovery

**Catalog auto discovery** analyzes your existing catalog data and suggests missing entities based on relationships and patterns. This helps you maintain a complete and accurate catalog, especially for entities that are not automatically created through integrations.

### Common use cases

The most common use cases include:

- **Services**: Unlike GitHub repositories or PagerDuty services that sync automatically from integrations, services are typically created manually. Auto discovery helps you identify and create these missing services.
- **Users**: Discover users from related entities. For instance, if you have GitHub repositories synced, we can analyze pull requests and issues entities to suggest users who contributed to them but do not yet exist in your catalog.

### How to use catalog auto discovery

**Run the discovery:**

1. Navigate to the [Catalog](https://app.port.io/organization/catalog) page of your portal.

2. Open the catalog page of the blueprint you want to discover new entities.

3. Click on the <ThemedImage sources={{light: "/img/icons/AI-icon.svg", dark: "/img/icons/AI-dark-icon.svg"}} style={{"vertical-align": "text-top"}} className="not-zoom" /> button in the top right corner of the page.

4. Select related blueprints to analyze. The entities from these blueprints will be used to identify patterns and suggest new entities for your target blueprint.

5. It is recommended to turn on the `Advanced configuration` toggle and provide more information, or specific patterns to guide the discovery process.

6. Click on the `Discover` button.

    <img src="/img/software-catalog/pages/catalogDiscoveryForm.png" border='1px' width='50%' style={{borderRadius:'8px'}} />

**Review and edit suggestions:**

Once the process is complete, a list of suggested entities will be displayed, divided into two sections: **Create** and **Update**.  

You can:

- Edit individual entity suggestions.
- Approve or decline suggestions individually or in bulk.
- View the proposed updates to existing entities by clicking the <ThemedImage sources={{light: "/img/icons/Show-icon.svg", dark: "/img/icons/Show-icon-dark.svg"}} style={{"vertical-align": "text-top"}} className="not-zoom" /> button.

<img src="/img/software-catalog/pages/catalogDiscoveryResultsWindow.png" border='1px' width='80%' style={{borderRadius:'8px'}} />

### Limitations

- **Entity evaluation limit**: Discovery evaluates only the 1,000 most recently added entities from each related blueprint.
