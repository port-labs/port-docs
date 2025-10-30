# Amazon Elastic Kubernetes Service

import EksClusterBlueprint from './aws-eks-cluster/_eks_cluster_blueprint.mdx'
import EksClusterConfig from './aws-eks-cluster/_eks_cluster_port_app_config.mdx'



## AWS::EKS::Cluster

The following example demonstrates how to ingest your AWS EKS clusters to Port.

#### EKS Cluster Supported Actions

The table below summarizes the available actions for ingesting Amazon EKS Cluster resources in Port:

| Action                    | Description                                                                                                  | Type    | Required AWS Permission |
|---------------------------|--------------------------------------------------------------------------------------------------------------|---------|-------------------------|
| **DescribeClusterAction** | Retrieve detailed configuration data for each cluster. [Reference](https://docs.aws.amazon.com/eks/latest/APIReference/API_DescribeCluster.html) | Default | `eks:DescribeCluster` `eks:ListClusters`  |

::::info All properties available by default
EKS clusters expose their key properties via the default DescribeCluster action.
::::

You can use the following Port blueprint definitions and integration configuration:

<EksClusterBlueprint/>

<EksClusterConfig/>

For more details about EKS cluster properties, refer to the [AWS EKS API documentation](https://docs.aws.amazon.com/eks/latest/APIReference/Welcome.html).
