# AWS Resource and Property Reference

Welcome to the reference guide for AWS resource and property types, as supported by AWS CloudFormation and used in Port integrations.

## Overview of Supported Resource Types

Explore detailed documentation for each AWS resource and property type available for integration. For each type, you'll find information about supported actions, key properties, required permissions, and usage best practices.

Resource type identifiers follow a standardized format, allowing you to easily recognize and reference each AWS entity:

```
service-provider::service-name::data-type-name
```

For example, an EC2 instance is identified as:

```
AWS::EC2::Instance
```

Refer to the sidebar or the list below to navigate to individual resource reference pages where you'll find actionable integration details, sample configurations, and official AWS documentation links.

- [Amazon Simple Queue Service](./amazon-simple-queue-service/amazon-simple-queue-service.md)
- [Amazon Simple Storage Service](./amazon-simple-storage-service/amazon-simple-storage-service.md)
- [Amazon Elastic Compute Cloud](./amazon-elastic-compute-cloud/amazon-elastic-compute-cloud.md)
- [Amazon Elastic Container Service](./amazon-elastic-container-service/amazon-elastic-container-service.md)
- [AWS Organizations](./aws-organizations/aws-organizations.md)


## Actions

**Actions** define the set of API operations performed to discover and fetch resources within your AWS environment. These actions are mapped directly to AWS API calls—for example, `DescribeInstances` for EC2 or `ListBuckets` for S3—which determine the resource data that Port can ingest and keep up to date.

### How Actions Map to AWS Operations

Each Port-supported resource type comes with a set of actions that align with AWS's official API operations. For instance:

- For **Amazon S3 Buckets**, the `ListBucketsAction` leverages the [ListBuckets API](https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListBuckets.html), and additional actions like `GetBucketTaggingAction` or `GetBucketEncryptionAction` invoke their respective AWS endpoints.
- For **EC2 Instances**, `DescribeInstancesAction` maps to the [DescribeInstances API](https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_DescribeInstances.html) and brings in detailed instance configuration.

These mappings ensure that only the properties available from the selected AWS actions are ingested into your Port catalog.

### How to Enable and Customize Actions

Port allows you to tailor the discovery and ingestion of AWS resource data by configuring which actions are enabled for each resource type. Actions determine what properties are collected and what AWS permissions are needed.

- **Default Actions**: These actions are automatically enabled and provide basic resource discovery (such as listing all S3 buckets or EC2 instances).
- **Optional Actions**: Enable these to enrich your catalog with additional resource properties, such as tags, encryption settings, or advanced metadata. Optional actions must be explicitly specified in your integration configuration.

:::tip Enabling optional actions for more data
To collect extra properties from AWS resources, add the relevant optional actions to your Port integration configuration. For instance, if you want to ingest the status of EC2 instances, include `DescribeInstanceStatusAction` in the configuration.
:::

```yaml
- kind: AWS::EC2::Instance
  selector:
    query: 'true'
    includeActions:
      - DescribeInstanceStatusAction
```

:::caution Ensure required AWS permissions are granted
Each action requires specific AWS IAM permissions. Your integration’s AWS credentials must have these permissions; otherwise, the action will not succeed and its data will not be available in Port.
:::

### Summary

- **Actions in Port = AWS API Calls**: The available and enabled actions directly control what data about AWS resources Port can ingest.
- **Configurable per Resource**: Optional actions let you tailor the integration based on the level of detail required.
- **Permissions matter**: Ensure AWS IAM users or roles associated with your integration grant all permissions required by your chosen actions.

Refer to the individual resource documentation pages for a table of actions, their AWS mapping, and necessary IAM permissions.
