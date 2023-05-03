---
sidebar_position: 2
title: Specific Asset Types Metadata
description: Bring specific assets with extended metadata using terraform
---

# Specific Asset Types Metadata

In this example you are going to learn how to export GCP project's specific assets, with extended metadata for the matching asset type.

Here is the complete `main.tf` file:

<details>
<summary>Complete Terraform definition file</summary>

```hcl showLineNumbers
terraform {
  required_providers {
    port-labs = {
      source  = "port-labs/port-labs"
      version = "~> 0.9.5"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = ">= 3.53, < 5.0"
    }
  }
}

locals {
  project_id = "GCP_PROJECT" # set the project id
}

provider "port-labs" {
  client_id = "PORT_CLIENT_ID"     # or set the env var PORT_CLIENT_ID
  secret    = "PORT_CLIENT_SECRET" # or set the env var PORT_CLIENT_SECRET
}

provider "google-beta" {
  credentials = "GOOGLE_APPLICATION_CREDENTIALS" # or set the env var GOOGLE_APPLICATION_CREDENTIALS
  project     = local.project_id
}

data "google_project" "project" {
  provider   = google-beta
  project_id = local.project_id
}

data "google_cloud_asset_resources_search_all" "my_assets" {
  provider = google-beta
  scope    = "projects/${local.project_id}"
  asset_types = [
    "storage.googleapis.com/Bucket",
    "iam.googleapis.com/ServiceAccount",
    "compute.googleapis.com/Disk"
  ]
}

data "google_storage_bucket" "my_buckets" {
  provider = google-beta
  for_each = {for idx, result in data.google_cloud_asset_resources_search_all.my_assets.results : idx => result if result.asset_type == "storage.googleapis.com/Bucket"}
  name     = reverse(split("/", each.value.name))[0]
}

data "google_service_account" "my_accounts" {
  provider   = google-beta
  for_each   = {for idx, result in data.google_cloud_asset_resources_search_all.my_assets.results : idx => result if result.asset_type == "iam.googleapis.com/ServiceAccount"}
  account_id = reverse(split("/", each.value.name))[0]
}

data "google_compute_disk" "my_disks" {
  provider = google-beta
  for_each = {for idx, result in data.google_cloud_asset_resources_search_all.my_assets.results : idx => result if result.asset_type == "compute.googleapis.com/Disk"}
  zone = each.value.location
  name    = reverse(split("/", each.value.name))[0]
}

resource "port-labs_blueprint" "gcp_project_blueprint" {
  title      = "Project"
  icon       = "Cloud"
  identifier = "project"
  properties {
    identifier = "link"
    type       = "string"
    format     = "url"
    title      = "Link"
  }
  properties {
    identifier = "orgId"
    type       = "string"
    title      = "Org ID"
  }
  properties {
    identifier = "folderId"
    type       = "string"
    title      = "Folder ID"
  }
  properties {
    identifier = "number"
    type       = "string"
    title      = "Number"
  }
  properties {
    identifier = "billingAccount"
    type       = "string"
    title      = "Billing Account"
  }
  properties {
    identifier = "labels"
    type       = "object"
    title      = "Labels"
  }
}

resource "port-labs_entity" "gcp_project_entity" {
  identifier = data.google_project.project.project_id
  title     = data.google_project.project.name
  blueprint = port-labs_blueprint.gcp_project_blueprint.identifier
  properties {
    name  = "link"
    value = "https://console.cloud.google.com/welcome?project=${data.google_project.project.project_id}"
  }
  properties {
    name  = "orgId"
    value = data.google_project.project.org_id
  }
  properties {
    name  = "folderId"
    value = data.google_project.project.folder_id
  }
  properties {
    name  = "number"
    value = data.google_project.project.number
  }
  properties {
    name  = "billingAccount"
    value = data.google_project.project.billing_account
  }
  properties {
    name  = "labels"
    value = jsonencode(data.google_project.project.labels)
  }
}

resource "port-labs_blueprint" "gcp_bucket_blueprint" {
  title      = "Storage Bucket"
  icon       = "Bucket"
  identifier = "storageBucket"
  properties {
    identifier = "link"
    type       = "string"
    format     = "url"
    title      = "Link"
  }
  properties {
    identifier = "location"
    type       = "string"
    title      = "Location"
  }
  properties {
    identifier = "publicAccessPrevention"
    type       = "string"
    enum       = ["inherited", "enforced"]
    title      = "Public Access Prevention"
  }
  properties {
    identifier = "storageClass"
    type       = "string"
    enum       = ["STANDARD", "MULTI_REGIONAL", "REGIONAL", "NEARLINE", "COLDLINE", "ARCHIVE"]
    title      = "Storage Class"
  }
  properties {
    identifier = "uniformBucketLevelAccess"
    type       = "boolean"
    title      = "Uniform Bucket Level Access"
  }
  properties {
    identifier = "lifecycleRule"
    type       = "array"
    title      = "Lifecycle Rule"
  }
  properties {
    identifier = "encryption"
    type       = "array"
    title      = "Encryption"
  }
  properties {
    identifier = "labels"
    type       = "object"
    title      = "Labels"
  }
  relations {
    identifier = port-labs_blueprint.gcp_project_blueprint.identifier
    target = port-labs_blueprint.gcp_project_blueprint.identifier
  }
}

resource "port-labs_entity" "gcp_bucket_entity" {
  for_each = data.google_storage_bucket.my_buckets
  identifier = each.value.id
  title     = each.value.name
  blueprint = port-labs_blueprint.gcp_bucket_blueprint.identifier
  properties {
    name  = "link"
    value = "https://console.cloud.google.com/storage/browser/${each.value.id};tab=objects?project=${each.value.project}"
  }
  properties {
    name  = "location"
    value = each.value.location
  }
  properties {
    name  = "publicAccessPrevention"
    value = each.value.public_access_prevention
  }
  properties {
    name  = "storageClass"
    value = each.value.storage_class
  }
  properties {
    name  = "uniformBucketLevelAccess"
    value = each.value.uniform_bucket_level_access
  }
  properties {
    name  = "lifecycleRule"
    value = jsonencode(each.value.lifecycle_rule)
  }
  properties {
    name  = "encryption"
    value = jsonencode(each.value.encryption)
  }
  properties {
    name  = "labels"
    value = jsonencode(each.value.labels)
  }
  relations {
    name = port-labs_blueprint.gcp_project_blueprint.identifier
    identifier = each.value.project
  }
}

resource "port-labs_blueprint" "gcp_service_account_blueprint" {
  title      = "Service Account"
  icon       = "Lock"
  identifier = "serviceAccount"
  properties {
    identifier = "link"
    type       = "string"
    format     = "url"
    title      = "Link"
  }
  properties {
    identifier = "email"
    type       = "string"
    format     = "email"
    title      = "email"
  }
  relations {
    identifier = port-labs_blueprint.gcp_project_blueprint.identifier
    target = port-labs_blueprint.gcp_project_blueprint.identifier
  }
}

resource "port-labs_entity" "gcp_service_account_entity" {
  for_each = data.google_service_account.my_accounts
  identifier = each.value.account_id
  title     = each.value.display_name
  blueprint = port-labs_blueprint.gcp_service_account_blueprint.identifier
  properties {
    name  = "link"
    value = "https://console.cloud.google.com/iam-admin/serviceaccounts/details/${each.value.unique_id}?project=${each.value.project}"
  }
  properties {
    name  = "email"
    value = each.value.email
  }
  relations {
    name = port-labs_blueprint.gcp_project_blueprint.identifier
    identifier = each.value.project
  }
}

resource "port-labs_blueprint" "gcp_disk_blueprint" {
  title      = "Disk"
  icon       = "GoogleComputeEngine"
  identifier = "disk"
  properties {
    identifier = "link"
    type       = "string"
    format     = "url"
    title      = "Link"
  }
  properties {
    identifier = "description"
    type       = "string"
    title      = "Description"
  }
  properties {
    identifier = "zone"
    type       = "string"
    title      = "Zone"
  }
  properties {
    identifier = "type"
    type       = "string"
    title      = "Type"
  }
  properties {
    identifier = "size"
    type       = "number"
    title      = "Size"
  }
  properties {
    identifier = "creationTimestamp"
    type       = "string"
    format     = "date-time"
    title      = "Creation Timestamp"
  }
  properties {
    identifier = "users"
    type       = "array"
    title      = "Users"
  }
  properties {
    identifier = "labels"
    type       = "object"
    title      = "Labels"
  }
  relations {
    identifier = port-labs_blueprint.gcp_project_blueprint.identifier
    target = port-labs_blueprint.gcp_project_blueprint.identifier
  }
}

resource "port-labs_entity" "gcp_disk_entity" {
  for_each = data.google_compute_disk.my_disks
  identifier = "${each.value.project}_${each.value.zone}_${each.value.name}"
  title     = each.value.name
  blueprint = port-labs_blueprint.gcp_disk_blueprint.identifier
  properties {
    name  = "link"
    value = "https://console.cloud.google.com/compute/disksDetail/zones/${each.value.zone}/disks/${each.value.name}?project=${each.value.project}"
  }
  properties {
    name  = "description"
    value = each.value.description
  }
  properties {
    name  = "zone"
    value = each.value.zone
  }
  properties {
    name  = "type"
    value = each.value.type
  }
  properties {
    name  = "size"
    value = each.value.size
  }
  properties {
    name  = "creationTimestamp"
    value = each.value.creation_timestamp
  }
  properties {
    name  = "users"
    items = each.value.users
  }
  properties {
    name  = "labels"
    value = jsonencode(each.value.labels)
  }
  relations {
    name = port-labs_blueprint.gcp_project_blueprint.identifier
    identifier = each.value.project
  }
}
```

