---
displayed_sidebar: null
description: Learn how to create an Azure DevOps work item in Port
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Create an Azure DevOps Work Item

## Overview
This guide demonstrates how to use a **self-service action** and an **automation** in Port to create an Azure DevOps (ADO) work item directly from your developer portal.


## Prerequisites

- Complete the [onboarding process](/getting-started/overview).
- Access to your Azure DevOps account with permissions to manage work items.
- Install Port's [Azure DevOps integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/git/azure-devops/).


## Implementation

You can create Azure DevOps work items by leveraging Port's **synced webhooks** and **secrets** to directly interact with the Azure DevOps REST API.

This setup involves two parts:
1. Storing your Azure DevOps credentials as Port secrets.
2. Defining a self-service action that sends an API request to Azure DevOps to create a work item.


### Add Port secrets

To securely authenticate with Azure DevOps, you will need to add a personal access token (PAT) as a Port secret.

To do this:

1. Click on the `...` button in the top right corner of your Port application.

2. Click on **Credentials**.

3. Click on the `Secrets` tab.

4. Click on `+ Secret` and add the following secrets:
    - `_AZURE_DEVOPS_AUTH_TOKEN`: A base64 encoded string of your Azure DevOps [personal access token](https://learn.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate?view=azure-devops&tabs=Windows) with **Read & Write** work items scope.

        You can encode your PAT using the following command:
    
        ```bash
        echo -n ":your-ado-personal-access-token" | base64
        ```

### Set up self-service action

1. Go to the [self-service](https://app.getport.io/self-serve) page of your portal.
2. Click on the `+ New Action` button.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration into the editor.

    <details>
    <summary><b>Create Azure DevOps Work Item (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "create_ado_work_item",
      "title": "Create Azure DevOps Work Item",
      "icon": "AzureDevops",
      "description": "Create a new Azure DevOps work item",
      "trigger": {
        "type": "self-service",
        "operation": "CREATE",
        "userInputs": {
          "properties": {
            "title": {
              "type": "string",
              "title": "Title",
              "description": "Title of the work item"
            },
            "description": {
              "type": "string",
              "title": "Description",
              "description": "Detailed description about the work item"
            },
            "project": {
              "title": "Project",
              "description": "The project where the work item will be added",
              "icon": "AzureDevops",
              "type": "string",
              "blueprint": "project",
              "sort": {
                "property": "$title",
                "order": "ASC"
              },
              "format": "entity"
            },
            "priority": {
              "type": "string",
              "title": "Priority",
              "description": "Priority of the work item",
              "enum": [
                "1",
                "2",
                "3",
                "4"
              ],
              "enumColors": {
                "1": "lightGray",
                "2": "lightGray",
                "3": "lightGray",
                "4": "lightGray"
              }
            },
            "type": {
              "icon": "DefaultProperty",
              "title": "Type",
              "type": "string",
              "default": "Task",
              "enum": [
                "Task",
                "Epic",
                "Issue"
              ],
              "enumColors": {
                "Task": "gold",
                "Epic": "red",
                "Issue": "green"
              }
            }
          },
          "required": [
            "title",
            "project",
            "priority",
            "type"
          ],
          "order": [
            "type",
            "title",
            "description",
            "priority",
            "project"
          ],
          "titles": {}
        }
      },
      "invocationMethod": {
        "type": "WEBHOOK",
        "url": "https://dev.azure.com/{{.secrets._AZURE_DEVOPS_ORGANIZATION_URL}}/{{.inputs.project.identifier}}/_apis/wit/workitems/${{.inputs.type}}?$expand=all&api-version=7.1",
        "agent": false,
        "synchronized": true,
        "method": "POST",
        "headers": {
          "Content-Type": "application/json-patch+json",
          "Authorization": "Basic {{.secrets._AZURE_DEVOPS_AUTH_TOKEN}}"
        },
        "body": [
          {
            "op": "add",
            "path": "/fields/System.Title",
            "from": null,
            "value": "{{.inputs.title}}"
          },
          {
            "op": "add",
            "path": "/fields/Microsoft.VSTS.Common.Priority",
            "from": null,
            "value": "{{.inputs.priority}}"
          },
          {
            "op": "add",
            "path": "/fields/System.Description",
            "from": null,
            "value": "{{.inputs.description}}"
          }
        ]
      },
      "requiredApproval": false
    }
    ```
    </details>

5. Click `Save`.

Now you should see the `Create Azure DevOps Work Item` action in the [self-service](https://app.getport.io/self-serve) page. 🎉

### Create an automation to sync entity in Port

Once the work item is created in Azure DevOps, we want to automatically reflect the entity in Port. To achieve this behaviour:

1. Go to the [automations](https://app.getport.io/settings/automations) page of your portal.

2. Click on the `+ Automation` button.

3. Copy and paste the following JSON configuration into the editor.

    <details>
    <summary><b>Create ADO work item in Port automation (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "ado_work_item_create_sync_status",
      "title": "Sync ADO Work Item in Port",
      "description": "Create a new Azure DevOps work item in Port",
      "trigger": {
        "type": "automation",
        "event": {
          "type": "RUN_UPDATED",
          "actionIdentifier": "create_ado_work_item"
        },
        "condition": {
          "type": "JQ",
          "expressions": [
            ".diff.after.status == \"SUCCESS\""
          ],
          "combinator": "and"
        }
      },
      "invocationMethod": {
        "type": "UPSERT_ENTITY",
        "blueprintIdentifier": "workItem",
        "mapping": {
          "identifier": "{{.event.diff.after.response.id | tostring}}",
          "title": "{{.event.diff.after.response.fields.\"System.Title\"}}",
          "properties": {
            "type": "{{.event.diff.after.response.fields.\"System.WorkItemType\"}}",
            "state": "{{.event.diff.after.response.fields.\"System.State\"}}",
            "effort": "{{.event.diff.after.response.fields.\"Microsoft.VSTS.Scheduling.Effort\"}}",
            "description": "{{.event.diff.after.response.fields.\"System.Description\"}}",
            "link": "{{.event.diff.after.response.url}}",
            "reason": "{{.event.diff.after.response.fields.\"System.Reason\"}}",
            "createdBy": "{{.event.diff.after.response.fields.\"System.CreatedBy\".displayName}}",
            "changedBy": "{{.event.diff.after.response.fields.\"System.ChangedBy\".displayName}}",
            "createdDate": "{{.event.diff.after.response.fields.\"System.CreatedDate\"}}",
            "changedDate": "{{.event.diff.after.response.fields.\"System.ChangedDate\"}}"
          },
          "relations": {
            "project": "{{.event.diff.after.response.url | split(\"/\")[4]}}",
            "column": "{{ ((.event.diff.after.response.fields.\"System.WorkItemType\" + \"-\" + .event.diff.after.response.fields.\"System.State\" + \"-\" + (.event.diff.after.response.url | split(\"/\")[4])) | gsub(\" \"; \"\")) }}"
          }
        }
      },
      "publish": true
    }
    ```
    </details>

4. Click `Save`.

Now, whenever a user runs the `Create Azure DevOps Work Item` action:

1. The work item is created directly in Azure DevOps via webhook.
2. An automation runs to upsert the work item entity into Port, keeping your catalog in sync.
