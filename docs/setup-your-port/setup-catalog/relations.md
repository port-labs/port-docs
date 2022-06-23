---
sidebar_position: 2
---

# Relations

**Relations** help map the connections between the entities inside your organization

**For example**, to see where your `microservices` are deployed, you need to create a relation between your microservices and `deployments`

## Understanding The Structure Of a Relation

The basic structure of a Relation request:

```json
{
    "identifier": "UniqueId",
    "title": "Title",
    "source": "Blueprint Source Identifier",
    "target": "Blueprint Target Identifier",
    "required": false
}
```

- `identifier` - A unique identifier (Note that while the identifier is unique, it can be changed after creation)
- `title` - A nicely written name for the relation
- `source` - The source entity, in the Package-Deployment example, the source is `Package`
- `target` - The target entity, in the Package-Deployment example, the target is `Deployment`
- `required` - Whether the target entity is required when creating a new source.
  - In the Package-Deployment example, the relation is not required, because a package might be developed without being deployed in a specific service
  - In a Deployment-Kubernetes example, the relation is required, because a deployment must be deployed in some cluster

:::tip
The title allows you to give a human-readable to relations. For example: A `Package` is `Used By` a `Deployment`

Using titles also allows you to conveniently access relations programmatically in a generic way while keeping the UI readable, you can define a convention where all relations are named in the format `{blueprint_1}-to-{blueprint_2}`, allowing you to generically interact with relations in code, without impacting UX.
:::