---
displayed_sidebar: null
description: Learn how to trigger a ServiceNow incident in Port, ensuring prompt issue resolution and effective incident management.
---

# Trigger ServiceNow Incident

This GitHub action allows you to quickly trigger incidents in ServiceNow directly from Port using Port's self service actions.

## Prerequisites
1. [Port's GitHub app](https://github.com/apps/getport-io) needs to be installed.
2. ServiceNow instance URL, username and password. Head over to [ServiceNow](https://signon.service-now.com/x_snc_sso_auth.do?pageId=username) to get your credentials.
3. In your GitHub repository, [go to **Settings > Secrets**](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository) and add the following secrets:

    * `SERVICENOW_USERNAME` - ServiceNow instance username
    * `SERVICENOW_PASSWORD` - ServiceNow instance password.
    * `SERVICENOW_INSTANCE_URL` - ServiceNow instance URL.
    * `PORT_CLIENT_ID` - Port Client ID [learn more](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token).
    * `PORT_CLIENT_SECRET` - Port Client Secret [learn more](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token).

4. Optional - Install Port's ServiceNow integration [learn more](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/incident-management/servicenow).

:::tip ServiceNow integration

This step is not required for this example, but it will create all the blueprint boilerplate for you, and also update the catalog in real time with the new incident created.

:::

5. In case you decided not to install the ServiceNow integration, you will need to create a blueprint for the ServiceNow Incidet in Port.

<details>
<summary> <b> ServiceNow Incident Blueprint (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "servicenowIncident",
  "title": "Servicenow Incident",
  "icon": "Service",
  "schema": {
    "properties": {
      "category": {
        "title": "Category",
        "type": "string"
      },
      "reopenCount": {
        "title": "Reopen Count",
        "type": "string"
      },
      "severity": {
        "title": "Severity",
        "type": "string"
      },
      "assignedTo": {
        "title": "Assigned To",
        "type": "string",
        "format": "url"
      },
      "urgency": {
        "title": "Urgency",
        "type": "string"
      },
      "contactType": {
        "title": "Contact Type",
        "type": "string"
      },
      "createdOn": {
        "title": "Created On",
        "type": "string",
        "format": "date-time"
      },
      "createdBy": {
        "title": "Created By",
        "type": "string"
      },
      "isActive": {
        "title": "Is Active",
        "type": "boolean"
      },
      "priority": {
        "title": "Priority",
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

## GitHub Workflow

Create the file `trigger-servicenow-incident.yml` in the `.github/workflows` folder of your repository and copy the content of the workflow configuration below:

:::tip Dedicated repository
We recommend creating a dedicated repository for the workflows that are used by Port actions.
:::

<details>
<summary><b>Trigger ServiceNow Incident Workflow (Click to expand)</b></summary>

```yaml showLineNumbers
name: Create an incident in ServiceNow

on:
  workflow_dispatch:
    inputs:
      short_description:
        type: string
      assigned_to:
        type: string
      urgency:
        type: string
      sysparm_display_value:
        type: string
      sysparm_input_display_value:
        type: boolean
      port_payload:
        required: true
        description: "Port's payload, including details for who triggered the action and general context (blueprint, run id, etc...)"
        type: string

    secrets:
      SERVICENOW_USERNAME:
        required: true
      SERVICENOW_PASSWORD:
        required: true
      SERVICENOW_INSTANCE_URL:
        required: true
      PORT_CLIENT_ID:
        required: true
      PORT_CLIENT_SECRET:
        required: true

jobs:
  create-entity-in-port-and-update-run:
    outputs:
      id: formatted_date
      value: ${{ steps.format_date.outputs.formatted_date }}

    runs-on: ubuntu-latest
    steps:
      - name: Inform start of ServiceNow incident creation
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_payload).context.runId}}
          logMessage: Starting request to create ServiceNow incident

      - name: Create a ServiceNow incident
        id: servicenow_incident
        uses: fjogeleit/http-request-action@v1
        with:
          url: "${{ secrets.SERVICENOW_INSTANCE_URL }}/api/now/table/incident"
          method: "POST"
          username: ${{ secrets.SERVICENOW_USERNAME }}
          password: ${{ secrets.SERVICENOW_PASSWORD }}
          customHeaders: '{"Content-Type": "application/json"}'
          data: '{"short_description": "${{ inputs.short_description }}", "assigned_to": "${{ inputs.assigned_to }}", "urgency": "${{ inputs.urgency }}", "sysparm_display_value": "${{ inputs.sysparm_display_value }}", "sysparm_input_display_value": "${{ inputs.sysparm_input_display_value }}"}'

      - name: Inform completion of ServiceNow incident creation
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_payload).context.runId}}
          logMessage: Finished request to create ServiceNow incident

      - name: Inform start of ingesting ServiceNow incident into Port
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_payload).context.runId}}
          logMessage: Ingesting ServiceNow incident into Port

      - name: Convert createdOn to desired format
        id: format_date
        run: |
          original_date="${{ fromJson(steps.servicenow_incident.outputs.response).result.sys_created_on }}"
          formatted_date=$(date -d "${original_date}" -u +"%Y-%m-%dT%H:%M:%SZ")
          echo "formatted_date=${formatted_date}" >> $GITHUB_OUTPUT

      - name: UPSERT Entity
        uses: port-labs/port-github-action@v1
        with:
          identifier: ${{ fromJson(steps.servicenow_incident.outputs.response).result.number }}
          title: ${{ fromJson(steps.servicenow_incident.outputs.response).result.short_description }}
          blueprint: servicenowIncident
          properties: |-
            {
              "category": "${{ fromJson(steps.servicenow_incident.outputs.response).result.category }}",
              "reopenCount": "${{ fromJson(steps.servicenow_incident.outputs.response).result.reopen_count }}",
              "severity": "${{ fromJson(steps.servicenow_incident.outputs.response).result.severity }}",
              "assignedTo": "${{ fromJson(steps.servicenow_incident.outputs.response).result.assigned_to.link }}",
              "urgency": "${{ fromJson(steps.servicenow_incident.outputs.response).result.urgency }}",
              "contactType": "${{ fromJson(steps.servicenow_incident.outputs.response).result.contact_type }}",
              "createdOn": "${{ steps.format_date.outputs.formatted_date }}",
              "createdBy": "${{ fromJson(steps.servicenow_incident.outputs.response).result.sys_created_by }}",
              "isActive": "${{ fromJson(steps.servicenow_incident.outputs.response).result.active }}",
              "priority": "${{ fromJson(steps.servicenow_incident.outputs.response).result.priority }}"
            }
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: UPSERT
          runId: ${{ fromJson(inputs.port_payload).context.runId }}

      - name: Inform of workflow completion
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_payload).context.runId }}
          link: ${{ secrets.SERVICENOW_INSTANCE_URL }}/incident.do?sys_id=${{ fromJson(steps.servicenow_incident.outputs.response).result.sys_id }}
          logMessage: Finished ingesting ServiceNow incident into Port
```

</details>

## Port Configuration

On the [self-service](https://app.getport.io/self-serve) page, create the Port action against the `ServiceNow Incident` blueprint. This will trigger the GitHub workflow.

<details>
<summary><b>Trigger ServiceNow Incident Action (Click to expand)</b></summary>

:::tip Modification Required
Make sure to replace `<GITHUB_ORG>` and `<GITHUB_REPO>` with your GitHub organization and repository names respectively
:::

```json showLineNumbers
{
    "identifier": "trigger_servicenow_incident",
    "title": "Trigger ServiceNow incident",
    "icon": "Servicenow",
    "userInputs": {
      "properties": {
        "short_description": {
          "icon": "DefaultProperty",
          "title": "Short Description",
          "description": "Description of the event",
          "type": "string"
        },
        "sysparm_input_display_value": {
          "title": "Sysparm Input Display Value",
          "description": "Flag that indicates whether to set field values using the display value or the actual value.",
          "type": "boolean",
          "default": false
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
            "1": "lightGray",
            "2": "lightGray",
            "3": "lightGray"
          }
        },
        "assigned_to": {
          "icon": "DefaultProperty",
          "title": "Assigned To",
          "description": "User this incident is assigned to",
          "type": "string"
        },
        "sysparm_display_value": {
          "title": "Sysparm Display Value",
          "description": "Determines the type of data returned, either the actual values from the database or the display values of the fields.",
          "icon": "DefaultProperty",
          "type": "string",
          "default": "all",
          "enum": [
            "true",
            "false",
            "all"
          ],
          "enumColors": {
            "true": "lightGray",
            "false": "lightGray",
            "all": "lightGray"
          }
        }
      },
      "required": [
        "assigned_to",
        "short_description"
      ],
      "order": [
        "short_description",
        "assigned_to",
        "urgency",
        "sysparm_display_value",
        "sysparm_input_display_value"
      ]
    },
    "invocationMethod": {
      "type": "GITHUB",
      "org": "<GITHUB_ORG>",
      "repo": "<GITHUB_REPO>",
      "workflow": "trigger-servicenow-incident.yml",
      "omitUserInputs": false,
      "omitPayload": false,
      "reportWorkflowStatus": true
    },
    "trigger": "CREATE",
    "description": "Triggers an incident in ServiceNow",
    "requiredApproval": false
}
```

</details>

## Let's test it

1. Trigger the action from Port's [Self Serve hub](https://app.getport.io/self-serve)

2. Done! wait for the incident to be triggered in ServiceNow

Congrats 🎉 You've triggered your first incident in ServiceNow from Port!