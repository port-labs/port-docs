---
sidebar_position: 2
---

import Image from "@theme/IdealImage";

# Examples

## Mapping SNS topics and lambda functions

In this step-by-step example, you will export your AWS `SNS topics` and `lambda functions` to Port.

1. Create the following Port blueprints:

   - **Lambda** - will represent lambda functions from the AWS account;
   - **Topic** - will represent SNS topics from the AWS account.

   You may use the following definitions:

   <details>
   <summary> Lambda blueprint </summary>

   ```json showLineNumbers
   {
     "identifier": "lambda",
     "description": "This blueprint represents a lambda in our software catalog",
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
   <summary> Topic blueprint </summary>

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

2. Upload the `config.json` file to the exporter's S3 bucket:

   <details>
   <summary> Port AWS exporter config.json </summary>

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

3. Update the exporter's `IAM policy`:

   <details>
   <summary> IAM Policy </summary>

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
           "lambda:ListFunctions",
           "sns:GetTopicAttributes",
           "sns:ListTagsForResource",
           "sns:ListSubscriptionsByTopic",
           "sns:GetDataProtectionPolicy",
           "sns:ListTopics"
         ],
         "Resource": "*"
       }
     ]
   }
   ```

   </details>

4. Optional: Create an event rule to trigger automatic syncing of changes in lambda functions.

   You may use the following CloudFormation Template:

   <details>
   <summary> Event Rule CloudFormation Template </summary>

   ```yaml showLineNumbers
   AWSTemplateFormatVersion: "2010-09-09"
   Description: The template used to create event rules for the Port AWS exporter.

   Parameters:
     PortAWSExporterStackName:
       Description: Name of the Port AWS exporter stack name
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

Done! soon, you will be able to see any `Topic` and its `Lambda` subscriptions.
