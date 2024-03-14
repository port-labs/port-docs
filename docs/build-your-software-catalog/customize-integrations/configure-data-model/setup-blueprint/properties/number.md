---
sidebar_position: 11
description: Number is a primitive data type used to save numeric data
sidebar_class_name: "custom-sidebar-item sidebar-property-number"
---

import ApiRef from "/docs/api-reference/\_learn_more_reference.mdx"

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

In this [live demo](https://demo.getport.io/service_catalog) example, we can see the `JIRA Issues` number property. 🎬

## API definition

<Tabs groupId="api-definition" queryString defaultValue="basic" values={[
{label: "Basic", value: "basic"},
{label: "Enum", value: "enum"},
{label: "Array", value: "array"},
{label: "Enum Array", value: "enumArray"},
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
<TabItem value="enumArray">

```json showLineNumbers
{
  "myNumberArray": {
    "title": "My number enum array",
    "icon": "My icon",
    "description": "My number enum array",
    // highlight-start
    "type": "array",
    "items": {
      "type": "number",
      "enum": [1, 2, 3, 4],
      "enumColors": {
        "1": "red",
        "2": "green",
        "3": "blue"
      }
    }
    // highlight-end
  }
}
```

</TabItem>
</Tabs>

<ApiRef />

## Terraform definition

<Tabs groupId="tf-definition" queryString defaultValue="basic" values={[
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

<Tabs groupId="pulumi-definition" queryString defaultValue="basic" values={[
{label: "Basic", value: "basic"},
{label: "Enum - coming soon", value: "enum"},
{label: "Array - coming soon", value: "array"}
]}>

<TabItem value="basic">

<Tabs groupId="pulumi-definition-number-basic" queryString defaultValue="python" values={[
{label: "Python", value: "python"},
{label: "TypeScript", value: "typescript"},
{label: "JavaScript", value: "javascript"},
{label: "GO", value: "go"}
]}>

<TabItem value="python">

```python showLineNumbers
"""A Python Pulumi program"""

import pulumi
from port_pulumi import Blueprint,BlueprintPropertiesArgs,BlueprintPropertiesNumberPropsArgs

blueprint = Blueprint(
    "myBlueprint",
    identifier="myBlueprint",
    title="My Blueprint",
    # highlight-start
    properties=BlueprintPropertiesArgs(
        number_props={
            "myNumberProp": BlueprintPropertiesNumberPropsArgs(
                title="My number", required=False,
            )
        },
    ),
    # highlight-end
    relations={}
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
    numberProps: {
      myNumberProp: {
        title: "My number",
        required: false,
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
    numberProps: {
      myNumberProp: {
        title: "My number",
        required: false,
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
				NumberProps: port.BlueprintPropertiesNumberPropsMap{
					"myNumberProp": port.BlueprintPropertiesNumberPropsArgs{
						Title:    pulumi.String("My number"),
						Required: pulumi.Bool(false),
					},
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

<Tabs groupId="validation-definition" queryString defaultValue="basic" values={[
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
