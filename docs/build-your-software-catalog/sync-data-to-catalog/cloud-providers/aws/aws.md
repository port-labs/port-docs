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
