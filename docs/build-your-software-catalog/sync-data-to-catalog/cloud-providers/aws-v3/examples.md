---
sidebar_position: 4
---

import AccountInfoBlueprint from './examples/account_info/_account_info_blueprint.mdx'
import AccountInfoConfig from './examples/account_info/_account_info_port_app_config.mdx'
import S3BucketBlueprint from './examples/s3/buckets/_s3_bucket_blueprint.mdx'
import S3PortAppConfig from './examples/s3/buckets/_s3_bucket_port_app_config.mdx'
import S3BucketProperties from './examples/s3/buckets/_s3_bucket_properties.mdx'
import EcsClusterBlueprint from './examples/ecs/clusters/_ecs_cluster_blueprint.mdx'
import EcsClusterConfig from './examples/ecs/clusters/_ecs_cluster_port_app_config.mdx'
import EcsClusterProperties from './examples/ecs/clusters/_ecs_cluster_properties.mdx'
import EksClusterBlueprint from './examples/eks/clusters/_eks_cluster_blueprint.mdx'
import EksClusterConfig from './examples/eks/clusters/_eks_cluster_port_app_config.mdx'
import EksClusterProperties from './examples/eks/clusters/_eks_cluster_properties.mdx'
import Ec2InstanceBlueprint from './examples/ec2/instances/_ec2_instance_blueprint.mdx'
import Ec2InstanceConfig from './examples/ec2/instances/_ec2_instance_port_app_config.mdx'
import Ec2InstanceProperties from './examples/ec2/instances/_ec2_instance_properties.mdx'
import OrganizationsAccountBlueprint from './examples/organizations/accounts/_organizations_accounts_blueprint.mdx'
import OrganizationsAccountConfig from './examples/organizations/accounts/_organizations_accounts_port_app_config.mdx'
import OrganizationsAccountProperties from './examples/organizations/accounts/_organizations_accounts_properties.mdx'

# Examples

This page contains practical examples for mapping AWS resources to Port using AWS Hosted by Port.

These examples demonstrate how to create blueprints and configure mappings to ingest your AWS infrastructure into your Port software catalog.

## AWS Account

### AccountInfo

The following example demonstrates how to ingest your AWS Account information to Port.

You can use the following Port blueprint definitions and integration configuration:

<AccountInfoBlueprint/>

<AccountInfoConfig/>

## AWS Organizations

### Organizations Accounts

The following example demonstrates how to ingest your AWS Organizations Accounts to Port.

You can use the following Port blueprint definitions and integration configuration:

<OrganizationsAccountBlueprint/>

<OrganizationsAccountConfig/>

You can reference any of the following Organizations Account properties in your mapping configuration:

<OrganizationsAccountProperties/>

For more details about Organizations Account properties, refer to the [AWS Organizations API documentation](https://docs.aws.amazon.com/organizations/latest/APIReference/API_DescribeAccount.html).

## Amazon S3

### S3 buckets

The following example demonstrates how to ingest your AWS S3 buckets to Port.

You can use the following Port blueprint definitions and integration configuration:

<S3BucketBlueprint/>

<S3PortAppConfig/>

You can reference any of the following S3 bucket properties in your mapping configuration:

<S3BucketProperties/>

For more details about S3 bucket properties, refer to the [AWS S3 API documentation](https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListBuckets.html).

## Amazon ECS

### ECS clusters

The following example demonstrates how to ingest your AWS ECS clusters to Port.

You can use the following Port blueprint definitions and integration configuration:

<EcsClusterBlueprint/>

<EcsClusterConfig/>

You can reference any of the following ECS cluster properties in your mapping configuration:

<EcsClusterProperties/>

For more details about ECS cluster properties, refer to the [AWS ECS API documentation](https://docs.aws.amazon.com/AmazonECS/latest/APIReference/API_DescribeClusters.html).

## Amazon EKS

### EKS clusters

The following example demonstrates how to ingest your AWS EKS clusters to Port.

You can use the following Port blueprint definitions and integration configuration:

<EksClusterBlueprint/>

<EksClusterConfig/>

You can reference any of the following EKS cluster properties in your mapping configuration:

<EksClusterProperties/>

For more details about EKS cluster properties, refer to the [AWS EKS API documentation](https://docs.aws.amazon.com/eks/latest/APIReference/API_DescribeCluster.html).

## Amazon EC2

### EC2 instances

The following example demonstrates how to ingest your AWS EC2 instances to Port.

You can use the following Port blueprint definitions and integration configuration:

<Ec2InstanceBlueprint/>

<Ec2InstanceConfig/>

You can reference any of the following EC2 instance properties in your mapping configuration:

<Ec2InstanceProperties/>

For more details about EC2 instance properties, refer to the [AWS EC2 API documentation](https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_DescribeInstances.html).

:::info More resource types coming soon
We're actively working on adding support for additional AWS resource types to provide comprehensive coverage of your AWS infrastructure.
:::
