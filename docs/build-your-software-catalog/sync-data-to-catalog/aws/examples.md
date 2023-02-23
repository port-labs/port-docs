---
sidebar_position: 2
---

import Image from "@theme/IdealImage";
import SpecificTopicEntityPage from "../../../../static/img/integrations/aws-exporter/TopicAndLambdas.png"
import SpecificLambdaEntityPage from "../../../../static/img/integrations/aws-exporter/LambdaPage.png"
import AuditLogPage from "../../../../static/img/integrations/aws-exporter/AuditLog.png"

# Examples

## Mapping SNS topics and Lambda functions

In the following example you will export your AWS `SNS Topics` and `Lambda Functions` to Port.
You may use the following Port Blueprints definitions, `config.json`, and CloudFormation YAML template (trigger sync for changes in a Lambda function):

- **Lambda** - will represent lambda functions from the AWS account;
- **Topic** - will represent SNS topics from the AWS account.

<details>
<summary> Lambda Blueprint </summary>

```json showLineNumbers
{
  "identifier": "lambda",
  "description": "This blueprint represents a Lambda in our software catalog",
  "title": "Lambda",
  "icon": "Lambda",
  "schema": {
    "properties": {
      "arn": {
        "type": "string"
      },
      "description": {
        "type": "string"
      },
      "memorySize": {
        "type": "number"
      },
      "packageType": {
        "type": "string",
        "enum": ["Image", "Zip"]
      },
      "timeout": {
        "type": "number"
      },
      "runtime": {
        "type": "string"
      },
      "environment": {
        "type": "object"
      },
      "architectures": {
        "type": "array"
      },
      "tags": {
        "type": "array"
      },
      "link": {
        "type": "string",
        "format": "url"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "relations": {}
}
```

</details>

<details>
<summary> Topic Blueprint </summary>

```json showLineNumbers
{
  "identifier": "topic",
  "description": "This blueprint represents a topic in our software catalog",
  "title": "Topic",
  "icon": "Aws",
  "schema": {
    "properties": {
      "arn": {
        "type": "string"
      },
      "link": {
        "type": "string",
        "format": "url"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "relations": {
    "lambda": {
      "target": "lambda",
      "required": false,
      "many": true
    }
  }
}
```

</details>

<details>
<summary> Port AWS Exporter config.json </summary>

```json showLineNumbers
{
  "resources": [
    {
      "kind": "AWS::Lambda::Function",
      "port": {
        "entity": {
          "mappings": [
            {
              "identifier": ".FunctionName",
              "title": ".FunctionName",
              "blueprint": "lambda",
              "properties": {
                "link": "\"https://console.aws.amazon.com/go/view?arn=\" + .Arn",
                "arn": ".Arn",
                "description": ".Description",
                "memorySize": ".MemorySize",
                "packageType": ".PackageType",
                "timeout": ".Timeout",
                "runtime": ".Runtime",
                "environment": ".Environment",
                "architectures": ".Architectures",
                "tags": ".Tags"
              }
            }
          ]
        }
      }
    },
    {
      "kind": "AWS::SNS::Topic",
      "port": {
        "entity": {
          "mappings": [
            {
              "identifier": ".TopicName",
              "title": ".TopicName",
              "blueprint": "topic",
              "properties": {
                "link": "\"https://console.aws.amazon.com/go/view?arn=\" + .TopicArn",
                "arn": ".TopicArn"
              },
              "relations": {
                "lambda": ".Subscription | map(select(.Protocol == \"lambda\") | .Endpoint[(.Endpoint | rindex(\":\"))+1:])"
              }
            }
          ]
        }
      }
    }
  ]
}
```

</details>

<details>
<summary> Optional: CloudFormation YAML Template </summary>

```yaml showLineNumbers
AWSTemplateFormatVersion: "2010-09-09"
Description: The template used to create event rules for the Port AWS Exporter.

Parameters:
  PortAWSExporterStackName:
    Description: Name of the Port AWS Exporter stack name
    Type: String
    MinLength: 1
    MaxLength: 255
    AllowedPattern: "^[a-zA-Z][-a-zA-Z0-9]*$"
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
        - Id: "PortAWSExporterEventsQueue"
          Arn:
            {
              "Fn::ImportValue":
                { "Fn::Sub": "${PortAWSExporterStackName}-EventsQueueARN" },
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

</details>

After creating the blueprints, upload the `config.json` file to the exporter's S3 bucket, and run the exporter's Lambda (manually; on schedule; or on changes, utilizing the event rule from the CloudFormation YAML Template).

Done! For instance, you can see a `Topic` and its `Lambda` subscription, in a single Port entity page:

<center>

<Image img={SpecificTopicEntityPage} style={{ width: 1000 }} />

</center>

Similarly, you can see a specific `Lambda` entity page:

<center>

<Image img={SpecificLambdaEntityPage} style={{ width: 1000 }} />

</center>

And you can look for the respective audit logs with an indication of the AWS exporter as the source:

<center>

<Image img={AuditLogPage} style={{ width: 1000 }} />

</center>
