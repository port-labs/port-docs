---
sidebar_position: 4
description: Object is a data type used to save object definitions in JSON
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Object

Object is a data type used to save object definitions in JSON.

## Use cases 💡

The object property type can be used to store any key/value based data, for example:

- Configurations;
- Tags;
- HTTP responses;
- Dictionaries/Hash maps;
- etc.

In this [live demo](https://demo.getport.io/cloudResources) example, we can see the `Tags` object property. 🎬

## API definition

<Tabs groupId="api-definition" defaultValue="basic" values={[
{label: "Basic", value: "basic"},
{label: "Enum", value: "enum"},
{label: "Array", value: "array"}
]}>

<TabItem value="basic">

```json showLineNumbers
{
  "myObjectProp": {
    "title": "My object",
    "icon": "My icon",
    "description": "My object property",
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
  "myObjectEnum": {
    "title": "My object enum",
    "icon": "My icon",
    "description": "My object enum",
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
  "myObjectArray": {
    "title": "My object array",
    "icon": "My icon",
    "description": "My object array",
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
    identifier = "myObjectProp"
    title      = "My object"
    required   = false
    type       = "object"
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

<Tabs groupId="validation-definition" defaultValue="basic" values={[
{label: "Basic", value: "basic"},
{label: "Array", value: "array"},
{label: "Terraform - coming soon", value: "tf"}
]}>

<TabItem value="basic">

```json showLineNumbers
{
  "myObjectProp": {
    "title": "My object",
    "icon": "My icon",
    "description": "My object property",
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
  "myObjectArray": {
    "title": "My object array",
    "icon": "My icon",
    "description": "My object array",
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
