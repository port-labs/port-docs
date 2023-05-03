# Dashboards

Port supports multiple visualizations, allowing you to display data from your software catalog in a visual and graphic manner, making it easier to create custom dashboard and make sense of large datasets.

Continue reading to learn more about our visualization types:

## Creating visualizations

- On the top right of the page click on `Add Visualization` button;
- Select the desired visualization:

![Dropdown](../../../static/img/software-catalog/widgets/AddPieChartVisualization.png)

- Fill out the form and click save.

![Dropdown](../../../static/img/software-catalog/widgets/AddPieChartForm.png)

## Editing visualizations

- On the top right of the pie chart widget click on the three dots icon;
- Select your desired action (edit/delete).

![Dropdown](../../../static/img/software-catalog/widgets/EditOrDeleteWidget.png)

## Visualization types

### Pie chart

You can create a pie chart illustrating data from Entities in your software catalog divided by categories and Entity properties inside a specific entity page [**specific entity page**](../page/entity-page.md).

#### Visualization properties

| Field                   | Type     | Description                                                                                                                  | Default | Required |
| ----------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------- | ------- | -------- |
| `Title`                 | `String` | Pie chart title                                                                                                              | `null`  | `true`   |
| `Icon`                  | `String` | Pie chart Icon                                                                                                               | `null`  | `false`  |
| `Description`           | `String` | Pie chart description                                                                                                        | `null`  | `false`  |
| `Blueprint`             | `String` | The chosen Blueprint from which related Entities data is visualized from                                                     | `null`  | `true`   |
| `Breakdown by property` | `String` | Group your chart by a specific property                                                                                      | `null`  | `true`   |
| `Filters`               | `Array`  | Filters to include or exclude specific data based on Port's [Search Rules](../../search-and-query/search-and-query.md#rules) | []      | `false`  |

### Metric chart

You can create a metric visualization from related entities in the [**specific entity page**](../page/entity-page.md). You can either count the entities or perform an aggregation function on a number property. You can also filter entities so the aggregation metric will only apply to a limited set of entities with Port's [Search Rules](../../search-and-query/search-and-query.md#rules)

#### Metric properties

| Field              | Type     | Description                                                                                                                                                                                | Default | Required |
| ------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------- | -------- |
| `Title`            | `String` | Metric title                                                                                                                                                                               | `null`  | `true`   |
| `Icon`             | `String` | Metric Icon                                                                                                                                                                                | `null`  | `false`  |
| `Description`      | `String` | Metric description                                                                                                                                                                         | `null`  | `false`  |
| `Blueprint`        | `String` | The chosen Blueprint from which related Entities data is visualized from                                                                                                                   | `null`  | `true`   |
| `Calculation Type` | `String` | Aggregate by either counting the entities or perform a function on a property. Possible values: `count`, `property`                                                                        | `count` | `true`   |
| `Property`         | `String` | The metric value will be the selected property's aggregated value (according to the chosen function).The `property` key is available only when the `Calculation Type` equals to `Property` | `null`  | `true`   |
| `Function`         | `String` | sum, min, max, average, median                                                                                                                                                             | `null`  | `true`   |
| `Filters`          | `Array`  | Filters to include or exclude specific data based on Port's [Search Rules](../../search-and-query/search-and-query.md#rules)                                                               | []      | `false`  |
| `unit`             | `String` | The unit of the metric. Possible Values: `%`, `$`, `£`, `€`, `none`, `custom`                                                                                                              | `null`  | `true`   |
| `unitCustom`       | `String` | Text to appear below the number. unit equals to `custom` is required                                                                                                                       | `null`  | `true`   |
| `unitAlignment`    | `String` | `left`, `right`, `bottom`.                                                                                                                                                                 | `null`  | `true`   |

## Chat filters

The chart filters allow to include or exclude specific data from the visualization. The filters are based on Port's [Search Rules](../../search-and-query/search-and-query.md#rules)

### Filter example: only deployment entities from the last week

Let's assume we have a [Blueprint](../../build-your-software-catalog/define-your-data-model/setup-blueprint/setup-blueprint.md) that is called `Service` which is related to another Blueprint called `Deployment`, and we want to create visualizations on top of the last week's deployments of this service.

To achieve this desired state, we can go into one of the `Service`'s profile pages and create a new visualization. After selecting the `Deployment` Blueprint in the dropdown, we can add the following filter to the `Filters` array:

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
