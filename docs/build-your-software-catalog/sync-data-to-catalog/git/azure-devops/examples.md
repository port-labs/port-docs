---
sidebar_position: 2
---
import PortMonoRepoAppConfig from './\_azuredevops_exporter_example_monorepo_port_app_config.mdx'
import RepositoryBlueprint from './\_azuredevops_exporter_example_repository_blueprint.mdx'
import PRBlueprint from './\_azuredevops_exporter_example_pull_request_blueprint.mdx'
import PortAppConfig from './\_azuredevops_exporter_example_port_app_config.mdx'
import AzureDevopsResources from './\_azuredevops_exporter_supported_resources.mdx'

import PipelineBlueprint from './example-pipeline/\_azuredevops_exporter_example_pipeline_blueprint.mdx'
import PortPipelineAppConfig from './example-pipeline/\_azuredevops_exporter_example_pipeline_port_app_config.mdx'

import TeamsBlueprintDeprecated from './example-teams/\_azuredevops_exporter_example_team_blueprint.mdx'
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

import FileBlueprint from './example-file/\_azuredevops_exporter_example_file_blueprint.mdx'
import PortFileAppConfig from './example-file/\_azuredevops_exporter_example_file_port_app_config.mdx'

import ColumnBlueprint from './example-columns/\_azuredevops_exporter_example_column_blueprint.mdx'
import PortColumnAppConfig from './example-columns/\_azuredevops_exporter_example_column_port_app_config.mdx'

import PortUsersAndTeamsAppConfig from './example-users-and-teams/\_azuredevops_exporter_example_teams_port_app_config.mdx'
import UsersBlueprint from './example-users-and-teams/\_azuredevops_exporter_example_user_blueprint.mdx'
import TeamsBlueprint from './example-users-and-teams/\_azuredevops_exporter_example_team_blueprint.mdx'

import BuildBlueprint from './example-build/\_azuredevops_exporter_example_build_blueprint.mdx'
import PortBuildAppConfig from './example-build/\_azuredevops_exporter_example_build_port_app_config.mdx'

import PipelineStageBlueprint from './example-pipeline-stage/\_azuredevops_exporter_example_pipeline_stage_blueprint.mdx'
import PortPipelineStageAppConfig from './example-pipeline-stage/\_azuredevops_exporter_example_pipeline_stage_port_app_config.mdx'

import PipelineRunBlueprint from './example-pipeline-run/\_azuredevops_exporter_example_pipeline_run_blueprint.mdx'
import PortPipelineRunAppConfig from './example-pipeline-run/\_azuredevops_exporter_example_pipeline_run_port_app_config.mdx'

import IterationBlueprint from './example-iteration/\_azuredevops_exporter_example_iteration_blueprint.mdx'
import PortIterationAppConfig from './example-iteration/\_azuredevops_exporter_example_iteration_port_app_config.mdx'



# Examples

## Mapping projects

The following example demonstrates how to ingest your Azure Devops projects and their default team (Optional) to Port.  
You can use the following Port blueprint definitions and integration configuration:

<ProjectBlueprint/>

<PortProjectAppConfig/>

:::tip To Learn more

