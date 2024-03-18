---
sidebar_position: 3
description: Boolean is a primitive data type that has one of two possible values - true and false
sidebar_class_name: "custom-sidebar-item sidebar-property-boolean"
---

import ApiRef from "/docs/api-reference/\_learn_more_reference.mdx"

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Boolean

Boolean is a primitive data type that has one of two possible values - `true` and `false`.

## 💡 Common boolean usage

The boolean property type can be used to store any true/false gate, for example:

- Is environment locked for deployments
- Should environment perform nightly shutdown
- Does service handle PII
- Is environment public

## API definition

```json showLineNumbers
{
  "myBooleanProp": {
    "title": "My boolean",
    "icon": "My icon",
    "description": "My boolean property",
    // highlight-start
    "type": "boolean",
    // highlight-end
    "default": true
  }
}
```

<ApiRef />

## Terraform definition

```hcl showLineNumbers
resource "port_blueprint" "myBlueprint" {
  # ...blueprint properties
  # highlight-start
  properties = {
    boolean_props = {
      "myBooleanProp" = {
        title      = "My boolean"
        required   = true
      }
    }
  }
  # highlight-end
}
```

## Pulumi definition

<Tabs groupId="pulumi-definition-boolean-basic" queryString defaultValue="python" values={[
{label: "Python", value: "python"},
{label: "TypeScript", value: "typescript"},
{label: "JavaScript", value: "javascript"},
{label: "GO", value: "go"}
]}>

<TabItem value="python">

```python showLineNumbers
"""A Python Pulumi program"""

import pulumi
from port_pulumi import Blueprint,BlueprintPropertiesArgs,BlueprintPropertiesBooleanPropsArgs

blueprint = Blueprint(
    "myBlueprint",
    identifier="myBlueprint",
    title="My Blueprint",
    # highlight-start
    properties=BlueprintPropertiesArgs(
        boolean_props={
            "myBooleanProp": BlueprintPropertiesBooleanPropsArgs(
                title="My boolean",
                required=True,
            )
        }
    ),
    # highlight-end
    relations={},
)
```

</TabItem>

<TabItem value="typescript">

```typescript showLineNumbers
import * as pulumi from "@pulumi/pulumi";
import * as port from "@port-labs/port";

export const blueprint = new port.Blueprint("myBlueprint", {
  identifier: "myBlueprint",
  title: "My Blueprint",
  // highlight-start
  properties: {
    booleanProps: {
      myBooleanProp: {
        title: "My boolean",
        required: true,
      },
    },
  },
  // highlight-end
});
```

</TabItem>

<TabItem value="javascript">

```javascript showLineNumbers
"use strict";
const pulumi = require("@pulumi/pulumi");
const port = require("@port-labs/port");

const entity = new port.Blueprint("myBlueprint", {
  title: "My Blueprint",
  identifier: "myBlueprint",
  // highlight-start
  properties: {
    booleanProps: {
      myBooleanProp: {
        title: "My boolean",
        required: true,
      },
    },
  },
  // highlight-end
  relations: {},
});

exports.title = entity.title;
```

</TabItem>
<TabItem value="go">

```go showLineNumbers
package main

import (
	"github.com/port-labs/pulumi-port/sdk/go/port"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		blueprint, err := port.NewBlueprint(ctx, "myBlueprint", &port.BlueprintArgs{
			Identifier: pulumi.String("myBlueprint"),
			Title:      pulumi.String("My Blueprint"),
      // highlight-start
			Properties: port.BlueprintPropertiesArgs{
				BooleanProps: port.BlueprintPropertiesBooleanPropsMap{
					"myBooleanProp": port.BlueprintPropertiesBooleanPropsArgs{
						Title:    pulumi.String("My boolean"),
						Required: pulumi.Bool(false),
					},
                },
            },
      // highlight-end
		})
		ctx.Export("blueprint", blueprint.Title)
		if err != nil {
			return err
		}
		return nil
	})
}
```

</TabItem>

</Tabs>
