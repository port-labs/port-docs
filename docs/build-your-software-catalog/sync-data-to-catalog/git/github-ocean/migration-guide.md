# AI! Improve this changelog file. Don't touch the codeblocks, just change the sorrounding texts to be more comprehensive and comprehensible for an average person
# Github Migration

This guide works you through the process of migrating from Port's Github Cloud App to the new Github Integration powered by [Ocean](https://ocean.port.io/).

## Improvements
- **More authentication options** - You can now run the integration using a PAT that you control.
- **Enhanced performance** - Faster resync with improved API efficiency.
- **Better selectors** - More granular selector for `pull requests`, `issues`, `dependentbot alerts`, `codescanning alerts`, `files`, and `folders`.

## Major changes

### Authentication model

#### PAT

You can now run our Github integration by authenticating using a Personal Access Token rather than by installing a Github App, for more details see our [installation page](./installation). Sample helm value:
```yaml showLineNumbers
integration:
  secrets:
    githubToken: "<GITHUB_PAT>"
```

#### Github app

You can also authenticate with our Ocean-powered Github integration using Github App, in this situation you would have to create the app yourself - this is similar to our existing "self-hosted app installation" and is [documented here](./installation/github-app.mdx). Sample helm value:
```yaml showLineNumbers
integration:
  config:
    githubAppId: "<GITHUB_APP_ID>" # app client id also works
  secrets:
    githubAppPrivateKey: "<BASE_64_ENCODED_PRIVATEKEY>"
```

### Webhooks

The integration is now responsible for configuring live-events on Github, to receive live-events you need to grant the permission to create organization webhooks to your PAT. You'll also need to configure a public address for the integration by setting `liveEvents.baseUrl` when deploying with Helm/ArgoCD, or  setting `OCEAN__BASE_URL` environmental variable when starting the integration as a docker image using `docker run`. 
[learn More about enabling live-events](./installation/#deploy-the-integration)

### Deployment

We've expanded our self-hosted installation examples to support deploying on a Kubernetes cluster using Helm or ArgoCD. [learn More](./installation/#deploy-the-integration)

When starting the integration you're expected to provide 

### Workflow Runs

We've expanded the number of Workflow Runs ingested for any workflow in a repository to 100 rather than 10 workflow runs per repository.

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

### Folders

Folders no longer include `folder.name` in the response, you need to construct the folder name using JQ:


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

When ingesting teams with `members` selector, we now use Github's GraphqQL API to reduce network calls, this results in two changes:

1. The id returned by the Rest API and the GraphqQL API are different for the same team, depending on whether mapping selector has `member` or not.
2. included members will be in a `nodes` subarray.

<details>
  <summary>Existing Configuration</summary>
</details>

<details>
  <summary>New Configuration</summary>
</details>

## Other changes

### Dependentbot alerts

Dependentbot alert kind can now take a `states` selector, this is an array of the states we want to ingest:

```yaml showLineNumbers
resources:
  - kind: dependabot-alert
    selector:
      query: "true"
      states: # ✅  new
        - "open"
        - "fixed"
```

### Codescanning alerts

Codescanning alert can now take a `state` selector, this is a string denoting the alert state we want to ingest

```yaml showLineNumbers
resources:
  - kind: code-scanning-alerts
    selector:
      query: "true"
      state: open # ✅  new
```
