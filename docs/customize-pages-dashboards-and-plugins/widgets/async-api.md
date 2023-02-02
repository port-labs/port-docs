---
sidebar_position: 4
---

# AsyncAPI

With Port, you can import and display [AsyncAPI](https://www.asyncapi.com/) specification files as [Swagger UI](https://swagger.io/) tabs.

By using a special Async API Blueprint property), Port will display the Swagger UI matching the spec file provided in the [Specific Entity Page](../../build-your-software-catalog/sync-data-to-catalog/understand-entities-structure/understand-entities-structure.md#entity-page).

## AsyncAPI property definition in Blueprint schema using URL

When using the URL format, Port will query the provided URL for the AsyncAPI spec and expects a JSON AsyncAPI spec

```json showLineNumbers
{
  "title": "Async API",
  "type": "string",
  "format": "url",
  "spec": "async-api",
  "description": "Async-API Prop"
}
```

:::note

When using URL for the `async-api` display please make sure that your server allows cross-origin (CORS) requests from `app.getport.io`
:::

## AsyncAPI property definition in Blueprint schema using object

When using the object type, you will have to provide the full JSON AsyncAPI spec as an object to the Entity

```json showLineNumbers
{
  "title": "Async API",
  "type": "object",
  "spec": "async-api",
  "description": "Async-API Prop"
}
```

## Example

Here is how the Swagger tab in the Specific Entity Page appears when an AsyncAPI spec is provided:

![AsyncAPI Example](../../../static/img/software-catalog/widgets/asyncAPI.png)

:::note
Only AsyncAPI versions 2.0.0 up to 2.4.0 are supported at the moment.
:::
