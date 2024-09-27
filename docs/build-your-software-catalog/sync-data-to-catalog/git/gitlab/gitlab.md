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