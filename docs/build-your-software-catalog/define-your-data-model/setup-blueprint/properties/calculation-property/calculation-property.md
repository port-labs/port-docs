---
sidebar_position: 13
description: Calculation property allows you to construct new data from existing properties of an entity
---

# Calculation Property

Calculation properties allow you to use existing properties defined on blueprints, either directly or by using relations and mirror properties, in order to create new properties by using the [`jq`](https://github.com/stedolan/jq) processor for `JSON`.

## Use cases

Calculation properties make it easier to define properties that are based on values from other properties, with the added ability to transform the data, for example:

- Construct custom URLs based on templates - for example:
  - `https://slack.com/ + {my_parameter}`;
  - `https://datadog.com/ + {my_parameter}`;
  - `https://launchdarkly.com/ + {my_parameter}`;
- Merge service configurations templates to create a real service config;
- etc.

## API definition

The `calculationProperties` key is a top-level key in the JSON of an entity (similar to `identifier`, `title`, `properties`, etc..)

<Tabs groupId="api-definition" defaultValue="basic" values={[
{label: "Basic", value: "basic"}
]}>

<TabItem value="basic">

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

</TabItem>
</Tabs>

## Terraform definition

Coming soon

## `Calculation` output types

Calculation properties support the following output types `string`, `number`, `object`, `array`, `boolean`, and `yaml`.

## `Calculation` methods

Calculation properties allow you to:

- Filter/Select/Slice/Concatenate data from an existing property;
- Create math equations or modifications. For example, calculate required disk storage by specifying page size, and number of pages needed.
- Merge complex properties, including deep-merge and overriding.

:::tip
Port supports standard `jq` syntax, for a quick reference of some of the available `jq` syntax, refer to the [jq tutorial](https://stedolan.github.io/jq/tutorial).

For a playground where you can test different inputs and `jq` processing patterns, refer to the [JQ playground](https://jqplay.org/)

The top-level key in a single calculation property is the name of the property (in the example shown in [API definition](#api-definition) the name of the property is `myCalculationProp`).
:::

## Calculation property edge cases

Sometimes, if the key contains special characters or starts with a digit, you need to surround it with double quotes like this: .`"$foo"`.
For example, if you want to use your `on-call` property in a calculation property (note the single quotes (`'`) around `on-call`):

```json showLineNumbers

"properties":{
    "on-call":{
        "type": "string"
    },
},
"calculationProperties": {
    "on-call-calculation": {
        "title": "On call",
        "type": "string",
        "calculation": ".properties.'on-call'",
    }
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

:::tip
Each key is one of the calculated values and each value is one of the following colors: `blue, turquoise, orange, purple, lightBlue, pink, yellow, green, red, darkGray`
:::

## Using meta properties in calculation properties

It is possible to use [meta properties](../properties.md#meta-properties) as template values for calculation properties, since the syntax is the same as user-defined properties, but without the `properties` keyword.

For example, if you want to concatenate a template URL (for example `https://datadog.com`) with the `identifier` meta property:

```json showLineNumbers
{
  "identifier": "notification-service",
   "title": "Notification Service",
  "properties": {
   ...
  },
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

## Using mirror properties in calculation properties

It is possible to use mirror properties as template values for calculation properties, since the syntax is the same as user-defined properties.

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

:::note
Remember that since mirror properties are treated as user-defined properties, when referencing them in Calculation Properties, there is no need for a preceding dollar sign (`$`).
:::
