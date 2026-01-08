---
sidebar_position: 4
---

import RepositoryBlueprint from './examples/\_github_exporter_example_repository_blueprint.mdx'
import PRBlueprint from './examples/\_github_exporter_example_pull_request_blueprint.mdx'
import PortAppConfig from './examples/\_github_exporter_example_pull_request_port_app_config.mdx'
import GitHubResources from './\_github_exporter_supported_resources.mdx'

import UsersBlueprint from './examples/example-repository-admins/\_github_exporter_example_users_blueprint.mdx'
import GithubUsersBlueprint from './examples/example-repository-admins/\_github_exporter_example_github_users_blueprint.mdx'
import RepositoryAdminBlueprint from './examples/example-repository-admins/\_github_export_example_repository_with_admins_relation_blueprint.mdx'
import RepositoryAdminAppConfig from './examples/example-repository-admins/\_github_exporter_example_admins_users_port_app_config.mdx'

import IssueBlueprint from './examples/example-issue/\_git_exporter_example_issue_blueprint.mdx'
import PortIssueAppConfig from './examples/example-issue/\_github_exporter_example_issue_port_app_config.mdx'
import RepoEnvironmentBlueprint from './examples/example-deployments-environments/\_github_exporter_example_environment_blueprint.mdx'
import DeploymentBlueprint from './examples/example-deployments-environments/\_github_exporter_example_deployment_blueprint.mdx'
import PortRepoDeploymentAndEnvironmentAppConfig from './examples/example-deployments-environments/\_github_exporter_example_deployments_and_environments_port_app_config.mdx'

import TagBlueprint from './examples/example-repository-release-tag/\_github_exporter_example_tag_blueprint.mdx'
import ReleaseBlueprint from './examples/example-repository-release-tag/\_github_exporter_example_release_blueprint.mdx'
import RepositoryTagReleaseAppConfig from './examples/example-repository-release-tag/\_github_exporter_example_release_tag_port_app_config.mdx'

import PackageBlueprint from './examples/example-file-kind/\_example_package_blueprint.mdx'
import PackageAppConfig from './examples/example-file-kind/\_package_json_app_config.mdx'
import FileBlueprint from './examples/example-file-kind/\_example_file_blueprint.mdx'
import RepoFileAppConfig from './examples/example-file-kind/\_file_repo_app_config.mdx'

import TeamWithMembersBlueprint from './examples/example-team-members/\_github_exporter_team_blueprint.mdx'
import TeamMemberBlueprint from './examples/example-team-members/\_github_exporter_team_member_blueprint.mdx'
import TeamMemberConfig from './examples/example-team-members/\_github_team_member_port_app_config.mdx'

import TeamBlueprint from './examples/example-repository-teams/\_github_export_example_team_blueprint.mdx'
import RepositoryTeamBlueprint from './examples/example-repository-teams/\_github_export_example_repository_with_teams_relation_blueprint.mdx'
import PortRepositoryTeamMappingAppConfig from './examples/example-repository-teams/\_github_exporter_example_repository_with_teams_port_app_config.mdx'

import CollaboratorBlueprint from './examples/example-repository-collaborators/\_github_exporter_example_collaborator_blueprint.mdx'
import PortRepositoryCollaboratorAppConfig from './examples/example-repository-collaborators/\_github_exporter_example_repository_collaborator_port_app_config.mdx'

import PortMonoRepoAppConfig from './examples/example-monorepo/\_github_exporter_example_monorepo_port_app_config.mdx'
import WorkflowBlueprint from './examples/example-workflow-workflowrun/\_git_exporter_example_workflow_blueprint.mdx'
import WorkflowRunBlueprint from './examples/example-workflow-workflowrun/\_git_exporter_example_workflow_run_blueprint.mdx'
import PortWfWfrAppConfig from './examples/example-workflow-workflowrun/\_github_exporter_example_wf_wfr_port_app_config.mdx'

import BranchBlueprint from './examples/example-branch/\_git_exporter_example_branch_blueprint.mdx'
import PortBrAppConfig from './examples/example-branch/\_github_exporter_example_branch_port_app_config.mdx'

import DependabotAlertBlueprint from './examples/example-repository-alerts/\_github_exporter_example_dependabot_alert_blueprint.mdx'
import CodeScanAlertBlueprint from './examples/example-repository-alerts/\_github_exporter_example_codeScan_alert_blueprint.mdx'
import SecretScanAlertBlueprint from './examples/example-repository-alerts/\_github_exporter_example_secret_scan_alert_blueprint.mdx'
import PortRepositoryDependabotAlertMappingAppConfig from './examples/example-repository-alerts/\_github_exporter_example_repo_dependabot_port_app_config.mdx'

