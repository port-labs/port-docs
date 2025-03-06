---
sidebar_position: 3
displayed_sidebar: null
description: Learn how to restart an ArgoCD app in Port, ensuring smooth application operations and minimal downtime.
---
import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortTooltip from "/src/components/tooltip/tooltip.jsx";

import GithubActionModificationHint from '/docs/guides/templates/github/_github_action_modification_required_hint.mdx'
import GithubDedicatedRepoHint from '/docs/guides/templates/github/_github_dedicated_workflows_repository_hint.mdx'

# Restart Argo CD Application

## Overview
In the following guide, we are going to create a self-service action in Port that executes a [GitHub workflow](/actions-and-automations/setup-backend/github-workflow/github-workflow.md) to restart an Argo CD application.


## Prerequisites
1. Install the Port GitHub app from [here](https://github.com/apps/getport-io/installations/new).

2. Create the following GitHub Action secrets:
    - `ARGO_CD_PASSWORD` - [Argo CD Password](https://argo-cd.readthedocs.io/en/stable/getting_started/#4-login-using-the-cli)
    - `ARGO_CD_USERNAME` - [Argo CD Username](https://argo-cd.readthedocs.io/en/stable/getting_started/#4-login-using-the-cli)
    - `ARGOCD_SERVER` - The host URL or server of your deployed Argo CD instance without http(s). For example, my-argocd-app.com.
    - `PORT_CLIENT_ID` - Port Client ID [learn more](/build-your-software-catalog/custom-integration/api/#get-api-token).
    - `PORT_CLIENT_SECRET` - Port Client Secret [learn more](/build-your-software-catalog/custom-integration/api/#get-api-token).

3. Optional - Install Port's Argo CD integration. [Learn more](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/argocd)

:::tip Argo CD Integration
This step is not required for this example, but it will create all the blueprint boilerplate for you, and also ingest and update the catalog in real time with your Argo CD Application.
:::

4. In Case you decided not to install the Argo CD integration, you will need to create a blueprint for Argo CD Application in Port.

<details>
<summary>Argo CD Application Blueprint</summary>
	
```json showLineNumbers
  {
    "identifier": "argocdApplication",
    "description": "This blueprint represents an ArgoCD Application",
    "title": "Running Service",
    "icon": "Argo",
    "schema": {
      "properties": {
        "gitRepo": {
          "type": "string",
          "icon": "Git",
          "title": "Repository URL",
          "description": "The URL of the Git repository containing the application source code"
        },
        "gitPath": {
          "type": "string",
          "title": "Path",
          "description": "The path within the Git repository where the application manifests are located"
        },
        "destinationServer": {
          "type": "string",
          "title": "Destination Server",
          "description": "The URL of the target cluster's Kubernetes control plane API"
        },
        "revision": {
          "type": "string",
          "title": "Revision",
          "description": "Revision contains information about the revision the comparison has been performed to"
        },
        "targetRevision": {
          "type": "string",
          "title": "Target Revision",
          "description": "Target Revision defines the revision of the source to sync the application to. In case of Git, this can be commit, tag, or branch"
        },
        "syncStatus": {
          "type": "string",
          "title": "Sync Status",
          "enum": [
            "Synced",
            "OutOfSync",
            "Unknown"
          ],
          "enumColors": {
            "Synced": "green",
            "OutOfSync": "red",
            "Unknown": "lightGray"
          },
          "description": "Status is the sync state of the comparison"
        },
        "healthStatus": {
          "type": "string",
          "title": "Health Status",
          "enum": [
            "Healthy",
            "Missing",
            "Suspended",
            "Degraded",
            "Progressing",
            "Unknown"
          ],
          "enumColors": {
            "Healthy": "green",
            "Missing": "yellow",
            "Suspended": "purple",
            "Degraded": "red",
            "Progressing": "blue",
            "Unknown": "lightGray"
          },
          "description": "Status holds the status code of the application or resource"
        },
        "createdAt": {
          "title": "Created At",
          "type": "string",
          "format": "date-time",
          "description": "The created timestamp of the application"
        },
        "labels": {
          "type": "object",
          "title": "Labels",
          "description": "Map of string keys and values that can be used to organize and categorize object"
        },
        "annotations": {
          "type": "object",
          "title": "Annotations",
          "description": "Annotations are unstructured key value map stored with a resource that may be set by external tools to store and retrieve arbitrary metadata"
        }
      },
      "required": []
    },
    "mirrorProperties": {},
    "calculationProperties": {},
    "relations": {
      "project": {
        "title": "ArgoCD Project",
        "target": "argocdProject",
        "required": false,
        "many": false
      },
      "cluster": {
        "title": "ArgoCD Cluster",
        "target": "argocdCluster",
        "required": false,
        "many": false
      },
      "namespace": {
        "title": "ArgoCD Namespace",
        "target": "argocdNamespace",
        "required": false,
        "many": false
      }
    }
  }
```
</details>

## GitHub Workflow

1. Create a workflow file under `.github/workflows/restart-argocd-app.yaml` with the following content:

<GithubDedicatedRepoHint/>

<details>
<summary>GitHub Workflow</summary>

```yaml showlineNumber title="restart-argocd-app.yaml"
name: Restart Deployment in Argo CD

on:
  workflow_dispatch:
    inputs:
      application_name:
        description: 'Argo CD Application Name'
        required: true
      insecure:
        description: 'Use insecure connection (true/false)'
        required: false
        default: 'false'
      port_context:
        required: true
        description: includes blueprint, run ID, and entity identifier from Port.

jobs:
  restart-deployment:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Install Argo CD CLI
        run: |
          curl -sSL -o /usr/local/bin/argocd https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
          chmod +x /usr/local/bin/argocd

      - name: Report Failure In Installing Argo CD CLI
        if: failure()
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_context).run_id}}
          logMessage: "Failed to install Argo CD CLI ❌"

      - name: Report Successful Installation of Argo CD CLI
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_context).run_id}}
          logMessage: "Successfully installed Argo CD CLI ✅"

      - name: Set Insecure Flag
        id: set-insecure
        run: |
          echo "INSECURE_FLAG=" >> $GITHUB_ENV
          if [ "${{ inputs.insecure }}" == "true" ]; then
            echo "--insecure" >> $GITHUB_ENV
          fi
      
      - name: Login to Argo CD
        run: |
          argocd login ${{ secrets.ARGOCD_SERVER }} --username ${{ secrets.ARGO_CD_USERNAME }} --password ${{ secrets.ARGO_CD_PASSWORD }} $INSECURE_FLAG

      - name: Report Failed Login to Argo CD
        if: failure()
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_context).run_id}}
          logMessage: "Failed to login to Argo CD, please check your provided credentials ❌"
          
      - name: Report Successful Login to Argo CD
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_context).run_id}}
          logMessage: "Successfully logged in to Argo CD via the CLI ✅"

      - name: Restart Argo CD Deployment
        run: |
          argocd app actions run ${{ inputs.application_name }} restart --kind Deployment

      - name: Report Failure in Restarting Argo CD Deployment
        if: failure()
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_context).run_id}}
          logMessage: "Failed to restart Argo CD Deployment ❌"

      - name: Report Wait for Application Stability
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_context).run_id}}
          logMessage: "Successfully restarted Deployment ✅, Waiting for application to stabilize ..."

      - name: Wait for Application Stability
        run: |
          argocd app wait ${{ inputs.application_name }} --sync
          argocd app wait ${{ inputs.application_name }} --health
        timeout-minutes: 60

      - name: Report Healthy State
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_context).run_id}}
          logMessage: "Application reached a synchronized state and is Healthy ✅"

      - name: Report Application Instability
        if: failure()
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_context).run_id}}
          logMessage: "Application failed to stabilize ❌"


      - name: Fetch Application Details
        id: app_details
        run: |
          argocd app get ${{ inputs.application_name }} --output json > app_details.json
          echo "response<<EOF" >> $GITHUB_ENV
          cat app_details.json >> $GITHUB_ENV
          echo "EOF" >> $GITHUB_ENV
            
      - name: Log Before Upserting Entity
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_context).run_id}}
          logMessage: "Reporting the restarted application back to port ..."

      - name: Process Title
        run: |
          PROCESSED_TITLE=$(echo '${{ env.response }}' | jq -r '.metadata.name' | sed 's/[^a-zA-Z0-9-]//g' | awk 'BEGIN{OFS=FS="-"} {for(i=1; i<=NF; i++) $i=toupper(substr($i,1,1)) tolower(substr($i,2)) }1')
          echo "PROCESSED_TITLE=$PROCESSED_TITLE" >> $GITHUB_ENV
        shell: bash
  
      - name: UPSERT Entity
        uses: port-labs/port-github-action@v1
        with:
          identifier: ${{fromJson(env.response).metadata.name}}
          title: "${{env.PROCESSED_TITLE}}"
          blueprint: ${{fromJson(inputs.port_context).blueprint}}
          properties: |
            {
              "namespace": "${{fromJson(env.response).metadata.namespace}}",
              "gitRepo": "${{fromJson(env.response).spec.source.repoURL}}",
              "gitPath": "${{fromJson(env.response).spec.source.path}}",
              "destinationServer": "${{fromJson(env.response).spec.destination.server}}",
              "syncStatus": "${{fromJson(env.response).status.sync.status}}",
              "healthStatus": "${{fromJson(env.response).status.health.status}}",
              "createdAt": "${{fromJson(env.response).metadata.creationTimestamp}}"
            }
          relations: "${{ toJson(fromJson(inputs.port_context).relations) }}"
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: UPSERT
          runId: ${{fromJson(inputs.port_context).run_id}}

      - name: Log If Upsetting Entity Fails 
        if: failure()
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_context).run_id}}
          logMessage: "Failed to upsert restarted argocd application entity to port ..."
          
      - name: Log After Upserting Entity
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_context).run_id}}
          logMessage: "Entity upserting was successful ✅"
```
</details>

## Port Configuration

Create a new self service action using the following JSON configuration.

<details>
<summary><b>Restart Argo CD Application(Click to expand)</b></summary>

<GithubActionModificationHint/>

```json showLineNumbers
{
  "identifier": "argocdApplication_restart_application",
  "title": "Restart Application",
  "icon": "Argo",
  "description": "Restart An Argo CD Application",
  "trigger": {
    "type": "self-service",
    "operation": "DAY-2",
    "userInputs": {
      "properties": {
        "application_name": {
          "title": "Application Name",
          "description": "Argo CD Application Name",
          "icon": "Argo",
          "type": "string",
          "default": {
            "jqQuery": ".entity.title"
          }
        },
        "insecure": {
          "title": "Insecure",
          "description": "Use insecure connection (true/false)",
          "icon": "Argo",
          "type": "boolean",
          "default": false
        }
      },
      "required": [
        "application_name"
      ],
      "order": [
        "application_name"
      ]
    },
    "blueprintIdentifier": "argocdApplication"
  },
  "invocationMethod": {
    "type": "GITHUB",
    "org": "<GITHUB_ORG>",
    "repo": "<GITHUB_REPO>",
    "workflow": "restart-argocd-app.yaml",
    "workflowInputs": {
      "application_name": "{{.inputs.\"application_name\"}}",
      "insecure": "{{.inputs.\"insecure\"}}",
      "port_context": {
        "entity": "{{.entity.identifier}}",
        "blueprint": "{{.action.blueprint}}",
        "run_id": "{{.run.id}}",
        "relations": "{{.entity.relations}}"
      }
    },
    "reportWorkflowStatus": true
  },
  "requiredApproval": false
}
```
</details>

Now you should see the `Restart Application` action in the self-service page. 🎉

## Let's test it!

1. Head to the [Self Service hub](https://app.getport.io/self-serve)
2. Click `Execute` on the `Restart Application` action
3. Choose the Argo CD application you want to restart (In case you didn't install the [Argo CD integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/argocd), it means you don't have any Argo CD Application in Port yet, so you will need to create one manually in Port to test this action)
4. Select the application you want to sync. The `application_name` field should auto-fill after this, if not, manually enter the application name.
5. Click on `Execute`
6. Done! wait for the applicatioin flag's status to be restarted in Argo CD.

Congrats 🎉 You've restarted your first Argo CD Application from Port 🔥

## More Self Service Argo CD Actions Examples
- [Rollback Argo CD Deployment](/guides/all/rollback-argocd-deployment) using Port's self-service actions.

- [Synchronize Argo CD Application](/guides/all/sync-argocd-app) using Port's self-service actions.