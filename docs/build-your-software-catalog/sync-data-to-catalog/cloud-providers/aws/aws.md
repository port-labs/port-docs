---
sidebar_position: 2
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";
import Image from "@theme/IdealImage";

# AWS

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

## How it works

Port's AWS integration can retrieve all the resources supported by the [Cloud Control API](https://docs.aws.amazon.com/cloudcontrolapi/latest/userguide/supported-resources.html), and export them to Port as entities of existing blueprints.

The AWS integration allows you to perform extract, transform, load (ETL) on data from the Cloud Control API into the desired software catalog data model.

## Getting started

Continue to the [installation](./installations/installation.md) guide to learn how to install the AWS integration.

## Multiple accounts support

To properly configure permissions for production and to enable multiple accounts collection check out our [multiple accounts guide](./installations/multi_account.md)

## Configuration

Port integrations use a [YAML mapping block](/build-your-software-catalog/customize-integrations/configure-mapping#configuration-structure) to ingest data from the third-party api into Port.

The mapping makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from the integration API.

### Default mapping configuration

This is the default mapping configuration you get after installing the AWS integration.

<details>
<summary><b>Default mapping configuration (Click to expand)</b></summary>

```yaml showLineNumbers
resources:
- kind: AWS::Organizations::Account
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .Id
        title: .Name
        blueprint: '"awsAccount"'
        properties:
          arn: .Arn
          email: .Email
          status: .Status
          joined_method: .JoinedMethod
          joined_timestamp: .JoinedTimestamp | sub(" "; "T")
- kind: AWS::S3::Bucket
  selector:
    query: 'true'
    useGetResourceAPI: 'true'
  port:
    entity:
      mappings:
        identifier: .Identifier
        title: .Identifier
        blueprint: '"cloudResource"'
        properties:
          kind: .__Kind
          region: .Properties.RegionalDomainName | capture(".*\\.(?<region>[^\\.]+)\\.amazonaws\\.com")
            | .region
          tags: .Properties.Tags
          arn: .Properties.Arn
          link: .Properties | select(.Arn != null) | "https://console.aws.amazon.com/go/view?arn="
            + .Arn
        relations:
          account: .__AccountId
- kind: AWS::EC2::Instance
  selector:
    query: 'true'
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
          link: .Properties | select(.Arn != null) | "https://console.aws.amazon.com/go/view?arn="
            + .Arn
        relations:
          account: .__AccountId
- kind: AWS::ECS::Cluster
  selector:
    query: 'true'
    useGetResourceAPI: 'true'
  port:
    entity:
      mappings:
        identifier: .Properties.Arn
        title: .Identifier
        blueprint: '"cloudResource"'
        properties:
          kind: .__Kind
          region: .__Region
          tags: .Properties.Tags
          arn: .Properties.Arn
          link: .Properties | select(.Arn != null) | "https://console.aws.amazon.com/go/view?arn="
            + .Arn
        relations:
          account: .__AccountId
```

</details>
