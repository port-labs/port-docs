---
sidebar_position: 1
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";
import Image from "@theme/IdealImage";
import MetricsAndSyncStatus from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_metrics_and_sync_status.mdx"

# Azure

Our integration with Azure provides the ability to export your Azure resources to Port, according to your configuration.
After the initial import of data, the integration will also listen to live events from Azure to update data inside Port in real time.

Our integration with Azure supports real-time event processing, this allows for an accurate **real-time** representation of your Azure infrastructure inside Port.

:::tip
Port's Azure exporter is open source, view the source code [**here**](https://github.com/port-labs/ocean/tree/main/integrations/azure).
:::

## 💡 Azure integration common use cases

Our Azure integration makes it easy to fill the software catalog with data directly from your Azure subscription, for example:

- Map resources from your Azure subscriptions, such as **AKS**, **Storage Accounts**, **Container Apps**, **Load Balancers** and other Azure resources.
- Watch for Azure object changes (create/update/delete) in real-time, and automatically apply the changes to your entities in Port.
- Configure relations to other resources in your organization to create complete, easily digestible views of your resources and their relationships inside Port.

## 🔄 Sync Strategies

Port offers two approaches for syncing Azure resources to your software catalog:

### Real-time Sync (Ocean Integration)
- **Real-time updates** via Azure webhooks and events
- **Continuous operation** as a persistent service
- **Best for**: Production environments, real-time monitoring, compliance requirements

### Incremental Sync
- **Periodic updates** (configurable, default: 15 minutes)
- **Change detection** using Azure Resource Graph
- **Best for**: Cost optimization, large environments, development/staging

### Quick Comparison

| Feature | Real-time | Incremental |
|---------|-----------|-------------|
| **Update Frequency** | Immediate | Every 15+ minutes |
| **Resource Usage** | Continuous | Periodic |
| **Cost** | Higher | Lower |
| **Setup** | More complex | Simpler |

**Choose Real-time when**: You need immediate updates and have dedicated infrastructure
**Choose Incremental when**: Near-real-time is sufficient and you want to optimize costs

## Installation

The Azure exporter can be deployed in multiple ways, including Helm, ContainerApp, Docker and more.

Continue to the [installation](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/azure/installation.md) guide to learn how to install the Azure exporter.

## Performance Considerations & Best Practices

### Key Settings

- **Change Window**: Start with 15 minutes, adjust based on needs
- **Resource Types**: Limit to specific types for better performance
- **Tag Filtering**: Use resource group tags to reduce data volume

### Sync Frequency Recommendations

| Environment | Frequency | Change Window |
|-------------|-----------|---------------|
| **Production** | Every 15-30 minutes | 15-30 minutes |
| **Staging** | Every 30-60 minutes | 30-60 minutes |
| **Development** | Every 1-2 hours | 60-120 minutes |

### Cost Optimization

- **API Calls**: Only processes changed resources
- **No Persistent Infrastructure**: Runs only when needed
- **Efficient Queries**: Uses Azure Resource Graph for change detection

## Ingest Azure resources

