---
title: User Inputs
---

import DocCardList from '@theme/DocCardList';

# User Inputs

Each action has a `userInputs` section in its definition. In this section, you can define all of the user inputs you want your developers and users to fill when invoking the action.

## Structure

```json showLineNumbers
{
  "myInput": {
    "title": "My input",
    "icon": "My icon",
    "description": "My input",
    "type": "input_type"
  }
}
```

The different components that make up a basic input definition are listed in the following table:

| Field         | Description                                                                                                                                                                                             |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `title`       | Property name                                                                                                                                                                                           |
| `type`        | **Mandatory field.** The data type of the property.                                                                                                                                                     |
| `icon`        | Icon for the input <br /><br />See the [full icon list](../../../build-your-software-catalog/define-your-data-model/setup-blueprint/setup-blueprint.md#full-icon-list).                                 |
| `description` | Description of the input.<br /> This value is visible to users when hovering on the info icon in the UI. It provides detailed information about the use of a specific input or the way it will be used. |
| `default`     | Default value for this input in case the self-service action will be executed without explicitly providing a value.                                                                                     |

:::tip property structure
Note that all of the [properties](../../../build-your-software-catalog/define-your-data-model/setup-blueprint/properties/properties.md#supported-properties) available for Port blueprints can also be used as user inputs, which is why they follow the same structure.
:::

## Supported user inputs

<DocCardList />
