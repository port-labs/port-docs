---
sidebar_position: 13
description: Calculation property allows you to construct new data from existing properties of an entity
---

import ApiRef from "../../../../../api-reference/\_learn_more_reference.mdx"

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

In this [live demo](https://demo.getport.io/services) example, we can see the `Slack Notifications` calculation property. 🎬

## Definition

<Tabs groupId="api-definition" defaultValue="api" values={[
{label: "API", value: "api"},
{label: "Terraform", value: "tf"}
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
resource "port-labs_blueprint" "myBlueprint" {
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
</Tabs>

## Supported Types

Calculation properties support the following output types `string`, `number`, `object`, `array`, `boolean`, and `yaml`, for example:

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

It is possible to use [mirror properties](../mirror-property/mirror-property.md) as template values for calculation properties.

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

:::caution Parameters with special characters
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

Refer to the calculation property [examples](./examples.md) page

## Pitfalls

Calculation properties JQ parsing is based on the [jqts](https://github.com/kentdotn/jqts) Node library and supports the JQ operators provided by jqts, this means some functionality that is provided by the `jq` command is not supported in calculation properties.

For a full list of methods, operators and syntax supported by calculation properties, look [here](https://github.com/kentdotn/jqts#supported-filters).
