---
sidebar_position: 1
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";
import Image from "@theme/IdealImage";

# Azure

Our integration with Azure provides the ability to export your Azure resources to Port, according to your configuration.
After the initial import of data, the integration will also listen to live events from Azure to update data inside Port in real time.

Our integration with Azure supports real-time event processing, this allows for an accurate **real-time** representation of your Azure infrastructure inside Port.

:::tip
Port's Azure exporter is open source, view the source code [**here**](https://github.com/port-labs/ocean/tree/main/integrations/azure).
:::

## 💡 Azure integration common use cases

Our Azure integration makes it easy to fill the software catalog with data directly from your Azure subscription, for example:

- Map all the resources in your Azure subscription, including **AKS**, **Storage Accounts**, **Container Apps**, **Load Balancers** and other Azure objects;
- Watch for Azure object changes (create/update/delete) in real-time, and automatically apply the changes to your entities in Port;
- Use relations to create complete, easily digestible views of your Azure infrastructure inside Port.

## Installation

To install Port's Azure exporter, follow the [installation](./installation.md) guide.

## How it works

Port's Azure exporter can retrieve all the resources supported by the Azure API, and export them to Port as entities of existing blueprints.

The Azure exporter allows you to perform extract, transform, load (ETL) on data from the Azure API into the desired software catalog data model.

