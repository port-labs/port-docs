---
sidebar_position: 5
title: Entity
sidebar_class_name: "custom-sidebar-item sidebar-property-entity"
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Entity

Entity inputs allow users to select an entity from your software catalog.

## Common usage

The entity input type can be used for:

- Selecting a service to deploy
- Choosing an environment
- Picking a cloud resource
- Referencing related entities

## Definition

<Tabs groupId="definition" queryString defaultValue="basic" values={[
{label: "Basic", value: "basic"},
{label: "With Dataset Filter", value: "dataset"},
{label: "Array", value: "array"}
]}>

<TabItem value="basic">

```json showLineNumbers
{
  "service": {
    "title": "Service",
    "description": "Select a service to deploy",
    "type": "string",
    "format": "entity",
    "blueprint": "service"
  }
}
```

</TabItem>
<TabItem value="dataset">

```json showLineNumbers
{
  "service": {
    "title": "Service",
    "description": "Select a production service",
    "type": "string",
    "format": "entity",
    "blueprint": "service",
    "dataset": {
      "combinator": "and",
      "rules": [
        {
          "property": "environment",
          "operator": "=",
          "value": "production"
        }
      ]
    }
  }
}
```

</TabItem>
<TabItem value="array">

```json showLineNumbers
{
  "services": {
    "title": "Services",
    "description": "Select multiple services",
    "type": "array",
    "items": {
      "type": "string",
      "format": "entity",
      "blueprint": "service"
    }
  }
}
```

</TabItem>
</Tabs>

## Properties

| Property | Type | Description |
| -------- | ---- | ----------- |
| `type` | `"string"` | **Required.** Must be `"string"` |
| `format` | `"entity"` | **Required.** Must be `"entity"` |
| `blueprint` | `string` | **Required.** The blueprint identifier to select entities from |
| `default` | `string` | Default entity identifier |
| `dataset` | `object` | Filter to limit available entities |
| `sort` | `object` | Sort configuration with `property` and `order` (`ASC` or `DESC`) |

## Dataset filtering

Use the `dataset` property to filter which entities are available for selection:

```json showLineNumbers
{
  "service": {
    "type": "string",
    "format": "entity",
    "blueprint": "service",
    "dataset": {
      "combinator": "and",
      "rules": [
        {
          "property": "tier",
          "operator": "=",
          "value": "critical"
        },
        {
          "property": "status",
          "operator": "!=",
          "value": "deprecated"
        }
      ]
    }
  }
}
```

## Sorting results

Sort the entity list by a property:

```json showLineNumbers
{
  "service": {
    "type": "string",
    "format": "entity",
    "blueprint": "service",
    "sort": {
      "property": "title",
      "order": "ASC"
    }
  }
}
```
