---
sidebar_position: 18
description: URL is a data type used to save links to websites
sidebar_class_name: "custom-sidebar-item sidebar-property-url"
---

import ApiRef from "/docs/api-reference/\_learn_more_reference.mdx"

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# URL

URL is a data type used to save links to websites.

## 💡 Common url usage

The URL property type can be used to store a link to any web resource, for example:

- Link to Datadog dashboard
- Link to Sentry tracing
- Link to pull request

## API definition

<Tabs groupId="api-definition" queryString defaultValue="basic" values={[
{label: "Basic", value: "basic"},
{label: "Enum", value: "enum"},
{label: "Array", value: "array"}
]}>

<TabItem value="basic">

```json showLineNumbers
{
  "myUrlProp": {
    "title": "My url",
    "icon": "My icon",
    "description": "My url property",
    // highlight-start
    "type": "string",
    "format": "url",
    // highlight-end
    "default": "https://example.com"
  }
}
```

</TabItem>
<TabItem value="enum">

```json showLineNumbers
{
  "myUrlEnum": {
    "title": "My url enum",
    "icon": "My icon",
    "description": "My url enum",
    "type": "string",
    "format": "url",
    // highlight-next-line
    "enum": ["https://example.com", "https://getport.io"],
    "enumColors": {
      "https://example.com": "red",
      "https://getport.io": "green"
    }
  }
}
```

</TabItem>
<TabItem value="array">

```json showLineNumbers
{
  "myUrlArray": {
    "title": "My url array",
    "icon": "My icon",
    "description": "My url array",
    // highlight-start
    "type": "array",
    "items": {
      "type": "string",
      "format": "url"
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
      "myUrlProp" = {
        title    = "My url"
        required = false
        format   = "url"
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
    string_props = {
      "myUrlEnum" = {
        title    = "My url enum"
        required = false
        format   = "url"
        enum     = ["https://example.com", "https://getport.io"]
        enum_colors = {
          "https://example.com" = "red",
          "https://getport.io"  = "green"
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
    string_props = {
      "myUrlArray" = {
        title    = "My url array"
        required = false
        string_items = {
          format = "url"
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

<Tabs groupId="pulumi-definition-url-basic" queryString defaultValue="python" values={[
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
            "myUrlProp": BlueprintPropertiesStringPropsArgs(
                title="My url", required=False, format="url"
            ),
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
      myUrlProp: {
        title: "My url",
        required: true,
        format: "url",
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
      myUrlProp: {
        title: "My url",
        required: true,
        format: "url",
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
                    "myUrlProp": &port.BlueprintPropertyArgs{
                        Title:      pulumi.String("My url"),
                        Required:   pulumi.Bool(true),
                        Format:     pulumi.String("url"),
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

<Tabs groupId="pulumi-definition-url-enum" queryString defaultValue="python" values={[
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
    properties=BlueprintPropertiesArgs(
        string_props={
            "myUrlProp":BlueprintPropertiesStringPropsArgs(
                title="My url",
                required=True,
                format="url",
                enum=["https://example.com", "https://getport.io"],
                enum_colors={
                    "https://example.com": "red",
                    "https://getport.io": "green"
                }
            )
        },
    )
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
    stringProps: {
      myUrlProp: {
        title: "My url",
        required: true,
        format: "url",
        enums: ["https://example.com", "https://getport.io"],
        enumColors: {
          "https://example.com": "red",
          "https://getport.io": "green",
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
      myUrlProp: {
        title: "My url",
        required: true,
        format: "url",
        enums: ["https://example.com", "https://getport.io"],
        enumColors: {
          "https://example.com": "red",
          "https://getport.io": "green",
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
					"myUrlProp": port.BlueprintPropertiesStringPropsArgs{
						Title:      pulumi.String("My url"),
						Required:   pulumi.Bool(false),
						Format:     pulumi.String("url"),
						Enums: pulumi.StringArray{
							pulumi.String("https://example.com"),
							pulumi.String("https://getport.io"),
						},
						EnumColors: pulumi.StringMap{
							"https://example.com": pulumi.String("red"),
							"https://getport.io":  pulumi.String("green"),
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
