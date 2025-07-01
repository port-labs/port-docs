---
sidebar_position: 3
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortYmlStructure from '../../\_port_yml_gitops_structure_template.md'
import BasicFileProperties from '../../\_basic_file_properties_template.md'
import RelativeFileProperties from '../../\_relative_file_properties_template.md'
import GitOpsPushEvent from '../../\_git_gitops_push_events_explanation.mdx'
import PortYmlNullProperties from '../../\_port_yml_null_properties.md'
import PortYmlIngestionPattern from '../../\_port_yml_ingestion_pattern_template.md'


# GitOps

Port's GitHub integration makes it possible to manage Port entities with a GitOps approach, making your code repositories the source of truth for the various infrastructure assets you want to manage.

Some common use cases include:

- Use GitHub as the source-of-truth for your **microservices**, **packages**, **libraries** and other software catalog assets.
- Allow developers to keep the catalog up-to-date, by making updates to files in their Git repositories.
- Create a standardized way to document software catalog assets in your organization.

Port offers two ways to manage entities using GitOps:

1. Using a dedicated `port.yml` file in your repository.
2. Using the GitHub integration mapping in your portal.

## Option 1: Use a `port.yml` file

This approach requires adding a `port.yml` file to the **default branch** (usually `main`) of your repository.

Note that the `port.yml` file is not the same as the [`port-app-config.yml` file](/build-your-software-catalog/sync-data-to-catalog/git/github/#port-app-configyml-file) used to configure the GitHub integration, and does not replace it. 

The `port.yml` file can specify one or more Port entities that will be ingested to Port, and any change made to the `port.yml` file will also be reflected inside Port.

:::tip Github app
To manage entities using GitOps and the `port.yml` file, Port's [Github app](/build-your-software-catalog/sync-data-to-catalog/git/github/#setup) must be installed, as it listens to `push` events sent from Github.

This means that if the `port.yml` file exists in the repository before installing the app, it will not be picked up automatically. You will need to make some update to the `port.yml` file and push it to the repository in order for the Git app to properly track and ingest the entity information.
:::

The `port.yml` file is how you specify your Port entities that are managed using GitOps and whose data is ingested from your Git repositories.

Here are examples for valid `port.yml` files:

<Tabs groupId="format">

<TabItem value="single" label="Single entity">

```yaml showLineNumbers
identifier: myEntity
title: My Entity
blueprint: myBlueprint
properties:
  myStringProp: myValue
  myNumberProp: 5
  myUrlProp: https://example.com
relations:
  mySingleRelation: myTargetEntity
  myManyRelation:
    - myTargetEntity1
    - myTargetEntity2
```

</TabItem>

<TabItem value="multiple" label="Multiple entities">

```yaml showLineNumbers
- identifier: myEntity1
  title: My Entity1
  blueprint: myFirstBlueprint
  properties:
    myStringProp: myValue
    myNumberProp: 5
    myUrlProp: https://example.com
  relations:
    mySingleRelation: myTargetEntity
    myManyRelation:
      - myTargetEntity1
      - myTargetEntity2
- identifier: myEntity
  title: My Entity2
  blueprint: mySecondBlueprint
  properties:
    myStringProp: myValue
    myNumberProp: 5
    myUrlProp: https://example.com
```

</TabItem>

</Tabs>

Since both of the valid `port.yml` formats follow the same structure, the following section will explain the format based on the single entity example.

### `port.yml` structure

<PortYmlStructure/>

<PortYmlNullProperties/>

### Ingesting repository file contents

<BasicFileProperties/>

#### Using relative paths

<RelativeFileProperties/>

## Option 2: Use the integration mapping

Every integration in Port has a dedicated [mapping configuration](/build-your-software-catalog/customize-integrations/configure-mapping) that allows you to specify which resources to ingest from the integration into Port.

In the case of the GitHub integration, one of the supported resources is the `file` resource, which allows you to ingest file contents from a repository into your portal.

To use this approach, you will need to edit your GitHub integration mapping and add a `file` block that specifies which files to ingest.  
To edit a mapping configuration:

1. Go to the [data sources page](https://app.getport.io/settings/data-sources) of your portal.
2. Under `Exporters`, find the GitHub data source and click on it.
3. Scroll down to the `Mapping` section and add a `file` block to the `resources` array.

For example, say you want to ingest a `package.json` file form your repository. You can add the following to your GitHub integration mapping:

```yaml
resources:
  ...
  - kind: file
    selector:
      query: 'true'
      files:
        - path: package.json
    port:
      entity:
        mappings:
          identifier: .file.name
          blueprint: '"file"'
          properties:
            content: .file.content
```

The `selector.files.path` key also supports glob patterns, so you can ingest multiple files by matching against a pattern and create an entity in Port for each one, for example:

```yaml
- kind: file
  selector:
    query: 'true'
    files:
      - path: 'resources/*.yml'
```

### Advantages

- **Resync support**: Since this approach uses the integration mapping, a resync of the integration will update the entities in Port with the latest file contents.

- **Data manipulation**: Since this approach uses the integration mapping, `jq` is supported and can be used to transform the file contents before ingestion.

## Examples

Check out the [example repository](https://github.com/port-labs/github-app-setup-example) for a microservice blueprint and a matching `port.yml` file which specifies a microservice entity.

## Capabilities

### Port.yml ingestion pattern

<PortYmlIngestionPattern provider="GitHub" />

## Advanced

Refer to the [advanced](../advanced.md) page for advanced use cases and configurations.
