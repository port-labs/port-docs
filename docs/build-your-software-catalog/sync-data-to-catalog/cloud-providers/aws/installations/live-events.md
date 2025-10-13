---
sidebar_position: 3
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";
import Image from "@theme/IdealImage";

# Live events setup

Port's AWS integration supports real-time event processing, allowing for accurate real-time representation of your AWS infrastructure inside Port. This guide explains how to set up live events for your AWS resources.

:::info Current Limitations
Live events are currently only available for:
- **Single account installations** (not multi-account).
- **Default Terraform installation** with support for three resource types by default:
  - EC2 Instances.
  - S3 Buckets.
  - CloudFormation Stacks.
:::

## Prerequisites

Before setting up live events, ensure you have:

- **AWS Integration Installed**: Complete the [AWS integration installation](./installation.md).
- **API Gateway Setup**: The integration requires an API Gateway endpoint (automatically created with Terraform installation).
- **Port API Key**: Your Port API key for authentication.
- **AWS Permissions**: Ability to create EventBridge rules in your AWS account.

:::tip Terraform vs Manual Installation
- **Terraform users**: Use the provided Terraform module for automated setup
- **Manual installation users**: Follow the AWS console setup steps
:::

## How live events work

<img src='/img/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/live-events-diagram.svg' width='50%' border='1px' />

Live events work by:

1. **AWS Services** generate events when resources change.
2. **CloudTrail** captures these events.
3. **EventBridge Rules** filter and route specific events.
4. **API Gateway** receives the events and forwards them to Port.
5. **Port Integration** processes the events and updates your software catalog.

## Setup methods

<Tabs>
<TabItem value="terraform" label="Terraform (Recommended)" default>

If you installed the AWS integration using Terraform, use the provided module to set up live events.

<h3>Supported resource types</h3>

The default Terraform module supports live events for these resource types:

- **EC2 Instances** (`AWS::EC2::Instance`)
- **S3 Buckets** (`AWS::S3::Bucket`) 
- **CloudFormation Stacks** (`AWS::CloudFormation::Stack`)

<h3>Adding custom resource types</h3>

To add live events for additional resource types (like SSM Parameters), use the `aws_event_rule` module:

```hcl showLineNumbers
module "aws_event_rule" {
  source = "port-labs/integration-factory/ocean//modules/aws_helpers/event"
  
  name        = "port-aws-ocean-sync-ssm-parameters"
  description = "Capture Parameter Store change events"
  
  event_pattern = {
    source      = ["aws.ssm"]
    detail-type = ["Parameter Store Change"]
  }
  
  input_paths = {
    resource_type = "AWS::SSM::Parameter"
    account_id    = "$.account"
    aws_region    = "$.region"
    event_name    = "$.detail-type"
    identifier    = "$.resources.0"
  }

  api_key_param = "<live_events_api_key>"
  target_arn    = "<api_gateway_arn>/production/POST/integration/webhook"
}
```

<h3>Configuration parameters</h3>

| Parameter | Description | Example |
|-----------|-------------|---------|
| `name` | EventBridge rule name | `"port-aws-ocean-sync-ssm-parameters"` |
| `description` | Rule description | `"Capture Parameter Store change events"` |
| `event_pattern` | AWS event pattern to match | `{ source = ["aws.ssm"], detail-type = ["Parameter Store Change"] }` |
| `input_paths` | JSON path mappings for event transformation | See example above |
| `api_key_param` | Port API key parameter | `"<live_events_api_key>"` |
| `target_arn` | API Gateway target ARN | `"<api_gateway_arn>/production/POST/integration/webhook"` |

</TabItem>
<TabItem value="manual" label="Manual AWS Console Setup">

If you installed the AWS integration manually, follow these steps to create EventBridge rules in the AWS console.

<h3>Step 1: Create a rule</h3>

1. Go to **EventBridge** → **Rules** → **Create rule**
2. **Rule name**: Give it a descriptive name (e.g., `port-live-updates-ssm`)
3. Click **Next**

<h3>Step 2: Define the event pattern</h3>

1. **Event source**: Select "AWS events or services"
2. **Event service**: Select the relevant AWS service (e.g., "Systems Manager")
3. **Event type**: Select the type of event (e.g., "Parameter Store")
4. **Event Type Specification**: Select "Specific detail type(s)" and choose the event type (e.g., "Parameter Store Change")
5. Click **Next**

<h3>Step 3: Configure the target</h3>

