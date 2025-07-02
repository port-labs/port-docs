---
sidebar_position: 6
displayed_sidebar: null
description: Learn how to use Terraform to plan and apply AWS resources in Port, ensuring efficient infrastructure management and deployment.
---

import PortTooltip from "/src/components/tooltip/tooltip.jsx";
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"
import GithubDedicatedRepoHint from '/docs/guides/templates/github/_github_dedicated_workflows_repository_hint.mdx'

# Provision Cloud Resource using Terraform Plan and Apply

This guide, demonstrates how to create two self-service actions in Port to plan and apply a cloud resource such as s3 bucket using Terraform in a GitHub workflow.  

 The first action generates the Terraform plan for the S3 bucket configuration, while the second action reviews, approves, and applies the configuration to provision the bucket.

## Common use cases

1. **High Availability**: Safeguard against downtime by reviewing and approving critical infrastructure changes before implementation
2. **Cost Control**: Ensure proposed resource changes align with budget constraints by reviewing and approving them before implementation
3. **Regulatory Compliance**: Adhere to industry regulations by planning and approving infrastructure modifications to ensure compliance with regulatory standards.


## Prerequisites

This guide assumes the following:

- You have a Port account and have completed the [onboarding process](https://docs.port.io/getting-started/overview).
- Port's [GitHub App](https://github.com/apps/getport-io/installations/new) intalled.
- Port's [AWS integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/) is installed in your account.
- A GitHub repository to host your Terraform configuration files and GitHub Actions workflows.


## Set up data model

If you haven't installed the [AWS integration](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/), you'll need to create a blueprint for AWS resources in Port.  
However, we highly recommend you install the AWS integration to have these automatically set up for you.


<h3>Create the AWS Cloud resource blueprint</h3>

1. Go to your [Builder](https://app.getport.io/settings/data-model) page.

2. Click on `+ Blueprint`.

3. Click on the `{...}` button in the top right corner, and choose "Edit JSON".

4. Add this JSON schema:

    <details>
    <summary><b>Cloud resource blueprint (click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "cloudResource",
      "description": "This blueprint represents a cloud resource",
      "title": "Cloud Resource",
      "icon": "AWS",
      "schema": {
        "properties": {
          "type": {
            "type": "string",
            "description": "Type of the cloud resource (e.g., virtual machine, database, storage, etc.)",
            "title": "Type"
          },
          "provider": {
            "type": "string",
            "description": "Cloud service provider (e.g., AWS, Azure, GCP)",
            "title": "Provider"
          },
          "region": {
            "type": "string",
            "description": "Region where the resource is deployed",
            "title": "Region"
          },
          "link": {
            "type": "string",
            "title": "Link",
            "format": "url"
          },
          "tags": {
            "type": "object",
            "additionalProperties": {
              "type": "string"
            },
            "description": "Custom tags associated with the resource",
            "title": "Tags"
          },
          "status": {
            "type": "string",
            "description": "Current status of the resource (e.g., running, stopped, provisioning, etc.)",
            "title": "Status"
          },
          "created_at": {
            "type": "string",
            "description": "Timestamp indicating when the resource was created",
            "title": "Created At",
            "format": "date-time"
          },
          "updated_at": {
            "type": "string",
            "description": "Timestamp indicating when the resource was last updated",
            "title": "Updated At",
            "format": "date-time"
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

5. Click "Save" to create the blueprint.

## Implementation

To implement this use-case using a GitHub workflow, follow these steps:

### Add GitHub secrets

In your GitHub repository, [go to **Settings > Secrets**](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository) and add the following secrets:
    - `PORT_CLIENT_ID` - Your port `client id`, [how to get the credentials](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#find-your-port-credentials).
    - `PORT_CLIENT_SECRET` - Your port `client secret`, [how to get the credentials](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#find-your-port-credentials).
    - `AWS_ACCESS_KEY_ID` - AWS access key ID with permission to create an s3 bucket, [how to create an AWS access key](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html).
    - `AWS_SECRET_ACCESS_KEY` - AWS secret access key with permission to create s3 bucket, [how to create secret access key](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html).
    - `AWS_SESSION_TOKEN` - AWS session token [How to create an AWS session token](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html).
    - `AWS_REGION` - The AWS region where you would like to provision your s3 bucket.
    - `MY_GITHUB_TOKEN` - A [Classic Personal Access Token](https://github.com/settings/tokens) with the `repo` scope. This token will be used to download the terraform configurations saved to GitHub Artifact.

### Create Terraform templates

Create the following Terraform templates (`main.tf` and `variables.tf`) in a `terraform` folder at the root of your GitHub repository:

<GithubDedicatedRepoHint/>

<details>
  <summary><b>main.tf</b></summary>

```hcl showLineNumbers title="main.tf"
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.43"
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


### Create self-service action

We'll create a single Port self-service action that handles both planning and applying terraform resources with an approval gate.

1. Head to the [self-service](https://app.getport.io/self-serve) page.

2. Click on the `+ New Action` button.

3. Click on the `{...} Edit JSON` button.

4. Copy and paste the following JSON configuration into the editor.

    <details>

      <summary><b>Port Action: Plan and Apply Terraform Resource (click to expand)</b></summary>
      :::tip
    - `<GITHUB-ORG>` - your GitHub organization or user name.
    - `<GITHUB-REPO-NAME>` - your GitHub repository name.
    :::


    ```json showLineNumbers
    {
      "identifier": "terraform_plan_and_apply",
      "title": "Plan and Apply Terraform Resource",
      "icon": "Terraform",
      "description": "Plans a cloud resource on AWS using terraform, waits for approval, then applies the configuration",
      "trigger": {
        "type": "self-service",
        "operation": "CREATE",
        "userInputs": {
          "properties": {
            "bucket_name": {
              "type": "string",
              "title": "Bucket Name",
              "icon": "AWS"
            }
          },
          "required": ["bucket_name"],
          "order": ["bucket_name"]
        },
        "blueprintIdentifier": "cloudResource"
      },
      "invocationMethod": {
        "type": "GITHUB",
        "org": "<ENTER-GITHUB-ORG>",
        "repo": "<ENTER-GITHUB-REPO-NAME>",
        "workflow": "plan-terraform-resource.yaml",
        "workflowInputs": {
          "bucket_name": "{{ .inputs.\"bucket_name\" }}",
          "port_context": {
            "blueprint": "{{.action.blueprint}}",
            "entity": "{{.entity}}",
            "runId": "{{.run.id}}",
            "trigger": "{{ .trigger }}"
          }
        },
        "reportWorkflowStatus": true
      },
      "requiredApproval": true,
      "approvalNotification": {
        "type": "email"
      }
    }
    ```

    </details>

5. Click on "Save" to create the action.

### Create automation to trigger apply workflow

Now we'll create an automation that automatically triggers the apply GitHub workflow when the action is approved.

1. Head to the [automations page](https://app.getport.io/settings/automations).

2. Click on the `+ Automation` button.

3. Copy and paste the following JSON configuration into the editor:

      <details>
      <summary><b>Automation: Auto-trigger Apply Workflow on Approval (click to expand)</b></summary>

      :::tip
      - `<GITHUB-ORG>` - your GitHub organization or user name.
      - `<GITHUB-REPO-NAME>` - your GitHub repository name.
      :::

      ```json showLineNumbers
      {
        "identifier": "terraform_auto_apply_on_approval",
        "title": "Auto-trigger Terraform Apply on Approval",
        "description": "Automatically triggers the apply GitHub workflow when the terraform plan action is approved",
        "trigger": {
          "type": "automation",
          "event": {
            "type": "RUN_UPDATED",
            "actionIdentifier": "terraform_plan_and_apply"
          },
          "condition": {
            "type": "JQ",
            "expressions": [
              ".diff.before.status == \"WAITING_FOR_APPROVAL\"",
              ".diff.after.status == \"IN_PROGRESS\""
            ],
            "combinator": "and"
          }
        },
        "invocationMethod": {
          "type": "GITHUB",
          "org": "<ENTER-GITHUB-ORG>",
          "repo": "<ENTER-GITHUB-REPO-NAME>",
          "workflow": "apply-terraform-resource.yaml",
          "workflowInputs": {
            "port_run_identifier": "{{ .event.diff.after.id }}",
            "bucket_name": "{{ .event.diff.after.properties.bucket_name }}",
            "port_context": {
              "blueprint": "{{ .event.diff.after.blueprint.identifier }}",
              "entity": "{{ .event.diff.after.entity }}",
              "runId": "{{ .event.diff.after.id }}",
              "trigger": "automation"
            }
          },
          "reportWorkflowStatus": false
        },
        "publish": true
      }
      ```

      </details>

4. Click "Save" to create the automation.


### Create GitHub workflows
In your GitHub repositoty, we will create two GitHub workflows to plan a terraform resource and apply the configuration.

<h4>Plan a terraform resource GitHub workflow</h4>

Follow these steps to create the `Plan a Terraform Resource` GitHub workflow.

Create a workflow file under `.github/workflows/plan-terraform-resource.yaml` with the following content.

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
      port_context:
        required: true
        description: >-
          Port's payload, including details for who triggered the action and
          general context (blueprint, run id, etc...)
jobs:
  plan-and-request-approval-for-bucket:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Log starting of s3 bucket creation 
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_context).runId}}
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
            -out=tfplan-${{fromJson(inputs.port_context).runId}}
          terraform show -json tfplan-${{fromJson(inputs.port_context).runId}} > tfplan.json

      - name: Upload Terraform Plan Artifact
        uses: actions/upload-artifact@v4
        id: artifact-upload-step
        with:
          name: tfplan-${{fromJson(inputs.port_context).runId}}
          path: terraform/
          retention-days: 7 ## change this to preferred number of days to keep the artifact before deletion
      
      - name: Update Port on successful plan and upload of terraform resource
        if: ${{ steps.plan.outcome == 'success' && steps.artifact-upload-step.outcome == 'success' }}
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_context).runId}}
          logMessage: |
              ✅ S3 bucket planned successfully! Waiting for approval to apply the changes.

      - name: Update Port on unsuccessful plan of terraform resource
        if: ${{ steps.plan.outcome != 'success' || steps.artifact-upload-step.outcome != 'success' }}
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_context).runId}}
          status: "FAILURE"
          logMessage: |
              ❌ Error occurred while planning or saving terraform resource. Please check the workflow logs.
```

</details>


<h4>Approve and apply the terraform resource GitHub workflow</h4>

Follow these steps to create the `Approve and Apply Terraform Resource` GitHub workflow.

Create a workflow file under `.github/workflows/apply-terraform-resource.yaml` with the following content.

<details>

<summary><b>GitHub workflow script to approve and apply the terraform configuration (click to expand)</b></summary>

```yaml showLineNumbers title="apply-terraform-resource.yaml"
name: Apply Terraform Resource
on:
  workflow_dispatch:
    inputs:
      port_run_identifier:
        type: string
        required: true
      bucket_name:
        type: string
        required: true
      port_context:
        required: true
        description: >-
          Port's payload, including details for who triggered the action and
          general context (blueprint, run id, etc...)
jobs:
  apply-terraform-resource:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Log starting of cloud resource creation 
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_context).runId}}
          logMessage: |
              🚀 Applying terraform configuration that was approved in run: ${{ github.event.inputs.port_run_identifier }}

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
          # Get the artifact download URL by name
          artifact_url=$(curl -sSL \
            -H "Authorization: Bearer ${{ secrets.MY_GITHUB_TOKEN }}" \
            -H "Accept: application/vnd.github.v3+json" \
            "https://api.github.com/repos/${{ github.repository }}/actions/artifacts" \
            | jq -r --arg artifact_name "tfplan-${{ github.event.inputs.port_run_identifier }}" \
            '.artifacts[] | select(.name == $artifact_name) | .archive_download_url')
          
          if [ "$artifact_url" == "null" ] || [ -z "$artifact_url" ]; then
            echo "❌ Terraform plan artifact not found for run: ${{ github.event.inputs.port_run_identifier }}"
            exit 1
          fi
          
          # Download and extract the artifact
          curl -sSL -H "Authorization: Bearer ${{ secrets.MY_GITHUB_TOKEN }}" \
            -o terraform-artifact.zip "$artifact_url"
            
          if [ $? -ne 0 ]; then
            echo "❌ Failed to download artifact. Exiting."
            exit 1
          fi
          
          unzip -qq terraform-artifact.zip
          if [ $? -ne 0 ]; then
            echo "❌ Failed to extract artifact. Exiting."
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
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_context).runId}}
          logMessage: |
              ✅ Cloud resource successfully provisioned and available in AWS!

      - name: Get current timestamp
        id: timestamp
        run: echo "::set-output name=current_time::$(date -u +'%Y-%m-%dT%H:%M:%S.%3NZ')"

      - name: Create cloud resource in Port
        uses: port-labs/port-github-action@v1
        if: ${{steps.tf-apply.outcome == 'success'}}
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: UPSERT
          identifier: ${{ github.event.inputs.bucket_name }}
          blueprint: cloudResource
          properties: |-
            {
              "type": "storage",
              "provider": "AWS",
              "region": "${{ secrets.AWS_REGION }}",
              "link": "https://s3.console.aws.amazon.com/s3/buckets/${{ github.event.inputs.bucket_name }}",
              "created_at": "${{ steps.timestamp.outputs.current_time }}"
            }

      - name: Update Port on status of applying terraform resource (failure)
        uses: port-labs/port-github-action@v1
        if: ${{steps.tf-apply.outcome != 'success'}}
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_context).runId}}
          logMessage: |
              ❌ Cloud resource could not be provisioned. Please check the workflow logs for details.
```

<PortApiRegionTip/>

</details>


## Let's test it!

Now let's see how the simplified automation-powered workflow works:

1. Head to the [self-service page](https://app.getport.io/self-serve) of your portal

2. Trigger the `Plan and Apply Terraform Resource` action (that's it - just **one action**!):

    <img src='/img/self-service-actions/setup-backend/github-workflow/approveAndApplyTriggerAction.png' width='80%' border="1px" />

3. The action will execute the planning workflow and then wait for approval. You'll see logs showing:
   - Terraform plan execution
   - Artifact upload 
   - Status: "Waiting for approval"

4. Since `requiredApproval` is set to `true`, an email notification will be sent to the approval team:

      <img src='/img/self-service-actions/setup-backend/github-workflow/approveAndApplyTerraform.png' width='80%' border="1px" /> 

5. Once approved, the automation **automatically** triggers the apply GitHub workflow. You'll see the apply workflow start running without any manual intervention!

6. The apply workflow downloads the terraform plan artifact and applies the configuration. Head over to your AWS console to view the created bucket:

    <img src='/img/self-service-actions/setup-backend/github-workflow/applyAndCreateTerraformBucket.png' width='80%' border="1px" />