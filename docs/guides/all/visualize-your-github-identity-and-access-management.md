---
displayed_sidebar: null
description: Learn how to gain insights into GitHub identity and access management across your organization
---

# Visualize your GitHub identity and access management

This guide demonstrates how to set up a monitoring solution to get insights into your GitHub Identity and Access Management (IAM) using Port's **GitHub** integration. Understanding your organization's IAM structure helps you audit permissions, improve security, and manage access efficiently.

<img src="/img/guides/gitHubIAMDashboard.png" border="1px" width="100%" />

## Common use cases

- Understand your organization's IAM structure
- Audit GitHub organization members and their roles

## Prerequisites

This guide assumes the following:
- You have a Port account and have completed the [onboarding process](https://docs.port.io/getting-started/overview).
- Port's [GitHub app](/build-your-software-catalog/sync-data-to-catalog/git/github/) is installed in your account.


## Set up data model

When installing Port's GitHub app, the `Repository` blueprint is created by default.  
However, the `GitHub User` and `GitHub Team` blueprints are not created automatically, so we will need to create them manually.

### Create the Github user blueprint

**Skip** to the [update data source mapping](#update-data-source-mapping) section if you already have the blueprint.

1. Go to the [Builder](https://app.getport.io/settings/data-model) page of your portal.
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.
4. Add this JSON schema:
    <details>
    <summary><b>GitHub user blueprint (Click to expand)</b></summary>

    ```json showLineNumbers
    {
        "identifier": "githubUser",
        "title": "Github User",
        "icon": "Microservice",
        "schema": {
            "properties": {
            "email": {
                "title": "Email",
                "type": "string"
            }
            },
            "required": []
        },
        "mirrorProperties": {},
        "calculationProperties": {},
        "aggregationProperties": {},
        "relations": {}
    }
    ```
    </details>

5. Click `Save` to create the blueprint.


### Create the Github team blueprint

**Skip** to the [update data source mapping](#update-data-source-mapping) section if you already have the blueprint.

1. Go to the [Builder](https://app.getport.io/settings/data-model) page of your portal.
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.
4. Add this JSON schema:
    <details>
    <summary><b>GitHub team blueprint (Click to expand)</b></summary>

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

5. Click `Save` to create the blueprint.


## Update data source mapping

1. Go to the [Data Sources](https://app.getport.io/settings/data-sources) page of your portal.
2. Select the GitHub integration.
3. Add the following YAML block into the editor to ingest data from GitHub:

    <details>
    <summary><b>GitHub integration configuration (Click to expand)</b></summary>
    ```yaml showLineNumbers
    resources:
    - kind: repository
        selector:
        query: 'true'
        port:
        entity:
            mappings:
            identifier: .name
            title: .name
            blueprint: '"githubRepository"'
            properties:
                readme: file://README.md
                url: .html_url
                defaultBranch: .default_branch
                visibility: .visibility

    - kind: team
        selector:
        query: "true"
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
                user: .email
    ```
    </details>
    
4. Click `Save & Resync` to apply the mapping.


## Visualize metrics

Once the GitHub data is synced, we can create a dashboard and add widgets to monitor IAM.

### Create a dashboard

1. Navigate to your [software catalog](https://app.getport.io/organization/catalog).
2. Click on the **`+ New`** button in the left sidebar.
3. Select **New dashboard**.
4. Name the dashboard **GitHub IAM Overview**.
5. Click `Create`.

We now have a blank dashboard where we can start adding widgets to visualize our identity and access management.

### Add widgets

<details>
<summary><b>Teams by permission (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Pie chart**.
2. Title: `Teams by permission`.
3. Choose the **GitHub Team** blueprint.
4. Under `Breakdown by property`, select the **Permission** property 
   <img src="/img/guides/teamByPermissionPieChart.png" width="50%" />

5. Click **Save**.

</details>

<details>
<summary><b> Teams with admin permission (click to expand)</b></summary>

1. Click `+ Widget` and select **Number Chart**.
2. Title: `Teams with admin permission`.
3. Select `Count entities` **Chart type** and choose **GitHub Team** as the **Blueprint**.
4. Select `count` for the **Function**.
5. Add this JSON to the **Additional filters** editor to filter `admin` permission:
    ```json showLineNumbers
    [
        {
            "combinator":"and",
            "rules":[
                {
                    "property":"permission",
                    "operator":"=",
                    "value":"admin"
                }
            ]
        }
    ]
    ```
6. Select `custom` as the **Unit** and input `teams` as the **Custom unit**.

   <img src="/img/guides/totalAdminTeams.png" width="50%"/>

7. Click `Save`.

</details>

<details>
<summary><b> Total number of teams (click to expand)</b></summary>

1. Click `+ Widget` and select **Number Chart**.
2. Title: `Total teams` (add the `Team` icon).
3. Select `Count entities` **Chart type** and choose **GitHub Team** as the **Blueprint**.
4. Select `count` for the **Function**.

   <img src="/img/guides/totalGitHubTeams.png" width="50%"/>

5. Click `Save`.

</details>

<details>
<summary><b> Total number of users (click to expand)</b></summary>

1. Click `+ Widget` and select **Number Chart**.
2. Title: `Total users` (add the `Team` icon).
3. Select `Count entities` **Chart type** and choose **GitHub User** as the **Blueprint**.
4. Select `count` for the **Function**.

   <img src="/img/guides/totalGitHubUsers.png" width="50%"/>

5. Click `Save`.

</details>