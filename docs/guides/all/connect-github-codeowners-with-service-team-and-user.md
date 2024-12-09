---
displayed_sidebar: null
description: Learn how to connect GitHub Codeowners with service teams in Port, ensuring seamless collaboration and code ownership.
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Connect GitHub CODEOWNERS with Service, Team & User

This guide shows you how to map CODEOWNERS file patterns in GitHub repositories (Service) to their respective Service, Team and User in port.

## Prerequisites
This guide assumes:
- You have a Port account
- You have installed [Port's GitHub app](/build-your-software-catalog/sync-data-to-catalog/git/github/#setup) in your organisation or in repositories you are interested in.

## GitHub configuration

To ingest GitHub objects, use one of the following methods:

<Tabs queryString="method">

<TabItem label="Using Port's UI" value="port">

To manage your GitHub integration configuration using Port:

1. Go to the [data sources](https://app.getport.io/settings/data-sources) page of your portal.
2. Under `Exporters`, click on your desired GitHub organization.
3. A window will open containing the default YAML configuration of your GitHub integration.
4. Here you can modify the configuration to suit your needs, by adding/removing entries.
5. When finished, click `resync` to apply any changes.

Using this method applies the configuration to all repositories that the GitHub app has permissions to.

When configuring the integration **using Port**, the YAML configuration is global, allowing you to specify mappings for multiple Port blueprints.

</TabItem>

<TabItem label="Using GitHub" value="github">

To manage your GitHub integration configuration using a config file in GitHub:

1. Go to the [data sources](https://app.getport.io/settings/data-sources) page of your portal.
2. Under `Exporters`, click on your desired GitHub organization.
3. A window will open containing the default YAML configuration of your GitHub integration.
4. Scroll all the way down, and turn on the `Manage this integration using the "port-app-config.yml" file` toggle.

This will clear the configuration in Port's UI.

When configuring the integration **using GitHub**, you can choose either a global or granular configuration:

- **Global configuration:** create a `.github-private` repository in your organization and add the `port-app-config.yml` file to the repository.
  - Using this method applies the configuration to all repositories that the GitHub app has permissions to (unless it is overridden by a granular `port-app-config.yml` in a repository).
- **Granular configuration:** add the `port-app-config.yml` file to the `.github` directory of your desired repository.
  - Using this method applies the configuration only to the repository where the `port-app-config.yml` file exists.

When using global configuration **using GitHub**, the configuration specified in the `port-app-config.yml` file will only be applied if the file is in the **default branch** of the repository (usually `main`).

</TabItem>

</Tabs>

:::info Important
When **using Port's UI**, the specified configuration will override any `port-app-config.yml` file in your GitHub repository/ies.
:::


## Setting up the blueprint and mapping configuration

:::info Blueprints creation
If you already have the `githubUser`, `githubTeam` and `service` blueprints created, you do not need to recreate them. Ensure to adjust the relations' targets as necessary.
:::

<details>
<summary><b>GitHub User Blueprint (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "githubUser",
  "title": "Github User",
  "icon": "Microservice",
  "schema": {
    "properties": {},
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {
    "user": {
      "title": "User",
      "target": "user",
      "required": false,
      "many": false
    }
  }
}
```

</details>

<details>
<summary><b>GitHub User mapping configuration (Click to expand)</b></summary>

```yaml showLineNumbers
resources:
  - kind: user
    selector:
      query: "true"
    port:
      entity:
        mappings:
          identifier: .login
          title: .login
          blueprint: '"githubUser"'
          relations:
```

</details>

<details>
<summary><b>GitHub Team Blueprint (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "githubTeam",
  "title": "GitHub Team",
  "icon": "Github",
  "schema": {
    "properties": {
      "slug": {
        "title": "Slug",
        "type": "string"
      },
      "description": {
        "title": "Description",
        "type": "string"
      },
      "link": {
        "title": "Link",
        "icon": "Link",
        "type": "string",
        "format": "url"
      },
      "permission": {
        "title": "Permission",
        "type": "string"
      },
      "notification_setting": {
        "title": "Notification Setting",
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


<details>
<summary><b>GitHub Team mapping configuration (Click to expand)</b></summary>

```yaml showLineNumbers
resources:
  - kind: team
    selector:
      query: "true" # JQ boolean query. If evaluated to false - skip syncing the object.
    port:
      entity:
        mappings:
          identifier: ".id | tostring"
          title: .name
          blueprint: '"githubTeam"'
          properties:
            name: .name
            slug: .slug
            description: .description
            link: .html_url
            permission: .permission
            notification_setting: .notification_setting
```

</details>


<details>
<summary><b>Service (GitHub Repository) Blueprint (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "service",
  "title": "Service",
  "icon": "Microservice",
  "schema": {
    "properties": {
      "readme": {
        "title": "README",
        "type": "string",
        "format": "markdown"
      },
      "url": {
        "title": "Service URL",
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

<details>
<summary><b>GitHub Service (Repository) mapping configuration (Click to expand)</b></summary>

```yaml showLineNumbers
resources:
  - kind: repository
    selector:
      query: "true" # JQ boolean query. If evaluated to false - skip syncing the object.
    port:
      entity:
        mappings:
          identifier: ".name" # The Entity identifier will be the repository name.
          title: ".name"
          blueprint: '"service"'
          properties:
            readme: file://README.md # fetching the README.md file that is within the root folder of the repository and ingesting its contents as a markdown property
            url: .html_url
            defaultBranch: .default_branch
```

</details>

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
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {
    "service": {
      "title": "Service",
      "target": "service",
      "required": false,
      "many": false
    }
  }
}
```

</details>

<details>
<summary><b>CODEOWNERS Pattern mapping configuration (Click to expand)</b></summary>

```yaml showLineNumbers
resources:
  - kind: file
    selector:
      query: .repo.archived == false
      files:
        - path: '**/.github/CODEOWNERS'
    port:
      itemsToParse: >-
        [. as $root | .file.content | split("\n\n") | map( if (startswith("# ")
        | not) then { component: $root.repo.name, patterns: [], teams: [. |
        split(" ")[] | select(startswith("@")) | rtrimstr("\n") |
        ltrimstr("\n")] } else split("\n") as $lines | { component: ($lines[0] |
        ltrimstr("# ") | ltrimstr(" ")), patterns: ($lines[1:] | map(split("
        ")[0])), teams: [($lines[1:] | map(split(" ")[1:] | join(" ")) | [.[] |
        split(" ") | .[]] | unique)[] | select(startswith("@"))] } end
        )[]]
      entity:
        mappings:
          identifier: .item.component | gsub(" "; "_") | gsub("&"; "and") | gsub("-"; "")
          title: .item.component
          blueprint: '"githubCodeowners"'
          properties:
            codeowners_file_patterns: .item.patterns
          relations:
            service: .repo.name
            owning_teams:
              combinator: '''and'''
              rules:
                - property: '''github_team'''
                  value: .item.teams
                  operator: '"in"'
```

</details>

<details>
<summary><b>CODEOWNERS Pattern blueprint (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "githubCodeownersPattern",
  "description": "This blueprint represents a pattern in a CODEOWNERS file from a service",
  "title": "Github Codeowners Pattern",
  "icon": "Github",
  "schema": {
    "properties": {
      "pattern": {
        "type": "string",
        "title": "File & Folder pattern",
        "description": "Regex pattern depicting the folder or file the teams and users have access to"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {
    "service": {
      "title": "Service",
      "target": "githubRepository",
      "required": false,
      "many": false
    },
    "user": {
      "title": "Users",
      "target": "githubUser",
      "required": false,
      "many": true
    },
    "codeownersFile": {
      "title": "Codeowners File",
      "target": "githubCodeowners",
      "required": true,
      "many": false
    },
    "team": {
      "title": "Teams",
      "target": "githubTeam",
      "required": false,
      "many": true
    }
  }
}

```

</details>


Add content to your `CODEOWNERS` file, then click on `Resync` and wait for the entities to be ingested in your Port environment.

<img src='/img/build-your-software-catalog/custom-integration/api/ci-cd/github-workflow/guides/gitHubCodeownersAfterIngestionIntoPort.png' border='1px' />
<br />
<img src='/img/build-your-software-catalog/custom-integration/api/ci-cd/github-workflow/guides/gitHubCodeownersPatternAfterIngestionIntoPort.png' border='1px' />
<br />
