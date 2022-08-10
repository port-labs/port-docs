---
sidebar_position: 6
---

# Formula Properties

Formula properties allow you to use existing properties defined on [Blueprints](./blueprint), either directly or via [relations](./relation) and [mirror properties](./mirror-properties), in order to create new properties according to set templates. 

Formula properties make it easier to define properties that are based on a standard data format that does not change between different entities of the same blueprint, for example URLs, Slack Channel names, Git repository names and more.

## Formula Properties JSON schema

The `formulaProperties` key is a top-level key in the JSON of an entity (similar to `identifier`, `title`, `properties`, etc..)

```json showLineNumbers
"formulaProperties": {
    "formulaProp1": {
        "title": "First formula property from meta-property",
        "formula": "https://github.com/{{$identifier}}"
    },
    "formulaProp2": {
        "title": "Second formula property from user-defined property",
        "formula": "published-package-{{version}}"
    }
}
```

Looking at the above JSON, if we have a blueprint named `microservice` and an entity from that blueprint with the identifier `notification-service`, when a user searches for the `notification-service` entity from the UI or queries it from the API, he will see in the result that it has a property named `formulaProp1` and its value is: `https://github.com/notification-service`

---

## Formula Properties deep dive

Let's look at some examples for basic formula properties definitions to better understand how formula properties work:

:::info example context
Remember that in a real blueprint, all of these examples live in the `formulaProperties` key of the blueprint
:::

:::tip
The top-level key in a single formula property is the name of the property.

inside the formula property object you can specify the `title` to allow for a nice readable name
:::

### User-defined property formula property

This is a standard formula property created from a user-defined property available in the blueprint.

In the following example, we create a formula property called `changelog_filename` which attaches the value of the `version` property to the filename format `changelog-{{version}}.md`.

```json showLineNumbers
"changelog_filename": {
    "title": "Changelog Filename",
    "formula": "changelog-{{version}}.md"
}
```

Now if we have an entity under a blueprint with the formula property shown above, and it has a `version` field with a value of `2.3.1`, then its `changelog_filename` property value will be: `changelog-2.3.1.md` 

### Meta-property formula property

This is a formula property created from one of Port's *meta-properties* available in all blueprints.

:::info Meta-properties
A meta-property is a property that exists on every entity in Port, the user can control its value, but he can not choose not to add it to the entity or blueprint definition.

Example meta-properties include:
- identifier
- title
- createdAt
- and more

Meta-properties are always referenced using a dollar sign (`$`) before them, this makes it easier to tell if a property is user-defined or a meta-property.
:::

In the following example, we create a formula property called `grafana_url` which attaches the identifier of the entity to the URL format `https://grafana.com/{{$identifier}}`

```json showLineNumbers
"grafana_url": {
    "title": "Grafana URL",
    "formula": "https://grafana.com/{{$identifier}}"
}
```

Now if we have an entity under a blueprint with the formula property shown above, and it has an `identifier` field with a value of `notification-service`, then its `grafana_url` property value will be: `https://grafana.com/notification-service`

### Using mirror properties in formula properties

It is possible to use mirror properties as template values for formula properties, the syntax is the same as user-defined properties.

For example if an entity has a mirror property called `owningSquad`:

```json showLineNumbers
"mirrorProperties": {
    "squad": {
        "path": "microservice-to-squad.$identifier"
    }
    "owningSquad": {
        "path": "microservice-to-squad.$title"
    }
}
```

A formulaProperty that links to the slack channel of the squad can be:

```json showLineNumbers
"owning_squad_slack": {
    "title": "Owning Squad Channel",
    "formula": "https://slack.com/{{owningSquad}}"
}
```

:::note
Remember that since mirror properties are treated as user-defined properties, when referencing them in formula properties, there is no need for a preceding dollar sign (`$`)
:::