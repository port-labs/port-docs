# Github Migration Guide

This guide will walk you through the process of migrating from Port's existing GitHub Cloud App to our new and improved GitHub Integration, which is powered by [Ocean](https://ocean.port.io/).

## Improvements

The new Ocean-powered GitHub integration comes with several key improvements:

- **More authentication options** - You can now connect the integration using a Personal Access Token (PAT) that you control, giving you more flexibility.
- **Enhanced performance** - Faster resyncs thanks to improved API efficiency, making your data available sooner.
- **Better selectors** - More granular control over what you sync with improved selectors for `pull requests`, `issues`, `dependabot alerts`, `codescanning alerts`, `files`, and `folders`.

## Major Changes

### Authentication Model

#### Personal Access Token (PAT)

You can now authenticate with our GitHub integration using a Personal Access Token (PAT) instead of a GitHub App. This gives you more control over the integration's permissions. For more details, see our [installation page](./installation). Below is a sample Helm value for this configuration:
```yaml showLineNumbers
integration:
  secrets:
    githubToken: "<GITHUB_PAT>"
```

#### GitHub App

If you prefer using a GitHub App, you can still authenticate with our Ocean-powered GitHub integration. You will need to create the app yourself, which is a process similar to our existing self-hosted app installation. This process is [documented here](./installation/github-app.mdx). Below is a sample Helm value for this configuration:
```yaml showLineNumbers
integration:
  config:
    githubAppId: "<GITHUB_APP_ID>" # app client id also works
  secrets:
    githubAppPrivateKey: "<BASE_64_ENCODED_PRIVATEKEY>"
```

### Webhooks

