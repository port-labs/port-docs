---
sidebar_position: 2
---

# Deploy S3 Bucket using Crossplane

This example demonstrates how to deploy [Crossplane](https://github.com/crossplane/crossplane) resources in your Kubernetes Cluster via Port Actions.

We will use a Gitlab Pipeline to create a Merge Request which commits a file to the project.

A pre-deployed GitOps mechanism will be responsible to create the resource in our cluster.

## Prerequisites

- Kubernetes cluster.
- Crossplane installed in your cluster:
  - Crossplane [Installation Guide](https://docs.crossplane.io/v1.14/software/install/).
  - Crossplane [AWS Quickstart Guide](https://docs.crossplane.io/v1.14/getting-started/provider-aws/):
    - Deploy a Crossplane [Provider](https://docs.crossplane.io/v1.14/getting-started/provider-aws/#install-the-aws-provider).
    - Deploy a Crossplane [ProviderConfig](https://docs.crossplane.io/v1.14/getting-started/provider-aws/#create-a-providerconfig).
- GitOps mechanism of your choosing which synchronizes files from your Gitlab Project to your Kubernetes cluster.

## Example - Deploy S3 Bucket in AWS

In this example we will show you how to utilize Port Actions to open a Merge Request in your Gitlab Project, which commits a Crossplane manifest that describes an S3 Bucket in AWS.

:::note Disclaimer
This example doesn't implement a GitOps tool to ensure the manifest will be created on your Kubernetes cluster, so be advised that if you only do the steps in the following guide, you will only be creating Merge Requests in your Gitlab Project.
:::

Follow these steps to get started:

1. Create the following variables as [Gitlab Variables](https://docs.gitlab.com/ee/ci/variables/index.html):

   1. `ACCESS_TOKEN` - a [Personal Access Token](https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html) with the following scopes:  
      api, read_api, read_user, read_repository, write_repository.
   2. `PORT_CLIENT_ID` - Port Client ID [learn more](/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token).
   3. `PORT_CLIENT_SECRET` - Port Client Secret [learn more](/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token).
      <br/>

2. Create a Gitlab Project called `crossplane_deployer` in your Gitlab Group and configure a [Pipeline Trigger Token](https://docs.gitlab.com/ee/ci/triggers/index.html).

:::note
You can use any name that you like, just make sure to configure properly in your Port Action.
:::
<br/>

3. Install Port's Gitlab agent by following our guide [here](/create-self-service-experiences/setup-backend/gitlab-pipeline/Installation).

:::note
Make sure to use your Pipeline Trigger Token while installing Port's Gitlab agent.
:::
<br/>

4. Create a Port blueprint with the following JSON definition:

:::note
Keep in mind this can be any blueprint you would like and this is just an example.
:::

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

5. Create Port action using the following JSON definition:

:::note
Make sure to replace the placeholders for PROJECT_NAME and GROUP_NAME of your `crossplane_deployer`.
:::

<details>
  <summary>Port Action</summary>

```json showLineNumbers
[
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
]
```

</details>
<br/>

6. In your `crossplane_deployer` Gitlab Project, create a template file named `s3bucket-crossplane.yaml` in the `crossplane-templates` directory in the `main` branch with the following content:

<details>
<summary>s3bucket-crossplane.yaml</summary>

```yml
# s3bucket-crossplane.yaml

apiVersion: s3.aws.upbound.io/v1beta1
kind: Bucket
metadata:
  name: {{ bucket_name }}
spec:
  forProvider:
    region: {{ aws_region }}
  providerConfigRef:
    name: default
```

</details>
<br/>

7. In your `crossplane_deployer` Gitlab Project, create a Gitlab CI file under `.gitlab-ci.yml` in the `main` branch with the following content:

<details>
<summary>Gitlab CI Script</summary>

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
    BUCKET_FILE_PATH: "manifests"
    CROSSPLANE_TEMPLATE_PATH: "crossplane-templates/s3bucket-crossplane.yaml"
    BRANCH_NAME: "add-bucket-$bucket_name-$CI_JOB_ID"
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
<br/>

8. Trigger the action from the [Self-service](https://app.getport.io/self-serve) tab of your Port application.<br/>
   You will notice a new Merge Request was created, commiting the S3 Bucket manifest.

## Next steps

In this example we did not create the Port entity for the S3 bucket.

- You can [Connect Port's AWS exporter](/build-your-software-catalog/sync-data-to-catalog/aws/aws.md)
  to make sure all of the properties and entities are automatically ingested from AWS.
  - You can learn how to setup Port's AWS exporter [here](/build-your-software-catalog/sync-data-to-catalog/aws/Installation.md).
  - You can see example configurations and use cases [here](/build-your-software-catalog/sync-data-to-catalog/aws/examples.md).
