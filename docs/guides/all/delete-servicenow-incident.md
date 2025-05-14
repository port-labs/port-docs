---
displayed_sidebar: null
description: Learn how to delete a ServiceNow incident in Port, ensuring your catalog is clean and synchronized with your ServiceNow environment.
---

import ExistingSecretsCallout from '/docs/guides/templates/secrets/_existing_secrets_callout.mdx'
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Delete a ServiceNow incident

## Overview
This guide demonstrates how to implement a self-service action in Port that deletes ServiceNow incidents directly from Port using **synced webhooks**.
By combining synced webhooks with Port's automation, you can keep your software catalog clean and synchronized with your ServiceNow environment.


## Prerequisites

- Complete the [onboarding process](/getting-started/overview).
- Access to your ServiceNow account with permissions to manage incidents.
- Install Port's [ServiceNow integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/incident-management/servicenow).


## Set up data source mapping

By default, the `identifier` of the `incident` kind is mapped to the incident number (`.number`). However, deleting records in ServiceNow via API requires the system's internal ID (`.sys_id`). To fix this:

1. Go to the [Data Sources](https://app.getport.io/settings/data-sources) page of your portal.
2. Select the ServiceNow integration.
3. Add the following YAML block into the editor to update the incident data:

    <details>
    <summary><b>Updated ServiceNow integration configuration (Click to expand)</b></summary>
    ```yaml showLineNumbers
    resources:
    - kind: incident
        selector:
        query: 'true'
        apiQueryParams:
            sysparmDisplayValue: 'true'
            sysparmExcludeReferenceLink: 'false'
        port:
        entity:
            mappings:
            # highlight-next-line
            identifier: .sys_id
            title: .short_description
            blueprint: '"servicenowIncident"'
            properties:
                category: .category
                reopenCount: .reopen_count
                severity: .severity
                assignedTo: .assigned_to.link
                urgency: .urgency
                contactType: .contact_type
                createdOn: '.sys_created_on | (strptime("%Y-%m-%d %H:%M:%S") | strftime("%Y-%m-%dT%H:%M:%SZ"))'
                createdBy: .sys_created_by
                isActive: .active
                priority: .priority
    ```
    </details>
    
4. Click `Save & Resync` to apply the mapping.


## Implementation

You can delete ServiceNow incident by leveraging Port's **synced webhooks** and **secrets** to directly interact with ServiceNow's Table API.

### Add Port secrets

To add a secret to your portal:

1. Click on the `...` button in the top right corner of your Port application.

2. Click on **Credentials**.

3. Click on the `Secrets` tab.

4. Click on `+ Secret` and add the following secrets:
    - `SERVICENOW_INSTANCE_URL` - The ServiceNow instance URL. For example https://example-id.service-now.com.
    - `SERVICENOW_API_TOKEN`: A base64 encoded string of your servicenow credentials generated as:
    
        ```bash showLineNumbers
        echo -n "your-username:your-password" | base64
        ```

### Set up self-service action

1. Head to the [self-service](https://app.getport.io/self-serve) page.
2. Click on the `+ New Action` button.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration into the editor.

    <details>
    <summary><b>Delete ServiceNow Incident (Click to expand)</b></summary>

    ```json showLineNumbers
    {
        "identifier": "delect_servicenow_incident",
        "title": "Delect ServiceNow Incident",
        "icon": "Servicenow",
        "description": "Deletes an incident from the ServiceNow incident table using a unique system ID",
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
            "url": "{{.secrets.SERVICENOW_INSTANCE_URL}}/api/now/table/incident/{{.entity.identifier}}",
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

Now you should see the `Delect ServiceNow Incident` action in the [self-service](https://app.getport.io/self-serve) page. 🎉

### Create an automation to remove entity from Port

Once the incident is deleted from ServiceNow, we want to automatically remove the corresponding entity in Port. To achieve this behaviour:

1. Head to the [automations](https://app.getport.io/settings/automations) page.

2. Click on the `+ Automation` button.

3. Copy and paste the following JSON configuration into the editor.

    <details>
    <summary><b>Delete ServiceNow incident in Port automation (Click to expand)</b></summary>

    ```json showLineNumbers
    {
        "identifier": "servicenow_incident_delete_sync_status",
        "title": "Remove Deleted Incident from Port",
        "description": "Removes the deleted entity in Port when after it is deleted from ServiceNow",
        "trigger": {
            "type": "automation",
            "event": {
            "type": "RUN_UPDATED",
            "actionIdentifier": "delect_servicenow_incident"
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
            "type": "WEBHOOK",
            "url": "https://api.port.io/v1/blueprints/{{.event.diff.after.blueprint.identifier}}/entities/{{.event.diff.after.entity.identifier}}",
            "agent": false,
            "synchronized": true,
            "method": "DELETE",
            "headers": {
            "RUN_ID": "{{.event.diff.after.id}}",
            "Content-Type": "application/json",
            "Accept": "application/json"
            },
            "body": {}
        },
        "publish": true
    }
    ```
    </details>

4. Click `Save`.

Now, whenever a user runs the `Delete ServiceNow Incident` action:

1. The incident is deleted directly from ServiceNow via webhook.
2. The corresponding entity in Port is automatically removed, keeping your catalog clean and consistent.
