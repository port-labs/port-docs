---
sidebar_position: 7
---

# Calculation Properties

Calculation Properties allow you to use existing properties defined on [Blueprints](./blueprint), either directly using [Relations](./relation) and [Mirror Properties](./mirror-properties), in order to create new properties by using `jq` language.

Calculation Properties make it easier to define properties that are based on other properties but with the ability to transform the data.
Calculation Properties can be used for merging, slicing, selecting values and etc

## Calculation Properties JSON schema

The `calculationProperties` key is a top-level key in the JSON of an entity (similar to `identifier`, `title`, `properties`, etc..)

```json showLineNumbers
"calculationProperties": {
    "calProp1": {
        "title": "First calculation property from meta-property",
        "calculation": ".properties.config1 * .properties.config2",
    }
}
```

## `Calculation` Properties deep dive

Let's look at some examples of basic Calculation Properties definitions to better understand how Calculation Properties work:

:::info example context
Remember that in a real blueprint, all of these examples live in the `calculationProperties` key of the blueprint
:::

:::tip
The top-level key in a single calculation property is the name of the property.

Inside the Calculation Property object you can specify the `title` to grant the property a more readable name.  
:::

### User-defined Calculation property

This is a standard Calculation Property created from a user-defined property available in the Blueprint.

In the following example, we create a Calculation Property called `merge_config` which merged the value of `deployed_config` and `service_config`

```json showLineNumbers

"properties":{
    "deployed_config":{
        "type": "object"
    },
    "service_config":{
        "type": "object"
    }
},
"merge_config": {
    "title": "Merge config",
    "calculation": ".properties.deployed_config * .properties.service_config",
}
```

As you can see,if we have an Entity that have `deployed_config` with the value `{cpu : 200}`
then its `merge_config` with the value `{memory: 400}` property value will be: `{cpu : 200, memory: 400}`.

:::tip
Port supports standard jq syntax, for quick reference of some of the available jq syntax, refer to the [jq tutorial](https://stedolan.github.io/jq/tutorial).

For a jq playgroud, refer to the [JQ playground](https://jqplay.org/)
:::

### Using mirror properties in calculation properties

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
