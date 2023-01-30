---
sidebar_position: 14
description: Mirror Property allows you to map data from related entities to your entity
---

# Mirror Property

Mirror property allows you to map data from related entities to your entity

## Use cases

Mirror properties make it possible to enrich the data visible on an entity by mapping additional data and properties from other related entities in the catalog, for example:

- Get the chart version used by the service;
- Get the environment type of a running service;
- Get the cloud provider of a K8s cluster;
- etc.

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

## Terraform definition

<Tabs groupId="tf-definition" defaultValue="basic" values={[
{label: "Basic", value: "basic"}
]}>

<TabItem value="basic">

```hcl showLineNumbers
resource "port-labs_blueprint" "myBlueprint" {
  # ...blueprint properties
  # highlight-start
  mirror_properties {
    identifier = "myMirrorProp"
    title      = "My mirror property"
    path       = "myRelation.myProperty"
  }
  # highlight-end
}
```

</TabItem>
</Tabs>

## Mirror property deep dive

When two blueprints are connected via a relation, a new set of properties becomes available to entities in the `source` blueprint.

Those new properties are called `mirrorProperties`.

Mirror properties will appear on the `source` blueprint as an additional key called `mirrorProperties`. It represents additional properties queried from the `target` blueprint (or from other entities further down the connection graph).

Mirror properties allow you to map property values from related entities, to `keys` in the `source` blueprint, thus giving you more context and data when viewing an Entity, while not cluttering the output with unnecessary fields.

Mirror properties support both [user-defined](../properties.md#available-properties) properties, and [meta-properties](../meta-properties.md) by using similar syntax.

:::info Identifiers and titles as mirror properties
To reference meta-properties such as identifier or title as a mirror property, you will need to reference them with a dollar sign (`$`) before them (i.e. `$identifier`, `$title`). For more information, refer to the [meta-properties](../meta-properties.md) section.
:::

## Examples

Refer to the mirror property [examples](./examples.md) page
