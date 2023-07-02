---
sidebar_position: 1
title: Modeling The Backstage C4 Model
description: Create the core layout of the C4 model in Port
---

# Modeling The Backstage C4 Model

<!-- TODO: complete and reveal this example when the Terraform provider supports creating entities with a many relation -->

In this example you are going to create the basic layout of the [Backstage C4 model](https://www.getport.io/blog/using-backstages-c4-model-adaptation-to-visualize-software-creating-a-software-catalog-in-port).

Here is the complete `main.tf` file:

<details>
<summary>Complete Terraform definition file</summary>

```hcl showLineNumbers
terraform {
  required_providers {
    port-labs = {
      source  = "port-labs/port-labs"
      version = "~> 1.0.0"
    }
  }
}

provider "port-labs" {
  #   client_id = "YOUR_CLIENT_ID"     # or set the environment variable PORT_CLIENT_ID
  #   secret    = "YOUR_CLIENT_SECRET" # or set the environment variable PORT_CLIENT_SECRET
}

resource "port-labs_blueprint" "component" {
  depends_on = [
    port-labs_blueprint.system,
    port-labs_blueprint.resource,
    port-labs_blueprint.api
  ]

  identifier = "component"
  icon       = "Cloud"
  title      = "Component"

  properties {
    string_prop = {
      "type" = {
        title      = "Type"
        required   = false
        type       = "string"
        enum       = ["service", "library"]
        enum_colors = {
          "service" = "blue",
          "library" = "green"
        }
      }
    }
  }

  relations = {
  "system" = {
    target     = "system"
    required   = false
    many       = false
    title      = "System"
    }
  }
  relations {
    identifier = "resource"
    target     = "resource"
    required   = false
    many       = true
    title      = "Resources"
  }
  relations {
    identifier = "cosnumesApi"
    target     = "api"
    required   = false
    many       = true
    title      = "Consumes API"
  }
  relations {
    identifier = "component"
    target     = "component"
    required   = false
    many       = true
    title      = "Components"
  }
  relations {
    identifier = "providesApi"
    target     = "api"
    required   = false
    many       = false
    title      = "Provides API"
  }
}
resource "port-labs_blueprint" "resource" {
  identifier = "resource"
  icon       = "DevopsTool"
  title      = "Resource"

  properties {
    identifier = "type"
    title      = "Type"
    required   = false
    type       = "string"
    enum       = ["postgres", "kafka-topic", "rabbit-queue", "s3-bucket"]
  }
}

resource "port-labs_blueprint" "api" {
  identifier = "api"
  icon       = "Link"
  title      = "API"

  properties {
    identifier = "type"
    title      = "Type"
    required   = false
    type       = "string"
    enum       = ["Open API", "gRPC"]
  }
}

resource "port-labs_blueprint" "domain" {
  identifier = "domain"
  icon       = "Server"
  title      = "Domain"

  properties {
    identifier = "active"
    title      = "Active?"
    required   = false
    type       = "boolean"
  }
}

resource "port-labs_blueprint" "system" {
  depends_on = [
    port-labs_blueprint.domain
  ]

  identifier = "system"
  icon       = "DevopsTool"
  title      = "System"

  properties {
    identifier = "active"
    title      = "Active?"
    required   = false
    type       = "boolean"
  }

  relations {
    identifier = "domain"
    target     = "domain"
    required   = false
    many       = false
    title      = "Domain"
  }
}

resource "port-labs_entity" "orderDomain" {
  depends_on = [
    port-labs_blueprint.system,
    port-labs_blueprint.resource,
    port-labs_blueprint.api,
    port-labs_blueprint.domain,
    port-labs_blueprint.component,
  ]

  identifier = "orders"
  title      = "Orders"
  blueprint  = port-labs_blueprint.domain.identifier

  properties {
    name  = "active"
    value = true
  }
}

resource "port-labs_entity" "cartSystem" {
  depends_on = [
    port-labs_blueprint.system,
    port-labs_blueprint.resource,
    port-labs_blueprint.api,
    port-labs_blueprint.domain,
    port-labs_blueprint.component,
    port-labs_entity.orderDomain,
  ]

  identifier = "cart"
  title      = "Cart"
  blueprint  = port-labs_blueprint.system.identifier

  properties {
    name  = "active"
    value = true
  }

  relations {
    name       = "domain"
    identifier = port-labs_entity.orderDomain.identifier
  }
}

resource "port-labs_entity" "productsSystem" {
  depends_on = [
    port-labs_blueprint.system,
    port-labs_blueprint.resource,
    port-labs_blueprint.api,
    port-labs_blueprint.domain,
    port-labs_blueprint.component,
    port-labs_entity.orderDomain,
  ]

  identifier = "product"
  title      = "Products"
  blueprint  = port-labs_blueprint.system.identifier

  properties {
    name  = "active"
    value = true
  }

  relations {
    name       = "domain"
    identifier = port-labs_entity.orderDomain.identifier
  }
}

resource "port-labs_entity" "cartResource" {
  depends_on = [
    port-labs_blueprint.system,
    port-labs_blueprint.resource,
    port-labs_blueprint.api,
    port-labs_blueprint.domain,
    port-labs_blueprint.component,
    port-labs_entity.orderDomain,
  ]

  identifier = "cartSqlDb"
  title      = "Cart SQL Database"
  blueprint  = port-labs_blueprint.resource.identifier

  properties {
    name  = "type"
    value = "postgres"
  }
}

resource "port-labs_entity" "cartApi" {
  depends_on = [
    port-labs_blueprint.system,
    port-labs_blueprint.resource,
    port-labs_blueprint.api,
    port-labs_blueprint.domain,
    port-labs_blueprint.component,
    port-labs_entity.orderDomain,
  ]

  identifier = "cartApi"
  title      = "Cart API"
  blueprint  = port-labs_blueprint.api.identifier

  properties {
    name  = "type"
    value = "Open API"
  }
}

resource "port-labs_entity" "coreKafkaLibraryComponent" {
  depends_on = [
    port-labs_blueprint.system,
    port-labs_blueprint.resource,
    port-labs_blueprint.api,
    port-labs_blueprint.domain,
    port-labs_blueprint.component,
    port-labs_entity.cartSystem,
  ]

  identifier = "coreKafkaLibrary"
  title      = "Core Kafka Library"
  blueprint  = port-labs_blueprint.component.identifier

  properties {
    name  = "type"
    value = "library"
  }
}

resource "port-labs_entity" "corePaymentLibraryComponent" {
  depends_on = [
    port-labs_blueprint.system,
    port-labs_blueprint.resource,
    port-labs_blueprint.api,
    port-labs_blueprint.domain,
    port-labs_blueprint.component,
    port-labs_entity.cartSystem,
  ]

  identifier = "coreKafkaLibrary"
  title      = "Core Kafka Library"
  blueprint  = port-labs_blueprint.component.identifier

  properties {
    name  = "type"
    value = "library"
  }

  relations {
    name       = "system"
    identifier = port-labs_entity.cartSystem.identifier
  }
}

resource "port-labs_entity" "cartService" {
  depends_on = [
    port-labs_blueprint.system,
    port-labs_blueprint.resource,
    port-labs_blueprint.api,
    port-labs_blueprint.domain,
    port-labs_blueprint.component,
    port-labs_entity.cartSystem,
  ]

  identifier = "cartService"
  title      = "Cart Service"
  blueprint  = port-labs_blueprint.component.identifier

  properties {
    name  = "type"
    value = "service"
  }

  relations {
    name       = "system"
    identifier = port-labs_entity.cartSystem.identifier
  }
  relations {
    name = "resource"
    identifier = [
      port-labs_entity.cartResource.identifier
    ]
  }
  relations {
    name = "component"
    identifier = [
      port-labs_entity.coreKafkaLibraryComponent.identifier,
      port-labs_entity.corePaymentLibraryComponent.identifier
    ]
  }
}

resource "port-labs_entity" "productService" {
  depends_on = [
    port-labs_blueprint.system,
    port-labs_blueprint.resource,
    port-labs_blueprint.api,
    port-labs_blueprint.domain,
    port-labs_blueprint.component,
    port-labs_entity.cartSystem,
  ]

  identifier = "productService"
  title      = "Product Service"
  blueprint  = port-labs_blueprint.component.identifier

  properties {
    name  = "type"
    value = "service"
  }

  relations {
    name       = "system"
    identifier = port-labs_entity.productsSystem.identifier
  }
  relations {
    name       = "consumesApi"
    identifier = port-labs_entity.cartApi.identifier
  }
}
```

</details>

To use this example yourself, simply replace the placeholders for `access_key`, `secret_key`, `client_id` and `secret` and then run the following commands to setup your new backend, create the new infrastructure and update the software catalog:

```shell showLineNumbers
# install modules and create an initial state
terraform init
# To view Terraform's planned changes based on your .tf definition file:
terraform plan
# To apply the changes and update the catalog
terraform apply
```

Let's break down the definition file and understand the different parts:

## Module imports

This part includes importing and setting up the required Terraform providers and modules:

```hcl showLineNumbers
terraform {
  required_providers {
    port-labs = {
      source  = "port-labs/port-labs"
      version = "~> 1.0.0"
    }
  }
}

provider "aws" {
  access_key = "YOUR_ACCESS_KEY_ID"
  secret_key = "YOUR_SECRET_ACCESS_KEY"
  region     = "eu-west-1"
}

provider "port-labs" {
  client_id = "YOUR_CLIENT_ID"     # or set the environment variable PORT_CLIENT_ID
  secret    = "YOUR_CLIENT_SECRET" # or set the environment variable PORT_CLIENT_SECRET
}
```

## Defining the S3 bucket and bucket ACLs

This part includes defining the S3 bucket and attaching an ACL policy:

```hcl showLineNumbers
resource "aws_s3_bucket" "port-terraform-example-bucket" {
  bucket = "my-port-terraform-example-bucket"
}

resource "aws_s3_bucket_acl" "port-terraform-example-bucket-acl" {
  bucket = aws_s3_bucket.port-terraform-example-bucket.id
  acl    = "public-read"
}
```

## Creating the S3 bucket blueprint and the entity matching the new bucket

This part includes configuring the `s3Bucket` blueprint and creating an entity for our new bucket:

```hcl showLineNumbers
resource "port-labs_blueprint" "s3_bucket" {
  identifier = "s3Bucket"
  icon       = "Bucket"
  title      = "S3 Bucket"

  properties {
    identifier = "isPrivate"
    title      = "Is private?"
    required   = false
    type       = "boolean"
  }
}


resource "port-labs_entity" "s3_bucket" {
# highlight-start
  depends_on = [
    aws_s3_bucket.port-terraform-example-bucket,
    port-labs_blueprint.s3_bucket
  ]
# highlight-end

  identifier = aws_s3_bucket.port-terraform-example-bucket.bucket
  title      = aws_s3_bucket.port-terraform-example-bucket.bucket
  blueprint  = port-labs_blueprint.s3_bucket.identifier

  properties {
    name  = "isPrivate"
    value = aws_s3_bucket_acl.port-terraform-example-bucket-acl.acl == "private" ? true : false
  }
}
```

:::info Terraform dependencies
Note how we use a `depends_on` block on the new s3 entity, this is required because the `s3Bucket` blueprint has to exist before the entity can be created. In addition, the entity relies on values that will only be available after the S3 bucket is created.
:::

## Result

After running `terraform apply` you will see the new S3 bucket in AWS, and the matching `s3Bucket` entity in Port.
