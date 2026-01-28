---
sidebar_position: 13
title: YAML
sidebar_class_name: "custom-sidebar-item sidebar-property-string"
---

# YAML

YAML inputs allow users to provide YAML-formatted content.

## Common usage

The YAML input type can be used for:

- Kubernetes manifests
- Configuration files
- Infrastructure definitions
- Complex nested data

## Definition

```json showLineNumbers
{
  "manifest": {
    "title": "Kubernetes Manifest",
    "description": "YAML manifest to apply",
    "type": "string",
    "format": "yaml"
  }
}
```

## Properties

| Property | Type | Description |
| -------- | ---- | ----------- |
| `type` | `"string"` | **Required.** Must be `"string"` |
| `format` | `"yaml"` | **Required.** Must be `"yaml"` |
| `default` | `string` | Default YAML content |

## Example with default

```json showLineNumbers
{
  "resourceConfig": {
    "title": "Resource Configuration",
    "description": "Resource configuration in YAML format",
    "type": "string",
    "format": "yaml",
    "default": "replicas: 1\nresources:\n  cpu: 100m\n  memory: 256Mi"
  }
}
```

The YAML editor provides syntax highlighting and validation in the Port UI.
