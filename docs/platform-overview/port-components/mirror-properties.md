---
sidebar_position: 5
---

# Mirror Properties

When two blueprints are connected via a relation, a new set of properties becomes available to entities in the `source` blueprint.

Those new properties are called `mirrorProperties`.

Mirror properties will appear on the `source` blueprint, as an additional key called `mirrorProperties` that represents additional properties queried from the `target` blueprint (or from other entities further down the dependency graph).

Mirror properties allow you to map property values related entities, to named `keys` in the `source` blueprint, thus giving you more context and data when viewing an entity, while not cluttering the output with unnecessary fields.

:::note
When a relation is created between two blueprints, a default mirror property is created by default on the `source` blueprint, this mirror property maps the `target` entity identifier as a mirror property, thus allowing the connection.

In the example below, the name of the `target` blueprint is `microservice` and the identifier of the relation between the `source` and `target` blueprints is `deployment-to-microservice`

The default format of the mirror property section is as follows:
```json showLineNumbers
"mirrorProperties": {
    "microservice": {
        "title": "Microservice",
        "path": "deployment-to-microservice.$identifier"
    }
}
```
:::

## Mirror Properties JSON schema

The `mirrorProperties` key is a top-level key in the JSON of an entity (similar to `identifier`, `title`, `properties`, etc..)

```json showLineNumbers
"mirrorProperties": {
    "firstTargetBlueprintIdentifier": {
        "title": "First Target Blueprint Identifier",
        "path": "firstTargetBlueprintRelationIdentifier.$identifier"
    },
    "MirrorPropertyFromFirstTargetBlueprint": {
        "path": "firstTargetBlueprintRelationIdentifier.prop1"
    },
    "secondMirrorPropertyFromFirstTargetBlueprint": {
        "path": "firstTargetBlueprintRelationIdentifier.$prop2"
    },
    "mirrorPropertyFromALongRelationChain": {
        "path": "firstTargetBlueprintRelationIdentifier.nestedBlueprintRelationIdentifier.prop1"
    },
    "secondTargetBlueprintIdentifier": {
        "path": "secondTargetBlueprintRelationIdentifier.$identifier"
    },
    "MirrorPropertyFromSecondTargetBlueprint": {
        "path": "secondTargetBlueprintRelationIdentifier.prop1"
    }
}
```

:::tip Mirror Property Title
Mirror properties support custom titles just like standard properties. Titles are optional but we recommend using them to increase readability
:::

---

## Mirror Properties deep dive

Let's look at some examples for basic mirror property definitions to better understand how mirror properties work:

:::info example context
Remember that in a real blueprint, all of these examples live in the `mirrorProperties` key of the blueprint
:::

### Default relation mirror property

This is the default mirror property, it is created automatically when creating a relation between two blueprints.

The default mirror property is immutable, it cannot be deleted or modified, trying to remove it from the blueprint JSON and then saving will result in an error.

In addition, the default mirror property automatically creates a column in the [page](./page) named after `target` blueprint, and the values of each entity will be the related entity's identifier

In the following example, the name of the `target` blueprint is `microservice`, and the name of the relation is `deployment-to-microservice`.


```json showLineNumbers
"microservice": {
    "title": "Microservice",
    "path": "deployment-to-microservice.$identifier"
}
```

### User-defined property mirror property

This is a standard mirror property created from a user-defined property on the `target` blueprint.

In the following example, we create a mirror property called `RepositoryUrl` which is mapped to the `repo_url` in the `target` blueprint (in this example the name of the relation is `deployment-to-microservice`)

```json showLineNumbers
"RepositoryUrl": {
    "title": "Repository URL",
    "path": "deployment-to-microservice.repo_url"
}
```

### Meta-property mirror property

This is a mirror property created from one of Port's *meta-properties* on the `target` blueprint.

:::info Meta-properties
A meta-property is a property that exists on every entity in Port, the user can control its value, but he can not choose not to add it to the entity or blueprint definition.

Example meta-properties include:
- identifier
- title
- createdAt
- and more

Meta-properties are always referenced using a dollar sign (`$`) before them, this makes it easier to tell if a property is user-defined or a meta-property.
:::

In the following example, we create a mirror property called `MicroserviceName` which is mapped to the `title` meta-property in the `target` blueprint (in this example the name of the relation is `deployment-to-microservice`), note how the `title` field is referenced using `$title` because it is a meta-property

```json showLineNumbers
"MicroserviceName": {
    "title": "Microservice Name",
    "path": "deployment-to-microservice.$title"
}
```

### Nested relation mirror property

It is possible to use mirror properties to map properties from blueprints that are not direct children of our `source` blueprint.

For example, let's assume we have the following relation chain: `Microservice -> Project -> Squad`.

We want to map the members of the squad that owns the microservice directly to the `Microservice` entities.

The members of the squad are listed in an [array property](./blueprint#array) under the user-defined property `squad_members`.

The names of the relations are:

- `Microservice -> Project`: `microservice-to-project`
- `Project -> Squad`: `project-to-squad`

Let's map the squad members using a mirror property called `OwningSquadMembers`:

```json showLineNumbers
"OwningSquadMembers": {
    "title": "Owning Squad Members",
    "path": "microservice-to-project.project-to-squad.squad_members"
}
```

## Next steps

Mirror properties allow you to enhance the data presented in the Software Catalog by utilizing existing data from related entities.

Blueprints that have relations with multiple other blueprints can greatly benefit from mirror properties by creating a central source for a host of relevant information.

Now that you know about mirror properties, consider looking into [Formula Properties](./formula-properties) which allow you to fill property values using custom templates.