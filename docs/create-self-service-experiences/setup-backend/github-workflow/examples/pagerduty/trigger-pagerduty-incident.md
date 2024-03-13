# Trigger A PagerDuty Incident Action

This GitHub action allows you to quickly trigger incidents in PagerDuty via Port Actions with ease.

## Inputs
| Name                 | Description                                                                                          | Required | Default            |
|----------------------|------------------------------------------------------------------------------------------------------|----------|--------------------|
| payload         | Fields adding additional context about the location, impact, and character of the PagerDuty event.     | false    | -                  |
| routing_key              | The GUID of one of your PagerDuty Events API V2 integrations                                | true     | -                  |
| event_action              | The type of event. Can be trigger, acknowledge or resolve                                                              | false    | -               |
| dedup_key              | Identifies the alert to trigger, acknowledge, or resolve                                                             | true unless the event_type is trigger    | -               | 


## Steps

Follow these steps to get started:

1. Create the following GitHub action secrets:
* `PORT_CLIENT_ID` - Port Client ID [learn more](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token).
* `PORT_CLIENT_SECRET` - Port Client Secret [learn more](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token).

2. Install the Ports GitHub app from [here](https://github.com/apps/getport-io/installations/new).
3. Install Port's pager duty integration [learn more](https://github.com/port-labs/Port-Ocean/tree/main/integrations/pagerduty).

:::note Blueprint

>**Note** This step is not required for this example, but it will create all the blueprint boilerplate for you, and also update the catalog in real time with the new incident created.

:::

4. After you installed the integration, the blueprints `pagerdutyService` and `pagerdutyIncident` will appear, create the following action with the following JSON file on the `pagerdutyService` blueprint:

<details>
<summary><b>Trigger Pagerduty Incident Blueprint (Click to expand)</b></summary>

```json showLineNumbers
[
  {
    "identifier": "trigger_an_incident",
    "title": "trigger_an_incident",
    "icon": "pagerduty",
    "userInputs": {
      "properties": {
        "payload": {
          "title": "payload",
          "icon": "pagerduty",
          "type": "object"
        },
        "event_action": {
          "icon": "pagerduty",
          "title": "event_action",
          "type": "string"
        },
        "routing_key": {
          "icon": "pagerduty",
          "title": "routing_key",
          "type": "string"
        }
      },
      "required": [
        "routing_key",
        "event_action",
        "payload"
      ],
      "order": [
        "routing_key",
        "event_action",
        "payload"
      ]
    },
    "invocationMethod": {
      "type": "GITHUB",
      "org": "my-org-name",
      "repo": "my-repo",
      "workflow": "trigger-pagerduty-incident.yaml",
      "omitUserInputs": false,
      "omitPayload": false,
      "reportWorkflowStatus": true
    },
    "trigger": "DAY-2",
    "description": "Trigger a pagerduty incident using self service",
    "requiredApproval": false
  }
]

```
</details>

:::note Customisation

Replace the invocation method with your own repository details.

:::

5. Create a workflow file under `.github/workflows/create-an-incident.yaml` with the following content:

<details>
<summary><b>Trigger Pagerduty Incident Workflow (Click to expand)</b></summary>

```yaml showLineNumbers
name: Trigger an Incident In PagerDuty
on:
  workflow_dispatch:
    inputs:
      payload:
        type: string
      event_action:
        type: string
      routing_key:
        type: string
      port_payload:
        required: true
        description: Port's payload, including details for who triggered the action and
          general context (blueprint, run id, etc...)
        type: string
jobs:
  create-entity-in-port-and-update-run:
    runs-on: ubuntu-latest
    steps: 

      - name: Inform starting of PagerDuty trigger 
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_payload).context.runId }}
          logMessage: |
              About to trigger PagerDuty incident.. ⛴️
      - name: Send Event to PagerDuty
        id: trigger
        uses: fjogeleit/http-request-action@v1
        with:
          url: 'https://events.pagerduty.com/v2/enqueue'
          method: 'POST'
          customHeaders: '{"Content-Type": "application/json", "Accept": "application/json"}'
          data: >-
            {
              "payload": ${{ github.event.inputs.payload }},
              "event_action": "${{ github.event.inputs.event_action }}",
              "routing_key": "${{ github.event.inputs.routing_key }}"
            }  
      - name: Create a log message
        id: log-response
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_payload).context.runId}}
          logMessage: |
             PagerDuty incident triggered! ✅
             "The incident id is: ${{ steps.trigger.outputs}}"
```

</details>

6. Trigger the action from Port's [Self Serve](https://app.getport.io/self-serve).

Congrats 🎉 You've created your first incident in PagerDuty from Port!