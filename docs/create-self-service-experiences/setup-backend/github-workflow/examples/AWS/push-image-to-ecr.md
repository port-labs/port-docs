import PortTooltip from "/src/components/tooltip/tooltip.jsx";

# Generate ECR image with tags

In the following guide, you are going to create a [self-service action](/create-self-service-experiences/) in Port that executes a [GitHub workflow](/create-self-service-experiences/setup-backend/github-workflow) to:

- Generate a Docker image with tags.
- Push the image to an [AWS Elastic Container Registry (ECR)](https://aws.amazon.com/ecr/).

The image will include tags indicating information like the trigger source, commit ID, PR ID, and workflow ID.

## Prerequisites
1. Install Port's GitHub app by clicking [here](https://github.com/apps/getport-io/installations/new).
2. This guide assumes the presence of a blueprint representing your repositories. If you haven't done so yet, initiate the setup of your GitHub data model by referring to this [guide](/build-your-software-catalog/sync-data-to-catalog/git/github/examples/resource-mapping-examples#mapping-repositories-file-contents-and-pull-requests) first.
3. A repository to contain your action resources i.e. the github workflow file.
4. In your GitHub repository, [go to **Settings > Secrets**](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository) and add the following secrets:
   - `AWS_ACCESS_KEY_ID`: Your AWS access key.
   - `AWS_SECRET_ACCESS_KEY`: Your AWS secret access key.
   - `ECR_REGISTRY`: Your AWS ECR registry URI.
5. [Create an AWS ECR repository](https://docs.aws.amazon.com/AmazonECR/latest/userguide/repository-create.html) if you haven't already. Take note of your [repository URI](https://docs.aws.amazon.com/AmazonECR/latest/userguide/repository-info.html). This is where the docker image will be pushed.

## GitHub Workflow

Create the file `create-and-push-image.yml` in the `.github/workflows` folder of your repository.

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
      port_payload:
        required: true
        description: "Port's payload, including details for who triggered the action and general context (blueprint, run id, etc...)"
        type: string

jobs:
  build:
    runs-on: ubuntu-latest

    env:
      REPO_URL: ${{ fromJson(inputs.port_payload).payload.entity.properties.url }}
      TRIGGERED_BY: ${{ fromJson(inputs.port_payload).trigger.by.user.email || github.actor }}

    steps:
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
    
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-region: ${{ secrets.AWS_REGION }}
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}

    - name: Login to AWS ECR
      id: login-ecr
      uses: aws-actions/amazon-ecr-login@v1

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
```
</details>


## Port Configuration

1. On the [self-service](https://app.getport.io/self-serve) page, create the Port action against the `Repository` blueprint. This will trigger the GitHub workflow.

<details>

<summary>Port Action</summary>

```json showLineNumbers
{
  "identifier": "build_ecr_image",
  "title": "Build ECR Image",
  "icon": "AWS",
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
  "invocationMethod": {
    "type": "GITHUB",
    "org": "<GITHUB_ORG>",
    "repo": "<GITHUB_REPO>",
    "workflow": "create-and-push-image.yml",
    "omitUserInputs": false,
    "omitPayload": false,
    "reportWorkflowStatus": true
  },
  "trigger": "DAY-2",
  "description": "Build Image and Push to ECR",
  "requiredApproval": false
}
```
</details>

<img src='/img/self-service-actions/setup-backend/github-workflow/examples/awsECRActionNew.png' width='90%' border='1px' />
<br />
<br />
<img src='/img/self-service-actions/setup-backend/github-workflow/examples/awsECRAction.png' width='45%' border='1px' />
<img src='/img/self-service-actions/setup-backend/github-workflow/examples/awsECRActionInputs.png' width='45%' border='1px' />



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

Let's assume your AWS ECR repository is named `your-ecr-repository-name`. Here's how the Docker image names will be tagged based on the [provided workflow](/create-self-service-experiences/setup-backend/github-workflow/examples/AWS/push-image-to-ecr#github-workflow):

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