</details>

To use this example yourself, simply replace the placeholders for `project_id`, `client_id`, `secret` and `credentials` and then run the following commands to setup your new backend, create the new infrastructure and update the software catalog:

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
      version = "~> 0.9.5"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = ">= 3.53, < 5.0"
    }
  }
}

locals {
  project_id = "GCP_PROJECT" # set the project id
}

provider "port-labs" {
  client_id = "PORT_CLIENT_ID"     # or set the env var PORT_CLIENT_ID
  secret    = "PORT_CLIENT_SECRET" # or set the env var PORT_CLIENT_SECRET
}

provider "google-beta" {
  credentials = "GOOGLE_APPLICATION_CREDENTIALS" # or set the env var GOOGLE_APPLICATION_CREDENTIALS
  project     = local.project_id
}
```

## Extracting the project and assets

This part includes defining the datasource for the project and specific assets (`buckets`, `service accounts`, `disks`):

```hcl showLineNumbers
data "google_project" "project" {
  provider   = google-beta
  project_id = local.project_id
}

data "google_cloud_asset_resources_search_all" "my_assets" {
  provider = google-beta
  scope    = "projects/${local.project_id}"
  asset_types = [
    "storage.googleapis.com/Bucket",
    "iam.googleapis.com/ServiceAccount",
    "compute.googleapis.com/Disk"
  ]
}

