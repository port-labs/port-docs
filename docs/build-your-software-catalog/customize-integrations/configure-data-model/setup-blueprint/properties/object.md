---
sidebar_position: 12
description: Object is a data type used to save object definitions in JSON
sidebar_class_name: "custom-sidebar-item sidebar-property-object"
---

import ApiRef from "/docs/api-reference/\_learn_more_reference.mdx"

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Object

Object is a data type used to save object definitions in JSON.

## 💡 Common object usage

The object property type can be used to store any key/value based data, for example:

- Configurations.
- Tags.
- HTTP responses.
- Dictionaries/Hash maps.

In this [live demo](https://demo.getport.io/cloud_resources) example, we can see the `Tags` object property. 🎬

## API definition

<Tabs groupId="api-definition" queryString defaultValue="basic" values={[
{label: "Basic", value: "basic"},
{label: "Array", value: "array"}
]}>

<TabItem value="basic">

```json showLineNumbers
{
  "myObjectProp": {
    "title": "My object",
    "icon": "My icon",
    "description": "My object property",
    // highlight-start
    "type": "object",
    // highlight-end
    "default": {
      "myKey": "myValue"
    }
  }
}
```

</TabItem>

<TabItem value="array">

```json showLineNumbers
{
  "myObjectArray": {
    "title": "My object array",
    "icon": "My icon",
    "description": "My object array",
    // highlight-start
    "type": "array",
    "items": {
      "type": "object"
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
{label: "Array", value: "array"}
]}>

<TabItem value="basic">

```hcl showLineNumbers
resource "port_blueprint" "myBlueprint" {
  # ...blueprint properties
  # highlight-start
  properties = {
    object_props = {
      "myObjectProp" = {
        title      = "My object"
        icon       = "My icon"
        description = "My object property"
        default    = jsonencode({"myKey" = "myValue"})
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
  properties {
    identifier = "myObjectArray"
    title      = "My object array"
    required   = false
    type       = "array"
    items = {
      type = "object"
    }
  }
  # highlight-end
}
```

</TabItem>
</Tabs>

## Pulumi definition

<Tabs groupId="pulumi-definition" queryString defaultValue="basic" values={[
{label: "Basic", value: "basic"},
{label: "Array - coming soon", value: "array"}
]}>

<TabItem value="basic">

<Tabs groupId="pulumi-definition-object-basic" queryString defaultValue="python" values={[
{label: "Python", value: "python"},
{label: "TypeScript", value: "typescript"},
{label: "JavaScript", value: "javascript"},
{label: "GO", value: "go"}
]}>

<TabItem value="python">

```python showLineNumbers
"""A Python Pulumi program"""

import pulumi
from port_pulumi import Blueprint,BlueprintPropertiesArgs,BlueprintPropertiesObjectPropsArgs

blueprint = Blueprint(
    "myBlueprint",
    identifier="myBlueprint",
    title="My Blueprint",
    # highlight-start
    properties=BlueprintPropertiesArgs(
        object_props=BlueprintPropertiesObjectPropsArgs(
            title="My object", required=False
        )
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
    objectProps: {
      myObjectProp: {
        title: "My object",
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
    objectProps: {
      myObjectProp: {
        title: "My object",
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
				ObjectProps: port.BlueprintPropertiesObjectPropsMap{
					"myObjectProp": port.BlueprintPropertiesObjectPropsArgs{
						Title:      pulumi.String("My object"),
                        Required:   pulumi.Bool(false),
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

## Validate object

Object validations support the following operators:

- `properties` - which keys must appear and what their type should be;
- `additionalProperties` - are keys not defined in `properties` allowed and what their type should be;
- `patternProperties` - which regex pattern should properties follow

:::tip
Object validations follow the JSON schema model, refer to the [JSON schema docs](https://json-schema.org/understanding-json-schema/reference/object.html) to learn about all of the available validations
:::

<Tabs groupId="validation-definition" queryString defaultValue="basic" values={[
{label: "Basic", value: "basic"},
{label: "Array", value: "array"},
{label: "Terraform - coming soon", value: "tf"}
]}>

<TabItem value="basic">

```json showLineNumbers
{
  "myObjectProp": {
    "title": "My object",
    "icon": "My icon",
    "description": "My object property",
    "type": "object",
    // highlight-start
    "properties": {
      "myRequiredProp": { "type": "number" }
    },
    "patternProperties": {
      "^S_": { "type": "string" },
      "^I_": { "type": "number" }
    },
    "additionalProperties": true
    // highlight-end
  }
}
```

</TabItem>

<TabItem value="array">

```json showLineNumbers
{
  "myObjectArray": {
    "title": "My object array",
    "icon": "My icon",
    "description": "My object array",
    // highlight-start
    "type": "array",
    "items": {
      "type": "object",
      "properties": {
        "myRequiredProp": { "type": "number" }
      },
      "patternProperties": {
        "^S_": { "type": "string" },
        "^I_": { "type": "number" }
      },
      "additionalProperties": true
    }
    // highlight-end
  }
}
```

</TabItem>
</Tabs>
