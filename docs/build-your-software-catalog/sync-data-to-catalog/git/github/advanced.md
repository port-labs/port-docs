---
sidebar_position: 4
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import DeleteDependents from '../../../../generalTemplates/\_delete_dependents_git_explanation_template.md'

# Advanced

The GitHub integration supports additional flags to provide additional configuration, making it easier to configure its behavior to your liking.

To use the advanced configuration and additional flags, add them as a root key to your [`port-app-config.yml`](./github.md#port-app-configyml-file) file, for example to add the
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

The following advanced configuration parameters are available and can be added to the [`port-app-config.yml`](./github.md#port-app-configyml-file) file:

<Tabs groupId="config" queryString="parameter">

<TabItem label="Spec path" value="specPath">

The `specPath` parameter specifies a list of [globPatterns](https://www.malikbrowne.com/blog/a-beginners-guide-glob-patterns) that Port's GitHub app will search for `port.yml` files in.

- **Default value**: `**/port.yml`
- **Use case**:
  - If you want the app to scan a different file than `port.yml` (for example, change configure the app to scan files named `my-port-config.yml` using the pattern `**/my-port-config.yml`);
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
- **Use case**: use `false` if you want GitHub to be the source-of-truth for catalog entities. Use `true` if you want to use GitHub as the source for some properties of entities in the catalog, and use other sources to for properties which are subject to change automatically.

</TabItem>

<TabItem value="createMissingRelatedEntities" label="Create missing related entities">

The `createMissingRelatedEntities` parameter is used to enable the creation of missing related Port entities automatically in cases where the target related entity does not exist in the software catalog yet.

- **Default value**: `true` to allow the GitHub app to create barebones related entities, in case those related entities do not exist in the software catalog.
- **Use case**: use `false` if you do not want this default behavior (do not create missing related entities).

</TabItem>

<TabItem value="enrichEntities" label="Enrich entities">

The `enrichEntitiesWithGitopsMetadata` parameter is used to enable the enrichment of Port entities that are managed by GitOps with additional metadata.

When the parameter is active, ingesting entities listed in a `port.yml` file to Port will include additional information such as the spec file path (for example: `port.yml`, `/path/to/port.yml`, etc.), the latest commit information and more.

The additional information is reported as a JSON object property in your GitOps managed entities. In order to view the information, your respective [blueprint](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/setup-blueprint.md) needs to include an [object property](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/object.md) to store the metadata. The default identifier this parameter sends data to is `gitopsMetadata`.

- **Default value**: `true` (enrich entities with GitOps metadata)
- **Use case**: use `true` if you want the GitHub app to enrich the Port entities managed by GitOps with additional JSON metadata.
  - Use the `gitopsMetadataProperty` to change the identifier of the `object` property, according to your blueprint schema definition (default property identifier: `gitopsMetadata`).

**Configuration example**

```yaml showLineNumbers
enrichEntitiesWithGitopsMetadata: true
gitopsMetadataProperty: myGitopsMetadata # the GitOps metadata will be sent to the "myGitopsMetadata" property of the blueprint's entities
```

</TabItem>

<TabItem value="closedPullRequests" label="Fetch closed pull requests">

Use the `closedPullRequests` parameter to enable the fetching of closed pull requests on re-sync.

- **Default value**: `false` (do not fetch closed pull requests).
- **Use case**: Useful for analyzing closed pull request history, such as DORA metrics.

 
Port will fetch the last 100 updated closed pull requests or those from the past 60 days, whichever comes first.


**Configuration example**

```yaml showLineNumbers
integrationConfig:
    resources:
    - kind: pull-request
      selector:
        query: "true"
# highlight-next-line
        closedPullRequests: true
    port:
      entity:
        mappings:
        ... mappings configuration
```

</TabItem>

</Tabs>
