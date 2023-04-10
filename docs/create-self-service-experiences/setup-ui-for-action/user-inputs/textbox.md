---
sidebar_position: 1
description: Textbox is a basic input for text
---

import ApiRef from "../../../api-reference/\_learn_more_reference.mdx"

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Textbox

Textbox is a basic input for text.

## 💡 Common textbox usage

The textbox input type can be used to store any text based data, for example:

- Image tags;
- Variable keys;
- Commit SHA;
- File names;
- etc.

In the [live demo](https://demo.getport.io/self-serve) self-service hub page, we can see the **scaffold new service** action whose `Service Name` input is a textbox input. 🎬

## API definition

<Tabs groupId="api-definition" queryString defaultValue="basic" values={[
{label: "Basic", value: "basic"},
{label: "Enum", value: "enum"},
{label: "Array", value: "array"}
]}>

<TabItem value="basic">

```json showLineNumbers
{
  "myTextboxInput": {
    "title": "My Textbox",
    "icon": "My icon",
    "description": "My textbox input",
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
  "myTextboxInputEnum": {
    "title": "My textbox input enum",
    "icon": "My icon",
    "description": "My textbox input enum",
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
  "myTextboxInputArray": {
    "title": "My textbox array",
    "icon": "My icon",
    "description": "My textbox array",
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
resource "port-labs_action" "myAction" {
  # ...action properties
  # highlight-start
  properties {
    identifier = "myTextboxInput"
    title      = "My textbox input"
    required   = false
    type       = "string"
  }
  # highlight-end
}
```

</TabItem>

<TabItem value="enum">

```hcl showLineNumbers
resource "port-labs_action" "myAction" {
  # ...action properties
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

## Validate textbox

Textbox validations support the following operators:

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