The exporter is deployed using an Azure [Container App](https://learn.microsoft.com/en-us/azure/container-apps/overview) that is deployed to your Azure subscription.

The Azure exporter uses a YAML configuration to describe the ETL process to load data into the developer portal. The approach reflects a golden middle between an overly opinionated Azure visualization that might not work for everyone and a too-broad approach that could introduce unneeded complexity into the developer portal.

Here is an example snippet from the config which demonstrates the ETL process for getting `Container App` data from Azure and into the software catalog:

```yaml showLineNumbers
resources:
  # Extract
  # highlight-start
  - kind: Microsoft.App/containerApps
    selector:
      query: "true" # JQ boolean query. If evaluated to false - skip syncing the object.
      apiVersion: "2022-03-01" # Azure API version to use to fetch the resource
    # highlight-end
    port:
      entity:
        mappings:
          # Transform & Load
          # highlight-start
          identifier: '.id | split("/") | .[3] |= ascii_downcase |.[4] |= ascii_downcase | join("/")' # lowercase only the resourceGroups namespace and name to align how azure API returns the resource group reference
          title: .name
          blueprint: '"containerApp"'
          properties:
            location: .location
            provisioningState: .properties.provisioningState
            outboundIpAddresses: .properties.outboundIpAddresses
            externalIngress: .properties.configuration.ingress.external
            hostName: .properties.configuration.ingress.fqdn
            minReplicas: .properties.template.scale.minReplicas
            maxReplicas: .properties.template.scale.maxReplicas
          relations:
            resourceGroup: '.id | split("/") | .[3] |= ascii_downcase |.[4] |= ascii_downcase | .[:5] |join("/")'
          # highlight-end
```

The integration makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from Azure's API events.

### The integration configuration structure

The integration configuration is a YAML file that describes the ETL process to load data into the developer portal.

- The `resources` section describes the Azure resources to be ingested into Port.
  ```yaml showLineNumbers
  # highlight-next-line
  resources:
    - kind: Microsoft.App/containerApps
      selector:
      ...
  ```
- The `kind` field describes the Azure resource type to be ingested into Port.
  The `kind` field should be set to the Azure resource type as it appears in the [resource guide](https://learn.microsoft.com/en-us/azure/templates/). e.g. The resource type for the `Container App` could be found [here](https://learn.microsoft.com/en-us/azure/templates/microsoft.app/change-log/containerapps).
  ```yaml showLineNumbers
  resources:
    # highlight-start
    - kind: Microsoft.App/containerApps
      # highlight-end
      selector:
      ...
  ```
- The `selector` field describes the Azure resource selection criteria.

  ```yaml showLineNumbers
  resources:
    - kind: Microsoft.App/containerApps
      # highlight-start
      selector:
        query: "true" # JQ boolean query. If evaluated to false - skip syncing the object.
        apiVersion: "2022-03-01" # Azure API version to use to fetch the resource
      # highlight-end
  ```

  - The `query` field is a [JQ boolean query](https://stedolan.github.io/jq/manual/#Basicfilters), if evaluated to `false` - the resource will be skipped. Example use case - skip syncing resources that are not in a specific region.
    ```yaml showLineNumbers
    query: .location == "eastus2"
    ```
  - The `apiVersion` field is the Azure API version to use to fetch the resource. This field is required for all resources. You can find the API version for each resource in the [Azure Resources reference](https://learn.microsoft.com/en-us/azure/templates/). For example, the supported API versions for the `containerApps` resource was found in the [Container App Changelog](https://learn.microsoft.com/en-us/azure/templates/microsoft.app/change-log/containerapps).
    ```yaml showLineNumbers
    apiVersion: "2022-03-01"
    ```

- The `port` field describes the Port entity to be created from the Azure resource.
  ```yaml showLineNumbers
  resources:
    - kind: Microsoft.App/containerApps
      selector:
        query: "true" # JQ boolean query. If evaluated to false - skip syncing the object.
        apiVersion: "2022-03-01" # Azure API version to use to fetch the resource
      # highlight-start
      port:
        entity:
          mappings:
            identifier: .id
            title: .name
            blueprint: '"containerApp"'
            properties:
              location: .location
              provisioningState: .properties.provisioningState
              outboundIpAddresses: .properties.outboundIpAddresses
              externalIngress: .properties.configuration.ingress.external
              hostName: .properties.configuration.ingress.fqdn
              minReplicas: .properties.template.scale.minReplicas
              maxReplicas: .properties.template.scale.maxReplicas
            relations:
              resourceGroup: '.id | split("/") | .[3] |= ascii_downcase |.[4] |= ascii_downcase | .[:5] |join("/")'
      # highlight-end
  ```
  - The `entity` field describes the Port entity to be created from the Azure resource.
    ```yaml showLineNumbers
    resources:
      - kind: Microsoft.App/containerApps
        selector:
          query: "true" # JQ boolean query. If evaluated to false - skip syncing the object.
          apiVersion: "2022-03-01" # Azure API version to use to fetch the resource
        port:
          # highlight-start
          entity:
            mappings:
              identifier: .id
              title: .name
              blueprint: '"containerApp"'
              properties:
                location: .location
                provisioningState: .properties.provisioningState
                outboundIpAddresses: .properties.outboundIpAddresses
                externalIngress: .properties.configuration.ingress.external
                hostName: .properties.configuration.ingress.fqdn
                minReplicas: .properties.template.scale.minReplicas
                maxReplicas: .properties.template.scale.maxReplicas
              relations:
                resourceGroup: '.id | split("/") | .[3] |= ascii_downcase |.[4] |= ascii_downcase | .[:5] |join("/")'
          # highlight-end
    ```

### Authorization

The exporter will need to have access to your Azure subscription in order to export your resources to Port.
This is done by assigning a [user-assigned identity](https://learn.microsoft.com/en-us/azure/container-apps/managed-identity?tabs=portal,dotnet#add-a-user-assigned-identity) to the exporter, and granting that identity the required permissions to your Azure subscription.

As part of the installation process, you will need to define the permissions that the exporter will have on your Azure subscription.
This will be defined by specifying the [actions](https://learn.microsoft.com/en-us/azure/role-based-access-control/role-definitions#actions) that the exporter will be allowed to perform on your Azure subscription.

Here is an example of action permissions that could be assigned to the exporter:

```yaml showLineNumbers
action_permissions_list = [
"Microsoft.Resources/subscriptions/resourceGroups/read",
"Microsoft.Resources/subscriptions/resources/read",
"Microsoft.app/containerapps/read",
"Microsoft.Storage/storageAccounts/*/read",
"Microsoft.ContainerService/managedClusters/read",
"Microsoft.Network/loadBalancers/read",
```

:::tip
To find more actions that could be assigned to the exporter, you can use the [Azure Resource provider operation reference](https://learn.microsoft.com/en-us/azure/role-based-access-control/resource-provider-operations) and look for the resources that you want to export to Port.
:::

## Getting started

Continue to the Installation guide to learn how to install the Azure exporter.
