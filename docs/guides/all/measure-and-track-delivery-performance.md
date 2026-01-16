---
displayed_sidebar: null
description: Learn how to measure and track delivery performance as part of your engineering intelligence framework using key metrics like PR cycle time, PR throughput, deployment frequency, and overdue PRs.
---

import MCPCapabilitiesHint from '/docs/guides/templates/ai/_mcp_capabilities_hint.mdx'
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Gain visibility into delivery performance

Measuring delivery performance is essential for understanding how effectively your engineering teams ship value to customers. Without visibility into delivery metrics, teams struggle to identify bottlenecks, optimize workflows, and make data-driven decisions about process improvements.

This guide helps engineering managers, platform engineers, DevEx teams, and product leaders answer critical questions about their delivery pipeline:

- **Flow**: How smoothly does work move through the development lifecycle?
- **Bottlenecks**: Where are the friction points that slow down delivery?
- **Predictability**: Can we reliably forecast when features will be delivered?

By the end of this guide, you will have a working dashboard that tracks key delivery performance metrics, enabling you to identify improvement opportunities, measure the impact of process changes, and communicate delivery health across your organization.

:::tip AI-powered insights
This guide includes configuration for a **Delivery Performance Agent** that provides AI-powered insights into your delivery flow. Ask natural language questions like "What needs attention right now?" or "What are the top 3 actions we should take to improve PR throughput?" and receive prioritized, actionable recommendations with expected impact and implementation complexity.
:::

<img src="/img/guides/delivery-performance-dashboard.png" border="1px" width="100%" />


## Common use cases

- Track PR cycle time to identify bottlenecks in reviews and CI processes.
- Monitor PR throughput to understand delivery flow and detect platform issues.
- Measure deployment frequency to see how often customer value is shipped.
- Identify overdue PRs to surface workflow inefficiencies and blocked work.

## Prerequisites

This guide assumes the following:

