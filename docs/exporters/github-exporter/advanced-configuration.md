---
sidebar_position: 5
---

# Advanced configuration

## How to configure the GitHub app?

There are 2 methods to configure the GitHub app:

1. For a `single repository`: Create a `.github` directory and create a `port-app-config.yml` file in it.
2. For `all repositories` in the organization: Create a `.github-private` repository in the organization and create a `port-app-config.yml` file in it.

### Example `port-app-config.yml`

```yaml showLineNumbers
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
| `resources` | `Object` | GitHub resources that will be mapped to Port Entities and exported to Port. The parsing from GitHub events specified by the `kind` value is performed uisng [JQ](https://stedolan.github.io/jq/manual/) syntax. [visit GitHub exporter for more inforamation](../github-exporter/github-exporter.md) | `null`
