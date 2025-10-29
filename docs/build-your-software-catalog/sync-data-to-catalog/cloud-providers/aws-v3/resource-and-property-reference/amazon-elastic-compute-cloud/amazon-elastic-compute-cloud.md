# Amazon Elastic Compute Cloud

import Ec2InstanceBlueprint from './aws-ec2-instance/_ec2_instance_blueprint.mdx'
import Ec2InstanceConfig from './aws-ec2-instance/_ec2_instance_port_app_config.mdx'
import Ec2InstanceProperties from './aws-ec2-instance/_ec2_instance_properties.mdx'



## AWS::EC2::Instance

The following example demonstrates how to ingest your AWS EC2 instances to Port.

#### EC2 Instance Supported Actions

The table below summarizes the available actions for ingesting Amazon EC2 Instance resources in Port:

| Action                       | Description                                                | Type     | Required AWS Permission        |
|-----------------------------|------------------------------------------------------------|----------|--------------------------------|
| **DescribeInstancesAction** | Discover EC2 instances and retrieve detailed configuration data. [Reference](https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_DescribeInstances.html) | Default  | `ec2:DescribeInstances`        |
| **GetInstanceStatusAction** | Retrieve instance status information. [Reference](https://docs.aws.amazon.com/AWSEC2/latest/APIReference/API_DescribeInstanceStatus.html)                     | Optional | `ec2:DescribeInstanceStatus`   |

:::info Optional properties note
Properties of optional actions will not appear in the response unless you explicitly include the action that provides them in your configuration.
:::


You can use the following Port blueprint definitions and integration configuration:

<Ec2InstanceBlueprint/>

<Ec2InstanceConfig/>

For more details about EC2 instance properties, refer to the [AWS EC2 API documentation](https://docs.aws.amazon.com/AWSEC2/latest/APIReference/Welcome.html).
