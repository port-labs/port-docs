---
displayed_sidebar: null
description: Learn how to monitor and manage your Azure DevOps deployments using dashboards and self-service actions in Port.
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Visualize and manage your Azure DevOps deployments

This guide demonstrates how to bring your Azure DevOps deployment experience into Port. You will learn how to:

- Ingest Azure DevOps pipeline data into Port's software catalog using **Port's Azure DevOps** integration.
- Set up **self-service actions** to manage deployments (trigger, retry, and cancel).
- Build **dashboards** in Port to monitor and take action on your Azure DevOps deployments.

<img src="/img/guides/azureDevOpsDeploymentDashboard1.png" border="1px" width="100%" />
<img src="/img/guides/azureDevOpsDeploymentDashboard2.png" border="1px" width="100%" />


## Common use cases

- Monitor the status and health of all Azure DevOps deployments across projects from a single dashboard.
- Empower platform teams to automate day-2 operations via webhooks.


## Prerequisites

This guide assumes the following:
- You have a Port account and have completed the [onboarding process](https://docs.port.io/getting-started/overview).
- Port's [Azure DevOps integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/git/azure-devops/) is installed in your account.


## Set up data model

The Azure DevOps integration comes with a `Pipeline` blueprint, but `Pipeline run` is not supported in the integration. We will create a custom blueprint for Pipeline runs and update the integration configuration.

### Create the pipeline blueprint

1. Go to the [builder](https://app.getport.io/settings/data-model) page of your portal.
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.
4. Add this JSON schema:

    <details>
    <summary><b>Azure DevOps pipeline blueprint (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "azureDevopsPipeline",
      "title": "Pipeline",
      "icon": "AzureDevops",
      "schema": {
        "properties": {
          "url": {
            "type": "string",
            "format": "url",
            "title": "URL"
          },
          "revision": {
            "type": "number",
            "title": "Revision"
          },
          "folder": {
            "title": "Folder",
            "type": "string"
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
          "target": "project",
          "required": true,
          "many": false
        }
      }
    }
    ```
    </details>

5. Click `Save` to create the blueprint.


### Create the pipeline run blueprint

Since the Azure DevOps integration does not support pipeline runs, we will create a custom blueprint for pipeline runs that will be populated via webhooks.

1. Go to the [builder](https://app.getport.io/settings/data-model) page of your portal.
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.
4. Add this JSON schema:

    <details>
    <summary><b>Pipeline run blueprint (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "pipeline_run",
      "description": "Pipeline runs, delivered via service webhook",
      "title": "Pipeline run",
      "icon": "AzurePipline",
      "schema": {
        "properties": {
          "status": {
            "icon": "DefaultProperty",
            "title": "Status",
            "type": "string",
            "enum": [
              "inProgress",
              "completed",
              "canceling"
            ],
            "enumColors": {
              "inProgress": "lightGray",
              "completed": "green",
              "canceling": "orange"
            }
          },
          "result": {
            "icon": "DefaultProperty",
            "title": "Result",
            "type": "string",
            "enum": [
              "succeeded",
              "failed",
              "canceled"
            ],
            "enumColors": {
              "succeeded": "green",
              "failed": "red",
              "canceled": "lightGray"
            }
          },
          "created_date": {
            "type": "string",
            "title": "Created Date",
            "format": "date-time"
          },
          "finished_date": {
            "type": "string",
            "title": "Finished Date",
            "format": "date-time"
          },
          "pipeline_run_link": {
            "type": "string",
            "title": "Pipeline Run Link",
            "format": "url"
          },
          "pipeline_definition_url": {
            "type": "string",
            "title": "Pipeline Definition Url",
            "format": "url"
          },
          "stages": {
            "type": "object",
            "title": "Stages"
          },
          "commit": {
            "type": "string",
            "title": "Commit"
          },
          "target_branch": {
            "type": "string",
            "title": "Target Branch"
          },
          "source_branch": {
            "type": "string",
            "title": "Source Branch"
          }
        },
        "required": []
      },
      "mirrorProperties": {},
      "calculationProperties": {},
      "aggregationProperties": {},
      "relations": {
        "pipeline": {
          "title": "Pipeline",
          "target": "azureDevopsPipeline",
          "required": false,
          "many": false
        }
      }
    }
    ```
    </details>

5. Click `Save` to create the blueprint.


### Update the integration mapping

1. Go to the [data sources](https://app.getport.io/settings/data-sources) page of your portal.
2. Select the Azure DevOps integration.
3. Add the following YAML block into the editor to ingest pipelines from your Azure DevOps account:

    <details>
    <summary><b>Azure DevOps integration configuration (Click to expand)</b></summary>

    ```yaml showLineNumbers
    resources:
      - kind: project
        selector:
          query: 'true'
          defaultTeam: 'true'
        port:
          entity:
            mappings:
              identifier: '.id | gsub(" "; "")'
              blueprint: '"project"'
              title: .name
              properties:
                state: .state
                revision: .revision
                visibility: .visibility
                defaultTeam: .defaultTeam.name
                link: .url | gsub("_apis/projects/"; "")
      - kind: pipeline
        selector:
          query: 'true'
        port:
          entity:
            mappings:
              identifier: .id | tostring
              title: .name
              blueprint: '"azureDevopsPipeline"'
              properties:
                url: .url
                revision: .revision
                folder: .folder
              relations:
                project: '.__projectId | gsub(" "; "")'
    ```
    </details>
    
4. Click `Save & Resync` to apply the mapping.


## Configure a webhook in Port

Since the Azure DevOps integration does not support pipeline runs, we will use Azure DevOps service hooks and Port's webhook feature to ingest pipeline run state change events to Port.

1. Go to the [Data sources](https://app.getport.io/settings/data-sources) page of your portal.

2. Click on the `+ Data source` button in the top right corner.

3. Select the `Webhook` tab.

4. Click on `Custom integration`.

5. Give your webhook a title and description, and select an icon to represent it. You may title it `ADO Pipeline Run Mapper`.

6. Click `Next`.

7. In the `Mapping` tab, you can see your new webhook URL.

8. Scroll down to box number 3 and add this JSON configuration to map the data received from Azure DevOps to the blueprint:

    <details>
    <summary><b>Pipeline run webhook configuration (Click to expand)</b></summary>

      ```json showLineNumbers
      [
        {
          "blueprint": "pipeline_run",
          "operation": "create",
          "filter": ".body.eventType == \"ms.vss-pipelines.run-state-changed-event\"",
          "entity": {
            "identifier": "(.body.resource.pipeline.id | tostring)+ \"-\" + (.body.resource.run.id | tostring)",
            "title": ".body.resource.pipeline.name  +  \" - \" +  (.body.resource.pipeline.id | tostring)",
            "properties": {
              "status": ".body.resource.run.state",
              "result": ".body.resource.run.result",
              "source_branch": ".body.resource.run.variables[\"system.pullRequest.sourceBranch\"].value",
              "target_branch": ".body.resource.run.resources.repositories.self.refName",
              "commit": ".body.resource.run.resources.repositories.self.version",
              "created_date": ".body.resource.run.createdDate",
              "finished_date": ".body.resource.run.finishedDate",
              "pipeline_run_link": ".body.resource.run._links.web.href",
              "pipeline_definition_url": ".body.resource.run._links[\"pipeline.web\"].href",
              "stages": "{ \"stages\": .body.resource.stages }"
            },
            "relations": {
              "pipeline": ".body.resource.run.pipeline.id | tostring"
            }
          }
        }
      ]
      ```
    </details>

9. When finished, click `Save`.


## Set up service hook in Azure DevOps portal

To complete the integration, you need to configure a service hook in Azure DevOps to send pipeline run events to Port.

1. Navigate to your Azure DevOps portal and select your project.

2. Go to **Project Settings** and click on **Service hooks** in the left navigation bar.

3. Click on the **`+`** button to create a new hook subscription.

4. Select **Web Hook** as the service and click **Next**.

5. Under **Trigger**, select **Run state changed** event and click **Next**.

6. Enter the webhook URL from your Port webhook configuration into the **URL** text field.

7. Click **Finish** to complete the service hook setup.

:::tip Service hook configuration
The service hook will automatically send pipeline [run state change events](https://learn.microsoft.com/en-us/azure/devops/service-hooks/events?view=azure-devops#run.statechanged) to Port whenever a pipeline run is triggered, updated, or completed in your Azure DevOps project.
:::

Whenever a pipeline run is initiated, the configured webhook will send an event to Port, allowing Port to ingest the data into the software catalog using the webhook configuration.


## Set up self-service actions

We will create self-service actions in Port to directly interact with the Azure DevOps API. These actions let users:

1. Trigger a new pipeline run.
2. Rerun a failed pipeline.
3. Cancel a running pipeline.

Each action will be configured via JSON and triggered using **synced webhooks** secured with secrets. To implement these use-cases, follow the steps below:


### Add Port secrets

To add a secret to your portal:

1. Click on the `...` button in the top right corner of your Port application.

2. Click on **Credentials**.

3. Click on the `Secrets` tab.

4. Click on `+ Secret` and add the following secrets:
    - `_AZURE_DEVOPS_ORGANIZATION_NAME`: Your Azure DevOps organization name (e.g., `myorg`).
    - `_AZURE_DEVOPS_AUTH_TOKEN`: A Personal Access Token (PAT) with appropriate permissions for pipeline operations.


### Trigger a new pipeline run

1. Go to the [self-service](https://app.getport.io/self-serve) page of your portal.
2. Click on the `+ New Action` button.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration into the editor.

    <details>
    <summary><b>Trigger a new pipeline run action (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "trigger_azure_devops_pipeline",
      "title": "Trigger ADO Pipeline",
      "icon": "Azure",
      "description": "Initiates a new pipeline run in Azure DevOps with specified environment and branch parameters",
      "trigger": {
        "type": "self-service",
        "operation": "DAY-2",
        "userInputs": {
          "properties": {
            "environment": {
              "title": "Environment",
              "type": "string",
              "enum": [
                "staging",
                "production"
              ],
              "enumColors": {
                "staging": "orange",
                "production": "red"
              }
            },
            "target_branch": {
              "title": "Branch",
              "type": "string",
              "enum": [
                "main",
                "develop",
                "feature/latest"
              ],
              "default": "main"
            }
          },
          "required": [
            "environment",
            "target_branch"
          ],
          "order": [
            "environment",
            "target_branch"
          ]
        },
        "blueprintIdentifier": "azureDevopsPipeline"
      },
      "invocationMethod": {
        "type": "WEBHOOK",
        "url": "https://dev.azure.com/{{.secrets._AZURE_DEVOPS_ORGANIZATION_URL}}/{{.entity.relations.project}}/_apis/pipelines/{{.entity.identifier}}/runs?api-version=7.1",
        "agent": false,
        "synchronized": true,
        "method": "POST",
        "headers": {
          "Content-Type": "application/json",
          "Authorization": "Basic {{.secrets._AZURE_DEVOPS_AUTH_TOKEN}}"
        },
        "body": {
          "resources": {
            "repositories": {
              "self": {
                "refName": "refs/heads/{{ .inputs.target_branch }}"
              }
            }
          },
          "templateParameters": {
            "environment": "{{ .inputs.environment }}",
            "run_id": "{{ .run.id }}"
          }
        }
      },
      "requiredApproval": false
    }
    ```
    </details>

5. Click `Save`.

Now you should see the `Trigger ADO Pipeline` action in the self-service page. 🎉


### Rerun a failed pipeline

1. Go to the [self-service](https://app.getport.io/self-serve) page of your portal.
2. Click on the `+ New Action` button.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration into the editor.

    <details>
    <summary><b>Rerun a failed pipeline action (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "rerun_azure_devops_pipeline",
      "title": "Rerun ADO Pipeline",
      "icon": "AzurePipline",
      "description": "Restarts a failed Azure DevOps pipeline run to retry all previously failed jobs and stages",
      "trigger": {
        "type": "self-service",
        "operation": "DAY-2",
        "userInputs": {
          "properties": {},
          "required": [],
          "order": []
        },
        "blueprintIdentifier": "pipeline_run"
      },
      "invocationMethod": {
        "type": "WEBHOOK",
        "url": "https://dev.azure.com/{{.secrets._AZURE_DEVOPS_ORGANIZATION_URL}}/{{.entity.properties.pipeline_run_link | split(\"/\")[4]}}/_apis/build/builds/{{.entity.identifier | split(\"-\")[-1]}}?retry=true&api-version=7.1",
        "agent": false,
        "synchronized": true,
        "method": "PATCH",
        "headers": {
          "Content-Type": "application/json",
          "Authorization": "Basic {{.secrets._AZURE_DEVOPS_AUTH_TOKEN}}"
        },
        "body": {}
      },
      "requiredApproval": false
    }
    ```
    </details>

5. Click `Save`.

Now you should see the `Rerun ADO Pipeline` action in the self-service page. 🎉


### Cancel a running pipeline

1. Go to the [self-service](https://app.getport.io/self-serve) page of your portal.
2. Click on the `+ New Action` button.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration into the editor.

    <details>
    <summary><b>Cancel a running pipeline action (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "cancel_azure_devops_pipeline",
      "title": "Cancel ADO Pipeline",
      "icon": "Unavailable",
      "description": "Terminates an active Azure DevOps pipeline run to stop all ongoing jobs and stages",
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
              "property": "status",
              "operator": "=",
              "value": "inProgress"
            }
          ],
          "combinator": "and"
        },
        "blueprintIdentifier": "pipeline_run"
      },
      "invocationMethod": {
        "type": "WEBHOOK",
        "url": "https://dev.azure.com/{{.secrets._AZURE_DEVOPS_ORGANIZATION_URL}}/{{.entity.properties.pipeline_run_link | split(\"/\")[4]}}/_apis/build/builds/{{.entity.identifier | split(\"-\")[-1]}}?api-version=7.1",
        "agent": false,
        "synchronized": true,
        "method": "PATCH",
        "headers": {
          "Content-Type": "application/json",
          "Authorization": "Basic {{.secrets._AZURE_DEVOPS_AUTH_TOKEN}}"
        },
        "body": {
          "status": 4
        }
      },
      "requiredApproval": false
    }
    ```
    </details>

5. Click `Save`.

Now you should see the `Cancel ADO Pipeline` action in the self-service page. 🎉


## Visualize metrics

With pipelines ingested and actions configured, the next step is building a dashboard to monitor Azure DevOps data directly in Port. We can visualize all pipeline details using customizable widgets. In addition, we can trigger remediation workflows right from your dashboard.


### Create a dashboard

1. Navigate to the [Catalog](https://app.getport.io/organization/catalog) page of your portal.
2. Click on the **`+ New`** button in the left sidebar.
3. Select **New dashboard**.
4. Name the dashboard **Azure DevOps Deployment Manager**.
5. Input `A dashboard to view, retry, and cancel deployments in Azure DevOps` under **Description**.
6. Select the `AzureDevops` icon.
7. Click `Create`.

We now have a blank dashboard where we can start adding widgets to visualize insights from our Azure DevOps deployments. In this guide, we define deployments as pipeline runs where the target branch is `refs/heads/main`.


### Add widgets

In the new dashboard, create the following widgets:

<details>
<summary><b>Total deployments created in the last 3 months (click to expand)</b></summary>

1. Click `+ Widget` and select **Number Chart**.
2. Title: `Total deployments` (add the `Deployment` icon).
3. Select `Count entities` **Chart type** and choose **Pipeline run** as the **Blueprint**.
4. Select `count` for the **Function**.
5. Add this JSON to the **Additional filters** editor to filter deployments created in the last 3 months:

    ```json showLineNumbers
    {
    "combinator": "and",
    "rules": [
        {
        "property": "target_branch",
        "operator": "=",
        "value": "refs/heads/main"
        },
        {
        "property": "created_date",
        "operator": "between",
        "value": {
            "preset": "last3Months"
        }
        }
    ]
    }
    ```
6. Select `custom` as the **Unit** and input `deployments` as the **Custom unit**.
7. Click `Save`.

</details>

<details>
<summary><b>Deployment by status (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Pie chart**.
2. Title: `Deployments by status` (add the `Deployment` icon).
3. Choose the **Pipeline run** blueprint.
4. Under `Breakdown by property`, select the **Status** property
5. Add this JSON to the **Additional filters** editor to filter deployments:

    ```json showLineNumbers
    {
      "combinator": "and",
      "rules": [
        {
          "property": "target_branch",
          "operator": "=",
          "value": "refs/heads/main"
        }
      ]
    }
    ```
6. Click **Save**.

</details>

<details>
<summary><b>Trigger pipeline action (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Action card**.
2. Choose the **Trigger ADO Pipeline** action we created in this guide.
3. Click **Save**.

</details>

<details>
<summary><b>All Azure DevOps deployments view (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Table**.
2. Title the widget **All Deployments**.
3. Choose the **Pipeline Run** blueprint.
4. Add this JSON to the **Additional filters** editor to filter deployments:

    ```json showLineNumbers
    {
      "combinator": "and",
      "rules": [
        {
          "property": "target_branch",
          "operator": "=",
          "value": "refs/heads/main"
        }
      ]
    }
    ```
5. Click **Save** to add the widget to the dashboard.
6. Click on the **`...`** button in the top right corner of the table and select **Customize table**.
7. In the top right corner of the table, click on `Manage Properties` and add the following properties:
    - **Status**: The status of the pipeline run.
    - **Result**: The result of the pipeline run.
    - **Pipeline Run Link**: The URL to the pipeline run.
    - **Created Date**: The date the pipeline run was created.
    - **Pipeline**: The related Azure DevOps pipeline.
8. Click on the **save icon** in the top right corner of the widget to save the customized table.

</details> 