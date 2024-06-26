---
sidebar_position: 3
---

# Event-Based Updates

Our AWS integration allows you to trigger a sync of your AWS resources with Port based on real-time events (in addition to the standard scheduled sync).
As a result, your software catalog will be updated shortly after a resource is created, updated or deleted.

## How it works

Many AWS services emit events to [AWS EventBridge](https://aws.amazon.com/eventbridge/) service, to the account’s default event bus.
Furthermore, the [AWS CloudTrail](https://aws.amazon.com/cloudtrail/) service automatically emits events for API calls from most AWS services.

A user can create an [AWS EventBridge rule](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-rules.html) to consume and transform particular events, and send them to a target, such as an [AWS SQS Queue](https://aws.amazon.com/sqs/).

[The AWS exporter application](./aws-exporter.md#exporter-aws-serverless-application) creates an SQS Queue as part of its installation process, and configures it as an event source for the exporter's lambda.

This allows you to set up an event rule, that consumes any events from the bus and sends them to the AWS exporter's queue.

Each event will have to be transformed as part of the event rule, before reaching the queue, to suit the exporter's lambda expected event structure.
The transformation goal is to map an event to a single AWS resource, that the exporter can handle.

The events in the queue are consumed automatically by the exporter's lambda, that will sync the updated state of the relevant AWS resources with Port.

### Input structure for a single event

The AWS exporter's lambda accepts JSON events with the following structure:

- `resource_type` - a hardcoded string representing the AWS resource type that is configured in the [`config.json`](./aws-exporter.md#exporter-configjson-file) of the AWS Exporter;
- `region` - A JQ query to get the region from the event, usually the value will be `"\"<awsRegion>\""`;
- `action` (Optional, defaults to `upsert`) - A JQ query to define the desired action: `upsert` or `delete` the Port entity of the matching resource. Will usually be based on the event name, like in the example below;
- `identifier` - A JQ query to calculate the resource identifier. In case the action is `upsert`, it should be the AWS Cloud Control API resource identifier. Otherwise, for `delete` actions, it should be the Port entity identifier. It is recommended to use a Port entity identifier that is identical to the Cloud Control API resource identifier (when applicable), this will make it possible to use the same event rule both for upsert and delete events (while also saving the need for complex JQ filtering patterns).

An example for such a JSON event:

```json showLineNumbers
{
  "requestFunctionName": "<requestFunctionName>",
  "responseFunctionName": "<responseFunctionName>",
  "eventName": "<eventName>",
  # highlight-start
  "resource_type": "AWS::Lambda::Function",
  "region": "\"<awsRegion>\"",
  "action": "if .eventName | startswith(\"Delete\") then \"delete\" else \"upsert\" end",
  "identifier": "if .responseFunctionName != \"\" then .responseFunctionName else .requestFunctionName end"
  # highlight-end
}
```

:::tip
To get the identifier formula of a specific resource type, like `AWS::Lambda::Function`, you can use the following command:

```bash showLineNumbers
aws cloudformation describe-type --type RESOURCE --type-name AWS::Lambda::Function --query "Schema" | jq 'fromjson | .primaryIdentifier | join("|")'

# Result
"/properties/FunctionName"
```

Here you can see that the identifier of a lambda function is the function name.

Another example, for the `AWS::ECS::Service` resource type:

```bash showLineNumbers
aws cloudformation describe-type --type RESOURCE --type-name AWS::ECS::Service --query "Schema" | jq 'fromjson | .primaryIdentifier | join("|")'

# Result
"/properties/ServiceArn|/properties/Cluster"
```

Here you have two properties in the formula: `/properties/ServiceArn` and `/properties/Cluster`. When there are multiple properties, the values in the identifier are separated by `|`.

For more information, read [**here**](https://docs.aws.amazon.com/cloudcontrolapi/latest/userguide/resource-identifier.html).
:::

### Event rule

#### Definition

The event rule is how you specify the exact events you want to consume, and define the target to send the modified event to (including the transformation to the input).

Before diving deep into the [event rule properties](#properties), here is a complete example of a `CloudFormation YAML template` to manage an event rule, for the AWS Exporter:

```yaml showLineNumbers
AWSTemplateFormatVersion: '2010-09-09'
Description: The template used to create event rules for the Port AWS exporter.

Parameters:
  PortAWSExporterStackName:
    Description: Name of the Port AWS exporter stack name
    Type: String
    MinLength: 1
    MaxLength: 255
    AllowedPattern: '^[a-zA-Z][-a-zA-Z0-9]*$'
    Default: serverlessrepo-port-aws-exporter

Resources:
  EventRule0:
    Type: AWS::Events::Rule
    Properties:
      EventBusName: default
      EventPattern:
        source:
          - aws.lambda
        detail-type:
          - AWS API Call via CloudTrail
        detail:
          eventSource:
            - lambda.amazonaws.com
          eventName:
            - prefix: UpdateFunctionConfiguration
            - prefix: CreateFunction
            - prefix: DeleteFunction
      Name: port-aws-exporter-sync-lambda-trails
      State: ENABLED
      Targets:
        - Id: 'PortAWSExporterEventsQueue'
          Arn:
            {
              'Fn::ImportValue':
                { 'Fn::Sub': '${PortAWSExporterStackName}-EventsQueueARN' },
            }
          InputTransformer:
            InputPathsMap:
              awsRegion: $.detail.awsRegion
              eventName: $.detail.eventName
              requestFunctionName: $.detail.requestParameters.functionName
              responseFunctionName: $.detail.responseElements.functionName
            InputTemplate: |-
              {
                "resource_type": "AWS::Lambda::Function",
                "requestFunctionName": "<requestFunctionName>",
                "responseFunctionName": "<responseFunctionName>",
                "eventName": "<eventName>",
                "region": "\"<awsRegion>\"",
                "identifier": "if .responseFunctionName != \"\" then .responseFunctionName else .requestFunctionName end",
                "action": "if .eventName | startswith(\"Delete\") then \"delete\" else \"upsert\" end"
              }
```

:::info
This example of CloudFormation stack can be used to act on changes of lambda functions.
Moreover, it includes a parameter called `PortAWSExporterStackName`, that refers to the main exporter's stack name. That way, we can send the events to the existing exporter's events queue, to sync relevant AWS resources.
:::

#### Properties

Let's review the properties of the event rule resource from above.

- The `EventBusName` property value is `default`, as this is the bus that gets events from various AWS services automatically:

```yaml showLineNumbers
Properties:
  # highlight-next-line
  EventBusName: default
  ...
```

- The `EventPattern` property defines which events to consume, including which event sources to process, which filters to apply based on the event structure.
  Here, we define the event pattern to consume Cloudtrail API calls, sourced from the lambda service; On top of that, we filter only the `UpdateFunctionConfiguration`, `CreateFunction` and `DeleteFunction` events:

```yaml showLineNumbers
Properties:
  EventBusName: default
  # highlight-start
  EventPattern:
    source:
      - aws.lambda
    detail-type:
      - AWS API Call via CloudTrail
    detail:
      eventSource:
        - lambda.amazonaws.com
      eventName:
        - prefix: UpdateFunctionConfiguration
        - prefix: CreateFunction
        - prefix: DeleteFunction
  # highlight-end
```

:::tip
For composing an event pattern, learn more about events from AWS services, including different sources and event names [here](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-service-event.html).

For supported services in CloudTrail, click [here](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-aws-service-specific-topics.html).
:::

- The `Targets` property defines the targets of the produced events.
  For the AWS exporter, we want to configure its own event queue as the target:

```yaml showLineNumbers
Properties:
  ...
  # highlight-start
  Targets:
    - Id: "PortAWSExporterEventsQueue"
      Arn: { "Fn::ImportValue" : {"Fn::Sub": "${PortAWSExporterStackName}-EventsQueueARN" } }
      ...
  # highlight-end
```

- The `InputTransformer` key in the `Targets` property defines the transformation that will be applied to the event, before sending it to the target queue;

```yaml showLineNumbers
Properties:
  ...
  Targets:
    - Id: "PortAWSExporterEventsQueue"
      Arn: { "Fn::ImportValue" : {"Fn::Sub": "${PortAWSExporterStackName}-EventsQueueARN" } }
      # highlight-next-line
      InputTransformer:
        ...
```

- The `InputPathsMap` key in `InputTransformer` defines which fields to extract from the event. It makes use of [`JSONPath`](https://goessner.net/articles/JsonPath/index.html) syntax to configure the extraction:

```yaml showLineNumbers
Properties:
  ...
  Targets:
    - Id: "PortAWSExporterEventsQueue"
      Arn: { "Fn::ImportValue" : {"Fn::Sub": "${PortAWSExporterStackName}-EventsQueueARN" } }
      InputTransformer:
        # highlight-start
        InputPathsMap:
          awsRegion: $.detail.awsRegion
          eventName: $.detail.eventName
          requestFunctionName: $.detail.requestParameters.functionName
          responseFunctionName: $.detail.responseElements.functionName
        # highlight-end
        ...
```

For instance, the event sent to the EventBridge bus for the `CreateFunction` lambda API call has the following structure:

```json showLineNumbers
{
  ...
  "detail": {
    ...
    "eventSource": "lambda.amazonaws.com",
    "eventName": "CreateFunction20150331",
    "awsRegion": "eu-west-1",
    ...
    "requestParameters": {
        "functionName": "test-function",
        ...
    },
    "responseElements": {
        "functionName": "test-function",
        ...
    },
    ...
  }
}
```

The `InputPathsMap` in the example below will extract only the `awsRegion`, `eventName`, and `functionName` from the API request and response.

- The `InputTemplate` key in `InputTransformer` defines a template of the final input that will be sent to the target queue, in the format the exporter's lambda [expects](#input-structure-for-a-single-event). The template is rendered using the values from the `InputPathsMap`:

```yaml showLineNumbers
Properties:
  ...
  Targets:
    - Id: "PortAWSExporterEventsQueue"
      Arn: { "Fn::ImportValue" : {"Fn::Sub": "${PortAWSExporterStackName}-EventsQueueARN" } }
      InputTransformer:
        InputPathsMap:
          awsRegion: $.detail.awsRegion
          eventName: $.detail.eventName
          requestFunctionName: $.detail.requestParameters.functionName
          responseFunctionName: $.detail.responseElements.functionName
        # highlight-start
        InputTemplate: |-
          {
            "resource_type": "AWS::Lambda::Function",
            "requestFunctionName": "<requestFunctionName>",
            "responseFunctionName": "<responseFunctionName>",
            "eventName": "<eventName>",
            "region": "\"<awsRegion>\"",
            "identifier": "if .responseFunctionName != \"\" then .responseFunctionName else .requestFunctionName end",
            "action": "if .eventName | startswith(\"Delete\") then \"delete\" else \"upsert\" end"
          }
        # highlight-end
```

Here, the `InputTemplate` takes the information extracted in the `InputPathsMap`, and constructs a message that will be sent to the SQS queue and consumed by the exporter’s lambda.
The message includes:

- The hardcoded resource type (`AWS::Lambda::Function`);
- The `awsRegion` from the event;
- A JQ query to figure out the action (`upsert` or `delete` the Port entity), based on the `eventName`;
- A JQ query to calculate the identifier, based on the function name from the API response or request.

:::info
To read more about input transformer in EventBridge, click [here](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-transform-target-input.html).
:::

## Next steps

### Examples

- Refer to the [examples](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/aws-exporter/examples/examples.md) page for practical configurations and their corresponding blueprint definitions.
- Refer to the Event Bridge rule [Terraform example](https://github.com/port-labs/terraform-aws-port-exporter/tree/main/examples/terraform_deploy_eventbridge_rule)
