# Escalate incident in PagerDuty


This GitHub action allows you to quickly escalate incident in PagerDuty via Port Actions with ease.

## Inputs
| Name                 | Description                                                                                          | Required | Default            |
|----------------------|------------------------------------------------------------------------------------------------------|----------|--------------------|
| escalation_policy_id         | PagerDuty Escalation Policy ID to apply     | true    | -                  |
| urgency              |  New urgency level for the incident (e.g., "high")                                | true     | -                  |
| from              | The email address of a valid user associated with the account making the request.                                                              | true    | -               |

## Steps

1. Create the following GitHub action secrets
* `PAGERDUTY_API_KEY` - PagerDuty API Key [learn more](https://support.pagerduty.com/docs/)
* `PORT_CLIENT_ID` - Port Client ID [learn more](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token)
* `PORT_CLIENT_SECRET` - Port Client Secret [learn more](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token) 

2. Install the Port GitHub app from [here](https://github.com/apps/getport-io/installations/new).
3. Install Port's pagerDuty integration [learn more](https://github.com/port-labs/Port-Ocean/tree/main/integrations/pagerduty)
  :::note
This above step is not required for this example, but it will create all the blueprint boilerplate for you, and also update the catalog in real time with the new incident created.
:::
4. After you installed the integration, the blueprints `pagerdutyService` and `pagerdutyIncident` will appear, create the following action with the following JSON file on the `pagerdutyIncident` blueprint:

<details>

  <summary>Port Action: Escalate Incident</summary>
   :::tip
- `<GITHUB-ORG>` - your GitHub organization or user name.
- `<GITHUB-REPO-NAME>` - your GitHub repository name.
:::

```json showLineNumbers

{
  "identifier": "escalate_incident",
  "title": "Escalate Incident",
  "icon": "pagerduty",
  "userInputs": {
    "properties": {
      "escalation_policy_id": {
        "title": "Escalation Policy ID",
        "description": "PagerDuty Escalation Policy ID to apply",
        "icon": "pagerduty",
        "type": "string"
      },
      "urgency": {
        "icon": "pagerduty",
        "title": "Urgency",
        "description": "New urgency level for the incident (e.g., \"high\")",
        "type": "string",
        "default": "low",
        "enum": [
          "high",
          "low"
        ],
        "enumColors": {
          "high": "orange",
          "low": "lightGray"
        }
      },
      "from": {
        "title": "From",
        "description": "The email address of a valid user associated with the account making the request.",
        "icon": "pagerduty",
        "type": "string"
      }
    },
    "required": [
      "escalation_policy_id",
      "urgency",
      "from"
    ],
    "order": [
      "escalation_policy_id",
      "urgency"
    ]
  },
  "invocationMethod": {
    "type": "GITHUB",
    "org": "my-org",
    "repo": "my-repo",
    "workflow": "ecalate-an-incident.yaml",
    "omitUserInputs": false,
    "omitPayload": false,
    "reportWorkflowStatus": true
  },
  "trigger": "DAY-2",
  "description": "Escalate a pagerduty incident",
  "requiredApproval": false
}
```
</details>

5. Create a workflow file under .github/workflows/escalate-an-incident.yaml with the following content:

<details>
  <summary>GitHub Workflow Script</summary>

```yaml showLineNumbers title="escalate-an-incident.yaml"
name: Escalate PagerDuty Incident

on:
  workflow_dispatch:
    inputs:
      escalation_policy_id:
        description: PagerDuty Escalation Policy ID to apply
        required: true
        type: string
      urgency:
        description: New urgency level for the incident (e.g., "high")
        required: false
        type: string
      from:
        description: The email address of a valid user associated with the account making the request.
        required: true
        type: string
      port_payload:
        required: true
        description: >-
          Port's payload, including details for who triggered the action and
          general context (blueprint, run id, etc...)

jobs:
  escalate-incident:
    runs-on: ubuntu-latest
    steps:
      - name: Inform execution of request to escalate incident
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(github.event.inputs.port_payload).context.runId}}
          logMessage: "About to escalate incident in PagerDuty..."

      - name: Escalate Incident in PagerDuty
        id: escalate_incident
        uses: fjogeleit/http-request-action@v1
        with:
          url: 'https://api.pagerduty.com/incidents/${{fromJson(github.event.inputs.port_payload).context.entity}}'
          method: 'PUT'
          customHeaders: '{"Content-Type": "application/json", "Accept": "application/vnd.pagerduty+json;version=2", "Authorization": "Token token=${{ secrets.PAGERDUTY_API_KEY }}", "From": "${{ github.event.inputs.from }}"}'
          data: >-
            {
              "incident": {
                "type": "incident_reference",
                "escalation_policy": {
                  "id": "${{ github.event.inputs.escalation_policy_id }}",
                  "type": "escalation_policy_reference"
                },
                "urgency": "${{ github.event.inputs.urgency }}"
              }
            }

      - name: Inform PagerDuty request failure
        if: failure()
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(github.event.inputs.port_payload).context.runId}}
          logMessage: "Request to escalate incident failed ..."

      - name: Inform ingestion of PagerDuty escalation to Port
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(github.event.inputs.port_payload).context.runId}}
          logMessage: "Reporting the escalated incident back to Port ..."

      - name: Upsert pagerduty entity to Port 
        uses: port-labs/port-github-action@v1
        with:
          identifier: ${{fromJson(github.event.inputs.port_payload).context.entity}}
          title: "${{ fromJson(steps.escalate_incident.outputs.response).incident.title }}"
          blueprint: "pagerdutyIncident"
          properties: |-
            {
              "status": "${{ fromJson(steps.escalate_incident.outputs.response).incident.status }}",
              "url": "${{ fromJson(steps.escalate_incident.outputs.response).incident.self }}",
              "urgency": "${{ fromJson(steps.escalate_incident.outputs.response).incident.urgency }}",
              "responder": "${{ fromJson(steps.escalate_incident.outputs.response).incident.assignments[0].assignee.summary}}",
              "escalation_policy": "${{ fromJson(steps.escalate_incident.outputs.response).incident.escalation_policy.summary }}",
              "created_at": "${{ fromJson(steps.escalate_incident.outputs.response).incident.created_at }}",
              "updated_at": "${{ fromJson(steps.escalate_incident.outputs.response).incident.updated_at }}"
            }
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: UPSERT
          runId: ${{ fromJson(inputs.port_payload).context.runId }}

      - name: Inform Entity upsert failure
        if: failure()
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(github.event.inputs.port_payload).context.runId}}
          logMessage: "Failed to report the escalated incident back to Port ..."

      - name: Inform completion of PagerDuty escalation process into Port
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(github.event.inputs.port_payload).context.runId}}
          logMessage: "Incident escalation process was successful ✅"
```
</details>

Congrats 🎉 You've successfully escalated an incident in PagerDuty from Port!