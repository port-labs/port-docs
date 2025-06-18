---
displayed_sidebar: null
title: Automatically set relations between entities with automation
description: Save time and reduce errors by automating entity relations without writing integration code. Learn how to automatically link service entities to their owning teams.
---

# Automatically set relations between entities with automation

This guide demonstrates how to set up an automation in Port that automatically creates relations between entities. We will use a specific example of automatically linking new service entities to their owning teams based on GitHub repository metadata.

Once implemented, when a new service entity is created with a repository relation, the automation will automatically link it to the appropriate team based on the GitHub organization name.

## Common use cases

- **Team ownership**: Automatically link services to their owning team based on repository metadata
- **Environment mapping**: Connect deployments to their target environments based on branch names or tags  
- **Service dependencies**: Link services to their dependencies based on configuration files or API calls
- **Infrastructure relationships**: Connect cloud resources to the services that consume them based on tags or naming conventions

## Prerequisites

This guide assumes the following:
- You have a Port account and have completed the [onboarding process](https://docs.port.io/getting-started/overview).
- Port's [GitHub app](/build-your-software-catalog/sync-data-to-catalog/git/github/) is installed in your account.
- You have setup [automatic discovery](https://docs.port.io/getting-started/set-up-automatic-discovery) between the `service` and `repository` blueprints.
- Permissions to create and edit Port [automations](https://docs.port.io/actions-and-automations/define-automations/).

## Set up data model

After completing the onboarding process, you should have both a `service` blueprint and a `team` blueprint.

If you have installed the [GitHub app](/build-your-software-catalog/sync-data-to-catalog/git/github/), you should have a `repository` blueprint and 
your `service` blueprint should have a `repository` relation.  Now we need to add a relation between the `service` and the `team` blueprints.

<h3> Add team relation to the service blueprint </h3>

1. Go to your [Builder](https://app.getport.io/settings/data-model) page.

2. Find and click on the `Service` blueprint.

3. Click on `New relation`.

4. Fill out the form:
   - **Title**: `Owning Team`
   - **Identifier**: `owning_team`
   - **Target Blueprint**: `Team`
   - **Limit**: `1 entity`
   - **Required**: False

5. Click `Create` to add the relation.

## Set up the automation

Now let's create an automation that automatically sets the team relation when a service is created.

1. Go to the [Automations page](https://app.getport.io/settings/automations) in your portal.

2. Click on `+ Automation` to create a new automation.

3. Copy and paste the following JSON structure for your automation:

        <details>
        <summary><b>Auto-assign service owner (Click to expand)</b></summary>

        ```json showLineNumbers
            {
            "identifier": "auto_assign_service_owner",
            "title": "Auto-assign Service Owner",
            "description": "Automatically assigns services to teams based on repository owner",
            "trigger": {
                "type": "automation",
                "event": {
                    "type": "ENTITY_CREATED",
                    "blueprintIdentifier": "service"
                },
                "condition": {
                    "type": "JQ",
                    "expressions": [
                        ".diff.after.relations.repository != null"
                    ],
                    "combinator": "and"
                }
            },
            "invocationMethod": {
                "type": "UPSERT_ENTITY",
                "blueprintIdentifier": "service",
                "mapping": {
                    "identifier": "{{ .event.diff.after.identifier }}",
                    "title": "{{ .event.diff.after.title }}",
                    "properties": {},
                    "relations": {
                        "repository": "{{ .event.diff.after.relations.repository }}",
                        "owning_team": "{{ .event.diff.after.relations.repository | split(\"_\") | .[0] | split(\"/\") | .[1] | gsub(\"-\"; \"_\") }}"
                    }
                }
            },
            "publish": true
            }
        ```

        </details>

4. Click `Save` to create the automation.


## How the automation works

When a service entity is created with a repository relation, the automation will:

1. Extract the GitHub organization from the repository identifier (e.g., `myorganization/acme-corp_my-service` → `acme_corp`)

2. Automatically set the `owning_team` relation to `acme_corp` (assuming you have a team with that identifier)

3. The service is now linked to its owning team

The automation uses this JQ expression to extract the team name:
```jq
.event.diff.after.relations.repository | split("_") | .[0] | split("/") | .[1] | gsub("-"; "_")
```
This expression works as follows:
1. `split("_")` splits `myorganization/acme-corp_my-service` → `["myorganization/acme-corp", "my-service"]`

2. `.[0]` takes the first part → `"myorganization/acme-corp"`

3. `split("/")` splits that → `["myorganization", "acme-corp"]`

4. `.[1]` takes the second part → `"acme-corp"`

5. `gsub("-"; "_")` converts hyphens to underscores → `"acme_corp"`

:::tip Team naming convention
This automation assumes your team identifiers use underscores and match your GitHub organization names, and that repository identifiers follow the pattern `username/organization_repository-name`. If your naming convention is different, you'll need to adjust the JQ expression in the `owning_team` mapping accordingly.
:::

## Customizations

You can customize this automation to fit your specific naming conventions:

<h3> Different repository patterns </h3>

1. If your repository naming convention uses dashes instead of underscores:
    ```json
    "owning_team": "{{ .event.diff.after.relations.repository | split(\"-\") | .[0] | split(\"/\") | .[1] | gsub(\"-\"; \"_\") }}"
    ```

2. If your GitHub organization name preserves hyphens (no conversion to underscores):
    ```json
    "owning_team": "{{ .event.diff.after.relations.repository | split(\"_\") | .[0] | split(\"/\") | .[1] }}"
    ```

3. If your team names have regional suffixes (e.g., `acme-corp-latam` → `acme_corp_latam`):
    ```json
    "owning_team": "{{ .event.diff.after.relations.repository | split(\"_\") | .[0] | split(\"/\") | .[1] | gsub(\"-\"; \"_\") }}"
    ```

4. If your team names have role-based suffixes (e.g., `rnd-taskforce` → `rnd_taskforce`):
    ```json
    "owning_team": "{{ .event.diff.after.relations.repository | split(\"_\") | .[0] | split(\"/\") | .[1] | gsub(\"-\"; \"_\") }}"
    ```

5. If your team names are complex with multiple segments (e.g., `rnd-developer-team-telaviv` → `rnd_developer_team_aviv`):
    ```json
    "owning_team": "{{ .event.diff.after.relations.repository | split(\"_\") | .[0] | split(\"/\") | .[1] | gsub(\"-\"; \"_\") }}"
    ```

<h3> Team suffix patterns </h3>

If your team identifiers include a suffix like "_team":
```json
"owning_team": "{{ (.event.diff.after.relations.repository | split(\"_\") | .[0] | split(\"/\") | .[1] | gsub(\"-\"; \"_\")) + \"_team\" }}"
```

<h3> Additional conditions </h3>

To ensure the automation only runs when the service doesn't already have an owner:
```json showLineNumbers
"condition": {
  "type": "JQ",
  "expressions": [
    ".diff.after.relations.repository != null",
    ".diff.before.relations.owning_team == null"
  ],
  "combinator": "and"
}
```

## Additional examples

Here are more examples of automations that automatically set relations between entities:

<h3> Environment-based deployment relationships </h3>

<details>
<summary><b>Link deployments to environments based on branch names (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "link_deployment_to_environment",
  "title": "Link Deployment to Environment",
  "description": "Automatically links deployments to environments based on branch name",
  "trigger": {
    "type": "automation",
    "event": {
      "type": "ENTITY_CREATED",
      "blueprintIdentifier": "deployment"
    },
    "condition": {
      "type": "JQ",
      "expressions": [
        ".diff.after.properties.branch != null"
      ],
      "combinator": "and"
    }
  },
  "invocationMethod": {
    "type": "UPSERT_ENTITY",
    "blueprintIdentifier": "deployment",
    "mapping": {
      "identifier": "{{ .event.diff.after.identifier }}",
      "title": "{{ .event.diff.after.title }}",
      "properties": {},
      "relations": {
        "environment": "{{ if (.event.diff.after.properties.branch | test(\"^main$|^master$\")) then \"production\" elif (.event.diff.after.properties.branch | test(\"^develop$|^dev$\")) then \"development\" elif (.event.diff.after.properties.branch | test(\"^staging$|^stage$\")) then \"staging\" else \"development\" end }}"
      }
    }
  },
  "publish": true
}
```

</details>

<h3> Cloud resource to service mapping </h3>

<details>
<summary><b>Link AWS resources to services based on tags (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "map_aws_resources_to_services",
  "title": "Map AWS Resources to Services",
  "description": "Links AWS resources to services based on the 'service' tag",
  "trigger": {
    "type": "automation",
    "event": {
      "type": "ENTITY_CREATED",
      "blueprintIdentifier": "awsResource"
    },
    "condition": {
      "type": "JQ",
      "expressions": [
        ".diff.after.properties.tags != null",
        ".diff.after.properties.tags | has(\"service\")"
      ],
      "combinator": "and"
    }
  },
  "invocationMethod": {
    "type": "UPSERT_ENTITY",
    "blueprintIdentifier": "awsResource",
    "mapping": {
      "identifier": "{{ .event.diff.after.identifier }}",
      "title": "{{ .event.diff.after.title }}",
      "properties": {},
      "relations": {
        "consumingService": "{{ .event.diff.after.properties.tags.service }}"
      }
    }
  },
  "publish": true
}
```

</details>

## Conclusion

By leveraging Port's automation capabilities, you can create a self-maintaining software catalog that automatically establishes relationships between entities. This approach saves time, ensures consistency, reduces errors, and scales effortlessly to handle hundreds or thousands of entities automatically.

Start with simple property-based mappings and gradually implement more sophisticated logic as your needs grow. 