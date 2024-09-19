---
sidebar_position: 4
description: Entity is an input used to reference existing entities from the software catalog when triggering actions
sidebar_class_name: "custom-sidebar-item sidebar-property-entity"
---

import ApiRef from "/docs/api-reference/\_learn_more_reference.mdx"

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Entity

Entity is an input type used to reference existing [entities](/build-your-software-catalog/sync-data-to-catalog/sync-data-to-catalog.md#entities) from the software catalog when triggering actions.

## 💡 Common entity usage

The entity input type can be used to reference any existing entity from the software catalog, for example:

- Cloud regions
- Clusters
- Configurations

In the [live demo](https://demo.getport.io/self-serve) self-service hub page, we can see the **scaffold new service** action whose `Domain` input is an entity input. 🎬

## Sorting entities

When using the `entity` input type, a user executing the action will see a dropdown list of entities from the specified blueprint.  
By default, the entities are sorted in **ascending** order based on the **entity's title**.

In some cases, you may have a large number of entities and want to sort them based on a specific property.  
The entities can be sorted in either **ascending** or **descending** order based on a specified property, provided that the property is not of type `object` or `array`.  

This is done in the action form when creating the entity input, for example:

<img src="/img/self-service-actions/setup-frontend/sortEntityInput.png" width="50%" border="1px" />
<br/><br/>

When executing the action, the entities will be sorted based on the specified property, in the selected order.  
In this case, they are sorted by `Last Update`, descending:

<img src="/img/self-service-actions/setup-frontend/sortedEntityInput.png" width="60%" border="1px" />
<br/><br/>

This can also be done when using Port's API, see the `sort` key in the JSON structure below.

## Entity input structure

The entity is represented by the unique `entity` _format_ and the `blueprint` key that accompanies it, as shown in the following section:

```json showLineNumbers
{
  "myEntityInput": {
    "title": "My entity input",
    "icon": "My icon",
    "description": "My entity input",
    // highlight-start
    "type": "string",
    "format": "entity",
    "blueprint": "myBp",
    "sort": {
      "property": "propertyIdentifier",
      // order should have either "ASC" or "DESC" value
      "order": "ASC/DESC"
    }
    // highlight-end
  }
}
```

### Structure table

| Field | Description | Notes |
| ----- | ----------- | ----- |
| `"format":"entity"` &nbsp; &nbsp; &nbsp; &nbsp; | Used to specify that this is an entity input | **Required** |
| `"blueprint":"myBp"` &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; | Used to specify the identifier of the target blueprint that entities will be queried from | **Required**. Must specify an existing blueprint identifier |
| `sort` | Used to specify the sorting order of the entities in the dropdown | Optional. Default is by entity's title, ascending |
| `sort.property` | The identifier of the property by which to sort the entities | |
| `sort.order` | Can be either `ASC` (ascending) or `DESC` (descending) | |

## API definition

<Tabs groupId="api-definition" queryString defaultValue="basic" values={[
{label: "Basic", value: "basic"},
{label: "Array", value: "array"}
]}>

<TabItem value="basic">

```json showLineNumbers
{
  "myEntityInput": {
    "title": "My entity input",
    "icon": "My icon",
    "description": "My entity input",
    // highlight-start
    "type": "string",
    "format": "entity",
    "blueprint": "myBlueprint",
    "sort": {
      "property": "propertyIdentifier",
      // order should have either "ASC" or "DESC" value
      "order": "ASC/DESC"
    }
    // highlight-end
  }
}
```

</TabItem>
<TabItem value="array">

```json showLineNumbers
{
  "EntityArrayInput": {
    "title": "My entity array input",
    "icon": "My icon",
    "description": "My entity array input",
    // highlight-start
    "type": "array",
    "items": {
      "type": "string",
      "format": "entity",
      "blueprint": "myBlueprint"
    }
    // highlight-end
  }
}
```

</TabItem>
</Tabs>

<ApiRef />

## Terraform definition

<Tabs groupId="tf-definition" queryString defaultValue="basic" values={[
{label: "Basic", value: "basic"},
{label: "Array", value: "array"}
]}>

<TabItem value="basic">

```hcl showLineNumbers
resource "port_action" "myAction" {
  # ...action properties
  # highlight-start
  user_properties = {
    string_props = {
      "myEntityInput" = {
        title       = "My entity input"
        description = "My entity input"
        format      = "entity"
        blueprint   = "myBlueprint"
      }
    }
  }
  # highlight-end
}
```

</TabItem>

<TabItem value="array">

```hcl showLineNumbers
resource "port_action" "myAction" {
  # ...action properties
  # highlight-start
  user_properties = {
    array_props = {
      "EntityArrayInput" = {
        title       = "My entity array input"
        description = "My entity array input"
        string_items = {
          format = "entity"
        }
      }
    }
  }
  # highlight-end
}
```

</TabItem>

</Tabs>
