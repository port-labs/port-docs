---
sidebar_position: 1
---

# AWS Exporter Module

The AWS exporter module is used to deploy the Port AWS Exporter in your AWS account.

:::note NOTE
For full installation, including the resources blueprints and updating AWS blueprints based on AWS events,

Please use the full **[AWS exporter Terraform installation](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/Installation.md#terraform-installation-recommended)**
:::

## Prerequisites

Before using this module, make sure you have completed the following prerequisites:

1. Install and configure the AWS Command Line Interface (CLI) on your local machine.

   Refer to the [AWS CLI Documentation](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html) for instructions.

2. Export your [Port credentials](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials):

   ```bash
   export PORT_CLIENT_ID="YOUR_PORT_CLIENT_ID"
   export PORT_CLIENT_SECRET="YOUR_PORT_CLIENT_SECRET"
   ```

## Deploying the exporter

1. Create the AWS exporter [config.json](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/aws.md#exporter-configjson-file) file.

2. Add the module to your HCL configuration. You can use this simple HCL.

      <details>
      <summary>HCL example</summary>

   ```hcl
   data "aws_region" "current" {}
   data "aws_caller_identity" "current" {}

   module "port_aws_exporter" {
      source  = "port-labs/port-exporter/aws"
      version = "0.1.1"
      config_json   = "${path.module}/examples/run_module_example/config.json"
      lambda_policy = "${path.module}/defaults/policy.json"
      bucket_name = "port-aws-exporter-${data.aws_region.current.name}-${data.aws_caller_identity.current.account_id}"
   }
   ```

      </details>

### Running the module

After configuring the module, run the following Terraform commands:

```bash
terraform init       # Initialize the Terraform configuration.
terraform plan       # Preview the changes to be applied
terraform apply      # Apply the changes and provision the resources in your AWS account, providing the path to your variables file using the --var-file option.
```

### Variables

You can configure and customize the AWS exporter using built-in module variables:

<details>
<summary>View all variables</summary>

`stack_name` - the name of the CloudFormation stack.

`secret_name` - secret name for Port credentials.

You can also provide an existing secret instead using the `custom_port_credentials_secret_arn` variable.

`create_bucket` - whether to create a new bucket for the exporter configuration or use an existing one.

`bucket_name` - bucket name for the exporter configuration. Lambda also use it to write intermediate temporary files.

`config_json` - (required) file path / JSON formatted string of the exporter config.

`config_s3_key` - (required) s3 key name of the exporter configuration.

`function_name` - the name of the AWS Lambda function.

`iam_policy_name` - policy name for Port exporter's role.

`custom_port_credentials_secret_arn` - (optional) Secret ARN for Port credentials (client id and client secret).

The secret value should be in the format: `{"id":"<PORT_CLIENT_ID>","clientSecret":"<PORT_CLIENT_SECRET>"}`

`lambda_policy` - (optional) path or JSON formatted string of the AWS policy json to grant to the Lambda function. If not passed, using the default exporter policies.

`events_queue_name` - the name of the events queue to the Port exporter.

`schedule_state` - `ENABLED` or `DISABLED`. It is recommended to enable it only after one successful run. Also make sure to update the schedule expression interval to be longer than the exporter execution time.

`schedule_expression` - (required) schedule expression to define an event schedule for the exporter, according to the following [spec](https://docs.aws.amazon.com/lambda/latest/dg/services-cloudwatchevents-expressions.html).

</details>

:::tip LAMBDA FUNCTION IAM POLICY
By default, the exporter will use the [default exporter policy](https://github.com/port-labs/terraform-aws-port-exporter/blob/main/defaults/policy.json).

In order to use your custom [AWS policy](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html), create a new `policy.json` file, and pass its path to the `lambda_policy_file` variable.
:::

### Exporter CloudFormation stack

After finishing the installation, you will see the Port exporter deployment in your CloudFormation Stacks with the name

`serverlessrepo-<exporter_stack_name>` - based on the `stack_name` variable.

:::note
The stack will be deployed to the AWS region configured in the user's AWS CLI
:::

### Deleting the exporter

To delete the AWS exporter module. you can simply run:

```bash
terraform destroy
```

## Further Information

- See the [AWS exporter docs](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/) for further information about the exporter.
- Visit the Terraform module [Github repository](https://github.com/port-labs/terraform-aws-port-exporter):
  - The [module example](https://github.com/port-labs/terraform-aws-port-exporter/tree/main/examples/run_module_example) folder for a more complete example of the Terraform module.
  - The Event Bridge rule [Terraform example](https://github.com/port-labs/terraform-aws-port-exporter/tree/main/examples/terraform_deploy_eventbridge_rule) for example of deploying an [Eventbridge rule](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-rules.html) for the AWS exporter.
