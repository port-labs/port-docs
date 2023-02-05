---
sidebar_position: 14
description: Mirror Property allows you to map data from related entities to your entity
---

# 🪞 Mirror Property

Mirror property allows you to map data from related entities to your entity.
Mirror property can be used for blueprints that has [relations defined](../../../relate-blueprints/relate-blueprints.md).

When two blueprints are connected via a relation, a new set of properties becomes available to entities in the `source` blueprint.

Those new properties are called `mirrorProperties`.

Mirror properties will appear on the `source` blueprint as an additional key called `mirrorProperties`. It represents additional properties queried from the `target` blueprint (or from other entities further down the connection graph).

Mirror properties allow you to map property values from related entities, to `keys` in the `source` blueprint, thus giving you more context and data when viewing an Entity, while not cluttering the output with unnecessary fields.

Mirror properties support both [user-defined](../properties.md#available-properties) properties, and [meta-properties](../meta-properties.md) by using similar syntax.

## 💡 Common mirror usage

Mirror properties make it possible to enrich the data visible on an entity by mapping additional data and properties from other related entities in the catalog, for example:

- Show the chart version used by the service;
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

## `Meta-property` as a mirror property

This is a Mirror Property created from one of Port's [meta-properties](../meta-properties.md) on the `target` blueprint.

In the following example, we create a Mirror Property called `MicroserviceName` which is mapped to the `title` meta-property in the `target` blueprint (in this example the name of the Relation is `deployment-to-microservice`). Note how the `title` field is referenced using `$title` because it is a meta-property:

```json showLineNumbers
"MicroserviceName": {
    "title": "Microservice Name",
    "path": "deployment-to-microservice.$title"
}
```

## Nested relation as a mirror property

It is possible to use mirror properties to map properties from blueprints that are not direct descendants of our `source` blueprint.

For example, let's assume we have the following Relation chain: `Microservice -> Project -> Squad`.

We want to map the members of the squad that owns the microservice directly to the `Microservice` entities.

The members of the squad are listed in an [array property](../array.md) under the user-defined property `squad_members`.

The names of the Relations are:

- `Microservice -> Project`: `microservice-to-project`
- `Project -> Squad`: `project-to-squad`

Let's map the squad members using a Mirror Property called `OwningSquadMembers`:

```json showLineNumbers
"OwningSquadMembers": {
    "title": "Owning Squad Members",
    "path": "microservice-to-project.project-to-squad.squad_members"
}
```
