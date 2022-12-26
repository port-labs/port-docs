---
sidebar_position: 2
---

# OpenAPI

With Port, you can import and display [OpenAPI](https://www.openapis.org/) specification files as [Swagger UI](https://swagger.io/) tabs.

By using a special [Open API Blueprint property](../blueprint/blueprint.md#openapi-specification-as-url), Port will display the Swagger UI matching the spec file provided in the [Specific Entity Page](../entity/entity.md#entity-page). In addition, it will also provide advanced functionality such as performing HTTP calls to the spec target directly from Port.

## OpenAPI property definition in Blueprint schema using URL

```json showLineNumbers
{
  "title": "Open API",
  "type": "string",
  "format": "url",
  "spec": "open-api",
  "description": "Open-API Prop"
}
```

## OpenAPI property definition in Blueprint schema using object

```json showLineNumbers
{
  "title": "Open API",
  "type": "object",
  "spec": "open-api",
  "description": "Open-API Prop"
}
```

:::note

When using URL for the `open-api` display please make sure that your server allows cross-origin (CORS) requests from `app.getport.io`
:::

## Example

Here is how the Swagger tab in the Specific Entity Page appears when an OpenAPI spec is provided:

![OpenAPI Example](../../../static/img/software-catalog/widgets/openAPI.png)
