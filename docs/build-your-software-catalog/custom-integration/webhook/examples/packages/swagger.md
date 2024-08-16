---
sidebar_position: 5
description: Ingest Swagger paths into your catalog
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import SwaggerBlueprint from './resources/swagger/\_example_swagger_blueprint.mdx'
import SwaggerWebhookConfig from './resources/swagger/\_example_swagger_webhook_config.mdx'

# Swagger
The following example shows you how to create a `swaggerPath` blueprint that ingests all API paths in your `swagger.json` file using Port's GitHub file ingesting feature.

To ingest the packages to Port, the GitHub integration is used.


## Prerequisites
This guide assumes:
- You have a Port account
- You have installed [Port's GitHub app](docs/build-your-software-catalog/sync-data-to-catalog/git/github/installation.md) in your organisation or in repositories you are interested in.

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
<summary>Swagger path blueprint</summary>

```json showLineNumbers

```

</details>

<details>
<summary>Swagger path mapping configuration</summary>

```yaml showLineNumbers
{
  "identifier": "swaggerPath",
  "description": "This blueprint represents a Swagger path in our software catalog",
  "title": "Swagger API Paths",
  "icon": "Swagger",
  "schema": {
    "properties": {
      "method": {
        "type": "string",
        "title": "Method",
        "default": "get",
        "enum": ["get", "post", "delete", "put", "patch"],
        "enumColors": {
          "get": "yellow",
          "post": "green",
          "delete": "red",
          "put": "purple",
          "patch": "purple"
        }
      },
      "host": {
        "type": "string",
        "title": "API Base URL",
        "format": "url"
      },
      "path": {
        "title": "Path",
        "type": "string"
      },
      "parameters": {
        "items": {
          "type": "object"
        },
        "title": "Parameters",
        "type": "array"
      },
      "responses": {
        "title": "Responses",
        "type": "object"
      },
      "description": {
        "title": "Description",
        "type": "string"
      },
      "version": {
        "title": "Version",
        "type": "string"
      },
      "summary": {
        "title": "Summary",
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
Then click on `Resync` and wait for the entities to be ingested in your Port environment.
