---
sidebar_position: 3
description: Boolean is a primitive data type that has one of two possible values - true and false
---

import ApiRef from "../../../../api-reference/\_learn_more_reference.mdx"

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Boolean

Boolean is a primitive data type that has one of two possible values - `true` and `false`.

## 💡 Common boolean usage

The boolean property type can be used to store any true/false gate, for example:

- Is environment locked for deployments;
- Should environment perform nightly shutdown;
- Does service handle PII;
- Is environment public;
- etc.

In this [live demo](https://demo.getport.io/packages) example, we can see the `In-House?` boolean property. 🎬

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
resource "port-labs_blueprint" "myBlueprint" {
  # ...blueprint properties
  # highlight-start
  properties {
    identifier = "myBooleanProp"
    title      = "My boolean"
    required   = false
    type       = "boolean"
  }
  # highlight-end
}
```

## Pulumi definition

<Tabs groupId="pulumi-definition-boolean-basic" defaultValue="python" values={[
{label: "Python", value: "python"},
{label: "TypeScript", value: "typescript"},
{label: "JavaScript", value: "javascript"},
{label: "GO", value: "go"}
]}>

<TabItem value="python">

```python showLineNumbers
"""A Python Pulumi program"""

import pulumi
from port_pulumi import Blueprint

blueprint = Blueprint(
    "myBlueprint",
    identifier="myBlueprint",
    title="My Blueprint",
    # highlight-start
    properties=[
      {
        "type": "boolean",
        "identifier": "myBooleanProp",
        "title": "My boolean",
        "required": True
      }
    ],
    # highlight-end
    relations=[]
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
  properties: [
    {
      identifier: "myBooleanProp",
      title: "My boolean",
      type: "boolean",
      required: true,
    },
  ],
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
  properties: [
    {
      identifier: "myBooleanProp",
      title: "My boolean",
      type: "boolean",
      required: true,
    },
  ],
  // highlight-end
  relations: [],
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
			Properties: port.BlueprintPropertyArray{
				&port.BlueprintPropertyArgs{
					Identifier: pulumi.String("myBooleanProp"),
					Title:      pulumi.String("My boolean"),
					Required:   pulumi.Bool(false),
					Type:       pulumi.String("boolean"),
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
