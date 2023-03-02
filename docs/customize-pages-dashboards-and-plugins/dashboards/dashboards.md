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
| `Title`                 | `String` | Visualization title                                                                                                          | `null`  | `true`   |
| `Icon`                  | `String` | Visualization Icon                                                                                                           | `null`  | `false`  |
| `Description`           | `String` | Visualization description                                                                                                    | `null`  | `false`  |
| `Blueprint`             | `String` | The chosen Blueprint from which related Entities data is visualized from                                                     | `null`  | `true`   |
| `Breakdown by property` | `String` | Group your chart by a specific property                                                                                      | `null`  | `true`   |
| `Filters`               | `Array`  | Filters to include or exclude specific data based on Port's [Search Rules](../../search-and-query/search-and-query.md#rules) | []      | `false`  |

#### Example: filter only `Deployment` Entities from last week

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