- You have a Port account and have completed the [onboarding process](https://docs.port.io/getting-started/overview).
- Port's [GitHub integration](/build-your-software-catalog/sync-data-to-catalog/git/github/) or [Azure DevOps integration](/build-your-software-catalog/sync-data-to-catalog/git/azure-devops/) is installed in your account.

:::tip Initial scope

This guide focuses on measuring delivery performance using source control management (SCM) data, including repositories, pull requests, commits, and workflows. This guide supports GitHub and Azure DevOps, with GitLab support coming soon. This is the first iteration of delivery performance measurement and will expand in future versions to include additional metrics and data sources such as issue trackers, deployment platforms, and other development tools.
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

We will create several blueprints to model your data. The `service` blueprint should already exist from onboarding.

<Tabs groupId="git-provider" queryString defaultValue="github" values={[
  {label: "GitHub", value: "github"},
  {label: "Azure DevOps", value: "azure-devops"}
]}>

<TabItem value="github" label="GitHub">

<h3> Create the GitHub user blueprint </h3>

1. Go to the [Builder](https://app.getport.io/settings/data-model) page of your portal.
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.
4. Add this JSON schema:

    <details>
    <summary><b>GitHub user blueprint (click to expand)</b></summary>

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

<h3> Create the GitHub repository blueprint </h3>

1. Go to your [Builder](https://app.getport.io/settings/data-model) page.
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.
4. Add this JSON schema:

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

<h3> Create or update the GitHub pull request blueprint </h3>

If you already have a pull request blueprint, you need to add the following properties to it. Otherwise, create a new one.

1. Go to your [Builder](https://app.getport.io/settings/data-model) page.
2. If you have an existing pull request blueprint, hover over it, click on the `...` button, and select `Edit JSON`. Otherwise, click on `+ Blueprint` and then `Edit JSON`.
3. Add or update the JSON schema:

    <details>
    <summary><b>GitHub pull request blueprint (click to expand)</b></summary>

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
          "pr_age_label": {
            "icon": "DefaultProperty",
            "type": "string",
            "title": "PR Age Label"
          }
        },
        "required": []
      },
      "mirrorProperties": {},
      "calculationProperties": {},
      "aggregationProperties": {
          "failedWorkflowsCount": {
            "title": "Failed Workflows",
            "type": "number",
            "description": "Count of failed workflow runs for this PR",
            "target": "githubWorkflowRun",
            "query": {
              "combinator": "and",
              "rules": [
                {
                  "property": "conclusion",
                  "operator": "=",
                  "value": "failure"
                }
              ]
            },
            "calculationSpec": {
              "func": "count",
              "calculationBy": "entities"
            }
          }
      },
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
    If you're updating an existing pull request blueprint, make sure to add the `pr_age`, `cycle_time`, and `pr_age_label` properties if they don't already exist.
    :::

4. Click `Save` to create or update the blueprint.

<h3> Create the deployment blueprint </h3>

1. Go to your [Builder](https://app.getport.io/settings/data-model) page.
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.
4. Add this JSON schema:

    <details>
    <summary><b>Deployment blueprint (click to expand)</b></summary>

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

</TabItem>

<TabItem value="azure-devops" label="Azure DevOps">

<h3> Create the Azure DevOps project blueprint </h3>

1. Go to the [Builder](https://app.getport.io/settings/data-model) page of your portal.
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.
4. Add this JSON schema:

    <details>
    <summary><b>Azure DevOps project blueprint (click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "azureDevopsProject",
      "title": "Project",
      "icon": "AzureDevops",
      "schema": {
        "properties": {
          "state": {
            "title": "State",
            "type": "string",
            "icon": "AzureDevops",
            "description": "The current lifecycle state of the project."
          },
          "revision": {
            "title": "Revision",
            "type": "string",
            "icon": "AzureDevops",
            "description": "The revision number, indicating how many times the project configuration has been updated."
          },
          "visibility": {
            "title": "Visibility",
            "type": "string",
            "icon": "AzureDevops",
            "description": "Indicates whether the project is private or public"
          },
          "defaultTeam": {
            "title": "Default Team",
            "type": "string",
            "icon": "Team",
            "description": "Default Team of the project"
          },
          "link": {
            "title": "Link",
            "type": "string",
            "format": "url",
            "icon": "AzureDevops",
            "description": "Link to azure devops project"
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

<h3> Create the Azure DevOps repository blueprint </h3>

1. Go to the [Builder](https://app.getport.io/settings/data-model) page of your portal.
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.
4. Add this JSON schema:

    <details>
    <summary><b>Azure DevOps repository blueprint (click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "azureDevopsRepository",
      "title": "Repository",
      "icon": "AzureDevops",
      "ownership": {
        "type": "Direct"
      },
      "schema": {
        "properties": {
          "url": {
            "title": "URL",
            "format": "url",
            "type": "string",
            "icon": "Link"
          },
          "readme": {
            "title": "README",
            "type": "string",
            "format": "markdown",
            "icon": "Book"
          },
          "id": {
            "type": "string",
            "title": "ID"
          },
          "last_activity": {
            "type": "string",
            "title": "Last Activity",
            "format": "date-time"
          },
          "minimumApproverCount": {
            "type": "number",
            "title": "Minimum Approver Count"
          },
          "workItemLinking": {
            "title": "Work Item Linking",
            "type": "boolean",
            "default": false
          },
          "repository_policy_enabled": {
            "type": "boolean",
            "title": "Repository Policy Enabled"
          },
          "visibility": {
            "type": "string",
            "title": "Visibility"
          }
        },
        "required": []
      },
      "mirrorProperties": {},
      "calculationProperties": {},
      "aggregationProperties": {
        "total_pipeline": {
          "title": "Total Pipeline",
          "type": "number",
          "target": "azureDevopsBuild",
          "calculationSpec": {
            "func": "count",
            "calculationBy": "entities"
          }
        },
        "has_pr_template": {
          "title": "Has PR Template",
          "type": "number",
          "target": "pr_template",
          "calculationSpec": {
            "func": "count",
            "calculationBy": "entities"
          }
        }
      },
      "relations": {
        "project": {
          "title": "Project",
          "target": "azureDevopsProject",
          "required": true,
          "many": false
        }
      }
    }
    ```

    </details>

5. Click `Save` to create the blueprint.

<h3> Create the Azure DevOps user blueprint </h3>

1. Go to the [Builder](https://app.getport.io/settings/data-model) page of your portal.
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.
4. Add this JSON schema:

    <details>
    <summary><b>Azure DevOps user blueprint (click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "azureDevopsUser",
      "title": "Azure Devops User",
      "icon": "AzureDevops",
      "schema": {
        "properties": {
          "url": {
            "type": "string",
            "title": "URL",
            "format": "url"
          },
          "email": {
            "type": "string",
            "title": "Email"
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

<h3> Create or update the Azure DevOps pull request blueprint </h3>

1. Go to the [Builder](https://app.getport.io/settings/data-model) page of your portal.
2. If you have an existing Azure DevOps pull request blueprint, hover over it, click on the `...` button, and select `Edit JSON`. Otherwise, click on `+ Blueprint` and then `Edit JSON`.
3. Add or update the JSON schema:

    <details>
    <summary><b>Azure DevOps pull request blueprint (click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "azureDevopsPullRequest",
      "title": "Pull Request",
      "icon": "AzureDevops",
      "ownership": {
        "type": "Inherited",
        "path": "repository"
      },
      "schema": {
        "properties": {
          "status": {
            "title": "Status",
            "type": "string",
            "enum": [
              "completed",
              "abandoned",
              "active"
            ],
            "enumColors": {
              "completed": "yellow",
              "abandoned": "red",
              "active": "green"
            }
          },
          "createdAt": {
            "title": "Created At",
            "type": "string",
            "format": "date-time"
          },
          "link": {
            "title": "Link",
            "format": "url",
            "type": "string"
          },
          "leadTimeHours": {
            "title": "Lead Time in hours",
            "type": "number"
          },
          "description": {
            "type": "string",
            "title": "Description",
            "icon": "Book"
          },
          "cycle_time": {
            "type": "number",
            "title": "Cycle Time"
          },
          "closedDate": {
            "icon": "DefaultProperty",
            "type": "string",
            "title": "Closed Date",
            "format": "date-time"
          },
          "pr_age_label": {
            "type": "string",
            "title": "PR Age"
          },
          "source_branch": {
            "type": "string",
            "title": "Source Branch"
          },
          "source_commit_sha": {
            "type": "string",
            "title": "Source Commit SHA"
          }
        },
        "required": []
      },
      "mirrorProperties": {
        "reviewer_teams": {
          "title": "Reviewer Teams",
          "path": "reviewers.$team"
        }
      },
      "calculationProperties": {
        "days_old": {
          "title": "Days Old",
          "icon": "DefaultProperty",
          "calculation": "(now / 86400) - (.properties.createdAt | capture(\"(?<date>\\\\d{4}-\\\\d{2}-\\\\d{2})\") | .date | strptime(\"%Y-%m-%d\") | mktime / 86400) | floor",
          "type": "number"
        }
      },
      "aggregationProperties": {
        "failedWorkflowsCount": {
          "title": "Failed Workflows",
          "type": "number",
          "description": "Count of failed workflow runs for this PR",
          "target": "azureDevopsBuild",
          "query": {
            "combinator": "and",
            "rules": [
              {
                "value": "failed",
                "property": "result",
                "operator": "="
              }
            ]
          },
          "calculationSpec": {
            "func": "count",
            "calculationBy": "entities"
          }
        }
      },
      "relations": {
        "creator": {
          "title": "Creator",
          "target": "_user",
          "required": false,
          "many": false
        },
        "service": {
          "title": "Service",
          "target": "service",
          "required": false,
          "many": false
        },
        "azure_devops_creator": {
          "title": "Creator (ADO)",
          "target": "azureDevopsUser",
          "required": false,
          "many": false
        },
        "azure_devops_reviewers": {
          "title": "Reviewers (ADO)",
          "target": "azureDevopsUser",
          "required": false,
          "many": true
        },
        "repository": {
          "title": "Repository",
          "target": "azureDevopsRepository",
          "required": false,
          "many": false
        },
        "reviewers": {
          "title": "Reviewers",
          "target": "_user",
          "required": false,
          "many": true
        }
      }
    }
    ```

    </details>

    :::caution Properties to create for existing PR blueprint
    If you're updating an existing Azure DevOps pull request blueprint, make sure to add the `cycle_time`, `pr_age_label`, and `days_old` properties if they don't already exist.
    :::

4. Click `Save` to create or update the blueprint.

<h3> Create the Azure DevOps environment blueprint </h3>

1. Go to the [Builder](https://app.getport.io/settings/data-model) page of your portal.
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.
4. Add this JSON schema:

    <details>
    <summary><b>Azure DevOps environment blueprint (click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "azureDevopsEnvironment",
      "title": "AzureDevops Environment",
      "icon": "AzureDevops",
      "schema": {
        "properties": {
          "description": {
            "title": "Description",
            "type": "string",
            "icon": "DefaultProperty",
            "description": "Description of the environment"
          },
          "createdOn": {
            "title": "Created On",
            "type": "string",
            "format": "date-time",
            "icon": "Clock",
            "description": "When the environment was created"
          },
          "lastModifiedOn": {
            "title": "Last Modified On",
            "type": "string",
            "format": "date-time",
            "icon": "Clock",
            "description": "When the environment was last modified"
          }
        },
        "required": []
      },
      "mirrorProperties": {},
      "calculationProperties": {},
      "aggregationProperties": {},
      "relations": {
        "project": {
          "title": "Project",
          "target": "azureDevopsProject",
          "required": true,
          "many": false
        }
      }
    }
    ```

    </details>

5. Click `Save` to create the blueprint.

<h3> Create the Azure DevOps pipeline deployment blueprint </h3>

1. Go to the [Builder](https://app.getport.io/settings/data-model) page of your portal.
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.
4. Add this JSON schema:

    <details>
    <summary><b>Azure DevOps pipeline deployment blueprint (click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "azureDevopsPipelineDeployment",
      "title": "Azure Devops PipelineDeployment",
      "icon": "AzureDevops",
      "schema": {
        "properties": {
          "planType": {
            "title": "Plan Type",
            "type": "string",
            "icon": "DefaultProperty",
            "description": "Type of deployment plan"
          },
          "stageName": {
            "title": "Stage Name",
            "type": "string",
            "icon": "DefaultProperty",
            "description": "Name of the deployment stage"
          },
          "jobName": {
            "title": "Job Name",
            "type": "string",
            "icon": "DefaultProperty",
            "description": "Name of the deployment job"
          },
          "result": {
            "title": "Result",
            "type": "string",
            "icon": "DefaultProperty",
            "description": "Result of the deployment"
          },
          "startTime": {
            "title": "Start Time",
            "type": "string",
            "format": "date-time",
            "icon": "Clock",
            "description": "When the deployment started"
          },
          "finishTime": {
            "title": "Finish Time",
            "type": "string",
            "format": "date-time",
            "icon": "Clock",
            "description": "When the deployment finished"
          }
        },
        "required": []
      },
      "mirrorProperties": {},
      "calculationProperties": {},
      "aggregationProperties": {},
      "relations": {
        "project": {
          "title": "Project",
          "target": "azureDevopsProject",
          "required": true,
          "many": false
        },
        "environment": {
          "title": "Environment",
          "target": "azureDevopsEnvironment",
          "required": true,
          "many": false
        }
      }
    }
    ```

    </details>

5. Click `Save` to create the blueprint.

</TabItem>

</Tabs>

## Update integration mapping

<Tabs groupId="git-provider" queryString defaultValue="github" values={[
  {label: "GitHub", value: "github"},
  {label: "Azure DevOps", value: "azure-devops"}
]}>

<TabItem value="github" label="GitHub">

Now we'll configure the GitHub integration to ingest data into your catalog.

1. Go to your [Data Source](https://app.getport.io/settings/data-sources) page.
2. Select the GitHub integration.
3. Add the following YAML block into the editor to ingest data from GitHub:

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
                pr_age_label: >-
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

</TabItem>

<TabItem value="azure-devops" label="Azure DevOps">

Now we'll configure the Azure DevOps integration to ingest data into your catalog.

1. Go to your [Data Source](https://app.getport.io/settings/data-sources) page.
2. Select the Azure DevOps integration.
3. Add the following YAML block into the editor to ingest data from Azure DevOps:

    <details>
    <summary><b>Azure DevOps integration configuration (click to expand)</b></summary>

    ```yaml showLineNumbers
    resources:
      - kind: project
        selector:
          query: 'true'
          defaultTeam: 'true'
        port:
          entity:
            mappings:
              identifier: .id | gsub(" "; "")
              blueprint: '"azureDevopsProject"'
              title: .name
              properties:
                state: .state
                revision: .revision
                visibility: .visibility
                defaultTeam: .defaultTeam.name
                link: .url | gsub("_apis/projects/"; "")
      - kind: repository
        selector:
          query: 'true'
        port:
          entity:
            mappings:
              identifier: .id
              title: .name
              blueprint: '"azureDevopsRepository"'
              properties:
                url: .remoteUrl
                readme: file://README.md
                id: .id
                last_activity: .project.lastUpdateTime
              relations:
                project: .project.id | gsub(" "; "")
      - kind: repository-policy
        selector:
          query: .type.displayName=="Minimum number of reviewers"
        port:
          entity:
            mappings:
              identifier: .__repository.id
              blueprint: '"azureDevopsRepository"'
              properties:
                minimumApproverCount: .settings.minimumApproverCount
                repository_policy_enabled: .isEnabled
      - kind: repository-policy
        selector:
          query: .type.displayName=="Work item linking"
        port:
          entity:
            mappings:
              identifier: .__repository.id
              blueprint: '"azureDevopsRepository"'
              properties:
                workItemLinking: .isEnabled and .isBlocking
      - kind: user
        selector:
          query: 'true'
        port:
          entity:
            mappings:
              identifier: .id
              title: .user.displayName
              blueprint: '"azureDevopsUser"'
              properties:
                url: .user.url
                email: .user.mailAddress
      - kind: pull-request
        selector:
          query: 'true'
        port:
          entity:
            mappings:
              identifier: .repository.id + "/" + (.pullRequestId | tostring)
              title: .title
              blueprint: '"azureDevopsPullRequest"'
              properties:
                status: .status
                createdAt: .creationDate
                closedDate: .closedDate
                description: .description
                source_branch: .sourceRefName
                source_commit_sha: .lastMergeSourceCommit.commitId
                leadTimeHours: >-
                  (.creationDate as $createdAt | .status as $status | .closedDate as
                  $closedAt | ($createdAt | sub("\\..*Z$"; "Z") |
                  strptime("%Y-%m-%dT%H:%M:%SZ") | mktime) as $createdTimestamp |
                  ($closedAt | if . == null then null else sub("\\..*Z$"; "Z") |
                  strptime("%Y-%m-%dT%H:%M:%SZ") | mktime end) as $closedTimestamp |
                  if $status == "completed" and $closedTimestamp != null then
                  (((($closedTimestamp - $createdTimestamp) / 3600) * 100 | floor) /
                  100) else null end)
                link: .url
                pr_age_label: >-
                  ((now - (.creationDate | sub("\\.[0-9]+Z$"; "Z") |
                  fromdateiso8601)) / 86400 | round) as $age | if $age <= 3 then
                  "0-3 days" elif $age <= 7 then "3-7 days" else ">7 days" end
                cycle_time: >-
                  if .closedDate then (((.closedDate   | sub("\\.[0-9]+Z$"; "Z") |
                  fromdateiso8601) - (.creationDate | sub("\\.[0-9]+Z$"; "Z") |
                  fromdateiso8601)) / 86400 | round) else null end
              relations:
                repository: .repository.id
                service:
                  combinator: '"and"'
                  rules:
                    - operator: '"="'
                      property: '"ado_repository_id"'
                      value: .repository.id
                creator:
                  combinator: '"and"'
                  rules:
                    - operator: '"="'
                      property: '"$identifier"'
                      value: .createdBy.id
                reviewers:
                  combinator: '"and"'
                  rules:
                    - operator: '"in"'
                      property: '"$identifier"'
                      value: '[.reviewers[].id]'
                azure_devops_reviewers: '[.reviewers[].id]'
                azure_devops_creator: .createdBy.id
      - kind: environment
        selector:
          query: 'true'
        port:
          entity:
            mappings:
              identifier: .project.id + "/" + (.id | tostring) | gsub(" "; "")
              title: .name | tostring
              blueprint: '"azureDevopsEnvironment"'
              properties:
                description: .description
                createdOn: .createdOn
                lastModifiedOn: .lastModifiedOn
              relations:
                project: .project.id
      - kind: pipeline-deployment
        selector:
          query: 'true'
        port:
          entity:
            mappings:
              identifier: >-
                .__project.id + "/" + (.environmentId | tostring) + "/" + (.id |
                tostring) | gsub(" "; "")
              title: .requestIdentifier | tostring
              blueprint: '"azureDevopsPipelineDeployment"'
              properties:
                planType: .planType
                stageName: .stageName
                jobName: .jobName
                result: .result
                startTime: .startTime
                finishTime: .finishTime
              relations:
                project: .__project.id | gsub(" "; "")
                environment: .__project.id + "/" + (.environmentId | tostring) | gsub(" "; "")
    ```

    </details>

4. Click `Save & Resync` to apply the mapping.

</TabItem>

</Tabs>

## Configure AI agent

To help Platform Engineering teams understand and improve software delivery flow using engineering signals stored in Port's Context Lake, we'll configure an AI agent that provides data-driven insights and actionable recommendations.

<img src="/img/guides/eif-delivery-perf-ai-agent.png" border="1px" width="100%" />

1. Go to the [AI Agents](https://app.getport.io/_ai_agents) page of your portal.
2. Click on `+ AI Agent`.
3. Toggle `Json mode` on.
4. Copy and paste the following JSON configuration:

    <details>
    <summary><b>Delivery Performance Agent configuration (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "delivery_performance_agent",
      "title": "Delivery Performance Agent",
      "icon": "Details",
      "team": [],
      "properties": {
        "status": "active",
        "tools": [
          "^(list|get|search|track|describe)_.*"
        ],
        "prompt": "You're the Delivery Performance Agent.\nYour purpose is to help Platform Engineering understand and improve software delivery flow using engineering signals stored in Port's Context Lake. You provide accurate, data-driven insights and actionable recommendations that make flow improvements visible, prioritised, and easy to act on.\nAvailable Data\nUse any relevant blueprints and properties available in the Context Lake (for example: Pull Requests, Repositories, Domains, Services, Workflow Runs, Deployments, Teams, or future signals).\n Do not assume a fixed schema. Use only available data.\nYour Task\nInterpret the user's question and determine the appropriate scope (single metric, comparison, trend, ranking, root cause, or systemic pattern).\n\n\nRetrieve and analyse relevant flow signals, such as:\n\n\nLead time, cycle time, throughput\n\n\nReview wait time, PR aging, stalled or stale PRs\n\n\nWorkflow stability and CI reliability\n\n\nVolume and trend changes over time\n\n\nProvide clear, concise insights that directly answer the question.\n\n\nWhen improvement opportunities exist, include recommendations in a structured table.\n\n\nHow to Think\nStay objective and data-based.\n\n\nPrefer organisational and structural patterns over individual examples.\n\n\nAdapt depth to the scope (team, domain, service, or organisation).\n\n\nAvoid speculation; rely only on available signals.\n\n\nIf the question is unclear, ask one targeted follow-up.\n\n\nOutput Format (only top 10 findings)\nDirect Answer\nShort, precise response to the question.\nSupporting Insights\nKey data patterns or trends explaining the outcome.\nRecommendations (Table)\nInclude when relevant:\nRecommendation\nPriority\nExpected Impact\nImplementation Complexity\nRelated Entities\nActionable improvement\nHigh / Medium / Low\nImpact on flow, speed, or predictability\nLow / Medium / High\nURLs to relevant entities if available (otherwise N/A)\n\nRelevant Port Guides (Optional)\nWhen applicable, reference one or more Port guides that help implement the recommendation (for example: scorecards, dashboards, automation, or data model setup).\nInclude only guides that are directly actionable; if none are relevant, omit this section.\nBe concise, accurate, and aligned with Engineering Intelligence principles: flow, visibility, platform foundations, and actionable clarity.\n",
        "execution_mode": "Automatic",
        "conversation_starters": [
          "What needs attention right now?",
          "What are the top 3 actions we should take to improve PR throughput?",
          "Which three top issues should we resolve for the quickest wins to improve delivery speed?",
          "What best practices are top-performing teams using to improve software delivery?"
        ],
        "model": ""
      },
      "relations": {}
    }
    ```

    </details>

5. Click on `Create` to save the agent.

<MCPCapabilitiesHint/>


## Visualize metrics

Once the data is synced, we can create a dedicated dashboard in Port to monitor and analyze delivery performance using customizable widgets.

### Create a dashboard

1. Navigate to your [software catalog](https://app.getport.io/organization/catalog).
2. Click on the **`+ New`** button in the left sidebar.
3. Select **New dashboard**.
4. Name the dashboard **Delivery Performance**.
5. Click `Create`.

We now have a blank dashboard where we can start adding widgets to visualize delivery performance metrics.

### Add widgets

<Tabs groupId="git-provider" queryString defaultValue="github" values={[
  {label: "GitHub", value: "github"},
  {label: "Azure DevOps", value: "azure-devops"}
]}>

<TabItem value="github" label="GitHub">

In the new dashboard, create the following widgets:

<details>
<summary><b>Delivery Performance Agent (click to expand)</b></summary>

1. Click **`+ Widget`** and select **AI Agent**.
2. Title: `Delivery Performance Agent`.
3. Choose the **Delivery Performance Agent** we created earlier.
4. Click **Save**.

</details>

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
<summary><b>PR age distribution (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Pie chart**.
2. Title: `PR Age Distribution`.
3. Description: `0–3 days | 3–7 days | >7 days`.
4. Choose the **Pull Request** blueprint.
5. Under `Breakdown by property`, select the **PR Age** property.
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

</TabItem>

<TabItem value="azure-devops" label="Azure DevOps">

In the new dashboard, create the following widgets:

<details>
<summary><b>Delivery Performance Agent (click to expand)</b></summary>

1. Click **`+ Widget`** and select **AI Agent**.
2. Title: `Delivery Performance Agent`.
3. Choose the **Delivery Performance Agent** we created earlier.
4. Click **Save**.

</details>

<details>
<summary><b>PR throughput (weekly avg) (click to expand)</b></summary>

1. Click `+ Widget` and select **Number Chart**.
2. Title: `PR Throughput (Weekly Avg)`.
3. Description: `Average pull requests completed in the past 30 days`.
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
          "value": "completed",
          "property": "status",
          "operator": "="
        },
        {
          "property": "closedDate",
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
4. Input `PR completed` as the **Y axis** **Title**.
5. Select `count` for the **Function**.
6. Add this JSON to the **Additional filters** editor:

    ```json showLineNumbers
    {
      "combinator": "and",
      "rules": [
        {
          "value": "completed",
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
          "value": "completed",
          "property": "status",
          "operator": "="
        },
        {
          "property": "closedDate",
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
          "value": "completed",
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
3. Select `Count entities` **Chart type** and choose **Azure Devops PipelineDeployment** as the **Blueprint**.
4. Select `count` for the **Function**.
5. Add this JSON to the **Dataset** editor:

    ```json showLineNumbers
    {
      "combinator": "and",
      "rules": [
        {
          "value": "succeeded",
          "property": "result",
          "operator": "="
        }
      ]
    }
    ```
6. Select `custom` as the **Unit** and input `deployments` as the **Custom unit**.
7. Click `Save`.

</details>

<details>
<summary><b>Deployment frequency (weekly trend) (click to expand)</b></summary>

1. Click `+ Widget` and select **Line Chart**.
2. Title: `Deployment Frequency (Weekly Trend)`.
3. Select `Count Entities (All Entities)` **Chart type** and choose **Azure Devops PipelineDeployment** as the **Blueprint**.
4. Input `Deployments` as the **Y axis** **Title**.
5. Select `count` for the **Function**.
6. Add this JSON to the **Additional filters** editor:

    ```json showLineNumbers
    {
      "combinator": "and",
      "rules": [
        {
          "value": "succeeded",
          "property": "result",
          "operator": "="
        }
      ]
    }
    ```
7. Input `Date` as the **X axis** **Title**.
8. Select `startTime` for **Measure time by**.
9. Set **Time Interval** to `week` and **Time Range** to `In the past 30 days`.
10. Click `Save`.

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
          "value": "active",
          "property": "status",
          "operator": "="
        },
        {
          "value": 3,
          "property": "days_old",
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
<summary><b>PR age distribution (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Pie chart**.
2. Title: `PR Age Distribution`.
3. Description: `0–3 days | 3–7 days | >7 days`.
4. Choose the **Pull Request** blueprint.
5. Under `Breakdown by property`, select the **PR Age** property.
6. Add this JSON to the **Additional filters** editor:

    ```json showLineNumbers
    {
      "combinator": "and",
      "rules": [
        {
          "value": "active",
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
          "value": "active",
          "property": "status",
          "operator": "="
        },
        {
          "value": 3,
          "property": "days_old",
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
    - **Days Old**: The age of the pull request in days.
8. Click on the **save icon** in the top right corner of the widget to save the customized table.

</details>

</TabItem>

</Tabs>

## Related guides

- [Measure delivery reliability and stability](https://docs.port.io/guides/all/measure-reliability-and-stability/)
- [Track standards adherence](https://docs.port.io/guides/all/measure-standards/)
