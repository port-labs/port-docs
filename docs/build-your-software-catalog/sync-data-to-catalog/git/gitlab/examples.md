---
sidebar_position: 2
---

import RepositoryBlueprint from './\_gitlab_exporter_example_repository_blueprint.mdx'
import PRBlueprint from './\_gitlab_exporter_example_merge_request_blueprint.mdx'
import PortAppConfig from './\_gitlab_exporter_example_port_app_config.mdx'
import GitlabResources from './\_gitlab_exporter_supported_resources.mdx'

import PipelineBlueprint from './example-pipeline-job/\_git_exporter_example_pipeline_blueprint.mdx'
import JobBlueprint from './example-pipeline-job/\_git_exporter_example_job_blueprint.mdx'
import PortPipelineJobAppConfig from './example-pipeline-job/\_gitlab_exporter_example_pipeline_job_port_app_config.mdx'

import IssueBlueprint from './example-issue/\_git_exporter_example_issue_blueprint.mdx'
import PortIssueAppConfig from './example-issue/\_gitlab_exporter_example_issue_port_app_config.mdx'

import MonoRepoAppConfig from './example-repository-folders/\_gitlab_export_example_monorepo_port_app_config.mdx'

import FolderBlueprint from './example-repository-folders/\_gitlab_exporter_example_folder_blueprint.mdx'
import PortFoldersAppConfig from './example-repository-folders/\_gitlab_exporter_example_repo_folders_port_app_config.mdx'

import RepositoryGroupBlueprint from './example-groups-subgroups/\_gitlab_exporter_example_repository_blueprint.mdx'
import GroupBlueprint from './example-groups-subgroups/\_gitlab_exporter_example_group_blueprint.mdx'
import PortGroupsAppConfig from './example-groups-subgroups/\_gitlab_exporter_example_group_repository_port_app_config.mdx'

import MemberBlueprint from './example-member/\_gitlab_exporter_example_member_blueprint.mdx'
import MemberPortAppConfig from './example-member/\_gitlab_exporter_example_member_port_app_config.mdx'

import GroupWithMemberRelationBlueprint from './example-groups-members/\_gitlab_exporter_example_group_with_member_blueprint.mdx'
import GroupWithMemberPortAppConfig from './example-groups-members/\_gitlab_exporter_example_group_with_member_port_app_config.mdx' 

import ProjectWithMemberRelationBlueprint from './example-projects-members/\_gitlab_exporter_example_project_member_blueprint.mdx'
import ProjectMemberPortAppConfig from './example-projects-members/\_gitlab_exporter_example_project_member_port_app_config.mdx'

import PackageBlueprint from './example-file/\_gitlab_exporter_example_package_blueprint.mdx'
import PortPackageAppConfig from './example-file/\_gitlab_exporter_example_package_port_app_config.mdx'
import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Examples

## Mapping projects, README.md and merge requests

In the following example you will ingest your GitLab projects, their README.md file contents and merge requests to Port, you may use the following Port blueprint definitions and integration configuration:

<RepositoryBlueprint/>

<PRBlueprint/>

<PortAppConfig/>

:::tip Learn more

