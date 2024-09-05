---
sidebar_position: 10
displayed_sidebar: null
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortTooltip from "/src/components/tooltip/tooltip.jsx";

# DORA metrics

This guide is designed
to help you
understand and implement [DevOps Research and Assessment (DORA) metrics](https://cloud.google.com/devops/research/dora) within your organization in Port.
DORA Metrics are a set of key performance indicators
that measure the effectiveness and efficiency of your software development and delivery process. 
By tracking these metrics,
you can identify areas for improvement and ensure that your team is delivering high-quality software efficiently.
This guide will cover the four key metrics: Deployment Frequency, Lead Time, Change Failure Rate, and Mean Time to Recovery.

## Tracking Deployment
In this section, we will cover how to track your team's deployment frequency. Deployment releases new or updated code into an environment (e.g., Production, Staging, or Testing). 
Tracking deployments helps understand how efficiently your team ships features and monitors release stability. Deployments are used to calculate two key DORA metrics:

- **Deployment Frequency**: How often changes are deployed to production or other environments.
- **Change Failure Rate**: The percentage of deployments that fail and require intervention, rollback, or generate issues.

To track the necessary data for these metrics, we will create a **Deployment Blueprint** with properties that capture the essential information for each deployment.

### Data model setup

1. Navigate to your [Port Builder](https://app.getport.io/settings/data-model) page.
2. Click the `+ Blueprint` button to create a new blueprint.
3. Name it `Deployment` and add the schema below:

<details>
<summary><b>Deployment blueprint (click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "deployment",
  "title": "Deployment",
  "schema": {
    "properties": {
      "environment": {
        "title": "Environment",
        "type": "string",
        "enum": [
          "Production", 
          "Staging", 
          "Testing"
        ],
        "description": "The environment where the deployment occurred."
      },
      "createdAt": {
        "title": "Deployment Time",
        "type": "string",
        "format": "date-time",
        "description": "The timestamp when the deployment was triggered."
      },
      "deploymentStatus": {
        "title": "Deployment Status",
        "type": "string",
        "enum": [
          "Successful", 
          "Failed"
        ],
        "description": "Indicates whether the deployment was successful or failed."
      },
      "leadTime": {
        "title": "Lead Time",
        "type": "number",
        "description": "The time in hours between a pull request being merged and its deployment."
      }
    }
   },
  "relations": {
    "service": {
      "title": "Service",
      "target": "service",
      "many": false
    },
    "pullRequest": {
      "title": "Pull Request",
      "target": "pullRequest",
      "many": false
    }
  }
}
```
</details>





### Tracking Strategies

The following strategies can help improve your deployment frequency and change failure rate:

<Tabs groupId="deployment-strategies" queryString defaultValue="pr-merge" values={[
{label: "PR Merge", value: "pr-merge"},
{label: "Workflow/Job", value: "workflow-job"},
{label: "CI/CD Pipelines", value: "ci-cd-pipelines"},
{label: "GitHub Deployment", value: "github-deployment"}
]}>

<TabItem value="pr-merge" label="PR Merge">

One of the ways to track deployments is by monitoring when pull requests (PRs) are merged into a branch, typically the **main** or **production** branch. This is the recommended approach for tracking deployments and calculating lead time.

The lead time for these merges is calculated as the difference between when the PR was created and when it was merged.

**Example**:

- When a PR is merged, a **deployment entity** is created in Port to represent the deployment that took place.
- The **lead time** for that PR is calculated and added to the deployment as part of the blueprint.

Here’s how you can implement this:

1. **Define a Pull Request Blueprint**:
    - A sample PR blueprint can be found [here](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/git/github/examples/resource-mapping-examples).

2. **Add the configuration below** to the [data sources page](https://app.getport.io/settings/data-sources) in your Port portal, and select your GitHub integration:

<details>
<summary><b>Deployment config (click to expand)</b></summary>

```yaml showLineNumbers
- kind: pull-request
  selector:
    query: ".base.ref == 'main'"  # Track PRs merged into the main branch
  port:
    entity:
      mappings:
        identifier: ".head.repo.name + '-' + (.id|tostring)"
        title: "Deployment for PR {{ .head.repo.name }}"
        blueprint: '"deployment"'
        properties:
          environment: '"Production"'  # Hard coded for now
          createdAt: ".merged_at"
          deploymentStatus: '"Successful"'  # Hard coded for now
          leadTime: |
            (.created_at as $createdAt | .merged_at as $mergedAt | 
            ($createdAt | sub("\\..*Z$"; "Z") | strptime("%Y-%m-%dT%H:%M:%SZ") | mktime) as $createdTimestamp | 
            ($mergedAt | if . == null then null else sub("\\..*Z$"; "Z") | strptime("%Y-%m-%dT%H:%M:%SZ") | mktime end) as $mergedTimestamp | 
            if $mergedTimestamp == null then null else ($mergedTimestamp - $createdTimestamp) / 86400 end)
```

</details>

:::tip Hardcoded values
The value for deploymentStatus is hardcoded to `Successful` to treat all deployments as successful, and the environment is hardcoded to Production for the **main** branch in this example.
You can modify these values based on your requirements.
:::

</TabItem>

<TabItem value="workflow-job" label="Workflow/Job">

coming soon

</TabItem>

<TabItem value="ci-cd-pipelines" label="CI/CD Pipelines">

coming soon

</TabItem>

<TabItem value="github-deployment" label="GitHub Deployment">

coming soon

</TabItem>

</Tabs>






### Metrics Calculation

#### Deployment Frequency

**Deployment Frequency** measures how often new code is deployed within a specific period, typically weekly or monthly. This metric is important because it reflects how quickly a team can ship new changes.
- **Add these properties to the Service Blueprint**:
<details>
<summary><b> Aggregation for deployment frequency (click to expand)</b></summary>

```json showLineNumbers
{
  "aggregationProperties": {
    "deploymentFrequency": {
      "title": "Deployment Frequency",
      "target": "deployment",
      "calculationSpec": {
        "calculationBy": "entities",
        "func": "count"
      },
      "query": {
        "combinator": "and",
        "rules": [
          {
            "property": "createdAt",
            "operator": "between",
            "value": {
              "preset": "lastMonth"
            }
          }
        ]
      }
    }
  }
}
```

</details>


####  Change Failure Rate (CFR)

**Change Failure Rate** measures the percentage of deployments that fail and require a rollback or lead to incidents. It helps assess the stability and reliability of new releases.

- **Using Port’s Calculation Property**:
    - We will introduce a property called **deploymentStatus** to track whether a deployment was **Successful** or **Failed**.
    - The **Change Failure Rate** will be calculated by dividing the number of failed deployments by the total number of deployments in the same period.

  **Steps**:
    - Count all deployments with `deploymentStatus` set to **Failed**.
    - Divide this count by the total number of deployments, and multiply by 100 to get the percentage.

  **Example**:
    - If 2 out of 10 deployments failed, the **Change Failure Rate** would be:

  CFR = (Failed Deployments / Total Deployments) × 100
  CFR = (2 / 10) × 100 = 20%


<details>
<summary><b> Calculation for CFR (click to expand)</b></summary>

```json showLineNumbers
{
  "calculationProperties": {
    "changeFailureRate": {
      "title": "Change Failure Rate",
      "type": "number",
      "calculation": "(.properties.deploymentStatus == 'Failed') / count(.properties.deploymentStatus) * 100"
    }
  }
}
```
</details>