data "google_storage_bucket" "my_buckets" {
  provider = google-beta
  for_each = {for idx, result in data.google_cloud_asset_resources_search_all.my_assets.results : idx => result if result.asset_type == "storage.googleapis.com/Bucket"}
  name     = reverse(split("/", each.value.name))[0]
}

data "google_service_account" "my_accounts" {
  provider   = google-beta
  for_each   = {for idx, result in data.google_cloud_asset_resources_search_all.my_assets.results : idx => result if result.asset_type == "iam.googleapis.com/ServiceAccount"}
  account_id = reverse(split("/", each.value.name))[0]
}

data "google_compute_disk" "my_disks" {
  provider = google-beta
  for_each = {for idx, result in data.google_cloud_asset_resources_search_all.my_assets.results : idx => result if result.asset_type == "compute.googleapis.com/Disk"}
  zone = each.value.location
  name    = reverse(split("/", each.value.name))[0]
}
```

## Creating the Project blueprint and the entity matching the project

This part includes configuring the `project` blueprint and creating an entity for the project:

```hcl showLineNumbers
resource "port-labs_blueprint" "gcp_project_blueprint" {
  title      = "Project"
  icon       = "Cloud"
  identifier = "project"
  properties {
    identifier = "link"
    type       = "string"
    format     = "url"
    title      = "Link"
  }
  properties {
    identifier = "orgId"
    type       = "string"
    title      = "Org ID"
  }
  properties {
    identifier = "folderId"
    type       = "string"
    title      = "Folder ID"
  }
  properties {
    identifier = "number"
    type       = "string"
    title      = "Number"
  }
  properties {
    identifier = "billingAccount"
    type       = "string"
    title      = "Billing Account"
  }
  properties {
    identifier = "labels"
    type       = "object"
    title      = "Labels"
  }
}

