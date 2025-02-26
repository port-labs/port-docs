---
sidebar_position: 1
displayed_sidebar: null
description: Follow this guide to rollback an ArgoCD deployment in Port, ensuring stability and quick recovery from issues.
---

import PortTooltip from "/src/components/tooltip/tooltip.jsx";

# Deployment/Rollback

In this guide, we will create a self-service action in Port that executes a GitHub workflow to perform either a deployment or rollback operation using ArgoCD. 
:::info Updating Environments
It's important to note that **Deployment** and **Rollback** operations essentially perform the same operation, with the difference being that Rollback occurs in the production environment and requires manual approval.
:::

Both operations involve updating the deployment manifest with a new container image and creating a GitHub pull request (PR) for it. The workflow can optionally merge the PR when enabled.

## Prerequisites
1. Install Port's GitHub app by clicking [here](https://github.com/apps/getport-io/installations/new)
2. This guide assumes the presence of a `Service` and `Image` blueprint representing your repository where ArgoCD lives and your container image
3. A repository to contain your ArgoCD deployment manifest and action resources i.e. the github workflow file

Below you can find the JSON for the `Service` and `Image` blueprints required for the guide:

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
  "relations": {}
}
```
</details>


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
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {}
}
```
</details>

:::tip Ingest Images 
If you do not have the images ingested already, we recommend using our [AWS ECR script](https://github.com/port-labs/example-ecr-images), [Google Container Registry script](https://github.com/port-labs/example-gcr-images), [JFrog build script](/build-your-software-catalog/custom-integration/webhook/examples/jfrog) or [GitHub packages script](https://github.com/port-labs/example-github-packages) to sync data to your catalog
:::

## Create Github workflow

Follow these steps to get started:

1. Create the following GitHub Action secrets:
    - `PORT_CLIENT_ID` - Port Client ID [learn more](/build-your-software-catalog/custom-integration/api/#get-api-token)
    - `PORT_CLIENT_SECRET` - Port Client Secret [learn more](/build-your-software-catalog/custom-integration/api/#get-api-token)
    - `MY_GITHUB_TOKEN` - a [Classic Personal Access Token](https://github.com/settings/tokens) with the `repo` scope and the following permissions: `pull_requests:write` (to create PR) and `contents:write` (to merge PR)

<br />
2. Create a Port action in the [self-service page](https://app.getport.io/self-serve) on the `Service` blueprint with the following JSON definition:

<details>

  <summary>Port Action: Rollback Deployment</summary>
   :::tip
- `<GITHUB-ORG>` - your GitHub organization or user name.
- `<GITHUB-REPO-NAME>` - your GitHub repository name.
:::


```json showLineNumbers
{
  "identifier": "rollback_deployment",
  "title": "Rollback Deployment",
  "icon": "DefaultProperty",
  "description": "Rollback the deployment to the previous version",
  "trigger": {
    "type": "self-service",
    "operation": "DAY-2",
    "userInputs": {
      "properties": {
        "auto_merge": {
          "type": "boolean",
          "title": "Auto Merge",
          "default": false,
          "description": "Automatically merge the PR after the action is completed"
        },
        "image": {
          "type": "string",
          "title": "Image",
          "format": "entity",
          "blueprint": "image"
        }
      },
      "required": [
        "image"
      ]
    },
    "blueprintIdentifier": "service"
  },
  "invocationMethod": {
    "type": "GITHUB",
    "org": "<GITHUB-ORG>",
    "repo": "<GITHUB-REPO-NAME>",
    "workflow": "rollback.yaml",
    "workflowInputs": {
      "auto_merge": "{{.inputs.auto_merge}}",
      "image": "{{.inputs.image.title}}",
      "port_context": {
        "blueprint": "{{.action.blueprint}}",
        "entity": "{{.entity}}",
        "runId": "{{.run.id}}",
        "trigger": "{{.trigger}}"
      }
    },
    "reportWorkflowStatus": true
  }
}
```

</details>
<br />

3. Create a workflow file under `.github/workflows/rollback.yaml` with the following content:

<details>

<summary>GitHub workflow script</summary>

:::note Variable replacement
- `<DEPLOYMENT-MANIFEST-PATH>` - Path to the ArgoCD deployment manifest such as `app/deployment.yaml`.
- `<IMAGE-PROPERTY-PATH>` - Path to where the deployment image is specified in the deployment manifest such as `spec.template.spec.containers[0].image`.
:::

```yaml showLineNumbers title="rollback.yaml"
name: Rollback ArgoCD Deployment Image

on:
  workflow_dispatch:
    inputs:
      image:
        description: The new image to use for the rollback
        required: true
        type: string
      auto_merge:
        description: Whether the created PR should be merged automatically
        required: true
        type: boolean
      port_context:
        required: true
        description: >-
          action port_context: blueprint, run id, etc
jobs:
  rollback-deployment:
    runs-on: ubuntu-latest
    steps:
      - name: Inform execution of request to rollback deployment image
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_context).runId}}
          logMessage: "About to rollback deployment image in argocd..."

      - uses: actions/checkout@v4
      - name: Create PR
        id: create-pr
        uses: fjogeleit/yaml-update-action@main
        with:
          valueFile: "<DEPLOYMENT-MANIFEST-PATH>" ## replace value
          propertyPath: "<IMAGE-PROPERTY-PATH>" ## replace value
          value: "${{ github.event.inputs.image }}"
          commitChange: true
          token: ${{ secrets.MY_GITHUB_TOKEN }}
          targetBranch: main
          masterBranchName: main
          createPR: true
          branch: deployment/${{ fromJson(inputs.port_context).runId }}
          message: "Update deployment image to ${{ github.event.inputs.image }}"

      - name: Inform Port about pull request creation status - Success
        if: steps.create-pr.outcome == 'success'
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).runId }}
          logMessage: |
            'The creation of PR was successful: ${{fromJson(steps.create-pr.outputs.pull_request).html_url}}'
          link: '["${{fromJson(steps.create-pr.outputs.pull_request).html_url}}"]'

      - name: Inform Port about pull request creation status - Failure
        if: steps.create-pr.outcome != 'success'
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).runId }}
          logMessage: |
            The creation of PR was not successful.

      - name: Merge Pull Request
        if: ${{ github.event.inputs.auto_merge == 'true' && steps.create-pr.outcome == 'success' }}
        env:
          GH_TOKEN: ${{ secrets.MY_GITHUB_TOKEN }}
          PR_URL: ${{ fromJson(steps.create-pr.outputs.pull_request).url }}
        run: |
          HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
            -X PUT \
            -H "Accept: application/vnd.github+json" \
            -H "Authorization: Bearer $GH_TOKEN" \
            "$PR_URL/merge")

          echo "HTTP Status: $HTTP_STATUS"

          if [ $HTTP_STATUS -eq 200 ]; then
            echo "Pull request merged successfully."
            echo "merge_status=successful" >> $GITHUB_ENV
          else
            echo "Failed to merge PR. HTTP Status: $HTTP_STATUS"
            echo "merge_status=unsuccessful" >> $GITHUB_ENV
          fi

      - name: Inform completion of Argocd rollback into Port
        if: ${{ github.event.inputs.auto_merge == 'true' }}
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_context).runId}}
          logMessage: "Pull request merge was ${{ env.merge_status }}"
```

</details>
<br />
4. Trigger the action from the [self-service](https://app.getport.io/self-serve) page of your Port application.

You should now be able to see a Github pull request created and merged for the argocd deployment.

<img src="/img/sync-data-to-catalog/deploymenetRollbackMerged.png" border="1px" width="60%" />

## More relevant guides and examples
- [ArgoCD Ocean integration](/build-your-software-catalog/sync-data-to-catalog/argocd/)