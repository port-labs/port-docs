---
sidebar_position: 8
description: User is a data type used to reference users that exist in Port
---

import ApiRef from "../../../../api-reference/\_learn_more_reference.mdx"

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# User

User is a data type used to reference users that exist in Port.

## 💡 Common user usage

The user property type can be used to reference any user that exists in Port, for example:

- The code owners;
- The current on-call;
- The lead maintainer;
- etc.

In this [live demo](https://demo.getport.io/services) example, we can see the `On Call` user property. 🎬

:::note
Even though the input is the same in both `email` and `user` formats, their presentation is different:

- `email` format displays the raw email string;
- `user` format displays the user's name and avatar from Port's list of known users.

In addition, `user` format distinguishes between users by their status:

| User Status  | Example                                                                                 |
| ------------ | --------------------------------------------------------------------------------------- |
| Active       | ![Active user](../../../../../static/img/software-catalog/blueprint/activeUser.png)     |
| Invited      | ![Invited user](../../../../../static/img/software-catalog/blueprint/invitedUser.png)   |
| Unregistered | ![External user](../../../../../static/img/software-catalog/blueprint/externalUser.png) |

:::

## API definition

<Tabs groupId="api-definition" defaultValue="basic" values={[
{label: "Basic", value: "basic"},
{label: "Array", value: "array"}
]}>

<TabItem value="basic">

```json showLineNumbers
{
  "myUserProp": {
    "title": "My user",
    "icon": "My icon",
    "description": "My user property",
    // highlight-start
    "type": "string",
    "format": "user",
    // highlight-end
    "default": "me@example.com"
  }
}
```

</TabItem>
<TabItem value="array">

```json showLineNumbers
{
  "myUserArray": {
    "title": "My user array",
    "icon": "My icon",
    "description": "My user array",
    // highlight-start
    "type": "array",
    "items": {
      "type": "string",
      "format": "user"
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
{label: "Array - coming soon", value: "array"}
]}>

<TabItem value="basic">

```hcl showLineNumbers
resource "port-labs_blueprint" "myBlueprint" {
  # ...blueprint properties
  # highlight-start
  properties {
    identifier = "myUserProp"
    title      = "My user"
    required   = false
    type       = "string"
    format     = "user"
  }
  # highlight-end
}
```

</TabItem>
</Tabs>

## Pulumi definition

<Tabs groupId="pulumi-definition" defaultValue="basic" values={[
{label: "Basic", value: "basic"},
{label: "Enum - coming soon", value: "enum"}
]}>

<TabItem value="basic">

<Tabs groupId="pulumi-definition-user-basic" defaultValue="python" values={[
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
         "format": "user",
         "identifier": "myUserProp",
         "title": "My user",
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
import * as port from "@port-labs/pulumi";

export const blueprint = new port.Blueprint("myBlueprint", {
  identifier: "myBlueprint",
  title: "My Blueprint",
  // highlight-start
  properties: [
    {
      identifier: "myUserProp",
      title: "My user",
      type: "string",
      format: "user",
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
const port = require("@port-labs/pulumi");

const entity = new port.Blueprint("myBlueprint", {
  title: "My Blueprint",
  identifier: "myBlueprint",
  // highlight-start
  properties: [
    {
      identifier: "myUserProp",
      title: "My user",
      type: "string",
      format: "user",
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
					Identifier: pulumi.String("myUserProp"),
					Title:      pulumi.String("My user"),
					Required:   pulumi.Bool(false),
					Type:       pulumi.String("string"),
					Format:     pulumi.String("user"),
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
