---
sidebar_position: 4
title: Toggle
sidebar_class_name: "custom-sidebar-item sidebar-property-boolean"
---

# Toggle

Toggle inputs accept boolean (true/false) values.

## Common usage

The toggle input type can be used for:

- Enable/disable features
- Dry run mode
- Force operations
- Skip validations

## Definition

```json showLineNumbers
{
  "dryRun": {
    "title": "Dry Run",
    "description": "Simulate the operation without making changes",
    "type": "boolean",
    "default": false
  }
}
```

## Properties

| Property | Type | Description |
| -------- | ---- | ----------- |
| `type` | `"boolean"` | **Required.** Must be `"boolean"` |
| `default` | `boolean` | Default value (`true` or `false`) |

## Dynamic default

Use a JQ expression to set a dynamic default:

```json showLineNumbers
{
  "requireApproval": {
    "title": "Require Approval",
    "type": "boolean",
    "default": {
      "jqQuery": ".inputs.environment == \"production\""
    },
    "dependsOn": ["environment"]
  }
}
```
