---
sidebar_position: 3
title: Advanced input configurations
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import ClosedBetaFeatureNotice from '/docs/generalTemplates/_closed_beta_feature_notice.md';

# Advanced input configurations

<ClosedBetaFeatureNotice id="workflows" />

This page covers advanced configuration options for workflow user inputs, including dependencies, visibility controls, and dynamic defaults.

## Input dependencies

Use the `dependsOn` property to create dependencies between inputs. When an input depends on another, it will be re-evaluated when the dependency changes.

```json showLineNumbers
{
  "properties": {
    "environment": {
      "type": "string",
      "title": "Environment",
      "enum": ["development", "staging", "production"]
    },
    "cluster": {
      "type": "string",
      "format": "entity",
      "blueprint": "cluster",
      "title": "Cluster",
      "dependsOn": ["environment"],
      "dataset": {
        "combinator": "and",
        "rules": [
          {
            "property": "environment",
            "operator": "=",
            "value": {
              "jqQuery": ".form.environment"
            }
          }
        ]
      }
    }
  }
}
```

In this example, the `cluster` input filters its available entities based on the selected `environment`.

## Visibility controls

Control when inputs are visible using the `visible` property.

<Tabs groupId="visibility" queryString defaultValue="static" values={[
{label: "Static", value: "static"},
{label: "Dynamic with JQ", value: "dynamic"}
]}>

<TabItem value="static">

```json showLineNumbers
{
  "hiddenInput": {
    "type": "string",
    "title": "Hidden Input",
    "visible": false
  }
}
```

</TabItem>
<TabItem value="dynamic">

```json showLineNumbers
{
  "properties": {
    "deploymentType": {
      "type": "string",
      "title": "Deployment Type",
      "enum": ["standard", "canary", "blue-green"]
    },
    "canaryPercentage": {
      "type": "number",
      "title": "Canary Percentage",
      "minimum": 1,
      "maximum": 100,
      "visible": {
        "jqQuery": ".form.deploymentType == \"canary\""
      },
      "dependsOn": ["deploymentType"]
    }
  }
}
```

The `canaryPercentage` input only appears when `deploymentType` is set to "canary".

</TabItem>
</Tabs>

## Dynamic defaults

Set default values dynamically using JQ expressions.

<Tabs groupId="defaults" queryString defaultValue="inputs" values={[
{label: "Based on other inputs", value: "inputs"},
{label: "Based on context", value: "context"},
{label: "Conditional defaults", value: "conditional"}
]}>

<TabItem value="inputs">

```json showLineNumbers
{
  "properties": {
    "serviceName": {
      "type": "string",
      "title": "Service Name"
    },
    "repositoryName": {
      "type": "string",
      "title": "Repository Name",
      "default": {
        "jqQuery": ".form.serviceName + \"-repo\""
      },
      "dependsOn": ["serviceName"]
    }
  }
}
```

</TabItem>
<TabItem value="context">

```json showLineNumbers
{
  "requestedBy": {
    "type": "string",
    "format": "user",
    "title": "Requested By",
    "default": {
      "jqQuery": ".trigger.by.user.email"
    },
    "readOnly": true
  }
}
```

</TabItem>
<TabItem value="conditional">

```json showLineNumbers
{
  "properties": {
    "environment": {
      "type": "string",
      "title": "Environment",
      "enum": ["development", "production"]
    },
    "replicas": {
      "type": "number",
      "title": "Replicas",
      "default": {
        "jqQuery": "if .form.environment == \"production\" then 3 else 1 end"
      },
      "dependsOn": ["environment"]
    }
  }
}
```

</TabItem>
</Tabs>

## Read-only inputs

Mark inputs as read-only to display values that users cannot modify:

```json showLineNumbers
{
  "workflowRunId": {
    "type": "string",
    "title": "Workflow Run ID",
    "default": {
      "jqQuery": ".run.id"
    },
    "readOnly": true
  }
}
```

## Input ordering

Control the display order of inputs using the `order` property:

```json showLineNumbers
{
  "properties": {
    "name": { "type": "string", "title": "Name" },
    "environment": { "type": "string", "title": "Environment" },
    "description": { "type": "string", "title": "Description" }
  },
  "order": ["environment", "name", "description"]
}
```

## Example

This example shows a userInputs configuration that combines input dependencies, conditional defaults, and visibility controls for a deployment form.

```json showLineNumbers
{
  "userInputs": {
    "properties": {
      "environment": {
        "type": "string",
        "title": "Environment",
        "enum": ["development", "staging", "production"],
        "enumColors": {
          "development": "blue",
          "staging": "orange",
          "production": "green"
        }
      },
      "service": {
        "type": "string",
        "format": "entity",
        "blueprint": "service",
        "title": "Service",
        "dependsOn": ["environment"],
        "dataset": {
          "combinator": "and",
          "rules": [
            {
              "property": "environment",
              "operator": "=",
              "value": { "jqQuery": ".form.environment" }
            }
          ]
        }
      },
      "version": {
        "type": "string",
        "title": "Version",
        "description": "Version tag to deploy"
      },
      "replicas": {
        "type": "number",
        "title": "Replicas",
        "default": {
          "jqQuery": "if .form.environment == \"production\" then 3 else 1 end"
        },
        "dependsOn": ["environment"],
        "minimum": 1,
        "maximum": 10
      },
      "enableMonitoring": {
        "type": "boolean",
        "title": "Enable Monitoring",
        "default": {
          "jqQuery": ".form.environment == \"production\""
        },
        "dependsOn": ["environment"]
      },
      "monitoringEndpoint": {
        "type": "string",
        "format": "url",
        "title": "Monitoring Endpoint",
        "visible": {
          "jqQuery": ".form.enableMonitoring == true"
        },
        "dependsOn": ["enableMonitoring"]
      }
    },
    "required": ["environment", "service", "version"],
    "order": ["environment", "service", "version", "replicas", "enableMonitoring", "monitoringEndpoint"]
  }
}
```
