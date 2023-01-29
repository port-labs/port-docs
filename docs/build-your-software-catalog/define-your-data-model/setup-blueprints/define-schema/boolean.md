---
sidebar_position: 3
description: Boolean is a primitive data type that has one of two possible values - true and false
---

# Boolean

Boolean is a primitive data type that has one of two possible values - `true` and `false`

## Use cases & examples

The boolean property type can be used to store any true/false gate, for example:

- Is environment locked for deployments;
- Should environment perform nightly shutdown;
- Should environment perform morning startup;
- Is environment public;
- etc.

## Basic definition

```json showLineNumbers
{
  "title": "Boolean Property",
  // highlight-start
  "type": "boolean",
  // highlight-end
  "icon": "Cluster",
  "description": "A boolean property",
  "default": true
}
```
