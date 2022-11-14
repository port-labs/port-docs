---
sidebar_position: 2
---

# Advanced configuration

## How to configure the GitHub app?

There are 2 methods to configure the GitHub app:

1. For a `single repository`: Create a `.github` directory and create a `port-app-config.yml` file in it.
2. For `all repositories` in the organization: Create a `.github-private` repository in the organization and create a `port-app-config.yml` file in it.

### Example `port-app-config.yml`

```yaml showLineNumbers
specPath:
  - "**/port.yml"
defaultBlueprint: "{{ respoitoryName }}"
defaultTitle: "{{ repositoryName }}"
defaultIdentifier: "{{ repositoryName }}"
defaultTeam: "Backend"
deleteDependentEntities: false
resources:
  - kind: pull-request
    selector:
      query: "true"
    port:
      entity:
        mappings:
          identifier: ".head.repo.name + (.id|tostring)"
          title: ".title"
          blueprint: '"pull-request"'
          properties:
            creator: ".user.login"
            assignees: ".assignees[].login"
            reviewers: ".requested_reviewers[].login"
            status: ".status"
            closedAt: ".closed_at"
            updatedAt: ".updated_at"
            mergedAt: ".merged_at"
            description: ".body"
            prNumber: ".id"
            link: ".html_url"
```

### `port-app-config.yml` structure

:::note
We also support putting "{{ repositoryName }}" for any config, which means the name will be taken from the repository name.
:::
| Field | Type | Description | Default |
| ----------- | ----------- | ----------- | ----------- |
| `specPath` | [globPatterns](https://www.malikbrowne.com/blog/a-beginners-guide-glob-patterns)[] | List of file path patterns that the app will search for `port.yml` files in it | `**/port.yml`
| `defaultBlueprint`| `String` | Identifier of the default Blueprint to use, if one is not provided in the `port.yml` file | `null`
| `defaultTitle` | `String` | Title to use if one is not provided in the `port.yml` file | `null`
| `defaultIdentifier` | `String` | Identifier to use if one is not provided in the `port.yml` file | `null`
| `defaultTeam` | `String` | Name of the default team to use, if one is not provided in the `port.yml` file | `null`
| `defaultPropertiesPath` | `String` | Changes the `properties` location in the `port.yml` file, you can provide custom paths like `props`, `data` or any other key. (in order to make it a top-level key you have to provide `.`).<br/> A common use case is to reuse existing `yml` files within the repository without the need to change it to the `port.yml` default format | `properties`
| `deleteDependentEntities` | `Boolean` | Flag to enable deletion of dependent Entities - an Entity that has a required Relation with an Entity you wish to delete | `false`
| `resources` | `Object` | The resources that are being mapped in order to export entities from GitHub to Port automatically by leveraging [JQ](https://stedolan.github.io/jq/manual/) syntax. [visit GitHub exporter for more inforamation](../github-app/exporter/Introduction.md) | `null`

:::caution
Please make sure you don't have duplicate identifiers in different `port.yml` files when using the `defaultIdentifier` configuration.
:::

### Templating strings

In the `port-app-config.yml` file it's possible to also provide any configuration a template string that will automatically be taken from the GitHub repo context. Template strings are wrapped into brackets, for example: `{{ field }}`.

#### Supported template strings

| Field                  | Description                   |
| ---------------------- | ----------------------------- |
| `{{ repositoryName }}` | Name of the GitHub repository |
