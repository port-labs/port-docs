---
sidebar_position: 4
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import DeleteDependents from '../../../../generalTemplates/_delete_dependents_git_explanation_template.md'

# Advanced

The GitLab integration supports additional flags to provide extra configuration options, making it easier to customize its behavior to suit your needs.

To use the advanced configuration and additional flags, let's add them as root keys to our integration configuration.   
For example, here's how we can add the `createMissingRelatedEntities` flag:

```yaml showLineNumbers
# highlight-next-line
createMissingRelatedEntities: false
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

Let's look at the advanced configuration parameters we can add to the [integration configuration](/build-your-software-catalog/sync-data-to-catalog/git/gitlab-v2/#configuration):

<Tabs groupId="config" queryString="parameter">

<TabItem label="Delete dependent entities" value="deleteDependent">

<DeleteDependents/>

- **Default value**: `false` (disabled).  
- **Use case**: Enable this flag if dependent entities should be deleted when the target entity is deleted.

</TabItem>

<TabItem label="Enable merge entity" value="enableMergeEntity">

With the `enableMergeEntity` parameter, you can specify whether to use the [create/update](/build-your-software-catalog/custom-integration/api?operation=create-update#usage) or [create/override](/build-your-software-catalog/custom-integration/api?operation=create-override#usage) strategy when creating entities listed in a `port.yml` file.

- **Default value**: `false` (uses create/override).  
- **Use case**: Set to `true` to allow external sources to update some properties while GitLab remains the source of truth for others.

</TabItem>

<TabItem value="createMissingRelatedEntities" label="Create missing related entities">

The `createMissingRelatedEntities` parameter enables automatic creation of placeholder entities in Port when they're referenced in relationships but don't yet exist in your software catalog.

- **Default value**: `true` to allow the GitLab app to create barebones related entities, in case those related entities do not exist in the software catalog.
- **Use case**: use `false` if you do not want this default behavior (do not create missing related entities).

</TabItem>

</Tabs>
