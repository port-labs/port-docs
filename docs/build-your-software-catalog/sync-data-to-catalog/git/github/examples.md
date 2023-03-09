---
sidebar_position: 2
---

import MicroserviceBlueprint from '../\_git_exporter_example_microservice_blueprint.mdx'
import PortAppConfig from '../\github/\_github_exporter_example_port_app_config.mdx'

# Examples

## Mapping repositories and file contents

In the following example you will ingest your GitHub repositories and their README.md files to Port, you may use the following Port blueprint definitions and `port-app-config.yml`:

<MicroserviceBlueprint/>

<PortAppConfig/>

:::tip

- Refer to the [setup](github.md#setup) section to learn more about the `port-app-config.yml` setup process;
- We leverage [JQ JSON processor](https://stedolan.github.io/jq/manual/) to map and transform GitHub objects to Port Entities;
- Click [Here](https://docs.github.com/en/rest/repos/repos#get-a-repository) for the GitHub repository object structure.

:::

After creating the blueprint and committing the `port-app-config.yml` file to your `.github-private` or to a specific repository, you will see new entities in Port matching your repositories alongside their README.md file contents.
