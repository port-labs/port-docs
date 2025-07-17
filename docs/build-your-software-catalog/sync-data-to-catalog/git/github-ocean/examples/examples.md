---
sidebar_position: 2
---

import RepositoryBlueprint from './\_github_exporter_example_repository_blueprint.mdx'
import PRBlueprint from './\_github_exporter_example_pull_request_blueprint.mdx'
import PortAppConfig from './\_github_exporter_example_port_app_config.mdx'
import GitHubResources from '../\_github_exporter_supported_resources.mdx'

import UsersBlueprint from './example-repository-admins/\_github_exporter_example_users_blueprint.mdx'
import GithubUsersBlueprint from './example-repository-admins/\_github_exporter_example_github_users_blueprint.mdx'
import RepositoryAdminBlueprint from './example-repository-admins/\_github_export_example_repository_with_admins_relation_blueprint.mdx'
import RepositoryAdminAppConfig from './example-repository-admins/\_github_exporter_example_admins_users_port_app_config.mdx'

import IssueBlueprint from './example-issue/\_git_exporter_example_issue_blueprint.mdx'
import PortIssueAppConfig from './example-issue/\_github_exporter_example_issue_port_app_config.mdx'

import PackageBlueprint from './example-file-kind/\_example_package_blueprint.mdx'
import PackageAppConfig from './example-file-kind/\_package_json_app_config.mdx'

import TeamBlueprint from './example-team-members/\_github_exporter_team_blueprint.mdx'
import TeamMemberBlueprint from './example-team-members/\_github_exporter_team_member_blueprint.mdx'
import TeamMemberConfig from './example-team-members/\_github_team_member_port_app_config.mdx'

import PortMonoRepoAppConfig from './example-monorepo/\_github_exporter_example_monorepo_port_app_config.mdx'

# Resource mapping examples


## Map repositories and pull requests

In the following example you will ingest your GitHub repositories, their README.md file contents and open pull requests to Port, you may use the following Port blueprint definitions and `port-app-config.yml`:

<RepositoryBlueprint/>

<PRBlueprint/>

:::info repository type

The `repositoryType` parameter filters which repositories are ingested. It corresponds to the `type` parameter in GitHub's [List organization repositories](https://docs.github.com/en/rest/repos/repos?apiVersion=2022-11-28#list-organization-repositories) API.

<details>
<summary>Possible values:</summary>

*   `all` (default): All repositories accessible to the provided token.
*   `public`: Public repositories.
*   `private`: Private repositories.
*   `forks`: Only forked repositories.
*   `sources`: Only non-forked repositories.
</details>

:::

<PortAppConfig/>

:::tip learn more

- We leverage [JQ JSON processor](https://stedolan.github.io/jq/manual/) to map and transform GitHub objects to Port Entities.
- Click [Here](https://docs.github.com/en/rest/repos/repos#get-a-repository) for the GitHub repository object structure.
- Click [Here](https://docs.github.com/en/rest/pulls/pulls#get-a-pull-request) for the GitHub pull request object structure.

:::

After creating the blueprints and committing the `port-app-config.yml` file to your `.github-private` repository (for global configuration), or to any specific repositories (for per-repo configuration), you will see new entities in Port matching your repositories alongside their README.md file contents and pull requests. (Remember that the `port-app-config.yml` file has to be in the **default branch** of the repository to take effect).

## Map repositories, repository admins and users

In the following example you will ingest your GitHub repositories, their admins and related users to Port, you may use the following Port blueprint definitions and `port-app-config.yml`:

<RepositoryAdminBlueprint/>

<GithubUsersBlueprint/>

<UsersBlueprint/>

<RepositoryAdminAppConfig/>

 <h3>Supported GitHub user types</h3>

As Github has strict privacy policies, the GitHub API will only return emails in the following cases:  

1. The user has a public email address
2. Your organization is working with a GitHub Enterprise Cloud plan, and the user has an SAML SSO identity configured inside the GitHub organization.

In other cases, the GitHub API will return a `null` value for the user's email.

:::tip User supported fields 
For the `user` kind, only the following fields are supported: `.login`, and `.email`.  
Other fields from the [GitHub User API](https://docs.github.com/en/rest/users/users#get-a-user) are not available.
:::

## Map repositories and issues

In the following example you will ingest your GitHub repositories and their issues to Port, you may use the following Port blueprint definitions and `port-app-config.yml`:

<RepositoryBlueprint/>

<IssueBlueprint/>

<PortIssueAppConfig/>

:::tip learn more

- Refer to the [setup](/build-your-software-catalog/sync-data-to-catalog/git/github/github.md#setup) section to learn more about the `port-app-config.yml` setup process.
- We leverage [JQ JSON processor](https://stedolan.github.io/jq/manual/) to map and transform GitHub objects to Port Entities.
- Click [Here](https://docs.github.com/en/rest/repos/repos#get-a-repository) for the GitHub repository object structure.
- Click [Here](https://docs.github.com/en/rest/issues/issues#get-an-issue) for the GitHub issue object structure.

:::

## Map files and file contents

The following example demonstrates ingestion of dependencies from a `package.json` file in your repository into Port: 

<PackageBlueprint />
<PackageAppConfig />

The example will parse the `package.json` file in your repository and extract the dependencies into Port entities.  
For more information about ingesting files and file contents, click [here](/build-your-software-catalog/sync-data-to-catalog/git/github-ocean/#ingest-files-from-your-repositories).

## Map repositories and monorepos

In the following example you will ingest your GitHub repositories and their folders to Port. By following this example you can map your different services, packages and libraries from your monorepo into separate entities in Port. you may use the following Port blueprint definitions and `port-app-config.yml`:

<RepositoryBlueprint/>

<PortMonoRepoAppConfig/>


To retrieve the root folders of your monorepo, you can use this following syntax in your `port-app-config.yml`:

```yaml
- kind: folder
    selector:
      query: "true" # JQ boolean query. If evaluated to false - skip syncing the object.
      folders: # Specify the repositories and folders to include under this relative path.
        - path: "*" # Relative path to the folders within the repositories.
          repos: # List of repositories to include folders from.
            - name: backend-service
            - name: frontend-service
```


:::tip learn more

- Refer to the [setup](/build-your-software-catalog/sync-data-to-catalog/git/github/github.md#setup) section to learn more about the `port-app-config.yml` setup process.
- We leverage [JQ JSON processor](https://stedolan.github.io/jq/manual/) to map and transform GitHub objects to Port Entities.
- Click [Here](https://docs.github.com/en/rest/repos/repos#get-a-repository) for the GitHub repository object structure.
- Click [Here](https://docs.github.com/en/rest/git/trees#get-a-tree) for the GitHub folder object structure.

:::

## Map team and team member
The following show how you can map team and team members using the "members" selector.

<TeamMemberBlueprint />
<TeamBlueprint />
<TeamMemberConfig />

## Map supported resources

The examples above show specific use cases, but Port's GitHub integration supports the ingestion of many other GitHub objects.
To adapt the examples above, use the GitHub API reference to learn about the available fields for the different supported objects:

<GitHubResources/>

When adding the ingestion of other resources, remember to add an entry to the `resources` array and change the value provided to the `kind` key accordingly.
