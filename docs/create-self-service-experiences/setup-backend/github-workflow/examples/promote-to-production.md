---
sidebar_position: 5
---

import PortTooltip from "/src/components/tooltip/tooltip.jsx";

# Promote Deployment to Production

In this guide, we will create a self-service action in Port that executes a GitHub workflow to promote an image from staging to production. 

The deployment involves updating the deployment manifest with the container image of the staging service and creating a Github pull request (PR) for it. The workflow then merges the PR so that your GitOps operator can redeploy the service.

## Prerequisites
1. Install Port's GitHub app by clicking [here](https://github.com/apps/getport-io/installations/new)
2. This guide assumes the presence of the following blueprints:
    - `Service`:  Represents your github repository containing the application.
    - `Running Service`: This is a deployment of a `Service` in an environment e.g. dev, test, production.
    - `Image`: This blueprint represents the container image running in a particular `Running Service` entity. 
3. A repository to contain your ArgoCD deployment manifest and action resources i.e. the github workflow file

Below you can find the JSON for the blueprints:


<details>
<summary><b>Image blueprint (click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "image",
  "description": "This blueprint represents an image",
  "title": "Image",
  "icon": "AWS",
  "schema": {
    "properties": {
      "registryId": {
        "type": "string",
        "title": "Registry ID",
        "description": "The ID of the registry",
        "icon": "DefaultProperty"
      },
      "digest": {
        "type": "string",
        "title": "Image Digest",
        "description": "SHA256 digest of image manifest",
        "icon": "DefaultProperty"
      },
      "tags": {
        "type": "array",
        "title": "Image Tags",
        "description": "List of tags for the image",
        "icon": "DefaultProperty"
      },
      "pushedAt": {
        "type": "string",
        "title": "Pushed At",
        "description": "Date and time the image was pushed to the repository",
        "format": "date-time",
        "icon": "DefaultProperty"
      },
      "lastRecordedPullTime": {
        "type": "string",
        "title": "Last Recorded Pull Time",
        "description": "Date and time the image was last pulled",
        "format": "date-time",
        "icon": "DefaultProperty"
      },
      "triggeredBy": {
        "type": "string",
        "icon": "TwoUsers",
        "title": "Triggered By",
        "description": "The user who triggered the run"
      },
      "commitHash": {
        "type": "string",
        "title": "Commit Hash",
        "icon": "DefaultProperty"
      },
      "pullRequestId": {
        "type": "string",
        "icon": "Git",
        "title": "Pull Request ID"
      },
      "workflowId": {
        "type": "string",
        "title": "Workflow ID",
        "icon": "DefaultProperty"
      },
      "image_branch": {
        "title": "Image branch",
        "type": "string",
        "description": "The git branch associated with the repository used to build the Image"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {
    "link_to_the_commit": {
      "title": "Link to the commit",
      "calculation": ".commit",
      "type": "string"
    },
    "link_to_the_pr": {
      "title": "Link to the PR",
      "calculation": ".pull",
      "type": "string"
    },
    "link_to_the_ci": {
      "title": "Link to the CI",
      "icon": "DefaultProperty",
      "description": "a link to the build in github workflow where the Image was built",
      "calculation": ".workflowId",
      "type": "string"
    }
  },
  "aggregationProperties": {},
  "relations": {}
}
```
</details>


<details>
<summary><b>Running Service blueprint (click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "running_service",
  "description": "This blueprint represents an ArgoCD Application",
  "title": "Running Service",
  "icon": "Argo",
  "schema": {
    "properties": {
      "gitRepo": {
        "type": "string",
        "format": "url",
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
        "format": "url"
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
        "description": "The sync status of the application"
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
        "description": "The health status of the application"
      },
      "createdAt": {
        "title": "Created At",
        "type": "string",
        "format": "date-time"
      },
      "grafana_link": {
        "title": "Grafana Link",
        "icon": "Grafana",
        "type": "string",
        "format": "url"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {
    "image": {
      "title": "Image Deployed",
      "target": "image",
      "required": false,
      "many": false
    }
  }
}
```
</details>

<details>
<summary><b>Service blueprint (click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "service",
  "title": "Service",
  "icon": "Github",
  "schema": {
    "properties": {
      "readme": {
        "title": "README",
        "type": "string",
        "format": "markdown",
        "icon": "Book"
      },
      "url": {
        "title": "URL",
        "format": "url",
        "type": "string",
        "icon": "Link"
      },
      "language": {
        "icon": "Git",
        "type": "string",
        "title": "Language",
        "enum": [
          "GO",
          "Python",
          "Node",
          "React"
        ],
        "enumColors": {
          "GO": "red",
          "Python": "green",
          "Node": "blue",
          "React": "yellow"
        }
      },
      "slack": {
        "icon": "Slack",
        "type": "string",
        "title": "Slack",
        "format": "url"
      },
      "code_owners": {
        "title": "Code owners",
        "description": "This service's code owners",
        "type": "string",
        "icon": "TwoUsers"
      },
      "type": {
        "title": "Type",
        "description": "This service's type",
        "type": "string",
        "enum": [
          "Backend",
          "Frontend",
          "Library"
        ],
        "enumColors": {
          "Backend": "purple",
          "Frontend": "pink",
          "Library": "green"
        },
        "icon": "DefaultProperty"
      },
      "lifecycle": {
        "title": "Lifecycle",
        "type": "string",
        "enum": [
          "Production",
          "Experimental",
          "Deprecated"
        ],
        "enumColors": {
          "Production": "green",
          "Experimental": "yellow",
          "Deprecated": "red"
        },
        "icon": "DefaultProperty"
      },
      "locked_in_prod": {
        "icon": "DefaultProperty",
        "title": "Locked in Prod",
        "type": "boolean",
        "default": false
      },
      "locked_reason_prod": {
        "icon": "DefaultProperty",
        "title": "Locked Reason Prod",
        "type": "string"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {
    "test_runtime": {
      "title": "Test runtime",
      "description": "The service's test runtime",
      "target": "running_service",
      "required": false,
      "many": false
    },
    "dev_runtime": {
      "title": "Dev Runtime",
      "target": "running_service",
      "required": false,
      "many": false
    },
    "prod_runtime": {
      "title": "Prod runtime",
      "description": "The service's prod runtime",
      "target": "running_service",
      "required": false,
      "many": false
    }
  }
}
```
</details>


## Create Github workflow

Follow these steps to get started:

1. Create the following GitHub Action secrets:
    - `PORT_CLIENT_ID` - Port Client ID [learn more](/build-your-software-catalog/custom-integration/api/#get-api-token)
    - `PORT_CLIENT_SECRET` - Port Client Secret [learn more](/build-your-software-catalog/custom-integration/api/#get-api-token)
    - `MY_GITHUB_TOKEN` - a [Classic Personal Access Token](https://github.com/settings/tokens) with the `repo` scope and the following permissions: `pull_requests:write` (to create PR) and `contents:write` (to merge PR)

<br />
2. Create a Port action in the [self-service page](https://app.getport.io/self-serve) on the `Service` blueprint with the following JSON definition:

<details>

  <summary>Port Action: Promote Deployment</summary>
   :::tip
- `<GITHUB-ORG>` - your GitHub organization or user name.
- `<GITHUB-REPO-NAME>` - your GitHub repository name.
:::


```json showLineNumbers
{
  "identifier": "promote_to_production",
  "title": "Promote to Production",
  "icon": "Argo",
  "userInputs": {
    "properties": {},
    "required": []
  },
  "invocationMethod": {
    "type": "GITHUB",
    "org": "<GITHUB-ORG>",
    "repo": "<GITHUB-REPO-NAME>",
    "workflow": "promote-production.yml",
    "omitUserInputs": false,
    "omitPayload": false,
    "reportWorkflowStatus": true
  },
  "trigger": "DAY-2",
  "description": "Promote a staging image to production",
  "requiredApproval": false
}
```

</details>
<br />

3. Create a workflow file under `.github/workflows/promote-production.yml` with the following content:

<details>

<summary>GitHub workflow script</summary>

:::note Variable replacement
- `<DEPLOYMENT-MANIFEST-PATH>` - Path to the ArgoCD deployment manifest such as `app/deployment.yaml`.
- `<IMAGE-PROPERTY-PATH>` - Path to where the deployment image is specified in the deployment manifest such as `spec.template.spec.containers[0].image`.
:::

```yaml showLineNumbers title="promote-production.yml"
name: Promote Production

on:
  workflow_dispatch:
    inputs:
      port_payload:
        required: true
        description: >-
          Port's payload, including details for who triggered the action and
          general context (blueprint, run id, etc...)
jobs:
  promote-deployment:
    runs-on: ubuntu-latest
    steps:
      - name: Inform execution of request to promote deployment image
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(github.event.inputs.port_payload).context.runId}}
          logMessage: "About to promote deployment image from staging to production..."

      - name: Get the current staging image
        id: get-staging
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: GET
          blueprint: running_service
          identifier: ${{fromJson(github.event.inputs.port_payload).payload.entity.relations.test_runtime }}
          runId: ${{ fromJson(github.event.inputs.port_payload).context.runId }}
          logMessage: "Getting the current staging image..."

      - name: Set the production image
        id: set-production
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          operation: UPSERT
          identifier: ${{fromJson(github.event.inputs.port_payload).payload.entity.relations.prod_runtime }}
          blueprint: running_service
          runId: ${{ fromJson(github.event.inputs.port_payload).context.runId }}
          logMessage: "Updating the production image..."
          relations: |
            {
              "image": "${{ fromJson(steps.get-staging.outputs.entity).relations.image }}"
            }

      - name: Inform Port about pull request creation status - Success
        if: steps.set-production.outcome == 'success'
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ fromJson(github.event.inputs.port_payload).context.runId }}
          logMessage: |
            The production image has been updated successfully

      - name: Inform Port about pull request creation status - Failure
        if: steps.set-production.outcome != 'success'
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ fromJson(github.event.inputs.port_payload).context.runId }}
          logMessage: |
            The promotion of the image to production failed.
```

</details>
<br />
4. Trigger the action from the [self-service](https://app.getport.io/self-serve) page of your Port application.

You should now be able to see a Github pull request created and merged for the deployment.

