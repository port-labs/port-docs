import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

import GitLabResources from './_gitlab_integration_supported_resources.mdx'

# GitLab-v2

Port's GitLab integration allows you to model GitLab resources in your software catalog and ingest data into them.

## Overview

This integration allows you to:

- Map and organize your GitLab resources and their metadata in Port (see supported resources below).
- Track merge requests, issues, and project metrics.

### Supported resources

The resources that can be ingested from GitLab into Port are listed below.
It is possible to reference any field that appears in the API responses linked below in the mapping configuration.

<GitLabResources/>

## Setup

To install Port's GitLab integration, see the [installation](./installation.md#setup) page.

## Configuration

Port integrations use a [YAML mapping block](/build-your-software-catalog/customize-integrations/configure-mapping#configuration-structure) to ingest data from the third-party API into Port.

The mapping makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from the integration API.

## Capabilities

### Ingesting Git objects

By using Port's GitLab integration, you can automatically ingest GitLab resources into Port based on real-time events.

The integration allows you to ingest various objects and resources provided by the GitLab API, including:

- Groups and subgroups
- Projects (repositories)
- Merge requests
- Issues

### Real-time updates

The integration supports real-time updates through webhooks, allowing your software catalog to stay synchronized with your GitLab instance as changes occur.

## Permissions

Port's GitLab integration requires an access token with the following scopes:

- `read_api`
- `read_repository`
- `read_user`

:::tip Service accounts
We recommend using a dedicated service account for creating the access token, especially in large organizations where rate limits may become an issue.
:::

## Examples

Refer to the [examples](./examples.md) page for practical configurations and their corresponding blueprint definitions.

## Relevant Guides

For relevant guides and examples, see the [guides section](https://docs.port.io/guides?tags=GitLab).


