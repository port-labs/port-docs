import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import AzureDevopsResources from './\_azuredevops_exporter_supported_resources.mdx'

# Azure DevOps

Our integration with Azure DevOps allows you to export objects to Port as entities of existing blueprints. The integration supports real-time event processing so Port always provides an accurate real-time representation of your Azure DevOps resources.

## Common use cases

Our Azure DevOps integration makes it easy to fill the software catalog with data directly from your organization, for example:

- Map most of the resources in the organization, including **projects**, **repositories**, **pipelines**, **pull requests**, **teams** and **members**.
- Watch for Azure DevOps object changes (create/update/delete) in real-time, and automatically apply the changes to your entities in Port.
- Manage Port entities using GitOps.

## Installation

To install Port's Azure DevOps integration, follow the [installation](./installation.md) guide.

## Ingesting Git objects

This integration allows you to ingest a variety of objects resources provided by the Azure DevOps API. It allows you to perform ETL operations on data from the Azure DevOps API into the desired data model.

This integration uses a YAML configuration to describe the ETL process to load data into the developer portal. The approach reflects a golden middle between an overly opinionated Git visualization that might not work for everyone and a too-broad approach that could introduce unneeded complexity into the developer portal.

Here is an example snippet from the config which demonstrates the ETL process for getting `pull-request` data from Azure DevOps into the software catalog:

```yaml showLineNumbers
resources:
  # Extract
  # highlight-start
  - kind: pull-request
    selector:
      query: "true" # JQ boolean query. If evaluated to false - skip syncing the object.
    # highlight-end
    port:
      entity:
        mappings:
          # Transform & Load
          # highlight-start
          identifier: >-
            .repository.project.name + "/" + .repository.name + (.pullRequestId
            | tostring)
          blueprint: '"azureDevopsPullRequest"'
          properties:
            creator: .createdBy.uniqueName
            status: .status
            reviewers: '[.reviewers[].uniqueName]'
            createdAt: .creationDate
          relations:
            service: .repository.project.name + "/" + .repository.name
        # highlight-end
```

The integration makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from the different Azure DevOps API routes.

### Integration configuration

The integration's configuration is how you specify the exact resources you want to query from your organization, and which entities and properties you want to fill with the received data.

Here is an example for the integration configuration block:

```yaml showLineNumbers
resources:
  - kind: repository
    selector:
      query: 'true' # JQ boolean query. If evaluated to false - skip syncing the object.
    port:
      entity:
        mappings:
          identifier: .project.name + "/" + .name # The Entity identifier will be the repository name.
          title: .name
          blueprint: '"azureDevopsRepository"'
          properties:
            url: .url
            readme: file://README.md
```

### Configuration structure

- The root key of the integration configuration is the `resources` key:

  ```yaml showLineNumbers
  # highlight-next-line
  resources:
    - kind: repository
      selector:
      ...
  ```

- The `kind` key is a specifier for an object from the Azure DevOps API:

  ```yaml showLineNumbers
    resources:
      # highlight-next-line
      - kind: repository
        selector:
        ...
  ```

  <AzureDevopsResources/>

#### Filtering unwanted objects

The `selector` and the `query` keys let you filter exactly which objects from the specified `kind` will be ingested to the software catalog:

  ```yaml showLineNumbers
  resources:
    - kind: repository
      # highlight-start
      selector:
        query: "true" # JQ boolean query. If evaluated to false - skip syncing the object.
      # highlight-end
      port:
  ```

For example, to ingest only repositories that have a name starting with `"service"`, use the `query` key like this:

```yaml showLineNumbers
query: .name | startswith("service")
```

<br/>

The `port`, `entity` and the `mappings` keys open the section used to map the Azure DevOps API object fields to Port entities. To create multiple mappings of the same kind, you can add another item to the `resources` array;

  ```yaml showLineNumbers
  resources:
    - kind: repository
      selector:
        query: "true"
      port:
        # highlight-start
        entity:
          mappings: # Mappings between one Azure DevOps API object to a Port entity. Each value is a JQ query.
            identifier: .project.name + "/" + .name
            title: .name
            blueprint: '"azureDevopsRepository"'
            properties:
              url: .url
              readme: file://README.md
        # highlight-end
    - kind: repository # In this instance project is mapped again with a different filter
      selector:
        query: '.name == "MyRepositoryName"'
      port:
        entity:
          mappings: ...
  ```

  :::tip
  Pay attention to the value of the `blueprint` key, if you want to use a hardcoded string, you need to encapsulate it in 2 sets of quotes, for example use a pair of single-quotes (`'`) and then another pair of double-quotes (`"`)
  :::

## Permissions

Port's Azure DevOps integration requires a personal access token, follow the instructions in the [installation](./installation.md#create-a-personal-access-token) guide.

## Examples

Refer to the [examples](./examples.md) page for practical configurations and their corresponding blueprint definitions.

## GitOps

Port's Azure DevOps integration also provides GitOps capabilities, refer to the [GitOps](./gitops/gitops.md) page to learn more.

## Advanced

Refer to the [advanced](./advanced.md) page for advanced use cases and examples.
