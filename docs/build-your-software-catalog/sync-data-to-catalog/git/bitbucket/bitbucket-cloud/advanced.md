---
sidebar_position: 4
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import DeleteDependents from '../../../../../generalTemplates/\_delete_dependents_git_explanation_template.md'

# Advanced

The Bitbucket integration supports additional flags to provide additional configuration, making it easier to configure its behavior to your liking.

## Using advanced configurations

The following advanced configuration parameters are available:

<Tabs groupId="config" queryString="parameter">

<TabItem label="Delete dependent entities" value="deleteDependent">

<DeleteDependents/>

- **Default value**: `false` (disabled)
- **Use case**: Deletion of dependent Port entities. Must be enabled, if you want to delete a target entity (and its source entities) in a required relation.

</TabItem>

<TabItem value="createMissingRelatedEntities" label="Create missing related entities">

The `createMissingRelatedEntities` parameter is used to enable the creation of missing related Port entities automatically in cases where the target related entity does not exist in the software catalog yet.

- **Default value**: `true` to allow the Bitbucket app to create barebones related entities, in case those related entities do not exist in the software catalog.
- **Use case**: use `false` if you do not want this default behavior (do not create missing related entities).

</TabItem>

<TabItem value="repoFilter" label="Filter repositories">

The `repoFilter` parameter is used to [narrow down data fetched](https://developer.atlassian.com/cloud/bitbucket/rest/api-group-repositories/#api-repositories-workspace-get) for repositories with a specific set of query parameters.

- **Default value**: `None` to fetch all repositories.
- **Use case**: set this in your configuration if you want to opt into this behavior.
  - **role**: Users can optionally specify role with one of the following values: `member`, `contributor`, `admin`, `owner`.
  - **q**: Users can optionally specify q as a search query string to filter repositories.

</TabItem>

</Tabs>

All of the advanced configurations listed above can be added to the mapping on the data source page.
