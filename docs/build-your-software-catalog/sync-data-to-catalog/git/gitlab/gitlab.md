import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import GitlabResources from './\_gitlab_exporter_supported_resources.mdx'

# GitLab

Our integration with GitLab allows you to export GitLab objects to Port as entities of existing blueprints. The integration supports real-time event processing so Port always provides an accurate real-time representation of your GitLab resources.

## 💡 GitLab integration common use cases

Our GitLab integration makes it easy to fill the software catalog with data directly from your GitLab organization, for example:

- Map all of the resources in your GitLab organization, including **groups**, **projects**, **monorepos**, **merge requests**, **issues**, **pipelines** and other GitLab objects;
- Watch for GitLab object changes (create/update/delete) in real-time, and automatically apply the changes to your entities in Port;
- Manage Port entities using GitOps;
- etc.

## Installation

To install Port's GitLab integration, follow the [installation](./installation.md) guide.

## Ingesting Git objects

By using Port's GitLab integration, you can automatically ingest GitLab resources into Port based on real-time events.

Port's GitLab integration allows you to ingest a variety of objects resources provided by the GitLab API, including groups, projects, merge requests, pipelines and more. The GitLab integration allows you to perform extract, transform, load (ETL) on data from the GitLab API into the desired software catalog data model.

The GitLab integration uses a YAML configuration to describe the ETL process to load data into the developer portal. The approach reflects a golden middle between an overly opinionated Git visualization that might not work for everyone and a too-broad approach that could introduce unneeded complexity into the developer portal.

Here is an example snippet from the config which demonstrates the ETL process for getting `merge-request` data from GitLab and into the software catalog:

```yaml showLineNumbers
resources:
  # Extract
  # highlight-start
  - kind: merge-request
    selector:
      query: "true" # JQ boolean query. If evaluated to false - skip syncing the object.
    # highlight-end
    port:
      entity:
        mappings:
          # Transform & Load
          # highlight-start
          identifier: .id | tostring
          title: .title
          blueprint: '"gitlabMergeRequest"'
          properties:
            creator: .author.name
            status: .state
            createdAt: .created_at
            updatedAt: .updated_at
            link: .web_url
        # highlight-end
```

The integration makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from GitLab's API events.

### The integration configuration

The integration configuration is how you specify the exact resources you want to query from your GitLab, and also how you specify which entities and which properties you want to fill with data from GitLab.

Here is an example for the integration configuration block:

```yaml showLineNumbers
resources:
  - kind: project
    selector:
      query: "true" # JQ boolean query. If evaluated to false - skip syncing the object.
    port:
      entity:
        mappings:
          identifier: .namespace.full_path | gsub("/";"-") # The Entity identifier will be the repository name.
          title: .name
          blueprint: '"service"'
          properties:
            url: .web_link
            description: .description
            namespace: .namespace.name
            fullPath: .namespace.full_path | split("/") | .[:-1] | join("/")
            defaultBranch: .default_branch
```

### Integration configuration structure

- The root key of the integration configuration is the `resources` key:

  ```yaml showLineNumbers
  # highlight-next-line
  resources:
    - kind: project
      selector:
      ...
  ```

- The `kind` key is a specifier for an object from the GitLab API:

  ```yaml showLineNumbers
    resources:
      # highlight-next-line
      - kind: project
        selector:
        ...
  ```

  <GitlabResources/>

#### Filtering unwanted objects

The `selector` and the `query` keys let you filter exactly which objects from the specified `kind` will be ingested to the software catalog

```yaml showLineNumbers
resources:
  - kind: project
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

The `port`, `entity` and the `mappings` keys open the section used to map the GitLab API object fields to Port entities. To create multiple mappings of the same kind, you can add another item to the `resources` array;

```yaml showLineNumbers
resources:
  - kind: project
    selector:
      query: "true"
    port:
      # highlight-start
      entity:
        mappings: # Mappings between one GitLab API object to a Port entity. Each value is a JQ query.
          identifier: .namespace.full_path | gsub("/";"-")
          title: .name
          blueprint: '"service"'
          properties:
            url: .web_link
            description: .description
            namespace: .namespace.name
            fullPath: .namespace.full_path | split("/") | .[:-1] | join("/")
            defaultBranch: .default_branch
      # highlight-end
  - kind: project # In this instance project is mapped again with a different filter
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

Port's GitLab integration requires a group access token with the `api` scope.

To create a group access token, follow the instructions in the [installation](./installation.md#creating-a-gitlab-group-access-token) guide

## Examples

Refer to the [examples](./examples.md) page for practical configurations and their corresponding blueprint definitions.

## GitOps

Port's GitLab integration also provides GitOps capabilities, refer to the [GitOps](./gitops/gitops.md) page to learn more.

## Advanced

Refer to the [advanced](./advanced.md) page for advanced use cases and examples.
