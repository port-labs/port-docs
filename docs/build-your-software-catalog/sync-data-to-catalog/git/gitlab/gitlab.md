import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import GitlabResources from './\_gitlab_exporter_supported_resources.mdx'

# Gitlab

Our integration with Gitlab allows you to export Gitlab objects to Port as entities of existing blueprints. The integration supports real-time event processing so Port always provides an accurate real-time representation of your Gitlab resources.

## 💡 Gitlab integration common use cases

Our Gitlab integration makes it easy to fill the software catalog with data directly from your Gitlab organization, for example:

- Map all of the resources in your Gitlab organization, including **projects**, **merge requests**, **issues**, **pipelines** and other Gitlab objects;
- Watch for Gitlab object changes (create/update/delete) in real-time, and automatically apply the changes to your entities in Port;
- Manage Port entities using GitOps;

## installation

To install Port's Gitlab app, follow the [installation](./installation.md) guide.

## Ingesting Git objects

By using Port's Gitlab integration, you can automatically ingest Gitlab resources into Port based on real-time events.

Port's Gitlab app allows you to ingest a variety of objects resources provided by the Gitlab API, including projects, merge requests, pipelines and more. The Gitlab app allows you to perform extract, transform, load (ETL) on data from the Gitlab API into the desired software catalog data model.

The Gitlab app uses a YAML configuration to describe the ETL process to load data into the developer portal. The approach reflects a golden middle between an overly opinionated Git visualization that might not work for everyone and a too-broad approach that could introduce unneeded complexity into the developer portal.

Here is an example snippet from the config which demonstrates the ETL process for getting `merge-request` data from the Gitlab and into the software catalog:

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
          blueprint: '"mergeRequest"'
          properties:
            creator: .author.name
            status: .state
            createdAt: .created_at
            updatedAt: .updated_at
            description: .description
            link: .web_url
        # highlight-end
```

The app makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from Gitlab's API events.

### The integration configuration

The integration configuration is how you specify the exact resources you want to query from your Gitlab, and also how you specify which entities and which properties you want to fill with data from Gitlab.

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
        blueprint: '"microservice"'
        properties:
          url: .web_link
          description: .description
          namespace: .namespace.name
          full_path: .namespace.full_path | split("/") | .[:-1] | join("/")
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

- The `kind` key is a specifier for an object from the Gitlab API:

  ```yaml showLineNumbers
    resources:
      # highlight-next-line
      - kind: project
        selector:
        ...
  ```

  <GitlabResources/>

- The `selector` and the `query` keys let you filter exactly which objects from the specified `kind` will be ingested to the software catalog

  ```yaml showLineNumbers
  resources:
    - kind: project
      # highlight-start
      selector:
        query: "true" # JQ boolean query. If evaluated to false - skip syncing the object.
      # highlight-end
      port:
  ```

  Some example use cases:

  - To sync all objects from the specified `kind`: do not specify a `selector` and `query` key;
  - To sync all objects from the specified `kind` that start with `service`, use:

    ```yaml showLineNumbers
    query: .name | startswith("service")
    ```

  - etc.

- The `port`, `entity` and the `mappings` keys open the section used to map the Gitlab API object fields to Port entities. To create multiple mappings of the same kind, you can add another item to the `resources` array;

  ```yaml showLineNumbers
  resources:
  - kind: project
    selector:
      query: 'true'
    port:
      # highlight-start
      entity:
        mappings: # Mappings between one Gitlab API object to a Port entity. Each value is a JQ query.
          identifier: .namespace.full_path | gsub("/";"-")
          title: .name
          blueprint: '"microservice"'
          properties:
            url: .web_link
            description: .description
            namespace: .namespace.name
            full_path: .namespace.full_path | split("/") | .[:-1] | join("/")
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

### Setup

To ingest Gitlab objects using the [`integration configuration`](#the-integration-configuration), you can follow the steps below:

1. Go to the DevPortal Builder page;
2. Select a blueprint you want to ingest using Gitlab;
3. Choose the **Ingest Data** option from the menu;
4. Select Gitlab under the Git providers category;
5. Add the contents of your [`integration configuration`](#the-integration-configuration) to the editor;
6. Click `Save & Resync`.

## Permissions

Port's Gitlab integration requires a group access token with permissions over the `api` scope. To create a group access token, follow the steps below:

1. Sign in to GitLab and go to your desired group's settings.
2. In the "Access Tokens" section, click "Create access token."
3. Fill in the token details: name, expiration (optional), and select API scope.
4. Click "Create group access token."
5. Copy the generated token and use it in the integration installation process.

## Examples

Refer to the [examples](./examples.md) page for practical configurations and their corresponding blueprint definitions.

## GitOps

Port's Gitlab app also provides GitOps capabilities, refer to the [GitOps](./gitops/gitops.md) page to learn more.

## Advanced

Refer to the [advanced](./advanced.md) page for advanced use cases and examples.
