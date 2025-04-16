---
sidebar_position: 2
---

import GroupBlueprint from './example-groups/_gitlab_integration_example_group_blueprint.mdx'
import GroupConfig from './example-groups/_gitlab_integration_example_group_config.mdx'
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
import MemberBlueprint from './example-members/_gitlab_integration_example_member_blueprint.mdx'
import MemberConfig from './example-members/_gitlab_integration_example_member_config.mdx'
import GroupMembersBlueprint from './example-groups/_gitlab_integration_example_group_members_blueprint.mdx'
import GroupMembersConfig from './example-groups/_gitlab_integration_example_group_members_config.mdx'
import PipelineBlueprint from './example-pipelines/_gitlab_integration_example_pipeline_blueprint.mdx'
import JobBlueprint from './example-jobs/_gitlab_integration_example_job_blueprint.mdx'
import PipelineJobConfig from './example-pipelines/_gitlab_integration_example_pipeline_job_config.mdx'

# Examples

This section includes examples for ingesting the following GitLab resources into Port:

- **Groups**
- **Projects**
- **Issues**
- **Merge requests**
- **Files**
- **Folders**
- **Members**
- **Pipelines**
- **Jobs**

Each example contains:

- A blueprint definition  
- A matching `port-app-config.yml` file  

These examples show how to map GitLab objects to Port entities and can be used as a foundation to customize your own configuration.

---

## Mapping GitLab groups

Let's map your GitLab groups to Port entities, including details like group name and description.

<details>
<summary>Group blueprint</summary>
<GroupBlueprint />
</details>

<details>
<summary>Group configuration</summary>
<GroupConfig />
</details>

:::tip GitLab group structure
See the [GitLab groups API](https://docs.gitlab.com/ee/api/groups.html) for the full object structure and available fields.
:::

---

## Mapping GitLab projects

Next, we'll ingest GitLab projects into Port, capturing details like project name, description, and README.

<details>
<summary>Project blueprint</summary>
<ProjectBlueprint />
</details>

<details>
<summary>Project configuration</summary>
<ProjectConfig />
</details>

:::tip GitLab project structure
See the [GitLab projects API](https://docs.gitlab.com/ee/api/projects.html) for the full object structure and available fields.
:::

---

## Mapping GitLab issues

Now, let's bring GitLab issues into Port, including details like title, state, and labels.

<details>
<summary>Issue blueprint</summary>
<IssueBlueprint />
</details>

<details>
<summary>Issue configuration</summary>
<IssueConfig />
</details>

:::tip GitLab issue structure
See the [GitLab issues API](https://docs.gitlab.com/ee/api/issues.html) for the full object structure and available fields.
:::

---

## Mapping GitLab merge requests

Finally, we'll ingest GitLab merge requests (MRs) into Port, with details like title, state, and source branch.

<details>
<summary>Merge request blueprint</summary>
<MergeRequestBlueprint />
</details>

<details>
<summary>Merge request configuration</summary>
<MergeRequestConfig />
</details>

:::tip GitLab merge request structure
See the [GitLab merge requests API](https://docs.gitlab.com/ee/api/merge_requests.html) for the full object structure and available fields.
:::

---

## Mapping GitLab files and contents

Let's explore how to ingest file contents from your GitLab repositories, specifically focusing on extracting dependencies from `package.json` files.

<details>
<summary>Package blueprint</summary>
<PackageBlueprint />
</details>

<details>
<summary>Package configuration</summary>
<PackageConfig />
</details>

:::tip GitLab file structure
For more details about available fields and structure, see the [GitLab repository files API](https://docs.gitlab.com/ee/api/repository_files.html).
:::

This example will:
- Look for `package.json` files in your repositories
- Extract package dependencies and their versions
- Create entities in Port representing each package

---

## Mapping GitLab monorepo folders

Let's see how to map folders from monorepo-style repositories, allowing you to track different components within the same repository.

<details>
<summary>Folder blueprint</summary>
<FolderBlueprint />
</details>

<details>
<summary>Folder configuration</summary>
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

## Mapping GitLab members

Let's explore how to map GitLab members into Port, including their profile details and account information.

<details>
<summary>Member blueprint</summary>
<MemberBlueprint />
</details>

<details>
<summary>Member configuration</summary>
<MemberConfig />
</details>

:::tip GitLab member structure
See the [GitLab members API](https://docs.gitlab.com/ee/api/members.html) for the full object structure and available fields.
:::

---

## Mapping GitLab groups with members

Now, let's see how to map GitLab groups along with their member relationships.

<details>
<summary>Group with members blueprint</summary>
<GroupMembersBlueprint />
</details>

<details>
<summary>Group with members configuration</summary>
<GroupMembersConfig />
</details>

:::tip GitLab group membership
See the [GitLab group members API](https://docs.gitlab.com/ee/api/members.html#list-all-members-of-a-group-or-project) for details about group membership structure.
:::

---

## Mapping GitLab pipelines and jobs

Let's explore how to map your CI/CD pipelines and jobs into Port, including their execution details and relationships.

<details>
<summary>Pipeline blueprint</summary>
<PipelineBlueprint />
</details>

<details>
<summary>Job blueprint</summary>
<JobBlueprint />
</details>

<details>
<summary>Pipeline and job configuration</summary>
<PipelineJobConfig />
</details>

:::tip GitLab CI/CD structure
See the [GitLab pipelines API](https://docs.gitlab.com/ee/api/pipelines.html) and [jobs API](https://docs.gitlab.com/ee/api/jobs.html) for the full object structure and available fields.
:::

---
