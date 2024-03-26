---
sidebar_position: 6
description: Object is a basic input for JSON data
sidebar_class_name: "custom-sidebar-item sidebar-property-object"
---

import ApiRef from "../../../api-reference/\_learn_more_reference.mdx"

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Object

Object is a basic input for JSON data.

## 💡 Common object usage

The object input type can be used to store any key/value based data, for example:

- Configurations
- Tags
- HTTP responses
- Dictionaries/Hash maps

In the [live demo](https://demo.getport.io/self-serve) self-service hub page, we can see the **Open terraform PR to add S3 bucket** action whose `policy` input is an object input. 🎬

## API definition

<Tabs groupId="api-definition" queryString defaultValue="basic" values={[
{label: "Basic", value: "basic"},
{label: "Select (Enum)", value: "enum"},
{label: "Array", value: "array"}
]}>

<TabItem value="basic">

```json showLineNumbers
{
  "myObjectInput": {
    "title": "My object input",
    "icon": "My icon",
    "description": "My object input",
    // highlight-start
    "type": "object",
    // highlight-end
    "default": {
      "myKey": "myValue"
    }
  }
}
```

</TabItem>
<TabItem value="enum">

```json showLineNumbers
{
  "myObjectSelectInput": {
    "title": "My object select input",
    "icon": "My icon",
    "description": "My object select input",
    "type": "object",
    // highlight-next-line
    "enum": [
      {
        "myKey": 1
      },
      {
        "myKey": 2
      }
    ]
  }
}
```

</TabItem>
<TabItem value="array">

```json showLineNumbers
{
  "myObjectArrayInput": {
    "title": "My object array input",
    "icon": "My icon",
    "description": "My object array input",
    // highlight-start
    "type": "array",
    "items": {
      "type": "object"
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
{label: "Array", value: "array"}
]}>

<TabItem value="basic">

```hcl showLineNumbers
resource "port_action" "myAction" {
  # ...action properties
  # highlight-start
  user_properties = {
    object_props = {
      "myObjectInput" = {
        title       = "My object input"
        description = "My object input"
        default     = jsonencode({ "myKey" = "myValue" })
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
      "myObjectArrayInput" = {
        title       = "My object array input"
        description = "My object array input"
        object_items = {}
      }
    }
  }
  # highlight-end
}
```

</TabItem>

</Tabs>

## Validate object

Object validations support the following operators:

- `properties` - which keys must appear and what their type should be;
- `additionalProperties` - are keys not defined in `properties` allowed and what their type should be;
- `patternProperties` - which regex pattern should properties follow

:::tip
Object validations follow the JSON schema model, refer to the [JSON schema docs](https://json-schema.org/understanding-json-schema/reference/object.html) to learn about all of the available validations
:::

<Tabs groupId="validation-definition" queryString defaultValue="basic" values={[
{label: "Basic", value: "basic"},
{label: "Array", value: "array"},
{label: "Terraform - coming soon", value: "tf"}
]}>

<TabItem value="basic">

```json showLineNumbers
{
  "myObjectInput": {
    "title": "My object input",
    "icon": "My icon",
    "description": "My object input",
    "type": "object",
    // highlight-start
    "properties": {
      "myRequiredProp": { "type": "number" }
    },
    "patternProperties": {
      "^S_": { "type": "string" },
      "^I_": { "type": "number" }
    },
    "additionalProperties": true
    // highlight-end
  }
}
```

</TabItem>

<TabItem value="array">

```json showLineNumbers
{
  "myObjectArrayInput": {
    "title": "My object array input",
    "icon": "My icon",
    "description": "My object array input",
    // highlight-start
    "type": "array",
    "items": {
      "type": "object",
      "properties": {
        "myRequiredProp": { "type": "number" }
      },
      "patternProperties": {
        "^S_": { "type": "string" },
        "^I_": { "type": "number" }
      },
      "additionalProperties": true
    }
    // highlight-end
  }
}
```

</TabItem>
</Tabs>
