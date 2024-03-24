# Trigger Opsgenie Incident
This GitHub action allows you to quickly trigger incidents in Opsgenie via Port Actions with ease.

## Prerequisites
* Opsgenie API Key. Head over to [API Key Management tab](https://getport-test.app.opsgenie.com/settings/api-key-management) on your Opsgenie account to create a new API key. The API key should have the `Create and Update` permission.
* [Port's GitHub app](https://github.com/apps/getport-io) installed.

## Steps

Follow these steps to get started with the Golang template

1. Create the following GitHub action secrets:
* `OPSGENIE_API_URL` - Opsgenie API URL (https://api.opsgenie.com or https://api.eu.opsgenie.com for EU accounts).
* `OPSGENIE_API_KEY` - Opsgenie API Key.
* `PORT_CLIENT_ID` - Port Client ID [learn more](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token).
* `PORT_CLIENT_SECRET` - Port Client Secret [learn more](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token).

2. Optional - Install Port's Opsgenie integration [learn more](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/incident-management/opsgenie).

:::note Blueprint

This step is not required for this example, but it will create all the blueprint boilerplate for you, and also update the catalog in real time with the new incident created.

:::

3. After you installed the integration, the blueprints `opsGenieService`, `opsGenieIncident` and `opsGenieAlert` will appear, create the following action with the following JSON file on the `opsGenieIncident` blueprint:

<details>
<summary><b>Trigger Opsgenie Incident Blueprint (Click to expand)</b></summary>

```json
[
  {
    "identifier": "trigger_opsgenie_incident",
    "title": "Trigger Opsgenie incident",
    "icon": "OpsGenie",
    "userInputs": {
      "properties": {
        "message": {
          "title": "Message",
          "description": "Message of the incident",
          "type": "string",
          "maxLength": 130
        },
        "description": {
          "title": "Description",
          "description": "Description field of the incident that is generally used to provide a detailed information about the incident.",
          "type": "string",
          "maxLength": 15000
        },
        "responders": {
          "items": {
            "type": "object"
          },
          "title": "Responders",
          "description": "Teams/users that the incident is routed to via notifications. type field is mandatory for each item, where possible values are team, user.",
          "type": "array"
        },
        "tags": {
          "items": {
            "type": "string",
            "maxLength": 50
          },
          "title": "Tags",
          "description": "Tags of the incident.",
          "type": "array"
        },
        "details": {
          "title": "Details",
          "description": "Map of key-value pairs to use as custom properties of the incident.",
          "type": "object"
        },
        "priority": {
          "title": "Priority",
          "description": "Priority level of the incident. Possible values are P1, P2, P3, P4 and P5. Default value is P3.",
          "type": "string",
          "default": "P3",
          "enum": [
            "P1",
            "P2",
            "P3",
            "P4",
            "P5"
          ],
          "enumColors": {
            "P1": "lightGray",
            "P2": "lightGray",
            "P3": "lightGray",
            "P4": "lightGray",
            "P5": "lightGray"
          }
        },
        "note": {
          "icon": "DefaultProperty",
          "title": "Note",
          "description": "Additional note that is added while creating the incident.",
          "type": "string",
          "maxLength": 25000
        },
        "impactedServices": {
          "title": "Impacted Services",
          "description": "Services on which incident will be created.",
          "icon": "OpsGenie",
          "type": "array",
          "items": {
            "type": "string",
            "format": "entity",
            "blueprint": "opsGenieService"
          }
        },
        "notifyStakeholders": {
          "title": "Notify Stakeholders",
          "description": "Indicate whether stakeholders are notified or not. Default value is false.",
          "type": "boolean",
          "default": false
        }
      },
      "required": [
        "message"
      ],
      "order": [
        "message",
        "description",
        "responders",
        "tags",
        "details",
        "priority",
        "note",
        "impactedServices",
        "notifyStakeholders"
      ]
    },
    "invocationMethod": {
      "type": "GITHUB",
      "repo": "<Enter GitHub repository>",
      "org": "<Enter GitHub organization>",
      "workflow": "trigger-opsgenie-incident.yml",
      "omitUserInputs": false,
      "omitPayload": false,
      "reportWorkflowStatus": true
    },
    "trigger": "CREATE",
    "description": "Triggers Opsgenie incident",
    "requiredApproval": false
  }
]
```
</details>

:::note Customisation

Replace the invocation method with your own repository details.

:::

4. Create a workflow file under .github/workflows/trigger-opsgenie-incident.yml with the content below:

<details>
<summary><b>Trigger Opsgenie Incident Workflow (Click to expand)</b></summary>

```yaml showLineNumbers
name: Trigger Opsgenie Incident

on:
  workflow_dispatch:
    inputs:
      message:
        type: string
      description:
        type: string
      responders:
        type: string
        default: '[]'
      tags:
        type: string
        default: '[]'
      details:
        type: string
        default: '{}'
      priority:
        type: string
      note:
        type: string
      impactedServices:
        type: string
        default: '[]'
      notifyStakeholders:
        type: boolean
      port_payload:
        required: true
        description: Port's payload, including details for who triggered the action and
          general context (blueprint, run id, etc...)
        type: string
    secrets:
      OPSGENIE_API_URL:
        required: true
      OPSGENIE_API_KEY:
        required: true
      PORT_CLIENT_ID:
        required: true
      PORT_CLIENT_SECRET:
        required: true
jobs:
  create-entity-in-port-and-update-run:
    runs-on: ubuntu-latest
    steps:
      - name: Inform start of Opsgenie incident creation
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_payload).context.runId}}
          logMessage: Starting request to create Opsgenie incident
      
      - name: Create a Opsgenie incident
        uses: fjogeleit/http-request-action@v1
        with:
          url: "${{ secrets.OPSGENIE_API_URL }}/v1/incidents/create"
          method: "POST"
          customHeaders: '{"Content-Type": "application/json", "Authorization": "GenieKey ${{ secrets.OPSGENIE_API_KEY }}"}'
          data: '{"message": "${{ inputs.message }}", "description": "${{ inputs.description }}", "responders": ${{ inputs.responders }}, "tags": ${{ inputs.tags }}, "details": ${{ inputs.details }}, "priority": "${{ inputs.priority }}", "note": "${{ inputs.note }}", "impactedServices": ${{ inputs.impactedServices }}, "notifyStakeholders": ${{ inputs.notifyStakeholders }}}'

      - name: Inform completion of Opsgenie incident creation
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_payload).context.runId}}
          logMessage: Finished request to create Opsgenie incident

      - name: Inform of workflow completion
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_payload).context.runId }}
          logMessage: Finished ingesting Opsgenie incident into Port
```

</details>

5. Trigger the action from Port's [Self Serve](https://app.getport.io/self-serve)

6. Done! wait for the incident to be trigger in Opsgenie

Congrats 🎉 You've triggered your first incident in Opsgenie from Port!