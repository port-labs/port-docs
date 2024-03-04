---
sidebar_position: 2
---

import RepositoryBlueprint from './\_azuredevops_exporter_example_repository_blueprint.mdx'
import PRBlueprint from './\_azuredevops_exporter_example_pull_request_blueprint.mdx'
import PortAppConfig from './\_azuredevops_exporter_example_port_app_config.mdx'
import AzureDevopsResources from './\_azuredevops_exporter_supported_resources.mdx'

import PipelineBlueprint from './example-pipeline/\_azuredevops_exporter_example_pipeline_blueprint.mdx'
import PortPipelineAppConfig from './example-pipeline/\_azuredevops_exporter_example_pipeline_port_app_config.mdx'

import TeamsBlueprint from './example-teams/\_azuredevops_exporter_example_team_blueprint.mdx'
import MembersBlueprint from './example-teams/\_azuredevops_exporter_example_member_blueprint.mdx'
import PortTeamsAppConfig from './example-teams/\_azuredevops_exporter_example_teams_port_app_config.mdx'

# Examples

## Mapping repositories, file contents, repository policies and pull requests

In the following example you will ingest your Azure Devops repositories, their README.md file contents and pull requests to Port, you may use the following Port blueprint definitions and integration configuration:

<RepositoryBlueprint/>

<PRBlueprint/>

<PortAppConfig/>

:::tip To Learn more

- Refer to the [setup](azure-devops.md#setup) section to learn more about the integration configuration setup process.
- We leverage [JQ JSON processor](https://stedolan.github.io/jq/manual/) to map and transform Azure Devops objects to Port entities.
- Click [Here](https://learn.microsoft.com/en-us/rest/api/azure/devops/git/repositories/list?view=azure-devops-rest-7.2&tabs=HTTP#gitrepository) for the Azure Devops repository object structure.
- Click [Here](https://learn.microsoft.com/en-us/rest/api/azure/devops/git/policy-configurations/get?view=azure-devops-rest-7.1#policyconfiguration) for the Azure Devops repository-policy object structure.
- Click [Here](https://learn.microsoft.com/en-us/rest/api/azure/devops/git/pull-requests/get-pull-requests?view=azure-devops-rest-7.1&tabs=HTTP#gitpullrequest) for the Azure Devops pull-request object structure.

:::

After creating the blueprints and saving the integration configuration, you will see new entities in Port matching your repositories alongside their `README.md` file contents and pull requests.

## Mapping pipelines

In the following example you will ingest your Azure Devops pipelines to Port, you may use the following Port blueprint definitions and integration configuration:

<PipelineBlueprint/>

<PortPipelineAppConfig/>

:::tip To Learn more

- Refer to the [setup](azure-devops.md#setup) section to learn more about the integration configuration setup process.
- We leverage [JQ JSON processor](https://stedolan.github.io/jq/manual/) to map and transform Azure Devops objects to Port entities.
- Click [Here](https://learn.microsoft.com/en-us/rest/api/azure/devops/pipelines/pipelines/list?view=azure-devops-rest-7.2#pipeline) for the Azure Devops pipeline object structure.

:::

After creating the blueprints and saving the integration configuration, you will see new entities in Port.


## Mapping teams and members

In the following example you will ingest your Azure Devops teams and their members to Port, you may use the following Port blueprint definitions and integration configuration:

<TeamsBlueprint/>

<MembersBlueprint/>

<PortTeamsAppConfig/>

:::tip To Learn more
- Refer to the [setup](azure-devops.md#setup) section to learn more about the integration configuration setup process.
- We leverage [JQ JSON processor](https://stedolan.github.io/jq/manual/) to map and transform Azure Devops objects to Port entities.
- Click [Here](https://learn.microsoft.com/en-us/rest/api/azure/devops/core/teams/get%20all%20teams?view=azure-devops-rest-7.1#team) for the Azure Devops team object structure.
- Click [Here](https://learn.microsoft.com/en-us/rest/api/azure/devops/core/teams/get-team-members-with-extended-properties?view=azure-devops-rest-7.1&tabs=HTTP#teammember) for the Azure Devops team member object structure.

:::

After creating the blueprints and saving the integration configuration, you will see new entities in Port matching your teams alongside their members.

## Mapping supported resources

The above examples shows a specific use cases, but Port's Azure Devops integration supports the ingestion of many other Azure Devops objects, to adapt the examples above, use the Azure Devops API reference to learn about the available fields for the different supported objects:

<AzureDevopsResources/>

When adding the ingestion of other resources, remember to add an entry to the `resources` array and change the value provided to the `kind` key accordingly.
