---
sidebar_position: 1
title: GCP Assets Inventory
description: Bring generic information of assets using terraform
---

# GCP Assets Inventory

In this example you are going to export some generic information about a GCP organization and all of its assets, to Port.

Here is the complete `main.tf` file:

<details>
<summary>Complete Terraform definition file</summary>

```hcl showLineNumbers
terraform {
  required_providers {
    port = {
      source  = "port-labs/port-labs"
      version = "~> 1.0.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = ">= 3.53, < 5.0"
    }
  }
}

locals {
  domain = "GCP_ORGANIZATION_DOMAIN_NAME" # set the organization's domain
}

provider "port" {
  client_id = "PORT_CLIENT_ID"     # or set the env var PORT_CLIENT_ID
  secret    = "PORT_CLIENT_SECRET" # or set the env var PORT_CLIENT_SECRET
}

provider "google-beta" {
  credentials = "GOOGLE_APPLICATION_CREDENTIALS" # or set the env var GOOGLE_APPLICATION_CREDENTIALS
}

data "google_organization" "my_org" {
  provider   = google-beta
  domain = local.domain
}

data "google_cloud_asset_resources_search_all" "my_folder_assets" {
  provider = google-beta
  scope    = "organizations/${data.google_organization.my_org.org_id}"
  asset_types = [
    "cloudresourcemanager.googleapis.com/Folder"
  ]
}

data "google_folder" "my_folders" {
  for_each = {for idx, result in data.google_cloud_asset_resources_search_all.my_folder_assets.results : idx => result}
  folder = "folders/${reverse(split("/", each.value.name))[0]}"
}

data "google_projects" "my_projects" {
  provider   = google-beta
  filter = "parent.id:*"
}

data "google_cloud_asset_resources_search_all" "my_assets" {
  for_each = {for idx, result in data.google_projects.my_projects.projects: idx => result}
  provider = google-beta
  scope    = "projects/${each.value.project_id}"
}

resource "port_blueprint" "gcp_org_blueprint" {
  title      = "Organization"
  icon       = "GCP"
  identifier = "organization"
  properties {
    identifier = "link"
    type       = "string"
    format     = "url"
    title      = "Link"
  }
  properties {
    identifier = "createTime"
    type       = "string"
    format     = "date-time"
    title      = "Create Time"
  }
}

resource "port_entity" "gcp_org_entity" {
  identifier = data.google_organization.my_org.org_id
  title     = data.google_organization.my_org.domain
  blueprint = port_blueprint.gcp_org_blueprint.identifier
  properties {
    name  = "link"
    value = "https://console.cloud.google.com/welcome?organizationId=${data.google_organization.my_org.org_id}"
  }
  properties {
    name  = "createTime"
    value = data.google_organization.my_org.create_time
  }
}

resource "port_blueprint" "gcp_folder_blueprint" {
  title      = "Folder"
  icon       = "GCP"
  identifier = "folder"
  properties {
    identifier = "link"
    type       = "string"
    format     = "url"
    title      = "Link"
  }
  properties {
    identifier = "createTime"
    type       = "string"
    format     = "date-time"
    title      = "Create Time"
  }
  relations {
    identifier = port_blueprint.gcp_org_blueprint.identifier
    target = port_blueprint.gcp_org_blueprint.identifier
  }
}

resource "port_entity" "gcp_folder_entity" {
  for_each = {for idx, folder in data.google_folder.my_folders: idx => folder}
  identifier = each.value.folder_id
  title     = each.value.display_name
  blueprint = port_blueprint.gcp_folder_blueprint.identifier
  properties {
    name  = "link"
    value = "https://console.cloud.google.com/welcome?folder=${each.value.folder_id}"
  }
  properties {
    name  = "createTime"
    value = each.value.create_time
  }
  relations {
    name = port_blueprint.gcp_org_blueprint.identifier
    identifier = data.google_organization.my_org.org_id
  }
}

resource "port_blueprint" "gcp_project_blueprint" {
  title      = "Project"
  icon       = "GCP"
  identifier = "project"
  properties {
    identifier = "link"
    type       = "string"
    format     = "url"
    title      = "Link"
  }
  properties {
    identifier = "number"
    type       = "string"
    title      = "Number"
  }
  properties {
    identifier = "createTime"
    type       = "string"
    format     = "date-time"
    title      = "Create Time"
  }
  properties {
    identifier = "labels"
    type       = "object"
    title      = "Labels"
  }
  relations {
    identifier = port_blueprint.gcp_org_blueprint.identifier
    target = port_blueprint.gcp_org_blueprint.identifier
  }
  relations {
    identifier = port_blueprint.gcp_folder_blueprint.identifier
    target = port_blueprint.gcp_folder_blueprint.identifier
  }
}

resource "port_entity" "gcp_project_entity" {
  for_each = {for idx, project in data.google_projects.my_projects.projects : idx => project}
  identifier = each.value.project_id
  title     = each.value.name
  blueprint = port_blueprint.gcp_project_blueprint.identifier
  properties {
    name  = "link"
    value = "https://console.cloud.google.com/welcome?project=${each.value.project_id}"
  }
  properties {
    name  = "number"
    value = each.value.number
  }
  properties {
    name  = "createTime"
    value = each.value.create_time
  }
  properties {
    name  = "labels"
    value = jsonencode(each.value.labels)
  }
  dynamic "relations" {
    for_each = each.value.parent.type == "organization" ? [1] : []
    content {
      name = port_blueprint.gcp_org_blueprint.identifier
      identifier = each.value.parent.id
    }
  }
  dynamic "relations" {
    for_each = each.value.parent.type == "folder" ? [1] : []
    content {
      name = port_blueprint.gcp_folder_blueprint.identifier
      identifier = each.value.parent.id
    }
  }
  depends_on = [port_entity.gcp_org_entity, port_entity.gcp_folder_entity]
}

resource "port_blueprint" "gcp_asset_blueprint" {
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
    identifier = port_blueprint.gcp_project_blueprint.identifier
    target = port_blueprint.gcp_project_blueprint.identifier
  }
}

resource "port_entity" "gcp_asset_entity" {
  for_each = {for idx, result in flatten(values({for idx, project_assets in data.google_cloud_asset_resources_search_all.my_assets: idx => [for result in project_assets.results : merge(result, {project_id: project_assets.id})]})) : idx => result}
  title     = each.value.display_name == "" ? reverse(split("/", each.value.name))[0] : each.value.display_name
  blueprint = port_blueprint.gcp_asset_blueprint.identifier
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
    name = port_blueprint.gcp_project_blueprint.identifier
    identifier = reverse(split("/", each.value.project_id))[0]
  }

  depends_on = [port_entity.gcp_project_entity]
}
```

