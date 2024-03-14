---
sidebar_position: 10
description: Mirror Property allows you to map data from related entities to your entity
sidebar_class_name: "custom-sidebar-item sidebar-property-mirror"
---

import ApiRef from "/docs/api-reference/\_learn_more_reference.mdx"

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Mirror Property

Mirror property allows you to map data from related entities to your entity.
Mirror property can be used for blueprints that have [relations defined](/build-your-software-catalog/customize-integrations/configure-data-model/relate-blueprints/relate-blueprints.md).

When two blueprints are connected via a relation, a new set of properties becomes available to entities in the `source` blueprint.

Those new properties are called `mirrorProperties`.

Mirror properties will appear on the `source` blueprint as an additional key called `mirrorProperties`. It represents additional properties queried from the `target` blueprint (or from other entities further down the connection graph).

Mirror properties allow you to map property values from related entities, to `keys` in the `source` blueprint, thus giving you more context and data when viewing an Entity, while not cluttering the output with unnecessary fields.

Mirror properties support both [user-defined](./properties.md#available-properties) properties, and [meta-properties](./meta-properties.md) by using similar syntax.

## 💡 Common mirror usage

Mirror properties make it possible to enrich the data visible on an entity by mapping additional data and properties from other related entities in the catalog, for example:

- Show the chart version of a running service;
- Show the environment type of a running service;
- Show the cloud provider of a K8s cluster;
- etc.

In this [live demo](https://demo.getport.io/k8s-clusters) example, we can see the `Cloud Provider` Property which is a mirror property of the related `Cloud Account` blueprint 🎬

## API definition

The `mirrorProperties` key is a top-level key in the JSON of an entity (similar to `identifier`, `title`, `properties`, etc..)

<Tabs groupId="api-definition" defaultValue="basic" values={[
{label: "Basic", value: "basic"}
]}>

<TabItem value="basic">

```json showLineNumbers
{
  "mirrorProperties": {
    "myMirrorProp": {
      "title": "My mirror property",
      "path": "myRelation.myProperty"
    }
  }
}
```

</TabItem>
</Tabs>

<ApiRef />

:::info
The `path` key receives a path of chained relations, which lead up to a blueprint property or [meta-property](#meta-property-as-a-mirror-property)
:::

## Terraform definition

<Tabs groupId="tf-definition" defaultValue="basic" values={[
{label: "Basic", value: "basic"}
]}>

<TabItem value="basic">

```hcl showLineNumbers
resource "port_blueprint" "myBlueprint" {
  # ...blueprint properties
  # highlight-start
  mirror_properties = {
    myMirrorProp = {
      title = "My mirror property"
      path  = "myRelation.myProperty"
    }
  }
  # highlight-end
}
```

</TabItem>
</Tabs>

## Pulumi definition

<Tabs groupId="pulumi-definition-mirror-basic" defaultValue="python" values={[
{label: "Python", value: "python"},
{label: "TypeScript", value: "typescript"},
{label: "JavaScript", value: "javascript"},
{label: "GO", value: "go"}
]}>

<TabItem value="python">

```python showLineNumbers
"""A Python Pulumi program"""

import pulumi
from port_pulumi import Blueprint,BlueprintPropertiesArgs,BlueprintMirrorPropertiesArgs

blueprint = Blueprint(
    "myBlueprint",
    identifier="myBlueprint",
    title="My Blueprint",
    properties=BlueprintPropertiesArgs(
        # blueprint properties
    ),
    # highlight-start
    mirror_properties={
        "myMirrorProp": BlueprintMirrorPropertiesArgs(
            title="My mirror property", path="myRelation.myStringProp"
        )
    },
    # highlight-end
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
    // blueprint properties
  },
  // highlight-start
  mirrorProperties: {
    myMirrorProp: {
      title: "My mirror property",
      path: "myRelation.myProperty",
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
  properties: {
    // blueprint properties
  },
  // highlight-start
  mirrorProperties: {
    myMirrorProp: {
      title: "My mirror property",
      path: "myRelation.myProperty",
    },
  },
  // highlight-end
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
			// blueprint properties..
      # highlight-start
			MirrorProperties: port.BlueprintMirrorPropertiesMap{
              "myMirrorProp": port.BlueprintMirrorPropertiesArgs{
                    Title: pulumi.String("My mirror property"),
                    Path:  pulumi.String("myRelation.myProperty"),
			  },
			},
      # highlight-end
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

## `Meta-property` as a mirror property

This is a mirror property created from one of Port's [meta-properties](./meta-properties.md) on the `target` blueprint.

In the following example, we create a mirror property called `microserviceName` which is mapped to the `title` meta-property in the `target` blueprint (in this example the name of the relation is `deployment-to-microservice`). Note how the `title` field is referenced using `$title` because it is a meta-property:

```json showLineNumbers
"microserviceName": {
    "title": "Microservice Name",
    "path": "deployment-to-microservice.$title"
}
```

## Nested relation as a mirror property

It is possible to use mirror properties to map properties from blueprints that are not direct descendants of our `source` blueprint.

For example, let's assume we have the following Relation chain: `Microservice -> System -> Domain`.

We want to map the members of the domain that owns the microservice directly to the `Microservice` entities.

The members of the domain are listed in an [array property](./array.md) under the user-defined property `domain_members`.

The names of the relations are:

- `Microservice -> System`: `system`
- `System -> Domain`: `domain`

Let's map the squad members using a mirror property called `owningDomainMembers`:

```json showLineNumbers
"owningDomainMembers": {
    "title": "Owning Domain Members",
    "path": "system.domain.domain_members"
}
```
