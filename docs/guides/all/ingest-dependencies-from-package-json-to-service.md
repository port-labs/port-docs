---
title: Ingest dependencies from package.json file to service
displayed_sidebar: null
---

import PortTooltip from "/src/components/tooltip/tooltip.jsx"

# Ingest dependencies from a package.json file and relate them to service

This guide will demonstrate how to ingest dependencies from a `package.json` file and relate them to the corresponding service entities in Port.

:::info Prerequisites

- Ensure you have a Port account and have completed the [onboarding process](https://docs.port.io/quickstart).
- The `Service` blueprint should be created during the onboarding process.
- Ensure you have [GitHub installed and configured](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/git/github/#setup) in your environment.

:::

<br/>

Add the `Dependency` blueprint if it doesn't exist:

1. **Go to the [Builder](https://app.getport.io/settings/data-model)** in your Port portal.
2. **Click on "+ Blueprint"**.
3. **Click on the `{...}` button** in the top right corner, and choose "Edit JSON"
4. **Add this JSON schema**:

<details>
<summary><b> Dependency blueprint (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "dependency",
  "title": "Dependency",
  "icon": "Package",
  "schema": {
    "properties": {
      "package_name": {
        "icon": "DefaultProperty",
        "type": "string",
        "title": "Package name"
      },
      "semver_requirement": {
        "type": "string",
        "title": "Semver requirement"
      },
      "type": {
        "type": "string",
        "title": "Type",
        "enum": [
          "Production",
          "Development"
        ]
      },
      "url": {
        "type": "string",
        "title": "URL",
        "format": "url"
      }
    },
    "required": [
      "package_name",
      "semver_requirement"
    ]
  }
}

```
</details>

<br/>

### How to ingest dependencies from a `package.json` file

To ingest dependencies listed in `package.json` files, follow these steps:

1. **Go to the [data sources page](https://app.getport.io/settings/data-sources)** in your Port portal, and select your GitHub integration.
2. **Modify the mapping** to include the `file` kind with the configuration provided below:

<details>
<summary><b>Port Configuration (Click to expand)</b></summary>

```yaml showLineNumbers

  - kind: file
    selector:
      query: 'true'
      files:
        - path: '**/package.json'
    port:
      itemsToParse: .file.content.dependencies | to_entries
      entity:
        mappings:
          identifier: >-
            .item.key + "_" +  (.item.value |  gsub("\\^"; "caret_") |
            gsub("~"; "tilde_") |  gsub(">="; "gte_") |  gsub("<="; "lte_") |
            gsub(">"; "gt_") |  gsub("<"; "lt_") |  gsub("@"; "at_") |
            gsub("\\*"; "star") |  gsub(" "; "_"))
          title: .item.key + "@" + .item.value
          blueprint: '"dependency"'
          properties:
            package_name: .item.key
            semver_requirement: .item.value
```

</details>

:::info Configuration Details

- **`kind: file`** specifies that the source is a file, in this case, `package.json`.
- **`files:`** defines the path pattern to locate `package.json` files within your repositories.
- **`itemsToParse:`** identifies the specific array within the `package.json` (i.e., `dependencies`) that you want to parse into individual `dependency` entities.
- **`identifier:`** constructs a unique identifier for each dependency, accounting for special characters in the version string.
- **`properties:`** captures essential details like the package name and version.

:::

### How to Relate the Dependencies to the Service

Once the dependencies have been ingested, the next step is to establish relationships between these `dependency` entities and the corresponding `service` entities.

1. **Go to the [Builder](https://app.getport.io/settings/data-model)** in your Port portal, select the `Service` <PortTooltip id="blueprint">blueprint</PortTooltip>, and click on `New relation` to create a relation between the `service` and `dependency` blueprints.

2. **Add this JSON to establish the relationship**:

    ```json
    {
      "dependencies": {
        "title": "Dependencies",
        "target": "dependency",
        "required": false,
        "many": true
      }
    }
    ```
3. Head back to the [data sources page](https://app.getport.io/settings/data-sources) and add the mapping below:

<details>
<summary><b>Relation Mapping (Click to expand)</b></summary>

```yaml showLineNumbers

  - kind: file
    selector:
      query: 'true'
      files:
        - path: '**/package.json'
    port:
      entity:
        mappings:
          identifier: .repo.name
          blueprint: '"service"'
          properties: {}
          relations:
            dependencies: >-
              [.file.content.dependencies | to_entries | map( .key + "_" +
              (.value |
                gsub("\\^"; "caret_") |
                gsub("~"; "tilde_") |
                gsub(">="; "gte_") |
                gsub("<="; "lte_") |
                gsub(">"; "gt_") |
                gsub("<"; "lt_") |
                gsub("@"; "at_") |
                gsub("\\*"; "star") |
                gsub(" "; "_")
              ) ) | .[]]
```

</details>

:::info Mapping Details
This would establish a relation between the `service` and `dependency` entities based on the dependencies listed in the `package.json` file.
:::

<br/>
<img src='/img/guides/serviceDependencies.png' width='100%' border='1px' />


### Conclusion

By following these steps, you can effectively ingest dependencies from `package.json` files and relate them to the corresponding service entities in Port 🎉.

More relevant guides and examples:
- [Port's GitHub integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/git/github/)
- [Self-service actions and workflows](https://docs.port.io/create-self-service-experiences/setup-backend/github-workflow/)