The Azure exporter can retrieve all the resources supported by the [Azure Resource Manager REST API](https://learn.microsoft.com/en-us/rest/api/resources/resources/list), and export them to Port as entities of existing blueprints.

For examples on how to map resources head to the [resource templates](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/azure/resource_templates/resource_templates.md) page.

## Next Steps

- Refer to the [Resource Templates](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/azure/resource_templates/resource_templates.md) page for templates on how to map Azure resources to Port.
- Check out the [Azure Multi Subscriptions](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/azure/multi-subscriptions.md) guide for setting up synchronization of Azure resources.
- **For real-time sync**: Follow the [installation guide](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/azure/installation.md) to set up the Ocean-based integration.
- **For incremental sync**: Use the [incremental sync approach](#incremental-sync-installation) for periodic synchronization via GitHub Actions or scheduled jobs.
- **Need help choosing?**: Review the [sync strategies comparison](#sync-strategies) to determine the best approach for your use case.

## Configuration

Port integrations use a [YAML mapping block](/build-your-software-catalog/customize-integrations/configure-mapping#configuration-structure) to ingest data from the third-party api into Port.

The mapping makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from the integration API.

### Default mapping configuration

This is the default mapping configuration you get after installing the Azure integration.

<details>
<summary><b>Default mapping configuration (Click to expand)</b></summary>

```yaml showLineNumbers
resources:
- kind: subscription
  selector:
    query: 'true'
    apiVersion: '2022-09-01'
  port:
    entity:
      mappings:
        identifier: .id
        title: .display_name
        blueprint: '"azureSubscription"'
        properties:
          tags: .tags
- kind: Microsoft.Resources/resourceGroups
  selector:
    query: 'true'
    apiVersion: '2022-09-01'
  port:
    entity:
      mappings:
        identifier: .id | split("/") | .[3] |= ascii_downcase |.[4] |= ascii_downcase
          | join("/")
        title: .name
        blueprint: '"azureResourceGroup"'
        properties:
          location: .location
          provisioningState: .properties.provisioningState + .properties.provisioning_state
          tags: .tags
        relations:
          subscription: .id | split("/") | .[1] |= ascii_downcase |.[2] |= ascii_downcase
            | .[:3] |join("/")
- kind: Microsoft.App/containerApps
  selector:
    query: 'true'
    apiVersion: '2022-03-01'
  port:
    entity:
      mappings:
        identifier: .id | split("/") | .[3] |= ascii_downcase |.[4] |= ascii_downcase
          | join("/")
        title: .name
        blueprint: '"azureCloudResource"'
        properties:
          location: .location
          type: .type
          tags: .tags
        relations:
          resource_group: .id | split("/") | .[3] |= ascii_downcase |.[4] |= ascii_downcase
            | .[:5] |join("/")
- kind: Microsoft.Storage/storageAccounts
  selector:
    query: 'true'
    apiVersion: '2023-01-01'
  port:
    entity:
      mappings:
        identifier: .id | split("/") | .[3] |= ascii_downcase |.[4] |= ascii_downcase
          | join("/")
        title: .name
        blueprint: '"azureCloudResource"'
        properties:
          location: .location
          type: .type
          tags: .tags
        relations:
          resource_group: .id | split("/") | .[3] |= ascii_downcase |.[4] |= ascii_downcase
            | .[:5] |join("/")
- kind: Microsoft.Compute/virtualMachines
  selector:
    query: 'true'
    apiVersion: '2023-03-01'
  port:
    entity:
      mappings:
        identifier: .id | split("/") | .[3] |= ascii_downcase |.[4] |= ascii_downcase
          | join("/")
        title: .name
        blueprint: '"azureCloudResource"'
        properties:
          location: .location
          type: .type
          tags: .tags
        relations:
          resource_group: .id | split("/") | .[3] |= ascii_downcase |.[4] |= ascii_downcase
            | .[:5] |join("/")
- kind: Microsoft.ContainerService/managedClusters
  selector:
    query: 'true'
    apiVersion: '2023-05-01'
  port:
    entity:
      mappings:
        identifier: .id | split("/") | .[3] |= ascii_downcase |.[4] |= ascii_downcase
          | join("/")
        title: .name
        blueprint: '"azureCloudResource"'
        properties:
          location: .location
          type: .type
          tags: .tags
        relations:
          resource_group: .id | split("/") | .[3] |= ascii_downcase |.[4] |= ascii_downcase
            | .[:5] |join("/")
- kind: Microsoft.Network/loadBalancers
  selector:
    query: 'true'
    apiVersion: '2023-02-01'
  port:
    entity:
      mappings:
        identifier: .id | split("/") | .[3] |= ascii_downcase |.[4] |= ascii_downcase
          | join("/")
        title: .name
        blueprint: '"azureCloudResource"'
        properties:
          location: .location
          type: .type
          tags: .tags
        relations:
          resource_group: .id | split("/") | .[3] |= ascii_downcase |.[4] |= ascii_downcase
            | .[:5] |join("/")
```

</details>

<MetricsAndSyncStatus/>

