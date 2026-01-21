---
displayed_sidebar: null
description: Learn how to measure reliability and stability of your delivery pipeline by tracking workflow failure rates and PRs blocked by failing CI/CD using Port's GitHub integration.
---

import MCPCapabilitiesHint from '/docs/guides/templates/ai/_mcp_capabilities_hint.mdx'
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Measure delivery reliability and stability

Measuring delivery reliability and stability provides visibility into how consistently software changes move from commit to production, and where breakdowns disrupt engineering flow. By making failures, delays, and recovery patterns observable, teams can distinguish isolated issues from systemic instability that affects delivery outcomes.

Without this visibility, workflow failures and CI/CD friction are treated as one-off incidents rather than recurring signals, making it difficult to prioritize improvements, reduce delivery risk, and sustain predictable throughput as the organization scales.

This guide helps engineering managers, platform engineers, and product leaders answer questions such as:

- **Workflow failures**: How often do CI/CD workflows fail, and where do failures concentrate?
- **Bottlenecks**: Which workflows or services have the highest failure rates?
- **Impact on delivery**: How frequently do failing workflows block pull requests and slow down delivery?

By the end of this guide, you'll have a working dashboard that tracks key reliability and stability metrics, enabling you to identify unstable workflows, measure the impact of failures on delivery, and prioritize improvements to your CI/CD infrastructure.

:::tip AI-powered insights
This guide includes configuration for a **Reliability Agent** that provides AI-powered insights into your system reliability and resilience. Ask natural language questions like "What needs attention right now?" or "What are the top 3 actions we should take to improve MTTR?" and receive data-driven recommendations that connect delivery behavior to production outcomes.
:::

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
- Port's [GitHub integration](/build-your-software-catalog/sync-data-to-catalog/git/github/) or [Azure DevOps integration](/build-your-software-catalog/sync-data-to-catalog/git/azure-devops/) is installed in your account.

:::tip Initial scope

This guide focuses on measuring reliability and stability using source control management (SCM) data, including repositories, pull requests, and workflows. This guide supports GitHub and Azure DevOps, with GitLab support coming soon. This is the first iteration of reliability and stability measurement and will expand in future versions to include additional metrics and data sources such as monitoring tools, and other operational signals.
:::

## Key metrics overview

We will track three key metrics to measure reliability and stability:

| Metric | What it measures | Why it matters |
|--------|------------------|----------------|
| **Workflow failure rate** | How often CI/CD workflows fail and where failures occur | Identifies unstable workflows and services that need attention, helping prioritize infrastructure improvements |
| **PRs blocked by failing CI/CD** | Number of pull requests blocked by failed workflow runs | Shows the direct impact of CI/CD failures on delivery velocity and helps quantify the cost of instability |
| **CI/CD failure concentration** | Distribution of CI/CD failures across workflows, services, or repos | Helps to identify recurring failure patterns and prioritise the most important issues to fix |

## Set up data model

We will create blueprints to model your workflow data. The `githubPullRequest` and `githubRepository` blueprints should already exist from the GitHub integration installation, or the `azureDevopsPullRequest` and `azureDevopsRepository` blueprints should already exist from the Azure DevOps integration installation.

<Tabs groupId="git-provider" queryString defaultValue="github" values={[
  {label: "GitHub", value: "github"},
  {label: "Azure DevOps", value: "azure-devops"}
]}>

<TabItem value="github" label="GitHub">

<h3> Create the GitHub workflow blueprint </h3>

