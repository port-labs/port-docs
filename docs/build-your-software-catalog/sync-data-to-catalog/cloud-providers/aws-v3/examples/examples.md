---
sidebar_position: 0
---

import S3BucketBlueprint from './s3/buckets/_s3_bucket_blueprint.mdx'
import S3PortAppConfig from './s3/buckets/_s3_bucket_port_app_config.mdx'
import S3BucketProperties from './s3/buckets/_s3_bucket_properties.mdx'
import EcsClusterBlueprint from './ecs/clusters/_ecs_cluster_blueprint.mdx'
import EcsClusterConfig from './ecs/clusters/_ecs_cluster_port_app_config.mdx'
import EcsClusterProperties from './ecs/clusters/_ecs_cluster_properties.mdx'
import Ec2InstanceBlueprint from './ec2/instances/_ec2_instance_blueprint.mdx'
import Ec2InstanceConfig from './ec2/instances/_ec2_instance_port_app_config.mdx'
import Ec2InstanceProperties from './ec2/instances/_ec2_instance_properties.mdx'

# Examples

This page contains practical examples for mapping AWS resources to Port using AWS Hosted by Port.

These examples demonstrate how to create blueprints and configure mappings to ingest your AWS infrastructure into your Port software catalog.

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
