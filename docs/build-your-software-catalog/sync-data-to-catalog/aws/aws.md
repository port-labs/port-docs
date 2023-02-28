---
sidebar_position: 1
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";
import Image from "@theme/IdealImage";
import FindCredentials from "../api/\_template_docs/\_find_credentials_collapsed.mdx";

# AWS

Our integration with AWS provides the ability to export your AWS resources to Port, according to your configuration.
You can define the integration to run both on schedule and on events.

:::tip
Port's AWS exporter is open source, view the source code [**here**](https://github.com/port-labs/port-aws-exporter).
:::

## 💡 AWS exporter common use cases

Our AWS exporter allows you to easily enrich your software catalog with data from your AWS accounts, for instance:

- Map resources in your accounts, including **S3 buckets**, **lambda functions**, **SQS queues**, **RDS DB instances**, **ECS services** and many other resource types;
- Use relations to create a complete, easily digestible map of your AWS accounts inside Port;
- etc.

## How it works

Port's AWS exporter can retrieve all the resources supported by the [AWS Cloud Control API](https://docs.aws.amazon.com/cloudcontrolapi/latest/userguide/what-is-cloudcontrolapi.html).

The open source AWS exporter allows you to perform extract, transform, load (ETL) on data from AWS into the desired software catalog data model.

