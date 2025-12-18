---
sidebar_position: 1
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import GitHubResources from './\_github_exporter_supported_resources.mdx'

# GitHub Ocean (Beta)

Port's GitHub integration allows you to model GitHub resources in your software catalog and ingest data into them.

## Overview

The integration allows you to:

- Map and organize GitHub resources and metadata into Port (see [supported resources](#supported-resources) below).
- Detect changes (create/update/delete) in real-time and keep your catalog up to date.
- Manage Port entities using GitOps.
- Sync [multiple GitHub organizations](/build-your-software-catalog/sync-data-to-catalog/git/github-ocean/installation#multi-github-organization-support) with a single integration instance.

### Supported resources

The resources that can be ingested from GitHub into Port are listed below.
It is possible to reference any field that appears in the API responses linked below in the mapping configuration.

 <GitHubResources/>

## Setup

To install the integration, see the [installation page](/build-your-software-catalog/sync-data-to-catalog/git/github-ocean/installation).

## Configuration

Port integrations use a [YAML mapping block](/build-your-software-catalog/customize-integrations/configure-mapping#configuration-structure) to ingest data from the third-party API into Port.

The mapping makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from the integration API.

You can manage your GitHub integration configuration using Port:

1. Go to the [data sources](https://app.getport.io/settings/data-sources) page of your portal.
2. Under `Exporters`, click on the installed integration.
3. A window will open containing the default YAML configuration of your GitHub integration.
4. Here you can modify the configuration to suit your needs, by adding/removing entries.
5. When finished, click `Resync` to apply any changes.

Using this method applies the configuration to all repositories that the GitHub app has permissions to.

When configuring the integration **using Port**, the YAML configuration is global, allowing you to specify mappings for multiple Port blueprints.

### Repository type

The `repositoryType` parameter filters which repositories are ingested. It corresponds to the `type` parameter in GitHub's [List organization repositories](https://docs.github.com/en/rest/repos/repos?apiVersion=2022-11-28#list-organization-repositories) API.

<details>
<summary><b>Possible values (click to expand)</b></summary>

- `all` (default): All repositories accessible to the provided token.
- `public`: Public repositories only.
- `private`: Private repositories only.
- `forks`: Forked repositories only.
- `sources`: Non-forked repositories only.
</details>

See the default mapping below for a usage example.

### Default mapping configuration

This is the default mapping configuration for this integration:

<details>
<summary><b>Default mapping configuration (click to expand)</b></summary>

```yaml showLineNumbers
repositoryType: "all"
deleteDependentEntities: true
createMissingRelatedEntities: true
resources:
  - kind: organization
    selector:
      query: "true"
    port:
      entity:
        mappings:
          identifier: .login
          title: .login
          blueprint: '"githubOrganization"'
          properties:
            login: .login
            id: .id
            nodeId: .node_id
            url: .url
            reposUrl: .repos_url
            eventsUrl: .events_url
            hooksUrl: .hooks_url
            issuesUrl: .issues_url
            membersUrl: .members_url
            publicMembersUrl: .public_members_url
            avatarUrl: .avatar_url
            description: if .description then .description else "" end
  - kind: repository
    selector:
      query: "true"
    port:
      entity:
        mappings:
          identifier: .name
          title: .name
          blueprint: '"githubRepository"'
          properties:
            description: if .description then .description else "" end
            visibility: if .private then "private" else "public" end
            defaultBranch: .default_branch
            readme: file://README.md
            url: .html_url
            language: if .language then .language else "" end
          relations:
            organization: .owner.login
  - kind: pull-request
    selector:
      query: "true"
      state: "open"
    port:
      entity:
        mappings:
          identifier: ".head.repo.name + (.id|tostring)"
          title: ".title"
          blueprint: '"githubPullRequest"'
          properties:
            creator: ".user.login"
            assignees: "[.assignees[].login]"
            reviewers: "[.requested_reviewers[].login]"
            status: ".state"
            closedAt: ".closed_at"
            updatedAt: ".updated_at"
            mergedAt: ".merged_at"
            createdAt: ".created_at"
            prNumber: ".id"
            link: ".html_url"
            leadTimeHours: >-
              (.created_at as $createdAt | .merged_at as $mergedAt |
              ($createdAt | sub("\\..*Z$"; "Z") | strptime("%Y-%m-%dT%H:%M:%SZ") | mktime) as $createdTimestamp |
              ($mergedAt | if . == null then null else sub("\\..*Z$"; "Z") |
              strptime("%Y-%m-%dT%H:%M:%SZ") | mktime end) as $mergedTimestamp |
              if $mergedTimestamp == null then null else
              (((($mergedTimestamp - $createdTimestamp) / 3600) * 100 | floor) / 100) end)
          relations:
            repository: .__repository
```

</details>

## Capabilities

For detailed information about data ingestion capabilities, see the [capabilities page](/build-your-software-catalog/sync-data-to-catalog/git/github-ocean/capabilities).

## Examples

Refer to the [examples](/build-your-software-catalog/sync-data-to-catalog/git/github-ocean/examples) page for practical configurations and their corresponding blueprint definitions.
