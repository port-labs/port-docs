# Acknowledge Incident In PagerDuty

This GitHub action allows you to quickly acknowledge incident in PagerDuty via Port Actions with ease.

## Inputs
| Name                 | Description                                                                                          | Required | Default            |
|----------------------|------------------------------------------------------------------------------------------------------|----------|--------------------
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
  <summary>Port Action: Acknowledge Incident</summary>
   :::tip
- `<GITHUB-ORG>` - your GitHub organization or user name.
- `<GITHUB-REPO-NAME>` - your GitHub repository name.
:::

```json showLineNumbers
{
  "identifier": "acknowledge_incident",
  "title": "Acknowledge Incident",
  "icon": "pagerduty",
  "userInputs": {
    "properties": {
      "from": {
        "icon": "pagerduty",
        "title": "From",
        "description": "User Email",
        "type": "string"
      }
    },
    "required": [],
    "order": [
      "from"
    ]
  },
  "invocationMethod": {
    "type": "GITHUB",
    "org": "<GITHUB-ORG>",
    "repo": "<GITHUB-REPO-NAME>",
    "workflow": "acknowledge-incidents.yaml",
    "omitUserInputs": false,
    "omitPayload": false,
    "reportWorkflowStatus": true
  },
  "trigger": "DAY-2",
  "description": "Acknowledge incident in pagerduty",
  "requiredApproval": false
}
```
</details>

5. Create a workflow file under `.github/workflows/acknowledge-incident.yaml` with the following content:

<details>

  <summary>GitHub Workflow Script</summary>

```yaml showLineNumbers title="acknowledge-incident.yaml"
name: Acknowledge Incident In PagerDuty
on:
  workflow_dispatch:
    inputs:
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
  acknowledge_incident:
    runs-on: ubuntu-latest
    steps:
      - name: Log Executing Request to Acknowledge Incident
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(github.event.inputs.port_payload).context.runId}}
          logMessage: "About to make a request to pagerduty..."

      - name: Request to Acknowledge Incident
        id: acknowledge_incident
        uses: fjogeleit/http-request-action@v1
        with:
          url: 'https://api.pagerduty.com/incidents'
          method: 'PUT'
          customHeaders: '{"Content-Type": "application/json", "Accept": "application/vnd.pagerduty+json;version=2", "Authorization": "Token token=${{ secrets.PAGERDUTY_API_KEY }}", "From": "${{ github.event.inputs.from }}"}'
          data: >-
              {
                "incidents": [
                  {
                    "id": "${{ fromJson(inputs.port_payload).context.entity }}",
                    "type": "incident_reference",
                    "status": "acknowledged"
                  }
                ]
              }

      - name: Log Acknowledge Incident Request Failure 
        if: failure()
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(github.event.inputs.port_payload).context.runId}}
          logMessage: "Request to acknowledge incident failed ..."

      - name: Log Before Processing Incident Response
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(github.event.inputs.port_payload).context.runId}}
          logMessage: "Getting incident object from response received ..."

      - name: Log Before Upserting Entity
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(github.event.inputs.port_payload).context.runId}}
          logMessage: "Reporting the updated incident back to port ..."

      - name: UPSERT Entity
        uses: port-labs/port-github-action@v1
        with:
          identifier: "${{ fromJson(steps.acknowledge_incident.outputs.response).incidents[0].id }}"
          title: "${{ fromJson(steps.acknowledge_incident.outputs.response).incidents[0].title }}"
          blueprint: ${{ fromJson(inputs.port_payload).context.blueprint }}
          properties: |-
            {
              "status": "${{ fromJson(steps.acknowledge_incident.outputs.response).incidents[0].status }}",
              "url": "${{ fromJson(steps.acknowledge_incident.outputs.response).incidents[0].self }}",
              "urgency": "${{ fromJson(steps.acknowledge_incident.outputs.response).incidents[0].urgency }}",
              "responder": "${{ fromJson(steps.acknowledge_incident.outputs.response).incidents[0].assignments[0].assignee.summary}}",
              "escalation_policy": "${{ fromJson(steps.acknowledge_incident.outputs.response).incidents[0].escalation_policy.summary }}",
              "created_at": "${{ fromJson(steps.acknowledge_incident.outputs.response).incidents[0].created_at }}",
              "updated_at": "${{ fromJson(steps.acknowledge_incident.outputs.response).incidents[0].updated_at }}"
            }
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: UPSERT
          runId: ${{ fromJson(inputs.port_payload).context.runId }}

      - name: Log Upsert Entity Failure 
        if: failure()
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(github.event.inputs.port_payload).context.runId}}
          logMessage: "Failed to upsert pagerduty incident to port ..."

      - name: Log After Upserting Entity
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(github.event.inputs.port_payload).context.runId}}
          logMessage: "Entity upserting was successful ✅"
```
</details>

Congrats 🎉 You've successfully acknowledged an incident in PagerDuty from Port!
