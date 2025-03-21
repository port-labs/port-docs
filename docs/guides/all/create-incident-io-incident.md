---
displayed_sidebar: null
description: Learn how to create an incident.io incident in Port, ensuring timely resolution and effective incident management.
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Create an incident.io Incident

## Overview
This guide will help you implement a self-service action in Port that allows you to create incident.io incidents directly from Port using **synced webhooks**.
This functionality streamlines incident management by enabling users to create incidents without leaving Port.


## Prerequisites

- Complete the [onboarding process](/getting-started/overview).
- Access to your incident.io organization with permissions to manage incidents.

## Set up data model

You will need to manually create a blueprint for the incident.io incidents.  

### Create an incident.io incident blueprint

1. Go to your [Builder](https://app.getport.io/settings/data-model) page.
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.
4. Add this JSON schema:

    <details>
    <summary><b>Incident.io Incident Blueprint (Click to expand)</b></summary>

    ```json showLineNumbers
    {
    "identifier": "incidentIOIncident",
    "description": "This blueprint represents an incident.io incident",
    "title": "Incident.io Incident",
    "icon": "Alert",
    "schema": {
        "properties": {
        "url": {
            "type": "string",
            "title": "Incident URL",
            "format": "url"
        },
        "severity": {
            "title": "Severity",
            "type": "string"
        },
        "createdBy": {
            "title": "Created By",
            "type": "string"
        },
        "createdAt": {
            "title": "Created At",
            "type": "string",
            "format": "date-time"
        },
        "description": {
            "title": "Description",
            "type": "string"
        },
        "visibility": {
            "type": "string",
            "title": "Visibility",
            "enum": [
            "public",
            "private"
            ],
            "enumColors": {
            "public": "darkGray",
            "private": "darkGray"
            }
        },
        "status": {
            "type": "string",
            "title": "Status",
            "enum": [
            "Investigating",
            "Fixing",
            "Monitoring",
            "Closed",
            "Resolved",
            "Merged"
            ],
            "enumColors": {
            "Investigating": "red",
            "Fixing": "yellow",
            "Monitoring": "purple",
            "Closed": "darkGray",
            "Resolved": "green",
            "Merged": "green"
            }
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

5. Click "Save" to create the blueprint.

## Implementation

You can create incident.io incidents by leveraging Port's **synced webhooks** and **secrets** to directly interact with incident.io's API.

### Add Port secrets

To add these secrets to your portal:

1. Click on the `...` button in the top right corner of your Port application.

2. Click on **Credentials**.

3. Click on the `Secrets` tab.

4. Click on `+ Secret` and add the following secrets:
    - `INCIDENT_IO_API_KEY`: Your [incident.io API key](https://app.incident.io/settings/api-keys).


### Set up self-service action

Let's define a self-service action that is used to create an incident.io incident:

1. Head to the [self-service](https://app.getport.io/self-serve) page.
2. Click on the `+ New Action` button.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration into the editor.

    <details>
    <summary><b>Create incident.io Incident (Webhook) (Click to expand)</b></summary>

    ```json showLineNumbers
    {
    "identifier": "create_incident_io_incident_webhook",
    "title": "Create incident.io Incident (Webhook)",
    "icon": "Alert",
    "description": "Create a new incident.io incident",
    "trigger": {
        "type": "self-service",
        "operation": "CREATE",
        "userInputs": {
        "properties": {
            "name": {
            "type": "string",
            "title": "Name",
            "description": "The name or title of the incident"
            },
            "severity": {
            "icon": "DefaultProperty",
            "title": "Severity",
            "type": "string",
            "enum": [
                "Minor",
                "Major",
                "Critical"
            ],
            "enumColors": {
                "Minor": "blue",
                "Major": "orange",
                "Critical": "red"
            }
            },
            "description": {
            "type": "string",
            "title": "Description",
            "description": "Detailed description about the incident"
            },
            "visibility": {
            "type": "string",
            "title": "Visibility",
            "enum": [
                "public",
                "private"
            ],
            "enumColors": {
                "public": "turquoise",
                "private": "red"
            }
            }
        },
        "required": ["name", "severity", "visibility"],
        "order": [
            "name",
            "description",
            "severity",
            "visibility"
        ]
        }
    },
    "invocationMethod": {
        "type": "WEBHOOK",
        "url": "https://api.incident.io/v2/incidents",
        "agent": false,
        "synchronized": true,
        "method": "POST",
        "headers": {
        "Authorization": "Bearer {{.secrets.INCIDENT_IO_API_KEY}}",
        "Content-Type": "application/json"
        },
        "body": {
        "name": "{{.inputs.name}}",
        "severity_id": "{{ if .inputs.severity == \"Minor\" then \"01J53A3A1FNEEQKFGSDKETN6DJ\" elif .inputs.severity == \"Major\" then \"01J53A3A1F2RCGSQQQNA6NJ5CY\" elif .inputs.severity == \"Critical\" then \"01J53A3A1FGWNRNK1TMK9CWJJW\" else \"01J53A3A1FNEEQKFGSDKETN6DJ\" end }}",
        "summary": "{{.inputs.description}}",
        "visibility": "{{.inputs.visibility}}",
        "idempotency_key": "{{ now | tostring | @base64 }}"
        }
    },
    "requiredApproval": false
    }
    ```
    :::tip Extending Incident Severity Levels
    By default, incident.io provides three severity levels: `Minor`, `Major`, and `Critical`. However, your organization may have additional severity levels. To include them, use the [List Severity API](https://api-docs.incident.io/tag/Severities-V1#operation/Severities%20V1_List) to fetch all available severity levels. Then, update the `severity_id` values in the request body to match the correct IDs from the API response.
    :::
    </details>

5. Click `Save`.

Now you should see the `Create incident.io Incident (Webhook)` action in the self-service page. 🎉

### Create an automation to update your catalog

After each execution of the action, we would like to update the relevant entity in Port with the latest status.  

To achieve this, we can create an automation that will be triggered when the action completes successfully.

To create the automation:

1. Head to the [automation](https://app.getport.io/settings/automations) page.

2. Click on the `+ Automation` button.

3. Copy and paste the following JSON configuration into the editor.

    <details>
    <summary><b>Update incident.io incident in Port automation (Click to expand)</b></summary>

    ```json showLineNumbers
    {
    "identifier": "incident_io_incident_sync_status",
    "title": "Sync incident.io Incident Status",
    "description": "Update incident.io incident data in Port after creation",
    "trigger": {
        "type": "automation",
        "event": {
        "type": "RUN_UPDATED",
        "actionIdentifier": "create_incident_io_incident_webhook"
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
        "blueprintIdentifier": "incidentIOIncident",
        "mapping": {
        "identifier": "{{.event.diff.after.response.incident.id}}",
        "title": "{{.event.diff.after.response.incident.name}}",
        "properties": {
            "url": "{{.event.diff.after.response.incident.permalink}}",
            "status": "{{.event.diff.after.response.incident.incident_status.name}}",
            "severity": "{{.event.diff.after.response.incident.severity.name}}",
            "visibility": "{{.event.diff.after.response.incident.visibility}}",
            "description": "{{.event.diff.after.response.incident.summary}}",
            "createdBy": "{{.event.diff.after.response.incident.creator.api_key.name}}",
            "createdAt": "{{.event.diff.after.response.incident.created_at}}"
        },
        "relations": {}
        }
    },
    "publish": true
    }
    ```
    </details>

4. Click `Save`.

Now when you execute the webhook action, the incident data in Port will be automatically updated with the latest information from incident.io.


## Let's test it!

1. Head to the [self-service page](https://app.getport.io/self-serve) of your portal.

2. Choose the `Create incident.io Incident (Webhook)` action:

3. Enter the required information:
   - Incident name.
   - Description of the incident.
   - Severity level.
   - Visibility.

4. Click on `Execute`.

5. Done! Wait for the incident to be created in incident.io.
