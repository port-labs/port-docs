---
sidebar_position: 5
---

# Mirror Properties

When two Blueprints are connected via a Relation, a new set of properties becomes available to Entities in the `source` Blueprint.

Those new properties are called `mirrorProperties`.

Mirror properties will appear on the `source` Blueprint as an additional key called `mirrorProperties`. It represents additional properties queried from the `target` Blueprint (or from other Entities further down the connection graph).

Mirror properties allow you to map property values from related Entities, to named `keys` in the `source` Blueprint, thus giving you more context and data when viewing an Entity, while not cluttering the output with unnecessary fields.

Mirror properties support both [user-defined](#user-defined-mirror-property) properties, and [meta-properties](#meta-property-mirror-property) by using similar syntax.

## Mirror Properties JSON schema

The `mirrorProperties` key is a top-level key in the Entity's JSON (similar to `identifier`, `title`, `properties`, etc..)

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
        "path": "firstTargetBlueprintRelationIdentifier.prop2"
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

:::info Identifiers and titles as mirror properties
Want to use an identifier or title as a mirror property? Those are meta-properties, so you will need to reference them with a dollar sign (`$`) before them (i.e. `$identifier`, `$title`). For more information, refer to the [meta-properties](#meta-property-mirror-property) section.
:::

:::tip Mirror Property Title
MirrorProperties support custom titles similarly to standard properties. Titles are optional, but we recommend using them to increase readability and comfort.

:::

---

## Mirror Properties deep dive

Let's look at some examples for basic Mirror Property definitions to better understand how Mirror Properties work:

:::info example context
Remember that in a real Blueprint, all of these examples live in the `mirrorProperties` key of the Blueprint.

:::

### User-defined mirror property

This is a standard Mirror Property created from a user-defined property in the `target` Blueprint.

In the following example, we create a Mirror Property called `RepositoryUrl`, which is mapped to the `repo_url` property in the `target` Blueprint (in this example the name of the Relation is `deployment-to-microservice`)

```json showLineNumbers
"RepositoryUrl": {
    "title": "Repository URL",
    "path": "deployment-to-microservice.repo_url"
}
```

### Meta-property mirror property

This is a Mirror Property created from one of Port's _meta-properties_ on the `target` Blueprint.

:::info Meta-properties
A meta-property is a property that exists on every Entity in Port, the user can control its value, but he can not choose not to add it to the Entity or Blueprint definition.

Example meta-properties include:

- identifier;
- title;
- createdAt;
- and more.

Meta-properties are always referenced using a dollar sign (`$`) before them, this makes it easier to tell if a property is user-defined or a meta-property.

Here is a short table demonstrating the usage of common mirror properties:

| Meta-property | Description          | Mirror property syntax |
| ------------- | -------------------- | ---------------------- |
| identifier    | Entity identifier    | `$identifier`          |
| title         | Entity title         | `$title`               |
| createdAt     | Entity creation time | `$createdAt`           |
| updatedAt     | Entity update time   | `$updatedAt`           |

:::

In the following example, we create a Mirror Property called `MicroserviceName` which is mapped to the `title` meta-property in the `target` Blueprint (in this example the name of the Relation is `deployment-to-microservice`). Note how the `title` field is referenced using `$title` because it is a meta-property

```json showLineNumbers
"MicroserviceName": {
    "title": "Microservice Name",
    "path": "deployment-to-microservice.$title"
}
```

### Nested Relation mirror property

It is possible to use Mirror Properties to map properties from Blueprints that are not direct descendants of our `source` Blueprint.

For example, let's assume we have the following Relation chain: `Microservice -> Project -> Squad`.

We want to map the members of the squad that owns the microservice directly to the `Microservice` entities.

The members of the squad are listed in an [array property](./blueprint#array) under the user-defined property `squad_members`.

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

## Next steps

Mirror Properties allow you to enhance the data presented in the Software Catalog by utilizing existing data from related Entities.

Blueprints that have Relations with multiple other Blueprints can greatly benefit from Mirror Properties by creating a central source for a host of relevant information.

Now that you know about Mirror Properties, consider looking into [Formula Properties](./formula-properties) which allow you to fill property values using custom templates.
