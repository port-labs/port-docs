---
sidebar_position: 7
---

# Calculation Properties

Calculation Properties allow you to use existing properties defined on [Blueprints](./blueprint), either directly or by using [Relations](./relation) and [Mirror Properties](./mirror-properties), in order to create new properties by using the [`jq`](https://github.com/stedolan/jq) processor for `JSON`.

Calculation Properties make it easier to define properties that are based on values from other properties, with the added ability to transform the data.

The Calculation Properties support the types `string`, `number`, `object`, `array`, `boolean`, and `yaml` .

With Calculation Properties allow you to:

- Filter/Select/Slice/Concat from an existing property;
- Create math equations or modifications. For example ,calculate required disk storage by specifying page size, and number of pages needed.
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
The top-level key in a single calculation Property is the name of the property.

Inside the Calculation Property object you can specify the `title` to grant the property a more readable name.  
:::

### User-defined Calculation Property

This is a standard Calculation Property created from a user-defined property available in the Blueprint.

In the following example, we will create a Calculation Property called `MBMemory` of type `number`, and then transform it into a GB unit:

```json showLineNumbers

"properties":{
    "MBMemory":{
        "type": "number"
    },
},
"calculationProperties" : {
    "GBMemory": {
        "title": "GB Memory",
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

Here are a few examples of Calculation Properties use cases:

### Concat strings

Assume you have two `string` properties: one is called `str1` with the value `hello`, the other is called `str2` with the value `world`.
The following calculation will result in `hello world`:

```json showLineNumbers
{
  "title": "Concat strings example",
  "type": "string",
  "calculation": ".properties.str1 + .properties.str2"
}
```

:::tip
If you want to provide your own string template to concat properties , wrap your template string with single quotes (`'`), such as `'https://' + .properties.str1'`
:::

### Slice array

Assume you have an `array` property called `array1` with the value `[1,2,3,4]`. You can use the following slicing calculation to get the result `[2,3,4]`:

```json showLineNumbers
{
  "title": "Slice array example",
  "type": "string",
  "calculation": ".properties.array1[1:4]"
}
```

### Merge objects

Assume you have two `object` properties: one called `deployed_config` with the value `{cpu: 200}`, the other called `service_config` with the value `{memory: 400}`. You can merge these two object properties and receive a unified config by using the following calculation:

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

:::info Object merging

- Object merging performs a deep merge, resulting in nested keys from the original objects appearing in the resulting merged object.
- If the same `key` appears in one or more of the merged properties, the last property that appears will have its `keys` take precedence over the `keys` of properties that appeared earlier in the calculation.

For example, Let's assume we have 2 properties with type `object`, and we want to perform a deep merge between them:

```json showLineNumbers
{
  "obj1": {
    "cpu": 200
  },
  "obj2": {
    "cpu": 400
  }
}
```

If the calculation is `".properties.obj1 * .properties.obj2"` , the result will be `{cpu: 400}`,

If the calculation is `".properties.obj2 * .properties.obj1"` , the result will be `{cpu: 200}`,

For merging YAML properties, the merging behavior will be the same, but if you specify `type: "string` and `format: "yaml"`, the result will be a YAML object.
:::

## Calculation Property edge cases

Sometimes, if the key contains special characters or starts with a digit, you need to surround it with double quotes like this: .`"foo$"`.
For example, if you want to use your `on-call` property in a Calculation Property (note the single quotes (`'`) around `on-call`):

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
