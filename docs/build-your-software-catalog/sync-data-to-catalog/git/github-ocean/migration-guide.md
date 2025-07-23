# Github Migration

This guide works you through the process of migrating from Port's Github Cloud App to the new Github Integration powered by [Ocean](https://ocean.port.io/).

## Improvements
- **More authentication options** - You can now run the integration using a PAT that you control.
- **Enhanced performance** - Faster resync with improved API efficiency.
- **Better selectors** - More granular selector for `pull requests`, `issues`, `dependentbot alerts`, `codescanning alerts`, `files`, and `folders`.

## Major changes

### Authentication model

#### PAT

You can now run our Github integration by authenticating using a Personal Access Token rather than by installing a Github App. For more details see our installation guide

#### Github app

You can also authenticate with our Ocean-powered Github integration using Github App, in this situation you would have to create the app yourself - this is similar to our existing "self-hosted app installation" and is documented here.

### Webhooks

The integration is now responsible for configuring live-events on Github, to receive live-events you need to grant the permission to create organization webhooks to your PAT. You'll also need to configure a public address for the integration.

### Deployment

We've expanded our self-hosted installation examples to support deploying on a Kubernetes cluster using Helm or ArgoCD.

### Workflow Runs

We've expanded the number of Workflow Runs ingested for any workflow to 100 from the original 10.

### Repository type

You can now control what type of repositories to ingest data from, all the entity kinds that depend on repository will only ingest data from repositories matching this config.

```yaml showLineNumbers
repositoryType: 'all' # ✅ fetch pull requests from all repositories. can also be "private", "public", etc
resources:
  - kind: pull-request
    selector:
      # ...

```


## Mapping Changes

The blueprints used in Github have evolved to provide cleaner data structures and better relationships between entities. Understanding these changes is essential for a successful migration.

For the most part, we've moved to making it obvious where we added custom attribute to the raw response by naming such custom attributes with two leading underscore e.g `__repository`.

### Files
<details>
  <summary>Existing configuration</summary>

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


There are two major changes in the file mapping:
1. The `repos` is a list of object, you can specify the repository name and the branch. The branch is optional.
2. The file content is no longer contained inside a "file" key, instead it is in a top-level. So you should do `.name` rather than `.file.name`
3. In the returned file object, `repo` key has been renamed to `repository`.

### Pull Request and Issues

Pull request and issue kinds has gotten a new `state` selector, so now you can specify what state of objects to ingest.
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

## Workflow



### Folders
- branch mapping selector
### Teams
- graphql id


