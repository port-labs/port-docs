---
sidebar_position: 13
title: User Inputs
---

import DocCardList from '@theme/DocCardList';

# User Inputs

Each action has a `userInputs` section in its definition. In this section, you can define all of the user inputs you want your developers and users to fill when invoking the action.

## Structure

```json showLineNumbers
{
  "properties": {
    "myInput": {
      "title": "My input",
      "icon": "My icon",
      "description": "My input",
      "type": "input_type"
    }
  },
  "required": ["myInput"]
}
```

The different components that make up a basic user input definition are listed in the following table:

| Field         | Description                                                                                                                                                                                             |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `title`       | The input's title.                                                                                                                                                                                             |
| `type`        | **Mandatory field.** The input's data type.                                                                                                                                                        |
| `icon`        | The input's icon. See the [full icon list](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/setup-blueprint.md#full-icon-list) for the available icons.                                 |
| `description` | A description that can be used to provide detailed information about a specific input or the way it should be used. |
| `default`     | A default value for this input in case the action is executed without explicitly providing a value.                                                                                     |

:::tip property structure
The name of the input is the key of the input object. For example, in the code block above, the name of the input is `myInput`.

Note that all of the [properties](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/properties.md#supported-properties) available for Port blueprints can also be used as user inputs, which is why they follow the same structure.
:::

## Supported input types

<DocCardList />

## Special `string` formats

In addition to the `string` formats available in the [Blueprint properties](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/#supported-properties) section, Port's actions also support the following special formats:

| `type`       | Description                                     | Example values                                  |
| ------------ | ----------------------------------------------- | ----------------------------------------------- |
| `entity`     | An entity of a specified blueprint              | `"notifications-service"`                       |
| `array`      | An array of entities from a specified blueprint | `["notifications-service", "frontend-service"]` |

### Entity

```json showLineNumbers
"entity_prop": {
    "title": "My string prop",
    // highlight-start
    "type": "string",
    "format": "entity",
    "blueprint": "microservice",
    // highlight-end
    "description": "This is an entity property"
}
```

When `"format": "entity"` is used, a `blueprint` field is available.

The `blueprint` field takes an identifier of an existing blueprint. Then, when executing the configured action from Port's UI, the specified field will include a list of existing entities of the selected blueprint from your software catalog to choose from.

### Entity array

```json showLineNumbers
"entity_prop": {
    "title": "My string prop",
    "description": "This property is an array of Entities",
    // highlight-start
    "type": "array",
    "items": {
      "type": "string",
      "blueprint": "service",
      "format": "entity"
    }
    // highlight-end
}
```

When `"type": "array"` is used, you can create an `items` property. Under this `items` property you can use `"format": "entity"` and write the identifier of the selected `blueprint` which you want to include entities from. You can then pass an entity array to your action.

## Ordering user inputs

You can define the order in which the user inputs will be displayed in the UI by using the `order` field. This field is an array of the input names:

```json showLineNumbers
{
  "properties": {
    "myInput1": {
      "title": "My input 1",
      "icon": "My icon 1",
      "description": "My input 1",
      "type": "input_type"
    },
    "myInput2": {
      "title": "My input 2",
      "icon": "My icon 2",
      "description": "My input 2",
      "type": "input_type"
    }
  },
  "required": [],
  "order": ["myInput2", "myInput1"]
}
```
