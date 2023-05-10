---
sidebar_position: 2
title: Resource Metadata for Specific Asset
description: Bring assets with specific resource metadata using terraform
---

# Resource Metadata for Specific Asset

In this example you are going to learn how to export GCP project's specific assets, with extended metadata for the matching asset type.

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
  asset_types = [
    "storage.googleapis.com/Bucket",
    "iam.googleapis.com/ServiceAccount",
    "compute.googleapis.com/Disk",
    "redis.googleapis.com/Instance",
    "compute.googleapis.com/Instance",
    "run.googleapis.com/Service",
    "container.googleapis.com/Cluster"
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

data "google_redis_instance" "my_memorystores" {
  provider = google-beta
  for_each = {for idx, result in data.google_cloud_asset_resources_search_all.my_assets.results : idx => result if result.asset_type == "redis.googleapis.com/Instance"}
  name     = reverse(split("/", each.value.name))[0]
  region   = each.value.location
}

data "google_compute_instance" "my_compute_instances" {
  provider = google-beta
  for_each = {for idx, result in data.google_cloud_asset_resources_search_all.my_assets.results : idx => result if result.asset_type == "compute.googleapis.com/Instance"}
  name     = reverse(split("/", each.value.name))[0]
  zone     = each.value.location
}

data "google_cloud_run_service" "my_run_services" {
  provider = google-beta
  for_each = {for idx, result in data.google_cloud_asset_resources_search_all.my_assets.results : idx => result if result.asset_type == "run.googleapis.com/Service"}
  name     = reverse(split("/", each.value.name))[0]
  location = each.value.location
}

data "google_container_cluster" "my_container_clusters" {
  provider = google-beta
  for_each = {for idx, result in data.google_cloud_asset_resources_search_all.my_assets.results : idx => result if result.asset_type == "container.googleapis.com/Cluster"}
  name     = reverse(split("/", each.value.name))[0]
  location = each.value.location
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

resource "port-labs_blueprint" "gcp_memorystore_blueprint" {
  title      = "Memorystore"
  icon       = "Bucket"
  identifier = "memorystore"
  properties {
    identifier = "link"
    type       = "string"
    format     = "url"
    title      = "Link"
  }
  properties {
    identifier = "region"
    type       = "string"
    title      = "Region"
  }
  properties {
    identifier = "currentLocationId"
    type       = "string"
    title      = "Current Location ID"
  }
  properties {
    identifier = "memorySizeGb"
    type       = "number"
    title      = "Memory Size GB"
  }
  properties {
    identifier = "replicaCount"
    type       = "number"
    title      = "Replica Count"
  }
  properties {
    identifier = "redisVersion"
    type       = "string"
    title      = "Redis Version"
  }
  properties {
    identifier = "tier"
    type       = "string"
    enum       = ["BASIC", "STANDARD_HA"]
    title      = "Public Access Prevention"
  }
  properties {
    identifier = "readReplicasMode"
    type       = "string"
    enum       = ["READ_REPLICAS_DISABLED", "READ_REPLICAS_ENABLED"]
    title      = "Read Replicas Mode"
  }
  properties {
    identifier = "connectMode"
    type       = "string"
    enum       = ["DIRECT_PEERING", "PRIVATE_SERVICE_ACCESS"]
    title      = "Connect Mode"
  }
  properties {
    identifier = "createTime"
    type       = "string"
    format     = "date-time"
    title      = "Create Time"
  }
  properties {
    identifier = "authorizedNetwork"
    type       = "string"
    title      = "Authorized Network"
  }
  properties {
    identifier = "nodes"
    type       = "array"
    title      = "Nodes"
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

resource "port-labs_entity" "gcp_memorystore_entity" {
  for_each = data.google_redis_instance.my_memorystores
  identifier = "${each.value.project}_${each.value.location_id}_${each.value.name}"
  title     = each.value.name
  blueprint = port-labs_blueprint.gcp_memorystore_blueprint.identifier
  properties {
    name  = "link"
    value = "https://console.cloud.google.com/memorystore/redis/locations/${each.value.region}/instances/${each.value.name}/details/overview?project=${each.value.project}"
  }
  properties {
    name  = "region"
    value = each.value.region
  }
  properties {
    name  = "currentLocationId"
    value = each.value.current_location_id
  }
  properties {
    name  = "memorySizeGb"
    value = each.value.memory_size_gb
  }
  properties {
    name  = "replicaCount"
    value = each.value.replica_count
  }
  properties {
    name  = "redisVersion"
    value = each.value.redis_version
  }
  properties {
    name  = "tier"
    value = each.value.tier
  }
  properties {
    name  = "readReplicasMode"
    value = each.value.read_replicas_mode
  }
  properties {
    name  = "connectMode"
    value = each.value.connect_mode
  }
  properties {
    name  = "createTime"
    value = each.value.create_time
  }
  properties {
    name  = "authorizedNetwork"
    value = each.value.authorized_network
  }
  properties {
    name  = "nodes"
    items = [for item in each.value.nodes: jsonencode(item)]
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

resource "port-labs_blueprint" "gcp_compute_instance_blueprint" {
  title      = "Compute Instance"
  icon       = "GoogleComputeEngine"
  identifier = "computeInstance"
  properties {
    identifier = "link"
    type       = "string"
    format     = "url"
    title      = "Link"
  }
  properties {
    identifier = "zone"
    type       = "string"
    title      = "Zone"
  }
  properties {
    identifier = "description"
    type       = "string"
    title      = "Description"
  }
  properties {
    identifier  = "currentStatus"
    type        = "string"
    enum        = ["PROVISIONING", "STAGING", "RUNNING", "STOPPING", "REPAIRING", "TERMINATED", "SUSPENDING", "SUSPENDED"]
    enum_colors = {
      PROVISIONING = "blue"
      STAGING    = "blue"
      RUNNING    = "green"
      STOPPING   = "red"
      REPAIRING  = "yellow"
      TERMINATED = "red"
      SUSPENDING  = "yellow"
      SUSPENDED  = "lightGray"
    }
    title      = "Current Status"
  }
  properties {
    identifier = "machineType"
    type       = "string"
    title      = "Machine Type"
  }
  properties {
    identifier = "cpuPlatform"
    type       = "string"
    title      = "CPU Platform"
  }
  properties {
    identifier = "deletionProtection"
    type       = "boolean"
    title      = "Deletion Protection"
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

resource "port-labs_entity" "gcp_compute_instance_entity" {
  for_each = data.google_compute_instance.my_compute_instances
  identifier = "${each.value.project}_${each.value.zone}_${each.value.name}"
  title     = each.value.name
  blueprint = port-labs_blueprint.gcp_compute_instance_blueprint.identifier
  properties {
    name  = "link"
    value = "https://console.cloud.google.com/compute/instancesDetail/zones/${each.value.zone}/instances/${each.value.name}?project=${each.value.project}"
  }
  properties {
    name  = "zone"
    value = each.value.zone
  }
  properties {
    name  = "description"
    value = each.value.description
  }
  properties {
    name  = "currentStatus"
    value = each.value.current_status
  }
  properties {
    name  = "machineType"
    value = each.value.machine_type
  }
  properties {
    name  = "cpuPlatform"
    value = each.value.cpu_platform
  }
  properties {
    name  = "deletionProtection"
    value = each.value.deletion_protection
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

resource "port-labs_blueprint" "gcp_run_service_blueprint" {
  title      = "Run Service"
  icon       = "Service"
  identifier = "runService"
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
    identifier = "metadata"
    type       = "array"
    title      = "Metadata"
  }
  properties {
    identifier = "status"
    type       = "array"
    title      = "Status"
  }
  properties {
    identifier = "template"
    type       = "array"
    title      = "Template"
  }
  properties {
    identifier = "traffic"
    type       = "array"
    title      = "Traffic"
  }
  relations {
    identifier = port-labs_blueprint.gcp_project_blueprint.identifier
    target = port-labs_blueprint.gcp_project_blueprint.identifier
  }
}

resource "port-labs_entity" "gcp_run_service_entity" {
  for_each = data.google_cloud_run_service.my_run_services
  identifier = "${each.value.project}_${each.value.location}_${each.value.name}"
  title     = each.value.name
  blueprint = port-labs_blueprint.gcp_run_service_blueprint.identifier
  properties {
    name  = "link"
    value = "https://console.cloud.google.com/run/detail/${each.value.location}/${each.value.name}?project=${each.value.project}"
  }
  properties {
    name  = "location"
    value = each.value.location
  }
  properties {
    name  = "metadata"
    items = [for item in each.value.metadata: jsonencode(item)]
  }
  properties {
    name  = "status"
    items = [for item in each.value.status: jsonencode(item)]
  }
  properties {
    name  = "template"
    items = [for item in each.value.template: jsonencode(item)]
  }
  properties {
    name  = "traffic"
    items = [for item in each.value.traffic: jsonencode(item)]
  }
  relations {
    name = port-labs_blueprint.gcp_project_blueprint.identifier
    identifier = each.value.project
  }
}

resource "port-labs_blueprint" "gcp_container_cluster_blueprint" {
  title      = "Container Cluster"
  icon       = "Cluster"
  identifier = "containerCluster"
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
    identifier = "description"
    type       = "string"
    title      = "Description"
  }
  properties {
    identifier = "masterVersion"
    type       = "string"
    title      = "Master Version"
  }
  properties {
    identifier = "enableAutopilot"
    type       = "boolean"
    title      = "Enable Autopilot"
  }
  properties {
    identifier = "addonsConfig"
    type       = "array"
    title      = "Addons Config"
  }
  properties {
    identifier = "clusterAutoscaling"
    type       = "array"
    title      = "Cluster Autoscaling"
  }
  properties {
    identifier = "network"
    type       = "string"
    title      = "Network"
  }
  relations {
    identifier = port-labs_blueprint.gcp_project_blueprint.identifier
    target = port-labs_blueprint.gcp_project_blueprint.identifier
  }
}

resource "port-labs_entity" "gcp_container_cluster_entity" {
  for_each = data.google_container_cluster.my_container_clusters
  identifier = "${each.value.project}_${each.value.location}_${each.value.name}"
  title     = each.value.name
  blueprint = port-labs_blueprint.gcp_container_cluster_blueprint.identifier
  properties {
    name  = "link"
    value = "https://console.cloud.google.com/kubernetes/clusters/details/${each.value.location}/${each.value.name}?project=${each.value.project}"
  }
  properties {
    name  = "location"
    value = each.value.location
  }
  properties {
    name  = "description"
    value = each.value.description
  }
  properties {
    name  = "masterVersion"
    value = each.value.master_version
  }
  properties {
    name  = "enableAutopilot"
    value = each.value.enable_autopilot
  }
  properties {
    name  = "addonsConfig"
    items = [for item in each.value.addons_config: jsonencode(item)]
  }
  properties {
    name  = "clusterAutoscaling"
    items = [for item in each.value.cluster_autoscaling: jsonencode(item)]
  }
  properties {
    name  = "network"
    value = each.value.network
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

:::note GCP permissions
To be able to read the all the types of assets in this example, you need to use a GCP IAM role with at least the following permissions:

```text showLineNumbers
cloudasset.assets.searchAllResources
compute.disks.get
compute.instanceGroupManagers.get
compute.instances.get
container.clusters.get
iam.serviceAccounts.get
redis.instances.get
resourcemanager.projects.get
run.services.get
storage.buckets.get
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

This part includes defining the datasource for the project and specific assets (`buckets`, `service accounts`, `disks`, `memorystores`, `compute instances`, `run services`, `container clusters`):

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
    "compute.googleapis.com/Disk",
    "redis.googleapis.com/Instance",
    "compute.googleapis.com/Instance",
    "run.googleapis.com/Service",
    "container.googleapis.com/Cluster"
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

data "google_redis_instance" "my_memorystores" {
  provider = google-beta
  for_each = {for idx, result in data.google_cloud_asset_resources_search_all.my_assets.results : idx => result if result.asset_type == "redis.googleapis.com/Instance"}
  name     = reverse(split("/", each.value.name))[0]
  region   = each.value.location
}

data "google_compute_instance" "my_compute_instances" {
  provider = google-beta
  for_each = {for idx, result in data.google_cloud_asset_resources_search_all.my_assets.results : idx => result if result.asset_type == "compute.googleapis.com/Instance"}
  name     = reverse(split("/", each.value.name))[0]
  zone     = each.value.location
}

data "google_cloud_run_service" "my_run_services" {
  provider = google-beta
  for_each = {for idx, result in data.google_cloud_asset_resources_search_all.my_assets.results : idx => result if result.asset_type == "run.googleapis.com/Service"}
  name     = reverse(split("/", each.value.name))[0]
  location = each.value.location
}

data "google_container_cluster" "my_container_clusters" {
  provider = google-beta
  for_each = {for idx, result in data.google_cloud_asset_resources_search_all.my_assets.results : idx => result if result.asset_type == "container.googleapis.com/Cluster"}
  name     = reverse(split("/", each.value.name))[0]
  location = each.value.location
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

## Creating the Memorystore blueprint and the entities matching the memorystores

This part includes configuring the `memorystore` blueprint and creating the entities for the memorystores:

```hcl showLineNumbers
resource "port-labs_blueprint" "gcp_memorystore_blueprint" {
  title      = "Memorystore"
  icon       = "Bucket"
  identifier = "memorystore"
  properties {
    identifier = "link"
    type       = "string"
    format     = "url"
    title      = "Link"
  }
  properties {
    identifier = "region"
    type       = "string"
    title      = "Region"
  }
  properties {
    identifier = "currentLocationId"
    type       = "string"
    title      = "Current Location ID"
  }
  properties {
    identifier = "memorySizeGb"
    type       = "number"
    title      = "Memory Size GB"
  }
  properties {
    identifier = "replicaCount"
    type       = "number"
    title      = "Replica Count"
  }
  properties {
    identifier = "redisVersion"
    type       = "string"
    title      = "Redis Version"
  }
  properties {
    identifier = "tier"
    type       = "string"
    enum       = ["BASIC", "STANDARD_HA"]
    title      = "Public Access Prevention"
  }
  properties {
    identifier = "readReplicasMode"
    type       = "string"
    enum       = ["READ_REPLICAS_DISABLED", "READ_REPLICAS_ENABLED"]
    title      = "Read Replicas Mode"
  }
  properties {
    identifier = "connectMode"
    type       = "string"
    enum       = ["DIRECT_PEERING", "PRIVATE_SERVICE_ACCESS"]
    title      = "Connect Mode"
  }
  properties {
    identifier = "createTime"
    type       = "string"
    format     = "date-time"
    title      = "Create Time"
  }
  properties {
    identifier = "authorizedNetwork"
    type       = "string"
    title      = "Authorized Network"
  }
  properties {
    identifier = "nodes"
    type       = "array"
    title      = "Nodes"
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

resource "port-labs_entity" "gcp_memorystore_entity" {
  for_each = data.google_redis_instance.my_memorystores
  identifier = "${each.value.project}_${each.value.location_id}_${each.value.name}"
  title     = each.value.name
  blueprint = port-labs_blueprint.gcp_memorystore_blueprint.identifier
  properties {
    name  = "link"
    value = "https://console.cloud.google.com/memorystore/redis/locations/${each.value.region}/instances/${each.value.name}/details/overview?project=${each.value.project}"
  }
  properties {
    name  = "region"
    value = each.value.region
  }
  properties {
    name  = "currentLocationId"
    value = each.value.current_location_id
  }
  properties {
    name  = "memorySizeGb"
    value = each.value.memory_size_gb
  }
  properties {
    name  = "replicaCount"
    value = each.value.replica_count
  }
  properties {
    name  = "redisVersion"
    value = each.value.redis_version
  }
  properties {
    name  = "tier"
    value = each.value.tier
  }
  properties {
    name  = "readReplicasMode"
    value = each.value.read_replicas_mode
  }
  properties {
    name  = "connectMode"
    value = each.value.connect_mode
  }
  properties {
    name  = "createTime"
    value = each.value.create_time
  }
  properties {
    name  = "authorizedNetwork"
    value = each.value.authorized_network
  }
  properties {
    name  = "nodes"
    items = [for item in each.value.nodes: jsonencode(item)]
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

## Creating the Compute Instance blueprint and the entities matching the compute-instances

This part includes configuring the `computeInstance` blueprint and creating the entities for the compute-instances:

```hcl showLineNumbers
resource "port-labs_blueprint" "gcp_compute_instance_blueprint" {
  title      = "Compute Instance"
  icon       = "GoogleComputeEngine"
  identifier = "computeInstance"
  properties {
    identifier = "link"
    type       = "string"
    format     = "url"
    title      = "Link"
  }
  properties {
    identifier = "zone"
    type       = "string"
    title      = "Zone"
  }
  properties {
    identifier = "description"
    type       = "string"
    title      = "Description"
  }
  properties {
    identifier  = "currentStatus"
    type        = "string"
    enum        = ["PROVISIONING", "STAGING", "RUNNING", "STOPPING", "REPAIRING", "TERMINATED", "SUSPENDING", "SUSPENDED"]
    enum_colors = {
      PROVISIONING = "blue"
      STAGING    = "blue"
      RUNNING    = "green"
      STOPPING   = "red"
      REPAIRING  = "yellow"
      TERMINATED = "red"
      SUSPENDING  = "yellow"
      SUSPENDED  = "lightGray"
    }
    title      = "Current Status"
  }
  properties {
    identifier = "machineType"
    type       = "string"
    title      = "Machine Type"
  }
  properties {
    identifier = "cpuPlatform"
    type       = "string"
    title      = "CPU Platform"
  }
  properties {
    identifier = "deletionProtection"
    type       = "boolean"
    title      = "Deletion Protection"
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

resource "port-labs_entity" "gcp_compute_instance_entity" {
  for_each = data.google_compute_instance.my_compute_instances
  identifier = "${each.value.project}_${each.value.zone}_${each.value.name}"
  title     = each.value.name
  blueprint = port-labs_blueprint.gcp_compute_instance_blueprint.identifier
  properties {
    name  = "link"
    value = "https://console.cloud.google.com/compute/instancesDetail/zones/${each.value.zone}/instances/${each.value.name}?project=${each.value.project}"
  }
  properties {
    name  = "zone"
    value = each.value.zone
  }
  properties {
    name  = "description"
    value = each.value.description
  }
  properties {
    name  = "currentStatus"
    value = each.value.current_status
  }
  properties {
    name  = "machineType"
    value = each.value.machine_type
  }
  properties {
    name  = "cpuPlatform"
    value = each.value.cpu_platform
  }
  properties {
    name  = "deletionProtection"
    value = each.value.deletion_protection
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

## Creating the Run Service blueprint and the entities matching the run services

This part includes configuring the `runService` blueprint and creating the entities for the run services:

```hcl showLineNumbers
resource "port-labs_blueprint" "gcp_run_service_blueprint" {
  title      = "Run Service"
  icon       = "Service"
  identifier = "runService"
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
    identifier = "metadata"
    type       = "array"
    title      = "Metadata"
  }
  properties {
    identifier = "status"
    type       = "array"
    title      = "Status"
  }
  properties {
    identifier = "template"
    type       = "array"
    title      = "Template"
  }
  properties {
    identifier = "traffic"
    type       = "array"
    title      = "Traffic"
  }
  relations {
    identifier = port-labs_blueprint.gcp_project_blueprint.identifier
    target = port-labs_blueprint.gcp_project_blueprint.identifier
  }
}

resource "port-labs_entity" "gcp_run_service_entity" {
  for_each = data.google_cloud_run_service.my_run_services
  identifier = "${each.value.project}_${each.value.location}_${each.value.name}"
  title     = each.value.name
  blueprint = port-labs_blueprint.gcp_run_service_blueprint.identifier
  properties {
    name  = "link"
    value = "https://console.cloud.google.com/run/detail/${each.value.location}/${each.value.name}?project=${each.value.project}"
  }
  properties {
    name  = "location"
    value = each.value.location
  }
  properties {
    name  = "metadata"
    items = [for item in each.value.metadata: jsonencode(item)]
  }
  properties {
    name  = "status"
    items = [for item in each.value.status: jsonencode(item)]
  }
  properties {
    name  = "template"
    items = [for item in each.value.template: jsonencode(item)]
  }
  properties {
    name  = "traffic"
    items = [for item in each.value.traffic: jsonencode(item)]
  }
  relations {
    name = port-labs_blueprint.gcp_project_blueprint.identifier
    identifier = each.value.project
  }
}
```

## Creating the Container Cluster blueprint and the entities matching the container clusters

This part includes configuring the `containerCluster` blueprint and creating the entities for the container clusters:

```hcl showLineNumbers
resource "port-labs_blueprint" "gcp_container_cluster_blueprint" {
  title      = "Container Cluster"
  icon       = "Cluster"
  identifier = "containerCluster"
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
    identifier = "description"
    type       = "string"
    title      = "Description"
  }
  properties {
    identifier = "masterVersion"
    type       = "string"
    title      = "Master Version"
  }
  properties {
    identifier = "enableAutopilot"
    type       = "boolean"
    title      = "Enable Autopilot"
  }
  properties {
    identifier = "addonsConfig"
    type       = "array"
    title      = "Addons Config"
  }
  properties {
    identifier = "clusterAutoscaling"
    type       = "array"
    title      = "Cluster Autoscaling"
  }
  properties {
    identifier = "network"
    type       = "string"
    title      = "Network"
  }
  relations {
    identifier = port-labs_blueprint.gcp_project_blueprint.identifier
    target = port-labs_blueprint.gcp_project_blueprint.identifier
  }
}

resource "port-labs_entity" "gcp_container_cluster_entity" {
  for_each = data.google_container_cluster.my_container_clusters
  identifier = "${each.value.project}_${each.value.location}_${each.value.name}"
  title     = each.value.name
  blueprint = port-labs_blueprint.gcp_container_cluster_blueprint.identifier
  properties {
    name  = "link"
    value = "https://console.cloud.google.com/kubernetes/clusters/details/${each.value.location}/${each.value.name}?project=${each.value.project}"
  }
  properties {
    name  = "location"
    value = each.value.location
  }
  properties {
    name  = "description"
    value = each.value.description
  }
  properties {
    name  = "masterVersion"
    value = each.value.master_version
  }
  properties {
    name  = "enableAutopilot"
    value = each.value.enable_autopilot
  }
  properties {
    name  = "addonsConfig"
    items = [for item in each.value.addons_config: jsonencode(item)]
  }
  properties {
    name  = "clusterAutoscaling"
    items = [for item in each.value.cluster_autoscaling: jsonencode(item)]
  }
  properties {
    name  = "network"
    value = each.value.network
  }
  relations {
    name = port-labs_blueprint.gcp_project_blueprint.identifier
    identifier = each.value.project
  }
}
```

## Result

After running `terraform apply` you will see the project entity, and the related `storageBucket`, `serviceAccount`, `disk`, `memorystore`, `computeInstance`, `runService`, `containerCluster` entities in Port.
