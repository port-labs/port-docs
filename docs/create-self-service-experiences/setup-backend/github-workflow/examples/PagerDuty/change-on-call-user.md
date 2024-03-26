# Change the on-call In PagerDuty


This GitHub action allows you to quickly change who is on-call in PagerDuty via Port Actions with ease.

## Inputs
| Name                 | Description                                                                                          | Required | Default            |
|----------------------|------------------------------------------------------------------------------------------------------|----------|--------------------|
| start_time         | The start time for the override, in ISO 8601 format (e.g., 2023-01-01T01:00:00Z)     | true    | -                  |
| end_time              | The end time for the override, in ISO 8601 format (e.g., 2023-01-01T01:00:00Z)                                | true     | -                  |
| new_on_call_user_id              | The ID of the user who will be taking over the on-call duty                                                              | true    | -               |

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

  <summary>Port Action: Change On Call User</summary>
   :::tip
- `<GITHUB-ORG>` - your GitHub organization or user name.
- `<GITHUB-REPO-NAME>` - your GitHub repository name.
:::

```json showLineNumbers
{
  "identifier": "change_on_call_user",
  "title": "Change On-Call User",
  "icon": "pagerduty",
  "userInputs": {
    "properties": {
      "start_time": {
        "type": "string",
        "title": "Start Time",
        "description": "The start time for the override, in ISO 8601 format (e.g., 2023-01-01T01:00:00Z)",
        "icon": "pagerduty",
        "format": "date-time"
      },
      "end_time": {
        "title": "End Time",
        "description": "The end time for the override, in ISO 8601 format (e.g., 2023-01-01T01:00:00Z).",
        "icon": "pagerduty",
        "type": "string",
        "format": "date-time"
      },
      "new_on_call_user_id": {
        "icon": "pagerduty",
        "description": "The ID of the user who will be taking over the on-call duty",
        "title": "On Call User Id",
        "type": "string"
      }
    },
    "required": [
      "start_time",
      "end_time",
      "new_on_call_user_id"
    ],
    "order": [
      "start_time",
      "end_time",
      "new_on_call_user_id"
    ]
  },
    "invocationMethod": {
    "type": "GITHUB",
    "org": "<GITHUB-ORG>",
    "repo": "<GITHUB-REPO-NAME>",
    "workflow": "change-incident-owner.yaml",
    "omitUserInputs": false,
    "omitPayload": false,
    "reportWorkflowStatus": true
  },
  "trigger": "DAY-2",
  "description": "Change who is on call in pagerduty",
  "requiredApproval": false
}
```
</details>

5. Create a workflow file under `.github/workflows/change-on-call-user.yaml` with the following content:

<details>

  <summary>GitHub Workflow Script</summary>

```yaml showLineNumbers title="change-on-call-user.yaml"
name: Change Who is On Call In PagerDuty
on:
  workflow_dispatch:
    inputs:
      start_time:
        description: The start time for the override, in ISO 8601 format (e.g., 2023-01-01T01:00:00Z)
        required: true
        type: string
      end_time:
        description: The end time for the override, in ISO 8601 format (e.g., 2023-01-01T01:00:00Z).
        required: true
        type: string
      new_on_call_user_id:
        description: The ID of the user who will be taking over the on-call duty
        required: true
        type: string
      port_payload:
        required: true
        description: >-
          Port's payload, including details for who triggered the action and
          general context (blueprint, run id, etc...)

jobs:
  change-on-call-user:
    runs-on: ubuntu-latest
    steps:
      
      - name: Log Executing Request to Changing On-Call Owner
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(github.event.inputs.port_payload).context.runId}}
          logMessage: "Making request to pagerduty ..."

      - name: Request Schedule Override
        uses: fjogeleit/http-request-action@v1
        with:
          url: "https://api.pagerduty.com/schedules/${{fromJson(github.event.inputs.port_payload).context.entity}}/overrides"
          method: 'POST'
          customHeaders: '{"Content-Type": "application/json", "Accept": "application/json", "Authorization": "Token token=${{ secrets.PAGERDUTY_API_KEY }}"}'
          data: >-
            {
              "overrides": [
                {
                  "start": "${{ github.event.inputs.start_time }}",
                  "end": "${{ github.event.inputs.end_time }}",
                  "user": {
                    "id": "${{ github.event.inputs.new_on_call_user_id }}",
                    "type": "user_reference"
                  },
                  "time_zone": "UTC"
                }
              ]
            }

      - name: Log Before Requesting for Updated Schedule
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(github.event.inputs.port_payload).context.runId}}
          logMessage: "Getting updated schedule from pagerduty ..."

      - name: Request For Changed Schedule
        id: new_schedule
        uses: fjogeleit/http-request-action@v1
        with:
          url: 'https://api.pagerduty.com/schedules/${{fromJson(github.event.inputs.port_payload).context.entity}}'
          method: 'GET'
          customHeaders: '{"Content-Type": "application/json", "Accept": "application/json", "Authorization": "Token token=${{ secrets.PAGERDUTY_API_KEY }}"}'

      - name: Extract Users From New Schedule
        id: extract_users
        run: |
          USERS_JSON=$(echo '${{ steps.new_schedule.outputs.response }}' | jq -c '[.schedule.users[].summary]')
          echo "user_summaries=$USERS_JSON" >> $GITHUB_ENV
        shell: bash
  
      - name: Log Before Upserting Schedule to Port
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(github.event.inputs.port_payload).context.runId}}
          logMessage: "Ingesting updated schedule to port..."
          
      - name: UPSERT Entity
        uses: port-labs/port-github-action@v1
        with:
          identifier: "${{ fromJson(steps.new_schedule.outputs.response).schedule.id }}"
          title: "${{ fromJson(steps.new_schedule.outputs.response).schedule.name }}"
          blueprint: ${{fromJson(github.event.inputs.port_payload).context.blueprint}}
          properties: |-
            {
              "url": "${{ fromJson(steps.new_schedule.outputs.response).schedule.html_url }}",
              "timezone": "${{ fromJson(steps.new_schedule.outputs.response).schedule.time_zone }}",
              "description": "${{ fromJson(steps.new_schedule.outputs.response).schedule.description}}",
              "users": ${{ env.user_summaries }}
            }
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: UPSERT
          runId: ${{ fromJson(inputs.port_payload).context.runId }}

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

Congrats 🎉 You've successfully changed who is on call for the first time from Port!