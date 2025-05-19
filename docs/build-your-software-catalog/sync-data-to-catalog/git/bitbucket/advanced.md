---
sidebar_position: 4
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import DeleteDependents from '../../../../generalTemplates/\_delete_dependents_git_explanation_template.md'

# Advanced

The Bitbucket integration supports additional flags to provide additional configuration, making it easier to configure its behavior to your liking.

## Using advanced configurations

The following advanced configuration parameters are available:

<Tabs groupId="config" queryString="parameter">

<TabItem label="Spec path" value="specPath">

The `specPath` parameter specifies a string that Port's Bitbucket app will use when constructing search paths leading to a `yml` file, every path in the repository which ends with the `specPath` value will be scanned.

- **Default value**: `port.yml`
- **Use case**:
  - If you want the app to scan a different file than `port.yml` (for example, change configure the app to scan files named `my-port-config.yml` using the pattern `my-port-config.yml`);
  - If you want the app to ignore `port.yml` files in certain paths.

</TabItem>

<TabItem label="Delete dependent entities" value="deleteDependent">

<DeleteDependents/>

- **Default value**: `false` (disabled)
- **Use case**: Deletion of dependent Port entities. Must be enabled, if you want to delete a target entity (and its source entities) in a required relation.

</TabItem>

<TabItem label="Enable merge entity" value="enableMergeEntity">

The `enableMergeEntity` parameter specifies whether to use the [create/update](/build-your-software-catalog/custom-integration/api?operation=create-update#usage) or [create/override](/build-your-software-catalog/custom-integration/api?operation=create-override#usage) strategy when creating entities listed in a `port.yml` file.

- **Default value**: `true` (use create/update)
- **Use case**: use `false` if you want Bitbucket to be the source-of-truth for catalog entities. Use `true` if you want to use Bitbucket as the source for some properties of entities in the catalog, and use other sources to for properties which are subject to change automatically.

</TabItem>

<TabItem value="createMissingRelatedEntities" label="Create missing related entities">

The `createMissingRelatedEntities` parameter is used to enable the creation of missing related Port entities automatically in cases where the target related entity does not exist in the software catalog yet.

- **Default value**: `true` to allow the Bitbucket app to create barebones related entities, in case those related entities do not exist in the software catalog.
- **Use case**: use `false` if you do not want this default behavior (do not create missing related entities).

</TabItem>


</Tabs>

All of the advanced configurations listed below can be added to the [`port-app-config.yml`](./bitbucket.md#port-app-configyml-file) file.
