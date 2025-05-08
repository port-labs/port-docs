---
sidebar_position: 2
---

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

In the following example you will ingest your Azure Devops teams and their members to Port, you may use the following Port blueprint definitions and integration configuration:

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

### Capabilities and Limitations

Before implementing file mapping, please note the following:

- **Explicit Paths Only**: The integration supports explicit file paths relative to the repository root. Wildcard/glob patterns (e.g., `*.yaml` or `**/*.json`) are not yet supported.
- **File Types**: Any plain-text or structured file (e.g., `.yaml`, `.json`, `.md`, `.py`) can be ingested.
- **Path Structure**: Only relative paths from the repository root are currently supported. For example:
  - ✅ Correct paths:
    - `README.md`
    - `docs/getting-started.md`
    - `src/config/default.json`
    - `deployment/k8s/production.yaml`
  - ❌ Incorrect paths:
    - `/README.md` (leading slash)
    - `C:/repo/config.json` (absolute path)
    - `../other-repo/file.txt` (parent directory reference)
    - `*.yaml` (glob pattern)
- **Performance**: For optimal performance, we recommend limiting the number of tracked files per repository.
- **File Tracking**: Each file specified in the configuration will be tracked as a separate entity in Port
- **Change Detection**: Changes to tracked files will be reflected in Port during the next sync
- **File Content**: The `.file.content` field in the response body is an object containing two keys: `raw` and `parsed`. The `raw` key returns a string representation of the actual file whereas the `parsed` key returns a JSON object.


### Configuration

You can use the following Port blueprint definitions and integration configuration:

<FileBlueprint/>

<PortFileAppConfig/>

### Example Use Cases

Common scenarios for file mapping include:
- Tracking configuration files (e.g., `deployment.yaml`, `config.json`)
- Monitoring documentation files (e.g., `README.md`, `CONTRIBUTING.md`)
- Tracking infrastructure definitions (e.g., `terraform.tf`, `docker-compose.yml`)

:::tip Learn more
Click [here](https://learn.microsoft.com/en-us/rest/api/azure/devops/git/items/get?view=azure-devops-rest-7.1&tabs=HTTP#download) for the Azure DevOps file object structure.
:::

After creating the blueprints and saving the integration configuration, you will see new entities in Port matching your specified files.

## Mapping supported resources

The above examples shows a specific use cases, but Port's Azure Devops integration supports the ingestion of many other Azure Devops objects, to adapt the examples above, use the Azure Devops API reference to learn about the available fields for the different supported objects:

<AzureDevopsResources/>

When adding the ingestion of other resources, remember to add an entry to the `resources` array and change the value provided to the `kind` key accordingly.
