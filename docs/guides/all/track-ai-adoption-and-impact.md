---
displayed_sidebar: null
description: Learn how to track AI adoption across engineering teams and assess the impact of AI usage on delivery metrics like PR throughput and cycle time using Port's GitHub integration.
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Track AI adoption and impact

Tracking AI adoption provides visibility into how engineering teams are leveraging AI coding agents and the impact these tools have on delivery outcomes. Without visibility into AI usage patterns, teams struggle to understand adoption rates, measure productivity gains, and identify which teams or services benefit most from AI assistance.


This guide helps engineering managers, platform engineers, and product leaders answer critical questions about AI adoption:

- **Adoption**: Which teams and services are using AI coding tools?
- **Impact**: How does AI assistance affect PR throughput and cycle time?
- **Effectiveness**: Are AI-assisted PRs delivering faster or higher quality outcomes?
- **Cost optimization**: Are AI tool licenses being fully utilized?

By the end of this guide, you will have dashboards that track AI adoption metrics, enabling you to understand usage patterns, measure productivity impact, and make informed decisions about AI tool investments across your organization.

<img src="/img/guides/ai-adoption-dashboard.png" border="1px" width="100%" />


## Common use cases

- Compare PR throughput and cycle time between AI-assisted and traditional workflows.
- Identify teams and services with the highest AI adoption rates.
- Track AI usage trends over time to understand adoption patterns.
- Monitor AI tool license utilization and revoke unused licenses to optimize costs.
- Correlate AI adoption with operational metrics like bug rates and incident resolution time.

## Prerequisites

This guide assumes the following:

