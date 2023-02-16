---
sidebar_position: 1
title: Create an S3 Bucket and Entity
description: Provision an S3 bucket and reflect it in Port
---

# Create an S3 Bucket and Entity

In this example you are going to create an AWS S3 bucket and then report its information to Port as an S3 bucket entity.

Here is the complete `main.tf` file:

<details>
<summary>Complete Terraform definition file</summary>

```hcl showLineNumbers
terraform {
  required_providers {
    port-labs = {
      source  = "port-labs/port-labs"
      version = "~> 0.8.1"
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

resource "aws_s3_bucket" "port-terraform-example-bucket" {
  bucket = "my-port-terraform-example-bucket"
}

resource "aws_s3_bucket_acl" "port-terraform-example-bucket-acl" {
  bucket = aws_s3_bucket.port-terraform-example-bucket.id
  acl    = "private"
}

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
  depends_on = [
    aws_s3_bucket.port-terraform-example-bucket,
    port-labs_blueprint.s3_bucket
  ]

  identifier = aws_s3_bucket.port-terraform-example-bucket.bucket
  title      = aws_s3_bucket.port-terraform-example-bucket.bucket
  blueprint  = port-labs_blueprint.s3_bucket.identifier

  properties {
    name  = "isPrivate"
    value = aws_s3_bucket_acl.port-terraform-example-bucket-acl.acl == "private" ? true : false
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
      version = "~> 0.8.1"
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
