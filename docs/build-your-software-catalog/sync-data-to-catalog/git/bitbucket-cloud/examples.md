---
sidebar_position: 2
---

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

In the following example you will ingest your Bitbucket projects, repositories, pull requests and files to Port. You will also see how to ingest folders from monorepo repositories and files from specific repositories:

<ProjectBlueprint/>

<MicroserviceBlueprint/>

<PRBlueprint/>

<PortAppConfig/>

:::tip

- Refer to the [installation](installation.md) guide to learn more about the `port-app-config.yml` installation process;
- We leverage [JQ JSON processor](https://stedolan.github.io/jq/manual/) to map and transform Bitbucket objects to Port Entities;
- Click [Here](https://developer.atlassian.com/cloud/bitbucket/rest/api-group-workspaces/#api-workspaces-workspace-projects-get) for the Bitbucket project object structure.
- Click [Here](https://developer.atlassian.com/cloud/bitbucket/rest/api-group-repositories/#api-repositories-workspace-repo-slug-get) for the Bitbucket repository object structure.
- Click [Here](https://developer.atlassian.com/cloud/bitbucket/rest/api-group-pullrequests/#api-repositories-workspace-repo-slug-pullrequests-pull-request-id-get) for the Bitbucket pull request object structure.
:::

After creating the blueprints and updating the mapping, you will see new entities in Port matching your repositories alongside their README.md file contents and pull requests.

## Mapping repositories and monorepos

In the following example you will ingest your Bitbucket repositories and their folders to Port. By following this example you can map your different repositories, packages and libraries from your monorepo into separate entities in Port:

<MicroserviceBlueprint/>

<PortMonoRepoAppConfig/>

:::tip
- Click [Here](https://developer.atlassian.com/cloud/bitbucket/rest/api-group-repositories/#api-repositories-workspace-repo-slug-get) for the Bitbucket repository object structure.
- Click [Here](https://developer.atlassian.com/cloud/bitbucket/rest/api-group-source/#api-repositories-workspace-repo-slug-src-commit-path-get) for the Bitbucket folder object structure.

:::

## Mapping files

In the following example you will ingest files from a specific repository. You will be able to map files and and file contents from specific repositories as entities in Port:

<FileBlueprint/>

<FileAppConfig/>

:::tip
- Refer to the [GitOps](gitops/gitops.md) guide to learn more about using your repository as a source of truth for your software catalog;
- Click [Here](https://developer.atlassian.com/cloud/bitbucket/rest/api-group-source/#api-repositories-workspace-repo-slug-src-commit-path-get) for the Bitbucket file object structure.
:::

### Capabilities and Limitations

The following capabilities and limitations apply to the file mapping feature in the Bitbucket integration:

- **Explicit Paths**: The integration supports explicit file paths relative to the repository root. Glob patterns (e.g., `*.yaml` or `**/*.json`) are not yet supported but the use of wildcard (`*`) in the path is supported. The wildcard character (`*`) will match any character sequence in the directory and subdirectories recursively.
- **File Types**: Any plain-text or structured file (e.g., `.yaml`, `.json`, `.md`, `.py`) can be ingested.
- **Filenames Structure**: Only the filename is required to be provided in the `filenames` array. The path to the file should be provided in the `path` field as described below. No wildcards or glob patterns are supported in the `filenames` array. The api strips all special characters from the filename.
- **File Size**: Only files less than or equal to 320kb are indexed and can be ingested through the file kind feature.
- **Path Structure**: Only relative paths from the repository root are currently supported. For example:
  - ✅ Correct paths:
    - `README.md`
    - `integrations/*`
    - `docs/getting-started.md`
    - `src/config/default.json`
    - `deployment/k8s/production.yaml`
  - ❌ Incorrect paths:
    - `/README.md` (leading slash)
    - `C:/repo/config.json` (absolute path)
    - `../other-repo/file.txt` (parent directory reference)
    - `**/*.yaml` (glob pattern)
- **Performance and Scope**: For optimal performance, we recommend limiting the number of tracked files per repository and the scope of the files to be ingested. We highly recommend using the `repo` selector to limit the scope of the files to be ingested. When `repo` list is not provided, the integration will attempt to ingest matching files throughout the workspace.
- **File Tracking**: Each file specified in the configuration will be tracked as a separate entity in Port
- **Change Detection**: Changes to tracked files will be reflected in Port during the next sync. We plan add support for live file changes in the future.


## Mapping supported resources

The above examples show specific use cases, but Port's Bitbucket integration supports other use cases as well. To adapt the examples shown above, use the Bitbucket API reference to learn about the available fields for the different supported objects:

<BitbucketResources/>

When adding the ingestion of other resources, remember to add a entry to the `resources` array and change the value provided to the `kind` key accordingly.
