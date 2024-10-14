---
sidebar_position: 1
---

import EcsServiceBlueprint from './compute_resources/\_ecs_service.mdx'
import AppRunnerBlueprint from './compute_resources/\_app_runner.mdx'
import SQSBlueprint from './compute_resources/\_sqs.mdx'
import LambdaBlueprint from './compute_resources/\_lambda.mdx'
import ComputeAppConfig from './compute_resources/\_port_app_config.mdx'
import ElasticBeanstalkBlueprint from './compute_resources/\_elasticbeanstalk.mdx'
import LightsailBlueprint from './compute_resources/\_lightsail.mdx'
import AmplifyBlueprint from './developer_tools/\_amplify.mdx'
import DeveloperToolsAppConfig from './developer_tools/\_port_app_config.mdx'
import KinesisBlueprint from './application_integration/\_kinesis.mdx'
import SNSBlueprint from './application_integration/\_sns.mdx'
import ApplicationIntegrationAppConfig from './application_integration/\_port_app_config.mdx'
import LexBlueprint from './machine_learning/\_lex.mdx'
import MachineLearningAppConfig from './machine_learning/\_port_app_config.mdx'
import AutoScalingBlueprint from './management_and_governance/\_auto_scaling_group.mdx'
import CloudFormationBlueprint from './management_and_governance/\_cloudformation.mdx'
import ManagementAndGovernanceAppConfig from './management_and_governance/\_port_app_config.mdx'
import CloudFrontBlueprint from './networking_and_content_delivery/\_cloudfront.mdx'
import NetworkingAndContentDeliveryAppConfig from './networking_and_content_delivery/\_port_app_config.mdx'
import CognitoBlueprint from './security_identity_and_compliance/\_cognito.mdx'
import SecurityIdentityAndComplianceAppConfig from './security_identity_and_compliance/\_port_app_config.mdx'
import DynamoDBBlueprint from './storage/\_dynamodb.mdx'
import ElasticacheBlueprint from './storage/\_elasticache.mdx'
import RDSBlueprint from './storage/\_rds.mdx'
import StorageAppConfig from './storage/\_port_app_config.mdx'

# Mapping Extra Resources

As you've probably looked at the [Examples](./examples.md) page, you've noticed that the AWS Integration supports some AWS resources, but most of them are not documented in the Examples page.

This page will help you understand what kind of AWS resources are supported by the AWS integration and how to map them into Port.

## Is the resource supported by the AWS Integration?

The AWS Integration is relying on AWS's Cloud Control API. That means:

1. Does the type of resource I want to ingest listed [here](https://docs.aws.amazon.com/cloudcontrolapi/latest/userguide/supported-resources.html)?
   - **If so**: Great! It's supported.
   - **If not**: Please contact us or contribute by [adding support](https://ocean.getport.io/develop-an-integration/) to [the integration](https://github.com/port-labs/ocean/tree/main/integrations/aws) yourself.

:::info Resource limitation
In Cloud Control, some resources require an input in order to be queried. Currently, the integration does not support passing these inputs, which means those resources are currently not supported.
:::

## Configuration

Port integrations use a [YAML mapping block](/build-your-software-catalog/customize-integrations/configure-mapping#configuration-structure) to ingest data from the third-party api into Port.

The mapping makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from the integration API.


### `useGetResourceAPI` property support

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


## Mapping the resource to Port

After you've found the resource in the [AWS Cloud Control API Docs](https://docs.aws.amazon.com/cloudcontrolapi/latest/userguide/supported-resources.html), you can map it to Port by following these steps:

### Compute resources blueprint example

Create a Port blueprint definition for the resource. The blueprint definition is based on the resource API specified per asset type.
A few examples of blueprints for compute resources are provided below:

<LightsailBlueprint/>
<ElasticBeanstalkBlueprint/>
<EcsServiceBlueprint/>
<SQSBlueprint/>
<LambdaBlueprint/>

### Compute resources integration configuration example

Create an integration configuration for the resource. The integration configuration is a YAML file that describes the ETL process to load data into the developer portal.

<ComputeAppConfig/>

### Developer tools blueprint and configuration example

<AmplifyBlueprint/>


<DeveloperToolsAppConfig/>

### Application integration blueprint and configuration example

<KinesisBlueprint/>
<SNSBlueprint/>


<ApplicationIntegrationAppConfig/>

### Machine learning blueprint and configuration example

<LexBlueprint/>


<MachineLearningAppConfig/>

### Management and governance blueprint and configuration example
<AutoScalingBlueprint/>
<CloudFormationBlueprint/>


<ManagementAndGovernanceAppConfig/>

### Networking and content delivery blueprint and configuration example
<CloudFrontBlueprint/>


<NetworkingAndContentDeliveryAppConfig/>

### Security, identity, and compliance blueprint and configuration example
<CognitoBlueprint/>


<SecurityIdentityAndComplianceAppConfig/>

### Storage blueprint and configuration example
<DynamoDBBlueprint/>
<ElasticacheBlueprint/>
<RDSBlueprint/>


<StorageAppConfig/>

