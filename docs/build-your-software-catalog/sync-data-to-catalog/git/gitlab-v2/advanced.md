---
sidebar_position: 3
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import DeleteDependents from '../../../../generalTemplates/_delete_dependents_git_explanation_template.md'

# Advanced

The GitLab integration supports additional configuration parameters that allow you to customize its behavior according to your needs.

## Using advanced configurations

The following advanced configuration parameters are available:

<Tabs groupId="config" queryString="parameter">

<TabItem label="Delete dependent entities" value="deleteDependent">

<DeleteDependents/>

- Default: `false` (disabled)
- Use case: Controls deletion of dependent Port entities. Must be enabled if you want to delete a target entity (and its source entities) in a required relation.

</TabItem>

<TabItem value="createMissingRelatedEntities" label="Create missing related entities">

The `createMissingRelatedEntities` parameter enables automatic creation of missing related Port entities when the target related entity doesn't exist in the software catalog.

- Default value: `true` (allows the GitLab integration to create basic related entities if they don't exist)
- Use case: Set to `false` to prevent automatic creation of missing related entities

</TabItem>

<TabItem value="webhookSecret" label="Webhook secret">

The `webhookSecret` parameter allows you to configure a secret token for webhook verification.

- Default value: None
- Use case: Adds an extra layer of security by verifying that webhook requests are coming from GitLab

</TabItem>

</Tabs>

All of the advanced configurations listed above can be added to the mapping on the data source page.

### Example Configuration

Here's an example of how to use these advanced parameters in your configuration:

````yaml
integration:
  identifier: my-gitlab-integration
  type: gitlab
  config:
    deleteDependent: true
    createMissingRelatedEntities: false
    webhookSecret: "your-secret-here"