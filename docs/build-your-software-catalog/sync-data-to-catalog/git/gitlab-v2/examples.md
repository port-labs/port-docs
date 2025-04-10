---
sidebar_position: 2
---

# Examples

In this section, we'll walk through examples to ingest your GitLab **groups**, **projects**, **issues**, **merge requests**, **files**, and **folders** into Port. 

Each example includes a blueprint definition and a matching `port-app-config.yml` configuration to map GitLab objects to Port entities.

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
Refer to the GitLab group API for the full object structure and available fields.
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
Check the GitLab project API for the full object structure and available fields.
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
Explore the GitLab issue API for the full object structure and available fields.
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
See the GitLab merge request API for the full object structure and available fields.
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

The example above will:
- Map root-level folders from your repositories
- Create folder entities with URLs and README content
- Support different folder paths per repository
