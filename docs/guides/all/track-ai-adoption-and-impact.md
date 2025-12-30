---
displayed_sidebar: null
description: Learn how to track AI adoption across engineering teams and assess the impact of AI usage on delivery metrics like PR throughput and cycle time using Port's GitHub integration.
---

# Track AI adoption and impact

Tracking AI adoption provides visibility into how engineering teams are leveraging AI coding agents and the impact these tools have on delivery outcomes. Without visibility into AI usage patterns, teams struggle to understand adoption rates, measure productivity gains, and identify which teams or services benefit most from AI assistance.


This guide helps engineering managers, platform engineers, and product leaders answer critical questions about AI adoption:

- **Adoption**: Which teams and services are using AI coding agents?
- **Impact**: How does AI assistance affect PR throughput and cycle time?
- **Effectiveness**: Are AI-assisted PRs delivering faster or higher quality outcomes?

By the end of this guide, you will have dashboards that track AI adoption metrics, enabling you to understand usage patterns, measure productivity impact, and make informed decisions about AI tool investments across your organization.

<img src="/img/guides/ai-adoption-dashboard.png" border="1px" width="100%" />


## Common use cases

- Compare PR throughput and cycle time between AI-assisted and traditional workflows.
- Identify teams and services with the highest AI adoption rates.
- Track AI usage trends over time to understand adoption patterns.

## Prerequisites

This guide assumes the following:

- You have a Port account and have completed the [onboarding process](https://docs.port.io/getting-started/overview).
- Port's [GitHub integration](/build-your-software-catalog/sync-data-to-catalog/git/github/) is installed in your account.
- The `githubPullRequest` and `githubRepository` blueprints are already created (these are created when you install the GitHub integration).


## Set up data model

We will update existing blueprints to support AI adoption tracking. The `githubPullRequest` and `githubRepository` blueprints should already exist from the GitHub integration installation.

### Update the GitHub repository blueprint

We need to ensure the repository blueprint includes the language, visibility and last push property for better service identification.

1. Go to the [Builder](https://app.getport.io/settings/data-model) page of your portal.
2. Find the `githubRepository` blueprint and click on it.
3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.
4. Copy and paste the following JSON schema:

    <details>
    <summary><b>GitHub repository blueprint (click to expand)</b></summary>

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
          },
          "visibility": {
            "type": "string",
            "title": "Visibility"
          },
          "language": {
            "type": "string",
            "title": "Language"
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

5. Click `Save` to update the blueprint.

### Update the GitHub pull request blueprint

We need to add the `created_by_ai_agent` property to track AI-assisted PRs.

1. Go to the [Builder](https://app.getport.io/settings/data-model) page of your portal.
2. Find the `githubPullRequest` blueprint and click on it.
3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.
4. Copy and paste the following JSON schema:

    <details>
    <summary><b>Updated GitHub pull request blueprint (click to expand)</b></summary>

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
          "created_by_ai_agent": {
            "type": "boolean",
            "title": "Created By AI Agent",
            "description": "Determines whether or not the PR was created by an AI agent such as copilot, claude or devin"
          }
        },
        "required": []
      },
      "mirrorProperties": {},
      "calculationProperties": {},
      "aggregationProperties": {},
      "relations": {
        "repository": {
          "title": "Repository",
          "target": "githubRepository",
          "required": false,
          "many": false
        }
      }
    }
    ```

    </details>

    :::caution Properties to add for existing PR blueprint
    If you're updating an existing pull request blueprint, make sure to add the `created_by_ai_agent` property if it doesn't already exist.
    :::

5. Click `Save` to update the blueprint.

## Update integration mapping

Now we'll configure the GitHub integration to detect AI-assisted PRs and ingest the necessary data.

1. Go to your [Data Source](https://app.getport.io/settings/data-sources) page.
2. Select the GitHub integration.
3. Add or update the following YAML block in the editor:

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
                visibility: .visibility
                language: .language
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
                created_by_ai_agent: .user.login | ascii_downcase | test("(copilot|claude|devin)")
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
                cycle_time: >-
                  if .merged_at then (((.merged_at   | sub("\\.[0-9]+Z$"; "Z") |
                  fromdateiso8601) - (.created_at | sub("\\.[0-9]+Z$"; "Z") |
                  fromdateiso8601)) / 86400 | round) else null end
              relations:
                repository: .head.repo.full_name
    ```

    </details>

    :::tip AI agent detection
    The mapping uses a regex pattern to detect AI agents by checking if the PR creator's username contains "copilot", "claude", or "devin" (case-insensitive). You can customize this pattern to match your organization's AI agent naming conventions.
    :::

4. Click `Save & Resync` to apply the mapping.

## Visualize metrics

Once the GitHub data is synced, we can create a dedicated dashboard in Port to monitor and analyze AI adoption and impact metrics.

### Create a dashboard

