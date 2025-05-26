---
sidebar_position: 2
---

import GroupBlueprint from './example-groups/_gitlab_integration_example_group_blueprint.mdx'
import GroupConfig from './example-groups/_gitlab_integration_example_group_config.mdx'
import ProjectGroupBlueprint from './example-groups/\_gitlab_integration_example_group_project_blueprint.mdx'
import PortGroupsAppConfig from './example-groups/\_gitlab_exporter_example_group_repository_port_app_config.mdx'
import ProjectBlueprint from './example-projects/_gitlab_integration_example_project_blueprint.mdx'
import ProjectConfig from './example-projects/_gitlab_integration_example_project_config.mdx'
import IssueBlueprint from './example-issues/_gitlab_integration_example_issue_blueprint.mdx'
import IssueConfig from './example-issues/_gitlab_integration_example_issue_config.mdx'
import MergeRequestBlueprint from './example-merge-requests/_gitlab_integration_example_merge_request_blueprint.mdx'
import MergeRequestConfig from './example-merge-requests/_gitlab_integration_example_merge_request_config.mdx'
import PackageBlueprint from './example-files/_gitlab_integration_example_package_blueprint.mdx'
import PackageConfig from './example-files/_gitlab_integration_example_package_config.mdx'
import FolderBlueprint from './example-folders/_gitlab_integration_example_folder_blueprint.mdx'
import FolderConfig from './example-folders/_gitlab_integration_example_folder_config.mdx'
import MonoRepoAppConfig from './example-folders/\_gitlab_export_example_monorepo_port_app_config.mdx'
import MemberBlueprint from './example-members/_gitlab_integration_example_member_blueprint.mdx'
import MemberConfig from './example-members/_gitlab_integration_example_member_config.mdx'
import GroupMembersBlueprint from './example-groups/_gitlab_integration_example_group_members_blueprint.mdx'
import GroupMembersConfig from './example-groups/_gitlab_integration_example_group_members_config.mdx'
import PipelineBlueprint from './example-pipelines/_gitlab_integration_example_pipeline_blueprint.mdx'
import JobBlueprint from './example-jobs/_gitlab_integration_example_job_blueprint.mdx'
import PipelineJobConfig from './example-pipelines/_gitlab_integration_example_pipeline_job_config.mdx'

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Examples

## Mapping groups

In the following example you will ingest your GitLab groups, subgroups and projects to Port, you may use the following Port blueprint definitions and integration configuration:

<details>
<summary>Group blueprint</summary>
<GroupBlueprint/>
</details>

<ProjectGroupBlueprint/>

<PortGroupsAppConfig/>


:::tip Learn more

