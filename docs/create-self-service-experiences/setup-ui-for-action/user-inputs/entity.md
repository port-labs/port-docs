---
sidebar_position: 4
description: Entity is an input used to reference existing entities from the software catalog when triggering actions
sidebar_class_name: "custom-sidebar-item sidebar-property-entity"
---

import ApiRef from "../../../api-reference/\_learn_more_reference.mdx"

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Entity

Entity is an input type used to reference existing [entities](../../../build-your-software-catalog/sync-data-to-catalog/sync-data-to-catalog.md#creating-entities) from the software catalog when triggering actions.

## 💡 Common entity usage

The entity input type can be used to reference any existing entity from the software catalog, for example:

- Cloud regions
- Clusters
- Configurations

In the [live demo](https://demo.getport.io/self-serve) self-service hub page, we can see the **scaffold new service** action whose `Domain` input is an entity input. 🎬

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
    "blueprint": "myBlueprint"
    // highlight-end
  }
}
```

### Structure table

| Field                        | Description                                                                               | Notes                                                       |
| ---------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `"format": "entity"`         | Used to specify that this is an entity input                                              | **Required**                                                |
| `"blueprint": "myBlueprint"` | Used to specify the identifier of the target blueprint that entities will be queried from | **Required**. Must specify an existing blueprint identifier |

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
    "blueprint": "myBlueprint"
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