1. Go to the [Builder](https://app.getport.io/settings/data-model) page of your portal.
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.
4. Add this JSON schema:

    <details>
    <summary><b>GitHub workflow blueprint (click to expand)</b></summary>

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

<h3> Create the GitHub workflow run blueprint </h3>

1. Go to the [Builder](https://app.getport.io/settings/data-model) page of your portal.
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.
4. Add this JSON schema:

    <details>
    <summary><b>GitHub workflow run blueprint (click to expand)</b></summary>

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

<h3> Create the workflow state blueprint </h3>

1. Go to the [Builder](https://app.getport.io/settings/data-model) page of your portal.
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.
4. Add this JSON schema:

    <details>
    <summary><b>Workflow state blueprint (click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "workflow_state",
      "description": "Tracks the current status of the last triggered workflow",
      "title": "Workflow State",
      "icon": "Pipeline",
      "schema": {
        "properties": {
          "status": {
            "type": "string",
            "title": "Status"
          },
          "result": {
            "type": "string",
            "title": "Result"
          },
          "last_triggered_at": {
            "type": "string",
            "title": "Last Triggered At",
            "format": "date-time"
          },
          "scim": {
            "type": "string",
            "title": "SCIM",
            "description": "Source of the workflow such as GitHub, Azure Devops, GitLab"
          },
          "link": {
            "type": "string",
            "title": "Link",
            "format": "url"
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

<h3> Create the Azure DevOps build blueprint </h3>

1. Go to the [Builder](https://app.getport.io/settings/data-model) page of your portal.
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.
4. Add this JSON schema:

    <details>
    <summary><b>Azure DevOps build blueprint (click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "azureDevopsBuild",
      "title": "Azure Devops Build",
      "icon": "AzureDevops",
      "schema": {
        "properties": {
          "status": {
            "type": "string",
            "title": "Status"
          },
          "result": {
            "type": "string",
            "title": "Result"
          },
          "queueTime": {
            "type": "string",
            "format": "date-time",
            "title": "Queue Time"
          },
          "startTime": {
            "type": "string",
            "format": "date-time",
            "title": "Start Time"
          },
          "finishTime": {
            "type": "string",
            "format": "date-time",
            "title": "Finish Time"
          },
          "definitionName": {
            "type": "string",
            "title": "Definition Name"
          },
          "requestedFor": {
            "type": "string",
            "title": "Requested For"
          },
          "link": {
            "type": "string",
            "format": "url",
            "title": "Link"
          },
          "reason": {
            "type": "string",
            "title": "Reason"
          }
        },
        "required": []
      },
      "mirrorProperties": {
        "repository": {
          "title": "Repository",
          "path": "repository.$title"
        }
      },
      "calculationProperties": {},
      "aggregationProperties": {},
      "relations": {
        "project": {
          "title": "Project",
          "target": "azureDevopsProject",
          "required": true,
          "many": false
        },
        "repository": {
          "title": "Repository",
          "target": "azureDevopsRepository",
          "required": false,
          "many": false
        },
        "pull_request": {
          "title": "Pull Request",
          "target": "azureDevopsPullRequest",
          "required": false,
          "many": true
        }
      }
    }
    ```

    </details>

5. Click `Save` to create the blueprint.

<h3> Create the workflow state blueprint </h3>

1. Go to the [Builder](https://app.getport.io/settings/data-model) page of your portal.
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.
4. Add this JSON schema:

    <details>
    <summary><b>Workflow state blueprint (click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "workflow_state",
      "description": "Tracks the current status of the last triggered workflow",
      "title": "Workflow State",
      "icon": "Pipeline",
      "schema": {
        "properties": {
          "status": {
            "type": "string",
            "title": "Status"
          },
          "result": {
            "type": "string",
            "title": "Result"
          },
          "last_triggered_at": {
            "type": "string",
            "title": "Last Triggered At",
            "format": "date-time"
          },
          "scim": {
            "type": "string",
            "title": "SCIM",
            "description": "Source of the workflow such as GitHub, Azure Devops, GitLab"
          },
          "link": {
            "type": "string",
            "title": "Link",
            "format": "url"
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

</TabItem>

</Tabs>

## Update integration mapping

<Tabs groupId="git-provider" queryString defaultValue="github" values={[
  {label: "GitHub", value: "github"},
  {label: "Azure DevOps", value: "azure-devops"}
]}>

<TabItem value="github" label="GitHub">

Now we'll configure the GitHub integration to ingest workflow and workflow run data into your catalog. If you already have existing mappings for repositories and pull requests, make sure to include the workflow and workflow-run kinds.

:::caution Branch property required
For the workflow run to pull request relation to work correctly, ensure your `githubPullRequest` blueprint has a `branch` property. If it doesn't exist, add it to the blueprint schema as a string property. The mapping below includes the `branch` property in the pull request mapping.
:::

1. Go to your [Data Source](https://app.getport.io/settings/data-sources) page.
2. Select the GitHub integration.
3. Add or update the following YAML block in the editor to ingest data from GitHub:

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
                pullRequests: if (.pull_requests | length) > 0 then (.pull_requests | map(.id)) else null end
      - kind: workflow-run
        selector:
          query: 'true'
        port:
          entity:
            mappings:
              identifier: .repository.full_name + (.workflow_id|tostring)
              title: .repository.full_name + (.workflow_id|tostring)
              blueprint: '"workflow_state"'
              properties:
                status: .status
                result: .conclusion
                last_triggered_at: .run_started_at
                scim: '"GitHub"'
                link: .html_url
    ```

    </details>

:::tip Existing mappings
If you already have mappings for repositories and pull requests, make sure to add the `workflow` and `workflow-run` kinds to your existing configuration. The mapping above includes all required kinds for this guide.
:::

4. Click `Save & Resync` to apply the mapping.

</TabItem>

<TabItem value="azure-devops" label="Azure DevOps">

Now we'll configure the Azure DevOps integration to ingest build and deployment data into your catalog. If you already have existing mappings for repositories and pull requests, make sure to include the build kind.

1. Go to your [Data Source](https://app.getport.io/settings/data-sources) page.
2. Select the Azure DevOps integration.
3. Add the following YAML blocks to your existing mapping configuration:

    <details>
    <summary><b>Azure DevOps integration configuration additions (click to expand)</b></summary>

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
      - kind: build
        selector:
          query: 'true'
        port:
          entity:
            mappings:
              identifier: .__project.id + "/" + (.id | tostring) | gsub(" "; "")
              title: .buildNumber
              blueprint: '"azureDevopsBuild"'
              properties:
                status: .status
                result: .result
                queueTime: .queueTime
                startTime: .startTime
                finishTime: .finishTime
                reason: .reason
                definitionName: .definition.name
                requestedFor: .requestedFor.displayName
                link: ._links.web.href
              relations:
                project: .__project.id | gsub(" "; "")
                repository: .repository.id
                pull_request:
                  combinator: '"and"'
                  rules:
                    - operator: '"="'
                      property: '"source_commit_sha"'
                      value: .sourceVersion
      - kind: build
        selector:
          query: 'true'
        port:
          entity:
            mappings:
              identifier: .repository.name + "/" + (.definition.id | tostring) | gsub(" "; "")
              title: .repository.name + "/" + (.definition.id | tostring) | gsub(" "; "")
              blueprint: '"workflow_state"'
              properties:
                status: .status
                result: .result
                last_triggered_at: .startTime
                scim: '"Azure Devops"'
                link: .definition.url
    ```

    </details>

    :::tip Existing mappings
    If you already have mappings for repositories and pull requests, make sure to add the `build` kind to your existing configuration. The mapping above includes all required kinds for this guide.
    :::

4. Click `Save & Resync` to apply the mapping.

</TabItem>

</Tabs>

## Configure AI agent

To help Platform Engineering teams understand, assess, and improve the reliability and resilience of software systems using operational and delivery signals stored in Port's Context Lake, we'll configure an AI agent that provides objective insights and prioritized, actionable recommendations.

<img src="/img/guides/eif-reliability-ai-agent.png" border="1px" width="100%" />

1. Go to the [AI Agents](https://app.getport.io/_ai_agents) page of your portal.
2. Click on `+ AI Agent`.
3. Toggle `Json mode` on.
4. Copy and paste the following JSON configuration:

    <details>
    <summary><b>Reliability Agent configuration (click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "reliability_agent",
      "title": "Reliability Agent",
      "icon": "Details",
      "team": [],
      "properties": {
        "description": "AI agent to provide insights about workflow reliability",
        "status": "active",
        "tools": [
          "^(list|get|search|track|describe)_.*"
        ],
        "prompt": "You are the Reliability Insights Agent.\n\nYour purpose is to help Platform Engineering understand, assess, and improve the reliability and resilience of software systems using operational and delivery signals stored in Port's Context Lake. You provide objective insights and prioritised, actionable recommendations that reduce risk, improve stability, and increase confidence in production systems.\n\nAvailable Data\n\nUse any relevant blueprints and properties available in the Context Lake (for example: Services, Repositories, Deployments, Workflow Runs, Incidents, Alerts, Environments, SLOs, Error Rates, and future reliability signals).\nDo not assume a fixed schema. Use only available data.\n\nYour Task\n\nInterpret the user's question and determine scope (service, domain, environment, or organisation).\n\nAnalyse reliability signals such as:\n\nDeployment success and rollback rates\n\nChange failure rate and incident correlation\n\nMTTR, incident frequency, and recovery patterns\n\nCI/CD reliability, flaky workflows, and failed checks\n\nError trends, availability, and SLO/SLA adherence\n\nSurface risk patterns, regressions, and systemic weaknesses.\n\nWhen improvement opportunities exist, include recommendations in a structured table.\n\nHow to Think\n\nBe data-driven and risk-aware.\n\nPrefer systemic patterns over one-off incidents.\n\nConnect delivery behaviour to production outcomes.\n\nAvoid speculation; rely only on available signals.\n\nIf the question is unclear, ask one targeted follow-up.\n\nOutput Format\n\nDirect Answer\nShort, factual response focused on reliability or risk.\n\nSupporting Insights\nKey patterns, trends, or correlations explaining the reliability posture.\n\nRecommendations (Table)\nInclude when relevant:\n\nRecommendation\tPriority\tExpected Impact\tImplementation Complexity\tRelated Entities\nActionable reliability improvement\tHigh / Medium / Low\tReduced failures, faster recovery, higher stability\tLow / Medium / High\tURLs to relevant entities if available (otherwise N/A)\n\nRelevant Port Guides (Optional)\nWhen applicable, reference Port guides that help implement the recommendation (for example: scorecards, reliability dashboards, automation, or guardrails).\nInclude only guides that are directly actionable; omit if none apply.\n\nBe concise, accurate, and aligned with Engineering Intelligence principles: reliability, risk visibility, platform guardrails, and actionable clarity.",
        "execution_mode": "Approval Required",
        "conversation_starters": [
          "What needs attention right now?",
          "What are the top 3 actions we should take to improve MTTR?",
          "What are the top recurring reliability issues?",
          "What single improvement will give us the biggest reliability gain?"
        ]
      },
      "relations": {}
    }
    ```

    </details>

5. Click on `Create` to save the agent.

<MCPCapabilitiesHint/>

## Visualize metrics

Once the data is synced, we can create a dedicated dashboard in Port to monitor and analyze reliability and stability metrics using customizable widgets.

### Create a dashboard

1. Navigate to your [software catalog](https://app.getport.io/organization/catalog).
2. Click on the **`+ New`** button in the left sidebar.
3. Select **New dashboard**.
4. Name the dashboard **Reliability**.
5. Click `Create`.

We now have a blank dashboard where we can start adding widgets to visualize reliability and stability metrics.

### Add widgets

<Tabs groupId="git-provider" queryString defaultValue="github" values={[
  {label: "GitHub", value: "github"},
  {label: "Azure DevOps", value: "azure-devops"}
]}>

<TabItem value="github" label="GitHub">

In the new dashboard, create the following widgets:

<details>
<summary><b>Reliability Agent (click to expand)</b></summary>

1. Click **`+ Widget`** and select **AI Agent**.
2. Title: `Reliability Agent`.
3. Choose the **Reliability Agent** we created earlier.
4. Click **Save**.

</details>

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
3. Select `Count entities` **Chart type** and choose **Pull Request** as the **Blueprint**.
4. Select `count` for the **Function**.
5. Add this JSON to the **Dataset filter** editor:

    ```json showLineNumbers
    {
      "combinator": "and",
      "rules": [
        {
          "value": 1,
          "property": "failedWorkflowsCount",
          "operator": ">="
        },
        {
          "value": "open",
          "property": "status",
          "operator": "="
        }
      ]
    }
    ```

6. Select `custom` as the **Unit** and input `prs` as the **Custom unit**.
7. Click `Save`.

</details>

<details>
<summary><b>Workflow states (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Table**.
2. Title the widget **Workflow States**.
3. Choose the **Workflow State** blueprint.
4. Add this JSON to the **Initial filters** editor:

    ```json showLineNumbers
    {
      "combinator": "and",
      "rules": [
        {
          "value": "GitHub",
          "property": "scim",
          "operator": "="
        }
      ]
    }
    ```

5. Click **Save** to add the widget to the dashboard.
6. Click on the **`...`** button in the top right corner of the table and select **Customize table**.
7. In the top right corner of the table, click on `Manage Properties` and add the following properties:
    - **Title**: The workflow name.
    - **Status**: The current status of the workflow.
    - **Result**: The result of the last run.
    - **Last Triggered At**: When the workflow was last triggered.
    - **Link**: The URL to the workflow definition.
8. Click on the **save icon** in the top right corner of the widget to save the customized table.

</details>

</TabItem>

<TabItem value="azure-devops" label="Azure DevOps">

In the new dashboard, create the following widgets:

<details>
<summary><b>Reliability Agent (click to expand)</b></summary>

1. Click **`+ Widget`** and select **AI Agent**.
2. Title: `Reliability Agent`.
3. Choose the **Reliability Agent** we created earlier.
4. Click **Save**.

</details>

<details>
<summary><b>Workflow failure rate (last 7 days) (click to expand)</b></summary>

1. Click `+ Widget` and select **Number Chart**.
2. Title: `Workflow Failure Rate (Last 7 Days)`.
3. Description: `Total number of failed builds in the past week`.
4. Select `Count entities` **Chart type** and choose **Azure Devops Build** as the **Blueprint**.
5. Select `count` for the **Function**.
6. Add this JSON to the **Dataset filter** editor:

    ```json showLineNumbers
    {
      "combinator": "and",
      "rules": [
        {
          "value": "failed",
          "property": "result",
          "operator": "="
        },
        {
          "property": "startTime",
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
3. Description: `Weekly trend of failed builds over the past 30 days`.
4. Select `Count Entities (All Entities)` **Chart type** and choose **Azure Devops Build** as the **Blueprint**.
5. Input `# Failed Workflows` as the **Y axis** **Title**.
6. Select `count` for the **Function**.
7. Add this JSON to the **Additional filters** editor:

    ```json showLineNumbers
    {
      "combinator": "and",
      "rules": [
        {
          "value": "failed",
          "property": "result",
          "operator": "="
        }
      ]
    }
    ```

8. Input `Date` as the **X axis** **Title**.
9. Select `startTime` for **Measure time by**.
10. Set **Time Interval** to `week` and **Time Range** to `In the past 30 days`.
11. Click `Save`.

</details>

<details>
<summary><b>Workflow runs with most failures (last 7 days) (click to expand)</b></summary>

1. Click `+ Widget` and select **Bar Chart**.
2. Title: `Workflow Runs with Most Failures (Last 7 Days)`.
3. Description: `Build definitions with the highest number of failures in the past week`.
4. Choose the **Azure Devops Build** blueprint.
5. Under `Breakdown by property`, select the **Definition Name** property.
6. Add this JSON to the **Additional filters** editor:

    ```json showLineNumbers
    {
      "combinator": "and",
      "rules": [
        {
          "value": "failed",
          "property": "result",
          "operator": "="
        },
        {
          "property": "startTime",
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
3. Description: `Distribution of failed builds by repository in the past week`.
4. Choose the **Azure Devops Build** blueprint.
5. Under `Breakdown by property`, select the **Repository** property (this is a mirror property from the build relation).
6. Add this JSON to the **Additional filters** editor:

    ```json showLineNumbers
    {
      "combinator": "and",
      "rules": [
        {
          "value": "failed",
          "property": "result",
          "operator": "="
        },
        {
          "property": "startTime",
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
3. Select `Count entities` **Chart type** and choose **Pull Request** as the **Blueprint**.
4. Select `count` for the **Function**.
5. Add this JSON to the **Dataset filter** editor:

    ```json showLineNumbers
    {
      "combinator": "and",
      "rules": [
        {
          "value": 1,
          "property": "failedWorkflowsCount",
          "operator": ">="
        },
        {
          "value": "active",
          "property": "status",
          "operator": "="
        }
      ]
    }
    ```

6. Select `custom` as the **Unit** and input `prs` as the **Custom unit**.
7. Click `Save`.

</details>

<details>
<summary><b>Workflow states (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Table**.
2. Title the widget **Workflow States**.
3. Choose the **Workflow State** blueprint.
4. Add this JSON to the **Initial filters** editor:

    ```json showLineNumbers
    {
      "combinator": "and",
      "rules": [
        {
          "value": "Azure Devops",
          "property": "scim",
          "operator": "="
        }
      ]
    }
    ```

5. Click **Save** to add the widget to the dashboard.
6. Click on the **`...`** button in the top right corner of the table and select **Customize table**.
7. In the top right corner of the table, click on `Manage Properties` and add the following properties:
    - **Title**: The workflow name.
    - **Status**: The current status of the workflow.
    - **Result**: The result of the last run.
    - **Last Triggered At**: When the workflow was last triggered.
    - **Link**: The URL to the workflow definition.
8. Click on the **save icon** in the top right corner of the widget to save the customized table.

</details>

</TabItem>

</Tabs>

## Related guides

- [Gain visibility into delivery performance](/guides/all/measure-and-track-delivery-performance)
- [Visualize and manage GitHub deployments](/guides/all/visualize-and-manage-github-deployments)
- [Visualize your GitHub Dependabot alerts](/guides/all/visualize-your-github-dependabot-alerts)