resource "port-labs_entity" "gcp_project_entity" {
  identifier = data.google_project.project.project_id
  title     = data.google_project.project.name
  blueprint = port-labs_blueprint.gcp_project_blueprint.identifier
  properties {
    name  = "link"
    value = "https://console.cloud.google.com/welcome?project=${data.google_project.project.project_id}"
  }
  properties {
    name  = "orgId"
    value = data.google_project.project.org_id
  }
  properties {
    name  = "folderId"
    value = data.google_project.project.folder_id
  }
  properties {
    name  = "number"
    value = data.google_project.project.number
  }
  properties {
    name  = "billingAccount"
    value = data.google_project.project.billing_account
  }
  properties {
    name  = "labels"
    value = jsonencode(data.google_project.project.labels)
  }
}
```

## Creating the Storage Bucket blueprint and the entities matching the buckets

This part includes configuring the `storageBucket` blueprint and creating the entities for the buckets:

```hcl showLineNumbers
resource "port-labs_blueprint" "gcp_bucket_blueprint" {
  title      = "Storage Bucket"
  icon       = "Bucket"
  identifier = "storageBucket"
  properties {
    identifier = "link"
    type       = "string"
    format     = "url"
    title      = "Link"
  }
  properties {
    identifier = "location"
    type       = "string"
    title      = "Location"
  }
  properties {
    identifier = "publicAccessPrevention"
    type       = "string"
    enum       = ["inherited", "enforced"]
    title      = "Public Access Prevention"
  }
  properties {
    identifier = "storageClass"
    type       = "string"
    enum       = ["STANDARD", "MULTI_REGIONAL", "REGIONAL", "NEARLINE", "COLDLINE", "ARCHIVE"]
    title      = "Storage Class"
  }
  properties {
    identifier = "uniformBucketLevelAccess"
    type       = "boolean"
    title      = "Uniform Bucket Level Access"
  }
  properties {
    identifier = "lifecycleRule"
    type       = "array"
    title      = "Lifecycle Rule"
  }
  properties {
    identifier = "encryption"
    type       = "array"
    title      = "Encryption"
  }
  properties {
    identifier = "labels"
    type       = "object"
    title      = "Labels"
  }
  relations {
    identifier = port-labs_blueprint.gcp_project_blueprint.identifier
    target = port-labs_blueprint.gcp_project_blueprint.identifier
  }
}

