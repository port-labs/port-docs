---
sidebar_position: 13
description: Calculation property allows you to construct new data from existing properties of an entity
---

import ApiRef from "/docs/api-reference/\_learn_more_reference.mdx"

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# ➕ Calculation Property

Calculation properties allow you to use existing properties defined on blueprints, either directly or by using relations and mirror properties, in order to create new properties by using the [`jq`](https://github.com/stedolan/jq) processor for `JSON`.

- Filter/Select/Slice/Concatenate data from an existing property;
- Create math equations or modifications. For example, calculate required disk storage by specifying page size, and number of pages needed.
- Merge complex properties, including deep-merge and overriding.

## 💡 Common calculation usage

Calculation properties make it easier to define properties that are based on values from other properties, with the added ability to transform the data, for example:

- Construct custom URLs based on templates - for example:
  - `https://slack.com/ + {my_parameter}`;
  - `https://datadog.com/ + {my_parameter}`;
  - `https://launchdarkly.com/ + {my_parameter}`;
- Merge service configurations templates to create a real service config;
- Calculate the number of code owners;
- etc.

:::tip Performance impact of calculation properties
Calculation properties are evaluated dynamically for each entity. Defining complex or numerous calculation properties (especially on blueprints with a large number of entities) can impact page load performance.

It is recommended to use calculation properties only when necessary and prefer simple calculations over complex ones.
:::

In this [live demo](https://demo.getport.io/service_catalog) example, we can see the `Slack Notifications` calculation property. 🎬

## Definition

<Tabs groupId="api-definition" defaultValue="api" values={[
{label: "API", value: "api"},
{label: "Terraform", value: "tf"},
{label: "Pulumi", value: "pulumi"}
]}>

<TabItem value="api">

The `calculationProperties` key is a top-level key in the JSON of an entity (similar to `identifier`, `title`, `properties`, etc..)

You can access properties as part of the calculation by using `.properties`

```json showLineNumbers
{
  "calculationProperties": {
    "myCalculationProp": {
      "title": "My calculation property",
      "type": "string",
      "calculation": ".properties.myStringProp + .properties.myStringProp"
    }
  }
}
```

<ApiRef />

</TabItem>

<TabItem value="tf">

```hcl showLineNumbers
resource "port_blueprint" "myBlueprint" {
  # ...blueprint properties
  # highlight-start
  calculation_properties {
    identifier  = "myCalculationProp"
    title       = "My calculation property"
    type        = "string"
    calculation = ".properties.myStringProp + .properties.myStringProp"
  }
  # highlight-end
}
```

</TabItem>

<TabItem value="pulumi">

<Tabs groupId="pulumi-definition-calculation" defaultValue="python" values={[
{label: "Python", value: "python"},
{label: "TypeScript", value: "typescript"},
{label: "JavaScript", value: "javascript"},
{label: "GO", value: "go"}
]}>

<TabItem value="python">

```python showLineNumbers
"""A Python Pulumi program"""

import pulumi
from port_pulumi import Blueprint,BlueprintPropertiesArgs,BlueprintCalculationPropertiesArgs

blueprint = Blueprint(
    "myBlueprint",
    identifier="myBlueprint",
    title="My Blueprint",
    properties=BlueprintPropertiesArgs(
    # blueprint properties
    ),
    # highlight-start
    calculation_properties={
      "myCalculation": BlueprintCalculationPropertiesArgs(
        title="My calculation property", calculation=".properties.myStringProp + .properties.myStringProp", type="string",
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
  calculationProperties: {
    myCalculation: {
      title: "My calculation property",
      calculation: ".properties.myStringProp + .properties.myStringProp",
      type: "string",
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
  calculationProperties: {
    myCalculation: {
      title: "My calculation property",
      calculation: ".properties.myStringProp + .properties.myStringProp",
      type: "string",
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
            CalculationProperties: port.BlueprintCalculationPropertiesMap{
              "myCalculation": port.BlueprintCalculationPropertiesArgs{
                  Title:       pulumi.String("My calculation property"),
                  Calculation: pulumi.String(".properties.myStringProp + .properties.myStringProp"),
                  Type:        pulumi.String("string"),
              }
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

</TabItem>

</Tabs>

## Supported Types

<Tabs groupId="calculation-definition" defaultValue="basic" values={[
{label: "Basic", value: "basic"},
{label: "Format", value: "format"},
{label: "Spec", value: "spec"}
]}>
<TabItem value="basic">

Calculation properties support the following output types: `string`, `number`, `object`, `array`, and `boolean`. For example:

```json showLineNumbers
{
  "calculationProperties": {
    "myCalculationProp": {
      "title": "My calculation property",
      // highlight-next-line
      "type": "my_output_type",
      "calculation": ".properties.myStringProp + .properties.myStringProp"
    }
  }
}
```

</TabItem>

<TabItem value = "format">

Calculation properties support the following output formats: `yaml`, `team`, `user`, `ipv6`, and `url`. For example:

```json showLineNumbers
{
  "calculationProperties": {
    "myCalculationProp": {
      "title": "My calculation property",
      // highlight-next-line
      "type": "string",
      // highlight-next-line
      "format": "user",
      "calculation": ".properties.user"
    }
  }
}
```

</TabItem>

<TabItem value = "spec">

Calculation properties support the following output specs: `markdown`, `open-api` and `async-api`. For example:

```json showLineNumbers
{
  "calculationProperties": {
    "myCalculationProp": {
      "title": "My calculation property",
      // highlight-next-line
      "type": "string",
      // highlight-next-line
      "format": "url",
      // highlight-next-line
      "spec": "embedded-url"
      "calculation": ".properties.text"
    }
  }
}
```

</TabItem>

</Tabs>

## Using `meta properties` in calculation properties

It is possible to use [meta properties](../meta-properties.md) as template values for calculation properties.

For example, if you want to concatenate a template URL (for example `https://datadog.com`) with the `identifier` meta property:

Given the following `notification-service` entity:

```json showLineNumbers
{
  "identifier": "notification-service",
   "title": "Notification Service",
  "properties": {
   ...
  },
}
```

And the following calculation property definition for the blueprint:

```json showLineNumbers
{
  "calculationProperties": {
    "monitorUrl": {
      "title": "Monitor url",
      "type": "string",
      "format": "url",
      "calculation": "'https://datadog.com/' + .identifier"
    }
  }
}
```

The value of the property `monitorUrl` will be `https://datadog.com/notification-service`

## Using `mirror properties` in calculation properties

It is possible to use [mirror properties](../mirror-property) as template values for calculation properties.

For example, if an entity has a mirror property called `owningSquad`:

```json showLineNumbers
"mirrorProperties": {
    "owningSquad": {
        "path": "microservice-to-squad.$title"
    }
}
```

A calculation property that links to the slack channel of the squad can be:

```json showLineNumbers
"owning_squad_slack": {
    "title": "Owning Squad Channel",
    "calculation": "'https://slack.com/' + .properties.owningSquad",
}
```

:::warning Calculation on calculation is not supported
Calculation properties <b>cannot</b> be used as template values for other calculation properties.
:::

## Colorized calculation properties

You can colorize calculation properties according to their value, by adding a `colorized` key with the value `true` to the calculation property object. You can also add a `colors` key to specify the colors of the different values, otherwise, the colors will be chosen automatically for you.

For example, if you want to colorize a calculation property called `status-calculation` with the values `OK`, `WARNING`, and `CRITICAL`:

```json showLineNumbers
"properties":{
    "status":{
        "type": "string"
    },
},
"calculationProperties": {
    "status-calculation": {
        "title": "Status",
        "type": "string",
        "calculation": ".properties.status",
        "colorized": true,
        "colors": {
            "OK": "green",
            "WARNING": "yellow",
            "CRITICAL": "red"
        }
    }
}
```

---

:::warning Parameters with special characters
Parameter contains special characters (for example: `-`) or starts with a digit (for example: `@/#/$/1/2/3`), should be surrounded with single quotes.

```json showLineNumbers

"properties":{
    "prop-with-special-char":{
        "type": "string"
    },
},
"calculationProperties": {
    "myCalculatedProp": {
        "title": "My Calculated Property",
        "type": "string",
        "calculation": ".properties.'prop-with-special-char'",
    }
}
```

:::

## Examples

Refer to the calculation property [examples](./examples.md) page.
