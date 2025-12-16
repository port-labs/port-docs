---
displayed_sidebar: null
description: Learn how to measure reliability and stability of your delivery pipeline by tracking workflow failure rates and PRs blocked by failing CI/CD using Port's GitHub integration.
---

# Measure reliability and stability of delivery pipeline

This guide demonstrates how to set up a reliability and stability monitoring solution across engineering teams. You will learn how to measure key engineering metrics that help platform engineering teams understand, assess, and improve the reliability and resilience of software systems using operational and delivery signals stored in Port's catalog.

<img src="/img/guides/reliability-dashboard-1.png" border="1px" width="100%" />
<img src="/img/guides/reliability-dashboard-2.png" border="1px" width="100%" />


## Common use cases

- Track workflow failure rates to identify unstable CI/CD pipelines.
- Monitor PRs blocked by failing CI/CD to understand delivery bottlenecks.
- Identify services and workflows with the highest failure rates.
- Understand where instability concentrates across services and teams.

## Prerequisites

This guide assumes the following:

- You have a Port account and have completed the [onboarding process](https://docs.port.io/getting-started/overview).
- Port's [GitHub integration](/build-your-software-catalog/sync-data-to-catalog/git/github/) is installed in your account.
- The `githubPullRequest` and `githubRepository` blueprints are already created (these are created when you install the GitHub integration).

## Key metrics overview

We will track two key metrics to measure reliability and stability:

1. **Workflow failure rate** - Measures how often workflows succeed and where failures concentrate.
2. **PRs blocked by failing CI/CD** - Shows how frequently failures block PRs and impact delivery.

## Set up data model

We will create blueprints to model your GitHub workflow data. The `githubPullRequest` and `githubRepository` blueprints should already exist from the GitHub integration installation.

### Create the GitHub workflow blueprint

1. Go to the [Builder](https://app.getport.io/settings/data-model) page of your portal.
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.
4. Add this JSON schema:

    <details>
    <summary><b>GitHub workflow blueprint (Click to expand)</b></summary>

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

5. Click `Save` to create the blueprint.

### Create the GitHub workflow run blueprint

1. Go to the [Builder](https://app.getport.io/settings/data-model) page of your portal.
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.
4. Add this JSON schema:

    <details>
    <summary><b>GitHub workflow run blueprint (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "githubWorkflowRun",
      "title": "Workflow Run",
      "icon": "Github",
      "schema": {
        "properties": {
          "name": {
            "title": "Name",
            "type": "string"
          },
          "triggeringActor": {
            "title": "Triggering Actor",
            "type": "string"
          },
          "status": {
            "title": "Status",
            "type": "string",
            "enum": [
              "completed",
              "action_required",
              "cancelled",
              "startup_failure",
              "failure",
              "neutral",
              "skipped",
              "stale",
              "success",
              "timed_out",
              "in_progress",
              "queued",
              "requested",
              "waiting"
            ],
            "enumColors": {
              "queued": "yellow",
              "in_progress": "yellow",
              "success": "green",
              "failure": "red"
            }
          },
          "conclusion": {
            "title": "Conclusion",
            "type": "string",
            "enum": [
              "completed",
              "action_required",
              "cancelled",
              "startup_failure",
              "failure",
              "neutral",
              "skipped",
              "stale",
              "success",
              "timed_out",
              "in_progress",
              "queued",
              "requested",
              "waiting"
            ],
            "enumColors": {
              "queued": "yellow",
              "in_progress": "yellow",
              "success": "green",
              "failure": "red"
            }
          },
          "createdAt": {
            "title": "Created At",
            "type": "string",
            "format": "date-time"
          },
          "runStartedAt": {
            "title": "Run Started At",
            "type": "string",
            "format": "date-time"
          },
          "updatedAt": {
            "title": "Updated At",
            "type": "string",
            "format": "date-time"
          },
          "runNumber": {
            "title": "Run Number",
            "type": "number"
          },
          "runAttempt": {
            "title": "Run Attempts",
            "type": "number"
          },
          "link": {
            "title": "Link",
            "type": "string",
            "format": "url"
          },
          "headBranch": {
            "title": "Head Branch",
            "description": "The branch that triggered the workflow run",
            "type": "string"
          }
        },
        "required": []
      },
      "mirrorProperties": {
        "repository": {
          "title": "Repository",
          "path": "workflow.repository.$title"
        }
      },
      "calculationProperties": {},
      "aggregationProperties": {},
      "relations": {
        "pullRequests": {
          "title": "Pull Requests",
          "target": "githubPullRequest",
          "required": false,
          "many": true
        },
        "workflow": {
          "target": "githubWorkflow",
          "required": true,
          "many": false
        }
      }
    }
    ```

    </details>

5. Click `Save` to create the blueprint.

## Update integration mapping

Now we'll configure the GitHub integration to ingest workflow and workflow run data into your catalog. If you already have existing mappings for repositories and pull requests, make sure to include the workflow and workflow-run kinds.

:::caution Branch property required
For the workflow run to pull request relation to work correctly, ensure your `githubPullRequest` blueprint has a `branch` property. If it doesn't exist, add it to the blueprint schema as a string property. The mapping below includes the `branch` property in the pull request mapping.
:::

1. Go to your [Data Source](https://app.getport.io/settings/data-sources) page.
2. Select the GitHub integration.
3. Add or update the following YAML block in the editor to ingest data from GitHub:

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
      - kind: pull-request
        selector:
          query: 'true'
          closedPullRequests: false
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
                branch: .head.ref
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
      - kind: workflow
        selector:
          query: 'true'
        port:
          entity:
            mappings:
              identifier: >-
                (.url | capture("repos/(?<repo>[^/]+/[^/]+)/") | .repo) +
                (.id|tostring)
              title: .name
              blueprint: '"githubWorkflow"'
              properties:
                path: .path
                status: .state
                createdAt: .created_at
                updatedAt: .updated_at
                link: .html_url
              relations:
                repository: (.url | capture("repos/(?<repo>[^/]+/[^/]+)/") | .repo)
      - kind: workflow-run
        selector:
          query: 'true'
        port:
          entity:
            mappings:
              identifier: .repository.full_name + (.id|tostring)
              title: .display_title
              blueprint: '"githubWorkflowRun"'
              properties:
                name: .name
                triggeringActor: .triggering_actor.login
                status: .status
                conclusion: .conclusion
                createdAt: .created_at
                runStartedAt: .run_started_at
                updatedAt: .updated_at
                runNumber: .run_number
                runAttempt: .run_attempt
                link: .html_url
                headBranch: .head_branch
              relations:
                workflow: .repository.full_name + (.workflow_id|tostring)
                pullRequests:
                  combinator: '"and"'
                  rules:
                    - property: '"branch"'
                      operator: '"="'
                      value: .head_branch
    ```

    </details>

:::tip Existing mappings
If you already have mappings for repositories and pull requests, make sure to add the `workflow` and `workflow-run` kinds to your existing configuration. The mapping above includes all required kinds for this guide.
:::

4. Click `Save & Resync` to apply the mapping.

## Visualize metrics

Once the GitHub data is synced, we can create a dedicated dashboard in Port to monitor and analyze reliability and stability metrics using customizable widgets.

### Create a dashboard

1. Navigate to your [software catalog](https://app.getport.io/organization/catalog).
2. Click on the **`+ New`** button in the left sidebar.
3. Select **New dashboard**.
4. Name the dashboard **Reliability**.
5. Click `Create`.

We now have a blank dashboard where we can start adding widgets to visualize reliability and stability metrics.

### Add widgets

In the new dashboard, create the following widgets:

<details>
<summary><b>Workflow failure rate (last 7 days) (click to expand)</b></summary>

1. Click `+ Widget` and select **Number Chart**.
2. Title: `Workflow Failure Rate (Last 7 Days)`.
3. Description: `Total number of failed workflow runs in the past week`.
4. Select `Count entities` **Chart type** and choose **Workflow Run** as the **Blueprint**.
5. Select `count` for the **Function**.
6. Add this JSON to the **Dataset filter** editor:

    ```json showLineNumbers
    {
      "combinator": "and",
      "rules": [
        {
          "value": "failure",
          "property": "conclusion",
          "operator": "="
        },
        {
          "property": "runStartedAt",
          "operator": "between",
          "value": {
            "preset": "lastWeek"
          }
        }
      ]
    }
    ```

7. Select `custom` as the **Unit** and input `workflow(s)` as the **Custom unit**.
8. Click `Save`.

</details>

<details>
<summary><b>Workflow failure trend (weekly) (click to expand)</b></summary>

1. Click `+ Widget` and select **Line Chart**.
2. Title: `Workflow Failure Trend (Weekly)`.
3. Description: `Weekly trend of failed workflow runs over the past 30 days`.
4. Select `Count Entities (All Entities)` **Chart type** and choose **Workflow Run** as the **Blueprint**.
5. Input `# Failed Workflows` as the **Y axis** **Title**.
6. Select `count` for the **Function**.
7. Add this JSON to the **Additional filters** editor:

    ```json showLineNumbers
    {
      "combinator": "and",
      "rules": [
        {
          "value": "failure",
          "property": "conclusion",
          "operator": "="
        }
      ]
    }
    ```

8. Input `Date` as the **X axis** **Title**.
9. Select `runStartedAt` for **Measure time by**.
10. Set **Time Interval** to `week` and **Time Range** to `In the past 30 days`.
11. Click `Save`.

</details>

<details>
<summary><b>Workflow runs with most failures (last 7 days) (click to expand)</b></summary>

1. Click `+ Widget` and select **Bar Chart**.
2. Title: `Workflow Runs with Most Failures (Last 7 Days)`.
3. Description: `Workflows with the highest number of failures in the past week`.
4. Choose the **Workflow Run** blueprint.
5. Under `Breakdown by property`, select the **Name** property.
6. Add this JSON to the **Additional filters** editor:

    ```json showLineNumbers
    {
      "combinator": "and",
      "rules": [
        {
          "value": "failure",
          "property": "conclusion",
          "operator": "="
        },
        {
          "property": "runStartedAt",
          "operator": "between",
          "value": {
            "preset": "lastWeek"
          }
        }
      ]
    }
    ```

7. Click `Save`.

</details>

<details>
<summary><b>Services with highest CI/CD failure rate % (last 7 days) (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Pie chart**.
2. Title: `Services with Highest CI/CD Failure Rate % (Last 7 Days)`.
3. Description: `Distribution of failed workflow runs by repository in the past week`.
4. Choose the **Workflow Run** blueprint.
5. Under `Breakdown by property`, select the **Repository** property (this is a mirror property from the workflow relation).
6. Add this JSON to the **Additional filters** editor:

    ```json showLineNumbers
    {
      "combinator": "and",
      "rules": [
        {
          "value": "failure",
          "property": "conclusion",
          "operator": "="
        },
        {
          "property": "runStartedAt",
          "operator": "between",
          "value": {
            "preset": "lastWeek"
          }
        }
      ]
    }
    ```

7. Click **Save**.

</details>

<details>
<summary><b>Number of PRs blocked by failing CI/CD (click to expand)</b></summary>

1. Click `+ Widget` and select **Number Chart**.
2. Title: `PRs Blocked by Failing CI/CD`.
3. Select `Count entities` **Chart type** and choose **Workflow Run** as the **Blueprint**.
4. Select `count` for the **Function**.
5. Add this JSON to the **Dataset filter** editor:

    ```json showLineNumbers
    {
      "combinator": "and",
      "rules": [
        {
          "value": "failure",
          "property": "conclusion",
          "operator": "="
        },
        {
          "property": "pullRequests",
          "operator": "isNotEmpty"
        }
      ]
    }
    ```

:::tip Filtering by related entities
The filter `"property": "pullRequests", "operator": "isNotEmpty"` ensures we only count workflow runs that have related pull requests, indicating PRs that are blocked by failing CI/CD.
:::

6. Select `custom` as the **Unit** and input `prs` as the **Custom unit**.
7. Click `Save`.

</details>

<details>
<summary><b>PRs blocked by failing CI/CD table (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Table**.
2. Title the widget **PRs Blocked by Failing CI/CD**.
3. Choose the **Workflow Run** blueprint.
4. Add this JSON to the **Initial filters** editor:

    ```json showLineNumbers
    {
      "combinator": "and",
      "rules": [
        {
          "value": "failure",
          "property": "conclusion",
          "operator": "="
        },
        {
          "property": "pullRequests",
          "operator": "isNotEmpty"
        }
      ]
    }
    ```

5. Click **Save** to add the widget to the dashboard.
6. Click on the **`...`** button in the top right corner of the table and select **Customize table**.
7. In the top right corner of the table, click on `Manage Properties` and add the following properties:
    - **Pull Requests**: The related pull requests (this will show as a relation).
    - **Link**: The URL to the workflow run.
    - **Repository**: The repository name (mirror property).
    - **Workflow**: The workflow name (via the workflow relation).
    - **Run Attempts**: The number of attempts for this workflow run.
8. Click on the **save icon** in the top right corner of the widget to save the customized table.

</details>

## Related guides

- [Visualize your GitHub repository activity](/guides/all/visualize-your-github-repository-activity)
- [Visualize and manage GitHub deployments](/guides/all/visualize-and-manage-github-deployments)
- [Visualize your GitHub Dependabot alerts](/guides/all/visualize-your-github-dependabot-alerts)
