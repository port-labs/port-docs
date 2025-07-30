---
sidebar_position: 19
description: Enum is a data type used to define a named set of constant values.
sidebar_class_name: "custom-sidebar-item sidebar-property-enum"
---

import ApiRef from "/docs/api-reference/\_learn_more_reference.mdx"

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import LimitFieldRestriction from "/docs/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/_limit_field_restriction.mdx"

# Enum

Enum is a data type  used to define a named set of constant values.

<LimitFieldRestriction property_name='enum' />

## 💡 Common enum usage

The enum property type can be used to define a set of constant values, for example:

- Deployment status: pending, in progress, success, failed.
- Environments: production, staging, development.
- Service health status: healthy, degraded, unhealthy, unkown, maintenance, etc.

## API definition

<Tabs groupId="api-definition" queryString defaultValue="basic" values={[
{label: "Basic", value: "basic"},
{label: "Array", value: "array"}
]}>

<TabItem value="basic">

```json showLineNumbers
{
  "myStringEnum": {
    "title": "My enum",
    "icon": "My icon",
    #highlight-start
    "type": "string",
    "enum": ["my-option-1", "my-option-2"],
    #highlight-end
    "enumColors": {
      "my-option-1": "red",
      "my-option-2": "green"
    }
  }
}
```

</TabItem>
<TabItem value="array">

```json showLineNumbers
{
  "myStringArray": {
    "title": "My enum array",
    "icon": "My icon",
    "description": "My enum array",
    // highlight-start
    "type": "array",
    "items": {
      "type": "string",
      "enum": ["my-option-1", "my-option-2"],
      "enumColors": {
        "my-option-1": "red",
        "my-option-2": "green"
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
{label: "Array", value: "array"}
]}>

<TabItem value="basic">

```hcl showLineNumbers
resource "port_blueprint" "myBlueprint" {
  # ...blueprint properties
  # highlight-start
  properties = {
    string_props = {
      "myEnumProp" = {
        title       = "My Enum"
        required    = false
        enum        = ["my-option-1", "my-option-2"]   
        enum_colors = {
            "my-option-1" = "green"
            "my-option-2" = "blue"
        }
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
    my_enum_array_prop = {
        title = "myEnumArrayProp"
        string_items = {
            type = "string"
            enum = [ "my-option-1", "my-option-2", "my-option-3"]
            enum_colors = {
                "my-option-1" = "gold"
                "my-option-2" = "bronze"
                "my-option-3" = "lightGray"
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

<Tabs groupId="pulumi-definition" queryString defaultValue="basic" values={[
{label: "Basic", value: "basic"},
{label: "Array", value: "array"}
]}>

<TabItem value="basic">

<Tabs groupId="pulumi-definition-enum-basic" queryString defaultValue="python" values={[
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
    properties={
        "string_props": {
            "myEnumProp": {
                "title": "My Enum",
                "required": True,
                "enum_colors": {
                    "my-option-1": "red",
                    "my-option-2": "green",
                },
                "enums": ["my-option-1", "my-option-2"]
            }
        }
    },
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
  
  properties: {
    stringProps: {
      myEnumProp: {
        title: "My Enum",
        required: true,
        enums: ["my-option-1", "my-option-2"],
        enumColors: {
          "my-option-1": "red",
          "my-option-2": "green",
        },
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
    stringProps: {
      myEnumProp: {
        title: "My Enum",
        required: true,
        enums: ["my-option-1", "my-option-2"],
        enumColors: {
          "my-option-1": "red",
          "my-option-2": "green",
        },
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
	"github.com/port-labs/pulumi-port/sdk/v2/go/port"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		blueprint, err := port.NewBlueprint(ctx, "myBlueprint", &port.BlueprintArgs{
			Identifier: pulumi.String("myBlueprint"),
			Title:      pulumi.String("My Blueprint"),
      // highlight-start
			Properties: port.BlueprintPropertiesArgs{
				StringProps: port.BlueprintPropertiesStringPropsMap{
					"myEnumProp": port.BlueprintPropertiesStringPropsArgs{
                        Title:      pulumi.String("My Enum"),
                        Required:   pulumi.Bool(false),
                        Enums: pulumi.StringArray{
                            pulumi.String("my-option-1"),
                            pulumi.String("my-option-2"),
                        },
                        EnumColors: pulumi.StringMap{
                            "my-option-1": pulumi.String("red"),
                            "my-option-2": pulumi.String("green"),
                        },
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

<TabItem value="array">

<Tabs groupId="pulumi-definition-enum" queryString defaultValue="python" values={[
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
    title="myBlueprint",
    properties={
        "array_props": {
            "myEnumProp": {
                "title":"My Enum Array",
                "required":True,
                "string_items": {
                    "enums" : ["my-option-1", "my-option-2"],
                    "enum_colors" : {
                        "my-option-1": "red",
                        "my-option-2": "green",
                    }
                }
            } 
        }
    },
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
    arrayProps: {
        myEnum: {
            title: "My enum",
            required: true,
            stringItems: {
                enumColors: {
                "my-option-1": "red",
                "my-option-2": "green",
                },
                enums: ["my-option-1", "my-option-2"],
            },
        }
    }
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
    arrayProps: { 
        myEnumProp: {
            title: "My Enum",
            required: true,
            stringItems: {
            enums: ["my-option-1", "my-option-2"],
            enumColors: {
            "my-option-1": "red",
            "my-option-2": "green",
                },
            },
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
	"github.com/port-labs/pulumi-port/sdk/v2/go/port"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		blueprint, err := port.NewBlueprint(ctx, "myBlueprint", &port.BlueprintArgs{
			Identifier: pulumi.String("myBlueprint"),
			Title:      pulumi.String("myBlueprint"),
			// highlight-start
			Properties: &port.BlueprintPropertiesArgs{
				ArrayProps: port.BlueprintPropertiesArrayPropsMap{
					"myEnumProp": &port.BlueprintPropertiesArrayPropsArgs{
						Title:    pulumi.String("My Enum"),
						Required: pulumi.Bool(false),
						StringItems: &port.BlueprintPropertiesArrayPropsStringItemsArgs{
							Enums: pulumi.StringArray{
								pulumi.String("my-option-1"),
								pulumi.String("my-option-2"),
							},
							EnumColors: pulumi.StringMap{
								"my-option-1": pulumi.String("red"),
								"my-option-2": pulumi.String("green"),
							},
						},
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

## Available enum colors

Properties defined using [enum](#api-definition) can also include specific colors for the different values available in the property definition, the available enum colors are:

```text showLineNumbers
blue
turquoise
orange
purple
pink
yellow
green
red
darkGray
lightGray
bronze
```