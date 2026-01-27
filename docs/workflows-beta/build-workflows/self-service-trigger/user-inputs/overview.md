---
sidebar_position: 1
title: Overview
---

import ClosedBetaFeatureNotice from '/docs/generalTemplates/_closed_beta_feature_notice.md';

# User inputs overview

<ClosedBetaFeatureNotice id="workflows-beta" />

User inputs define the data that users must provide when executing a self-service workflow. They are configured in the trigger node's `userInputs` section.

## Structure

```json showLineNumbers
{
  "userInputs": {
    "properties": {
      "myInput": {
        "title": "My Input",
        "icon": "DefaultProperty",
        "description": "Description of the input",
        "type": "string"
      }
    },
    "required": ["myInput"],
    "order": ["myInput"]
  }
}
```

## Common fields

All input types share these common fields:

| Field | Description |
| ----- | ----------- |
| `title` | The display name of the input (max 140 characters) |
| `description` | A description to help users understand the input (max 1000 characters) |
| `icon` | An icon to display next to the input |
| `type` | **Required.** The data type of the input |
| `default` | A default value for the input |
| `dependsOn` | An array of input names that this input depends on |
| `readOnly` | Whether the input is read-only |
| `visible` | Whether the input is visible (can be a boolean or JQ expression) |

## Dynamic defaults with JQ

You can use JQ expressions to set dynamic default values based on other inputs or context:

```json showLineNumbers
{
  "environment": {
    "type": "string",
    "title": "Environment",
    "enum": ["dev", "staging", "prod"]
  },
  "replicas": {
    "type": "number",
    "title": "Replicas",
    "default": {
      "jqQuery": "if .form.environment == \"prod\" then 3 else 1 end"
    }
  }
}
```

## Ordering inputs

Use the `order` field to control the display order of inputs:

```json showLineNumbers
{
  "properties": {
    "input1": { "type": "string", "title": "First" },
    "input2": { "type": "string", "title": "Second" },
    "input3": { "type": "string", "title": "Third" }
  },
  "order": ["input3", "input1", "input2"]
}
```

## Required inputs

Specify which inputs are required using the `required` array:

```json showLineNumbers
{
  "properties": {
    "name": { "type": "string", "title": "Name" },
    "description": { "type": "string", "title": "Description" }
  },
  "required": ["name"]
}
```
