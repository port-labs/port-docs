---
sidebar_position: 3
title: Number
sidebar_class_name: "custom-sidebar-item sidebar-property-number"
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Number

Number inputs accept numeric values.

## Common usage

The number input type can be used for:

- Replica counts
- Port numbers
- Memory/CPU limits
- Timeout values
- Version numbers

## Definition

<Tabs groupId="definition" queryString defaultValue="basic" values={[
{label: "Basic", value: "basic"},
{label: "With Range", value: "range"},
{label: "Select (Enum)", value: "enum"}
]}>

<TabItem value="basic">

```json showLineNumbers
{
  "replicas": {
    "title": "Number of Replicas",
    "description": "How many replicas to deploy",
    "type": "number",
    "default": 1
  }
}
```

</TabItem>
<TabItem value="range">

```json showLineNumbers
{
  "cpuLimit": {
    "title": "CPU Limit",
    "description": "CPU limit in millicores",
    "type": "number",
    "minimum": 100,
    "maximum": 4000,
    "default": 500
  }
}
```

</TabItem>
<TabItem value="enum">

```json showLineNumbers
{
  "tier": {
    "title": "Service Tier",
    "description": "Select service tier",
    "type": "number",
    "enum": [1, 2, 3],
    "enumColors": {
      "1": "blue",
      "2": "orange",
      "3": "green"
    }
  }
}
```

</TabItem>
</Tabs>

## Properties

| Property | Type | Description |
| -------- | ---- | ----------- |
| `type` | `"number"` | **Required.** Must be `"number"` |
| `default` | `number` | Default value |
| `minimum` | `number` | Minimum allowed value (inclusive) |
| `maximum` | `number` | Maximum allowed value (inclusive) |
| `exclusiveMinimum` | `number` | Minimum allowed value (exclusive) |
| `exclusiveMaximum` | `number` | Maximum allowed value (exclusive) |
| `enum` | `number[]` | List of allowed values (creates a dropdown) |
| `enumColors` | `object` | Colors for enum values |

## Dynamic default

Use a JQ expression to set a dynamic default based on other inputs:

```json showLineNumbers
{
  "replicas": {
    "title": "Replicas",
    "type": "number",
    "default": {
      "jqQuery": "if .inputs.environment == \"production\" then 3 else 1 end"
    },
    "dependsOn": ["environment"]
  }
}
```
