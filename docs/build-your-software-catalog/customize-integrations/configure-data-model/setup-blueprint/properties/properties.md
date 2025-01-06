---
sidebar_position: 1
---

import DocCardList from '@theme/DocCardList';
import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Properties

Properties are customizable data fields of [blueprints](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/), used to save and display information from external data sources.

## Configure properties in Port

You can create, delete, or edit properties via the builder page or directly from the software catalog.

### From the builder page

**To edit an existing property:**

1. Go to your [Builder page](https://app.getport.io/settings).
2. Expand the blueprint you want to edit by double-clicking on it.
3. Under the `Properties` tab, click on the property you want to edit.
4. Make your desired changes to the form, then click `Save`.

**To create a new property:**

1. Go to your [Builder page](https://app.getport.io/settings).
2. Expand the blueprint you want to edit by double-clicking on it.
3. Click on the `+ New property` button in the bottom of the tab:

<img src='/img/software-catalog/customize-integrations/createNewProperty.png' width='35%' border='1px' />
<br/><br/>

4. Fill in the form with the desired property details, including the [property type](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/#supported-properties), then click `Create`.

### From the software catalog

Each catalog page in your software catalog contains a table with all entities created from a certain blueprint. You can modify the properties of the blueprint directly from this table:

1. Go to the desired page of your [software catalog](https://app.getport.io/organization/catalog).
2. In the top-right corner of the table are its filters, click on the `Manage properties` button:
    
    <img src='/img/software-catalog/customize-integrations/managePropertiesFromCatalog.png' width='60%' border='1px' />
    <br/>

3. A dropdown will appear showing all of the properties.  
   To modify or delete a property, hover over the it and click on the `...` icon: 
    <img src='/img/software-catalog/customize-integrations/managePropertiesDropdown.png' width='30%' border='1px' />
    <br/>
    **Note** that [meta-properties](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/meta-properties) are not editable, so you will not see a `...` icon next to them.

4. To create a new property in the blueprint, click on the `+ Property` button in the bottom of the dropdown.

:::tip Hiding properties
You can also hide properties from the table by clicking on the toggle on the right side of the property name. 
:::

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