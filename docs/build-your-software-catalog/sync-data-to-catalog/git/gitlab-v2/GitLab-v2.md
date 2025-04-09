import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

import GitLabResources from './_gitlab_integration_supported_resources.mdx'

# GitLab

:::info
You’re viewing the latest GitLab integration, released in April 2025. For details on the previous version, check out the [GitLab (deprecated)](/build-your-software-catalog/sync-data-to-catalog/git/gitlab/) documentation.  
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

### Ingesting Git objects

The integration allows you to ingest various objects and resources provided by the GitLab API, including:

- Groups and subgroups
- Projects (repositories)
- Merge requests
- Issues

### Real-time updates

The integration uses GitLab's Group-level webhooks to provide real-time updates. When configured, the integration automatically sets up webhooks at the group level to track changes across all projects within that group.

#### Supported webhook events

The following group-level webhook events are supported:

- `merge_requests_events` - Track merge request creation, updates, and state changes
- `issues_events` - Monitor issue creation, updates, and state changes
- `releases_events` - Get notified about new releases
- `subgroup_events` - Track subgroup-related changes
- `push_events` - Monitor code pushes to repositories
- `tag_push_events` - Track tag creation and deletion

:::note Webhook configuration
The integration handles webhook setup automatically when provided with the necessary group-level access. No manual webhook configuration is required.

Learn more about GitLab group webhooks in the [official documentation](https://docs.gitlab.com/user/project/integrations/webhooks/#group-webhooks).
:::

## Permissions

Port's GitLab integration supports two types of access tokens:

### Personal Access Token

1. Navigate to your GitLab profile settings (click your avatar → Edit profile → Access Tokens)
2. Create a new personal access token with the following scopes:
   - `read_api` - Read-only access to the API
   - `read_repository` - Read-only access to repositories
   - `read_user` - Read-only access to user information

### Group Access Token

For organization-wide access:

1. Navigate to your group's Settings → Access Tokens
2. Create a new group access token with:
   - `read_api` - Read-only access to the API
   - `read_repository` - Read-only access to repositories

:::tip Service accounts
We recommend using a dedicated service account for creating access tokens, especially in large organizations where rate limits may become an issue. This provides better security and easier token management.
:::

### Token scope considerations

Choose the token type based on your needs:
- Personal Access Token: Full access to all resources the user can access
- Group Access Token: Access to all projects within the group


## Examples

Refer to the [examples](./examples.md) page for practical configurations and their corresponding blueprint definitions.

## Relevant Guides

For relevant guides and examples, see the [guides section](https://docs.port.io/guides?tags=GitLab).


