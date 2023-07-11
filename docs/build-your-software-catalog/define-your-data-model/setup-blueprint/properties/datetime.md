---
sidebar_position: 10
description: Datetime is a data type used to reference a date and time
---

import ApiRef from "../../../../api-reference/\_learn_more_reference.mdx"

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Datetime

Datetime is a data type used to reference a date and time.

## 💡 Common datetime usage

The datetime property type can be used to store any date and time, for example:

- Deployment time;
- Release time;
- Last incident date;
- Creation timestamp;
- etc.

In this [live demo](https://demo.getport.io/services) example, we can see the `Last Update` datetime property. 🎬

## API definition

<Tabs groupId="api-definition" defaultValue="basic" values={[
{label: "Basic", value: "basic"},
{label: "Array", value: "array"}
]}>

<TabItem value="basic">

```json showLineNumbers
{
  "myDatetimeProp": {
    "title": "My datetime",
    "icon": "My icon",
    "description": "My datetime property",
    // highlight-start
    "type": "string",
    "format": "date-time",
    // highlight-end
    "default": "2022-04-18T11:44:15.345Z"
  }
}
```

</TabItem>

<TabItem value="array">

```json showLineNumbers
{
  "myDatetimeArray": {
    "title": "My datetime array",
    "icon": "My icon",
    "description": "My datetime array",
    // highlight-start
    "type": "array",
    "items": {
      "type": "string",
      "format": "date-time"
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
{label: "Array", value: "array"}
]}>

<TabItem value="basic">

```hcl showLineNumbers
resource "port_blueprint" "myBlueprint" {
  # ...blueprint properties
  # highlight-start
  properties = {
    string_props = {
      "myDatetimeProp" = {
        title       = "My datetime"
        icon        = "My icon"
        description = "My datetime property"
        format      = "date-time"
        default     = "2022-04-18T11:44:15.345Z"
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
    array_props = {
      "myDatetimeArray" = {
        title    = "My datetime array"
        icon     = "My icon"
        required = false
        type     = "array"
        string_items = {
          format = "date-time"
        }
      }
    }
  }
  # highlight-end
}
```

</TabItem>
</Tabs>

## Pulumi definition

<Tabs groupId="pulumi-definition" defaultValue="basic" values={[
{label: "Basic", value: "basic"},
{label: "Enum", value: "enum"},
{label: "Array - coming soon", value: "array"}
]}>

<TabItem value="basic">

<Tabs groupId="pulumi-definition-date-time-basic" defaultValue="python" values={[
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
        "type": "string",
        "identifier": "myDatetimeProp",
        "title": "My datetime",
        "required": True,
        "format": "date-time"
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
      identifier: "myDatetimeProp",
      title: "My datetime",
      type: "string",
      required: true,
      format: "date-time",
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
      identifier: "myDatetimeProp",
      title: "My datetime",
      type: "string",
      required: true,
      format: "date-time",
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
					Identifier: pulumi.String("myDatetimeProp"),
					Title:      pulumi.String("My datetime"),
					Required:   pulumi.Bool(false),
					Type:       pulumi.String("string"),
					Format:     pulumi.String("date-time"),
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

</TabItem>

<TabItem value="enum">

<Tabs groupId="pulumi-definition-date-time-enum" defaultValue="python" values={[
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
    properties=[{
      "type": "string",
      "identifier": "myDatetimeProp",
      "title": "My datetime",
      "format": "date-time",
      "required": True,
      "enum": ["2022-04-18T11:44:15.345Z", "2022-05-18T11:44:15.345Z"],
      "enum_colors": {
        "2022-04-18T11:44:15.345Z": "red",
        "2022-05-18T11:44:15.345Z": "green"
      }
    }],
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
      identifier: "myDatetimeProp",
      title: "My datetime",
      type: "string",
      required: true,
      format: "date-time",
      enums: ["2022-04-18T11:44:15.345Z", "2022-05-18T11:44:15.345Z"],
      enumColors: {
        "2022-04-18T11:44:15.345Z": "red",
        "2022-05-18T11:44:15.345Z": "green",
      },
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
      identifier: "myDatetimeProp",
      title: "My datetime",
      type: "string",
      required: true,
      format: "date-time",
      enums: ["2022-04-18T11:44:15.345Z", "2022-05-18T11:44:15.345Z"],
      enumColors: {
        "2022-04-18T11:44:15.345Z": "red",
        "2022-05-18T11:44:15.345Z": "green",
      },
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
					Identifier: pulumi.String("myDatetimeProp"),
					Title:      pulumi.String("My datetime"),
					Required:   pulumi.Bool(false),
					Type:       pulumi.String("string"),
					Format:     pulumi.String("date-time"),
					Enums: pulumi.StringArray{
						pulumi.String("2022-04-18T11:44:15.345Z"),
						pulumi.String("2022-05-18T11:44:15.345Z"),
					},
					EnumColors: pulumi.StringMap{
						"2022-04-18T11:44:15.345Z": pulumi.String("red"),
						"2022-05-18T11:44:15.345Z": pulumi.String("green"),
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

</TabItem>
</Tabs>
