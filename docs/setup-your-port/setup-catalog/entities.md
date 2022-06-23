---
sidebar_position: 3
---

# Entities

An entity is the data inside Port that represents your software and infrastructure. Entities are created based on Blueprints.

## understanding the structure of an entity

The basic structure of an Entity request:

```json
{
    "identifier": "UniqueID",
    "title": "Title",
    "blueprint": "blueprintName",
    "properties": {
        "property1": "",
        "property2": ""
    },
    "relations": {}
}
```

- `identifier` - A unique identifier (Note that while the identifier is unique, it can be changed after creation)
  - Port's API can automatically generate a unique identifier for entities, we will see how in the [Creating entities](#creating-entities) section
- `title` - A nicely written name for the entity
- `blueprint` - The name of the [Blueprint](blueprints) this entity is based on.
- `properties` - An object containing key-value pairs where each key is a property in the blueprint the entity is based on
- `relations` - An object containing key-value pairs where each key is the name of a [Relation](relations) defined over the blueprint this entity is based on.

## Creating entities