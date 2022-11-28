---
sidebar_position: 5
---

# Pie Chart

You can create a pie chart illustrating your catalog data divided by a specific category inside a specfic entity page [**Specific Entity Page**](../port-components/page.md#entity-page).

## Creating visualization

- On the top right of the page click on `Add Visualization` button:
- Select Pie Chart

![Dropdown](../../../static/img/platform-overview/widgets/AddPieChartVisualization.png)

- Fill out the form and click save:

![Dropdown](../../../static/img/platform-overview/widgets/AddPieChartForm.png)

## Editing visualization

- On the top right of the pie chart widget click on the three dots icon
- Select your desired action (delete/edit)

![Dropdown](../../../static/img/platform-overview/widgets/EditOrDeleteWidget.png)

## Visualization properties

| Field                   | Type     | Description                                                                                                            | Default | Required |
| ----------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------- | ------- | -------- |
| `Title`                 | `String` | The title of the visualization                                                                                         | `null`  | `true`   |
| `Icon`                  | `String` | The icon of the visualization                                                                                          | `null`  | `false`  |
| `Description`           | `String` | A short description to describe the visualization                                                                      | `null`  | `false`  |
| `Blueprint`             | `String` | The chart will display data about entities of the chosen blueprint that are related to this ServiceInEnv               | `null`  | `true`   |
| `Breakdown by property` | `String` | Group your chart by a specific property                                                                                | `null`  | `true`   |
| `Filters`               | `Array`  | Filters to include or exclue specific data [Read more](https://docs.getport.io/tutorials/search-in-port/#search-rules) | []      | `false`  |
