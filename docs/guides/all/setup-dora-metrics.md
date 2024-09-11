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

:::info Prerequisites
- Complete the [Port onboarding process](https://docs.getport.io/quickstart).
- Access a GitHub repository (e.g., port-dora-metrics) to sync your pull requests or deployments. You can follow the [GitHub integration guide](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/git/github) to ensure your deployments are tracked in Port.
- Optional for advanced strategies: If you're using workflows or pipelines, ensure they are configured for deployment tracking by following the relevant setup guides, such as CI/CD or GitHub Actions.
:::

## Tracking Deployment

In this section, we will cover how to track your team's deployments. Deployments refer to releasing new or updated code into various environments, such as **Production**, **Staging**, or **Testing**. Tracking deployments helps you understand how efficiently your team ships features and monitors release stability.

Deployments contribute to three key DORA metrics:

- **Deployment Frequency**: How often changes are deployed to production or other environments.
- **Change Failure Rate**: The percentage of deployments that fail and require intervention, rollback, or generate issues.
- **Lead Time for Changes**: The time it takes from code commit to deployment into production.

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
      }
    }
   },
   "mirrorProperties": {
      "leadTimeDays": {
         "title": "Lead Time (Days)",
         "mirror": ".relations.pullRequest.properties.lead_time_days",
         "type": "number",
         "description": "Mirrored lead time from Pull Request Blueprint in days."
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
Below are the main ways to track deployments in your portal:

<Tabs groupId="deployment-strategies" queryString defaultValue="pr-merge" values={[
{label: "PR Merge", value: "pr-merge"},
{label: "Workflow/Job", value: "workflow-job"},
{label: "CI/CD Pipelines", value: "ci-cd-pipelines"},
{label: "GitHub Deployment", value: "github-deployment"},
{label: "Custom API", value: "custom-api"}
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
        relations:
          pullRequest: .id  
          service: .head.repo.name
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
        relations:
          service: .repository.name
```
</details>

:::tip Using regex
You can use regex to track only workflows related to deployments
(e.g., workflows containing the word "deploy").
The environment is automatically determined based on the branch, where the main branch corresponds to Production.
:::

This approach can also be implemented for other CI/CD tools such as Jenkins, GitLab CI, CircleCI, or Azure DevOps. Each tool allows you to monitor workflows or pipeline runs and map them into Port as deployment entities, ensuring consistency across multiple platforms.

By following a similar pattern for other tools, you will be able to capture deployment metadata, dynamically set the deployment status, and represent all your deployment activities in a unified way in Port.

</TabItem>

<TabItem value="ci-cd-pipelines" label="CI/CD Pipelines">



CI/CD pipelines, such as those run by Jenkins, provide a robust way to track deployments. Jenkins, in particular, allows you to create and update entities in Port dynamically using Port's API as part of the pipeline execution.

**Examples**:

Port supports tracking deployments from various CI/CD tools by monitoring pipelines and reporting the deployment status to Port. Here are examples for some commonly used CI/CD tools:

- **Jenkins**

Jenkins provides a robust way to track deployments by dynamically reporting build statuses to Port using Port's API.

<details>
<summary><b>Jenkins Pipeline Example (click to expand)</b></summary>

```groovy showLineNumbers
pipeline {
  agent any
  environment {
    API_URL = "https://api.getport.io"
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

            def token = new groovy.json.JsonSlurperClassic().parseText(token_response.content).accessToken

            def entity_body = """
              {
                "identifier": "${env.JOB_NAME}-${env.BUILD_NUMBER}",
                "title": "Deployment for ${env.JOB_NAME}",
                "properties": {
                  "environment": "Production",
                  "createdAt": "${env.BUILD_TIMESTAMP}",
                  "deploymentStatus": "${env.BUILD_STATUS == 'SUCCESS' ? 'Success' : 'Failed'}"
                },
                "relations": {
                  "service": {
                    "combinator": "and",
                    "rules": [
                      {
                        "property": "$title",
                        "operator": "=",
                        "value": "${env.JOB_NAME}"
                      }
                    ]
                  }
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

- **Octopus Deploy**

Octopus can be used to track deployments by reporting to Port using custom API calls after deployments are triggered.

<details>
<summary><b>Octopus Deploy Example (click to expand)</b></summary>

```yaml
# Octopus script example for deployment tracking in Port
steps:
  - run: |
      curl -X POST \
      -H "Authorization: Bearer <YOUR_TOKEN>" \
      -H "Content-Type: application/json" \
      -d '{
        "identifier": "octopus-{{build_id}}",
        "title": "Deployment for Octopus {{build_id}}",
        "properties": {
          "environment": "Production",
          "createdAt": "{{timestamp}}",
          "deploymentStatus": "Success"
        },
        "relations": {
          "service": {
            "combinator": "and",
            "rules": [
              {
                "property": "$title",
                "operator": "=",
                "value": "{{project.name}}"
              }
            ]
          }
        }
      }' \
      https://api.getport.io/v1/blueprints/deployment/entities?upsert=true&merge=true
```

</details>

- **CircleCI**

Track deployments in CircleCI by reporting pipeline runs to Port using a configuration similar to Jenkins.

<details>
<summary><b>CircleCI Pipeline Example (click to expand)</b></summary>

```yaml
version: 2.1

jobs:
  deploy:
    docker:
      - image: circleci/node:latest
    steps:
      - run:
          name: "Notify Port of deployment"
          command: |
            curl -X POST https://api.getport.io/v1/blueprints/deployment/entities?upsert=true&merge=true \
            -H "Authorization: Bearer $PORT_API_TOKEN" \
            -d '{
              "identifier": "circleci-{{build_number}}",
              "title": "Deployment for CircleCI {{build_number}}",
              "properties": {
                "environment": "Production",
                "createdAt": "{{timestamp}}",
                "deploymentStatus": "Success"
              },
              "relations": {
                "service": {
                  "combinator": "and",
                  "rules": [
                    {
                      "property": "$title",
                      "operator": "=",
                      "value": "{{.repository.name}}"
                    }
                  ]
                }
              }
            }'
```

</details>

- **Azure Pipelines**

Azure Pipelines can track deployments by integrating with Port's API in a similar manner.

<details>
<summary><b>Azure Pipelines Example (click to expand)</b></summary>

```yaml
trigger:
- master

jobs:
- job: DeployToProd
  steps:
  - script: |
      curl -X POST \
      -H "Authorization: Bearer $PORT_API_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "identifier": "azure-$(Build.BuildId)",
        "title": "Deployment for Azure $(Build.BuildId)",
        "properties": {
          "environment": "Production",
          "createdAt": "$(Build.QueuedTime)",
          "deploymentStatus": "Success"
        },
        "relations": {
          "service": {
            "combinator": "and",
            "rules": [
              {
                "property": "$title",
                "operator": "=",
                "value": "$(Build.Repository.Name)"
              }
            ]
          }
        }
      }' \
      https://api.getport.io/v1/blueprints/deployment/entities?upsert=true&merge=true
```

</details>

- **Codefresh**

Track deployments in Codefresh by integrating Port's API with your pipeline configurations.

<details>
<summary><b>Codefresh Pipeline Example (click to expand)</b></summary>

```yaml
version: '1.0'
steps:
  ReportToPort:
    title: Reporting to Port
    type: freestyle
    image: curlimages/curl
    commands:
      - curl -X POST https://api.getport.io/v1/blueprints/deployment/entities?upsert=true&merge=true \
        -H "Authorization: Bearer $PORT_API_TOKEN" \
        -d '{
          "identifier": "codefresh-{{CF_BUILD_ID}}",
          "title": "Deployment for Codefresh {{CF_BUILD_ID}}",
          "properties": {
            "environment": "Production",
            "createdAt": "{{CF_BUILD_TIMESTAMP}}",
            "deploymentStatus": "Success"
          },
          "relations": {
          "service": {
            "combinator": "and",
            "rules": [
              {
                "property": "$title",
                "operator": "=",
                "value": "{{repository.name}}"
              }
            ]
          }
        }
        }'
```

</details>

- **GitLab Pipelines**

Track GitLab pipeline deployments using a similar approach to report data to Port.

<details>
<summary><b>GitLab Pipeline Example (click to expand)</b></summary>

```yaml
stages:
  - deploy

deploy:
  stage: deploy
  script:
    - curl -X POST https://api.getport.io/v1/blueprints/deployment/entities?upsert=true&merge=true \
      -H "Authorization: Bearer $PORT_API_TOKEN" \
      -d '{
        "identifier": "gitlab-{{CI_JOB_ID}}",
        "title": "Deployment for GitLab {{CI_JOB_ID}}",
        "properties": {
          "environment": "Production",
          "createdAt": "{{CI_JOB_TIMESTAMP}}",
          "deploymentStatus": "Success"
        },
        "relations": {
         "service": {
           "combinator": "and",
           "rules": [
             {
               "property": "$title",
               "operator": "=",
               "value": "{{.project.name}}"
             }
           ]
         }
       }
      }'
```
</details>

:::tip
we use the **search relation** entity to map the deployment to the correct service based on the service's `$title`.
To learn more about using search relations,
see [our documentation on Mapping Relations
Using Search Queries](https://docs.getport.io/build-your-software-catalog/customize-integrations/configure-mapping/#mapping-relations-using-search-queries).
:::


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


<TabItem value="custom-api" label="Custom API">
If your tool or workflow is not natively supported, you can create custom integrations by directly interacting with Port’s API. This method allows you to track deployments from any system that can make HTTP API calls.

Here’s how you can use the API to create a deployment entity in Port:

<details>
<summary><b>Custom API Example (click to expand)</b></summary>

```bash
curl -X POST https://api.getport.io/v1/blueprints/deployment/entities?upsert=true&merge=true \
-H "Authorization: Bearer $PORT_API_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "identifier": "custom-deployment-1234",
  "title": "Custom Deployment for ID 1234",
  "properties": {
    "environment": "Production",
    "createdAt": "2024-09-01T12:00:00Z",
    "deploymentStatus": "Success"
  },
  "relations": {
    "service": {
      "combinator": "and",
      "rules": [
        {
          "property": "$title",
          "operator": "=",
          "value": "Custom-Service-Name"
        }
      ]
    }
  }
}'
```
</details>

:::tip
we use the **search relation** entity to map the deployment to the correct service based on the service's `$title`.
To learn more about using search relations,
see [our documentation on Mapping Relations
Using Search Queries](https://docs.getport.io/build-your-software-catalog/customize-integrations/configure-mapping/#mapping-relations-using-search-queries).
You can change the query to match the naming convention in your organization.
:::

By using this approach, you can ensure any deployment system is integrated into Port,
giving you full flexibility across all your deployment workflows.

</TabItem>

</Tabs>

<br/>

### Monorepo Tracking

Port does not offer a built-in solution specifically tailored for monorepos.
However, by using **custom integrations**, you can track services or components within a monorepo effectively.

Here’s how you can do this:

- **Define Blueprints**: Set up blueprints for each service or component within your monorepo. Each microservice or feature should have distinct properties such as `name`, `deployment status`, and `dependencies`.

- **Ingest Data via Port API**: Use Port's API to track changes, deployments, or pull request merges for each service individually. By using selectors, you can map specific parts of the monorepo (e.g., specific directories) to corresponding services.


The following YAML example demonstrates how to track multiple services (e.g., `service-A`, `service-B`) within a monorepo:

```yaml
resources:
  - kind: service
    selector:
      query: ".repository.name == 'monorepo' && (.path | startswith('service-A/') || .path | startswith('service-B/'))"
    port:
      entity:
        mappings:
          identifier: .path
          title: .path | split('/')[0]
          blueprint: '"service"'
          properties:
            url: .html_url
            defaultBranch: .default_branch
```

In this setup:
- The `query` checks if the repository is the monorepo and if the file path starts with either `service-A/` or `service-B/`.
- The `identifier` is mapped to the path, which uniquely identifies the service.
- The `title` is derived from the service name in the file path.

By this method, individual services within a monorepo are mapped to Port blueprints.

:::tip Custom Integration Benefits
Custom integrations provide flexibility in mapping and tracking each service or microservice within a monorepo. With Port’s API, you can track deployments and updates for each component separately, giving you granular control over monitoring and managing services in a monorepo.
:::


## Tracking Incidents

Incidents are essential for tracking key DORA metrics, including **Change Failure Rate (CFR)** and **Mean Time to Recovery (MTTR)**. Effective incident tracking reveals insights into how frequently deployments fail and how quickly teams can resolve issues. This section outlines how to:

- Use incidents to calculate **CFR** and **MTTR**.
- Link incidents to services to track the impact of failures.
- Aggregate metrics across incidents for better monitoring.

### Data Model Setup

Ensure that your **PagerDuty incident blueprint** is configured properly. You can follow the detailed steps in the [PagerDuty Incident Blueprint](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/incident-management/pagerduty).

- Add the following properties to capture incident resolution time and recovery time:

<details>
<summary><b>Additional properties for PagerDuty Incident Blueprint (click to expand)</b></summary>

```json
{
  "properties": {
    "resolvedAt": {
      "title": "Incident Resolution Time",
      "type": "string",
      "format": "date-time",
      "description": "The timestamp when the incident was resolved."
    },
    "recoveryTime": {
      "title": "Time to Recovery",
      "type": "number",
      "description": "The time (in minutes) between the incident being triggered and resolved."
    }
  }
}
```
</details>

### Syncing Incidents with PagerDuty and Other Tools

To sync incidents from **PagerDuty**, follow the steps in the [PagerDuty guide](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/incident-management/pagerduty). The guide provides detailed steps for setting up integrations to track incidents related to deployments.

For other incident management tools, follow these respective guides:
- [OpsGenie](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/incident-management/opsgenie)
- [FireHydrant](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/incident-management/firehydrant)
- [ServiceNow](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/incident-management/servicenow)
- [Statuspage](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/incident-management/statuspage)

### Aggregating Incident Data for MTTR

Add the following **aggregation properties** to the **Incident Blueprint**

<details>
<summary><b>Aggregation Property JSON (click to expand)</b></summary>

```json
{
  "aggregationProperties": {
    "meanTimeToResolve": {
      "title": "Mean Time to Recovery",
      "target": "incident",
      "calculationSpec": {
        "calculationBy": "entities",
        "func": "avg",
        "field": "recoveryTime"
      },
      "query": {
        "combinator": "and",
        "rules": [
          {
            "property": "status",
            "operator": "=",
            "value": "resolved"
          }
        ]
      }
    }
  }
}
```
</details>

This aggregation setup will calculate the **average MTTR** by considering incidents that have been resolved,
giving a better picture of recovery performance across services.

## Metrics

We will demonstrate how to calculate the four main DORA metrics using aggregated data:

1. **Deployment Frequency**: Number of successful deployments within a timeframe.
2. **Change Lead Time**: Time from PR opened to deployment.
3. **Change Failure Rate (CFR)**: Incidents divided by total deployments.
4. **Mean Time to Recovery (MTTR)**: Time from the incident's onset to resolution.

To achieve this, we will aggregate data at the **Organization** level.
We'll create an **Organization** blueprint and add the necessary relationships for **Deployments**,
**PRs**, **Incidents**, and **Services**.



### Data Model Setup

Define the **Organization** blueprint and add these relationships to connect it with Deployments,
Pull Requests, Incidents, and Services:

<details> 
<summary><b>Organization Blueprint (click to expand)</b></summary>

```json
{
  "identifier": "organization",
  "title": "Organization",
  "schema": {
    "properties": {},
    "required": []
  },
  "relations": {
    "deployment": {
      "title": "Related Deployment",
      "target": "deployment",
      "many": true
    },
    "pull_request": {
      "title": "Related Pull Request",
      "target": "githubPullRequest",
      "many": true
    },
    "incident": {
      "title": "Related Incident",
      "target": "incident",
      "many": true
    },
    "service": {
      "title": "Related Service",
      "target": "service",
      "many": true
    }
  }
}
```
</details>

:::tip Why define these relationships?
These relationships enable the **Organization** blueprint
to pull data from the other relevant blueprints such as **Deployment**,
**Pull Request**, **Incident**, and **Service**.
Without these relationships,
the **Organization** entity wouldn’t be able to aggregate the required data to calculate the DORA metrics.
:::


### Calculations

We will calculate each of the four key DORA metrics using the aggregation of data in the **Organization** blueprint.

<Tabs groupId="metrics" defaultValue="df" values={[
{ label: 'Deployment Frequency', value: 'df' },
{ label: 'Change Lead Time', value: 'clt' },
{ label: 'Change Failure Rate', value: 'cfr' },
{ label: 'Mean Time to Recovery', value: 'mttr' }
]}>

<TabItem value="df" label="Deployment Frequency">

This metric counts the total number of successful deployments for the organization.

<details> 
<summary><b>Deployment Frequency Calculation (click to expand)</b></summary>

```json
{
  "aggregationProperties": {
    "total_deployments": {
      "title": "Total Deployments",
      "type": "number",
      "target": "deployment",
      "calculationSpec": {
        "func": "count",
        "calculationBy": "entities"
      }
    },
    "average_deployments": {
      "title": "Average Deployments",
      "type": "number",
      "target": "deployment",
      "calculationSpec": {
        "func": "avg",
        "property": "deployment_frequency",
        "calculationBy": "property"
      }
    }
  }
}
```
</details>

</TabItem>

<TabItem value="clt" label="Change Lead Time">

This metric calculates the average time taken from when a PR is opened until it is deployed.

<details> 
<summary><b>Change Lead Time Calculation (click to expand)</b></summary>

```json
{
  "aggregationProperties": {
    "average_lead_time": {
      "title": "Average Lead Time (PR)",
      "type": "number",
      "target": "githubPullRequest",
      "calculationSpec": {
        "func": "avg",
        "property": "lead_time_days",
        "calculationBy": "property"
      }
    }
  }
}
```
</details>

</TabItem>

<TabItem value="cfr" label="Change Failure Rate (CFR)">

This metric calculates the percentage of failed deployments by dividing the number of incidents by the total number of deployments.

<details> 
<summary><b>Change Failure Rate Calculation (click to expand)</b></summary>

```json
{
  "aggregationProperties": {
    "failure_rate": {
      "title": "Change Failure Rate",
      "type": "number",
      "calculation": "(count(.relations.incident) / count(.relations.deployment)) * 100"
    }
  }
}
```
</details>

</TabItem>

<TabItem value="mttr" label="Mean Time to Recovery (MTTR)">

This metric calculates the average time taken to resolve incidents that occur after deployments.

<details> 
<summary><b>MTTR Calculation (click to expand)</b></summary>

```json
{
  "aggregationProperties": {
    "mean_time_to_recovery": {
      "title": "Mean Time to Recovery",
      "type": "number",
      "target": "incident",
      "calculationSpec": {
        "func": "avg",
        "property": "recoveryTime",
        "calculationBy": "property"
      }
    }
  }
}
```
</details>

</TabItem>

</Tabs>

Here is the **complete JSON setup** for the **Organization** blueprint,
including both the **relationships** and the **aggregated DORA metrics**:

<details>
<summary><b>Complete Organization Blueprint JSON (click to expand)</b></summary>

```json
{
  "identifier": "organization",
  "title": "Organization",
  "schema": {
    "properties": {},
    "required": []
  },
  "relations": {
    "deployment": {
      "title": "Related Deployment",
      "target": "deployment",
      "many": true
    },
    "pull_request": {
      "title": "Related Pull Request",
      "target": "githubPullRequest",
      "many": true
    },
    "incident": {
      "title": "Related Incident",
      "target": "incident",
      "many": true
    },
    "service": {
      "title": "Related Service",
      "target": "service",
      "many": true
    }
  },
  "aggregationProperties": {
    "total_deployments": {
      "title": "Total Deployments",
      "type": "number",
      "target": "deployment",
      "calculationSpec": {
        "func": "count",
        "calculationBy": "entities"
      }
    },
    "average_deployments": {
      "title": "Average Deployments",
      "type": "number",
      "target": "deployment",
      "calculationSpec": {
        "func": "avg",
        "property": "deployment_frequency",
        "calculationBy": "property"
      }
    },
    "average_lead_time": {
      "title": "Average Lead Time (PR)",
      "type": "number",
      "target": "githubPullRequest",
      "calculationSpec": {
        "func": "avg",
        "property": "lead_time_days",
        "calculationBy": "property"
      }
    },
    "total_incidents": {
      "title": "Total Incidents",
      "type": "number",
      "target": "incident",
      "calculationSpec": {
        "func": "count",
        "calculationBy": "entities"
      }
    },
    "failure_rate": {
      "title": "Change Failure Rate",
      "type": "number",
      "calculation": "(count(.relations.incident) / count(.relations.deployment)) * 100"
    },
    "mean_time_to_recovery": {
      "title": "Mean Time to Recovery",
      "type": "number",
      "target": "incident",
      "calculationSpec": {
        "func": "avg",
        "property": "recoveryTime",
        "calculationBy": "property"
      }
    }
  }
}
```
</details>



By defining the **Organization** blueprint, adding the necessary relationships, and using these calculation blocks, you can successfully calculate the four main DORA metrics: **Deployment Frequency**, **Change Lead Time**, **Change Failure Rate (CFR)**, and **Mean Time to Recovery (MTTR)**.
