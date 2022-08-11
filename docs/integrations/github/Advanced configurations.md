---
sidebar_position: 6
---

# Advanced Configurations

## How to configure the GitHub app?

There are 2 ways to configure the GitHub app

1. For `single repository`: Creating a `.github` directory and create a `port-app-config.yml` file in it
2. For `all repositories` in organization: Creating a `.github-private` repository in the organization and create a `port-app-config.yml` file in it

### Example port-app-config.yml 

```yaml showLineNumbers
specPath: 
 - "**/port.yml"
defaultBlueprint: "{{ respoitoryName }}"
defaultTitle: "{{ repositoryName }}"
defaultIdentifier: "{{ repositoryName }}"
defaultPropertiesPath: .
defaultTeam: "Backend"
```

### Structure port-app-config.yml 

:::note
We also support putting "{{ repositoryName }}" for any config, which means the name will be taken from the repository name
:::
| Field | Type | Description | Default |
| ----------- | ----------- | ----------- | ----------- |
| `specPath` | `globPatterns[]` | The patterns which the port.yml files will be searched in | `**/port.yml`
| `defaultBlueprint`| `String` | The name of the default blueprint instead of providing it in the yaml | `null` 
| `defaultTitle` | `String` | The name of the default title instead of providing it in the yaml | `null` 
| `defaultIdentifier` | `String` | The name of the default identifier instead of providing it in the yaml.<br/><br/> * Please make sure you don't have duplicate identifier in different port.yml files | `null`
| `defaultTeam` | `String` | The name of the default title instead of providing it in the yaml | `null`
| `defaultPropertiesPath` | `String` | The path of the properties key (specify `.`) in order to make it the root path | `properties`