</details>

To use this example yourself, simply replace the placeholders for `domain`, `client_id`, `secret` and `credentials` and then run the following commands to setup your new backend, create the new infrastructure and update the software catalog:

```shell showLineNumbers
# install modules and create an initial state
terraform init
# To view Terraform's planned changes based on your .tf definition file:
terraform plan
# To apply the changes and update the catalog
terraform apply
```

:::note GCP permissions
To be able to read the organization, folders, projects and assets in this example, you need to use an organization's GCP IAM role with at least the following permissions:

```text showLineNumbers
cloudasset.assets.searchAllResources
resourcemanager.folders.get
resourcemanager.folders.list
resourcemanager.organizations.get
resourcemanager.projects.get
```

:::

Let's break down the definition file and understand the different parts:

## Module imports

This part includes importing and setting up the required Terraform providers and modules:

```hcl showLineNumbers
terraform {
  required_providers {
    port = {
      source  = "port-labs/port-labs"
      version = "~> 1.0.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = ">= 3.53, < 5.0"
    }
  }
}

locals {
  domain = "GCP_ORGANIZATION_DOMAIN_NAME" # set the organization's domain
}

provider "port" {
  client_id = "PORT_CLIENT_ID"     # or set the env var PORT_CLIENT_ID
  secret    = "PORT_CLIENT_SECRET" # or set the env var PORT_CLIENT_SECRET
}

provider "google-beta" {
  credentials = "GOOGLE_APPLICATION_CREDENTIALS" # or set the env var GOOGLE_APPLICATION_CREDENTIALS
}
```

## Extracting the organization, folders, projects and assets

This part includes defining the datasource for the organization, folders, projects and assets:

```hcl showLineNumbers
data "google_organization" "my_org" {
  provider   = google-beta
  domain = local.domain
}

data "google_cloud_asset_resources_search_all" "my_folder_assets" {
  provider = google-beta
  scope    = "organizations/${data.google_organization.my_org.org_id}"
  asset_types = [
    "cloudresourcemanager.googleapis.com/Folder"
  ]
}

data "google_folder" "my_folders" {
  for_each = {for idx, result in data.google_cloud_asset_resources_search_all.my_folder_assets.results : idx => result}
  folder = "folders/${reverse(split("/", each.value.name))[0]}"
}

data "google_projects" "my_projects" {
  provider   = google-beta
  filter = "parent.id:*"
}

data "google_cloud_asset_resources_search_all" "my_assets" {
  for_each = {for idx, result in data.google_projects.my_projects.projects: idx => result}
  provider = google-beta
  scope    = "projects/${each.value.project_id}"
}
```

## Creating the Organization blueprint and the entity matching the organization

This part includes configuring the `organization` blueprint and creating an entity for the organization:

```hcl showLineNumbers
resource "port_blueprint" "gcp_org_blueprint" {
  title      = "Organization"
  icon       = "GCP"
  identifier = "organization"
  properties {
    identifier = "link"
    type       = "string"
    format     = "url"
    title      = "Link"
  }
  properties {
    identifier = "createTime"
    type       = "string"
    format     = "date-time"
    title      = "Create Time"
  }
}

resource "port_entity" "gcp_org_entity" {
  identifier = data.google_organization.my_org.org_id
  title     = data.google_organization.my_org.domain
  blueprint = port_blueprint.gcp_org_blueprint.identifier
  properties {
    name  = "link"
    value = "https://console.cloud.google.com/welcome?organizationId=${data.google_organization.my_org.org_id}"
  }
  properties {
    name  = "createTime"
    value = data.google_organization.my_org.create_time
  }
}
```

