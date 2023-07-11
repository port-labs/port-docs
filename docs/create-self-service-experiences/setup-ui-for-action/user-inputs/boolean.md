---
sidebar_position: 3
description: Boolean is a basic input that has one of two possible values - true and false
---

import ApiRef from "../../../api-reference/\_learn_more_reference.mdx"

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Boolean

Boolean is a basic input that has one of two possible values - `true` and `false`.

## 💡 Common boolean usage

The boolean input type can be used to store any true/false gate, for example:

- Is environment locked for deployments;
- Should environment perform nightly shutdown;
- Does service handle PII;
- Is environment public;
- etc.

In the [live demo](https://demo.getport.io/self-serve) self-service hub page, we can see the **Delete Repo** action whose `Confirm` input is a boolean input. 🎬

## API definition

<Tabs groupId="api-definition" queryString defaultValue="basic" values={[
{label: "Basic", value: "basic"}
]}>

<TabItem value="basic">

```json showLineNumbers
{
  "myBooleanInput": {
    "title": "My boolean input",
    "icon": "My icon",
    "description": "My boolean input",
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

<Tabs groupId="tf-definition" queryString defaultValue="basic" values={[
{label: "Basic", value: "basic"}
]}>

<TabItem value="basic">

```hcl showLineNumbers
resource "port_action" "myAction" {
  # ...action properties
  # highlight-start
  user_properties = {
    boolean_props = {
      myBooleanInput = {
        title       = "My boolean input"
        description = "My boolean input"
        required    = false
        default     = true
      }
    }
  }
  # highlight-end
}
```

</TabItem>
</Tabs>
