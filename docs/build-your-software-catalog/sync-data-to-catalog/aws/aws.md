---
sidebar_position: 1
---

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

- Map resources in your accounts, including **S3 buckets**, **Lambda functions**, **SQS queues**, **RDS DB instances**, **ECS services** and many other resource types;
- Use relations to create a complete, easily digestible map of your AWS accounts inside Port;
- etc.

## How it works

Port's AWS exporter can retrieve all the resources supported by the [AWS Cloud Control API](https://docs.aws.amazon.com/cloudcontrolapi/latest/userguide/what-is-cloudcontrolapi.html).

The open source AWS exporter allows you to perform extract, transform, load (ETL) on data from AWS into the desired software catalog data model.

The exporter is deployed using an [AWS serverless application](https://aws.amazon.com/serverless/sam/) that is installed on the account.

The serverless application requires a JSON configuration file to describe the ETL process to load data into the developer portal, and an IAM policy with the necessary permissions to list and read the configured resources.

The exporter makes use of [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from the AWS objects.

### Exporter `config.json` file

The `config.json` file is how you specify the exact resources you want to export from your AWS account, and also which entities and which properties in Port, you want to fill in with data.

Here is an example snippet of the `config.json` file which demonstrates the ETL process for getting `Lambda Functions` data from the account into the software catalog:

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

### `config.json` structure

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
  - To sync all Lambdas that are not owned by AWS Amplify service:

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
- Each mapping value is a JQ query, except for `blueprint` which have to be a static string.

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

  :::info

  - The order of the resources matters when you have relations between resources.
    The AWS Exporter will sync the resources in the same order as in the `config.json`, so make sure to sort the resources by a logical order.

    For example, if you have a relation from SNS Topic to Lambda function, put the Lambda function configuration first.

  - By its nature, the AWS exporter will keep the values of unmapped properties untouched.

  :::

  :::tip View a resource type schema
  To view a resource type schema, for composing a mapping, look for [this](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-template-resource-type-ref.html) reference.

  Pay attention that not all the resource types listed in the reference are available for use with Cloud Control API. A method to determine if a resource type is available discussed here earlier.

  For additional options and information, read [here](https://docs.aws.amazon.com/cloudcontrolapi/latest/userguide/resource-types.html#resource-types-schemas).
  :::

## Prerequisites

- You will need your [Port credentials](../api/api.md#find-your-port-credentials) to install the AWS exporter.

:::tip
<FindCredentials />
:::

To run some optional commands in the installation guide, you will need to install:

- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
- [JQ](https://stedolan.github.io/jq/download/)

## Installation

1. Prepare a [`config.json`](#exporter-configjson-file) file that will define which AWS resources to ingest to Port;

2. Create an AWS S3 bucket and upload the `config.json` to the bucket;

   :::info
   The AWS serverless application that you are about to install, can create and manage the S3 bucket for you, but you still need to upload the `config.json` file to it.
   :::

   :::tip Create a bucket and upload a file
   A reference of how to create an AWS S3 bucket [here](https://docs.aws.amazon.com/AmazonS3/latest/userguide/create-bucket-overview.html), and how to upload a file [here](https://docs.aws.amazon.com/AmazonS3/latest/userguide/upload-objects.html).
   :::

3. Prepare an `AWS IAM Policy` that provides permissions to `list` and `read` the AWS resources in the `config.json`;

   For example, in order to export `Lambda Functions`, you need to create a policy with the following definition:

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
   In order to find the resource actions to be added to the policy, you should view the resource type schema, and locate the permissions for the **read** and **list** `handlers`.

   Use the following command to get that for a specific `<RESOURCE_TYPE>` (AWS CLI and JQ required):

   ```bash showLineNumbers
   aws cloudformation describe-type --type RESOURCE --type-name <RESOURCE_TYPE> --query "Schema" | jq -c 'fromjson | .handlers | with_entries(select([.key] | inside(["list", "read"]))) | map(.permissions) | flatten'
   ```

   More details can be found [here](https://docs.aws.amazon.com/cloudcontrolapi/latest/userguide/resource-types.html#resource-types-schemas).
   :::

   :::tip Create a policy
   A reference of how to create an IAM policy [here](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_create.html).
   :::

4. Create an `AWS Secret` with your Port credentials;

   The secret value should be in the following format:

   ```json showLineNumbers
   { "id": "<CLIENT_ID>", "clientSecret": "<CLIENT_SECRET>" }
   ```

   :::info
   Similar to the S3 bucket, our serverless application can create and manage the secret for you, but you still need to put the secret value in it.
   :::

   :::tip Create a secret
   A reference of how to create an AWS secret [here](https://docs.aws.amazon.com/secretsmanager/latest/userguide/create_secret.html).
   :::

5. Deploy our [serverless application](https://eu-west-1.console.aws.amazon.com/lambda/home?region=eu-west-1#/create/app?applicationId=arn:aws:serverlessrepo:eu-west-1:185657066287:applications/port-aws-exporter);

   :::info Fill in the serverless application parameters

   In order to fill in the parameters right, use the values from the previous steps, and follow those principles:

   - Cloud Formation related parameters:
     - `Application name` - The stack name of the application created via `AWS CloudFormation`.
   - Bucket related parameters:
     - `CreateBucket` - `true` or `false`, depends on your choice in step 2 (create and manage your own bucket or let the application do so).
     - `BucketName` - The name of your bucket, or a globally unique name for creating a new bucket. Remember to upload the `config.json` file when the bucket is available.
     - `ConfigJsonFileKey` - The file key of the `config.json` in the bucket.
   - IAM Policy related parameters:
     - `CustomIAMPolicyARN` - The ARN of the policy that was created in step 3.
   - Secret related parameters:

     - `CustomPortCredentialsSecretARN` - The ARN of the port credentials secret from the previous step;

       **OR**

     - `SecretName` - The name for the port credentials secret to be created for you. Make sure to put the secret value in the following format: `{"id":"<CLIENT_ID>","clientSecret":"<CLIENT_SECRET>"}` when the secret is available.

   - Lambda related parameters:
     - `FunctionName` - The function name for the exporter's Lambda.
     - `ScheduleExpression` - The [schedule expression](https://docs.aws.amazon.com/lambda/latest/dg/services-cloudwatchevents-expressions.html) to define an event schedule for the exporter.
     - `ScheduleState` - The schedule initial state - `ENABLED` or `DISABLED`. We recommend to enable it only after one successful run.

   :::

   :::tip Deploy an application
   You can deploy the application from the AWS console through the link above, or with the following steps using the AWS CLI:

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

   For more information regarding how to deploy a serverless application, click [here](https://docs.aws.amazon.com/serverlessrepo/latest/devguide/serverlessrepo-how-to-consume.html).
   :::

6. Test the application after the deployment is done;

   You should run the exporter's Lambda with an empty test event (`{}`), and review the execution status and logs.

   :::tip Invoke a function with test event
   A reference of how to invoke a Lambda function with a test event [here](https://docs.aws.amazon.com/lambda/latest/dg/testing-functions.html#invoke-with-event).
   :::

   :::info
   The exporter's Lambda can run more than 15 minutes (the maximum amount of time that a Lambda function can run).
   If less than 5 minutes left until the timeout, and there are any resources left to sync, a new Lambda instance will be launched to continue the syncing process.

   To view the logs of all the Lambda instances in one place, you can use [Cloudwatch Logs](https://docs.aws.amazon.com/lambda/latest/dg/monitoring-cloudwatchlogs.html#monitoring-cloudwatchlogs-console) or [AWS SAM Logs](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-logging.html):

   ```bash showLineNumbers
   sam logs --stack-name serverlessrepo-port-aws-exporter --tail
   ```

   :::

7. Update the schedule settings in the Cloud Formation stack.

   After running the exporter successfully for the first time, you probably want to alter the schedule related properties:

   - `ScheduleExpression` - Make sure to set an interval that is longer than the time it takes for the exporter to execute.
   - `ScheduleState` - Set the schedule state to `ENABLED`.

   :::tip Update an application
   Update an application setting or version is done with the same procedure as deploying a new application, like we did in step 5.
   By default, the latest version will be picked when you run the update/deploy procedure.

   For more details, click [here](https://docs.aws.amazon.com/serverlessrepo/latest/devguide/serverlessrepo-how-to-consume-new-version.html).
   :::

## Next steps

### Configure the AWS Exporter to run on events

In addition to running it on schedule, the AWS exporter can be used to act on live events, such as create, update and delete of a resource.

That way you can configure a resource to be synced as soon as it changed, when it's needed.

Refer to the [events](./events.md) page for a detailed guide.

### Examples

Refer to the [examples](./examples.md) page for practical configurations and their corresponding blueprint definitions.
