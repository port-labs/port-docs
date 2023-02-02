---
sidebar_position: 5
description: Array is a data type used to save lists of data
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Array

Array is a data type used to save lists of data.

## Use cases 💡

The array property type can be used to store any list of data, for example:

- Used packages;
- Dependencies;
- etc.

In this [live demo](https://demo.getport.io/services) example, we can see the `Monitor Tooling` array property. 🎬

## API definition

<Tabs groupId="api-definition" defaultValue="basic" values={[
{label: "Basic", value: "basic"},
{label: "Enum", value: "enum"}
]}>

<TabItem value="basic">

```json showLineNumbers
{
  "myArrayProp": {
    "title": "My array",
    "icon": "My icon",
    "description": "My array property",
    // highlight-start
    "type": "array",
    // highlight-end
    "default": [1, 2, 3]
  }
}
```

</TabItem>
<TabItem value="enum">

```json showLineNumbers
{
  "myArrayEnum": {
    "title": "My array enum",
    "icon": "My icon",
    "description": "My array enum",
    "type": "array",
    // highlight-next-line
    "enum": [
      [1, 2, 3],
      [1, 2]
    ]
  }
}
```

</TabItem>
</Tabs>

## Terraform definition

<Tabs groupId="tf-definition" defaultValue="basic" values={[
{label: "Basic", value: "basic"},
{label: "Enum - coming soon", value: "enum"}
]}>

<TabItem value="basic">

```hcl showLineNumbers
resource "port-labs_blueprint" "myBlueprint" {
  # ...blueprint properties
  # highlight-start
  properties {
    identifier = "myArrayProp"
    title      = "My array"
    required   = false
    type       = "array"
  }
  # highlight-end
}
```

</TabItem>
</Tabs>

## Validate array

Array validations support the following operators:

- `minItems`
- `maxItems`
- `uniqueItems`

:::tip
Array validations follow the JSON schema model, refer to the [JSON schema docs](https://json-schema.org/understanding-json-schema/reference/array.html) to learn about all of the available validations
:::

<Tabs groupId="validation-definition" defaultValue="basic" values={[
{label: "Basic", value: "basic"},
{label: "Terraform - coming soon", value: "tf"}
]}>

<TabItem value="basic">

```json showLineNumbers
{
  "myArrayProp": {
    "title": "My array",
    "icon": "My icon",
    "description": "My array property",
    "type": "array",
    // highlight-start
    "minItems": 0,
    "maxItems": 5,
    "uniqueItems": false
    // highlight-end
  }
}
```

</TabItem>
</Tabs>
