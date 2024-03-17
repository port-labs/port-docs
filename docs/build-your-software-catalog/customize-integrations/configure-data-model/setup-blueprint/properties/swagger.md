---
sidebar_position: 15
sidebar_class_name: "custom-sidebar-item sidebar-property-swagger"
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortTooltip from "/src/components/tooltip/tooltip.jsx"

# Swagger UI

The `Swagger UI` property is used to import and display [OpenAPI](https://www.openapis.org/) and/or [AsyncAPI](https://www.asyncapi.com/) specification files within an <PortTooltip id="entity">entity</PortTooltip> in Port.  

Using this property will automatically create an additional tab in each [entity page](/customize-pages-dashboards-and-plugins/page/entity-page.md), displaying the specification files in [Swagger UI](https://swagger.io/) format. Within this tab, you will be able to perform HTTP calls to the spec target directly from Port.

The following is an example of a `Swagger UI` tab in an entity page:

<img src='/img/software-catalog/blueprint/swaggerUiExample.png' width='85%' />

## OpenAPI

### Definition

<Tabs groupId="definition" defaultValue="url" values={[
{label: "URL", value: "url"},
{label: "JSON", value: "json"},
{label: "YAML", value: "yaml"}
]}>

<TabItem value="url">

When using the URL format, Port will query the provided URL for the OpenAPI spec and expects a JSON OpenAPI spec

:::note

When using URL for the `open-api` display please make sure that your server allows cross-origin (CORS) requests from `app.getport.io`.

To serve the OpenAPI spec from an AWS S3 bucket, please add a CORS policy to the bucket that allows requests from `app.getport.io`, check out the [AWS documentation](https://docs.aws.amazon.com/AmazonS3/latest/userguide/enabling-cors-examples.html?icmpid=docs_amazons3_console) for more information.
:::

<Tabs groupId="lang" defaultValue="api" values={[
{label: "API", value: "api"},
{label: "Terraform", value: "terraform"}
]}>

<TabItem value="api">

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

<TabItem value="terraform">

```hcl showLineNumbers
resource "port_blueprint" "myBlueprint" {
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

</TabItem>

<TabItem value="json">

When using the JSON type, you will need to provide the full JSON OpenAPI spec as an object to the entity:

<Tabs groupId="lang" defaultValue="api" values={[
{label: "API", value: "api"},
{label: "Terraform", value: "terraform"}
]}>

<TabItem value="api">

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

<TabItem value="terraform">

```hcl showLineNumbers
resource "port_blueprint" "myBlueprint" {
  # ...blueprint properties
  properties = {
    props_object = {
      myOpenApi = {
        title      = "My Open Api"
        required   = false
        spec       = "open-api"
      }
    }
  }
}
```

</TabItem>

</Tabs>

</TabItem>

<TabItem value="yaml">

When using the YAML type, you will need to provide the full YAML OpenAPI spec to the entity:

<Tabs groupId="lang" defaultValue="api" values={[
{label: "API", value: "api"},
{label: "Terraform", value: "terraform"}
]}>

<TabItem value="api">

```json showLineNumbers
{
  "myOpenApi": {
    "title": "My Open API",
    // highlight-start
    "type": "string",
    "format": "yaml",
    "spec": "open-api",
    // highlight-end
    "description": "Open-API Prop"
  }
}
```

</TabItem>

<TabItem value="terraform">

```hcl showLineNumbers
resource "port_blueprint" "myBlueprint" {
  # ...blueprint properties
  properties = {
    string_props = {
      "myYamlProp" = {
        title      = "My yaml"
        required   = false
        format     = "yaml"
      }
    }
  }
}
```

</TabItem>

</Tabs>

</TabItem>

</Tabs>

---

### Example

Here is how the Swagger tab in the specific entity page appears when an OpenAPI spec is provided:

![OpenAPI Example](/img/software-catalog/widgets/openAPI.png)

## AsyncAPI

### Definition

<Tabs groupId="definition" defaultValue="url" values={[
{label: "URL", value: "url"},
{label: "JSON", value: "json"},
{label: "YAML", value: "yaml"}
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

<TabItem value="json">

When using the JSON type, you will need to provide the full JSON AsyncAPI spec as an object to the Entity:

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
  properties = {
    props_object = {
      myAsyncApi = {
        title      = "My Async Api"
        required   = false
        spec       = "async-api"
      }
    }
  }
}
```

</TabItem>

</Tabs>

</TabItem>

<TabItem value="yaml">

When using the YAML type, you will need to provide the full YAML AsyncAPI spec to the entity:

<Tabs groupId="lang" defaultValue="api" values={[
{label: "API", value: "api"},
{label: "Terraform", value: "terraform"}
]}>

<TabItem value="api">

```json showLineNumbers
{
  "myOpenApi": {
    "title": "My Async API",
    // highlight-start
    "type": "string",
    "format": "yaml",
    "spec": "async-api",
    // highlight-end
    "description": "Async-API Prop"
  }
}
```

</TabItem>

<TabItem value="terraform">

```hcl showLineNumbers
resource "port_blueprint" "myBlueprint" {
  # ...blueprint properties
  properties = {
    string_props = {
      "myYamlProp" = {
        title      = "My yaml"
        required   = false
        format     = "yaml"
      }
    }
  }
}
```

</TabItem>

</Tabs>

</TabItem>

</Tabs>

---

### Example

Here is how the Swagger tab in the specific entity page appears when an AsyncAPI spec is provided:

![AsyncAPI Example](/img/software-catalog/widgets/asyncAPI.png)
