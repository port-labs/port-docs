---
sidebar_position: 1
description: String is a primitive data type used to save text data
---

# String

String is a primitive data type used to save text data.

## Use cases

The string property type can be used to store any text based data, for example:

- Descriptions;
- Variable keys;
- Unique identifiers and UUIDs;
- File names;
- etc.

## Basic definition

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

## Enum of strings definition

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

## Array of strings definition

```json showLineNumbers
{
  "type": "array",
  "items": {
    "type": "string"
  }
}
```

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