- Refer to the [setup](gitlab.md#setup) section to learn more about the integration configuration setup process.
- We leverage [JQ JSON processor](https://stedolan.github.io/jq/manual/) to map and transform GitLab objects to Port entities.
- Click [Here](https://docs.gitlab.com/ee/api/groups.html#list-a-groups-projects) for the GitLab project object structure.
- Click [Here](https://docs.gitlab.com/ee/api/merge_requests.html#list-project-merge-requests) for the GitLab merge request object structure.

:::

After creating the blueprints and saving the integration configuration, you will see new entities in Port matching your projects alongside their `README.md` file contents and merge requests.

## Mapping files and file contents

The following example shows how to ingest dependencies from a `package.json` file in your GitLab repository into Port.  
You can use the following Port blueprint definitions and integration configuration:

<PackageBlueprint/>

<PortPackageAppConfig/>

The example will parse the `package.json` file in your repository and extract the dependencies into Port entities.  
For more information about ingesting files and file contents, click [here](/build-your-software-catalog/sync-data-to-catalog/git/gitlab/#ingest-files-from-your-repositories)

## Mapping Groups, Subgroups and Projects

In the following example you will ingest your GitLab groups, subgroups and projects to Port, you may use the following Port blueprint definitions and integration configuration:

<GroupBlueprint/>

<RepositoryGroupBlueprint/>

<PortGroupsAppConfig/>

:::tip Learn more

- Refer to the [setup](gitlab.md#setup) section to learn more about the integration configuration setup process.
- We leverage [JQ JSON processor](https://stedolan.github.io/jq/manual/) to map and transform GitLab objects to Port entities.
- Click [Here](https://docs.gitlab.com/ee/api/groups.html#list-a-groups-projects) for the GitLab project object structure.
- Click [Here](https://docs.gitlab.com/ee/api/groups.html#list-a-groups-subgroups) for the GitLab subgroup object structure.

:::

## Mapping projects, pipelines and jobs

In the following example you will ingest your GitLab projects, their pipelines and jobs runs to Port, you may use the following Port blueprint definitions and integration configuration:

<RepositoryBlueprint/>

<PipelineBlueprint/>

<JobBlueprint/>

<PortPipelineJobAppConfig/>

:::tip Learn more

- Refer to the [setup](gitlab.md#setup) section to learn more about the integration configuration setup process.
- We leverage [JQ JSON processor](https://stedolan.github.io/jq/manual/) to map and transform GitLab objects to Port entities.
- Click [Here](https://docs.gitlab.com/ee/api/groups.html#list-a-groups-projects) for the GitLab project object structure.
- Click [Here](https://docs.gitlab.com/ee/api/pipelines.html#list-project-pipelines) for the GitLab pipeline object structure.
- Click [Here](https://docs.gitlab.com/ee/api/jobs.html#list-project-jobs) for the GitLab job object structure.

:::

After creating the blueprints and saving the integration configuration, you will see new entities in Port matching your projects alongside their pipelines and jobs.

## Mapping projects and monorepos

In the following example you will ingest your GitLab projects and their monorepo folders to Port, you may use the following Port blueprint definitions and integration configuration:

<RepositoryBlueprint/>

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

- Refer to the [setup](gitlab.md#setup) section to learn more about the integration configuration setup process.
- We leverage [JQ JSON processor](https://stedolan.github.io/jq/manual/) to map and transform GitLab objects to Port entities.
- Click [Here](https://docs.gitlab.com/ee/api/groups.html#list-a-groups-projects) for the GitLab project object structure.
- Click [Here](https://docs.gitlab.com/ee/api/repositories.html#list-repository-tree) for the GitLab repository tree object structure.

:::

## Mapping projects and folders

In the following example you will ingest your GitLab projects and their folders to Port, you may use the following Port blueprint definitions and integration configuration:

<RepositoryBlueprint/>

<FolderBlueprint/>

<PortFoldersAppConfig/>

:::tip Learn more

- Refer to the [setup](gitlab.md#setup) section to learn more about the integration configuration setup process.
- We leverage [JQ JSON processor](https://stedolan.github.io/jq/manual/) to map and transform GitLab objects to Port entities.
- Click [Here](https://docs.gitlab.com/ee/api/groups.html#list-a-groups-projects) for the GitLab project object structure.
- Click [Here](https://docs.gitlab.com/ee/api/repositories.html#list-repository-tree) for the GitLab repository tree object structure.

:::

## Mapping projects and issues

In the following example you will ingest your GitLab projects and their issues to Port, you may use the following Port blueprint definitions and integration configuration:

<RepositoryBlueprint/>

<IssueBlueprint/>

<PortIssueAppConfig/>

:::tip Learn more

- Refer to the [setup](gitlab.md#setup) section to learn more about the integration configuration setup process.
- We leverage [JQ JSON processor](https://stedolan.github.io/jq/manual/) to map and transform GitLab objects to Port entities.
- Click [Here](https://docs.gitlab.com/ee/api/groups.html#list-a-groups-projects) for the GitLab project object structure.
- Click [Here](https://docs.gitlab.com/ee/api/issues.html#list-project-issues) for the GitLab issue object structure.

:::

After creating the blueprints and saving the integration configuration, you will see new entities in Port matching your projects alongside their issues.


## Mapping group or project and members

In the following example you will ingest your GitLab members to Port, you may use the following Port blueprint definitions and integration configuration:

### Prerequisites

- When using **GitLab Self Hosted**, an admin token is required, rather than a group access token, to retrieve the `primary email addresses` of members.
- When using **GitLab Enterprise**, accounts can retrieve the `primary email addresses` of members within their groups, provided the members are part of user accounts administered by an organization with [verified domains for groups](https://docs.gitlab.com/ee/user/enterprise_user/#verified-domains-for-groups). For more information, see [limitations](https://docs.gitlab.com/ee/api/members.html#limitations).



:::caution GitLab free plan limitation
Primary email addresses are not available for GitLab "Free plan" users.
:::


<MemberBlueprint/>
<MemberPortAppConfig/>
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
  - kind: project-with-members
    selector:
      query: 'true'
      # highlight-next-line
      includeBotMembers: false
```
</TabItem>

<TabItem value="includeInheritedMembers" label="Include Inherited and Invited Members">

You can also specify the `includeInheritedMembers` selector to control the inclusion of inherited members in the member data.
By default, this parameter is set to `false`, and the integration will sync only direct members without inherited members.

```yaml
  - kind: group-with-members
    selector:
      query: 'true'
      # highlight-next-line
      includeInheritedMembers: false
```

```yaml
  - kind: project-with-members
    selector:
      query: 'true'
      # highlight-next-line
      includeInheritedMembers: false
```
</TabItem>

<TabItem value="includeVerboseMemberObject" label="Include Verbose Member Object">

By default, the integration syncs only essential member properties (id, username, and email) to optimize memory usage. To include all member properties available in the GitLab API (like name, state, web_url, etc.), set the `includeVerboseMemberObject` selector to `true`. This gives you access to the complete member object but may increase memory consumption. If you must change this setting, we recommend you change the value of this selector only for the kind you intend to use for parsing members (not groups).

```yaml
  - kind: group-with-members
    selector:
      query: 'true'
      # highlight-next-line
      includeVerboseMemberObject: false
```

```yaml
  - kind: project-with-members
    selector:
      query: 'true'
      # highlight-next-line
      includeVerboseMemberObject: false
```
</TabItem>

</Tabs>

### Mapping members and groups

In the following example you will ingest your GitLab groups and their members to Port, you may use the following Port blueprint definitions and integration configuration:

<GroupWithMemberRelationBlueprint/>
<GroupWithMemberPortAppConfig/>

### Mapping members and projects

In the following example you will ingest your GitLab projects and their members to Port, you may use the following Port blueprint definitions and integration configuration:

:::caution Limitation
Real time webhook events are not supported for the `project-with-members` kind.
:::

<ProjectWithMemberRelationBlueprint/>
<ProjectMemberPortAppConfig/>

:::tip Learn more

- Refer to the [setup](gitlab.md#setup) section to learn more about the integration configuration setup process.
- We leverage [JQ JSON processor](https://stedolan.github.io/jq/manual/) to map and transform GitLab objects to Port entities.
- Click [Here](https://docs.gitlab.com/ee/api/members.html#list-all-members-of-a-group-or-project) for the GitLab project or group member object structure.

:::

## Mapping supported resources

The examples above show specific use cases, but Port's GitLab integration supports the ingestion of many other GitLab objects.
To adapt the examples above, use the GitLab API reference to learn about the available fields for the different supported objects:

<GitlabResources/>

When adding the ingestion of other resources, remember to add an entry to the `resources` array and change the value provided to the `kind` key accordingly.

After creating the blueprints and saving the integration configuration, you will see new entities in Port matching your projects alongside their issues.
