---
displayed_sidebar: null
description: Learn how to trigger an AWS CodeDeploy application in Port.
---

import GithubActionModificationHint from '/docs/guides/templates/github/_github_action_modification_required_hint.mdx'
import GithubDedicatedRepoHint from '/docs/guides/templates/github/_github_dedicated_workflows_repository_hint.mdx'

# Deploy a service using AWS CodeDeploy
This guide walks you through implementing a self-service action in Port that triggers an AWS CodeDeploy deployment targeting an EC2 instance. This functionality enables automated deployments directly from your developer portal.


## Prerequisites

- Complete the [onboarding process](/getting-started/overview).
- Access to an AWS account with permissions to manage S3, CodeDeploy and EC2.
- An existing [AWS CodeDeploy application and deployment group](https://docs.aws.amazon.com/codedeploy/latest/userguide/getting-started-codedeploy.html).
- A GitHub repository containing your application code.

## Implementation

We will use a practical example where a developer deploys a website to an EC2 instance using AWS CodeDeploy. The website’s source code is stored in a GitHub repository. As part of the deployment process, we will use a GitHub Actions workflow to:

1. Package the website code into a ZIP file.

2. Upload the ZIP file to an S3 bucket.

3. Trigger an AWS CodeDeploy deployment that pulls the bundle from S3 and deploys it to an EC2 instance.

To implement this use-case using a GitHub workflow, follow these steps:

<h3>Add GitHub secrets</h3>

In your GitHub repository, [go to **Settings > Secrets**](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository) and add the following secrets:
- `AWS_ACCESS_KEY_ID` - AWS IAM user's access key.
- `AWS_SECRET_ACCESS_KEY` - AWS IAM user's secret access key.
- `AWS_REGION_NAME` - AWS region (e.g., `us-east-1`).
- `S3_BUCKET_NAME` - Name of the S3 bucket used by CodeDeploy.


### Add GitHub workflow

Create the file `.github/workflows/deploy-website.yaml` in the `.github/workflows` folder of your repository.

<GithubDedicatedRepoHint/>

<details>
<summary><b>GitHub Workflow (Click to expand)</b></summary>

```yaml showLineNumbers
name: Deploy Website with CodeDeploy

on:
  workflow_dispatch:
    inputs:
      applicationName:
        description: 'AWS CodeDeploy application name'
        required: true
        type: string
      deploymentGroup:
        description: 'AWS CodeDeploy deployment group name'
        required: true
        type: string
jobs:
  deploy:
    runs-on: ubuntu-latest
    env:
      AWS_REGION: ${{ secrets.AWS_REGION_NAME }}
      S3_BUCKET: ${{ secrets.S3_BUCKET_NAME }}
    steps:
      - name: Checkout source
        uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Zip source code
        run: |
          zip -r website.zip index.html scripts appspec.yml

      - name: Upload to S3
        run: |
          TIMESTAMP=$(date +%s)
          S3_KEY=website-$TIMESTAMP.zip
          aws s3 cp website.zip s3://$S3_BUCKET/$S3_KEY
          echo "S3_KEY=$S3_KEY" >> $GITHUB_ENV

      - name: Deploy via CodeDeploy
        run: |
          aws deploy create-deployment \
            --application-name "${{ github.event.inputs.applicationName }}" \
            --deployment-group-name "${{ github.event.inputs.deploymentGroup }}" \
            --s3-location bucket=$S3_BUCKET,key=$S3_KEY,bundleType=zip \
            --file-exists-behavior OVERWRITE \
            --region $AWS_REGION
```
</details>

### Set up self-service action

We will then create a self-service action in Port to handle triggering AWS CodeDeploy:

1. Head to the [self-service](https://app.getport.io/self-serve) page of your portal.
2. Click on the `+ New Action` button.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration into the editor.

    <details>
    <summary><b>Trigger AWS CodeDeploy (Click to expand)</b></summary>

    <GithubActionModificationHint/>

    ```json showLineNumbers
    {
      "identifier": "trigger_aws_code_deploy_app",
      "title": "Trigger AWS CodeDeploy Application",
      "icon": "AWS",
      "description": "A self service action to deploy a website to EC2 via AWS CodeDeploy",
      "trigger": {
        "type": "self-service",
        "operation": "CREATE",
        "userInputs": {
          "properties": {
            "applicationName": {
              "type": "string",
              "title": "Application Name",
              "description": "CodeDeploy application name"
            },
            "deploymentGroup": {
              "type": "string",
              "title": "CodeDeploy deployment group name"
            }
          },
          "required": [
            "applicationName",
            "deploymentGroup"
          ],
          "order": [
            "applicationName",
            "deploymentGroup"
          ]
        }
      },
      "invocationMethod": {
        "type": "GITHUB",
        "org": "<YOUR_GITHUB_ORG>",
        "repo": "<YOUR_GITHUB_REPO>",
        "workflow": "deploy-website.yaml",
        "workflowInputs": {
          "{{ spreadValue() }}": "{{ .inputs }}"
        },
        "reportWorkflowStatus": true
      },
      "requiredApproval": false
    }
    ```
    </details>

5. Click `Save`.

Now you should see the `Trigger AWS CodeDeploy Application` action in the self-service page. 🎉


## Let's test it!

1. Head to the [self-service page](https://app.getport.io/self-serve) of your portal.

2. Choose the `Trigger AWS CodeDeploy Application` action.

3. Enter the required information.

4. Click on `Execute`.

5. Wait for deployment completion 🎉


