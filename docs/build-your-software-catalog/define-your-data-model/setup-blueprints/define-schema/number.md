---
sidebar_position: 2
description: Number is a primitive data type used to save numeric data
---

# Number

Number is a primitive data type used to save numeric data

## Use cases & examples

The number property type can be used to store any numeric data, for example:

- Core counts;
- Memory/storage allocations;
- Replica counts;
- Number of open issues;
- etc.

## Basic definition

```json showLineNumbers
{
  "title": "Number Property",
  // highlight-start
  "type": "number",
  // highlight-end
  "icon": "Cluster",
  "description": "A number property",
  "default": 7
}
```

## Enum definition

```json showLineNumbers
{
  "title": "Core count",
  "type": "number",
  "icon": "Cluster",
  "description": "Number of cores",
  // highlight-next-line
  "enum": [1, 2, 3, 4]
}
```

## Array definition

```json showLineNumbers
{
  "type": "array",
  "items": {
    "type": "number"
  }
}
```
