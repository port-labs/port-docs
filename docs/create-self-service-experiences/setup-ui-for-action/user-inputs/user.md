---
sidebar_position: 14
description: User is an input used to reference users that exist in Port
sidebar_class_name: "custom-sidebar-item sidebar-property-user"
---

import ApiRef from "../../../api-reference/\_learn_more_reference.mdx"

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# User

User is an input used to reference users that exist in Port.

## 💡 Common user usage

The user input type can be used to reference any user that exists in Port, for example:

- The code owners
- The current on-call
- The lead maintainer

In the [live demo](https://demo.getport.io/self-serve) self-service hub page, we can see the **change on-call** action whose `On-Call` input is a user input. 🎬

## API definition

<Tabs groupId="api-definition" queryString defaultValue="basic" values={[
{label: "Basic", value: "basic"},
{label: "Array", value: "array"}
]}>

<TabItem value="basic">

```json showLineNumbers
{
  "myUserInput": {
    "title": "My user input",
    "icon": "My icon",
    "description": "My user input",
    // highlight-start
    "type": "string",
    "format": "user",
    // highlight-end
    "default": "me@example.com"
  }
}
```

</TabItem>
<TabItem value="array">

```json showLineNumbers
{
  "myUserArrayInput": {
    "title": "My user array input",
    "icon": "My icon",
    "description": "My user array input",
    // highlight-start
    "type": "array",
    "items": {
      "type": "string",
      "format": "user"
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
    string_props = {
      "myUserInput" = {
        title       = "My user input"
        description = "My user input"
        format      = "user"
        default     = "me@example.com"
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
      "myUserArrayInput" = {
        title       = "My user array input"
        description = "My user array input"
        format      = "user"
      }
    }
  }
  # highlight-end
}
```

</TabItem>
</Tabs>
