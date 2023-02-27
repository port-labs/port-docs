---
sidebar_position: 3
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# OpenAPI

With Port, you can import and display [OpenAPI](https://www.openapis.org/) specification files as [Swagger UI](https://swagger.io/) tabs.

By using a special Open API Blueprint property, Port will display the Swagger UI matching the spec file provided in the [specific entity page](../page/entity-page.md). In addition, it will also provide advanced functionality such as performing HTTP calls to the spec target directly from Port.

## OpenAPI property definition in Blueprint schema using URL

When using the URL format, Port will query the provided URL for the OpenAPI spec and expects a JSON OpenAPI spec

:::note

When using URL for the `open-api` display please make sure that your server allows cross-origin (CORS) requests from `app.getport.io`
:::

## OpenAPI property definition in Blueprint schema using object

When using the object type, you will have to provide the full JSON OpenAPI spec as an object to the entity

## API definition

<Tabs groupId="api-definition" defaultValue="url" values={[
{label: "URL", value: "url"},
{label: "Object", value: "object"}
]}>

<TabItem value="object">

```json showLineNumbers
{
  "myOpenApi": {
    "title": "My Open API",
    // highlight-start
    "type": "object",
    "spec": "open-api",
    // highlight-end
    "description": "Open-API Prop"
  }
}
```

</TabItem>
<TabItem value="url">

```json showLineNumbers
{
  "myOpenApi": {
    "title": "My Open API",
    // highlight-start
    "type": "string",
    "format": "url",
    "spec": "open-api",
    // highlight-end
    "description": "Open-API Prop"
  }
}
```

</TabItem>
</Tabs>

## Terraform definition

<Tabs groupId="tf-definition" defaultValue="url" values={[
{label: "URL", value: "url"},
{label: "Object", value: "object"}
]}>

<TabItem value="object">

```hcl showLineNumbers
resource "port-labs_blueprint" "myBlueprint" {
  # ...blueprint properties
  # highlight-start
  properties {
    identifier = "myOpenApi"
    title      = "My Open Api"
    required   = false
    type       = "object"
    spec       = "open-api"
  }
  # highlight-end
}
```

</TabItem>

<TabItem value="url">

```hcl showLineNumbers
resource "port-labs_blueprint" "myBlueprint" {
  # ...blueprint properties
  # highlight-start
  properties {
    identifier = "myOpenApi"
    title      = "My Open Api"
    required   = false
    type       = "string"
    format     = "url"
    spec       = "open-api"
  }
  # highlight-end
}
```

</TabItem>

</Tabs>

## Example

Here is how the Swagger tab in the specific entity page appears when an OpenAPI spec is provided:

![OpenAPI Example](../../../static/img/software-catalog/widgets/openAPI.png)
