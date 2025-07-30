---
sidebar_position: 3
title: Migrate data
sidebar_label: Migrate data
---

import ApiRef from "/docs/api-reference/\_learn_more_reference.mdx"

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Migrate Blueprint Data

When evolving your software catalog, you may need to migrate existing [entities](/build-your-software-catalog/sync-data-to-catalog/#entities) to reflect changes in your [blueprint](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/) structure. Port provides a simple approach to migrate all entities of a blueprint efficiently and safely.

## When to migrate data

Data migration becomes necessary when you need to:

- **Transform data format**: Change property values and/or merge and seperate properties in existing blueprints.
- **Update relations**: Modify existing relations between blueprints.

:::info Blueprint schema evolution
After migrating data, if you want to revert the changes, you will need to create a new migration from scratch.
:::

## How to migrate data

### Using the UI
To migrate data using Port UI, go to the [Builder page](https://app.getport.io/settings/data-model) of your portal and select your desired **blueprint**.  
Click on the `...` button of the blueprint you want to migrate, and select `Migrate data` from the dropdown menu.

Below are some example screenshots to help you understand the migration process.
#### Selecting the source blueprint

<img src='/img/build-your-software-catalog/custom-integrations/configue-data-model/migrating-data/three-dots-on-blueprint-in-builder.png' width='60%' />

*In this step, you choose the blueprint you want to migrate data from. This is done from the the Builder Page, where you can access the migration option from the actions menu.*

:::warning Locking operations
We recommend locking updates to the blueprint during migration to ensure data integrity as updates might fail for entities registered during the migrations.
:::


#### Mapping properties and relations

<img src='/img/build-your-software-catalog/custom-integrations/configue-data-model/migrating-data/migration-mapping-screen.png' width='60%' />

*Here, you are presented with a mapping interface. You can match properties and relations from the source blueprint to those in the target blueprint. This ensures that your data is correctly transformed during the migration.*

#### Reviewing the migration plan

<img src='/img/build-your-software-catalog/custom-integrations/configue-data-model/migrating-data/test-jq-mapping.png' width='60%' />

*Before executing the migration, you can review a summary of the planned changes. This includes a preview of how entities will look after migration, allowing you to verify that all mappings are correct and JQ checks out.*

#### Migration progress and completion

<img src='/img/build-your-software-catalog/custom-integrations/configue-data-model/migrating-data/migrated-successfully.png' width='60%' />

*During the migration, you can monitor progress in real time. Once the migration is complete, you will see a confirmation message and can review the results directly in the UI.*


### Using the API

For detailed API documentation and examples on how to create migrations programmatically, see the [Create a Migration API reference](/api-reference/create-a-migration).

## Troubleshoot migration issues

If all entities fail to migrate, the migration status will display **"Migration failed"** in red.  
If only some entities fail, the status will show **"Migrated with errors"**.  
You can hover over the status to see a tooltip indicating how many entities failed.

*Example: If 3 out of 10 entities failed, hovering over "Migrated with errors" will show "3 entities failed to migrate".*