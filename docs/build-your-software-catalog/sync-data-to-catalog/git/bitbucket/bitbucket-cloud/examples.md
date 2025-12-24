---
sidebar_position: 2
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import MicroserviceBlueprint from './\_bitbucket_integration_example_repository_blueprint.mdx'
import PRBlueprint from './\_bitbucket_integration_example_pull_request_blueprint.mdx'
import PortAppConfig from './\_bitbucket_integration_example_port_app_config.mdx'
import BitbucketResources from './\_bitbucket_integration_supported_resources.mdx'
import PortMonoRepoAppConfig from './\_bitbucket_integration_example_monorepo_port_app_config.mdx'
import ProjectBlueprint from './\_bitbucket_integration_example_project_blueprint.mdx'
import FileBlueprint from './\_bitbucket_integration_example_file_blueprint.mdx'
import FileAppConfig from './\_bitbucket_integration_example_file_port_app_config.mdx'

# Examples

## Mapping repositories, file contents and pull requests

The following example demonstrates how to ingest your Bitbucket projects, repositories, pull requests and files to Port. You will also see how to ingest folders from monorepo repositories and files from specific repositories:

<ProjectBlueprint/>

<MicroserviceBlueprint/>

<PRBlueprint/>

<PortAppConfig/>

### Repository configuration options

<Tabs groupId="config" queryString="parameter">

<TabItem label="User role" value="userRole">

The `userRole` selector filters repositories based on the current user’s role. Only **one** role can be specified per sync.

Allowed values:
- `owner`: Repositories owned by the current user.
- `member`: Repositories to which the user has explicit read access.
- `admin`: Repositories to which the user has explicit administrator access.
- `contributor`: Repositories to which the user has explicit write access.

By default, if not specified, no user role filter will be applied.

```yaml showLineNumbers
  - kind: repository
    selector:
      query: 'true'
      # highlight-next-line
      userRole: owner
```

</TabItem>

<TabItem label="Repository query" value="repoQuery">

The `repoQuery` selector allows you to filter repositories based on a custom query. You can specify a custom query to include in the sync.

```yaml showLineNumbers
  - kind: repository
    selector:
      query: 'true'
      # highlight-next-line
      repoQuery: 'language="python"'
```

</TabItem>

</Tabs>

### Pull request configuration options

The `pullRequestQuery` selector allows you to filter pull requests based on a custom query. You can specify a custom query per the official BitBucket filtering and sorting specifications to include in the sync.

By default, if not specified, all open pull requests will be ingested.

```yaml
  - kind: pull-request
    selector:
      query: 'true'
      # highlight-next-line
      pullRequestQuery: 'state="OPEN" OR (state="MERGED" AND updated_on > "2025-12-10T14:00:00-07:00")'
```

:::warning Performance impact
Non-open pull requests (such as `MERGED` or `DECLINED`) can accumulate to an extremely large volume over time, which may significantly increase the time required to complete a resync for the integration.

To prevent performance degradation, if you intend to ingest non-open pull requests, you must add a filtering criteria such as `updated_on` to limit the number of items ingested.
The example above demonstrates this by retrieving all `OPEN` pull requests, while limiting `MERGED` pull requests to those updated after a specific timestamp.
:::

:::tip

- Refer to the [installation](installation.md) guide to learn more about the `port-app-config.yml` installation process;
- We leverage [JQ JSON processor](https://stedolan.github.io/jq/manual/) to map and transform Bitbucket objects to Port Entities;
- Click [Here](https://developer.atlassian.com/cloud/bitbucket/rest/api-group-workspaces/#api-workspaces-workspace-projects-get) for the Bitbucket project object structure.
- Click [Here](https://developer.atlassian.com/cloud/bitbucket/rest/api-group-repositories/#api-repositories-workspace-repo-slug-get) for the Bitbucket repository object structure.
- Click [Here](https://developer.atlassian.com/cloud/bitbucket/rest/api-group-pullrequests/#api-repositories-workspace-repo-slug-pullrequests-pull-request-id-get) for the Bitbucket pull request object structure.
- Click [Here](https://developer.atlassian.com/cloud/bitbucket/rest/intro/#filtering) for the Bitbucket filtering and sorting API.
:::

After creating the blueprints and updating the mapping, you will see new entities in Port matching your repositories alongside their README.md file contents and pull requests.

## Mapping repositories and monorepos

The following example demonstrates how to ingest your Bitbucket repositories and their folders to Port. By following this example you can map your different repositories, packages and libraries from your monorepo into separate entities in Port:

<MicroserviceBlueprint/>

<PortMonoRepoAppConfig/>

:::tip
- Click [Here](https://developer.atlassian.com/cloud/bitbucket/rest/api-group-repositories/#api-repositories-workspace-repo-slug-get) for the Bitbucket repository object structure.
- Click [Here](https://developer.atlassian.com/cloud/bitbucket/rest/api-group-source/#api-repositories-workspace-repo-slug-src-commit-path-get) for the Bitbucket folder object structure.

:::

## Mapping files

The following example demonstrates how to ingest files from a specific repository. You will be able to map files and file contents from specific repositories as entities in Port:

:::warning User-Scoped Token Required
The `file` kind requires **user-scoped token** (or existing app password) for authentication. Workspace tokens do not support file ingestion. Since new app passwords cannot be created as of September 9, 2025, ensure you've configured a user-scoped token in your integration setup.
:::

<FileBlueprint/>

<FileAppConfig/>

:::tip
- Refer to the [GitOps](gitops/gitops.md) guide to learn more about using your repository as a source of truth for your software catalog;
- Click [Here](https://developer.atlassian.com/cloud/bitbucket/rest/api-group-source/#api-repositories-workspace-repo-slug-src-commit-path-get) for the Bitbucket file object structure.
:::

## Mapping supported resources

The above examples show specific use cases, but Port's Bitbucket integration supports other use cases as well. To adapt the examples shown above, use the Bitbucket API reference to learn about the available fields for the different supported objects:

<BitbucketResources/>

When adding the ingestion of other resources, remember to add a entry to the `resources` array and change the value provided to the `kind` key accordingly.
