# Create PagerDuty Service Action

This GitHub action allows you to quickly create a service in PagerDuty via Port with ease.

## Inputs
| Name                 | Description                                                                                          | Required | Default            |
|----------------------|------------------------------------------------------------------------------------------------------|----------|--------------------|
| name         | A unique identifier or title used to reference and distinguish the service in PagerDuty     | true    | -                  |
| description              | A brief summary or explanation detailing the purpose or scope of the service in PagerDuty.                               | false     | -                  |
| escalation_policy              | A set of rules in PagerDuty that determines the sequence of notifications to team members in response to an incident, ensuring timely attention and action                                                              | true    | -               |



## Steps

1. Create the following GitHub action secrets:
* `PAGERDUTY_API_KEY` - PagerDuty API Key [learn more](https://support.pagerduty.com/docs/api-access-keys#section-generate-a-user-token-rest-api-key:~:text=the%20browser%20alert.-,Generate%20a%20User%20Token%20REST%20API%20Key,-%F0%9F%9A%A7).
* `PORT_CLIENT_ID` - Port Client ID [learn more](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token).
* `PORT_CLIENT_SECRET` - Port Client Secret [learn more](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token).

2. Install the Ports GitHub app from [here](https://github.com/apps/getport-io/installations/new).
3. Install Port's pager duty integration [learn more](https://github.com/port-labs/Port-Ocean/tree/main/integrations/pagerduty).

:::note Blueprint

This step is not required for this example, but it will create all the blueprint boilerplate for you, and also update the catalog in real time with the new incident created.

:::

4. After you installed the integration, the blueprints `pagerdutyService` and `pagerdutyIncident` will appear, create the following action with the following JSON file on the `pagerdutyService` blueprint:

<details>
<summary><b>Create PagerDuty Service Blueprint (Click to expand)</b></summary>

```json showLineNumbers

[
  {
    "identifier": "create_pagerduty_service",
    "title": "create_pagerduty_service",
    "icon": "pagerduty",
    "userInputs": {
      "properties": {
        "name": {
          "title": "name",
          "description": "Name of the PagerDuty Service",
          "icon": "pagerduty",
          "type": "string"
        },
        "description": {
          "title": "description",
          "description": "Description of the PagerDuty Service",
          "icon": "pagerduty",
          "type": "string"
        },
        "escalation_policy": {
          "title": "escalation_policy",
          "icon": "pagerduty",
          "type": "object"
        }
      },
      "required": [
        "name",
        "escalation_policy"
      ],
      "order": [
        "name",
        "description",
        "escalation_policy"
      ]
    },
    "invocationMethod": {
      "type": "GITHUB",
      "org": "my-org",
      "repo": "my-repo",
      "workflow": "create-a-service.yaml",
      "omitUserInputs": false,
      "omitPayload": false,
      "reportWorkflowStatus": true
    },
    "trigger": "CREATE",
    "description": "Create PagerDuty Service",
    "requiredApproval": false
  }
]

```

</details>

:::note Customisation

Replace the invocation method with your own repository details.

:::

5. Create a workflow file under `.github/workflows/create-a-service.yaml` with the following content:

<details>
<summary><b>Create PagerDuty Service Workflow (Click to expand)</b></summary>

```yaml showLineNumbers
name: Create PagerDuty Service
on:
  workflow_dispatch:
    inputs:
      name:
        description: 'Name of the PagerDuty Service'
        required: true
        type: string
      description:
        description: 'Description of the PagerDuty Service'
        required: false
        type: string
      escalation_policy:
        description: 'Escalation Policy for the service'
        required: true
        type: string

jobs:
  create-pagerduty-service:
    runs-on: ubuntu-latest
    steps:
      - name: Create Service in PagerDuty
        id : create_service_request
        uses: fjogeleit/http-request-action@v1
        with:
          url: 'https://api.pagerduty.com/services'
          method: 'POST'
          customHeaders: '{"Content-Type": "application/json", "Accept": "application/vnd.pagerduty+json;version=2", "Authorization": "Token token=${{ secrets.PAGERDUTY_API_KEY }}"}'
          data: >-
            {
              "service": {
                "name": "${{ github.event.inputs.name }}",
                "description": "${{ github.event.inputs.description }}",
                "escalation_policy": ${{ github.event.inputs.escalation_policy }}
              }
            } 

      - name: Create a log message
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_payload).context.runId}}
          logMessage: |
             PagerDuty service created! ✅
             Requesting for oncalls
    
      - name: Request for oncalls for escalation_policy
        id: fetch_oncalls
        uses: fjogeleit/http-request-action@v1
        with:
          url: 'https://api.pagerduty.com/oncalls?include[]=users&escalation_policy_ids[]=${{ fromJson(github.event.inputs.escalation_policy).id }}'
          method: 'GET'
          customHeaders: '{"Content-Type": "application/json", "Accept": "application/json", "Authorization": "Token token=${{ secrets.PAGERDUTY_API_KEY }}"}'

      - name: Create a log message
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_payload).context.runId}}
          logMessage: |
              Upserting Created PagerDuty Entity

      - name: UPSERT PagerDuty Entity
        uses: port-labs/port-github-action@v1
        with:
          identifier: "${{ fromJson(steps.create_service_request.outputs.response).service.id }}" 
          title: "${{ fromJson(steps.create_service_request.outputs.response).service.summary }}" 
          team: "[]"
          icon: pagerduty
          blueprint: pagerdutyService
          properties: |-
            {
              "status": "${{ fromJson(steps.create_service_request.outputs.response).service.status }}",
              "url": "${{ fromJson(steps.create_service_request.outputs.response).service.html_url }}",
              "oncall": "${{ fromJson(steps.fetch_oncalls).oncalls }}"
            }
          relations: "{}"
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: UPSERT
          runId: ${{fromJson(inputs.port_payload).context.runId}}

      - name: Create a log message
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_payload).context.runId}}
          logMessage: |
              Upsert was successful ✅

```

</details>

6. Trigger the action from Port's [Self Serve](https://app.getport.io/self-serve).

Congrats 🎉 You've created your first `service` in PagerDuty from Port!