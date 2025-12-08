---
sidebar_position: 2
---

import SaveTableView from "/docs/customize-pages-dashboards-and-plugins/templates/_save_table_view.md"
import ChartFilters from "/docs/customize-pages-dashboards-and-plugins/templates/_chart_filters.md"

# Data widgets

Data widgets are visualization widgets that display data from your software catalog, including charts, tables, and entity information.

## Number chart

Number charts display a number value related to an entity and its properties.

You can choose one of these chart types:
* **Display single property** - display a property from a specific entity.
* **Count entities** - display the amount of related entities or show an average by time.  
* **Aggregate by property** - apply an aggregation function on number properties from multiple entities. 

:::info Filtering entities
You can also filter entities so the aggregation number chart will only apply to a limited set of entities with Port's [Search Rules](/search-and-query/search-and-query.md#rules)
::: 

### Time filtering in number charts vs. line charts

The value shown in a **number chart** is calculated over **all available entities** of the selected blueprint. By default, it does not apply any time-based filtering.

When a **number chart** is used alongside a [**line chart**](/customize-pages-dashboards-and-plugins/dashboards/data-widgets/#line-chart) in a dashboard, for example a number chart showing average monthly deployment frequency and a line chart showing deployment frequency over time, you might notice that the average values differ, even if both charts reference the same metric (e.g. deployment frequency).

This difference happens because the two charts are likely working with different time ranges:

- The **number chart** performs its calculation across **all available historical entities**, without limiting to a specific time range.
- The **line chart**, in contrast, only includes entities within its **selected time range** (e.g. the last 30 days).

To align both charts and ensure consistency in what they reflect, apply a time filter to the number chart that matches the line chart’s time range. This helps prevent confusion and ensures both charts are working with the same scope of data.

#### Display formatting

You can customize how numbers are displayed in number chart by selecting a formatting function:

- `None` - displays the number without any formatting.

- `Round` - rounds the number to the nearest integer.

- `Custom` - allows you to specify decimal precision between one to five decimal places.

### Conditional formatting

You can customize the appearance of a number chart based on specific conditions, helping viewers to quickly understand what the value indicates.
When configuring a condition, you will need to provide the following:
- `Operator` - select an **operator** from the available ones to define the condition.

- `Value` -  enter the reference **value** to evaluate against the widget’s data.

- `Color` - choose the **color** the widget will display when the condition is met.

- `Message` - provide a short **message** to display above the number when the condition is met.

- `Description` - add a **tooltip** message that appears when clicking the label, offering additional context about the value's significance.

:::tip Multiple met conditions behavior
Suppose you define two conditions using the `<` operator:
- `< 8` → Green widget
- `< 6` → Yellow widget 
If the number chart’s value is 5, both conditions (`< 8` and `< 6`) are technically true.
However, since 5 is closer to 6 than to 8, the widget will be colored yellow - the color associated with the closest matching condition.
:::

<img src='/img/software-catalog/widgets/numberChartConditionExample.png' width='50%' style={{border:'1px', borderRadius:'8px'}}/>

### Number chart properties

| Field             | Type     | Description                                                                                                                                                                                                                                 | Default    | Required |
| ----------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | -------- |
| `Title`           | `String` | Number Chart title                                                                                                                                                                                                                          | `null`     | `true`   |
| `Icon`            | `String` | Number Chart Icon                                                                                                                                                                                                                           | `null`     | `false`  |
| `Description`     | `String` | Number Chart description                                                                                                                                                                                                                    | `null`     | `false`  |
| `Empty state text`      | `String` | Number chart empty state text         | `No data for this widget`  | `false`  |
| `Chart type`    | `String` | Defines the operation type for the chart. Possible values: `Display single property`, `Count entities`, `Aggregate by property`                                                                                                                      | `null` | `true`   |
| `Blueprint`       | `String` | The chosen blueprint from which related entities data is visualized from                                                                                                                                                                    | `null`     | `true`   |
| `Display formatting` | `String` | Defines how numbers are displayed. Possible values: `None`, `Round`, `Custom` (allows decimal precision between one to five decimal places) | `null`     | `false`   |
| `Condition`       | `Object` | Defines the condition under which the number chart widget will update its color, display a status label, and have a tooltip message                                                                                                                                                                    | `null`     | `false`   |

**Chart type: display single property** 

| Field             | Type     | Description                                                                                                                                                                                                                                 | Default    | Required |
| ----------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | -------- |
| `Entity`       | `String` | The chosen entity from which property data is visualized from                                                                                                                                                                    | `null`     | `true`   |
| `Property`        | `String` | The number property which will be visualized                                                 | `null`     | `true`   |                                                                                     | `null`     | `true`   |


**Chart type: Count entities**

| Field             | Type     | Description                                                                                                                                                                                                                                 | Default    | Required |
| ----------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | -------- |
| `Function`        | `String` | `count` and `average` (by time).                                                   | `null`     | `true`   |
| `Average of`      | `String` | `hour`, `day`, `week` and `month`. | `null`     | `true`   |
| `Measure time by` | `String` | Used to specify an alternative property to use as the time property for the average calculation instead of the default field which is `createdAt`.                                                                                          | `createdAt`     | `false`  |
| `Additional filters`         | `Array`  | Filters to include or exclude specific data based on Port's [search rules](/search-and-query/search-and-query.md#rules)                                                                                                                | []         | `false`  |
| `Unit`            | `String` | The unit of the number chart. Possible Values: `%`, `$`, `£`, `€`, `none`, `custom`                                                                                                                                                         | `null`     | `true`   |
| `Custom unit`      | `String` | Text to display below the number value. The `unitCustom` key is only available when `unit` equals to `custom`                                                                                                                               | `null`     | `true`   |
| `Unit alignment`   | `String` | `left`, `right`, `bottom`.                                                                                                                                                                                                                  | `null`     | `true`   |

**Chart type: Aggregate by property** 

| Field             | Type     | Description                                                                                                                                                                                                                                 | Default    | Required |
| ----------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | -------- |
| `Property`        | `String` | The number chart value will be the selected property's aggregated value (according to the chosen function) | `null`     | `true`   |
| `Function`        | `String` | `sum`, `min`, `max`, `average` and `median` | `null`     | `true`   |
| `Average of`      | `String` | `hour`, `day`, `week`, `month` and `total` (divide the sum by the number of entities) | `null`     | `true`   |
| `Measure time by` | `String` | Used to specify an alternative property to use as the time property for the average calculation instead of the default field which is `createdAt`.                                                                                          | `createdAt`     | `false`  |
| `Additional filters`         | `Array`  | Filters to include or exclude specific data based on Port's [search rules](/search-and-query/search-and-query.md#rules)                                                                                                                | []         | `false`  |
| `Unit`            | `String` | The unit of the number chart. Possible Values: `%`, `$`, `£`, `€`, `none`, `custom`                                                                                                                                                         | `null`     | `true`   |
| `Custom unit`      | `String` | Text to display below the number value. The `unitCustom` key is only available when `unit` equals to `custom`                                                                                                                               | `null`     | `true`   |
| `Unit alignment`   | `String` | `left`, `right`, `bottom`.                                                                                                                                                                                                                  | `null`     | `true`   |




:::info Calculation of average time intervals
When performing calculations of average time intervals, such as by hour, day, week, or month, it is important to note that any partial interval is considered as a full interval. This approach ensures consistency across different time units.

For example, if the dataset includes information spanning across 2 hours and 20 minutes, but the selected average timeframe is `hour`, then the summed value will be divided by 3 hours.
:::

## Pie chart

Pie charts illustrate data from entities in your software catalog divided by categories and entity properties.

<img src='/img/software-catalog/widgets/pieChartExample.png' width='60%' style={{border:'1px', borderRadius:'6px'}}/>

<h3>Properties</h3>

| Field                   | Type     | Description                                                                                                                  | Default | Required |
| ----------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------- | ------- | -------- |
| `Title`                 | `String` | Pie chart title                                                                                                              | `null`  | `true`   |
| `Icon`                  | `String` | Pie chart Icon                                                                                                               | `null`  | `false`  |
| `Description`           | `String` | Pie chart description                                                                                                        | `null`  | `false`  |
| `Empty state text`      | `String` | Pie chart empty state text                                                  | `No data for this widget`  | `false`  |
| `Blueprint`             | `String` | The chosen blueprint from which related entities data is visualized                                                          | `null`  | `true`   |
| `Breakdown by property` | `String` | Group your chart by a specific property                                                                                      | `null`  | `true`   |
| `Additional filters`     | `Array`  | Filters to include or exclude specific data based on Port's [Search Rules](/search-and-query/search-and-query.md#rules) | []      | `false`  |

### Pie chart drill down

Hover over a pie chart slice to see the percentage it represents of the total.

Click a slice to open a temporary entity view listing the entities included in that slice. For example, in a chart showing programming languages used by services, clicking the JavaScript slice shows all services where the language is JavaScript.

In this entity view, you can:

- Add filters to further refine the displayed entities.
- Group entities by other properties.
- Customize the table (for example, columns and sorting).

:::info Temporary view
The entity view opened from a pie chart slice is temporary and can not be saved. Any filters, grouping, or table customizations you apply are lost when you leave this view.
:::

<h3>Limitations</h3>

- Pie charts can display **up to 14 slices**. If the breakdown contains more than 14 values, the remaining values are grouped into `Other`.
- Drill down is not available when the breakdown property is a [calculation property](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/calculation-property/), [scorecard](/scorecards/concepts-and-structure), or [scorecard rule](/scorecards/concepts-and-structure). In these cases, clicking a slice will open an empty view.

## Bar chart

Bar charts illustrate data from entities in your software catalog divided by categories and entity properties, displayed as vertical bars.

<img src='/img/software-catalog/widgets/barChartWidgetExample.png' width='70%' style={{border:'1px', borderRadius:'6px'}}/>

<h3>Properties</h3>

| Field                   | Type     | Description                                                                                                                  | Default | Required |
| ----------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------- | ------- | -------- |
| `Title`                 | `String` | Bar chart title                                                                                                              | `null`  | `true`   |
| `Icon`                  | `String` | Bar chart Icon                                                                                                               | `null`  | `false`  |
| `Description`           | `String` | Bar chart description                                                                                                        | `null`  | `false`  |
| `Empty state text`      | `String` | Bar chart empty state text                                                  | `No data for this widget`  | `false`  |
| `Blueprint`             | `String` | The chosen blueprint from which related entities data is visualized                                                          | `null`  | `true`   |
| `Breakdown by property` | `String` | Group your chart by a specific property                                                                                      | `null`  | `true`   |
| `Additional filters`    | `Array`  | Filters to include or exclude specific data based on Port's [Search Rules](/search-and-query/search-and-query.md#rules) | []      | `false`  |

**Limitations**

- Bar charts are limited to displaying **up to 9 bars**. If there are more than 9 categories, the additional categories will be grouped into an "other" section.

## Line chart

Line charts visualize trends over time, either by tracking `number` properties of entities or by tracking the entities themselves.  
A single line chart widget can display multiple lines, allowing you to compare different metrics side by side.

Port offers three types of lines:
1. [Property history (single entity)](#property-history-single-entity) - displays the values of one or more properties of a single entity.
2. [Aggregate property (all entities)](#aggregate-property-all-entities) - displays the aggregated values of one or more properties across all entities of a specific blueprint.
3. [Count entities (all entities)](#count-entities-all-entities) - displays either the total count of entities or the average number of entities from a specific blueprint over time.

### Creating a multi-line chart

To add a new line chart widget:

1. **Configure the chart settings**:
   - Provide a **title**, **icon**, **description**, and optionally a custom **empty state text** for the widget.

2. **Configure the X axis** (shared across all lines):
   - Give the axis a **title**.
   - Choose a `datetime` property to **measure time by** (e.g., creation time, last update time).
   - Select a **time interval**, which is the amount of time between each data point.
   - Select a **time range**, which determines how far back the chart displays data (maximum 1 year).

3. **Add lines using the "+ Line" button**:
   - Click **+ Line** to open the line configuration window.
   - Choose the line type and configure its specific settings (see below for details on each type).
   - Repeat to add multiple lines to the same chart.

:::info Shared Y axis
All lines in the chart share a single Y axis scale and unit. When adding multiple lines, make sure you choose comparable metrics to ensure the chart remains meaningful and readable.
:::

:::caution Line colors
Even if a property value (such as an enum) has a defined color in Port (e.g., "Failed" → red), the line chart may not use the same color. Line colors are assigned automatically and may differ from property colors.
:::

### Property history (single entity)

This chart type displays the values of one or more properties of a **single entity** over time.  

It reflects the state of the catalog **at the chosen time**. Past values are not recalculated if entities are later changed or deleted. This includes calculation and aggregation properties, which are stored as they were computed at that time.

Unlike other chart types, this chart preserves **past values**, while others always reflect the current state of the catalog and recalculate when data changes.

When creating this type of line chart:

1. Choose the **blueprint** you want to visualize.

2. Under the `Y axis` section
   - Give the axis a title.
   
   - Choose the **entity** you want to visualize.
   
   - Select one or more of the entity's `number` **properties** to visualize.

3. Under the `X axis` section:
   - Give the axis a title.

   - Choose a **time interval**, which is the amount of time between each data point in the chart.

   - Choose a **time range** for the chart, which is how far back in time the chart will display data (the maximum is 1 year).  
     Note that the available time ranges differ according to the selected time interval.

:::tip Specific entity page
When creating a line chart in an [entity page](/customize-pages-dashboards-and-plugins/page/entity-page#dashboard-widgets), the chosen entity will be the entity whose page you are on.
:::

For example, here is a line chart displaying a service's resource usage over the span of a week, in daily intervals:
<img src='/img/software-catalog/widgets/lineChartExample.png' width='100%' style={{border:'1px', borderRadius:'6px'}} />
<br/><br/>

**Limitations**

- This chart type displays data starting from the time the property was created on the blueprint.  
  Note that for aggregation (and calculation) properties, the data will be available from the time the aggregation property was created, and not the properties it is aggregating.
- Line chart data is limited to the last 365 days.

### Aggregate property (all entities)

This chart type displays the aggregated values of one or more properties across **all entities** of a specific blueprint.  
Each property will be displayed as a separate line in the chart.

This chart type reflects the **current state** of the catalog and recalculate when data changes.

When creating this type of line chart:

1. Choose the **blueprint** you want to visualize.

2. Under the `Y axis` section:
   - Give the axis a title.

   - Choose one or more of the blueprint's `number` **properties** to visualize.  

   - Choose an **aggregation function**, which is the operation to apply to the selected properties across all entities, for each time interval.  
     The possible values are:
     - `average`: The average value of each selected property.
     - `median`: The median value of each selected property.
     - `sum`: The sum of values in each selected property.
     - `max`: The maximum value of each selected property.
     - `min`: The minimum value of each selected property.
     - `last`: The last value of each selected property.

   - Optionally, define [additional filters](#chart-filters) in order to include/exclude specific entities from the chart.  
     For example, you can filter the entities by a specific property value, or by a specific time range.

3. Under the `X axis` section:
   - Give the axis a title.
   
   - Choose one of the blueprint's `datetime` properties by which to **measure the time** of the chart data.  
     This can be the entity's creation time, last update time, or any other `datetime` property.  

   - Choose a **time interval**, which is the amount of time between each data point in the chart.

   - Choose a **time range** for the chart, which is how far back in time the chart will display data (the maximum is 1 year).  
     Note that the available time ranges differ according to the selected time interval.

For example, here is a line chart displaying the maximum cost of all services over the span of a month, in weekly intervals:
<img src='/img/software-catalog/widgets/lineChartAggregationExample.png' width='100%' style={{border:'1px', borderRadius:'6px'}}/>
<br/><br/>

**Limitations**

- This chart type does not support [calculation properties](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/calculation-property/).
- Line chart data is limited to the last 365 days.

<!-- #### Line chart properties

| Field           | Type     | Description                                   | Default | Required |
| --------------- | -------- | --------------------------------------------- | ------- | -------- |
| `Title`         | `String` | Chart title                                   | `null`  | `true`   |
| `Icon`          | `String` | Chart Icon                                    | `null`  | `false`  |
| `Description`   | `String` | An optional description for the chart         | `null`  | `false`  |
| `Blueprint`     | `String` | The chosen blueprint                          | `null`  | `true`   |
| `Entity`        | `String` | The chosen entity                             | `null`  | `true`   |
| `Properties`    | `Array`  | The chosen `number` property/ies to visualize | `null`  | `true`   |
| `Time interval` | `String` | The time interval to display in the x-axis of the chart.<br/>Possible values: `hour`, `day`, `week`, `month` | `null` | `true` |
| `Time range`    | `String` | The time range of the displayed data.<br/>Possible values change according to selected `time interval` - the longer the interval, the longer the available ranges | `null` | `true` | -->

### Count entities (all entities)

This chart type displays either the total count of entities or the average number of entities from a specific blueprint over time.  
If you choose to break down the chart by a property, each line will represent a distinct value of that property.

This chart type reflects the **current state** of the catalog and recalculate when data changes.

When creating this type of line chart:

1. Choose the **blueprint** you want to visualize.

2. Under the `Y axis` section:
   - Give the axis a title.

   - Choose one of the following functions:
     - `count`: Counts the number of entities in each time interval.
     - `average`: Calculates the average number of entities in each time interval.

   - Optionally, break down the chart by a specific blueprint `breakdown property`, generating a separate line for each distinct value of that property.
   
   - Optionally, define [additional filters](#chart-filters) in order to include/exclude specific entities from the chart.  
     For example, filter the entities by a specific property value, or by a specific time range.

3. Under the `X axis` section:
   - Give the axis a title.
   
   - Choose one of the blueprint's `datetime` properties by which to **measure the time** of the chart data.  
     This can be the entity's creation time, last update time, or any other `datetime` property.  

   - Choose a **time interval**, which is the amount of time between each data point in the chart.  
   The selected interval also determines how the function is calculated:  

        For example, if the time interval is a week, each data point will be calculated in the following manner:
        - The `count` function will count the total entities that week.
        - The `average` function will count the total entities that week and divide it by 7.  
          
      The same logic applies to all time intervals: `Hour`, `Day`, `Week`, and `Month` -  
      when using the `average` function, the total entity count will be divided by: 60, 24, 7, and 30 respectively.

   - Choose a **time range** for the chart, which is how far back in time the chart will display data (the maximum is 1 year).  
     Note that the available time ranges differ according to the selected time interval.

For example, here is a line chart displaying the average deployment rate over the span of a month, in weekly intervals, broken down by the `status` property (Success and Fail).
<img src='/img/software-catalog/widgets/countEntitiesLineChartExample.png' width='70%' style={{border:'1px', borderRadius:'6px'}}/>
<br/><br/>

**Limitations**

- This chart type does not support [calculation properties](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/calculation-property/).
- Line chart data is limited to the last 365 days.
- The chart can display up to 10 separate lines when choosing to break down by property.

## Table

This widget allows you to create tables displaying all entities based on a selected blueprint.  
Tables can be [searched, filtered and customized](/customize-pages-dashboards-and-plugins/page/catalog-page#customization) as you wish, using the corresponding buttons in the widget.

<img src='/img/software-catalog/widgets/tableExample.png' width='400rem' />
<br/><br/>

:::info Default table columns
By default, a new table will display the following columns for each entity:  
`Title`, `Last update time`, and `Creation time`.  
Other properties will be hidden by default.  

You can always customize the table to [hide/show columns](/customize-pages-dashboards-and-plugins/page/catalog-page?create-page=ui#hideshow-columns).
:::

### Save table view

<SaveTableView />

### Customization

Just like catalog pages, tables support the following customization options:

- [Initial filters](/customize-pages-dashboards-and-plugins/page/catalog-page/#initial-filters)
- [Excluded properties](/customize-pages-dashboards-and-plugins/page/catalog-page/#excluded-properties)

### Limitations

- Tables are limited to displaying up to **100,000** entities.  
  All UI table operations such as searching, filtering, grouping, etc. will be limited only to the entities that are displayed in the table.  
  If one of your blueprints has more than 100,000 entities, you can use the [initial filters](/customize-pages-dashboards-and-plugins/page/catalog-page/#initial-filters) to narrow down the entities displayed in the table.

## Entity card

This widget displays information about a specific entity, including its properties and scorecard compliance.

Simply choose a blueprint and a specific entity, and the widget will display information similar to that found on the entity's page.

<img src='/img/software-catalog/widgets/entityInformationExample.png' width='100%' style={{border:'1px', borderRadius:'6px'}}/>

## Custom empty state

The custom empty state field gives you the ability to define a custom message that appears when a widget has no data. This message can provide useful context to users such as setup instructions, relevant explanations, or helpful links.

The custom message supports Markdown formatting, so you can include links and other rich text elements. These will be rendered directly in the widget, making your guidance more actionable.

If you leave this field blank, the widget will display a default message: **"No data for this widget"**.

The following widget types support the custom empty state message:

- [Pie chart](/customize-pages-dashboards-and-plugins/dashboards/data-widgets/#pie-chart)
- [Bar chart](/customize-pages-dashboards-and-plugins/dashboards/data-widgets/#bar-chart)
- [Number chart](/customize-pages-dashboards-and-plugins/dashboards/data-widgets/#number-chart)
- [Line chart](/customize-pages-dashboards-and-plugins/dashboards/data-widgets/#line-chart)
- [Tables](/customize-pages-dashboards-and-plugins/dashboards/data-widgets/#table)

## Chart filters

Chart filters allow you to limit which entities are included in your dashboard visualizations, making your charts more relevant and performant.

<ChartFilters />

Once you select the blueprint you want to visualize, default filters will appear in the `filters` field, for example:

<img src='/img/software-catalog/widgets/defaultInternalChartFilters.png' width='35%' style={{border:'1px', borderRadius:'8px'}}/>
<br/><br/>

These are used internally in Port and cannot be modified/removed.
You can add additional filters as you wish, by adding new objects to the `rules` array, for example:

<details>
<summary><b>Filter with additional rule example (click to expand)</b></summary>

```json
{
  "combinator": "and",
  "rules": [
    {
      "operator": "=",
      "value": "service",
      "property": "$blueprint"
    },
    {
      "operator": "=",
      "value": "someValue",
      "property": "someProp"
    }
  ]
}
```
</details>

If you want to add additional rules with a different combinator, you can nest them inside a new object, for example:

<details>
<summary><b>Filter with nested rules example (click to expand)</b></summary>

```json
{
  "combinator": "and",
  "rules": [
    {
      "operator": "=",
      "value": "service",
      "property": "$blueprint"
    },
    {
      "combinator": "or",
      "rules": [
        {
          "operator": "=",
          "value": "someValue",
          "property": "someProp"
        },
        {
          "operator": "=",
          "value": "anotherValue",
          "property": "anotherProp"
        }
      ]
    }
  ]
}
```
</details>

### Filter example: only deployment entities from the last week

Let's assume we have a [blueprint](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/setup-blueprint.md) that is called `Service` which is related to another blueprint called `Deployment`, and we want to create visualizations on top of the last week's deployments of this service.

To achieve this desired state, we can go into one of the `Service`'s profile pages and create a new visualization. After selecting the `Deployment` blueprint in the dropdown, we can add the following filter to the `Filters` array:

```json showLineNumbers
[
  {
    "property": "$createdAt",
    "operator": "between",
    "value": {
      "preset": "lastWeek"
    }
  }
]
```

### Dynamic filters

You can use [dynamic properties](/search-and-query/#dynamic-properties) of the logged-in user when filtering a widget.

## Widget type identifiers (Terraform)

When creating widgets using [Port's Terraform provider](https://registry.terraform.io/providers/port-labs/port-labs/latest/docs/resources/port_page), you need to provide the widget type's identifier in the `type` key.  
The following table lists the identifiers for each data widget type:

| Widget type | Identifier |
| ----------- | ---------- |
| Number chart | `entities-number-chart` |
| Pie chart | `entities-pie-chart` |
| Line chart | `line-chart` |
| Table | `table-entities-explorer` |