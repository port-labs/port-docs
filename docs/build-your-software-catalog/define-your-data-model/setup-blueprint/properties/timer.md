---
sidebar_position: 11
description: Timer is a data type used to define an expiration date/lifespan of a specific entity
---

import ApiRef from "../../../../api-reference/\_learn_more_reference.mdx"

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Timer

Timer is a data type used to define an expiration date/lifespan of a specific entity.

## 💡 Common timer usage

The timer property type can be used to store the future expiration date of catalog entities and properties, for example:

- Temporary development environment;
- Countdown to next healthcheck;
- Temporary cloud resources;
- Add temporary permissions to resource;
- etc.

In this [live demo](https://demo.getport.io/developerEnvs) example, we can see the `TTL` timer property. 🎬

## API definition

<Tabs groupId="api-definition" defaultValue="basic" values={[
{label: "Basic", value: "basic"}
]}>

<TabItem value="basic">

```json showLineNumbers
{
  "myTimerProp": {
    "title": "My timer",
    "icon": "My icon",
    "description": "My timer property",
    // highlight-start
    "type": "string",
    "format": "timer",
    // highlight-end
    "default": "2022-04-18T11:44:15.345Z"
  }
}
```

</TabItem>
</Tabs>

<ApiRef />

## Terraform definition

<Tabs groupId="tf-definition" defaultValue="basic" values={[
{label: "Basic", value: "basic"}
]}>

<TabItem value="basic">

```hcl showLineNumbers
resource "port_blueprint" "myBlueprint" {
  # ...blueprint properties
  # highlight-start
  properties = {
    string_props = {
      "myTimerProp" = {
        title       = "My timer"
        icon        = "My icon"
        description = "My timer property"
        format      = "timer"
        default     = "2022-04-18T11:44:15.345Z"
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
]}>

<TabItem value="basic">

<Tabs groupId="pulumi-definition-timer-basic" defaultValue="python" values={[
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
         "format": "timer",
         "identifier": "myTimerProp",
         "title": "My timer",
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
      identifier: "myTimerProp",
      title: "My timer",
      type: "string",
      format: "timer",
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
      identifier: "myTimerProp",
      title: "My timer",
      type: "string",
      format: "timer",
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
					Identifier: pulumi.String("myTimerProp"),
					Title:      pulumi.String("My timer"),
					Required:   pulumi.Bool(false),
					Type:       pulumi.String("string"),
					Format:     pulumi.String("timer"),
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

## Example

Here is an entity for a `timerExample` blueprint which has a timer property with the identifier `timer`.

In the example entity, an expiration datetime is specified:

```json showLineNumbers
  "identifier": "entityIdentifier",
  "title": "Timer Example",
  "icon": "Microservice",
  "blueprint": "timerExample",
  "properties": {
    // highlight-next-line
    "timer": "2022-12-01T16:50:00+02:00"
  },
  "relations": {}
```

Looking at Port's UI, we can see that the timer we created expires in 2 hours:

![Timer entity](../../../../../static/img/software-catalog/entity/TTLCreateEntity.png)

After 2 hours pass, the property status will change to `Expired`, and an event of `Timer Expired` will be sent to the ChangeLog:

![Timer entity expired](../../../../../static/img/software-catalog/entity/TTLExpiredEntity.png)

The timer expiration event will also appear in Port's audit log:

![Timer Audit log](../../../../../static/img/software-catalog/entity/AuditLogTTL.png)

<!-- TODO: add a link to the docs about changelog destination and event listener -->

In order to notify about the timer expiration, the following notification body will be sent to the Webhook/Kafka topic configured in the blueprint's `changelogDestination`:

```json showLineNumbers
{
  "context": {
    "blueprint": "timerExample",
    "entity": "entityIdentifier"
  },
  "action": "TIMER_EXPIRED",
  "trigger": {
    "at": "2022-12-01T16:50:00+02:00",
    "by": {
      "byPort": true,
      "orgId": "org_example"
    },
    "origin": "API"
  },
  "resourceType": "entity",
  "status": "SUCCESS"
}
```
