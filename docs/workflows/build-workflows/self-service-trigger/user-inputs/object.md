---
sidebar_position: 12
title: Object
sidebar_class_name: "custom-sidebar-item sidebar-property-object"
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Object

Object inputs allow users to provide JSON objects.

## Common usage

The object input type can be used for:

- Configuration objects
- Custom metadata
- Key-value pairs
- Complex structured data

## Definition

<Tabs groupId="definition" queryString defaultValue="basic" values={[
{label: "Basic", value: "basic"},
{label: "With Schema", value: "schema"},
{label: "Labeled URL", value: "labeledUrl"}
]}>

<TabItem value="basic">

```json showLineNumbers
{
  "metadata": {
    "title": "Metadata",
    "description": "Additional metadata",
    "type": "object"
  }
}
```

</TabItem>
<TabItem value="schema">

```json showLineNumbers
{
  "config": {
    "title": "Configuration",
    "description": "Service configuration",
    "type": "object",
    "properties": {
      "replicas": {
        "type": "number"
      },
      "memory": {
        "type": "string"
      }
    },
    "required": ["replicas"]
  }
}
```

</TabItem>
<TabItem value="labeledUrl">

```json showLineNumbers
{
  "documentationLink": {
    "title": "Documentation Link",
    "description": "Link to documentation",
    "type": "object",
    "format": "labeled-url"
  }
}
```

A labeled URL has the structure:
```json
{
  "url": "https://docs.example.com",
  "displayText": "Documentation"
}
```

</TabItem>
</Tabs>

## Properties

| Property | Type | Description |
| -------- | ---- | ----------- |
| `type` | `"object"` | **Required.** Must be `"object"` |
| `format` | `"none"` \| `"labeled-url"` | Optional format |
| `default` | `object` | Default object value |
| `properties` | `object` | JSON Schema for object properties |
| `required` | `string[]` | Required properties within the object |
| `additionalProperties` | `boolean` | Whether to allow properties not in schema |
