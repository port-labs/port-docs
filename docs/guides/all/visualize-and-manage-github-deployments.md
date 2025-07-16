---
displayed_sidebar: null
description: Learn how to monitor and manage your GitHub deployments using dashboards and self-service actions in Port.
---

# Visualize and manage your GitHub deployments

This guide demonstrates how to bring your GitHub deployment experience into Port.  
You will learn how to:

- Ingest GitHub workflow run data into Port's software catalog using **Port's GitHub** integration.
- Set up **self-service actions** to manage deployments (trigger, retry, and cancel).
- Build **dashboards** in Port to monitor and take action on your GitHub deployments.

<img src="/img/guides/githubDeploymentDashboard1.png" border="1px" width="100%" />
<img src="/img/guides/githubDeploymentDashboard2.png" border="1px" width="100%" />


## Common use cases

- Monitor the status and health of all GitHub deployments across accounts from a single dashboard.
- Empower platform teams to automate day-2 operations via webhooks.


## Prerequisites

This guide assumes the following:
- You have a Port account and have completed the [onboarding process](https://docs.port.io/getting-started/overview).
- Port's [GitHub integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/git/github/) is installed in your account.


## Set up data model

The `GitHub Workflow` and `GitHub Workflow Run` blueprints are not created automatically when installing the GitHub integration, so we will need to create them manually.

### Create the GitHub workflow blueprint

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
          }
        },
        "required": []
      },
      "mirrorProperties": {},
      "calculationProperties": {},
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
          }
        },
        "required": []
      },
      "mirrorProperties": {},
      "calculationProperties": {},
      "relations": {
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


### Update the integration mapping

1. Go to the [Data Sources](https://app.getport.io/settings/data-sources) page of your portal.
2. Select the GitHub integration.
3. Add the following YAML block into the editor to ingest workflows and workflow runs from your GitHub account:

    <details>
    <summary><b>GitHub integration configuration (Click to expand)</b></summary>

    ```yaml showLineNumbers
    deleteDependentEntities: true
    createMissingRelatedEntities: true
    enableMergeEntity: true
    resources:
      - kind: repository
        selector:
          query: "true"
        port:
          entity:
            mappings:
              identifier: .name
              title: .name
              blueprint: '"service"'
              properties:
                readme: file://README.md
                url: .html_url
                defaultBranch: .default_branch
      - kind: workflow
        selector:
          query: 'true'
        port:
          entity:
            mappings:
              identifier: .repo + (.id|tostring)
              title: .name
              blueprint: '"githubWorkflowApp"'
              properties:
                path: .path
                status: .state
                createdAt: .created_at
                updatedAt: .updated_at
                link: .html_url
              relations:
                repository: .repo
      - kind: workflow-run
        selector:
          query: "true"
        port:
          entity:
            mappings:
              identifier: .repository.name + "/" + (.id|tostring)
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
                deletedAt: .deleted_at
                runNumber: .run_number
                runAttempt: .run_attempt
                link: .html_url
              relations:
                workflow: .repository.name + (.workflow_id|tostring)
    ```
    </details>
    
4. Click `Save & Resync` to apply the mapping.


## Set up self-service actions

We will create self-service actions in Port to directly interact with the GitHub API using webhooks. These actions let users:

1. Trigger a new workflow run.

2. Re-run failed or cancelled workflow runs.

3. Cancel a running workflow run.

To implement these use-cases, follow the steps below:


### Add Port secrets

To add a secret to your portal:

1. Click on the `...` button in the top right corner of your Port application.

2. Click on **Credentials**.

3. Click on the `Secrets` tab.

4. Click on `+ Secret` and add the following secrets:
`_GITHUB_TOKEN`: A GitHub personal access token with **fine-grained access tokens** for "Actions" repository permissions (write). This permission is required to execute all three actions (trigger, re-run, and cancel workflow runs). To obtain this token, [see the GitHub documentation](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token).


### Trigger a new workflow run

1. Go to the [Self-service](https://app.getport.io/self-serve) page of your portal.
2. Click on the `+ New Action` button.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration into the editor.

    <details>
    <summary><b>Trigger a new workflow run action (Click to expand)</b></summary>

    :::caution Replace GitHub Organization
    Make sure to replace `<YOUR_GITHUB_ORG>` with your actual GitHub organization name in the webhook URL.
    :::

    ```json showLineNumbers
    {
      "identifier": "trigger_workflow_run",
      "title": "Trigger Workflow Run",
      "icon": "Github",
      "description": "Triggers a GitHub workflow run in the specified repository",
      "trigger": {
        "type": "self-service",
        "operation": "DAY-2",
        "userInputs": {
          "properties": {
            "environment": {
              "icon": "DefaultProperty",
              "title": "Environment",
              "type": "string",
              "default": "test",
              "enum": [
                "test",
                "staging",
                "production"
              ],
              "enumColors": {
                "test": "lightGray",
                "staging": "lightGray",
                "production": "lightGray"
              }
            }
          },
          "required": [],
          "order": [
            "environment"
          ]
        },
        "blueprintIdentifier": "githubWorkflow"
      },
      "invocationMethod": {
        "type": "WEBHOOK",
        "url": "https://api.github.com/repos/<YOUR_GITHUB_ORG>/{{ .entity.relations.repository }}/actions/workflows/{{ .entity.properties.path | split(\"/\")[-1] }}/dispatches",
        "agent": false,
        "synchronized": true,
        "method": "POST",
        "headers": {
          "Accept": "application/vnd.github+json",
          "Authorization": "Bearer {{ .secrets._GITHUB_TOKEN }}",
          "X-GitHub-Api-Version": "2022-11-28",
          "Content-Type": "application/json"
        },
        "body": {
          "ref": "main",
          "inputs": {
            "environment": "{{ .inputs.environment }}"
          }
        }
      },
      "requiredApproval": false
    }
    ```
    </details>

5. Click `Save`.

Now you should see the `Trigger Workflow Run` action in the self-service page. 🎉


### Re-run workflow runs

1. Go to the [Self-service](https://app.getport.io/self-serve) page of your portal.
2. Click on the `+ New Action` button.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration into the editor.

    <details>
    <summary><b>Re-run workflow runs action (Click to expand)</b></summary>

    :::caution Replace GitHub Organization
    Make sure to replace `<YOUR_GITHUB_ORG>` with your actual GitHub organization name in the webhook URL.
    :::

    ```json showLineNumbers
    {
      "identifier": "rerun_workflow_run",
      "title": "Re-run Workflow Run",
      "icon": "Pipeline",
      "description": "Re-run failed or cancelled workflow runs",
      "trigger": {
        "type": "self-service",
        "operation": "DAY-2",
        "userInputs": {
          "properties": {},
          "required": [],
          "order": []
        },
        "condition": {
          "type": "SEARCH",
          "rules": [
            {
              "property": "conclusion",
              "operator": "in",
              "value": [
                "failure",
                "cancelled"
              ]
            }
          ],
          "combinator": "and"
        },
        "blueprintIdentifier": "githubWorkflowRun"
      },
      "invocationMethod": {
        "type": "WEBHOOK",
        "url": "https://api.github.com/repos/<YOUR_GITHUB_ORG>/{{ .entity.identifier | split(\"/\")[0] }}/actions/runs/{{ .entity.identifier | split(\"/\")[-1] }}/rerun-failed-jobs",
        "agent": false,
        "synchronized": true,
        "method": "POST",
        "headers": {
          "Accept": "application/vnd.github+json",
          "Authorization": "Bearer {{ .secrets._GITHUB_TOKEN }}",
          "X-GitHub-Api-Version": "2022-11-28"
        }
      },
      "requiredApproval": false
    }
    ```
    </details>

5. Click `Save`.

Now you should see the `Re-run workflow run` action in the self-service page. 🎉


### Cancel a running workflow run

1. Go to the [Self-service](https://app.getport.io/self-serve) page of your portal.
2. Click on the `+ New Action` button.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration into the editor.

    <details>
    <summary><b>Cancel a running workflow run action (Click to expand)</b></summary>

    :::caution Replace GitHub Organization
    Make sure to replace `<YOUR_GITHUB_ORG>` with your actual GitHub organization name in the webhook URL.
    :::

    ```json showLineNumbers
    {
      "identifier": "cancel_workflow_run",
      "title": "Cancel Workflow Run",
      "icon": "Unavailable",
      "description": "Cancel a running workflow run",
      "trigger": {
        "type": "self-service",
        "operation": "DAY-2",
        "userInputs": {
          "properties": {},
          "required": [],
          "order": []
        },
        "blueprintIdentifier": "githubWorkflowRun"
      },
      "invocationMethod": {
        "type": "WEBHOOK",
        "url": "https://api.github.com/repos/<YOUR_GITHUB_ORG>/{{ .entity.identifier | split(\"/\")[0] }}/actions/runs/{{ .entity.identifier | split(\"/\")[-1] }}/cancel",
        "agent": false,
        "synchronized": true,
        "method": "POST",
        "headers": {
          "Accept": "application/vnd.github+json",
          "Authorization": "Bearer {{ .secrets._GITHUB_TOKEN }}",
          "X-GitHub-Api-Version": "2022-11-28"
        }
      },
      "requiredApproval": false
    }
    ```
    </details>

5. Click `Save`.

Now you should see the `Cancel workflow run` action in the self-service page. 🎉


## Visualize metrics

With workflow runs ingested and actions configured, the next step is building a dashboard to monitor GitHub data directly in Port. We can visualize all workflow run details using customizable widgets. In addition, we can trigger remediation workflows right from your dashboard.

### Create a dashboard

1. Navigate to the [Catalog](https://app.getport.io/organization/catalog) page of your portal.
2. Click on the **`+ New`** button in the left sidebar.
3. Select **New dashboard**.
4. Name the dashboard **GitHub Deployment Manager**.
5. Input `A dashboard to view, re-run, and cancel deployments in GitHub` under **Description**.
6. Select the `Github` icon.
7. Click `Create`.

We now have a blank dashboard where we can start adding widgets to visualize insights from our GitHub deployments. 

:::tip Deployment Filtering Strategy
In this guide, we define deployments as workflow runs with deployment-related names by looking for specific keywords in the workflow name:

- **"deploy"** - Captures workflows like `deploy.yml`, `deploy-to-production.yml`
- **"CD"** - Captures continuous deployment workflows
- **"production"** - Captures production deployment workflows  
- **"staging"** - Captures staging deployment workflows

You can customize these filters based on your workflow naming conventions.

Alternatively, instead of using workflow runs with naming strategies, you can ingest GitHub's native deployment data directly. You can map these using the `deployment` resource kind in your integration configuration, as shown in our [GitHub integration examples](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/git/github/examples/#map-repositories-deployments-and-environments).
:::

### Add widgets

In the new dashboard, create the following widgets:

<details>
<summary><b>Total deployments created in the last 3 months (click to expand)</b></summary>

1. Click `+ Widget` and select **Number Chart**.
2. Title: `Total deployments` (add the `Deployment` icon).
3. Select `Count entities` **Chart type** and choose **GitHub Workflow Run** as the **Blueprint**.
4. Select `count` for the **Function**.
5. Add this JSON to the **Additional filters** editor to filter deployments created in the last 3 months:
    ```json showLineNumbers
    [
        {
            "combinator":"and",
            "rules":[
                {
                    "property":"$title",
                    "operator":"contains",
                    "value":"deploy"
                },
                {
                    "property":"createdAt",
                    "operator":"between",
                    "value":{
                    "preset":"last3Months"
                    }
                }
            ]
        }
    ]
    ```
6. Select `custom` as the **Unit** and input `deployments` as the **Custom unit**.
7. Click `Save`.

</details>

<details>
<summary><b>Deployment by status (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Pie chart**.
2. Title: `Deployments by status` (add the `Deployment` icon).
3. Choose the **GitHub Workflow Run** blueprint.
4. Under `Breakdown by property`, select the **Conclusion** property
5. Add this JSON to the **Additional filters** editor to filter deployments:
    ```json showLineNumbers
    {
      "combinator": "or",
      "rules": [
        {
          "property": "$title",
          "operator": "contains",
          "value": "deploy"
        },
        {
          "property": "$title",
          "operator": "contains",
          "value": "production"
        },
        {
          "property": "$title",
          "operator": "contains",
          "value": "CD"
        },
        {
          "property": "$title",
          "operator": "contains",
          "value": "staging"
        }
      ]
    }
    ```
6. Click **Save**.

</details>

<details>
<summary><b>Trigger workflow run action (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Action card**.
2. Choose the **Trigger Workflow Run** action we created in this guide.
3. Click **Save**.

</details>

<details>
<summary><b>All GitHub deployments view (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Table**.
2. Title the widget **All Deployments**.
3. Choose the **GitHub Workflow Run** blueprint.
4. Add this JSON to the **Additional filters** editor to filter deployments:
    ```json showLineNumbers
    {
      "combinator": "or",
      "rules": [
        {
          "property": "$title",
          "operator": "contains",
          "value": "deploy"
        },
        {
          "property": "$title",
          "operator": "contains",
          "value": "production"
        },
        {
          "property": "$title",
          "operator": "contains",
          "value": "CD"
        },
        {
          "property": "$title",
          "operator": "contains",
          "value": "staging"
        }
      ]
    }
    ```
5. Click **Save** to add the widget to the dashboard.
6. Click on the **`...`** button in the top right corner of the table and select **Customize table**.
7. In the top right corner of the table, click on `Manage Properties` and add the following properties:
    - **Conclusion**: The conclusion of the workflow run.
    - **Link**: The URL to the workflow run.
    - **Created At**: The date the workflow run was created in GitHub.
    - **Run Number**: The run number of the workflow.
    - **Run Attempts**: The number of attempts for this workflow run.
8. Click on the **save icon** in the top right corner of the widget to save the customized table.

</details>


## Related guides
- [Visualize and manage GitLab deployments](/guides/all/visualize-and-manage-gitlab-deployments)