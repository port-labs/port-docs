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
import ReleaseBlueprint from './example-releases/_gitlab_integration_example_release_blueprint.mdx'
import ReleaseConfig from './example-releases/_gitlab_integration_example_release_config.mdx'
import TagBlueprint from './example-tags/_gitlab_integration_example_tag_blueprint.mdx'
import TagConfig from './example-tags/_gitlab_integration_example_tag_config.mdx'
import TeamBlueprint from './example-files/_gitlab_integration_example_team_blueprint.mdx'
import YamlConfig from './example-files/_gitlab_integration_example_yaml_config.mdx'
import TeamsYamlFileExample from './example-files/_gitlab_integration_example_team_yaml_file_example.mdx'

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Examples

## Mapping examples

### Groups

The following example demonstrates how to ingest your GitLab groups, subgroups and projects to Port.  
You can use the following Port blueprint definitions and integration configuration:

<GroupBlueprint/>

<ProjectGroupBlueprint/>

<PortGroupsAppConfig/>

#### Group configuration options

The `includeActiveGroups` selector allows you to filter groups based on whether they are active or not.
By default, if not specified, all groups will be synced.

```yaml showLineNumbers
- kind: group
  selector:
    query: 'true'
    # highlight-next-line
    includeActiveGroups: true
```

:::caution Group search filtering effect
If `includeActiveGroups` is specified, only **groups**, **issues**, **files**, **members** and **merge requests** that match the criteria will be synced.
This means, the following kinds will be fetched based on the groups filtered with the search criteria:

- `group`
- `issue`
- `file`
- `member`
- `merge-request`

