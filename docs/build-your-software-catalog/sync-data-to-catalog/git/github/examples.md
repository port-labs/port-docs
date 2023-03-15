---
sidebar_position: 2
---

import MicroserviceBlueprint from '../\_git_exporter_example_microservice_blueprint.mdx'
import PRBlueprint from '../\_git_exporter_example_pull_request_blueprint.mdx'
import PortAppConfig from './\_github_exporter_example_port_app_config.mdx'
import GitHubResources from './\_github_exporter_supported_resources.mdx'

# Examples

## Mapping repositories, file contents and pull requests

In the following example you will ingest your GitHub repositories, their README.md file contents and pull requests to Port, you may use the following Port blueprint definitions and `port-app-config.yml`:

<MicroserviceBlueprint/>

<PRBlueprint/>

<PortAppConfig/>

:::tip

- Refer to the [setup](github.md#setup) section to learn more about the `port-app-config.yml` setup process;
- We leverage [JQ JSON processor](https://stedolan.github.io/jq/manual/) to map and transform GitHub objects to Port Entities;
- Click [Here](https://docs.github.com/en/rest/repos/repos#get-a-repository) for the GitHub repository object structure.
- Click [Here](https://docs.github.com/en/rest/pulls/pulls#get-a-pull-request) for the GitHub pull request object structure.

:::

After creating the blueprints and committing the `port-app-config.yml` file to your `.github-private` or to a specific repository, you will see new entities in Port matching your repositories alongside their README.md file contents and pull requests. (Remember that the `port-app-config.yml` file has to be in the **default branch** of the repository to take effect).

## Mapping supported resources

The above example shows a specific use case, but Port's GitHub app supports the ingestion of many other GitHub objects, to adapt the example above, use the GitHub API reference to learn about the available fields for the different supported objects:

<GitHubResources/>

When adding the ingestion of other resources, remember to add a entry to the `resources` array and change the value provided to the `kind` key accordingly.