1. **Target type**: Select "AWS Service"
2. **Target**: Select "API Gateway"
3. **Target location**: Select "Target in this account"
4. **API**: Select the API Gateway created for your integration
5. **Deployment stage**: Select "production"
6. **Integration target**: Enter `/integration/webhook` (HTTP POST)

<h3>Step 4: Add required headers</h3>

Add these required headers:

| Header Name | Value |
|-------------|-------|
| `Content-Type` | `application/json` |
| `x-port-aws-ocean-api-key` | `<your-api-key>` (replace with actual key) |

<h3>Step 5: Transform the Event Data</h3>

Port expects a simplified payload. Use Input Transformer to map the raw AWS event:

**Input Path (mapping):**
```json showLineNumbers
{
  "accountId": "$.account",
  "awsRegion": "$.region", 
  "eventName": "$.detail-type",
  "identifier": "$.resources.0"
}
```

**Template (output):**
```json showLineNumbers
{
  "resource_type": "AWS::SSM::Parameter",
  "accountId": "<accountId>",
  "awsRegion": "<awsRegion>",
  "eventName": "<eventName>",
  "identifier": "<identifier>"
}
```

:::tip Resource Type Mapping
Replace `"AWS::SSM::Parameter"` with the appropriate AWS resource type:
- EC2 Instances: `"AWS::EC2::Instance"`
- S3 Buckets: `"AWS::S3::Bucket"`
- CloudFormation Stacks: `"AWS::CloudFormation::Stack"`
:::

<h3>Step 6: Review & Create</h3>

1. Click **Next** → **Next** → **Create rule**
2. AWS will now forward matching events to Port automatically

</TabItem>
</Tabs>

## Testing your setup

### Verify existing rules

If you have other live event rules (e.g., S3 Bucket sync), verify they're working:

1. Go to **EventBridge** → **Rules**
2. Check that your rules are **Enabled**
3. Look for any recent invocations in the **Metrics** tab

### Test live events

1. **Trigger a test event**:
   - Modify/create a resource (e.g., create an SSM Parameter)
   - Update an existing resource
   - Delete a resource

2. **Verify in Port**:
   - Check your software catalog for real-time updates
   - Look for the resource changes in Port's interface

### Example test for SSM parameters

1. Go to **Systems Manager** → **Parameter Store**
2. Create a new parameter:
   - Name: `/test/my-parameter`
   - Type: `String`
   - Value: `test-value`
3. Check Port for the new parameter entity

## Troubleshooting

### Common issues

**Events not appearing in Port:**
- Verify the EventBridge rule is enabled
- Check that the API Gateway endpoint is correct
- Ensure the Port API key is valid
- Verify the input transformer mapping is correct

**Wrong resource type in Port:**
- Check the `resource_type` field in your input transformer template
- Ensure it matches the expected AWS resource type

**Missing headers:**
- Verify both `Content-Type` and `x-port-aws-ocean-api-key` headers are set
- Check that the API key is the correct one for your Port environment

### Debugging Steps

1. **Check EventBridge Metrics**:
   - Go to EventBridge → Rules → Your Rule → Metrics
   - Look for successful invocations and any errors

2. **Check API Gateway Logs**:
   - Go to API Gateway → Your API → Stages → production → Logs
   - Look for incoming requests and any errors

3. **Verify Event Pattern**:
   - Test your event pattern with sample events
   - Use EventBridge's "Test pattern" feature

## Supported AWS Services

The following AWS services can be configured for live events:

| Service | Event Source | Detail Type | Resource Type |
|---------|--------------|-------------|---------------|
| EC2 | `aws.ec2` | `EC2 Instance State-change Notification` | `AWS::EC2::Instance` |
| S3 | `aws.s3` | `Object Created`, `Object Deleted` | `AWS::S3::Bucket` |
| CloudFormation | `aws.cloudformation` | `CloudFormation Stack State Change` | `AWS::CloudFormation::Stack` |
| Systems Manager | `aws.ssm` | `Parameter Store Change` | `AWS::SSM::Parameter` |

:::info Adding More Services
To add live events for additional AWS services, follow the same pattern:
1. Identify the service's event source and detail type
2. Create an EventBridge rule with the appropriate pattern
3. Configure the input transformer with the correct resource type
:::

## Next Steps

After setting up live events:

1. **Monitor Performance**: Keep an eye on EventBridge metrics and API Gateway logs
2. **Scale as Needed**: Add more resource types as your requirements grow
3. **Optimize Patterns**: Fine-tune event patterns to reduce noise and improve performance

For more advanced configuration options, see the [AWS integration examples](../examples/examples.md).

