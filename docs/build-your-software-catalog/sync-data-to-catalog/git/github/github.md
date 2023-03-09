# GitHub

Our integration with GitHub allows you to export GitHub objects to Port as entities of existing blueprints. The integration supports real-time event processing so Port always provides an accurate real-time representation of your GitHub resources.

## 💡 GitHub integration common use cases

Our GitHub integration makes it easy to fill the software catalog with data directly from your GitHub organization, for example:

- Map all of the resources in your GitHub organization, including **repositories**, **pull requests**, **workflows**, **workflow runs** and other GitHub objects;
- Watch for GitHub object changes (create/update/delete) in real-time, and automatically apply the changes to your entities in Port;
- Manage Port entities using GitOps;
- Trigger GitHub workflows directly from Port;
- etc.

## Installation

To install Port's GitHub app, follow the [installation](./installation.md) guide.

## Ingesting Git objects

By using Port's GitHub app, you can automatically ingest GitHub resources into Port based on real-time events.

Port's GitHub app allows you to ingest a variety of objects resources provided by the GitHub API, including repositories, pull requests, workflows and more. The GitHub app allows you to perform extract, transform, load (ETL) on data from the GitHub API into the desired software catalog data model.

The GitHub app uses a YAML configuration file to describe the ETL process to load data into the developer portal. The approach reflects a golden middle between an overly opinionated Git visualization that might not work for everyone and a too-broad approach that could introduce unneeded complexity into the developer portal.

Here is an example snippet from the `port-app-config.yml` file which demonstrates the ETL process for getting `pullRequest` data from the GitHub organization and into the software catalog:

```yaml showLineNumbers
resources:
  # highlight-start
  - kind: pull-request
    selector:
      query: "true" # JQ boolean query. If evaluated to false - skip syncing the object.
    # highlight-end
    port:
      entity:
        mappings:
          # highlight-start
          identifier: ".head.repo.name + (.id|tostring)" # The Entity identifier will be the repository name + the pull request ID. After the Entity is created, the exporter will send `PATCH` requests to update this pull request within Port.
          title: ".title"
          blueprint: '"pullRequest"'
          properties:
            creator: ".user.login"
            assignees: "[.assignees[].login]"
            reviewers: "[.requested_reviewers[].login]"
            status: ".status" # merged, closed, opened
            closedAt: ".closed_at"
            updatedAt: ".updated_at"
            mergedAt: ".merged_at"
            description: ".body"
            prNumber: ".id"
            link: ".html_url"
            # highlight-end
```

The app makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from GitHub's API events.

### `port-app-config.yml` file

The `port-app-config.yml` file is how you specify the exact resources you want to query from your GitHub organization, and also how you specify which entities and which properties you want to fill with data from GitHub.

Here is an example `port-app-config.yml` block:

```yaml showLineNumbers
resources:
  - kind: repository
    selector:
      query: "true" # JQ boolean query. If evaluated to false - skip syncing the object.
    port:
      entity:
        mappings:
          identifier: ".name" # The Entity identifier will be the repository name.
          title: ".name"
          blueprint: '"microservice"'
          properties:
            url: ".html_url"
            description: ".description"
```

### `port-app-config.yml` structure

- The root key of the `port-app-config.yml` file is the `resources` key:

  ```yaml showLineNumbers
  # highlight-next-line
  resources:
    - kind: repository
      selector:
      ...
  ```

- The `kind` key is a specifier for an object from the GitHub API:

  ```yaml showLineNumbers
    resources:
      # highlight-next-line
      - kind: repository
        selector:
        ...
  ```

  :::tip

    <details>
    <summary>List of GitHub resources that can be parsed</summary>

  repository
  pull-request
  workflow
  workflow-run
  issue

    </details>

  A reference of available Kubernetes Resources to list, watch, and export can be found [**here**](https://kubernetes.io/docs/reference/kubernetes-api/)
  :::

- The `selector` and the `query` keys let you filter exactly which objects from the specified `kind` will be ingested to the software catalog

  ```yaml showLineNumbers
  resources:
    - kind: apps/v1/replicasets
      # highlight-start
      selector:
        query: .metadata.namespace | startswith("kube") | not # JQ boolean query. If evaluated to false - skip syncing the object.
      # highlight-end
      port:
  ```

  Some example use cases:

  - To sync all objects from the specified `kind`: do not specify a `selector` and `query` key;
  - To sync all objects from the specified `kind` that are not related to the internal Kubernetes system, use:

    ```yaml showLineNumbers
    query: .metadata.namespace | startswith("kube") | not
    ```

  - To sync all objects from the specified `kind` that start with `production`, use:

    ```yaml showLineNumbers
    query: .metadata.namespace | startswith("production")
    ```

  - etc.

- The `port`, `entity` and the `mappings` keys open the section used to map the Kubernetes object fields to Port entities, the `mappings` key is an array where each object matches the structure of an [entity](../../../sync-data-to-catalog/sync-data-to-catalog.md#entity-json-structure)

  ```yaml showLineNumbers
  resources:
    - kind: apps/v1/replicasets
      selector:
        query: .metadata.namespace | startswith("kube") | not
      # highlight-start
      port:
        entity:
          mappings: # Mappings between one K8s object to one or many Port Entities. Each value is a JQ query.
            - identifier: .metadata.name
              title: .metadata.name
              blueprint: '"myBlueprint"'
              properties:
                creationTimestamp: .metadata.creationTimestamp
                annotations: .metadata.annotations
                status: .status
              relations:
                myRelation: .metadata.namespace
      # highlight-end
  ```