1. Navigate to your [software catalog](https://app.getport.io/organization/catalog).
2. Click on the **`+ New`** button in the left sidebar.
3. Select **New dashboard**.
4. Name the dashboard **AI Impact**.
5. Click `Create`.

We now have a blank dashboard where we can start adding widgets to visualize AI adoption metrics.

### Add widgets

In the new dashboard, create the following widgets:

<details>
<summary><b>Avg PR throughput (with AI) (click to expand)</b></summary>

1. Click `+ Widget` and select **Number Chart**.
2. Title: `Avg PR Throughput (With AI)`.
3. Select `Count entities` **Chart type** and choose **Pull Request** as the **Blueprint**.
4. Select `count` for the **Function**.
5. Add this JSON to the **Dataset filter** editor:

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
          "value": true,
          "property": "created_by_ai_agent",
          "operator": "="
        }
      ]
    }
    ```

6. Select `custom` as the **Unit** and input `prs` as the **Custom unit**.
7. Click `Save`.

</details>

<details>
<summary><b>Avg PR throughput (without AI) (click to expand)</b></summary>

1. Click `+ Widget` and select **Number Chart**.
2. Title: `Avg PR Throughput (Without AI)`.
3. Select `Count entities` **Chart type** and choose **Pull Request** as the **Blueprint**.
4. Select `count` for the **Function**.
5. Add this JSON to the **Dataset filter** editor:

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
          "value": false,
          "property": "created_by_ai_agent",
          "operator": "="
        }
      ]
    }
    ```

6. Select `custom` as the **Unit** and input `prs` as the **Custom unit**.
7. Click `Save`.

</details>

<details>
<summary><b>Avg PR cycle time (AI-assisted PRs) (click to expand)</b></summary>

1. Click `+ Widget` and select **Number Chart**.
2. Title: `Avg PR Cycle Time (AI-assisted PRs)`.
3. Select `Aggregate Property (All Entities)` **Chart type** and choose **Pull Request** as the **Blueprint**.
4. Select `cycle_time` as the **Property**.
5. Select `average` for the **Function**.
6. Add this JSON to the **Dataset filter** editor:

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
          "value": true,
          "property": "created_by_ai_agent",
          "operator": "="
        }
      ]
    }
    ```

7. Select `custom` as the **Unit** and input `days` as the **Custom unit**.
8. Click `Save`.

</details>

<details>
<summary><b>Avg PR cycle time (without AI assistance) (click to expand)</b></summary>

1. Click `+ Widget` and select **Number Chart**.
2. Title: `Avg PR Cycle Time (Without AI Assistance)`.
3. Select `Aggregate Property (All Entities)` **Chart type** and choose **Pull Request** as the **Blueprint**.
4. Select `cycle_time` as the **Property**.
5. Select `average` for the **Function**.
6. Add this JSON to the **Dataset filter** editor:

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
          "value": false,
          "property": "created_by_ai_agent",
          "operator": "="
        }
      ]
    }
    ```

7. Select `custom` as the **Unit** and input `days` as the **Custom unit**.
8. Click `Save`.

</details>

<details>
<summary><b>PR cycle time with AI weekly trend (click to expand)</b></summary>

1. Click `+ Widget` and select **Line Chart**.
2. Title: `PR Cycle Time with AI Weekly Trend`.
3. Select `Aggregate Property (All Entities)` **Chart type** and choose **Pull Request** as the **Blueprint**.
4. Input `Avg Cycle Time` as the **Y axis** **Title**.
5. Select `cycle_time` as the **Property**.
6. Select `average` for the **Function**.
7. Add this JSON to the **Additional filters** editor:

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
          "value": [
            "Claude",
            "GitHub Copilot"
          ],
          "property": "created_by",
          "operator": "in"
        }
      ]
    }
    ```

8. Input `Date` as the **X axis** **Title**.
9. Select `createdAt` for **Measure time by**.
10. Set **Time Interval** to `week` and **Time Range** to `In the past 30 days`.
11. Click `Save`.

</details>

<details>
<summary><b>PRs created with AI (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Pie chart**.
2. Title: `PRs Created with AI`.
3. Choose the **Pull Request** blueprint.
4. Under `Breakdown by property`, select the **Created By AI Agent** property.
5. Click **Save**.

</details>

<details>
<summary><b>Top services using AI (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Table**.
2. Title the widget **Top Services Using AI**.
3. Choose the **Pull Request** blueprint.
4. Add this JSON to the **Initial filters** editor:

    ```json showLineNumbers
    {
      "combinator": "and",
      "rules": [
        {
          "value": true,
          "property": "created_by_ai_agent",
          "operator": "="
        }
      ]
    }
    ```

5. Click **Save** to add the widget to the dashboard.
6. Click on the **`...`** button in the top right corner of the table and select **Customize table**.
7. In the top right corner of the table, click on `Manage Properties` and add the following properties:
    - **Repository**: The related repository name.
    - **Title**: The title of the pull request.
    - **Status**: The status of the pull request.
    - **Link**: The URL to the pull request.
    - **Branch**: The branch name (if available).
8. Click on the **Group by any Column** button in the top right corner and select **Repository**.
9. Click on the **save icon** in the top right corner of the widget to save the customized table.

</details>

<details>
<summary><b>Top teams using AI (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Bar Chart**.
2. Title: `Top Teams Using AI`.
3. Choose the **Pull Request** blueprint.
4. Under `Breakdown by property`, select the **Owning Team** property (this is typically available via the repository relation).
5. Add this JSON to the **Additional filters** editor:

    ```json showLineNumbers
    {
      "combinator": "and",
      "rules": [
        {
          "value": true,
          "property": "created_by_ai_agent",
          "operator": "="
        }
      ]
    }
    ```

6. Click **Save**.

</details>

## Related guides

- [Track AI-driven pull requests](/guides/all/track-ai-driven-pull-requests)
- [Measure and track delivery performance](/guides/all/measure-and-track-delivery-performance)
- [Measure reliability and stability of delivery pipeline](/guides/all/measure-reliability-and-stability)
- [Visualize your GitHub repository activity](/guides/all/visualize-your-github-repository-activity)