The exporter is deployed using an [AWS serverless application](https://aws.amazon.com/serverless/sam/) that is installed on the account.

[The serverless application](#exporter-aws-serverless-application) requires a [JSON configuration file](#exporter-configjson-file) to describe the ETL process to load data into the developer portal, and an [IAM policy](#iam-policy) with the necessary permissions to list and read the configured resources.

The exporter makes use of [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from the AWS objects.

### Exporter `config.json` file

The `config.json` file is how you specify the exact resources you want to export from your AWS account, and also which entities and which properties in Port, you want to fill in with data.

Here is an example snippet of the `config.json` file which demonstrates the ETL process for getting `lambda functions` data from the account into the software catalog:

```json showLineNumbers
{
  "resources": [
    {
      "kind": "AWS::Lambda::Function",
      "selector": {
        "aws": {
          "regions": ["us-east-1", "us-west-1"]
        }
      },
      "port": {
        "entity": {
          "mappings": [
            {
              "identifier": ".FunctionName",
              "title": ".FunctionName",
              "blueprint": "function",
              "properties": {
                "memory": ".MemorySize",
                "timeout": ".Timeout",
                "runtime": ".Runtime"
              }
            }
          ]
        }
      }
    }
  ]
}
```

#### structure

- The root key of the `config.json` file is the `resources` key;
- The `kind` key is a specifier for a resource type from the AWS Cloud Control API following the `service-provider::service-name::data-type-name` format:

  ```json showLineNumbers
  # highlight-next-line
  "resources": [
    {
      # highlight-next-line
      "kind": "AWS::Lambda::Function",
      ...
  ```

  :::tip
  To generate a list of supported resource types using AWS CLI, combine the results of the following commands:

  ```bash showLineNumbers
  aws cloudformation list-types --type RESOURCE --visibility PUBLIC --provisioning-type FULLY_MUTABLE
  aws cloudformation list-types --type RESOURCE --visibility PUBLIC --provisioning-type IMMUTABLE
  aws cloudformation list-types --type RESOURCE --visibility PRIVATE --provisioning-type FULLY_MUTABLE
  aws cloudformation list-types --type RESOURCE --visibility PRIVATE --provisioning-type IMMUTABLE
  ```

  To determine if a specific `<RESOURCE_TYPE>` is supported, use this command (JQ required, output is `true` or `false`):

  ```bash showLineNumbers
  aws cloudformation describe-type --type RESOURCE --type-name <RESOURCE_TYPE> --query "ProvisioningType" | jq -c '. == "FULLY_MUTABLE" or . == "IMMUTABLE"'
  ```

  For more information, read [**here**](https://docs.aws.amazon.com/cloudcontrolapi/latest/userguide/resource-types.html#resource-types-determine-support).
  :::

- The `selector` key let you filter exactly which objects from the specified `kind` will be ingested to the software catalog;
- The `query` key in the `selector` is a JQ boolean query. If evaluated to false for an object, the object will not be synced;
- The `aws` key in the `selector` let you specify a list of `regions` to sync from.

  ```json showLineNumbers
  "resources": [
    {
      "kind": "AWS::Lambda::Function",
      # highlight-start
      "selector": {
        "query": "true",
        "aws": {
          "regions": [
            "us-east-1",
            "us-west-1"
          ]
        }
      },
      # highlight-end
      "port":
      ...
  ```

  :::tip
  You can choose to deploy the exporter per region, or in one region of your choice. The `regions` configuration key might be useful if you want to install the exporter in one region, but to export data from multiple regions.
  :::

  Some example use cases:

  - To sync all objects from the specified `kind` in the default region - do not specify a `selector`;
  - To sync all lambdas that are not owned by AWS Amplify service:

    ```json showLineNumbers
    query: .FunctionName | startswith("amplify") | not
    ```

  - etc.

  :::info

  - For some resources you have to provide additional information. For example, in order to sync all `AWS ELB Listeners` of a specific load balancer, use the `regions_config` and `resources_models` keys:

    ```json showLineNumbers
    "selector": {
        "aws": {
          "regions": [
            "eu-west-1"
          ],
          # highlight-start
          "regions_config": {
            "eu-west-1": {
              "resources_models": [
                "{\"LoadBalancerArn\": \"<AWS_ELB_ARN>\"}"
              ]
            }
          }
          # highlight-end
        }
    }
    ```

  The table of the special resources with the required properties can be found [here](https://docs.aws.amazon.com/cloudcontrolapi/latest/userguide/resource-operations-list.html#resource-operations-list-containers).
  :::

- The `port`, `entity` and the `mappings` keys open the section used to map the AWS resource fields to Port entities, the `mappings` key is an array where each object matches the structure of an [entity](../sync-data-to-catalog.md#entity-json-structure).
- Each mapping value is a JQ query, except for `blueprint` which has to be a static string.

  ```json showLineNumbers
  "resources": [
    {
      "kind": "AWS::Lambda::Function",
      "selector": {
        "aws": {
          "regions": [
            "us-east-1",
            "us-west-1"
          ]
        }
      },
      # highlight-start
      "port": {
        "entity": {
          "mappings": [
            {
              "identifier": ".FunctionName",
              "title": ".FunctionName",
              "blueprint": "function",
              "properties": {
                "memory": ".MemorySize",
                "timeout": ".Timeout",
                "runtime": ".Runtime"
              }
            }
          ]
        }
      }
      # highlight-end
    }
    ...
  ```

  :::info **IMPORTANT**

  - **The order of the resources matters** when you have relations between resources.
    The AWS exporter will sync the resources in the same order as they appear in the `config.json`, so make sure to sort the resources by a logical order.

    For example, if you have a relation from SNS Topic to lambda function, put the Lambda function configuration first.

  - By its nature, the AWS exporter will keep the values of unmapped properties untouched. Go [here](../api/api.md?operation=create-update#usage) for further explanation about different entity creation strategies.

  :::

  :::tip View a resource type schema
  To view a resource type schema and use it to compose a mapping, use [this](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-template-resource-type-ref.html) reference.

  Pay attention that not all of the resource types listed in the reference are available for use with the Cloud Control API. A method to determine if a resource type is available discussed [here](#structure).

  For additional options and information, read [here](https://docs.aws.amazon.com/cloudcontrolapi/latest/userguide/resource-types.html#resource-types-schemas).
  :::

### IAM Policy

The AWS exporter uses an [`AWS IAM Policy`](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html) which specifies the permissions to `list` and `read` the AWS resources you want to export (the ones you configured in the [`config.json`](#exporter-configjson-file)).

For example, in order to export `lambda functions`, you need to create a policy with the following definition:

```json showLineNumbers
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "VisualEditor0",
      "Effect": "Allow",
      "Action": [
        "lambda:GetFunction",
        "lambda:GetFunctionCodeSigningConfig",
        "lambda:ListFunctions"
      ],
      "Resource": "*"
    }
  ]
}
```

:::tip Find resource actions for policy
In order to find the resource actions that should be added to the policy, you should view the resource type schema, and locate the permissions for the **read** and **list** `handlers`.

Use the following command to get the resource action for a specific `<RESOURCE_TYPE>` (AWS CLI and JQ required):

```bash showLineNumbers
aws cloudformation describe-type --type RESOURCE --type-name <RESOURCE_TYPE> --query "Schema" | jq -c 'fromjson | .handlers | with_entries(select([.key] | inside(["list", "read"]))) | map(.permissions) | flatten'
```

More details can be found [here](https://docs.aws.amazon.com/cloudcontrolapi/latest/userguide/resource-types.html#resource-types-schemas).
:::

### Exporter S3 Bucket

The exporter's [`config.json`](#exporter-configjson-file) file needs to be saved to an [`AWS S3 Bucket`](https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingBucket.html).

You can create and manage your own bucket or let the exporter do that for you.
In any case, you need to upload the [`config.json`](#exporter-configjson-file) to the bucket, when it's available.

### Port Credentials Secret

In order to manage entities in Port, the exporter needs access to your Port credentials, these are provided to the exporter via an [`AWS Secrets Manager`](https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html) secret.

The secret value should be in the following format:

```json showLineNumbers
{ "id": "<CLIENT_ID>", "clientSecret": "<CLIENT_SECRET>" }
```

Similarly to the bucket, you can create and manage your own secret, or delegate it to the exporter.
Either way, you need to add Port's credentials to the secret on your own, when the secret is ready.

### Exporter AWS serverless application

The `Exporter AWS serverless application` is how you install the exporter's [CloudFormation stack](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/stacks.html).

The stack consists of several components:

- [S3 bucket](#exporter-s3-bucket) - where the [`config.json`](#exporter-configjson-file) should be saved;
- [ASM secret](#port-credentials-secret) - where you should save your Port credentials (client id and secret), to allow the exporter to interact with Port's API;
- [Lambda function](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-concepts.html#gettingstarted-concepts-function) - a resource that you can invoke to run the exporter code. The [IAM policy](#iam-policy) is attached to the execution role of the Lambda function;
- [SQS queue](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/welcome.html) - a queue of events, to be consumed by the exporter. Read [here](./run-on-events.md) to learn how to use the exporter to consume and act on live events from different AWS services;
- [EventsBridge scheduled rule](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-create-rule-schedule.html) - a rule to run the exporter on a schedule.

In order to deploy the application, you will need to fill in the following parameters:

- **Cloud Formation related parameters:**
  - `Application name` - The stack name of the application created via `AWS CloudFormation`.
- **Bucket related parameters:**
  - `CreateBucket` - `true` if you want the application to create and manage your bucket, or `false` if you want to create the bucket on your own.
  - `BucketName` - The name of your bucket, or a globally unique name for a new bucket.
  - `ConfigJsonFileKey` - The file key (path) to the [`config.json`](#exporter-configjson-file) in the bucket.
- **IAM Policy related parameters:**
  - `CustomIAMPolicyARN` - The ARN of the [IAM policy](#iam-policy).
- **Secret related parameters:**

  - `CustomPortCredentialsSecretARN` - The ARN of the Port credentials secret;

    **OR**

  - `SecretName` - The name for the new Port credentials secret to create.

- **Lambda related parameters:**
  - `FunctionName` - The function name for the exporter's lambda.
  - `ScheduleExpression` - The [schedule expression](https://docs.aws.amazon.com/lambda/latest/dg/services-cloudwatchevents-expressions.html) to define an event schedule for the exporter.
  - `ScheduleState` - The schedule initial state - `ENABLED` or `DISABLED`. We recommend to enable it only after one successful run.

## Prerequisites

- You will need your [Port credentials](../api/api.md#find-your-port-credentials) to install the AWS exporter.

:::tip
<FindCredentials />
:::

To run some optional commands in this guide, you will need to install:

- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)
- [JQ](https://stedolan.github.io/jq/download/)

## Installation

1. Prepare a [`config.json`](#exporter-configjson-file) file that will define which AWS resources to ingest to Port;

2. Create the [`IAM policy`](#iam-policy) that provides permissions to `list` and `read` the AWS resources in the `config.json`;

   :::tip Create a policy
   An IAM policy reference is available [here](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_create.html).
   :::

3. Deploy our [`serverless application`](#exporter-aws-serverless-application).

   <Tabs groupId="deploy-options" defaultValue="AWSConsole" values={[{label: "AWS Console", value: "AWSConsole"}, {label: "AWS CLI", value: "AWSCLI"}]}>

   <TabItem value="AWSConsole">

   You can deploy the application from the AWS console through this [link](https://eu-west-1.console.aws.amazon.com/lambda/home?region=eu-west-1#/create/app?applicationId=arn:aws:serverlessrepo:eu-west-1:185657066287:applications/port-aws-exporter).

   </TabItem>
      
   <TabItem value="AWSCLI">

   Follow these steps:

   1. Create a `parameters.json` file to override certain parameters values. For example (replace the placeholders):

      ```json showLineNumbers
      [
        {
          "Name": "CustomIAMPolicyARN",
          "Value": "<YOUR_IAM_POLICY_ARN>"
        },
        {
          "Name": "CustomPortCredentialsSecretARN",
          "Value": "<YOUR_PORT_CREDENTIALS_SECRET_ARN>"
        },
        {
          "Name": "CreateBucket",
          "Value": "false"
        },
        {
          "Name": "BucketName",
          "Value": "<YOUR_BUCKET_NAME>"
        },
        {
          "Name": "ScheduleExpression",
          "Value": "rate(1 hour)"
        },
        {
          "Name": "ScheduleState",
          "Value": "DISABLED"
        }
      ]
      ```

   2. Use the following command to create a change set:

      ```bash showLineNumbers
      aws serverlessrepo create-cloud-formation-change-set --application-id arn:aws:serverlessrepo:eu-west-1:185657066287:applications/port-aws-exporter --stack-name port-aws-exporter --capabilities CAPABILITY_IAM CAPABILITY_RESOURCE_POLICY --parameter-overrides file://parameters.json

      # Result
      {
        "ApplicationId": "arn:aws:serverlessrepo:eu-west-1:185657066287:applications/port-aws-exporter",
        "ChangeSetId": "<ChangeSetId>",
        ...
      }
      ```

   3. With the `<ChangeSetId>` from the previous command output, deploy the change set:

      ```bash showLineNumbers
      aws cloudformation execute-change-set --change-set-name "<ChangeSetId>"
      ```

   </TabItem>

   </Tabs>

   :::info

   After the deployment is complete, use the following AWS SAM CLI command to get a useful list of the exporter's resources:

   ```bash showLineNumbers
   sam list stack-outputs --stack-name serverlessrepo-port-aws-exporter
   ```

   The list includes:

   - `Lambda Function ARN` - the ARN of the exporter's Lambda;
   - `Port Credentials Secret ARN` - the ARN of the Port credentials secret;
   - `ConfigBucketName` - the exporter's bucket name.

   :::

   :::tip Deploy a serverless application
   For more information regarding how to deploy a serverless application, click [here](https://docs.aws.amazon.com/serverlessrepo/latest/devguide/serverlessrepo-how-to-consume.html).
   :::

4. Update the [`Port credentials secret`](#port-credentials-secret) with your credentials;

   :::tip Modify a secret
   To learn how to modify a secret's value, look [here](https://docs.aws.amazon.com/secretsmanager/latest/userguide/manage_update-secret.html).
   :::

5. Upload the `config.json` to the [exporter's S3 bucket](#s3-bucket).

   :::tip Upload a file to an S3 bucket
   To learn how to upload a file to S3, look [here](https://docs.aws.amazon.com/AmazonS3/latest/userguide/upload-objects.html).
   :::

## Test the application

In order to test the deployed application, you should run the exporter's lambda with an empty test event (`{}`), and review the execution status and logs.

:::tip Invoke a function with a test event
A reference showing how to invoke a lambda function with a test event can be found [here](https://docs.aws.amazon.com/lambda/latest/dg/testing-functions.html#invoke-with-event).
:::

:::info
The exporter's lambda can run for more than 15 minutes (the maximum amount of time that a Lambda function can run).
If a function has been running for more than 10 minutes, and there are any resources left to sync, a new lambda instance will be launched to continue the syncing process.

:::

### Troubleshooting

#### View the logs

To view the logs of all the lambda instances in one place, you can use [Cloudwatch Logs](https://docs.aws.amazon.com/lambda/latest/dg/monitoring-cloudwatchlogs.html#monitoring-cloudwatchlogs-console) or [AWS SAM Logs](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-logging.html):

```bash showLineNumbers
sam logs --stack-name serverlessrepo-port-aws-exporter --tail
```

## Update the schedule settings

After running the exporter successfully for the first time, you probably want to alter the scheduling related properties of the CloudFormation stack:

- `ScheduleExpression` - Make sure to set an interval that is longer than the time it takes for the exporter to execute;
- `ScheduleState` - Set the schedule state to `ENABLED`.

:::info
In order to determine lambda execution time, you can [view the logs](#view-the-logs), and search for the first and last log lines.
When the exporter finishes its syncing work, it writes the following log: `Done handling your resources`.
:::

:::tip Update an application
Updating an application's setting or version is done using the same procedure as deploying a new application, similar to step 3 of the [installation](#installation).
By default, the latest available version of the exporter will be used when you run the update/deploy procedure.

For more details, click [here](https://docs.aws.amazon.com/serverlessrepo/latest/devguide/serverlessrepo-how-to-consume-new-version.html).
:::

## Next steps

### Configure the AWS Exporter to run on events

In addition to running it on schedule, the AWS exporter can be used to act on live events, such as create, update and delete of a resource.

That way you can configure a resource to be synced as soon as it changed, in real time.

Refer to the [run on events](./run-on-events.md) page for a detailed guide.

### Examples

Refer to the [examples](./examples.md) page for practical configurations and their corresponding blueprint definitions.
