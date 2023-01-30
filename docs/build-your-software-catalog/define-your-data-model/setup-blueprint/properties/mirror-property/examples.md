# Examples

Let's look at some examples for basic mirror property definitions to better understand how mirror properties work:

:::info example context
Remember that in a real blueprint, all of these examples live in the `mirrorProperties` key of the blueprint.

:::

### User-defined mirror property

This is a standard Mirror Property created from a user-defined property in the `target` blueprint.

In the following example, we create a Mirror Property called `RepositoryUrl`, which is mapped to the `repo_url` property in the `target` blueprint (in this example the name of the relation is `deployment-to-microservice`)

```json showLineNumbers
"RepositoryUrl": {
    "title": "Repository URL",
    "path": "deployment-to-microservice.repo_url"
}
```

## Meta-property mirror property

This is a Mirror Property created from one of Port's [meta-properties](../meta-properties.md) on the `target` blueprint.

In the following example, we create a Mirror Property called `MicroserviceName` which is mapped to the `title` meta-property in the `target` blueprint (in this example the name of the Relation is `deployment-to-microservice`). Note how the `title` field is referenced using `$title` because it is a meta-property:

```json showLineNumbers
"MicroserviceName": {
    "title": "Microservice Name",
    "path": "deployment-to-microservice.$title"
}
```

## Nested relation mirror property

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
