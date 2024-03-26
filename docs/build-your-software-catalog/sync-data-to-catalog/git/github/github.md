import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import GitHubResources from './\_github_exporter_supported_resources.mdx'

# GitHub

Our integration with GitHub allows you to export GitHub objects to Port as entities of existing blueprints. The integration supports real-time event processing so Port always provides an accurate real-time representation of your GitHub resources.

## 💡 GitHub integration common use cases

Our GitHub integration makes it easy to fill the software catalog with data directly from your GitHub organization, for example:

- Map all the resources in your GitHub organization, including **services**, **pull requests**, **workflows**, **workflow runs**, **teams** , **dependabot alerts**, **deployment environments** and other GitHub objects.
- Watch for GitHub object changes (create/update/delete) in real-time, and automatically apply the changes to your entities in Port.
- Manage Port entities using GitOps.
- Trigger GitHub workflows directly from Port.

## Installation

To install Port's GitHub app, follow the [installation](./installation.md) guide.

## Ingesting Git objects

By using Port's GitHub app, you can automatically ingest GitHub resources into Port based on real-time events.

Port's GitHub app allows you to ingest a variety of objects resources provided by the GitHub API, including repositories, pull requests, workflows and more. The GitHub app allows you to perform extract, transform, load (ETL) on data from the GitHub API into the desired software catalog data model.

The GitHub app uses a YAML configuration file to describe the ETL process to load data into the developer portal. The approach reflects a golden middle between an overly opinionated Git visualization that might not work for everyone and a too-broad approach that could introduce unneeded complexity into the developer portal.

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

### Setup

To ingest GitHub objects using the [`port-app-config.yml`](#port-app-configyml-file) file, you can use one of the following methods:

<Tabs queryString="method">

<TabItem label="Using Port" value="port">

To manage your GitHub integration configuration using Port:

1. Go to the DevPortal Builder page.
2. Select a blueprint you want to ingest using GitHub.
3. Choose the **Ingest Data** option from the menu.
4. Select GitHub under the Git providers category.
5. Add the contents of your `port-app-config.yml` file to the editor.
6. Click save configuration.

Using this method applies the configuration to all repositories that the GitHub app has permissions to.

When configuring the integration **using Port**, the configuration specified in the ingest data window is global, allowing you to specify in the editor mappings for multiple Port blueprints, regardless of the blueprint you selected.

</TabItem>

<TabItem label="Using GitHub" value="github">

To manage your GitHub integration configuration using GitHub, you can choose either a global or granular configuration:

- **Global configuration:** create a `.github-private` repository in your organization and add the `port-app-config.yml` file to the repository.
  - Using this method applies the configuration to all repositories that the GitHub app has permissions to (unless it is overridden by a granular `port-app-config.yml` in a repository).
- **Granular configuration:** add the `port-app-config.yml` file to the `.github` directory of your desired repository.
  - Using this method applies the configuration only to the repository where the `port-app-config.yml` file exists.

When using global configuration **using GitHub**, the configuration specified in the `port-app-config.yml` file will only be applied if the file is in the **default branch** of the repository (usually `main`).

</TabItem>

</Tabs>

:::info Important
When **using Port**, the specified configuration will override any other configuration source (both global configuration using GitHub and granular configuration using GitHub).

If you want to delete the configuration specified in Port and use Github instead, simply replace the mapping content in Port with `null`, then click `Save & resync`.
:::

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
  -

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

:::note
You will be prompted to confirm these permissions when first installing the App.

Permissions can be given to select repositories in your organization, or to all repositories. You can reconfigure the app at any time, giving it access to new repositories, or removing access.

:::

## Examples

Refer to the [examples](./examples/examples.md) page for practical configurations and their corresponding blueprint definitions.

## GitOps

Port's GitHub app also provides GitOps capabilities, refer to the [GitOps](./gitops/gitops.md) page to learn more.

## Advanced

Refer to the [advanced](./advanced.md) page for advanced use cases and examples.

## Self-hosted installation

Port's GitHub app also supports a self-hosted installation, refer to the [self-hosted installation](./self-hosted-installation.md) page to learn more.

## Additional resources

- [Connect GitHub PR with Jira issue](/build-your-software-catalog/sync-data-to-catalog/git/examples/connect-github-pr-with-jira-issue.md)
