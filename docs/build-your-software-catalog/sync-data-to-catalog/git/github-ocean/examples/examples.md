---
sidebar_position: 2
---

import RepositoryBlueprint from './\_github_exporter_example_repository_blueprint.mdx'
import PRBlueprint from './\_github_exporter_example_pull_request_blueprint.mdx'
import PortAppConfig from './\_github_exporter_example_port_app_config.mdx'
import GitHubResources from '../\_github_exporter_supported_resources.mdx'

import RepoEnvironmentBlueprint from './example-deployments-environments/\_github_exporter_example_environment_blueprint.mdx'
import DeploymentBlueprint from './example-deployments-environments/\_github_exporter_example_deployment_blueprint.mdx'
import PortRepoDeploymentAndEnvironmentAppConfig from './example-deployments-environments/\_github_exporter_example_deployments_and_environments_port_app_config.mdx'

import TagBlueprint from './example-repository-release-tag/\_github_exporter_example_tag_blueprint.mdx'
import ReleaseBlueprint from './example-repository-release-tag/\_github_exporter_example_release_blueprint.mdx'
import RepositoryTagReleaseAppConfig from './example-repository-release-tag/\_github_exporter_example_release_tag_port_app_config.mdx'

import PackageBlueprint from './example-file-kind/\_example_package_blueprint.mdx'
import PackageAppConfig from './example-file-kind/\_package_json_app_config.mdx'
import FileBlueprint from './example-file-kind/\_example_file_blueprint.mdx'
import RepoFileAppConfig from './example-file-kind/\_file_repo_app_config.mdx'


# Resource mapping examples


## Map repositories and pull requests

The following example demonstrates how to ingest your GitHub repositories, their README.md file contents and open pull requests to Port.  
You can use the following Port blueprint definitions and `port-app-config.yml`:

<RepositoryBlueprint/>

<PRBlueprint/>


<PortAppConfig/>

:::tip learn more

- Port leverages the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to map and transform GitHub objects to Port Entities.
- Click [Here](https://docs.github.com/en/rest/repos/repos#get-a-repository) for the GitHub repository object structure.
- Click [Here](https://docs.github.com/en/rest/pulls/pulls#get-a-pull-request) for the GitHub pull request object structure.

:::

After creating the blueprints and committing the `port-app-config.yml` file to your `.github-private` repository (for global configuration), or to any specific repositories (for per-repo configuration), you will see new entities in Port matching your repositories alongside their README.md file contents and pull requests. (Remember that the `port-app-config.yml` file has to be in the **default branch** of the repository to take effect).

## Map files and file contents

The following example demonstrates ingestion of dependencies from a `package.json` file in your repository into Port: 

<PackageBlueprint />
<PackageAppConfig />

The example will parse the `package.json` file in your repository and extract the dependencies into Port entities.  
For more information about ingesting files and file contents, click [here](/build-your-software-catalog/sync-data-to-catalog/git/github-ocean/#ingest-files-from-your-repositories).


## Map Files and Repositories

The following example demonstrates mapping files to repository.

<RepositoryBlueprint />
<FileBlueprint />
<RepoFileAppConfig />


## Map repositories, deployments and environments

The following example demonstrates how to ingest your GitHub repositories, their deployments and environments to Port, you may use the following Port blueprint definitions and `port-app-config.yml`:

<RepositoryBlueprint/>

<RepoEnvironmentBlueprint/>

<DeploymentBlueprint/>

<PortRepoDeploymentAndEnvironmentAppConfig/>

## Map repositories, repository releases and tags

The following example demonstrates how to ingest your GitHub repositories, their releases and tags to Port, you may use the following Port blueprint definitions and `port-app-config.yml`:

<RepositoryBlueprint/>

<TagBlueprint/>

<ReleaseBlueprint/>

<RepositoryTagReleaseAppConfig/>

## Map supported resources

The examples above show specific use cases, but Port's GitHub integration supports the ingestion of many other GitHub objects.
To adapt the examples above, use the GitHub API reference to learn about the available fields for the different supported objects:

<GitHubResources/>

When adding the ingestion of other resources, remember to add an entry to the `resources` array and change the value provided to the `kind` key accordingly.
