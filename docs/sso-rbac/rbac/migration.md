---
sidebar_position: 4
---

# Migration guide
:::warning Migration relevance
This migration guide is relevant for all users who created their Port account **before January 14, 2025**, even if they have already enabled the beta feature.  

Its purpose is to guide you through the migration process to use the new behavior and manage users and teams using dedicated blueprints.
:::

## Major changes

The migration includes several **major changes**:

1. New **blueprints** to represent and manage users and teams (only for organizations that did not enable the beta feature).

2. Blueprint **ownership** is now defined using a new property, as described [here](/sso-rbac/rbac/as-blueprints#the-ownership-property).

3. In **all places** where the team meta property ($team) is used, including Port's UI, API, and IaC, its value will be the entity's **`identifier`** (and not its **`title`** as it was before).

These changes will be applied once you trigger the migration. Once applied, some resources in your portal <b>might break</b>. 
The resources that might be affected are:
- Blueprints
- Blueprint permissions (only if managed using IaC, GitOps or directly from the API)
- Actions
- Action permissions
- Automations
- Page permissions (only if managed using IaC, GitOps or directly from the API)
- Integration mappings
- Webhook mappings

Some of the resources will be migrated automatically, while others will require manual intervention.

## Prepare for migration
Before running the migration, you can use [this script](https://github.com/port-labs/script-examples/tree/main/users-and-teams-as-blueprints-migration-visibility-script) to check the affected resources and see if they need to be migrated manually. The script will retrieve all affected resources and generate a report.
After downloading the script, follow the instructions in the README file to execute it.

:::info Security concerns
The script only queries the data from your portal, <b>it will not make any changes to your data</b>.  
The script is open source, you can review it before running it to see the implementation.
:::

### Migration report
Running the script will output an `output/index.html` file that contains the report. The report is divided into two main sections: resources that will be migrated **automatically** and resources that will require **manual intervention**.

### Resources that require manual intervention

This section includes resources that might be affected by the migration and will require manual intervention once the migration is triggered.

#### External ownership definitions

External resources that define ownership for blueprints (e.g. **Terraform** resources, **API** calls, etc.) will need to be updated to use the new [`Ownership` property](/sso-rbac/rbac/as-blueprints#ownership) in order to retain the same ownership behavior.

#### Calculation properties

<img src="/img/users-and-teams-migration/calculation-properties-to-be-reviewed.png" border='1px' />

Blueprints with calculation properties that based on the team meta property or the old teams relation identifier will be affected. The script will report all blueprints that have calculation properties based on those values.

For example, the following calculation property uses the old teams relation identifier that will be changed:
```json showLineNumbers
{
  ...
  "calculationProperties": {
    "calc": {
      "title": "calc",
      "calculation": ".relations.teams",
      "type": "array"
    }
  }
  ...
}
```

This change will <b>not be applied automatically</b>, you will need to review the blueprints and apply the changes manually.

#### Actions & Automations
<img src="/img/users-and-teams-migration/actions-and-automations-to-be-reviewed.png" border='1px' />
Actions and automations might be affected by the migration in two cases:
1. **User Inputs**: actions might have advanced input configurations based on the team meta property value or the teams relation identifier that will be changed. This typically occurs when using the `jqQuery` configuration in user inputs. Because the team meta property value will be changed to `identifier` instead of `title`, the `jqQuery` configuration might break and need to be reviewed.
2. **Mapping configurations**: actions and automations might have mapping configurations based on the team meta property value or the teams relation identifier that will be changed.
3. **Webhook**: use team-related fields in webhook bodies or URL parameters

The script will report all actions and automations that use the team meta property value or the teams relation identifier in their configuration.
This change will <b>not be applied automatically</b>. You will need to review them and apply the changes manually.

User inputs based on the team meta property value example:
```json showLineNumbers
{
  "userInputs": {
      "properties": {
        "service": {
          "type": "string",
          "format": "entity",
          "blueprint": "Service",
          "description": "The service to create",
          "visible": {
            "jqQuery": ".user.team | contains([\"My Team\"])"
          }
        },
      }
  }
}
```

Mapping values based on the team meta property value example:
```json showLineNumbers
{
  "mapping": {
    "entity": {
      "identifier": ".identifier",
      "team": ".relations.teams + [\"my_team\"] | unique"
    }
  }
}
```

#### Action dynamic permissions
<img src="/img/users-and-teams-migration/actions-dynamic-permissions-to-be-reviewed.png" border='1px' />
While explicit team permissions will be migrated to identifiers automatically as described in the [Permissions](#permissions) section, an action's dynamic permissions might have conditions based on the team meta property value or the teams relation identifier. These conditions might break and need to be reviewed.

The script will report all actions that use the team meta property value or the teams relation identifier in their dynamic permissions.

For example, the following action permissions based on the team meta property value and might break:
```json showLineNumbers
{
    "execute": {
        "roles": [],
        "users": [],
        "teams": [],
        "policy": {
        "queries": {
          "search_entity": {
            "rules": [
              {
                "value": "service",
                "operator": "=",
                "property": "$blueprint"
              }
            ],
            "combinator": "and"
          }
        },
        "conditions": [
          ".results.team | length == 0"
        ]
      }
    }
}
```

This change will <b>not be applied automatically</b>, you will need to review the dynamic permissions and apply the changes manually.

#### Integration & webhook mappings
<img src="/img/users-and-teams-migration/integrations-and-webhooks-mappings-to-be-reviewed.png" border='1px' />
Integration and webhook mappings ingesting data to the team meta property of entities might be affected. After the migration, the team meta property will expect team identifiers instead of titles, so the mapping for this value might break.<br/>
Mappings that manages with a `port.yaml` will appear also in the report since we can't know if they maps to the team meta property or not.<br/>
The script will report all integration and webhook mappings that ingest data to the team meta property.

For example, take the following mapping:
```yaml showLineNumbers
port:
  entity:
    mappings:
          identifier: .name
          title: .name
          #highlight-next-line
          team: '"My Team"'
          blueprint: '"service"'
          properties:
            readme: file://README.md
            url: .html_url
            language: .language
```
The team value `My Team` is the`title` of the team, it will need to be changed to the team's `identifier`.
Tries to map the 'My Team' value to the team meta property so it will need to be changed to the identifier:
```yaml showLineNumbers
port:
  entity:
    mappings:
          identifier: .name
          title: .name
          #highlight-next-line
          team: '"my_team"'
          blueprint: '"service"'
          properties:
            readme: file://README.md
            url: .html_url
            language: .language
```
This change will <b>not be applied automatically</b>, you will need to review the integrations mapping and apply the changes manually.

#### Pages
<img src="/img/users-and-teams-migration/pages-to-be-reviewed.png" border='1px' />
Page widgets might have configurations based on the teams relations old identifier that will be changed during the migration. These configurations might break and needs to be reviewed. The script will report all pages that use the teams relations old identifier in their widget configurations.

The main use case for this is adding the relation identifier to the `excludedFields` (excluded properties) configuration of a widget or in the `blueprintConfig` field. The blueprint config includes all filters, sorting, hidden and shown fields, and group-by fields of table widgets. If the old relation identifier is used in any of these properties, it will need to be changed to the new identifier.

This change will <b>not be applied automatically</b>. You will need to review the pages and apply the changes manually.

### Resources that will be migrated automatically
This section includes resources that will be migrated automatically once the migration is triggered.

#### Blueprints
<img src="/img/users-and-teams-migration/blueprints-to-be-migrated.png" border='1px' />
Besides calculation properties, all relevant blueprints will be migrated automatically to have the new ownership property. As described in the report, you can check which blueprints will be affected by the migration and what the changes will be.

The migration rules are:
1. Blueprints with entities that have `$team` value -> the ownership field will be set to `direct`.
   ```json showLineNumbers
   // Direct ownership
   {
     "identifier": "PackageVersion",
     "title": "Package Version",
     "ownership": {
       "type": "Direct"
     }
     ...
   }
   ```
2. Blueprints with team inheritance defined -> the ownership field will be set to `inherited` and the team inheritance definitions will be removed.

   For example, the following blueprint:
   ```json showLineNumbers
   // Team inheritance
   {
     "identifier": "PackageVersion",
     "title": "Package Version",
     "teamInheritance": {
       "path": "my_service"
     }
     ...
   }
   ```
   Will be changed to:
   ```json showLineNumbers
   // Inherited ownership
   {
     "identifier": "PackageVersion",
     "title": "Package Version",
     "ownership": {
       "type": "Inherited",
       "path": "my_service"
     }
     ...
   }
   ```
3. Blueprints with a direct relation to the Team blueprint and team inheritance defined on top of this relation -> the relation will be removed and the ownership field will be set to `direct`. This change only relevant to organizations with the beta version enabled.

    For example, the following blueprint:
    ```json showLineNumbers
    // Team inheritance on top of direct relation
    {
      "identifier": "PackageVersion",
      "title": "Package Version",
      "relations": {
        "teams": {
          "target": "_team",
          "many": true,
          "required": false
        }
      },
      "teamInheritance": {
        "path": "teams"
      }
      ...
    }
    ```
    Will be changed to:
    ```json showLineNumbers
    // Direct ownership
    {
      "identifier": "PackageVersion",
      "title": "Package Version",
      "relations": {},
      "ownership": {
        "type": "Direct"
      }
      ...
    }
    ```

While those changes will be applied automatically, if you manage blueprints using IaC, GitOps (Terraform, Pulumi, etc.) or directly by the API, you will need to apply the changes manually in your repository state.

#### Permissions
<img src="/img/users-and-teams-migration/permissions-to-be-migrated.png" border='1px' />
As the team meta property of entities will be changed from `title` to `identifier`, permissions with explicit team permissions will be migrated to use identifiers.
This change will be applied automatically for blueprints, actions, and page permissions.

For example, the following permissions:
```json showLineNumbers
{
  "permissions": {
    "teams": ["My Team"]
  }
}
```
Will need to be changed to:
```json showLineNumbers
{
  "permissions": {
    "teams": ["my_team"]
  }
}
```

While those changes will be applied automatically, if you manage blueprints using IaC, GitOps (Terraform, Pulumi, etc.) or directly by the API, you will need to apply the changes manually in your repository state.

## Execute the migration
Once you are ready to start the migration, send a POST request to a designated endpoint:
:::tip To obtain your bearer token:

1. Go to your [Port application](https://app.getport.io), click on the `...` button in the top right corner, and select `Credentials`. 
2. Click on the `Generate API token` button, and copy the generated token.
:::

```bash
curl -L -X POST 'https://api.getport.io/v1/blueprints/system/users-and-teams-as-blueprints' \
-H 'Authorization: <YOUR_BEARER_TOKEN>'
```
The migration will take a few minutes to complete.<br/>
Once the migration is complete, the new User and Team blueprints will be available in your portal along with all the new features and capabilities as described in the [Users and Teams as Blueprints](/sso-rbac/rbac/as-blueprints) guide.
:::info Script results after migration
Please note that running the script after completing the migration may still show resources as "affected". This is because the script looks for any team-related references, even if they have been properly migrated to use identifiers. Therefore, the script results should not be used to track migration progress or verify completion status.

If you need to verify your migration status, please review the actual changes made to your resources directly.
:::

## Post migration

### Terraform migration
In order to properly manage the `User` and `Team` blueprints using Terraform, you need to use the `port_system_blueprint` resource (and not the `port_blueprint` resource).  
This resource will extend the defined blueprint with the new specified properties and relations. This will make sure no drift will happen in the future if the base structure of the system blueprint will change.
The `User` and `Team` blueprints can not be created so don't forget to import them to your Terraform state.

The `port_system_blueprint` resource is supported in Terraform starting from version **2.2.0**.

### Migrating from a relation to ownership
The migration will create an `ownership` property only if you have team inheritance configured on the blueprint.  
Some users elect to manage ownership strictly on a relation, which will not translate to a correct ownership following the migration.

In order to migrate from a relation to ownership, follow these steps:
1. Make sure that the blueprint you are migrating has `Direct ownership` configured.
2. Head to the builder and find the blueprint you want to migrate. Click on the `...` button, and select `Migrate data`.
3. In the JQ mapping, paste the following:
```json
{
  "entity": {
    "team": ".relations.<RELATION_IDENTIFIER>"
  }
}
```
Make sure to replace `<RELATION_IDENTIFIER>` with the identifier of the relation to the `_team` blueprint.

This migration will take the value in the relation, and insert it into the ownership property.