---
displayed_sidebar: null
description: Learn how to monitor and manage your ServiceNow incidents using dashboards and self-service actions in Port.
---

import GithubActionModificationHint from '/docs/guides/templates/github/_github_action_modification_required_hint.mdx'
import GithubDedicatedRepoHint from '/docs/guides/templates/github/_github_dedicated_workflows_repository_hint.mdx'

# Visualize and manage your ServiceNow incidents

This guide demonstrates how to bring your ServiceNow incident management experience into Port. You will learn how to:

- Ingest ServiceNow incident data into Port's software catalog using **Port's ServiceNow** integration.
- Set up **self-service actions** to manage incidents (create, resolve, and delete).
- Build **dashboards** in Port to monitor and act on incidents.

<img src="/img/guides/snowDashboard1.png" border="1px" width="100%" />
<img src="/img/guides/snowDashboard2.png" border="1px" width="100%" />


## Common use cases

- Monitor the status and health of all ServiceNow incidents from a centralized dashboard.
- Empower platform teams to automate day-2 operations via Webhooks.


## Prerequisites

This guide assumes the following:
- You have a Port account and have completed the [onboarding process](https://docs.port.io/getting-started/overview).
- Port's [ServiceNow integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/incident-management/servicenow/) is installed in your account.


## Set up self-service actions

We will create self-service actions in Port to directly interact with the ServiceNow Table API. These actions let users:

1. Create a new incident.

2. Resolve an existing incident.

3. Delete an incident.

Each action will be configured via JSON and triggered using **synced webhooks** secured with secrets. To implement these use-cases, follow the steps below:


<h3>Add Port secrets</h3>

To add a secret to your portal:

1. Click on the `...` button in the top right corner of your Port application.

2. Click on **Credentials**.

3. Click on the `Secrets` tab.

4. Click on `+ Secret` and add the following secret:
    - `SERVICENOW_API_TOKEN`: A base64 encoded string of your ServiceNow credentials generated as:
    
        ```bash
        echo -n "your-instance-username:your-instance-password" | base64
        ```


### Create a new incident

1. Go to the [Self-service](https://app.getport.io/self-serve) page of your portal.
2. Click on the `+ New Action` button.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration into the editor.

    <details>
    <summary><b>Create incident action (Click to expand)</b></summary>

    :::tip Replace placeholder
    Remember to replace the `<SERVICENOW_INSTANCE_URL>` placeholder with you actual ServiceNow instance such as https://example-id.service-now.com
    :::

    ```json showLineNumbers
    {
      "identifier": "create_snow_incident",
      "title": "Create Incident",
      "icon": "Servicenow",
      "description": "Create an incident in ServiceNow using webhook",
      "trigger": {
        "type": "self-service",
        "operation": "CREATE",
        "userInputs": {
          "properties": {
            "short_description": {
              "icon": "DefaultProperty",
              "title": "Short Description",
              "description": "Description of the incident",
              "type": "string"
            },
            "assigned_to": {
              "icon": "DefaultProperty",
              "title": "Assigned To",
              "description": "User this incident is assigned to",
              "type": "string"
            },
            "urgency": {
              "title": "Urgency",
              "icon": "DefaultProperty",
              "type": "string",
              "default": "2",
              "enum": [
                "1",
                "2",
                "3"
              ],
              "enumColors": {
                "1": "red",
                "2": "yellow",
                "3": "green"
              }
            },
            "sysparm_display_value": {
              "title": "Sysparm Display Value",
              "description": "Determines the type of data returned",
              "icon": "DefaultProperty",
              "type": "string",
              "default": "all",
              "enum": [
                "true",
                "false",
                "all"
              ]
            },
            "sysparm_input_display_value": {
              "title": "Sysparm Input Display Value",
              "description": "Flag that indicates whether to set field values using the display value or the actual value",
              "type": "boolean",
              "default": false
            }
          },
          "required": [
            "short_description",
            "assigned_to"
          ],
          "order": [
            "short_description",
            "assigned_to",
            "urgency",
            "sysparm_display_value",
            "sysparm_input_display_value"
          ]
        },
        "blueprintIdentifier": "servicenowIncident"
      },
      "invocationMethod": {
        "type": "WEBHOOK",
        "url": "<SERVICENOW_INSTANCE_URL>/api/now/table/incident",
        "agent": false,
        "synchronized": true,
        "method": "POST",
        "headers": {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": "Basic {{.secrets.SERVICENOW_API_TOKEN}}"
        },
        "body": {
          "short_description": "{{.inputs.short_description}}",
          "assigned_to": "{{.inputs.assigned_to}}",
          "urgency": "{{.inputs.urgency}}",
          "sysparm_display_value": "{{.inputs.sysparm_display_value}}",
          "sysparm_input_display_value": "{{.inputs.sysparm_input_display_value}}"
        }
      },
      "requiredApproval": false
    }
    ```
    </details>

5. Click `Save`.

Now you should see the `Create Incident` action in the self-service page. 🎉


### Resolve an incident

1. Go to the [Self-service](https://app.getport.io/self-serve) page of your portal.
2. Click on the `+ New Action` button.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration into the editor.

    <details>
    <summary><b>Resolve incident action (Click to expand)</b></summary>

    :::tip Replace placeholder
    Remember to replace the `<SERVICENOW_INSTANCE_URL>` placeholder with you actual ServiceNow instance such as https://example-id.service-now.com
    :::

    ```json showLineNumbers
    {
      "identifier": "resolve_snow_incident",
      "title": "Resolve Incident",
      "icon": "Servicenow",
      "description": "Resolve an incident in the ServiceNow catalog",
      "trigger": {
        "type": "self-service",
        "operation": "DAY-2",
        "userInputs": {
          "properties": {
            "resolution_code": {
              "type": "string",
              "title": "Resolution Code",
              "default": "Solution provided",
              "enum": [
                "Duplicate",
                "Known error",
                "No resolution provided",
                "Resolved by caller",
                "Resolved by change",
                "Resolved by problem",
                "Resolved by request",
                "Solution provided",
                "Workaround provided",
                "User error"
              ],
              "enumColors": {
                "Duplicate": "lightGray",
                "Known error": "lightGray",
                "No resolution provided": "lightGray",
                "Resolved by caller": "lightGray",
                "Resolved by change": "lightGray",
                "Resolved by problem": "lightGray",
                "Resolved by request": "lightGray",
                "Solution provided": "lightGray",
                "Workaround provided": "lightGray",
                "User error": "lightGray"
              }
            },
            "resolution_note": {
              "type": "string",
              "title": "Resolution Note"
            }
          },
          "required": [
            "resolution_code",
            "resolution_note"
          ],
          "order": [
            "resolution_code",
            "resolution_note"
          ]
        },
        "blueprintIdentifier": "servicenowIncident"
      },
      "invocationMethod": {
        "type": "WEBHOOK",
        "url": "<SERVICENOW_INSTANCE_URL>/api/now/table/incident/{{.entity.identifier}}",
        "agent": false,
        "synchronized": true,
        "method": "PATCH",
        "headers": {
          "RUN_ID": "{{ .run.id }}",
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": "Basic {{.secrets.SERVICENOW_API_TOKEN}}"
        },
        "body": {
          "state": "6",
          "close_code": "{{ .inputs.resolution_code }}",
          "close_notes": "{{ .inputs.resolution_note }}"
        }
      },
      "requiredApproval": false
    }
    ```
    </details>

5. Click `Save`.

Now you should see the `Resolve Incident` action in the self-service page. 🎉


### Delete an incident

1. Go to the [Self-service](https://app.getport.io/self-serve) page of your portal.
2. Click on the `+ New Action` button.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration into the editor.

    <details>
    <summary><b>Delete incident action (Click to expand)</b></summary>

    :::tip Replace placeholder
    Remember to replace the `<SERVICENOW_INSTANCE_URL>` placeholder with you actual ServiceNow instance such as https://example-id.service-now.com
    :::

    ```json showLineNumbers
    {
      "identifier": "delete_snow_incident",
      "title": "Delete Incident",
      "icon": "Servicenow",
      "description": "Deletes an incident from the ServiceNow incident catalog",
      "trigger": {
        "type": "self-service",
        "operation": "DELETE",
        "userInputs": {
          "properties": {},
          "required": [],
          "order": []
        },
        "blueprintIdentifier": "servicenowIncident"
      },
      "invocationMethod": {
        "type": "WEBHOOK",
        "url": "<SERVICENOW_INSTANCE_URL>/api/now/table/incident/{{.entity.identifier}}",
        "agent": false,
        "synchronized": true,
        "method": "DELETE",
        "headers": {
          "RUN_ID": "{{ .run.id }}",
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": "Basic {{.secrets.SERVICENOW_API_TOKEN}}"
        },
        "body": {}
      },
      "requiredApproval": false
    }
    ```
    </details>

5. Click `Save`.

Now you should see the `Delete Incident` action in the self-service page. 🎉


## Visualize metrics

With incidents ingested and actions configured, the next step is building a dashboard to monitor ServiceNow data directly in Port. We can visualize all incidents by state, priority, or severity using customizable widgets. In addition, we can trigger remediation workflows right from your dashboard.

### Create a dashboard

1. Navigate to the [Catalog](https://app.getport.io/organization/catalog) page of your portal.
2. Click on the **`+ New`** button in the left sidebar.
3. Select **New dashboard**.
4. Name the dashboard **ServiceNow Incident Management**.
5. Input `Create, view and manage your incidents` under **Description**.
6. Select the `Servicenow` icon.
7. Click `Create`.

We now have a blank dashboard where we can start adding widgets to visualize insights from our ServiceNow incidents.

### Add widgets

In the new dashboard, create the following widgets:

<details>
<summary><b>Total incidents created in the last 3 months (click to expand)</b></summary>

1. Click `+ Widget` and select **Number Chart**.
2. Title: `Total incidents` (add the `Servicenow` icon).
3. Select `Count entities` **Chart type** and choose **ServiceNow Incident** as the **Blueprint**.
4. Select `count` for the **Function**.
5. Add this JSON to the **Additional filters** editor to filter incidents created in the last 3 months:
    ```json showLineNumbers
    [
        {
            "combinator":"and",
            "rules":[
                {
                    "property":"createdOn",
                    "operator":"between",
                    "value":{
                    "preset":"last3Months"
                    }
                }
            ]
        }
    ]
    ```
6. Select `custom` as the **Unit** and input `incidents` as the **Custom unit**
   <img src="/img/guides/totalServicenowIncidents.png" width="50%"/>

7. Click `Save`.

</details>

<details>
<summary><b>Incident by state (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Pie chart**.
2. Title: `Incident by state` (add the `Servicenow` icon).
3. Choose the **ServiceNow Incident** blueprint.
4. Under `Breakdown by property`, select the **State** property
    <img src="/img/guides/snowIncidentByState.png" width="50%" />

5. Click **Save**.

</details>

<details>
<summary><b>Incident by severity  (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Pie chart**.
2. Title: `Incident by severity` (add the `Servicenow` icon).
3. Choose the **ServiceNow Incident** blueprint.
4. Under `Breakdown by property`, select the **Severity** property
   <img src="/img/guides/snowIncidentBySeverity.png" width="50%" />

5. Click **Save**.

</details>

<details>
<summary><b>Create incident action (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Action card**.
2. Choose the **Create Incident** action we created in this guide
    <img src="/img/guides/snowCreateIncidentAction.png" width="50%" />

3. Click **Save**.

</details>

<details>
<summary><b>All Servicenow incidents view (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Table**.
2. Title the widget **All Incidents**.
3. Choose the **ServiceNow Incident** blueprint

   <img src="/img/guides/allServicenowIncidents.png" width="50%" />

4. Click **Save** to add the widget to the dashboard.
5. Click on the **`...`** button in the top right corner of the table and select **Customize table**.
6. In the top right corner of the table, click on `Manage Properties` and add the following properties:
    - **State**: The current state of the incident.
    - **Assigned To**: The assignee of the incident.
    - **Priority**: The incident priority.
    - **Entity Creation Date**: The date the incident was created in Port.
7. Click on the **save icon** in the top right corner of the widget to save the customized table.

</details>