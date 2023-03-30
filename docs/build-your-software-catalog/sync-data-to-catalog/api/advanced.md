---
sidebar_position: 2
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";
import DeleteDependents from '../../../generalTemplates/\_delete_dependents_kubernetes_explanation_template.md'
import CreateMissingRelatedEntities from '../../../generalTemplates/\_create_missing_related_entities_api_explanation_template.md'

# Advanced

The following advanced query parameters are available:

<Tabs groupId="advanced" queryString="current-config-param" defaultValue="delete_dependents" values={[
{label: "Delete Dependents", value: "delete_dependents"},
{label: "Create Missing Related Entities", value: "create_missing_related_entities"},
]} >

<TabItem value="delete_dependents">

<DeleteDependents/>

- Default: `false` (disabled)
- Use case: Deletion of dependent Port entities. Must be enabled, if you want to delete a target entity (and its source entities) in a required relation.
- Available at `DELETE` API endpoint of a specific entity.

</TabItem>

<TabItem value="create_missing_related_entities">

<CreateMissingRelatedEntities/>

- Default: `false` (disabled)
- Use case: Creation of missing related Port entities. Must be enabled, if you want to create a source entity (and the target entity) even though the target entity doesn't exist.
- Available at `POST`, `PUT`, `PATCH` API endpoints of a specific entity.

</TabItem>

</Tabs>
