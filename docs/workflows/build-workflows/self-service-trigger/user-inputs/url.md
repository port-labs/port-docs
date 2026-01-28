---
sidebar_position: 9
title: URL
sidebar_class_name: "custom-sidebar-item sidebar-property-url"
---

# URL

URL inputs accept and validate URL strings.

## Common usage

The URL input type can be used for:

- Repository links
- Documentation URLs
- API endpoints
- External resource references

## Definition

```json showLineNumbers
{
  "repositoryUrl": {
    "title": "Repository URL",
    "description": "URL to the source repository",
    "type": "string",
    "format": "url"
  }
}
```

## Properties

| Property | Type | Description |
| -------- | ---- | ----------- |
| `type` | `"string"` | **Required.** Must be `"string"` |
| `format` | `"url"` | **Required.** Must be `"url"` |
| `default` | `string` | Default URL value |

The URL format automatically validates that the input is a properly formatted URL.
