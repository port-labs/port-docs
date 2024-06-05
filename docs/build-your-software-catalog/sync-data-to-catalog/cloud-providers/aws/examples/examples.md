---
sidebar_position: 0
---

import AccountBlueprint from './account/\_account.mdx'
import ProjectAppConfig from './account/\_port_app_config.mdx'
import CloudResourceBlueprint from './cloud_resource/\_cloud_resource_blueprint.mdx'
import CloudResourceAppConfig from './cloud_resource/\_port_app_config.mdx'

# Examples

This page contains the base examples for mapping AWS resources to Port.

This base example thrives to provide a simpler and more abstract way to map AWS resources to Port.

The simplification is achieved by using the generic `cloudResource` blueprint, which can be used to map any AWS resource to Port.

## Mapping AWS Accounts

In the following example you will ingest your AWS Accounts to Port, you may use the following Port blueprint definitions and integration configuration:

<AccountBlueprint/>

<ProjectAppConfig/>

Here are the API references we used to create those blueprints and app config:

- [Accounts](https://docs.aws.amazon.com/cli/latest/reference/organizations/list-accounts.html)

## Mapping Cloud Resources

In the following example you will ingest your AWS Resources to Port, you may use the following Port blueprint definitions and integration configuration:

:::note Relate resources and Accounts

The Resources below have a relation to the Account, so the creation of the [Account](#mapping-gcp-projects) is required.

<CloudResourceBlueprint/>

<CloudResourceAppConfig/>

## Mapping Extra Resources

The resources in this page are only a few of the resources that the AWS Integration supports.

If the resources you want to ingest into Port do not appear in these examples, you can head to the [Mapping Extra Resources](./mapping_extra_resources.md) page to learn about all of the kinds of AWS resources that are supported by the AWS integration and how to map them into Port.
