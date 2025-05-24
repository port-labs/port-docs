---
title: Setup Actions
---

import ApiRef from "/docs/api-reference/\_learn_more_reference.mdx";

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortTooltip from "/src/components/tooltip/tooltip.jsx"

# Setup frontend

<center>

<iframe width="568" height="320" src="https://www.youtube.com/embed/DhDQ_lucdgM" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen allow="fullscreen;"></iframe>

</center>
<br/>

After selecting the blueprint you want to add an action to, we need to define the action's frontend - its structure and interface.

This is done in the first two tabs (**Basic Details**, **User Form**) of the action creation form in Port's UI:

<img src='/img/self-service-actions/setup-frontend/actionFormFrontend.png' width='60%' border='1px' />
<br/><br/>

Click [here](/actions-and-automations/create-self-service-experiences/#action-json-structure) for a reminder of an action's JSON structure.

## Basic details

Here we will define the action's `title`, `icon`, and `description`.

We will also choose the action's `operation` type:

- **Create** - the action will result in the creation of a new <PortTooltip id="entity">entity</PortTooltip> in Port by triggering a provisioning process in your infrastructure. Since these actions create a new entity, they are not tied to an existing entity in your software catalog.
- **Delete** - the action will result in the deletion of an existing entity by triggering delete logic in your infrastructure.
- **Day-2** - the action will trigger logic in your infrastructure to update or modify an existing entity in your catalog.

Actions can (but do not have to) be tied to a specific `blueprint`. Selecting a blueprint will allow you to easily execute the action on entities created from that blueprint. 

We can also define the execution button's label in the `Action card button text` field.

:::info Button default value
If the `Action card button text` field is left empty, the button label will default to `Create`, `Execute` or `Delete`, according to the chosen `operation` type.
:::

#### Conditions

The `condition` field allows you to define rules using Port's [search & query syntax](/search-and-query/#rules) to determine which entities the action will be available for.  

:::info Requirements
- Since conditions require an existing entity to evaluate, they are only available for actions with `DAY-2` or `DELETE` operations.
- For the same reason, the action must be tied to a blueprint (see above).
:::

The following example shows a condition that will make the action available only for entities with a property named `environment` that has the value `production`:

```yaml
{
  "type": "SEARCH",
  "rules": [
    {
      "operator": "=",
      "property": "environment",
      "value": "production"
    }
  ],
  "combinator": "and"
}
```

Note that the `combinator` field can be set to `and` or `or`, to define how multiple rules should be combined.

## User form

Port allows you to create a wizard-like experience for your developers by utilizing a variety of input types they will need to fill, while also including input validations.  

This is done in the **User Form** tab of the action creation form:

<img src='/img/self-service-actions/setup-frontend/actionFormUserForm.png' width='80%' border='1px' />

### Input types

Actions can contain a variety of input types, including text fields, dropdowns, numbers, and much more.

See the [user inputs](./user-inputs/user-inputs.md) page for more details about the available input types.

### Titles

Titles can be used to create visual and logical groupings of inputs, by dividing the form into sections.  

To add a title, click the `+ Title` button in the form (see the screenshot above).

- When creating a title, you can also provide a `description` to help the user understand each section's purpose. The description will be displayed below the title.
- You can add any number of titles to a form.
- After adding titles and/or inputs, you can reorder them by dragging and dropping.

When a user executes the action, he/she will see the titles and their inputs in the order they were defined:

<img src='/img/self-service-actions/setup-frontend/actionFormTitleExample.png' width='50%' border='1px' />

### Steps

In cases where an action contains a large number of inputs, you may want to break the form into multiple steps. Users executing the action will see and fill each step at a time, which can help guide them through the process and make the action easier to understand.  

In the UI, after creating at least one input, a `+ Step` button will appear (see the screenshot above).

Each step can contain multiple inputs, and you can define as many steps as you need.

When a user executes the action, he/she will see the steps and their inputs in the order they were defined:

<img src='/img/self-service-actions/setup-frontend/actionFormStepsExecution.png' width='50%' border='1px' />
*After clicking `Next`, the form will move to step 2, requiring the user to fill the inputs defined in that step*

### Advanced configurations

You can define more advanced forms with dynamic fields that change according to your data or other inputs in the form.  
See [advanced input configurations](/actions-and-automations/create-self-service-experiences/setup-ui-for-action/advanced-form-configurations) for more information and examples.

## Next step

Once the frontend is set up, we will move on to the action's [backend configuration](/actions-and-automations/setup-backend/).
