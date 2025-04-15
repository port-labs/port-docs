---
sidebar_position: 2
---

# Examples

In this section, we'll walk through examples to ingest your GitLab **groups**, **projects**, **issues**, and **merge requests** into Port. 

Each example includes a blueprint definition and a matching `port-app-config.yml` configuration to map GitLab objects to Port entities.

import GroupBlueprint from './example-groups/_gitlab_integration_example_group_blueprint.mdx'
import GroupConfig from './example-groups/_gitlab_integration_example_group_config.mdx'
import ProjectBlueprint from './example-projects/_gitlab_integration_example_project_blueprint.mdx'
import ProjectConfig from './example-projects/_gitlab_integration_example_project_config.mdx'
import IssueBlueprint from './example-issues/_gitlab_integration_example_issue_blueprint.mdx'
import IssueConfig from './example-issues/_gitlab_integration_example_issue_config.mdx'
import MergeRequestBlueprint from './example-merge-requests/_gitlab_integration_example_merge_request_blueprint.mdx'
import MergeRequestConfig from './example-merge-requests/_gitlab_integration_example_merge_request_config.mdx'

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