## Creating the Folder blueprint and the entities matching the folders

This part includes configuring the `folder` blueprint and creating an entities for the folders:

```hcl showLineNumbers
resource "port_blueprint" "gcp_folder_blueprint" {
  title      = "Folder"
  icon       = "GCP"
  identifier = "folder"
  properties {
    identifier = "link"
    type       = "string"
    format     = "url"
    title      = "Link"
  }
  properties {
    identifier = "createTime"
    type       = "string"
    format     = "date-time"
    title      = "Create Time"
  }
  relations {
    identifier = port_blueprint.gcp_org_blueprint.identifier
    target = port_blueprint.gcp_org_blueprint.identifier
  }
}

resource "port_entity" "gcp_folder_entity" {
  for_each = {for idx, folder in data.google_folder.my_folders: idx => folder}
  identifier = each.value.folder_id
  title     = each.value.display_name
  blueprint = port_blueprint.gcp_folder_blueprint.identifier
  properties {
    name  = "link"
    value = "https://console.cloud.google.com/welcome?folder=${each.value.folder_id}"
  }
  properties {
    name  = "createTime"
    value = each.value.create_time
  }
  relations {
    name = port_blueprint.gcp_org_blueprint.identifier
    identifier = data.google_organization.my_org.org_id
  }
}
```

## Creating the Project blueprint and the entities matching the projects

This part includes configuring the `project` blueprint and creating an entities for the projects:

```hcl showLineNumbers
resource "port_blueprint" "gcp_project_blueprint" {
  title      = "Project"
  icon       = "GCP"
  identifier = "project"
  properties {
    identifier = "link"
    type       = "string"
    format     = "url"
    title      = "Link"
  }
  properties {
    identifier = "number"
    type       = "string"
    title      = "Number"
  }
  properties {
    identifier = "createTime"
    type       = "string"
    format     = "date-time"
    title      = "Create Time"
  }
  properties {
    identifier = "labels"
    type       = "object"
    title      = "Labels"
  }
  relations {
    identifier = port_blueprint.gcp_org_blueprint.identifier
    target = port_blueprint.gcp_org_blueprint.identifier
  }
  relations {
    identifier = port_blueprint.gcp_folder_blueprint.identifier
    target = port_blueprint.gcp_folder_blueprint.identifier
  }
}

resource "port_entity" "gcp_project_entity" {
  for_each = {for idx, project in data.google_projects.my_projects.projects : idx => project}
  identifier = each.value.project_id
  title     = each.value.name
  blueprint = port_blueprint.gcp_project_blueprint.identifier
  properties {
    name  = "link"
    value = "https://console.cloud.google.com/welcome?project=${each.value.project_id}"
  }
  properties {
    name  = "number"
    value = each.value.number
  }
  properties {
    name  = "createTime"
    value = each.value.create_time
  }
  properties {
    name  = "labels"
    value = jsonencode(each.value.labels)
  }
  dynamic "relations" {
    for_each = each.value.parent.type == "organization" ? [1] : []
    content {
      name = port_blueprint.gcp_org_blueprint.identifier
      identifier = each.value.parent.id
    }
  }
  dynamic "relations" {
    for_each = each.value.parent.type == "folder" ? [1] : []
    content {
      name = port_blueprint.gcp_folder_blueprint.identifier
      identifier = each.value.parent.id
    }
  }
  depends_on = [port_entity.gcp_org_entity, port_entity.gcp_folder_entity]
}
```

## Creating the GCP Assets blueprint and the entities matching the assets

This part includes configuring the `gcpAssets` blueprint and creating the entities for the assets:

```hcl showLineNumbers
resource "port_blueprint" "gcp_asset_blueprint" {
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
    identifier = port_blueprint.gcp_project_blueprint.identifier
    target = port_blueprint.gcp_project_blueprint.identifier
  }
}

resource "port_entity" "gcp_asset_entity" {
  for_each = {for idx, result in flatten(values({for idx, project_assets in data.google_cloud_asset_resources_search_all.my_assets: idx => [for result in project_assets.results : merge(result, {project_id: project_assets.id})]})) : idx => result}
  title     = each.value.display_name == "" ? reverse(split("/", each.value.name))[0] : each.value.display_name
  blueprint = port_blueprint.gcp_asset_blueprint.identifier
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
    name = port_blueprint.gcp_project_blueprint.identifier
    identifier = reverse(split("/", each.value.project_id))[0]
  }

  depends_on = [port_entity.gcp_project_entity]
}
```

## Result

After running `terraform apply` you will see the organization, folders, projects, and `gcpAssets` entities in Port.
