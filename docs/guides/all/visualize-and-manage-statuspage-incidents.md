---
displayed_sidebar: null
description: Learn how to monitor and manage your Statuspage incidents and components using dashboards and self-service actions in Port.
---

# Visualize and manage your Statuspage incidents and components

This guide demonstrates how to bring your Statuspage incidents and components management experience into Port. You will learn how to:

- Ingest Statuspage incidents and components data into Port's software catalog using **Port's Statuspage** integration.
- Set up **self-service actions** to create, update, and manage incidents and components.
- Create **automations** to reflect changes in Port.
- Build **dashboards** in Port to monitor and act on both incidents and components.

<img src="/img/guides/statuspageIncidentDash1.png" border="1px" width="100%" />
<img src="/img/guides/statuspageIncidentDash2.png" border="1px" width="100%" />


## Common use cases

- Monitor and manage all Statuspage incidents and components from a centralized dashboard.
- Empower teams to create and update incidents through self-service actions.
- Automate component status updates and incident management workflows.


## Prerequisites

This guide assumes the following:
- You have a Port account and have completed the [onboarding process](https://docs.port.io/getting-started/overview).
- Port's [Statuspage integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/incident-management/statuspage/) is installed in your account.


## Set up self-service actions

We will create three self-service actions in Port to directly interact with the Statuspage REST API. These actions will let users create new incidents, update existing incidents, and manage component statuses.

The actions will be configured via JSON and triggered using **synced webhooks** secured with secrets. To implement this use-case, follow the steps below:


### Add Port secrets

To add a secret to your portal:

1. Click on the `...` button in the top right corner of your Port application.

2. Click on **Credentials**.

3. Click on the `Secrets` tab.

4. Click on `+ Secret` and add the following secret:
    - `_STATUSPAGE_API_KEY`: Your Statuspage API key. Follow the Statuspage documentation on how to [create the API key](https://support.atlassian.com/statuspage/docs/create-and-manage-api-keys/).


### Create a new incident

1. Go to the [Self-service](https://app.getport.io/self-serve) page of your portal.
2. Click on the `+ New Action` button.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration into the editor.

    <details>
    <summary><b>Create Statuspage incident action (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "create_statuspage_incident",
      "title": "Create Statuspage Incident",
      "icon": "Alert",
      "description": "Trigger a new Statuspage incident against your Atlasssian page and components",
      "trigger": {
        "type": "self-service",
        "operation": "CREATE",
        "userInputs": {
          "properties": {
            "incident_title": {
              "type": "string",
              "title": "Incident Title",
              "description": "Concise title for the incident"
            },
            "incident_message": {
              "type": "string",
              "title": "Incident Description",
              "description": "Detailed description of the incident"
            },
            "incident_severity": {
              "icon": "DefaultProperty",
              "title": "Incident Severity",
              "type": "string",
              "enum": [
                "none",
                "minor",
                "major",
                "critical",
                "maintenance"
              ],
              "enumColors": {
                "none": "lightGray",
                "minor": "yellow",
                "major": "gold",
                "critical": "red",
                "maintenance": "blue"
              }
            },
            "incident_status": {
              "icon": "DefaultProperty",
              "title": "Incident Status",
              "type": "string",
              "enum": [
                "investigating",
                "identified",
                "monitoring",
                "resolved",
                "scheduled",
                "in_progress",
                "verifying",
                "completed"
              ],
              "enumColors": {
                "investigating": "blue",
                "identified": "orange",
                "monitoring": "yellow",
                "resolved": "green",
                "scheduled": "lightGray",
                "in_progress": "blue",
                "verifying": "yellow",
                "completed": "green"
              }
            },
            "status_page": {
              "type": "string",
              "title": "Status Page",
              "blueprint": "statuspage",
              "description": "The status page",
              "format": "entity"
            },
            "impacted_components": {
              "title": "Impacted Components",
              "icon": "DefaultProperty",
              "type": "array",
              "items": {
                "type": "string",
                "format": "entity",
                "blueprint": "statuspageComponent"
              }
            },
            "send_notifications": {
              "type": "boolean",
              "title": "Send Notifications",
              "default": true,
              "description": "Whether or not to deliver notifications to subscribers"
            },
            "scheduled_for": {
              "title": "Scheduled For",
              "icon": "DefaultProperty",
              "type": "string",
              "description": "The timestamp the incident is scheduled for",
              "format": "date-time",
              "visible": {
                "jqQuery": ".form.incident_status | IN(\"scheduled\", \"in_progress\", \"verifying\", \"completed\")"
              }
            },
            "scheduled_until": {
              "type": "string",
              "title": "Scheduled Until",
              "description": "The timestamp the incident is scheduled until",
              "format": "date-time",
              "visible": {
                "jqQuery": ".form.incident_status | IN(\"scheduled\", \"in_progress\", \"verifying\", \"completed\")"
              }
            }
          },
          "required": [
            "incident_title",
            "incident_message",
            "incident_severity",
            "incident_status",
            "impacted_components",
            "send_notifications"
          ],
          "order": [
            "incident_title",
            "incident_message",
            "incident_severity",
            "incident_status",
            "status_page",
            "impacted_components",
            "send_notifications",
            "scheduled_for",
            "scheduled_until"
          ]
        },
        "blueprintIdentifier": "statuspageIncident"
      },
      "invocationMethod": {
        "type": "WEBHOOK",
        "url": "https://api.statuspage.io/v1/pages/{{.inputs.status_page.identifier}}/incidents",
        "agent": false,
        "synchronized": true,
        "method": "POST",
        "headers": {
          "Content-Type": "application/json",
          "Authorization": "OAuth {{.secrets._STATUSPAGE_API_KEY}}"
        },
        "body": {
          "incident": {
            "name": "{{ .inputs.incident_title }}",
            "body": "{{ .inputs.incident_message }}",
            "status": "{{ .inputs.incident_status }}",
            "impact_override": "{{ .inputs.incident_severity }}",
            "deliver_notifications": "{{ .inputs.send_notifications }}",
            "component_ids": "{{ .inputs.impacted_components | map(.identifier) }}",
            "{{ if (.inputs | has(\"scheduled_for\")) then \"scheduled_for\" else null end }}": "{{ if (.inputs | has(\"scheduled_for\")) then .inputs.scheduled_for else null end }}",
            "{{ if (.inputs | has(\"scheduled_until\")) then \"scheduled_until\" else null end }}": "{{ if (.inputs | has(\"scheduled_until\")) then .inputs.scheduled_until else null end }}",
            "metadata": {
              "port": {
                "runId": "{{ .run.id }}",
                "triggeredBy": "{{ .trigger.by.user.email }}"
              }
            }
          }
        }
      },
      "requiredApproval": false
    }
    ```
    </details>

5. Click `Save`.


### Update incident status

1. Go to the [Self-service](https://app.getport.io/self-serve) page of your portal.
2. Click on the `+ New Action` button.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration into the editor.

    <details>
    <summary><b>Update Statuspage incident status action (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "update_statuspage_incident",
      "title": "Update Statuspage Incident",
      "icon": "Alert",
      "description": "Update the status of an existing Statuspage incident",
      "trigger": {
        "type": "self-service",
        "operation": "DAY-2",
        "userInputs": {
          "properties": {
            "new_incident_status": {
              "icon": "DefaultProperty",
              "title": "New Incident Status",
              "type": "string",
              "enum": [
                "investigating",
                "identified",
                "monitoring",
                "resolved"
              ],
              "enumColors": {
                "investigating": "blue",
                "identified": "orange",
                "monitoring": "yellow",
                "resolved": "green"
              }
            },
            "update_message": {
              "type": "string",
              "title": "Update Message (Optional)"
            }
          },
          "required": [
            "new_incident_status"
          ],
          "order": [
            "new_incident_status",
            "update_message"
          ]
        },
        "blueprintIdentifier": "statuspageIncident"
      },
      "invocationMethod": {
        "type": "WEBHOOK",
        "url": "https://api.statuspage.io/v1/pages/{{.entity.relations.statuspage}}/incidents/{{.entity.identifier}}",
        "agent": false,
        "synchronized": true,
        "method": "PATCH",
        "headers": {
          "Content-Type": "application/json",
          "Authorization": "OAuth {{.secrets._STATUSPAGE_API_KEY}}"
        },
        "body": {
          "incident": {
            "status": "{{ .inputs.new_incident_status }}",
            "{{ if (.inputs | has(\"update_message\")) then \"body\" else null end }}": "{{ if (.inputs | has(\"update_message\")) then .inputs.update_message else null end }}",
            "metadata": {
              "port": {
                "runId": "{{ .run.id }}",
                "triggeredBy": "{{ .trigger.by.user.email }}"
              }
            }
          }
        }
      },
      "requiredApproval": false
    }
    ```
    </details>

5. Click `Save`.


### Update component status

1. Go to the [Self-service](https://app.getport.io/self-serve) page of your portal.
2. Click on the `+ New Action` button.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration into the editor.

    <details>
    <summary><b>Update Statuspage component status action (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "update_status_page_component",
      "title": "Update Statuspage Component Status",
      "icon": "StatusPage",
      "description": "Updates the status of an existing Statuspage component",
      "trigger": {
        "type": "self-service",
        "operation": "DAY-2",
        "userInputs": {
          "properties": {
            "status": {
              "type": "string",
              "title": "Status",
              "enum": [
                "operational",
                "degraded_performance",
                "partial_outage",
                "major_outage",
                "under_maintenance"
              ],
              "enumColors": {
                "operational": "green",
                "degraded_performance": "yellow",
                "partial_outage": "orange",
                "major_outage": "red",
                "under_maintenance": "blue"
              }
            }
          },
          "required": [
            "status"
          ],
          "order": [
            "status"
          ]
        },
        "blueprintIdentifier": "statuspageComponent"
      },
      "invocationMethod": {
        "type": "WEBHOOK",
        "url": "https://api.statuspage.io/v1/pages/{{.entity.relations.statuspage}}/components/{{.entity.identifier}}",
        "agent": false,
        "synchronized": true,
        "method": "PATCH",
        "headers": {
          "Content-Type": "application/json",
          "Authorization": "OAuth {{.secrets._STATUSPAGE_API_KEY}}"
        },
        "body": {
          "component": {
            "status": "{{ .inputs.status }}"
          }
        }
      },
      "requiredApproval": false
    }
    ```
    </details>

5. Click `Save`.

Now you should see the `Create Statuspage Incident`, `Update Statuspage Incident` and `Update Statuspage Component Status` actions in the self-service page. 🎉


## Set up automation

We will create an automation to reflect incident changes in Port's software catalog. This ensures that our dashboards always show the most up-to-date information.

1. Go to the [Automations](https://app.getport.io/settings/automations) page of your portal.
2. Click on the `+ New Automation` button.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configurations into the editor while clicking `Save` for each configuration.

    <details>
    <summary><b>Statuspage incident creation automation (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "statuspage_incident_sync_status",
      "title": "Create Statuspage Incident in Port",
      "description": "Reflects Statuspage incident changes in Port",
      "trigger": {
        "type": "automation",
        "event": {
          "type": "RUN_UPDATED",
          "actionIdentifier": "create_statuspage_incident"
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
        "blueprintIdentifier": "statuspageIncident",
        "mapping": {
          "identifier": "{{.event.diff.after.response.id}}",
          "title": "{{.event.diff.after.response.name}}",
          "properties": {
            "status": "{{.event.diff.after.response.status}}",
            "impact": "{{.event.diff.after.response.impact}}",
            "createdAt": "{{.event.diff.after.response.created_at}}",
            "updatedAt": "{{.event.diff.after.response.updated_at}}",
            "startedAt": "{{.event.diff.after.response.started_at}}",
            "resolvedAt": "{{.event.diff.after.response.resolved_at}}",
            "shortlink": "{{.event.diff.after.response.shortlink}}",
            "scheduled_for": "{{.event.diff.after.response.scheduled_for}}",
            "scheduled_until": "{{.event.diff.after.response.scheduled_until}}",
            "scheduled_remind_prior": "{{.event.diff.after.response.scheduled_remind_prior}}",
            "scheduled_reminded_at": "{{.event.diff.after.response.scheduled_reminded_at}}",
            "impact_override": "{{.event.diff.after.response.impact_override}}",
            "scheduled_auto_in_progress": "{{.event.diff.after.response.scheduled_auto_in_progress}}",
            "scheduled_auto_completed": "{{.event.diff.after.response.scheduled_auto_completed}}",
            "metadata": "{{.event.diff.after.response.metadata}}",
            "reminder_intervals": "{{.event.diff.after.response.reminder_intervals}}",
            "postmortem_body": "{{.event.diff.after.response.postmortem_body}}",
            "postmortem_body_last_updated_at": "{{.event.diff.after.response.postmortem_body_last_updated_at}}",
            "postmortem_ignored": "{{.event.diff.after.response.postmortem_ignored}}",
            "postmortem_published_at": "{{.event.diff.after.response.postmortem_published_at}}",
            "postmortem_notified_subscribers": "{{.event.diff.after.response.postmortem_notified_subscribers}}",
            "postmortem_notified_twitter": "{{.event.diff.after.response.postmortem_notified_twitter}}"
          },
          "relations": {
            "statuspage": "{{.event.diff.after.response.page_id}}",
            "components": "{{.event.diff.after.response.components | map(.id)  }}"
          }
        }
      },
      "publish": true
    }
    ```
    </details>

    <details>
    <summary><b>Statuspage incident status update automation (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "statuspage_incident_update_sync_status",
      "title": "Update Statuspage Incident Status in Port",
      "description": "Reflect the status of the Statuspage incident in Port",
      "trigger": {
        "type": "automation",
        "event": {
          "type": "RUN_UPDATED",
          "actionIdentifier": "update_statuspage_incident"
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
        "blueprintIdentifier": "statuspageIncident",
        "mapping": {
          "identifier": "{{.event.diff.after.response.id}}",
          "properties": {
            "status": "{{.event.diff.after.response.status}}"
          }
        }
      },
      "publish": true
    }
    ```
    </details>


## Visualize metrics

With incidents and components ingested and actions configured, the next step is building dashboards to monitor Statuspage data directly in Port. We can visualize all incidents and components using customizable widgets and trigger remediation workflows right from your dashboard.

### Create a dashboard

1. Navigate to the [Catalog](https://app.getport.io/organization/catalog) page of your portal.
2. Click on the **`+ New`** button in the left sidebar.
3. Select **New dashboard**.
4. Name the dashboard **Statuspage Incident and Component Manager**.
5. Input `Monitor and manage Statuspage incidents and components across pages` under **Description**.
6. Select the `StatusPage` icon.
7. Click `Create`.

We now have a blank dashboard where we can start adding widgets to visualize insights from our Statuspage incidents and components.

### Add incident widgets

In the new dashboard, create the following incident-related widgets:

<details>
<summary><b>Total incidents created in the last month (click to expand)</b></summary>

1. Click `+ Widget` and select **Number Chart**.
2. Title: `Incidents in the past month` (add the `StatusPage` icon).
3. Select `Count entities` **Chart type** and choose **Statuspage Incident** as the **Blueprint**.
4. Select `count` for the **Function**.
5. Add this JSON to the **Additional filters** editor to filter incidents created in the last month:
    ```json showLineNumbers
    [
        {
            "combinator":"and",
            "rules":[
                {
                    "property":"createdAt",
                    "operator":"between",
                    "value":{
                    "preset":"lastMonth"
                    }
                }
            ]
        }
    ]
    ```
6. Select `custom` as the **Unit** and input `incidents` as the **Custom unit**
   <img src="/img/guides/totalStatuspageIncidents.png" width="50%"/>

7. Click `Save`.

</details>

<details>
<summary><b>Total resolved incidents (click to expand)</b></summary>

1. Click `+ Widget` and select **Number Chart**.
2. Title: `Resolved incidents` (add the `StatusPage` icon).
3. Select `Count entities` **Chart type** and choose **Statuspage Incident** as the **Blueprint**.
4. Select `count` for the **Function**.
5. Add this JSON to the **Additional filters** editor to filter `resolved` and `completed` incidents:
    ```json showLineNumbers
    [
        {
            "combinator":"and",
            "rules":[
                {
                    "property":"status",
                    "operator":"in",
                    "value":["resolved", "completed"]
                }
            ]
        }
    ]
    ```
6. Select `custom` as the **Unit** and input `incidents` as the **Custom unit**
    <img src="/img/guides/resolvedStatuspageIncidents.png" width="50%"/>

7. Click `Save`.

</details>

<details>
<summary><b>Total open incidents (click to expand)</b></summary>

1. Click `+ Widget` and select **Number Chart**.
2. Title: `Open incidents` (add the `StatusPage` icon).
3. Select `Count entities` **Chart type** and choose **Statuspage Incident** as the **Blueprint**.
4. Select `count` for the **Function**.
5. Add this JSON to the **Additional filters** editor to filter non-resolved incidents:
    ```json showLineNumbers
    [
        {
            "combinator":"and",
            "rules":[
                {
                    "property":"status",
                    "operator":"notIn",
                    "value":["resolved", "completed"]
                }
            ]
        }
    ]
    ```
6. Select `custom` as the **Unit** and input `incidents` as the **Custom unit**
    <img src="/img/guides/openStatuspageIncidents.png" width="50%"/>

7. Click `Save`.

</details>

<details>
<summary><b>Incidents by status (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Pie chart**.
2. Title: `Incidents by status` (add the `StatusPage` icon).
3. Choose the **Statuspage Incident** blueprint.
4. Under `Breakdown by property`, select the **Status** property
    <img src="/img/guides/statuspageIncidentsByStatus.png" width="50%" />

5. Click **Save**.

</details>

<details>
<summary><b>Incidents over time (click to expand)</b></summary>

1. Click `+ Widget` and select **Line Chart**.
2. Title: `Incidents over time`, (add the `LineChart` icon).
3. Select `Count Entities (All Entities)` **Chart type** and choose **Statuspage Incident** as the **Blueprint**.
4. Input `Number of incidents` as the **Y axis Title**.
5. Set `count` as the **Function**.
6. Input `Date` as the **X axis** **Title** and choose `createdAt` as the **Measure time by**.
7. Set **Time Interval** to `Week` and **Time Range** to `In the past 90 days`.

   <img src="/img/guides/statuspageIncidentsOverTime1.png"  width="50%"/>
   <img src="/img/guides/statuspageIncidentsOverTime2.png"  width="50%"/>

8. Click `Save`.

</details>

<details>
<summary><b>Create incident action (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Action card**.
2. Choose the **Create Statuspage Incident** action we created in this guide
    <img src="/img/guides/statuspageCreateIncidentAction.png" width="50%" />

3. Click **Save**.

</details>

<details>
<summary><b>All Incidents in the past month table (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Table**.
2. Title the widget **Incidents in the past month**.
3. Choose the **Statuspage Incident** blueprint
   <img src="/img/guides/allStatuspageIncidents.png" width="50%" />

4. Add this JSON to the **Additional filters** editor to filter incidents created in the last month:
    ```json showLineNumbers
    {
      "combinator": "and",
      "rules": [
        {
          "operator": "between",
          "property": "createdAt",
          "value": {
            "preset": "lastMonth"
          }
        },
        {
          "operator": "=",
          "value": "statuspageIncident",
          "property": "$blueprint"
        }
      ]
    }
    ```
5. Click **Save** to add the widget to the dashboard.
6. Click on the **`...`** button in the top right corner of the table and select **Customize table**.
7. In the top right corner of the table, click on `Manage Properties` and add the following properties:
    - **Status**: The current status of the incident.
    - **Impact**: The impact level of the incident
    - **Message**: The incident message.
    - **Created At**: The date the incident was created.
    - **Updated At**: The date the incident was last updated.
    - **Status Page**: The related Statuspage.
    - **Components**: The affected components.
8. Click on the **save icon** in the top right corner of the widget to save the customized table.

</details>


### Add component widgets

Now add the following component-related widgets to the same dashboard:

<details>
<summary><b>Total affected components (click to expand)</b></summary>

1. Click `+ Widget` and select **Number Chart**.
2. Title: `Affected components` (add the `StatusPage` icon).
3. Select `Count entities` **Chart type** and choose **Statuspage Component** as the **Blueprint**.
4. Select `count` for the **Function**.
5. Add this JSON to the **Additional filters** editor to filter non operational components:
    ```json showLineNumbers
    [
        {
            "combinator":"and",
            "rules":[
                {
                    "property":"status",
                    "operator":"!=",
                    "value":"operational"
                }
            ]
        }
    ]
    ```
6. Select `custom` as the **Unit** and input `components` as the **Custom unit**
   <img src="/img/guides/affectedStatuspageComponent.png" width="50%"/>

7. Click `Save`.

</details>

<details>
<summary><b>Total operational components (click to expand)</b></summary>

1. Click `+ Widget` and select **Number Chart**.
2. Title: `Total operational components` (add the `StatusPage` icon).
3. Select `Count entities` **Chart type** and choose **Statuspage Component** as the **Blueprint**.
4. Select `count` for the **Function**.
5. Add this JSON to the **Additional filters** editor to filter `operational` components:
    ```json showLineNumbers
    [
        {
            "combinator":"and",
            "rules":[
                {
                    "property":"status",
                    "operator":"=",
                    "value":"operational"
                }
            ]
        }
    ]
    ```
6. Select `custom` as the **Unit** and input `components` as the **Custom unit**
   <img src="/img/guides/totalOperationalComponent.png" width="50%"/>

7. Click `Save`.

</details>

<details>
<summary><b>Components by status (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Pie chart**.
2. Title: `Components by status` (add the `StatusPage` icon).
3. Choose the **Statuspage Component** blueprint.
4. Under `Breakdown by property`, select the **Current Status** property
    <img src="/img/guides/statuspageComponentByStatus.png" width="50%" />

5. Click **Save**.

</details>

<details>
<summary><b>All StatusPage components view (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Table**.
2. Title the widget **All Components**.
3. Choose the **Statuspage Component** blueprint
   <img src="/img/guides/allStatuspageComponents.png" width="50%" />

4. Click **Save** to add the widget to the dashboard.
5. Click on the **`...`** button in the top right corner of the table and select **Customize table**.
6. In the top right corner of the table, click on `Manage Properties` and add the following properties:
    - **Current Status**: The current status of the component.
    - **Description**: The description of the component.
    - **Last Updated At**: The date the component was last updated.
    - **Status Page**: The related Statuspage.
7. Click on the **save icon** in the top right corner of the widget to save the customized table.

</details>