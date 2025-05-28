---
displayed_sidebar: null
description: Learn how to gain insights into GitHub repositories and developer activity by tracking pull requests, issues, and visibility.
---

# Visualize your GitHub repository and developer activity

This guide demonstrates how to set up a monitoring solution to get insights into your GitHub workspace using Port's **GitHub** integration. You'll learn how to visualize repository visibility, monitor pull requests and issues, and track developer activity over time.

<img src="/img/guides/gitHubInsightDashboard.png" border="1px" width="100%" />
<img src="/img/guides/gitHubInsightDashboard2.png" border="1px" width="100%" />

## Common use cases

- Visualize and monitor repository visibility (e.g., public vs. private).
- Track developer engagement through pull requests and issues.

## Prerequisites

This guide assumes the following:
- You have a Port account and have completed the [onboarding process](https://docs.port.io/getting-started/overview).
- [GitHub app](/build-your-software-catalog/sync-data-to-catalog/git/github/) installed in your Port account.


## Set up data model

When installing the GitHub app in Port, the `Repository` and `Pull Request` blueprints are created by default.  
However, the `Issue` blueprint is not created automatically, so we will need to create it manually.

Additionally, we will update the `Repository` blueprint to include a `visibility` property, which is not part of the default schema.

### Update the repository blueprint
Follow the steps below to **update** the `Repository` blueprint:

1. Navigate to the `Repository` blueprint in your Port [Builder](https://app.getport.io/settings/data-model).
2. Hover over it, click on the `...` button on the right, and select `Edit JSON`.
3. Add the visibility property:

   <details>
   <summary><b>Visibility property (Click to expand)</b></summary>

   ```json showLineNumbers
    "visibility": {
        "type": "string",
        "title": "Visibility"
    }
   ```

   </details>

4. Click `Save`.


### Create the Github issue blueprint

We will then create the `Issue` blueprint.      
**Skip** to the [set up data source mapping](#set-up-data-source-mapping) section if you already have the blueprint.

1. Go to your [Builder](https://app.getport.io/settings/data-model) page.
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.
4. Add this JSON schema:
    <details>
    <summary><b>GitHub issue blueprint (Click to expand)</b></summary>

    ```json showLineNumbers
    {
        "identifier": "githubIssue",
        "title": "Issue",
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
            "labels": {
                "title": "Labels",
                "type": "array"
            },
            "status": {
                "title": "Status",
                "type": "string",
                "enum": ["open", "closed"],
                "enumColors": {
                "open": "green",
                "closed": "purple"
                }
            },
            "createdAt": {
                "title": "Created At",
                "type": "string",
                "format": "date-time"
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
            "description": {
                "title": "Description",
                "type": "string",
                "format": "markdown"
            },
            "issueNumber": {
                "title": "Issue Number",
                "type": "number"
            },
            "link": {
                "title": "Link",
                "type": "string",
                "format": "url"
            }
            },
            "required": []
        },
        "mirrorProperties": {},
        "calculationProperties": {},
        "relations": {
            "repository": {
            "target": "githubRepository",
            "required": true,
            "many": false
            }
        }
    }
    ```
    </details>

5. Click `Save` to create the blueprint.


## Set up data source mapping

1. Go to your [Data Source](https://app.getport.io/settings/data-sources) page.
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

    - kind: pull-request
        selector:
        query: 'true'
        closedPullRequests: true
        port:
        entity:
            mappings:
            identifier: .head.repo.name + (.id|tostring)
            title: .title
            blueprint: '"githubPullRequest"'
            properties:
                creator: .user.login
                assignees: '[.assignees[].login]'
                reviewers: '[.requested_reviewers[].login]'
                status: .status
                closedAt: .closed_at
                updatedAt: .updated_at
                mergedAt: .merged_at
                createdAt: .created_at
                prNumber: .id
                link: .html_url
                leadTimeHours: >-
                (.created_at as $createdAt | .merged_at as $mergedAt | ($createdAt
                | sub("\\..*Z$"; "Z") | strptime("%Y-%m-%dT%H:%M:%SZ") | mktime)
                as $createdTimestamp | ($mergedAt | if . == null then null else
                sub("\\..*Z$"; "Z") | strptime("%Y-%m-%dT%H:%M:%SZ") | mktime end)
                as $mergedTimestamp | if $mergedTimestamp == null then null else
                (((($mergedTimestamp - $createdTimestamp) / 3600) * 100 | floor) /
                100) end)
            relations:
                repository: .head.repo.name

    - kind: issue
        selector:
        query: .pull_request == null
        port:
        entity:
            mappings:
            identifier: .repo + (.id|tostring)
            title: .title
            blueprint: '"githubIssue"'
            properties:
                creator: .user.login
                assignees: '[.assignees[].login]'
                labels: '[.labels[].name]'
                status: .state
                createdAt: .created_at
                closedAt: .closed_at
                updatedAt: .updated_at
                description: .body
                issueNumber: .number
                link: .html_url
            relations:
                repository: .repo
    ```
    </details>
    
4. Click `Save & Resync` to apply the mapping.


## Visualize metrics

Once the GitHub data is synced, we can create a dashboard and add widgets to monitor repository visibility and developer activity.

### Create a dashboard

1. Navigate to your [software catalog](https://app.getport.io/organization/catalog).
2. Click on the **`+ New`** button in the left sidebar.
3. Select **New dashboard**.
4. Name the dashboard **GitHub - Insight**.
5. Click `Create`.

We now have a blank dashboard where we can start adding widgets to visualize our developer activities.

### Add widgets

<details>
<summary><b>Repository visibility (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Pie chart**.
2. Title: `Repository Visibility`.
3. Choose the **Repository** blueprint.
4. Under `Breakdown by property`, select the **Visibility** property 
   <img src="/img/guides/projectVisibilityPieChart.png" width="50%" />

5. Click **Save**.

</details>


<details>
<summary><b> Total number of repositories (click to expand)</b></summary>

1. Click `+ Widget` and select **Number Chart**.
2. Title: `Number of repos`.
3. Select `Count entities` **Chart type** and choose **Repository** as the **Blueprint**.
4. Select `count` for the **Function**.
5. Select `custom` as the **Unit** and input `repos` as the **Custom unit**.

   <img src="/img/guides/numberOfReposInsight.png" width="50%"/>

6. Click `Save`.

</details>

<details>
<summary><b> Total number of public repositories (click to expand)</b></summary>

1. Click `+ Widget` and select **Number Chart**.
2. Title: `Public repos` (add the `Url` icon).
3. Select `Count entities` **Chart type** and choose **Repository** as the **Blueprint**.
4. Select `count` for the **Function**.
5. Add this JSON to the **Additional filters** editor to filter `public` repositories:
    ```json showLineNumbers
    [
        {
            "combinator":"and",
            "rules":[
                {
                    "property":"visibility",
                    "operator":"=",
                    "value":"public"
                }
            ]
        }
    ]
    ```
6. Select `custom` as the **Unit** and input `repos` as the **Custom unit**.

   <img src="/img/guides/publicRepoInsight.png" width="50%"/>

7. Click `Save`.

</details>

<details>
<summary><b> Total number of open pull requests (click to expand)</b></summary>

1. Click `+ Widget` and select **Number Chart**.
2. Title: `Open pull requests` (add the `GitPullRequest` icon).
3. Select `Count entities` **Chart type** and choose **Pull Request** as the **Blueprint**.
4. Select `count` for the **Function**.
5. Add this JSON to the **Additional filters** editor to filter `open` pull requests:
    ```json showLineNumbers
    [
        {
            "combinator":"and",
            "rules":[
                {
                    "property":"status",
                    "operator":"=",
                    "value":"open"
                }
            ]
        }
    ]
    ```
6. Select `custom` as the **Unit** and input `PRs` as the **Custom unit**.

   <img src="/img/guides/openPullRequestInsight.png" width="50%"/>

7. Click `Save`.

</details>

<details>
<summary><b> Total number of merged pull requests (click to expand)</b></summary>

1. Click `+ Widget` and select **Number Chart**.
2. Title: `Merged pull requests (30 days)` (add the `Merge` icon).
3. Select `Count entities` **Chart type** and choose **Pull Request** as the **Blueprint**.
4. Select `count` for the **Function**.
5. Add this JSON to the **Additional filters** editor to filter `merged` pull requests updated in the last month:
    ```json showLineNumbers
    [
        {
            "combinator":"and",
            "rules":[
                {
                    "property":"status",
                    "operator":"=",
                    "value":"merged"
                },
                {
                    "property":"updatedAt",
                    "operator":"between",
                    "value":{
                    "preset":"lastMonth"
                    }
                }
            ]
        }
    ]
    ```
6. Select `custom` as the **Unit** and input `PRs` as the **Custom unit**.

   <img src="/img/guides/mergedPullRequestInsight.png" width="50%"/>

7. Click `Save`.

</details>

<details>
<summary><b> Total number of open GitHub issues (click to expand)</b></summary>

1. Click `+ Widget` and select **Number Chart**.
2. Title: `Open issues` (add the `Alert` icon).
3. Select `Count entities` **Chart type** and choose **Issue** as the **Blueprint**.
4. Select `count` for the **Function**.
5. Add this JSON to the **Additional filters** editor to filter `open` issues:
    ```json showLineNumbers
    [
        {
            "combinator":"and",
            "rules":[
                {
                    "property":"status",
                    "operator":"=",
                    "value":"open"
                }
            ]
        }
    ]
    ```
6. Select `custom` as the **Unit** and input `issues` as the **Custom unit**.

   <img src="/img/guides/openIssueInsight.png" width="50%"/>

7. Click `Save`.

</details>