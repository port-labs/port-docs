---
displayed_sidebar: null
description: Learn how to connect GitHub Codeowners with service teams in Port, ensuring seamless collaboration and code ownership.
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortTooltip from "/src/components/tooltip/tooltip.jsx"

# Connect GitHub CODEOWNERS with Service, Team & User

This guide demostrates how to map CODEOWNERS file in GitHub repositories to their respective Service, Team and User blueprints in port.

## Prerequisites
- A Port account.
- Install [Port's GitHub app](/build-your-software-catalog/sync-data-to-catalog/git/github/#setup) in your organization or in repositories you are interested in.
:::info Default Github Blueprints
Once you install Port's GitHub app, the following blueprints will be automatically created in your data model: `Repository`, `Pull Request`, `Github User`, `Github Team`.
:::

## Set up data model

First, let's create the necessary <PortTooltip id="blueprint">blueprint</PortTooltip> to store the Codeowners data, then we will set up the mapping configuration.

### Create the Codeowners blueprint

To add the CODEOWNERS blueprint:

1.  Navigate to your [data model](https://app.getport.io/settings/data-model) page of your portal.

2. Click on the `+ Blueprint` button.

3. Click on the `Edit JSON` button.

4. Copy the following definition and paste it in the editor, then click `Save`:

    <details>
    <summary><b>CODEOWNERS blueprint (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "githubCodeowners",
      "description": "This blueprint represents a CODEOWNERS file in a service",
      "title": "Github Codeowners",
      "icon": "Github",
      "schema": {
        "properties": {
          "location": {
            "type": "string",
            "title": "File location",
            "description": "File path to CODEOWNERS file"
          },
          "scope": {
            "icon": "DefaultProperty",
            "type": "string",
            "title": "Scope",
            "description": "The scope which the user/team owns."
          }
        },
        "required": []
      },
      "mirrorProperties": {},
      "calculationProperties": {},
      "aggregationProperties": {},
      "relations": {
        "users": {
          "title": "Users",
          "target": "githubUser",
          "required": false,
          "many": true
        },
        "teams": {
          "title": "Teams",
          "target": "githubTeam",
          "required": false,
          "many": true
        },
        "repository": {
          "title": "Repository",
          "description": "The repository which the CODEOWNERS file resides in",
          "target": "githubRepository",
          "required": true,
          "many": false
        }
      }
    }
    ```

    </details>


### Set up mapping configuration

1. Go to the [data sources](https://app.getport.io/settings/data-sources) page of your portal.

2. Under `Exporters`, click on your desired GitHub organization.

3. A window will open containing the default YAML configuration of your GitHub integration.

4. In the bottom-left corner you can modify the configuration to suit your needs, by adding/removing entries.

5. Copy the following configuration and paste it in the editor, then click `Save & Resync`:

    <details>
    <summary><b>CODEOWNERS mapping configuration (Click to expand)</b></summary>

    ```yaml showLineNumbers
    resources:
      - kind: file
        selector:
          query: .repo.archived == false
          files:
            - path: '**/.github/CODEOWNERS'
        port:
          itemsToParse: >-
            (. as $root | .file.content | split("\n") | map(trim) |
            map(select((test("^[[:space:]]*#") | not) and (length > 0))) | map(
                (split(" ") | map(select(length > 0))) as $tokens
                | {
                    scope: ($tokens[0]), 
                    # Replacing ** and * characters since the identifier can't contain special characters
                    identifier: ($tokens[0] 
                              | gsub("\\*\\*"; "doublestar")
                              | gsub("\\*"; "star")),
                    # Extracting users and teams to their respective arrays
                    users: (
                        $tokens[1:]
                        | map(select(contains("/") | not)
                                | gsub("@" ; "")
                              )
                      ),
                    teams: (
                        $tokens[1:]
                        | map(select(test("^@[^ ]+/[^ ]+$"))
                              | split("/")
                              | .[-1]
                  ))
                }
                )
              )
          entity:
            mappings:
              identifier: .repo.full_name + "_" +.item.identifier + "_codeowners"
              title: .item.scope + " codeowners"
              blueprint: '"githubCodeowners"'
              properties:
                scope: .item.scope
                location: .file.path
              relations:
                repository: .repo.full_name
                teams: 
                  combinator: '''and'''
                  rules:
                    - property: '"$title"'
                      value: .item.teams
                      operator: '"in"'
                users: .item.users

    ```

    </details>


The following is an example for `CODEOWNERS` file.
Once you set up your codeowners file, click `Resync` to trigger the ingestion of the entities into your Port environment.

<details>
<summary><b>CODEOWNERS file example (Click to expand)</b></summary>

``` showLineNumbers
# Global owners for the entire repository
*        @org-name/global-team

# Documentation files
/docs/   @org-name/docs-team @docsTeamLead

# Frontend code ownership
/frontend/   @org-name/frontend-team @frontendTeamLead

# Backend code ownership
/backend/   @org-name/backend-team @backendTeamLead

# Configuration files
*.yml    @org-name/config-team

# Scripts and utilities
/scripts/ @org-name/ops-team @scriptsHandler
```

</details>

In your [software catalog](https://app.getport.io/organization/catalog), the Codeowners page will now display your Codeowners entities:

<img src='/img/build-your-software-catalog/custom-integration/api/ci-cd/github-workflow/guides/gitHubCodeownersAfterIngestionIntoPort.png' border='1px' />
<br />
