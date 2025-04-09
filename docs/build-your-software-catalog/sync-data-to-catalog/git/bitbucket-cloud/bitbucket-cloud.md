import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import BitbucketResources from './\_bitbucket_integration_supported_resources.mdx'


# Bitbucket

Port's Bitbucket integration allows you to model Bitbucket cloud resources in your software catalog and ingest data into them.

:::info Bitbucket Server (Self-Hosted)
This documentation covers Port's integration with **Bitbucket Cloud**. 
For information about integrating with Bitbucket Server (Self-Hosted), please refer to the [Bitbucket Server integration documentation](/build-your-software-catalog/custom-integration/webhook/examples/bitbucket-server/bitbucket-server.md).
:::


## Overview

This integration allows you to:

- Map and organize your desired Bitbucket cloud resources and their metadata in Port (see supported resources below).
- Watch for Bitbucket object changes (create/update/delete) in real-time, and automatically apply the changes to your software catalog.
- Map and ingest monorepo repositories.
- Manage port entities using GitOps.

### Supported resources

The resources that can be ingested from Bitbucket into Port are listed below.  
It is possible to reference any field that appears in the API responses linked below in the mapping configuration.

<BitbucketResources/>


## Setup

To install Port's Bitbucket cloud integration, see the [installation](./installation.md#setup) page.


## Configuration

Port integrations use a [YAML mapping block](/build-your-software-catalog/customize-integrations/configure-mapping#configuration-structure) to ingest data from the third-party api into Port.

The mapping makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from the integration API.


## Capabilities

### Ingesting Git objects

By using Port's Bitbucket integration, you can automatically ingest Bitbucket resources into Port based on real-time events.

The integration allows you to ingest a variety of objects resources provided by the Bitbucket API, including repositories, pull requests and files. It also allows you to perform "extract, transform, load (ETL)" on data from the Bitbucket API into the desired software catalog data model.

When you install the integration, Port will automatically create a `bitbucketProject`, `bitbucketRepository` and `bitbucketPullRequest` blueprints in your catalog (representing a BitBucket project, repository and pull request respectively). 

The YAML configuration mapping will also be added to the [data sources](https://app.getport.io/settings/data-sources) page of your portal where you can manage the integration.



## Permissions

Port's Bitbucket integration requires the following scopes to be enabled on either a workspace token or app password:

- `workspace`: `read`;
- `project`: `read`;
- `repository`: `read`;
- `pullrequest`: `read`;
- `webhooks`.

:::tip Default permissions
You will be prompted to add these permissions while creating a new workspace token or app password.
:::

## Examples

Refer to the [examples](./examples.md) page for practical configurations and their corresponding blueprint definitions.

## Relevant Guides

For relevant guides and examples, see the [guides section](https://docs.port.io/guides?tags=BitBucket).


## Advanced

Refer to the [advanced](./advanced.md) page for advanced use cases and examples.
