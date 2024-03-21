---
sidebar_position: 1
---

import RepositoryBlueprint from './\_github_exporter_example_repository_blueprint.mdx'
import PRBlueprint from './\_github_exporter_example_pull_request_blueprint.mdx'
import PortAppConfig from './\_github_exporter_example_port_app_config.mdx'
import GitHubResources from '../\_github_exporter_supported_resources.mdx'

import WorkflowBlueprint from './example-workflow-workflowrun/\_git_exporter_example_workflow_blueprint.mdx'
import WorkflowRunBlueprint from './example-workflow-workflowrun/\_git_exporter_example_workflow_run_blueprint.mdx'
import PortWfWfrAppConfig from './example-workflow-workflowrun/\_github_exporter_example_wf_wfr_port_app_config.mdx'

import BranchBlueprint from './example-branch-protection/\_git_exporter_example_branch_blueprint.mdx'
import PortBrAppConfig from './example-branch-protection/\_github_exporter_example_branch_port_app_config.mdx'


import PortMonoRepoAppConfig from './example-monorepo/\_github_exporter_example_monorepo_port_app_config.mdx'

import IssueBlueprint from './example-issue/\_git_exporter_example_issue_blueprint.mdx'
import PortIssueAppConfig from './example-issue/\_github_exporter_example_issue_port_app_config.mdx'

import PRFolderBlueprint from './example-repository-folders/\_github_exporter_example_pull_request_blueprint.mdx'
import FolderBlueprint from './example-repository-folders/\_github_exporter_example_folder_blueprint.mdx'
import PortFolderMappingAppConfig from './example-repository-folders/\_github_exporter_example_repo_folders_port_app_config.mdx'

import TeamBlueprint from './example-repository-teams/\_github_export_example_team_blueprint.mdx'
import RepositoryTeamBlueprint from './example-repository-teams/\_github_export_example_repository_with_teams_relation_blueprint.mdx'
import PortRepositoryTeamMappingAppConfig from './example-repository-teams/\_github_exporter_example_repository_with_teams_port_app_config.mdx'

import DependabotAlertBlueprint from './example-repository-alerts/\_github_exporter_example_dependabot_alert_blueprint.mdx'
import CodeScanAlertBlueprint from './example-repository-alerts/\_github_exporter_example_codeScan_alert_blueprint.mdx'

import PortRepositoryDependabotAlertMappingAppConfig from './example-repository-alerts/\_github_exporter_example_repo_dependabot_port_app_config.mdx'

import RepoEnvironmentBlueprint from './example-deployments-environments/\_github_exporter_example_environment_blueprint.mdx'
import DeploymentBlueprint from './example-deployments-environments/\_github_exporter_example_deployment_blueprint.mdx'
import PortRepoDeploymentAndEnvironmentAppConfig from './example-deployments-environments/\_github_exporter_example_deployments_and_environments_port_app_config.mdx'

import UsersBlueprint from './example-repository-admins/\_github_exporter_example_users_blueprint.mdx'
import GithubUsersBlueprint from './example-repository-admins/\_github_exporter_example_github_users_blueprint.mdx'
import RepositoryAdminBlueprint from './example-repository-admins/\_github_export_example_repository_with_admins_relation_blueprint.mdx'
import RepositoryAdminAppConfig from './example-repository-admins/\_github_exporter_example_admins_users_port_app_config.mdx'



# Resource mapping examples

## Mapping repositories, file contents and pull requests

In the following example you will ingest your GitHub repositories, their README.md file contents and pull requests to Port, you may use the following Port blueprint definitions and `port-app-config.yml`:

<RepositoryBlueprint/>

<PRBlueprint/>

<PortAppConfig/>

:::tip

