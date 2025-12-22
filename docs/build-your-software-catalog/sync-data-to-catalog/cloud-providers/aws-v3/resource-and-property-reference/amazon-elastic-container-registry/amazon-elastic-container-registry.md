# Amazon Elastic Container Registry (ECR)

import EcrRepositoryBlueprint from './aws-ecr-repository/_ecr_repository_blueprint.mdx'
import EcrRepositoryConfig from './aws-ecr-repository/_ecr_repository_port_app_config.mdx'
import EcrRepositoryExampleResponse from './aws-ecr-repository/_ecr_repository_example_response.mdx'

## AWS::ECR::Repository

The following example demonstrates how to ingest your AWS ECR repositories to Port.

#### ECR Repository supported actions

The table below summarizes the available actions for ingesting Amazon ECR Repository resources in Port:

| Action                   | Description                                                        | Type     | Required AWS Permission            |
|--------------------------|--------------------------------------------------------------------|----------|------------------------------------|
| [DescribeRepositoriesAction](https://docs.aws.amazon.com/AmazonECR/latest/APIReference/API_DescribeRepositories.html) | Discover ECR repositories and retrieve detailed configuration data. | Default  | `ecr:DescribeRepositories` |
| [GetRepositoryPolicyAction](https://docs.aws.amazon.com/AmazonECR/latest/APIReference/API_GetRepositoryPolicy.html) | Retrieve the repository policy for ECR repositories. | Optional | `ecr:GetRepositoryPolicy` |
| [GetLifecyclePolicyAction](https://docs.aws.amazon.com/AmazonECR/latest/APIReference/API_GetLifecyclePolicy.html) | Retrieve the lifecycle policy for ECR repositories. | Optional | `ecr:GetLifecyclePolicy` |
| [ListTagsForResourceAction](https://docs.aws.amazon.com/AmazonECR/latest/APIReference/API_ListTagsForResource.html) | Retrieve tags associated with ECR repositories. | Optional | `ecr:ListTagsForResource` |

:::info Optional Properties Note
Properties of optional actions will not appear in the response unless you explicitly include the action that provides them in your configuration.
:::

You can use the following Port blueprint definitions and integration configuration:

<EcrRepositoryBlueprint/>

<EcrRepositoryConfig/>

#### Example response

The following example shows the structure of the response data that Port processes for an ECR repository.

<EcrRepositoryExampleResponse/>

For more details about ECR repository properties, refer to the [AWS ECR API documentation](https://docs.aws.amazon.com/AmazonECR/latest/APIReference/Welcome.html).
