---
sidebar_position: 7
---

# Calculation Properties

Calculation Properties allow you to use existing properties defined on [Blueprints](./blueprint), either directly or by using [Relations](./relation) and [Mirror Properties](./mirror-properties), in order to create new properties by using the [`jq`](https://github.com/stedolan/jq) processor for `JSON`.

Calculation Properties make it easier to define properties that are based on values from other properties, with the added ability to transform the data.

The Calculation Properties support the types `string`, `number`, `object`, `array`, `boolean`, `yaml` .

With Calculation Properties you can:

- Filter/Select/Slice/Concat from an existing property.
- Make math equation or modification. For example - calculate required disk storage by specifying page size, and number of pages needed.
- Merge complex properties, including deep-merge and overriding.

:::tip
Port supports standard `jq` syntax, for a quick reference of some of the available `jq` syntax, refer to the [jq tutorial](https://stedolan.github.io/jq/tutorial).

For a playground where you can test different inputs and `jq` processing patterns, refer to the [JQ playground](https://jqplay.org/)
:::

## Calculation Properties JSON schema

The `calculationProperties` key is a top-level key in the JSON of an entity (similar to `identifier`, `title`, `properties`, etc..)

```json showLineNumbers
"calculationProperties": {
    "calProp1": {
        "title": "Merged property",
        "type": "object",
        "calculation": ".properties.config1 * .properties.config2",
    }
}
```

## `Calculation` Properties deep dive

Let's look at some examples of basic Calculation Properties definitions to better understand how Calculation Properties work:

:::info example context
Remember that in a real Blueprint, all of these examples live in the `calculationProperties` key of the Blueprint
:::

:::tip
The top-level key in a single calculation property is the name of the property.

Inside the Calculation Property object you can specify the `title` to grant the property a more readable name.  
:::

### User-defined Calculation property

This is a standard Calculation Property created from a user-defined property available in the Blueprint.

In the following example, we create a Calculation Property called `MBMemory` of type `number` and we want to transform it into GB unit:

```json showLineNumbers

"properties":{
    "MBMemory":{
        "type": "number"
    },
},
"calculationProperties" : {
    "GBMemory": {
        "title": "GB config",
        "type": "number",
        "calculation": ".properties.MBMemory / 1024"
    }
}
```

In this instance, if you have a `MBMemory` **object** property with the value:

```json showLineNumbers
{
  "MBMemory": 2048
}
```

Then the `GBMemory` Calculation Property value will be:

```json showLineNumbers
{
  "GBMemory": 2
}
```

## Examples

Here is a few exmaple how Calcualtion property can be beneficial:

### Concat Strings

Assume you have properties called `str1` with the value `hello` and `str2` of type `string` with the value `world`.
This is the formula get `hello world`

```json showLineNumbers
{
  "title": "Concat strings example",
  "type": "string",
  "calculation": ".properties.str1 + .properties.str2"
}
```

:::tip
You can concat properties to a default string, For example: '"https://" + .properties.str1'
:::

### Slice Array

Assume you have properties called `array1` of type `array` with the value `[1,2,3,4]`. This is the formula to get the result `[2,3,4]`

```json showLineNumbers
{
  "title": "Slice array example",
  "type": "string",
  "calculation": ".properties.array1[1:4]"
}
```

### Merge Objects

Assume you have properties called `deployed_config` with the value `{cpu: 200}` and `service_config` with the value `{memory: 400}`,
and we want to merge between these objects:

```json showLineNumbers
"calculationProperties" : {
    "merge_config": {
        "title": "Merge config",
        "type": "objet",
        "calculation": ".properties.deployed_config * .properties.service_config",
    }
}
```

The result will be `{cpu: 200, memory: 400}`.

**Notice**: This is a deep merge, The last property will **take presents** if there is any conficts of properties.

:::tip
For [Yaml](./blueprint.md#yaml) properties, the synatx of the calculation will remain the same, but the Type will be `string`
and the format will be `yaml`.
:::

## Calculation property Edge cases

In some occasions, if the key contains special characters or starts with a digit, you need to surround it with double quotes like this: .`"foo$"`
For example, if you want to use your `on-call` property in a Calculation property (note the single quotes (`'`) around `on-call`):

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

## Using mirror properties in calculation properties

It is possible to use Mirror Properties as template values for Calculation Properties, since the syntax is the same as user-defined properties.

For example, if an Entity has a Mirror Property called `owningSquad`:

```json showLineNumbers
"mirrorProperties": {
    "owningSquad": {
        "path": "microservice-to-squad.$title"
    }
}
```

A Calculation Property that links to the slack channel of the squad can be:

```json showLineNumbers
"owning_squad_slack": {
    "title": "Owning Squad Channel",
    "calculation": ".owningSquad",
}
```

:::note
Remember that since Mirror Properties are treated as user-defined properties, when referencing them in Calculation Properties, there is no need for a preceding dollar sign (`$`).
:::