The integration now automatically configures webhooks on GitHub to receive live events. To enable this, you must grant your PAT permission to create organization webhooks. Additionally, you need to provide a public URL for the integration. You can do this by setting `liveEvents.baseUrl` when deploying with Helm or ArgoCD, or by setting the `OCEAN__BASE_URL` environment variable when running the integration as a Docker container. [Learn more about enabling live events](./installation/#deploy-the-integration).

### Deployment

We've expanded our self-hosted installation examples to support deploying on a Kubernetes cluster using Helm or ArgoCD. For more details, please refer to our [deployment documentation](./installation/#deploy-the-integration).

### Workflow Runs

We have increased the number of workflow runs ingested for any given workflow in a repository. The new integration now fetches up to 100 of the latest workflow runs, up from the previous limit of 10 per repository.

### Repository Type

You can now specify the type of repositories (`public`, `private`, or `all`) from which to ingest data. All other data kinds that are associated with repositories (like pull requests, issues, etc.) will only be fetched from repositories that match this configuration.

```yaml showLineNumbers
repositoryType: 'all' # ✅ fetch pull requests from all repositories. can also be "private", "public", etc
resources:
  - kind: pull-request
    selector:
      # ...

```

## Mapping Changes

The data blueprints for GitHub have been updated to provide cleaner data structures and improved relationships between different software catalog entities. Understanding these changes is crucial for a smooth migration.

A key change is how we denote custom attributes. We now add a double underscore prefix (e.g., `__repository`) to attributes that Port adds to the raw API response from GitHub. This makes it clear which fields are part of the original data and which are enrichments from the integration.

### Files
<details>
  <summary>Existing Configuration</summary>

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
            - "MyRepo" # ❌ changed
    port:
      entity:
        mappings:
          identifier: .file.path # ❌ Changed
          title: .file.name
          blueprint: '"manifest"'
          properties:
            project_name: .file.content.name
            project_version: .file.content.version
            license: .file.content.license

```
</details>

<details>
  <summary>New Configuration</summary>

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
            - name: MyRepo # now key:value pairs rather than a string.
              branch: main
            - name: MyOtherRepo
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
</details>

Here are the key changes for file mappings:
1. The `repos` selector is now a list of objects, where each object can specify the repository `name` and an optional `branch`. This provides more granular control over which files are fetched.
2. File attributes are no longer nested under a `file` key. They are now at the top level of the data structure. For example, instead of `.file.path`, you should now use `.path`.
3. The `repo` key has been renamed to `repository` when referencing the repository a file belongs to.

### Pull Requests and Issues

For `pull-request` and `issue` kinds, we've introduced a new `state` selector. This allows you to filter which objects are ingested based on their state (e.g., `open`, `closed`).

<details>
<summary>Existing Configuration</summary>

```yaml showLineNumbers
resources:
  - kind: pull-request
    selector:
      query: "true" # JQ boolean query. If evaluated to false - skip syncing the object.
    port:
      entity:
        mappings:
          identifier: ".head.repo.name + (.id|tostring)" # The Entity identifier will be the repository name + the pull request ID.
          title: ".title"
          blueprint: '"githubPullRequest"'
          properties:
            creator: ".user.login"
            assignees: "[.assignees[].login]"
            reviewers: "[.requested_reviewers[].login]"
            status: ".status" # merged, closed, opened
            closedAt: ".closed_at"
            updatedAt: ".updated_at"
            mergedAt: ".merged_at"
            createdAt: ".created_at"
          relations:
            repository: .head.repo.name

  - kind: issue
    selector:
      query: ".pull_request == null" # JQ boolean query. If evaluated to false - skip syncing the object.
    port:
      entity:
        mappings:
          identifier: ".repo + (.id|tostring)"
          title: ".title"
          blueprint: '"githubIssue"'
          properties:
            creator: ".user.login"
            assignees: "[.assignees[].login]"
            labels: "[.labels[].name]"
            status: ".state"
            createdAt: ".created_at"
            link: ".html_url"
          relations:
            repository: ".repo" # ❌  changed
```

</details>

<details>

<summary>New Configuration</summary>

```yaml showLineNumbers
resources:
  - kind: pull-request
    selector:
      query: "true" # JQ boolean query. If evaluated to false - skip syncing the object.
      state: "open" # ✅ new
    port:
      entity:
        mappings:
          identifier: ".head.repo.name + (.id|tostring)" # The Entity identifier will be the repository name + the pull request ID.
          title: ".title"
          blueprint: '"githubPullRequest"'
          properties:
            creator: ".user.login"
            assignees: "[.assignees[].login]"
            reviewers: "[.requested_reviewers[].login]"
            status: ".state" # merged, closed, opened
            closedAt: ".closed_at"
            updatedAt: ".updated_at"
            mergedAt: ".merged_at"
            createdAt: ".created_at"
            prNumber: ".id"
          relations:
            repository: .__repository #  ✅ new, it is now obvious when an attribute is added to the raw API response by the integration.

  - kind: issue
    selector:
      query: ".pull_request == null" # JQ boolean query. If evaluated to false - skip syncing the object.
      state: "closed" # ✅  new
    port:
      entity:
        mappings:
          identifier: ".__repository + (.id|tostring)"
          title: ".title"
          blueprint: '"githubIssue"'
          properties:
            creator: ".user.login"
            assignees: "[.assignees[].login]"
            labels: "[.labels[].name]"
            status: ".state"
            createdAt: ".created_at"
            closedAt: ".closed_at"
            updatedAt: ".updated_at"
            description: ".body"
            issueNumber: ".number"
            link: ".html_url"
          relations:
            repository: ".__repository" # ✅  new, uses leading underscore to indicate custom enrichment.
```

</details>

### Folders

For the `folder` kind, the `folder.name` attribute is no longer part of the response. Instead, you can easily derive the folder name from the `folder.path` using a JQ expression, as shown in the example below:

<details>
  <summary>Existing Configuration</summary>

  ```yaml showLineNumbers
resources:
  - kind: folder
    selector:
      query: "true"
      folders: 
        - path: apps/*
          repos:
            - backend-service # ❌  changed
    port:
      entity:
        mappings:
          identifier: ".folder.name" # ❌  changed
          title: ".folder.name" # ❌  changed
          blueprint: '"githubRepository"'
          properties:
            url: .repo.html_url + "/tree/" + .repo.default_branch  + "/" + .folder.path # ❌  changed
            readme: file://README.md

  ```
</details>

<details>
  <summary>New Configuration</summary>


  ```yaml showLineNumbers
resources:
  - kind: folder
    selector:
      query: "true"
      folders: 
        - path: apps/*
          repos:
            - name: backend-service # ✅  new, now has a 'name' key
              branch: main # ✅  new, optional branch name
    port:
      entity:
        mappings:
          identifier: .folder.path | split('/') | last # ✅  new, derived using JQ
          title: .folder.path | split('/') | last
          blueprint: '"githubRepository"'
          properties:
            url: .__repository.html_url + "/tree/" + .__repository.default_branch  + "/" + .folder.path # ✅  new, repository is a custom enrichment
            readme: file://README.md

  ```
</details>


### Teams

To improve performance when fetching team members, we now use GitHub's GraphQL API instead of the REST API. This change has two main consequences:

1. The ID for a team may differ depending on whether you are fetching its members. This is due to differences between GitHub's REST and GraphQL APIs.
2. Team members are now located in a `nodes` subarray within the team object.

<details>
  <summary>Existing Configuration</summary>
</details>

<details>
  <summary>New Configuration</summary>
</details>

## Other Changes

### `dependabot-alert`

The `dependabot-alert` kind now supports a `states` selector. This allows you to specify an array of states (e.g., `open`, `fixed`) to control which alerts are ingested:

```yaml showLineNumbers
resources:
  - kind: dependabot-alert
    selector:
      query: "true"
      states: # ✅  new
        - "open"
        - "fixed"
```

### `code-scanning-alerts`

The `code-scanning-alerts` kind now supports a `state` selector. This allows you to specify a single state (e.g., `open`) to control which alerts are ingested:

```yaml showLineNumbers
resources:
  - kind: code-scanning-alerts
    selector:
      query: "true"
      state: open # ✅  new
```

## Summary of Key Changes

This section provides a high-level summary of the key breaking changes for mappings.

| Area | Old Path | New Path | Notes |
|---|---|---|---|
| **File** properties | `.file.path` | `.path` | All file properties are now at the top level of the object, no longer nested under `.file`. |
| **Repository** reference | `.repo` or `.head.repo.name` | `.__repository` | The integration now consistently provides repository information under the `__repository` field for all relevant kinds. |
| **Folder** name | `.folder.name` | `.folder.path \| split('/') \| last` | The folder name is no longer directly available and should be derived from the folder path using a JQ expression. |
