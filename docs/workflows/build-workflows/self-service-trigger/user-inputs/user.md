---
sidebar_position: 6
title: User
sidebar_class_name: "custom-sidebar-item sidebar-property-user"
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# User

User inputs allow users to select a Port user.

## Common usage

The user input type can be used for:

- Assigning ownership
- Specifying reviewers
- Setting on-call personnel
- Notifying specific users

## Definition

<Tabs groupId="definition" queryString defaultValue="basic" values={[
{label: "Basic", value: "basic"},
{label: "Array", value: "array"}
]}>

<TabItem value="basic">

```json showLineNumbers
{
  "assignee": {
    "title": "Assignee",
    "description": "User to assign this task to",
    "type": "string",
    "format": "user"
  }
}
```

</TabItem>
<TabItem value="array">

```json showLineNumbers
{
  "reviewers": {
    "title": "Reviewers",
    "description": "Users to review this change",
    "type": "array",
    "items": {
      "type": "string",
      "format": "user"
    }
  }
}
```

</TabItem>
</Tabs>

## Properties

| Property | Type | Description |
| -------- | ---- | ----------- |
| `type` | `"string"` | **Required.** Must be `"string"` |
| `format` | `"user"` | **Required.** Must be `"user"` |
| `default` | `string` | Default user email |

## Dynamic default

Set the current user as the default:

```json showLineNumbers
{
  "requestedBy": {
    "title": "Requested By",
    "type": "string",
    "format": "user",
    "default": {
      "jqQuery": ".trigger.by.user.email"
    },
    "readOnly": true
  }
}
```
