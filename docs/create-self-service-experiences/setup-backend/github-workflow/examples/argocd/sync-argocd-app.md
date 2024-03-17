---
sidebar_position: 1
---
import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortTooltip from "/src/components/tooltip/tooltip.jsx";

# Synchronize ArgoCD Application

In the following guide, we are going to create a self-service action in Port that executes a [GitHub workflow](/create-self-service-experiences/setup-backend/github-workflow/github-workflow.md) to sync an argocd application.


## Prerequisites
1. This guide assumes that you already have a blueprint for an ArgoCD Application with some resources. If you haven't done so yet, create the blueprint by referring to this [guide](/build-your-software-catalog/sync-data-to-catalog/kubernetes/argocd#application) first.
2. Prior knowledge of Port Actions is essential for following this guide. Learn more about them [here](/create-self-service-experiences/setup-ui-for-action/).
3. A GitHub repository to contain your action resources i.e. the github workflow file.


## Steps


Follow these steps to get started:

1. Create the following GitHub Action secrets:
    1. `ARGOCD_TOKEN` - Argocd token [learn more](https://argo-cd.readthedocs.io/en/stable/developer-guide/api-docs/)
    2. `PORT_CLIENT_ID` - Port Client ID [learn more](/build-your-software-catalog/custom-integration/api/#get-api-token).
    3. `PORT_CLIENT_SECRET` - Port Client Secret [learn more](/build-your-software-catalog/custom-integration/api/#get-api-token).

2. Install Port's GitHub app by clicking [here](https://github.com/apps/getport-io/installations/new).

3. Create Port action using the following JSON definition:

<details>
<summary>Port Action: Sync ArgoCD Application </summary>
:::note
Replace the placeholders for GITHUB_ORG_NAME and GITHUB_REPO_NAME in your Port Action to match your GitHub environment.
:::

```json showLineNumbers
[
{
  "identifier": "sync_application",
  "title": "Sync Application",
  "icon": "Argo",
  "userInputs": {
    "properties": {
      "application_name": {
        "title": "Application Name",
        "description": "ArgoCD Application Name",
        "icon": "Argo",
        "type": "string",
        "default": {
          "jqQuery": ".entity.title"
        }
      },
      "application_host": {
        "icon": "Argo",
        "title": "Application Host",
        "description": "ArgoCD Application Host. e.g app.example.com",
        "type": "string"
      }
    },
    "required": [
      "application_host",
      "application_name"
    ],
    "order": [
      "application_host",
      "application_name"
    ]
  },
  "invocationMethod": {
    "type": "GITHUB",
    "org": "<GITHUB_ORG_NAME>",
    "repo": "<GITHUB_REPO_NAME>"
    "workflow": "sync-argocd-app.yaml",
    "omitUserInputs": false,
    "omitPayload": false,
    "reportWorkflowStatus": true
  },
  "trigger": "DAY-2",
  "description": "Sync An ArgoCD Application",
  "requiredApproval": false
}  
]
```
</details>

4. Create a workflow file under `.github/workflows/sync-argocd-app.yaml` with the following content:

<details>
 <summary>GitHub Workflow </summary>

```yml showLineNumbers
name: Sync ArgoCD Application
on:
  workflow_dispatch:
    inputs:
      application_name:
        description: The ArgoCD Application Name. e.g. app.example.com
        required: true
      application_host:
        description: The ArgoCD Application host.
        required: true
        type: string
      port_payload:
        required: true
        description: >-
          Port's payload, including details for who triggered the action and
          general context (blueprint, run id, etc...)

jobs:
  sync-argocd-app:
    runs-on: ubuntu-latest
    steps:
      - name: Log Executing Request to Sync Application
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(github.event.inputs.port_payload).context.runId}}
          logMessage: "About to make a request to argocd server..."

      - name: Sync ArgoCD Application
        uses: omegion/argocd-actions@v1
        with:
          address: ${{ github.event.inputs.application_host }}
          token: ${{ secrets.ARGOCD_TOKEN }}
          action: sync
          appName: ${{ github.event.inputs.application_name }}

      - name: Log If Request Fails 
        if: failure()
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(github.event.inputs.port_payload).context.runId}}
          logMessage: "Request to sync argocd application failed ..."
          
      - name: Log Before Requesting for Synced Application
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(github.event.inputs.port_payload).context.runId}}
          logMessage: "Fetching data of synced application ..."

      - name: Request for Synced Application
        id: synced_application
        uses: fjogeleit/http-request-action@v1
        with:
          url: 'https://${{github.event.inputs.application_host}}/api/v1/applications/${{github.event.inputs.application_name}}'
          method: 'GET'
          customHeaders: '{ "Content-Type": "application/json", "Authorization": "Bearer ${{secrets.ARGOCD_TOKEN}}" }'
              
      - name: Log Before Upserting Entity
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(github.event.inputs.port_payload).context.runId}}
          logMessage: "Reporting the synced application back to port ..."
    
      - name: UPSERT Entity
        uses: port-labs/port-github-action@v1
        with:
          identifier: "${{ fromJson(steps.synced_application.outputs.response).metadata.uid }}"
          title: "${{ fromJson(steps.synced_application.outputs.response).metadata.name }}"
          blueprint: ${{ fromJson(inputs.port_payload).context.blueprint }}
          properties: |-
            {
              "namespace": "${{ fromJson(steps.synced_application.outputs.response).metadata.namespace }}",
              "gitRepo": "${{ fromJson(steps.synced_application.outputs.response).spec.source.repoURL }}",
              "gitPath": "${{ fromJson(steps.synced_application.outputs.response).spec.source.path }}",
              "destinationServer": "${{ fromJson(steps.synced_application.outputs.response).spec.destination.server }}",
              "syncStatus": "${{ fromJson(steps.synced_application.outputs.response).status.sync.status }}",
              "healthStatus": "${{ fromJson(steps.synced_application.outputs.response).status.health.status }}",
              "createdAt": "${{ fromJson(steps.synced_application.outputs.response).metadata.creationTimestamp}}"
            }
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: UPSERT
          runId: ${{ fromJson(inputs.port_payload).context.runId }}

      - name: Log If Upsetting Entity Fails 
        if: failure()
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(github.event.inputs.port_payload).context.runId}}
          logMessage: "Failed to upsert synced argocd application to port ..."
          
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

5. Trigger the action from the [Self-service](https://app.getport.io/self-serve) tab of your Port application.