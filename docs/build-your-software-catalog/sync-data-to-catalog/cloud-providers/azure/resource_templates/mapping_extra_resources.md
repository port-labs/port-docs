---
sidebar_position: 2
---

import StorageAccountBlueprint from './storage/\_storage_account_blueprint.mdx'
import StorageAppConfig from './storage/\_port_app_config.mdx'

# Mapping Extra Resources

As you've probably looked at the [Resource Templates](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/azure/resource_templates/resource_templates.md) page, you've noticed that the Azure Exporter supports many Azure resources, but not all of them are documented in the Resource Templates page.

This page will help you understand what kind of Azure resources are supported by the Azure integration and how to map them into Port.

## Is the resource supported by the Azure Exporter?

The Azure Exporter relies on the Base Azure Resource to have a `List` API by `subscription` to get all the resources of a specific type.
If it is a resource that is not documented in the [Resource Templates](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/azure/resource_templates/resource_templates.md) page, you can map it to Port by following these steps:

1. Find the resource in the [Azure REST API reference](https://learn.microsoft.com/en-us/rest/api/azure/).
2. If it's a base resource (in the format of `Microsoft.<Provider>/<resourceName>`) can be found in the type example response and in the API URL

  <img src='/img/integrations/azure-exporter/StorageAccountTypeInAPIURL.png' width='80%' border='1px' /> <br/><br/>
   - If it has a List API by subscription it will be supported by the Azure Exporter.
    <img src='/img/integrations/azure-exporter/StorageAccountListAPIIsValid.png' width='80%' border='1px' /> <br/><br/>

3. If it's an extension resource (in the format of `Microsoft.<Provider>/<resourceName>/<extensionName>`) such as `Microsoft.Storage/storageAccounts/blobServices/containers`.
   - Then, if the base resource is supported by the Azure Exporter, the extension resource will be supported as well.

## Mapping the resource to Port

After you've found the resource in the Azure REST API reference and you've confirmed that it is supported by the Azure Exporter, you can map it to Port by following these steps:

### Blueprint

Create a Port blueprint definition for the resource. The blueprint definition is based on the resource API response in the Azure REST API reference.

<details>
<summary>Azure Storage Account Rest API Response Example</summary>

```json
{
  "value": [
    {
      "id": "/subscriptions/{subscription-id}/resourceGroups/res2627/providers/Microsoft.Storage/storageAccounts/sto1125",
      "kind": "Storage",
      "location": "eastus",
      "name": "sto1125",
      "properties": {
        "isHnsEnabled": true,
        "creationTime": "2017-05-24T13:28:53.4540398Z",
        "primaryEndpoints": {
          "web": "https://sto1125.web.core.windows.net/",
          "dfs": "https://sto1125.dfs.core.windows.net/",
          "blob": "https://sto1125.blob.core.windows.net/",
          "file": "https://sto1125.file.core.windows.net/",
          "queue": "https://sto1125.queue.core.windows.net/",
          "table": "https://sto1125.table.core.windows.net/",
          "microsoftEndpoints": {
            "web": "https://sto1125-microsoftrouting.web.core.windows.net/",
            "dfs": "https://sto1125-microsoftrouting.dfs.core.windows.net/",
            "blob": "https://sto1125-microsoftrouting.blob.core.windows.net/",
            "file": "https://sto1125-microsoftrouting.file.core.windows.net/",
            "queue": "https://sto1125-microsoftrouting.queue.core.windows.net/",
            "table": "https://sto1125-microsoftrouting.table.core.windows.net/"
          },
          "internetEndpoints": {
            "web": "https://sto1125-internetrouting.web.core.windows.net/",
            "dfs": "https://sto1125-internetrouting.dfs.core.windows.net/",
            "blob": "https://sto1125-internetrouting.blob.core.windows.net/",
            "file": "https://sto1125-internetrouting.file.core.windows.net/"
          }
        },
        "primaryLocation": "eastus",
        "provisioningState": "Succeeded",
        "routingPreference": {
          "routingChoice": "MicrosoftRouting",
          "publishMicrosoftEndpoints": true,
          "publishInternetEndpoints": true
        },
        "encryption": {
          "services": {
            "file": {
              "keyType": "Account",
              "enabled": true,
              "lastEnabledTime": "2019-12-11T20:49:31.7036140Z"
            },
            "blob": {
              "keyType": "Account",
              "enabled": true,
              "lastEnabledTime": "2019-12-11T20:49:31.7036140Z"
            }
          },
          "keySource": "Microsoft.Storage"
        },
        "secondaryLocation": "centraluseuap",
        "statusOfPrimary": "available",
        "statusOfSecondary": "available",
        "supportsHttpsTrafficOnly": false
      },
      "sku": {
        "name": "Standard_GRS",
        "tier": "Standard"
      },
      "tags": {
        "key1": "value1",
        "key2": "value2"
      },
      "type": "Microsoft.Storage/storageAccounts"
    }
  ]
}
```

</details>

Based on the API response, you can create a Port blueprint definition for the resource.

<StorageAccountBlueprint/>

### Integration configuration

Create an integration configuration for the resource. The integration configuration is a YAML file that describes the ETL process to load data into the developer portal.

<StorageAppConfig/>

#### The integration configuration structure

- The `kind` field describes the Azure resource type to be ingested into Port.
  The `kind` field should be set to the Azure resource type as it appears in the [resource guide](https://learn.microsoft.com/en-us/azure/templates/). e.g. The resource type for the `Storage Account` could be found [here](https://learn.microsoft.com/en-us/azure/templates/microsoft.storage/storageaccounts?pivots=deployment-language-arm-template) as well with the resource object structure.

  ```yaml showLineNumbers
  resources:
  	# highlight-start
  	- kind: Microsoft.Storage/storageAccounts
  		# highlight-end
  		selector:
  		...
  ```

- The `selector` field describes the Azure resource selection criteria.

  ```yaml showLineNumbers
  	resources:
  		- kind: Microsoft.Storage/storageAccounts
  			# highlight-start
  			selector:
  				query: "true" # JQ boolean expression. If evaluated to false - this object will be skipped.
  				apiVersion: "2023-01-01" # Azure API version to use to fetch the resource
  			# highlight-end
  			port:
  ```

  - The `query` field is a [JQ boolean query](https://stedolan.github.io/jq/manual/#Basicfilters), if evaluated to `false` - the resource will be skipped. Example use case - skip syncing resources that are not in a specific region.
    ```yaml showLineNumbers
    query: .location == "eastus2"
    ```
  - The `apiVersion` field is the Azure API version to use to fetch the resource. This field is required for all resources. For example, the API versions for the `storageAccount` resource was found in the [Storage Account Rest API](https://docs.microsoft.com/en-us/rest/api/storagerp/storageaccounts/list)
    ```yaml showLineNumbers
    apiVersion: "2023-01-01"
    ```
    <img src='/img/integrations/azure-exporter/StorageAccountAPIVersion.png' width='80%' border='1px' /> <br/><br/>

- The `port` field describes the Port entity to be created from the Azure resource.

  ```yaml showLineNumbers
  resources:
  	- kind: Microsoft.Storage/storageAccounts
  		selector:
  			query: "true" # JQ boolean query. If evaluated to false - skip syncing the object.
  			apiVersion: "2023-01-01" # Azure API version to use to fetch the resource
  		# highlight-start
  		port:
  			entity:
  				mappings: # Mappings between one Azure object to a Port entity. Each value is a JQ query.
  					identifier: .id
  					title: .name
  					blueprint: '"azureStorageAccount"'
  					properties:
  						location: .location
  						provisioningState: .properties.provisioningState
  		# highlight-end
  ```

  - The `entity` field describes the Port entity to be created from the Azure resource.

    - The `mappings` field describes the mapping between the Azure resource and the Port entity.

      - The `identifier` field describes the Azure resource identifier. This field is required for all resources.
        ```yaml showLineNumbers
        mappings:
        	# highlight-start
        	identifier: .id
        	# highlight-end
        ```
      - The `title` field describes the Azure resource title. This field is required for all resources.
        ```yaml showLineNumbers
        mappings:
        	# highlight-start
        	title: .name
        	# highlight-end
        ```
      - The `blueprint` field describes the Port blueprint to be used to create the Port entity. This field is required for all resources.

        ```yaml showLineNumbers
        mappings:
        	# highlight-start
        	blueprint: '"azureStorageAccount"'
        	# highlight-end
        ```

      - The `properties` field describes the Azure resource properties to be mapped to the Port
        ```yaml showLineNumbers
        	mappings:
        		identifier: .id
        		title: .name
        		blueprint: '"azureStorageAccount"'
        		# highlight-start
        		properties:
        			location: .location
        			provisioningState: .properties.provisioningState
        		# highlight-end
        ```
