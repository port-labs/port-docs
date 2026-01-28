---
sidebar_position: 2
title: Text
sidebar_class_name: "custom-sidebar-item sidebar-property-string"
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Text

Text is a basic input for textual information.

## Common usage

The text input type can be used for:

- Service names
- Version tags
- Commit SHAs
- Configuration values
- Custom messages

## Definition

<Tabs groupId="definition" queryString defaultValue="basic" values={[
{label: "Basic", value: "basic"},
{label: "Select (enum)", value: "enum"},
{label: "Multi-line", value: "multiline"}
]}>

<TabItem value="basic">

```json showLineNumbers
{
  "serviceName": {
    "title": "Service Name",
    "description": "The name of the service",
    "type": "string",
    "default": "my-service"
  }
}
```

</TabItem>
<TabItem value="enum">

```json showLineNumbers
{
  "environment": {
    "title": "Environment",
    "description": "Target environment",
    "type": "string",
    "enum": ["development", "staging", "production"],
    "enumColors": {
      "development": "blue",
      "staging": "orange",
      "production": "green"
    }
  }
}
```

</TabItem>
<TabItem value="multiline">

```json showLineNumbers
{
  "notes": {
    "title": "Release Notes",
    "description": "Notes for this release",
    "type": "string",
    "format": "multi-line"
  }
}
```

</TabItem>
</Tabs>

## Properties

| Property | Type | Description |
| -------- | ---- | ----------- |
| `type` | `"string"` | **Required.** Must be `"string"` |
| `format` | `"none"` \| `"multi-line"` | Optional format. Use `"multi-line"` for textarea input |
| `default` | `string` | Default value |
| `enum` | `string[]` | List of allowed values (creates a dropdown) |
| `enumColors` | `object` | Colors for enum values (e.g., `{"value": "blue"}`) |

## Dynamic default

Use a JQ expression to set a dynamic default:

```json showLineNumbers
{
  "serviceName": {
    "title": "Service Name",
    "type": "string",
    "default": {
      "jqQuery": ".inputs.prefix + \"-service\""
    },
    "dependsOn": ["prefix"]
  }
}
```
