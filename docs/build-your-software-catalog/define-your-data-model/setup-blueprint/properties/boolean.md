---
sidebar_position: 3
description: Boolean is a primitive data type that has one of two possible values - true and false
---

import ApiRef from "../../../../api-reference/\_learn_more_reference.mdx"

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Boolean

Boolean is a primitive data type that has one of two possible values - `true` and `false`.

## 💡 Common boolean usage

The boolean property type can be used to store any true/false gate, for example:

- Is environment locked for deployments;
- Should environment perform nightly shutdown;
- Does service handle PII;
- Is environment public;
- etc.

In this [live demo](https://demo.getport.io/packages) example, we can see the `In-House?` boolean property. 🎬

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

<ApiRef />

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
