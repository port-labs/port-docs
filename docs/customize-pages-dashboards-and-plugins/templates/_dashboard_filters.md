## Dashboard filters

Dashboard filters allow you to apply selected filters **across all supported widgets** within a dashboard at once.  
This makes it easier to explore data consistently, without having to filter each widget individually.

### Supported widgets

Dashboard filters currently apply to the following widgets:

- [Number chart](/customize-pages-dashboards-and-plugins/dashboards/data-widgets/#number-chart)
- [Pie chart](/customize-pages-dashboards-and-plugins/dashboards/data-widgets/#pie-chart)
- [Line chart](/customize-pages-dashboards-and-plugins/dashboards/data-widgets/#line-chart)
- [Table](/customize-pages-dashboards-and-plugins/dashboards/data-widgets/#table)

### Supported filter types

When creating a dashboard filter, you can choose between:

- **Basic properties** - Meta properties that apply across all blueprints in the dashboard.
- **Blueprint-specific properties** - Properties from a specific blueprint that is selected in one or more widgets in the dashboard.

The blueprint dropdown will only show blueprints that are used in widgets within the dashboard. For example, if a widget uses the `microservice` blueprint, `microservice` will appear as an option in the filter dropdown.

<img src='/img/software-catalog/pages/dashboardFilterBlueprintServiceExample.png' width='80%' style={{borderRadius:'8px'}} border='1px'/>
<br></br><br></br>

:::info Filter scope
Filters applied to a specific blueprint will only affect widgets that are relevant to that blueprint in the dashboard.  
Filters applied to basic properties will affect all supported widgets across all blueprints.
:::

**Basic properties**

When selecting **Basic properties**, you can filter on the following meta properties:

- **Owning teams:**
  - Filter entities based on selected team(s).
  - Use the `My Teams` option to dynamically filter entities relevant to the current user.
  - Applies only to blueprints that include an `Owning Team` property.
- **Title:** Filter entities by their entity title using different [string operators](/search-and-query/operators/comparison-operators).
- **Identifier:** Filter entities by their identifier using different [string operators](/search-and-query/structure-and-syntax).

**Blueprint properties**

When selecting a specific blueprint (e.g., `service`), you can filter on any property defined for that blueprint, including:

- **Owning teams:** Filter entities of that specific blueprint based on selected team(s). This differs from filtering on owning team using basic properties, which applies across all blueprints.
- **Any other blueprint property:** Filter on any property defined in the selected blueprint using the appropriate [comparison operators](/search-and-query/operators/comparison-operators) for that property type.

For example, you can filter on owning team across all dashboard blueprints by selecting **Basic properties → Owning teams**, or you can filter on owning team only for the `service` blueprint by selecting **Service → Owning teams**.

Below is an example dashboard with **two types of filters applied**:

1. A **Blueprint properties** filter on the `microservice` blueprint that excludes entities where `language = Ruby`. This filter only affects widgets that display `microservice` data.
2. A **Basic properties** filter on **Owning teams**, which applies to *all* supported widgets in the dashboard, regardless of blueprint.

In the example, the **Services by language** widget reflects the blueprint filter by omitting microservices with `language = Ruby`, while every widget is narrowed by the **Owning teams** filter to show only entities associated with the selected team(s).

<img src='/img/software-catalog/pages/dashboardFiltersExample.png' width='80%' border='1px' style={{borderRadius:'8px'}}/>

### Permissions

**Admin role:** As an admin (or a member with edit permissions for the dashboard), you can add, edit, or remove filters from the dashboard page. Then, save the view to apply it for other users.

**Member role:** As a member, you can view and edit the operator and value of the current filters within the page (unless the page is locked).

<img src='/img/software-catalog/pages/dashboardFiltersMemberEdit.png' width='80%' border='1px' style={{borderRadius:'8px'}}/>
