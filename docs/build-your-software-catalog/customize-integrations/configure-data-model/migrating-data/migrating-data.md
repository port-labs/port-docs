---
sidebar_position: 3
title: Migrating data
sidebar_label: Migrating data
---

import ApiRef from "/docs/api-reference/\_learn_more_reference.mdx"

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Migrating Blueprint Data

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
To migrate data using Port UI, go to the **Builder Page** and select your desired **Blueprint**.  
Click the three dots menu of the blueprint you want to migrate, and select **Migrate data** from the dropdown menu.


### Visual walkthrough: Migrating data in Port

Below are some example screenshots to help you understand the migration process in Port UI.
#### Selecting the source blueprint

![Selecting the source blueprint](/img/build-your-software-catalog/custom-integrations/configue-data-model/migrating-data/three-dots-on-blueprint-in-builder.png)

*In this step, you choose the blueprint you want to migrate data from. This is done from the the Builder Page, where you can access the migration option from the actions menu.*

:::warning Locking operations
We recommend locking updates to the blueprint during migration to ensure data integrity as updates might fail for entities registered during the migrations.
:::


#### Mapping properties and relations

![Mapping properties and relations](/img/build-your-software-catalog/custom-integrations/configue-data-model/migrating-data/migration-mapping-screen.png)

*Here, you are presented with a mapping interface. You can match properties and relations from the source blueprint to those in the target blueprint. This ensures that your data is correctly transformed during the migration.*

#### Reviewing the migration plan

![Reviewing the migration plan](/img/build-your-software-catalog/custom-integrations/configue-data-model/migrating-data/test-jq-mapping.png)

*Before executing the migration, you can review a summary of the planned changes. This includes a preview of how entities will look after migration, allowing you to verify that all mappings are correct and JQ checks out.*

#### Migration progress and completion

![Migration progress and completion](/img/build-your-software-catalog/custom-integrations/configue-data-model/migrating-data/migrated-successfully.png)

*During the migration, you can monitor progress in real time. Once the migration is complete, you will see a confirmation message and can review the results directly in the Port UI.*


### Using the API

Port provides a dedicated migration endpoint that handles the entire migration process:

<Tabs groupId="migration" defaultValue="curl" values={[
{label: "cURL", value: "curl"},
{label: "JavaScript", value: "javascript"},
{label: "Python", value: "python"}
]}>

<TabItem value="curl">

```bash showLineNumbers
# Create a migration using Port's dedicated endpoint
curl -X 'POST' \
  'https://api.getport.io/v1/migrations' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
  "sourceBlueprint": "oldService",
  "mapping": {
    "blueprint": "newService",
    "filter": ".status == \"active\"",
    "itemsToParse": ".entities",
    "entity": {
      "identifier": ".identifier",
      "title": ".title",
      "icon": ".icon",
      "team": ".team",
      "properties": {
        "name": ".properties.serviceName",
        "version": ".properties.version",
        "environment": ".properties.env"
      },
      "relations": {
        "team": ".relations.owner",
        "dependencies": ".relations.dependsOn"
      }
    }
  }
}'
```

</TabItem>

<TabItem value="javascript">

```javascript showLineNumbers
// Example: Create migration using Port's API
async function createMigration(sourceBlueprint, targetBlueprint, mapping) {
  const migrationPayload = {
    sourceBlueprint: sourceBlueprint,
    mapping: {
      blueprint: targetBlueprint,
      filter: ".status == \"active\"", // Optional: filter entities
      itemsToParse: ".entities",
      entity: {
        identifier: ".identifier",
        title: ".title",
        icon: ".icon",
        team: ".team",
        properties: mapping.properties || {},
        relations: mapping.relations || {}
      }
    }
  };

  const response = await fetch('https://api.getport.io/v1/migrations', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_TOKEN',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(migrationPayload)
  });

  return response.json();
}

// Usage example
const propertyMapping = {
  properties: {
    name: ".properties.serviceName",
    version: ".properties.version",
    environment: ".properties.env"
  },
  relations: {
    team: ".relations.owner",
    dependencies: ".relations.dependsOn"
  }
};

createMigration('oldService', 'newService', propertyMapping);
```

</TabItem>

<TabItem value="python">

```python showLineNumbers
import requests
import json

def create_migration(source_blueprint, target_blueprint, mapping, api_token):
    """Create a migration using Port's dedicated migration endpoint"""
    
    migration_payload = {
        "sourceBlueprint": source_blueprint,
        "mapping": {
            "blueprint": target_blueprint,
            "filter": ".status == \"active\"",  # Optional: filter entities
            "itemsToParse": ".entities",
            "entity": {
                "identifier": ".identifier",
                "title": ".title",
                "icon": ".icon",
                "team": ".team",
                "properties": mapping.get("properties", {}),
                "relations": mapping.get("relations", {})
            }
        }
    }
    
    response = requests.post(
        'https://api.getport.io/v1/migrations',
        headers={
            'Authorization': f'Bearer {api_token}',
            'Content-Type': 'application/json'
        },
        json=migration_payload
    )
    
    return response.json()

# Usage example
property_mapping = {
    "properties": {
        "name": ".properties.serviceName",
        "version": ".properties.version", 
        "environment": ".properties.env"
    },
    "relations": {
        "team": ".relations.owner",
        "dependencies": ".relations.dependsOn"
    }
}

result = create_migration('oldService', 'newService', property_mapping, 'YOUR_TOKEN')
```

</TabItem>
</Tabs>

<ApiRef />

## Troubleshooting migration issues

:::warning Failed/Partially failed migrations and how to spot them
If all entities fail to migrate, the migration status will display **"Migration failed"** in red.  
If only some entities fail, the status will show **"Migrated with errors"**.  
You can hover over the status to see a tooltip indicating how many entities failed.

*Example: If 3 out of 10 entities failed, hovering over "Migrated with errors" will show "3 entities failed to migrate".*

:::