---
sidebar_position: 1
title: GCP Assets Inventory
description: Bring generic information of assets using terraform
---

# GCP Assets Inventory

In this example you are going to export some generic information about a GCP project and all of its assets, to Port.

Here is the complete `main.tf` file:

<details>
<summary>Complete Terraform definition file</summary>

```hcl showLineNumbers
terraform {
  required_providers {
    port-labs = {
      source  = "port-labs/port-labs"
      version = "~> 0.9.7"
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

resource "port-labs_blueprint" "gcp_asset_blueprint" {
  title      = "GCP Asset"
  icon       = "GCP"
  identifier = "gcpAsset"
  properties {
    identifier = "name"
    type       = "string"
    title      = "name"
  }
  properties {
    identifier = "assetType"
    type       = "string"
    title      = "Asset Type"
  }
  properties {
    identifier = "description"
    type       = "string"
    title      = "Description"
  }
  properties {
    identifier = "additionalAttributes"
    type       = "array"
    title      = "Additional Attributes"
  }
  properties {
    identifier = "location"
    type       = "string"
    title      = "Location"
  }
  properties {
    identifier = "labels"
    type       = "object"
    title      = "Labels"
  }
  properties {
    identifier = "networkTags"
    type       = "array"
    title      = "NetworkTags"
  }
  relations {
    identifier = port-labs_blueprint.gcp_project_blueprint.identifier
    target = port-labs_blueprint.gcp_project_blueprint.identifier
  }
}

resource "port-labs_entity" "gcp_asset_entity" {
  for_each = {for idx, result in data.google_cloud_asset_resources_search_all.my_assets.results: idx => result}
  title     = each.value.display_name
  blueprint = port-labs_blueprint.gcp_asset_blueprint.identifier
  properties {
    name  = "name"
    value = each.value.name
  }
  properties {
    name  = "assetType"
    value = each.value.asset_type
  }
  properties {
    name  = "description"
    value = each.value.description
  }
  properties {
    name  = "additionalAttributes"
    items = each.value.additional_attributes
  }
  properties {
    name  = "location"
    value = each.value.location
  }
  properties {
    name  = "labels"
    value = jsonencode(each.value.labels)
  }
  properties {
    name  = "networkTags"
    items = each.value.network_tags
  }
  relations {
    name = port-labs_blueprint.gcp_project_blueprint.identifier
    identifier = local.project_id
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

:::note GCP permissions
To be able to read the project and assets in this example, you need to use a GCP IAM role with at least the following permissions:

```text showLineNumbers
cloudasset.assets.searchAllResources
resourcemanager.projects.get
```

:::

Let's break down the definition file and understand the different parts:

## Module imports

This part includes importing and setting up the required Terraform providers and modules:

```hcl showLineNumbers
terraform {
  required_providers {
    port-labs = {
      source  = "port-labs/port-labs"
      version = "~> 0.9.7"
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

This part includes defining the datasource for the project and assets:

```hcl showLineNumbers
data "google_project" "project" {
  provider   = google-beta
  project_id = local.project_id
}

data "google_cloud_asset_resources_search_all" "my_assets" {
  provider = google-beta
  scope    = "projects/${local.project_id}"
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

## Creating the GCP Assets blueprint and the entities matching the assets

This part includes configuring the `gcpAssets` blueprint and creating the entities for the assets:

```hcl showLineNumbers
resource "port-labs_blueprint" "gcp_asset_blueprint" {
  title      = "GCP Asset"
  icon       = "GCP"
  identifier = "gcpAsset"
  properties {
    identifier = "name"
    type       = "string"
    title      = "name"
  }
  properties {
    identifier = "assetType"
    type       = "string"
    title      = "Asset Type"
  }
  properties {
    identifier = "description"
    type       = "string"
    title      = "Description"
  }
  properties {
    identifier = "additionalAttributes"
    type       = "array"
    title      = "Additional Attributes"
  }
  properties {
    identifier = "location"
    type       = "string"
    title      = "Location"
  }
  properties {
    identifier = "labels"
    type       = "object"
    title      = "Labels"
  }
  properties {
    identifier = "networkTags"
    type       = "array"
    title      = "NetworkTags"
  }
  relations {
    identifier = port-labs_blueprint.gcp_project_blueprint.identifier
    target = port-labs_blueprint.gcp_project_blueprint.identifier
  }
}

resource "port-labs_entity" "gcp_asset_entity" {
  for_each = {for idx, result in data.google_cloud_asset_resources_search_all.my_assets.results: idx => result}
  title     = each.value.display_name
  blueprint = port-labs_blueprint.gcp_asset_blueprint.identifier
  properties {
    name  = "name"
    value = each.value.name
  }
  properties {
    name  = "assetType"
    value = reverse(split("/", each.value.asset_type))[0]
  }
  properties {
    name  = "description"
    value = each.value.description
  }
  properties {
    name  = "additionalAttributes"
    items = each.value.additional_attributes
  }
  properties {
    name  = "location"
    value = each.value.location
  }
  properties {
    name  = "labels"
    value = jsonencode(each.value.labels)
  }
  properties {
    name  = "networkTags"
    items = each.value.network_tags
  }
  relations {
    name = port-labs_blueprint.gcp_project_blueprint.identifier
    identifier = local.project_id
  }
}
```

## Result

After running `terraform apply` you will see the project entity, and the related `gcpAssets` entities in Port.