import OrganizationBlueprint from './examples/example-organization/\_github_exporter_example_organization_blueprint.mdx'
import OrganizationAppConfig from './examples/example-organization/\_github_exporter_example_organization_port_app_config.mdx'

import LastContributorBranchBlueprint from './examples/example-branch/\_git_exporter_example_last_contributor_branch_blueprint.mdx'
import LastContributorAppConfig from './examples/example-branch/\_github_exporter_example_last_contributor_port_app_config.mdx'
import LastContributorBlueprint from './examples/example-branch/\_git_exporter_example_last_contributor_blueprint.mdx'

import SBOMBlueprint from './examples/example-repository-sbom/_github_exporter_example_sbom_blueprint.mdx'
import PortRepositorySBOMAppConfig from './examples/example-repository-sbom/_github_exporter_example_repository_sbom_port_app_config.mdx'

# Examples

This page provides practical examples for mapping various GitHub resources to Port.

## Organizations and repositories

:::info Available from v3.0.0-beta
The `organization` kind is available from version `v3.0.0-beta` onwards.
:::

The following example demonstrates how to ingest your GitHub organizations and their repositories to Port.  
You can use the following Port blueprint definitions and `port-app-config.yml`:

<OrganizationBlueprint/>

<RepositoryBlueprint/>

<OrganizationAppConfig/>

:::tip learn more

