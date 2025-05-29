---
sidebar_position: 11
description: Toggle is a basic input that has one of two possible values - true and false
sidebar_class_name: "custom-sidebar-item sidebar-property-boolean"
---

import ApiRef from "/docs/api-reference/\_learn_more_reference.mdx"

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Toggle (Boolean)

Toggle is a basic boolean input that has one of two possible values - `true` and `false`.  
In Port, this input type is represented by a switch that can be toggled on or off.

:::warning Required field behavior
The "required" property has no effect on toggle inputs since they always have a value (either `true` or `false` based on the default). Unlike other input types, users cannot leave a toggle in an empty state, so the required validation doesn't apply.

If you need a boolean input that can be left unset (null), consider using a [select input](/actions-and-automations/create-self-service-experiences/setup-ui-for-action/user-inputs/select) with options for `true`, `false`, and `null`.
:::

:::info Toggle vs Boolean properties
Toggle inputs in actions differ from Boolean properties in blueprints:
- **Toggle inputs** (actions): Always have a value (`true` or `false`) and appear as a switch
- **Boolean properties** (blueprints): Can be `null`, `true`, or `false` and support optional/unset states
:::

## 💡 Common toggle usage

This input type can be used to store any true/false gate, for example:

- Is environment locked for deployments
- Should environment perform nightly shutdown
- Does service handle PII
- Is environment public

In the [live demo](https://demo.getport.io/self-serve) self-service hub page, we can see the **Delete Repo** action whose `Confirm` input is a toggle input. 🎬

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
        default     = true
      }
    }
  }
  # highlight-end
}
```

</TabItem>
</Tabs>
