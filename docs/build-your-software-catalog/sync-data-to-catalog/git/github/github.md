import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import GitHubResources from './\_github_exporter_supported_resources.mdx'

# GitHub

Our integration with GitHub allows you to export GitHub objects to Port as entities of existing blueprints. The integration supports real-time event processing so Port always provides an accurate real-time representation of your GitHub resources.

## 💡 GitHub integration common use cases

Our GitHub integration makes it easy to fill the software catalog with data directly from your GitHub organization, for example:

- Map all the resources in your GitHub organization, including **services**, **pull requests**, **workflows**, **workflow runs**, **teams**, **files**, **dependabot alerts**, **deployment environments** and other GitHub objects.
- Watch for GitHub object changes (create/update/delete) in real-time, and automatically apply the changes to your entities in Port.
- Manage Port entities using GitOps.
- Trigger GitHub workflows directly from Port.

## Installation

To install Port's GitHub app, follow the [installation](./installation.md) guide.

## Ingesting Git objects

By using Port's GitHub app, you can automatically ingest GitHub resources into Port based on real-time events.

The app allows you to ingest a variety of objects resources provided by the GitHub API, including repositories, pull requests, workflows and more. It also allows you to perform "extract, transform, load (ETL)" on data from the GitHub API into the desired software catalog data model.

The GitHub app uses a YAML configuration file to describe the ETL process to load data into the developer portal. The approach reflects a golden middle between an overly opinionated Git visualization that might not work for everyone and a too-broad approach that could introduce unneeded complexity into the developer portal.

After installing the app, Port will automatically create a `service` blueprint in your catalog (representing a GitHub repository), along with a default YAML configuration file that defines where the data fetched from Github's API should go in the blueprint. 

### Configuration

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

Here is an example snippet from the `port-app-config.yml` file which demonstrates the ETL process for getting `githubPullRequest` data from the GitHub organization and into the software catalog:

```yaml showLineNumbers
resources:
  # Extract
  # highlight-start
  - kind: pull-request
    selector:
      query: "true" # JQ boolean query. If evaluated to false - skip syncing the object.
    # highlight-end
    port:
      entity:
        mappings:
          # Transform & Load
          # highlight-start
          identifier: ".head.repo.name + (.id|tostring)" # The Entity identifier will be the repository name + the pull request ID. After the Entity is created, the exporter will send `PATCH` requests to update this pull request within Port.
          title: ".title"
          blueprint: '"githubPullRequest"'
          properties:
            creator: ".user.login"
            assignees: "[.assignees[].login]"
            reviewers: "[.requested_reviewers[].login]"
            status: ".status" # merged, closed, open
            closedAt: ".closed_at"
            updatedAt: ".updated_at"
            mergedAt: ".merged_at"
            prNumber: ".id"
            link: ".html_url"
            # highlight-end
```

The app makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from GitHub's API events.

### `port-app-config.yml` file

The `port-app-config.yml` file is how you specify the exact resources you want to query from your GitHub organization, and also how you specify which entities and which properties you want to fill with data from GitHub.

Note that when using [Port's UI](/build-your-software-catalog/sync-data-to-catalog/git/github/?method=port#configuration) to configure the GitHub integration, `port-app-config.yml` refers to the YAML editor window where you can modify the configuration.

Here is an example `port-app-config.yml` block:

```yaml showLineNumbers
resources:
  - kind: repository
    selector:
      query: "true" # JQ boolean query. If evaluated to false - skip syncing the object.
    port:
      entity:
        mappings:
          identifier: ".name" # The Entity identifier will be the repository name.
          title: ".name"
          blueprint: '"service"'
          properties:
            url: ".html_url"
            description: ".description"
```

### `port-app-config.yml` structure

- The root key of the `port-app-config.yml` file is the `resources` key:

  ```yaml showLineNumbers
  # highlight-next-line
  resources:
    - kind: repository
      selector:
      ...
  ```

- The `kind` key is a specifier for an object from the GitHub API:

  ```yaml showLineNumbers
    resources:
      # highlight-next-line
      - kind: repository
        selector:
        ...
  ```

  <GitHubResources/>

#### Filtering unwanted objects

The `selector` and the `query` keys let you filter exactly which objects from the specified `kind` will be ingested into the software catalog:

```yaml showLineNumbers
resources:
  - kind: repository
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

The `port`, `entity` and the `mappings` keys open the section used to map the GitHub API object fields to Port entities. To create multiple mappings of the same kind, you can add another item to the `resources` array:

```yaml showLineNumbers
resources:
  - kind: repository
    selector:
      query: "true"
    # highlight-start
    port:
      entity:
        mappings: # Mappings between one GitHub API object to a Port entity. Each value is a JQ query.
          currentIdentifier: ".name" # OPTIONAL - keep it only in case you want to change the identifier of an existing entity from "currentIdentifier" to "identifier".
          identifier: ".name"
          title: ".name"
          blueprint: '"service"'
          properties:
            description: ".description"
            url: ".html_url"
            defaultBranch: ".default_branch"
    # highlight-end
  - kind: repository # In this instance repository is mapped again with a different filter
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
        - repos:
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
        - repos:
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

#### Limitations

- Currently only files up to 512KB in size are supported.
- Only JSON and YAML formats are automatically parsed. Other file formats can be ingested as raw files.
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

:::note
You will be prompted to confirm these permissions when first installing the App.

Permissions can be given to select repositories in your organization, or to all repositories. You can reconfigure the app at any time, giving it access to new repositories, or removing access.

:::

## Examples

Refer to the [examples](./examples/resource-mapping-examples.md) page for practical configurations and their corresponding blueprint definitions.

## GitOps

Port's GitHub app also provides GitOps capabilities, refer to the [GitOps](./gitops/gitops.md) page to learn more.

## Advanced

Refer to the [advanced](./advanced.md) page for advanced use cases and examples.

## Self-hosted installation

Port's GitHub app also supports a self-hosted installation, refer to the [self-hosted installation](./self-hosted-installation.md) page to learn more.

## Additional resources

- [Connect GitHub PR with Jira issue](/build-your-software-catalog/sync-data-to-catalog/project-management/jira/guides/connect-github-pr-with-jira-issue.md)