- Port leverages the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to map and transform GitHub objects to Port Entities.
- Click [Here](https://docs.github.com/en/rest/orgs/orgs#get-an-organization) for the GitHub organization object structure.
- Click [Here](https://docs.github.com/en/rest/repos/repos#get-a-repository) for the GitHub repository object structure.

:::

After creating the blueprints and committing the `port-app-config.yml` file, you will see new entities in Port matching your organizations and their repositories. The repositories will have a relation to their parent organization.

## Repositories and pull requests

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

Additionally, you can configure your selector to limit the number of closed pull requests to ingest using a combination of `maxResults` and `since`. By default, we only fetch 100 closed pull requests within 60 days.

```yaml showLineNumbers
- kind: pull-request
  selector:
    query: "true"
    states: ["closed"]  # Specifically for closed PRs.
    maxResults: 50  # Limit closed PRs to 50 capped at 300.
    since: 60  # Fetch closed PRs within 60 days capped at 90 days.
```

You can also choose which GitHub API to use for pull requests. By default, the integration uses the REST API, but you can switch to GraphQL by adding an `api` selector:

```yaml showLineNumbers
- kind: pull-request
  selector:
    query: "true"
    state: ["open"]
    api: "graphql" # Use the GraphQL API instead of REST.
  port:
    entity:
      mappings:
        identifier: .__repository + (.fullDatabaseId|tostring)
        title: .title
        blueprint: '"githubPullRequest"'
        properties:
          creator: (.author.login | gsub("\\["; "-") | gsub("\\](?=[^$])"; "-") | gsub("\\]$"; ""))
          assignees: '[.assignees[].login | gsub("\\](?=[^$])"; "-") | gsub("\\]$"; "")]'
          reviewers: '[.requested_reviewers[].login | gsub("\\](?=[^$])"; "-") | gsub("\\]$"; "")]'
          status: .state
          createdAt: .createdAt
          updatedAt: .updatedAt
          mergedAt: .mergedAt
          prNumber: ".number"
          link: .url
        relations:
          repository: .__repository
```

When you use `api: "rest"`, the pull request data follows the REST API shape (for example `.user.login`, `.created_at`, `.updated_at`, `.merged_at`, `.html_url`, `.additions`, `.deletions`, `.changed_files`).  
When you use `api: "graphql"`, the pull request data follows the GraphQL schema and uses different key names (for example `.author.login`, `.createdAt`, `.updatedAt`, `.mergedAt`, `.url`, `.number`, `.additions`, `.deletions`, `.changedFiles`) and also adds convenience fields such as `assignees`, `requested_reviewers`, `comments`, `review_comments`, `commits`, `mergeable_state` and `mergeable`.  

Make sure you update your jq mappings to use the correct keys for the API you choose.

## Repositories and issues

The following example demonstrates how to ingest your GitHub repositories and their issues to Port, you may use the following Port blueprint definitions and `port-app-config.yml`:


<RepositoryBlueprint/>

<IssueBlueprint/>

<PortIssueAppConfig/>

:::tip learn more

- Refer to the [setup](/build-your-software-catalog/sync-data-to-catalog/git/github/github.md#setup) section to learn more about the `port-app-config.yml` setup process.
- We leverage [JQ JSON processor](https://stedolan.github.io/jq/manual/) to map and transform GitHub objects to Port Entities.
- Click [Here](https://docs.github.com/en/rest/repos/repos#get-a-repository) for the GitHub repository object structure.
- Click [Here](https://docs.github.com/en/rest/issues/issues#get-an-issue) for the GitHub issue object structure.

:::

## Repositories and branches

The following example demonstrates how to ingest your GitHub repositories and their branches to Port, you may use the following Port blueprint definitions and `port-app-config.yml`:

<RepositoryBlueprint/>

<BranchBlueprint/>

<PortBrAppConfig/>

## Repositories and last contributor

The following example demonstrates how to ingest your GitHub repositories and their last contributor to Port.  
You can use the following Port blueprint definitions and `port-app-config.yml`:

<LastContributorBranchBlueprint/>
<LastContributorBlueprint/>
<LastContributorAppConfig/>


:::info supported last contributor
The last contributor is the author of the last commit in the default branch of the repository.  
This example uses the `branch` kind with `detailed: true` to fetch the latest commit data and mirrors the last contributor and last commit date back onto the repository entity. By default, `detailed` is set to `false`, which returns a lighter branch payload. It should only be set to `true` when you need access to commit-level fields.
:::

## Files and file contents

The following example demonstrates ingestion of dependencies from a `package.json` file in your repository into Port: 

<PackageBlueprint />
<PackageAppConfig />

The example will parse the `package.json` file in your repository and extract the dependencies into Port entities.  
For more information about ingesting files and file contents, click [here](/build-your-software-catalog/sync-data-to-catalog/git/github-ocean/#ingest-files-from-your-repositories).


## Files and repositories

The following example demonstrates mapping files to repository.

<RepositoryBlueprint />
<FileBlueprint />
<RepoFileAppConfig />

## Repositories and monorepos

The following example demonstrates how to ingest your GitHub repositories and their folders to Port. By following this example you can map your different services, packages and libraries from your monorepo into separate entities in Port. You may use the following Port blueprint definitions and `port-app-config.yml`:

<RepositoryBlueprint/>

<PortMonoRepoAppConfig/>


To retrieve the root folders of your monorepo, use the following syntax in your `port-app-config.yml`:

::::info Organization and repository filtering for folders
Both `organization` and `repos` under `folders` are optional. You can:
- Specify only `organization`: scan all repositories in that organization for matching folders.
- Specify only `repos`: scan only those repositories across accessible organizations.
- Omit both: scan all accessible repositories for matching folders.
Use `path` and `repositoryType` to scope results and improve performance.
::::

```yaml showLineNumbers
- kind: folder
    selector:
      query: "true" # JQ boolean query. If evaluated to false - skip syncing the object.
      folders: # Specify the repositories and folders to include under this relative path.
        - path: "*" # Relative path to the folders within the repositories.
          repos: # Optional: list repositories to include (omit to scan all repos)
            - name: backend-service
            - name: frontend-service
```

:::tip learn more

- Refer to the [setup](/build-your-software-catalog/sync-data-to-catalog/git/github/github.md#setup) section to learn more about the `port-app-config.yml` setup process.
- We leverage [JQ JSON processor](https://stedolan.github.io/jq/manual/) to map and transform GitHub objects to Port Entities.
- Click [Here](https://docs.github.com/en/rest/repos/repos#get-a-repository) for the GitHub repository object structure.
- Click [Here](https://docs.github.com/en/rest/git/trees#get-a-tree) for the GitHub folder object structure.

:::


## Repositories, workflows and workflow runs

The following example demonstrates how to ingest your GitHub repositories, their workflows and workflow runs to Port, you may use the following Port blueprint definitions and `port-app-config.yml`:

<RepositoryBlueprint/>

<WorkflowBlueprint/>

<WorkflowRunBlueprint/>

<PortWfWfrAppConfig/>

:::tip learn more
- Click [Here](https://docs.github.com/en/rest/actions/workflows#get-a-workflow) for the GitHub workflow object structure.
- Click [Here](https://docs.github.com/en/rest/actions/workflow-runs#get-a-workflow-run) for the GitHub workflow run object structure.

:::

## Repositories and teams

The following example demonstrates how to ingest your GitHub repositories and their teams to Port.  
You can use the following Port blueprint definitions and `port-app-config.yml`:

<TeamBlueprint/>

<RepositoryTeamBlueprint/>

<PortRepositoryTeamMappingAppConfig/>


## Repositories with multiple relationships

You can now include multiple relationship types in a single repository configuration. For example, to include both teams and collaborators:

```yaml showLineNumbers
- kind: repository
  selector:
    query: "true"
    include: ["teams", "collaborators"] # Include both teams and collaborators
  port:
    entity:
      mappings:
        identifier: .name
        title: .name
        blueprint: '"githubRepository"'
        properties:
          readme: file://README.md
          url: .html_url
          defaultBranch: .default_branch
        relations:
          githubTeams: "[.__teams[].id | tostring]"
          githubCollaborators: "[.__collaborators[].login]"
```

The `include` property accepts a list of strings to fetch additional data related to the repository. The accepted values are:
- `teams`: Ingests the [teams with access to the repository](https://docs.github.com/en/rest/repos/repos#list-repository-teams).
- `collaborators`: Ingests the [collaborators of the repository](https://docs.github.com/en/rest/repos/collaborators#list-repository-collaborators).
- `sbom`: Ingests the [Software Bill of Materials (SBOM)](https://docs.github.com/en/rest/dependency-graph/sboms#get-a-software-bill-of-materials-sbom-for-a-repository) for the repository.

:::caution Performance consideration
While you can include multiple relationship types in a single configuration, this may impact resync performance for large repositories. For optimal performance, consider separating into multiple repository blocks:

```yaml showLineNumbers
# Separate blocks for better performance
- kind: repository
  selector:
    query: "true"
    include: ["teams"]
  # ... rest of configuration

- kind: repository  
  selector:
    query: "true"
    include: ["collaborators"]
  # ... rest of configuration
```
:::


## Teams and team members

The following shows how we can map teams and team members using the "members" selector.

<TeamMemberBlueprint />
<TeamWithMembersBlueprint />
<TeamMemberConfig />


## Repositories, repository admins and users

The following example demonstrates how to ingest your GitHub repositories, their admins and related users to Port.  
You can use the following Port blueprint definitions and `port-app-config.yml`:

<RepositoryAdminBlueprint/>

<GithubUsersBlueprint/>

<UsersBlueprint />

<RepositoryAdminAppConfig/>

 <h3>Supported GitHub user types</h3>

As Github has strict privacy policies, the GitHub API will only return emails in the following cases:  

1. The user has a public email address.
2. Your organization is working with a GitHub Enterprise Cloud plan, and the user has an SAML SSO identity configured inside the GitHub organization.

In other cases, the GitHub API will return a `null` value for the user's email.

:::tip User supported fields 
For the `user` kind, only the following fields are supported: `.name`, `.login`, and `.email`.  
Other fields from the [GitHub User API](https://docs.github.com/en/rest/users/users#get-a-user) are not available.
:::

## Repositories and collaborators

The following example demonstrates how to ingest your GitHub repositories and their collaborators to Port.  
You can use the following Port blueprint definitions and `port-app-config.yml`:

<RepositoryBlueprint/>
<CollaboratorBlueprint />
<PortRepositoryCollaboratorAppConfig />

## Repositories, dependabot alerts, code and secrets scan alerts

The following example shows how to ingest your GitHub repositories and their alerts (Dependabot and Code scan alerts) into Port. You can use the following Port blueprint definitions and `port-app-config.yml`:

<RepositoryBlueprint/>

<DependabotAlertBlueprint/>

<CodeScanAlertBlueprint/>

<SecretScanAlertBlueprint/>

<PortRepositoryDependabotAlertMappingAppConfig/>

## Repositories, deployments and environments

The following example demonstrates how to ingest your GitHub repositories, their deployments and environments to Port, you may use the following Port blueprint definitions and `port-app-config.yml`:

<RepositoryBlueprint/>

<RepoEnvironmentBlueprint/>

<DeploymentBlueprint/>

<PortRepoDeploymentAndEnvironmentAppConfig/>

## Repositories, repository releases and tags

The following example demonstrates how to ingest your GitHub repositories, their releases and tags to Port, you may use the following Port blueprint definitions and `port-app-config.yml`:

<RepositoryBlueprint/>

<TagBlueprint/>

<ReleaseBlueprint/>

<RepositoryTagReleaseAppConfig/>

## Repositories and software bill of materials (SBOM)

The following example demonstrates how to ingest your GitHub repositories and their software bill of materials (SBOM) to Port.  
You can use the following Port blueprint definitions and `port-app-config.yml`:

<RepositoryBlueprint/>
<SBOMBlueprint />
<PortRepositorySBOMAppConfig />

## Supported resources

The examples above show specific use cases, but Port's GitHub integration supports the ingestion of many other GitHub objects.
To adapt the examples above, use the GitHub API reference to learn about the available fields for the different supported objects:

<GitHubResources/>

When adding the ingestion of other resources, remember to add an entry to the `resources` array and change the value provided to the `kind` key accordingly.
