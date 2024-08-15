import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import GitlabResources from './\_gitlab_exporter_supported_resources.mdx'

# GitLab

Port's GitLab integration allows you to export GitLab objects to Port as entities of existing blueprints. The integration supports real-time event processing so Port always provides an accurate real-time representation of your GitLab resources.

## 💡 GitLab integration common use cases

Our GitLab integration makes it easy to fill the software catalog with data directly from your GitLab organization, for example:

- Map all of the resources in your GitLab organization, including **groups**, **projects**, **monorepos**, **merge requests**, **issues**, **pipelines** and other GitLab objects.
- Watch for GitLab object changes (create/update/delete) in real-time, and automatically apply the changes to your entities in Port.
- Manage Port entities using GitOps.

## Installation

To install Port's GitLab integration, follow the [installation](./installation.md) guide.

## Ingesting Git objects

By using Port's GitLab integration, you can automatically ingest GitLab resources into Port based on real-time events.

Port's GitLab integration allows you to ingest a variety of objects resources provided by the GitLab API, including groups, projects, merge requests, pipelines and more. The GitLab integration allows you to perform extract, transform, load (ETL) on data from the GitLab API into the desired software catalog data model.

The GitLab integration uses a YAML configuration to describe the ETL process to load data into the developer portal. The approach reflects a golden middle between an overly opinionated Git visualization that might not work for everyone and a too-broad approach that could introduce unneeded complexity into the developer portal.

Here is an example snippet from the config which demonstrates the ETL process for getting `merge-request` data from GitLab and into the software catalog:

```yaml showLineNumbers
resources:
  # Extract
  # highlight-start
  - kind: merge-request
    selector:
      query: "true" # JQ boolean query. If evaluated to false - skip syncing the object.
    # highlight-end
    port:
      entity:
        mappings:
          # Transform & Load
          # highlight-start
          identifier: .id | tostring
          title: .title
          blueprint: '"gitlabMergeRequest"'
          properties:
            creator: .author.name
            status: .state
            createdAt: .created_at
            updatedAt: .updated_at
            link: .web_url
        # highlight-end
```

The integration makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from GitLab's API events.

### The integration configuration

The integration configuration is how you specify the exact resources you want to query from your GitLab, and also how you specify which entities and which properties you want to fill with data from GitLab.

Here is an example for the integration configuration block:

```yaml showLineNumbers
resources:
  - kind: project
    selector:
      query: "true" # JQ boolean query. If evaluated to false - skip syncing the object.
    port:
      entity:
        mappings:
          identifier: .namespace.full_path | gsub("/";"-") # The Entity identifier will be the repository name.
          title: .name
          blueprint: '"service"'
          properties:
            url: .web_link
            description: .description
            namespace: .namespace.name
            fullPath: .namespace.full_path | split("/") | .[:-1] | join("/")
            defaultBranch: .default_branch
```

### Integration configuration structure

- The root key of the integration configuration is the `resources` key:

  ```yaml showLineNumbers
  # highlight-next-line
  resources:
    - kind: project
      selector:
      ...
  ```

- The `kind` key is a specifier for an object from the GitLab API:

  ```yaml showLineNumbers
    resources:
      # highlight-next-line
      - kind: project
        selector:
        ...
  ```

  <GitlabResources/>

#### Filtering unwanted objects

The `selector` and the `query` keys let you filter exactly which objects from the specified `kind` will be ingested to the software catalog

```yaml showLineNumbers
resources:
  - kind: project
    # highlight-start
    selector:
      query: "true" # JQ boolean query. If evaluated to false - skip syncing the object.
    # highlight-end
    port:
```

For example, to ingest only repositories that have a name starting with `"service"`, use the `query` key like this:

```yaml showLineNumbers
query: .name | startswith("service")
```

<br/>

The `port`, `entity` and the `mappings` keys open the section used to map the GitLab API object fields to Port entities. To create multiple mappings of the same kind, you can add another item to the `resources` array;

