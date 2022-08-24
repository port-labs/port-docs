---
sidebar_position: 7
---

# Advanced configuration

## How to configure the GitHub app?

There are 2 ways to configure the GitHub app

1. For a `single repository`: Create a `.github` directory and create a `port-app-config.yml` file in it
2. For `all repositories` in the organization: Create a `.github-private` repository in the organization and create a `port-app-config.yml` file in it

### Example `port-app-config.yml` 

```yaml showLineNumbers
specPath: 
 - "**/port.yml"
defaultBlueprint: "{{ respoitoryName }}"
defaultTitle: "{{ repositoryName }}"
defaultIdentifier: "{{ repositoryName }}"
defaultTeam: "Backend"
deleteDependentEntities: false
```

### `port-app-config.yml` structure 

:::note
We also support putting "{{ repositoryName }}" for any config, which means the name will be taken from the repository name
:::
| Field | Type | Description | Default |
| ----------- | ----------- | ----------- | ----------- |
| `specPath` | [globPatterns](https://www.malikbrowne.com/blog/a-beginners-guide-glob-patterns)[] | A list of file path patterns that the app will search for `port.yml` files in | `**/port.yml`
| `defaultBlueprint`| `String` |  The identifier of the default blueprint to use if one is not provided in the `port.yml` file | `null` 
| `defaultTitle` | `String` | The title to use if one is not provided in the `port.yml` file | `null` 
| `defaultIdentifier` | `String` | The identifier to use if one is not provided in the `port.yml` file | `null`
| `defaultTeam` | `String` | The name of the default team to use if one is not provided in the `port.yml` file | `null`
| `defaultPropertiesPath` | `String` | Changing the `properties` location in the `port.yml` file, you can provide custom paths like `props`, `data` or any other key. (in order to make it a top level key you ahve to provide `.`).<br/> A common usecase is to reuse existing `yml` files within the repository without the need to change it to the `port.yml` default format | `properties`
| `deleteDependentEntities` | `Boolean` | A flag to enable deletion of dependents entities (has required relation to an entity you wish to delete) | `false`

:::caution
Please make sure you don't have duplicate identifiers in different `port.yml` files when using the `defaultIdentifier` confiugration
:::

### Templating strings
In the `port-app-config.yml` file it's possible to also provide to any configuration a template string that will automatically be taken from the GitHub repo context.
Template strings are wrapped into brackets, for example: `{{ field }}`.


#### Supported template strings 

| Field                  | Description                       |
|------------------------|-----------------------------------|
| `{{ repositoryName }}` | The name of the GitHub repository |
