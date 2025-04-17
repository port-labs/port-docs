---
sidebar_position: 3
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortYmlStructure from '../../\_port_yml_gitops_structure_template.md'
import BasicFileProperties from '../../\_basic_file_properties_template.md'
import RelativeFileProperties from '../../\_relative_file_properties_template.md'
import PortYmlIngestionPattern from '../../\_port_yml_ingestion_pattern_template.md'

# GitOps

Port's Bitbucket integration makes it possible to manage Port entities with a GitOps approach, making your code repositories into the source of truth for the various infrastructure assets you want to manage.

:::info Bitbucket Server (Self-Hosted)
This documentation covers GitOps for **Bitbucket Cloud**. 
For information about GitOps with Bitbucket Server (Self-Hosted), please refer to the [Bitbucket Server GitOps documentation](/build-your-software-catalog/custom-integration/webhook/examples/bitbucket-server/gitops.md).
:::


## 💡 Bitbucket GitOps common use cases

- Use Bitbucket as the source-of-truth for your **microservices**, **packages**, **libraries** and other software catalog assets.
- Allow developers to keep the catalog up-to-date, by making updates to files in their Git repositories.
- Create a standardized way to document software catalog assets in your organization.

## Managing entities using GitOps

To manage entities using GitOps, you will need to add a `port.yml` file to the **default branch** (usually `main`) of your repository.

Note that the `port.yml` file is not the same as the [`port-app-config.yml` file](/build-your-software-catalog/sync-data-to-catalog/git/bitbucket/#port-app-configyml-file) used to configure the BitBucket integration, and does not replace it.

The `port.yml` file can specify one or more Port entities that will be ingested to Port, and any change made to the `port.yml` file will also be reflected inside Port.

This configuration turns your Bitbucket repositories to the source-of-truth for the software catalog.


### GitOps `port.yml` file

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

### Ingesting repository file contents

<BasicFileProperties/>

#### Using relative paths

<RelativeFileProperties/>

## Examples

Check out the [example repository](https://github.com/port-labs/github-app-setup-example) for a microservice blueprint and a matching `port.yml` file which specifies a microservice entity.

## Capabilities

### Port.yml ingestion pattern

<PortYmlIngestionPattern provider="Bitbucket" />

## Advanced

Refer to the [advanced](../advanced.md) page for advanced use cases and configurations.