- Refer to the [setup](/build-your-software-catalog/sync-data-to-catalog/git/github/github.md#setup) section to learn more about the `port-app-config.yml` setup process;
- We leverage [JQ JSON processor](https://stedolan.github.io/jq/manual/) to map and transform GitHub objects to Port Entities;
- Click [Here](https://docs.github.com/en/rest/repos/repos#get-a-repository) for the GitHub repository object structure.
- Click [Here](https://docs.github.com/en/rest/pulls/pulls#get-a-pull-request) for the GitHub pull request object structure.

:::

After creating the blueprints and committing the `port-app-config.yml` file to your `.github-private` repository (for global configuration), or to any specific repositories (for per-repo configuration), you will see new entities in Port matching your repositories alongside their README.md file contents and pull requests. (Remember that the `port-app-config.yml` file has to be in the **default branch** of the repository to take effect).

## Mapping repositories, workflows and workflow runs

In the following example you will ingest your GitHub repositories, their workflows and workflow runs to Port, you may use the following Port blueprint definitions and `port-app-config.yml`:

<RepositoryBlueprint/>

<WorkflowBlueprint/>

<WorkflowRunBlueprint/>

<PortWfWfrAppConfig/>

:::tip

- Refer to the [setup](/build-your-software-catalog/sync-data-to-catalog/git/github/github.md#setup) section to learn more about the `port-app-config.yml` setup process;
- We leverage [JQ JSON processor](https://stedolan.github.io/jq/manual/) to map and transform GitHub objects to Port Entities;
- Click [Here](https://docs.github.com/en/rest/repos/repos#get-a-repository) for the GitHub repository object structure.
- Click [Here](https://docs.github.com/en/rest/actions/workflows#get-a-workflow) for the GitHub workflow object structure.
- Click [Here](https://docs.github.com/en/rest/actions/workflow-runs#get-a-workflow-run) for the GitHub workflow run object structure.

:::

After creating the blueprints and committing the `port-app-config.yml` file to your `.github-private` repository (for global configuration), or to any specific repositories (for per-repo configuration), you will see new entities in Port matching your repositories alongside their workflows and workflow runs. (Remember that the `port-app-config.yml` file has to be in the **default branch** of the repository to take effect).

## Mapping repositories and issues

In the following example you will ingest your GitHub repositories and their issues to Port, you may use the following Port blueprint definitions and `port-app-config.yml`:

<RepositoryBlueprint/>

<IssueBlueprint/>

<PortIssueAppConfig/>

:::tip

- Refer to the [setup](/build-your-software-catalog/sync-data-to-catalog/git/github/github.md#setup) section to learn more about the `port-app-config.yml` setup process;
- We leverage [JQ JSON processor](https://stedolan.github.io/jq/manual/) to map and transform GitHub objects to Port Entities;
- Click [Here](https://docs.github.com/en/rest/repos/repos#get-a-repository) for the GitHub repository object structure.
- Click [Here](https://docs.github.com/en/rest/issues/issues#get-an-issue) for the GitHub issue object structure.

:::

After creating the blueprints and committing the `port-app-config.yml` file to your `.github-private` repository (for global configuration), or to any specific repositories (for per-repo configuration), you will see new entities in Port matching your repositories alongside their issues. (Remember that the `port-app-config.yml` file has to be in the **default branch** of the repository to take effect).

## Mapping repositories and monorepos

In the following example you will ingest your GitHub repositories and their folders to Port. By following this example you can map your different services, packages and libraries from your monorepo into separate entities in Port. you may use the following Port blueprint definitions and `port-app-config.yml`:

<RepositoryBlueprint/>

<PortMonoRepoAppConfig/>

:::tip
To retrieve the root folders of your monorepo, you can use this following syntax in your `port-app-config.yml`:

```yaml
- kind: folder
    selector:
      query: "true" # JQ boolean query. If evaluated to false - skip syncing the object.
      folders: # Specify the repositories and folders to include under this relative path.
        - path: "*" # Relative path to the folders within the repositories.
          repos: # List of repositories to include folders from.
            - backend-service
            - frontend-service
```

:::
:::tip

- Refer to the [setup](/build-your-software-catalog/sync-data-to-catalog/git/github/github.md#setup) section to learn more about the `port-app-config.yml` setup process;
- We leverage [JQ JSON processor](https://stedolan.github.io/jq/manual/) to map and transform GitHub objects to Port Entities;
- Click [Here](https://docs.github.com/en/rest/repos/repos#get-a-repository) for the GitHub repository object structure.
- Click [Here](https://docs.github.com/en/rest/git/trees#get-a-tree) for the GitHub folder object structure.

:::

## Mapping repositories, repository folders and pull requests

In the following example you will ingest your GitHub repositories, the repository's root folders and the repository pull requests to Port, you may use the following Port blueprint definitions and `port-app-config.yml`:

<RepositoryBlueprint/>

<PRFolderBlueprint/>

<FolderBlueprint/>

<PortFolderMappingAppConfig/>

## Mapping repositories and teams

In the following example you will ingest your GitHub repositories and their teams to Port, you may use the following Port blueprint definitions and `port-app-config.yml`:

:::note
Teams are GitHub organization level resources, therefore you will need to specify the mapping of the teams in a [global integration configuration](/build-your-software-catalog/sync-data-to-catalog/git/github/github.md#setup) (Through Port's UI or through the `port-app-config.yml` file in the `.github-private` repository).
:::

<TeamBlueprint/>

<RepositoryTeamBlueprint/>

<PortRepositoryTeamMappingAppConfig/>

:::tip
To retrieve the teams of your repositories, you will need to add the `teams` property to the `selector` in the repository resource kind in your `port-app-config.yml`:

```yaml
- kind: repository
	selector:
		query: 'true'  # JQ boolean query. If evaluated to false - skip syncing the object.
	  // highlight-next-line
		teams: true  # Boolean flag to indicate whether to include the repository teams.
```

:::

## Mapping repositories, deployments and environments

In the following example you will ingest your GitHub repositories, their deployments and environments to Port, you may use the following Port blueprint definitions and `port-app-config.yml`:

<RepositoryBlueprint/>

<RepoEnvironmentBlueprint/>

<DeploymentBlueprint/>

<PortRepoDeploymentAndEnvironmentAppConfig/>

## Mapping repositories, Dependabot Alerts and Code scan alerts

In the following example you will ingest your GitHub repositories and their alerts (Dependabot and Code scan alerts) to Port, you may use the following Port blueprint definitions and `port-app-config.yml`:

<RepositoryBlueprint/>

<DependabotAlertBlueprint/>

<CodeScanAlertBlueprint/>

<PortRepositoryDependabotAlertMappingAppConfig/>

:::info supported alerts
For Code scan alerts only open alerts on the default branch are supported
:::

## Mapping repositories and branch protection rules

In the following example you will ingest your GitHub repositories and their main branch protection rules to Port, you may use the following Port blueprint definitions and `port-app-config.yml`:

<RepositoryBlueprint/>

<BranchBlueprint/>

<PortBrAppConfig/>

:::info supported branch protection rules
Currently only default branch protection rules are supported
:::

## Mapping repositories, repository admins and users

In the following example you will ingest your GitHub repositories, their admins and related users to Port, you may use the following Port blueprint definitions and `port-app-config.yml`:

<RepositoryAdminBlueprint/>

<GithubUsersBlueprint/>

<UsersBlueprint/>

<RepositoryAdminAppConfig/>

:::info supported GitHub user types
As Github has strict privacy policies, the GitHub API will only return emails in the following cases:
1. The user has a public email address
2. Your organization is working with a GitHub Enterprise Cloud plan, and the user has an SAML SSO identity configured inside the GitHub organization.

In other cases, the GitHub API will return a `null` value for the user's email.
:::


## Mapping supported resources

The above examples shows a specific use cases, but Port's GitHub app supports the ingestion of many other GitHub objects, to adapt the examples above, use the GitHub API reference to learn about the available fields for the different supported objects:

<GitHubResources/>

When adding the ingestion of other resources, remember to add an entry to the `resources` array and change the value provided to the `kind` key accordingly.
