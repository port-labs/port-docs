---
sidebar_position: 8
title: Datetime
sidebar_class_name: "custom-sidebar-item sidebar-property-datetime"
---

# Datetime

Datetime inputs allow users to select a date and time.

## Common usage

The datetime input type can be used for:

- Scheduling deployments
- Setting expiration dates
- Defining maintenance windows
- Specifying TTL values

## Definition

```json showLineNumbers
{
  "scheduledTime": {
    "title": "Scheduled Time",
    "description": "When to execute this operation",
    "type": "string",
    "format": "date-time"
  }
}
```

## Properties

| Property | Type | Description |
| -------- | ---- | ----------- |
| `type` | `"string"` | **Required.** Must be `"string"` |
| `format` | `"date-time"` | **Required.** Must be `"date-time"` |
| `default` | `string` | Default value in ISO 8601 format |

## Dynamic default

Set a default to a future time:

```json showLineNumbers
{
  "expiresAt": {
    "title": "Expires At",
    "description": "When this resource should expire",
    "type": "string",
    "format": "date-time",
    "default": {
      "jqQuery": "now + 86400 | strftime(\"%Y-%m-%dT%H:%M:%SZ\")"
    }
  }
}
```
