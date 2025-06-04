import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

import GitLabResources from './_gitlab_integration_supported_resources.mdx'

# GitLab v2

:::info GitLab v2 documentation
This page documents the latest GitLab integration, released in April 2025.  
For documentation of the previous integration, check out the [GitLab](/build-your-software-catalog/sync-data-to-catalog/git/gitlab/) page.  
:::

Port's GitLab-v2 integration allows you to model GitLab resources in your software catalog and ingest data into them.

## Overview

This integration allows you to:

- Map and organize your GitLab resources and their metadata in Port (see supported resources below).
- Track merge requests, issues, and project metrics.
- Manage Port entities using GitOps.

### Supported resources

The resources that can be ingested from GitLab into Port are listed below.  
It is possible to reference any field that appears in the API responses linked below in the mapping configuration.

<GitLabResources/>

## Setup

To install Port's GitLab integration, see the [installation](./installation.md#setup) page.

## Configuration

Port integrations use a [YAML mapping block](/build-your-software-catalog/customize-integrations/configure-mapping#configuration-structure) to ingest data from the third-party API into Port.

The mapping makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from the integration API.

### Default mapping configuration

This is the default mapping configuration for this integration:

<details>
<summary><b>Default mapping configuration (Click to expand)</b></summary>

```yaml showLineNumbers
deleteDependentEntities: true
createMissingRelatedEntities: true
resources:
- kind: project
  selector:
    query: 'true'
    includeLanguages: 'true'
  port:
    entity:
      mappings:
        identifier: .path_with_namespace | gsub(" "; "")
        title: .name
        blueprint: '"service"'
        properties:
          url: .web_url
          readme: file://README.md
          language: .__languages | to_entries | max_by(.value) | .key
- kind: member
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .username
        title: .name
        blueprint: '"gitlabMember"'
        properties:
          url: .web_url
          state: .state
          email: .email
          locked: .locked
- kind: group-with-members
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .full_path
        title: .name
        blueprint: '"gitlabGroup"'
        properties:
          url: .web_url
          visibility: .visibility
          description: .description
        relations:
          gitlabMembers: .__members | map(.username)
- kind: merge-request
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .id | tostring
        title: .title
        blueprint: '"gitlabMergeRequest"'
        properties:
          creator: .author.name
          status: .state
          createdAt: .created_at
          updatedAt: .updated_at
          mergedAt: .merged_at
          link: .web_url
          leadTimeHours: (.created_at as $createdAt | .merged_at as $mergedAt | ($createdAt | sub("\\..*Z$"; "Z") | strptime("%Y-%m-%dT%H:%M:%SZ") | mktime) as $createdTimestamp | ($mergedAt | if . == null then null else sub("\\..*Z$"; "Z") | strptime("%Y-%m-%dT%H:%M:%SZ") | mktime end) as $mergedTimestamp | if $mergedTimestamp == null then null else (((($mergedTimestamp - $createdTimestamp) / 3600) * 100 | floor) / 100) end)
          reviewers: .reviewers | map(.name)
        relations:
          project: .references.full | gsub("!.+"; "")
```

</details>



## Capabilities

### Ingest files from your repositories

Port allows you to fetch `JSON` and `YAML` files from your repositories, and create entities from them in your software catalog.    
This is done using the `file` kind in your GitLab mapping configuration.

For example, say you want to manage your `package.json` files in Port.  
You will need to create a `manifest` blueprint, with each of its entities representing a `package.json` file.

The following configuration fetches all `package.json` files from `my-project` and `my-other-project`, and creates an entity for each of them, based on the `manifest` blueprint:

```yaml showLineNumbers
resources:
  - kind: file
    selector:
      query: 'true'
      files:
        path: '**/package.json'
        repos:
          # Replace with your repository's path_with_namespace (e.g., "group/project" or "group/subgroup/project")
          - group/my-project
          - group/my-other-project

```

The `file` kind follows [GitLab's Advanced Search type](https://docs.gitlab.com/ee/user/search/advanced_search.html#:~:text=Advanced%20search%20is%20based%20on,Projects/), adhering to its syntax, limitations, and capabilities.

:::tip Test your mapping
After adding the `file` kind to your mapping configuration, click on the `Resync` button.  
When you open the mapping configuration again, you will see real examples of files fetched from your GitLab organization.

This will help you see what data is available to use in your `jq` expressions.  
Click on the `Test mapping` button to test your mapping against the example data.

The structure of the available data is as follows:
<details>
<summary><b>Available data example (click to expand)</b></summary>

```json showLineNumbers
{
  "file": {
    "file_name": "package.json",
    "file_path": "package.json",
    "size": 780,
    "encoding": "base64",
    "content_sha256": "d4dffc856dcacdaecb283ba9e47288beb6036d7c4ffff7c65f29057d890ecee9",
    "ref": "main",
    "blob_id": "7f8c2fea237a5cf0e1bcc17135c7c8b9e96edd49",
    "commit_id": "3ac75a99f6faa8ce4570368e6db1038c15f17cfc",
    "last_commit_id": "3ac75a99f6faa8ce4570368e6db1038c15f17cfc",
    "execute_filemode": false,
    "content": {
      "name": "my-awesome-project",
      "version": "1.0.0",
      "description": "A sample Node.js project",
      "main": "index.js",
      "scripts": {
        "start": "node index.js",
        "test": "echo \"Error: no test specified\" && exit 1",
        "build": "echo \"Building the project...\"",
        "lint": "eslint ."
      },
      "repository": {
        "type": "git",
        "url": "git+https://github.com/username/my-awesome-project.git"
      },
      "keywords": [
        "sample",
        "nodejs",
        "project"
      ],
      "author": "Your Name",
      "license": "ISC",
      "bugs": {
        "url": "https://github.com/username/my-awesome-project/issues"
      },
      "homepage": "https://github.com/username/my-awesome-project#readme",
      "dependencies": {
        "@docsly/react": "^1.9.1",
        "@docusaurus/core": "^3.4.0",
        "@docusaurus/plugin-client-redirects": "^3.4.0",
        "@docusaurus/plugin-google-tag-manager": "^3.4.0",
        "@docusaurus/plugin-ideal-image": "^3.4.0",
        "@docusaurus/preset-classic": "^3.4.0",
        "@docusaurus/theme-live-codeblock": "^3.4.0",
        "@easyops-cn/docusaurus-search-local": "^0.44.2",
        "@mdx-js/react": "^3.0.1",
        "@port-labs/docusaurus-plugin-openapi-docs": "^0.0.5",
        "@port-labs/docusaurus-theme-openapi-docs": "^0.0.5",
        "@stackql/docusaurus-plugin-hubspot": "^1.0.1",
        "clsx": "^2.1.1",
        "docusaurus-plugin-hotjar": "^0.0.2",
        "docusaurus-plugin-image-zoom": "^2.0.0",
        "prettier": "^3.3.2",
        "prism-react-renderer": "^2.3.1",
        "react": "^18.3.1",
        "react-dom": "^18.3.1",
        "react-tooltip": "^5.27.1"
      },
      "devDependencies": {
        "@docusaurus/module-type-aliases": "^3.4.0",
        "@docusaurus/tsconfig": "^3.4.0",
        "@docusaurus/types": "^3.4.0",
        "husky": "^9.0.11",
        "pretty-quick": "^4.0.0",
        "typescript": "~5.5.3"
      }
    }
  },
  "repo": {
    "id": 60625101,
    "description": null,
    "name": "pages-test-project",
    "name_with_namespace": "port-labs / pages-test-project",
    "path": "pages-test-project",
    "path_with_namespace": "port-org/pages-test-project",
    "created_at": "2024-08-06T10:31:47.509Z",
    "default_branch": "main",
    "tag_list": [],
    "topics": [],
    "ssh_url_to_repo": "git@gitlab.com:port-org/pages-test-project.git",
    "http_url_to_repo": "https://gitlab.com/port-org/pages-test-project.git",
    "web_url": "https://gitlab.com/port-org/pages-test-project",
    "readme_url": "https://gitlab.com/port-org/pages-test-project/-/blob/main/README.md",
    "forks_count": 0,
    "avatar_url": null,
    "star_count": 0,
    "last_activity_at": "2024-08-14T15:40:56.606Z",
    "namespace": {
      "id": 66136652,
      "name": "port-labs",
      "path": "port-org",
      "kind": "group",
      "full_path": "port-org",
      "parent_id": null,
      "avatar_url": null,
      "web_url": "https://gitlab.com/groups/port-org"
    },
    "container_registry_image_prefix": "registry.gitlab.com/port-org/pages-test-project",
    "_links": {
      "self": "https://gitlab.com/api/v4/projects/60625101",
      "issues": "https://gitlab.com/api/v4/projects/60625101/issues",
      "merge_requests": "https://gitlab.com/api/v4/projects/60625101/merge_requests",
      "repo_branches": "https://gitlab.com/api/v4/projects/60625101/repository/branches",
      "labels": "https://gitlab.com/api/v4/projects/60625101/labels",
      "events": "https://gitlab.com/api/v4/projects/60625101/events",
      "members": "https://gitlab.com/api/v4/projects/60625101/members",
      "cluster_agents": "https://gitlab.com/api/v4/projects/60625101/cluster_agents"
    },
    "packages_enabled": true,
    "empty_repo": false,
    "archived": false,
    "visibility": "private",
    "resolve_outdated_diff_discussions": false,
    "container_expiration_policy": {
      "cadence": "1d",
      "enabled": false,
      "keep_n": 10,
      "older_than": "90d",
      "name_regex": ".*",
      "name_regex_keep": null,
      "next_run_at": "2024-08-07T10:31:47.544Z"
    },
    "repository_object_format": "sha1",
    "issues_enabled": true,
    "merge_requests_enabled": true,
    "wiki_enabled": true,
    "jobs_enabled": true,
    "snippets_enabled": true,
    "container_registry_enabled": true,
    "service_desk_enabled": true,
    "service_desk_address": "contact-project-pages-test-project-60625101-issue-@incoming.gitlab.com",
    "can_create_merge_request_in": true,
    "issues_access_level": "enabled",
    "repository_access_level": "enabled",
    "merge_requests_access_level": "enabled",
    "forking_access_level": "enabled",
    "wiki_access_level": "enabled",
    "builds_access_level": "enabled",
    "snippets_access_level": "enabled",
    "pages_access_level": "private",
    "analytics_access_level": "enabled",
    "container_registry_access_level": "enabled",
    "security_and_compliance_access_level": "private",
    "releases_access_level": "enabled",
    "environments_access_level": "enabled",
    "feature_flags_access_level": "enabled",
    "infrastructure_access_level": "enabled",
    "monitor_access_level": "enabled",
    "model_experiments_access_level": "enabled",
    "model_registry_access_level": "enabled",
    "emails_disabled": false,
    "emails_enabled": true,
    "shared_runners_enabled": true,
    "lfs_enabled": true,
    "creator_id": 6152768,
    "import_url": null,
    "import_type": null,
    "import_status": "none",
    "open_issues_count": 0,
    "description_html": "",
    "updated_at": "2024-08-14T15:40:56.606Z",
    "ci_default_git_depth": 20,
    "ci_forward_deployment_enabled": true,
    "ci_forward_deployment_rollback_allowed": true,
    "ci_job_token_scope_enabled": false,
    "ci_separated_caches": true,
    "ci_allow_fork_pipelines_to_run_in_parent_project": true,
    "ci_id_token_sub_claim_components": [
      "project_path",
      "ref_type",
      "ref"
    ],
    "build_git_strategy": "fetch",
    "keep_latest_artifact": true,
    "restrict_user_defined_variables": false,
    "ci_pipeline_variables_minimum_override_role": "maintainer",
    "runners_token": null,
    "runner_token_expiration_interval": null,
    "group_runners_enabled": true,
    "auto_cancel_pending_pipelines": "enabled",
    "build_timeout": 3600,
    "auto_devops_enabled": false,
    "auto_devops_deploy_strategy": "continuous",
    "ci_push_repository_for_job_token_allowed": false,
    "ci_config_path": "",
    "public_jobs": true,
    "shared_with_groups": [],
    "only_allow_merge_if_pipeline_succeeds": false,
    "allow_merge_on_skipped_pipeline": null,
    "request_access_enabled": true,
    "only_allow_merge_if_all_discussions_are_resolved": false,
    "remove_source_branch_after_merge": true,
    "printing_merge_request_link_enabled": true,
    "merge_method": "merge",
    "squash_option": "default_off",
    "enforce_auth_checks_on_uploads": true,
    "suggestion_commit_message": null,
    "merge_commit_template": null,
    "squash_commit_template": null,
    "issue_branch_template": null,
    "warn_about_potentially_unwanted_characters": true,
    "autoclose_referenced_issues": true,
    "approvals_before_merge": 0,
    "mirror": false,
    "external_authorization_classification_label": "",
    "marked_for_deletion_at": null,
    "marked_for_deletion_on": null,
    "requirements_enabled": true,
    "requirements_access_level": "enabled",
    "security_and_compliance_enabled": true,
    "pre_receive_secret_detection_enabled": false,
    "compliance_frameworks": [],
    "issues_template": null,
    "merge_requests_template": null,
    "ci_restrict_pipeline_cancellation_role": "developer",
    "merge_pipelines_enabled": false,
    "merge_trains_enabled": false,
    "merge_trains_skip_train_allowed": false,
    "only_allow_merge_if_all_status_checks_passed": false,
    "allow_pipeline_trigger_approve_deployment": false,
    "prevent_merge_without_jira_issue": false,
    "permissions": {
      "project_access": null,
      "group_access": {
        "access_level": 50,
        "notification_level": 3
      }
    }
  }
}
```
</details>
:::

#### Create multiple entities from a single file

In some cases, we want to parse a single JSON or YAML file and create multiple entities from it.  
To do this, we can use the `itemsToParse` key in our mapping configuration.

For example, let's say we want to track or manage a project's dependencies in Port.  
We’ll need to create a `package` blueprint, with each entity representing a dependency from a `package.json` file.

The following configuration fetches a `package.json` file from a specific repository and creates an entity for each dependency in the file, based on the `package` blueprint:

```yaml showLineNumbers
resources:
  - kind: file
    selector:
      query: 'true'
      files:
        path: '**/package.json'
        # Note that in this case we are fetching from a specific repository
        repos:
          - group/my-project
    port:
      itemsToParse: .file.content.dependencies | to_entries
      entity:
        mappings:
          # Since identifier cannot contain special characters, we are using jq to remove them
          identifier: >-
            .item.key + "_" + if (.item.value | startswith("^")) then
            .item.value[1:] else .item.value end
          title: .item.key + "@" + .item.value
          blueprint: '"package"'
          properties:
            package: .item.key
            version: .item.value
          relations: {}
```

The `itemsToParse` key is used to specify the path to the array of items you want to parse from the file.  
In this case, we are parsing the `dependencies` object from the `package.json` file.

Once the object is parsed, we can use the `item` key to refer to each key-value pair within it — where the key is the dependency name, and the value is the version.

This allows us to create an entity for each dependency dynamically.


#### Multi-document YAML files

For multi-document YAML files (a single file containing multiple YAML documents separated by `---`), `.file.content` will not resolve to an object, but to an array of objects.

You can use one of these methods to ingest multi-document YAML files:

1. Use the `itemsToParse` key to create multiple entities from such a file (see example above).
2. Map the result to an `array` property.

:::tip Mixed YAML types
If you have both single-document and multi-document YAML files in your repositories, you can use the `itemsToParse` key like this to handle both cases:

```yaml
itemsToParse: .file.content | if type== "object" then [.] else . end
```
:::

#### Limitations

- Currently only files up to 1MB in size are supported.
- Only JSON and YAML formats are automatically parsed.  
  Other file formats can be ingested as raw files, however, some special characters in the file (such as `\n`) may be processed and not preserved.
- Currently only the default branch of the repository is supported.

For a list of known limitations with GitLab’s Advanced Search, see GitLab's [Advanced Search documentation](https://docs.gitlab.com/ee/user/search/advanced_search.html#known-issues).

## Examples

Refer to the [examples](./examples.md) page for practical configurations and their corresponding blueprint definitions.

## GitOps

Port's GitLab integration also provides GitOps capabilities, refer to the [GitOps](./gitops/gitops.md) page to learn more.

## Relevant Guides

For relevant guides and examples, see the [guides section](https://docs.port.io/guides?tags=GitLab).


