---
sidebar_class_name: hidden
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import GitHubResources from './\_github_exporter_supported_resources.mdx'

# GitHub Self-Hosted (Beta)

Port's GitHub integration allows you to model GitHub resources in your software catalog and ingest data into them.


## Overview

Here's what you can do with the GitHub integration:

- Map and organize your desired GitHub resources and their metadata in Port (see supported resources below).
- Watch for GitHub object changes (create/update/delete) in real-time, and automatically apply the changes to your software catalog.
- Manage Port entities using GitOps.
- Trigger GitHub workflows directly from Port.


### Supported resources

The resources that can be ingested from GitHub into Port are listed below.
It is possible to reference any field that appears in the API responses linked below in the mapping configuration.

 <GitHubResources/>


## Setup

To install Port's GitHub integration, see [our dedicated installation guides](./installation).


## Configuration

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

</Tabs>

## Capabilities

### Ingesting Git objects

Using Port's GitHub integration, you can automatically ingest GitHub resources into Port based on real-time events.

The app allows you to ingest a variety of objects resources provided by the GitHub API, including repositories, pull requests, workflows and more. It also allows you to perform "extract, transform, load (ETL)" on data from the GitHub API into the desired software catalog data model.

The GitHub integration uses a YAML configuration file to describe the ETL process to load data into the developer portal. This approach provides a flexible and powerful way to model your Git data without being overly opinionated or complex.

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
            # The `repos` key can be used to filter the repositories and branch where files should be fetched
          repos:
            - name: MyRepo
              branch: main
            - name: MyOtherRepo
              branch: main
    port:
      entity:
        mappings:
          identifier: .path
          title: .name
          blueprint: '"manifest"'
          properties:
            project_name: .content.name
            project_version: .content.version
            license: .content.license
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
  "content": {
    "name": "code-oss-dev-build",
    "version": "1.0.0",
    "license": "MIT",
    "devDependencies": {
      "@azure/core-auth": "^1.9.0",
      "@azure/cosmos": "^3",
      "@azure/identity": "^4.2.1",
      "@azure/msal-node": "^2.16.1",
      "@azure/storage-blob": "^12.25.0",
      "@electron/get": "^2.0.0",
      "@types/ansi-colors": "^3.2.0",
      "@types/byline": "^4.2.32",
      "@types/debounce": "^1.0.0",
      "@types/debug": "^4.1.5",
      "@types/fancy-log": "^1.3.0",
      "@types/fs-extra": "^9.0.12",
      "@types/glob": "^7.1.1",
      "@types/gulp": "^4.0.17",
      "@types/gulp-filter": "^3.0.32",
      "@types/gulp-gzip": "^0.0.31",
      "@types/gulp-json-editor": "^2.2.31",
      "@types/gulp-rename": "^0.0.33",
      "@types/gulp-sort": "^2.0.4",
      "@types/gulp-sourcemaps": "^0.0.32",
      "@types/jws": "^3.2.10",
      "@types/mime": "0.0.29",
      "@types/minimatch": "^3.0.3",
      "@types/minimist": "^1.2.1",
      "@types/mocha": "^9.1.1",
      "@types/node": "22.x",
      "@types/pump": "^1.0.1",
      "@types/rimraf": "^2.0.4",
      "@types/through": "^0.0.29",
      "@types/through2": "^2.0.36",
      "@types/workerpool": "^6.4.0",
      "@types/xml2js": "0.0.33",
      "@vscode/iconv-lite-umd": "0.7.0",
      "@vscode/ripgrep": "^1.15.13",
      "@vscode/vsce": "2.20.1",
      "byline": "^5.0.0",
      "debug": "^4.3.2",
      "electron-osx-sign": "^0.4.16",
      "esbuild": "0.25.5",
      "extract-zip": "^2.0.1",
      "gulp-merge-json": "^2.1.1",
      "gulp-sort": "^2.0.0",
      "jsonc-parser": "^2.3.0",
      "jws": "^4.0.0",
      "mime": "^1.4.1",
      "source-map": "0.6.1",
      "ternary-stream": "^3.0.0",
      "through2": "^4.0.2",
      "tree-sitter": "^0.22.4",
      "vscode-universal-bundler": "^0.1.3",
      "workerpool": "^6.4.0",
      "yauzl": "^2.10.0",
      "zx": "8.5.0"
    },
    "type": "commonjs",
    "scripts": {
      "compile": "../node_modules/.bin/tsc -p tsconfig.build.json",
      "watch": "../node_modules/.bin/tsc -p tsconfig.build.json --watch",
      "npmCheckJs": "../node_modules/.bin/tsc --noEmit"
    },
    "optionalDependencies": {
      "tree-sitter-typescript": "^0.23.2",
      "vscode-gulp-watch": "^5.0.3"
    }
  },
  "repository": {
    "id": 1006465568,
    "node_id": "R_kgDOO_1yIA",
    "name": "vscode",
    "full_name": "port-gh-app-dev/vscode",
    "private": false,
    "owner": {
      "login": "port-gh-app-dev",
      "id": 216844958,
      "node_id": "O_kgDODOzKng",
      "avatar_url": "https://avatars.githubusercontent.com/u/216844958?v=4",
      "gravatar_id": "",
      "url": "https://api.github.com/users/port-gh-app-dev",
      "html_url": "https://github.com/port-gh-app-dev",
      "followers_url": "https://api.github.com/users/port-gh-app-dev/followers",
      "following_url": "https://api.github.com/users/port-gh-app-dev/following{/other_user}",
      "gists_url": "https://api.github.com/users/port-gh-app-dev/gists{/gist_id}",
      "starred_url": "https://api.github.com/users/port-gh-app-dev/starred{/owner}{/repo}",
      "subscriptions_url": "https://api.github.com/users/port-gh-app-dev/subscriptions",
      "organizations_url": "https://api.github.com/users/port-gh-app-dev/orgs",
      "repos_url": "https://api.github.com/users/port-gh-app-dev/repos",
      "events_url": "https://api.github.com/users/port-gh-app-dev/events{/privacy}",
      "received_events_url": "https://api.github.com/users/port-gh-app-dev/received_events",
      "type": "Organization",
      "user_view_type": "public",
      "site_admin": false
    },
    "html_url": "https://github.com/port-gh-app-dev/vscode",
    "description": "Visual Studio Code",
    "fork": true,
    "url": "https://api.github.com/repos/port-gh-app-dev/vscode",
    "forks_url": "https://api.github.com/repos/port-gh-app-dev/vscode/forks",
    "keys_url": "https://api.github.com/repos/port-gh-app-dev/vscode/keys{/key_id}",
    "collaborators_url": "https://api.github.com/repos/port-gh-app-dev/vscode/collaborators{/collaborator}",
    "teams_url": "https://api.github.com/repos/port-gh-app-dev/vscode/teams",
    "hooks_url": "https://api.github.com/repos/port-gh-app-dev/vscode/hooks",
    "issue_events_url": "https://api.github.com/repos/port-gh-app-dev/vscode/issues/events{/number}",
    "events_url": "https://api.github.com/repos/port-gh-app-dev/vscode/events",
    "assignees_url": "https://api.github.com/repos/port-gh-app-dev/vscode/assignees{/user}",
    "branches_url": "https://api.github.com/repos/port-gh-app-dev/vscode/branches{/branch}",
    "tags_url": "https://api.github.com/repos/port-gh-app-dev/vscode/tags",
    "blobs_url": "https://api.github.com/repos/port-gh-app-dev/vscode/git/blobs{/sha}",
    "git_tags_url": "https://api.github.com/repos/port-gh-app-dev/vscode/git/tags{/sha}",
    "git_refs_url": "https://api.github.com/repos/port-gh-app-dev/vscode/git/refs{/sha}",
    "trees_url": "https://api.github.com/repos/port-gh-app-dev/vscode/git/trees{/sha}",
    "statuses_url": "https://api.github.com/repos/port-gh-app-dev/vscode/statuses/{sha}",
    "languages_url": "https://api.github.com/repos/port-gh-app-dev/vscode/languages",
    "stargazers_url": "https://api.github.com/repos/port-gh-app-dev/vscode/stargazers",
    "contributors_url": "https://api.github.com/repos/port-gh-app-dev/vscode/contributors",
    "subscribers_url": "https://api.github.com/repos/port-gh-app-dev/vscode/subscribers",
    "subscription_url": "https://api.github.com/repos/port-gh-app-dev/vscode/subscription",
    "commits_url": "https://api.github.com/repos/port-gh-app-dev/vscode/commits{/sha}",
    "git_commits_url": "https://api.github.com/repos/port-gh-app-dev/vscode/git/commits{/sha}",
    "comments_url": "https://api.github.com/repos/port-gh-app-dev/vscode/comments{/number}",
    "issue_comment_url": "https://api.github.com/repos/port-gh-app-dev/vscode/issues/comments{/number}",
    "contents_url": "https://api.github.com/repos/port-gh-app-dev/vscode/contents/{+path}",
    "compare_url": "https://api.github.com/repos/port-gh-app-dev/vscode/compare/{base}...{head}",
    "merges_url": "https://api.github.com/repos/port-gh-app-dev/vscode/merges",
    "archive_url": "https://api.github.com/repos/port-gh-app-dev/vscode/{archive_format}{/ref}",
    "downloads_url": "https://api.github.com/repos/port-gh-app-dev/vscode/downloads",
    "issues_url": "https://api.github.com/repos/port-gh-app-dev/vscode/issues{/number}",
    "pulls_url": "https://api.github.com/repos/port-gh-app-dev/vscode/pulls{/number}",
    "milestones_url": "https://api.github.com/repos/port-gh-app-dev/vscode/milestones{/number}",
    "notifications_url": "https://api.github.com/repos/port-gh-app-dev/vscode/notifications{?since,all,participating}",
    "labels_url": "https://api.github.com/repos/port-gh-app-dev/vscode/labels{/name}",
    "releases_url": "https://api.github.com/repos/port-gh-app-dev/vscode/releases{/id}",
    "deployments_url": "https://api.github.com/repos/port-gh-app-dev/vscode/deployments",
    "created_at": "2025-06-22T10:36:32Z",
    "updated_at": "2025-07-01T12:24:24Z",
    "pushed_at": "2025-07-01T12:24:14Z",
    "git_url": "git://github.com/port-gh-app-dev/vscode.git",
    "ssh_url": "git@github.com:port-gh-app-dev/vscode.git",
    "clone_url": "https://github.com/port-gh-app-dev/vscode.git",
    "svn_url": "https://github.com/port-gh-app-dev/vscode",
    "homepage": "https://code.visualstudio.com",
    "size": 957812,
    "stargazers_count": 0,
    "watchers_count": 0,
    "language": "TypeScript",
    "has_issues": false,
    "has_projects": true,
    "has_downloads": true,
    "has_wiki": true,
    "has_pages": false,
    "has_discussions": false,
    "forks_count": 0,
    "mirror_url": null,
    "archived": false,
    "disabled": false,
    "open_issues_count": 0,
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
    "open_issues": 0,
    "watchers": 0,
    "default_branch": "main",
    "permissions": {
      "admin": false,
      "maintain": false,
      "push": false,
      "triage": false,
      "pull": false
    },
    "temp_clone_token": "",
    "allow_squash_merge": true,
    "allow_merge_commit": true,
    "allow_rebase_merge": true,
    "allow_auto_merge": false,
    "delete_branch_on_merge": false,
    "allow_update_branch": false,
    "use_squash_pr_title_as_default": false,
    "squash_merge_commit_message": "COMMIT_MESSAGES",
    "squash_merge_commit_title": "COMMIT_OR_PR_TITLE",
    "merge_commit_message": "PR_TITLE",
    "merge_commit_title": "MERGE_MESSAGE",
    "custom_properties": {},
    "organization": {
      "login": "port-gh-app-dev",
      "id": 216844958,
      "node_id": "O_kgDODOzKng",
      "avatar_url": "https://avatars.githubusercontent.com/u/216844958?v=4",
      "gravatar_id": "",
      "url": "https://api.github.com/users/port-gh-app-dev",
      "html_url": "https://github.com/port-gh-app-dev",
      "followers_url": "https://api.github.com/users/port-gh-app-dev/followers",
      "following_url": "https://api.github.com/users/port-gh-app-dev/following{/other_user}",
      "gists_url": "https://api.github.com/users/port-gh-app-dev/gists{/gist_id}",
      "starred_url": "https://api.github.com/users/port-gh-app-dev/starred{/owner}{/repo}",
      "subscriptions_url": "https://api.github.com/users/port-gh-app-dev/subscriptions",
      "organizations_url": "https://api.github.com/users/port-gh-app-dev/orgs",
      "repos_url": "https://api.github.com/users/port-gh-app-dev/repos",
      "events_url": "https://api.github.com/users/port-gh-app-dev/events{/privacy}",
      "received_events_url": "https://api.github.com/users/port-gh-app-dev/received_events",
      "type": "Organization",
      "user_view_type": "public",
      "site_admin": false
    },
    "parent": {
      "id": 41881900,
      "node_id": "MDEwOlJlcG9zaXRvcnk0MTg4MTkwMA==",
      "name": "vscode",
      "full_name": "microsoft/vscode",
      "private": false,
      "owner": {
        "login": "microsoft",
        "id": 6154722,
        "node_id": "MDEyOk9yZ2FuaXphdGlvbjYxNTQ3MjI=",
        "avatar_url": "https://avatars.githubusercontent.com/u/6154722?v=4",
        "gravatar_id": "",
        "url": "https://api.github.com/users/microsoft",
        "html_url": "https://github.com/microsoft",
        "followers_url": "https://api.github.com/users/microsoft/followers",
        "following_url": "https://api.github.com/users/microsoft/following{/other_user}",
        "gists_url": "https://api.github.com/users/microsoft/gists{/gist_id}",
        "starred_url": "https://api.github.com/users/microsoft/starred{/owner}{/repo}",
        "subscriptions_url": "https://api.github.com/users/microsoft/subscriptions",
        "organizations_url": "https://api.github.com/users/microsoft/orgs",
        "repos_url": "https://api.github.com/users/microsoft/repos",
        "events_url": "https://api.github.com/users/microsoft/events{/privacy}",
        "received_events_url": "https://api.github.com/users/microsoft/received_events",
        "type": "Organization",
        "user_view_type": "public",
        "site_admin": false
      },
      "html_url": "https://github.com/microsoft/vscode",
      "description": "Visual Studio Code",
      "fork": false,
      "url": "https://api.github.com/repos/microsoft/vscode",
      "forks_url": "https://api.github.com/repos/microsoft/vscode/forks",
      "keys_url": "https://api.github.com/repos/microsoft/vscode/keys{/key_id}",
      "collaborators_url": "https://api.github.com/repos/microsoft/vscode/collaborators{/collaborator}",
      "teams_url": "https://api.github.com/repos/microsoft/vscode/teams",
      "hooks_url": "https://api.github.com/repos/microsoft/vscode/hooks",
      "issue_events_url": "https://api.github.com/repos/microsoft/vscode/issues/events{/number}",
      "events_url": "https://api.github.com/repos/microsoft/vscode/events",
      "assignees_url": "https://api.github.com/repos/microsoft/vscode/assignees{/user}",
      "branches_url": "https://api.github.com/repos/microsoft/vscode/branches{/branch}",
      "tags_url": "https://api.github.com/repos/microsoft/vscode/tags",
      "blobs_url": "https://api.github.com/repos/microsoft/vscode/git/blobs{/sha}",
      "git_tags_url": "https://api.github.com/repos/microsoft/vscode/git/tags{/sha}",
      "git_refs_url": "https://api.github.com/repos/microsoft/vscode/git/refs{/sha}",
      "trees_url": "https://api.github.com/repos/microsoft/vscode/git/trees{/sha}",
      "statuses_url": "https://api.github.com/repos/microsoft/vscode/statuses/{sha}",
      "languages_url": "https://api.github.com/repos/microsoft/vscode/languages",
      "stargazers_url": "https://api.github.com/repos/microsoft/vscode/stargazers",
      "contributors_url": "https://api.github.com/repos/microsoft/vscode/contributors",
      "subscribers_url": "https://api.github.com/repos/microsoft/vscode/subscribers",
      "subscription_url": "https://api.github.com/repos/microsoft/vscode/subscription",
      "commits_url": "https://api.github.com/repos/microsoft/vscode/commits{/sha}",
      "git_commits_url": "https://api.github.com/repos/microsoft/vscode/git/commits{/sha}",
      "comments_url": "https://api.github.com/repos/microsoft/vscode/comments{/number}",
      "issue_comment_url": "https://api.github.com/repos/microsoft/vscode/issues/comments{/number}",
      "contents_url": "https://api.github.com/repos/microsoft/vscode/contents/{+path}",
      "compare_url": "https://api.github.com/repos/microsoft/vscode/compare/{base}...{head}",
      "merges_url": "https://api.github.com/repos/microsoft/vscode/merges",
      "archive_url": "https://api.github.com/repos/microsoft/vscode/{archive_format}{/ref}",
      "downloads_url": "https://api.github.com/repos/microsoft/vscode/downloads",
      "issues_url": "https://api.github.com/repos/microsoft/vscode/issues{/number}",
      "pulls_url": "https://api.github.com/repos/microsoft/vscode/pulls{/number}",
      "milestones_url": "https://api.github.com/repos/microsoft/vscode/milestones{/number}",
      "notifications_url": "https://api.github.com/repos/microsoft/vscode/notifications{?since,all,participating}",
      "labels_url": "https://api.github.com/repos/microsoft/vscode/labels{/name}",
      "releases_url": "https://api.github.com/repos/microsoft/vscode/releases{/id}",
      "deployments_url": "https://api.github.com/repos/microsoft/vscode/deployments",
      "created_at": "2015-09-03T20:23:38Z",
      "updated_at": "2025-07-01T15:41:46Z",
      "pushed_at": "2025-07-01T16:26:22Z",
      "git_url": "git://github.com/microsoft/vscode.git",
      "ssh_url": "git@github.com:microsoft/vscode.git",
      "clone_url": "https://github.com/microsoft/vscode.git",
      "svn_url": "https://github.com/microsoft/vscode",
      "homepage": "https://code.visualstudio.com",
      "size": 1030538,
      "stargazers_count": 174062,
      "watchers_count": 174062,
      "language": "TypeScript",
      "has_issues": true,
      "has_projects": true,
      "has_downloads": true,
      "has_wiki": true,
      "has_pages": false,
      "has_discussions": false,
      "forks_count": 33404,
      "mirror_url": null,
      "archived": false,
      "disabled": false,
      "open_issues_count": 11291,
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
      "topics": [
        "editor",
        "electron",
        "microsoft",
        "typescript",
        "visual-studio-code"
      ],
      "visibility": "public",
      "forks": 33404,
      "open_issues": 11291,
      "watchers": 174062,
      "default_branch": "main"
    },
    "source": {
      "id": 41881900,
      "node_id": "MDEwOlJlcG9zaXRvcnk0MTg4MTkwMA==",
      "name": "vscode",
      "full_name": "microsoft/vscode",
      "private": false,
      "owner": {
        "login": "microsoft",
        "id": 6154722,
        "node_id": "MDEyOk9yZ2FuaXphdGlvbjYxNTQ3MjI=",
        "avatar_url": "https://avatars.githubusercontent.com/u/6154722?v=4",
        "gravatar_id": "",
        "url": "https://api.github.com/users/microsoft",
        "html_url": "https://github.com/microsoft",
        "followers_url": "https://api.github.com/users/microsoft/followers",
        "following_url": "https://api.github.com/users/microsoft/following{/other_user}",
        "gists_url": "https://api.github.com/users/microsoft/gists{/gist_id}",
        "starred_url": "https://api.github.com/users/microsoft/starred{/owner}{/repo}",
        "subscriptions_url": "https://api.github.com/users/microsoft/subscriptions",
        "organizations_url": "https://api.github.com/users/microsoft/orgs",
        "repos_url": "https://api.github.com/users/microsoft/repos",
        "events_url": "https://api.github.com/users/microsoft/events{/privacy}",
        "received_events_url": "https://api.github.com/users/microsoft/received_events",
        "type": "Organization",
        "user_view_type": "public",
        "site_admin": false
      },
      "html_url": "https://github.com/microsoft/vscode",
      "description": "Visual Studio Code",
      "fork": false,
      "url": "https://api.github.com/repos/microsoft/vscode",
      "forks_url": "https://api.github.com/repos/microsoft/vscode/forks",
      "keys_url": "https://api.github.com/repos/microsoft/vscode/keys{/key_id}",
      "collaborators_url": "https://api.github.com/repos/microsoft/vscode/collaborators{/collaborator}",
      "teams_url": "https://api.github.com/repos/microsoft/vscode/teams",
      "hooks_url": "https://api.github.com/repos/microsoft/vscode/hooks",
      "issue_events_url": "https://api.github.com/repos/microsoft/vscode/issues/events{/number}",
      "events_url": "https://api.github.com/repos/microsoft/vscode/events",
      "assignees_url": "https://api.github.com/repos/microsoft/vscode/assignees{/user}",
      "branches_url": "https://api.github.com/repos/microsoft/vscode/branches{/branch}",
      "tags_url": "https://api.github.com/repos/microsoft/vscode/tags",
      "blobs_url": "https://api.github.com/repos/microsoft/vscode/git/blobs{/sha}",
      "git_tags_url": "https://api.github.com/repos/microsoft/vscode/git/tags{/sha}",
      "git_refs_url": "https://api.github.com/repos/microsoft/vscode/git/refs{/sha}",
      "trees_url": "https://api.github.com/repos/microsoft/vscode/git/trees{/sha}",
      "statuses_url": "https://api.github.com/repos/microsoft/vscode/statuses/{sha}",
      "languages_url": "https://api.github.com/repos/microsoft/vscode/languages",
      "stargazers_url": "https://api.github.com/repos/microsoft/vscode/stargazers",
      "contributors_url": "https://api.github.com/repos/microsoft/vscode/contributors",
      "subscribers_url": "https://api.github.com/repos/microsoft/vscode/subscribers",
      "subscription_url": "https://api.github.com/repos/microsoft/vscode/subscription",
      "commits_url": "https://api.github.com/repos/microsoft/vscode/commits{/sha}",
      "git_commits_url": "https://api.github.com/repos/microsoft/vscode/git/commits{/sha}",
      "comments_url": "https://api.github.com/repos/microsoft/vscode/comments{/number}",
      "issue_comment_url": "https://api.github.com/repos/microsoft/vscode/issues/comments{/number}",
      "contents_url": "https://api.github.com/repos/microsoft/vscode/contents/{+path}",
      "compare_url": "https://api.github.com/repos/microsoft/vscode/compare/{base}...{head}",
      "merges_url": "https://api.github.com/repos/microsoft/vscode/merges",
      "archive_url": "https://api.github.com/repos/microsoft/vscode/{archive_format}{/ref}",
      "downloads_url": "https://api.github.com/repos/microsoft/vscode/downloads",
      "issues_url": "https://api.github.com/repos/microsoft/vscode/issues{/number}",
      "pulls_url": "https://api.github.com/repos/microsoft/vscode/pulls{/number}",
      "milestones_url": "https://api.github.com/repos/microsoft/vscode/milestones{/number}",
      "notifications_url": "https://api.github.com/repos/microsoft/vscode/notifications{?since,all,participating}",
      "labels_url": "https://api.github.com/repos/microsoft/vscode/labels{/name}",
      "releases_url": "https://api.github.com/repos/microsoft/vscode/releases{/id}",
      "deployments_url": "https://api.github.com/repos/microsoft/vscode/deployments",
      "created_at": "2015-09-03T20:23:38Z",
      "updated_at": "2025-07-01T15:41:46Z",
      "pushed_at": "2025-07-01T16:26:22Z",
      "git_url": "git://github.com/microsoft/vscode.git",
      "ssh_url": "git@github.com:microsoft/vscode.git",
      "clone_url": "https://github.com/microsoft/vscode.git",
      "svn_url": "https://github.com/microsoft/vscode",
      "homepage": "https://code.visualstudio.com",
      "size": 1030538,
      "stargazers_count": 174062,
      "watchers_count": 174062,
      "language": "TypeScript",
      "has_issues": true,
      "has_projects": true,
      "has_downloads": true,
      "has_wiki": true,
      "has_pages": false,
      "has_discussions": false,
      "forks_count": 33404,
      "mirror_url": null,
      "archived": false,
      "disabled": false,
      "open_issues_count": 11291,
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
      "topics": [
        "editor",
        "electron",
        "microsoft",
        "typescript",
        "visual-studio-code"
      ],
      "visibility": "public",
      "forks": 33404,
      "open_issues": 11291,
      "watchers": 174062,
      "default_branch": "main"
    },
    "security_and_analysis": {
      "secret_scanning": {
        "status": "disabled"
      },
      "secret_scanning_push_protection": {
        "status": "disabled"
      },
      "dependabot_security_updates": {
        "status": "disabled"
      },
      "secret_scanning_non_provider_patterns": {
        "status": "disabled"
      },
      "secret_scanning_validity_checks": {
        "status": "disabled"
      }
    },
    "network_count": 33404,
    "subscribers_count": 1
  },
  "branch": "main",
  "path": "build/package.json",
  "name": "package.json",
  "metadata": {
    "url": "https://api.github.com/repos/port-gh-app-dev/vscode/contents/build/package.json?ref=main",
    "path": "build/package.json",
    "size": 2106
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
            - name: MyRepo
              branch: main
    port:
      itemsToParse: .content.dependencies | to_entries
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

For multi-document YAML files (a single file containing multiple YAML documents separated by `---`), `.content` will not resolve to an object, but to an array of objects.

You can use one of these methods to ingest multi-document YAML files:

1. Use the `itemsToParse` key to create multiple entities from such a file (see example above). 
2. Map the result to an `array` property.

:::tip Mixed YAML types
If you have both single-document and multi-document YAML files in your repositories, you can use the `itemsToParse` key like this to handle both cases:

```yaml
itemsToParse: .content | if type== "object" then [.] else . end
```
:::


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
            .repository.name + "-values"
          blueprint: '"file"'
          properties:
            content: .content
```

#### Limitations

- Currently only files up to 1MB in size are supported.
- Only JSON and YAML formats are automatically parsed.  
  Other file formats can be ingested as raw files, however, some special characters in the file (such as `\n`) may be processed and not preserved.

## Permissions

Port's GitHub integration requires the following permissions:

- Repository permissions:

  - **Actions:** Read and Write (for executing self-service action using GitHub workflow).
  - **Checks:** Read and Write (for validating `port.yml`).
  - **Contents:** Readonly.
  - **Metadata:** Readonly.
  - **Pull requests:** Read and write.

- Repository events (required to receive changes via webhook from GitHub and apply the `port-app-config.yml` configuration on them):
  - Pull requests
  - Push

:::info Default permissions
You will be prompted to confirm the above listed permissions when creating a personal access token.

Permissions can be given to selected repositories in your organization, or to all repositories.   
You can reconfigure the permission at any time, giving it access to new repositories, or removing access.

:::

## Examples

Refer to the [examples](./examples/resource-mapping-examples.md) page for practical configurations and their corresponding blueprint definitions.
