---
sidebar_position: 1
---

import DocCardList from '@theme/DocCardList';

# Properties

Each blueprint has a `properties` section under its `schema`. In this section, you can define all of the unique properties that describe your asset.

## Structure

```json showLineNumbers
{
  "myProp": {
    "title": "My property",
    "icon": "My icon",
    "description": "My property",
    "type": "property_type"
  }
}
```

The different components that make up a basic property definition are listed in the following table:

| Field         | Description                                                                                                                                                                        |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `title`       | Property title                                                                                                                                                                     |
| `type`        | **Mandatory field.** The data type of the property.                                                                                                                                |
| `icon`        | Icon for the property <br /><br />See the [full icon list](../setup-blueprint.md#full-icon-list).                                                                                  |
| `description` | Description of the property.<br /> This value is visible to users when hovering on the info icon in the UI. It provides detailed information about the use of a specific property. |
| `default`     | Default value for this property in case an entity is created without explicitly providing a value.                                                                                 |

:::tip
The name of the property is the key of the property object. For example, in the code block above, the name of the property is `myProp`
:::

## Supported properties

<DocCardList />

## Miscellaneous

### Available enum colors

Properties defined using [enum](./string.md?api-definition=enum#api-definition) can also include specific colors for the different values available in the property definition, the available enum colors are:

```showLineNumbers text
blue
turquoise
orange
purple
pink
yellow
green
red
darkGray
lightGray
bronze
```
