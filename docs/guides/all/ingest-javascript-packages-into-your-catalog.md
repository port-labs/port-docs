---
description: Ingests all Javascript packages in `package.json` file using Port's GitHub file ingesting feature.
displayed_sidebar: null
title: Ingest Javascript packages into your catalog
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import ServiceBlueprint from '../templates/service/\_example_global_service_blueprint.mdx'
import PackageBlueprint from '../templates/javascript/\_example_package_blueprint.mdx'
import PackageWebhookConfig from '../templates/javascript/\_example_package_webhook_config.mdx'

# Ingest Javascript packages into your catalog

The following example shows you how to create a `package` blueprint that ingests all third party dependencies and libraries in your `package.json` file using Port's GitHub file ingesting feature. You will then relate this blueprint to a `service` blueprint, allowing you to map all the packages used by a service.

To ingest the packages to Port, a `port-app-config.yml` file in the needed repository or organisation is used.

## Prerequisites
This guide assumes:
- You have a Port account
- You have installed [Port's GitHub app](/build-your-software-catalog/sync-data-to-catalog/git/github/#setup) in your organisation or in repositories you are interested in.

## GitHub configuration

To ingest GitHub objects, use one of the following methods:

<Tabs queryString="method">

<TabItem label="Using Port's UI" value="port">

To manage your GitHub integration configuration using Port:

1. Go to the [data sources](https://app.getport.io/settings/data-sources) page of your portal.
2. Under `Exporters`, click on your desired GitHub organization.
3. A window will open containing the default YAML configuration of your GitHub integration.
4. Here you can modify the configuration to suit your needs, by adding/removing entries.
5. When finished, click `resync` to apply any changes.

Using this method applies the configuration to all repositories that the GitHub app has permissions to.

When configuring the integration **using Port**, the YAML configuration is global, allowing you to specify mappings for multiple Port blueprints.

</TabItem>

<TabItem label="Using GitHub" value="github">

To manage your GitHub integration configuration using a config file in GitHub:

1. Go to the [data sources](https://app.getport.io/settings/data-sources) page of your portal.
2. Under `Exporters`, click on your desired GitHub organization.
3. A window will open containing the default YAML configuration of your GitHub integration.
4. Scroll all the way down, and turn on the `Manage this integration using the "port-app-config.yml" file` toggle.

This will clear the configuration in Port's UI.

When configuring the integration **using GitHub**, you can choose either a global or granular configuration:

- **Global configuration:** create a `.github-private` repository in your organization and add the `port-app-config.yml` file to the repository.
  - Using this method applies the configuration to all repositories that the GitHub app has permissions to (unless it is overridden by a granular `port-app-config.yml` in a repository).
- **Granular configuration:** add the `port-app-config.yml` file to the `.github` directory of your desired repository.
  - Using this method applies the configuration only to the repository where the `port-app-config.yml` file exists.

When using global configuration **using GitHub**, the configuration specified in the `port-app-config.yml` file will only be applied if the file is in the **default branch** of the repository (usually `main`).

</TabItem>

</Tabs>

:::info Important
When **using Port's UI**, the specified configuration will override any `port-app-config.yml` file in your GitHub repository/ies.
:::

## Setting up the blueprint and mapping configuration

Create the following blueprint definition and mapping configuration:

<details>
<summary><b>Service blueprint (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "service",
  "title": "Service",
  "icon": "Service",
  "schema": {
    "properties": {
      "description": {
        "title": "Description",
        "type": "string"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "relations": {}
}
```

</details>

<details>
<summary><b>Package blueprint (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "package",
  "description": "This blueprint represents a software package file in our catalog",
  "title": "Package",
  "icon": "Package",
  "schema": {
    "properties": {
      "version": {
        "type": "string",
        "title": "Dependency Version"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "relations": {
    "service": {
      "title": "Service",
      "target": "service",
      "required": false,
      "many": true
    }
  }
}
```

</details>

<details>
<summary><b>Package mapping config (Click to expand)</b></summary>

```yaml showLineNumbers
resources:
  - kind: file
    selector:
      query: 'true'
      files:
        - path: '**/package.json'
    port:
      itemsToParse: .file.content.dependencies | to_entries
      entity:
        mappings:
          # Since identifier cannot contain special characters, we are using jq to remove them
          identifier: >-
            .item.key + "_" + if (.item.value | startswith("^")) then
            .item.value[1:] else .item.value end
          title: .item.key + "@" + .item.value
          blueprint: '"package"'
          properties:
            package: .item.key
            version: .item.value
          relations: {}
```

</details>

Then click on `Resync` and wait for the entities to be ingested in your Port environment

For an example showing how to integrate the above with your existing Gitlab CI pipelines, visit:

- [Package.json example](https://github.com/port-labs/package-json-webhook-example)
