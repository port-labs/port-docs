---
sidebar_position: 1
---

import FindCredentials from "/docs/build-your-software-catalog/custom-integration/api/\_template_docs/\_find_credentials_collapsed.mdx";
import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Installation

:::tip First Time Installation
For your first deployment of the AWS exporter, we recommend starting with the Helm/scheduled installation method to perform the initial data sync. Once the initial data sync is complete, you can switch to the Terraform deployment method for real-time data sync.
:::

## Prerequisites

- You will need your [Port credentials](/build-your-software-catalog/custom-integration/api/api.md#find-your-port-credentials) to install the AWS exporter:

  <FindCredentials />

- The [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) is required for authentication. Make sure your AWS `Access key id` and `Secret access key` are set. If not, run `aws configure` in your terminal to configure them.

For the [step-by-step installation](#step-by-step-installation) (not using Terraform), also install:

- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)
- [JQ](https://stedolan.github.io/jq/download/)

## Terraform Installation (recommended)

Run the following script in your terminal:

```bash showLineNumbers
# Export your Port credentials
export PORT_CLIENT_ID=YOUR-PORT-CLIENT-ID
export PORT_CLIENT_SECRET=YOUR-PORT-CLIENT-SECRET

# Clone the terraform template
git clone https://github.com/port-labs/template-assets.git

cd template-assets/aws

# Initialize the Terraform requirements
terraform init

# Deploy the aws exporter and provide the resources you want to export
terraform apply -var 'resources=["ecs_service", "lambda", "sns", "sqs", "s3_bucket", "rds_db_instance", "dynamodb_table", "ec2_instance"]'
```

:::info
The above script performs the following actions:

1. Creates the resource blueprints in your Port environment.
2. Deploys the AWS exporter in your AWS environment with the following resources - [S3 bucket](https://aws.amazon.com/s3/), [mapping configuration file](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/aws-exporter#exporter-configjson-file), [AWS secret](./aws-exporter.md#port-credentials-secret), [AWS IAM policy](./aws-exporter.md#iam-policy);
3. Setting up [Event Bridge Rules](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-rules.html) that trigger the exporter to update resources;
4. Invokes the AWS exporter Lambda function for the first time to get the current resources state.

:::

:::tip
You can delete resources you don't want to export by removing them from the resources array in the script above.
:::

## Step-by-step installation

The steps outlined here can be used to manually install the AWS exporter using CloudFormation.

In order to deploy the application, you will need to fill in the following parameters:

- **Cloud Formation related parameters:**
  - `Application name` - The stack name of the application created via `AWS CloudFormation`.
- **Bucket related parameters:**
  - `CreateBucket` - `true` if you want the application to create and manage your bucket, or `false` if you want to create the bucket on your own.
  - `BucketName` - The name of your bucket, or a globally unique name for a new bucket.
  - `ConfigJsonFileKey` - The file key (path) to the [`config.json`](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/aws-exporter#exporter-configjson-file) in the bucket.
- **IAM Policy related parameters:**
  - `CustomIAMPolicyARN` - The ARN of the [IAM policy](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/aws-exporter/#iam-policy).
- **Secret related parameters:**

  - `CustomPortCredentialsSecretARN` - The ARN of the Port credentials secret;

    **OR**

  - `SecretName` - The name for the new Port credentials secret to create.

- **Lambda related parameters:**
  - `FunctionName` - The function name for the exporter's lambda.
  - `ScheduleExpression` - The [schedule expression](https://docs.aws.amazon.com/lambda/latest/dg/services-cloudwatchevents-expressions.html) to define an event schedule for the exporter.
  - `ScheduleState` - The schedule initial state - `ENABLED` or `DISABLED`. We recommend to enable it only after one successful run.

1. Prepare a [`config.json`](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/aws-exporter#exporter-configjson-file) file that will define which AWS resources to ingest to Port;

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

5. Upload the `config.json` to the exporter's S3 bucket.

:::tip Upload a file to an S3 bucket
To learn how to upload a file to S3, look [here](https://docs.aws.amazon.com/AmazonS3/latest/userguide/upload-objects.html).
:::

### Test the application

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

### Update the schedule settings

After running the exporter successfully for the first time, you probably want to alter the scheduling related properties of the CloudFormation stack:

- `ScheduleExpression` - Make sure to set an interval that is longer than the time it takes for the exporter to execute;
- `ScheduleState` - Set the schedule state to `ENABLED`.

If you are using the Terrafom module, update the `schedule_state` and `schedule_expression` variables.

:::info
In order to determine lambda execution time, you can [view the logs](#view-the-logs), and search for the first and last log lines.
When the exporter finishes its syncing work, it writes the following log: `Done handling your resources`.
:::

:::tip Update an application
Updating an application's setting or version is done using the same procedure as deploying a new application, similar to step 3 of the [installation](#installation).
By default, the latest available version of the exporter will be used when you run the update/deploy procedure.

For more details, click [here](https://docs.aws.amazon.com/serverlessrepo/latest/devguide/serverlessrepo-how-to-consume-new-version.html).
:::

### Configure the AWS Exporter to run on events

In addition to running on schedule, the AWS exporter can be used to act on live events, such as create, update and delete of a resource in your AWS account.
That way you can configure a resource to be synced as soon as it changed, in real time.

To configure the AWS exporter to use events as triggers, follow these steps:

1. Prepare an [event rule](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/aws-exporter/event-based-updates#definition), based on specific events matching resources you want the AWS exporter to update in real time and save it to a Cloudformation YAML template (`template.yml`).

2. Deploy the event rule using this command:

   ```bash showLineNumbers
   aws cloudformation deploy --template-file template.yml --stack-name port-aws-exporter-event-rules
   ```

## Further information

- Refer to the [examples](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/aws-exporter/examples/examples.md) page for practical configurations and their corresponding blueprint definitions;
- Learn about more ways of [working with Cloudformation stacks](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/stacks.html);
- Deep-dive into the [Event-based Updates](./event-based-updates.md) mechanism.
