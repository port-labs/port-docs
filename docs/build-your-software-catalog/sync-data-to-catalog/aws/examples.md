---
sidebar_position: 2
---

import Image from "@theme/IdealImage";

# Examples

## Mapping Lambda functions

In this step-by-step example, you will export your `Lambda functions` to Port.

1. Create the following Port blueprint:

   - **Lambda** - will represent Lambda functions from the AWS account.

   You may use the following definition:

   <details>
   <summary> Lambda blueprint </summary>

   ```json showLineNumbers
   {
     "identifier": "lambda",
     "description": "This blueprint represents an AWS Lambda function in our software catalog",
     "title": "Lambda",
     "icon": "Lambda",
     "schema": {
       "properties": {
         "link": {
           "type": "string",
           "format": "url",
           "title": "Link"
         },
         "description": {
           "type": "string",
           "title": "Description"
         },
         "memorySize": {
           "type": "number",
           "title": "Memory Size"
         },
         "ephemeralStorageSize": {
           "type": "number",
           "title": "Ephemeral Storage Size"
         },
         "timeout": {
           "type": "number",
           "title": "Timeout"
         },
         "runtime": {
           "type": "string",
           "title": "Runtime"
         },
         "packageType": {
           "type": "string",
           "enum": ["Image", "Zip"],
           "title": "Package Type"
         },
         "environment": {
           "type": "object",
           "title": "Environment"
         },
         "architectures": {
           "type": "array",
           "items": {
             "type": "string",
             "enum": ["x86_64", "arm64"]
           },
           "title": "Architectures"
         },
         "layers": {
           "type": "array",
           "title": "Layers"
         },
         "tags": {
           "type": "array",
           "title": "Tags"
         },
         "arn": {
           "type": "string",
           "title": "ARN"
         },
         "iamRole": {
           "type": "string",
           "format": "url",
           "title": "Iam Role",
           "icon": "Unlock"
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
                    "description": ".Description",
                    "memorySize": ".MemorySize",
                    "ephemeralStorageSize": ".EphemeralStorage.Size",
                    "timeout": ".Timeout",
                    "runtime": ".Runtime",
                    "packageType": ".PackageType",
                    "environment": ".Environment",
                    "architectures": ".Architectures",
                    "layers": ".Layers",
                    "tags": ".Tags",
                    "iamRole": "\"https://console.aws.amazon.com/go/view?arn=\" + .Role",
                    "arn": ".Arn"
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
           "lambda:ListFunctions",
           "lambda:GetFunction",
           "lambda:GetFunctionCodeSigningConfig"
         ],
         "Resource": "*"
       }
     ]
   }
   ```

   </details>

