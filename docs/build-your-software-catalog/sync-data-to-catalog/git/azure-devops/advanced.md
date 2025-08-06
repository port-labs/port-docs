---
sidebar_position: 4
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import DeleteDependents from '../../../../generalTemplates/\_delete_dependents_git_explanation_template.md'

# Advanced

The Azure Devops integration supports additional flags to provide additional configuration, making it easier to configure its behavior to your liking.

To use the advanced configuration and additional flags, add them as a root key to your [integration configuration](./azure-devops.md#the-integration-configuration), for example to add the
`createMissingRelatedEntities` flag:

```yaml showLineNumbers
# highlight-next-line
createMissingRelatedEntities: false
resources:
  - kind: pull-request
    selector:
      query: "true"
    port:
      entity:
        mappings:
        ... mappings configuration
```

## Using advanced configurations

The following advanced configuration parameters are available and can be added to the [integration configuration](./azure-devops.md#the-integration-configuration):

<Tabs groupId="config" queryString="parameter">

<TabItem label="Spec path" value="specPath">

The `specPath` parameter specifies a list of `string` or a single value `string` that Port's Azure Devops app will search for `port.yml` files in.

- **Default value**: `port.yml`
- **Use case**:
  - If you want the app to scan a different file than `port.yml` (for example, change configure the app to scan files named `my-port-config.yml` using the value `my-port-config.yml`);
  - If you want the app to ignore `port.yml` files in certain paths.

</TabItem>

<TabItem label="Delete dependent entities" value="deleteDependent">

<DeleteDependents/>

- **Default value**: `false` (disabled)
- **Use case**: Deletion of dependent Port entities. Must be enabled, if you want to delete a target entity (and its source entities) in a required relation.

</TabItem>

<TabItem label="Enable merge entity" value="enableMergeEntity">

The `enableMergeEntity` parameter specifies whether to use the [create/update](/build-your-software-catalog/custom-integration/api?operation=create-update#usage) or [create/override](/build-your-software-catalog/custom-integration/api?operation=create-override#usage) strategy when creating entities listed in a `port.yml` file.

- **Default value**: `false` (use create/override)
- **Use case**: use `false` if you want Azure Devops to be the source-of-truth for catalog entities. Use `true` if you want to use Azure Devops as the source for some properties of entities in the catalog, and use other sources to for properties which are subject to change automatically.

</TabItem>

<TabItem value="createMissingRelatedEntities" label="Create missing related entities">

The `createMissingRelatedEntities` parameter is used to enable the creation of missing related Port entities automatically in cases where the target related entity does not exist in the software catalog yet.

- **Default value**: `true` to allow the Azure Devops app to create barebones related entities, in case those related entities do not exist in the software catalog.
- **Use case**: use `false` if you do not want this default behavior (do not create missing related entities).

</TabItem>

<TabItem value="branch" label="Branch">

The Azure Devops integration listens to real-time events from the branch specified in the `branch` field which is set to `main` by default. This is configurable and you can set the `branch` parameter to the branch you want to listen to events from.

- **Default value**: `main` (default to the branch specified in the `branch` field.)
- **Use case**: `develop` if you want to listen to events from the `develop` branch of the repository.

:::note Use Default Branch

If you want to listen to events from the default branch of the repository, you can set the `useDefaultBranch` parameter to `true`.

:::

</TabItem>

<TabItem value="useDefaultBranch" label="Use Default Branch">

The Azure Devops integration by default listens to events from the `main` branch. If you want to listen to events from the default branch of the repository, you can set the `useDefaultBranch` parameter to `true`.

- **Default value**: `null` or `false` (default to the branch specified in the `branch` field.)
- **Use case**: `true` if you want to listen to events from the default branch of the repository.

</TabItem>
</Tabs>
