---
sidebar_position: 2
title: Manage an S3 Bucket Lifecycle
description: Learn how to manage S3 buckets in Port, ensuring efficient cloud storage organization and access management.
displayed_sidebar: null
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"

# Manage an S3 Bucket Lifecycle

In this example you are going to create an AWS S3 bucket and then report its information to Port as an S3 bucket entity.

## Prerequisites

You will need to create a developer environment blueprint to follow this example:

<Tabs groupId="blueprint" defaultValue="api" values={[
{label: "API", value: "api"},
{label: "Terraform", value: "terraform"}
]}>

<TabItem value="api">

```json showLineNumbers
{
  "identifier": "s3Bucket",
  "description": "",
  "title": "S3 Bucket",
  "icon": "Bucket",
  "schema": {
    "properties": {
      "isPrivate": {
        "type": "boolean",
        "title": "Is private?"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "relations": {}
}
```

</TabItem>

<TabItem value="terraform">

```hcl showLineNumbers
terraform {
  required_providers {
    port = {
      source  = "port-labs/port-labs"
      version = "~> 2.0.3"
    }
  }
}

provider "port" {
  client_id = "YOUR_CLIENT_ID"     # or set the environment variable PORT_CLIENT_ID
  secret    = "YOUR_CLIENT_SECRET" # or set the environment variable PORT_CLIENT_SECRET
  base_url  = "https://api.getport.io"
}

resource "port_blueprint" "s3_bucket" {
  identifier = "s3Bucket"
  icon       = "Bucket"
  title      = "S3 Bucket"

  properties = {
    boolean_props = {
      isPrivate = {
        title      = "Is private?"
        required   = false
      }
    }
  }
}
```

<PortApiRegionTip/>

</TabItem>

</Tabs>

Here is the complete `main.tf` file:

<details>
<summary>Complete Terraform definition file</summary>

```hcl showLineNumbers
terraform {
  required_providers {
    port = {
      source  = "port-labs/port-labs"
      version = "~> 2.0.3"
    }
  }
}

provider "aws" {
  access_key = "YOUR_ACCESS_KEY_ID"
  secret_key = "YOUR_SECRET_ACCESS_KEY"
  region     = "eu-west-1"
}

provider "port" {
  client_id = "YOUR_CLIENT_ID"     # or set the environment variable PORT_CLIENT_ID
  secret    = "YOUR_CLIENT_SECRET" # or set the environment variable PORT_CLIENT_SECRET
  base_url  = "https://api.getport.io"
}

resource "aws_s3_bucket" "port-terraform-example-bucket" {
  bucket = "my-port-terraform-example-bucket"
}

resource "aws_s3_bucket_acl" "port-terraform-example-bucket-acl" {
  bucket = aws_s3_bucket.port-terraform-example-bucket.id
  acl    = "private"
}

resource "port_entity" "s3_bucket" {
  depends_on = [
    aws_s3_bucket.port-terraform-example-bucket
  ]

  identifier = aws_s3_bucket.port-terraform-example-bucket.bucket
  title      = aws_s3_bucket.port-terraform-example-bucket.bucket
  blueprint  = "s3Bucket"

  properties = {
    string_props = {
      "isPrivate" = aws_s3_bucket_acl.port-terraform-example-bucket-acl.acl == "private" ? true : false
    }
  }
}
```

<PortApiRegionTip/>

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
    port = {
      source  = "port-labs/port-labs"
      version = "~> 2.0.3"
    }
  }
}

provider "aws" {
  access_key = "YOUR_ACCESS_KEY_ID"
  secret_key = "YOUR_SECRET_ACCESS_KEY"
  region     = "eu-west-1"
}

provider "port" {
  client_id = "YOUR_CLIENT_ID"     # or set the environment variable PORT_CLIENT_ID
  secret    = "YOUR_CLIENT_SECRET" # or set the environment variable PORT_CLIENT_SECRET
  base_url  = "https://api.getport.io"
}
```

<PortApiRegionTip/>

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

## Creating the S3 bucket entity matching the new bucket

This part includes configuring the `s3Bucket` blueprint and creating an entity for our new bucket:

```hcl showLineNumbers
resource "port_entity" "s3_bucket" {
# highlight-start
  depends_on = [
    aws_s3_bucket.port-terraform-example-bucket
  ]
# highlight-end

  identifier = aws_s3_bucket.port-terraform-example-bucket.bucket
  title      = aws_s3_bucket.port-terraform-example-bucket.bucket
  blueprint  = "s3Bucket"

  properties = {
    string_props = {
      "isPrivate" = aws_s3_bucket_acl.port-terraform-example-bucket-acl.acl == "private" ? true : false
    }
  }
}
```

:::info Terraform dependencies
Note how we use a `depends_on` block on the new s3 entity because the entity relies on values that will only be available after the S3 bucket is created.
:::

## Result

After running `terraform apply` you will see the new S3 bucket in AWS, and the matching `s3Bucket` entity in Port.

Continue reading to learn how to make updates and how to cleanup.

## Updating the S3 bucket and the matching entity

Notice how we defined the `isPrivate` property of the bucket entity:

```hcl showLineNumbers
properties = {
    string_props = {
      "isPrivate" = aws_s3_bucket_acl.port-terraform-example-bucket-acl.acl == "private" ? true : false
    }
}
```

Since the initial bucket we created was configured as `private`, the value of the property is `true`.

Let's modify the bucket policy:

```hcl showLineNumbers
resource "aws_s3_bucket_acl" "port-terraform-example-bucket-acl" {
  bucket = aws_s3_bucket.port-terraform-example-bucket.id
  // highlight-next-line
  acl    = "public-read" # Changed from "private"
}
```

And now by running `terraform apply`, both the bucket policy will change, as well as the `isPrivate` property of the matching entity.

## Cleanup

To cleanup your environment, you can run the command `terraform destroy`, which will delete all of the resources you created in this example (including the S3 bucket and matching Port entity).
