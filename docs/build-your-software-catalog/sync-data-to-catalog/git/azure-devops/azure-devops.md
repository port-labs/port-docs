import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import AzureDevopsResources from './\_azuredevops_exporter_supported_resources.mdx'


# Azure DevOps

Port's Azure DevOps integration allows you to model Azure DevOps resources in your software catalog and ingest data into them.

## Overview

This integration allows you to:

- Map and orgaize your desired Azure DevOps resources and their metadata in Port (see supported resources below).
- Watch for Azure DevOps object changes (create/update/delete) in real-time, and automatically apply the changes to your entities in Port.
- Manage Port entities using GitOps.


### Supported Resources

The resources that can be ingested from Azure DevOps into Port are listed below.

  <AzureDevopsResources/>


## Setup

To install Port's Azure DevOps integration, see the [installation](./installation.md#setup) page.

## Configuration

Port integrations use a [YAML mapping block](/build-your-software-catalog/customize-integrations/configure-mapping#configuration-structure) to ingest data from the third-party api into Port.

The mapping makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from the integration API.


## Examples

Refer to the [examples](./examples.md) page for practical configurations and their corresponding blueprint definitions.

## Relevant Guides
For relevant guides and examples, see the [guides section](https://docs.getport.io/guides?tags=AzureDevops).

## GitOps

Port's Azure DevOps integration also provides GitOps capabilities, refer to the [GitOps](./gitops/gitops.md) page to learn more.

## Advanced

Refer to the [advanced](./advanced.md) page for advanced use cases and examples.
