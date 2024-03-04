---
sidebar_position: 1
---

import DocCardList from '@theme/DocCardList';
import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Properties

Properties are customizable data fields of [blueprints](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/), used to save and display information from external data sources.

## Configure properties in Port

<Tabs groupId="definition" queryString defaultValue="ui" values={[{label: "UI", value: "ui"}]}>

<TabItem value="ui">

<h4>To edit an existing property:</h4>

1. Go to your [Builder page](https://app.getport.io/dev-portal).
2. Expand the blueprint you want to edit by double-clicking on it.
3. Under the `Properties` tab, click on the property you want to edit.
4. Make your desired changes to the form, then click `Save`.

<h4>To create a new property:</h4>

1. Go to your [Builder page](https://app.getport.io/dev-portal).
2. Expand the blueprint you want to edit by double-clicking on it.
3. Click on the `+ New property` button in the bottom of the tab:

<img src='/img/software-catalog/customize-integrations/createNewProperty.png' width='35%' border='1px' />
<br/><br/>

4. Fill in the form with the desired property details, including the [property type](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/#supported-properties), then click `Create`.

</TabItem>
</Tabs>

## Structure

Each blueprint has a `properties` section under its `schema`. Each property is defined as an object with the following structure:

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

:::tip Property name
The name of the property is the key of the property object. For example, in the code block above, the name of the property is `myProp`.
:::

## Supported properties

<DocCardList />