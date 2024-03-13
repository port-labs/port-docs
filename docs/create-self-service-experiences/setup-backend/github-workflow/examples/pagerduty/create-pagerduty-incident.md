# Create PagerDuty Incident Action

This GitHub action allows you to quickly create incidents in PagerDuty via Port Actions with ease.

## Inputs
| Name                 | Description                                                                                          | Required | Default            |
|----------------------|------------------------------------------------------------------------------------------------------|----------|--------------------|
| token                | The Pager Duty Token to use to authenticate with the API with permissions to create incidents      | true     | -                  |
| portClientId         | The Port Client ID to use to authenticate with the API                                           | true     | -                  |
| portClientSecret     | The Port Client Secret to use to authenticate with the API                                       | true     | -                  |
| blueprintIdentifier | The blueprint identifier to use to populate the Port relevant entity                              | false    | pagerdutyIncident |
| incidentTitle        | The title of the incident to create                                                                | true     | -                  |
| extraDetails         | Extra details about the incident to create                                                        | false    | -                  |
| service              | The service id to correlate the incident to                                                       | true     | -                  |
| urgency              | The urgency of the incident to create                                                              | false    | high               |
| actorEmail           | The email of the actor to create the incident with                                                | true     | -                  |
| portRunId            | Port run ID to came from triggering the action                                                    | true     | -                  |


## Steps

Follow these steps to get started with the Golang template:

1. Create the following GitHub action secrets:
* `PAGER_TOKEN` - a token with permission to create incidents [learn more](https://support.pagerduty.com/docs/generating-api-keys#section-generating-a-personal-rest-api-key).
* `PORT_CLIENT_ID` - Port Client ID [learn more](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token).
* `PORT_CLIENT_SECRET` - Port Client Secret [learn more](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token).

2. Install the Ports GitHub app from [here](https://github.com/apps/getport-io/installations/new).
3. Install Port's pager duty integration [learn more](https://github.com/port-labs/Port-Ocean/tree/main/integrations/pagerduty).

:::note Blueprint

This step is not required for this example, but it will create all the blueprint boilerplate for you, and also update the catalog in real time with the new incident created.

:::

4. After you installed the integration, the blueprints `pagerdutyService` and `pagerdutyIncident` will appear, create the following action with the following JSON file on the `pagerdutyService` blueprint:

<details>
<summary><b>Create PagerDuty Incident Blueprint (Click to expand)</b></summary>

```json showLineNumbers
[
  {
    "identifier": "trigger_incident",
    "title": "Trigger Incident",
    "icon": "pagerduty",
    "userInputs": {
      "properties": {
        "title": {
          "icon": "DefaultProperty",
          "title": "Title",
          "type": "string"
        },
        "extra_details": {
          "title": "Extra Details",
          "type": "string"
        },
        "urgency": {
          "icon": "DefaultProperty",
          "title": "Urgency",
          "type": "string",
          "default": "high",
          "enum": [
            "high",
            "low"
          ],
          "enumColors": {
            "high": "yellow",
            "low": "green"
          }
        },
        "from": {
          "title": "From",
          "icon": "TwoUsers",
          "type": "string",
          "format": "user",
          "default": {
            "jqQuery": ".user.email"
          }
        }
      },
      "required": [
        "title",
        "urgency",
        "from"
      ],
      "order": [
        "title",
        "urgency",
        "from",
        "extra_details"
      ]
    },
    "invocationMethod": {
      "type": "GITHUB",
      "omitPayload": false,
      "omitUserInputs": true,
      "reportWorkflowStatus": true,
      "org": "port-pagerduty-example",
      "repo": "test",
      "workflow": "create-an-incident.yaml"
    },
    "trigger": "DAY-2",
    "description": "Notify users and teams about incidents in the service",
    "requiredApproval": false
  }
]
```

:::note Customisation

Replace the invocation method with your own repository details.

:::

</details>

5. Create a workflow file under .github/workflows/create-an-incident.yaml with the following content:

<details>
<summary><b>Create PagerDuty Incident Workflow (Click to expand)</b></summary>

```yaml showLineNumbers
on:
  workflow_dispatch:
    inputs:
      port_payload:
        required: true
        description: "Port's payload, including details for who triggered the action and general context (blueprint, run id, etc...)"
        type: string
    secrets: 
      PAGER_TOKEN: 
        required: true
      PORT_CLIENT_ID:
        required: true
      PORT_CLIENT_SECRET:
        required: true
jobs: 
  trigger:
    runs-on: ubuntu-latest
    steps:
      - uses: port-labs/pagerduty-incident-gha@v1
        with:
          portClientId: ${{ secrets.PORT_CLIENT_ID }}
          portClientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          token: ${{ secrets.PAGER_TOKEN }}
          portRunId: ${{ fromJson(inputs.port_payload).context.runId }}
          incidentTitle: ${{ fromJson(inputs.port_payload).payload.properties.title }}
          extraDetails: ${{ fromJson(inputs.port_payload).payload.properties.extra_details }}
          urgency: ${{ fromJson(inputs.port_payload).payload.properties.urgency }}
          service: ${{ fromJson(inputs.port_payload).context.entity }}
          blueprintIdentifier: 'pagerdutyIncident'
```

</details>

6. Trigger the action from Port's [Self Serve](https://app.getport.io/self-serve)
![image](https://github.com/port-labs/pagerduty-incident-gha/assets/51213812/2cda51d4-4594-4f47-9ef4-3b2419b0351a).

7. Done! wait for the incident to be created in Pager Duty
![image](https://github.com/port-labs/pagerduty-incident-gha/assets/51213812/74cb8aad-e426-4ab1-b388-74b80a5d2eb1).

Congrats 🎉 You've created your first incident in PagerDuty from Port!

