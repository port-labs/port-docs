---
sidebar_position: 3
description: Boolean is a primitive data type that has one of two possible values - true and false
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Boolean

Boolean is a primitive data type that has one of two possible values - `true` and `false`

## Use cases

The boolean property type can be used to store any true/false gate, for example:

- Is environment locked for deployments;
- Should environment perform nightly shutdown;
- Should environment perform morning startup;
- Is environment public;
- etc.

## API definition

<Tabs groupId="api-definition" defaultValue="basic" values={[
{label: "Basic", value: "basic"}
]}>

<TabItem value="basic">

```json showLineNumbers
{
  "myBooleanProp": {
    "title": "My boolean",
    "icon": "My icon",
    "description": "My boolean property",
    // highlight-start
    "type": "boolean",
    // highlight-end
    "default": true
  }
}
```

</TabItem>
</Tabs>

## Terraform definition

<Tabs groupId="tf-definition" defaultValue="basic" values={[
{label: "Basic", value: "basic"}
]}>

<TabItem value="basic">

```hcl showLineNumbers
resource "port-labs_blueprint" "myBlueprint" {
  # ...blueprint properties
  # highlight-start
  properties {
    identifier = "myBooleanProp"
    title      = "My boolean"
    required   = false
    type       = "boolean"
  }
  # highlight-end
}
```

</TabItem>
</Tabs>
