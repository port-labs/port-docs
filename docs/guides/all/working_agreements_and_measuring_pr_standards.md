---
sidebar_position: 1
displayed_sidebar: null
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortTooltip from "/src/components/tooltip/tooltip.jsx";

# Implement working agreements and measure pull request standards 

## Overview

Creating high-performing engineering teams requires not just technical expertise but also effective collaboration and clear expectations.
**working agreements** help teams establish shared understandings of processes and standards, enhancing collaboration, promoting accountability, 
facilitating onboarding, and improving efficiency.**pull requests (PRs)** are a critical part of the workflow. Measuring PR standards is essential for assessing code quality,
review processes, and team efficiency. By integrating **working agreements** and **measurable PR metrics**, 
teams can monitor adherence to best practices and continuously improve their workflows.
We will discuss how to implement working agreements and measure PR standards using Port.

:::info Metrics
Metrics are essential for assessing how well teams adhere to their working agreements. 
They enable teams to track compliance, identify bottlenecks, and drive continuous improvement. 
For detailed insights into key metrics like `deployment frequency`, `lead time for changes`, and `change failure rate`,
please refer to our [DORA Metrics guide](/guides/all/setup-dora-metrics).
:::

## Prerequisites
- Complete the [Port onboarding process](https://docs.getport.io/quickstart).
- Access to a GitHub repository that is connected to Port via the onboarding process.



## Working agreements

The following working agreements and pr checks have been implemented in our [demo environment](https://demo.getport.io/settings/data-model) on the `pull request` blueprint:

- [**PR Description Cannot be Empty**](#pr-description-cannot-be-empty): Ensures that every PR has a description.
- [**PR Has Linked Issue**](#pr-has-linked-issue): Verifies that each PR is linked to an issue.
- [**PR Has No Unchecked Checkboxes**](#pr-has-no-unchecked-checkboxes): Checks that there are no unchecked items in the PR description.
- [**PR Requires Reviewers**](#pr-requires-reviewers): Confirms that at least one reviewer is assigned to the PR.
- [**PR Is Linked to a Milestone**](#pr-is-linked-to-a-milestone): Ensures the PR is associated with a milestone.
- [**PR Changed X Files or Less**](#pr-changed-x-files-or-less): Validates that the number of changed files is within acceptable limits.
- [**PR Has Been Open for X Days**](#pr-has-been-open-for-x-days): Monitors how long a PR has been open.
- [**PR Batch Size Calculation**](#pr-batch-size-calculation): Calculates the batch size of the PR.

These checks are implemented using Port's [scorecards](/#scorecards) on the `pull request` blueprint.


## Implementation 
Here are the implementation details for each working agreement and PR check:

### PR Description Cannot be Empty

<h4> Scorecard Definition </h4>

<details>
  <summary>Click to view the scorecard definition</summary>

```json
{
  "identifier": "pr_descr_not_empty",
  "title": "PR Description Cannot be Empty",
  "description": "Ensures that the PR description is not empty.",
  "level": "Bronze",
  "query": {
    "combinator": "and",
    "conditions": [
      {
        "operator": "isNotEmpty",
        "property": "prDescription"
      }
    ]
  }
}
```

</details>

<h4> Property </h4>
Add the `prDescription` property to the **pull request** blueprint:

<details>
  <summary>Click to view the property</summary>


```json showLineNumbers
"prDescription": {
  "title": "PR Description",
  "type": "string"
}
```
</details>

<h4> Mapping Configuration </h4>
Map the PR's `body` field from your data source to the `prDescription` property:

<details>
  <summary>Click to view the mapping configuration</summary>

```yaml showLineNumbers
  - kind: pull-request
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: .head.repo.name + (.id|tostring)
          title: .title
          blueprint: '"githubPullRequest"'
          properties:
            #other properties
            prDescription: .body
```

</details>



### PR Has Linked Issue

<h4> Scorecard Definition </h4>

<details>
  <summary>Click to view the scorecard definition</summary>

```json
{
  "identifier": "pr_has_issue_link",
  "title": "PR Has Linked Issue",
  "description": "Ensures that the PR is linked to an issue.",
  "level": "Silver",
  "query": {
    "combinator": "and",
    "conditions": [
      {
        "operator": "isNotEmpty",
        "property": "issueUrl"
      }
    ]
  }
}
```

</details>

<h4> Property </h4>
Add the `issueUrl` property to the **pull request** blueprint:

<details>
  <summary>Click to view the property </summary>

```json showLineNumbers
"issueUrl": {
  "title": "Issue URL",
  "type": "string",
  "format": "url"
}
```

</details>

<h4> Mapping Configuration </h4>
Map the issue URL from your data source to the `issueurl` property:

<details>
  <summary>Click to view the mapping configuration</summary>

```yaml showLineNumbers
  - kind: pull-request
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: .head.repo.name + (.id|tostring)
          title: .title
          blueprint: '"githubPullRequest"'
          properties:
            #other properties
            issueUrl: .issue_url
```

</details>



### PR Has No Unchecked Checkboxes

<h4> Scorecard Definition </h4>

<details>
  <summary>Click to view the scorecard definition</summary>

```json
{
  "identifier": "pr_no_unchecked_chk",
  "title": "PR Has No Unchecked Checkboxes",
  "description": "Ensures that there are no unchecked checkboxes in the PR description.",
  "level": "Silver",
  "query": {
    "combinator": "and",
    "conditions": [
      {
        "operator": "doesNotContains",
        "property": "prDescription",
        "value": "- [ ]"
      }
    ]
  }
}
```

</details>

:::tip Property addition
If you haven't added the `prDescription` property, and it's relative mapping config
 please refer to the [PR Description Cannot be Empty](#pr-description-cannot-be-empty) section.
:::




### PR Requires Reviewers

<h4> Scorecard Definition </h4>

<details>
  <summary>Click to view the scorecard definition</summary>

```json
{
  "identifier": "pr_has_reviewers_req",
  "title": "PR Requires Reviewers",
  "description": "Ensures that the PR has at least one reviewer requested.",
  "level": "Bronze",
  "query": {
    "combinator": "and",
    "conditions": [
      {
        "operator": "isNotEmpty",
        "property": "reviewers"
      }
    ]
  }
}
```

</details>

<h4> Property </h4>

Add the `reviewers` property to the **pull request** blueprint if it doesn't exist:

<details>
  <summary>Click to view the property addition</summary>

```json showLineNumbers
 "reviewers": {
"title": "Reviewers",
"type": "array"
}
```

</details>

<h4> Mapping Configuration </h4>
Map the list of reviewers from your data source to the `reviewers` property:

<details>
  <summary>Click to view the mapping configuration</summary>

```yaml showLineNumbers
  - kind: pull-request
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: .head.repo.name + (.id|tostring)
          title: .title
          blueprint: '"githubPullRequest"'
          properties:
            #other properties
            reviewers: '[.requested_reviewers[].login]'
```

</details>



### PR Is Linked to a Milestone

<h4> Scorecard Definition </h4>

<details>
  <summary>Click to view the scorecard definition</summary>

```json
{
  "identifier": "pr_linked_milestone",
  "title": "PR Is Linked to a Milestone",
  "description": "Ensures that the PR is linked to a milestone.",
  "level": "Gold",
  "query": {
    "combinator": "and",
    "conditions": [
      {
        "operator": "isNotEmpty",
        "property": "milestone"
      }
    ]
  }
}
```

</details>

<h4> Property </h4>

<details>
  <summary>Click to view the property addition</summary>

Add the `milestone` property to the **pull request** blueprint:

```json showLineNumbers
"milestone": {
"title": "Milestone",
"type": "object"
}

```

</details>

<h4> Mapping Configuration </h4>

<details>
  <summary>Click to view the mapping configuration</summary>

Map the milestone information from your data source to the `milestone` property.

```yaml showLineNumbers
  - kind: pull-request
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: .head.repo.name + (.id|tostring)
          title: .title
          blueprint: '"githubPullRequest"'
          properties:
            #other properties
            milestone: .milestone
```

</details>




### PR Changed X Files or Less

<h4> Scorecard Definition </h4>

This agreement has multiple levels based on the number of files changed.
<details>
  <summary>Click to view the scorecard definitions</summary>
    <details>
     <summary>Click to view the Bronze level scorecard definition</summary>

```json
{
  "identifier": "pr_file_limit_bronze",
  "title": "PR Can't Have More than 15 Changed Files",
  "description": "Ensures that the PR does not have more than 15 changed files.",
  "level": "Bronze",
  "query": {
    "combinator": "and",
    "conditions": [
      {
        "operator": "<=",
        "property": "changedFiles",
        "value": 15
      }
    ]
  }
}
```

</details>
    <details>
  <summary>Click to view the Silver level scorecard definition</summary>

```json
{
  "identifier": "pr_file_limit_silver",
  "title": "PR Can't Have More than 10 Changed Files",
  "description": "Ensures that the PR does not have more than 10 changed files.",
  "level": "Silver",
  "query": {
    "combinator": "and",
    "conditions": [
      {
        "operator": "<=",
        "property": "changedFiles",
        "value": 10
      }
    ]
  }
}
```

</details>
    <details>
  <summary>Click to view the Gold level scorecard definition</summary>

```json
{
  "identifier": "pr_file_limit_gold",
  "title": "PR Can't Have More than 5 Changed Files",
  "description": "Ensures that the PR does not have more than 5 changed files.",
  "level": "Gold",
  "query": {
    "combinator": "and",
    "conditions": [
      {
        "operator": "<=",
        "property": "changedFiles",
        "value": 5
      }
    ]
  }
}
```

</details>

:::info value adjustment
You can adjust the value based on your team's requirements.
:::

</details>

<h4> Property </h4>
Add the `changedFiles` property to the **pull request** blueprint:

<details>
  <summary>Click to view the property</summary>

```json showLineNumbers
    "changedFiles": {
      "title": "Changed Files",
      "type": "number"
    }
```

</details>

<h4> Mapping Configuration </h4>
Map the number of `changed_files` from the data source to the `changedFiles` property:

<details>
  <summary>Click to view the mapping configuration</summary>

```yaml showLineNumbers
  - kind: pull-request
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: .head.repo.name + (.id|tostring)
          title: .title
          blueprint: '"githubPullRequest"'
          properties:
            #other properties
            changedFiles: .changed_files
```

</details>


### PR Has Been Open for X Days


<h4> Scorecard Definition </h4>

<details>
  <summary>Click to view the scorecard definition</summary>

```json
{
  "identifier": "pr_open_for_less_than_10_days",
  "title": "PR Has Been Open for Less Than 10 Days",
  "description": "Ensures that the PR has not been open for more than 10 days.",
  "level": "Silver",
  "query": {
    "combinator": "and",
    "conditions": [
      {
        "operator": "<=",
        "property": "days_old",
        "value": 10
      },
      {
        "operator": "=",
        "property": "status",
        "value": "open"
      }
    ]
  }
}
```

</details>

<h4> Property </h4>
Add a calculation property `days_old` to compute how many days the PR has been open:

<details>
  <summary>Click to view the calculation property addition</summary>

```json showLineNumbers
"days_old": {
  "title": "Days Old",
  "icon": "DefaultProperty",
  "calculation": "(now / 86400) - (.properties.updatedAt | capture(\"(?<date>\\\\d{4}-\\\\d{2}-\\\\d{2})\") | .date | strptime(\"%Y-%m-%d\") | mktime / 86400) | floor",
  "type": "number"
}
```

</details>

:::note Required properties
Ensure that `createdAt` and `mergedAt` properties are correctly mapped from your data source.
:::



### PR Batch Size Calculation

<h4> Scorecard Definition </h4>

This agreement has levels based on the batch size.

<details>
<summary>Click to view the scorecard definition</summary>
<details>
  <summary>Click to view the Bronze level scorecard definition</summary>

```json
{
  "identifier": "pr_batch_size_bronze",
  "title": "PR Cannot Have Large or Gigantic Batch Size",
  "description": "Ensures that the PR does not have a Large or Gigantic batch size.",
  "level": "Bronze",
  "query": {
    "combinator": "or",
    "conditions": [
      {
        "operator": "!=",
        "property": "batchSize",
        "value": "Large"
      },
      {
        "operator": "!=",
        "property": "batchSize",
        "value": "Gigantic"
      }
    ]
  }
}
```

</details>

<details>
  <summary>Click to view the Silver level scorecard definition</summary>

```json
{
  "identifier": "pr_batch_size_silver",
  "title": "PR Has Medium Batch Size",
  "description": "Ensures that the PR has a Medium batch size.",
  "level": "Silver",
  "query": {
    "combinator": "and",
    "conditions": [
      {
        "operator": "=",
        "property": "batchSize",
        "value": "Medium"
      }
    ]
  }
}
```

</details>

<details>
  <summary>Click to view the Gold level scorecard definition</summary>

```json
{
  "identifier": "pr_batch_size_gold",
  "title": "PR Has Small Batch Size",
  "description": "Ensures that the PR has a Small batch size.",
  "level": "Gold",
  "query": {
    "combinator": "and",
    "conditions": [
      {
        "operator": "=",
        "property": "batchSize",
        "value": "Small"
      }
    ]
  }
}
```

</details>

</details>




<h4> Property </h4>
Add a property `batchSize` to categorize the PR's batch size:

<details>
  <summary>Click to view the calculation property addition</summary>

```json showLineNumbers
"batchSize": {
  "title": "Batch Size",
  "type": "string",
  "enum": [
    "Small",
    "Medium",
    "Large",
    "Gigantic"
  ],
  "enumColors": {
    "Small": "lightGray",
    "Medium": "orange",
    "Large": "yellow",
    "Gigantic": "red"
  }
}
```
</details>


<h4> Mapping Configuration </h4>
Map the PR's `additions`, `deletions`, and `changedFiles` properties to the `batchSize` property:

<details>
  <summary>Click to view the mapping configuration</summary>

```yaml showLineNumbers
    - kind: pull-request
      selector:
        query: 'true'
        port:
        entity:
            mappings:
            identifier: .head.repo.name + (.id|tostring)
            title: .title
            blueprint: '"githubPullRequest"'
            properties:
                #other properties
            batchSize: >
             if (.commits <= 3 and (.additions + .deletions) <= 50 and
             .changed_files <= 3) then "Small" elif (.commits <= 10 and
             (.additions + .deletions) <= 200 and .changed_files <= 7) then
             "Medium" elif (.commits <= 20 and (.additions + .deletions) <= 500
             and .changed_files <= 15) then "Large" else "Gigantic" end
```
</details>

:::note Batch size calculation
You can adjust the thresholds based on your team's requirements.
:::




## Pull request metrics aggregation

To measure PR standards effectively, add aggregation properties on the **service** and **organization** blueprints.
This will allow us to capture important metrics such as:

- PR Average Duration (Service Level)
- PRs Opened (Service & Organization Level)
- PRs Merged (Service & Organization Level)
- Average Commits per PR (Service & Organization Level)
- Average Lines of Code (LOC) Changed (Service & Organization Level)

::::info Aggregation on organization level
To aggregate on an organization level, apply the same settings to a higher hierarchy.
::::

<Tabs
  defaultValue="averagePrDuration"
  values={[
    {label: 'Average PR Duration', value: 'averagePrDuration'},
    {label: 'PRs Opened', value: 'prsOpened'},
    {label: 'PRs Merged', value: 'prsMerged'},
    {label: 'Average Commits per PR', value: 'averageCommitsPerPr'},
    {label: 'Average LOC Changed', value: 'averageLocChanged'},
  ]}>

<TabItem value="averagePrDuration">

Add the following aggregation property to the **service** blueprint:

<details>
  <summary>Click to view the aggregation property</summary>

```json
"averagePrDuration": {
  "title": "Average PR Duration",
  "type": "number",
  "target": "githubPullRequest",
  "calculationSpec": {
    "func": "average",
    "averageOf": "week",
    "calculationBy": "property",
    "property": "days_old"
  },
  "query": {
    "combinator": "and",
    "rules": [
      {
        "property": "mergedAt",
        "operator": "isNotEmpty"
      }
    ]
  }
}
```

</details>

</TabItem>

<TabItem value="prsOpened">

Add the following aggregation property to the **service** and **organization** blueprint:

<details>
  <summary>Click to view the aggregation property</summary>

```json
"openPrs": {
  "title": "Open PRs",
  "type": "number",
  "target": "githubPullRequest",
  "calculationSpec": {
    "func": "count",
    "calculationBy": "entities"
  },
  "query": {
    "combinator": "and",
    "rules": [
      {
        "property": "status",
        "operator": "=",
        "value": "open"
      }
    ]
  }
}
```

</details>

</TabItem>

<TabItem value="prsMerged">

Add the following aggregation property to the **service** blueprint:

<details>
  <summary>Click to view the aggregation property</summary>

```json
"mergedPrs": {
  "title": "Merged PRs",
  "type": "number",
  "target": "githubPullRequest",
  "calculationSpec": {
    "func": "count",
    "calculationBy": "entities"
  },
  "query": {
    "combinator": "and",
    "rules": [
      {
        "property": "status",
        "operator": "=",
        "value": "merged"
      }
    ]
  }
}
```

</details>

</TabItem>

<TabItem value="averageCommitsPerPr">

Add the following aggregation property to the **service** blueprint:

<details>
  <summary>Click to view the aggregation property</summary>

```json
"averageCommitsPerPr": {
  "title": "Average Commits per PR",
  "type": "number",
  "target": "githubPullRequest",
  "calculationSpec": {
    "averageOf": "week",
    "func": "average",
    "calculationBy": "property",
    "property": "commits",
    "measureTimeBy": "$createdAt"
  }
}
```

</details>

</TabItem>

<TabItem value="averageLocChanged">



First, ensure you have a calculation property `totalLocChanged` on the **pull request** blueprint:

<details>
  <summary>Click to view the calculation property</summary>

```json
"totalLocChanged": {
  "title": "Total LOC Changed",
  "type": "number",
  "calculation": ".properties.additions + .properties.deletions"
}
```

</details>

Add the following aggregation property to the **service** and **organization** blueprints:

<details>
  <summary>Click to view the aggregation property</summary>

```json
"averagePrLinesOfCode": {
  "title": "Average PR Lines of Code",
  "type": "number",
  "target": "githubPullRequest",
  "calculationSpec": {
    "func": "average",
    "averageOf": "week",
    "calculationBy": "property",
    "property": "totalLocChanged"
  }
}
```

</details>

</TabItem>

</Tabs>

By implementing these aggregation properties, you can effectively measure and monitor PR standards at both the service and organization levels.


## Aggregation on team level

To measure PR standards at the team level, add the following aggregation properties to the **team** [blueprint](/build-your-software-catalog/sync-data-to-catalog/git/github/examples/resource-mapping-examples#map-repositories-and-teams):

<details>
    <summary>Click to view the aggregation properties</summary>

```json showLineNumbers
 {
  "total_average_commits_per_pr": {
    "title": "Total Average Commits Per PR",
    "type": "number",
    "target": "service",
    "calculationSpec": {
      "func": "average",
      "averageOf": "total",
      "property": "averageCommitsPerPr",
      "calculationBy": "property",
      "measureTimeBy": "$createdAt"
    }
  },
  "monthly_average_pr_loc": {
    "title": "Monthly Average PR LOC",
    "type": "number",
    "target": "service",
    "calculationSpec": {
      "func": "average",
      "averageOf": "month",
      "property": "averagePrLinesOfCode",
      "measureTimeBy": "$createdAt",
      "calculationBy": "property"
    }
  },
  "median_merged_prs": {
    "title": "Median merged prs",
    "type": "number",
    "target": "service",
    "calculationSpec": {
      "func": "median",
      "property": "mergedPrs",
      "calculationBy": "property"
    }
  }
}
```
</details>

## Visualization
By leveraging Port's Dashboards, you can create custom dashboards to track the pr metrics and monitor your team's performance over time.

### Dashboard setup

<img src="/img/guides/prMetricsDashboardComp.png" />

1. Go to your [software catalog](https://app.getport.io/organization/catalog).
2. Click on the `+ New` button in the left sidebar.
3. Select **New dashboard**.
4. Name the dashboard (PR Metrics), choose an icon if desired, and click `Create`.

This will create a new empty dashboard. Let's get ready-to-add widgets

### Adding widgets

<details>
<summary><b> Average Pr Merged per month </b></summary>

1. Click `+ Widget` and select **Number Chart**.
2. Title: `Average Pr's Merged per month`, (add the `GitPullRequest` icon).
3. Select `Aggregate by property` and choose **Service** as the **Blueprint**.
4. Choose `Merged PRs` as the **Property**.
5. Select `average` for the **Function** and choose `month` for **Average of**.
6. Select `Created At` for **Measure time by**.
7. Select `custom` as the **Unit** and input `Pull Request merged per month` as the **Custom unit**.

   <img src="/img/guides/averagePRMergedPerMonth.png" width="50%"/>

8. Click `Save`.

</details>



<details>
<summary><b> Total Pr's Merged  </b></summary>

1. Click `+ Widget` and select **Number Chart**.
2. Title: `Total Pr's Merged `, (add the `GitPullRequest` icon).
3. Select `Aggregate by property` and choose **Service** as the **Blueprint**.
4. Choose `Merged PRs` as the **Property**.
5. Select `sum` for the **Function**.

   <img src="/img/guides/totalPrsMerged.png" width="50%"/>

6. Click `Save`.

</details>


<details>
<summary><b> Total Weekly  Pr commits </b></summary>

1. Click `+ Widget` and select **Number Chart**.
2. Title: `Total Weekly  Pr commits`, (add the `GitPullRequest` icon).
3. Select `Aggregate by property` and choose **Service** as the **Blueprint**.
4. Choose `Averge Commits per PRs` as the **Property**.
5. Select `average` for the **Function** and choose `week` for **Average of**.
6. Select `Created At` for **Measure time by**.
7. Select `custom` as the **Unit** and input `Weekly` as the **Custom unit**.

   <img src="/img/guides/totalWeeklyPrCommits.png" width="50%"/>

8. Click `Save`.

</details>



##  Notification automation
Add this automation feature to notify a Slack channel when a scorecard value changes

<details>
<summary>Automation for sending Slack notifications on scorecard value change (click to expand)</summary>

```json showLineNumbers
{
  "identifier": "scorecardValueChanged",
  "title": "Notify Slack on Scorecard Value Change",
  "icon": "Slack",
  "description": "Sends a Slack message when the scorecard value changes.",
  "trigger": {
    "type": "automation",
    "event": {
      "type": "ENTITY_UPDATED",
      "blueprintIdentifier": "githubPullRequest"
    },
    "condition": {
      "type": "JQ",
      "expressions": [
        ".diff.after.scorecardsStats != .diff.before.scorecardsStats"
      ],
      "combinator": "and"
    }
  },
  "invocationMethod": {
    "type": "WEBHOOK",
    "url": "{{ .event.diff.after.properties.serviceSlackUrl }}",
    "agent": false,
    "synchronized": true,
    "body": {
      "channel": "{{ .event.diff.after.properties.serviceSlackChannel }}",
      "text": "*Scorecard value changed for PR <{{ .event.diff.after.properties.link }}|{{ .event.diff.after.title }}>*\n\n*Title:* {{ .event.diff.after.title }}\n\n*Old Scorecard Value:* {{ .event.diff.before.scorecardsStats }}\n\n*New Scorecard Value:* {{ .event.diff.after.scorecardsStats }}\n\n*Link:* <{{ .event.diff.after.properties.link }}|View PR>\n\n"
    }
  },
  "publish": true
}
```
</details>
::::tip Adding Automations
To add new automations, follow the steps outlined in the [Automation Setup](/actions-and-automations/define-automations/setup-action) section of this guide.
and remember to set the `serviceSlackUrl` and `serviceSlackChannel` properties on the **service** blueprint.
::::