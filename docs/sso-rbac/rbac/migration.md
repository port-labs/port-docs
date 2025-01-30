---
sidebar_position: 4
---

# Migration
:::warning Migration relevance
This migration guide is relevant only for users who created their Port account **before** January 14, 2025.
Its purpose is to guide you through the migration process to the new mechanism to manage users and teams using dedicated blueprints.
:::

## Changes of the migration
The migration includes two major changes:
1. Blueprint ownership configuration as described [here](/sso-rbac/rbac/as-blueprints#the-ownership-property)
2. `$team` value of entities changed from title to identifier

These changes will be applied once to trigger the migration. Once applied, some resources in your portal <b>might break</b>.
The resources that might be affected are:
- Blueprints (only if managed using IaC or GitOps)
- Blueprint permissions (only if managed using IaC or GitOps)
- Actions
- Action permissions
- Automations
- Page permissions (only if managed using IaC or GitOps)
- Integration mappings
- Webhook mappings

Some of the resources will be migrated automatically, while others will require manual intervention.
To prepare for the migration, you can follow the steps described in the next section.

## Preparing for the migration
Before running the migration, you can check the affected resources and see if they need to be migrated manually.
To do this, you can use [this script](https://github.com/port-labs/script-examples/tree/main/users-and-teams-as-blueprints-migration-visibility-script) provided by us.
The script will retrieve all affected resources and generate a report with the resources that need to be migrated manually.
After downloading the script, follow the instructions in the README.md file to execute it.

:::info Security concerns
The script only queries the data from your portal, <b>it won't make any changes to your data</b>.
The code of the script is open source, and you can review it before running it in case of security concerns.
:::

### The migration changes report
Once you run the script, you will get a report with the resources that will be affected by the migration.
The report will be in the `index.html` file.<br/>
The report is divided into two main sections: resources that will be migrated automatically and resources that will require manual intervention.
Each section contains the resources that will be affected by the migration.

### Resources that will be migrated automatically

#### Blueprints
<img src="/img/users-and-teams-migration/blueprints-to-be-migrated.png" border='1px' />
Blueprints will be migrated automatically. As described in the report, you can check which blueprints will be affected by the migration and what the changes will be.
The migration rules are:
1. Blueprints with entities that have `$team` value -> the ownership field will be set to `direct`.
```json
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
```json
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
```json
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
```json
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
```json
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

While those changes will be applied automatically, if you manage blueprints using IaC or GitOps (Terraform, Pulumi, etc.), you will need to apply the changes manually in your repository state.

#### Permissions
<img src="/img/users-and-teams-migration/permissions-to-be-migrated.png" border='1px' />
As the team meta property of entities will be changed from title to identifier, permissions with explicit team permissions will be migrated to use identifiers.
This change will be applied automatically for blueprints, actions, and page permissions.

For example the current permissions:
```json
{
  "permissions": {
    "teams": ["My Team"]
  }
}
```
Will need to be changed to:
```json
{
  "permissions": {
    "teams": ["my_team"]
  }
}
```

While those changes will be applied automatically, if you manage blueprints using IaC or GitOps (Terraform, Pulumi, etc.), you will need to apply the changes manually in your repository state.

### Resources that will require manual intervention
#### Actions
<img src="/img/users-and-teams-migration/actions-to-be-reviewed.png" border='1px' />
Actions might have advanced input configurations based on the team meta property value or the teams relation identifier that will be changed. This typically occurs when using the `jqQuery` configuration in user inputs. Because the team meta property value will be changed to identifier instead of title, the `jqQuery` configuration might break and need to be reviewed. The script will report all actions that use the team meta property value or the teams relation identifier in their configuration.

For example the current action:
```json
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
Will need to be changed to:
```json
{
  "userInputs": {
      "properties": {
        "service": {
          "type": "string",
          "format": "entity",
          "blueprint": "Service",
          "description": "The service to create",
          "visible": {
            "jqQuery": ".user.team | contains([\"my_team\"])"
          }
        },
      }
  }
}
```

This change will <b>not be applied automatically</b>, you will need to review the actions and apply the changes manually.

#### Automations
Automations might need to be reviewed if they:
1. Update or modify team relations in their mapping configurations
2. Use team-related fields in webhook bodies or URL parameters

For example, an automation that assigns users to teams might need to be updated if it's using the team relations field in its mapping:
```json
{
  "mapping": {
    "entity": {
      "identifier": ".identifier",
      "team": ".relations.teams + [\"my_team\"] | unique"
    }
  }
}
```

The script will report all automations that contain any team-related references that might be affected by the migration.

This change will <b>not be applied automatically</b>. You will need to review the automations and apply the changes manually.

#### Action permissions
<img src="/img/users-and-teams-migration/actions-permissions-to-be-reviewed.png" border='1px' />
While explicit team permissions will be migrated to identifiers automatically, an action's dynamic permissions might have conditions based on the team meta property value or the teams relation identifier. These conditions might break and need to be reviewed. The script will report all actions that use the team meta property value or the teams relation identifier in their dynamic permissions.

For example the current action:
```json
{
    "execute": {
        "roles": [],
        "users": [],
        "teams": [],
        "policy": {
            "queries": {
                "executingUser": {
                    "rules": [
                        {
                            "value": "_user",
                            "operator": "=",
                            "property": "$blueprint"
                        },
                        {
                            "value": "{{.trigger.user.email}}",
                            "operator": "=",
                            "property": "$identifier"
                        }
                    ],
                    "combinator": "and"
                },
            },
            "conditions": [
                "(.results.executingUser.entities | first | .relations.teams) as $executerTeam | $executerTeam | contains([\"My Team\"])"
            ]
        }
    }
}
```
Will need to be changed to:
```json
{
    "execute": {
        "roles": [],
        "users": [],
        "teams": [],
        "policy": {
            "queries": {
                "executingUser": {
                    "rules": [
                        {
                            "value": "_user",
                            "operator": "=",
                            "property": "$blueprint"
                        },
                        {
                            "value": "{{.trigger.user.email}}",
                            "operator": "=",
                            "property": "$identifier"
                        }
                    ],
                    "combinator": "and"
                },
            },
            "conditions": [
                "(.results.executingUser.entities | first | .relations.teams) as $executerTeam | $executerTeam | contains([\"my_team\"])"
            ]
        }
    }
}
```

This change will <b>not be applied automatically</b>, you will need to review the actions and apply the changes manually.

#### Integration mappings
<img src="/img/users-and-teams-migration/integrations-to-be-reviewed.png" border='1px' />
Integration mappings ingesting data to the team meta property of entities will be affected. After the migration, the team meta property will expect team identifiers instead of titles, so the mapping for this value might break.
The script will report all integration mappings that ingest data to the team meta property.

For example the current integration mapping:
```yaml
port:
  entity:
    mappings:
          identifier: .name
          title: .name
          team: '"My Team"'
          blueprint: '"service"'
          properties:
            readme: file://README.md
            url: .html_url
            language: .language
```

Tries to map the 'My Team' value to the team meta property so it will need to be changed to the identifier.
This change will <b>not be applied automatically</b>, you will need to review the integrations mapping and apply the changes manually.

#### Webhook mappings
<img src="/img/users-and-teams-migration/webhooks-to-be-reviewed.png" border='1px' />
Webhook changes are very similar to the integration mapping changes. The script will report all webhook mappings that ingest data to the team meta property.
This change will <b>not be applied automatically</b>. You will need to review the webhooks and apply the changes manually.

#### Pages
<img src="/img/users-and-teams-migration/pages-to-be-reviewed.png" border='1px' />
Page widgets might have configurations based on the teams relations old identifier that will be changed during the migration. These configurations might break and need to be reviewed. The script will report all pages that use the teams relations old identifier in their widget configurations.
The main use case for this is adding the relation identifier to the `excludedFields` property of a widget or in the `blueprintConfig` property. The blueprint config includes all filters, sorting, hidden and shown fields, and group-by fields of table widgets. If the old relation identifier is used in any of these properties, it will need to be changed to the new identifier.

This change will <b>not be applied automatically</b>. You will need to review the pages and apply the changes manually.

:::info Script results after migration
Please note that running the script after completing the migration may still show resources as "affected". This is because the script looks for any team-related references, even if they have been properly migrated to use identifiers. Therefore, the script results should not be used to track migration progress or verify completion status.

If you need to verify your migration status, please review the actual changes made to your resources directly.
:::


## Execute the migration
To start the migration of management of users and teams as blueprints, send a POST request to a designated endpoint:
:::tip To obtain your bearer token:

1. Go to your [Port application](https://app.getport.io), click on the `...` button in the top right corner, and select `Credentials`. 
2. Click on the `Generate API token` button, and copy the generated token.
:::

```bash
curl -L -X POST 'https://api.getport.io/v1/blueprints/system/users-and-teams-as-blueprints' \
-H 'Authorization: <YOUR_BEARER_TOKEN>'
```