4. Optional: Create an event rule to trigger automatic syncing of changes in Lambda functions.

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
       AllowedPattern: ^[a-zA-Z][-a-zA-Z0-9]*$
       Default: serverlessrepo-port-aws-exporter
   Resources:
     EventRule0:
       Type: AWS::Events::Rule
       Properties:
         EventBusName: default
         EventPattern:
           detail-type:
             - AWS API Call via CloudTrail
           source:
             - aws.lambda
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
           - Id: PortAWSExporterEventsQueue
             Arn:
               Fn::ImportValue:
                 Fn::Sub: ${PortAWSExporterStackName}-EventsQueueARN
             InputTransformer:
               InputPathsMap:
                 awsRegion: $.detail.awsRegion
                 eventName: $.detail.eventName
                 requestFunctionName: $.detail.requestParameters.functionName
                 responseFunctionName: $.detail.responseElements.functionName
               InputTemplate: |-
                 {
                   "resource_type": "AWS::Lambda::Function",
                   "region": "\"<awsRegion>\"",
                   "identifier": "if \"<responseFunctionName>\" != \"\" then \"<responseFunctionName>\" else \"<requestFunctionName>\" end",
                   "action": "if \"<eventName>\" | test(\"DeleteFunction[^a-zA-Z]*$\") then \"delete\" else \"upsert\" end"
                 }
   ```

    </details>

Done! soon, you will be able to see any `Lambda functions`.

## Mapping SNS topics and SQS queues

In this step-by-step example, you will export your `SNS topics` and `SQS queues` to Port.

1. Create the following Port blueprints:

   - **SNS** - will represent SNS topics from the AWS account;
   - **SQS** - will represent SQS queues from the AWS account.

   You may use the following definitions:

   <details>
   <summary> SQS blueprint </summary>

   ```json showLineNumbers
   {
     "identifier": "sqs",
     "description": "This blueprint represents an AWS SQS service in our software catalog",
     "title": "SQS",
     "icon": "AWS",
     "schema": {
       "properties": {
         "link": {
           "type": "string",
           "format": "url",
           "title": "Link"
         },
         "fifoQueue": {
           "type": "boolean",
           "title": "Fifo Queue"
         },
         "visibilityTimeout": {
           "type": "number",
           "title": "Visibility Timeout"
         },
         "messageRetentionPeriod": {
           "type": "number",
           "title": "Message Retention Period"
         },
         "maximumMessageSize": {
           "type": "number",
           "title": "Maximum Message Size"
         },
         "receiveMessageWaitTimeSeconds": {
           "type": "number",
           "title": "Receive Message Wait Time Seconds"
         },
         "delaySeconds": {
           "type": "number",
           "title": "Delay Seconds"
         },
         "tags": {
           "type": "array",
           "title": "Tags"
         },
         "arn": {
           "type": "string",
           "title": "ARN"
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
   <summary> SNS blueprint </summary>

   ```json showLineNumbers
   {
     "identifier": "sns",
     "description": "This blueprint represents an AWS SNS topic in our software catalog",
     "title": "SNS",
     "icon": "SNS",
     "schema": {
       "properties": {
         "link": {
           "type": "string",
           "format": "url",
           "title": "Link"
         },
         "fifoTopic": {
           "type": "boolean",
           "title": "Fifo Topic"
         },
         "subscriptions": {
           "type": "array",
           "title": "Subscriptions"
         },
         "tags": {
           "type": "array",
           "title": "Tags"
         },
         "arn": {
           "type": "string",
           "title": "ARN"
         }
       },
       "required": []
     },
     "mirrorProperties": {},
     "calculationProperties": {},
     "relations": {
       "sqs": {
         "target": "sqs",
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
         "kind": "AWS::SQS::Queue",
         "port": {
           "entity": {
             "mappings": [
               {
                 "identifier": ".QueueName",
                 "title": ".QueueName",
                 "blueprint": "sqs",
                 "properties": {
                   "link": "\"https://console.aws.amazon.com/go/view?arn=\" + .Arn",
                   "fifoQueue": ".FifoQueue // false",
                   "visibilityTimeout": ".VisibilityTimeout",
                   "messageRetentionPeriod": ".MessageRetentionPeriod",
                   "maximumMessageSize": ".MaximumMessageSize",
                   "receiveMessageWaitTimeSeconds": ".ReceiveMessageWaitTimeSeconds",
                   "delaySeconds": ".DelaySeconds",
                   "tags": ".Tags",
                   "arn": ".Arn"
                 },
                 "relations": {
                   "region": ".Arn | split(\":\")[3]"
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
                 "blueprint": "sns",
                 "properties": {
                   "link": "\"https://console.aws.amazon.com/go/view?arn=\" + .TopicArn",
                   "fifoTopic": ".FifoTopic // false",
                   "subscriptions": ".Subscription",
                   "tags": ".Tags",
                   "arn": ".TopicArn"
                 },
                 "relations": {
                   "sqs": ".Subscription // [] | map(select(.Protocol == \"sqs\") | .Endpoint | split(\":\")[-1])"
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
           "sqs:GetQueueAttributes",
           "sqs:ListQueueTags",
           "sqs:ListQueues",
           "sns:GetDataProtectionPolicy",
           "sns:GetTopicAttributes",
           "sns:ListSubscriptionsByTopic",
           "sns:ListTagsForResource",
           "sns:ListTopics"
         ],
         "Resource": "*"
       }
     ]
   }
   ```

   </details>

4. Optional: Create an event rule to trigger automatic syncing of changes in SNS topics and SNS queues.

   You may use the following CloudFormation Template:

   <details>
   <summary> Event Rule CloudFormation Template </summary>

   ```yaml showLineNumbers
   AWSTemplateFormatVersion: 2010-09-09
   Description: The template used to create event rules for the Port AWS exporter.
   Parameters:
     PortAWSExporterStackName:
       Description: Name of the Port AWS exporter stack name
       Type: String
       MinLength: 1
       MaxLength: 255
       AllowedPattern: ^[a-zA-Z][-a-zA-Z0-9]*$
       Default: serverlessrepo-port-aws-exporter
   Resources:
     EventRule0:
       Type: AWS::Events::Rule
       Properties:
         EventBusName: default
         EventPattern:
           source:
             - aws.sns
           detail-type:
             - AWS API Call via CloudTrail
           detail:
             eventSource:
               - sns.amazonaws.com
             eventName:
               - prefix: CreateTopic
               - prefix: Subscribe
               - prefix: Unsubscribe
               - prefix: TagResource
               - prefix: UntagResource
               - prefix: DeleteTopic
         Name: port-aws-exporter-sync-sns-trails
         State: ENABLED
         Targets:
           - Id: PortAWSExporterEventsQueue
             Arn:
               Fn::ImportValue:
                 Fn::Sub: ${PortAWSExporterStackName}-EventsQueueARN
             InputTransformer:
               InputPathsMap:
                 awsRegion: $.detail.awsRegion
                 eventName: $.detail.eventName
                 requestResourceArn: $.detail.requestParameters.resourceArn
                 requestSubscriptionArn: $.detail.requestParameters.subscriptionArn
                 requestTopicArn: $.detail.requestParameters.topicArn
                 responseTopicArn: $.detail.responseElements.topicArn
               InputTemplate: |-
                 {
                   "resource_type": "AWS::SNS::Topic",
                   "region": "\"<awsRegion>\"",
                   "identifier": "\"<eventName>\" | if test(\"CreateTopic[^a-zA-Z]*$\") then \"<responseTopicArn>\" elif test(\"Unsubscribe[^a-zA-Z]*$\") then \"<requestSubscriptionArn>\"[:\"<requestSubscriptionArn>\" | rindex(\":\")] elif test(\"TagResource|UntagResource[^a-zA-Z]*$\") then \"<requestResourceArn>\" elif test(\"DeleteTopic[^a-zA-Z]*$\") then \"<requestTopicArn>\" | split(\":\")[-1] else \"<requestTopicArn>\" end",
                   "action": "if \"<eventName>\" | test(\"DeleteTopic[^a-zA-Z]*$\") then \"delete\" else \"upsert\" end"
                 }
     EventRule1:
       Type: AWS::Events::Rule
       Properties:
         EventBusName: default
         EventPattern:
           source:
             - aws.sqs
           detail-type:
             - AWS API Call via CloudTrail
           detail:
             eventSource:
               - sqs.amazonaws.com
             eventName:
               - prefix: CreateQueue
               - prefix: SetQueueAttributes
               - prefix: TagQueue
               - prefix: UntagQueue
               - prefix: DeleteQueue
         Name: port-aws-exporter-sync-sqs-trails
         State: ENABLED
         Targets:
           - Id: PortAWSExporterEventsQueue
             Arn:
               Fn::ImportValue:
                 Fn::Sub: ${PortAWSExporterStackName}-EventsQueueARN
             InputTransformer:
               InputPathsMap:
                 awsRegion: $.detail.awsRegion
                 eventName: $.detail.eventName
                 requestQueueUrl: $.detail.requestParameters.queueUrl
                 responseQueueUrl: $.detail.responseElements.queueUrl
               InputTemplate: |-
                 {
                   "resource_type": "AWS::SQS::Queue",
                   "region": "\"<awsRegion>\"",
                   "identifier": "\"<eventName>\" | if test(\"CreateQueue[^a-zA-Z]*$\") then \"<responseQueueUrl>\" elif test(\"DeleteQueue[^a-zA-Z]*$\") then \"<requestQueueUrl>\" | split(\"/\")[-1] else \"<requestQueueUrl>\" end",
                   "action": "if \"<eventName>\" | test(\"DeleteQueue[^a-zA-Z]*$\") then \"delete\" else \"upsert\" end"
                 }
   ```

   </details>

Done! soon, you will be able to see any `SNS queue` and its `SQS queues` subscriptions.

## Mapping S3 buckets

In this step-by-step example, you will export your `S3 buckets` to Port.

1.  Create the following Port blueprint:

    - **S3** - will represent S3 buckets from the AWS account.

    You may use the following definition:

    <details>
    <summary> S3 blueprint </summary>

    ```json showLineNumbers
    {
      "identifier": "s3",
      "description": "This blueprint represents an AWS S3 bucket in our software catalog",
      "title": "S3",
      "icon": "Bucket",
      "schema": {
        "properties": {
          "link": {
            "type": "string",
            "format": "url",
            "title": "Link"
          },
          "regionalDomainName": {
            "type": "string",
            "title": "Regional Domain Name"
          },
          "versioningStatus": {
            "type": "string",
            "title": "Versioning Status",
            "enum": ["Enabled", "Suspended"]
          },
          "encryption": {
            "type": "array",
            "title": "Encryption"
          },
          "lifecycleRules": {
            "type": "array",
            "title": "Lifecycle Rules"
          },
          "publicAccess": {
            "type": "object",
            "title": "Public Access"
          },
          "tags": {
            "type": "array",
            "title": "Tags"
          },
          "arn": {
            "type": "string",
            "title": "ARN"
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

2.  Upload the `config.json` file to the exporter's S3 bucket:

    <details>
    <summary> Port AWS exporter config.json </summary>

    ```json showLineNumbers
    {
      "resources": [
        {
          "kind": "AWS::S3::Bucket",
          "port": {
            "entity": {
              "mappings": [
                {
                  "identifier": ".BucketName",
                  "title": ".BucketName",
                  "blueprint": "s3",
                  "properties": {
                    "link": "\"https://console.aws.amazon.com/go/view?arn=\" + .Arn",
                    "regionalDomainName": ".RegionalDomainName",
                    "versioningStatus": ".VersioningConfiguration.Status",
                    "encryption": ".BucketEncryption.ServerSideEncryptionConfiguration",
                    "lifecycleRules": ".LifecycleConfiguration.Rules",
                    "publicAccess": ".PublicAccessBlockConfiguration",
                    "tags": ".Tags",
                    "arn": ".Arn"
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

3.  Update the exporter's `IAM policy`:

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
            "S3:GetBucketWebsite",
            "s3:GetAccelerateConfiguration",
            "s3:GetAnalyticsConfiguration",
            "s3:GetBucketCORS",
            "s3:GetBucketLogging",
            "s3:GetBucketNotification",
            "s3:GetBucketObjectLockConfiguration",
            "s3:GetBucketOwnershipControls",
            "s3:GetBucketPublicAccessBlock",
            "s3:GetBucketTagging",
            "s3:GetBucketVersioning",
            "s3:GetEncryptionConfiguration",
            "s3:GetIntelligentTieringConfiguration",
            "s3:GetInventoryConfiguration",
            "s3:GetLifecycleConfiguration",
            "s3:GetMetricsConfiguration",
            "s3:GetReplicationConfiguration",
            "s3:ListAllMyBuckets",
            "s3:ListBucket"
          ],
          "Resource": "*"
        }
      ]
    }
    ```

    </details>

4.  Optional: Create an event rule to trigger automatic syncing of changes in S3 buckets.

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
        AllowedPattern: ^[a-zA-Z][-a-zA-Z0-9]*$
        Default: serverlessrepo-port-aws-exporter
    Resources:
      EventRule0:
        Type: AWS::Events::Rule
        Properties:
          EventBusName: default
          EventPattern:
            source:
              - aws.s3
            detail-type:
              - AWS API Call via CloudTrail
            detail:
              eventSource:
                - s3.amazonaws.com
              eventName:
                - prefix: CreateBucket
                - prefix: PutBucket
                - prefix: DeleteBucket
          Name: port-aws-exporter-sync-s3-trails
          State: ENABLED
          Targets:
            - Id: PortAWSExporterEventsQueue
              Arn:
                Fn::ImportValue:
                  Fn::Sub: ${PortAWSExporterStackName}-EventsQueueARN
              InputTransformer:
                InputPathsMap:
                  awsRegion: $.detail.awsRegion
                  eventName: $.detail.eventName
                  requestBucketName: $.detail.requestParameters.bucketName
                InputTemplate: |-
                  {
                    "resource_type": "AWS::S3::Bucket",
                    "region": "\"<awsRegion>\"",
                    "identifier": "\"<requestBucketName>\"",
                    "action": "if \"<eventName>\" | test(\"DeleteBucket[^a-zA-Z]*$\") then \"delete\" else \"upsert\" end"
                  }
    ```

    </details>

Done! soon, you will be able to see any `S3 buckets`.

## Mapping API Gateway APIs

In this step-by-step example, you will export your `API Gateway APIs` to Port.

1.  Create the following Port blueprint:

    - **API Gateway** - will represent API Gateway APIs from the AWS account.

    You may use the following definition:

    <details>
    <summary> API Gateway blueprint </summary>

    ```json showLineNumbers
    {
      "identifier": "apigateway",
      "description": "This blueprint represents an AWS API Gateway API in our software catalog",
      "title": "API Gateway",
      "icon": "RestApi",
      "schema": {
        "properties": {
          "link": {
            "type": "string",
            "format": "url",
            "title": "Link"
          },
          "description": {
            "type": "string",
            "title": "Description"
          },
          "protocolType": {
            "type": "string",
            "title": "Protocol Type",
            "enum": ["HTTP", "WEBSOCKET", "REST"]
          },
          "apiKeySourceType": {
            "type": "string",
            "title": "Api Key Source Type",
            "enum": ["HEADER", "AUTHORIZER"]
          },
          "routeSelection": {
            "type": "string",
            "title": "Route Selection"
          },
          "apiEndpoint": {
            "type": "string",
            "title": "Api Endpoint"
          },
          "disableExecuteApi": {
            "type": "boolean",
            "title": "Disable Execute Api"
          },
          "cors": {
            "type": "object",
            "title": "Cors Configuration"
          },
          "endpointTypes": {
            "type": "array",
            "title": "Endpoint Types",
            "items": {
              "type": "string",
              "enum": ["EDGE", "REGIONAL", "PRIVATE"]
            }
          },
          "tags": {
            "type": "array",
            "title": "Tags"
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

2.  Upload the `config.json` file to the exporter's S3 bucket:

    <details>
    <summary> Port AWS exporter config.json </summary>

    ```json showLineNumbers
    {
      "resources": [
        {
          "kind": "AWS::ApiGateway::RestApi",
          "port": {
            "entity": {
              "mappings": [
                {
                  "identifier": ".RestApiId",
                  "title": ".Name",
                  "blueprint": "apigateway",
                  "properties": {
                    "description": ".Description",
                    "protocolType": "\"REST\"",
                    "apiKeySourceType": ".ApiKeySourceType",
                    "disableExecuteApi": ".DisableExecuteApiEndpoint",
                    "endpointTypes": ".EndpointConfiguration.Types",
                    "tags": ".Tags"
                  }
                }
              ]
            }
          }
        },
        {
          "kind": "AWS::ApiGatewayV2::Api",
          "port": {
            "entity": {
              "mappings": [
                {
                  "identifier": ".ApiId",
                  "title": ".Name",
                  "blueprint": "apigateway",
                  "properties": {
                    "link": "\"https://console.aws.amazon.com/go/view?arn=arn:aws:apigateway:\" + (.ApiEndpoint | split(\".\")[-3]) + \"::/apis/\" + .ApiId",
                    "description": ".Description",
                    "protocolType": ".ProtocolType",
                    "routeSelection": ".RouteSelectionExpression",
                    "apiEndpoint": ".ApiEndpoint",
                    "disableExecuteApi": ".DisableExecuteApiEndpoint",
                    "cors": ".CorsConfiguration",
                    "tags": ".Tags | to_entries"
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

3.  Update the exporter's `IAM policy`:

    <details>
    <summary> IAM Policy </summary>

    ```json showLineNumbers
    {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Sid": "VisualEditor0",
          "Effect": "Allow",
          "Action": ["apigateway:GET"],
          "Resource": "*"
        }
      ]
    }
    ```

    </details>

4.  Optional: Create an event rule to trigger automatic syncing of changes in API Gateway APIs.

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
        AllowedPattern: ^[a-zA-Z][-a-zA-Z0-9]*$
        Default: serverlessrepo-port-aws-exporter
    Resources:
      EventRule0:
        Type: AWS::Events::Rule
        Properties:
          EventBusName: default
          EventPattern:
            source:
              - aws.apigateway
            detail-type:
              - AWS API Call via CloudTrail
            detail:
              eventSource:
                - apigateway.amazonaws.com
              eventName:
                - prefix: CreateRestApi
                - prefix: ImportRestApi
                - prefix: PutRestApi
                - prefix: UpdateRestApi
                - prefix: DeleteRestApi
          Name: port-aws-exporter-sync-apigateway-restapi-trails
          State: ENABLED
          Targets:
            - Id: PortAWSExporterEventsQueue
              Arn:
                Fn::ImportValue:
                  Fn::Sub: ${PortAWSExporterStackName}-EventsQueueARN
              InputTransformer:
                InputPathsMap:
                  awsRegion: $.detail.awsRegion
                  eventName: $.detail.eventName
                  requestRestApiId: $.detail.requestParameters.restApiId
                  responseRestApiId: $.detail.responseElements.id
                InputTemplate: |-
                  {
                    "resource_type": "AWS::ApiGateway::RestApi",
                    "region": "\"<awsRegion>\"",
                    "identifier": "if \"<responseRestApiId>\" != \"\" then \"<responseRestApiId>\" else \"<requestRestApiId>\" end",
                    "action": "if \"<eventName>\" | test(\"DeleteRestApi[^a-zA-Z]*$\") then \"delete\" else \"upsert\" end"
                  }
      EventRule1:
        Type: AWS::Events::Rule
        Properties:
          EventBusName: default
          EventPattern:
            source:
              - aws.apigateway
            detail-type:
              - AWS API Call via CloudTrail
            detail:
              eventSource:
                - apigateway.amazonaws.com
              eventName:
                - prefix: CreateApi
                - prefix: ImportApi
                - prefix: ReimportApi
                - prefix: UpdateApi
                - prefix: DeleteApi
          Name: port-aws-exporter-sync-apigateway-api-trails
          State: ENABLED
          Targets:
            - Id: PortAWSExporterEventsQueue
              Arn:
                Fn::ImportValue:
                  Fn::Sub: ${PortAWSExporterStackName}-EventsQueueARN
              InputTransformer:
                InputPathsMap:
                  awsRegion: $.detail.awsRegion
                  eventName: $.detail.eventName
                  requestApiId: $.detail.requestParameters.apiId
                  responseApiId: $.detail.responseElements.apiId
                InputTemplate: |-
                  {
                    "resource_type": "AWS::ApiGatewayV2::Api",
                    "region": "\"<awsRegion>\"",
                    "identifier": "if \"<responseApiId>\" != \"\" then \"<responseApiId>\" else \"<requestApiId>\" end",
                    "action": "if \"<eventName>\" | test(\"DeleteApi[^a-zA-Z]*$\") then \"delete\" else \"upsert\" end"
                  }
    ```

    </details>

Done! soon, you will be able to see any `API Gateway APIs`.

## Mapping Cloudfront distributions

In this step-by-step example, you will export your `Cloudfront distributions` to Port.

:::info Important

Cloudfront is a global (not regional) service in AWS, that its events are recorded by AWS CloudTrail in the `us-east-1` region.
Therefore, in order to automatically sync changes in Cloudfront distributions with an event rule (step 4 of this example), you need to choose one of the following methods:

1. Deploy the Port AWS exporter and the event rule in the `us-east-1` region.
2. Create a trail that will capture global service events in the same region that you've deployed the Port AWS exporter.

For more information, read [here](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-concepts.html#cloudtrail-concepts-global-service-events).

:::

1.  Create the following Port blueprint:

    - **Cloudfront** - will represent Cloudfront distributions from the AWS account.

    You may use the following definition:

    <details>
    <summary> Cloudfront blueprint </summary>

    ```json showLineNumbers
    {
      "identifier": "cloudfront",
      "description": "This blueprint represents an AWS Cloudfront distribution in our software catalog",
      "title": "Cloudfront",
      "icon": "Cloud",
      "schema": {
        "properties": {
          "link": {
            "type": "string",
            "title": "Link",
            "format": "url"
          },
          "description": {
            "type": "string",
            "title": "Description"
          },
          "staging": {
            "type": "boolean",
            "title": "Staging"
          },
          "enabled": {
            "type": "boolean",
            "title": "Enabled"
          },
          "httpVersion": {
            "type": "string",
            "title": "Http Version",
            "enum": ["http1.1", "http2", "http2and3", "http3"]
          },
          "priceClass": {
            "type": "string",
            "title": "Price Class",
            "enum": ["PriceClass_100", "PriceClass_200", "PriceClass_All"]
          },
          "domainName": {
            "type": "string",
            "title": "Domain Name"
          },
          "aliases": {
            "type": "array",
            "title": "Aliases"
          },
          "origins": {
            "type": "array",
            "title": "Origins"
          },
          "viewerCertificate": {
            "type": "object",
            "title": "Viewer Certificate"
          },
          "defaultCacheBehavior": {
            "type": "object",
            "title": "Default Cache Behavior"
          },
          "tags": {
            "type": "array",
            "title": "Tags"
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

2.  Upload the `config.json` file to the exporter's S3 bucket:

    <details>
    <summary> Port AWS exporter config.json </summary>

    ```json showLineNumbers
    {
      "resources": [
        {
          "kind": "AWS::CloudFront::Distribution",
          "port": {
            "entity": {
              "mappings": [
                {
                  "identifier": ".Id",
                  "title": ".Id",
                  "blueprint": "cloudfront",
                  "properties": {
                    "link": "\"https://console.aws.amazon.com/go/view?arn=arn:aws:cloudfront:::distribution/\" + .Id",
                    "description": ".DistributionConfig.Comment",
                    "staging": ".DistributionConfig.Staging",
                    "enabled": ".DistributionConfig.Enabled",
                    "httpVersion": ".DistributionConfig.HttpVersion",
                    "priceClass": ".DistributionConfig.PriceClass",
                    "domainName": ".DomainName",
                    "aliases": ".DistributionConfig.Aliases",
                    "origins": ".DistributionConfig.Origins",
                    "viewerCertificate": ".DistributionConfig.ViewerCertificate",
                    "defaultCacheBehavior": ".DistributionConfig.DefaultCacheBehavior",
                    "tags": ".Tags"
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

3.  Update the exporter's `IAM policy`:

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
            "cloudfront:GetDistribution*",
            "cloudfront:ListDistributions*"
          ],
          "Resource": "*"
        }
      ]
    }
    ```

    </details>

4.  Optional: Create an event rule to trigger automatic syncing of changes in Cloudfront distributions.

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
        AllowedPattern: ^[a-zA-Z][-a-zA-Z0-9]*$
        Default: serverlessrepo-port-aws-exporter
    Resources:
      EventRule0:
        Type: AWS::Events::Rule
        Properties:
          EventBusName: default
          EventPattern:
            source:
              - aws.cloudfront
            detail-type:
              - AWS API Call via CloudTrail
            detail:
              eventSource:
                - cloudfront.amazonaws.com
              eventName:
                - prefix: CreateDistribution
                - prefix: CopyDistribution
                - prefix: UpdateDistribution
                - prefix: DeleteDistribution
          Name: port-aws-exporter-sync-cloudfront-trails
          State: ENABLED
          Targets:
            - Id: PortAWSExporterEventsQueue
              Arn:
                Fn::ImportValue:
                  Fn::Sub: ${PortAWSExporterStackName}-EventsQueueARN
              InputTransformer:
                InputPathsMap:
                  awsRegion: $.detail.awsRegion
                  eventName: $.detail.eventName
                  requestDistributionId: $.detail.requestParameters.id
                  responseDistributionId: $.detail.responseElements.distribution.id
                InputTemplate: |-
                  {
                    "resource_type": "AWS::CloudFront::Distribution",
                    "region": "\"<awsRegion>\"",
                    "identifier": "if \"<responseDistributionId>\" != \"\" then \"<responseDistributionId>\" else \"<requestDistributionId>\" end",
                    "action": "if \"<eventName>\" | test(\"DeleteDistribution[^a-zA-Z]*$\") then \"delete\" else \"upsert\" end"
                  }
    ```

    </details>

Done! soon, you will be able to see any `Cloudfront distributions`.
