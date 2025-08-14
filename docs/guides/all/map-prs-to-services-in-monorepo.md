---
displayed_sidebar: null
description: Automatically map pull requests to services in a monorepo using file path analysis
---

# Map PR's to services in a monorepo

## Overview
This guide will help you implement an automation in Port that automatically maps GitHub pull requests to services in your monorepo based on the files that were changed.
This functionality streamlines monorepo management by enabling teams to quickly understand which services are affected by each change without manual analysis.

## Prerequisites

- Complete the [onboarding process](/getting-started/overview).
- A GitHub repository with a monorepo structure containing multiple services.
- Services organized in directories with a `service.yml` file (or similar configuration file).
- Port's [GitHub App](/build-your-software-catalog/sync-data-to-catalog/git/github/github.md) installed.
- Access to GitHub API tokens for automation.

## Set up data model

If you haven't installed the [GitHub integration](/build-your-software-catalog/sync-data-to-catalog/git/github), you'll need to create a blueprint for GitHub pull requests in Port.  
However, we highly recommend you install the GitHub integration to have the blueprint automatically set up for you.

If you've already installed the GitHub integration you have to [update the pull request blueprint](#update-the-pull-request-blueprint) to include the
`file_change_url` property.

### Create the repository blueprint

1. Go to the [blueprints](https://app.getport.io/settings/blueprints) page of your portal.

2. Click on `+ Blueprint`.

3. Click on the `Edit JSON` button in the top right corner.

4. Copy and paste the following JSON schema:

   <details>
   <summary><b>Repository blueprint (Click to expand)</b></summary>

   ```json showLineNumbers
    {
    "identifier": "githubRepository",
    "title": "Repository",
    "icon": "Github",
    "schema": {
        "properties": {
        "readme": {
            "title": "README",
            "type": "string",
            "format": "markdown"
        },
        "url": {
            "title": "Repository URL",
            "type": "string",
            "format": "url"
        },
        "defaultBranch": {
            "title": "Default branch",
            "type": "string"
        }
        },
        "required": []
    },
    "mirrorProperties": {},
    "calculationProperties": {},
    "relations": {}
    }

   ```
   </details>

5. Click "Save" to create the blueprint.


### Create the pull request blueprint

1. Go to the [blueprints](https://app.getport.io/settings/blueprints) page of your portal.

2. Click on `+ Blueprint`.

3. Click on the `Edit JSON` button in the top right corner.

4. Copy and paste the following JSON schema:

    <details>
    <summary><b>GitHub pull request blueprint (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "githubPullRequest",
      "title": "Pull Request",
      "icon": "Github",
      "schema": {
        "properties": {
          "creator": {
            "title": "Creator",
            "type": "string"
          },
          "assignees": {
            "title": "Assignees",
            "type": "array"
          },
          "reviewers": {
            "title": "Reviewers",
            "type": "array"
          },
          "status": {
            "title": "Status",
            "type": "string",
            "enum": ["merged", "open", "closed"],
            "enumColors": {
              "merged": "purple",
              "open": "green",
              "closed": "red"
            }
          },
          "closedAt": {
            "title": "Closed At",
            "type": "string",
            "format": "date-time"
          },
          "updatedAt": {
            "title": "Updated At",
            "type": "string",
            "format": "date-time"
          },
          "mergedAt": {
            "title": "Merged At",
            "type": "string",
            "format": "date-time"
          },
          "createdAt": {
            "title": "Created At",
            "type": "string",
            "format": "date-time"
          },
          "link": {
            "format": "url",
            "type": "string"
          },
          "leadTimeHours": {
            "title": "Lead Time in hours",
            "type": "number"
          },
          "file_change_url": {
            "type": "string",
            "title": "File change URL",
            "format": "url"
          }
        },
        "required": []
      },
      "mirrorProperties": {},
      "calculationProperties": {
        "days_old": {
          "title": "Days Old",
          "icon": "DefaultProperty",
          "calculation": "(now / 86400) - (.properties.createdAt | capture(\"(?<date>\\\\d{4}-\\\\d{2}-\\\\d{2})\") | .date | strptime(\"%Y-%m-%d\") | mktime / 86400) | floor",
          "type": "number"
        }
      },
      "relations": {
        "repository": {
          "title": "Repository",
          "target": "githubRepository",
          "required": false,
          "many": false
        },
        "services": {
          "title": "Services",
          "target": "service",
          "required": false,
          "many": true
        }
      }
    }
    ```
    </details>

5. Click "Save" to create the blueprint.

### Update the pull request blueprint

1. Go to the [blueprints](https://app.getport.io/settings/blueprints) page of your portal.

2. Find the `githubPullRequest` blueprint and click on it.

3. Click on the `Edit JSON` button in the top right corner.

4. Add the snippet below to the `schema` section:

   ```json showLineNumbers
     "file_change_url": {
        "type": "string",
        "title": "File change URL",
        "format": "url"
      }
   ```

5. Add the following snippet to the `relations` section:

   ```json showLineNumbers
    "services": {
      "title": "Services",
      "target": "service",
      "required": false,
      "many": true
    }
   ```

6. Click "Save" to update the blueprint.

## Update the data source

The first step is to configure how services are mapped from your monorepo structure. We'll use Port's file ingestion feature to automatically create service entities based on file paths.

<h3>Add the service mapping configuration</h3>

Follow the steps below to update the data source:

1. Go to the [Data sources](https://app.getport.io/settings/data-sources) page of your portal.

2. Find the GitHub exporter and click on it.

3. Add the following yaml to the mapping section:

   <details>
   <summary><b>Service mapping configuration (Click to expand)</b></summary>

   ```yaml showLineNumbers
   - kind: file
     selector:
       query: 'true'
       files:
         - path: '**/service.yml'
       repos:
         - platform
     port:
       entity:
         mappings:
           identifier: .file.path | split("/")[:-1] | join("/")
           title: .file.content.service_name
           blueprint: '"service"'
   ```

   </details>

   **Note**: Adjust the `path` pattern and `repos` list according to your monorepo structure. The `identifier` mapping extracts the directory path above the `service.yml` file, which becomes the service identifier.

6. Click "Save" to create the data source.

:::tip Service file structure
This configuration assumes each service has a `service.yml` file in its root directory. You can modify the path pattern to match your actual service configuration file (e.g., `**/package.json`, `**/docker-compose.yml`, etc.).
:::

<h3>Update the pull request kind to include the file change URL</h3>

1. Still in the [data sources](https://app.getport.io/settings/data-sources) page of your portal.

2. Update the `pull-request` kind to include the `file_change_url` property.

   <details>
   <summary><b>Pull request kind configuration (Click to expand)</b></summary>

    ```yaml showLineNumbers
    - kind: pull-request
      selector:
        query: 'true'
      port:
        entity:
          mappings:
            identifier: .id|tostring
            title: .title
            blueprint: '"githubPullRequest"'
            properties:
              status: .status
              label: .labels
              // highlight-start
              file_change_url: .commits_url | split("/")[:8] | join("/") + "/files"
              // highlight-end
              // other properties...
    ```
   </details>

3. Click "Save" to update the data source.

## Set up automations

Now we'll create a two-step automation workflow that:
1. Fetches the files changed in a pull request
2. Updates the PR with relations to the affected services

### Get PR files changed

This automation triggers when a new pull request is created and fetches the list of changed files.

1. Go to the [automations](https://app.getport.io/settings/automations) page of your portal.

2. Click on `+ Automation`.

3. Click on the `Edit JSON` button in the top right corner.

4. Copy and paste the following JSON schema:

   <details>
   <summary><b>Get files changed automation (Click to expand)</b></summary>

   ```json showLineNumbers
    {
        "identifier": "get_files_changed_for_a_pr",
        "title": "Get files changed for a PR",
        "description": "",
        "trigger": {
        "type": "automation",
        "event": {
            "type": "ENTITY_UPDATED",
            "blueprintIdentifier": "githubPullRequest"
        },
        "condition": {
            "type": "JQ",
            "expressions": [],
            "combinator": "and"
        }
        },
        "invocationMethod": {
        "type": "WEBHOOK",
        "url": "{{ .event.diff.after.properties.file_change_url }}",
        "agent": false,
        "synchronized": true,
        "method": "GET",
        "headers": {
            "Authorization": "Bearer {{ .secrets.YOUR_GITHUB_TOKEN }}",
            "X-GitHub-Api-Version": "2022-11-28",
            "Identifier": "{{ .event.context.entityIdentifier | tostring }}"
        },
        "body": {}
        },
        "publish": true
    }
   ```

   </details>

5. Click "Save" to create the automation.

:::info GitHub token requirement
This automation requires a GitHub personal access token with `repo` scope permissions. Make sure to add this token to your Port secrets as `YOUR_GITHUB_TOKEN`.
:::

### Update PR with service relations

This automation triggers after the first automation completes successfully and creates relations between the PR and the affected services.

Follow the steps below to create the automation:

1. Go back to the [automations](https://app.getport.io/settings/automations) page.

2. Click on `+ Automation` and select `Edit JSON`.

3. Copy and paste the following JSON schema:

   <details>
   <summary><b>Update PR with service relations automation (Click to expand)</b></summary>

   ```json showLineNumbers
    {
      "identifier": "update_pr_with_service",
      "title": "Update PR with files changed",
      "description": "",
      "trigger": {
        "type": "automation",
        "event": {
          "type": "RUN_UPDATED",
          "actionIdentifier": "get_files_changed_for_a_pr"
        },
        "condition": {
          "type": "JQ",
          "expressions": [
            ".diff.after.status == \"SUCCESS\""
          ],
          "combinator": "and"
        }
      },
      "invocationMethod": {
        "type": "UPSERT_ENTITY",
        "blueprintIdentifier": "githubPullRequest",
        "mapping": {
          "identifier": "{{ .event.diff.before.payload.headers.Identifier | tostring }}",
          "relations": {
            "service": "{{ .event.diff.before.response | map(.filename | split(\"/\")[:-1] | join(\"/\")) }}"
          }
        }
      },
      "publish": true
    }
   ```

   </details>

5. Click "Save" to create the automation.

:::info Automation chain
This automation is chained to the first one, meaning it will only execute after the "Get files changed for a PR" automation completes successfully. The chain ensures proper sequencing of operations.
:::

## Let's test it

1. Create a new pull request in your GitHub repository.

2. Check the PR in Port.

3. Check the services that were affected by the PR.

4. Check the [Audit log](https://app.getport.io/settings/AuditLog) to see the chain of actions
