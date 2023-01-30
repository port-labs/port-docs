---
sidebar_position: 6
description: URL is a data type used to save links to websites
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# URL

URL is a data type used to save links to websites.

## Use cases

The URL property type can be used to store a link to any web resource, for example:

- Public websites;
- Private websites;
- API routes;
- etc.

## API definition

<Tabs groupId="api-definition" defaultValue="basic" values={[
{label: "Basic", value: "basic"},
{label: "Enum", value: "enum"},
{label: "Array", value: "array"}
]}>

<TabItem value="basic">

```json showLineNumbers
{
  "myUrlProp": {
    "title": "My url",
    "icon": "My icon",
    "description": "My url property",
    // highlight-start
    "type": "string",
    "format": "url",
    // highlight-end
    "default": "https://example.com"
  }
}
```

</TabItem>
<TabItem value="enum">

```json showLineNumbers
{
  "myUrlEnum": {
    "title": "My url enum",
    "icon": "My icon",
    "description": "My url enum",
    "type": "string",
    "format": "url",
    // highlight-next-line
    "enum": ["https://example.com", "https://getport.io"]
  }
}
```

</TabItem>
<TabItem value="array">

```json showLineNumbers
{
  "myUrlArray": {
    "title": "My url array",
    "icon": "My icon",
    "description": "My url array",
    // highlight-start
    "type": "array",
    "items": {
      "type": "string",
      "format": "url"
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
    identifier = "myUrlProp"
    title      = "My url"
    required   = false
    type       = "string"
    format     = "url"
  }
  # highlight-end
}
```

</TabItem>
</Tabs>