- Click [Here](https://learn.microsoft.com/en-us/rest/api/azure/devops/core/projects/list?view=azure-devops-rest-7.2&tabs=HTTP#teamprojectreference) for the Azure Devops project object structure.
- Click [Here](https://learn.microsoft.com/en-us/rest/api/azure/devops/core/projects/get?view=azure-devops-rest-7.2#teamproject) for the Azure Devops project object structure when `defaultTeam` is set to true.

:::

## Mapping repositories, repository policies and pull requests

The following example demonstrates how to ingest your Azure Devops repositories, their README.md file contents and pull requests to Port.  
You can use the following Port blueprint definitions and integration configuration:

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

The following example demonstrates how to ingest your Azure Devops pipelines to Port.  
You can use the following Port blueprint definitions and integration configuration:

<ProjectBlueprint/>

<PipelineBlueprint/>

<PortPipelineAppConfig/>

:::tip To Learn more

- Refer to the [setup](azure-devops.md#setup) section to learn more about the integration configuration setup process.
- We leverage [JQ JSON processor](https://stedolan.github.io/jq/manual/) to map and transform Azure Devops objects to Port entities.
- Click [Here](https://learn.microsoft.com/en-us/rest/api/azure/devops/pipelines/pipelines/list?view=azure-devops-rest-7.2#pipeline) for the Azure Devops pipeline object structure.

:::

After creating the blueprints and saving the integration configuration, you will see new entities in Port.

## Mapping builds

The following example demonstrates how to ingest your Azure DevOps builds to Port.  
You can use the following Port blueprint definitions and integration configuration:

<ProjectBlueprint/>

<BuildBlueprint/>

<PortBuildAppConfig/>

:::tip To Learn more

- Refer to the [setup](azure-devops.md#setup) section to learn more about the integration configuration setup process.
- We leverage [JQ JSON processor](https://stedolan.github.io/jq/manual/) to map and transform Azure DevOps objects to Port entities.
- Click [Here](https://learn.microsoft.com/en-us/rest/api/azure/devops/build/builds/list?view=azure-devops-rest-7.1&tabs=HTTP#build) for the Azure DevOps build object structure.

:::

After creating the blueprints and saving the integration configuration, you will see new entities in Port matching your builds.

## Mapping pipeline stages

The following example demonstrates how to ingest your Azure DevOps pipeline stages to Port.  
You can use the following Port blueprint definitions and integration configuration:

<ProjectBlueprint/>

<BuildBlueprint/>

<PipelineStageBlueprint/>

<PortPipelineStageAppConfig/>

:::tip To Learn more

- Refer to the [setup](azure-devops.md#setup) section to learn more about the integration configuration setup process.
- We leverage [JQ JSON processor](https://stedolan.github.io/jq/manual/) to map and transform Azure DevOps objects to Port entities.
- Click [Here](https://learn.microsoft.com/en-us/rest/api/azure/devops/pipelines/runs/list-stages?view=azure-devops-rest-7.1&tabs=HTTP#stage) for the Azure DevOps pipeline-stage object structure.

:::

After creating the blueprints and saving the integration configuration, you will see new entities in Port matching your pipeline stages.

## Mapping pipeline runs

The following example demonstrates how to ingest your Azure DevOps pipeline runs to Port.  
You can use the following Port blueprint definitions and integration configuration:

<ProjectBlueprint/>

<PipelineRunBlueprint/>

<PortPipelineRunAppConfig/>

:::tip To Learn more

- Refer to the [setup](azure-devops.md#setup) section to learn more about the integration configuration setup process.
- We leverage [JQ JSON processor](https://stedolan.github.io/jq/manual/) to map and transform Azure DevOps objects to Port entities.
- Click [Here](https://learn.microsoft.com/en-us/rest/api/azure/devops/pipelines/runs/list?view=azure-devops-rest-7.1&tabs=HTTP#run) for the Azure DevOps pipeline-run object structure.

:::

After creating the blueprints and saving the integration configuration, you will see new entities in Port matching your pipeline runs.

## Mapping iterations

The following example demonstrates how to ingest your Azure DevOps iterations (sprints, releases, milestones) to Port.  
You can use the following Port blueprint definitions and integration configuration:

<ProjectBlueprint/>

<IterationBlueprint/>

<PortIterationAppConfig/>

:::tip To Learn more

- Refer to the [setup](azure-devops.md#setup) section to learn more about the integration configuration setup process.
- We leverage [JQ JSON processor](https://stedolan.github.io/jq/manual/) to map and transform Azure DevOps objects to Port entities.
- Click [Here](https://learn.microsoft.com/en-us/rest/api/azure/devops/work/iterations/list?view=azure-devops-rest-7.1&tabs=HTTP#teamsettingsiteration) for the Azure DevOps iteration object structure.

:::

After creating the blueprints and saving the integration configuration, you will see new entities in Port matching your iterations.

## Mapping users and teams

:::caution Azure DevOps Server limitation
The `user` kind is only available for Azure DevOps Services. This integration relies on the User Entitlements API, which is not available in Azure DevOps Server.
:::

The following example blueprints and integration configurations demonstrate how to ingest Azure Devops users and teams into Port:

<ProjectBlueprint/>

<UsersBlueprint/>

<TeamsBlueprint/>

<PortUsersAndTeamsAppConfig/>

:::tip Learn more
- Refer to the [setup](azure-devops.md#setup) section to learn more about the integration configuration setup process.
- Port leverages the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to map and transform Azure Devops objects to Port entities.
- Click [Here](https://learn.microsoft.com/en-us/rest/api/azure/devops/core/teams/get%20all%20teams?view=azure-devops-rest-7.1#team) for the Azure Devops team object structure.
- Click [Here](https://learn.microsoft.com/en-us/rest/api/azure/devops/memberentitlementmanagement/user-entitlements/list?view=azure-devops-rest-4.1&tabs=HTTP) for the Azure Devops User object structure.

:::

After creating the blueprints and saving the integration configuration, you will see new entities in Port matching your teams alongside their members.

## Mapping teams and members (Deprecated)

:::caution Deprecation notice
This section is deprecated and will be removed in a future version. Please refer to the [Mapping users and teams](#mapping-users-and-teams) section for the current implementation.
:::

The following example demonstrates how to ingest your Azure Devops teams and their members to Port.  
You can use the following Port blueprint definitions and integration configuration:

<ProjectBlueprint/>

<RepositoryBlueprint/>

<MembersBlueprint/>

<TeamsBlueprintDeprecated/>

<PortTeamsAppConfig/>

:::tip To Learn more
- Refer to the [setup](azure-devops.md#setup) section to learn more about the integration configuration setup process.
- We leverage [JQ JSON processor](https://stedolan.github.io/jq/manual/) to map and transform Azure Devops objects to Port entities.
- Click [Here](https://learn.microsoft.com/en-us/rest/api/azure/devops/core/teams/get%20all%20teams?view=azure-devops-rest-7.1#team) for the Azure Devops team object structure.
- Click [Here](https://learn.microsoft.com/en-us/rest/api/azure/devops/core/teams/get-team-members-with-extended-properties?view=azure-devops-rest-7.1&tabs=HTTP#teammember) for the Azure Devops team member object structure.

:::

After creating the blueprints and saving the integration configuration, you will see new entities in Port matching your teams alongside their members.

## Mapping Work Items

The following example demonstrates how to ingest your Azure Devops work items to Port.  
You can use the following Port blueprint definitions and integration configuration:

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


## Mapping columns

The example below shows how to ingest Azure DevOps Columns into Port.  
You can use the following Port blueprint definitions and integration configuration: 


<ColumnBlueprint/>

<PortColumnAppConfig/>


:::tip Learn More
Click [here](https://learn.microsoft.com/en-us/rest/api/azure/devops/work/columns/list?view=azure-devops-rest-7.1) to learn about the Azure DevOps column object structure.
:::

After creating the blueprints and saving the integration configuration, you will see new entities in Port matching your Azure DevOps columns.


## Mapping releases

The example below shows how to ingest Azure DevOps Releases into Port.  
You can use the following Port blueprint definitions and integration configuration:


<ReleaseBlueprint/>

<PortReleaseAppConfig/>

:::tip Learn more
Click [here](https://learn.microsoft.com/en-us/rest/api/azure/devops/release/releases/list?view=azure-devops-rest-7.1&tabs=HTTP) for the Azure DevOps release object structure.
:::

## Mapping files

The example below shows how to ingest specific files from your Azure DevOps repositories into Port. This integration allows you to track and monitor individual files across your repositories.

### Configuration

You can use the following Port blueprint definitions and integration configuration:

<FileBlueprint/>

<PortFileAppConfig/>

:::tip Learn more
Click [here](https://learn.microsoft.com/en-us/rest/api/azure/devops/git/items/get?view=azure-devops-rest-7.1&tabs=HTTP#download) for the Azure DevOps file object structure.
:::

After creating the blueprints and saving the integration configuration, you will see new entities in Port matching your specified files.

## Mapping repositories and monorepos

The following example shows how to ingest your Azure Devops repositories and their folders into Port. By following this example you can map your different repositories, packages and libraries from your monorepo into separate entities in Port.

**Note** that mapping is configured per project, so you need to create a separate mapping block for each project you want to ingest.

<RepositoryBlueprint/>

<PortMonoRepoAppConfig/>

## Mapping supported resources

The above examples shows a specific use cases, but Port's Azure Devops integration supports the ingestion of many other Azure Devops objects, to adapt the examples above, use the Azure Devops API reference to learn about the available fields for the different supported objects:

<AzureDevopsResources/>

When adding the ingestion of other resources, remember to add an entry to the `resources` array and change the value provided to the `kind` key accordingly.


