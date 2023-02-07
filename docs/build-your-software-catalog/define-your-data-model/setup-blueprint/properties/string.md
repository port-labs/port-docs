---
sidebar_position: 1
description: String is a primitive data type used to save text data
---

import ApiRef from "../../../../api-reference/\_learn_more_reference.mdx"

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# String

String is a primitive data type used to save text data.

## 💡 Common string usage

The string property type can be used to store any text based data, for example:

- Image tags;
- Variable keys;
- Commit SHA;
- File names;
- etc.

In this [live demo](https://demo.getport.io/services) example, we can see the `Language` string property. 🎬

## API definition

<Tabs groupId="api-definition" defaultValue="basic" values={[
{label: "Basic", value: "basic"},
{label: "Enum", value: "enum"},
{label: "Array", value: "array"}
]}>

<TabItem value="basic">

```json showLineNumbers
{
  "myStringProp": {
    "title": "My string",
    "icon": "My icon",
    "description": "My string property",
    // highlight-start
    "type": "string",
    // highlight-end
    "default": "My default"
  }
}
```

</TabItem>
<TabItem value="enum">

```json showLineNumbers
{
  "myStringEnum": {
    "title": "My string enum",
    "icon": "My icon",
    "description": "My string enum",
    "type": "string",
    // highlight-next-line
    "enum": ["my-option-1", "my-option-2"],
    "enumColors": {
      "my-option-1": "red",
      "my-option-2": "green"
    }
  }
}
```

</TabItem>
<TabItem value="array">

```json showLineNumbers
{
  "myStringArray": {
    "title": "My string array",
    "icon": "My icon",
    "description": "My string array",
    // highlight-start
    "type": "array",
    "items": {
      "type": "string"
    }
    // highlight-end
  }
}
```

</TabItem>
</Tabs>

<ApiRef />

## Terraform definition

<Tabs groupId="tf-definition" defaultValue="basic" values={[
{label: "Basic", value: "basic"},
{label: "Enum", value: "enum"},
{label: "Array - coming soon", value: "array"}
]}>

<TabItem value="basic">

```hcl showLineNumbers
resource "port-labs_blueprint" "myBlueprint" {
  # ...blueprint properties
  # highlight-start
  properties {
    identifier = "myStringProp"
    title      = "My string"
    required   = false
    type       = "string"
  }
  # highlight-end
}
```

</TabItem>

<TabItem value="enum">

```hcl showLineNumbers
resource "port-labs_blueprint" "myBlueprint" {
  # ...blueprint properties
  # highlight-start
  properties {
    identifier = "myStringProp"
    title      = "My string"
    required   = false
    type       = "string"
    enum       = ["my-option-1", "my-option-2"]
    enum_colors = {
      "my-option-1" = "red"
      "my-option-2" = "green"
    }
  }
  # highlight-end
}

```

</TabItem>
</Tabs>

## Validate string

String validations support the following operators:

- `minLength` - enforce minimal string length;
- `maxLength` - enforce maximal string length;
- `pattern` - enforce Regex patterns.

<Tabs groupId="validation-definition" defaultValue="basic" values={[
{label: "Basic", value: "basic"},
{label: "Array", value: "array"},
{label: "Terraform - coming soon", value: "tf"}
]}>

<TabItem value="basic">

```json showLineNumbers
{
  "myStringProp": {
    "title": "My string",
    "icon": "My icon",
    "description": "My string property",
    "type": "string",
    // highlight-start
    "minLength": 1,
    "maxLength": 32,
    "pattern": "^[a-zA-Z0-9-]*-service$"
    // highlight-end
  }
}
```

</TabItem>

<TabItem value="array">

```json showLineNumbers
{
  "myStringArray": {
    "title": "My string array",
    "icon": "My icon",
    "description": "My string array",
    // highlight-start
    "type": "array",
    "items": {
      "type": "string",
      "minLength": 1,
      "maxLength": 32,
      "pattern": "^[a-zA-Z0-9-]*-service$"
    }
    // highlight-end
  }
}
```

</TabItem>
</Tabs>
