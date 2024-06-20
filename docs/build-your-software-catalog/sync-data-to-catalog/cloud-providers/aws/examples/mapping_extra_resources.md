---
sidebar_position: 1
---

import EcsServiceBlueprint from './compute_resources/\_ecs_service.mdx'
import AppRunnerBlueprint from './compute_resources/\_app_runner.mdx'
import SQSBlueprint from './compute_resources/\_sqs.mdx'
import LambdaBlueprint from './compute_resources/\_lambda.mdx'
import ComputeAppConfig from './compute_resources/\_port_app_config.mdx'

# Mapping Extra Resources

As you've probably looked at the [Examples](./examples.md) page, you've noticed that the AWS Integration supports some AWS resources, but most of them are documented in the Examples page.

This page will help you understand what kind of AWS resources are supported by the AWS integration and how to map them into Port.

## Is the resource supported by the AWS Integration?

The AWS Integration is relying on AWS's Cloud Control API. That means:

- Does the type of resource I want to injest listed [here](https://docs.aws.amazon.com/cloudcontrolapi/latest/userguide/supported-resources.html)?
  - If Yes, It's supported!
  - If not, please contact us, or [add the support to the integration yourself](https://github.com/port-labs/ocean/tree/main/integrations/aws)

## Mapping the resource to Port

After you've found the resource in the [Cloud Asset Supported Resources](https://cloud.google.com/asset-inventory/docs/supported-asset-types), you can map it to Port by following these steps:

### Blueprint

Create a Port blueprint definition for the resource. The blueprint definition is based on the resource API specified per asset type.
A few examples:

<EcsServiceBlueprint/>
<SQSBlueprint/>
<LambdaBlueprint/>

### Integration configuration

Create an integration configuration for the resource. The integration configuration is a YAML file that describes the ETL process to load data into the developer portal.

<ComputeAppConfig/>

#### The integration configuration structure

- The `kind` field describes the AWS resource type to be ingested into Port.
  The `kind` field should be set to the AWS resource type as it appears in the [supported resources guide](https://docs.aws.amazon.com/cloudcontrolapi/latest/userguide/supported-resources.html). e.g. The resource type for the `Lambda` is `AWS::Lambda::Function`

  ```yaml showLineNumbers
  resources:
  	# highlight-start
  	- kind: AWS::Lambda::Function
  		# highlight-end
  		selector:
  		...
  ```

- The `selector` field describes the AWS resource selection criteria.

  ```yaml showLineNumbers
  	resources:
  		- kind: AWS::Lambda::Function
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

- The `port` field describes the Port entity to be created from the AWS resource.

  ```yaml showLineNumbers
  resources:
    - kind: AWS::Lambda::Function
      selector:
        query: 'true' # JQ boolean query. If evaluated to false - skip syncing the object.
      # highlight-start
      port:
        entity:
          mappings: # Mappings between one AWS object to a Port entity. Each value is a JQ query.
            identifier: '.Identifier'
            title: '.Properties.FunctionName'
            blueprint: 'lambda'
            properties:
              kind: '.__Kind'
              region: '.__Region'
              link: "'https://console.aws.amazon.com/go/view?arn=' + .Properties.Arn"
              description: '.Properties.Description'
              memorySize: '.Properties.MemorySize'
              ephemeralStorageSize: '.Properties.EphemeralStorage.Size'
              timeout: '.Properties.Timeout'
              runtime: '.Properties.Runtime'
              packageType: '.Properties.PackageType'
              environment: '.Properties.Environment'
              architectures: '.Properties.Architectures'
              layers: '.Properties.Layers'
              tags: '.Properties.Tags'
              iamRole: "'https://console.aws.amazon.com/go/view?arn=' + .Properties.Role"
              arn: '.Properties.Arn'
            relations:
              account: '.__AccountId'
    # highlight-end
  ```

  - The `entity` field describes the Port entity to be created from the AWS resource.

        - The `mappings` field describes the mapping between the AWS resource and the Port entity.

          - The `identifier` field describes the AWS resource identifier. This field is required for all resources.
            ```yaml showLineNumbers
            mappings:
            	# highlight-start
              identifier: '.Identifier'
            	# highlight-end
            ```
          - The `title` field describes the AWS resource title. This field is required for all resources.
            ```yaml showLineNumbers
            mappings:
            	# highlight-start
              title:  '.Properties.FunctionName'
            	# highlight-end
            ```
          - The `blueprint` field describes the Port blueprint to be used to create the Port entity. This field is required for all resources.

            ```yaml showLineNumbers
            mappings:
            	# highlight-start
              blueprint: '"lambda"'
            	# highlight-end
            ```

          - The `properties` field describes the AWS resource properties to be mapped to the Port
            ```yaml showLineNumbers
            	mappings:
                identifier: ".id"
                  title:  ".name"
                  blueprint: '"gcpComputeInstance"'
                  # highlight-start
                  properties:
                    kind: '.__Kind'
                    region: '.__Region'
                    link: "'https://console.aws.amazon.com/go/view?arn=' + .Properties.Arn"
                    description: '.Properties.Description'
                    memorySize: '.Properties.MemorySize'
                    ephemeralStorageSize: '.Properties.EphemeralStorage.Size'
                    timeout: '.Properties.Timeout'
                    runtime: '.Properties.Runtime'
                    packageType: '.Properties.PackageType'
                    environment: '.Properties.Environment'
                    architectures: '.Properties.Architectures'
                    layers: '.Properties.Layers'
                    tags: '.Properties.Tags'
                    iamRole: "'https://console.aws.amazon.com/go/view?arn=' + .Properties.Role"
                    arn: '.Properties.Arn'
                  relations:
                    account: '.__AccountId'
                  # highlight-end
            ```

#### `useGetResourceAPI` property

- By default the integration uses the [`CloudControl:ListResources`](https://docs.aws.amazon.com/cli/latest/reference/cloudcontrol/list-resources.html) API to get the resources. The integration can also enrich each resource by running [`CloudControl:GetResource`](https://docs.aws.amazon.com/cli/latest/reference/cloudcontrol/get-resource.html) on each resource, you can use this by enabling `useGetResourceAPI` option.

  The `useGetResourceAPI` option is only available for resources that support the `CloudControl:GetResource` API.

```yaml showLineNumbers
resources:
  - kind: AWS::Lambda::Function
    selector:
      query: 'true' # JQ boolean query. If evaluated to false - skip syncing the object.
      # highlight-start
      useGetResourceAPI: 'true'
      # highlight-end
    port:
      entity:
        mappings: # Mappings between one AWS object to a Port entity. Each value is a JQ query.
          identifier: '.Identifier'
          title: '.Properties.FunctionName'
          blueprint: 'lambda'
          properties:
            kind: '.__Kind'
            region: '.__Region'
            link: "'https://console.aws.amazon.com/go/view?arn=' + .Properties.Arn"
            description: '.Properties.Description'
            memorySize: '.Properties.MemorySize'
            ephemeralStorageSize: '.Properties.EphemeralStorage.Size'
            timeout: '.Properties.Timeout'
            runtime: '.Properties.Runtime'
            packageType: '.Properties.PackageType'
            environment: '.Properties.Environment'
            architectures: '.Properties.Architectures'
            layers: '.Properties.Layers'
            tags: '.Properties.Tags'
            iamRole: "'https://console.aws.amazon.com/go/view?arn=' + .Properties.Role"
            arn: '.Properties.Arn'
          relations:
            account: '.__AccountId'
```

**Note: Using the `useGetResourceAPI` option will make each resync run slower and use a lot more memory and cpu so you might want to add memory and cpu limits.**

:::tip Get an example of the AWS resource properties
To get an example of the AWS resource properties, you can use the [AWS Cloud Control API](https://docs.aws.amazon.com/cloudcontrolapi/latest/userguide/what-is-cloudcontrolapi.html) to get the resource properties.

For example for the `AWS::Lambda::Function` resource, you can use the following command to get the resource properties:

```bash
aws cloudcontrol list-resources --type-name AWS::Lambda::Function --max-items 1 | jq .ResourceDescriptions
```

:::
