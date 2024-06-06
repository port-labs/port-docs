---
sidebar_position: 2
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";
import Image from "@theme/IdealImage";

# AWS

:::warning Ocean integration
This documentation refers to the newer AWS Ocean integration. If you are using the older AWS Exporter (Lambda), please refer to the [AWS Exporter documentation](./aws-exporter/).
:::

Port's AWS integration allows you to import your AWS resources into Port, according to your configuration.  
After the initial import of data, the integration will also listen to live events from AWS to update data in Port in real time.

The integration with AWS supports real-time event processing, which allows for an accurate **real-time** representation of your AWS infrastructure inside Port.

:::tip
Port's AWS integration is open source, view the source code [**here**](https://github.com/port-labs/ocean/tree/main/integrations/aws).
:::

## 💡 AWS integration common use cases

Easily fill your software catalog with data directly from your AWS Organization, for example:

- Map all the resources in your AWS Accounts, including **ECS Clusters**, **S3 Buckets**, **EC2 Instances** and other AWS objects.
- Watch for AWS resources changes (create/update/delete) in real-time, and automatically apply the changes to your entities in Port.
- Use relations to create complete, easily digestible views of your AWS infrastructure inside Port.

## Installation

To install the integration, follow the [installation](./installation.md) guide.

## How it works

Port's AWS integration can retrieve all the resources supported by the [Cloud Control API](https://docs.aws.amazon.com/cloudcontrolapi/latest/userguide/supported-resources.html), and export them to Port as entities of existing blueprints.

The AWS integration allows you to perform extract, transform, load (ETL) on data from the Cloud Control API into the desired software catalog data model.

The integration is deployed using AWS's [ECS service](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs_services.html) that is deployed to your AWS Account.

The AWS integration uses a YAML configuration to describe the ETL process to load data into the developer portal. The approach reflects a middle-ground between an overly opinionated AWS visualization that might not work for everyone and a too-broad approach that could introduce unneeded complexity into the developer portal. ## WHATTTTTT?

Here is an example snippet from the config which demonstrates the ETL process for getting `Cloudformation Stack` data from AWS and into the software catalog:

```yaml showLineNumbers
resources:
  # Extract
  # highlight-start
  - kind: AWS::CloudFormation::Stack
    selector:
      query: 'true' # JQ boolean query. If evaluated to false - skip syncing the object.
    # highlight-end
    port:
      entity:
        mappings:
          # Transform & Load
          # highlight-start
          identifier: .Identifier
          title: .Identifier
          blueprint: '"cloudResource"'
          properties:
            kind: .__Kind
            region: .__Region
            tags: .Properties.Tags
            arn: .Properties.Arn
            link: '.Properties | select(.Arn != null) | "https://console.aws.amazon.com/go/view?arn=" + .Arn'
          relations:
            account: .__AccountId
          # highlight-end
```

The integration makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from AWS's Cloud Asset API events.

### The integration configuration structure

The integration configuration is a YAML file that describes the ETL process to load data into the developer portal.

- The `resources` section describes the AWS resources to be ingested into Port.
  ```yaml showLineNumbers
  # highlight-next-line
  resources:
    - kind: AWS::S3::Bucket
      selector:
      ...
  ```
- The `kind` field value should be set to the AWS resource type as it appears in the [Cloud Control API](https://docs.aws.amazon.com/cloudcontrolapi/latest/userguide/supported-resources.html).
  ```yaml showLineNumbers
  resources:
    # highlight-start
    - kind: AWS::S3::Bucket
      # highlight-end
      selector:
      ...
  ```
- The `selector` field describes the AWS resource selection criteria.

  ```yaml showLineNumbers
  resources:
    - kind: AWS::S3::Bucket
      # highlight-start
      selector:
        query: 'true' # JQ boolean query. If evaluated to false - skip syncing the object.
      # highlight-end
  ```

  - The `query` field is a [JQ boolean query](https://stedolan.github.io/jq/manual/#Basicfilters), if evaluated to `false` - the resource will be skipped. Example use case - skip syncing resources that are not in a specific region.
    ```yaml showLineNumbers
    query: .location == "global"
    ```

- The `port` field describes the Port entity to be created from the AWS resource.
  ```yaml showLineNumbers
  resources:
    - kind: AWS::S3::Bucket
      selector:
        query: 'true' # JQ boolean query. If evaluated to false - skip syncing the object.
      # highlight-start
      port:
        entity:
          mappings:
            identifier: .Identifier
            title: .Identifier
            blueprint: '"cloudResource"'
            properties:
              kind: .__Kind
              region: .__Region
              tags: .Properties.Tags
              arn: .Properties.Arn
              link: '.Properties | select(.Arn != null) | "https://console.aws.amazon.com/go/view?arn=" + .Arn'
            relations:
              account: .__AccountId
        # highlight-end
  ```
  - The `entity` field describes the Port entity to be created from the AWS resource.
    ```yaml showLineNumbers
    resources:
      - kind: AWS::S3::Bucket
        selector:
          query: 'true' # JQ boolean query. If evaluated to false - skip syncing the object.
        port:
        # highlight-start
        entity:
          mappings:
            # Transform & Load
            identifier: .Identifier
            title: .Identifier
            blueprint: '"cloudResource"'
            properties:
              kind: .__Kind
              region: .__Region
              tags: .Properties.Tags
              arn: .Properties.Arn
              link: '.Properties | select(.Arn != null) | "https://console.aws.amazon.com/go/view?arn=" + .Arn'
            relations:
              account: .__AccountId
            # highlight-end
    ```

### Authorization

For the integration to operate effectively within your AWS environment, it requires certain permissions to access and interact with your resources. These permissions are necessary for the proper functioning of the integration and ensuring seamless operation. Below are the permissions required:

#### AWS IAM Policy: `arn:aws:iam::aws:policy/ReadOnlyAccess`

This policy grants the integration the ability to read all resources within your AWS account. This includes but is not limited to EC2 instances, S3 buckets, IAM roles, and other AWS services.
:::warning
The `ReadOnlyAccess` policy is a managed policy that provides read-only access to AWS services and resources. You could replace it with your custom policy that grants permissions to specific resources, but take in mind that the integration requires read-only access to your AWS resources.
:::

#### AWS API: `account:ListRegions`

This API call enables the integration to retrieve information about all available AWS regions within your account. This is essential for the integration to effectively operate across different regions.

#### AWS API: `sts:AssumeRole`

This permission is necessary for multi-account scenarios where the integration needs to access resources in other AWS accounts. By assuming roles in other accounts, the integration can read data and perform actions across multiple AWS accounts seamlessly.

:::tip
In case your running on an on-premises environment, you need to ensure that the integration has the necessary permissions to access your AWS resources. This can be achieved by creating an [IAM user](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users_create.html) with the required permissions and pass the credentials to the integration by using the `OCEAN__INTEGRATION__CONFIG__AWS_ACCESS_KEY_ID` and `OCEAN__INTEGRATION__CONFIG__AWS_SECRET_ACCESS_KEY` environment variables.
:::

These permissions are essential for the proper functioning of the integration within your AWS environment. It's important to ensure that these permissions are granted to the integration's identity or service account to avoid any operational issues.

## Getting started

Continue to the [installation](./installation.md) guide to learn how to install the AWS integration.
