import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import GitHubResources from './\_github_exporter_supported_resources.mdx'

# GitHub

Port's GitHub integration allows you to model GitHub resources in your software catalog and ingest data into them.


## Overview

This integration allows you to:


- Map and organize your desired GitHub resources and their metadata in Port (see supported resources below).
- Watch for GitHub object changes (create/update/delete) in real-time, and automatically apply the changes to your software catalog.
- Manage Port entities using GitOps.
- Trigger GitHub workflows directly from Port.


### Supported resources

The resources that can be ingested from GitHub into Port are listed below.
It is possible to reference any field that appears in the API responses linked below in the mapping configuration.

 <GitHubResources/>


## Setup

To install Port's GitHub app, follow these steps:

1. Go to the [GitHub App page](https://github.com/apps/getport-io).

2. Click on the `Configure` button.

3. Choose the organization in which to install the app.

4. Within the selected organization, choose the repositories in which to install the app.


5. Click on the `Install` button.

6. Once the installation has finished, you will be redirected to Port.


## Configuration

:::info Closed pull requests default behavior
By default, the **Port GitHub App** does not fetch closed pull requests.  
To enable this behavior, use the [closedPullRequests parameter](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/git/github/advanced/?parameter=closedPullRequests#using-advanced-configurations) in your configuration.
:::

Port integrations use a [YAML mapping block](/build-your-software-catalog/customize-integrations/configure-mapping#configuration-structure) to ingest data from the third-party api into Port.

The mapping makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from the integration API.



To ingest GitHub objects, use one of the following methods:

<Tabs queryString="method">

<TabItem label="Using Port's UI" value="port">

To manage your GitHub integration configuration using Port:

1. Go to the [data sources](https://app.getport.io/settings/data-sources) page of your portal.
2. Under `Exporters`, click on your desired GitHub organization.
3. A window will open containing the default YAML configuration of your GitHub integration.
4. Here you can modify the configuration to suit your needs, by adding/removing entries.
5. When finished, click `resync` to apply any changes.

Using this method applies the configuration to all repositories that the GitHub app has permissions to.

When configuring the integration **using Port**, the YAML configuration is global, allowing you to specify mappings for multiple Port blueprints.

</TabItem>

<TabItem label="Using GitHub" value="github">

To manage your GitHub integration configuration using a config file in GitHub:

1. Go to the [data sources](https://app.getport.io/settings/data-sources) page of your portal.
2. Under `Exporters`, click on your desired GitHub organization.
3. A window will open containing the default YAML configuration of your GitHub integration.
4. Scroll all the way down, and turn on the `Manage this integration using the "port-app-config.yml" file` toggle.

This will clear the configuration in Port's UI.

When configuring the integration **using GitHub**, you can choose either a global or granular configuration:

- **Global configuration:** create a `.github-private` repository in your organization and add the `port-app-config.yml` file to the repository.
  - Using this method applies the configuration to all repositories that the GitHub app has permissions to (unless it is overridden by a granular `port-app-config.yml` in a repository).
- **Granular configuration:** add the `port-app-config.yml` file to the `.github` directory of your desired repository.
  - Using this method applies the configuration only to the repository where the `port-app-config.yml` file exists.

When using global configuration **using GitHub**, the configuration specified in the `port-app-config.yml` file will only be applied if the file is in the **default branch** of the repository (usually `main`).

</TabItem>

</Tabs>

:::info Important
When **using Port's UI**, the specified configuration will override any `port-app-config.yml` file in your GitHub repository/ies.
:::

### Default mapping configuration

This is the default mapping configuration for this integration:

<details>
<summary><b>Default mapping configuration (Click to expand)</b></summary>

```yaml showLineNumbers
deleteDependentEntities: true
createMissingRelatedEntities: true
enableMergeEntity: true
resources:
- kind: repository
  selector:
    query: 'true'
    teams: true
  port:
    entity:
      mappings:
        identifier: .full_name
        title: .name
        blueprint: '"githubRepository"'
        properties:
          readme: file://README.md
          url: .html_url
          defaultBranch: .default_branch
        relations:
          githubTeams: '[.teams[].id | tostring]'
- kind: pull-request
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .id|tostring
        title: .title
        blueprint: '"githubPullRequest"'
        properties:
          status: .status
          closedAt: .closed_at
          updatedAt: .updated_at
          mergedAt: .merged_at
          createdAt: .created_at
          prNumber: .number
          link: .html_url
          branch: .head.ref
          leadTimeHours: (.created_at as $createdAt | .merged_at as $mergedAt | ($createdAt | sub("\\..*Z$"; "Z") | strptime("%Y-%m-%dT%H:%M:%SZ") | mktime) as $createdTimestamp | ($mergedAt | if . == null then null else sub("\\..*Z$"; "Z") | strptime("%Y-%m-%dT%H:%M:%SZ") | mktime end) as $mergedTimestamp | if $mergedTimestamp == null then null else (((($mergedTimestamp - $createdTimestamp) / 3600) * 100 | floor) / 100) end)
- kind: user
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .login
        title: .login
        blueprint: '"githubUser"'
- kind: pull-request
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .user.login
        title: .user.login
        blueprint: '"githubUser"'
- kind: pull-request
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .id|tostring
        blueprint: '"githubPullRequest"'
        relations:
          repository: .head.repo.full_name
          git_hub_assignees: '[.assignees[].login]'
          git_hub_reviewers: '[.requested_reviewers[].login]'
          git_hub_creator: .user.login
          creator:
            combinator: '"and"'
            rules:
            - property: '"git_hub_username"'
              operator: '"="'
              value: .user.login
          service:
            combinator: '"and"'
            rules:
            - property: '"repo_id"'
              operator: '"="'
              value: .head.repo.full_name
          reviewers:
            combinator: '"and"'
            rules:
            - property: '"git_hub_username"'
              operator: '"in"'
              value: '[.requested_reviewers[].login]'
          assignees:
            combinator: '"and"'
            rules:
            - property: '"git_hub_username"'
              operator: '"in"'
              value: '[.assignees[].login]'
- kind: team
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .id | tostring
        title: .name
        blueprint: '"githubTeam"'
        properties:
          slug: .slug
          description: .description
          link: .html_url
          permission: .permission
          notification_setting: .notification_setting
```

</details>


## Capabilities

### Ingesting Git objects

By using Port's GitHub app, you can automatically ingest GitHub resources into Port based on real-time events.

The app allows you to ingest a variety of objects resources provided by the GitHub API, including repositories, pull requests, workflows and more. It also allows you to perform "extract, transform, load (ETL)" on data from the GitHub API into the desired software catalog data model.

The GitHub app uses a YAML configuration file to describe the ETL process to load data into the developer portal. The approach reflects a golden middle between an overly opinionated Git visualization that might not work for everyone and a too-broad approach that could introduce unneeded complexity into the developer portal.

After installing the app, Port will automatically create a `repository` blueprint in your catalog (representing a GitHub repository), along with a default YAML configuration file that defines where the data fetched from Github's API should go in the blueprint.

### Ingest files from your repositories

Port allows you to fetch `JSON` and `YAML` files from your repositories, and create entities from them in your software catalog.  
This is done using the `file` kind in your Github mapping configuration.

For example, say you want to manage your `package.json` files in Port. One option is to create a `manifest` blueprint, with each of its entities representing a `package.json` file.

The following configuration fetches all `package.json` files from "MyRepo" and "MyOtherRepo", and creates an entity for each of them, based on the `manifest` blueprint:

```yaml showLineNumbers
resources:
  - kind: file
    selector:
      query: 'true'
      files:
        # Note that glob patterns are supported, so you can use wildcards to match multiple files
        - path: '**/package.json'
        # The `repos` key can be used to filter the repositories from which the files will be fetched
          repos:
            - "MyRepo"
            - "MyOtherRepo"
    port:
      entity:
        mappings:
          identifier: .file.path
          title: .file.name
          blueprint: '"manifest"'
          properties:
            project_name: .file.content.name
            project_version: .file.content.version
            license: .file.content.license
```

:::tip Test your mapping
After adding the `file` kind to your mapping configuration, click on the `Resync` button. When you open the mapping configuration again, you will see real examples of files fetched from your GitHub organization.  

This will help you see what data is available to use in your `jq` expressions.   
Click on the `Test mapping` button to test your mapping against the example data.

In any case, the structure of the available data looks like this:
<details>
<summary><b>Available data example (click to expand)</b></summary>

```json showLineNumbers
{
  "repo": {
    "id": 454741906,
    "node_id": "R_kgDOGxrPkg",
    "name": "dtgatest",
    "full_name": "hadar-co/dtgatest",
    "private": false,
    "owner": {
      "login": "hadar-co",
      "id": 96784606,
      "node_id": "U_kgDOBcTQ3g",
      "avatar_url": "https://avatars.githubusercontent.com/u/96784606?v=4",
      "gravatar_id": "",
      "url": "https://api.github.com/users/hadar-co",
      "html_url": "https://github.com/hadar-co",
      "followers_url": "https://api.github.com/users/hadar-co/followers",
      "following_url": "https://api.github.com/users/hadar-co/following{/other_user}",
      "gists_url": "https://api.github.com/users/hadar-co/gists{/gist_id}",
      "starred_url": "https://api.github.com/users/hadar-co/starred{/owner}{/repo}",
      "subscriptions_url": "https://api.github.com/users/hadar-co/subscriptions",
      "organizations_url": "https://api.github.com/users/hadar-co/orgs",
      "repos_url": "https://api.github.com/users/hadar-co/repos",
      "events_url": "https://api.github.com/users/hadar-co/events{/privacy}",
      "received_events_url": "https://api.github.com/users/hadar-co/received_events",
      "type": "User",
      "site_admin": false
    },
    "html_url": "https://github.com/hadar-co/dtgatest",
    "description": null,
    "fork": false,
    "url": "https://api.github.com/repos/hadar-co/dtgatest",
    "forks_url": "https://api.github.com/repos/hadar-co/dtgatest/forks",
    "keys_url": "https://api.github.com/repos/hadar-co/dtgatest/keys{/key_id}",
    "collaborators_url": "https://api.github.com/repos/hadar-co/dtgatest/collaborators{/collaborator}",
    "teams_url": "https://api.github.com/repos/hadar-co/dtgatest/teams",
    "hooks_url": "https://api.github.com/repos/hadar-co/dtgatest/hooks",
    "issue_events_url": "https://api.github.com/repos/hadar-co/dtgatest/issues/events{/number}",
    "events_url": "https://api.github.com/repos/hadar-co/dtgatest/events",
    "assignees_url": "https://api.github.com/repos/hadar-co/dtgatest/assignees{/user}",
    "branches_url": "https://api.github.com/repos/hadar-co/dtgatest/branches{/branch}",
    "tags_url": "https://api.github.com/repos/hadar-co/dtgatest/tags",
    "blobs_url": "https://api.github.com/repos/hadar-co/dtgatest/git/blobs{/sha}",
    "git_tags_url": "https://api.github.com/repos/hadar-co/dtgatest/git/tags{/sha}",
    "git_refs_url": "https://api.github.com/repos/hadar-co/dtgatest/git/refs{/sha}",
    "trees_url": "https://api.github.com/repos/hadar-co/dtgatest/git/trees{/sha}",
    "statuses_url": "https://api.github.com/repos/hadar-co/dtgatest/statuses/{sha}",
    "languages_url": "https://api.github.com/repos/hadar-co/dtgatest/languages",
    "stargazers_url": "https://api.github.com/repos/hadar-co/dtgatest/stargazers",
    "contributors_url": "https://api.github.com/repos/hadar-co/dtgatest/contributors",
    "subscribers_url": "https://api.github.com/repos/hadar-co/dtgatest/subscribers",
    "subscription_url": "https://api.github.com/repos/hadar-co/dtgatest/subscription",
    "commits_url": "https://api.github.com/repos/hadar-co/dtgatest/commits{/sha}",
    "git_commits_url": "https://api.github.com/repos/hadar-co/dtgatest/git/commits{/sha}",
    "comments_url": "https://api.github.com/repos/hadar-co/dtgatest/comments{/number}",
    "issue_comment_url": "https://api.github.com/repos/hadar-co/dtgatest/issues/comments{/number}",
    "contents_url": "https://api.github.com/repos/hadar-co/dtgatest/contents/{+path}",
    "compare_url": "https://api.github.com/repos/hadar-co/dtgatest/compare/{base}...{head}",
    "merges_url": "https://api.github.com/repos/hadar-co/dtgatest/merges",
    "archive_url": "https://api.github.com/repos/hadar-co/dtgatest/{archive_format}{/ref}",
    "downloads_url": "https://api.github.com/repos/hadar-co/dtgatest/downloads",
    "issues_url": "https://api.github.com/repos/hadar-co/dtgatest/issues{/number}",
    "pulls_url": "https://api.github.com/repos/hadar-co/dtgatest/pulls{/number}",
    "milestones_url": "https://api.github.com/repos/hadar-co/dtgatest/milestones{/number}",
    "notifications_url": "https://api.github.com/repos/hadar-co/dtgatest/notifications{?since,all,participating}",
    "labels_url": "https://api.github.com/repos/hadar-co/dtgatest/labels{/name}",
    "releases_url": "https://api.github.com/repos/hadar-co/dtgatest/releases{/id}",
    "deployments_url": "https://api.github.com/repos/hadar-co/dtgatest/deployments",
    "created_at": "2022-02-02T11:08:23Z",
    "updated_at": "2024-07-08T07:23:58Z",
    "pushed_at": "2024-07-08T07:23:54Z",
    "git_url": "git://github.com/hadar-co/dtgatest.git",
    "ssh_url": "git@github.com:hadar-co/dtgatest.git",
    "clone_url": "https://github.com/hadar-co/dtgatest.git",
    "svn_url": "https://github.com/hadar-co/dtgatest",
    "homepage": null,
    "size": 346,
    "stargazers_count": 0,
    "watchers_count": 0,
    "language": "JavaScript",
    "has_issues": true,
    "has_projects": true,
    "has_downloads": true,
    "has_wiki": true,
    "has_pages": false,
    "has_discussions": false,
    "forks_count": 0,
    "mirror_url": null,
    "archived": false,
    "disabled": false,
    "open_issues_count": 3,
    "license": {
      "key": "mit",
      "name": "MIT License",
      "spdx_id": "MIT",
      "url": "https://api.github.com/licenses/mit",
      "node_id": "MDc6TGljZW5zZTEz"
    },
    "allow_forking": true,
    "is_template": false,
    "web_commit_signoff_required": false,
    "topics": [],
    "visibility": "public",
    "forks": 0,
    "open_issues": 3,
    "watchers": 0,
    "default_branch": "main",
    "permissions": {
      "admin": false,
      "maintain": false,
      "push": false,
      "triage": false,
      "pull": false
    }
  },
  "file": {
    "path": "testfiles/package.json",
    "mode": "100644",
    "type": "blob",
    "sha": "a1e9e0624f68b3f7b69e182187c5e424c2df1f9b",
    "size": 1817,
    "url": "https://api.github.com/repos/hadar-co/dtgatest/git/blobs/a1e9e0624f68b3f7b69e182187c5e424c2df1f9b",
    "content": {
      "name": "port-docs",
      "version": "0.0.0",
      "private": true,
      "scripts": {
        "docusaurus": "docusaurus",
        "start": "docusaurus start --port 4000",
        "build": "docusaurus build",
        "swizzle": "docusaurus swizzle",
        "deploy": "docusaurus deploy",
        "clear": "docusaurus clear",
        "serve": "docusaurus serve",
        "write-translations": "docusaurus write-translations",
        "write-heading-ids": "docusaurus write-heading-ids",
        "typecheck": "tsc",
        "prepare": "husky install"
      },
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
      },
      "browserslist": {
        "production": [
          ">0.5%",
          "not dead",
          "not op_mini all"
        ],
        "development": [
          "last 1 chrome version",
          "last 1 firefox version",
          "last 1 safari version"
        ]
      }
    },
    "fileExtension": "json",
    "name": "package.json"
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
        - path: '**/package.json'
        # Note that in this case we are fetching from a specific repository
          repos:
            - "MyRepo"
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

#### Dry-run for file changes

To prevent unwanted changes to the ingested file, you can enable `GitHub checks` to perform a validation on ingested files.  
When `validationCheck: true` is enabled in the `kind: file` mapping, Port's Github app will perform a schema validation on these files before they are processed.

To enable file validation, add the `validationCheck` flag to your file kind mapping:

```yaml showLineNumbers
resources:
  - kind: file
    selector:
      query: .repo.name == "port"
      files:
        - path: data-model/domains/*.yaml
          validationCheck: true
    port:
      entity:
        mappings:
          // the rest of your mapping configuration
```

When a PR modifies a matching file, you will see a new check in your PR with the validation results.

Example for a successful validation:
<img src='/img/build-your-software-catalog/sync-data-to-catalog/github/githubFileDryRunSuccessfulCheck.png' width='70%' />

<br /> <br />

Example for a failed validation:
<img src='/img/build-your-software-catalog/sync-data-to-catalog/github/githubFileDryRunFailedCheck.png' width='70%' />

#### Ingest raw file content

If you need to ingest the raw content of a file without parsing it, you can use the `skipParsing` key in your file selector.  
This is useful when you want to store the file content as a string or YAML property.  

When `skipParsing` is set to `true`, the file content will be kept in its original string format instead of being parsed into a JSON/YAML object.

Here's an example that ingests the raw content of a `values.yaml` file into the `content` property of a `file` entity:

```yaml
resources:
  - kind: file
    selector:
      query: 'true'
      files:
        - path: values.yaml
          skipParsing: true
    port:
      entity:
        mappings:
          identifier: >-
            .repo.name + "-values"
          blueprint: '"file"'
          properties:
            content: .file.content
```

#### Limitations

- Currently only files up to 512KB in size are supported.
- Only JSON and YAML formats are automatically parsed.  
  Other file formats can be ingested as raw files, however, some special characters in the file (such as `\n`) may be processed and not preserved.
- GLOB patterns are supported for file pattern matching, but wildcards at the end (e.g., `**/*`) are not allowed, in order to prevent matching all files indiscriminately.
- Currently only the default branch of the repository is supported.

## Permissions

Port's GitHub integration requires the following permissions:

- Repository permissions:

  - **Actions:** Read and Write (for executing self-service action using GitHub workflow).
  - **Administration:** Readonly (for exporting repository teams)
  - **Checks:** Read and Write (for validating `port.yml`).
  - **Contents:** Readonly.
  - **Metadata:** Readonly.
  - **Issues:** Readonly.
  - **Pull requests:** Read and write.
  - **Dependabot alerts:** Readonly.
  - **Deployments:** Readonly.
  - **Environments:** Readonly.
  - **Code scanning alerts:** Readonly.

- Organization permissions:

  - **Members:** Readonly (for exporting organization teams).
  - **Administration:** Readonly (for exporting organization users).

- Repository events (required to receive changes via webhook from GitHub and apply the `port-app-config.yml` configuration on them):
  - Issues
  - Pull requests
  - Push
  - Workflow run
  - Team
  - Dependabot Alerts
  - Deployment
  - Branch protection rule
  - Code scanning alert
  - Member
  - Membership
  - Release

:::info Default permissions
You will be prompted to confirm the above listed permissions when first installing the App.

Permissions can be given to selected repositories in your organization, or to all repositories.   
You can reconfigure the app at any time, giving it access to new repositories, or removing access.

:::

## Examples

Refer to the [examples](./examples/examples.md) page for practical configurations and their corresponding blueprint definitions.

## Relevant Guides

For relevant guides and examples, see the [guides section](https://docs.port.io/guides?tags=GitHub).

## GitOps

Port's GitHub app also provides GitOps capabilities, refer to the [GitOps](./gitops/gitops.md) page to learn more.

## Advanced

Refer to the [advanced](./advanced.md) page for advanced use cases and examples.

## Self-hosted installation

Port's GitHub app also supports a self-hosted installation, refer to the [self-hosted installation](./self-hosted-installation.md) page to learn more.

## Additional resources

- [Connect GitHub PR with Jira issue](/guides/all/connect-github-pr-with-jira-issue)
