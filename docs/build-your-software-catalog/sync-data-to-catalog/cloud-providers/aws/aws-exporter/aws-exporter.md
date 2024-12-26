---
sidebar_position: 1
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";
import Image from "@theme/IdealImage";

# AWS Exporter

:::warning Deprecated
This exporter is deprecated, Port will discontinue support for organizations using it by Q2 2025.

To integrate Port with AWS, use the [Ocean AWS integration](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/).
:::

Port's AWS integration provides the ability to export your AWS resources to Port, according to your configuration.
You can define the integration to run both on schedule and on events.

The integration supports real-time event processing, this allows for an accurate **real-time** representation of your AWS infrastructure inside Port.

:::tip
Port's AWS exporter is open source, view the source code [**here**](https://github.com/port-labs/port-aws-exporter).
:::

## 💡 AWS exporter common use cases

Our AWS exporter allows you to easily enrich your software catalog with data from your AWS accounts, for instance:

- Map resources in your accounts, including **S3 buckets**, **lambda functions**, **SQS queues**, **RDS DB instances**, **ECS services** and many other resource types.
- Use relations to create a complete, easily digestible map of your AWS accounts inside Port.

## How it works

Port's AWS exporter can retrieve all the resources supported by the [AWS Cloud Control API](https://docs.aws.amazon.com/cloudcontrolapi/latest/userguide/supported-resources.html).

The open source AWS exporter allows you to perform extract, transform, load (ETL) on data from AWS into the desired software catalog data model.

The exporter is deployed using an [AWS serverless application](https://aws.amazon.com/serverless/sam/) that is installed on the account.

[The serverless application](#exporter-aws-serverless-application) requires a [JSON configuration file](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/aws-exporter/#exporter-configjson-file) to describe the ETL process to load data into the developer portal, and an [IAM policy](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/aws-exporter/#iam-policy) with the necessary permissions to list and read the configured resources.

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

#### Structure

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

- The `port`, `entity` and the `mappings` keys open the section used to map the AWS resource fields to Port entities, the `mappings` key is an array where each object matches the structure of an [entity](/build-your-software-catalog/sync-data-to-catalog/sync-data-to-catalog.md#entity-json-structure).
- Each mapping value is a JQ query, except for `blueprint` which has to be a static string.
- The `itemsToParse` key in a mapping, makes it possible to create multiple entities from a single AWS resource.

  - Any JQ expression can be used here, as long as it evaluates to an array of items.
  - `item` will be added to the JQ context as a key containing a reference to items in the array specified in `itemsToParse`. For array of objects, keys from an object can be accessed using the `.item.KEY_NAME` syntax.

  <br></br>

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
            },
            {
              "itemsToParse": ".Layers",
              "identifier": ".item",
              "title": ".item",
              "blueprint": "functionLayer",
              "properties": {}
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

- By its nature, the AWS exporter will keep the values of unmapped properties untouched. Go [here](/build-your-software-catalog/custom-integration/api/api.md?operation=create-update#usage) for further explanation about different entity creation strategies.

:::

:::tip View a resource type schema
To view a resource type schema and use it to compose a mapping, use [this](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-template-resource-type-ref.html) reference.

Note that not all of the resource types listed in the reference are available for use with the Cloud Control API. A method to determine if a resource type is available discussed [here](#structure).

For additional options and information, read [here](https://docs.aws.amazon.com/cloudcontrolapi/latest/userguide/resource-types.html#resource-types-schemas).
:::

#### Changing the configuration

By default, the exporter saves a preconfigured `config.json` file to an [`AWS S3 Bucket`](https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingBucket.html) upon installation.  
The S3 bucket is named `port-aws-exporter-<AWS_REGION>-<AWS_ACCOUNT_ID>`, and is created by the exporter.

To make a change to the configuration (e.g. change the mapping of a certain property):

1. Create a copy of the `config.json` file from the bucket, make the desired changes, and save it locally.
2. Use the AWS CLI to upload the file to the bucket, replacing the existing file.  
   Replace `<BUCKET_NAME>` and `<PATH_TO_CONFIG_FILE>` with your values, then run the following command:

```bash
  aws s3api put-object --bucket "<BUCKET_NAME>" --key "config.json" --body "<PATH_TO_CONFIG_FILE>"
```

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

- [S3 bucket](#changing-the-configuration) - where the [`config.json`](#exporter-configjson-file) should be saved;
- [ASM secret](#port-credentials-secret) - where you should save your Port credentials (client id and secret), to allow the exporter to interact with Port's API;
- [Lambda function](https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-concepts.html#gettingstarted-concepts-function) - a resource that you can invoke to run the exporter code. The [IAM policy](#iam-policy) is attached to the execution role of the Lambda function;
- [SQS queue](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/welcome.html) - a queue of events, to be consumed by the exporter. Read [here](./event-based-updates.md) to learn how to use the exporter to consume and act on live events from different AWS services;
- [EventsBridge scheduled rule](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-create-rule-schedule.html) - a rule to run the exporter on a schedule.

## Getting started

Continue to the [installation](./installation.md) section to setup the AWS exporter in your Port environment.
