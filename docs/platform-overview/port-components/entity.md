---
sidebar_position: 1.3
---

# Entity

## What is an Entity?

An entity is the object instance of a blueprint, and it represents the data of the software components which is defined by the blueprint properties.

## Entity JSON structure

This is the basic structure of an Entity:

```json showLineNumbers
{
    "identifier": "UniqueID",
    "title": "Title",
    "team": "",
    "blueprint": "blueprintName",
    "properties": {
        "property1": "",
        "property2": ""
    },
    "relations": {}
}
```
---
## Structure table
| Field | Type | Description | 
| ----------- | ----------- | ----------- | 
| `identifier` | `String` | A unique identifier. <br /> **Note that** while the identifier is unique, it can be changed after creation. |
| `title` | `String` | A nicely written name for the entity that will be shown in the UI. |
| `team` | `Array` | **Optional Field.** An array of the associated teams. Only available teams can be added. <br /> **Note that** group permissions are handled according to this array, see [Teams and ownership](#teams-and-ownership). |
| `blueprint` | `String` | The name of the [Blueprint](./blueprint) that this entity is based on. | 
| `properties` | `Object` | An object containing key-value pairs, where each key is a property **as defined in the blueprint definition**, and each value applies the `type` of the property. | 
| `relations` | `object` | An object containing key-value pairs.<br /> Each key is the identifier of the [Relation](relations) that is defined on the blueprint.<br /><br />-> See more in the [Related entities](#related-entities) section. |

#### Teams and ownership
:::info teams and ownership
The `team` key defines ownership over an entity and controls who can modify or delete an existing entity.

To Explore more about Ownership in Port see our [Permissions](../../welcome) section.
:::

## Example

<details>
<summary> A microservice entity </summary>
In this example, you can see how a `microservice` entity is defined.

#### Microservice entity

```json
{
    "identifier": "my-service",
    "title": "My Service",
    "team": "Infra",
    "blueprint": "microservice",
    "properties": {
        "repo-link": "https://github.com/port-labs/my-service",
        "health-status": "Ready"
    },
    "relations": {}
}
```
:::note 
Notice that this entity is based on the following blueprint definition, where the `repo-link` is mandatory.
```json showLineNumbers
{
    "identifier": "microservice",
    "title": "microservice",
    "icon": "Microservice",
    "dataSource": "Port",
    "formulaProperties": {},
    "schema": {
        "properties": {
            "repo-link": {
                "type": "string",
                "format": "url"
                "title": "Repo URL"
            },
            "health-status": {
                "type": "string",
                "enum": [
                        "Ready",
                        "Down"
                ],
                "title": "Service Health Status"
            }
        },
        "required": [
            "repo-link"
        ]
    }
}
```
:::
</details>

## Related entities

When two blueprints are connected, creating an entity of the `source` blueprint will show an additional option - a `relation`.  
This option is shown under the `relations` section as follows:

```json showLineNumbers
"relations": {
    "relation-identifier": "relatedEntityIdentifier"
}
```

:::tip
Click for more details about [**relations**](./relation).
:::

### Relation mapping example

Let's assume we have a relation between the `deployment` and `microservice` blueprints, named `deployment-to-microservice`.

One of our microservices is called `Notification Service` with the identifier `notificationService`.

In order to map this `microservice` to one our `notificationServiceDeploymentV1` deployment we will use the following `relations` key:

```json showLineNumbers
"relations": {
    "deployment-to-microservice": "notificationService"
}
```

Specifying the `notificationService` under the relation, creates a mapping between our `notificationServiceDeploymentV1` entity and the `notificationService` entity, now when you go view the `notificationServiceDeploymentV1` entity you will also see the related `notificationService` entity.

In addition, you will be able to use [mirror properties](./mirror-properties) to map additional properties from the `microservice` blueprint to the `deployment` entity

## Next Steps

[Explore How to Create, Edit, and Delete Entities with basic examples](../../tutorials/entity-basics.md)

[Dive into advanced operations on Entities with our API ➡️ ](../../api-reference)
