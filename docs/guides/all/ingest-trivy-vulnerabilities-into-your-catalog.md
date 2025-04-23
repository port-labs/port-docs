---
description: Ingests Trivy vulnerabilities in your Trivy scan results file using Port's GitHub file ingesting feature.
displayed_sidebar: null
title: Ingest Trivy vulnerabilities into your catalog
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PythonScript from '../templates/trivy/\_example_python_script.mdx'
import TrivyBlueprint from '../templates/trivy/\_example_trivy_blueprint.mdx'
import TrivyWebhookConfig from '../templates/trivy/\_example_trivy_webhook_config.mdx'

# Ingest Trivy vulnerabilities into your catalog

The following example shows you how to create a `trivyVulnerability` blueprint that ingests all vulnerabilities in your Trivy result file using Port's GitHub file ingesting feature.

To ingest the packages to Port, a `port-app-config.yml` file in the needed repository or organisation is used.

:::info Recommended installation option
While the script provided in this example facilitates scheduled ingestion of Trivy scan results to Port, we highly recommend that you [use our Trivy Kubernetes exporter](/build-your-software-catalog/sync-data-to-catalog/kubernetes-stack/kubernetes/templates/trivy) to continuously scan your kubernetes cluster and ingest vulnerabilities to Port in real time. 
:::


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

Create the following blueprint definition and webhook configuration:

<details>
<summary><b>Trivy vulnerability blueprint (Click to expand)</b></summary>
<TrivyBlueprint/>
</details>

<details>
<summary><b>Trivy mapping configuration</b></summary>

```yaml showLineNumbers
- kind: file
  selector:
    query: 'true'
    files:
      - path: '**/result.json' # path to results json file
  port:
    itemsToParse: '[.file.content[] | select(.Vulnerabilities != null) as $input | .Vulnerabilities[] | {VulnerabilityID, PkgName, InstalledVersion, FixedVersion, Title, Description, Severity, References, PrimaryURL, DataSource, Target: $input.Target}]'
    entity:
      mappings:
        identifier: .item.VulnerabilityID
        title: .item.Title
        blueprint: '"trivyVulnerability"'
        properties:
          version: .item.InstalledVersion
          package_name: .item.PkgName
          primaryUrl: .item.PrimaryURL
          description: .item.Description
          target: .item.Target
          severity: .item.Severity
          data_source: .item.DataSource
```

</details>

Then click on `Resync` and wait for the entities to be ingested in your Port environment