- Refer to the [setup](/build-your-software-catalog/sync-data-to-catalog/git/gitlab-v2/#setup) section to learn more about the integration configuration setup process.
- We leverage [JQ JSON processor](https://stedolan.github.io/jq/manual/) to map and transform GitLab objects to Port entities.
- Click [Here](https://docs.gitlab.com/api/groups/#list-all-groups) for the GitLab group object structure.

:::



## Mapping projects, README.md and merge requests

In the following example you will ingest your GitLab projects, their README.md file contents and merge requests to Port, you may use the following Port blueprint definitions and integration configuration:

<details>
<summary>Project blueprint</summary>
<ProjectBlueprint />
</details>

<details>
<summary>Merge request blueprint</summary>
<MergeRequestBlueprint />
</details>

<details>
<summary>Integration Mapping</summary>
<MergeRequestConfig />
</details>

:::tip Learn more
- Refer to the [setup](/build-your-software-catalog/sync-data-to-catalog/git/gitlab-v2/#setup) section to learn more about the integration configuration setup process.
- We leverage [JQ JSON processor](https://stedolan.github.io/jq/manual/) to map and transform GitLab objects to Port entities.
- Click [Here](https://docs.gitlab.com/ee/api/groups.html#list-a-groups-projects) for the GitLab project object structure.
- Click [Here](https://docs.gitlab.com/ee/api/merge_requests.html#list-project-merge-requests) for the GitLab merge request object structure.
:::



## Mapping projects and issues

In the following example you will ingest your GitLab projects and their issues to Port, you may use the following Port blueprint definitions and integration configuration:

<details>
<summary>Project blueprint</summary>
<ProjectBlueprint />
</details>

<details>
<summary>Issue blueprint</summary>
<IssueBlueprint />
</details>

<details>
<summary>Integration Mapping</summary>
<IssueConfig />
</details>


:::tip Learn more

- Refer to the [setup](/build-your-software-catalog/sync-data-to-catalog/git/gitlab-v2/#setup) section to learn more about the integration configuration setup process.
- We leverage [JQ JSON processor](https://stedolan.github.io/jq/manual/) to map and transform GitLab objects to Port entities.
- Click [Here](https://docs.gitlab.com/ee/api/groups.html#list-a-groups-projects) for the GitLab project object structure.
- Click [Here](https://docs.gitlab.com/ee/api/issues.html) for the GitLab issue object structure.
:::



## Mapping files and file contents

The following example shows how to ingest dependencies from a `package.json` file in your GitLab repository into Port.  
You can use the following Port blueprint definitions and integration configuration:

<details>
<summary>Package blueprint</summary>
<PackageBlueprint />
</details>

<details>
<summary>Integration Mapping</summary>
<PackageConfig />
</details>

The example will parse the `package.json` file in your repository and extract the dependencies into Port entities.  
For more information about ingesting files and file contents, click [here](/build-your-software-catalog/sync-data-to-catalog/git/gitlab-v2/#ingest-files-from-your-repositories)



## Mapping projects and monorepos

In the following example you will ingest your GitLab projects and their monorepo folders to Port, you may use the following Port blueprint definitions and integration configuration:

<details>
<summary>Project blueprint</summary>
<ProjectBlueprint />
</details>


<MonoRepoAppConfig/>

To retrieve the root folders of your monorepo, you can use this following syntax in your `port-app-config.yml`:

```yaml
- kind: folder
  selector:
    query: "true" # JQ boolean query. If evaluated to false - skip syncing the object.
    folders: # Specify the repositories and folders to include under this relative path.
      - path: "/" # Relative path to the folders within the repositories
        repos: # List of repositories to include folders from.
          - backend-service
          - frontend-service
```

You can also specify a different path for each monorepo repository, for example:

```yaml
- kind: folder
  selector:
    query: "true" # JQ boolean query. If evaluated to false - skip syncing the object.
    folders: # Specify the repositories and folders to include under this relative path.
      - path: "apps/"
        repos:
          - gaming-apps
      - path: "microservices/"
        repos:
          - backend-services
```


:::tip Learn more

- Refer to the [setup](/build-your-software-catalog/sync-data-to-catalog/git/gitlab-v2/#setup) section to learn more about the integration configuration setup process.
- We leverage [JQ JSON processor](https://stedolan.github.io/jq/manual/) to map and transform GitLab objects to Port entities.
- Click [Here](https://docs.gitlab.com/ee/api/groups.html#list-a-groups-projects) for the GitLab project object structure.
- Click [Here](https://docs.gitlab.com/ee/api/repositories.html#list-repository-tree) for the GitLab repository tree object structure.

:::



## Mapping projects and folders

In the following example you will ingest your GitLab projects and their folders to Port, you may use the following Port blueprint definitions and integration configuration:

<details>
<summary>Project blueprint</summary>
<ProjectBlueprint />
</details>

<details>
<summary>Folder blueprint</summary>
<FolderBlueprint />
</details>

<details>
<summary>Integration Mapping</summary>
<FolderConfig />
</details>

:::tip Folder mapping patterns
You can specify different paths for different repositories:

```yaml showLineNumbers
resources:
  - kind: folder
    selector:
      query: "true"
      folders:
        - path: "apps/"
          repos:
            - group/gaming-services
        - path: "packages/"
          repos:
            - group/shared-libraries
```
:::

## Mapping members and group with members

### Prerequisites

- When using **GitLab Self Hosted**, an admin token is required, rather than a group access token, to retrieve the `primary email addresses` of members.
- When using **GitLab Enterprise**, accounts can retrieve the `primary email addresses` of members within their groups, provided the members are part of user accounts administered by an organization with [verified domains for groups](https://docs.gitlab.com/ee/user/enterprise_user/#verified-domains-for-groups). For more information, see [limitations](https://docs.gitlab.com/ee/api/members.html#limitations).

:::caution GitLab free plan limitation
Primary email addresses are not available for GitLab "Free plan" users.
:::

### Mapping members

In the following example you will ingest your GitLab members to Port, you may use the following Port blueprint definitions and integration configuration:

<details>
<summary>Member blueprint</summary>
<MemberBlueprint />
</details>

<details>
<summary> Integration configuration</summary>
<MemberConfig />
</details>



### Mapping groups with members

In the following example you will ingest your GitLab groups and their members to Port, you may use the following Port blueprint definitions and integration configuration:

<details>
<summary>Group with members blueprint</summary>
<GroupMembersBlueprint />
</details>

<details>
<summary>Integration Mapping</summary>
<GroupMembersConfig />
</details>

<Tabs groupId="config" queryString="parameter">

<TabItem label="Include Bot Members" value="includeBotMembers">

GitLab allows the creation of tokens (bots) for automated tasks, which can be associated with groups or projects via access tokens.
The `includeBotMembers` parameter is used to filter out bot members from the actual GitLab members.
By default, this selector is set to `false`, which means the integration will only sync actual members.

```yaml
  - kind: group-with-members
    selector:
      query: 'true'
      # highlight-next-line
      includeBotMembers: false
```

```yaml
  - kind: members
    selector:
      query: 'true'
      # highlight-next-line
      includeBotMembers: false
```
</TabItem>

</Tabs>

:::tip Learn more

- Refer to the [setup](/build-your-software-catalog/sync-data-to-catalog/git/gitlab-v2/#setup) section to learn more about the integration configuration setup process.
- We leverage [JQ JSON processor](https://stedolan.github.io/jq/manual/) to map and transform GitLab objects to Port entities.
- Click [Here](https://docs.gitlab.com/ee/api/members.html#list-all-members-of-a-group-or-project) for the GitLab project or group member object structure.

:::


## Mapping projects, pipelines and jobs

In the following example you will ingest your GitLab projects, their pipelines and jobs runs to Port, you may use the following Port blueprint definitions and integration configuration:

<details>
<summary>Pipeline blueprint</summary>
<PipelineBlueprint />
</details>

<details>
<summary>Job blueprint</summary>
<JobBlueprint />
</details>

<details>
<summary>Integration Mapping</summary>
<PipelineJobConfig />
</details>

:::tip Learn more

- Refer to the [setup](/build-your-software-catalog/sync-data-to-catalog/git/gitlab-v2/#setup) section to learn more about the integration configuration setup process.
- We leverage [JQ JSON processor](https://stedolan.github.io/jq/manual/) to map and transform GitLab objects to Port entities.
- Click [Here](https://docs.gitlab.com/api/projects/#list-projects) for the GitLab project object structure.
- Click [Here](https://docs.gitlab.com/ee/api/pipelines.html#list-project-pipelines) for the GitLab pipeline object structure.
- Click [Here](https://docs.gitlab.com/ee/api/jobs.html#list-project-jobs) for the GitLab job object structure.

:::

