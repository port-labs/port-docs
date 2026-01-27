---
sidebar_position: 7
title: Team
sidebar_class_name: "custom-sidebar-item sidebar-property-team"
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Team

Team inputs allow users to select a Port team.

## Common usage

The team input type can be used for:

- Assigning team ownership
- Specifying responsible teams
- Setting notification targets
- Access control assignments

## Definition

<Tabs groupId="definition" queryString defaultValue="basic" values={[
{label: "Basic", value: "basic"},
{label: "Array", value: "array"}
]}>

<TabItem value="basic">

```json showLineNumbers
{
  "owningTeam": {
    "title": "Owning Team",
    "description": "Team responsible for this resource",
    "type": "string",
    "format": "team"
  }
}
```

</TabItem>
<TabItem value="array">

```json showLineNumbers
{
  "notifyTeams": {
    "title": "Teams to Notify",
    "description": "Teams that should be notified",
    "type": "array",
    "items": {
      "type": "string",
      "format": "team"
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
| `format` | `"team"` | **Required.** Must be `"team"` |
| `default` | `string` | Default team name |
