---
sidebar_position: 2
displayed_sidebar: null
description: Learn how to deploy an S3 bucket using Crossplane in Port, enabling flexible and efficient cloud resource management.
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Deploy S3 Bucket using Crossplane

This example demonstrates how to deploy [Crossplane](https://github.com/crossplane/crossplane) resources in your Kubernetes Cluster via Port Actions.

We will show you how to utilize Port Actions to open a Merge Request in your Gitlab/GitHub Project, which commits a Crossplane manifest that describes an S3 Bucket in AWS.

We will cover using both GitLab and GitHub Pipelines to create Merge/Pull Requests that commit a file to the project.

:::tip GitOps Setup: 
To streamline deployments with this example, ensure you have a GitOps tool configured. Otherwise, refer to this [guide](/guides/all/manage-clusters) for an end to end tutorial of creating resources in Kubernetes with Crossplane and ArgoCD.
:::

## Prerequisites

- Kubernetes cluster.
- Crossplane installed in your cluster:
  - Crossplane [Installation Guide](https://docs.crossplane.io/v1.18/software/install/).
  - Crossplane [AWS Quickstart Guide](https://docs.crossplane.io/v1.18/getting-started/provider-aws/):
    - Deploy a Crossplane [Provider](https://docs.crossplane.io/v1.18/getting-started/provider-aws/#install-the-aws-provider).
    - Deploy a Crossplane [ProviderConfig](https://docs.crossplane.io/v1.18/getting-started/provider-aws/#create-a-providerconfig).
- GitOps mechanism of your choosing which synchronizes files from your Gitlab Project to your Kubernetes cluster.

## Port Configuration

1. Head over to the [Builder](https://app.getport.io/dev-portal/data-model) page to create the following blueprints:

- Click on the `+ Blueprint` button.
- Click on the `{...} Edit JSON` button.
- Copy and paste the following JSON configuration into the editor.
- Click `Save`.

<details>
  <summary>Port S3Bucket Blueprint</summary>

```json showLineNumbers
{
  "identifier": "s3bucket",
  "title": "S3Bucket",
  "icon": "Crossplane",
  "schema": {
    "properties": {
      "aws_region": {
        "title": "AWS Region",
        "icon": "AWS",
        "type": "string"
      }
    },
    "required": ["aws_region"]
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "relations": {}
}
```

</details>
<br/>

2. To create the Port action, go to the [self-service page](https://app.getport.io/self-serve):
   - Click on the `+ New Action` button.
   - Choose the `s3bucket` blueprint and click `Next`.
   - Click on the `{...} Edit JSON` button.
   - Copy and paste the following JSON configuration into the editor.
   - Click `Save`

<Tabs groupId="workflows" defaultValue="github" values={[
{label: "GitHub", value: "github"},
{label: "GitLab", value: "gitlab"}
]}>

<TabItem value="github">

<details>
  <summary>Port Action</summary>

:::tip MODIFICATION REQUIRED
Make sure to replace `<GITHUB_ORG>` and `<GITHUB_REPO>` with your GitHub organization and repository names respectively.
:::

```json showLineNumbers
{
  "identifier": "crossplane_s3_bucket",
  "title": "Crossplane S3 Bucket",
  "icon": "Crossplane",
  "userInputs": {
    "properties": {
      "aws_region": {
        "icon": "AWS",
        "title": "AWS Region",
        "type": "string",
        "default": "us-east-1",
        "enum": ["us-east-1", "eu-west-1"],
        "enumColors": {
          "us-east-1": "lightGray",
          "eu-west-1": "lightGray"
        }
      },
      "bucket_name": {
        "title": "Bucket Name",
        "type": "string",
        "description": "Has to be globally unique as per AWS limitations"
      }
    },
    "required": ["aws_region", "bucket_name"],
    "order": ["bucket_name", "aws_region"]
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
  "trigger": "CREATE",
  "description": "Creates a crossplane file for a new S3 Bucket",
  "requiredApproval": false
}
```

</details>

</TabItem>

<TabItem value="gitlab">
<details>
  <summary>Port Action</summary>

:::tip Modification Required
Make sure to replace the placeholders for `<PROJECT_NAME>` and `<GROUP_NAME>` of your `crossplane_deployer`.
:::

```json showLineNumbers
{
  "identifier": "crossplane_s3_bucket",
  "title": "Crossplane S3 Bucket",
  "icon": "Crossplane",
  "userInputs": {
    "properties": {
      "aws_region": {
        "icon": "AWS",
        "title": "AWS Region",
        "type": "string",
        "default": "us-east-1",
        "enum": ["us-east-1", "eu-west-1"],
        "enumColors": {
          "us-east-1": "lightGray",
          "eu-west-1": "lightGray"
        }
      },
      "bucket_name": {
        "title": "Bucket Name",
        "type": "string",
        "description": "Has to be globally unique as per AWS limitations"
      }
    },
    "required": ["aws_region", "bucket_name"],
    "order": ["bucket_name", "aws_region"]
  },
  "invocationMethod": {
    "type": "GITLAB",
    "omitPayload": false,
    "omitUserInputs": false,
    "projectName": "<PROJECT_NAME>",
    "groupName": "<GROUP_NAME>",
    "agent": true
  },
  "trigger": "CREATE",
  "description": "Creates a crossplane file for a new S3 Bucket",
  "requiredApproval": false
}
```

</details>
</TabItem>

</Tabs>

## Git Workflows

1. Create a GitHub repository / Gitlab project called `crossplane_deployer`. If using GitLab configure a [Pipeline Trigger Token](https://docs.gitlab.com/ee/ci/triggers/index.html).

:::tip
We recommend creating a dedicated repository for your Port action workflows.
:::

2. Inside your `crossplane_deployer` repository, create a folder named `crossplane-templates` on the `main` branch.

3. Create a template file named `s3bucket-crossplane.yaml` in the `crossplane-templates` directory.

<details>
<summary>s3bucket-crossplane.yaml</summary>

```yml
# s3bucket-crossplane.yaml

apiVersion: s3.aws.upbound.io/v1beta1
kind: Bucket
metadata:
  name: { { bucket_name } }
spec:
  forProvider:
    region: { { aws_region } }
  providerConfigRef:
    name: default
```

</details>

<Tabs groupId="port-actions" defaultValue="github" values={[
{label: "GitHub", value: "github"},
{label: "GitLab", value: "gitlab"}
]}>

<TabItem value="github">

4. Create the following [GitHub Action secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository): - `PORT_CLIENT_ID` - Port Client ID [learn more](/build-your-software-catalog/custom-integration/api/#get-api-token). - `PORT_CLIENT_SECRET` - Port Client Secret [learn more](/build-your-software-catalog/custom-integration/api/#get-api-token). - `MY_GITHUB_TOKEN` - a [Classic Personal Access Token](https://github.com/settings/tokens) with the repo scope and the following permissions: pull_requests:write (to create PR) and contents:write (to merge PR)
   <br/>

5. Install Port's GitHub app by clicking [here](https://github.com/apps/getport-io/installations/new).
   <br/>

6. Create a workflow file under `.github/workflows/create-s3-manifest.yml` with the following content:

<details>
<summary>GitHub workflow</summary>

```yml showLineNumbers
name: Create New S3 Bucket Crossplane Manifest

on:
  workflow_dispatch:
    inputs:
      bucket_name:
        description: 'Name of the s3 bucket'
        required: true
      aws_region:
        description: 'AWS Region for the cluster'
        required: true
      port_payload:
        required: true
        description: >-
          Port's payload, including details for who triggered the action and
          general context (blueprint, run id, etc...)

jobs:
  create-manifest:
    runs-on: ubuntu-latest
    steps:
      - name: Inform execution of request to create a new manifest
        id: promote
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_payload).context.runId }}
          logMessage: 'About to create a crossplane manifest for a new s3 bucket...'

      - name: Checkout code
        uses: actions/checkout@v4

      - name: Create crossplane manifest for s3 bucket
        id: create-manifest
        env:
          BUCKET_FILE_PATH: 'manifests/s3bucket'
          CROSSPLANE_TEMPLATE_PATH: 'crossplane-templates/s3bucket-crossplane.yaml'
        run: |
          mkdir -p $BUCKET_FILE_PATH
          BUCKET_FILE_NAME="${BUCKET_FILE_PATH}/s3bucket-${{ inputs.bucket_name }}.yaml"

          cp $CROSSPLANE_TEMPLATE_PATH $BUCKET_FILE_NAME

          sed -i "s|{{ bucket_name }}|${{ inputs.bucket_name }}|g" $BUCKET_FILE_NAME
          sed -i "s|{{ aws_region }}|${{ inputs.aws_region }}|g" $BUCKET_FILE_NAME

          git add $BUCKET_FILE_NAME

      - name: Create Pull Request
        id: create-pr
        uses: peter-evans/create-pull-request@v6
        with:
          token: ${{ secrets.CREATOR_TOKEN }}
          commit-message: Added ${{ inputs.bucket_name }} s3 bucket crossplane manifest
          committer: github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>
          author: ${{ github.actor }} <${{ github.actor_id }}+${{ github.actor }}@users.noreply.github.com>
          signoff: false
          branch: deployment/${{ fromJson(inputs.port_payload).context.runId }}
          title: '[Deployment] Add ${{ inputs.bucket_name }} s3 bucket crossplane manifest'
          body: |
            This PR is automatically generated by Port.
            It contains the crossplane manifest for the s3 bucket ${{ inputs.bucket_name }}.

            The manifest is generated based on the blueprint: **${{ fromJson(inputs.port_payload).context.blueprint }}**.

            **Run ID**: ${{ fromJson(inputs.port_payload).context.runId }}.
            **Triggered by**: ${{ fromJson(inputs.port_payload).trigger.by.user.email }}.
            **Triggered at**: ${{ fromJson(inputs.port_payload).trigger.at }}.
            **Triggered from**: ${{ fromJson(inputs.port_payload).trigger.origin }}.


            - Auto-generated by [port-actions][1] 

            [1]: https://app.getport.io/organization/run?runId=${{ fromJson(inputs.port_payload).context.runId }}
          labels: |
            deployment
            automated pr
          assignees: ${{ fromJson(inputs.port_payload).trigger.by.user.email }}

      - name: Inform Port about pull request creation status - Success
        if: steps.create-pr.outputs.pull-request-url != ''
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_payload).context.runId }}
          logMessage: |
            Pull request created successfully. URL: ${{ steps.create-pr.outputs.pull-request-url }}.

      - name: Inform Port about pull request creation status - Failure
        if: steps.create-pr.outputs.pull-request-url == ''
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_payload).context.runId }}
          logMessage: |
            Failed to create pull request. Please check the logs for more details.
```

</details>

</TabItem>

<TabItem value="gitlab">

4. Create the following variables as [GitLab Variables](https://docs.gitlab.com/ee/ci/variables/index.html):
   - `ACCESS_TOKEN` - a [Personal Access Token](https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html) with the following scopes:  
      `api`, `read_api`, `read_user`, `read_repository`, `write_repository`.
   - `PORT_CLIENT_ID` - Port Client ID [learn more](/build-your-software-catalog/custom-integration/api/#get-api-token).
   - `PORT_CLIENT_SECRET` - Port Client Secret [learn more](/build-your-software-catalog/custom-integration/api/#get-api-token).

<br/>

5. Install Port's Gitlab agent by following our guide [here](/actions-and-automations/setup-backend/gitlab-pipeline/self-hosted).

:::info
Make sure to use your Pipeline Trigger Token while installing Port's Gitlab agent.
:::
<br/>

6. In your `crossplane_deployer` Gitlab Project, create a Gitlab CI file under `.gitlab-ci.yml` in the `main` branch with the following content:

<details>
<summary>GitLab CI Script</summary>

```yml showLineNumbers
image: python:3.10.0-alpine

stages: # List of stages for jobs, and their order of execution
  - fetch-port-access-token
  - generate-crossplane-bucket-yaml
  - create-entity
  - update-run-status

fetch-port-access-token: # Example - get the Port API access token and RunId
  stage: fetch-port-access-token
  except:
    - pushes
  before_script:
    - |
      apk update -q
      apk add jq curl -q
  script:
    - |
      accessToken=$(curl -X POST \
        -H 'Content-Type: application/json' \
        -d '{"clientId": "'"$PORT_CLIENT_ID"'", "clientSecret": "'"$PORT_CLIENT_SECRET"'"}' \
        -s 'https://api.getport.io/v1/auth/access_token' | jq -r '.accessToken')
      echo "PORT_ACCESS_TOKEN=$accessToken" >> data.env
      runId=$(cat $TRIGGER_PAYLOAD | jq -r '.port_payload.context.runId')
      blueprintId=$(cat $TRIGGER_PAYLOAD | jq -r '.port_payload.context.blueprint')
      echo "RUN_ID=$runId" >> data.env
      echo "BLUEPRINT_ID=$blueprintId" >> data.env
  artifacts:
    reports:
      dotenv: data.env

generate-crossplane-bucket-yaml:
  variables:
    BUCKET_FILE_PATH: 'manifests'
    CROSSPLANE_TEMPLATE_PATH: 'crossplane-templates/s3bucket-crossplane.yaml'
    BRANCH_NAME: 'add-bucket-$bucket_name-$CI_JOB_ID'
  before_script:
    - |
      apk update -q
      apk add jq curl git -q
  stage: generate-crossplane-bucket-yaml
  except:
    - pushes
  script:
    - |
      BUCKET_FILE_NAME="$BUCKET_FILE_PATH/s3bucket-crossplane-$bucket_name.yaml"
      COMMIT_MESSAGE="Added $bucket_name s3 bucket crossplane manifest"
      mkdir -p $BUCKET_FILE_PATH

      cp $CROSSPLANE_TEMPLATE_PATH $BUCKET_FILE_NAME
      sed -i "s/{{ bucket_name }}/$bucket_name/g" $BUCKET_FILE_NAME
      sed -i "s/{{ aws_region }}/$aws_region/g" $BUCKET_FILE_NAME

      git config --global user.email "gitlab-pipeline[bot]@gitlab.com"
      git config --global user.name "Gitlab Pipeline Bot"

      git add $BUCKET_FILE_NAME
      git commit -m "$COMMIT_MESSAGE"

      git checkout -b $BRANCH_NAME
      git push -o ci-skip https://:${ACCESS_TOKEN}@$CI_SERVER_HOST/$CI_PROJECT_PATH.git $BRANCH_NAME

      # Create Merge Request
      res=$(curl --request POST \
        --header "PRIVATE-TOKEN: ${ACCESS_TOKEN}" \
        --data "source_branch=$BRANCH_NAME" \
        --data "target_branch=main" \
        --data "title=$COMMIT_MESSAGE" \
        --data "remove_source_branch=true" \
        "$CI_API_V4_URL/projects/$CI_PROJECT_ID/merge_requests")

      MR_URL=$(echo $res | jq -r '.web_url')
      echo "MR_URL=$MR_URL" >> data.env
  artifacts:
    reports:
      dotenv: data.env

update-run-status:
  stage: update-run-status
  except:
    - pushes
  image: curlimages/curl:latest
  script:
    - |
      curl -X PATCH \
        -H 'Content-Type: application/json' \
        -H "Authorization: Bearer $PORT_ACCESS_TOKEN" \
        -d '{"status":"SUCCESS", "message": {"run_status": "Created Merge Request for '"$bucket_name"' successfully! Merge Request URL: '"$MR_URL"'"}}' \
        "https://api.getport.io/v1/actions/runs/$RUN_ID"
```

</details>

</TabItem>

</Tabs>

:::warning Disclaimer
This example focuses on creating either Merge Requests in GitLab or Pull Requests in GitHub. To automatically deploy the manifest to your Kubernetes cluster, you will also need to set up a GitOps tool.
:::

7. Trigger the action from the [Self-service](https://app.getport.io/self-serve) tab of your Port application.<br/>
   You will notice a new Pull Request / Merge Request was created, committing the S3 Bucket manifest.

## Next steps

In this example we did not create the Port entity for the S3 bucket.

- You can [Connect Port's AWS exporter](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/aws.md)
  to make sure all of the properties and entities are automatically ingested from AWS.
  - You can learn how to setup Port's AWS exporter [here](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/installations/installation.md).
  - You can see example configurations and use cases [here](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/examples/examples.md).
