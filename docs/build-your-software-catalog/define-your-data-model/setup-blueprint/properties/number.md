---
sidebar_position: 2
description: Number is a primitive data type used to save numeric data
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Number

Number is a primitive data type used to save numeric data

## Use cases 💡

The number property type can be used to store any numeric data, for example:

- Core counts;
- Memory/storage allocations;
- Replica counts;
- Number of open issues;
- etc.

In this [live demo](https://demo.getport.io/services) example, we can see the `JIRA Issues` number property. 🎬

## API definition

<Tabs groupId="api-definition" defaultValue="basic" values={[
{label: "Basic", value: "basic"},
{label: "Enum", value: "enum"},
{label: "Array", value: "array"}
]}>

<TabItem value="basic">

```json showLineNumbers
{
  "myNumberProp": {
    "title": "My number",
    "icon": "My icon",
    "description": "My number property",
    // highlight-start
    "type": "number",
    // highlight-end
    "default": 7
  }
}
```

</TabItem>
<TabItem value="enum">

```json showLineNumbers
{
  "myNumberEnum": {
    "title": "My number enum",
    "icon": "My icon",
    "description": "My number enum",
    "type": "number",
    // highlight-next-line
    "enum": [1, 2, 3, 4]
  }
}
```

</TabItem>
<TabItem value="array">

```json showLineNumbers
{
  "myNumberArray": {
    "title": "My number array",
    "icon": "My icon",
    "description": "My number array",
    // highlight-start
    "type": "array",
    "items": {
      "type": "number"
    }
    // highlight-end
  }
}
```

</TabItem>
</Tabs>

## Terraform definition

<Tabs groupId="tf-definition" defaultValue="basic" values={[
{label: "Basic", value: "basic"},
{label: "Enum - coming soon", value: "enum"},
{label: "Array - coming soon", value: "array"}
]}>

<TabItem value="basic">

```hcl showLineNumbers
resource "port-labs_blueprint" "myBlueprint" {
  # ...blueprint properties
  # highlight-start
  properties {
    identifier = "myNumberProp"
    title      = "My number"
    required   = false
    type       = "number"
  }
  # highlight-end
}
```

</TabItem>
</Tabs>

## Validate number

Number validations support the following operators:

- `range`

Ranges of numbers are specified using a combination of the `minimum` and `maximum` keywords, (or `exclusiveMinimum` and `exclusiveMaximum` for expressing exclusive range).

If _x_ is the value being validated, the following must hold true:

- _x_ ≥ `minimum`
- _x_ > `exclusiveMinimum`
- _x_ ≤ `maximum`
- _x_ < `exclusiveMaximum`

<Tabs groupId="validation-definition" defaultValue="basic" values={[
{label: "Basic", value: "basic"},
{label: "Array", value: "array"},
{label: "Terraform - coming soon", value: "tf"}
]}>

<TabItem value="basic">

```json showLineNumbers
{
  "myNumberProp": {
    "title": "My number",
    "icon": "My icon",
    "description": "My number property",
    "type": "number",
    // highlight-start
    "minimum": 0,
    "maximum": 50
    // highlight-end
  }
}
```

</TabItem>

<TabItem value="array">

```json showLineNumbers
{
  "myNumberArray": {
    "title": "My number array",
    "icon": "My icon",
    "description": "My number array",
    // highlight-start
    "type": "array",
    "items": {
      "type": "number",
      "exclusiveMinimum": 0,
      "exclusiveMaximum": 50
    }
    // highlight-end
  }
}
```

</TabItem>
</Tabs>
