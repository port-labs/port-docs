---
sidebar_position: 4
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import CredentialsGuide from "/docs/build-your-software-catalog/custom-integration/api/\_template_docs/\_find_credentials.mdx";
import AzureAppRegistration from "./\_azure_app_registration_guide.mdx"

# Azure resource graph

Sync your Azure environment to Port at scale using Azure Resource Graph and Ocean framework. This integration is designed for high-volume data ingestion across multiple subscriptions, offering several key advantages:

- **Centralized Syncing**: Ingest resources from all your Azure subscriptions with a single deployment.
- **High-Speed Ingestion**: Leverage Azure Resource Graph to query and sync up to 1000 subscriptions simultaneously for maximum performance.
- **Customizable Mapping**: Take full control over which resource types are ingested and how they are mapped to your software catalog.

## Overview

This integration provides a robust solution for syncing your Azure resources to Port, built with Python and the Azure SDK. It is designed to run seamlessly as a GitHub workflow, executing at configurable intervals to keep your software catalog up-to-date.

The integration offers two synchronization modes: an **incremental** sync that captures recent changes (running by default every 15 minutes) and a **full** sync for a complete ingestion of all resources, which is ideal for the initial setup. With detailed tracking of Azure resources and flexible data mapping powered by Port's webhook capabilities, you can customize the ingested data to fit your needs.

You can deploy the integration using GitHub Actions for automated, periodic synchronization, or run it locally for development and testing purposes.

## Supported resources

The integration syncs data from two main Azure Resource Graph tables:

- `Resources`: This table includes a wide array of Azure resources, such as virtual machines, storage accounts, network interfaces, and more. The integration syncs their properties, tags, and metadata.
- `ResourceContainers`: This table contains management groups, subscriptions, and resource groups, providing the hierarchical context for your Azure resources.

### Azure setup

This integration requires the standard [Azure app registration](https://learn.microsoft.com/en-us/entra/identity-platform/quickstart-register-app?tabs=certificate%2Cexpose-a-web-api) setup.

Keep the following credentials handy after setup:
- `AZURE_CLIENT_ID`: The client ID of the Azure service principal
- `AZURE_CLIENT_SECRET`: The client secret of the Azure service principal
- `AZURE_TENANT_ID`: The tenant ID of the Azure service principal

<AzureAppRegistration/>

### Port setup

The basic Port setup follows the [standard installation guide](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/azure/installation.md#port-setup). However, this integration uses a different webhook configuration for incremental syncing:

#### Port credentials

<CredentialsGuide />

## Configuration

Port integrations use a [YAML mapping block](/build-your-software-catalog/customize-integrations/configure-mapping#configuration-structure) to ingest data from the third-party api into Port.

The mapping makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from the integration API.

### Default mapping configuration

This is the default mapping configuration you get after installing the Azure integration.

<details>
<summary><b>Default mapping configuration (Click to expand)</b></summary>

  ```yaml showLineNumbers
resources:
  - kind: resource
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: '.id | gsub(" ";"_")'
          title: .name
          blueprint: '"azureCloudResources"'
          properties:
            tags: .tags
            type: .type
            location: .location
  - kind: resourceContainer
    selector:
      query: .type == "microsoft.resources/subscriptions"
    port:
      entity:
        mappings:
          identifier: '.id | gsub(" ";"_")'
          title: .name
          blueprint: '"azureSubscription"'
          properties:
            subscriptionId: .subscriptionId
            location: .location
  - kind: resourceContainer
    selector:
      query: .type == "microsoft.resources/subscriptions/resourcegroups"
    port:
      entity:
        mappings:
          identifier: '.id | gsub(" ";"_")'
          title: .name
          blueprint: '"azureResourceGroup"'
          properties:
            tags: .tags
            location: .location
          relations:
            subscription: '("/subscriptions/" + .subscriptionId) | gsub(" ";"_")'
  ```
</details>
