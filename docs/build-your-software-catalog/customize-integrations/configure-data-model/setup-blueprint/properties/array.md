---
sidebar_position: 2
description: Array is a data type used to save lists of data
sidebar_class_name: "custom-sidebar-item sidebar-property-array"
---

import ApiRef from "/docs/api-reference/\_learn_more_reference.mdx"

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Array

Array is a data type used to save lists of data.

## 💡 Common array usage

The array property type can be used to store any list of data, for example:

- Used packages
- Dependencies
- Badges

In this [live demo](https://demo.getport.io/service_catalog) example, we can see the `Monitor Tooling` array property. 🎬

## API definition

```json showLineNumbers
{
  "myArrayProp": {
    "title": "My array",
    "icon": "My icon",
    "description": "My array property",
    // highlight-start
    "type": "array",
    // highlight-end
    "default": [1, 2, 3]
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
    array_props = {
      "myArrayProp" = {
        title      = "My array"
        required   = true
      }
    }
  }
  # highlight-end
}
```

:::info
To set the type of an array property, you need to use the `<type>_items` property type.
For example, to set an array of strings, you need to use the `string_items` property type.

```
resource "port_blueprint" "myBlueprint" {
  # ...blueprint properties
  properties = {
    array_props = {
      "myArrayProp" = {
        title      = "My array"
        required   = true
        string_items = {} # You can also set here default values
      }
    }
  }
}
```

We currently support the following types of array items: `string_items`, `number_items`, `boolean_items`, `object_items`.
:::

## Pulumi definition

<Tabs groupId="basic" queryString defaultValue="python" values={[
{label: "Python", value: "python"},
{label: "TypeScript", value: "typescript"},
{label: "JavaScript", value: "javascript"},
{label: "GO", value: "go"}
]}>

<TabItem value="python">

```python showLineNumbers
"""A Python Pulumi program"""

import pulumi
from port_pulumi import Blueprint,BlueprintPropertiesArgs,BlueprintPropertyArgs

blueprint = Blueprint(
    "myBlueprint",
    identifier="myBlueprint",
    title="My Blueprint",
    # highlight-start
    properties=BlueprintPropertiesArgs(
        array_props={
            "myArrayProp": BlueprintPropertyArgs(
                title="My array", required=True,
            )
        }
    ),
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
  properties: {
    array_props: {
      myArrayProp: {
        title: "My array",
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
    array_props: {
      myArrayProp: {
        title: "My array",
        required: true,
      },
    },
  },
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
			Properties: port.BlueprintPropertiesArgs{
				ArrayProps: port.BlueprintPropertiesArrayPropsMap{
                    "myArrayProp": port.BlueprintPropertyArgs{
                        Title:    pulumi.String("My array"),
                        Required: pulumi.Bool(true),
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

## Validate array

Array validations support the following operators:

- `minItems`
- `maxItems`
- `uniqueItems`

:::tip
Array validations follow the JSON schema model, refer to the [JSON schema docs](https://json-schema.org/understanding-json-schema/reference/array.html) to learn about all of the available validations
:::

<Tabs groupId="validation-definition" queryString defaultValue="basic" values={[
{label: "Basic", value: "basic"},
{label: "Terraform", value: "tf"}
]}>

<TabItem value="basic">

```json showLineNumbers
{
  "myArrayProp": {
    "title": "My array",
    "icon": "My icon",
    "description": "My array property",
    "type": "array",
    // highlight-start
    "minItems": 0,
    "maxItems": 5,
    "uniqueItems": false
    // highlight-end
  }
}
```

</TabItem>

<TabItem value="tf">

```hcl showLineNumbers
resource "port_blueprint" "myBlueprint" {
  # ...blueprint properties
  properties = {
    array_props = {
      "myArrayProp" = {
        title      = "My array"
        required   = true
        # highlight-start
        min_items  = 0
        max_items  = 5
        # highlight-end
      }
    }
  }
}
```

</TabItem>
</Tabs>
