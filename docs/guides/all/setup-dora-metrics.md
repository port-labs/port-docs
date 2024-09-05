---
sidebar_position: 10
displayed_sidebar: null
---

import PortTooltip from "/src/components/tooltip/tooltip.jsx";

# Dora metrics

## Overview
This guide is designed to help you understand and implement [DevOps Research and Assessment (DORA) metrics](https://cloud.google.com/devops/research/dora) within your organization in PORT. DORA Metrics are a set of key performance indicators that measure the effectiveness and efficiency of your software development and delivery process. 
By tracking these metrics, you can identify areas for improvement and ensure that your team is delivering high-quality software efficiently.
This guide will cover the four key metrics that DORA recommends tracking: `Deployment Frequency`, `Lead Time`, `Change Failure Rate`, and The `Mean Time to Recovery`.

## Tracking Deployment
In this section, we will cover how to track your team's deployment frequency. Deployment releases new or updated code into an environment (e.g., Production, Staging, or Testing). 
Tracking deployments helps understand how efficiently your team ships features and monitors release stability. Deployments are used to calculate two key DORA metrics:

- **Deployment Frequency**: How often changes are deployed to production or other environments.
- **Change Failure Rate**: The percentage of deployments that fail and require intervention, rollback, or generate issues.

To track the necessary data for these metrics, we will create a **Deployment Blueprint** with properties that capture the essential information for each deployment.

### Create a Deployment Blueprint:

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
    },
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
              "operator": "between",
              "property": "createdAt",
              "value": {
                "preset": "lastMonth"
              }
            }
          ]
        },
        "description": "Counts the number of deployments over the past 30 days."
      }
    },
    
    "calculationProperties": {
      "changeFailureRate": {
        "title": "Change Failure Rate",
        "type": "number",
        "calculation": "(.properties.deploymentStatus == 'Failed') / count(.properties.deploymentStatus) * 100",
        "description": "Calculates the percentage of failed deployments."
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

---


### Metrics Calculation

#### Deployment Frequency

**Deployment Frequency** measures how often new code is deployed within a specific period, typically weekly or monthly. This metric is important because it reflects how quickly a team can ship new changes.

- **Using Port’s Aggregation Property**:
    - The **createdAt** field stores the deployment time.
    - We will use an **aggregation** to count all deployments within the last 30 days, filtering on the `createdAt` property.

  **Steps**:
    - Aggregate all deployments that have a `createdAt` timestamp within the specified timeframe.
    - This will return a count of the deployments, segmented by environment if needed.

  **Example**:
    - If there were 5 deployments in the last 30 days, the **Deployment Frequency** will be **5 deployments per month**.

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
            },
          }
        ]
      }
    }
  }
}
```

</details>

---

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



### Tracking Deployment Strategies
The following strategies can help improve your deployment frequency and change failure rate:

#### PR Merge
One of the ways to track deployments is by monitoring when pull requests (PRs) are merged into a branch, typically the **main** or **production** branch. The lead time for these merges is calculated as the difference between when the PR was created and when it was merged.

Example:

- When a PR is merged, a **deployment entity** is created in Port to represent the deployment that took place.
- The **lead time** for that PR is calculated and added to the deployment as part of the blueprint.

Here’s how you can implement this:

1. **Define a Pull Request Blueprint**:
    - A sample PR blueprint can be found [here](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/git/github/examples/resource-mapping-examples).

2. **Use Lead Time Calculation**:
    - The lead time for the PR is calculated using the time between `createdAt` and `mergedAt`.
    - This lead time will be associated with the deployment entity once the PR is merged.
  in such cases we can ingest data into PORT using the configuration below:
  <details> 
  <summary><b>deployment config (click to expand)</b></summary>
  
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
          environment: '"Production"' #Hard coded for now
          createdAt: ".merged_at"
          deploymentStatus: '"Successful"' #Hard coded for now
          leadTime: |
            (.created_at as $createdAt | .merged_at as $mergedAt | 
            ($createdAt | sub("\\..*Z$"; "Z") | strptime("%Y-%m-%dT%H:%M:%SZ") | mktime) as $createdTimestamp | 
            ($mergedAt | if . == null then null else sub("\\..*Z$"; "Z") | strptime("%Y-%m-%dT%H:%M:%SZ") | mktime end) as $mergedTimestamp | 
            if $mergedTimestamp == null then null else ($mergedTimestamp - $createdTimestamp) / 86400 end)
  
   ```
  </details>
  :::tip hardcoded values
    The value for deploymentStatus is hardcoded to `Successful` to treat all deployment as success
    and environment is hardcoded to production for main/master in this example.
    You can modify these values based on your requirements.
  :::

3. **Deployment Creation**:
    - Use Port’s **automation** features to trigger the creation of a deployment entity each time a PR is merged into the main branch.

   Example:
<details>
<summary><b>Automation Example (click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "createDeploymentOnMerge",
  "title": "Create Deployment on PR Merge",
  "trigger": {
    "type": "automation",
    "event": {
      "type": "ENTITY_UPDATED",
      "blueprintIdentifier": "githubPullRequest"
    },
    "condition": {
      "type": "JQ",
      "expressions": [
        ".properties.status == 'merged'"
      ],
      "combinator": "and"
    }
  },
  "invocationMethod": {
    "type": "UPSERT_ENTITY",
    "blueprintIdentifier": "deployment",
    "mapping": {
      "identifier": "{{ .event.context.entityIdentifier }}",
      "title": "Deployment for PR {{ .event.context.entityIdentifier }}",
      "properties": {
        "environment": "Production",
        "createdAt": "{{ .event.context.properties.mergedAt }}",
        "leadTime": "{{ (.properties.mergedAt | sub(\"\\\\..*Z$\"; \"Z\") | strptime(\"%Y-%m-%dT%H:%M:%SZ\") | mktime) - (.properties.createdAt | sub(\"\\\\..*Z$\"; \"Z\") | strptime(\"%Y-%m-%dT%H:%M:%SZ\") | mktime) }} / 86400",
        "deploymentStatus": "Successful"
      },
      "relations": {
        "pullRequest": "{{ .event.context.entityIdentifier }}"
      }
    }
  }
}
```
</details>

:::note environment configuration
If you are using multiple environments (such as staging, production), makes sure to map the deployment environment based on the branch or environment-specific details found in the PR metadata.
:::