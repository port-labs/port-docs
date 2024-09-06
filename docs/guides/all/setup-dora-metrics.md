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
      "target": "githubPullRequest",
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

One of the ways to track deployments is by monitoring when pull requests (PRs) are merged into a branch,
typically the **main**/**master** branch.
This is the **recommended** approach for tracking deployments and calculating lead time.

The lead time for these merges is calculated as the difference between when the PR was created and when it was merged.

**Example**:

- When a PR is merged, a **deployment entity** is created in Port to represent the deployment that took place.
- The **lead time** for that PR is calculated and added to the deployment as part of the blueprint.

Here’s how you can implement this:

1. **Add Pull Request blueprint, sample can be found [here](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/git/github/examples/resource-mapping-examples/#map-repositories-and-pull-requests)**:

2. **Add the configuration below** to the [data sources page](https://app.getport.io/settings/data-sources) in your Port portal, and select your GitHub integration:

<details>
<summary><b>Deployment config (click to expand)</b></summary>

```yaml showLineNumbers
- kind: pull-request
  selector:
    query: .base.ref == 'main'  # Track PRs merged into the main branch
  port:
    entity:
      mappings:
        identifier: .head.repo.name + '-' + (.id|tostring)
        title: Deployment for PR {{ .head.repo.name }}
        blueprint: '"deployment"'
        properties:
          environment: '"Production"'  # Hard coded for now
          createdAt: .merged_at
          deploymentStatus: 'Success'  # Hard coded for now
          leadTime: |
            (.created_at as $createdAt | .merged_at as $mergedAt | 
            ($createdAt | sub("\\..*Z$"; "Z") | strptime("%Y-%m-%dT%H:%M:%SZ") | mktime) as $createdTimestamp | 
            ($mergedAt | if . == null then null else sub("\\..*Z$"; "Z") | strptime("%Y-%m-%dT%H:%M:%SZ") | mktime end) as $mergedTimestamp | 
            if $mergedTimestamp == null then null else ($mergedTimestamp - $createdTimestamp) / 86400 end)
```

</details>

:::tip Hardcoded values
The value for deploymentStatus is hardcoded to `Success` to treat all deployments as successful,
and the environment is hardcoded to Production for the **main** branch in this example.
You can modify these values based on your requirements.
:::

</TabItem>

<TabItem value="workflow-job" label="Workflow/Job">

Track deployments by monitoring workflow runs in your pipeline.
This setup captures all workflow runs from the main branch and maps them to deployment entities.
The deployment status is set dynamically based on whether the workflow run concluded successfully or failed.

Here’s how you can implement this:
- **Add the configuration below** to the [data sources page](https://app.getport.io/settings/data-sources) in your Port portal, and select your GitHub integration:

<details>
<summary><b>Deployment via Workflow Runs (click to expand)</b></summary>

```yaml showLineNumber

- kind: workflow-run
  selector:
    query: .base_ref == 'main' # Track all workflow runs in the main branch
  port:
    entity:
      mappings:
        identifier: .repository.name + '-' + (.run_number|tostring)
        title: Deployment from Workflow Run {{ .repository.name }}
        blueprint: '"deployment"'
        properties:
          environment: '"Production"'  # Set environment based on branch (main/master as Production)
          createdAt: .run_started_at
          deploymentStatus: .conclusion
          leadTime: |
            (.run_started_at as $startTime | .updated_at as $endTime |
            ($startTime | sub("\\..*Z$"; "Z") | strptime("%Y-%m-%dT%H:%M:%SZ") | mktime) as $startTimestamp |
            ($endTime | sub("\\..*Z$"; "Z") | strptime("%Y-%m-%dT%H:%M:%SZ") | mktime) as $endTimestamp |
            ($endTimestamp - $startTimestamp) / 86400)
```
</details>

:::tip Using regex
You can use regex to track only workflows related to deployments
(e.g., workflows containing the word "deploy").
The environment is automatically determined based on the branch, where the main branch corresponds to Production.
:::

</TabItem>

<TabItem value="ci-cd-pipelines" label="CI/CD Pipelines">



CI/CD pipelines, such as those run by Jenkins, provide a robust way to track deployments. Jenkins, in particular, allows you to create and update entities in Port dynamically using Port's API as part of the pipeline execution.

**Example**:

In Jenkins, each time a build is triggered or completed,
you can use the API to automatically report the build status and create/update deployment entities in Port.
This approach ensures the catalog is always up-to-date with your CI/CD activities.

Here’s how you can implement this:

1. **Set Up Jenkins with Port Integration**:  
   Jenkins can be integrated with Port
   using either [Port's Ocean plugin](https://docs.getport.io/build-your-software-catalog/custom-integration/api/ci-cd/jenkins-deployment/#available-ocean-integration) or [Port's API](https://docs.getport.io/build-your-software-catalog/custom-integration/api/ci-cd/jenkins-deployment).
   For this example, we will use Port's API to dynamically create or update deployment entities.
   Detailed instructions
   for setting up Jenkins with Port can be found in the [Port Jenkins integration documentation](https://docs.getport.io/build-your-software-catalog/custom-integration/api/ci-cd/jenkins-deployment/).

2. **Create/Update Deployment Entity**:  
   Below is an example of how you can set up a Jenkins pipeline to report a deployment entity to Port using Port's API.

<details>
<summary><b>Jenkins Pipeline Example (click to expand)</b></summary>

```groovy showLineNumbers
pipeline {
  agent any
  environment {
    API_URL = "https://api.getport.io" // EU region Port API URL
  }
  stages {
    stage('Report Deployment to Port') {
      steps {
        withCredentials([
                string(credentialsId: 'port-client-id', variable: 'PORT_CLIENT_ID'),
                string(credentialsId: 'port-client-secret', variable: 'PORT_CLIENT_SECRET')
        ]) {
          script {
            def auth_body = """
              {
                "clientId": "${PORT_CLIENT_ID}",
                "clientSecret": "${PORT_CLIENT_SECRET}"
              }
            """
            def token_response = httpRequest contentType: 'APPLICATION_JSON',
                    httpMode: 'POST',
                    requestBody: auth_body,
                    url: "${API_URL}/v1/auth/access_token"

            def slurped_response = new groovy.json.JsonSlurperClassic().parseText(token_response.content)
            def token = slurped_response.accessToken

            def entity_body = """
              {
                "identifier": "${env.JOB_NAME}-${env.BUILD_NUMBER}",
                "title": "Deployment for ${env.JOB_NAME}",
                "properties": {
                  "environment": "Production",
                  "createdAt": "${env.BUILD_TIMESTAMP}",
                  "deploymentStatus": "${env.BUILD_STATUS == 'SUCCESS' ? 'Success' : 'Failed'}"
                }
              }
            """

            httpRequest contentType: "APPLICATION_JSON",
                    httpMode: "POST",
                    url: "${API_URL}/v1/blueprints/deployment/entities?upsert=true&merge=true",
                    requestBody: entity_body,
                    customHeaders: [
                            [name: 'Authorization', value: "Bearer ${token}"]
                    ]
          }
        }
      }
    }
  }
}
```

</details>

</TabItem>

<TabItem value="github-deployment" label="GitHub Deployment">

GitHub deployments can be tracked by mapping repository releases and tags to deployment entities in Port.
These repositories can hold critical information related to service versions, commits, and releases.

Here’s how you can implement this:

1. **Add the configuration below** to the [data sources page](https://app.getport.io/settings/data-sources) in your Port portal, and select your GitHub integration.

<details>
<summary><b>Releases and Tags config (click to expand)</b></summary>

```yaml showLineNumbers

  - kind: release
    selector:
      query: "true"  
    port:
      entity:
        mappings:
          identifier: .release.name
          title: Deployment for Release {{ .release.name }}
          blueprint: '"deployment"'  
          properties:
            environment: '"Production"'  
            createdAt: .release.created_at
            deploymentStatus: '"Success"'  
          relations:
            tag: .release.tag_name
            service: .repo.name
  - kind: tag
    selector:
      query: "true"  
    port:
      entity:
        mappings:
          identifier: .tag.name
          title: Tag {{ .tag.name }}
          blueprint: '"tag"'  
          properties:
            commit_sha: .commit.sha
          relations:
            service: .repo.name

```

</details>

:::tip
This configuration maps the repository, release, and tag information to deployment entities in Port.
You can find more details about setting up GitHub integrations for repositories, releases,
and tags [here](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/git/github/examples/resource-mapping-examples/#map-repositories-repository-releases-and-tags).
:::

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