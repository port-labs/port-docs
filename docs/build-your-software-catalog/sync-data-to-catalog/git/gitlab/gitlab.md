import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# GitLab

Port's GitLab integration allows you to export GitLab objects to Port as entities of existing blueprints. The integration supports real-time event processing so Port always provides an accurate real-time representation of your GitLab resources.

## Capabilities

Our GitLab integration makes it easy to fill the software catalog with data directly from your GitLab organization, for example:

- Map all of the resources in your GitLab organization, including **groups**, **projects**, **monorepos**, **merge requests**, **issues**, **pipelines** and other GitLab objects.
- Watch for GitLab object changes (create/update/delete) in real-time, and automatically apply the changes to your entities in Port.
- Manage Port entities using GitOps.

### Supported Resources

The resources that can be ingested from GitLab into Port are listed below.  
It is possible to reference any field that appears in the API responses linked below in the mapping configuration.

- [`project`](https://docs.gitlab.com/ee/api/projects.html#get-single-project)
- [`merge-request`](https://docs.gitlab.com/ee/api/merge_requests.html#get-single-mr)
- [`issue`](https://docs.gitlab.com/ee/api/issues.html#get-single-issue)
- [`pipeline`](https://docs.gitlab.com/ee/api/pipelines.html#get-a-single-pipeline)
- [`group`](https://docs.gitlab.com/ee/api/groups.html#details-of-a-group)
- [`file`](https://docs.gitlab.com/ee/api/repository_files.html#get-file-from-repository)

## Setup

To install Port's GitLab integration, follow the [installation](./installation.md#setup) guide.
:::info Permission
Port's GitLab integration requires a group access token with the `api` scope.
To create a group access token, follow the instructions in the [installation](./installation.md#creating-a-gitlab-group-access-token) guide
:::

## Configuration

Port integrations use a [YAML mapping block](/build-your-software-catalog/customize-integrations/configure-mapping#configuration-structure) to ingest data from the third-party api into Port.

The mapping makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from the integration API.

### Filtering support

The Ocean GitLab integration supports querying objects from various `kind`s using GitLab's query parameters, making it possible to specifically filter the resources that are queried from GitLab and ingested into Port.

To use filtering, add a `parameters` key to the `selector` object with your desired GitLab API query parameters as key-value pairs. For example:

```yaml showLineNumbers
resources:
  # highlight-next-line
  - kind: issue
    selector:
      query: "true" # JQ boolean expression. If evaluated to false - this object will be skipped.
      # highlight-next-line
      parameters:
        state: "opened"  # Only ingest issues that are open
        labels: "bug"    # Only issues labeled as "bug"
    port:
```

This will ingest only the issues that are currently open and have the label "bug".

Alternatively, you can use the `query` key in the `selector` to filter objects using JQ expressions. For example:

```yaml showLineNumbers
resources:
  - kind: project
    selector:
      query: '.name | startswith("service")' # Only projects with names starting with "service"
    port:
```

Refer to the [GitLab API documentation](https://docs.gitlab.com/ee/api/) for the available query parameters for each resource kind.

Example: Filtering merge requests by author

To ingest only merge requests created by a specific user, you can use the `parameters` key like this:

```yaml showLineNumbers
resources:
  - kind: merge-request
    selector:
      query: "true"
      parameters:
        author_username: "johndoe"  # Replace with the username of the author
    port:
```

### Ingest files from your repositories

Port allows you to fetch `JSON` and `YAML` files from your repositories and create entities from them in your software catalog.  
This is done using the `file` kind in your GitLab mapping configuration.

For example, to manage your `package.json` files in Port, you can create a `manifest` blueprint, with each of its entities representing a `package.json` file.

The following configuration fetches all `package.json` files from "MyRepo" and "MyOtherRepo" and creates an entity for each of them, based on the `manifest` blueprint:

```yaml showLineNumbers
resources:
  - kind: file
    selector:
      query: 'true'
      files:
        # Note that glob patterns are supported, so you can use wildcards to match multiple files
        path: '**/package.json'
        # The `repos` key can be used to filter the repositories from which the files will be fetched.
        repos:
          # The repository NAME should be used here, not the URL slug
          - "MyRepoName"
          - "MyOtherRepoName"
    port:
      entity:
        mappings:
          identifier: .file.file_path
          title: .file.file_name
          blueprint: '"manifest"'
          properties:
            project_name: .file.content.name
            project_version: .file.content.version
            license: .file.content.license
```

:::tip Test your mapping
After adding the `file` kind to your mapping configuration, click on the `Resync` button. When you open the mapping configuration again, you will see real examples of files fetched from your GitLab organization.

This will help you see what data is available to use in your `jq` expressions.  
Click on the `Test mapping` button to test your mapping against the example data.
:::

### Create multiple entities from a single file

In some cases, you may want to parse a single JSON/YAML file and create multiple entities from it.  
You can use the `itemsToParse` key in your mapping configuration for this purpose.

For example, to track a project's dependencies in Port, you can create a `package` blueprint, with each entity representing a dependency from a `package.json` file.

The following configuration fetches a `package.json` file from a specific repository and creates an entity for each of the dependencies in the file, based on the `package` blueprint:

```yaml showLineNumbers
resources:
  - kind: file
    selector:
      query: 'true'
      files:
        path: '**/package.json'
        # Fetching from a specific repository
        repos:
          - MyRepoName
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

### Multi-document YAML files

For multi-document YAML files (a single file containing multiple YAML documents separated by `---`), `.file.content` will resolve to an array of objects.

You can use one of these methods to ingest multi-document YAML files:

1. Use the `itemsToParse` key to create multiple entities from such a file.
2. Map the result to an `array` property.

:::tip Handling mixed YAML types
If you have both single-document and multi-document YAML files in your repositories, you can use the `itemsToParse` key like this to handle both cases:

```yaml
itemsToParse: .file.content | if type== "object" then [.] else . end
```
:::



## Limitations

- Currently only files up to 1MB in size are supported.
- Only JSON and YAML formats are automatically parsed. Other file formats can be ingested as raw files.
- GLOB patterns are supported for file pattern matching, but wildcards at the end (e.g., `**/*`) are not allowed, in order to prevent matching all files indiscriminately.
- Currently only the default branch of the repository is supported.



## Examples

Refer to the [examples](./examples.md) page for practical configurations and their corresponding blueprint definitions.

## Relevant Guides

For relevant guides and examples, see the [guides section](https://docs.getport.io/guides?tags=GitLab).


## GitOps

Port's GitLab integration also provides GitOps capabilities, refer to the [GitOps](./gitops/gitops.md) page to learn more.

## Advanced

Refer to the [advanced](./advanced.md) page for advanced use cases and examples.