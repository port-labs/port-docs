---
sidebar_position: 1
description: String is a primitive data type used to save text data
---

# String

String is a primitive data type used to save text data.

## Use cases & examples

The string property type can be used to store any text based data, for example:

- Descriptions;
- Variable keys;
- Unique identifiers and UUIDs;
- File names;
- etc.

## Basic definition

```json showLineNumbers
{
  "title": "String Property",
  // highlight-start
  "type": "string",
  // highlight-end
  "icon": "Cluster",
  "description": "A string property",
  "default": "Prod"
}
```

## Enum definition

```json showLineNumbers
{
  "title": "Region",
  "type": "string",
  "icon": "Aws",
  "description": "Cloud provider region",
  // highlight-next-line
  "enum": ["eu-west-1", "eu-west-2", "us-east-1", "us-east-2"]
}
```

## Array definition

```json showLineNumbers
{
  "type": "array",
  "items": {
    "type": "string"
  }
}
```
