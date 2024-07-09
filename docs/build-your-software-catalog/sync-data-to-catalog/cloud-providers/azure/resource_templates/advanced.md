---
sidebar_position: 1
---

# Advanced Templates

import StorageAccountBlueprint from './storage/\_storage_account_blueprint.mdx'
import StorageContainerBlueprint from './storage/\_storage_container_blueprint.mdx'
import StorageAppConfig from './storage/\_port_app_config.mdx'

import ResourcesAppConfig from './compute_resources/\_port_app_config.mdx'
import AKSBlueprint from './compute_resources/\_aks_blueprint.mdx'
import ContainerAppBlueprint from './compute_resources/\_container_app_blueprint.mdx'
import LoadBalancerBlueprint from './compute_resources/\_load_balancer_blueprint.mdx'
import VirtualMachineBlueprint from './compute_resources/\_virtual_machine_blueprint.mdx'
import WebAppBlueprint from './compute_resources/\_web_app_blueprint.mdx'

import DatabaseAppConfig from './database_resources/\_port_app_config.mdx'
import PostgresFlexibleServerBlueprint from './database_resources/\_postgres_flexible_server_blueprint.mdx'


## Mapping Storage Resources

In the following example you will ingest your Azure Storage Accounts and Containers to Port, you may use the following Port blueprint definitions and integration configuration:

:::note
The Storage Account has a relation to the Resource Group, so creation of the [Resource Group blueprint](#mapping-resource-groups) is required.
:::

<StorageAccountBlueprint/>

<StorageContainerBlueprint/>

<StorageAppConfig/>

Here are the API references we used to create those blueprints and app config:

- [Storage Account](https://docs.microsoft.com/en-us/rest/api/storagerp/storageaccounts/list)
- [Storage Container](https://learn.microsoft.com/en-us/rest/api/storagerp/blob-containers/list?tabs=HTTP)

## Mapping Compute Resources

In the following example you will ingest your Azure Resources to Port, you may use the following Port blueprint definitions and integration configuration:

:::note
The Resources below have a relation to the Resource Group, so creation of the [Resource Group blueprint](#mapping-resource-groups) is required.
:::

<AKSBlueprint/>

<ContainerAppBlueprint/>

<LoadBalancerBlueprint/>

<VirtualMachineBlueprint/>

<WebAppBlueprint/>

<ResourcesAppConfig/>

Here are the API references we used to create those blueprints and app config:

- [AKS](https://learn.microsoft.com/en-us/rest/api/aks/managed-clusters/list?tabs=HTTP)
- [Container App](https://learn.microsoft.com/en-us/rest/api/containerapps/stable/container-apps/list-by-subscription?tabs=HTTP)
- [Load Balancer](https://learn.microsoft.com/en-us/rest/api/load-balancer/load-balancers/list-all?tabs=HTTP)
- [Virtual Machine](https://learn.microsoft.com/en-us/rest/api/compute/virtual-machines/list-all?tabs=HTTP)
- [Web App](https://learn.microsoft.com/en-us/rest/api/appservice/web-apps/list)

## Mapping Database Resources

In the following example you will ingest your Azure Database Resources to Port, you may use the following Port blueprint definitions and integration configuration:

:::note
The Database Resources below have a relation to the Resource Group, so creation of the [Resource Group blueprint](#mapping-resource-groups) is required.
:::

<PostgresFlexibleServerBlueprint/>

<DatabaseAppConfig/>

Here are the API references we used to create those blueprints and app config:

- [Postgres Flexible Server](https://docs.microsoft.com/en-us/rest/api/azure-postgresql/flexibleservers)

:::info Mapping extra resources
The resources in this page are only few of the resources that the Azure Exporter supports.
If you don't find the Azure resource you want to map to Port head to the [Mapping Extra Resources](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/azure/resource_templates/mapping_extra_resources.md) page to learn about what kind of azure resources are supported by the Azure integration and how to map them into Port.
:::
