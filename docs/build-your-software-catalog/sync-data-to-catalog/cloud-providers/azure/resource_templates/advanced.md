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

import ServiceBusNamespaceBlueprint from './service_bus/\_service_bus_namespace_blueprint.mdx'
import ServiceBusQueueBlueprint from './service_bus/\_service_bus_queue_blueprint.mdx'
import ServiceBusTopicBlueprint from './service_bus/\_service_bus_topic_blueprint.mdx'
import ServiceBusSubscriptionBlueprint from './service_bus/\_service_bus_subscription_blueprint.mdx'
import ServiceBusAppConfig from './service_bus/\_port_app_config.mdx'

import ApplicationInsightsBlueprint from './application_insights/\_blueprint.mdx'
import ApplicationInsightsAppConfig from './application_insights/\_port_app_config.mdx'

import KeyVaultBlueprint from './key_vault/\_blueprint.mdx'
import KeyVaultAppConfig from './key_vault/\_port_app_config.mdx'


## Mapping storage resources

The following example demonstrates how to ingest your Azure Storage Accounts and Containers to Port.  
You can use the following Port blueprint definitions and integration configuration:

:::note Resource group requirement
The Storage Account has a relation to the Resource Group, so creation of the [Resource Group blueprint](#mapping-resource-groups) is required.
:::

<StorageAccountBlueprint/>

<StorageContainerBlueprint/>

<StorageAppConfig/>

Here are the API references we used to create those blueprints and app config:

- [Storage Account](https://docs.microsoft.com/en-us/rest/api/storagerp/storageaccounts/list)
- [Storage Container](https://learn.microsoft.com/en-us/rest/api/storagerp/blob-containers/list?tabs=HTTP)

## Mapping compute resources

The following example demonstrates how to ingest your Azure Resources to Port.  
You can use the following Port blueprint definitions and integration configuration:

:::note Resource group requirement
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

## Mapping database resources

The following example demonstrates how to ingest your Azure Database Resources to Port.  
You can use the following Port blueprint definitions and integration configuration:

:::note Resource group requirement
The Database Resources below have a relation to the Resource Group, so creation of the [Resource Group blueprint](#mapping-resource-groups) is required.
:::

<PostgresFlexibleServerBlueprint/>

<DatabaseAppConfig/>

Here are the API references we used to create those blueprints and app config:

- [Postgres Flexible Server](https://docs.microsoft.com/en-us/rest/api/azure-postgresql/flexibleservers)

## Mapping service bus resources

The following example demonstrates how to ingest your Azure Service Bus resources (Namespaces, Queues, Topics, and Subscriptions) to Port.  
You can use the following Port blueprint definitions and integration configuration:

:::note Hierarchical relationships
The Service Bus resources have a hierarchical relationship. The Namespace relates to the Resource Group, Queues and Topics relate to the Namespace, and Subscriptions relate to Topics. Creation of the [Resource Group blueprint](#mapping-resource-groups) is required.
:::

<ServiceBusNamespaceBlueprint/>

<ServiceBusQueueBlueprint/>

<ServiceBusTopicBlueprint/>

<ServiceBusSubscriptionBlueprint/>

<ServiceBusAppConfig/>

Here are the API references we used to create those blueprints and app config:

- [Service Bus Namespace](https://learn.microsoft.com/en-us/rest/api/servicebus/controlplane/namespaces/list?view=rest-servicebus-controlplane-2024-01-01&tabs=HTTP)
- [Service Bus Queue](https://learn.microsoft.com/en-us/rest/api/servicebus/controlplane/queues/list-by-namespace?view=rest-servicebus-controlplane-2024-01-01&tabs=HTTP)
- [Service Bus Topic](https://learn.microsoft.com/en-us/rest/api/servicebus/controlplane/topics/list-by-namespace?view=rest-servicebus-controlplane-2024-01-01&tabs=HTTP)
- [Service Bus Subscription](https://learn.microsoft.com/en-us/rest/api/servicebus/controlplane/subscriptions/list-by-topic?view=rest-servicebus-controlplane-2024-01-01&tabs=HTTP)

## Mapping application insights

The following example demonstrates how to ingest your Azure Application Insights components to Port.  
You can use the following Port blueprint definitions and integration configuration:

:::note Resource group requirement
Application Insights has a relation to the Resource Group, so creation of the [Resource Group blueprint](#mapping-resource-groups) is required.
:::

<ApplicationInsightsBlueprint/>

<ApplicationInsightsAppConfig/>

Here are the API references we used to create those blueprints and app config:

- [Application Insights](https://learn.microsoft.com/en-us/rest/api/application-insights/components/list)

## Mapping key vault

The following example demonstrates how to ingest your Azure Key Vaults to Port.  
You can use the following Port blueprint definitions and integration configuration:

:::note Resource group requirement
Key Vault has a relation to the Resource Group, so creation of the [Resource Group blueprint](#mapping-resource-groups) is required.
:::

<KeyVaultBlueprint/>

<KeyVaultAppConfig/>

Here are the API references we used to create those blueprints and app config:

- [Key Vault](https://learn.microsoft.com/en-us/rest/api/keyvault/keyvault/vaults/list-by-subscription?view=rest-keyvault-keyvault-2024-11-01&tabs=HTTP)

:::info Mapping extra resources
The resources in this page are only few of the resources that the Azure Exporter supports.
If you don't find the Azure resource you want to map to Port head to the [Mapping Extra Resources](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/azure/resource_templates/mapping_extra_resources.md) page to learn about what kind of azure resources are supported by the Azure integration and how to map them into Port.
:::
