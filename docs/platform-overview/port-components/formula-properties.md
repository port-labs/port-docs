---
sidebar_position: 6
---

# Formula Properties

Formula Properties allow you to use existing properties defined on [Blueprints](./blueprint), either directly using [Relations](./relation) and [Mirror Properties](./mirror-properties), in order to create new properties in accordance with set templates.

Formula Properties make it easier to define properties that are based on standard data formats that don’t change between different Entities of the same Blueprint. For example URLs, slack channel names, Git repository names and more.

## Formula Properties JSON schema

The `formulaProperties` key is a top-level key in the JSON of an entity (similar to `identifier`, `title`, `properties`, etc..)

```json showLineNumbers
"formulaProperties": {
    "formulaProp1": {
        "title": "First formula property from meta-property",
        "formula": "https://github.com/{{$identifier}}",
        "icon": "Aws"
    },
    "formulaProp2": {
        "title": "Second formula property from user-defined property",
        "formula": "published-package-{{version}}",
        "icon": "Deployment
    }
}
```

The above JSON says that if we have a Blueprint named `microservice` and an Entity that originated from that Blueprint with the identifier `notification-service`, then when a user searches for the `notification-service` Entity from the UI or queries it from the API, he will see that it has a property named `formulaProp1` and its value is: `https://github.com/notification-service`

---

## Formula Properties deep dive

Let's look at some examples of basic Formula Properties definitions to better understand how Formula Properties work:

:::info example context
Remember that in a real blueprint, all of these examples live in the `formulaProperties` key of the blueprint
:::

:::tip
The top-level key in a single formula property is the name of the property.

Inside the Formula Property object you can specify the `title` to grant the property a more readable name.  
:::

### User-defined formula property

This is a standard Formula Property created from a user-defined property available in the Blueprint.

In the following example, we create a Formula Property called `changelog_filename` which attaches the value of the `version` property to the filename format `changelog-{{version}}.md`.

```json showLineNumbers
"changelog_filename": {
    "title": "Changelog Filename",
    "formula": "changelog-{{version}}.md",
    "icon": "Bucket"
}
```

As you can see,if we have an Entity that originates from a Blueprint with the Formula Property shown above, and it has a `version` field with the value of `2.3.1`, then its `changelog_filename` property value will be: `changelog-2.3.1.md`.

### Meta-property formula property

This is a formula property created from one of Port's _meta-properties_ available in all Blueprints.

:::info Meta-properties
A meta-property is a property that exists in every Entity in Port. The user can control its value, but they can not remove the property from an Entity or Blueprint definition.

Example meta-properties include:

- identifier;
- title;
- createdAt;
- and more.

Meta-properties are always referenced with a dollar sign (`$`) before them, this makes it easier to understand if a property is user-defined or a meta-property.
:::

In the following example, let’s create a formula property called `grafana_url` which attaches the identifier of the Entity to the URL format `https://grafana.com/{{$identifier}}`:

```json showLineNumbers
"grafana_url": {
    "title": "Grafana URL",
    "formula": "https://grafana.com/{{$identifier}}",
    "icon": "Grafana"
}
```

As you can see, if we have an Entity that originated from a Blueprint with the formula property shown above, and it has an `identifier` field with a value of `notification-service`, then its `grafana_url` property value will be: `https://grafana.com/notification-service`

### Using mirror properties in formula properties

It is possible to use Mirror Properties as template values for Formula Properties, since the syntax is the same as user-defined properties.

For example, if an Entity has a Mirror Property called `owningSquad`:

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

A Formula Property that links to the slack channel of the squad can be:

```json showLineNumbers
"owning_squad_slack": {
    "title": "Owning Squad Channel",
    "formula": "https://slack.com/{{owningSquad}}",
    "icon": "Team"
}
```

:::note
Remember that since Mirror Properties are treated as user-defined properties, when referencing them in Formula Properties, there is no need for a preceding dollar sign (`$`).
:::
