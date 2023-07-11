---
sidebar_position: 2
description: Number is a primitive data type used to save numeric data
---

import ApiRef from "../../../../api-reference/\_learn_more_reference.mdx"

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Number

Number is a primitive data type used to save numeric data.

## 💡 Common number usage

The number property type can be used to store any numeric data, for example:

- Number of critical vulnerabilities;
- Memory/storage allocations;
- Replica counts;
- Number of open issues;
- etc.

In this [live demo](https://demo.getport.io/services) example, we can see the `JIRA Issues` number property. 🎬

## API definition

<Tabs groupId="api-definition" defaultValue="basic" values={[
{label: "Basic", value: "basic"},
{label: "Enum", value: "enum"},
{label: "Array", value: "array"}
]}>

<TabItem value="basic">

```json showLineNumbers
{
  "myNumberProp": {
    "title": "My number",
    "icon": "My icon",
    "description": "My number property",
    // highlight-start
    "type": "number",
    // highlight-end
    "default": 7
  }
}
```

</TabItem>
<TabItem value="enum">

```json showLineNumbers
{
  "myNumberEnum": {
    "title": "My number enum",
    "icon": "My icon",
    "description": "My number enum",
    "type": "number",
    // highlight-next-line
    "enum": [1, 2, 3, 4]
  }
}
```

</TabItem>
<TabItem value="array">

```json showLineNumbers
{
  "myNumberArray": {
    "title": "My number array",
    "icon": "My icon",
    "description": "My number array",
    // highlight-start
    "type": "array",
    "items": {
      "type": "number"
    }
    // highlight-end
  }
}
```

</TabItem>
</Tabs>

<ApiRef />

## Terraform definition

<Tabs groupId="tf-definition" defaultValue="basic" values={[
{label: "Basic", value: "basic"},
{label: "Enum", value: "enum"},
{label: "Array", value: "array"}
]}>

<TabItem value="basic">

```hcl showLineNumbers
resource "port_blueprint" "myBlueprint" {
  # ...blueprint properties
  # highlight-start
  properties = {
    number_props = {
      "myNumberProp" = {
        title       = "My number"
        description = "My number property"
        default     = 7
      }
    }
  }
  # highlight-end
}
```

</TabItem>
<TabItem value="enum">

```hcl showLineNumbers
resource "port_blueprint" "myBlueprint" {
  # ...blueprint properties
  # highlight-start
  properties = {
    number_props = {
      "myNumberProp" = {
        title       = "My number"
        description = "My number property"
        enum        = [1, 2, 3, 4]
      }
    }
  }
  # highlight-end
}
```

</TabItem>

<TabItem value="array">

```hcl showLineNumbers
resource "port_blueprint" "myBlueprint" {
  # ...blueprint properties
  # highlight-start
  properties = {
    "myNumberArray" = {
      title        = "My number array"
      description  = "My number array"
      number_items = {}
    }
    "myNumberArrayWithDefault" = {
      title       = "My number array with default"
      description = "My number array"
      number_items = {
        default = [1, 2, 3, 4]
      }
    }
  }
}
```

</TabItem>

</Tabs>

## Pulumi definition

<Tabs groupId="pulumi-definition" defaultValue="basic" values={[
{label: "Basic", value: "basic"},
{label: "Enum - coming soon", value: "enum"},
{label: "Array - coming soon", value: "array"}
]}>

<TabItem value="basic">

<Tabs groupId="pulumi-definition-number-basic" defaultValue="python" values={[
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
        "type": "number",
        "identifier": "myNumberProp",
        "title": "My Number",
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
      identifier: "myNumberProp",
      title: "My Number",
      type: "number",
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
      identifier: "myNumberProp",
      title: "My Number",
      type: "number",
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
					Identifier: pulumi.String("myNumberProp"),
					Title:      pulumi.String("My Number"),
					Required:   pulumi.Bool(false),
					Type:       pulumi.String("number"),
				},
			},
		})
    // highlight-end
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

</TabItem>
</Tabs>

## Validate number

Number validations support the following operators:

- `range`

Ranges of numbers are specified using a combination of the `minimum` and `maximum` keywords, (or `exclusiveMinimum` and `exclusiveMaximum` for expressing exclusive range).

If _x_ is the value being validated, the following must hold true:

- _x_ ≥ `minimum`
- _x_ > `exclusiveMinimum`
- _x_ ≤ `maximum`
- _x_ < `exclusiveMaximum`

<Tabs groupId="validation-definition" defaultValue="basic" values={[
{label: "Basic", value: "basic"},
{label: "Array", value: "array"},
{label: "Terraform", value: "tf"},
{label: "Pulumi - comfing soon", value: "pulumi"}
]}>

<TabItem value="basic">

```json showLineNumbers
{
  "myNumberProp": {
    "title": "My number",
    "icon": "My icon",
    "description": "My number property",
    "type": "number",
    // highlight-start
    "minimum": 0,
    "maximum": 50
    // highlight-end
  }
}
```

</TabItem>

<TabItem value="array">

```json showLineNumbers
{
  "myNumberArray": {
    "title": "My number array",
    "icon": "My icon",
    "description": "My number array",
    // highlight-start
    "type": "array",
    "items": {
      "type": "number",
      "exclusiveMinimum": 0,
      "exclusiveMaximum": 50
    }
    // highlight-end
  }
}
```

</TabItem>

<TabItem value="tf">

```hcl showLineNumbers

resource "port_blueprint" "myBlueprint" {
  properties = {
    "number_props" = {
      "myNumberProp" = {
        title       = "My number"
        icon        = "My icon"
        description = "My number property"
        # highlight-start
        minimum     = 0
        maximum     = 50
        # highlight-end
      }
    }
  }
}
```

</TabItem>

</Tabs>
