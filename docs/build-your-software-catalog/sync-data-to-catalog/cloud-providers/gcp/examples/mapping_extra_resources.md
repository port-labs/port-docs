---
sidebar_position: 1
---
import AutoscalerBlueprint from './compute_resources/\_autoscaler.mdx'
import FirewallBlueprint from './compute_resources/\_firewall.mdx'
import SubnetworkBlueprint from './compute_resources/\_subnetwork.mdx'
import ComputeInstanceBlueprint from './compute_resources/\_compute_instance.mdx'
import ComputeAppConfig from './compute_resources/\_port_app_config.mdx'

import DatasetBlueprint from './bigquery_resources/\_dataset_blueprint.mdx'
import TableBlueprint from './bigquery_resources/\_table_blueprint.mdx'
import ModelBlueprint from './bigquery_resources/\_model_blueprint.mdx'
import BigQueryConfig from './bigquery_resources/\_port_app_config.mdx'


# Mapping Extra Resources

As you've probably looked at the [Examples](./examples.md) page, you've noticed that the GCP Integration supports some GCP resources, but most of them are documented in the Examples page.

This page will help you understand what kind of GCP resources are supported by the GCP integration and how to map them into Port.

## Is the resource supported by the GCP Integration?

The GCP Integration is relying on GCP's Asset Inventory API. That means:

- Does the type of resource I want to injest listed [here](https://cloud.google.com/asset-inventory/docs/supported-asset-types)?
  - If Yes, It's supported!
  - If not, please contact us, or [add the support to the integration yourself](https://github.com/port-labs/ocean/tree/main/integrations/gcp)

## Mapping the resource to Port

After you've found the resource in the [Cloud Asset Supported Resources](https://cloud.google.com/asset-inventory/docs/supported-asset-types), you can map it to Port by following these steps:

### Blueprint

Create a Port blueprint definition for the resource. The blueprint definition is based on the resource API specified per asset type.
A few examples:

#### Compute
<SubnetworkBlueprint/>
<FirewallBlueprint/>
<SubnetworkBlueprint/>
<ComputeInstanceBlueprint/>

#### Data Management
<DatasetBlueprint/>
<TableBlueprint/>
<ModelBlueprint/>

#### Integration configuration

Create an integration configuration for the resource. The integration configuration is a YAML file that describes the ETL process to load data into the developer portal.

<ComputeAppConfig/>
<BigQueryConfig/>

#### The integration configuration structure

- The `kind` field describes the GCP resource type to be ingested into Port.
  The `kind` field should be set to the GCP resource type as it appears in the [supported resources guide](https://cloud.google.com/asset-inventory/docs/supported-asset-types). e.g. The resource type for the `Compute Instance` is `compute.googleapis.com/Instance`

  ```yaml showLineNumbers
  resources:
  	# highlight-start
  	- kind: compute.googleapis.com/Instance
  		# highlight-end
  		selector:
  		...
  ```

- The `selector` field describes the GCP resource selection criteria.

  ```yaml showLineNumbers
  	resources:
  		- kind: compute.googleapis.com/Instance
  			# highlight-start
  			selector:
  				query: "true" # JQ boolean expression. If evaluated to false - this object will be skipped.
  			# highlight-end
  			port:
  ```

  - The `query` field is a [JQ boolean query](https://stedolan.github.io/jq/manual/#Basicfilters), if evaluated to `false` - the resource will be skipped. Example use case - skip syncing resources that are not in a specific region.
    ```yaml showLineNumbers
    query: .location == "global"
    ```
- The `port` field describes the Port entity to be created from the GCP resource.

  ```yaml showLineNumbers
  resources:
  	- kind: compute.googleapis.com/Instance
  		selector:
  			query: "true" # JQ boolean query. If evaluated to false - skip syncing the object.
  		# highlight-start
  		port:
      entity:
        mappings: # Mappings between one GCP object to a Port entity. Each value is a JQ query.
          identifier: ".id"
          title:  ".name"
          blueprint: '"gcpComputeInstance"'
          properties:
            location: .location
            machineType: ".machineType"
            subnetworks: ".networkInterfaces[].subnetwork"
            cpuPlatform: ".cpuPlatform"
            selfLink: ".selfLink"
          relations:
            project: ".__project.name"
  		# highlight-end
  ```

  - The `entity` field describes the Port entity to be created from the GCP resource.

    - The `mappings` field describes the mapping between the GCP resource and the Port entity.

      - The `identifier` field describes the GCP resource identifier. This field is required for all resources.
        ```yaml showLineNumbers
        mappings:
        	# highlight-start
          identifier: ".id"
        	# highlight-end
        ```
      - The `title` field describes the GCP resource title. This field is required for all resources.
        ```yaml showLineNumbers
        mappings:
        	# highlight-start
          title:  ".name"
        	# highlight-end
        ```
      - The `blueprint` field describes the Port blueprint to be used to create the Port entity. This field is required for all resources.

        ```yaml showLineNumbers
        mappings:
        	# highlight-start
          blueprint: '"gcpComputeInstance"'
        	# highlight-end
        ```

      - The `properties` field describes the GCP resource properties to be mapped to the Port
        ```yaml showLineNumbers
        	mappings:
          identifier: ".id"
            title:  ".name"
            blueprint: '"gcpComputeInstance"'
        		# highlight-start
        		properties:
        			location: .location
              machineType: ".machineType"
        		# highlight-end
        ```



### Case Style Preservation

For the resources listed below, this integration provides flexibility to either transform the properties to `snake_case` or preserve the original case style (e.g., `camelCase`) returned by the API for consistency with other resources.

This applies to the following kinds:

- Projects (`cloudresourcemanager.googleapis.com/Project`)
- Organizations (`cloudresourcemanager.googleapis.com/Organization`)
- Folders (`cloudresourcemanager.googleapis.com/Folder`)
- Topics (`pubsub.googleapis.com/Topic`)
- Subscriptions (`pubsub.googleapis.com/Subscription`)

This feature is particularly useful for ensuring compatibility with downstream systems or processes that require `camelCase` formatting.

#### How to Enable Case Style Conversion

To convert the case style to camelCase, set `preserveApiResponseCaseStyle: true` in the selector configuration for the relevant API. For example:

```yaml
- kind: pubsub.googleapis.com/Subscription
    selector:
      query: 'true'
      preserveApiResponseCaseStyle: 'true'
    port:
      entity:
        mappings:
          identifier: .name

 - kind: pubsub.googleapis.com/Topic
    selector:
      query: 'true'
      preserveApiResponseCaseStyle: 'true'
    port:
      entity:
        mappings:
          identifier: .name
          title: .name | split("/") | last
```

When `preserveApiResponseCaseStyle` is not set or set to `false` (default behavior), all property names will converted to snake_case format regardless of their original case style in the API response.
