---
sidebar_position: 7
description: Email is a data type used to save Email addresses
---

import ApiRef from "../../../../api-reference/\_learn_more_reference.mdx"

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Email

Email is a data type used to save Email addresses.

## 💡 Common email usage

The Email property type can be used to store any legal email address.

## API definition

<Tabs groupId="api-definition" defaultValue="basic" values={[
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

<Tabs groupId="tf-definition" defaultValue="basic" values={[
{label: "Basic", value: "basic"},
{label: "Enum", value: "enum"},
{label: "Array - coming soon", value: "array"}
]}>

<TabItem value="basic">

```hcl showLineNumbers
resource "port-labs_blueprint" "myBlueprint" {
  # ...blueprint properties
  # highlight-start
  properties {
    identifier = "myEmailProp"
    title      = "My email"
    required   = false
    type       = "string"
    format     = "email"
  }
  # highlight-end
}
```

</TabItem>

<TabItem value="enum">

```hcl showLineNumbers
resource "port-labs_blueprint" "myBlueprint" {
  # ...blueprint properties
  # highlight-start
  properties {
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
</Tabs>

## Pulumi definition

<Tabs groupId="pulumi-definition" defaultValue="basic" values={[
{label: "Basic", value: "basic"},
{label: "Enum", value: "enum"},
{label: "Array - coming soon", value: "array"}
]}>

<TabItem value="basic">

<Tabs groupId="pulumi-definition-email-basic" defaultValue="python" values={[
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
        "identifier": "myEmailProp",
        "title": "My email",
        "required": True,
        "format": "email"
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
import * as port from "@port-labs/pulumi";

export const blueprint = new port.Blueprint("myBlueprint", {
  identifier: "myBlueprint",
  title: "My Blueprint",
  // highlight-start
  properties: [
    {
      identifier: "myEmailProp",
      title: "My email",
      type: "string",
      required: true,
      format: "email",
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
const port = require("@port-labs/pulumi");

const entity = new port.Blueprint("myBlueprint", {
  title: "My Blueprint",
  identifier: "myBlueprint",
  // highlight-start
  properties: [
    {
      identifier: "myEmailProp",
      title: "My email",
      type: "string",
      required: true,
      format: "email",
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
	"github.com/port-labs/pulumi/sdk/go/port"
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
					Identifier: pulumi.String("myEmailProp"),
					Title:      pulumi.String("My email"),
					Required:   pulumi.Bool(false),
					Type:       pulumi.String("string"),
					Format:     pulumi.String("email"),
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

<Tabs groupId="pulumi-definition-email-enum" defaultValue="python" values={[
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
      "identifier": "myEmailProp",
      "title": "My email",
      "format": "email",
      "required": True,
      "enum": ["me@example.com", "other@example.com"],
      "enum_colors": {
        "me@example.com": "red",
        "other@example.com": "green"
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
import * as port from "@port-labs/pulumi";

export const blueprint = new port.Blueprint("myBlueprint", {
  identifier: "myBlueprint",
  title: "My Blueprint",
  // highlight-start
  properties: [
    {
      identifier: "myEmailProp",
      title: "My email",
      type: "string",
      required: true,
      format: "email",
      enums: ["me@example.com", "other@example.com"],
      enumColors: {
        "me@example.com": "red",
        "other@example.com": "green",
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
const port = require("@port-labs/pulumi");

const entity = new port.Blueprint("myBlueprint", {
  title: "My Blueprint",
  identifier: "myBlueprint",
  // highlight-start
  properties: [
    {
      identifier: "myEmailProp",
      title: "My email",
      type: "string",
      required: true,
      format: "email",
      enums: ["me@example.com", "other@example.com"],
      enumColors: {
        "me@example.com": "red",
        "other@example.com": "green",
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
	"github.com/port-labs/pulumi/sdk/go/port"
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
					Identifier: pulumi.String("myEmailProp"),
					Title:      pulumi.String("My email"),
					Required:   pulumi.Bool(false),
					Type:       pulumi.String("string"),
					Enums: pulumi.StringArray{
						pulumi.String("me@example.com"),
						pulumi.String("other@example.com"),
					},
					EnumColors: pulumi.StringMap{
						"me@example.com": pulumi.String("red"),
						"other@example.com": pulumi.String("green"),
					},
					Format:     pulumi.String("email"),
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
