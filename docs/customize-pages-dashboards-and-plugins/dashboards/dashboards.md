import ChartFilters from "/docs/customize-pages-dashboards-and-plugins/templates/_chart_filters.md"
import SaveTableView from "/docs/customize-pages-dashboards-and-plugins/templates/_save_table_view.md"

# Dashboard widgets

Port supports various visualizations in the form of widgets, allowing you to display data from your software catalog using graphic elements, making it easier to make sense of large datasets.

Dashboards are available in the following locations:

1. The [Home page](https://app.getport.io/organization/home) of your Port app - the home page itself is a dashboard, allowing you to add and customize any of the widgets described on this page.
2. Every [entity page](/customize-pages-dashboards-and-plugins/page/entity-page#dashboard-widgets) can have a `dashboard` tab with its own widgets.
3. The [software catalog](https://app.getport.io/services) allows you to create customizable [dashboard pages](/customize-pages-dashboards-and-plugins/page/dashboard-page).

## Widget types

### Table

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

#### Save table view

<SaveTableView />

#### Customization

Just like catalog pages, tables support the following customization options:

- [Initial filters](/customize-pages-dashboards-and-plugins/page/catalog-page/#initial-filters)
- [Excluded properties](/customize-pages-dashboards-and-plugins/page/catalog-page/#excluded-properties)

#### Limitations

- Tables are limited to displaying up to **100,000** entities.  
  All UI table operations such as searching, filtering, grouping, etc. will be limited only to the entities that are displayed in the table.  
  If one of your blueprints has more than 100,000 entities, you can use the [initial filters](/customize-pages-dashboards-and-plugins/page/catalog-page/#initial-filters) to narrow down the entities displayed in the table.

### Pie chart

Pie charts illustrate data from entities in your software catalog divided by categories and entity properties.

<img src='/img/software-catalog/widgets/pieChartExample.png' width='70%' />

#### Visualization properties

| Field                   | Type     | Description                                                                                                                  | Default | Required |
| ----------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------- | ------- | -------- |
| `Title`                 | `String` | Pie chart title                                                                                                              | `null`  | `true`   |
| `Icon`                  | `String` | Pie chart Icon                                                                                                               | `null`  | `false`  |
| `Description`           | `String` | Pie chart description                                                                                                        | `null`  | `false`  |
| `Blueprint`             | `String` | The chosen blueprint from which related entities data is visualized                                                          | `null`  | `true`   |
| `Breakdown by property` | `String` | Group your chart by a specific property                                                                                      | `null`  | `true`   |
| `Filters`               | `Array`  | Filters to include or exclude specific data based on Port's [Search Rules](/search-and-query/search-and-query.md#rules) | []      | `false`  |

### Number chart

Number charts display a number value related to an entity and its properties.

You can choose one of these chart types:
* **Display single property** - display a property from a specific entity.
* **Count entities** - display the amount of related entities or show an average by time.  
* **Aggregate by property** - apply an aggregation function on number properties from multiple entities. 

:::info Filtering entities
You can also filter entities so the aggregation number chart will only apply to a limited set of entities with Port's [Search Rules](/search-and-query/search-and-query.md#rules)
::: 

#### Conditional formatting

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

<img src='/img/software-catalog/widgets/numberChartConditionExample.png' width='50%' border='1px' />

#### Number chart properties

| Field             | Type     | Description                                                                                                                                                                                                                                 | Default    | Required |
| ----------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | -------- |
| `Title`           | `String` | Number Chart title                                                                                                                                                                                                                          | `null`     | `true`   |
| `Icon`            | `String` | Number Chart Icon                                                                                                                                                                                                                           | `null`     | `false`  |
| `Description`     | `String` | Number Chart description                                                                                                                                                                                                                    | `null`     | `false`  |
| `Chart type`    | `String` | Defines the operation type for the chart. Possible values: `Display single property`, `Count entities`, `Aggregate by property`                                                                                                                      | `null` | `true`   |
| `Blueprint`       | `String` | The chosen blueprint from which related entities data is visualized from                                                                                                                                                                    | `null`     | `true`   |
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

### Line chart

Line charts visualize trends over time, either by tracking `number` properties of entities or by tracking the entities themselves.

Port offers three types of line charts:
1. [Property history (single entity)](#1-property-history-single-entity) - displays the values of one or more properties of a single entity.
2. [Aggregate property (all entities)](#2-aggregate-property-all-entities) - displays the aggregated values of one or more properties across all entities of a specific blueprint.
3. [Count entities (all entities)](#3-count-entities-all-entities) - displays either the total count of entities or the average number of entities from a specific blueprint over time.

#### 1. Property history (single entity)

This chart type displays the values of one or more properties of a **single entity** over time.  

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
<img src='/img/software-catalog/widgets/lineChartExample.png' width='100%' border='1px' />
<br/><br/>

**Limitations**

- This chart type displays data starting from the time the property was created on the blueprint.  
  Note that for aggregation (and calculation) properties, the data will be available from the time the aggregation property was created, and not the properties it is aggregating.
- Line chart data is limited to the last 365 days.

#### 2. Aggregate property (all entities)

This chart type displays the aggregated values of one or more properties across **all entities** of a specific blueprint.  
Each property will be displayed as a separate line in the chart.

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
<img src='/img/software-catalog/widgets/lineChartAggregationExample.png' width='100%' border='1px' />
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

#### 3. Count entities (all entities)

This chart type displays either the total count of entities or the average number of entities from a specific blueprint over time.  
If you choose to break down the chart by a property, each line will represent a distinct value of that property.

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
<img src='/img/software-catalog/widgets/countEntitiesLineChartExample.png' width='70%' border='1px' />
<br/><br/>

**Limitations**

- This chart type does not support [calculation properties](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/calculation-property/).
- Line chart data is limited to the last 365 days.
- The chart can display up to 10 separate lines when choosing to break down by property. 

### Markdown

This widget allows you to display any markdown content you wish in formatted form:

<img src='/img/software-catalog/widgets/markdownWidget.png' width='500rem' />
<br/><br/>

The widget also supports a wide variety of HTML tags, allowing you to create rich content:
<details>
<summary>**Supported HTML tags (click to expand)**</summary>
```bash
'iframe',
'a',
'style',
'h1',
'h2',
'h3',
'h4',
'h5',
'h6',
'nav',
'blockquote',
'dd',
'div',
'pre',
'dl',
'hr',
'li',
'menu',
'ol',
'p',
'ul',
'b',
'br',
'cite',
'code',
'em',
'i',
'mark',
'q',
's',
'samp',
'small',
'span',
'strong',
'sub',
'sup',
'time',
'u',
'var',
'wbr',
'img',
'video',
'svg',
'caption',
'col',
'colgroup',
'table',
'tbody',
'td',
'tfoot',
'th',
'thead',
'tr'
```
</details>

:::tip Practical example
A practical example of using HTML in a markdown widget can be found in Port's [live demo](https://demo.getport.io/organization/home), in the `Catalog quick access` widget. 
:::

#### Markdown widget properties

| Field      | Type     | Description           | Default | Required |
| ---------- | -------- | --------------------- | ------- | -------- |
| `Title`    | `String` | Markdown widget title | `null`  | `true`   |
| `Icon`     | `String` | Markdown widget Icon  | `null`  | `false`  |
| `markdown` | `String` | Markdown content      | `null`  | `false`  |

#### Internal markdown links

When linking to other pages in your portal, you can use `/` as the URL base, instead of using full URLs.  

For example, you can use `<a href="/plan_my_day">` instead of `<a href="https://demo.getport.io/plan_my_day">`.

### Iframe visualization

You can create an iframe widget to display an embedded url in the dashboard. The iframe widget is useful to display external dashboards or other external content. It also appends to the iframe URL query params the entity identifier and the blueprint identifier so the embedded page can use it for various purposes.

The entity identifier will be concatenated under the `entity` query param and the blueprint identifier will be concatenated under the `blueprint` query param. For example: `https://some-iframe-url.com?entity=entity_identifier&blueprint=blueprint_identifier`.

:::info Embedded Dashboard Access
Note that the iframe request is made directly from the end user’s browser, not from Port’s backend.  
If you are implementing IP whitelisting at the network or firewall level, you will need to account for the IP addresses of the users accessing the embedded dashboard - not the IP of Port itself.
:::

![iFrame](/img/software-catalog/widgets/iframeWidget.png)

#### Widget properties

| Field               | Type           | Description                                                                                                                                            | Default | Required |
| ------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------- | -------- |
| `Title`             | `String`       | Iframe widget title                                                                                                                                    | `null`  | `true`   |
| `Icon`              | `String`       | Iframe widget Icon                                                                                                                                     | `null`  | `false`  |
| `Description`       | `String`       | Iframe widget description                                                                                                                              | `null`  | `false`  |
| `URL`               | `String`       | Iframe widget url                                                                                                                                      | `null`  | `false`  |
| `URL type`          | `String`       | `public` or `protect`                                                                                                                                  | `null`  | `false`  |
| `Authorization Url` | `URL String`   | If the `URL type` is `protected` this will be required. Read more about it [here](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/embedded-url/authentication/#authentication-code-flow--pkce) | `null`  | `false`  |
| `clientId`          | `String`       | If the `URL type` is `protected` this will be required. Read more about it [here](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/embedded-url/authentication/#authentication-code-flow--pkce) | `null`  | `false`  |
| `Scopes`            | `String Array` | If the `URL type` is `protected` this will be required. Read more about it [here](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/embedded-url/authentication/#authentication-code-flow--pkce) | `null`  | `false`  |
| `Token URL`         | `URL String`   | If the `URL type` is `protected` this will be required. Read more about it [here](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/embedded-url/authentication/#authentication-code-flow--pkce) | `null`  | `false`  |

### Action card

This widget allows you to execute [self-service actions](/actions-and-automations/create-self-service-experiences) directly from any dashboard (including your homepage).

A single action card can contain one or multiple actions:

**Single action**  
To execute the action, click on the button in the bottom left corner of the widget:

<img src='/img/software-catalog/widgets/actionCardSingle.png' width='50%' />
<br/><br/>

**Multiple actions**  
When choosing multiple actions, you can choose your own title for the widget.  
To execute an action, click on the ⚡ button next to it:

<img src='/img/software-catalog/widgets/actionCardMultiple.png' width='45%' />


### Action runs

This widget allows you to create a table displaying all past runs of a [self-service action](/actions-and-automations/create-self-service-experiences) in your portal.  
The table will automatically display data about each run, including status, input parameters, the executing user, and more. 

<img src='/img/software-catalog/widgets/actionRunsTableExample.png' width='100%' />

### Entity information

This widget displays information about a specific entity, including its properties and scorecard compliance.

Simply choose a blueprint and a specific entity, and the widget will display information similar to that found on the entity's page.

<img src='/img/software-catalog/widgets/entityInformationExample.png' width='100%' border='1px' />

### Links

This widget allows you to display a list of links, both internal and external, for quick access to useful pages.

<img src='/img/software-catalog/widgets/linksExample.png' width='50%' border='1px' />

- **External links** - links to external websites, such as documentation, 3rd party tools, etc.  
  These links will open in a new tab when clicked.  
  For example: "https://www.google.com".

- **Internal links** - links to internal pages in your portal, such as an entity page, a catalog page, an entity's audit log page, etc.  
  These links will open in the same tab when clicked.  
  For example: "https://app.getport.io/serviceEntity?identifier=frontend".

During creation/editing of the widget, you can sort the links by dragging and dropping them.

## Chart filters

Chart filters allow you to limit which entities are included in your dashboard visualizations, making your charts more relevant and performant.

<ChartFilters />

Once you select the blueprint you want to visualize, default filters will appear in the `filters` field, for example:

<img src='/img/software-catalog/widgets/defaultInternalChartFilters.png' width='35%' border='1px' />
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
The following table lists the identifiers for each widget type:

| Widget type | Identifier |
| ----------- | ---------- |
| Number chart | `entities-number-chart` |
| Pie chart | `entities-pie-chart` |
| Line chart | `line-chart` |
| Markdown | `markdown` |
| IFrame | `iframe-widget` |
| Table | `table-entities-explorer` |
| Action card | `action-card-widget` |
| Action History | `action-runs-table-widget` |
| My entities | `my-entities` |
| Recently viewed | `recently-viewed-entities` |
| Recently used actions | `recently-used-actions` |
