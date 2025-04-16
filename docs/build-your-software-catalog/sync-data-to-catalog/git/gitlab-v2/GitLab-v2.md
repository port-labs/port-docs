import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

import GitLabResources from './_gitlab_integration_supported_resources.mdx'

# GitLab

:::info GitLab v2 documentation
This page documents the latest GitLab integration, released in April 2025.  
For documentation of the previous integration, check out the [GitLab (deprecated)](/build-your-software-catalog/sync-data-to-catalog/git/gitlab/) page.  
:::

Port's GitLab-v2 integration allows you to model GitLab resources in your software catalog and ingest data into them.

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

### Real-time updates

The integration uses GitLab's Group-level webhooks to provide real-time updates. When configured, the integration automatically sets up webhooks at the group level to track changes across all projects within that group.

Learn more about GitLab group webhooks in the [official documentation](https://docs.gitlab.com/user/project/integrations/webhooks/#group-webhooks).

## Examples

Refer to the [examples](./examples.md) page for practical configurations and their corresponding blueprint definitions.

## Relevant Guides

For relevant guides and examples, see the [guides section](https://docs.port.io/guides?tags=GitLab).


