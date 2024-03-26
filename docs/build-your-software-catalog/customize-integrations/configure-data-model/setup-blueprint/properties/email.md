---
sidebar_position: 6
description: Email is a data type used to save Email addresses
sidebar_class_name: "custom-sidebar-item sidebar-property-string"
---

import ApiRef from "/docs/api-reference/\_learn_more_reference.mdx"

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Email

Email is a data type used to save Email addresses.

## 💡 Common email usage

The Email property type can be used to store any legal email address.

## API definition

<Tabs groupId="api-definition" queryString defaultValue="basic" values={[
{label: "Basic", value: "basic"},
{label: "Enum", value: "enum"},
{label: "Array", value: "array"}
]}>

<TabItem value="basic">

```json showLineNumbers
{
  "myEmailProp": {
    "title": "My email",
    "icon": "My icon",
    "description": "My email property",
    // highlight-start
    "type": "string",
    "format": "email",
    // highlight-end
    "default": "me@example.com"
  }
}
```

</TabItem>
<TabItem value="enum">

```json showLineNumbers
{
  "myEmailEnum": {
    "title": "My email enum",
    "icon": "My icon",
    "description": "My email enum",
    "type": "string",
    "format": "email",
    // highlight-next-line
    "enum": ["me@example.com", "example@example.com"],
    "enumColors": {
      "me@example.com": "red",
      "example@example.com": "green"
    }
  }
}
```

</TabItem>
<TabItem value="array">

```json showLineNumbers
{
  "myEmailArray": {
    "title": "My email array",
    "icon": "My icon",
    "description": "My email array",
    // highlight-start
    "type": "array",
    "items": {
      "type": "string",
      "format": "email"
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
    string_props = {
      "myEmailProp" = {
        title       = "My email"
        icon        = "My icon"
        description = "My email property"
        format      = "email"
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
    identifier = "myEmailProp"
    title      = "My email"
    required   = false
    type       = "string"
    format     = "email"
    enum       = ["me@example.com", "example@example.com"]
    enum_colors = {
      "me@example.com" = "red",
      "example@example.com" = "green"
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
      myEmailArray = {
        title      = "My email array"
        identifier = "myEmailArray"
        type       = "array"
        string_items = {
          format = "email"
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
{label: "Enum", value: "enum"},
{label: "Array - coming soon", value: "array"}
]}>

<TabItem value="basic">

<Tabs groupId="pulumi-definition-email-basic" queryString defaultValue="python" values={[
{label: "Python", value: "python"},
{label: "TypeScript", value: "typescript"},
{label: "JavaScript", value: "javascript"},
{label: "GO", value: "go"}
]}>

<TabItem value="python">

```python showLineNumbers
"""A Python Pulumi program"""

import pulumi
from port_pulumi import Blueprint,BlueprintPropertiesArgs,BlueprintPropertiesStringPropsArgs

blueprint = Blueprint(
    "myBlueprint",
    identifier="myBlueprint",
    title="My Blueprint",
    # highlight-start
    properties=BlueprintPropertiesArgs(
        string_props={
            "myEmailProp": BlueprintPropertiesStringPropsArgs(
                title="My email",
                format="email",
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
    string_props: {
      myEmailProp: {
        title: "My email",
        format: "email",
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
    string_props: {
      myEmailProp: {
        title: "My email",
        format: "email",
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
				StringProps: port.BlueprintPropertiesStringPropsMap{
					"myEmailProp": &port.BlueprintPropertiesStringPropsArgs{
                        Title:  pulumi.String("My email"),
                        Format: pulumi.String("email"),
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

</TabItem>

<TabItem value="enum">

<Tabs groupId="pulumi-definition-email-enum" queryString defaultValue="python" values={[
{label: "Python", value: "python"},
{label: "TypeScript", value: "typescript"},
{label: "JavaScript", value: "javascript"},
{label: "GO", value: "go"}
]}>

<TabItem value="python">

```python showLineNumbers
"""A Python Pulumi program"""

import pulumi
from port_pulumi import Blueprint,BlueprintPropertiesArgs,BlueprintPropertiesStringPropsArgs

blueprint = Blueprint(
    "myBlueprint",
    identifier="myBlueprint",
    title="My Blueprint",
    # highlight-start
    properties=BlueprintPropertiesArgs(
        string_props={
            "myEmailProp": BlueprintPropertiesStringPropsArgs(
                title="My email",
                required=True,
                format="email",
                enums=["me@example.com", "other@example.com"],
                enum_colors={
                    "me@example.com": "red",
                    "other@example.com": "green",
                },
            )
        }
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
        stringProps: {
            myEmailProp: {
                title: "My email",
                required: true,
                format: "email",
                enums: ["me@example.com", "other@example.com"],
                enumColors: {
                    "me@example.com": "red",
                    "other@example.com": "green",
                },
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
      stringProps: {
        myEmailProp: {
          title: "My email",
          required: true,
          format: "email",
          enums: ["me@example.com", "other@example.com"],
          enumColors: {
            "me@example.com": "red",
            "other@example.com": "green",
          },
      }
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
				StringProps: port.BlueprintPropertiesStringPropsMap{
					"myEmailProp": &port.BlueprintPropertiesStringPropsArgs{
						Title:    pulumi.String("My email"),
						Required: pulumi.Bool(false),
						Format:   pulumi.String("email"),
						Enums: pulumi.StringArray{
							pulumi.String("me@example.com"),
							pulumi.String("other@example.com"),
						},
						EnumColors: pulumi.StringMap{
							"me@example.com":    pulumi.String("red"),
							"other@example.com": pulumi.String("green"),
						},
						Format: pulumi.String("email"),
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
