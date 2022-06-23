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

Using titles also allows you to conveniently access relations programmatically in a generic way while keeping the UI readable.

For example, you can define a convention where all relations are named in a specific format:
- `{blueprint_1}-{blueprint_2}`
- `{blueprint_1}-to-{blueprint_2}`
- `{blueprint_1}<->{blueprint_2}`
- or anything similar that works for you

This will allow you to interact with relations in code in a generic way, without impacting UX.
:::

:::note
When creating a blueprint from the API, there is no need for the `source` field, for more info refer to the [Creating Relations From the UI](#from-the-ui) section
:::

## Creating Relations

:::note
Remember that an access token is needed to make API requests, refer back to [Getting an API token](blueprints#getting-an-api-token) if you need to generate a new one
:::

:::info
Relations require 2 blueprints to map a connection between, if you haven't created the `Microservice` blueprint in [Creating a Blueprint](blueprints#creating-a-blueprint) and the `Package` blueprint in [Blueprint Next Steps](blueprints#next-steps), please make sure to do so if you want to follow along
:::

We'll present 2 ways to create relations:

- From the UI
- From the API

### From the UI

In order to create a relation from the UI, go to the Blueprints Graph, at the top right corner of the page you can find the `New Blueprints Relation` button:

![Graph Package Microservice Create Relation Marked](../../../static/img/setup-your-port/self-service-portal/relations/graphPackageMicroserviceCreateRelationMarked.png)

After clicking the button an editor window will open with a format similar to the one we explained in the [Understanding The Structure Of a Relation](#understanding-the-structure-of-a-relation) section, paste in the following content to create the `Package-Deployment` relation

### From the API