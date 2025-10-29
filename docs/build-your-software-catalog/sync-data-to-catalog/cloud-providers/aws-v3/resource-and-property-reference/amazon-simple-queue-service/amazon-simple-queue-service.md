# Amazon Simple Queue Service

import SqsQueueBlueprint from './aws-sqs-queue/_sqs_queue_blueprint.mdx'
import SqsQueueConfig from './aws-sqs-queue/_sqs_queue_port_app_config.mdx'
import SqsQueueProperties from './aws-sqs-queue/_sqs_queue_properties.mdx'




## AWS::SQS::Queue

The following example demonstrates how to ingest your AWS SQS queues to Port.

#### SQS Queue Supported Actions

The table below summarizes the available actions for ingesting Amazon SQS Queue resources in Port:

| Action                       | Description                                                                              | Type     | Required AWS Permission |
|-----------------------------|------------------------------------------------------------------------------------------|----------|-------------------------|
| **ListQueuesAction**        | Discover all SQS queues across your AWS account. [Reference](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/API_ListQueues.html)                                         | Default  | `sqs:ListQueues`        |
| **GetQueueAttributesAction**| Retrieve detailed configuration and operational data for each queue. [Reference](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/API_GetQueueAttributes.html)                      | Default  | `sqs:GetQueueAttributes`|
| **GetQueueTagsAction**      | Bring in custom tags assigned to your queues for advanced catalog filtering and grouping. [Reference](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/API_ListQueueTags.html) | Optional | `sqs:ListQueueTags`     |

:::info Optional properties note
Properties of optional actions will not appear in the response unless you explicitly include the action that provides them in your configuration.
:::


You can use the following Port blueprint definitions and integration configuration:

<SqsQueueBlueprint/>

<SqsQueueConfig/>

For more details about SQS queue properties, refer to the [AWS SQS API documentation](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/APIReference/API_GetQueueAttributes.html).


