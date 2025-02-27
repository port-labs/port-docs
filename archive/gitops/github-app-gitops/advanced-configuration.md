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
deleteDependentEntities: false
```

### `port-app-config.yml` structure

| Field                     | Type                                                                               | Description                                                                                                                                                                                                                                                                     | Default       |
| ------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| `specPath`                | [globPatterns](https://www.malikbrowne.com/blog/a-beginners-guide-glob-patterns)[] | List of file path patterns that the app will search for `port.yml` files in it                                                                                                                                                                                                  | `**/port.yml` |
| `deleteDependentEntities` | `Boolean`                                                                          | Flag to enable deletion of dependent Entities - an Entity that has a required Relation with an Entity you wish to delete                                                                                                                                                        | `false`       |
| `enableMergeEntity`       | `Boolean`                                                                          | Flag to enable merging new values with the existing Entity values, instead of overriding all existing values. <br/> More info about merging entities can be found in the [Entity Tutorial](https://docs.port.io/build-your-software-catalog/custom-integration/api/#usage) | `false`       |
