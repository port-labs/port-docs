---
sidebar_position: 1
---

# Page

## What is a Page?

A page is a viewing component that displays Entity data in different forms such as a table form, data summary, etc.

### Basic concepts of pages

- Blueprint default page is automatically created when a Blueprint is created, and is located in the navigation bar. It contains a single table widget.
- Pages are dynamic - you can create multiple pages that display different data according to the filters you set in advance.
- Entity pages automatically appear for each new Entity you create.

### Pages architecture

#### Page widgets

Widgets enhance the content of your developer portal with different visual views based on the data ingested into Port.

A page can hold a single widget or multiple widgets, for example:

- A full table view widget;
- A markdown widget with the README of a service;
- etc.

To learn more, refer to the [Widgets](../widgets/widgets.md) section.

#### Page tabs

A tab is a sub-page within a page.

Pages can be separated into several tabs, each of which is a page that holds one or many widgets.

**Default Tabs:**

- Overview
- Runs
- Audit Log

## Blueprint Page

A full page table widget that holds all of the Blueprints specific Entities.

![Microservice blueprint page](../../../static/img/software-catalog/pages/MicroserviceBlueprintPage.png)

## Page operations

Each page type has a set of operations that can be performed from the UI.  
The table below summarizes the available operations according to the page type:

| Page type                                                                          | Save a view | Save view as<br /> a new page | Edit page | Delete page |
| ---------------------------------------------------------------------------------- | :---------: | :---------------------------: | :-------: | :---------: |
| Blueprint page (Default Page)                                                      |     ✅      |              ✅               |    ❌     |     ❌      |
| [Entity page](../entity/entity.md#entity-page)                                     |     ✅      |              ❌               |    ❌     |     ❌      |
| [Users page](../role-based-access-control/users-and-teams-management.md#users-tab) |     ✅      |              ❌               |    ❌     |     ❌      |
| Audit log page                                                                     |     ✅      |              ❌               |    ❌     |     ❌      |
| Custom page (generated from save as new page)                                      |     ✅      |              ✅               |    ✅     |     ✅      |

:::info Default page
The default page is automatically created when a new Blueprint is created. That page is directly tied to its Blueprint and it cannot be edited or deleted.

In order to edit or delete the default Blueprint page, the Blueprint itself should be edited or deleted.

It is possible to filter, sort, group by and use the table widget controls to change the layout of the default Blueprint page directly from the default page.
:::

All page operations are available on the right top bar, as shown here: (In accordance with the table above)

![Page operations marked](../../../static/img/software-catalog/pages/PageOperationsMarked.png)

### Saving views

Every change made on a specific page, such as filtering or sorting, enables the `Save this view` button.  
Clicking on it will save the new view for all users.

:::note
The ability to save a view for all users is available only for the [Admin role](../role-based-access-control/permissions-controls.md#roles)
:::

### Saving new pages

Each time a change is made on a page, and the `Save this view` becomes enabled, you can press the small arrow on its right side to open the dropdown menu:

<center>

![Save view menu button marked](../../../static/img/software-catalog/pages/SaveViewDropMenuButton.png)

</center>

After clicking the `Save as a new page` button, a window will pop up:

![Save as a new page popup](../../../static/img/software-catalog/pages/SaveAPageForm.png)

:::note
When saving a new page or editing an existing one, a set of icons is available to you:

<center>

![Page Icons dropdown menu](../../../static/img/software-catalog/pages/PageIcons.png)

</center>
:::

### Edit or delete a page

#### Editing pages

By clicking the `...` button on the top right corner, you can edit the page name and its icon.

<center>

![Page menu](../../../static/img/software-catalog/pages/PageMenu.png)

</center>

Editing a page:

![Edit Page popup window](../../../static/img/software-catalog/pages/EditPageForm.png)

#### Deleting pages

:::note
An Entity page is deleted automatically when the connected Entity is deleted.
:::

## Table operations

Table operations are used to define the user’s view of the Port platform.

:::tip
We highly recommend using the table operations to provide a clean and accurate view of the platform for your developers.

:::

All table operations are available on the top bar of the table:

![Table operations bar](../../../static/img/software-catalog/pages/TableOperationsBar.png)

### Filter

Filtering a table is done using the following menu:

![Table filter menu marked](../../../static/img/software-catalog/pages/TableFilterMenu.png)

You can define any filtering operator with a suitable value, in order to filter anything.

You can filter according to one or many fields while setting the relation between each field filter: `And/Or`.

### Sort

Sorting the table is done on the following menu:

![Table sort menu marked](../../../static/img/software-catalog/pages/TableSortMenu.png)

You can sort by one or more fields of any kind.

:::tip
Sorting a specific column can be done by clicking on the column title.
:::

### Hide

Hiding table columns is done on the following menu:

![Table hide menu marked](../../../static/img/software-catalog/pages/TableHideMenu.png)

You can decide whether each field is viewable to users or not.

:::tip
We highly recommend hiding irrelevant data from users, in order to provide them a clean work environment with few irrelevant distractions.
:::

### Group By

Grouping by Entities is done on the following menu:

![Table group by menu marked](../../../static/img/software-catalog/pages/TableGroupByMenu.png)

You can group results according to any field in the table.

:::tip
Group by is recommended when you want to create custom views for users, such as Microservices by Owners.

Just create your `group by` setting, add additional viewing settings if needed, and [save a new page](#saving-new-pages) from the custom view.
:::

### Search

We provide a free text search option on tables. Searching on a table is available on the left side of the top bar:

![Table search bar marked](../../../static/img/software-catalog/pages/TableSearchBar.png)

[Explore how to control page visibility with basic examples](./tutorial.md)

[Dive into advanced operations on Pages with our API ➡️ ](../../api-providers/rest.md)