resource "port-labs_entity" "gcp_bucket_entity" {
  for_each = data.google_storage_bucket.my_buckets
  identifier = each.value.id
  title     = each.value.name
  blueprint = port-labs_blueprint.gcp_bucket_blueprint.identifier
  properties {
    name  = "link"
    value = "https://console.cloud.google.com/storage/browser/${each.value.id};tab=objects?project=${each.value.project}"
  }
  properties {
    name  = "location"
    value = each.value.location
  }
  properties {
    name  = "publicAccessPrevention"
    value = each.value.public_access_prevention
  }
  properties {
    name  = "storageClass"
    value = each.value.storage_class
  }
  properties {
    name  = "uniformBucketLevelAccess"
    value = each.value.uniform_bucket_level_access
  }
  properties {
    name  = "lifecycleRule"
    value = jsonencode(each.value.lifecycle_rule)
  }
  properties {
    name  = "encryption"
    value = jsonencode(each.value.encryption)
  }
  properties {
    name  = "labels"
    value = jsonencode(each.value.labels)
  }
  relations {
    name = port-labs_blueprint.gcp_project_blueprint.identifier
    identifier = each.value.project
  }
}
```

## Creating the Service Account blueprint and the entities matching the service accounts

This part includes configuring the `serviceAccount` blueprint and creating the entities for the service accounts:

```hcl showLineNumbers
resource "port-labs_blueprint" "gcp_service_account_blueprint" {
  title      = "Service Account"
  icon       = "Lock"
  identifier = "serviceAccount"
  properties {
    identifier = "link"
    type       = "string"
    format     = "url"
    title      = "Link"
  }
  properties {
    identifier = "email"
    type       = "string"
    format     = "email"
    title      = "email"
  }
  relations {
    identifier = port-labs_blueprint.gcp_project_blueprint.identifier
    target = port-labs_blueprint.gcp_project_blueprint.identifier
  }
}

resource "port-labs_entity" "gcp_service_account_entity" {
  for_each = data.google_service_account.my_accounts
  identifier = each.value.account_id
  title     = each.value.display_name
  blueprint = port-labs_blueprint.gcp_service_account_blueprint.identifier
  properties {
    name  = "link"
    value = "https://console.cloud.google.com/iam-admin/serviceaccounts/details/${each.value.unique_id}?project=${each.value.project}"
  }
  properties {
    name  = "email"
    value = each.value.email
  }
  relations {
    name = port-labs_blueprint.gcp_project_blueprint.identifier
    identifier = each.value.project
  }
}
```

## Creating the Disk blueprint and the entities matching the disks

This part includes configuring the `disk` blueprint and creating the entities for the disks:

```hcl showLineNumbers
resource "port-labs_blueprint" "gcp_disk_blueprint" {
  title      = "Disk"
  icon       = "GoogleComputeEngine"
  identifier = "disk"
  properties {
    identifier = "link"
    type       = "string"
    format     = "url"
    title      = "Link"
  }
  properties {
    identifier = "description"
    type       = "string"
    title      = "Description"
  }
  properties {
    identifier = "zone"
    type       = "string"
    title      = "Zone"
  }
  properties {
    identifier = "type"
    type       = "string"
    title      = "Type"
  }
  properties {
    identifier = "size"
    type       = "number"
    title      = "Size"
  }
  properties {
    identifier = "creationTimestamp"
    type       = "string"
    format     = "date-time"
    title      = "Creation Timestamp"
  }
  properties {
    identifier = "users"
    type       = "array"
    title      = "Users"
  }
  properties {
    identifier = "labels"
    type       = "object"
    title      = "Labels"
  }
  relations {
    identifier = port-labs_blueprint.gcp_project_blueprint.identifier
    target = port-labs_blueprint.gcp_project_blueprint.identifier
  }
}

resource "port-labs_entity" "gcp_disk_entity" {
  for_each = data.google_compute_disk.my_disks
  identifier = "${each.value.project}_${each.value.zone}_${each.value.name}"
  title     = each.value.name
  blueprint = port-labs_blueprint.gcp_disk_blueprint.identifier
  properties {
    name  = "link"
    value = "https://console.cloud.google.com/compute/disksDetail/zones/${each.value.zone}/disks/${each.value.name}?project=${each.value.project}"
  }
  properties {
    name  = "description"
    value = each.value.description
  }
  properties {
    name  = "zone"
    value = each.value.zone
  }
  properties {
    name  = "type"
    value = each.value.type
  }
  properties {
    name  = "size"
    value = each.value.size
  }
  properties {
    name  = "creationTimestamp"
    value = each.value.creation_timestamp
  }
  properties {
    name  = "users"
    items = each.value.users
  }
  properties {
    name  = "labels"
    value = jsonencode(each.value.labels)
  }
  relations {
    name = port-labs_blueprint.gcp_project_blueprint.identifier
    identifier = each.value.project
  }
}
```

## Result

After running `terraform apply` you will see the project entity, and the related `storageBucket`, `serviceAccount`, `disk` entities in Port.
