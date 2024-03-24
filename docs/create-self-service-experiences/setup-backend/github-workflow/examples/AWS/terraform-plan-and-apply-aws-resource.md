---
sidebar_position: 6
---

import PortTooltip from "/src/components/tooltip/tooltip.jsx";

# Provision Cloud Resource using Terraform Plan and Apply

In this guide, we will create two self-service actions in Port that execute a GitHub workflow to plan and apply a cloud resource such as s3 bucket using Terraform. The first action generates the Terraform plan for the S3 bucket configuration, while the second action reviews, approves, and applies the configuration to provision the bucket.

## Use cases

1. **High Availability**: Safeguard against downtime by reviewing and approving critical infrastructure changes before implementation
2. **Cost Control**: Ensure proposed resource changes align with budget constraints by reviewing and approving them before implementation
3. **Regulatory Compliance**: Adhere to industry regulations by planning and approving infrastructure modifications to ensure compliance with regulatory standards.


## Prerequisites
1. Install Port's GitHub app by clicking [here](https://github.com/apps/getport-io/installations/new).
2. An access to an [AWS account](https://aws.amazon.com/console/) with appropriate permissions to create resources like an S3 bucket.
3. A GitHub repository to host your Terraform configuration files and GitHub Actions workflows

Below you can find the JSON for the `Service` blueprint required for the guide:

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
          "Staging",
          "Development"
        ],
        "enumColors": {
          "Production": "green",
          "Staging": "yellow",
          "Development": "blue"
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

## Steps

1. Create the following GitHub Action secrets:
    - `PORT_CLIENT_ID` - Port Client ID [learn more](/build-your-software-catalog/custom-integration/api/#get-api-token)
    - `PORT_CLIENT_SECRET` - Port Client Secret [learn more](/build-your-software-catalog/custom-integration/api/#get-api-token)
    - `AWS_ACCESS_KEY_ID` - An AWS access key ID with the right iam permission to create an s3 bucket [learn more](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html)
    - `AWS_SECRET_ACCESS_KEY` - An AWS secret access key with permission to create an s3 bucket [learn more](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html)
    - `AWS_SESSION_TOKEN` - An AWS session token [learn more](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html)
    - `AWS_REGION` - The AWS region where you would like to provision your s3 bucket
    - `MY_GITHUB_TOKEN` - A [Classic Personal Access Token](https://github.com/settings/tokens) with the `repo` scope. This token will be used to download the terraform configurations saved to GitHub Artifact.

2. Create the following Terraform templates (`main.tf` and `variables.tf`) in a `terraform` folder at the root of your GitHub repository:

<details>
  <summary><b>main.tf</b></summary>

```hcl showLineNumbers title="main.tf"
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

resource "aws_s3_bucket" "example_bucket" {
  bucket = var.bucket_name
  acl    = "private"

  tags = {
    Name        = var.bucket_name
    Environment = var.environment
  }
}

```
</details>

<details>
  <summary><b>variables.tf</b></summary>

```hcl showLineNumbers title = "variables.tf"
variable "aws_region" {
  description = "The AWS region to deploy the resource to"
  default     = "eu-west-1"
}

variable "bucket_name" {
  description = "The name for the S3 bucket"
}

variable "environment" {
  description = "The environment where the resources are deployed"
  default = "staging"
}
```
</details>
<br />

3. Create two Port self-service actions in the [self-service page](https://app.getport.io/self-serve) on the `Service` blueprint with the following JSON definitions:

<details>

  <summary><b>Port Action: Plan a Terraform Resource (click to expand)</b></summary>
   :::tip
- `<GITHUB-ORG>` - your GitHub organization or user name.
- `<GITHUB-REPO-NAME>` - your GitHub repository name.
:::


```json showLineNumbers
{
  "identifier": "plan_terraform_resource",
  "title": "Plan A Terraform Resource",
  "icon": "Terraform",
  "userInputs": {
    "properties": {
      "bucket_name": {
        "title": "Bucket Name",
        "icon": "AWS",
        "type": "string"
      }
    },
    "required": [
      "bucket_name"
    ],
    "order": []
  },
  "invocationMethod": {
    "type": "GITHUB",
    "org": "<ENTER-GITHUB-ORG>",
    "repo": "<ENTER-GITHUB-REPO-NAME>",
    "workflow": "plan-terraform-resource.yaml",
    "omitUserInputs": false,
    "omitPayload": false,
    "reportWorkflowStatus": true
  },
  "trigger": "CREATE",
  "description": "Plans a cloud resource on AWS using terraform and sends request to the approval team to review the plan and apply the resource",
  "requiredApproval": false
}
```

</details>

<details>

  <summary><b>Port Action: Approve and Apply Terraform Resource (click to expand)</b></summary>
   :::tip
- `<GITHUB-ORG>` - your GitHub organization or user name.
- `<GITHUB-REPO-NAME>` - your GitHub repository name.
- `requiredApproval` is set to `true` to allow managers or the approval team to review the terraform plan before applying the configuration.
:::


```json showLineNumbers
{
  "identifier": "apply_terraform_resource",
  "title": "Approve and Apply Terraform Resource",
  "icon": "Terraform",
  "userInputs": {
    "properties": {
      "artifact_identifier": {
        "icon": "DefaultProperty",
        "title": "Artifact Identifier",
        "type": "string"
      },
      "port_run_identifier": {
        "icon": "DefaultProperty",
        "title": "Port Run Identifier",
        "type": "string"
      },
      "tf_plan_output": {
        "title": "Terrform Plan Output",
        "type": "object",
        "description": "JSON output of TF Plan"
      }
    },
    "required": [
      "port_run_identifier",
      "artifact_identifier"
    ],
    "order": [
      "port_run_identifier",
      "artifact_identifier"
    ]
  },
  "invocationMethod": {
    "type": "GITHUB",
    "org": "<ENTER-GITHUB-ORG>",
    "repo": "<ENTER-GITHUB-REPO-NAME>",
    "workflow": "apply-terraform-resource.yaml",
    "omitUserInputs": false,
    "omitPayload": false,
    "reportWorkflowStatus": true
  },
  "trigger": "CREATE",
  "description": "Reviews the cloud resource planned in the \"Plan A Terraform Resource\" workflow and approves/declines the terraform configuration",
  "requiredApproval": true,
  "approvalNotification": {
    "type": "email"
  }
}
```

</details>
<br />

4. In your Github repository, create a workflow file under `.github/workflows/plan-terraform-resource.yaml` with the following content:

<details>

<summary><b>GitHub workflow script to plan a cloud resource (click to expand)</b></summary>

```yaml showLineNumbers title="plan-terraform-resource.yaml"
name: Plan a Cloud Resource using Terraform
on:
  workflow_dispatch:
    inputs:
      bucket_name:
        type: string
        required: true
      port_payload:
        required: true
        description: Port's payload, including details for who triggered the action and
          general context (blueprint, run id, etc...)
        type: string
jobs:
  plan-and-request-approval-for-bucket:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Log starting of s3 bucket creation 
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_payload).context.runId }}
          logMessage: |
              About to create an s3 bucket with name: ${{ github.event.inputs.bucket_name }} ... ⛴️

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: '${{ secrets.AWS_ACCESS_KEY_ID }}'
          aws-secret-access-key: '${{ secrets.AWS_SECRET_ACCESS_KEY }}'
          aws-session-token: '${{ secrets.AWS_SESSION_TOKEN }}'
          aws-region: '${{ secrets.AWS_REGION }}'

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: 1.7.5
          
      - name: Terraform Plan
        id:   plan
        env:
          TF_VAR_bucket_name:  "${{ github.event.inputs.bucket_name }}"
          TF_VAR_aws_region: "${{ secrets.AWS_REGION }}"
        run: |
          cd terraform
          terraform init
          terraform validate
          terraform plan \
            -input=false \
            -out=tfplan-${{fromJson(inputs.port_payload).context.runId}}
          terraform show -json tfplan-${{fromJson(inputs.port_payload).context.runId}} > tfplan.json

      - name: Save Terraform Plan JSON to Environment Variable
        id: save-plan-json
        run: |
          cd terraform
          TF_PLAN_JSON=$(<tfplan.json)
          echo "TF_PLAN_JSON=$TF_PLAN_JSON" >> $GITHUB_ENV
          
      - name: Upload Terraform Plan Artifact
        uses: actions/upload-artifact@v4
        id: artifact-upload-step
        with:
          name: tfplan-${{fromJson(inputs.port_payload).context.runId}}
          path: terraform/
          retention-days: 7 ## change this to preferred number of days to keep the artifact before deletion
      
      - name: Update Port on successful plan and upload of terraform resource
        if: ${{ steps.plan.outcome == 'success' && steps.artifact-upload-step.outcome == 'success' }}
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_payload).context.runId }}
          logMessage: |
              s3 bucket planned successfully and uploaded to GitHub artifact. Proceeding to request approval to apply the plan: ${{ steps.plan.outputs.stdout }} ✅

      
      - name: Update Port on unsuccessful plan of terraform resource
        if: ${{ steps.plan.outcome != 'success' || steps.artifact-upload-step.outcome != 'success' }}
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_payload).context.runId }}
          logMessage: |
              Error Occured while planning or saving terraform resource. Aborting request to approve the plan

      - name: Request approval to apply Terraform resource
        if: ${{ steps.plan.outcome == 'success' && steps.artifact-upload-step.outcome == 'success' }}
        id: request-tf-approval
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          operation: CREATE_RUN
          icon: GithubActions
          blueprint: service
          action: apply_terraform_resource
          properties: |-
            {
              "port_run_identifier": "${{ fromJson(inputs.port_payload).context.runId }}",
              "artifact_identifier": "${{ steps.artifact-upload-step.outputs.artifact-id }}",
              "tf_plan_output": ${{ env.TF_PLAN_JSON }}
            }
    
      - name: Log message to update Port on the status of the TF Apply request (success)
        uses: port-labs/port-github-action@v1
        if: ${{ steps.request-tf-approval.outcome == 'success'}}
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_payload).context.runId }}
          logMessage: |
              The request to provision and apply the cloud resource has been sent to the approval team. The status of request will be shared in the action log

      - name: Log message to update Port on the status of the TF Apply request (failure)
        uses: port-labs/port-github-action@v1
        if: ${{ steps.request-tf-approval.outcome != 'success'}}
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_payload).context.runId }}
          logMessage: |
              The request to provision and apply the cloud resource has not been sent to the approval team due to an error that occurred during the creation steps
```

</details>

5. Create another workflow file under `.github/workflows/apply-terraform-resource.yaml` with the following content:

<details>

<summary><b>GitHub workflow script to approve and apply the terraform configuration (click to expand)</b></summary>

```yaml showLineNumbers title="apply-terraform-resource.yaml"
name: Approve and Apply Terraform Resource
on:
  workflow_dispatch:
    inputs:
      port_run_identifier:
        type: string
        required: true
      artifact_identifier:
        type: string
        required: true
      tf_plan_output:
        type: string
      port_payload:
        required: true
        description: Port's payload, including details for who triggered the action and
          general context (blueprint, run id, etc...)
        type: string
jobs:
  apply-and-provision-resource:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Log starting of cloud resource creation 
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_payload).context.runId }}
          logMessage: |
              About to provision a cloud resource previously planned in Port with run ID: ${{ github.event.inputs.port_run_identifier }} ... ⛴️

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: '${{ secrets.AWS_ACCESS_KEY_ID }}'
          aws-secret-access-key: '${{ secrets.AWS_SECRET_ACCESS_KEY }}'
          aws-session-token: '${{ secrets.AWS_SESSION_TOKEN }}'
          aws-region: '${{ secrets.AWS_REGION }}'


      - name: Download Terraform plan artifact from the previous workflow run
        run: |          
          mkdir terraform-artifact
          cd terraform-artifact
          artifact_url=$(curl -sSL -I -H "Authorization: Bearer ${{ secrets.MY_GITHUB_TOKEN }}" "https://api.github.com/repos/${{ github.repository }}/actions/artifacts/${{ github.event.inputs.artifact_identifier }}/zip" | grep -i "location:" | awk '{print $2}' | tr -d '\r')
          curl -sSL -o terraform-artifact.zip "$artifact_url"
          if [ $? -ne 0 ]; then
            echo "Failed to download artifact. Exiting."
            exit 1
          fi
          unzip -qq terraform-artifact.zip
          if [ $? -ne 0 ]; then
            echo "Failed to extract artifact. Exiting."
            exit 1
          fi
        
      - name: List contents of working directory
        run: ls -la terraform-artifact
        
      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: 1.7.5

      - name: Make provider binary executable
        run: |
          cd terraform-artifact
          chmod +x .terraform/providers/registry.terraform.io/hashicorp/aws/5.42.0/linux_amd64/terraform-provider-aws_v5.42.0_x5

      - name: Terraform apply resource
        id:   tf-apply
        run: |
          cd terraform-artifact
          terraform apply tfplan-${{ github.event.inputs.port_run_identifier }}
          
      - name: Update Port on status of applying terraform resource (success)
        uses: port-labs/port-github-action@v1
        if: ${{steps.tf-apply.outcome == 'success'}}
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_payload).context.runId }}
          logMessage: |
              cloud resource successfully approved and provisioned ✅

      - name: Update Port on status of applying terraform resource (failure)
        uses: port-labs/port-github-action@v1
        if: ${{steps.tf-apply.outcome != 'success'}}
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_payload).context.runId }}
          logMessage: |
              cloud resource could not be provisioned
```

</details>
<br />

6. Trigger the `Plan A Terraform Resource` action from the [self-service](https://app.getport.io/self-serve) page of your Port application. After planning the terraform resource, an email will be sent to the approval team to review the resource. The reviewer can click **See details** next to the **Form Inputs** on the run page to review the content of the planned resource:

<img src='/img/self-service-actions/setup-backend/github-workflow/approveAndApplyTerraform.png' width='80%' border="1px" />

7. Once approved, the second action `Approve and Apply Terraform Resource` will be triggered automatically to provision the s3 bucket. Head over to your AWS console to view the created bucket:

<img src='/img/self-service-actions/setup-backend/github-workflow/applyAndCreateTerraformBucket.png' width='80%' border="1px" />