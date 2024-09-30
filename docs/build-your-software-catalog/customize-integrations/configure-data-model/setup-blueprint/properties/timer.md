---
sidebar_position: 17
description: Timer is a data type used to define an expiration date/lifespan of a specific entity
sidebar_class_name: "custom-sidebar-item sidebar-property-timer"
---

import ApiRef from "/docs/api-reference/\_learn_more_reference.mdx"

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Timer

Timer is a data type used to define an expiration date/lifespan of a specific entity.

## 💡 Common timer usage

The timer property type can be used to store the future expiration date of catalog entities and properties, for example:

- Temporary development environment.
- Countdown to next healthcheck.
- Temporary cloud resources.
- Add temporary permissions to resource.

In this [live demo](https://demo.getport.io/developer_envs) example, we can see the `TTL` timer property. 🎬

## API definition

<Tabs groupId="api-definition" queryString defaultValue="basic" values={[
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

<Tabs groupId="tf-definition" queryString defaultValue="basic" values={[
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

<Tabs groupId="pulumi-definition" queryString defaultValue="basic" values={[
{label: "Basic", value: "basic"},
]}>

<TabItem value="basic">

<Tabs groupId="pulumi-definition-timer-basic" queryString defaultValue="python" values={[
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
            "myTimerProp": BlueprintPropertiesStringPropsArgs(
                title="My timer",
                format="timer",
                required=True,
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
      myTimerProp: {
        title: "My timer",
        format: "timer",
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
    stringProps: {
      myTimerProp: {
        title: "My timer",
        format: "timer",
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
					"myTimerProp": &port.BlueprintPropertiesStringPropsArgs{
                        Title:    pulumi.String("My timer"),
                        Format:   pulumi.String("timer"),
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

![Timer entity](/img/software-catalog/entity/TTLCreateEntity.png)

After 2 hours pass, the property status will change to `Expired`, and an event of `Timer Expired` will be sent to the ChangeLog:

![Timer entity expired](/img/software-catalog/entity/TTLExpiredEntity.png)

The timer expiration event will also appear in Port's audit log:

![Timer Audit log](/img/software-catalog/entity/AuditLogTTL.png)

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