For more information, see the [troubleshooting](/build-your-software-catalog/sync-data-to-catalog/git/gitlab-v2/installation#troubleshooting) section.

:::

:::tip Learn more

- Refer to the [setup](/build-your-software-catalog/sync-data-to-catalog/git/gitlab-v2/#setup) section to learn more about the integration configuration setup process.
- We leverage [JQ JSON processor](https://stedolan.github.io/jq/manual/) to map and transform GitLab objects to Port entities.
- Click [Here](https://docs.gitlab.com/api/groups/#list-all-groups) for the GitLab group object structure.

:::



### Projects, README.md and merge requests

:::caution Merge request access requirement
Merge requests are fetched at the **group level**. Ensure your integration token has access to the parent GitLab group that contains your projects. Project-level access alone is not sufficient for merge request visibility.

For more information, see the [troubleshooting](/build-your-software-catalog/sync-data-to-catalog/git/gitlab-v2/installation#troubleshooting) section.

:::


The following example demonstrates how to ingest your GitLab projects, their README.md file contents and merge requests to Port.  
You can use the following Port blueprint definitions and integration configuration:

<ProjectBlueprint />

<MergeRequestBlueprint />

<MergeRequestConfig />

#### Project configuration options

The `includeActiveProjects` selector allows you to filter projects based on whether they are active or not.
By default, if not specified, all projects will be synced.

```yaml showLineNumbers
- kind: project
  selector:
    query: 'true'
    # highlight-next-line
    includeActiveProjects: true
```

:::caution Project search filtering effect
If `includeActiveProjects` is specified, only **projects**, **pipelines**, **jobs**, **releases** and **tags** that match the criteria will be synced.
This means, the following kinds will be fetched based on the projects filtered with the search criteria:

- `project`
- `pipeline`
- `job`
- `release`
- `tag`

For more information, see the [troubleshooting](/build-your-software-catalog/sync-data-to-catalog/git/gitlab-v2/installation#troubleshooting) section.

:::

#### Merge request configuration options

<Tabs groupId="config" queryString="parameter">

<TabItem label="States" value="states">

The `states` selector allows you to filter merge requests based on their state. You can specify one or more states to include in the sync.

Allowed values:
- `opened`: Merge requests that are currently open.
- `closed`: Merge requests that have been closed without merging.
- `merged`: Merge requests that have been merged.

By default, if not specified, only `opened` merge requests will be synced.

```yaml
  - kind: merge-request
    selector:
      query: 'true'
      # highlight-next-line
      states:
        - merged
        - opened
```
</TabItem>

<TabItem label="Updated After" value="updatedAfter">

The `updatedAfter` selector allows you to filter merge requests based on when they were last updated. This helps you focus on recent changes and reduce the amount of historical data being synced.

The value represents the number of days to look back for merge requests. For example, setting it to `90` will only sync merge requests that have been updated in the last 90 days.

:::info Important
The `updatedAfter` parameter only affects merge requests that are not in the "opened" state. Open merge requests will always be synced regardless of their last update time.
:::

By default, if not specified, it is set to `90` days.

```yaml
  - kind: merge-request
    selector:
      query: 'true'
      # highlight-next-line
      updatedAfter: 90
```
</TabItem>

<TabItem label="Include Active Groups" value="includeActiveGroups">

The `includeActiveGroups` selector allows you to filter merge based on whether they are active or not.
By default, if not specified, all merge requests for the authorized groups will be synced.

```yaml
  - kind: merge-request
    selector:
      query: 'true'
      # highlight-next-line
      includeActiveGroups: true
```
</TabItem>

</Tabs>

:::tip Learn more
- Refer to the [setup](/build-your-software-catalog/sync-data-to-catalog/git/gitlab-v2/#setup) section to learn more about the integration configuration setup process.
- We leverage [JQ JSON processor](https://stedolan.github.io/jq/manual/) to map and transform GitLab objects to Port entities.
- Click [Here](https://docs.gitlab.com/ee/api/groups.html#list-a-groups-projects) for the GitLab project object structure.
- Click [Here](https://docs.gitlab.com/ee/api/merge_requests.html#list-project-merge-requests) for the GitLab merge request object structure.
:::



### Projects and issues

The following example demonstrates how to ingest your GitLab projects and their issues to Port.  
You can use the following Port blueprint definitions and integration configuration:

<ProjectBlueprint />

<IssueBlueprint />

<IssueConfig />

#### Issues configuration options

<Tabs groupId="config" queryString="parameter">

<TabItem label="State" value="state">

The `state` selector allows you to filter issues based on their state. You can specify one of the allowed values to include in the sync.

Allowed values:
- `opened`: Issues that are currently open.
- `closed`: Issues that have been closed.

By default, if not specified, all issues for the authorized groups will be synced.

```yaml showLineNumbers
- kind: issue
  selector:
    query: 'true'
    # highlight-next-line
    state: "closed"
```
</TabItem>

<TabItem label="Updated After" value="updatedAfter">

The `updatedAfter` selector allows you to filter issues based on when they were last updated. This helps you focus on recent changes and reduce the amount of historical data being synced.

The value represents the number of days to look back for issues. For example, setting it to `90` will only sync issues that have been updated on or after the last 90 days.

:::info Important
The `updatedAfter` parameter only affects issues that are not in the "opened" state. Open issues will always be synced regardless of their last update time.
:::

By default, if not specified, all issues for the authorized groups will be synced.

```yaml showLineNumbers
  - kind: issue
    selector:
      query: 'true'
      # highlight-next-line
      updatedAfter: 90
```
</TabItem>

<TabItem label="Include Active Groups" value="includeActiveGroups">

The `includeActiveGroups` selector allows you to filter issues based on whether they are active or not.
By default, if not specified, all issues for the authorized groups will be synced.

```yaml
  - kind: issue
    selector:
      query: 'true'
      # highlight-next-line
      includeActiveGroups: true
```
</TabItem>

<TabItem label="Issue Type" value="issueType">

The `issueType` selector allows you to filter issues based on their type.

Allowed values:
- `incident`
- `issue`
- `test_case`
- `task`

By default, if not specified, all issues for the authorized groups will be synced.

```yaml
  - kind: issue
    selector:
      query: 'true'
      # highlight-next-line
      issueType: "incident"
```
</TabItem>

<TabItem label="Labels" value="labels">

The `labels` selector allows you to filter issues based on a comma-separated list of labels.
By default, if not specified, all issues for the authorized groups will be synced.

:::info Important
Issue must have **all labels** to be returned.
:::

```yaml
  - kind: issue
    selector:
      query: 'true'
      # highlight-next-line
      labels: "dev,v1"
```
</TabItem>

<TabItem label="Include Non-Archived" value="includeNonArchived">

The `includeNonArchived` selector allows you to filter issues from non-archived projects.
By default, if not specified, all issues for the authorized groups will be synced.


```yaml
  - kind: issue
    selector:
      query: 'true'
      # highlight-next-line
      nonArchived: true
```
</TabItem>

</Tabs>

:::tip Learn more

- Refer to the [setup](/build-your-software-catalog/sync-data-to-catalog/git/gitlab-v2/#setup) section to learn more about the integration configuration setup process.
- We leverage [JQ JSON processor](https://stedolan.github.io/jq/manual/) to map and transform GitLab objects to Port entities.
- Click [Here](https://docs.gitlab.com/ee/api/groups.html#list-a-groups-projects) for the GitLab project object structure.
- Click [Here](https://docs.gitlab.com/ee/api/issues.html) for the GitLab issue object structure.
:::



### Files and file contents

Below are two examples for mapping files and contents:

The following example shows how to ingest dependencies from a `package.json` file in your GitLab repository into Port.  
You can use the following Port blueprint definitions and integration configuration:

<PackageBlueprint />

<PackageConfig />

The example will parse the `package.json` file in your repository and extract the dependencies into Port entities.  

___

The following example shows how to ingest teams from a YAML file in your GitLab repository into Port.  

<TeamBlueprint/>

<TeamsYamlFileExample/>

<YamlConfig/>

The example will parse the YAML file in your repository and extract the teams into Port entities. 

For more information about ingesting files and file contents, click [here](/build-your-software-catalog/sync-data-to-catalog/git/gitlab-v2/#ingest-files-from-your-repositories).

### Projects and monorepos

The following example demonstrates how to ingest your GitLab projects and their monorepo folders to Port.  
You can use the following Port blueprint definitions and integration configuration:

<ProjectBlueprint />

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



### Projects and folders

The following example demonstrates how to ingest your GitLab projects and their folders to Port.  
You can use the following Port blueprint definitions and integration configuration:

<ProjectBlueprint />

<FolderBlueprint />

<FolderConfig />

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

### Mapping members and group with members

#### Prerequisites

- When using **GitLab Self Hosted**, an admin token is required, rather than a group access token, to retrieve the `primary email addresses` of members.
- When using **GitLab Enterprise**, accounts can retrieve the `primary email addresses` of members within their groups, provided the members are part of user accounts administered by an organization with [verified domains for groups](https://docs.gitlab.com/ee/user/enterprise_user/#verified-domains-for-groups). For more information, see [limitations](https://docs.gitlab.com/ee/api/members.html#limitations).

:::caution GitLab free plan limitation
Primary email addresses are not available for GitLab "Free plan" users.
:::

#### Mapping members

The following example demonstrates how to ingest your GitLab members to Port.  
You can use the following Port blueprint definitions and integration configuration:

<MemberBlueprint />

<MemberConfig />

To retrieve the members of your **active groups** only, you can use the following syntax in your `port-app-config.yml`:

```yaml showLineNumbers
- kind: member
  selector:
    query: "true"
    # highlight-next-line
    includeActiveGroups: true
```

#### Mapping groups with members

The following example demonstrates how to ingest your GitLab groups and their members to Port.  
You can use the following Port blueprint definitions and integration configuration:

<GroupMembersBlueprint />

<GroupMembersConfig />

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

<TabItem label="Include Inherited and Invited Members" value="includeInheritedMembers">

You can also specify the `includeInheritedMembers` selector to control the inclusion of inherited and invited members in the member data.
By default, this parameter is set to `false`, and the integration will sync only direct members without inherited members and/or invited members.

```yaml
  - kind: group-with-members
    selector:
      query: 'true'
      # highlight-next-line
      includeInheritedMembers: true
```

```yaml
  - kind: members
    selector:
      query: 'true'
      # highlight-next-line
      includeInheritedMembers: true
```

</TabItem>

</Tabs>

:::tip Learn more

- Refer to the [setup](/build-your-software-catalog/sync-data-to-catalog/git/gitlab-v2/#setup) section to learn more about the integration configuration setup process.
- We leverage [JQ JSON processor](https://stedolan.github.io/jq/manual/) to map and transform GitLab objects to Port entities.
- Click [Here](https://docs.gitlab.com/ee/api/members.html#list-all-members-of-a-group-or-project) for the GitLab project or group member object structure.

:::


### Projects, pipelines and jobs

The following example demonstrates how to ingest your GitLab projects, their pipelines and jobs runs to Port.  
You can use the following Port blueprint definitions and integration configuration:

<PipelineBlueprint />

<JobBlueprint />

<PipelineJobConfig />

To retrieve the pipelines of your **active projects** only, you can use the following syntax in your `port-app-config.yml`:

```yaml showLineNumbers
- kind: pipeline
  selector:
    query: "true"
    # highlight-next-line
    includeActiveProjects: true
```

To retrieve the jobs of your **active projects** only, you can use the following syntax in your `port-app-config.yml`:

```yaml showLineNumbers
- kind: job
  selector:
    query: "true"
    # highlight-next-line
    includeActiveProjects: true
```

:::tip Learn more

- Refer to the [setup](/build-your-software-catalog/sync-data-to-catalog/git/gitlab-v2/#setup) section to learn more about the integration configuration setup process.
- We leverage [JQ JSON processor](https://stedolan.github.io/jq/manual/) to map and transform GitLab objects to Port entities.
- Click [Here](https://docs.gitlab.com/api/projects/#list-projects) for the GitLab project object structure.
- Click [Here](https://docs.gitlab.com/ee/api/pipelines.html#list-project-pipelines) for the GitLab pipeline object structure.
- Click [Here](https://docs.gitlab.com/ee/api/jobs.html#list-project-jobs) for the GitLab job object structure.

:::

### Releases

The following example demonstrates how to ingest your GitLab releases to Port.  
You can use the following Port blueprint definitions and integration configuration:

<ReleaseBlueprint />

<ReleaseConfig />

To retrieve the releases of your **active projects** only, you can use the following syntax in your `port-app-config.yml`:

```yaml showLineNumbers
- kind: release
  selector:
    query: "true"
    # highlight-next-line
    includeActiveProjects: true
```

:::tip Learn more

- Refer to the [setup](/build-your-software-catalog/sync-data-to-catalog/git/gitlab-v2/#setup) section to learn more about the integration configuration setup process.
- We leverage [JQ JSON processor](https://stedolan.github.io/jq/manual/) to map and transform GitLab objects to Port entities.
- Click [Here](https://docs.gitlab.com/api/releases/) for the GitLab release object structure.

:::

### Tags

The following example demonstrates how to ingest your GitLab tags to Port.  
You can use the following Port blueprint definitions and integration configuration:

<TagBlueprint />

<TagConfig />

To retrieve the tags of your **active projects** only, you can use the following syntax in your `port-app-config.yml`:

```yaml showLineNumbers
- kind: tag
  selector:
    query: "true"
    # highlight-next-line
    includeActiveProjects: true
```

:::tip Learn more

- Refer to the [setup](/build-your-software-catalog/sync-data-to-catalog/git/gitlab-v2/#setup) section to learn more about the integration configuration setup process.
- We leverage [JQ JSON processor](https://stedolan.github.io/jq/manual/) to map and transform GitLab objects to Port entities.
- Click [Here](https://docs.gitlab.com/api/tags/) for the GitLab tag object structure.

:::

