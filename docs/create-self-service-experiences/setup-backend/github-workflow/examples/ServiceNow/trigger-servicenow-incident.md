# Trigger ServiceNow Incident

This GitHub action allows you to quickly trigger incidents in ServiceNow via Port Actions with ease.

## Prerequisites
* ServiceNow instance URL, username and password. Head over to [ServiceNow](https://signon.service-now.com/x_snc_sso_auth.do?pageId=username) to get your credentials.
* [Port's GitHub app](https://github.com/apps/getport-io) installed.

## Steps

Follow these steps to get started with the Golang template

1. Create the following GitHub action secrets
* `SERVICENOW_USERNAME` - ServiceNow instance username
* `SERVICENOW_PASSWORD` - ServiceNow instance password.
* `SERVICENOW_INSTANCE_URL` - ServiceNow instance URL.
* `PORT_CLIENT_ID` - Port Client ID [learn more](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token).
* `PORT_CLIENT_SECRET` - Port Client Secret [learn more](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token).

2. Optional - Install Port's ServiceNow integration [learn more](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/itsm/servicenow).

:::note Blueprint

This step is not required for this example, but it will create all the blueprint boilerplate for you, and also update the catalog in real time with the new incident created.

:::

3. After you installed the integration, the blueprints `servicenowGroup`, `servicenowCatalog` and `servicenowIncident` will appear, create the following action with the following JSON file on the `servicenowIncident` blueprint:

<details>
<summary><b>Trigger ServiceNow Incident Blueprint (Click to expand)</b></summary>

```json showLineNumbers
[
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
      "org": "<Enter GitHub organization>",
      "repo": "<Enter GitHub repository>",
      "workflow": "trigger-servicenow-incident.yml",
      "omitUserInputs": false,
      "omitPayload": false,
      "reportWorkflowStatus": true
    },
    "trigger": "CREATE",
    "description": "Triggers an incident in ServiceNow",
    "requiredApproval": false
  }
]
```

</details>

:::note Customisation

Replace the invocation method with your own repository details.

:::

4. Create a workflow file under `.github/workflows/trigger-servicenow-incident.yml` with the content below:

<details>
<summary><b>Trigger ServiceNow Incident Workflow (Click to expand)</b></summary>

```yaml showLineNumbers
# Description: This workflow creates a ServiceNow incident and ingests it into Port
## Remove comments and edit for more fields as part of the ServiceNow incident

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

5. Trigger the action from Port's [Self Serve](https://app.getport.io/self-serve).

6. Done! wait for the incident to be trigger in ServiceNow.

Congrats 🎉 You've triggered your first incident in ServiceNow from Port!