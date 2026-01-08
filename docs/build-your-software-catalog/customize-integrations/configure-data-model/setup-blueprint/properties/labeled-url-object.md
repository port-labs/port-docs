---
sidebar_position: 21
description: Labeled URL is an object type used to store URLs with custom display labels
sidebar_class_name: "custom-sidebar-item sidebar-property-object"
---

import ApiRef from "/docs/api-reference/\_learn_more_reference.mdx"

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Labeled URL

Labeled URL is an object type used to store URLs with custom display labels. This property allows you to associate a human-readable label with a URL, making it easier to display meaningful link text in the UI instead of showing icons only.

## Common labeled URL usage

The labeled URL property type can be used to store links with descriptive labels, for example:

- Documentation links with descriptive titles.
- External service dashboards with custom names.
- Related resources with meaningful descriptions.
- Pull request links with PR titles.
- Monitoring dashboards with environment names.

## Schema structure

A labeled URL object contains two fields:

| Field   | Type   | Required | Description                                      |
| ------- | ------ | -------- | ------------------------------------------------ |
| `url`   | string | Yes      | The URL to link to (internal or external).       |
| `displayText` | string | No | The display text to show for the link.           |

### Example value

```json showLineNumbers
{
  "url": "https://app.datadoghq.com/dashboard/abc123",
  "displayText": "Production Metrics Dashboard"
}
```

## Display behavior

Labeled URLs are rendered intelligently based on the URL type:

- **Internal links**: Displayed as navigable links within Port.
- **External links**: Displayed as buttons that open in a new tab.

## API definition

<Tabs groupId="api-definition" queryString defaultValue="basic" values={[
{label: "Basic", value: "basic"},
{label: "Array", value: "array"}
]}>

<TabItem value="basic">

```json showLineNumbers
{
  "myLabeledUrlProp": {
    "title": "My labeled URL",
    "icon": "Link",
    "description": "My labeled URL property",
    // highlight-start
    "type": "object",
    "format": "labeled-url"
    // highlight-end
  }
}
```

</TabItem>
<TabItem value="array">

```json showLineNumbers
{
  "myLabeledUrlArray": {
    "title": "My labeled URL array",
    "icon": "Link",
    "description": "My labeled URL array",
    // highlight-start
    "type": "array",
    "items": {
      "type": "object",
      "format": "labeled-url"
    }
    // highlight-end
  }
}
```

</TabItem>
</Tabs>

<ApiRef />

## Using labeled URLs in self-service actions

You can use labeled URL properties as user inputs in self-service actions and automations. The input form provides a JSON editor with schema validation to ensure proper structure.

### Example action input

```json showLineNumbers
{
  "documentationLink": {
    "title": "Documentation Link",
    "description": "Link to the service documentation",
    // highlight-start
    "type": "object",
    "format": "labeled-url"
    // highlight-end
  }
}
```

### Example entity data

When populating an entity with labeled URL data:

```json showLineNumbers
{
  "identifier": "my-service",
  "title": "My Service",
  "properties": {
    // highlight-start
    "documentationLink": {
      "url": "https://docs.example.com/my-service",
      "label": "Service Documentation"
    },
    "relatedLinks": [
      {
        "url": "https://github.com/org/my-service",
        "label": "GitHub Repository"
      },
      {
        "url": "https://app.datadoghq.com/dashboard/xyz",
        "label": "Monitoring Dashboard"
      }
    ]
    // highlight-end
  }
}
```

