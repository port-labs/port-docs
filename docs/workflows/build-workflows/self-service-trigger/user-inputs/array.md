---
sidebar_position: 11
title: Array
sidebar_class_name: "custom-sidebar-item sidebar-property-array"
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Array

Array inputs allow users to provide a list of values.

## Common usage

The array input type can be used for:

- Multiple tags or labels
- List of services to deploy
- Multiple email recipients
- Configuration lists

## Definition

<Tabs groupId="definition" queryString defaultValue="strings" values={[
{label: "String array", value: "strings"},
{label: "Number array", value: "numbers"},
{label: "Entity array", value: "entities"}
]}>

<TabItem value="strings">

```json showLineNumbers
{
  "tags": {
    "title": "Tags",
    "description": "Tags to apply to the resource",
    "type": "array",
    "items": {
      "type": "string"
    }
  }
}
```

</TabItem>
<TabItem value="numbers">

```json showLineNumbers
{
  "ports": {
    "title": "Ports",
    "description": "Ports to expose",
    "type": "array",
    "items": {
      "type": "number"
    }
  }
}
```

</TabItem>
<TabItem value="entities">

```json showLineNumbers
{
  "services": {
    "title": "Services",
    "description": "Services to include",
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
| `type` | `"array"` | **Required.** Must be `"array"` |
| `items` | `object` | **Required.** Schema for array items |
| `default` | `array` | Default array value |
| `minItems` | `number` | Minimum number of items |
| `maxItems` | `number` | Maximum number of items |
| `uniqueItems` | `boolean` | Whether items must be unique |

## Enum array

Create a multi-select dropdown:

```json showLineNumbers
{
  "regions": {
    "title": "Regions",
    "description": "Regions to deploy to",
    "type": "array",
    "items": {
      "type": "string",
      "enum": ["us-east-1", "us-west-2", "eu-west-1", "ap-southeast-1"]
    }
  }
}
```