- You have a Port account and have completed the [onboarding process](https://docs.port.io/getting-started/overview).
- Port's [GitHub integration](/build-your-software-catalog/sync-data-to-catalog/git/github/) is installed in your account.
- The `githubPullRequest` and `githubRepository` blueprints are already created (these are created when you install the GitHub integration).
- For **Cursor tracking**: Port's [Cursor integration](/build-your-software-catalog/sync-data-to-catalog/ai-agents/cursor/) is installed in your account.
- For **Copilot tracking**: Port's [GitHub Copilot integration](/build-your-software-catalog/sync-data-to-catalog/ai-agents/github-copilot/) is installed in your account.
- For **AI impact on operations**: Port's [Jira integration](/build-your-software-catalog/sync-data-to-catalog/project-management/jira/) is installed in your account (optional, for tracking bugs, security issues, and incidents).


## Set up data model

We will create and update blueprints to support AI adoption tracking.

 ### Update the User blueprint 
 Depending on which AI tool you want to track, you need to update the User blueprint with the appropriate properties.

<Tabs groupId="ai-tool" queryString defaultValue="cursor" values={[
  {label: "Cursor", value: "cursor"},
  {label: "GitHub Copilot", value: "copilot"}
]}>


<TabItem value="cursor" label="Cursor">

Ensure you have installed the [Cursor integration](/build-your-software-catalog/sync-data-to-catalog/ai-agents/cursor/) before proceeding.

Add properties to track Cursor license and usage status.

1. Go to the [Builder](https://app.getport.io/settings/data-model) page of your portal.
2. Find the `User` blueprint and click on it.
3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.
4. Add the following properties to the `properties` section:

    <details>
    <summary><b>Cursor license properties for User blueprint (click to expand)</b></summary>

    ```json showLineNumbers
    "cursor_licensed": {
      "title": "Cursor Licensed",
      "type": "boolean",
      "description": "Whether the user has a Cursor license"
    },
    "cursor_active": {
      "title": "Cursor Active",
      "type": "boolean",
      "description": "Whether the user has used Cursor in the last 90 days"
    },
    "cursor_last_active": {
      "title": "Cursor Last Active",
      "type": "string",
      "format": "date-time",
      "description": "Last time the user used Cursor"
    }
    ```

    </details>

5. Click `Save` to update the blueprint.

</TabItem>

<TabItem value="copilot" label="GitHub Copilot">

Ensure you have installed the [GitHub Copilot integration](/build-your-software-catalog/sync-data-to-catalog/ai-agents/github-copilot/) before proceeding.

Add properties to track Copilot license and usage status.

1. Go to the [Builder](https://app.getport.io/settings/data-model) page of your portal.
2. Find the `User` blueprint and click on it.
3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.
4. Add the following properties to the `properties` section:

    <details>
    <summary><b>Copilot license properties for User blueprint (click to expand)</b></summary>

    ```json showLineNumbers
    "copilot_licensed": {
      "title": "Copilot Licensed",
      "type": "boolean",
      "description": "Whether the user has a GitHub Copilot license"
    },
    "copilot_active": {
      "title": "Copilot Active",
      "type": "boolean",
      "description": "Whether the user has used Copilot in the last 90 days"
    },
    "copilot_last_active": {
      "title": "Copilot Last Active",
      "type": "string",
      "format": "date-time",
      "description": "Last time the user used Copilot"
    }
    ```

    </details>

5. Click `Save` to update the blueprint.

</TabItem>

</Tabs>

### Update the pull request blueprint

Regardless of which AI tool you're tracking, you need to add a property to identify AI-assisted PRs.

1. Go to the [Builder](https://app.getport.io/settings/data-model) page of your portal.
2. Find the `githubPullRequest` blueprint and click on it.
3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.
4. Add the following property to the `properties` section:

    <details>
    <summary><b>AI agent property for Pull Request blueprint (click to expand)</b></summary>

    ```json showLineNumbers
    "created_by_agent": {
      "type": "boolean",
      "title": "Created By AI Agent",
      "description": "Determines whether or not the PR was created by an AI agent such as Copilot, Claude, or Devin"
    }
    ```

    </details>

5. Click `Save` to update the blueprint.

### Update the Jira issue blueprint

To correlate AI adoption with operational metrics like bug resolution and incident response time, we need to add properties to track issue categories and lead time.

1. Go to the [Builder](https://app.getport.io/settings/data-model) page of your portal.
2. Find the `jiraIssue` blueprint and click on it.
3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.
4. Add the following properties to the `properties` section:

    <details>
    <summary><b>Issue category and lead time properties (click to expand)</b></summary>

    ```json showLineNumbers
    "issue_category": {
      "title": "Issue Category",
      "type": "string",
      "enum": ["Bug", "Security Issues", "Incidents", "Other"],
      "enumColors": {
        "Bug": "red",
        "Security Issues": "orange",
        "Incidents": "pink",
        "Other": "lightGray"
      },
      "description": "Category of the issue for tracking purposes"
    },
    "lead_time_hours": {
      "title": "Lead Time (Hours)",
      "type": "number",
      "description": "Time from issue creation to resolution in hours"
    }
    ```

    </details>

5. Click `Save` to update the blueprint.


## Update integration mapping

Now we'll configure the GitHub integration to detect AI-assisted PRs and Jira issues to populate the issue category and lead time properties.

<h3> Github Integration mapping </h3>

1. Go to your [Data Source](https://app.getport.io/settings/data-sources) page.
2. Select the GitHub integration.
3. Add or update the following YAML block in the editor:

    <details>
    <summary><b>GitHub integration configuration (click to expand)</b></summary>

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
                created_by_agent: .user.login | ascii_downcase | test("(copilot|claude|devin)")
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

<h3> Configure Jira integration mapping </h3>


1. Go to your [Data Source](https://app.getport.io/settings/data-sources) page.
2. Select the Jira integration.
3. Update the `jiraIssue` mapping to include the new properties:

    <details>
    <summary><b>Jira integration mapping for issue properties (click to expand)</b></summary>

    ```yaml showLineNumbers
    - kind: issue
      selector:
        query: 'true'
      port:
        entity:
          mappings:
            identifier: .key
            title: .fields.summary
            blueprint: '"jiraIssue"'
            properties:
              # ... existing properties ...
              issue_category: |
                if .fields.labels | any(. == "security") then "Security Issues"
                elif .fields.issuetype.name == "Bug" then "Bug"
                elif .fields.issuetype.name == "Incident" then "Incidents"
                else "Other" end
              lead_time_hours: |
                if .fields.resolutiondate != null then
                  ((.fields.resolutiondate | fromdateiso8601) - (.fields.created | fromdateiso8601)) / 3600 | round
                else
                  null
                end
    ```

    </details>

    :::tip Issue category logic
    The mapping categorizes issues based on labels and issue type. Issues with a "security" label are classified as Security Issues, Bug types as Bug, and Incident types as Incidents. You can customize this logic to match your organization's issue classification.
    :::

4. Click `Save & Resync` to apply the mapping.


## Visualize metrics

Once the data is synced, we can create a dedicated dashboard in Port to monitor and analyze AI adoption and impact metrics.

<img src="/img/guides/visualizeAIAdoptionMetrics.png" border="1px" width="100%" />

### Create a dashboard

1. Navigate to your [software catalog](https://app.getport.io/organization/catalog).
2. Click on the **`+ New`** button in the left sidebar.
3. Select **New dashboard**.
4. Name the dashboard **AI Adoption and Impact**.
5. Click `Create`.

We now have a blank dashboard where we can start adding widgets to visualize AI adoption metrics.

### Add widgets

In the new dashboard, create the following widgets. Some widgets are specific to your chosen AI tool, while others work with any tool.

<details>
<summary><b>AI Tool License Utilization table (click to expand)</b></summary>

This table shows all users with their AI tool license and usage status across both Cursor and Copilot, allowing you to identify unused licenses for cost optimization.

1. Click `+ Widget` and select **Table**.
2. Title: `AI Tool License Utilization`.
3. Description: `Track Cursor and Copilot usage. Revoke unused licenses to optimize costs.`
4. Choose the **User** blueprint.
5. Click **Save** to add the widget to the dashboard.
6. Click on the **`...`** button in the top right corner of the table and select **Customize table**.
7. In the top right corner of the table, click on `Manage Properties` and add the following columns:
    - **Title**: User's name.
    - **Cursor Licensed**: Whether user has a Cursor license.
    - **Cursor Active**: Whether user has used Cursor in last 90 days.
    - **Copilot Licensed**: Whether user has a Copilot license.
    - **Copilot Active**: Whether user has used Copilot in last 90 days.
8. Click on the **save icon** in the top right corner of the widget to save the customized table.

</details>




<details>
<summary><b>Average Lead Time (Monthly) line chart (click to expand)</b></summary>

1. Click `+ Widget` and select **Line Chart**.
2. Title: `Average Lead Time (Monthly)`.
3. Description: `Shows the average number of days from issue creation to resolution`.
4. Select `Aggregate Property (All Entities)` **Chart type** and choose **Pull Request** as the **Blueprint**.
5. Select `leadTimeHours` as the **Property**.
6. Select `average` for the **Function**.
7. Input `Lead Time (Days)` as the **Y axis** **Title**.
8. Input `Date` as the **X axis** **Title**.
9. Select `createdAt` for **Measure time by**.
10. Set **Time Interval** to `month` and **Time Range** to `In the past 6 months`.
11. Add this JSON to the **Additional filters** editor:

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

12. Click `Save`.

</details>

<details>
<summary><b>PR Throughput (Monthly) line chart (click to expand)</b></summary>

1. Click `+ Widget` and select **Line Chart**.
2. Title: `PR Throughput (Monthly)`.
3. Description: `Monthly PRs merged`.
4. Select `Count Entities (All Entities)` **Chart type** and choose **Pull Request** as the **Blueprint**.
5. Select `count` for the **Function**.
6. Input `Pull Requests` as the **Y axis** **Title**.
7. Input `Date` as the **X axis** **Title**.
8. Select `createdAt` for **Measure time by**.
9. Set **Time Interval** to `month` and **Time Range** to `In the past 6 months`.
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
<summary><b>PR Cycle Time (Monthly) line chart (click to expand)</b></summary>

1. Click `+ Widget` and select **Line Chart**.
2. Title: `PR Cycle Time (Monthly)`.
3. Description: `Monthly average PR time to merge (hours)`.
4. Select `Aggregate Property (All Entities)` **Chart type** and choose **Pull Request** as the **Blueprint**.
5. Select `cycle_time` as the **Property**.
6. Select `average` for the **Function**.
7. Input `Lead time (Hours)` as the **Y axis** **Title**.
8. Input `Date` as the **X axis** **Title**.
9. Select `createdAt` for **Measure time by**.
10. Set **Time Interval** to `month` and **Time Range** to `In the past 6 months`.
11. Add this JSON to the **Additional filters** editor:

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

12. Click `Save`.

</details>

<details>
<summary><b>PRs created with AI pie chart (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Pie chart**.
2. Title: `PRs Created with AI`.
3. Choose the **Pull Request** blueprint.
4. Under `Breakdown by property`, select the **Created By AI Agent** property.
5. Click **Save**.

</details>

<details>
<summary><b>Teams with the most AI-created PRs bar chart (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Bar Chart**.
2. Title: `Teams with the most AI-created PRs`.
3. Choose the **Pull Request** blueprint.
4. Under `Breakdown by property`, select the **Owning Team** property (via repository relation).
5. Add this JSON to the **Additional filters** editor:

    ```json showLineNumbers
    {
      "combinator": "and",
      "rules": [
        {
          "value": true,
          "property": "created_by_agent",
          "operator": "="
        }
      ]
    }
    ```

6. Click **Save**.

</details>

<details>
<summary><b>AI Adoption Impact On Operations line chart (click to expand)</b></summary>

This chart shows the monthly trend of bugs, security issues, and incidents to help correlate AI adoption with operational quality.

1. Click `+ Widget` and select **Line Chart**.
2. Title: `AI Adoption Impact On Operations`.
3. Description: `Issues created each month`.
4. Select `Count Entities (All Entities)` **Chart type** and choose **Jira Issue** as the **Blueprint**.
5. Under `Breakdown by property`, select the **Issue Category** property.
6. Input `Issues` as the **Y axis** **Title**.
7. Input `Date` as the **X axis** **Title**.
8. Select `createdAt` for **Measure time by**.
9. Set **Time Interval** to `month` and **Time Range** to `In the past 6 months`.
10. Add this JSON to the **Additional filters** editor to only show relevant categories:

    ```json showLineNumbers
    {
      "combinator": "and",
      "rules": [
        {
          "property": "issue_category",
          "operator": "in",
          "value": ["Bug", "Security Issues", "Incidents"]
        }
      ]
    }
    ```

11. Click `Save`.

</details>


## Set up self-service actions (optional)

You can set up self-service actions to activate or revoke AI tool licenses. These actions allows you to easily activate or revoke licenses for users in your organization directly from your Port dashboard.


<Tabs groupId="ai-tool" queryString defaultValue="cursor" values={[
  {label: "Cursor", value: "cursor"},
  {label: "GitHub Copilot", value: "copilot"}
]}>

<TabItem value="cursor" label="Cursor">

<details>
<summary><b>Activate Cursor License action (click to expand)</b></summary>

This action calls the Cursor API to add a user to your team, which provisions their license.

1. Go to the [Self-service](https://app.getport.io/self-serve) page of your portal.
2. Click on `+ Action`.
3. Select the **User** blueprint.
4. Copy and paste the following JSON schema:

    ```json showLineNumbers
    {
      "identifier": "activate_cursor_license",
      "title": "Activate Cursor License",
      "icon": "Cursor",
      "description": "Activate a Cursor license for this user",
      "trigger": {
        "type": "self-service",
        "operation": "DAY-2",
        "userInputs": {
          "properties": {
            "confirm": {
              "type": "boolean",
              "title": "Confirm Activation",
              "description": "Check this box to confirm you want to activate a Cursor license"
            }
          },
          "required": ["confirm"]
        }
      },
      "invocationMethod": {
        "type": "WEBHOOK",
        "url": "https://api.cursor.com/teams/members",
        "agent": false,
        "synchronized": true,
        "method": "POST",
        "headers": {
          "Authorization": "Bearer {{ .secrets.CURSOR_API_KEY }}",
          "Content-Type": "application/json"
        },
        "body": {
          "email": "{{ .entity.properties.email }}"
        }
      }
    }
    ```

5. Click `Create` to save the action.
6. Add your Cursor API key as a secret named `CURSOR_API_KEY` in your [Port secrets](https://app.getport.io/settings/portal/secrets).

</details>

<details>
<summary><b>Revoke Cursor License action (click to expand)</b></summary>

This action calls the Cursor API to remove a user from your team, which revokes their license.

1. Go to the [Self-service](https://app.getport.io/self-serve) page of your portal.
2. Click on `+ Action`.
3. Select the **User** blueprint.
4. Copy and paste the following JSON schema:

    ```json showLineNumbers
    {
      "identifier": "revoke_cursor_license",
      "title": "Revoke Cursor License",
      "icon": "Cursor",
      "description": "Revoke the Cursor license for this user",
      "trigger": {
        "type": "self-service",
        "operation": "DAY-2",
        "userInputs": {
          "properties": {
            "confirm": {
              "type": "boolean",
              "title": "Confirm Revocation",
              "description": "Check this box to confirm you want to revoke the Cursor license"
            }
          },
          "required": ["confirm"]
        }
      },
      "invocationMethod": {
        "type": "WEBHOOK",
        "url": "https://api.cursor.com/teams/members/{{ .entity.properties.email }}",
        "agent": false,
        "synchronized": true,
        "method": "DELETE",
        "headers": {
          "Authorization": "Bearer {{ .secrets.CURSOR_API_KEY }}",
          "Content-Type": "application/json"
        }
      }
    }
    ```

5. Click `Create` to save the action.
6. Add your Cursor API key as a secret named `CURSOR_API_KEY` in your [Port secrets](https://app.getport.io/settings/portal/secrets).

:::info Cursor API
The Cursor API endpoint `DELETE /teams/members/{email}` removes a user from your Cursor team. Refer to the [Cursor API documentation](https://docs.cursor.com/account/teams/api) for more details.
:::

</details>

</TabItem>

<TabItem value="copilot" label="GitHub Copilot">

<details>
<summary><b>Activate Copilot License action (click to expand)</b></summary>

This action calls the GitHub API to add a user to the Copilot subscription.

1. Go to the [Self-service](https://app.getport.io/self-serve) page of your portal.
2. Click on `+ Action`.
3. Select the **User** blueprint.
4. Copy and paste the following JSON schema:

    ```json showLineNumbers
    {
      "identifier": "activate_copilot_license",
      "title": "Activate Copilot License",
      "icon": "Github",
      "description": "Activate a GitHub Copilot license for this user",
      "trigger": {
        "type": "self-service",
        "operation": "DAY-2",
        "userInputs": {
          "properties": {
            "confirm": {
              "type": "boolean",
              "title": "Confirm Activation",
              "description": "Check this box to confirm you want to activate a Copilot license"
            }
          },
          "required": ["confirm"]
        }
      },
      "invocationMethod": {
        "type": "WEBHOOK",
        "url": "https://api.github.com/orgs/YOUR_ORG/copilot/billing/selected_users",
        "agent": false,
        "synchronized": true,
        "method": "POST",
        "headers": {
          "Authorization": "Bearer {{ .secrets.GITHUB_COPILOT_ADMIN_TOKEN }}",
          "Accept": "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28"
        },
        "body": {
          "selected_usernames": ["{{ .entity.properties.github_username }}"]
        }
      }
    }
    ```

5. Replace `YOUR_ORG` with your GitHub organization name.
6. Click `Create` to save the action.
7. Add your GitHub token as a secret named `GITHUB_COPILOT_ADMIN_TOKEN` in your [Port secrets](https://app.getport.io/settings/portal/secrets). The token requires the `manage_billing:copilot` scope.

</details>

<details>
<summary><b>Revoke Copilot License action (click to expand)</b></summary>

This action calls the GitHub API to remove a user's Copilot license assignment.

1. Go to the [Self-service](https://app.getport.io/self-serve) page of your portal.
2. Click on `+ Action`.
3. Select the **User** blueprint.
4. Copy and paste the following JSON schema:

    ```json showLineNumbers
    {
      "identifier": "revoke_copilot_license",
      "title": "Revoke Copilot License",
      "icon": "Github",
      "description": "Revoke the GitHub Copilot license for this user",
      "trigger": {
        "type": "self-service",
        "operation": "DAY-2",
        "userInputs": {
          "properties": {
            "confirm": {
              "type": "boolean",
              "title": "Confirm Revocation",
              "description": "Check this box to confirm you want to revoke the Copilot license"
            }
          },
          "required": ["confirm"]
        }
      },
      "invocationMethod": {
        "type": "WEBHOOK",
        "url": "https://api.github.com/orgs/YOUR_ORG/copilot/billing/selected_users",
        "agent": false,
        "synchronized": true,
        "method": "DELETE",
        "headers": {
          "Authorization": "Bearer {{ .secrets.GITHUB_COPILOT_ADMIN_TOKEN }}",
          "Accept": "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28"
        },
        "body": {
          "selected_usernames": ["{{ .entity.properties.github_username }}"]
        }
      }
    }
    ```

5. Replace `YOUR_ORG` with your GitHub organization name.
6. Click `Create` to save the action.
7. Add your GitHub token as a secret named `GITHUB_COPILOT_ADMIN_TOKEN` in your [Port secrets](https://app.getport.io/settings/portal/secrets). The token requires the `manage_billing:copilot` scope.

:::info GitHub Copilot API
The GitHub API endpoint `DELETE /orgs/{org}/copilot/billing/selected_users` removes Copilot access for specified users. Refer to the [GitHub Copilot API documentation](https://docs.github.com/en/rest/copilot/copilot-user-management#remove-users-from-the-copilot-subscription-for-an-organization) for more details.
:::

</details>

</TabItem>

</Tabs>

<img src="/img/guides/activateOrRevokeLicence.png" border="1px" width="100%" />


## Related guides

- [Visualize Cursor metrics](/guides/all/visualize-cursor-metrics)
- [Visualize GitHub Copilot metrics](/guides/all/visualize-github-copilot-metrics)
- [Track AI-driven pull requests](/guides/all/track-ai-driven-pull-requests)
- [Measure and track delivery performance](/guides/all/measure-and-track-delivery-performance)
- [Measure reliability and stability of delivery pipeline](/guides/all/measure-reliability-and-stability)
