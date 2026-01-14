---
sidebar_position: 1
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import GitHubResources from './\_github_exporter_supported_resources.mdx'

# GitHub Ocean

Port's GitHub integration allows you to model GitHub resources in your software catalog and ingest data into them.

## Overview

The integration allows you to:

- Map and organize GitHub resources and metadata into Port (see [supported resources](#supported-resources) below).
- Detect changes (create/update/delete) in real-time and keep your catalog up to date.
- Manage Port entities using GitOps.
- Sync [multiple GitHub organizations](/build-your-software-catalog/sync-data-to-catalog/git/github-ocean/installation?auth=pat#multi-github-organization-support) with a single integration instance.

### Supported resources

The resources that can be ingested from GitHub into Port are listed below.
It is possible to reference any field that appears in the API responses linked below in the mapping configuration.

 <GitHubResources/>

## Setup

To install the integration, see the [installation page](/build-your-software-catalog/sync-data-to-catalog/git/github-ocean/installation).

## Configuration

Port integrations use a [YAML mapping block](/build-your-software-catalog/customize-integrations/configure-mapping#configuration-structure) to ingest data from the third-party API into Port.

The mapping makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from the integration API.

To ingest GitHub objects, you can use one of the following methods:

<Tabs queryString="method">

<TabItem label="Using Port's UI" value="port">

To manage your GitHub Ocean configuration using Port:

1. Go to the [data sources](https://app.getport.io/settings/data-sources) page of your portal.
2. Under `Exporters`, click on the installed GitHub Ocean integration.
3. A window will open containing the default YAML configuration of your integration.
4. Here you can modify the configuration to suit your needs, by adding or removing entries.
5. When finished, click **Resync** to apply any changes.

Using this method applies the configuration to all organizations and repositories that the integration has permissions to.

When configuring the integration **using Port**, the YAML configuration is global, allowing you to specify mappings for multiple Port blueprints.

</TabItem>

<TabItem label="Using GitHub" value="github">

You can also manage your GitHub Ocean configuration using a config file in GitHub:

1. Go to the [data sources](https://app.getport.io/settings/data-sources) page of your portal.
2. Under `Exporters`, click on the installed GitHub Ocean integration.
3. In the configuration panel, set `repoManagedMapping: true` in the integration configuration YAML.

This tells GitHub Ocean to load its mapping from a configuration file in your GitHub organization instead of using the mapping stored in Port (when this feature is enabled in the integration).

With GitHub Ocean, configuration from Git is currently **org-level only**:

- Create a `.github-private` repository in your GitHub organization if it does not already exist.
- Add a `port-app-config.yml` file to the root of the `.github-private` repository.
- The file must be present on the **default branch** (usually `main`) to be applied.

Here is a minimal example of an org-level `port-app-config.yml` for GitHub Ocean:

```yaml showLineNumbers
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
  - kind: repository
    selector:
      query: "true"
    port:
      entity:
        mappings:
          identifier: .name
          title: .name
          blueprint: '"githubRepository"'
```

When configuring GitHub Ocean **using GitHub**:

- The `port-app-config.yml` in `.github-private` is treated as the **single global mapping** for the integration.
- Changes to this file will be picked up on the default branch and applied on the next resync or relevant event processing.
- Granular configuration (that is, `port-app-config.yml` files that live inside individual repositories rather than `.github-private`) is not yet supported for GitHub Ocean.
- Multi-organization setups are not supported in this mode: the integration reads the GitHub organization from its configuration or environment, and that organization will always be used even if the mapping file contains multiple orgs.

</TabItem>

</Tabs>

## Capabilities

For detailed information about data ingestion capabilities, see the [capabilities page](/build-your-software-catalog/sync-data-to-catalog/git/github-ocean/capabilities).

## Examples

Refer to the [examples](/build-your-software-catalog/sync-data-to-catalog/git/github-ocean/examples) page for practical configurations and their corresponding blueprint definitions.
