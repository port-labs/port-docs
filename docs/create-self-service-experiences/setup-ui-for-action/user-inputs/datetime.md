---
sidebar_position: 2
description: Datetime is an input used to reference a date and time
sidebar_class_name: "custom-sidebar-item sidebar-property-datetime"
---

import ApiRef from "../../../api-reference/\_learn_more_reference.mdx"

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Datetime

Datetime is an input used to reference a date and time.

## 💡 Common datetime usage

The datetime input type can be used to store any date and time, for example:

- Deployment time
- Release time
- Creation timestamp

## API definition

<Tabs groupId="api-definition" queryString defaultValue="basic" values={[
{label: "Basic", value: "basic"},
{label: "Array", value: "array"}
]}>

<TabItem value="basic">

```json showLineNumbers
{
  "myDatetimeInput": {
    "title": "My datetime input",
    "icon": "My icon",
    "description": "My datetime input",
    // highlight-start
    "type": "string",
    "format": "date-time",
    // highlight-end
    "default": "2022-04-18T11:44:15.345Z"
  }
}
```

</TabItem>
<TabItem value="array">

```json showLineNumbers
{
  "myDatetimeArrayInput": {
    "title": "My datetime array",
    "icon": "My icon",
    "description": "My datetime array",
    // highlight-start
    "type": "array",
    "items": {
      "type": "string",
      "format": "date-time"
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
{label: "Array", value: "array"}
]}>

<TabItem value="basic">

```hcl showLineNumbers
resource "port_action" "myAction" {
  # ...action properties
  # highlight-start
  user_properties = {
    string_props = {
      myDatetimeProp = {
        title    = "My datetime"
        format   = "date-time"
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
      myArrayDatetimeProp = {
        title    = "My array datetime"
        string_items = {
          format = "date-time"
        }
      }
    }
  }
  # highlight-end
}
```

</TabItem>

</Tabs>
