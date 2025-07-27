---
displayed_sidebar: null
description: Learn how to pull GitHub metrics data and build comprehensive visualizations in Port to track engineering performance.
---

import GithubActionModificationHint from '/docs/guides/templates/github/_github_action_modification_required_hint.mdx'
import GithubDedicatedRepoHint from '/docs/guides/templates/github/_github_dedicated_workflows_repository_hint.mdx'

# Pull GitHub metrics and build visualizations

This guide demonstrates how to collect GitHub metrics and build useful visualizations in Port to track key performance indicators. You will learn how to:

- **Extend existing blueprints** to capture detailed PR and workflow metrics.
- **Set up automated data collection** using GitHub Actions to pull metrics from the GitHub API.
- **Build dashboards** in Port to visualize engineering performance metrics.

<img src="/img/guides/github-metrics-dashboard.png" border="1px" width="100%" />


## Common use cases

- Visualize engineering productivity and identify areas for improvement.
- Track workflow success rates and execution times to identify bottlenecks.
- Set up automated metric collection to maintain up-to-date performance data.


## Prerequisites

This guide assumes the following:
- You have a Port account and have completed the [onboarding process](https://docs.port.io/getting-started/overview).
- Port's [GitHub app](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/git/github/#setup) is installed in your account.
- You have access to GitHub repositories and organizations you want to monitor.
<GithubDedicatedRepoHint/>


## Set up data model

The `Service` and `User` blueprints are created by default during onboarding. Likewise, the GitHub `Pull Request` blueprint is created by default when installing Port's GitHub app. However, we need to extend the existing `Pull Request` blueprint to capture the detailed metrics we want to track.


### Extend the GitHub Pull Request blueprint

1. Go to the [Builder](https://app.getport.io/settings/data-model) page of your portal.
2. Find and click on the `Pull Request` blueprint.
3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.
4. Add these additional properties to the existing schema:

    <details>
    <summary><b>Extended Pull Request properties (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "pr_size": {
        "title": "PR Size",
        "type": "number"
      },
      "pr_lifetime": {
        "title": "PR Lifetime (seconds)",
        "type": "number"
      },
      "pr_pickup_time": {
        "title": "PR Pickup Time (seconds)",
        "type": "number"
      },
      "pr_success_rate": {
        "title": "PR Success Rate (%)",
        "type": "number"
      },
      "review_participation": {
        "title": "Review Participation",
        "type": "number"
      }
    }
    ```
    </details>

5. Click `Save` to update the blueprint.


### Create the GitHub Workflow blueprint

We need to create a new blueprint to track GitHub workflow metrics.

1. Go to the [Builder](https://app.getport.io/settings/data-model) page of your portal.
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.
4. Add this JSON schema:

    <details>
    <summary><b>GitHub Workflow blueprint (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "githubWorkflow",
      "title": "Workflow",
      "icon": "Github",
      "schema": {
        "properties": {
          "path": {
            "title": "Path",
            "type": "string"
          },
          "status": {
            "title": "Status",
            "type": "string",
            "enum": [
              "active",
              "deleted",
              "disabled_fork",
              "disabled_inactivity",
              "disabled_manually"
            ],
            "enumColors": {
              "active": "green",
              "deleted": "red"
            }
          },
          "createdAt": {
            "title": "Created At",
            "type": "string",
            "format": "date-time"
          },
          "updatedAt": {
            "title": "Updated At",
            "type": "string",
            "format": "date-time"
          },
          "deletedAt": {
            "title": "Deleted At",
            "type": "string",
            "format": "date-time"
          },
          "link": {
            "title": "Link",
            "type": "string",
            "format": "url"
          },
          "medianDuration_last_30_days": {
            "title": "Median Duration Last 30 days",
            "description": "Median Duration of Successful runs in the last 30 days",
            "type": "number"
          },
          "maxDuration_last_30_days": {
            "title": "Max Duration Last 30 days",
            "description": "Max Duration of Successful runs in the last 30 days",
            "type": "number"
          },
          "minDuration_last_30_days": {
            "title": "Min Duration Last 30 days",
            "description": "Min Duration of Successful runs in the last 30 days",
            "type": "number"
          },
          "meanDuration_last_30_days": {
            "title": "Mean Duration Last 30 days",
            "description": "Mean Duration of Successful runs in the last 30 days",
            "type": "number"
          },
          "totalRuns_last_30_days": {
            "title": "Total Runs Last 30 days",
            "description": "Total workflow runs in the last 30 days",
            "type": "number"
          },
          "totalFailures_last_30_days": {
            "title": "Total Failures Last 30 days",
            "description": "Total Workflow Run Failures in the last 30 days",
            "type": "number"
          },
          "successRate_last_30_days": {
            "title": "Success Rate Last 30 days",
            "description": "Success Rate for the workflow in the last 30 days",
            "type": "number"
          },
          "medianDuration_last_90_days": {
            "title": "Median Duration Last 90 days",
            "description": "Median Duration of Successful runs in the last 90 days",
            "type": "number"
          },
          "maxDuration_last_90_days": {
            "title": "Max Duration Last 90 days",
            "description": "Max Duration of Successful runs in the last 90 days",
            "type": "number"
          },
          "minDuration_last_90_days": {
            "title": "Min Duration Last 90 days",
            "description": "Min Duration of Successful runs in the last 90 days",
            "type": "number"
          },
          "meanDuration_last_90_days": {
            "title": "Mean Duration Last 90 days",
            "description": "Mean Duration of Successful runs in the last 90 days",
            "type": "number"
          },
          "totalRuns_last_90_days": {
            "title": "Total Runs Last 90 days",
            "description": "Total workflow runs in the last 90 days",
            "type": "number"
          },
          "totalFailures_last_90_days": {
            "title": "Total Failures Last 90 days",
            "description": "Total Workflow Run Failures in the last 90 days",
            "type": "number"
          },
          "successRate_last_90_days": {
            "title": "Success Rate Last 90 days",
            "description": "Success Rate for the workflow in the last 90 days",
            "type": "number"
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
          "target": "service",
          "required": false,
          "many": false
        }
      }
    }
    ```
    </details>

5. Click `Save` to create the blueprint.


## Set up metric collection

Now we will set up automated metric collection using the GitHub metrics exporter. This tool will pull data from the GitHub API and calculate the metrics we defined in our blueprints.


### Configure GitHub Personal Access Token

The metric exporter needs access to the GitHub API to pull the relevant data. You will need to configure a classic Personal Access Token (PAT) with the following permissions:

- `repo` - Full control of private repositories
- `workflow` - Update GitHub Action workflows
- `read:org` - Read org and team data
- `read:user` - Read user profile data
- `user:email` - Access user email addresses
- `read:enterprise` - Read enterprise data
- `read:audit_log` - Read audit logs (required for determining join dates)

:::caution Required permissions
The GitHub PAT requires enterprise-level permissions to access audit logs for determining user join dates. Make sure your token has the necessary scope.
:::


### Set up the metrics exporter

1. Clone the repository from [https://github.com/port-experimental/github-metrics.git](https://github.com/port-experimental/github-metrics.git)

2. Copy the example environment file and configure it with your access keys:
   ```bash
   cp .env.example .env
   ```

3. Fill out the `.env` file with the following variables:
   - `PORT_CLIENT_ID` - Your Port Client ID
   - `PORT_CLIENT_SECRET` - Your Port Client Secret
   - `X_GITHUB_ORGS` - Comma-separated list of GitHub organizations to monitor
   - `X_GITHUB_ENTERPRISE` - Your GitHub Enterprise instance (if applicable)
   - `X_GITHUB_TOKEN` - Your GitHub Personal Access Token

4. Install the CLI:
   ```bash showLineNumbers
   npm install
   npm run build
   npm link
   ```

5. Run the metric collectors:
   ```bash showLineNumbers
   gh-metrics onboarding-metrics
   gh-metrics pr-metrics
   gh-metrics workflow-metrics
   ```


### Running as a GitHub Action

For automated metric collection, you can set up the metrics exporter to run as a GitHub Action on a daily basis.

<h3>Add GitHub secrets</h3>

In your GitHub repository, [go to **Settings > Secrets**](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository) and add the following secrets:

- `PORT_CLIENT_ID` - Port Client ID [learn more](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token).
- `PORT_CLIENT_SECRET` - Port Client Secret [learn more](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token).
- `X_GITHUB_ORGS` - Comma-separated list of GitHub organizations to monitor.
- `X_GITHUB_ENTERPRISE` - Your GitHub Enterprise instance (if applicable).
- `X_GITHUB_TOKEN` - Your GitHub Personal Access Token.

<h3>Create GitHub workflow</h3>

Create the file `.github/workflows/collect_metrics.yml` in your repository:

<details>
<summary><b>GitHub metrics collection workflow (Click to expand)</b></summary>

```yaml showLineNumbers
name: collect_metrics
on:
    workflow_dispatch:
    schedule:
      - cron: '0 0 * * *'
jobs:
    onboarding:
      name: onboarding_metrics
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - uses: oven-sh/setup-bun@v2
        - run: bun run src/main.ts onboarding-metrics
          env:
            X_GITHUB_ORGS: ${{ secrets.X_GITHUB_ORGS }}
            X_GITHUB_ENTERPRISE: ${{ secrets.X_GITHUB_ENTERPRISE }}
            X_GITHUB_TOKEN: ${{ secrets.X_GITHUB_TOKEN }}
            PORT_CLIENT_ID: ${{ secrets.PORT_CLIENT_ID }}
            PORT_CLIENT_SECRET: ${{ secrets.PORT_CLIENT_SECRET }}
    pr:
      name: pr_metrics
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - uses: oven-sh/setup-bun@v2
        - run: bun run src/main.ts pr-metrics
          env:
            X_GITHUB_ORGS: ${{ secrets.X_GITHUB_ORGS }}
            X_GITHUB_ENTERPRISE: ${{ secrets.X_GITHUB_ENTERPRISE }}
            X_GITHUB_TOKEN: ${{ secrets.X_GITHUB_TOKEN }}
            PORT_CLIENT_ID: ${{ secrets.PORT_CLIENT_ID }}
            PORT_CLIENT_SECRET: ${{ secrets.PORT_CLIENT_SECRET }}
    workflow:
      name: workflow_metrics
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - uses: oven-sh/setup-bun@v2
        - run: bun run src/main.ts workflow-metrics
          env:
            X_GITHUB_ORGS: ${{ secrets.X_GITHUB_ORGS }}
            X_GITHUB_ENTERPRISE: ${{ secrets.X_GITHUB_ENTERPRISE }}
            X_GITHUB_TOKEN: ${{ secrets.X_GITHUB_TOKEN }}
            PORT_CLIENT_ID: ${{ secrets.PORT_CLIENT_ID }}
            PORT_CLIENT_SECRET: ${{ secrets.PORT_CLIENT_SECRET }}
```
</details>

This workflow will run daily at midnight and collect metrics for:
- **Onboarding metrics** - Track user join dates and team assignments
- **PR metrics** - Calculate PR size, lifetime, pickup time, and success rates
- **Workflow metrics** - Track workflow execution times and success rates

:::tip Metric collection frequency
The metrics are collected daily by default. You can adjust the cron schedule in the GitHub Action to collect metrics more or less frequently based on your needs.
:::

:::info Performance optimization
For large organizations with many repositories, consider running the metrics collection during off-peak hours to avoid GitHub API rate limits.
::: 


## Visualize metrics dashboard

With your data collection in place, we can create a dashboard in Port to visualize all GitHub metrics and track engineering performance.


### Create a dashboard

1. Navigate to the [Catalog](https://app.getport.io/organization/catalog) page of your portal.
2. Click on the **`+ New`** button in the left sidebar.
3. Select **New dashboard**.
4. Name the dashboard **GitHub Engineering Metrics**.
5. Input `Monitor engineering performance and workflow metrics from GitHub` under **Description**.
6. Select the `Github` icon.
7. Click `Create`.


### Add widgets

In the new dashboard, create the following widgets to visualize your GitHub metrics:

<details>
<summary><b>Average PR Lifetime (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Number Chart**.
2. Title: `Average PR Lifetime` (add the `Github` icon).
3. Select `Average entities` **Chart type** and choose **GitHub Pull Request** as the **Blueprint**.
4. Select `pr_lifetime` for the **Property** and choose **Average of** `total`.
5. Select `custom` as the **Unit** and input `seconds` as the **Custom unit**.
6. Click **Save**.

</details>


<details>
<summary><b>Average PR Size (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Number Chart**.
2. Title: `Average PR Size` (add the `Github` icon).
3. Select `Average entities` **Chart type** and choose **GitHub Pull Request** as the **Blueprint**.
4. Select `pr_size` for the **Property** and choose **Average of** `total`.
5. Select `custom` as the **Unit** and input `lines of code` as the **Custom unit**.
6. Click **Save**.

</details>


<details>
<summary><b>Total Merged PRs (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Number Chart**.
2. Title: `Total Merged PRs` (add the `Github` icon).
3. Select `Count entities` **Chart type** and choose **GitHub Pull Request** as the **Blueprint**.
4. Select `count` for the **Function**.
5. Add this JSON to the **Additional filters** editor to filter merged PRs:
    ```json showlineNumbers
    [
        {
            "combinator":"and",
            "rules":[
                {
                    "property":"pr_success_rate",
                    "operator":"=",
                    "value": 1
                }
            ]
        }
    ]
    ```
6. Select `custom` as the **Unit** and input `PRs` as the **Custom unit**.
7. Click **Save**.

</details>


<details>
<summary><b>Workflow Success Rates (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Number Chart**.
2. Title: `Average Workflow Success Rate (30 days)` (add the `Github` icon).
3. Select `Average entities` **Chart type** and choose **Workflow** as the **Blueprint**.
4. Select `successRate_last_30_days` for the **Property** and choose **Average of** `total`.
5. Select `custom` as the **Unit** and input `%` as the **Custom unit**.
6. Click **Save**.

</details>


<details>
<summary><b>Average Workflow Duration (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Number Chart**.
2. Title: `Average Workflow Duration` (add the `Github` icon).
3. Select `Average entities` **Chart type** and choose **Workflow** as the **Blueprint**.
4. Select `meanDuration_last_30_days` for the **Property** and choose **Average of** `total`.
5. Select `custom` as the **Unit** and input `seconds` as the **Custom unit**.
6. Click **Save**.

</details>


<details>
<summary><b>PR Metrics Table (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Table**.
2. Title: `PR Performance Metrics` (add the `Github` icon).
3. Choose the **GitHub Pull Request** blueprint.
4. Click **Save** to add the widget to the dashboard.
5. Click on the **`...`** button in the top right corner of the table and select **Customize table**.
6. In the top right corner of the table, click on `Manage Properties` and add the following properties:
   - **Title**: The PR title.
   - **PR Size**: Number of lines changed.
   - **PR Lifetime (seconds)**: Time from creation to merge.
   - **PR Pickup Time (seconds)**: Time to first review.
   - **PR Success Rate (%)**: Percentage of successful PRs.
   - **Review Participation**: Number of reviewers.
   - **State**: Current PR state (open, closed, merged).
7. Click on the **Group by any Column** and select **Repository**.
8. Click on the **save icon** in the top right corner of the widget to save the customized table.

</details>
