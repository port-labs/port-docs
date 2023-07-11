---
sidebar_position: 4
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# AsyncAPI

With Port, you can import and display [AsyncAPI](https://www.asyncapi.com/) specification files as [Swagger UI](https://swagger.io/) tabs.

By using a special Async API Blueprint property, Port will display the Swagger UI matching the spec file provided in the [Specific entity page](../page/entity-page.md).

## Definition

<Tabs groupId="definition" defaultValue="url" values={[
{label: "URL", value: "url"},
{label: "Object", value: "object"}
]}>

<TabItem value="url">

When using the URL format, Port will query the provided URL for the AsyncAPI spec and expects a JSON AsyncAPI spec

:::note

When using URL for the `async-api` display please make sure that your server allows cross-origin (CORS) requests from `app.getport.io`

To serve the OpenAPI spec from an AWS S3 bucket, please add a CORS policy to the bucket that allows requests from `app.getport.io`, check out the [AWS documentation](https://docs.aws.amazon.com/AmazonS3/latest/userguide/enabling-cors-examples.html?icmpid=docs_amazons3_console) for more information.
:::

<Tabs groupId="lang" defaultValue="api" values={[
{label: "API", value: "api"},
{label: "Terraform", value: "terraform"}
]}>

<TabItem value="api">

```json showLineNumbers
{
  "myAsyncApi": {
    "title": "My Async API",
    // highlight-start
    "type": "string",
    "format": "url",
    "spec": "async-api",
    // highlight-end
    "description": "async-api Prop"
  }
}
```

</TabItem>

<TabItem value="terraform">

```hcl showLineNumbers
resource "port_blueprint" "myBlueprint" {
  # ...blueprint properties
  # highlight-start
  properties {
    identifier = "myAsyncApi"
    title      = "My Async API"
    required   = false
    type       = "string"
    format     = "url"
    spec       = "async-api"
  }
  # highlight-end
}
```

</TabItem>

</Tabs>

</TabItem>

<TabItem value="object">

When using the object type, you will have to provide the full JSON AsyncAPI spec as an object to the Entity

<Tabs groupId="lang" defaultValue="api" values={[
{label: "API", value: "api"},
{label: "Terraform", value: "terraform"}
]}>

<TabItem value="api">

```json showLineNumbers
{
  "myAsyncApi": {
    "title": "My Async API",
    // highlight-start
    "type": "object",
    "spec": "async-api",
    // highlight-end
    "description": "async-api Prop"
  }
}
```

</TabItem>

<TabItem value="terraform">

```hcl showLineNumbers
resource "port_blueprint" "myBlueprint" {
  # ...blueprint properties
  # highlight-start
  properties = {
    "myAsyncApi" = {
      title    = "My Async API"
      required = false
      type     = "object"
      spec     = "async-api"
    }
  }
  # highlight-end
}
```

</TabItem>

</Tabs>

</TabItem>

</Tabs>

## Example

Here is how the Swagger tab in the specific entity page appears when an AsyncAPI spec is provided:

![AsyncAPI Example](../../../static/img/software-catalog/widgets/asyncAPI.png)

:::note
Only AsyncAPI versions 2.0.0 up to 2.4.0 are supported at the moment.
:::
