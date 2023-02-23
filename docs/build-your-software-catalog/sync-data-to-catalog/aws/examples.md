---
sidebar_position: 1
---

import Image from "@theme/IdealImage";
import SpecificEntityPage from "../../../../static/img/integrations/aws-exporter/TopicAndLambdas.png"
import AuditLogPage from "../../../../static/img/integrations/aws-exporter/AuditLog.png"

# Examples

## Mapping SNS topics and Lambda functions

In the following example you will export your AWS `SNS Topics` and `Lambda Functions` to Port, you may use the following Port Blueprints definitions, and `config.json`:

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

After creating the blueprints, apply the provided `config.json` file using the installation command:

Done! the exporter will sync topics and functions from your AWS account as Port entities on the next run.

For instance, you can see a `Topic` and its `Lambda` subscription, in a single Port entity page:

<center>

<Image img={SpecificEntityPage} style={{ width: 1000 }} />

</center>

:::note
By its nature, the AWS exporter will keep the values of unmapped properties untouched.
:::

And you can look for the respective audit logs with an indication of the AWS exporter as the source:

<center>

<Image img={AuditLogPage} style={{ width: 1000 }} />

</center>
