---
sidebar_position: 4
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import DeleteDependents from '../../../../generalTemplates/\_delete_dependents_git_explanation_template.md'

# Advanced

The GitLab integration supports additional flags to provide additional configuration, making it easier to configure its behavior to your liking.

To use the advanced configuration and additional flags, add them as a root key to your [integration configuration](./gitlab.md#the-integration-configuration), for example to add the
`createMissingRelatedEntities` flag:

```yaml showLineNumbers
# highlight-next-line
createMissingRelatedEntities: true
resources:
  - kind: merge-request
    selector:
      query: "true"
    port:
      entity:
        mappings:
        ... mappings configuration
```

## Using advanced configurations

The following advanced configuration parameters are available and can be added to the [integration configuration](./gitlab.md#the-integration-configuration):

<Tabs groupId="config" queryString="parameter">

<TabItem label="Spec path" value="specPath">

The `specPath` parameter specifies a list of [globPatterns](https://www.malikbrowne.com/blog/a-beginners-guide-glob-patterns)[] that Port's GitLab app will search for `port.yml` files in.

- Default value: `**/port.yml`
- Use case:
  - If you want the app to scan a different file than `port.yml` (for example, change configure the app to scan files named `my-port-config.yml` using the pattern `**/my-port-config.yml`);
  - If you want the app to ignore `port.yml` files in certain paths.

</TabItem>

<TabItem label="Delete dependent entities" value="deleteDependent">

<DeleteDependents/>

- Default: `false` (disabled)
- Use case: Deletion of dependent Port entities. Must be enabled, if you want to delete a target entity (and its source entities) in a required relation.

</TabItem>

<TabItem label="Enable merge entity" value="enableMergeEntity">

The `enableMergeEntity` parameter specifies whether to use the [create/update](../../api/api.md?operation=create-update#usage) or [create/override](../../api/api.md?operation=create-override#usage) strategy when creating entities listed in a `port.yml` file.

- Default value: `false` (use create/override)
- Use case: use `false` if you want GitLab to be the source-of-truth for catalog entities. Use `true` if you want to use GitLab as the source for some properties of entities in the catalog, and use other sources to for properties which are subject to change automatically.

</TabItem>

<TabItem value="createMissingRelatedEntities" label="Create missing related entities">

The `createMissingRelatedEntities` parameter is used to enable the creation of missing related Port entities automatically in cases where the target related entity does not exist in the software catalog yet.

- Default value: `false` (do not create missing related entities)
- Use case: use `true` if you want GitLab app to create barebones related entities, in case those related entities do not exist in the software catalog.

</TabItem>

</Tabs>
