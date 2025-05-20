---
tags:
  - AWS
  - ECR
  - Guide
  - GitHub Actions
displayed_sidebar: null
description: Learn how to push images to ECR in Port, ensuring efficient container management and streamlined deployments.
---

import PortTooltip from "/src/components/tooltip/tooltip.jsx";
import GithubActionModificationHint from '/docs/guides/templates/github/_github_action_modification_required_hint.mdx'
import GithubDedicatedRepoHint from '/docs/guides/templates/github/_github_dedicated_workflows_repository_hint.mdx'


# Build ECR image

## Overview

This guide demonstrates how to build and push a Docker image to AWS ECR with meaningful tags using [self-service action](/actions-and-automations/create-self-service-experiences/).

:::tip Use Cases
- **Self-service**: Enable developers to build and push Docker images to AWS ECR without needing to access AWS, while ensuring that images are following a consistent tagging convention.
- **Automation**: Automatically tag Docker images with meaningful information like commit ID, PR ID, and workflow ID.
- **Traceability**: Track the source of the image and the entity that triggered the build.
:::

In the following guide, you are going to create a [self-service action](/actions-and-automations/create-self-service-experiences/) in Port that executes a [GitHub workflow](/actions-and-automations/setup-backend/github-workflow) to:

- Generate a Docker image with tags.
- Push the image to an [AWS Elastic Container Registry (ECR)](https://aws.amazon.com/ecr/).

The image will include tags indicating information like the trigger source, commit ID, PR ID, and workflow ID.

## Prerequisites
1. Install Port's GitHub app by clicking [here](https://github.com/apps/getport-io/installations/new).
2. This guide assumes the presence of a blueprint representing your repositories. If you haven't done so yet, initiate the setup of your GitHub data model by referring to this [guide](/build-your-software-catalog/sync-data-to-catalog/git/github/examples/#mapping-repositories-file-contents-and-pull-requests) first.
3. A repository to contain your action resources i.e. the github workflow file.
4. In your GitHub repository, [go to **Settings > Secrets**](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository) and add the following secrets:
   - `AWS_ACCESS_KEY_ID`: Your AWS access key.
   - `AWS_SECRET_ACCESS_KEY`: Your AWS secret access key.
   - `ECR_REGISTRY`: Your AWS ECR registry URI.
5. [Create an AWS ECR repository](https://docs.aws.amazon.com/AmazonECR/latest/userguide/repository-create.html) if you haven't already. Take note of your [repository URI](https://docs.aws.amazon.com/AmazonECR/latest/userguide/repository-info.html). This is where the docker image will be pushed.

## GitHub Workflow

Create the file `create-and-push-image.yml` in the `.github/workflows` folder of your repository.

<GithubDedicatedRepoHint/>

<details>

<summary>GitHub Workflow</summary>

```yaml showLineNumbers title="create-and-push-image.yml"
name: Create and Push Image to ECR

on:
  workflow_dispatch:
    inputs:
      image_repo:
        description: 'Repository URL'
        required: true
      dockerfile:
        description: 'Path to Dockerfile'
        required: true
      port_context:
        required: true
        description: "Action and general context (blueprint, run id, etc...)"
        type: string

jobs:
  build:
    runs-on: ubuntu-latest

    env:
      REPO_URL: ${{ fromJson(inputs.port_context).entity.properties.url }}
      TRIGGERED_BY: ${{ fromJson(inputs.port_context).trigger.by.user.email || github.actor }}
      RUN_ID: ${{ fromJson(inputs.port_context).runId }}

    steps:
      - name: Inform execution of request to build ECR image
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ env.RUN_ID }}
          logMessage: "Starting build of ECR image..."

      - name: Extract repository owner and name
        run: |
          repo_owner=$(echo "${REPO_URL}" | awk -F/ '{print $4}')
          repo_name=$(echo "${REPO_URL}" | awk -F/ '{print $5}')

          echo "REPO_OWNER=$repo_owner" >> $GITHUB_ENV
          echo "REPO_NAME=$repo_name" >> $GITHUB_ENV
        shell: bash
    
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          repository: ${{ env.REPO_OWNER }}/${{ env.REPO_NAME }}

      - name: Get short commit ID
        id: get-commit-id
        run: |
          echo "COMMIT_SHORT=$(git rev-parse --short HEAD)" >> $GITHUB_ENV
          echo "COMMIT_SHA=$(git rev-parse HEAD)" >> $GITHUB_ENV
        shell: bash

      - name: Inform execution of request to build ECR image
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ env.RUN_ID }}
          logMessage: "Configuring AWS credentials..."
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-region: ${{ secrets.AWS_REGION }}
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}

      - name: Login to AWS ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1

      - name: Inform execution of request to build ECR image
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ env.RUN_ID }}
          logMessage: "Building docker image..."

      - name: Build and push Docker image
        env:
          ECR_REGISTRY: ${{ secrets.ECR_REGISTRY }}
          ECR_REPOSITORY: ${{ inputs.image_repo }}
        run: |
          # Build and push image with short commit ID and triggered by as tags
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$COMMIT_SHORT .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$COMMIT_SHORT

          # Tag image with commit ID and push
          docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$COMMIT_SHORT $ECR_REGISTRY/$ECR_REPOSITORY:$COMMIT_SHA
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$COMMIT_SHA

          # Tag image with triggered by and push
          docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$COMMIT_SHORT $ECR_REGISTRY/$ECR_REPOSITORY:actor-${TRIGGERED_BY//[^a-zA-Z0-9]/-}
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:actor-${TRIGGERED_BY//[^a-zA-Z0-9]/-}

          # Tag image with PR ID and push
          if [ "${{ github.event_name }}" == "pull_request" ]; then
            PR_ID=$(echo "${{ github.event.pull_request.number }}" | tr -d '/')
            docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$COMMIT_SHORT $ECR_REGISTRY/$ECR_REPOSITORY:pr-$PR_ID
            docker push $ECR_REGISTRY/$ECR_REPOSITORY:pr-$PR_ID
          fi

          # Tag image with workflow ID and push
          docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$COMMIT_SHORT $ECR_REGISTRY/$ECR_REPOSITORY:build-${{ github.run_id }}
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:build-${{ github.run_id }}

      - name: Notify Port of successful build
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          operation: PATCH_RUN
          status: "SUCCESS"
          baseUrl: https://api.getport.io
          runId: ${{ fromJson(inputs.port_context).runId }}
          logMessage: |
            Built and pushed image to ECR repo ${{ inputs.image_repo }}
```
</details>


## Port Configuration

1. Head to the [self-service](https://app.getport.io/self-serve) page.
2. Click on the `+ New Action` button.
3. Choose the `Repository` blueprint and click `Next`.

   <img src='/img/self-service-actions/setup-backend/github-workflow/examples/awsECRActionNew.png' width='50%' border='1px' />
4. Click on the `{...} Edit JSON` button.
5. Copy and paste the following JSON configuration into the editor.

<details>

<summary>Port Action</summary>

<GithubActionModificationHint/>

```json showLineNumbers
{
  "identifier": "build_ecr_image",
  "title": "Build ECR Image",
  "icon": "AWS",
  "description": "Build Image and Push to ECR",
  "trigger": {
    "type": "self-service",
    "operation": "DAY-2",
    "userInputs": {
      "properties": {
        "dockerfile": {
          "icon": "Docker",
          "title": "Dockerfile",
          "description": "The path to the dockerfile e.g Dockerfile or ./deploy/prod.Dockerfile",
          "type": "string",
          "default": "Dockerfile"
        },
        "image_repo": {
          "title": "Image Repository",
          "description": "The Elastic Container Repository Name",
          "icon": "AWS",
          "type": "string"
        }
      },
      "required": [
        "dockerfile",
        "image_repo"
      ],
      "order": [
        "dockerfile"
      ]
    },
    "blueprintIdentifier": "repository"
  },
  "invocationMethod": {
    "type": "GITHUB",
    "org": "<GITHUB_ORG>",
    "repo": "<GITHUB_REPO>",
    "workflow": "create-and-push-image.yml",
    "workflowInputs": {
      "dockerfile": "{{ .inputs.\"dockerfile\" }}",
      "image_repo": "{{ .inputs.\"image_repo\" }}",
      "port_context": {
        "entity": "{{ .entity }}",
        "blueprint": "{{ .action.blueprint }}",
        "runId": "{{ .run.id }}",
        "trigger": "{{ .trigger }}"
      }
    },
    "reportWorkflowStatus": true
  },
  "requiredApproval": false
  
}
```
</details>

6. Click `Save`.

Now you should see the `Build ECR Image` action in the self-service page. 🎉


## Let's test it!

1. On the [self-service](https://app.getport.io/self-serve) page, go to the `Build ECR Image` action and fill in the properties.

<img src='/img/self-service-actions/setup-backend/github-workflow/examples/awsECRActionExecute.png' width='45%' border='1px' />
<br />
<br />

2. Click the execute button to trigger the GitHub workflow.
3. The image is built and pushed to your ECR repository.

<img src='/img/self-service-actions/setup-backend/github-workflow/examples/awsECRActionDone.png' width='100%' border='1px' />

<br />
<br />

Let's assume your AWS ECR repository is named `your-ecr-repository-name`. Here's how the Docker image names will be tagged based on the [provided workflow](/guides/all/push-image-to-ecr#github-workflow):

1. **Primary Tag: Short Commit ID**
   - Tag: `your-ecr-repository-name:abc123` (assuming `abc123` is the short commit ID)

2. **Secondary Tags: Full Commit ID, PR ID, Workflow ID, Triggered By**
   - Tag: `your-ecr-repository-name:abc1234567890123456789012345678901234567` (full commit ID)
   - Tag (PR): `your-ecr-repository-name:pr-42` (assuming the pull request ID is 42)
   - Tag (Workflow): `your-ecr-repository-name:build-123456789` (workflow ID)
   - Tag (Triggered By): `your-ecr-repository-name:actor-username` (replace "username" with the actual GitHub username or the name of the system triggering the workflow)

You may also change the prefixes to context-appropriate ones i.e. you may prefer `your-ecr-repository-name:username` instead of having the `actor` prefix.

These tags provide meaningful information about the image, such as the commit ID, pull request ID (if applicable), workflow ID, and the entity triggering the workflow. 


Done! 🎉 You can now build and push images for your repositories from Port.


## More Self Service AWS Actions Examples
- [Deploy EKS cluster and deploy application](https://docs.port.io/guides/all/create-eks-cluster-and-deploy-app)
- [Create an EC2 instance](https://docs.port.io/guides/all/create-an-ec2-instance)
- [Deploy cloud formation stack](https://docs.port.io/guides/all/deploy-cloudformation-template)