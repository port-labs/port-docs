---
sidebar_position: 1.3
---

# Entity

## What is an Entity?

An entity is the object instance of a blueprint, and it represents the data of the software components which is defined by the blueprint properties.

## Entity Structure

This is the basic structure of an Entity:

```json showLineNumbers
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
| Field | Type | Description | 
| ----------- | ----------- | ----------- | 
| `identifier` | `String` | A unique identifier (Note that while the identifier is unique, it can be changed after creation) |
| `title` | `String` | A nicely written name for the entity that will be shown in the UI. |
| `team` | `Array` | **Optional Field.** An array of the associated teams, according to this array group permissions are handled. |
| `blueprint` | `String` | The name of the [Blueprint](./blueprint) that this entity is based on. | 
| `properties` | `Object` | An object containing key-value pairs, where each key is a property as defined in the blueprint and each value applies the `type` of the property | Example: "`repo-link`": "`https://github.com/{{$identifier}}`"|
| `relations` | `object` | An object containing key-value pairs where each key is the name of a [Relation](relations) defined over the blueprint this entity is based on. |


:::info teams and ownership
Entities also have the `team` key which defines ownership over an entity and controls who can modify or delete an existing entity.

To Explore more about Ownership in Port see our [Users and Permissions](../../welcome) section
:::

## 