```yaml showLineNumbers
resources:
  - kind: project
    selector:
      query: "true"
    port:
      # highlight-start
      entity:
        mappings: # Mappings between one GitLab API object to a Port entity. Each value is a JQ query.
          identifier: .namespace.full_path | gsub("/";"-")
          title: .name
          blueprint: '"service"'
          properties:
            url: .web_link
            description: .description
            namespace: .namespace.name
            fullPath: .namespace.full_path | split("/") | .[:-1] | join("/")
            defaultBranch: .default_branch
      # highlight-end
  - kind: project # In this instance project is mapped again with a different filter
    selector:
      query: '.name == "MyRepositoryName"'
    port:
      entity:
        mappings: ...
```

:::tip
Pay attention to the value of the `blueprint` key, if you want to use a hardcoded string, you need to encapsulate it in 2 sets of quotes, for example use a pair of single-quotes (`'`) and then another pair of double-quotes (`"`)
:::

### Ingest files from your repositories

Port allows you to fetch `JSON` and `YAML` files from your repositories, and create entities from them in your software catalog.  
This is done using the `file` kind in your GitLab mapping configuration.

For example, say you want to manage your `package.json` files in Port. One option is to create a `manifest` blueprint, with each of its entities representing a `package.json` file.

The following configuration fetches all `package.json` files from "MyRepo" and "MyOtherRepo", and creates an entity for each of them, based on the `manifest` blueprint:

```yaml showLineNumbers
resources:
  - kind: file
    selector:
      query: 'true'
      files:
        # Note that glob patterns are supported, so you can use wildcards to match multiple files
        path: '**/package.json'
        # The `repos` key can be used to filter the repositories from which the files will be fetched. 
        # Remove the `repos` key if you want to fetch files from all repository
        repos:
          - "MyRepoName"
          - "MyOtherRepoName"
    port:
      entity:
        mappings:
          identifier: .file.file_path
          title: .file.file_name
          blueprint: '"manifest"'
          properties:
            project_name: .file.content.name
            project_version: .file.content.version
            license: .file.content.license
```

:::tip Test your mapping
After adding the `file` kind to your mapping configuration, click on the `Resync` button. When you open the mapping configuration again, you will see real examples of files fetched from your GitLab organization.  

This will help you see what data is available to use in your `jq` expressions.   
Click on the `Test mapping` button to test your mapping against the example data.

In any case, the structure of the available data looks like this:
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

In some cases, we would like to parse a single JSON/YAML file and create multiple entities from it.  
For this purpose, we can use the `itemsToParse` key in our mapping configuration.

For example, say you want to track/manage a project's dependencies in Port. One option is to create a `package` blueprint, with each of its entities representing a dependency from a `package.json` file.

The following configuration fetches a `package.json` file from a specific repository, and creates an entity for each of the dependencies in the file, based on the `package` blueprint:

```yaml showLineNumbers
resources:
  - kind: file
    selector:
      query: 'true'
      files:
        path: '**/package.json'
        # Note that in this case we are fetching from a specific repository
        repos:
          - MyRepoName
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

The `itemsToParse` key is used to specify the path to the array of items you want to parse from the file. In this case, we are parsing the `dependencies` array from the `package.json` file.  
Once the array is parsed, we can use the `item` key to refer to each item in the array.

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
- Only JSON and YAML formats are automatically parsed. Other file formats can be ingested as raw files.
- GLOB patterns are supported for file pattern matching, but wildcards at the end (e.g., `**/*`) are not allowed, in order to prevent matching all files indiscriminately.
- Currently only the default branch of the repository is supported.


## Permissions

Port's GitLab integration requires a group access token with the `api` scope.

To create a group access token, follow the instructions in the [installation](./installation.md#creating-a-gitlab-group-access-token) guide

## Examples

Refer to the [examples](./examples.md) page for practical configurations and their corresponding blueprint definitions.

## GitOps

Port's GitLab integration also provides GitOps capabilities, refer to the [GitOps](./gitops/gitops.md) page to learn more.

## Advanced

Refer to the [advanced](./advanced.md) page for advanced use cases and examples.
