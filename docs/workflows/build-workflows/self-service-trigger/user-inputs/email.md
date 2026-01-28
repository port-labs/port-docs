---
sidebar_position: 10
title: Email
sidebar_class_name: "custom-sidebar-item sidebar-property-string"
---

# Email

Email inputs accept and validate email addresses.

## Common usage

The email input type can be used for:

- Contact emails
- Notification recipients
- User identifiers
- Support contacts

## Definition

```json showLineNumbers
{
  "contactEmail": {
    "title": "Contact Email",
    "description": "Email address for notifications",
    "type": "string",
    "format": "email"
  }
}
```

## Properties

| Property | Type | Description |
| -------- | ---- | ----------- |
| `type` | `"string"` | **Required.** Must be `"string"` |
| `format` | `"email"` | **Required.** Must be `"email"` |
| `default` | `string` | Default email value |
| `enum` | `string[]` | List of allowed email values |

The email format automatically validates that the input is a properly formatted email address.
