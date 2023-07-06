---
sidebar_position: 9
description: Team is a data type used to reference teams that exist in Port
---

import ApiRef from "../../../../api-reference/\_learn_more_reference.mdx"

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Team

Team is a data type used to reference teams that exist in Port.

## 💡 Common team usage

The team property type can be used to reference any team that exists in Port, for example:

- The service owning team;
- The current on-call;
- The lead maintainers;
- etc.

In this [live demo](https://demo.getport.io/services) example, we can see the `Team` team property. 🎬

## API definition

<Tabs groupId="api-definition" defaultValue="basic" values={[
{label: "Basic", value: "basic"},
{label: "Array", value: "array"}
]}>

<TabItem value="basic">

```json showLineNumbers
{
  "myTeamProp": {
    "title": "My team",
    "icon": "My icon",
    "description": "My team property",
    // highlight-start
    "type": "string",
    "format": "team",
    // highlight-end
    "default": "my-team"
  }
}
```

</TabItem>
<TabItem value="array">

```json showLineNumbers
{
  "myTeamArray": {
    "title": "My team array",
    "icon": "My icon",
    "description": "My team array",
    // highlight-start
    "type": "array",
    "items": {
      "type": "string",
      "format": "team"
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
resource "port-labs_blueprint" "myBlueprint" {
  # ...blueprint properties
  # highlight-start
  properties {
    identifier = "myTeamProp"
    title      = "My team"
    required   = false
    type       = "string"
    format     = "team"
  }
  # highlight-end
}
```

</TabItem>

<TabItem value="array">

```hcl showLineNumbers
resource "port-labs_blueprint" "myBlueprint" {
  # ...blueprint properties
  # highlight-start
  properties {
    identifier = "myTeamArray"
    title      = "My team array"
    required   = false
    type       = "array"
    items = {
      type   = "string"
      format = "user"
    }
  }
  # highlight-end
}
```

</TabItem>

</Tabs>

## Pulumi definition

<Tabs groupId="pulumi-definition-team-basic" defaultValue="python" values={[
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
         "format": "team",
         "identifier": "myTeamProp",
         "title": "My team",
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
      identifier: "myTeamProp",
      title: "My team",
      type: "string",
      format: "team",
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
      identifier: "myTeamProp",
      title: "My team",
      type: "string",
      format: "team",
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
					Identifier: pulumi.String("myTeamProp"),
					Title:      pulumi.String("My team"),
					Required:   pulumi.Bool(false),
					Type:       pulumi.String("string"),
					Format:     pulumi.String("team"),
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
