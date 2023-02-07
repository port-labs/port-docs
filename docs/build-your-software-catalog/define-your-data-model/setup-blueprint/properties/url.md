---
sidebar_position: 6
description: URL is a data type used to save links to websites
---

import ApiRef from "../../../../api-reference/\_learn_more_reference.mdx"

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# URL

URL is a data type used to save links to websites.

## 💡 Common url usage

The URL property type can be used to store a link to any web resource, for example:

- Link to Datadog dashboard;
- Link to Sentry tracing;
- Link to pull request;
- etc.

In this [live demo](https://demo.getport.io/domains) example, we can see the `Domain Docs` URL property. 🎬

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
    "enum": ["https://example.com", "https://getport.io"],
    "enumColors": {
      "https://example.com": "red",
      "https://getport.io": "green"
    }
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

<ApiRef />

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

<TabItem value="enum">

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
    enum       = ["https://example.com", "https://getport.io"]
    enum_colors = {
      "https://example.com" = "red",
      "https://getport.io"  = "green"
    }
  }
  # highlight-end
}
```

</TabItem>
</Tabs>
