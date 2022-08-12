---
sidebar_position: 6
---

# Advanced configuration

## How to configure the GitHub app?

There are 2 ways to configure the GitHub app

1. For `single repository`: Create a `.github` directory and create a `port-app-config.yml` file in it
2. For `all repositories` in organization: Create a `.github-private` repository in the organization and create a `port-app-config.yml` file in it

### Example `port-app-config.yml` 

```yaml showLineNumbers
specPath: 
 - "**/port.yml"
defaultBlueprint: "{{ respoitoryName }}"
defaultTitle: "{{ repositoryName }}"
defaultIdentifier: "{{ repositoryName }}"
defaultPropertiesPath: .
defaultTeam: "Backend"
```

### `port-app-config.yml` structure 

:::note
We also support putting "{{ repositoryName }}" for any config, which means the name will be taken from the repository name
:::
| Field | Type | Description | Default |
| ----------- | ----------- | ----------- | ----------- |
| `specPath` | [globPatterns](https://www.malikbrowne.com/blog/a-beginners-guide-glob-patterns)[] | A list of file path patterns that the app will search for port.yml files in | `**/port.yml`
| `defaultBlueprint`| `String` |  The identifier of the default blueprint to use if one is not provided in the `port.yml` file | `null` 
| `defaultTitle` | `String` | The title to use if one is not provided in the `port.yml` file | `null` 
| `defaultIdentifier` | `String` | The identifier to use if one is not provided in `the port.yml` file | `null`
| `defaultTeam` | `String` | The name of the default team to use if one is not provided in the `port.yml` file | `null`
| `defaultPropertiesPath` | `String` | Changing the `properties` location in the `port.yml` file, you can provide custom paths like `props`, `data` or any other key. (in order to make it a top level key you ahve to provide `.`).<br/> A common usecase is to reuse existing `yml` files within the repository without the need to change it to the `port.yml` default format | `properties`

:::caution
Please make sure you don't have duplicate identifier in different port.yml files when using the `defaultIdentifier` confiugration
:::