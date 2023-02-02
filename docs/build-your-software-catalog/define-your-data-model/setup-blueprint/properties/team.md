---
sidebar_position: 9
description: Team is a data type used to reference teams that exist in Port
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Team

Team is a data type used to reference teams that exist in Port.

## Use cases

The team property type can be used to reference any team that exists in Port, for example:

- The service owning team;
- The current on-call;
- The lead maintainers;
- etc.

In this [live demo](https://demo.getport.io/services) example, we can see the `Team` team property. 🎬

## API definition

<Tabs groupId="api-definition" defaultValue="basic" values={[
{label: "Basic", value: "basic"},
{label: "Array", value: "array"}
]}>

<TabItem value="basic">

```json showLineNumbers
{
  "myTeamProp": {
    "title": "My team",
    "icon": "My icon",
    "description": "My team property",
    // highlight-start
    "type": "string",
    "format": "team",
    // highlight-end
    "default": "my-team"
  }
}
```

</TabItem>
<TabItem value="array">

```json showLineNumbers
{
  "myTeamArray": {
    "title": "My team array",
    "icon": "My icon",
    "description": "My team array",
    // highlight-start
    "type": "array",
    "items": {
      "type": "string",
      "format": "team"
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
{label: "Array - coming soon", value: "array"}
]}>

<TabItem value="basic">

```hcl showLineNumbers
resource "port-labs_blueprint" "myBlueprint" {
  # ...blueprint properties
  # highlight-start
  properties {
    identifier = "myTeamProp"
    title      = "My team"
    required   = false
    type       = "string"
    format     = "team"
  }
  # highlight-end
}
```

</TabItem>
</Tabs>
