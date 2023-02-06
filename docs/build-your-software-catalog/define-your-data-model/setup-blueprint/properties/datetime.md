---
sidebar_position: 10
description: Datetime is a data type used to reference a date and time
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Datetime

Datetime is a data type used to reference a date and time.

## 💡 Common datetime usage

The datetime property type can be used to store any date and time, for example:

- Deployment time;
- Release time;
- Last incident date;
- Creation timestamp;
- etc.

In this [live demo](https://demo.getport.io/services) example, we can see the `Last Update` datetime property. 🎬

## API definition

<Tabs groupId="api-definition" defaultValue="basic" values={[
{label: "Basic", value: "basic"},
{label: "Enum", value: "enum"},
{label: "Array", value: "array"}
]}>

<TabItem value="basic">

```json showLineNumbers
{
  "myDatetimeProp": {
    "title": "My datetime",
    "icon": "My icon",
    "description": "My datetime property",
    // highlight-start
    "type": "string",
    "format": "date-time",
    // highlight-end
    "default": "2022-04-18T11:44:15.345Z"
  }
}
```

</TabItem>
<TabItem value="enum">

```json showLineNumbers
{
  "myDatetimeEnum": {
    "title": "My datetime enum",
    "icon": "My icon",
    "description": "My datetime enum",
    "type": "string",
    "format": "date-time",
    // highlight-next-line
    "enum": ["2022-04-18T11:44:15.345Z", "2022-05-18T11:44:15.345Z"]
  }
}
```

</TabItem>
<TabItem value="array">

```json showLineNumbers
{
  "myDatetimeArray": {
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
    identifier = "myDatetimeProp"
    title      = "My datetime"
    required   = false
    type       = "string"
    format     = "date-time"
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
    identifier = "myDatetimeProp"
    title      = "My datetime"
    required   = false
    type       = "string"
    format     = "date-time"
    enum       = ["2022-04-18T11:44:15.345Z", "2022-05-18T11:44:15.345Z"]
  }
  # highlight-end
}
```

</TabItem>
</Tabs>
