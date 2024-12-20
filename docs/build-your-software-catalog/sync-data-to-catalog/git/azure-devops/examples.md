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

import PortProjectAppConfig from './example-project/\_azuredevops_exporter_example_project_port_app_config.mdx'
import ProjectBlueprint from './example-project/\_azuredevops_exporter_example_project_blueprint.mdx'
import WorkItemBlueprint from './example-project/\_azuredevops_exporter_example_work_item_blueprint.mdx'
import PortWorkItemAppConfig from './example-project/\_azuredevops_exporter_example_work_item_port_app_config.mdx'

import BoardBlueprint from './example-board/\_azuredevops_exporter_example_board_blueprint.mdx'
import PortBoardAppConfig from './example-board/\_azuredevops_exporter_example_board_port_app_config.mdx'

import ReleaseBlueprint from './example-release/\_azuredevops_exporter_example_release_blueprint.mdx'
import PortReleaseAppConfig from './example-release/\_azuredevops_exporter_example_release_port_app_config.mdx'


# Examples

## Mapping projects

In the following example you will ingest your Azure Devops projects and their default team (Optional) to Port, you may use the following Port blueprint definitions and integration configuration:

<ProjectBlueprint/>

<PortProjectAppConfig/>

:::tip To Learn more

- Click [Here](https://learn.microsoft.com/en-us/rest/api/azure/devops/core/projects/list?view=azure-devops-rest-7.2&tabs=HTTP#teamprojectreference) for the Azure Devops project object structure.
- Click [Here](https://learn.microsoft.com/en-us/rest/api/azure/devops/core/projects/get?view=azure-devops-rest-7.2#teamproject) for the Azure Devops project object structure when `defaultTeam` is set to true.

:::

## Mapping repositories, file contents, repository policies and pull requests

In the following example you will ingest your Azure Devops repositories, their README.md file contents and pull requests to Port, you may use the following Port blueprint definitions and integration configuration:

<ProjectBlueprint/>

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

<ProjectBlueprint/>

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

<ProjectBlueprint/>

<RepositoryBlueprint/>

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

## Mapping Work Items

In the following example you will ingest your Azure Devops work items to Port, you may use the following Port blueprint definitions and integration configuration:

<WorkItemBlueprint/>

<PortWorkItemAppConfig/>

:::tip To Learn more

- Click [Here](https://learn.microsoft.com/en-us/rest/api/azure/devops/wit/work-items/list?view=azure-devops-rest-7.1&tabs=HTTP#get-list-of-work-items) for the Azure Devops work item object structure.
- Click [Here](https://learn.microsoft.com/en-us/azure/devops/boards/queries/wiql-syntax?view=azure-devops#example-clauses) for WIQL clauses
:::


## Mapping boards

The example below shows how to ingest Azure DevOps Boards into Port.  
You can use the following Port blueprint definitions and integration configuration: 


<BoardBlueprint/>

<PortBoardAppConfig/>


:::tip To Learn More
- Click [here](https://learn.microsoft.com/en-us/rest/api/azure/devops/work/boards/list?view=azure-devops-rest-7.1) for the Azure DevOps board object structure.
:::

After creating the blueprints and saving the integration configuration, you will see new entities in Port matching your Azure DevOps boards.


## Mapping releases

The example below shows how to ingest Azure DevOps Releases into Port.  
You can use the following Port blueprint definitions and integration configuration:


<ReleaseBlueprint/>

<PortReleaseAppConfig/>


:::tip To Learn more
- Click [here](https://learn.microsoft.com/en-us/rest/api/azure/devops/release/releases/list?view=azure-devops-rest-7.1&tabs=HTTP) for the Azure DevOps release object structure.
:::


After creating the blueprints and saving the integration configuration, you will see new entities in Port matching your releases.

## Mapping supported resources

The above examples shows a specific use cases, but Port's Azure Devops integration supports the ingestion of many other Azure Devops objects, to adapt the examples above, use the Azure Devops API reference to learn about the available fields for the different supported objects:

<AzureDevopsResources/>

When adding the ingestion of other resources, remember to add an entry to the `resources` array and change the value provided to the `kind` key accordingly.
