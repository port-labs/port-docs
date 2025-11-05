# Amazon Elastic Compute Cloud

import Ec2InstanceBlueprint from './aws-ec2-instance/_ec2_instance_blueprint.mdx'
import Ec2InstanceConfig from './aws-ec2-instance/_ec2_instance_port_app_config.mdx'



## AWS::EC2::Instance

The following example demonstrates how to ingest your AWS EC2 instances to Port.

#### EC2 Instance supported actions

The table below summarizes the available actions for ingesting Amazon EC2 Instance resources in Port:

| Action                       | Description                                                | Type     | Required AWS Permission        |
|-----------------------------|------------------------------------------------------------|----------|--------------------------------|
| [DescribeInstancesAction](https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_DescribeInstances.html) | Discover EC2 instances and retrieve detailed configuration data. | Default  | `ec2:DescribeInstances`        |
| [GetInstanceStatusAction](https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_DescribeInstanceStatus.html) | Retrieve instance status information.                     | Optional | `ec2:DescribeInstanceStatus`   |

:::info Optional Properties Note
Properties of optional actions will not appear in the response unless you explicitly include the action that provides them in your configuration.
:::


You can use the following Port blueprint definitions and integration configuration:

<Ec2InstanceBlueprint/>

<Ec2InstanceConfig/>

For more details about EC2 instance properties, refer to the [AWS EC2 API documentation](https://docs.aws.amazon.com/AWSEC2/latest/APIReference/Welcome.html).
