---
sidebar_position: 5
description: Number is a basic input for numeric data
sidebar_class_name: "custom-sidebar-item sidebar-property-number"
---

import ApiRef from "../../../api-reference/\_learn_more_reference.mdx"

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Number

Number is a basic input for numeric data.

## 💡 Common number usage

The number input type can be used to store any numeric data, for example:

- Memory/storage allocations
- Replica counts
- Number of days to retain data

In the [live demo](https://demo.getport.io/self-serve) self-service hub page, we can see the **scaffold new service** action whose `K8s Replica Count` input is a number input. 🎬

## API definition

<Tabs groupId="api-definition" queryString defaultValue="basic" values={[
{label: "Basic", value: "basic"},
{label: "Select (Enum)", value: "enum"},
{label: "Array", value: "array"},
{label: "Enum Array", value: "enumArray"}
]}>

<TabItem value="basic">

```json showLineNumbers
{
  "myNumberInput": {
    "title": "My number input",
    "icon": "My icon",
    "description": "My number input",
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
  "myNumberSelectInput": {
    "title": "My number select input",
    "icon": "My icon",
    "description": "My number select input",
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
  "myNumberArrayInput": {
    "title": "My number array input",
    "icon": "My icon",
    "description": "My number array input",
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
<TabItem value="enumArray">

```json showLineNumbers
{
  "myNumberArray": {
    "title": "My number-selection array input",
    "icon": "My icon",
    "description": "My number-selection array input",
    // highlight-start
    "type": "array",
    "items": {
      "type": "number",
      "enum": [1, 2, 3, 4],
      "enumColors": {
        "1": "red",
        "2": "green",
        "3": "blue"
      }
    }
    // highlight-end
  }
}
```

</TabItem>
</Tabs>

<ApiRef />

## Terraform definition

<Tabs groupId="tf-definition" queryString defaultValue="basic" values={[
{label: "Basic", value: "basic"},
{label: "Select (Enum)", value: "enum"},
{label: "Array", value: "array"}
]}>

<TabItem value="basic">

```hcl showLineNumbers
resource "port_action" "myAction" {
  # ...action properties
  # highlight-start
  user_properties = {
    number_props = {
      "myNumberInput" = {
        title       = "My number input"
        description = "My number input"
        default     = 7
      }
    }
  }
  # highlight-end
}
```

</TabItem>

<TabItem value="enum">

```hcl showLineNumbers

resource "port_action" "myAction" {
  # ...action properties
  # highlight-start
  user_properties = {
    number_props = {
      "myNumberInput" = {
        title       = "My number input"
        description = "My number input"
        enum        = [1, 2, 3, 4]
      }
    }
  }
  # highlight-end
}

```

</TabItem>

<TabItem value="array">

```hcl showLineNumbers

resource "port_action" "myAction" {
  # ...action properties
  # highlight-start
  user_properties = {
    array_props = {
      "myNumberArrayInput" = {
        title       = "My number array input"
        description = "My number array input"
        number_items = {}
      }
    }
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

<Tabs groupId="validation-definition" queryString defaultValue="basic" values={[
{label: "Basic", value: "basic"},
{label: "Array", value: "array"},
{label: "Terraform", value: "tf"}
]}>

<TabItem value="basic">

```json showLineNumbers
{
  "myNumberInput": {
    "title": "My number input",
    "icon": "My icon",
    "description": "My number input",
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
  "myNumberArrayInput": {
    "title": "My number array input",
    "icon": "My icon",
    "description": "My number array input",
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

<TabItem value="tf">

```hcl showLineNumbers

resource "port_action" "myAction" {
  # ...action properties
  # highlight-start
  user_properties = {
    number_props = {
      "myNumberInput" = {
        title       = "My number input"
        description = "My number input"
        minimum     = 0
        maximum     = 50
      }
    }
  }
  # highlight-end
}

```

</TabItem>
</Tabs>
