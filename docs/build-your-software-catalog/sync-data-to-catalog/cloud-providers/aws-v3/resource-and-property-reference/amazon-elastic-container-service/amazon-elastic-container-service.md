# Amazon Elastic Container Service

import EcsClusterBlueprint from './aws-ecs-cluster/_ecs_cluster_blueprint.mdx'
import EcsClusterConfig from './aws-ecs-cluster/_ecs_cluster_port_app_config.mdx'
import EcsServiceBlueprint from './aws-ecs-service/_ecs_service_blueprint.mdx'
import EcsServiceConfig from './aws-ecs-service/_ecs_service_port_app_config.mdx'



## AWS::ECS::Cluster

The following example demonstrates how to ingest your AWS ECS clusters to Port.

#### ECS Cluster Supported Actions

The table below summarizes the available actions for ingesting Amazon ECS Cluster resources in Port:

| Action                   | Description                                                        | Type    | Required AWS Permission            |
|--------------------------|--------------------------------------------------------------------|---------|------------------------------------|
| **DescribeClustersAction** | Discover ECS clusters and retrieve detailed configuration data. [Reference](https://docs.aws.amazon.com/AmazonECS/latest/APIReference/API_DescribeClusters.html) | Default | `ecs:ListClusters`, `ecs:DescribeClusters` |

:::info All properties available by default
ECS clusters expose their key properties via the default DescribeClusters action.
:::


You can use the following Port blueprint definitions and integration configuration:

<EcsClusterBlueprint/>

<EcsClusterConfig/>



## AWS::ECS::Service

The following example demonstrates how to ingest your AWS ECS services to Port.

#### ECS Service Supported Actions

The table below summarizes the available actions for ingesting Amazon ECS Service resources in Port:

| Action                      | Description                                                                                             | Type     | Required AWS Permission              |
|-----------------------------|---------------------------------------------------------------------------------------------------------|----------|--------------------------------------|
| **DescribeServicesAction**  | Discover ECS services within your clusters and retrieve detailed configuration data. [Reference](https://docs.aws.amazon.com/AmazonECS/latest/APIReference/API_DescribeServices.html) | Default  | `ecs:ListServices`, `ecs:DescribeServices` |

:::info Optional properties note
Properties of optional actions will not appear in the response unless you explicitly include the action that provides them in your configuration.
:::

You can use the following Port blueprint definitions and integration configuration:

<EcsServiceBlueprint/>

<EcsServiceConfig/>



For more details about ECS cluster properties, refer to the [AWS ECS API documentation](https://docs.aws.amazon.com/AmazonECS/latest/APIReference/Welcome.html).
