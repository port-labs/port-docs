---
sidebar_position: 15
description: Yaml is an input used to save object definitions in YAML
sidebar_class_name: "custom-sidebar-item sidebar-property-string"
---

import ApiRef from "../../../api-reference/\_learn_more_reference.mdx"

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Yaml

Yaml is an input used to save object definitions in YAML.

## 💡 Common yaml usage

The yaml input type can be used to store any key/value based data, for example:

- Configurations
- Helm charts
- Dictionaries/Hash maps
- Manifests
- `values.yml`

## API definition

<Tabs groupId="api-definition" queryString defaultValue="basic" values={[
{label: "Basic", value: "basic"},
{label: "Array", value: "array"}
]}>

<TabItem value="basic">

```json showLineNumbers
{
  "myYamlInput": {
    "title": "My yaml input",
    "icon": "My icon",
    "description": "My yaml input",
    // highlight-start
    "type": "string",
    "format": "yaml"
    // highlight-end
  }
}
```

</TabItem>
<TabItem value="array">

```json showLineNumbers
{
  "myYamlArrayInput": {
    "title": "My yaml array input",
    "icon": "My icon",
    "description": "My yaml array input",
    // highlight-start
    "type": "array",
    "items": {
      "type": "string",
      "format": "yaml"
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
      "myYamlInput" = {
        title       = "My yaml input"
        description = "My yaml input"
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
      "myYamlArrayInput" = {
        title       = "My yaml array input"
        description = "My yaml array input"
        string_items = {
          format = "yaml"
        }
      }
    }
  }
  # highlight-end
}
```

</TabItem>

</Tabs>
