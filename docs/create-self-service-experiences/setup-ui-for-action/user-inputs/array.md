---
sidebar_position: 1
description: Array is an input for lists of data
sidebar_class_name: "custom-sidebar-item sidebar-property-array"
---

import ApiRef from "../../../api-reference/\_learn_more_reference.mdx"

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Array

Array is an input for lists of data.

## 💡 Common array usage

The array input type can be used to store any list of data, for example:

- Configuration parameters
- Ordered values

## API definition

<Tabs groupId="api-definition" queryString defaultValue="basic" values={[
{label: "Basic", value: "basic"},
{label: "Select (Enum)", value: "enum"}
]}>

<TabItem value="basic">

```json showLineNumbers
{
  "myArrayInput": {
    "title": "My array input",
    "icon": "My icon",
    "description": "My array input",
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
  "myArraySelectInput": {
    "title": "My array select input",
    "icon": "My icon",
    "description": "My array select input",
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

<ApiRef />

## Terraform definition

<Tabs groupId="tf-definition" queryString defaultValue="basic" values={[
{label: "Basic", value: "basic"},
{label: "Select (Enum) - coming soon", value: "enum"}
]}>

<TabItem value="basic">

```hcl showLineNumbers
resource "port_action" "myAction" {
  # ...action properties
  # highlight-start
  user_properties {
    identifier  = "myArrayInput"
    title       = "My array input"
    description = "My array input"
    type        = "array"
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

<Tabs groupId="validation-definition" queryString defaultValue="basic" values={[
{label: "Basic", value: "basic"},
{label: "Terraform", value: "tf"}
]}>

<TabItem value="basic">

```json showLineNumbers
{
  "myArrayInput": {
    "title": "My array input",
    "icon": "My icon",
    "description": "My array input ",
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

<TabItem value="tf">

```hcl showLineNumbers

resource "port_action" "myAction" {
  # ...action properties
  # highlight-start
  user_properties = {
    array_props = {
      "myArrayInput" = {
        title       = "My array input"
        description = "My array input"
        min_items   = 0
        max_items   = 5
        unique_items = false
      }
    }
  }
  # highlight-end
}
```

</TabItem>

</Tabs>
