---
displayed_sidebar: null
description: Follow this guide to create a PagerDuty service in Port, ensuring efficient incident management and response.
---

import GithubActionModificationHint from '/docs/guides/templates/github/_github_action_modification_required_hint.mdx'
import GithubDedicatedRepoHint from '/docs/guides/templates/github/_github_dedicated_workflows_repository_hint.mdx'
import PagerDutyServiceBlueprint from '/docs/guides/templates/pagerduty/_pagerduty_service_blueprint.mdx'

# Create a PagerDuty Service

## Overview
This self service guide provides a comprehensive walkthrough on how to create a service in Pagerduty from Port using Port's self service actions.

## Prerequisites
1. [Port's GitHub app](https://github.com/apps/getport-io) needs to be installed.
2. In your GitHub repository, [go to **Settings > Secrets**](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository) and add the following secrets:
   - `PAGERDUTY_API_KEY` - [PagerDuty API token](https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account) generated by the user.
   - `PORT_CLIENT_ID` - Your port `client id` [How to get the credentials](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#find-your-port-credentials).
   - `PORT_CLIENT_SECRET` - Your port `client secret` [How to get the credentials](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#find-your-port-credentials).
3. Optional - Install Port's PagerDuty integration [learn more](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/incident-management/pagerduty)

	:::tip PagerDuty Integration
	This step is not required for this example, but it will create all the blueprint boilerplate for you, and also ingest and update the catalog in real time with your PagerDuty Incidents.
	:::

4. In Case you decided not to install the PagerDuty integration, you will need to create a blueprint for PagerDuty service in Port.

<PagerDutyServiceBlueprint/>

## GitHub Workflow

Create the file `.github/workflows/acknowledge-incident.yaml` in the `.github/workflows` folder of your repository.

<GithubDedicatedRepoHint/>

<details>
<summary>GitHub Workflow</summary>

```yaml showLineNumbers title="create-service.yaml"
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
      port_context:
        required: true
        description: includes blueprint, run ID, and entity identifier from Port.

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
                "status": "active",
                "escalation_policy": {
                  "id": "${{ github.event.inputs.escalation_policy }}",
                  "type": "escalation_policy_reference"
                  }
                }
              }
          
      - name: Log Create Service Request Failure 
        if: failure()
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_context).run_id}}
          logMessage: "Request to create service failed ..."
          
      - name: Log Request Success
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_context).run_id}}
          logMessage: |
             PagerDuty service created! ✅
             Requesting for on-calls
    
      - name: Request for oncalls for Escalation Policy
        id: fetch_oncalls
        uses: fjogeleit/http-request-action@v1
        with:
          url: 'https://api.pagerduty.com/oncalls?include[]=users&escalation_policy_ids[]=${{ inputs.escalation_policy }}'
          method: 'GET'
          customHeaders: '{"Content-Type": "application/json", "Accept": "application/json", "Authorization": "Token token=${{ secrets.PAGERDUTY_API_KEY }}"}'

      - name: Extract User Emails
        if: steps.fetch_oncalls.outcome == 'success'
        id: extract_user_emails
        run: |
          echo "Extracting user emails..."
          EMAILS=$(echo '${{ steps.fetch_oncalls.outputs.response }}' | jq -c '[.oncalls[].user.email]')
          echo "Extracted emails: $EMAILS"
          echo "user_emails=${EMAILS}" >> $GITHUB_ENV

      - name: Log Fetch Oncalls Request Failure
        if: steps.fetch_oncalls.outcome == 'failure'
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_context).run_id}}
          logMessage: Failed to fetch on-calls ❌
          
      - name: Log Before Upserting Entity
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_context).run_id}}
          logMessage: |
              Upserting Created PagerDuty Entity

      - name: UPSERT PagerDuty Entity
        uses: port-labs/port-github-action@v1
        with:
          identifier: "${{ fromJson(steps.create_service_request.outputs.response).service.id }}" 
          title: "${{ fromJson(steps.create_service_request.outputs.response).service.summary }}"
          icon: pagerduty
          blueprint: "${{fromJson(inputs.port_context).blueprint}}"
          properties: |-
            {
              "status": "${{ fromJson(steps.create_service_request.outputs.response).service.status }}",
              "url": "${{ fromJson(steps.create_service_request.outputs.response).service.html_url }}",
              "oncall": ${{ env.user_emails }}
            }
          relations: "${{ toJson(fromJson(inputs.port_context).relations) }}"
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: UPSERT
          runId: ${{fromJson(inputs.port_context).run_id}}

      - name: Log After Upserting Entity
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_context).run_id}}
          logMessage: |
              Upserting was successful ✅
```
</details>

## Port Configuration

Create a new self service action using the following JSON configuration.

<details>
<summary><b> Create Service In PagerDuty (click to expand) </b></summary>

<GithubActionModificationHint/>

```json showLineNumbers
{
  "identifier": "pagerdutyService_create_service",
  "title": "Create Service",
  "icon": "pagerduty",
  "description": "Create PagerDuty Service",
  "trigger": {
    "type": "self-service",
    "operation": "CREATE",
    "userInputs": {
      "properties": {
        "name": {
          "title": "Name",
          "description": "Name of the PagerDuty Service",
          "icon": "pagerduty",
          "type": "string"
        },
        "description": {
          "title": "Description",
          "description": "Description of the PagerDuty Service",
          "icon": "pagerduty",
          "type": "string"
        },
        "escalation_policy": {
          "title": "Escalation Policy",
          "description": "PagerDuty Escalation Policy ID to apply",
          "icon": "pagerduty",
          "type": "string"
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
    "blueprintIdentifier": "pagerdutyService"
  },
  "invocationMethod": {
    "type": "GITHUB",
    "org": "<GITHUB_ORG>",
    "repo": "<GITHUB_REPO>",
    "workflow": "create-a-service.yaml",
    "workflowInputs": {
      "name": "{{.inputs.\"name\"}}",
      "description": "{{.inputs.\"description\"}}",
      "escalation_policy": "{{.inputs.\"escalation_policy\"}}",
      "port_context": {
        "blueprint": "{{.action.blueprint}}",
        "entity": "{{.entity.identifier}}",
        "run_id": "{{.run.id}}"
      }
    },
    "reportWorkflowStatus": true
  },
  "requiredApproval": false
}
```
</details>

Now you should see the `Create Service` action in the self-service page. 🎉

## Let's test it!

1. Head to the [Self Service hub](https://app.getport.io/self-serve)
2. Click on the `Create Service` action.
3. Enter the required data for `Name`, `Description` (optional), and `Escalation Policy`.
4. Click on `Execute`.
5. Done! wait for the incident's status to be changed in PagerDuty.

Congrats 🎉 You've created your first `service` in PagerDuty from Port! 🔥

## More Self Service PagerDuty Actions Examples
- [Acknowledge Incident](https://docs.port.io/actions-and-automations/setup-backend/github-workflow/examples/PagerDuty/acknowledge-incident)
- [Change On-Call User](https://docs.port.io/actions-and-automations/setup-backend/github-workflow/examples/PagerDuty/change-on-call-user)
- [Create PagerDuty incident](https://docs.port.io/actions-and-automations/setup-backend/github-workflow/examples/PagerDuty/create-pagerduty-incident)
- [Change PagerDuty incident owner](https://docs.port.io/actions-and-automations/setup-backend/github-workflow/examples/PagerDuty/change-pagerduty-incident-owner)
- [Escalate an incident](https://docs.port.io/actions-and-automations/setup-backend/github-workflow/examples/PagerDuty/escalate-an-incident)
- [Resolve an incident](https://docs.port.io/actions-and-automations/setup-backend/github-workflow/examples/PagerDuty/resolve-incident)
- [Trigger PagerDuty incident](https://docs.port.io/actions-and-automations/setup-backend/github-workflow/examples/PagerDuty/trigger-pagerduty-incident)
