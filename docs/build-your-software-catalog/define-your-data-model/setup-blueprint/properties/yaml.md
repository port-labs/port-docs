---
sidebar_position: 12
description: Yaml is a data type used to save object definitions in YAML
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Yaml

Yaml is a data type used to save object definitions in YAML.

## Common yaml usage 💡

The yaml property type can be used to store any key/value based data, for example:

- Configurations;
- Dictionaries/Hash maps;
- Manifests;
- etc.

In this [live demo](https://demo.getport.io/services) example, we can see the `Helm Chart` yaml property. 🎬

## API definition

<Tabs groupId="api-definition" defaultValue="basic" values={[
{label: "Basic", value: "basic"},
{label: "Array", value: "array"}
]}>

<TabItem value="basic">

```json showLineNumbers
{
  "myYamlProp": {
    "title": "My yaml",
    "icon": "My icon",
    "description": "My yaml property",
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
  "myYamlArray": {
    "title": "My yaml array",
    "icon": "My icon",
    "description": "My yaml array",
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
    identifier = "myYAMLProp"
    title      = "My yaml"
    required   = false
    type       = "string"
    format     = "yaml"
  }
  # highlight-end
}
```

</TabItem>
</Tabs>
