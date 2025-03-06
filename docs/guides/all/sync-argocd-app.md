---
sidebar_position: 1
displayed_sidebar: null
description: Learn how to sync an ArgoCD app in Port, ensuring your deployments are up-to-date and accurately reflected.
---
import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortTooltip from "/src/components/tooltip/tooltip.jsx";

import GithubActionModificationHint from '/docs/guides/templates/github/_github_action_modification_required_hint.mdx'
import GithubDedicatedRepoHint from '/docs/guides/templates/github/_github_dedicated_workflows_repository_hint.mdx'

# Synchronize Argo CD Application

In the following guide, we are going to create a self-service action in Port that executes a [GitHub workflow](/actions-and-automations/setup-backend/github-workflow/github-workflow.md) to sync an argo cd application. With this, you can manage your Argo CD Application without leaving Port.


## Prerequisites
1. [Port's GitHub app](https://github.com/apps/getport-io) needs to be installed.
2. In your GitHub repository, [go to **Settings > Secrets**](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository) and add the following secrets:
   - `ARGOCD_TOKEN` - Argo CD token [learn more](https://argo-cd.readthedocs.io/en/stable/developer-guide/api-docs/).
   - `ARGOCD_APPLICATION_HOST` - The host URL of your deployed Argo CD instance. For example, my-argocd-app.com.
   - `PORT_CLIENT_ID` - Your port `client id` [How to get the credentials](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#find-your-port-credentials).
   - `PORT_CLIENT_SECRET` - Your port `client secret` [How to get the credentials](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#find-your-port-credentials).
3. Optional - Install Port's Argo CD integration [learn more](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/argocd/)

:::tip Argo CD Integration
	This step is not required for this example, but it will create all the blueprint boilerplate for you, and also ingest and update the catalog in real time with your Argo CD Applications.
:::

4. In Case you decided not to install the Argo CD integration, you will need to create a blueprint for the Argo CD Application in Port.

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

4. Create a workflow file under `.github/workflows/sync-argocd-app.yaml` with the following content:

<GithubDedicatedRepoHint/>

<details>
 <summary>GitHub Workflow </summary>

```yml showLineNumbers
name: Sync Argo CD Application
on:
  workflow_dispatch:
    inputs:
      application_name:
        description: The Argo CD Application Name. e.g. app.example.com
        required: true
      port_context:
        required: true
        description: includes blueprint, run ID, and entity identifier from Port.

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
          runId: ${{fromJson(inputs.port_context).run_id}}
          logMessage: "About to make a request to argocd server..."

      - name: Sync Argo CD Application
        uses: omegion/argocd-actions@v1
        with:
          address: ${{ secrets.ARGOCD_APPLICATION_HOST }}
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
          runId: ${{fromJson(inputs.port_context).run_id}}
          logMessage: "Request to sync Argo CD application failed ..."
    
    - name: Report Sync Success
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_context).run_id}}
          logMessage: "Successfully synced Argo CD Application ✅"
```
</details>

## Port Configuration

Create a new self service action using the following JSON configuration.

<details>
<summary>Sync Argo CD Application (click to expand) </summary>
<GithubActionModificationHint/>

```json showLineNumbers
{
  "identifier": "argocdApplication_sync_application",
  "title": "Sync Application",
  "icon": "Argo",
  "description": "Sync An Argo CD Application",
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
    "workflow": "sync-argocd-app.yaml",
    "workflowInputs": {
      "application_name": "{{.inputs.\"application_name\"}}",
      "port_context": {
        "entity": "{{.entity.identifier}}",
        "blueprint": "{{.action.blueprint}}",
        "runId": "{{.run.id}}"
      }
    },
    "reportWorkflowStatus": true
  },
  "requiredApproval": false
}
```
</details>

Now you should see the `Sync Argo CD Application` action in the self-service page. 🎉

## Let's test it!

1. Head to the [Self Service hub](https://app.getport.io/self-serve)
2. Click on the `Sync Argo CD Application` action
3. Choose the Argo CD Application you want to synchronize (In case you didn't install the [Argo CD integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/argocd/), it means you don't have any Argo CD application in Port yet, so you will need to create one manually in Port to test this action)
4. Select the application you want to sync. The `application_name` field should auto-fill after this, if not, manually enter the application name.
5. Click on `Execute`
6. Done! wait for the application to be synchronized.

Congrats 🎉 You've successfully synchronized your Argo CD Application in Port 🔥

## More Self Service Argo CD Actions Examples
- [Rollback Argo CD Deployment](/guides/all/rollback-argocd-deployment) using Port's self-service actions.