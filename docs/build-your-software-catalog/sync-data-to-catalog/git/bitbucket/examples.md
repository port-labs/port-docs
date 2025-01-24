---
sidebar_position: 2
---

import MicroserviceBlueprint from './\_bitbucket_exporter_example_repository_blueprint.mdx'
import PRBlueprint from './\_bitbucket_exporter_example_pull_request_blueprint.mdx'
import PortAppConfig from './\_bitbucket_exporter_example_port_app_config.mdx'
import BitbucketResources from './\_bitbucket_exporter_supported_resources.mdx'
import PortMonoRepoAppConfig from './\_bitbucket_exporter_example_monorepo_port_app_config.mdx'

# Examples

## Mapping repositories, file contents and pull requests

In the following example you will ingest your Bitbucket repositories, their README.md file contents and pull requests to Port, you may use the following Port blueprint definitions and `port-app-config.yml`:

<MicroserviceBlueprint/>

<PRBlueprint/>

<PortAppConfig/>

:::tip

- Refer to the [setup](bitbucket.md#setup) section to learn more about the `port-app-config.yml` setup process;
- We leverage [JQ JSON processor](https://stedolan.github.io/jq/manual/) to map and transform Bitbucket objects to Port Entities;
- Click [Here](https://developer.atlassian.com/cloud/bitbucket/rest/api-group-repositories/#api-repositories-workspace-repo-slug-get) for the Bitbucket repository object structure.
- Click [Here](https://developer.atlassian.com/cloud/bitbucket/rest/api-group-pullrequests/#api-repositories-workspace-repo-slug-pullrequests-pull-request-id-get) for the Bitbucket pull request object structure.

:::

After creating the blueprints and committing the `port-app-config.yml` file to your `.bitbucket-private` or to a specific repository, you will see new entities in Port matching your repositories alongside their README.md file contents and pull requests. (Remember that the `port-app-config.yml` file has to be in the **default branch** of the repository to take effect).

## Mapping repositories and monorepos

In the following example you will ingest your Bitbucket repositories and their folders to Port. By following this example you can map your different repositories, packages and libraries from your monorepo into separate entities in Port. you may use the following Port blueprint definitions and `port-app-config.yml`:

<MicroserviceBlueprint/>

<PortMonoRepoAppConfig/>

:::tip

- Refer to the [setup](bitbucket.md#setup) section to learn more about the `port-app-config.yml` setup process;
- We leverage [JQ JSON processor](https://stedolan.github.io/jq/manual/) to map and transform GitHub objects to Port Entities;
- Click [Here](https://developer.atlassian.com/cloud/bitbucket/rest/api-group-repositories/#api-repositories-workspace-repo-slug-get) for the Bitbucket repository object structure.
- Click [Here](https://developer.atlassian.com/cloud/bitbucket/rest/api-group-source/#api-repositories-workspace-repo-slug-src-commit-path-get) for the Bitbucket folder object structure.

:::

## Mapping supported resources

The above example shows a specific use case, but Port's Bitbucket app supports the ingestion of many other Bitbucket objects, to adapt the example above, use the Bitbucket API reference to learn about the available fields for the different supported objects:

<BitbucketResources/>

When adding the ingestion of other resources, remember to add a entry to the `resources` array and change the value provided to the `kind` key accordingly.
