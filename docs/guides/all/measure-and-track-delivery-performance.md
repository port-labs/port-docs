---
displayed_sidebar: null
description: Learn how to measure and track delivery performance as part of your engineering intelligence framework using key metrics like PR cycle time, PR throughput, deployment frequency, and overdue PRs.
---

# Measure and track delivery performance

Measuring delivery performance is essential for understanding how effectively your engineering teams ship value to customers. Without visibility into delivery metrics, teams struggle to identify bottlenecks, optimize workflows, and make data-driven decisions about process improvements.

This guide helps engineering managers, platform engineers, DevEx teams, and product leaders answer critical questions about their delivery pipeline:

- **Flow**: How smoothly does work move through the development lifecycle?
- **Bottlenecks**: Where are the friction points that slow down delivery?
- **Predictability**: Can we reliably forecast when features will be delivered?

By the end of this guide, you'll have a working dashboard that tracks key delivery performance metrics, enabling you to identify improvement opportunities, measure the impact of process changes, and communicate delivery health across your organization.

<img src="/img/guides/delivery-performance-dashboard.png" border="1px" width="100%" />


## Common use cases

- Track PR cycle time to identify bottlenecks in reviews and CI processes.
- Monitor PR throughput to understand delivery flow and detect platform issues.
- Measure deployment frequency to see how often customer value is shipped.
- Identify overdue PRs to surface workflow inefficiencies and blocked work.

## Prerequisites

This guide assumes the following:

