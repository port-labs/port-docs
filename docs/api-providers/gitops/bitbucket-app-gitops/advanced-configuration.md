---
sidebar_position: 2
---

# Advanced configuration

## How to configure the Bitbucket app?

In order to configure the Bitbucket app:

Create a `port-app-config.yml` file in the root directory.

### Example `port-app-config.yml`

TODO: update this to the support params

```yaml showLineNumbers
specPath: "port.yml"
```

<!-- defaultBlueprint: "{{ respoitoryName }}"
defaultTitle: "{{ repositoryName }}"
defaultIdentifier: "{{ repositoryName }}"
defaultTeam: "Backend"
deleteDependentEntities: false -->

### `port-app-config.yml` structure

:::note
We also support putting "{{ repositoryName }}" for any config, which means the name will be taken from the repository name.
:::
| Field | Type | Description | Default |
| ----------- | ----------- | ----------- | ----------- |
| `specPath` | `String` | The app will search for all path that contain a substring of 'port.yml' | `port.yml`

<!-- | `defaultBlueprint`| `String` | Identifier of the default Blueprint to use, if one is not provided in the `port.yml` file | `null`
| `defaultTitle` | `String` | Title to use if one is not provided in the `port.yml` file | `null`
| `defaultIdentifier` | `String` | Identifier to use if one is not provided in the `port.yml` file | `null`
| `defaultTeam` | `String` | Name of the default team to use, if one is not provided in the `port.yml` file | `null`
| `defaultPropertiesPath` | `String` | Changes the `properties` location in the `port.yml` file, you can provide custom paths like `props`, `data` or any other key. (in order to make it a top-level key you have to provide `.`).<br/> A common use case is to reuse existing `yml` files within the repository without the need to change it to the `port.yml` default format | `properties`
| `deleteDependentEntities` | `Boolean` | Flag to enable deletion of dependent Entities - an Entity that has a required Relation with an Entity you wish to delete | `false` -->

:::caution
Please make sure you don't have duplicate identifiers in different `port.yml` files when using the `defaultIdentifier` configuration.
:::

### Templating strings

In the `port-app-config.yml` file it's possible to also provide any configuration a template string that will automatically be taken from the Bitbucket repo context.
Template strings are wrapped into brackets, for example: `{{ field }}`.

#### Supported template strings

| Field                  | Description                      |
| ---------------------- | -------------------------------- |
| `{{ repositoryName }}` | Name of the Bitbucket repository |
