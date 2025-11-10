# AWS resource and property reference

Welcome to the reference guide for AWS resource, actions and properties, as supported by AWS CloudFormation and used in Port integrations.

## Supported resource types

Explore detailed documentation for each AWS resource and action available for integration. For each resource type, you will find information about supported actions, required permissions, and usage best practices.

Resource type identifiers follow a standardized format, allowing you to easily recognize and reference each AWS entity:

```
service-provider::service-name::data-type-name
```

For example, an EC2 instance is identified as:

```
AWS::EC2::Instance
```

Refer to the sidebar or the list below to navigate to individual resource reference pages where you will find actionable integration details, sample configurations, and official AWS documentation links.

- [Amazon Simple Queue Service](./amazon-simple-queue-service/amazon-simple-queue-service.md)
- [Amazon Simple Storage Service](./amazon-simple-storage-service/amazon-simple-storage-service.md)
- [Amazon Elastic Compute Cloud](./amazon-elastic-compute-cloud/amazon-elastic-compute-cloud.md)
- [Amazon Elastic Container Service](./amazon-elastic-container-service/amazon-elastic-container-service.md)
- [Amazon Elastic Kubernetes Service](./amazon-elastic-kubernetes-service/amazon-elastic-kubernetes-service.md)
- [Amazon Relational Database Service](./amazon-relational-database-service/amazon-relational-database-service.md)
- [AWS Lambda](./aws-lambda/aws-lambda.md)
- [AWS Account](./aws-account/aws-account.md)
- [AWS Organizations](./aws-organizations/aws-organizations.md)

:::info More Resource Types Coming Soon
We're continuously expanding support for additional AWS resource types to ensure comprehensive coverage of your AWS infrastructure.

If you need support for a specific AWS resource or action that isn’t yet available, please consider opening a feature request or reach out to us through chat, Slack, or our [Support Portal](http://support.port.io/).

Your feedback helps us prioritize what to build next.
:::

## Actions

**Actions** define the set of API operations performed to discover and fetch resources within your AWS environment. These actions are mapped directly to AWS API calls—for example, `DescribeInstances` for EC2 or `ListBuckets` for S3—which determine the resource data that Port can ingest and keep up to date.

:::caution Ensure required AWS permissions are granted
Each action requires specific AWS IAM permissions. Your integration’s AWS credentials must have these permissions; otherwise, the action will not succeed and its data will not be available in Port.
:::

### How Actions Map to AWS Operations

Each Port-supported resource type comes with a set of actions that align with AWS's official API operations. For instance:

- For **Amazon S3 Buckets**, the `ListBucketsAction` leverages the [ListBuckets API](https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListBuckets.html), and additional actions like `GetBucketTaggingAction` or `GetBucketEncryptionAction` invoke their respective AWS endpoints.
- For **EC2 Instances**, `DescribeInstancesAction` maps to the [DescribeInstances API](https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_DescribeInstances.html) and brings in detailed instance configuration.

These mappings ensure that only the properties available from the selected AWS actions are ingested into your Port catalog.

### Enabling and Customizing Actions

With Port, you have full control over which AWS resource properties are discovered and ingested into your catalog by specifying the actions to use for each resource type. Actions define what data you collect and the AWS permissions required.

- **Default Actions**: These are enabled automatically, ensuring basic discovery such as listing all S3 buckets or EC2 instances without additional configuration.
- **Optional Actions**: Enable these to collect more detailed properties for your AWS resources. You must explicitly add optional actions in your integration configuration for Port to use them.

To collect additional properties from AWS resources, add the optional actions you need to the `includeActions` field of your configuration. For example, to include status details from EC2 instances by enabling the `DescribeInstanceStatusAction`, add the following:

```yaml showLineNumbers
- kind: AWS::EC2::Instance
  selector:
    query: 'true'
    includeActions:
      - DescribeInstanceStatusAction

In this configuration, Port will enrich your catalog by fetching all properties provided by the [DescribeInstanceStatus API](https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_DescribeInstanceStatus.html) for every EC2 instance.

:::caution Action limit
You can include a **maximum of 3 optional actions per resource kind** (excluding default actions). To use more than 3 actions, you can configure multiple resource kinds in your integration.
:::


### Querying resources from specific regions

The `regionPolicy` selector lets you control which AWS regions are queried by the integration. Use it to include or exclude regions per resource.

- allow: List of regions explicitly permitted for querying
- deny: List of regions explicitly excluded from querying

#### How `regionPolicy` works

1. If both lists are empty: all regions are allowed.
2. If the region is in `deny`: it is excluded unless explicitly allowed.
3. If the region is in `allow`: it is included for querying.
4. If a region appears in both lists: it is excluded.
5. If only `deny` is specified: only regions in the `deny` list are excluded.
6. If only `allow` is specified: only regions in the `allow` list are included.

#### Example configuration

```yaml showLineNumbers
resources:
  - kind: AWS::Lambda::Function
    selector:
      query: 'true'
      regionPolicy:
        allow: ["us-east-1", "eu-west-1"]
        deny: ["us-west-2"]
    port:
      entity:
        mappings:
          identifier: .Properties.Arn
          title: .Properties.FunctionName
          blueprint: '"lambda"'
          properties:
            region: .__Region
            description: .Properties.Description
            arn: .Properties.Arn
          relations:
            account: .__ExtraContext.AccountId
```

In this example, resources in `us-east-1` and `eu-west-1` are allowed, while `us-west-2` is denied.

Refer to the individual resource documentation pages for a table of actions, their AWS mapping, and necessary IAM permissions.