- You have a Port account and have completed the [onboarding process](https://docs.port.io/getting-started/overview).
- Port's [GitHub integration](/build-your-software-catalog/sync-data-to-catalog/git/github/) is installed in your account.

:::tip Initial scope

This guide focuses on measuring delivery performance using source control management (SCM) data, including repositories, pull requests, commits, and workflows. This is the first iteration of delivery performance measurement and will expand in future versions to include additional metrics and data sources such as issue trackers, deployment platforms, and other development tools.
:::

## Key metrics overview

We will track four key metrics to measure delivery performance:

| Metric | What it measures | Why it matters |
|--------|------------------|----------------|
| **PR cycle time** | Time from PR creation to merge | Exposes friction in reviews, CI wait times, and other bottlenecks that slow down delivery |
| **PR throughput** | Number of PRs merged over time | Shows delivery flow and whether CI or platform issues block output |
| **Deployment frequency** | How often code is deployed to production | Shows how often customer value is shipped and indicates delivery cadence |
| **Overdue PRs** (open > 3 days) | PRs that have been open longer than 3 days | Signals workflow inefficiencies, unclear ownership, or blocked work that needs attention |

## Set up data model

We will create several blueprints to model your GitHub data. The `service` blueprint should already exist from onboarding.

### Create the GitHub user blueprint

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
      "icon": "Github",
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

### Create the GitHub repository blueprint

1. Go to your [Builder](https://app.getport.io/settings/data-model) page.
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.
4. Add this JSON schema:

    <details>
    <summary><b>GitHub repository blueprint (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "githubRepository",
      "title": "Repository",
      "icon": "Github",
      "ownership": {
        "type": "Direct"
      },
      "schema": {
        "properties": {
          "readme": {
            "title": "README",
            "type": "string",
            "format": "markdown"
          },
          "url": {
            "icon": "DefaultProperty",
            "title": "Repository URL",
            "type": "string",
            "format": "url"
          },
          "defaultBranch": {
            "title": "Default branch",
            "type": "string"
          },
          "last_push": {
            "icon": "GitPullRequest",
            "title": "Last push",
            "description": "Last commit to the main branch",
            "type": "string",
            "format": "date-time"
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

5. Click `Save` to create the blueprint.

### Create or update the GitHub pull request blueprint

If you already have a pull request blueprint, you need to add the following properties to it. Otherwise, create a new one.

1. Go to your [Builder](https://app.getport.io/settings/data-model) page.
2. If you have an existing pull request blueprint, hover over it, click on the `...` button, and select `Edit JSON`. Otherwise, click on `+ Blueprint` and then `Edit JSON`.
3. Add or update the JSON schema:

    <details>
    <summary><b>GitHub pull request blueprint (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "githubPullRequest",
      "title": "Pull Request",
      "icon": "Github",
      "schema": {
        "properties": {
          "status": {
            "title": "Status",
            "type": "string",
            "enum": [
              "merged",
              "open",
              "closed"
            ],
            "enumColors": {
              "merged": "purple",
              "open": "green",
              "closed": "red"
            }
          },
          "closedAt": {
            "title": "Closed at",
            "type": "string",
            "format": "date-time"
          },
          "updatedAt": {
            "title": "Updated at",
            "type": "string",
            "format": "date-time"
          },
          "mergedAt": {
            "title": "Merged at",
            "type": "string",
            "format": "date-time"
          },
          "createdAt": {
            "title": "Created at",
            "type": "string",
            "format": "date-time"
          },
          "link": {
            "format": "url",
            "type": "string",
            "title": "Link"
          },
          "leadTimeHours": {
            "type": "number",
            "title": "Lead Time Hours"
          },
          "pr_age": {
            "icon": "DefaultProperty",
            "type": "number",
            "title": "PR Age"
          },
          "cycle_time": {
            "type": "number",
            "title": "Cycle Time"
          },
          "freshness": {
            "icon": "DefaultProperty",
            "type": "string",
            "title": "Freshness"
          }
        },
        "required": []
      },
      "mirrorProperties": {},
      "calculationProperties": {},
      "aggregationProperties": {},
      "relations": {
        "git_hub_assignees": {
          "title": "GitHub Assignees",
          "target": "githubUser",
          "required": false,
          "many": true
        },
        "git_hub_creator": {
          "title": "GitHub Creator",
          "target": "githubUser",
          "required": false,
          "many": false
        },
        "repository": {
          "title": "Repository",
          "target": "githubRepository",
          "required": false,
          "many": false
        },
        "git_hub_reviewers": {
          "title": "GitHub Reviewers",
          "target": "githubUser",
          "required": false,
          "many": true
        }
      }
    }
    ```

    </details>

:::caution Properties to create for existing PR blueprint
If you're updating an existing pull request blueprint, make sure to add the `pr_age`, `cycle_time`, and `freshness` properties if they don't already exist.
:::

4. Click `Save` to create or update the blueprint.

### Create the deployment blueprint

1. Go to your [Builder](https://app.getport.io/settings/data-model) page.
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.
4. Add this JSON schema:

    <details>
    <summary><b>Deployment blueprint (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "deployment",
      "title": "Deployment",
      "icon": "Deployment",
      "schema": {
        "properties": {
          "description": {
            "title": "Description",
            "type": "string"
          },
          "ref": {
            "title": "Ref",
            "type": "string"
          },
          "sha": {
            "title": "Sha",
            "type": "string"
          },
          "transientEnvironment": {
            "title": "Transient Running Service",
            "type": "boolean"
          },
          "productionEnvironment": {
            "title": "Production Running Service",
            "type": "boolean"
          },
          "createdAt": {
            "title": "Created At",
            "type": "string",
            "format": "date-time"
          },
          "url": {
            "title": "URL",
            "type": "string",
            "icon": "Link",
            "format": "url"
          }
        },
        "required": []
      },
      "mirrorProperties": {
        "owning_team": {
          "title": "Owning Team",
          "path": "service.$team"
        }
      },
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

5. Click `Save` to create the blueprint.

## Update integration mapping

Now we'll configure the GitHub integration to ingest data into your catalog.

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
          teams: true
        port:
          entity:
            mappings:
              identifier: .full_name
              title: .name
              blueprint: '"githubRepository"'
              properties:
                readme: file://README.md
                url: .html_url
                defaultBranch: .default_branch
                last_push: .pushed_at
      - kind: user
        selector:
          query: 'true'
        port:
          entity:
            mappings:
              identifier: .login
              title: .login
              blueprint: '"githubUser"'
      - kind: pull-request
        selector:
          query: 'true'
          closedPullRequests: true
        port:
          entity:
            mappings:
              identifier: .id|tostring
              title: .title
              blueprint: '"githubPullRequest"'
              properties:
                status: .status
                closedAt: .closed_at
                updatedAt: .updated_at
                mergedAt: .merged_at
                createdAt: .created_at
                link: .html_url
                leadTimeHours: >-
                  (.created_at as $createdAt | .merged_at as $mergedAt | ($createdAt
                  | sub("\\..*Z$"; "Z") | strptime("%Y-%m-%dT%H:%M:%SZ") | mktime)
                  as $createdTimestamp | ($mergedAt | if . == null then null else
                  sub("\\..*Z$"; "Z") | strptime("%Y-%m-%dT%H:%M:%SZ") | mktime end)
                  as $mergedTimestamp | if $mergedTimestamp == null then null else
                  (((($mergedTimestamp - $createdTimestamp) / 3600) * 100 | floor) /
                  100) end)
                pr_age: >-
                  ((now - (.created_at | sub("\\.[0-9]+Z$"; "Z") | fromdateiso8601))
                  / 86400) | round
                freshness: >-
                  ((now - (.created_at | sub("\\.[0-9]+Z$"; "Z") | fromdateiso8601))
                  / 86400 | round) as $age | if $age <= 3 then "0-3 days" elif $age
                  <= 7 then "3-7 days" else ">7 days" end
                cycle_time: >-
                  if .merged_at then (((.merged_at   | sub("\\.[0-9]+Z$"; "Z") |
                  fromdateiso8601) - (.created_at | sub("\\.[0-9]+Z$"; "Z") |
                  fromdateiso8601)) / 86400 | round) else null end
              relations:
                repository: .head.repo.full_name
      - kind: pull-request
        selector:
          query: 'true'
        port:
          entity:
            mappings:
              identifier: .id|tostring
              blueprint: '"githubPullRequest"'
              properties: {}
              relations:
                git_hub_assignees: '[.assignees[].login]'
                git_hub_reviewers: '[.requested_reviewers[].login]'
                git_hub_creator: .user.login
      - kind: deployment
        selector:
          query: 'true'
        port:
          entity:
            mappings:
              identifier: .repo + '-' + (.id|tostring)
              title: .task + '-' + .environment
              blueprint: '"deployment"'
              properties:
                description: .description
                ref: .ref
                sha: .sha
                productionEnvironment: .production_environment
                transientEnvironment: .transient_environment
                createdAt: .created_at
                url: .repository_url
              relations:
                service: .repo
    ```

    </details>

4. Click `Save & Resync` to apply the mapping.

## Visualize metrics

Once the GitHub data is synced, we can create a dedicated dashboard in Port to monitor and analyze delivery performance using customizable widgets.

### Create a dashboard

1. Navigate to your [software catalog](https://app.getport.io/organization/catalog).
2. Click on the **`+ New`** button in the left sidebar.
3. Select **New dashboard**.
4. Name the dashboard **Delivery Performance**.
5. Click `Create`.

We now have a blank dashboard where we can start adding widgets to visualize delivery performance metrics.

### Add widgets

In the new dashboard, create the following widgets:

<details>
<summary><b>PR throughput (weekly avg) (click to expand)</b></summary>

1. Click `+ Widget` and select **Number Chart**.
2. Title: `PR Throughput (Weekly Avg)`.
3. Description: `Average pull requests merged in the past 30 days`.
4. Select `Count entities` **Chart type** and choose **Pull Request** as the **Blueprint**.
5. Select `average` for the **Function**.
6. Select `week` for **Average of**.
7. Select `createdAt` for **Measure time by**.
8. Add this JSON to the **Dataset filter** editor:

    ```json showLineNumbers
    {
      "combinator": "and",
      "rules": [
        {
          "value": "merged",
          "property": "status",
          "operator": "="
        },
        {
          "property": "updatedAt",
          "operator": "between",
          "value": {
            "preset": "lastMonth"
          }
        }
      ]
    }
    ```

9. Select `custom` as the **Unit** and input `prs` as the **Custom unit**.
10. Click `Save`.

</details>

<details>
<summary><b>PR throughput (weekly trend) (click to expand)</b></summary>

1. Click `+ Widget` and select **Line Chart**.
2. Title: `PR Throughput (Weekly Trend)`.
3. Select `Count Entities (All Entities)` **Chart type** and choose **Pull Request** as the **Blueprint**.
4. Input `PR merged` as the **Y axis** **Title**.
5. Select `count` for the **Function**.
6. Add this JSON to the **Additional filters** editor:

    ```json showLineNumbers
    {
      "combinator": "and",
      "rules": [
        {
          "value": "merged",
          "property": "status",
          "operator": "="
        }
      ]
    }
    ```

7. Input `Date` as the **X axis** **Title**.
8. Select `createdAt` for **Measure time by**.
9. Set **Time Interval** to `week` and **Time Range** to `In the past 30 days`.
10. Click `Save`.

</details>

<details>
<summary><b>PR cycle time (weekly avg) (click to expand)</b></summary>

1. Click `+ Widget` and select **Number Chart**.
2. Title: `PR Cycle Time (Weekly Avg)`.
3. Select `Aggregate Property (All Entities)` **Chart type** and choose **Pull Request** as the **Blueprint**.
4. Select `cycle_time` as the **Property**.
5. Select `average` for the **Function**.
6. Select `week` for **Average of**.
7. Select `createdAt` for **Measure time by**.
8. Add this JSON to the **Additional filters** editor:

    ```json showLineNumbers
    {
      "combinator": "and",
      "rules": [
        {
          "value": "merged",
          "property": "status",
          "operator": "="
        },
        {
          "property": "updatedAt",
          "operator": "between",
          "value": {
            "preset": "lastMonth"
          }
        }
      ]
    }
    ```

9. Select `custom` as the **Unit** and input `days` as the **Custom unit**.
10. Click `Save`.

</details>

<details>
<summary><b>PR cycle time (weekly trend) (click to expand)</b></summary>

1. Click `+ Widget` and select **Line Chart**.
2. Title: `PR Cycle Time (Weekly Trend)`.
3. Select `Aggregate Property (All Entities)` **Chart type** and choose **Pull Request** as the **Blueprint**.
4. Input `Cycle Time (days)` as the **Y axis** **Title**.
5. Select `cycle_time` as the **Property**.
6. Select `average` for the **Function**.
7. Input `Date` as the **X axis** **Title**.
8. Select `createdAt` for **Measure time by**.
9. Set **Time Interval** to `week` and **Time Range** to `In the past 30 days`.
10. Add this JSON to the **Additional filters** editor:

    ```json showLineNumbers
    {
      "combinator": "and",
      "rules": [
        {
          "value": "merged",
          "property": "status",
          "operator": "="
        }
      ]
    }
    ```

11. Click `Save`.

</details>

<details>
<summary><b>Deployment frequency (click to expand)</b></summary>

1. Click `+ Widget` and select **Number Chart**.
2. Title: `Deployment Frequency`.
3. Select `Count entities` **Chart type** and choose **Deployment** as the **Blueprint**.
4. Select `count` for the **Function**.
5. Select `custom` as the **Unit** and input `deployments` as the **Custom unit**.
6. Click `Save`.

</details>

<details>
<summary><b>Deployment frequency (weekly trend) (click to expand)</b></summary>

1. Click `+ Widget` and select **Line Chart**.
2. Title: `Deployment Frequency (Weekly Trend)`.
3. Select `Count Entities (All Entities)` **Chart type** and choose **Deployment** as the **Blueprint**.
4. Input `Deployments` as the **Y axis** **Title**.
5. Select `count` for the **Function**.
6. Input `Date` as the **X axis** **Title**.
7. Select `createdAt` for **Measure time by**.
8. Set **Time Interval** to `week` and **Time Range** to `In the past 30 days`.
9. Click `Save`.

</details>

<details>
<summary><b>Overdue PRs (click to expand)</b></summary>

1. Click `+ Widget` and select **Number Chart**.
2. Title: `Overdue PRs`.
3. Description: `PRs opened longer than 3 days`.
4. Select `Count entities` **Chart type** and choose **Pull Request** as the **Blueprint**.
5. Select `count` for the **Function**.
6. Add this JSON to the **Dataset filter** editor:

    ```json showLineNumbers
    {
      "combinator": "and",
      "rules": [
        {
          "value": "open",
          "property": "status",
          "operator": "="
        },
        {
          "value": 3,
          "property": "pr_age",
          "operator": ">"
        },
        {
          "property": "createdAt",
          "operator": "between",
          "value": {
            "preset": "lastMonth"
          }
        }
      ]
    }
    ```

7. Select `custom` as the **Unit** and input `prs` as the **Custom unit**.
8. Click `Save`.

</details>

<details>
<summary><b>PR freshness distribution (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Pie chart**.
2. Title: `PR Freshness Distribution`.
3. Description: `0–3 days | 3–7 days | >7 days`.
4. Choose the **Pull Request** blueprint.
5. Under `Breakdown by property`, select the **Freshness** property.
6. Add this JSON to the **Additional filters** editor:

    ```json showLineNumbers
    {
      "combinator": "and",
      "rules": [
        {
          "value": "open",
          "property": "status",
          "operator": "="
        },
        {
          "property": "createdAt",
          "operator": "between",
          "value": {
            "preset": "lastMonth"
          }
        }
      ]
    }
    ```

7. Click **Save**.

</details>

<details>
<summary><b>Overdue PRs table (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Table**.
2. Title the widget **Overdue PRs**.
3. Choose the **Pull Request** blueprint.
4. Add this JSON to the **Initial filters** editor:

    ```json showLineNumbers
    {
      "combinator": "and",
      "rules": [
        {
          "value": "open",
          "property": "status",
          "operator": "="
        },
        {
          "value": 3,
          "property": "pr_age",
          "operator": ">"
        },
        {
          "property": "createdAt",
          "operator": "between",
          "value": {
            "preset": "lastMonth"
          }
        }
      ]
    }
    ```

5. Click **Save** to add the widget to the dashboard.
6. Click on the **`...`** button in the top right corner of the table and select **Customize table**.
7. In the top right corner of the table, click on `Manage Properties` and add the following properties:
    - **Repository**: The name of each related repository.
    - **Link**: The URL to the pull request.
    - **Title**: The title of the pull request.
    - **Owning Team**: The team that owns the service (via repository relation).
    - **PR Age**: The age of the pull request in days.
8. Click on the **save icon** in the top right corner of the widget to save the customized table.

</details>

## Related guides

- [Visualize your GitHub repository activity](/guides/all/visualize-your-github-repository-activity)
- [Visualize and manage GitHub deployments](/guides/all/visualize-and-manage-github-deployments)
- [Visualize your GitHub Dependabot alerts](/guides/all/visualize-your-github-dependabot-alerts)
