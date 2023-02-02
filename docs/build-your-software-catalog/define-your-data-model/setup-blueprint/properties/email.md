---
sidebar_position: 7
description: Email is a data type used to save Email addresses
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Email

Email is a data type used to save Email addresses.

## Use cases 💡

The Email property type can be used to store any legal email address.

## API definition

<Tabs groupId="api-definition" defaultValue="basic" values={[
{label: "Basic", value: "basic"},
{label: "Enum", value: "enum"},
{label: "Array", value: "array"}
]}>

<TabItem value="basic">

```json showLineNumbers
{
  "myEmailProp": {
    "title": "My email",
    "icon": "My icon",
    "description": "My email property",
    // highlight-start
    "type": "string",
    "format": "email",
    // highlight-end
    "default": "me@example.com"
  }
}
```

</TabItem>
<TabItem value="enum">

```json showLineNumbers
{
  "myEmailEnum": {
    "title": "My email enum",
    "icon": "My icon",
    "description": "My email enum",
    "type": "string",
    "format": "email",
    // highlight-next-line
    "enum": ["me@example.com", "example@example.com"],
    "enumColors": {
      "me@example.com": "red",
      "example@example.com": "green"
    }
  }
}
```

</TabItem>
<TabItem value="array">

```json showLineNumbers
{
  "myEmailArray": {
    "title": "My email array",
    "icon": "My icon",
    "description": "My email array",
    // highlight-start
    "type": "array",
    "items": {
      "type": "string",
      "format": "email"
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
    identifier = "myEmailProp"
    title      = "My email"
    required   = false
    type       = "string"
    format     = "email"
  }
  # highlight-end
}
```

</TabItem>
</Tabs>
