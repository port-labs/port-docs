---
sidebar_position: 1
description: String is a primitive data type used to save text data
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# String

String is a primitive data type used to save text data.

## Use cases

The string property type can be used to store any text based data, for example:

- Descriptions;
- Variable keys;
- Unique identifiers and UUIDs;
- File names;
- etc.

## Definition

<Tabs groupId="definition-examples" defaultValue="basic" values={[
{label: "Basic", value: "basic"},
{label: "Enum", value: "enum"},
{label: "Array", value: "array"},
{label: "Terraform", value: "terraform"}
]}>

<TabItem value="basic">

```json showLineNumbers
{
  "identifier": "microservice",
  "description": "This blueprint represents a service in our software catalog",
  "title": "Microservice",
  "icon": "Microservice",
  "schema": {
    "properties": {
      "stringProp": {
        // highlight-start
        "title": "String Property",
        "type": "string",
        "icon": "Cluster",
        "description": "A string property",
        "default": "Prod"
        // highlight-end
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "relations": {}
}
```

</TabItem>
<TabItem value="enum">

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

</TabItem>
<TabItem value="array">

```json showLineNumbers
{
  "type": "array",
  "items": {
    "type": "string"
  }
}
```

</TabItem>

<TabItem value="terraform">

## Terraform string definition

```hcl showLineNumbers
resource "port-labs_blueprint" "microservice" {
  title      = "Microservice"
  icon       = "Microservice"
  identifier = "microservice"
  # highlight-start
  properties {
    identifier = "stringProp"
    type       = "string"
    title      = "String Property"
    required   = true
  }
  # highlight-end
}
```

</TabItem>
</Tabs>

## Validate strings

String validations support the following operators:

- `minLength`
- `maxLength`
- `pattern`

```json showLineNumbers
{
  "title": "Region",
  "type": "string",
  "icon": "Aws",
  "description": "Cloud provider region",
  // highlight-start
  "minLength": 1,
  "maxLength": 32,
  "pattern": "^[a-zA-Z0-9-]*-service$"
  // highlight-end
}
```
