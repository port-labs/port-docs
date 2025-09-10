---
sidebar_position: 1
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";
import Image from "@theme/IdealImage";
import MetricsAndSyncStatus from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_metrics_and_sync_status.mdx"

# Overview

:::warning Beta Feature
AWS Hosted by Port is currently in **beta mode** and is not yet available for all Port users. Contact your Port representative to request access to this integration.
:::

Port's AWS Hosted by Port integration allows you to import your AWS resources into Port with **zero maintenance required**. The integration is fully hosted and managed by Port, providing a seamless experience for discovering and managing your AWS infrastructure.

The integration periodically syncs your AWS resources to ensure your Port catalog stays up-to-date with your AWS infrastructure.

## Common use cases

Easily fill your software catalog with data directly from your AWS Organization, for example:

- Map all the resources in your AWS Accounts, including **ECS Clusters**, **S3 Buckets**, and **EC2 Instances** with zero maintenance required.
- Keep your Port catalog synchronized with your AWS infrastructure through periodic updates.
- Use relations to create complete, easily digestible views of your AWS infrastructure inside Port.
- Enjoy a fully managed experience with no infrastructure to maintain or updates to apply.

## Supported resources

The integration currently supports the following AWS resource types:
- `S3 Buckets`: Complete bucket information including properties, tags, and metadata.
- `ECS Clusters`: Cluster details, services, and task definitions.
- `EC2 Instances`: Instance information, security groups, and networking details.

:::info More Resource Types Coming Soon
We're actively working on adding support for additional AWS resource types to provide comprehensive coverage of your AWS infrastructure.
:::

## Key advantages over standard AWS integration

AWS Hosted by Port provides several advantages over the standard AWS integration:

- **Fully Hosted**: No infrastructure to maintain, update, or monitor.
- **Simplified Installation**: Just deploy CloudFormation templates to create IAM roles.
- **Complete Data**: Ensures no missing or incomplete resource information.
- **Periodic Sync**: Regular updates to keep your catalog current.
- **Zero Maintenance**: Port handles all updates, scaling, and infrastructure management.

## Getting started

Continue to the [installation](./installations.md) guide to learn how to install AWS Hosted by Port.

For detailed information about the IAM role architecture and security model, see the [IAM Role Architecture](./iam-role-architecture.md) guide.

## Configuration

Port integrations use a [YAML mapping block](/build-your-software-catalog/customize-integrations/configure-mapping#configuration-structure) to ingest data from the third-party api into Port.

The mapping makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from the integration API.

### Default mapping configuration

This is the default mapping configuration you get after installing AWS Hosted by Port.

<details>
<summary><b>Default mapping configuration (click to expand)</b></summary>

```yaml showLineNumbers
deleteDependentEntities: true
createMissingRelatedEntities: true
enableMergeEntity: true
resources:
  - kind: AWS::Account::Info
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: .Properties.Id
          title: .Properties.Name
          blueprint: '"awsAccount"'
  - kind: AWS::S3::Bucket
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: .Properties.Arn
          title: .Properties.BucketName
          blueprint: '"s3Bucket"'
          properties:
            arn: .Properties.Arn
            region: .Properties.LocationConstraint
            creationDate: .Properties.CreationDate
            tags: .Properties.Tags
          relations:
            account: .__ExtraContext.AccountId
  - kind: AWS::EC2::Instance
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: .Properties.InstanceId
          title: .Properties.InstanceId
          blueprint: '"ec2Instance"'
          properties:
            instanceType: .Properties.InstanceType
            state: .Properties.State.Name
            publicIpAddress: .Properties.PublicIpAddress
            privateIpAddress: .Properties.PrivateIpAddress
            tags: .Properties.Tags
            arn: >-
              "arn:aws:ec2:" + .__Region + ":" + .__AccountId + ":instance/" +
              .Properties.InstanceId
          relations:
            account: .__ExtraContext.AccountId
  - kind: AWS::ECS::Cluster
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: .Properties.ClusterArn
          title: .Properties.ClusterName
          blueprint: '"ecsCluster"'
          properties:
            status: .Properties.Status
            runningTasksCount: .Properties.RunningTasksCount
            activeServicesCount: .Properties.ActiveServicesCount
            pendingTasksCount: .Properties.PendingTasksCount
            registeredContainerInstancesCount: .Properties.RegisteredContainerInstancesCount
            capacityProviders: .Properties.CapacityProviders
            clusterArn: .Properties.ClusterArn
            tags: .Properties.Tags
          relations:
            account: .__ExtraContext.AccountId

```

</details>

<MetricsAndSyncStatus/>