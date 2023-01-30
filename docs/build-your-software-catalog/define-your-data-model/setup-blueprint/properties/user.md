---
sidebar_position: 8
description: User is a data type used to reference users that exist in Port
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# User

User is a data type used to reference users that exist in Port.

## Use cases

The user property type can be used to reference any user that exists in Port, for example:

- The service owner;
- The current on-call;
- The lead maintainer;
- etc.

:::note
Even though the input is the same in both `email` and `user` formats, their presentation is different:

- `email` format displays the raw email string;
- `user` format displays the user's name and avatar from Port's list of known users.

In addition, `user` format distinguishes between users by their status:

| User Status  | Example                                                                                 |
| ------------ | --------------------------------------------------------------------------------------- |
| Active       | ![Active user](../../../../../static/img/software-catalog/blueprint/activeUser.png)     |
| Invited      | ![Invited user](../../../../../static/img/software-catalog/blueprint/invitedUser.png)   |
| Unregistered | ![External user](../../../../../static/img/software-catalog/blueprint/externalUser.png) |

:::

## API definition

<Tabs groupId="api-definition" defaultValue="basic" values={[
{label: "Basic", value: "basic"},
{label: "Enum", value: "enum"},
{label: "Array", value: "array"}
]}>

<TabItem value="basic">

```json showLineNumbers
{
  "myUserProp": {
    "title": "My user",
    "icon": "My icon",
    "description": "My user property",
    // highlight-start
    "type": "string",
    "format": "user",
    // highlight-end
    "default": "me@example.com"
  }
}
```

</TabItem>
<TabItem value="enum">

```json showLineNumbers
{
  "myUserEnum": {
    "title": "My user enum",
    "icon": "My icon",
    "description": "My user enum",
    "type": "string",
    "format": "user",
    // highlight-next-line
    "enum": ["me@example.com", "example@example.com"]
  }
}
```

</TabItem>
<TabItem value="array">

```json showLineNumbers
{
  "myUserArray": {
    "title": "My user array",
    "icon": "My icon",
    "description": "My user array",
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
    identifier = "myUserProp"
    title      = "My user"
    required   = false
    type       = "string"
    format     = "user"
  }
  # highlight-end
}
```

</TabItem>
</Tabs>
