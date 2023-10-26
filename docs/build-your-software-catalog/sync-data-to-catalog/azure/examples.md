---
sidebar_position: 2
---

import ResourceGroupBlueprint from './examples/resource_group/\_blueprint.mdx'
import ResourceGroupAppConfig from './examples/resource_group/\_port_app_config.mdx'

import StorageAccountBlueprint from './examples/storage/\_storage_account_blueprint.mdx'
import StorageContainerBlueprint from './examples/storage/\_storage_container_blueprint.mdx'
import StorageAppConfig from './examples/storage/\_port_app_config.mdx'

import ResourcesAppConfig from './examples/compute_resources/\_port_app_config.mdx'
import AKSBlueprint from './examples/compute_resources/\_aks_blueprint.mdx'
import ContainerAppBlueprint from './examples/compute_resources/\_container_app_blueprint.mdx'
import LoadBalancerBlueprint from './examples/compute_resources/\_load_balancer_blueprint.mdx'
import VirtualMachineBlueprint from './examples/compute_resources/\_virtual_machine_blueprint.mdx'
import WebAppBlueprint from './examples/compute_resources/\_web_app_blueprint.mdx'

import DatabaseAppConfig from './examples/database_resources/\_port_app_config.mdx'
import PostgresFlexibleServerBlueprint from './examples/database_resources/\_postgres_flexible_server_blueprint.mdx'

# Examples

:::info
The resources in this page are only few of the resources that the Azure Exporter supports.
If you don't find the Azure resource you want to map to Port head to the [Mapping Extra Resources](mapping_extra_resources.md) page to learn about what kind of azure resources are supported by the Azure integration and how to map them into Port.
:::

## Mapping Resource Groups

In the following example you will ingest your Azure Resource Groups to Port, you may use the following Port blueprint definitions and integration configuration:

<ResourceGroupBlueprint/>

<ResourceGroupAppConfig/>

Here are the API references we used to create those blueprints and app config:

- [Resource Group](https://docs.microsoft.com/en-us/rest/api/resources/resourcegroups/list)

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

:::info
The resources in this page are only few of the resources that the Azure Exporter supports.
If you don't find the Azure resource you want to map to Port head to the [Mapping Extra Resources](mapping_extra_resources.md) page to learn about what kind of azure resources are supported by the Azure integration and how to map them into Port.
:::
