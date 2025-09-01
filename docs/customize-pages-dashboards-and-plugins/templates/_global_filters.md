## Global filters

**Global filters** allow you to apply selected meta property filters **across all supported widgets** within a dashboard at once. This makes it easier to explore data consistently, without having to filter each widget individually.

### Supported widgets

Global filters currently apply to the following widgets:

- [Number chart](/customize-pages-dashboards-and-plugins/dashboards/#number-chart)
- [Pie chart](/customize-pages-dashboards-and-plugins/dashboards/#pie-chart)
- [Line chart](/customize-pages-dashboards-and-plugins/dashboards/#line-chart)
- [Table](/customize-pages-dashboards-and-plugins/dashboards/#table)


### Supported meta properties

Global filters can be applied to the following properties:
- **Owning teams:**
  - Filter entities based on selected team(s).
  - Use the `My Teams` option to dynamically filter entities relevant to the current user.
  - Applies only to blueprints that include an `Owning Team` property.
- **Title:** Filter entities by their title using different [string operators](/search-and-query/comparison-operators).
- **Identifier:** Filter entities by their identifier using different [string operators](/search-and-query/comparison-operators).

### Permissions

**Admin role:** As an admin (or a member with edit permissions for the dashboard), you can add, edit, or remove filters from the dashboard page. Then, save the view to apply it for other users.

**Member role:** As a member, you can view and edit the operator and value of the current filters within the page (unless the page is locked).

<img src='/img/software-catalog/pages/globalFiltersMemberEdit.png' width='70%' />
